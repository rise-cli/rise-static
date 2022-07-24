//const { getProjectData } = require('./getProjectData')
const { deployApplicationBucket } = require('./deployApplicationBucket')
const realAws = require('aws-sdk')
let loadingInterval
const printLoadingMessage = (msg) => {
    const process = require('process')
    const std = process.stdout
    const eighties = [
        '▰▱▱▱▱▱▱',
        '▰▰▱▱▱▱▱',
        '▰▰▰▱▱▱▱',
        '▰▰▰▰▱▱▱',
        '▰▰▰▰▰▱▱',
        '▰▰▰▰▰▰▱',
        '▰▰▰▰▰▰▰',
        '▱▰▰▰▰▰▰',
        '▱▱▰▰▰▰▰',
        '▱▱▱▰▰▰▰',
        '▱▱▱▱▰▰▰',
        '▱▱▱▱▱▰▰',
        '▱▱▱▱▱▱▰'
    ]

    const dots = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

    const spinnerFrames = dots
    let index = 0

    const log = () => {
        process.stdout.write('\x1B[?25l')
        let line = spinnerFrames[index]

        if (!line) {
            index = 0
            line = spinnerFrames[index]
        }

        // rdl.cursorTo(std, 0, 0)
        process.stdout.clearLine()
        process.stdout.cursorTo(0)
        std.write('\x1b[31m' + line + '\x1b[37m' + ' ' + msg)

        index = index >= spinnerFrames.length ? 0 : index + 1
    }

    clearInterval(loadingInterval)
    log()
    loadingInterval = setInterval(log, 100)
}

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
        const msg = 'Deploying to AWS Amplify...'
        //cli.terminal.clear()
        //cli.terminal.printInfoMessage(msg)
        await wait()
        return await checkDeployStatus(cli, amplify, appId, jobId, count + 1)
    }

    return jobStatus.job.summary.status
}

/* 

 title: config.title,
        bucketName,
        appId

        region,
        stage,
        deployName,

        zip: {
            source: string,
            target: string,
            zipName: string
        },
        upload: {
            key:string
        },
        deploy: {
            branch: string
        }
    */

module.exports.deployAction = async function deploy(cli, aws, config) {
    const amplify = new realAws.Amplify({
        region: config.region //'us-east-1'
    })
    /**
     * Get project info locally
     */
    cli.terminal.clear()
    printLoadingMessage('Checking project configuration')

    let projectData = {
        name: config.name,
        bucketName: config.bucketName,
        appId: config.appId
    }

    // try {
    //     projectData = await getProjectData(cli)
    // } catch (e) {
    //     cli.terminal.clear()
    //     cli.terminal.printErrorMessage('Rise Static Validation Error')
    //     cli.terminal.printInfoMessage('- ' + e.message)
    //     return
    // }
    const stage = config.stage //'dev'
    const region = config.region //'us-east-1'
    const deployName = config.deployName //projectData.name.replace(/\s/g, '') + 'static'

    /**
     * Deploy Infrastructure if needed
     */
    if (!projectData.bucketName || !projectData.appId) {
        cli.terminal.clear()
        printLoadingMessage('Deploying Infrastructure')
        const dep = await deployApplicationBucket(
            cli,
            aws,
            deployName,
            stage,
            config.hiddenFolder,
            config.auth
        )
        projectData.bucketName = dep.bucket
        projectData.appId = dep.appId
    }
    const appId = projectData.appId

    /**
     * Uploading code to s3 bucket
     */
    cli.terminal.clear()
    printLoadingMessage('Uploading code to AWS S3')
    await cli.filesystem.zipFolder({
        source: config.zip.source, //'/dist',
        target: config.zip.target, //'/' + '.static' + '/',
        name: config.zip.zipName //'app'
    })

    const uploadFile = await cli.filesystem.getFile(
        `/${config.hiddenFolder}/${config.upload.key}`
    )
    await aws.s3.uploadFile({
        file: uploadFile,
        bucket: projectData.bucketName,
        key: config.upload.key //'app.zip'
    })

    /**
     * Execute amplify deployment
     */
    cli.terminal.clear()
    printLoadingMessage('Deploying to AWS Amplify')
    const res = await amplify
        .startDeployment({
            appId: appId,
            branchName: config.deploy.branch,
            sourceUrl: `s3://${projectData.bucketName}/${config.upload.key}`
        })
        .promise()
    await checkDeployStatus(cli, amplify, appId, res.jobSummary.jobId, 0)
    clearInterval(loadingInterval)
    /**
     * Display Successful Result
     */
    cli.terminal.clear()
    cli.terminal.printSuccessMessage('Deployed!')
    cli.terminal.printInfoMessage(
        `Endpoint: https://main.${appId}.amplifyapp.com`
    )
}
