import serverlessExpress from "@vendia/serverless-express";
import app from "./index";

// Wrap your existing Express app in a Lambda handler
export const handler = serverlessExpress({ app });
