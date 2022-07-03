const { getProjectData } = require('./getProjectData')
const { deployApplicationBucket } = require('./deployApplicationBucket')
const realAws = require('aws-sdk')
const amplify = new realAws.Amplify({
    region: 'us-east-1'
})

const wait = () => new Promise((r) => setTimeout(r, 2000))
async function checkDeployStatus(cli, amplify, appId, jobId, count) {
    if (count > 100) {
        throw new Error('Deployment is taking longer than usual')
    }
    const jobStatus = await amplify
        .getJob({
            appId: appId,
            branchName: 'main',
            jobId: jobId
        })
        .promise()

    if (
        jobStatus.job.summary.status === 'PENDING' ||
        jobStatus.job.summary.status === 'RUNNING'
    ) {
        const msg = count < 1 ? 'Configure CDN...' : 'Deploying to CDN...'
        cli.terminal.clear()
        cli.terminal.printInfoMessage(msg)
        await wait()
        return await checkDeployStatus(cli, amplify, appId, jobId, count + 1)
    }

    return jobStatus.job.summary.status
}

module.exports.deploy = async function deploy(cli, aws) {
    /**
     * Get project info locally
     */
    cli.terminal.clear()
    cli.terminal.printInfoMessage('Checking project configuration...')
    const stage = 'dev'
    const region = 'us-east-1'
    let projectData = await getProjectData(cli)
    const deployName = projectData.title.replace(/\s/g, '') + 'static'

    /**
     * Deploy Infrastructure if needed
     */
    if (!projectData.bucketName || !projectData.appId) {
        cli.terminal.clear()
        cli.terminal.printInfoMessage('Deploying Infrastructure...')
        const dep = await deployApplicationBucket(cli, aws, deployName, stage)
        projectData.bucketName = dep.bucket
        projectData.appId = dep.appId
    }
    const appId = projectData.appId

    /**
     * Uploading code to s3 bucket
     */
    cli.terminal.clear()
    cli.terminal.printInfoMessage('Deploying code...')
    await cli.filesystem.zipFolder({
        source: '/dist',
        target: '/' + '.static' + '/',
        name: 'app'
    })

    const uploadFile = await cli.filesystem.getFile('/.static/app.zip')
    await aws.s3.uploadFile({
        file: uploadFile,
        bucket: projectData.bucketName,
        key: 'app.zip'
    })

    /**
     * Execute amplify deployment
     */
    cli.terminal.clear()
    cli.terminal.printInfoMessage('Configure CDN...')
    const res = await amplify
        .startDeployment({
            appId: appId,
            branchName: 'main',
            sourceUrl: `s3://${projectData.bucketName}/app.zip`
        })
        .promise()
    await checkDeployStatus(cli, amplify, appId, res.jobSummary.jobId, 0)

    /**
     * Display Successful Result
     */
    cli.terminal.clear()
    cli.terminal.printSuccessMessage('Deployed!')
    cli.terminal.printInfoMessage(
        `Endpoint: https://main.${appId}.amplifyapp.com`
    )
}
