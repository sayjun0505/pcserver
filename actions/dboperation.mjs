import express from "express";
import { dbConfig } from "../db/pcbuilderdb.mjs";
import CPUVendor from "../model/cpuvendor.js";
import CPUInfo from "../model/cpuinfo.js";
import CPUVendorList from "../model/cpuvendorlist.js";
import CPUNat from "../model/cpunat.js";
import mongoose from "mongoose";
import CPUList from "../model/cpulist.js";
const operRouter = express.Router();

operRouter.get("/api/alldata", async (req, res) => {
  try {
    const allData = await CPUList.find({});
    const ret = { data: allData };
    res.json(ret);
  } catch (error) {
    console.error("Error fetching all data from MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

operRouter.get("/api/spec", async (req, res) => {
  try {
    const id = req.query.id; 
    if (id) {
      const allData = await CPUList.findOne({ _id: id });
      const vendorData = await CPUVendorList.find({ cpuid: id });
      const cpunatData = await CPUNat.find({ cpuid: id });
      const ret = { data: allData, vendor: vendorData,nat:cpunatData };
      res.json(ret);
    } else {
      const allData = await CPUInfo.find({});
      const vendorData = await CPUVendor.find({});
      const cpunatData = await CPUNat.find({ cpuid: id });
      const ret = { data: allData, vendor: vendorData,nat:cpunatData };
      res.json(ret);
    }
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default operRouter;
