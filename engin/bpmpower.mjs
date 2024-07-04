import fetch from "node-fetch";
import { dbConfig } from "../db/pcbuilderdb.mjs";
import CPUVendor from "../model/cpuvendor.js";
import CPUInfo from "../model/cpuinfo.js";
import mongoose from "mongoose";
const pagecount = 28;
let total = 0;
const url_base = "https://www.bpm-power.com/api/v2/getProductsByDepartment";
let arr = [];

const insertDB = async (arr) => {
  try {
    // Connect to MongoDB
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
          MPN: product.MPN
        });
        cpuid = newProduct._id;
      }

      let existingVendorProduct = await CPUVendor.findOne({
        cpuid,
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
    // Close the MongoDB connection
    mongoose.connection.close();
  }
};

const fetchData = async (url) => {
  const response = await fetch(url);
  return await response.json();
};

const bpmpowerData = async () => {
  try {
    while (true) {
      const url = `${url_base}?limit=${pagecount}&offset=${total}&template=it&idDepartment=214&orderBy=1&sortBy=0`;
      const data = await fetchData(url);
      const products = data.products || [];
      total += products.length;
      arr.push(...products);

      if (products.length < pagecount) {
        const finalData = await Promise.all(
          arr.map(async (product) => {
            try {
              const detailInfoUrl = `https://www.bpm-power.com/api/v2/getProductInfo?idProduct=${product.id}&template=it`;
              const detailData = await fetchData(detailInfoUrl);
              const manufactureID = detailData.product.producerCode;
              const item = {
                ...product,
                name: product.name,
                MPN: manufactureID,
                price: detailData.product.price
              };
              return item;
            } catch (error) {
              console.error(
                `Error fetching data for product ID ${product.id}: ${error}`
              );
              return null;
            }
          })
        ).filter((item) => item !== null);

        await insertDB(finalData);
        break;
      }
    }

    console.log(`Total Bpmpower items: ${arr.length}`);
  } catch (error) {
    console.error(error);
  }
};

export { bpmpowerData };
