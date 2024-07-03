import cors from "cors";
import express from "express";
import { createHandler } from "graphql-http/lib/use/express";
import { buildSchema } from "graphql";
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";
import GraphQLUpload, { FileUpload } from "graphql-upload/GraphQLUpload.mjs";

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
    singleUpload(upload: Upload!): File!
  }
`);

const app = express();

const root = {
  Upload: GraphQLUpload,
  singleUpload: (args: any, parent: any) => {
    console.log({ parent, args });
    console.log(typeof args);
    console.log(args.upload.file);
    return args.upload.file;
  },
};

app.use(cors());

// Create and use the GraphQL handler.
app.all(
  "/graphql",
  graphqlUploadExpress({
    maxFileSize: 100 * 1024 * 1024,
    maxFiles: 5,
  }),
  (req, res, next) => {
    /**
     * @see https://github.com/graphql/graphql-http/discussions/36
     */
    const contentType = req.headers?.["content-type"];
    if (
      typeof contentType === "string" &&
      contentType.startsWith("multipart/form-data")
    ) {
      req.headers["content-type"] = "application/json";
    }
    next();
  },
  createHandler({
    schema: schema,
    rootValue: root,
  })
);

app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});
