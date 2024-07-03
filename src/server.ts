import cors from "cors";
import express from "express";
import { createHandler } from "graphql-http/lib/use/express";
import { buildSchema } from "graphql";
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";
import GraphQLUpload from "graphql-upload/GraphQLUpload.mjs";

const PORT = 8000;

const schema = buildSchema(`
  """
  upload type
  """
  scalar Upload

  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }

  type Query {
    uploads: [File]
  }

  type Mutation {
    singleUpload(file: Upload!): File!
  }
`);

const app = express();

const root = {
  Upload: GraphQLUpload,
  Mutation: {
    singleUpload: (parent: any, args: any) => {
      return args.file.then((file) => {
        console.log(`📁 File get ${file.filename}`);
        return file;
      });
    },
  },
};

app.use(cors());

app.use(
  graphqlUploadExpress({
    maxFileSize: 100 * 1024 * 1024,
    maxFiles: 5,
  })
);

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
