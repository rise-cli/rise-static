const { makeHiddenFolder } = require('./makeHiddenFolder.js')
async function getBucketInfo(cli) {
    let bucketName = undefined
    let appId = undefined
    let distFolder = undefined
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
        config = await cli.filesystem.getJsFile('/rise.js')
    } catch (e) {
        throw new Error('Project must have a rise.js file')
    }

    if (!config.name || typeof config.name !== 'string') {
        throw new Error(
            'rise.js file must export an object with a name defined'
        )
    }

    const dist = '/' + config.dist || 'dist'
    await await cli.filesystem.makeDir(dist)

    try {
        await cli.filesystem.getFile(`/${dist}/index.html`)
    } catch (e) {
        throw new Error(`/${dist} folder must have an index.html file`)
    }

    return config
}

exports.getProjectData = async function getProjectData(cli) {
    makeHiddenFolder(cli)
    const { bucketName, appId, distFolder } = await getBucketInfo(cli)
    const config = await getConfig(cli)

    if (config.auth && !config.auth.username) {
        throw new Error(`rise.js auth must have a username property`)
    }

    if (config.auth && !config.auth.password) {
        throw new Error(`rise.js auth must have a password property`)
    }

    if (
        config.auth &&
        config.auth.password &&
        config.auth.password.length < 8
    ) {
        throw new Error(`rise.js auth password must be at least 8 characters`)
    }

    let projectData = {
        name: config.name,
        bucketName,
        appId,
        distFolder: config.dist,
        auth: !config.auth
            ? false
            : {
                  username: config.auth.username,
                  password: config.auth.password
              }
    }

    return projectData
}
