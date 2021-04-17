AWS lambda is available at: https://bjkr7j73r6.execute-api.eu-west-2.amazonaws.com/dev


 There is a benefit to this—I don't have to manually string up all my routes and functions. I can also limit the impact of cold-starts on lightly-used routes.

However, we also lose some of the benefits of the serverless architecture. I can isolate my bits of logic into separate functions and get a decent look at my application from standard metrics. If each route is handled by a different Lambda function, then I can see:
