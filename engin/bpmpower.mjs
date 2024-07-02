import fetch from "node-fetch";
import { dbConfig } from "../db/pcbuilderdb.mjs";
import CPUVendor from "../model/cpuvendor.js";
import CPUInfo from "../model/cpuinfo.js";
import mongoose from "mongoose";
import axios from "axios";
import cheerio from "cheerio";

const pagecount = 28;
let total = 0;
const url_base = "https://www.bpm-power.com/api/v2/getProductsByDepartment";

const insertDB = async (arr) => {
  try {
    await mongoose.connect(dbConfig.db);

    for (const product of arr) {
      let existingProduct = await CPUInfo.findOne({ MPN: product.MPN });
      let cpuid;

      if (existingProduct) {
        existingProduct.Manufacturer = product.producer;
        existingProduct.imgurl = product.imageUrlSmall;
        existingProduct.ManufacturerURL = product.producerUrl;
        await existingProduct.save();
        cpuid = existingProduct._id;
      } else {
        const newProduct = await CPUInfo.create({
          name: product.name,
          Manufacturer: product.producer,
          imgurl: product.imageUrlSmall,
          ManufacturerURL: product.producerUrl,
          MPN:product.MPN
        });
        cpuid = newProduct._id;
      }

      // let existingVendorProduct = await CPUVendor.findOne({ cpuid });

      let existingVendorProduct = await CPUVendor.findOne({
        cpuid: cpuid,
        vendorname: "bmp"
      });

      if (existingVendorProduct) {
        existingVendorProduct.price = product.price + "€";
        await existingVendorProduct.save();
      } else {
        await CPUVendor.create({
          cpuid,
          vendorname: "bmp",
          price: product.price + "€"
        });
      }
    }

    console.log(
      `${arr.length} products inserted into the cpuvendor collection`
    );
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.connection.close();
  }
};
let arr = [];
const bpmpowerData = async () => {
  let test = "";
  while (true) {
    const url = `${url_base}?limit=${pagecount}&offset=${total}&template=it&idDepartment=214&orderBy=1&sortBy=0`;
    const response = await fetch(url);
    // console.log(url)
    const data = await response.json();
    const products = data.products || [];
    total += products.length;
    arr = [...arr, ...products];
    let final=[]
    if (products.length < pagecount) {
        await Promise.all(arr.map(async (product) => {
            const detailinfo = `https://www.bpm-power.com/api/v2/getProductInfo?idProduct=${product.id}&template=it`;
            const response = await fetch(detailinfo);
            const data = await response.json();
            let manufactureID = data.product.producerCode;
            const item = {
                ...product,
                name: product.name,
                MPN: manufactureID,
                price: data.product.price
            };
            return item;
        })).then(final => {
            insertDB(final);
        });
        break;
    }
  }
  console.log(`Total Bpmpower items: ${arr.length}`);
};

export { bpmpowerData };
