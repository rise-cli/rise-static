#! /usr/bin/env node
import * as cli from 'rise-cli-foundation'
import * as filesystem from 'rise-filesystem-foundation'
import { deployStaticSite } from 'rise-deploystatic'
import { getProjectData } from './getProjectData.mjs'
import process from 'node:process'

const flags = [
    {
        flag: '--stage',
        default: 'dev'
    },
    {
        flag: '--region',
        default: 'us-east-1'
    }
]

cli.addCommand({
    command: 'deploy',
    flags,
    action: async (flags) => {
        /**
         * Make hidden folders
         */
        const HIDDEN_FOLDER = '.rise'
        const projectFolder = filesystem.getDirectories({
            path: '/',
            projectRoot: process.cwd()
        })

        if (!projectFolder.includes(HIDDEN_FOLDER)) {
            await filesystem.makeDir({
                path: '/' + HIDDEN_FOLDER,
                projectRoot: process.cwd()
            })
        }

        /**
         * Get Project Config
         */
        let projectData = {}
        try {
            projectData = await getProjectData(cli)
        } catch (e) {
            cli.clear()
            cli.printErrorMessage('Rise Static Validation Error')
            cli.printInfoMessage('- ' + e.message)
            return
        }

        /**
         * Deploy
         */
        await deployStaticSite({
            app: {
                stage: flags.stage,
                region: flags.region,
                bucketName: projectData.bucketName,
                appId: projectData.appId,
                auth: projectData.auth
            },
            zipConfig: {
                source: projectData.distFolder,
                target: '/.rise',
                name: 'static'
            },
            deployName: projectData.name
        })
    }
})

cli.addCommand({
    command: 'remove',
    flags: [
        {
            flag: '--stage',
            default: 'dev'
        },
        {
            flag: '--region',
            default: 'us-east-1'
        }
    ],
    action: async (flags) => {
        console.log('in development...')
    }
})

cli.runProgram()
