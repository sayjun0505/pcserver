import express from "express";
import { dbConfig } from "../db/pcbuilderdb.mjs";
import CPUVendor from "../model/cpuvendor.js";
import CPUInfo from "../model/cpuinfo.js";
import CPUVendorList from "../model/cpuvendorlist.js";
import CPUNat from "../model/cpunat.js";
import CPUList from "../model/cpulist.js";
import MboardvendorList from "../model/mboardvendorlist.js";
import MboardNat from "../model/mboardnat.js";
import MboardList from "../model/mboardlist.js";
import mongoose from "mongoose";
const operRouter = express.Router();

operRouter.get("/api/alldata", async (req, res) => {
  try {
    const filterstring = req.query.filter;
    let allData,count;
  
    if (filterstring) {
      const regex = new RegExp(filterstring, "i");
      allData = await CPUList.find({ name: { $regex: regex } }).limit(36);
      count = await CPUList.find({ name: { $regex: regex } }).countDocuments({});
    } else {
      allData = await CPUList.find({}).limit(36);
      count = await CPUList.countDocuments({});
    }

    const ret = { data: allData, count: count };
    
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
      const cpunatData = await CPUNat.findOne({ cpuid: id });
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

operRouter.get("/api/allmdata", async (req, res) => {
  try {
    const allData = await MboardList.find({});
    const ret = { data: allData };
    res.json(ret);
  } catch (error) {
    console.error("Error fetching all data from MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

operRouter.get("/api/mspec", async (req, res) => {
  try {
    const id = req.query.id; 
    if (id) {
      const allData = await MboardList.findOne({ _id: id });
      const vendorData = await MboardvendorList.find({ mboardid: id });
      const cpunatData = await MboardNat.findOne({ mboardid: id });
      const ret = { data: allData, vendor: vendorData,nat:cpunatData };
      res.json(ret);
    } else {
      const allData = await MboardList.find({});
      const vendorData = await MboardvendorList.find({});
      const cpunatData = await MboardNat.find({ cpuid: id });
      const ret = { data: allData, vendor: vendorData,nat:cpunatData };
      res.json(ret);
    }
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});


export default operRouter;
