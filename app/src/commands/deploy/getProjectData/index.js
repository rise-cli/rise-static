const { makeHiddenFolder } = require('./makeHiddenFolder.js')
async function getBucketInfo(cli) {
    let bucketName = undefined
    let appId = undefined
    try {
        const data = await cli.filesystem.getJsFile('/.static/data.js')
        bucketName = data.bucketName
        appId = data.appId
    } catch (e) {
        bucketName = undefined
    }
    return {
        bucketName,
        appId
    }
}

async function getConfig(cli) {
    let config = null
    try {
        config = await cli.filesystem.getJsFile('/static.js')
    } catch (e) {
        throw new Error('Project must have a static.js file')
    }

    if (!config.title || typeof config.title !== 'string') {
        throw new Error('static.js file must have a title defined')
    }

    return config
}

exports.getProjectData = async function getProjectData(cli) {
    makeHiddenFolder(cli)
    const { bucketName, appId } = await getBucketInfo(cli)
    const config = await getConfig(cli)

    let projectData = {
        title: config.title,
        bucketName,
        appId
    }

    return projectData
}
