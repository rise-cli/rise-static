const {deployAction} = require('./commands/deployAction')
const {removeAction} = require('./commands/removeAction')

module.exports.deploy = deployAction
module.exports.remove = removeAction