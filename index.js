const serverless = require('serverless-http');
const express = require('express');
const app = express();
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');


const USERS_STREAMS_TABLE = process.env.USERS_STREAMS_TABLE;
const dynamoDb = new AWS.DynamoDB.DocumentClient();

app.get('/users/:userId', function(req, res) {
    const params = {
        TableName: USERS_STREAMS_TABLE,
        Key: {
            userId: req.params.userId,
        },
    }

    dynamoDb.get(params, (error, result) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not get user' });
        }
        if (result.Item) {
            const { userId, name } = result.Item;
            res.json({ userId, name });
        } else {
            res.status(404).json({ error: "User not found" });
        }
    });
})

// Create User endpoint
app.post('/users', function(req, res) {
    const { userId } = JSON.parse(req.body);
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
        res.json({ userId });
    });
})

// Add streamId to a specific userId
app.post('/user/:userId/streams', function(req, res) {
    const newStream = uuidv4();
    var params = {
        TableName: USERS_STREAMS_TABLE,
        Key: {
            userId: req.params.userId
        },
        "UpdateExpression": "SET streamId = list_append (streamId, :newStream)",
        "ExpressionAttributeValues": {
            ":newStream": [newStream],
        },
        "ReturnValues": "UPDATED_NEW"
    };

    const scanParams = {
        TableName: USERS_STREAMS_TABLE,
        FilterExpression: '#userId = :userId',
        ExpressionAttributeNames: {
            '#userId': 'userId',
        },
        ExpressionAttributeValues: {
            ':userId': req.params.userId,
        },
    }

    dynamoDb.scan(scanParams, (error, data) => {
        const currentStreams = data.Items[0].streamId ? data.Items[0].streamId.length : 0;
        if (currentStreams < 3) {
            res.status(200).json({ message: 'You can add more streams', items: data.Items })
            dynamoDb.update(params, (error, data) => {
                if (error) {
                    console.log(error)
                    res.status(400).json({ error: 'Could not add streamId' });
                }
                // res.json({ message: 'Stream successfully added to user' })
            })
        } else {
            res.status(400).json({ error: 'Maximum number of streams reached' })
        }
    })
})

module.exports.handler = serverless(app);