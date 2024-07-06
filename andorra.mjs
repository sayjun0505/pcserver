import express from "express";
import mongoose from "mongoose";
import { dbConfig } from "./db/pcbuilderdb.mjs";
import { andorrainformaticaData } from "./engin/andorrainformatica.mjs";

const interval = 20000; // 10 seconds interval
mongoose.Promise = global.Promise;
mongoose
  .connect(dbConfig.db)
  .then(() => {
    console.log("Database successfully connected in andorra!");
  })
  .catch((error) => {
    console.log("Could not connect to database: " + error);
  });
let  busy=false;
const fetchDataFromWebshop =async  () => {
  busy=true;
  await andorrainformaticaData();
  busy=false;
};
setInterval(() => {
  // if(!busy)fetchDataFromWebshop();
}, interval);
