import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import bodyParser from "body-parser";
import operRoutes from "./actions/dboperation.mjs";
import { dbConfig } from "./db/pcbuilderdb.mjs";
const app = express();
const port = 5000;
const __dirname = path.dirname(new URL(import.meta.url).pathname);
app.use(cors({ origin: "*" })); 
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.Promise = global.Promise;
mongoose
  .connect(dbConfig.db)
  .then(() => {
    console.log("Database successfully connected in server!");
  })
  .catch((error) => {
    console.log("Could not connect to database: " + error);
  });
app.get("/", (req, res) => {
  res.send("Hello from Express!");
});
app.use("/", operRoutes);
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
