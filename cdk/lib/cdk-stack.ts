import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3Deployment from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

  
    const BUCKET_NAME = 'course-rsschool-shop-website';
    const DISTRIBUTION_COMMENT = 'CloudFront Distribution for Animal Shop';


    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: BUCKET_NAME,
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY, 
      autoDeleteObjects: true, 
    });

  
    const websiteOAI = new cloudfront.OriginAccessIdentity(this, 'WebsiteOAI', {
      comment: DISTRIBUTION_COMMENT,
    });

 
    websiteBucket.grantRead(websiteOAI);


    const websiteDistribution = new cloudfront.Distribution(this, 'WebsiteDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket, { originAccessIdentity: websiteOAI }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
      comment: DISTRIBUTION_COMMENT,
    });

 
    new s3Deployment.BucketDeployment(this, 'DeployWebsite', {
      destinationBucket: websiteBucket,
      sources: [s3Deployment.Source.asset('../dist')],
      distribution: websiteDistribution,
      distributionPaths: ['/*'],
    });
  }
}
