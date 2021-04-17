const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const USERS_STREAMS_TABLE = process.env.USERS_STREAMS_TABLE;
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.newStream = (event, context, callback) => {
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

    dynamoDb.scan(scanParams, (error, data) => {
        const currentStreams = data.Items[0].streamId ? data.Items[0].streamId.length : 0;
        if (currentStreams < 3) {
            callback(null, { statusCode: 201, body: JSON.stringify({ statusCode: 201, message: "You can add more streams", entries: data.Items }) })

            const newStream = uuidv4();
            const params = {
                TableName: USERS_STREAMS_TABLE,
                Key: {
                    userId: event.pathParameters.userId
                },
                "UpdateExpression": "SET streamId = list_append (streamId, :newStream)",
                "ExpressionAttributeValues": {
                    ":newStream": [newStream],
                },
                "ReturnValues": "UPDATED_NEW"
            };

            dynamoDb.update(params, (error, data) => {
                if (error) {
                    console.log(error)
                    callback(null, { statusCode: 400, body: JSON.stringify({ statusCode: 400, message: "Could not add stream" }) })
                }
            })
        } else {
            callback(null, { statusCode: 400, body: JSON.stringify({ statusCode: 400, message: "Max number of stream reached" }) })
        }
    })
}