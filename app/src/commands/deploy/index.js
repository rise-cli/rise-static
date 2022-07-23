const { getProjectData } = require('./getProjectData')
const { deployAction } = require('../deployAction')

module.exports.deploy = async function deploy(cli, aws) {
    try {
        projectData = await getProjectData(cli)
    } catch (e) {

        cli.terminal.clear()
        cli.terminal.printErrorMessage('Rise Static Validation Error')
        cli.terminal.printInfoMessage('- ' + e.message)
        return
    }

    const config = {
        name: projectData.name,
        bucketName: projectData.bucketName,
        appId: projectData.apiId,
        region: 'us-east-1',
        stage: 'dev',
        hiddenFolder: '.static',
        deployName: projectData.name.replace(/\s/g, '') + 'static',
        auth: projectData.auth && {
            username: projectData.auth.username,
            password: projectData.auth.password
        },
        zip: {
            source: '/' + projectData.distFolder,
            target: '/' + '.static' + '/',
            zipName: 'app'
        },
        upload: {
            key: 'app.zip'
        },
        deploy: {
            branch: 'main'
        }
    }

  


    await deployAction(cli, aws, config)
}