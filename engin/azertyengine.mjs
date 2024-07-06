import axios from "axios";
import cheerio from "cheerio";
import CPUVendor from "../model/cpuvendor.js";
import CPUInfo from "../model/cpuinfo.js";
import mongoose from "mongoose";
import { dbConfig } from "../db/pcbuilderdb.mjs";

let arr = [];
const insertDB = async (formattedDateTime) => {
  try {
    await mongoose.connect(dbConfig.db);    
    // Iterate over each product in the arr and insert into the database
    for (const product of arr) {
      let existingProduct = await CPUInfo.findOne({ MPN: product.MPN });

      if (existingProduct) {
        // If product name exists in CPUInfo collection, get id and insert into CPUVendor with vendorname as "a"
        const cpuid = existingProduct._id;
        let existcpuinfo = await CPUVendor.findOne({
          cpuid: cpuid,
          vendorname: "azerty"
        });
        if (existcpuinfo) {
          //update price
          await CPUVendor.updateOne(
            { cpuid: cpuid },
            { price: product.price, date: formattedDateTime }
          );
        } else {
          await CPUVendor.create({
            cpuid: cpuid,
            vendorname: "azerty",
            price: product.price,
            date: formattedDateTime
          });
        }
      } else {
        // If product name doesn't exist in CPUInfo collection, insert name and get new id, then insert into CPUVendor with vendorname as "a"
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
          vendorname: "azerty",
          price: product.price,
          date: formattedDateTime
        });
      }
    }

    console.log(
      `Azerty ${arr.length} items at ${formattedDateTime}`
    );
  } catch (error) {
    console.error(error);
  } finally {
    // mongoose.connection.close();
  }
};
const parseProductDetails = async (url) => {
  const response = await axios.get(url);
  const html = response.data;
  const $ = cheerio.load(html);
  const liCount = $(".products ul li").length;

  $(".products ul li").each(async (index, element) => {
    const nameVal = $(element).find(".product-item-link").text().trim();
    const descVal = $(element).find(".product-item-description").text().trim();
    const priceVal = $(element)
      .find(".price-wrapper.price-including-tax .price")
      .text()
      .trim();
    let hrefValue = $(element).find("a").attr("href");
    let imgURL = $(element).find("img").attr("src");
    const response = await axios.get(hrefValue);
    const innerHtml = response.data;
    const $inner = cheerio.load(innerHtml);
    let MPN = "";
    let processfamily = "";
    let prcmodel = "";
    let freq = "";
    let sockets = "";
    let cores = "";
    let cooler = "";
    $inner("#product-highlighted-attribute-specs-table tr").each(
      (index, element) => {
        const thText = $inner(element).find("th").text();
        const tdText = $inner(element).find("td").text();
        if (thText.includes("Fabrikantcode")) {
          const fabrikantcodeValue = tdText.trim();
          MPN = fabrikantcodeValue;
        }
        if (thText.includes("Processorfamilie")) {
          const processfamilys = tdText.trim();
          processfamily = processfamilys;
        }
        if (thText.includes("Processormodel")) {
          const fabrikantcodeValues = tdText.trim();
          prcmodel = fabrikantcodeValues;
        }
        if (thText.includes("Basisfrequentie processor")) {
          const fabrikantcodeValuew = tdText.trim();
          freq = fabrikantcodeValuew;
        }
        if (thText.includes("Aantal processorkernen")) {
          const fabrikantcodeValueff = tdText.trim();
          cores = fabrikantcodeValueff;
        }
        if (thText.includes("Processor socket")) {
          const fabrikantcodeValuef = tdText.trim();
          sockets = fabrikantcodeValuef;
        }
        if (thText.includes("Inclusief koeler")) {
          const fabrikantcodeValuedd = tdText.trim();
          cooler = fabrikantcodeValuedd;
        }
        if (thText.includes("Fabrikantcode")) {
          const fabrikantcodeValue = tdText.trim();
          MPN = fabrikantcodeValue;
        }
      }
    );
    let x = {
      name: nameVal,
      price: parseFloat(
        priceVal.trim().replace("€", "").replace(",", ".")
      ).toFixed(2),
      MPN: MPN,
      freq: freq,
      sockets: sockets,
      cores: cores,
      cooler: cooler,
      prcmodel: prcmodel,
      processfamily: processfamily,
      imgURL: imgURL
    };
    console.log(x)
    arr.push(x);
  });
  return liCount;
};
const azertyData = async () => {
  try {
    let currentDate = new Date();
    const year = currentDate.getFullYear();
    let month = String(currentDate.getMonth() + 1).padStart(2, "0");
    let day = String(currentDate.getDate()).padStart(2, "0");
    let hours = String(currentDate.getHours()).padStart(2, "0");
    let minutes = String(currentDate.getMinutes()).padStart(2, "0");
    let seconds = String(currentDate.getSeconds()).padStart(2, "0");
    let formattedDateTime = `${year}/${month}/${day} - ${hours}:${minutes}:${seconds}`;
    arr = [];
    let i=1;
    while (true) {
      const newUrl = `https://azerty.nl/componenten/cpu?p=${i}`;
      let newcount = await parseProductDetails(newUrl);
      if (newcount < 24) {
        await insertDB(formattedDateTime);
        break;
      }
      i++;
    }
    console.log(`Azerty ${arr.length} items at ${formattedDateTime}`);
  } catch (error) {
    console.error("An error occurred:", error.message);
  }
};
export { azertyData };
