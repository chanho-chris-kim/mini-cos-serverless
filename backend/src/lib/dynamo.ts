// backend/src/lib/dynamo.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const isOffline = process.env.IS_OFFLINE === "true";

// LOCAL DynamoDB (serverless-dynamodb-local)
const localClient = new DynamoDBClient({
  region: "ca-central-1",
  endpoint: "http://localhost:8000",
  credentials: {
    accessKeyId: "fake",
    secretAccessKey: "fake",
  },
});

// REAL AWS DynamoDB
const awsClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "ca-central-1",
});

// DocumentClient wrapper (auto JSON marshalling)
export const dynamo = DynamoDBDocumentClient.from(
  isOffline ? localClient : awsClient,
  {
    marshallOptions: {
      removeUndefinedValues: true,
    },
  }
);
