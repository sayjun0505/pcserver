import mongoose from "mongoose";
import { dbConfig } from "./db/pcbuilderdb.mjs";
import { fetchMboard } from "./engin/idealomboard0721.mjs";
// import { fetchPageTitle } from "./engin/perfect.mjs";
const interval = 20000;
mongoose.Promise = global.Promise;

mongoose
  .connect(dbConfig.db)
  .then(async () => {
    console.log("Database successfully connected in idealoData!");
    let busy = false;
    const fetchDataFromWebshop = async () => {
      busy = true;
      await fetchMboard();
      busy = false;
    };

    setInterval(() => {
      if (!busy) fetchDataFromWebshop();
    }, interval);
  })
  .catch((error) => {
    console.log("Could not connect to database: " + error);
  });