import express from "express";
import mongoose from "mongoose";
import { dbConfig } from "./db/pcbuilderdb.mjs";
import { initSocketServer } from "./socketServer.mjs";
import { azertyData } from "./engin/azertyengine.mjs";
import http from "http";
const socketport = 8001;
const interval = 20000; // 10 seconds interval
mongoose.Promise = global.Promise;
mongoose
  .connect(dbConfig.db)
  .then(async () => {
    console.log("Database successfully connected in azerty!");
    const httpServer = http.createServer();
    const { io } = await initSocketServer(httpServer);
    let busy = false;
    const fetchDataFromWebshop = async () => {
      busy = true;
      await azertyData(io);
      busy = false;
    };
    setInterval(() => {
      if(!busy)fetchDataFromWebshop();
    }, interval);
    httpServer.listen(socketport, () => {
      console.log(`Server listening on port ${socketport}`);
    });
  })
  .catch((error) => {
    console.log("Could not connect to database: " + error);
  });
