import AWS from 'aws-sdk'
import { writeFile } from 'rise-filesystem-foundation'
import * as cli from 'rise-cli-foundation'

export async function pull(projectData, region) {
    cli.hideCursor()
    cli.clear()
    cli.startLoadingMessage('Fetching Environment Variables')

    const cloudformation = new AWS.CloudFormation({
        region: region
    })

    async function getResource(projectData) {
        const params = {
            StackName: projectData.backendStack
        }
        return await cloudformation.describeStackResources(params).promise()
    }

    const resources = await getResource(projectData)

    const resourceMap = resources.StackResources.reduce((acc, x) => {
        acc[x.LogicalResourceId] = x
        return acc
    }, {})

    let envFile = ''
    Object.keys(projectData.env).forEach((k) => {
        const logicalId = projectData.env[k]
        if (
            resourceMap[logicalId] &&
            resourceMap[logicalId].ResourceType === 'AWS::ApiGateway::RestApi'
        ) {
            const apiId = resourceMap[logicalId].PhysicalResourceId
            envFile =
                envFile +
                `${k}=https://${apiId}.execute-api.${region}.amazonaws.com/Prod/ \n`
        }

        if (
            resourceMap[logicalId] &&
            resourceMap[logicalId].ResourceType === 'AWS::Cognito::UserPool'
        ) {
            const id = resourceMap[logicalId].PhysicalResourceId
            envFile = envFile + `${k}=${id} \n`
        }

        if (
            resourceMap[logicalId] &&
            resourceMap[logicalId].ResourceType ===
                'AWS::Cognito::UserPoolClient'
        ) {
            const id = resourceMap[logicalId].PhysicalResourceId
            envFile = envFile + `${k}=${id} \n`
        }
    })

    await writeFile({
        projectRoot: process.cwd(),
        content: envFile,
        path: '/.env'
    })
    cli.endLoadingMessage()
    cli.clear()
    cli.printSuccessMessage(`Environment variables successfully pulled!`)
    cli.showCursor()
}
