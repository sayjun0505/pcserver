import express from "express";
// import { dbConfig } from "../db/pcbuilderdb.mjs";
// import CPUVendor from "../model/cpuvendor.js";
// import CPUInfo from "../model/cpuinfo.js";
import CPUVendorList from "../model/cpuvendorlist.js";
import CPUNat from "../model/cpunat.js";
import CPUList from "../model/cpulist.js";
import MboardVendorList from "../model/mboardvendorlist.js";
import MboardNat from "../model/mboardnat.js";
import MboardList from "../model/mboardlist.js";

import RamVendorList from "../model/ramvendorlist.js";
import RamNat from "../model/ramnat.js";
import RamList from "../model/ramlist.js";

import StorageVendorList from "../model/storagevendorlist.js";
import StorageNat from "../model/storagenat.js";
import StorageList from "../model/storagelist.js";

import CaseVendorList from "../model/casevendorlist.js";
import CaseNat from "../model/casenat.js";
import CaseList from "../model/caselist.js";

import GPUVendorList from "../model/gpuvendorlist.js";
import GPUNat from "../model/gpunat.js";
import GPUList from "../model/gpulist.js";

// import mongoose from "mongoose";
const operRouter = express.Router();

operRouter.get("/api/alldata", async (req, res) => {
  try {
    const filterstring = req.query.filter;
    const curpage = req.query.curpage;
    let allData, count;

    if (filterstring) {
      const regex = new RegExp(filterstring, "i");
      allData = await CPUList.find({ name: { $regex: regex } }).limit(36);
      // allData = await CPUList.find({ name: { $regex: regex } }).limit(36);
      count = await CPUList.find({ name: { $regex: regex } }).countDocuments(
        {}
      );
    } else {
      allData = await CPUList.find({}).limit(36);
      count = await CPUList.countDocuments({});
    }
    if (curpage) {
      const regex = new RegExp(filterstring, "i");
      const skip = (curpage - 1) * 36;
      allData = await CPUList.find({ name: { $regex: regex } })
        .skip(skip) // Skip the calculated number of records
        .limit(36);
      count = await CPUList.find({ name: { $regex: regex } }).countDocuments(
        {}
      );
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
      const ret = { data: allData, vendor: vendorData, nat: cpunatData };
      res.json(ret);
    } else {
      const allData = await CPUInfo.find({});
      const vendorData = await CPUVendor.find({});
      const cpunatData = await CPUNat.find({ cpuid: id });
      const ret = { data: allData, vendor: vendorData, nat: cpunatData };
      res.json(ret);
    }
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

operRouter.get("/api/allmdata", async (req, res) => {
  try {
    const filterstring = req.query.filter;
    const curpage = req.query.curpage;
    let allData, count;

    if (filterstring) {
      const regex = new RegExp(filterstring, "i");
      allData = await MboardList.find({ name: { $regex: regex } }).limit(36);
      // allData = await CPUList.find({ name: { $regex: regex } }).limit(36);
      count = await MboardList.find({ name: { $regex: regex } }).countDocuments(
        {}
      );
    } else {
      allData = await MboardList.find({}).limit(36);
      count = await MboardList.countDocuments({});
    }
    if (curpage) {
      const regex = new RegExp(filterstring, "i");
      const skip = (curpage - 1) * 36;
      allData = await MboardList.find({ name: { $regex: regex } })
        .skip(skip) // Skip the calculated number of records
        .limit(36);
      count = await MboardList.find({ name: { $regex: regex } }).countDocuments(
        {}
      );
    }

    const ret = { data: allData, count: count };
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
      const vendorData = await MboardVendorList.find({ mboardid: id });
      const cpunatData = await MboardNat.findOne({ mboardid: id });
      const ret = { data: allData, vendor: vendorData, nat: cpunatData };
      res.json(ret);
    } else {
      const allData = await MboardList.findOne({ _id: id });
      const vendorData = await MboardVendorList.find({ mboardid: id });
      const cpunatData = await MboardNat.findOne({ mboardid: id });
      const ret = { data: allData, vendor: vendorData, nat: cpunatData };
      res.json(ret);
    }
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

operRouter.get("/api/allrdata", async (req, res) => {
  try {
    const filterstring = req.query.filter;
    const curpage = req.query.curpage;
    let allData, count;

    if (filterstring) {
      const regex = new RegExp(filterstring, "i");
      allData = await RamList.find({ name: { $regex: regex } }).limit(36);
      // allData = await CPUList.find({ name: { $regex: regex } }).limit(36);
      count = await RamList.find({ name: { $regex: regex } }).countDocuments(
        {}
      );
    } else {
      allData = await RamList.find({}).limit(36);
      count = await RamList.countDocuments({});
    }
    if (curpage) {
      const regex = new RegExp(filterstring, "i");
      const skip = (curpage - 1) * 36;
      allData = await RamList.find({ name: { $regex: regex } })
        .skip(skip) // Skip the calculated number of records
        .limit(36);
      count = await RamList.find({ name: { $regex: regex } }).countDocuments(
        {}
      );
    }

    const ret = { data: allData, count: count };

    res.json(ret);
  } catch (error) {
    console.error("Error fetching all data from MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

operRouter.get("/api/rspec", async (req, res) => {
  try {
    const id = req.query.id;
    if (id) {
      const allData = await RamList.findOne({ _id: id });
      const vendorData = await RamVendorList.find({ ramid: id });
      const cpunatData = await RamNat.findOne({ ramid: id });
      const ret = { data: allData, vendor: vendorData, nat: cpunatData };
      res.json(ret);
    } else {
      const allData = await RamList.findOne({ _id: id });
      const vendorData = await RamVendorList.find({ ramid: id });
      const cpunatData = await RamNat.findOne({ ramid: id });
      const ret = { data: allData, vendor: vendorData, nat: cpunatData };
      res.json(ret);
    }
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

operRouter.get("/api/allsdata", async (req, res) => {
  try {
    const filterstring = req.query.filter;
    const curpage = req.query.curpage;
    let allData, count;

    if (filterstring) {
      const regex = new RegExp(filterstring, "i");
      allData = await StorageList.find({ name: { $regex: regex } }).limit(36);
      // allData = await CPUList.find({ name: { $regex: regex } }).limit(36);
      count = await StorageList.find({
        name: { $regex: regex }
      }).countDocuments({});
    } else {
      allData = await StorageList.find({}).limit(36);
      count = await StorageList.countDocuments({});
    }
    if (curpage) {
      const regex = new RegExp(filterstring, "i");
      const skip = (curpage - 1) * 36;
      allData = await StorageList.find({ name: { $regex: regex } })
        .skip(skip) // Skip the calculated number of records
        .limit(36);
      count = await StorageList.find({ name: { $regex: regex } }).countDocuments(
        {}
      );
    }

    const ret = { data: allData, count: count };

    res.json(ret);
  } catch (error) {
    console.error("Error fetching all data from MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

operRouter.get("/api/sspec", async (req, res) => {
  try {
    const id = req.query.id;
    if (id) {
      const allData = await StorageList.findOne({ _id: id });
      const vendorData = await StorageVendorList.find({ storageid: id });
      const cpunatData = await StorageNat.findOne({ storageid: id });
      const ret = { data: allData, vendor: vendorData, nat: cpunatData };
      res.json(ret);
    } else {
      const allData = await StorageList.findOne({ _id: id });
      const vendorData = await StorageVendorList.find({ storageid: id });
      const cpunatData = await StorageNat.findOne({ storageid: id });
      const ret = { data: allData, vendor: vendorData, nat: cpunatData };
      res.json(ret);
    }
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

operRouter.get("/api/allcasedata", async (req, res) => {
  try {
    const filterstring = req.query.filter;
    const curpage = req.query.curpage;
    let allData, count;

    if (filterstring) {
      const regex = new RegExp(filterstring, "i");
      allData = await CaseList.find({ name: { $regex: regex } }).limit(36);
      // allData = await CPUList.find({ name: { $regex: regex } }).limit(36);
      count = await CaseList.find({ name: { $regex: regex } }).countDocuments(
        {}
      );
    } else {
      allData = await CaseList.find({}).limit(36);
      count = await CaseList.countDocuments({});
    }
    if (curpage) {
      const regex = new RegExp(filterstring, "i");
      const skip = (curpage - 1) * 36;
      allData = await CaseList.find({ name: { $regex: regex } })
        .skip(skip) // Skip the calculated number of records
        .limit(36);
      count = await CaseList.find({ name: { $regex: regex } }).countDocuments(
        {}
      );
    }
    const ret = { data: allData, count: count };

    res.json(ret);
  } catch (error) {
    console.error("Error fetching all data from MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

operRouter.get("/api/casespec", async (req, res) => {
  try {
    const id = req.query.id;
    if (id) {
      const allData = await CaseList.findOne({ _id: id });
      const vendorData = await CaseVendorList.find({ caseid: id });
      const cpunatData = await CaseNat.findOne({ caseid: id });
      const ret = { data: allData, vendor: vendorData, nat: cpunatData };
      res.json(ret);
    } else {
      const allData = await CaseList.findOne({ _id: id });
      const vendorData = await CaseVendorList.find({ caseid: id });
      const cpunatData = await CaseNat.findOne({ caseid: id });
      const ret = { data: allData, vendor: vendorData, nat: cpunatData };
      res.json(ret);
    }
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

operRouter.get("/api/allgpudata", async (req, res) => {
  try {
    const filterstring = req.query.filter;
    const curpage = req.query.curpage;
    let allData, count;

    if (filterstring) {
      const regex = new RegExp(filterstring, "i");
      allData = await GPUList.find({ name: { $regex: regex } }).limit(36);
      // allData = await CPUList.find({ name: { $regex: regex } }).limit(36);
      count = await GPUList.find({ name: { $regex: regex } }).countDocuments(
        {}
      );
    } else {
      allData = await GPUList.find({}).limit(36);
      count = await GPUList.countDocuments({});
    }
    if (curpage) {
      const regex = new RegExp(filterstring, "i");
      const skip = (curpage - 1) * 36;
      allData = await GPUList.find({ name: { $regex: regex } })
        .skip(skip) // Skip the calculated number of records
        .limit(36);
      count = await GPUList.find({ name: { $regex: regex } }).countDocuments(
        {}
      );
    }

    const ret = { data: allData, count: count };

    res.json(ret);
  } catch (error) {
    console.error("Error fetching all data from MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

operRouter.get("/api/gpuspec", async (req, res) => {
  try {
    const id = req.query.id;
    if (id) {
      const allData = await GPUList.findOne({ _id: id });
      const vendorData = await GPUVendorList.find({ gpuid: id });
      const cpunatData = await GPUNat.findOne({ gpuid: id });
      const ret = { data: allData, vendor: vendorData, nat: cpunatData };
      res.json(ret);
    } else {
      const allData = await GPUList.findOne({ _id: id });
      const vendorData = await GPUVendorList.find({ gpuid: id });
      const cpunatData = await GPUNat.findOne({ gpuid: id });
      const ret = { data: allData, vendor: vendorData, nat: cpunatData };
      res.json(ret);
    }
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default operRouter;
