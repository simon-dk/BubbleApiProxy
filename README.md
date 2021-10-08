# Welcome to this Bubble Api Proxy CDK project

Yes, a long title.
This project is meant to be used as a placeholder to create a lambda-service in a vpc with a static ip.

## First deployment

First time you deploy the InfrastructureStack, you need to add CNAME records add your DNS Provider.
The CNAME records can be found in you AWS console under Certificate Manager.

After inserting the CNAME records the stack will finish deployment. Now yoy can deploy the UsersServiceStack.

## Lambdas

All lambdas are written in typescript and are build with ESBUILD.
Hence, you dont need to build the project before deployment, but can of course to fix any typescript errors.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
 * `cdk deploy --all`deploy all stacks
