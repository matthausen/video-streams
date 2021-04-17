const { DocumentClient } = require("aws-sdk/clients/dynamodb");

const isTest = process.env.JEST_WORKER_ID;
const config = {
    convertEmptyValues: true,
    ...(isTest && {
        endpoint: "localhost:8000",
        sslEnabled: false,
        region: "local-env",
    }),
};

describe("dynamodb tests", () => {
    const db = new DocumentClient(config);

    it("should insert item into table", async() => {
        await db
            .put({
                TableName: "users-streams-dev",
                Item: {
                    userId: "testUser",
                    streamId: [],
                },
            })
            .promise();

        const { Item } = await db
            .get({ TableName: "users-streams-dev", Key: { userId: "testUser" } })
            .promise();

        expect(Item).toEqual({
            userId: "testUser",
            streamId: [],
        });
    });

    it("should add a stream to a user", async() => {
        await db
            .put({
                TableName: "users-streams-dev",
                Item: {
                    userId: "testUser",
                    streamId: ["1", "2", "3"],
                },
            })
            .promise();

        const { Item } = await db
            .get({ TableName: "users-streams-dev", Key: { userId: "testUser" } })
            .promise();

        expect(Item).toEqual({
            userId: "testUser",
            streamId: ["1", "2", "3"],
        });
    });

    it("removes a stream from a user", async() => {
        await db
            .put({
                TableName: "users-streams-dev",
                Item: { userId: "testUser", streamId: "1" },
            })
            .promise();

        await db.delete({
            TableName: "users-streams-dev",
            Key: {
                streamId: "2",
            },
            ConditionExpression: "#uid = :uid",
            ExpressionAttributeNames: {
                "#uid": "userId",
            },
            ExpressionAttributeValues: {
                ":uid": "1",
            },
        });

        const { Items } = await db
            .scan({
                TableName: "users-streams-dev",
                ProjectionExpression: "#uid",
                FilterExpression: "#uid = :uid",
                ExpressionAttributeNames: {
                    "#uid": "userId",
                },
                ExpressionAttributeValues: {
                    ":uid": "2",
                },
            })
            .promise();

        expect(Items.length).toEqual(0);
    });
});