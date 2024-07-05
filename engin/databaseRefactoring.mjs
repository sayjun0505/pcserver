import CPUInfo from "../model/cpuinfo.js";
import CPUVendor from "../model/cpuvendor.js";
import mongoose from "mongoose";
import { dbConfig } from "../db/pcbuilderdb.mjs";
// import { findOne } from "../model/cpuvendor.js";

let arr = [];
const currentDate = new Date();

      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so we add 1
      const day = String(currentDate.getDate()).padStart(2, '0');
      const hours = String(currentDate.getHours()).padStart(2, '0');
      const minutes = String(currentDate.getMinutes()).padStart(2, '0');
      const seconds = String(currentDate.getSeconds()).padStart(2, '0');
      
      const formattedDateTime = `${year}/${month}/${day} - ${hours}:${minutes}:${seconds}`;

const databaseRefactoring = async () => {
  await mongoose.connect(dbConfig.db);
  let alll = await CPUVendor.find({});
  for (let product of alll) {
    product.date=formattedDateTime;
    product.prev="0.0"
    await product.save();
  }
  console.log("all done");
  ///////////////////Socket field//////////////////////////////////////////
  // let existingProduct = await CPUInfo.find({}, { id: 1, Socket: 1 });
  // for (let product of existingProduct) {
  //   const newSocketValue = product.Socket?.toLowerCase().includes('am4')? 'AM4' :product.Socket;
  //   product.Socket = newSocketValue;
  //   await product.save();
  // }

  // for (let product of existingProduct) {
  //   const newSocketValue = product.Socket?.toLowerCase().includes('am5')? 'AM5' :product.Socket;
  //   product.Socket = newSocketValue;
  //   await product.save();
  // }
  //  for (let product of existingProduct) {
  //   const newSocketValue = product.Socket?.replace(/\s/g, '').toLowerCase().includes('lga1700')? 'LGA1700' :product.Socket;
  //   product.Socket = newSocketValue;
  //   await product.save();
  // }
  // for (let product of existingProduct) {
  //   const newSocketValue = product.Socket?.replace(/\s/g, '').toLowerCase().includes('lga1200')? 'LGA1200' :product.Socket;
  //   product.Socket = newSocketValue;
  //   await product.save();
  // }
  // for (let product of existingProduct) {
  //   const newSocketValue = product.Socket?.replace(/\s/g, '').toLowerCase().includes('lga2066')? 'LGA2066' :product.Socket;
  //   product.Socket = newSocketValue;
  //   await product.save();
  // }
  // for (let product of existingProduct) {
  //   const newSocketValue = product.Socket?.replace(/\s/g, '').toLowerCase().includes('lga1151')? 'LGA1151' :product.Socket;
  //   product.Socket = newSocketValue;
  //   await product.save();
  // }
  // for (let product of existingProduct) {
  //   const newSocketValue = product.Socket?.replace(/\s/g, '').toLowerCase().includes('lga3647')? 'LGA3647' :product.Socket;
  //   product.Socket = newSocketValue;
  //   await product.save();
  // }
  // for (let product of existingProduct) {
  //   const cleanedSocket = product.Socket?.replace(/\s/g, '').toLowerCase();
  //   if(cleanedSocket?.includes('sp5')){
  //     const newSocketValue =  'SP5'
  //     console.log('New Socket Value:', newSocketValue,product.id);
  //     product.Socket = newSocketValue;
  //   }
  //   await product.save();
  // }
  // for (let product of existingProduct) {
  //   const cleanedSocket = product.Socket?.replace(/\s/g, '').toLowerCase();
  //   if(cleanedSocket?.includes('trx4')){
  //     const newSocketValue =  'TRX4'
  //     console.log('New Socket Value:', newSocketValue,product.id);
  //     product.Socket = newSocketValue;
  //   }
  //   await product.save();
  // }
  // for (let product of existingProduct) {
  //   const cleanedSocket = product.Socket?.replace(/\s/g, '').toLowerCase();
  //   if(cleanedSocket?.includes('sp3')){
  //     const newSocketValue =  'SP3'
  //     console.log('New Socket Value:', newSocketValue,product.id);
  //     product.Socket = newSocketValue;
  //   }
  //   await product.save();
  // }
  // for (let product of existingProduct) {
  //   const cleanedSocket = product.Socket?.replace(/\s/g, '').toLowerCase();
  //   if(cleanedSocket?.includes('am3')){
  //     const newSocketValue =  'AM3'
  //     console.log('New Socket Value:', newSocketValue,product.id);
  //     product.Socket = newSocketValue;
  //   }
  //   await product.save();
  // }
  // for (let product of existingProduct) {
  //   const cleanedSocket = product.Socket?.replace(/\s/g, '').toLowerCase();
  //   if(cleanedSocket?.includes('str5')){
  //     const newSocketValue =  'STR5'
  //     console.log('New Socket Value:', newSocketValue,product.id);
  //     product.Socket = newSocketValue;
  //   }
  //   await product.save();
  // }
  // for (let product of existingProduct) {
  //   const newSocketValue = product.Socket?.replace(/\s/g, '').toLowerCase().includes('lga1150')? 'LGA1150' :product.Socket;
  //   product.Socket = newSocketValue;
  //   await product.save();
  // }
  // for (let product of existingProduct) {
  //   const newSocketValue = product.Socket?.replace(/\s/g, '').toLowerCase().includes('lga2011')? 'LGA2011' :product.Socket;
  //   product.Socket = newSocketValue;
  //   await product.save();
  // }
  // for (let product of existingProduct) {
  //   const cleanedSocket = product.Socket?.replace(/\s/g, '').toLowerCase();
  //   if(cleanedSocket?.includes('swrx8')){
  //     const newSocketValue =  'SWRX8'
  //     console.log('New Socket Value:', newSocketValue,product.id);
  //     product.Socket = newSocketValue;
  //   }
  //   await product.save();
  // }
  //  for (let product of existingProduct) {
  //   const cleanedSocket = product.Socket?.replace(/\s/g, '').toLowerCase();
  //   if(cleanedSocket?.includes('tr4')){
  //     const newSocketValue =  'TR4'
  //     console.log('New Socket Value:', newSocketValue,product.id);
  //     product.Socket = newSocketValue;
  //   }
  //   await product.save();
  // }

  //   for (let product of existingProduct) {
  //     if((product.Socket?.includes("SP5")||product.Socket?.includes("LGA1700")||product.Socket?.includes("TR4")||product.Socket?.includes("AM5")||product.Socket?.includes("AM4")||product.Socket?.includes("SWRX8")||product.Socket?.includes("AM3")||product.Socket?.includes("LGA1200")||product.Socket?.includes("LGA2066")||product.Socket?.includes("LGA2011")||product.Socket?.includes("STR5")||product.Socket?.includes("LGA1150")||product.Socket?.includes("TRX4")||product.Socket?.includes("SP3")||product.Socket?.includes("LGA1151")||product.Socket?.includes("LGA3647"))){}
  //     else{
  //       if(product.Socket&&(product.Socket!=undefined)) console.log(product);
  //     }

  //   }
  // //668470e69e1088a3a639b483     668470d89e1088a3a639b40c
  //   { _id: new ObjectId('668470d89e1088a3a639b40c'), Socket: 'BGA 1440' }
  // { _id: new ObjectId('668470e69e1088a3a639b483'),  Socket: 'Socket FM1 uPGA'}
  /////////////////////////////////////////////////////Socket field end////////////////////////////////////////////////
  //////////////////name field////////////////////////
  // let all=await CPUInfo.find({})
  // for (let product of all) {
  //   product.name=product.name.replace(/^Cpu/g, "").trim();
  //   await product.save();
  // }
  // console.log("all done")
  //////////////////Manufacturer field////////////////////////
  // let all=await CPUInfo.find({})
  // for (let product of all) {
  //   product.Manufacturer=product.Manufacturer?.toLowerCase().includes("amd")?"AMD":product.Manufacturer;
  //   await product.save();
  // }
  // let all = await CPUInfo.find({});
  // for (let product of all) {
  //   if (product.Manufacturer != "AMD" && product.Manufacturer != "Intel")
  //     console.log(product.Manufacturer);
  // }
  // AQUACOMPUTER;
  // JONSBO;
  // Hp;
  // console.log("all done");
  // let all = await CPUInfo.find({ name: { $regex: "7 5700", $options: "i" } });//Intel Core i5-13500 - Processor
  // console.log(all)
};

export { databaseRefactoring };
