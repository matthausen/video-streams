## Problem and solution

The problem was to create an API which allows any given user to open a maximum number of 3 video streams contemporarily.

In my solution I decided to have 3 functionalities:

1. Have the ability to create a user: by giving a userId and initialising with an empty list of streams
2. Store the streams as streamsId in a list in DynamoDB and have the db check by userId if the user has currently < 3 active streams and if so, do not allow to create more
3. Allow a user to close a stream, by passing the streamId to the request


## How to run

There is a postman collection in this repository.
The AWS lambda functions are available at the following endpoints:
  Create a new user
  `POST - https://qmm869at0l.execute-api.eu-west-2.amazonaws.com/dev/users`
  
  ```
  {"userId": "<userName>"} 
  ```
  
  Add a new stream to a user (the streamId is a unique value generated with uuid())
  `POST - https://qmm869at0l.execute-api.eu-west-2.amazonaws.com/dev/user/{userId}/streams`

  Delete a stream from a specific user
  `DELETE - https://qmm869at0l.execute-api.eu-west-2.amazonaws.com/dev/user/{userId}/stream`
  
  ```
  {closingStream: "<streamuuid>"}
  ```

I already created a user called "johndoe" which can be used for testing.

If you wish to test locally you can do so by installing few dependencies:
- `npm i`

and use the plugin to run serverless offline:
- `sls offline start`

In this case the endpoint will be available at: 
`POST - http://localhost:3000/dev/users`
`POST - http://localhost:3000/dev/user/{userId}/streams`
`DELETE - http://localhost:3000/dev/user/{userId}/stream`


Run test: 
- `npm run test`

## Scalability and improvements

While writing this API I came across at least 2 possible solutions, each one with pros and cons.
AWS serverless + DynamoDB handles scalability for us, so we don't have to worry too much. However there are a couple things to consider:

1. Cold starts. 
  When an endpoint is not used for a prolonged period od time, AWS will automatically throttle down the instance that runs the function. This means it will take longer to respond once it's invoked again. 
  Initially I developed this API as a unique express server which handles all routes. This is great for routes which might be accessed less frequently (e.g. user creation). However we lose modularity in the code and if there were many more routes the code would be messy and less readable.

2. DynamoDB.
  This DB is great for storing this type of data. My knowledge of this DB is limited even though I had much fun exploring it. 
  I feel there are many ways in which the queries could be optimised which I am not aware of (e.g. using REMOVE by index rather than DELETE).

3. Cost vs performance. 
  Lambda is great for keeping costs down and is great for this case. 
  If the API was to be used thousands of times per day it would make sense to develop this as a microservice running as a docker image on Kubernetes. This is way more expensive.

4. Tests
  I have tested extensively using postman during the development.
  Regarding unit tetsing I have followed common guidelines on how to test dynamoDB locally but I am no expert.
  There are definitely several improvements that could be done.