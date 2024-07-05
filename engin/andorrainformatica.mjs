import axios from 'axios';
import mongoose from 'mongoose';
import { dbConfig } from '../db/pcbuilderdb.mjs';
import CPUVendor from '../model/cpuvendor.js';
import CPUInfo from '../model/cpuinfo.js';

let arr = [];

const parseProductDetails = async (url) => {
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

const insertDB = async () => {
  try {
    await mongoose.connect(dbConfig.db);

    // Iterate over each product in the arr and insert into the database
    for (const product of arr) {
      let existingProduct = await CPUInfo.findOne({ MPN: product.MPN });

      if (existingProduct) {
        const cpuid = existingProduct._id;
        let existcpuinfo = await CPUVendor.findOne({ cpuid: cpuid, vendorname: 'andorr' });
        if (existcpuinfo) {
          await CPUVendor.updateOne({ cpuid: cpuid }, { price: product.price.replace(/\s/g, "") });
        } else {
          await CPUVendor.create({ cpuid: cpuid, vendorname: 'andorr', price: product.price.replace(/\s/g, "") });
        }
      } else {
        const newProduct = await CPUInfo.create({ name: product.name, MPN: product.MPN, imgurl: product.imgurl, detail: product.url });
        await CPUVendor.create({ cpuid: newProduct._id, vendorname: 'azerty', price: product.price.replace(/\s/g, "") });
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
    while (true) {
      const newUrl = `https://www.andorrainformatica.com/54-procesadores?page=${i}`;
      let newcount = await parseProductDetails(newUrl);
      if (newcount == 0) break;
      else i += 1;
    }

    console.log(`Total Andorrainformatica items: ${arr.length}`);
    await insertDB(); // Ensure to await the insertDB function

  } catch (error) {
    console.error('An error occurred:', error.message);
  } finally {
    // mongoose.connection.close(); // Close the connection after all operations are done
  }
};

export { andorrainformaticaData };