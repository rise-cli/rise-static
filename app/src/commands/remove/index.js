const { getProjectData } = require('../deploy/getProjectData')
const { deployApplicationBucket } = require('../deploy/deployApplicationBucket')
const { emptyBucket } = require('../deploy/utils/bucket')

async function main(cli, aws) {
    /**
     * Get project  info locally
     */
    const stage = 'dev'
    const region = 'us-east-1'
    let projectData = await getProjectData(cli)

    /**
     * Get Projject info remotely if local isnt available
     */
    const deployName = projectData.title.replace(/\s/g, '') + 'static'
    if (!projectData.bucketName) {
        const bucketName = await deployApplicationBucket(
            cli,
            aws,
            deployName,
            stage
        )
        projectData.bucketName = bucketName
    }

    const stackName = deployName + stage + '-bucket'

    /**
     * Empty bucket
     */
    await emptyBucket({
        bucketName: projectData.bucketName
    })

    /**
     * Remove stack
     */
    await aws.cloudformation.removeStack({
        name: stackName,
        template: ''
    })

    await cli.filesystem.removeDir('/.static')
    cli.terminal.clear()
    cli.terminal.printSuccessMessage('Site Successfully Removed')
}

module.exports = main
