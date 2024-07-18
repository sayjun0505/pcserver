import mongoose from "mongoose";
import { dbConfig } from "./db/pcbuilderdb.mjs";
// import { fetchCPU } from "./engin/idealocpu.mjs";
// import { fetchCPU } from "./engin/fixing.mjs";
import { fetchCPU1 } from "./engin/fixing1.mjs";
import { fetchCPU2 } from "./engin/fixing2.mjs";
import { fetchCPU3 } from "./engin/fixing3.mjs";
import { fetchCPU4 } from "./engin/fixing4.mjs";
import { fetchCPU5 } from "./engin/fixing5.mjs";
const interval = 20000;
mongoose.Promise = global.Promise;

mongoose
  .connect(dbConfig.db)
  .then(async () => {
    console.log("Database successfully connected in idealoData!");
    let busy = false;
    const fetchDataFromWebshop = async () => {
      busy = true;
      // await fetchCPU();
      // await fetchCPU1();
      // await fetchCPU2();
      // await fetchCPU3();
      await fetchCPU4();
      // await fetchCPU5();
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