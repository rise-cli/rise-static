module.exports = {
    name: 'rise-static-pipeline',
    stages: [
        {
            name: 'Source',
            actions: [
                {
                    type: 'SOURCE',
                    name: 'GithubRepo',
                    repo: 'rise-static',
                    owner: 'rise-cli'
                    //  outputArtifact: 'sourceZip'
                }
            ]
        },
        {
            name: 'Prod',
            actions: [
                // {
                //     type: 'BUILD',
                //     name: 'Test',
                //     script: '/test.yml',
                //     inputArtifact: 'sourceZip',
                //     outputArtifact: 'testZip'
                // },
                {
                    type: 'BUILD',
                    name: 'DeployDocumentation',
                    script: '/docs.yml'
                },

                {
                    type: 'BUILD',
                    name: 'PublishToNpm',
                    script: '/publish.yml',
                    env: {
                        NPM_TOKEN: '@secret.NPM_KEY'
                    }
                }
            ]
        }
    ]
}
