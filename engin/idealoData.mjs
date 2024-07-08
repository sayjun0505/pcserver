import fetch from "node-fetch";
import { dbConfig } from "../db/pcbuilderdb.mjs";
import CPUVendor from "../model/cpuvendor.js";
import CPUInfo from "../model/cpuinfo.js";
import cheerio from "cheerio";
import mongoose from "mongoose";
import axios from "axios";
import fs  from'fs';
let pagecount = 15;
let page = 0;
let total = 0;
const url_base = "https://www.idealo.it/cat/3019I16-";
let arr = [];

// const insertDB = async (arr) => {
//   try {
//     // Connect to MongoDB
//     await mongoose.connect(dbConfig.db);

//     for (const product of arr) {
//       let existingProduct = await CPUInfo.findOne({ MPN: product.MPN });
//       let cpuid;

//       if (existingProduct) {
//         existingProduct.Manufacturer = product.producer;
//         existingProduct.imgurl = product.imageUrlSmall;
//         existingProduct.ManufacturerURL = product.producerUrl;
//         await existingProduct.save();
//         cpuid = existingProduct._id;
//       } else {
//         const newProduct = await CPUInfo.create({
//           name: product.name,
//           Manufacturer: product.producer,
//           imgurl: product.imageUrlSmall,
//           ManufacturerURL: product.producerUrl,
//           MPN: product.MPN
//         });
//         cpuid = newProduct._id;
//       }

//       let existingVendorProduct = await CPUVendor.findOne({
//         cpuid,
//         vendorname: "bmp"
//       });

//       if (existingVendorProduct) {
//         existingVendorProduct.price = product.price + "€";
//         await existingVendorProduct.save();
//       } else {
//         await CPUVendor.create({
//           cpuid,
//           vendorname: "bmp",
//           price: product.price + "€"
//         });
//       }
//     }

//     console.log(
//       `${arr.length} products inserted into the cpuvendor collection`
//     );
//   } catch (error) {
//     console.error(error);
//   } finally {
//     // Close the MongoDB connection
//     mongoose.connection.close();
//   }
// };

// const fetchData = async (url) => {
//   const response = await fetch(url);
//   return await response.json();
// };
const parseProductDetails = async (url) => {
  const response = await axios.get(url);
  const html = response.data;
  const $ = cheerio.load(html);
  const liCount = $(".sr-resultList_NAJkZ resultList--GRID a").length;
  console.log(liCount);
  return liCount;
};
const fetchData = async (url, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    // console.log(response.text())
    return await response.text();
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

const idealoData = async () => {
  try {
    // while (true) {
    const url = `${url_base}${page}/processori-cpu.html`;
    console.log(url);
    const html = await fetchData(url);
    // const $ = cheerio.load(html);
    // const liCount = $(".sr-resultList_NAJkZ resultList--GRID");
    // const liCount = $(".sr-resultList_NAJkZ resultList--GRID  .sr-resultList__item_m6xdA").length;
    fs.writeFile('output.txt', html, (err) => {
      if (err) {
        console.error('Error writing to output file:', err);
      } else {
        console.log('Text content has been written to output.txt');
      }
    });
    // console.log(html);

    // page+=pagecount;
    // const products = data.products || [];
    // total += products.length;
    // arr.push(...products);

    //   if (count < 36) {
    //     console.log(total)
    //     break;
    //   }
    // }

    // console.log(`Total Bpmpower items: ${arr.length}`);
  } catch (error) {
    console.error(error);
  }
};

export { idealoData };
