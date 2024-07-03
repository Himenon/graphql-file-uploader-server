import cors from "cors";
import express from "express";
import { createHandler } from "graphql-http/lib/use/express";
import { buildSchema } from "graphql";

const PORT = 8000;

const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

const app = express();

const root = {
  hello() {
    return "Hello world!";
  },
};

app.use(cors());
// Create and use the GraphQL handler.
app.all(
  "/graphql",
  createHandler({
    schema: schema,
    rootValue: root,
  })
);
app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});
