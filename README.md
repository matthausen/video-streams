1. POST request to add a stream id to a specific user
2. Check if stream is already 



 There is a benefit to this—I don't have to manually string up all my routes and functions. I can also limit the impact of cold-starts on lightly-used routes.

However, we also lose some of the benefits of the serverless architecture. I can isolate my bits of logic into separate functions and get a decent look at my application from standard metrics. If each route is handled by a different Lambda function, then I can see:
