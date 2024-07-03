import cors from "cors";
import express from "express";

const app = express();

app.use(cors());

const server = app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});
