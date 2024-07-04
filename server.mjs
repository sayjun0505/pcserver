import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import bodyParser from "body-parser";
import operRoutes from './actions/dboperation.mjs';
import { dbConfig } from "./db/pcbuilderdb.mjs";
import { andorrainformaticaData } from "./engin/andorrainformatica.mjs";
import { rueducommerceData } from "./engin/rueducommerce.mjs";
import { databaseRefactoring } from "./engin/databaseRefactoring.mjs";
import { bpmpowerData } from "./engin/bpmpower.mjs";
import { azertyData } from "./engin/azerty.mjs";

// require('dotenv').config();

const webshops = process.env.WEB_SHOPS;
const app = express();
const port = 5000;
const interval = 200000; // 10 seconds interval

// app.use(express.static(path.resolve(new URL('.', import.meta.url).pathname)));
const __dirname = path.dirname(new URL(import.meta.url).pathname);

app.use(cors({ origin: "*" })); // Replace with the URL of your frontend app
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.Promise = global.Promise;
mongoose
  .connect(dbConfig.db)
  .then(() => {
    console.log("Database successfully connected!");
  })
  .catch((error) => {
    console.log("Could not connect to database: " + error);
  });

const fetchDataFromWebshop = () => {
  // databaseRefactoring();
  rueducommerceData();
  azertyData();
  bpmpowerData();  
  andorrainformaticaData();
};

// Define the interval task
setInterval(() => {
  fetchDataFromWebshop();
}, interval);

app.get("/", (req, res) => {
  res.send("Hello from Express!");
});
app.use('/',operRoutes);
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
