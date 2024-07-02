import express from "express";
import { dbConfig } from "../db/pcbuilderdb.mjs";
import CPUVendor from "../model/cpuvendor.js";
import CPUInfo from "../model/cpuinfo.js";
import mongoose from "mongoose";
const operRouter = express.Router();

operRouter.get("/api/alldata", async (req, res) => {
  try {
    const allData = await CPUInfo.find({});
    const vendorData = await CPUVendor.find({});
    const ret={data:allData,vendor:vendorData}
    res.json(ret);
  } catch (error) {
    console.error("Error fetching all data from MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default operRouter;
