const AWS = require('aws-sdk');

const USERS_STREAMS_TABLE = process.env.USERS_STREAMS_TABLE;
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.deleteStream = (event, context, callback) => {
    const scanParams = {
        TableName: USERS_STREAMS_TABLE,
        FilterExpression: '#userId = :userId',
        ExpressionAttributeNames: {
            '#userId': 'userId',
        },
        ExpressionAttributeValues: {
            ':userId': event.pathParameters.userId,
        },
    }

    console.log(event.pathParameters);

    dynamoDb.scan(scanParams, (error, data) => {
        const { closingStream } = JSON.parse(event.body)
        const openedStreams = data.Items[0].streamId;
        const index = openedStreams.indexOf(closingStream)

        const params = {
            TableName: USERS_STREAMS_TABLE,
            Key: {
                userId: event.pathParameters.userId
            },
            "UpdateExpression": "REMOVE streamId[" + index + "]",
            "ReturnValues": "UPDATED_NEW"
        };

        dynamoDb.update(params, (error, data) => {
            if (error) {
                console.log(error)
                callback(null, { statusCode: 400, body: JSON.stringify({ statusCode: 400, message: "Could not delete stream" }) })
            }
            callback(null, { statusCode: 200, body: JSON.stringify({ statusCode: 200, message: "Stream successfully closed by user" }) })
        })
    })
}