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
      let existingProduct = await CPUInfo.findOne({ name: product.name });
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
          ManufacturerURL: product.producerUrl
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
    if (products.length < pagecount) {
      arr.map(async (product) => {
        const detailinfo = `https://www.bpm-power.com/api/v2/getProductInfo?idProduct=${product.id}&template=it`;
        const response = await fetch(detailinfo);
        const data = await response.json();
        let core = "";
        let threads = "";
        let cur={}
        for (const item of data.product.datatableElements) {
          cur=item;
          if (item.title.trim().toLowerCase().includes("core/thread")) {
            var x = item.value.split("/");
            core = x[0];
            threads = x[1];
          } else {
            if (item.title.trim().toLowerCase().includes("processore")) {
              var x = item.value.split("/");
              if(x.length!==1){
                core = x[0].replace(" core");
                threads = x[1].replace(" thread");
              }             
            } 
            if (item.title.trim().toLowerCase().includes("thread")) {
                threads = item.value;
            }

            if (item.title.trim().toLowerCase().includes("core")) {
                core = item.value.replace(" Base","");
            }            
          }
          if (core !== "" && threads !== "") {
            break;
          }
        }
        let tempa=" "+core+'-Core '+threads+" Threads";
        let temp=tempa.replace(/\n/g, '');
        // let finishedname=product.name.replace(/Cpu /g, '').replace("undefined","").replace("Processore ").replace(/L3.*\]/g, '').replace(/B.*\]/g, '').replace(/\n/g, '').replace(/\s+$/, '')  +temp;
        let deltaname=product.name.replace(/Cpu /g, '').replace(/Box /g, '').replace(/Processore /g, '').replace(/Processor /g, '').replace(/\s*$$\s*.*?\s*$$\s*/g, '')
        let start=deltaname.substring(0,deltaname.toLowerCase().lastIndexOf("gh")).lastIndexOf(" ")
        let end=deltaname.substring(deltaname.toLowerCase().lastIndexOf("gh"),deltaname.length-1)

        
        let finishedname=deltaname +temp+"----"+deltaname.substring(start,end);
        console.log(finishedname);
        const modifiedName = {
          ...product,
          name: product.name.replace("Cpu ", "").replace("Cpu ", "")
        };
        return modifiedName;
      });
      // insertDB(filteredProducts);
      break;
    }
  }
  console.log(`Total Bpmpower items: ${arr.length}`);
  console.log(test);
};

export { bpmpowerData };
