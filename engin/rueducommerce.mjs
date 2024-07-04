import axios from 'axios';
import cheerio from 'cheerio';
import CPUVendor from "../model/cpuvendor.js"
import CPUInfo from "../model/cpuinfo.js"
import mongoose from 'mongoose';
import { dbConfig } from '../db/pcbuilderdb.mjs';
let arr = [];

const extractModelAndClock = (inputStrings) => {
  let inputString = inputStrings.toLowerCase()
  let model = "";
  let clock = "";
  if (inputString.includes("ryzen")) {
    // Extracting model and clock for Ryzen™ 9 7900X - 4.7/5.6 GHz format
    let match = inputString.match(/ryzen™ 9\s+(\d+X)\s*-\s*(\d+\.\d+)\s*\/\s*\d+\.\d+\s*ghz/i);
    if (match) {
      model = "7900X";
      clock = match[2];
    }
  }
  else {
    // Extracting model and clock for Intel Core i5-xxx (X.X GHz / X.X GHz) format
    let match1 = inputString.match(/i\d+-\w+\s*\((\d+\.\d+)\ GHz\s*\/\s*(\d+\.\d+)/);
    if (match1) {
      model = inputString.match(/i\d+-\w+/)[0];
      clock = match1[1];
    } else {
      // Extracting model and clock for Intel Core i5-xxx - X.X/X.X GHz + XXXXX format
      let match2 = inputString.match(/i\d+-\w+\s*-\s*(\d+\.\d+)\/\d+\.\d+\ gHz/);
      if (match2) {
        model = inputString.match(/i\d+-\w+/)[0];
        clock = match2[1];
      }
    }
  }
  return { model, clock };
}
const extractProcessorInfo = (inputStrings) => {
  let inputString = inputStrings.toLowerCase()
  let cores = "";
  let threads = "";
  let socket = "";
  let matchA = "";
  let matchB = "";
  let matchC = "";
  if (inputString.includes("cores")) {
    matchA = inputString.match(/(\d+)\s*cores?\/(\d+)\s*threads? - socket (intel|amd)?\s*(\w+)/i);
    matchB = inputString.match(/(\d+)\s*cores?\/(\d+)\s*threads? - socket (intel|amd)?\s*(\w+)/i);
    matchC = inputString.match(/(\d+)\s*cores?\/(\d+)\s*threads? - socket (intel|amd)?\s*(\w+)/i);
  }
  else {
    matchA = inputString.match(/(\d+)\s*cœurs?\/(\d+)\s*threads? - socket (intel|amd)?\s*(\w+)/i);
    matchB = inputString.match(/(\d+)\s*cœurs?\/(\d+)\s*threads? - socket (intel|amd)?\s*(\w+)/i);
    matchC = inputString.match(/(\d+)\s*cœurs?\/(\d+)\s*threads? - socket (intel|amd)?\s*(\w+)/i);
  }


  if (matchA && matchA.length === 5) {
    cores = matchA[1];
    threads = matchA[2];
    socket = matchA[3] ? `${matchA[3]} ${matchA[4]}` : matchA[4];
  } else if (matchB && matchB.length === 4) {
    cores = matchB[1];
    threads = matchB[2];
    socket = matchB[3] ? `${matchB[3]} ${matchB[4]}` : matchB[4];
  } else if (matchC && matchC.length === 4) {
    cores = matchC[1];
    threads = matchC[2];
    socket = matchC[3] ? `${matchC[3]} ${matchC[4]}` : matchC[4];
  }
  socket = socket.replace(/\b(amd |intel |socket )/gi, '');

  return { cores, threads, socket };
};
let i = 0;
const parseProductDetails = async (url) => {
  const response = await axios.get(url);
  // console.log(response.data)
  const html = response.data;
  const $ = cheerio.load(html);
  const listingInfinite = $('#listing-infinite').find('article').length; // Get the HTML content of the element with id 'listing-infinite'
  $('#listing-infinite').find('article').each((index, element) => {
    const nameVal = $(element).find('.item__title').text().split('\n');
    // const cores=extractCoreThreads(nameVal)
    const priceVal = $(element).find('.item__price--new-box').text().trim().replace(/[\s]/g, "");;
    let tmp = nameVal[5].trim();
    const descVal = $(element).find(".item__caracs a").text().trim();
    const result = extractModelAndClock(tmp)
    let cts = { cores: "", threads: "", socket: "" }
    if (descVal) {
      cts = extractProcessorInfo(descVal)
    }
    if (cts.socket && cts.socket.toLowerCase().includes("lga")) {

    }
    let x = {
      title: nameVal[5].trim().replace("Processeur", "").replace("INTEL -  ", "").replace("processeur ", ""),
      Manufacturer: nameVal[2].trim(),
      price: priceVal,
      provider: "rueducommerce",
      CoreCount: cts.cores,
      Threads: cts.threads,
      Model: result.model,
      CoreClock: result.clock,
      Socket: cts.socket
    }
    let nonEmptyCount = Object.values(x).filter(val => val !== "").length;
    if (x.title.includes("Ryzen")) {
      if (x.Model == "") {//Ryzen™ 9 7900X - 4.7/5.6 Ghz
        const regex = /Ryzen™.*?\s(?:Threadripper™\s)?(\d+[X]?)\s+-\s+(\d[\d.,]+)\s*\/.*?(\d[\d.,]+)\s*GHz/;
        // Extract model and clock speeds using the regex pattern
        const match = nameVal[5].trim().match(regex);

        if (match) {
          const model = match[1]; // Extract the model (5700 in this case)
          let baseClock = x.CoreClock
          if (baseClock == "") baseClock = match[2]; // Extract the base clock speed (3.7 in this case)
          x.Model = model;
          x.CoreClock = baseClock;
        }
      }
      if (x.Model == "") {//Ryzen 7 5700 (3.7 / 4.6 GHz)
        const regex = /\((.*?)\//;
        // Extract model and clock speeds using the regex pattern
        const match = nameVal[5].trim().match(regex);

        if (match) {
          x.CoreClock = match[1];
        }
        const startIndex = nameVal[5].trim().indexOf("Ryzen") + "Ryzen".length;
        const endIndex = nameVal[5].trim().indexOf("(");

        // Extract the substring between "Ryzen" and "("
        x.Model = nameVal[5].trim().substring(startIndex, endIndex).trim().split(" ")[1];
      }
    }
    else if (x.title.includes("Intel")) {
      if (x.Model == "") {///Intel® Core™ i5-11400 - 2,6/4,4 GHz
        const regex = /Intel® Core™\s([^\s]+)\s-\s([\d,\.]+)\/?([\d,\.]+)?/;
        // Extract model and clock speeds using the regex pattern
        const match = x.title.match(regex);

        if (match) {
          const model = match[1]; // Extract the model (5700 in this case)
          let baseClock = x.CoreClock
          if (baseClock == "") baseClock = match[2].replace(",", "."); // Extract the base clock speed (3.7 in this case)
          x.Model = model;
          x.CoreClock = baseClock;
        }
      }
      if (x.Model == "") {
        const regex = /Intel® Core™\s([^\s]+)\s([\d.]+)GHZ/;
        // Extract model and clock speeds using the regex pattern
        const match = x.title.match(regex);

        if (match) {
          const model = match[1]; // Extract the model (5700 in this case)
          let baseClock = x.CoreClock
          if (baseClock == "") baseClock = match[2].replace(",", "."); // Extract the base clock speed (3.7 in this case)
          x.Model = model;
          x.CoreClock = baseClock;
        }

      }
      if (x.Model == "") {
        const regex = /Intel Core i\d+\s?-?\s?(\d+-?\d*[TF]?)\s+(\d+(\.\d+)?)\s*GHz/;
        // Extract model and clock speeds using the regex pattern
        const match = x.title.match(regex);

        if (match) {
          const model = match[1]; // Extract the model (5700 in this case)
          let baseClock = x.CoreClock
          if (baseClock == "") baseClock = match[2].replace(",", "."); // Extract the base clock speed (3.7 in this case)
          x.Model = model;
          x.CoreClock = baseClock;
        }
      }

      // if(x.title=="Intel® Core™ i7-12700F 2.10GHZ")console.log(x)

      if (x.Model == "") { i++; }
    }
    else if (x.title.includes("Core")) {
      if (x.Model == "") {///Core i3-10105 - 3,7/4,4 GHz
        const regex = /Core.*?\s([^ ]+)\s+-\s+([0-9,\.]+)\/.*?/;
        // Extract model and clock speeds using the regex pattern
        const match = nameVal[5].trim().match(regex);

        if (match) {
          const model = match[1]; // Extract the model (5700 in this case)
          let baseClock = x.CoreClock
          if (baseClock == "") baseClock = match[2].replace(",", "."); // Extract the base clock speed (3.7 in this case)
          x.Model = model;
          x.CoreClock = baseClock;
        }
      }
    }

    // console.log(x)


    if (nonEmptyCount >= 5) {
      fillMPN(x);
    }
    arr.push(x)
  });
  return listingInfinite;
};
const fillMPN = async (x) => {
  await mongoose.connect(dbConfig.db);

  let existing = await CPUInfo.findOne({ Manufacturer: x.Manufacturer.toUpperCase(), CoreCount: x.CoreCount, Threads: x.Threads, Clock: x.CoreClock, Model: x.Model });
  if (existing) {
    let existingProduct = await CPUInfo.findOne({ MPN: existing.MPN });
    if (existingProduct) {
      // If product name exists in CPUInfo collection, get id and insert into CPUVendor with vendorname as "a"
      const cpuid = existingProduct._id;
      let existcpuinfo = await CPUVendor.findOne({ cpuid: cpuid, vendorname: 'rueducommerce' });
      if (existcpuinfo) {
        //update price
        await CPUVendor.updateOne({ cpuid: cpuid }, { price: product.price  });
      }
      else {
        await CPUVendor.create({ cpuid: cpuid, vendorname: 'rueducommerce', price: product.price + '€' });
      }
    } 
  }
  // if (!x.title.includes("Ryzen")) console.log(x)
}
const rueducommerceData = async () => {
  try {
    let i = 1;
    let total = 0;
    arr = [];
    while (true) {
      const newUrl = `https://www.rueducommerce.fr/rayon/composants-16/processeur-246?page=${i}`;
      let newcount = await parseProductDetails(newUrl);
      total += newcount;
      if (newcount < 60) break;
      else i += 1
    }
    console.log(`Total Rueducommerce items: ${total}`);
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
};

export { rueducommerceData };