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
    for (const product of arr) {
      let existingProduct = await CPUInfo.findOne({ MPN: product.MPN });

      if (existingProduct) {        
        let s="";
        if(existingProduct.MPN=="100-100000910WOF")s=existingProduct._id;
        const cpuid = existingProduct._id;
        let existcpuinfo = await CPUVendor.findOne({
          cpuid: cpuid,
          vendorname: "azerty"
        });
        if (existcpuinfo) {
          await CPUVendor.updateOne(
            { cpuid: cpuid },
            { price: product.price, date: formattedDateTime,prev: existcpuinfo.price }
          );
        } else {
          if(product.MPN=="100-100000910WOF")console.log(product.price)
          await CPUVendor.create({
            cpuid: cpuid,
            vendorname: "azerty",
            price: product.price,
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
    let EAN = "";
    let processfamily = "";
    let prcmodel = "";//px-2.5 py-2 md:pl-5 wrap-anywhere
    let freq = "";
    let sockets = "";
    let cores = "";
    let cooler = "";
    $inner("#product-attribute-specs-table tr").each(
      (index, element) => {
        const thText = $inner(element).find("th").text();
        const tdText = $inner(element).find("td").text();
        if (thText.includes("Fabrikantcode")) {
          const fabrikantcodeValue = tdText.trim();
          MPN = fabrikantcodeValue;
        }
        ///EAN
        // if (thText.includes("EAN")) {
        //   const fabrikantcodeValue = tdText.trim();
        //   EAN = fabrikantcodeValue;
        // }


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
        priceVal.trim().replace("€", "")
      ),
      MPN: MPN,
      // EAN:EAN,
      freq: freq,
      sockets: sockets,
      cores: cores,
      cooler: cooler,
      prcmodel: prcmodel,
      processfamily: processfamily,
      imgURL: imgURL
    };
    // console.log(x)
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
