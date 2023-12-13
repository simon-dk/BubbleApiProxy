# Welcome to the Bubble Api Proxy CDK project

Yes, a long title.
This project is meant to be used as a placeholder to create a lambda-service in a vpc with a static ip.

## Note

AWS has announced a change to its pricing of static ips. From february 2024 each static ip will be priced at $0.005/hour (there can be regional differences, so check pricing). That means at least $3.6/month. For new accounts there is a free tier for 1 ip for the first 12 months. 

## Usecases

If you have a bubble app that is dependant on an external service or database via a static ip adress, this is not possible today.
Bubble uses a shared ip pool and thus you would either allow too many ip adresses access, the ip adresses will change, and it will quite probable be a mess to manage.

This solution creates an api service for you that you can use from bubble, to reach your intended service.

The demo is setup with two lambdas. These gets deployed in a vpc with a static ip.

You will need to update the lambdas to your usecase.

## Caveats

There are some caveats that you need to be aware of:

### Latency

This solution will obviously create latency, as the request will go through the api gateway and then to the lambda.

The latency will depend on many factors: Where your users are in relation the the bubble servers, and also in relation to AWS servers the lambda will stay on.

The lambda code itself can add latancy, so keep it simple is my best advice.

Lambda is notorious for "cold starts". These incur becasue each invocation starts a vm from where your lambda code is run. The first invocation will take longer than subsequent invocations, and after 5-15 mins of no invocations the vm will be terminated.

You can mitigate this with several techniques, but the best is to keep your lambda code simple and fast. Please reach out if you need help with cold starts.

### Cost

This solution will incur cost. The cost will depend on how many users you have, and how many requests they make.
If these are the only resources, and your AWS account is new, it would normally fall under the free tier usage, but please check the AWS free tier for more information.

AFter the free tier, expect $8-10/month for the natInstance and very little for the lambda.

## First deployment

You need to deploy the stacks in two stages.

### Stage 1

First you need to deploy the network stack. When the stack is deployed, head over to your console. Search for EC2 in the meny and click instances.

Here you will find you natInstance. This is the gateway for your lambdas static ip.

Take a copy of the instanceId (starting with i-...).

In the project bin/app.ts file, paste the id in the natInstanceId variable under the elasticIp stack.

### Stage 2

When you have successfully deployed the network stack, you can deploy the elasticIp and usersService stacks.

## Whitelisting

After the second deploy, head back to the EC2 console. Under your natInstance youll find the Public IPv4 address. This is the ip that should be whitelisted by the service you want to reach.

## Lambda urls

The lambda urls are created by the api gateway. You can find them in the api gateway console. In the console search for API Gateway.

In the overview you should see your api (usersHttpApi). Click on it and you will see the urls for your lambdas.

The invokeUrl will be your baseUrl. Each route will be appended to this url. For example, if you have a route called /users, the url will be: your-Invoke-url.execute-api...amazon.com/users

## Security

In this demo project we have not incorparated any security to your lambdas. Hence anybody with the url can access your lambdas.

You will want to either implement api keys, jwt tokens, or some other form of authentication. This is beyond the scope of this project.

## Domain

We have not implemented a custom domainname in this example. It is possible to do so, but again, beyond the scope of this project.

## Multiple environments

Under bin/app.ts youll see that each stack is named "somestackDev". This is to allow you to deploy multiple environments. For example, you could have a dev, staging and production environment, and change out the account and region for each.

## Removing the stacks

When you are done with the project, you can remove the stacks by running the following commands:
cdk destroy stackname

Start with the usersService stack (or whichever holds your lambdas), and then the elasticIp stack. Finally, remove the network stack.

The stack with your lambdas will take longer to remove because AWS will have to terminate the connections made from lambda to the gateway. Some times this can take up to 1 hour.

You can also use the console to remove the stacks, search for Cloudformation and click on the stack you want to remove.

If you have used the "retain" setting on the elastic ip, you will need to remove this manually under EC2 to not incur a cost.

## Node

The project is written in node18 with ESM modules and pnpm for package management.

## Lambdas

All lambdas are written in typescript and are build with ESBUILD.
Hence, you dont need to build the project before deployment, but can of course to fix any typescript errors.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
- `cdk deploy MyStack`deploy the stack called MyStack
- `cdk deploy MyStackA MyStackB`deploy the stack called MyStackA and MyStackB
- `cdk deploy --all`deploy all stacks
