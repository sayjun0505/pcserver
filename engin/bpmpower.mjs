import fetch from "node-fetch";
import { dbConfig } from "../db/pcbuilderdb.mjs";
import CPUVendor from "../model/cpuvendor.js";
import CPUInfo from "../model/cpuinfo.js";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import express from "express";

const app = express();
const server = http.createServer(app);
const pagecount = 28;
let total = 0;
const url_base = "https://www.bpm-power.com/api/v2/getProductsByDepartment";
let arr = [];

const insertDB = async (arr, formattedDateTime) => {
  try {
    await mongoose.connect(dbConfig.db);
    for (const product of arr) {
      let existingProduct = await CPUInfo.findOne({
        MPN: product.producerCode
      });
      if (existingProduct) {
        const cpuid = existingProduct._id;
        let existcpuinfo = await CPUVendor.findOne({
          cpuid: cpuid,
          vendorname: "bmp"
        });
        if (existcpuinfo) {
          await CPUVendor.updateOne(
            { cpuid: cpuid },
            {
              price: parseFloat(product.price.trim().replace("€","").replace(",",".")),
              date: formattedDateTime,
              prev: existcpuinfo.price
            }
          );
        } else {
          await CPUVendor.create({
            cpuid: cpuid,
            vendorname: "bmp",
            price: parseFloat(product.price.trim().replace("€","").replace(",",".")),
            date: formattedDateTime,
            prev: 0.0
          });
        }
      } else {
        const newProduct = await CPUInfo.create({
          name: product.name,
          MPN: product.MPN,
          CoreCount: product.cores,
          CoreClock: product.freq,
          CoreFamily: product.processfamily,
          Socket: product.sockets,
          imgurl: product.imgURL,
          IncludesCooler: product.cooler
        });
        await CPUVendor.create({
          cpuid: newProduct._id,
          vendorname: "bpm",
          price: parseFloat(product.price.trim().replace("€","").replace(",",".")),
          date: formattedDateTime,
          prev: 0.0
        });
      }
    }
    //send socket broadcast
    console.log(
      `${arr.length} products inserted into the cpuvendor collection`
    );
  } catch (error) {
    console.error(error);
  } finally {
    // mongoose.connection.close();
  }
};
const fetchData = async (url, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out");
    } else {
      throw error;
    }
  } finally {
    clearTimeout(timeoutId);
  }
};
const bpmpowerData = async (io) => {
  try {
    let currentDate = new Date();
    const year = currentDate.getFullYear();
    let month = String(currentDate.getMonth() + 1).padStart(2, "0");
    let day = String(currentDate.getDate()).padStart(2, "0");
    let hours = String(currentDate.getHours()).padStart(2, "0");
    let minutes = String(currentDate.getMinutes()).padStart(2, "0");
    let seconds = String(currentDate.getSeconds()).padStart(2, "0");
    let formattedDateTime = `${year}/${month}/${day} - ${hours}:${minutes}:${seconds}`;

    while (true) {
      const url = `${url_base}?limit=${pagecount}&offset=${total}&template=it&idDepartment=214&orderBy=1&sortBy=0`;
      const data = await fetchData(url);
      const products = data.products || [];
      total += products.length;
      arr.push(...products);
      if (products.length < pagecount) {
        insertDB(arr, formattedDateTime).then((res) => {
          io.emit("pcbuilder_bpm", formattedDateTime);
        });
        break;
      }
    }
    console.log(`Bpmpower ${arr.length} items at ${formattedDateTime}`);
  } catch (error) {
    console.error(error);
  }
};
export { bpmpowerData };
