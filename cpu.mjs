import mongoose from "mongoose";
import { dbConfig } from "./db/pcbuilderdb.mjs";
// import { fetchCPU } from "./engin/idealocpu.mjs";
import { fetchCPU } from "./engin/fixing.mjs";
const interval = 20000;
mongoose.Promise = global.Promise;

mongoose
  .connect(dbConfig.db)
  .then(async () => {
    console.log("Database successfully connected in idealoData!");
    let busy = false;
    const fetchDataFromWebshop = async () => {
      busy = true;
      await fetchCPU();
      busy = false;
    };
    // fetchDataFromWebshop();
    setInterval(() => {
      if (!busy) fetchDataFromWebshop();
    }, interval);
  })
  .catch((error) => {
    console.log("Could not connect to database: " + error);
  });