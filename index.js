const serverless = require('serverless-http');
const express = require('express');
const app = express();
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { DataBrew } = require('aws-sdk');


const USERS_STREAMS_TABLE = process.env.USERS_STREAMS_TABLE;
const dynamoDb = new AWS.DynamoDB.DocumentClient();

app.get('/', function(req, res) {
    res.send('Hello World')
})

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
    const { userId, name } = JSON.parse(req.body);
    if (typeof userId !== 'string') {
        res.status(400).json({
            error: '"userId" must be a string.',
        });
    } else if (typeof name !== 'string') {
        res.status(400).json({ error: '"name" must be a string' });
    }

    const params = {
        TableName: USERS_STREAMS_TABLE,
        Item: {
            userId: userId,
            name: name,
        },
    };

    dynamoDb.put(params, (error) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not create user' });
        }
        res.json({ userId, name });
    });
})

// Fetch all streamIds from a user
/* app.get('/user/:userId/streams', function(req, res) {
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
}) */

// Add streamId to a user
app.post('/user/:userId/streams', function(req, res) {
    const params = {
        TableName: USERS_STREAMS_TABLE,
        Item: {
            userId: req.params.userId,
            streamId: uuidv4()
        }
    }

    dynamoDb.scan(params, (error, data) => {
        if (data.Items.length < 3) {
            dynamoDb.put(params, (error) => {
                if (error) {
                    console.log(error)
                    res.status(400).json({ error: 'Could not add streamId' });
                }
                res.status(200).json({ message: 'Stream successfully added to user' })
            })
        } else {
            res.status(400).json({ error: 'Maximum number of streams reached' })
        }
    })
})

module.exports.handler = serverless(app);