import mongoose from "mongoose";
import { dbConfig } from "./db/pcbuilderdb.mjs";
import { fetchCPU1 } from "./engin/fixing1.mjs";
mongoose.Promise = global.Promise;

mongoose
  .connect(dbConfig.db)
  .then(async () => {
    console.log("Database successfully connected in idealoData!");
    let busy = false;
    const fetchDataFromWebshop = async () => {
      busy = true;
      await fetchCPU1();
      busy = false;
    };
    fetchDataFromWebshop();
  })
  .catch((error) => {
    console.log("Could not connect to database: " + error);
  });