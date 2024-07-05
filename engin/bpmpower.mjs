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
    const currentDate = new Date();

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based, so we add 1
    const day = String(currentDate.getDate()).padStart(2, "0");
    const hours = String(currentDate.getHours()).padStart(2, "0");
    const minutes = String(currentDate.getMinutes()).padStart(2, "0");
    const seconds = String(currentDate.getSeconds()).padStart(2, "0");

    const formattedDateTime = `${year}/${month}/${day} - ${hours}:${minutes}:${seconds}`;

    // Connect to MongoDB
    await mongoose.connect(dbConfig.db);
    for (const product of arr) {
      let existingProduct = await CPUInfo.findOne({ MPN: product.producerCode });
      if (existingProduct) {
      //   // If product name exists in CPUInfo collection, get id and insert into CPUVendor with vendorname as "a"
        const cpuid = existingProduct._id;
        let existcpuinfo = await CPUVendor.findOne({
          cpuid: cpuid,
          vendorname: "bmp"
        });
        if (existcpuinfo) {
          // if(product.name.includes("Ryzen 5 7600X"))console.log(product.price,cpuid)
      //     //update price
          await CPUVendor.updateOne(
            { cpuid: cpuid },
            { price: product.price + "€", date: formattedDateTime ,prev:existcpuinfo.price}
          );
        } else {
          await CPUVendor.create({
            cpuid: cpuid,
            vendorname: "bmp",
            price: product.price + "€",
            date: formattedDateTime,
            prev:"0.0€"
          });
        }
      } else {
      //   // If product name doesn't exist in CPUInfo collection, insert name and get new id, then insert into CPUVendor with vendorname as "a"
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
          vendorname: "bmp",
          price: product.price + "€",
          date: formattedDateTime,
          prev:"0.0€"
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

const bpmpowerData = async () => {
  try {
    while (true) {
      const url = `${url_base}?limit=${pagecount}&offset=${total}&template=it&idDepartment=214&orderBy=1&sortBy=0`;
      const data = await fetchData(url);
      const products = data.products || [];
      total += products.length;
      arr.push(...products);

      if (products.length < pagecount) {
        // const finalData = await Promise.all(
        //   arr.map(async (product) => {
        //     // const detailInfoUrl = `https://www.bpm-power.com/api/v2/getProductInfo?idProduct=${product.id}&template=it`;
        //     // const detailData = await fetchData(detailInfoUrl);
        //     // const manufactureID = detailData.product.producerCode;
        //     const item = {
        //       ...product,
        //       name: product.name,
        //       MPN: product.producerCode,
        //       price: product.price
        //     };

        //     return item;
        //   })
        // );

        await insertDB(arr);
        break;
      }
    }

    console.log(`Total Bpmpower items: ${arr.length}`);
  } catch (error) {
    console.error(error);
  }
};

export { bpmpowerData };
