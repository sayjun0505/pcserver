import axios from 'axios';
import mongoose from 'mongoose';
import { dbConfig } from '../db/pcbuilderdb.mjs';
import CPUVendor from '../model/cpuvendor.js';
import CPUInfo from '../model/cpuinfo.js';

let arr = [];

const parseProductDetails = async (url,formattedDateTime) => {
  const response = await axios.get(url);
  const html = response.data.products;

  html.forEach((item) => {
    if (item.cover && item.cover.small !== undefined) {
      let p = { name: item.name, price: item.price, MPN: item.reference, url: item.url, imgurl: item.cover.small.url };
      arr.push(p);
    }
  });

  return html.length;
};

const insertDB = async (formattedDateTime) => {
  try {
    await mongoose.connect(dbConfig.db);       
    // Iterate over each product in the arr and insert into the database
    for (const product of arr) {
      let existingProduct = await CPUInfo.findOne({ MPN: product.MPN });

      if (existingProduct) {
        const cpuid = existingProduct._id;
        let existcpuinfo = await CPUVendor.findOne({ 
          cpuid: cpuid, 
          vendorname: 'andorr' 
        });
        if (existcpuinfo) {
          await CPUVendor.updateOne(
            { cpuid: cpuid }, 
            { 
              price: parseFloat(product.price.replace("€", "").replace(/,/g, '').toFixed(2)),date: formattedDateTime ,
              prev:existcpuinfo.price
            });
        } else {
          await CPUVendor.create({ 
            cpuid: cpuid, 
            vendorname: 'andorr', 
            price: parseFloat(product.price.replace("€", "").replace(/,/g, '').toFixed(2)) ,date: formattedDateTime,
            prev: 0.0
          });
        }
      } else {
        const newProduct = await CPUInfo.create({ 
          name: product.name, 
          MPN: product.MPN, 
          imgurl: product.imgurl, 
          detail: product.url 
        });
        await CPUVendor.create({ 
          cpuid: newProduct._id, 
          vendorname: 'andorr', 
          price: parseFloat(product.price.replace("€", "").replace(/,/g, '').toFixed(2)),date: formattedDateTime,
          prev: 0.0
        });
      }
    }

    console.log(`${arr.length} products inserted into the cpuvendor collection`);

  } catch (error) {
    console.error(error);
  } finally {
    // Do not close the connection here
  }
};

const andorrainformaticaData = async () => {
  try {
    let i = 1;
    arr = [];
    let currentDate = new Date();

    let year = currentDate.getFullYear();
    let month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so we add 1
    let day = String(currentDate.getDate()).padStart(2, '0');
    let hours = String(currentDate.getHours()).padStart(2, '0');
    let minutes = String(currentDate.getMinutes()).padStart(2, '0');
    let seconds = String(currentDate.getSeconds()).padStart(2, '0');
    let formattedDateTime = `${year}/${month}/${day} - ${hours}:${minutes}:${seconds}`;
    
    while (true) {
      const newUrl = `https://www.andorrainformatica.com/54-procesadores?page=${i}`;
      let newcount = await parseProductDetails(newUrl,formattedDateTime);
      if (newcount == 0) break;
      else i += 1;
    }

    console.log(`Andorrainformatica items: ${arr.length} at ${formattedDateTime}`);
    await insertDB(formattedDateTime); // Ensure to await the insertDB function

  } catch (error) {
    console.error('An error occurred:', error.message);
  } finally {
    // mongoose.connection.close(); // Close the connection after all operations are done
  }
};

export { andorrainformaticaData };