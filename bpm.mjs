import mongoose from "mongoose";
import { dbConfig } from "./db/pcbuilderdb.mjs";
import { bpmpowerData } from "./engin/bpmpower.mjs";
const interval = 20000;
mongoose.Promise = global.Promise;

mongoose
  .connect(dbConfig.db)
  .then(async () => {
    console.log("Database successfully connected in bpm!");
    let busy = false;
    const fetchDataFromWebshop = async () => {
      busy = true;
      await bpmpowerData();
      busy = false;
    };

    setInterval(() => {
      if (!busy) fetchDataFromWebshop();
    }, interval);
  })
  .catch((error) => {
    console.log("Could not connect to database: " + error);
  });