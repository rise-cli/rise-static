const aws = require('aws-sdk')
const s3 = new aws.S3()

/**
 * Deletes all objects in an S3 bucket
 * @param {Object} aws - AWS class
 * @param {string} bucketName - Name of bucket to be deleted
 *
 * @returns {Promise<boolean>} Whether all objects in the bucket were removed
 * (will be `false` if `keyPrefix` is provided and objects exist outside that prefix)
 */
module.exports.emptyBucket = async function emptyBucket({ bucketName, keyPrefix }) {
    const resp = await s3.listObjectsV2({
        Bucket: bucketName,
    }).promise()
    
    const contents = resp.Contents
    let testPrefix = false,
        prefixRegexp
    if (!contents[0]) {
        return Promise.resolve()
    } else {
        if (keyPrefix) {
            testPrefix = true
            prefixRegexp = new RegExp('^' + keyPrefix)
        }
        const objectsToDelete = contents
            .map(function (content) {
                return { Key: content.Key }
            })
            .filter(
                (content) => !testPrefix || prefixRegexp.test(content.Key)
            )

        const willEmptyBucket = objectsToDelete.length === contents.length

        if (objectsToDelete.length === 0) {
            return Promise.resolve(willEmptyBucket)
        }

        const params = {
            Bucket: bucketName,
            Delete: { Objects: objectsToDelete }
        }
    
        const res = await s3.deleteObjects(params).promise()
        return willEmptyBucket
    }  
}
