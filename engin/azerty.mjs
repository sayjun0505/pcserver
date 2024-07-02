import axios from 'axios';
import cheerio from 'cheerio';
import CPUVendor  from "../model/cpuvendor.js"
import CPUInfo  from "../model/cpuinfo.js"
import mongoose from'mongoose';
import {dbConfig} from '../db/pcbuilderdb.mjs';

let arr=[];
const insertDB = async () => {
  try {
      await mongoose.connect(dbConfig.db);

      // Iterate over each product in the arr and insert into the database
      for (const product of arr) {
          let existingProduct = await CPUInfo.findOne({ MPN: product.MPN });

          if (existingProduct) {
              // If product name exists in CPUInfo collection, get id and insert into CPUVendor with vendorname as "a"
              const cpuid = existingProduct._id;
              let existcpuinfo=await CPUVendor.findOne({ cpuid: cpuid,vendorname: 'azerty' });
              if(existcpuinfo){
                //update price
                await CPUVendor.updateOne({ cpuid: cpuid }, { price: product.price + '€' });
              }
              else {
                await CPUVendor.create({ cpuid: cpuid, vendorname: 'azerty', price: product.price+'€' });
              }
          } else {
              // If product name doesn't exist in CPUInfo collection, insert name and get new id, then insert into CPUVendor with vendorname as "a"
              const newProduct = await CPUInfo.create({ name: product.name ,MPN:product.MPN,CoreCount:product.cores,CoreClock:product.freq,CoreFamily:product.processfamily,Socket:product.sockets,imgurl:product.imgURL,IncludesCooler:product.cooler});
              await CPUVendor.create({ cpuid: newProduct._id, vendorname: 'azerty', price: product.price+'€' });
          }
      }

      console.log(`${arr.length} products inserted into the cpuvendor collection`);

  } catch (error) {
      console.error(error);
  } finally {

      mongoose.connection.close();
  }
};


// const formatCPUName = (str) => {
//   // const str1 =
//   //   "Intel Core i7 10700K - Processor 3.8 GHz (5,1 GHz) - 8-cores - 16 threads";
//   // const str2 =
//   //   "Intel Core i7-12700K - Processor3.6 GHz (5.0 GHz) - 12 core 8P+4E - 20 threads";
//   // const str3 =
//   //   "Intel Core i7-12700KF - Processor 3.6 GHz (5.0 GHz) - 12 core 8P+4E - 20 threads";
//   // const str4 =
//   //   "Intel Core i7 10700K - 3.8 GHz 8-kern - 16 threads - 16 MB cache";
//   // const str5 =
//   //   "Intel Core i5 11600K - 6-kern12 threads - 12 MB cache - LGA1200 Socket";
//   // const str6 = "Intel Core i5 7500T PC1151 6MB Cache 2,7GHz tray"
//   // console.log(formatCPUName(str1));
//   // console.log(formatCPUName(str2));
//   // console.log(formatCPUName(str3));
//   // console.log(formatCPUName(str4));
//   // console.log(formatCPUName(str5));
//   const parts = str.split(" - ");
//   // Extract relevant information
//   if (parts.length > 1) {
//     const processorName = parts[0];
//     const coresAndThreads = parts[parts.length - 1];
//     let baseClock = "";
//     let boostClock = "";

//     if (parts !== null) {
//       const matches = parts[1].match(/\d+\.\d+ GHz/g);
//       if (matches) {
//         [baseClock, boostClock] = matches;
//       }
//     } else {
//       baseClock = "";
//       boostClock = "";
//     }
//     //////////////////////threads////////////////
//     const lastIndext = str.lastIndexOf("-");
//     const containthreadt = str.substring(lastIndext + 1).trim();
//     const endIndext = containthreadt.indexOf(" threads");
//     let threads = "";
//     threads = containthreadt.substring(0, endIndext).trim();
//     if (str.includes("kern"))
//       threads = str.substring(
//         str.lastIndexOf("kern") + 4,
//         str.lastIndexOf(" threads")
//       );
//     ///////////////////////end threads/////////////////////////
//     //////////////////////core///////////////////////////
//     let lastIndexc = str.lastIndexOf("-");
//     let containthreadc = str.substring(0, lastIndexc + 1).trim();
//     let endIndexc = containthreadc.lastIndexOf("core");
//     let s = str.substring(0, endIndexc - 1);
//     let lastIndexcc = s.lastIndexOf("-");
//     let coreCounts = s.substring(lastIndexcc + 1);
//     if (coreCounts == "") {
//       coreCounts = str
//         .substring(str.lastIndexOf("GHz") + 3, str.lastIndexOf("kern"))
//         .replace(" ", "")
//         .replace("-", "");
//     }
//     /////////////////////end core//////////////////////////
//     const simplifiedName =
//       `${processorName} ${coreCounts}-Core ${threads} Threads ${baseClock} (${boostClock})`
//         .replace("  ", " ")
//         .replace("(undefined)", "")
//         .replace("()", "");
//     return simplifiedName;
//   } else {
//     return str;
//   }
// };
const parseProductDetails = async (url) => {
  const response = await axios.get(url);
  const html = response.data;
  const $ = cheerio.load(html);
  const liCount = $('.products ul li').length;
  
  $('.products ul li').each(async (index, element) => {
    const nameVal = $(element).find('.product-item-link').text().trim();
    const descVal = $(element).find('.product-item-description').text().trim();
    const priceVal = $(element).find('.price-wrapper.price-including-tax .price').text().trim();
    let hrefValue = $(element).find('a').attr('href');
    let imgURL = $(element).find('img').attr('src');
    const response = await axios.get(hrefValue);
    const innerHtml = response.data;
    const $inner = cheerio.load(innerHtml);
    let MPN="";
    let processfamily="";
    let prcmodel="";
    let freq="";
    let sockets="";
    let cores="";
    let cooler="";
    $inner('#product-highlighted-attribute-specs-table tr').each((index, element) => {
      const thText = $inner(element).find('th').text();
      const tdText = $inner(element).find('td').text();    
      if (thText.includes('Fabrikantcode')) {
        const fabrikantcodeValue = tdText.trim();
        MPN=fabrikantcodeValue;
      }
      if (thText.includes('Processorfamilie')) {
        const processfamilys = tdText.trim();
        processfamily=processfamilys;
      }
      if (thText.includes('Processormodel')) {
        const fabrikantcodeValues= tdText.trim();
        prcmodel=fabrikantcodeValues;
      }
      if (thText.includes('Basisfrequentie processor')) {
        const fabrikantcodeValuew = tdText.trim();
        freq=fabrikantcodeValuew;
      }
      if (thText.includes('Aantal processorkernen')) {
        const fabrikantcodeValueff = tdText.trim();
        cores=fabrikantcodeValueff;
      }
      if (thText.includes('Processor socket')) {
        const fabrikantcodeValuef = tdText.trim();
        sockets=fabrikantcodeValuef;
      }
      if (thText.includes('Inclusief koeler')) {
        const fabrikantcodeValuedd = tdText.trim();
        cooler=fabrikantcodeValuedd;
      }
      if (thText.includes('Fabrikantcode')) {
        const fabrikantcodeValue = tdText.trim();
        MPN=fabrikantcodeValue;
      }
    });

    let x = { name: nameVal, price: priceVal,MPN:MPN ,freq:freq,sockets:sockets,cores:cores,cooler:cooler,prcmodel:prcmodel,processfamily:processfamily,imgURL:imgURL};
    arr.push(x);
  });

  return liCount;
};
const azertyData = async () => {
  try {
    let i=1;
    let total=0;
    arr=[];
    while (true) {
      const newUrl = `https://azerty.nl/componenten/cpu?p=${i}`;
      let newcount=await parseProductDetails(newUrl);
      total+=newcount;
      if (newcount<24){
        insertDB();
        break;
      }
      else i += 1
    }
    console.log(`Total Azerty items: ${total}`);
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
};
export { azertyData };