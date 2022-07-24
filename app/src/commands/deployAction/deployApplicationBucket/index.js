exports.deployApplicationBucket = async function deployApplicationBucket(
    cli,
    aws,
    appName,
    stage,
    hiddenFolder,
    auth
) {
    /**
     * Deploy Stack
     */
    const bucketTemplate = aws.s3.makeBucket('Main')
    const stackName = appName + stage + '-bucket'

    const template = {
        Resources: {
            AmplifyApp: {
                Type: 'AWS::Amplify::App',
                Properties: {
                    Name: appName
                }
            },
            AmplifyMainBranch: {
                Type: 'AWS::Amplify::Branch',
                Properties: {
                    AppId: { 'Fn::GetAtt': ['AmplifyApp', 'AppId'] },
                    BranchName: 'main'
                }
            },
            ...bucketTemplate.Resources
        },
        Outputs: {
            ...bucketTemplate.Outputs,
            AmplifyId: {
                Value: { 'Fn::GetAtt': ['AmplifyApp', 'AppId'] }
            }
        }
    }

    if (auth) {
        template.Resources.AmplifyApp.Properties.BasicAuthConfig = {
            EnableBasicAuth: true,
            Password: auth.password,
            Username: auth.username
        }
    }

    await aws.cloudformation.deployStack({
        name: stackName,
        template: JSON.stringify(template)
    })

    await aws.cloudformation.getDeployStatus({
        config: {
            stackName: stackName,
            minRetryInterval: 2000,
            maxRetryInterval: 10000,
            backoffRate: 1.1,
            maxRetries: 200,
            onCheck: () => {
                //cli.terminal.clear()
                //cli.terminal.printInfoMessage('Deploying Infrastructure...')
            }
        }
    })

    /**
     * Write generated bucket name to local state
     */
    const { MainBucket, AmplifyId } = await aws.cloudformation.getOutputs({
        stack: stackName,
        outputs: ['MainBucket', 'AmplifyId']
    })

    cli.filesystem.writeFile({
        path: `/${hiddenFolder}/data.js`,
        content: `module.exports = { bucketName: "${MainBucket}", appId: "${AmplifyId}"}`
    })

    return {
        bucket: MainBucket,
        appId: AmplifyId
    }
}
