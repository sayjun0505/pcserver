import mongoose from "mongoose";
import { dbConfig } from "./db/pcbuilderdb.mjs";
import { azertyData } from "./engin/azertyengine.mjs";
const interval = 20000; // 10 seconds interval
mongoose.Promise = global.Promise;
mongoose
  .connect(dbConfig.db)
  .then(async () => {
    console.log("Database successfully connected in azerty!");
    let busy = false;
    const fetchDataFromWebshop = async () => {
      busy = true;
      await azertyData();
      busy = false;
    };
    setInterval(() => {
      if(!busy)fetchDataFromWebshop();
    }, interval);
  })
  .catch((error) => {
    console.log("Could not connect to database: " + error);
  });
