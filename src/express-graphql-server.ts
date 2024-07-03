import cors from "cors";
import express from "express";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";
import GraphQLUpload, { FileUpload } from "graphql-upload/GraphQLUpload.mjs";
import * as fs from "fs";

const PORT = 8000;

fs.mkdirSync("output", { recursive: true });

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
  singleUpload: async (args: any, parent: any) => {
    const upload = await (args.upload.file as Promise<FileUpload>);
    const readableStream = upload.createReadStream();

    const filename = `output/${upload.filename}`;
    const writeStream = fs.createWriteStream(`output/${upload.filename}`);
    readableStream.pipe(writeStream);
    console.log(`[express-graphql] Output: ${filename}`);

    return new Promise((resolve) => {
      writeStream.once("close", () => {
        resolve(upload);
      });
    });
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
  graphqlHTTP({
    schema: schema,
    rootValue: root,
  })
);

app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});
