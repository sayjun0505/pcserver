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
    const ret = { data: allData, vendor: vendorData };
    res.json(ret);
  } catch (error) {
    console.error("Error fetching all data from MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

operRouter.get("/api/spec", async (req, res) => {
  try {
    const id = req.query.id; // Get the value of the 'id' parameter from the query
    // console.log(id);
    if (id) {
      // Handle the case when 'id' is provided in the query
      // Perform any operations based on the ID value
      const allData = await CPUInfo.findOne({ _id: id });
      const vendorData = await CPUVendor.find({ cpuid: id });
      const ret = { data: allData, vendor: vendorData };
      // console.log(ret);
      res.json(ret);
    } else {
      // Handle the case when 'id' is not provided in the query
      // Fetch all data if 'id' is not specified
      const allData = await CPUInfo.find({});
      const vendorData = await CPUVendor.find({});
      const ret = { data: [], vendor: [] };
      res.json(ret);
    }
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default operRouter;
