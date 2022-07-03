const makeCli = require('rise-cli-foundation')
const makeRiseAws = require('rise-aws-foundation')
const { deploy } = require('./commands/deploy/index.js')
const remove = require('./commands/remove/index.js')

module.exports = (projectRoot) => {
    /**
     * Setup CLI
     */
    const cli = makeCli({
        type: 'real',
        projectRoot: projectRoot
    })

    const riseAws = makeRiseAws({
        type: 'real'
    })

    /**
     * Setup CLI Commands
     */
    cli.terminal.makeCommand({
        command: 'deploy',
        description: 'Deploy static files to AWS',
        action: (flags) => {
            deploy(cli, riseAws, flags)
        }
    })

    cli.terminal.makeCommand({
        command: 'remove',
        description: 'Remove site',
        action: (flags) => {
            remove(cli, riseAws, flags)
        }
    })

    /**
     * Start
     */
    return cli.terminal.start
}
