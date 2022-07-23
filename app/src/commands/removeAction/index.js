const { getProjectData } = require('../deploy/getProjectData')
const { deployApplicationBucket } = require('../deployAction/deployApplicationBucket')
const { emptyBucket } = require('../deployAction/utils/bucket')

module.exports.removeAction = async function removeAction(cli, aws, config) {
    /**
     * Get project  info locally
     */
    const stage = config.stage
    const region = config.region
    let projectData = {
        name: config.name,
        bucketName: config.bucketName,
        appId: config.appId
    }

    /**
     * Get Projject info remotely if local isnt available
     */
    const deployName = config.deployName
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

    await cli.filesystem.removeDir('/' + config.hiddenFolder)
    cli.terminal.clear()
    cli.terminal.printSuccessMessage('Site Successfully Removed')
}
