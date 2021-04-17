const AWS = require('aws-sdk');

const USERS_STREAMS_TABLE = process.env.USERS_STREAMS_TABLE;
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.newUser = (event, context, callback) => {
    const { userId } = JSON.parse(event.body);
    if (typeof userId !== 'string') {
        res.status(400).json({
            error: '"userId" must be a string.',
        });
    }

    const params = {
        TableName: USERS_STREAMS_TABLE,
        Item: {
            userId: userId,
            streamId: []
        },
    };

    dynamoDb.put(params, (error) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not create user' });
        }
        callback(null, {
            statusCode: 201,
            body: JSON.stringify({
                statusCode: 201,
                message: "New user created",
            })
        })
    });
}