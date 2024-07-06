import mongoose from "mongoose";
import { dbConfig } from "./db/pcbuilderdb.mjs";
import { bpmpowerData } from "./engin/bpmpower.mjs";
import { initSocketServer } from "./socketServer.mjs";
import http from "http";
const socketport=5000;
const interval = 20000;
mongoose.Promise = global.Promise;

mongoose
  .connect(dbConfig.db)
  .then(async () => {
    console.log("Database successfully connected in bpm!");

    const httpServer = http.createServer();
    const { io } = await initSocketServer(httpServer);
    let busy = false;
    const fetchDataFromWebshop = async () => {
      busy = true;
      await bpmpowerData(io);
      busy = false;
    };

    setInterval(() => {
      if (!busy) fetchDataFromWebshop();
    }, interval);

    httpServer.listen(socketport, () => {
      console.log(`Server listening on port ${socketport}`);
    });
  })
  .catch((error) => {
    console.log("Could not connect to database: " + error);
  });