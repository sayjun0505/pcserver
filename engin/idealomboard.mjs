import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import { dbConfig } from "../db/pcbuilderdb.mjs";
import MboardList from "../model/mboardlist.js";
import MboardVendorList from "../model/mboardvendorlist.js";
import MboardNat from "../model/mboardnat.js";
import mongoose from "mongoose";
import fs from "fs";


const chromeOptions = new chrome.Options();
chromeOptions.addArguments("--disable-gpu");
chromeOptions.addArguments("--disable-images");
let handledform = 0;
let arr = [];
let inn = 0;
const delay = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const timeout = 20000;
async function getdatafromLink(countrywebshop, mid, link) {
  try {
    await countrywebshop.get(link);
    const timeout = 10000;
    const listinfo = await countrywebshop.wait(
      until.elementsLocated(
        By.className("product-offers-items-soop-4576-fallback")
      ),
      timeout
    );

    let count = 0;
    for (const info of listinfo) {
      try {
        const nameinfo = await info.findElement(
          By.className("productOffers-listItemTitleWrapper")
        );
        const nameContent = await nameinfo.getText();

        const paymentinfo = await info.findElement(
          By.className("productOffers-listItemOfferShippingDetailsRight")
        );
        const paymentContent = await paymentinfo.getAttribute("outerHTML");

        const detailinfo = await info.findElement(
          By.className("productOffers-listItemTitle")
        );

        const prcinfo = await info.findElement(
          By.className("productOffers-listItemOfferPrice")
        );
        const prcContent = await prcinfo.getText();

        const vendorinfo = await info.findElement(
          By.className("productOffers-listItemOfferShopV2LogoImage")
        );
        const subimgurl = await vendorinfo.getAttribute("src");
        const alt=await vendorinfo.getAttribute("alt");

        // let shadowHost = null;
        // const startTime = new Date().getTime();
        // while (new Date().getTime() - startTime < timeout) {
        //   try {
        //     shadowHost = await countrywebshop.findElement(By.id("usercentrics-cmp-ui"));
        //     await countrywebshop.executeScript(
        //       `
        //           const shadowRoot = arguments[0].shadowRoot; 
        //           const acceptButton = shadowRoot.querySelector('button#accept');
        //           acceptButton.click();
        //       `,
        //       shadowHost
        //     );
        //     break;
        //   } catch (error) {
        //     await countrywebshop.sleep(1000);
        //   }
        // }        
        // await detailinfo.click();          
        // const handles = await countrywebshop.getAllWindowHandles();  
        // await countrywebshop.switchTo().window(handles[1]); // Switch to the new tab  
        // const newTabURL = await countrywebshop.getCurrentUrl();  
        // await countrywebshop.close();  
        // await countrywebshop.switchTo().window(handles[0]);  
        const detailHref =
          "https://www.idealo.it" + (await detailinfo.getAttribute("href"));
        let item = {
          mboardid: mid,
          displayname: nameContent,
          payment: paymentContent,
          vendorimgurl: subimgurl,
          price: prcContent,
          alink: getlink(alt),
          directlink: detailHref
        };
        await MboardVendorList.create(item);
        count++;
        if (count >= 3) {
          break;
        }
      } catch (err) {
        console.error("Error processing element:", err);
      }
    }
  } catch (err) {
    // console.error("Error accessing the webpage:", err);
  } finally {
    // await countrywebshop.quit();
  }
}
async function handleA(
  drivers,
  url,
  nameval,
  detail,
  price,
  productid,
  imgurl
) {
  await drivers.get(url);
  // const shadowHost = await drivers.findElement(By.id("usercentrics-cmp-ui"));
  // await drivers.executeScript(
  //   `
  //       const shadowRoot = arguments[0].shadowRoot;
  //       const acceptButton = shadowRoot.querySelector('button#accept');
  //       acceptButton.click();
  //   `,
  //   shadowHost
  // );

  let x = {
    name: nameval,
    details: detail,
    price: price,
    link: url,
    productid: productid,
    imgurl: imgurl
  };
  let existingProduct = await MboardList.findOne({
    productid: x.productid
  });
  let mid = "";
  if (existingProduct) {
    mid = existingProduct._id;
    await MboardList.updateOne(  
      { _id: mid }, // Query to find the document  
      { $set: { price: x.price } } // Update operation  
    ); 
  } else {
    let createdProduct = await MboardList.create({
      name: x.name,
      productid: x.productid,
      imgurl: x.imgurl,
      detail: x.details,
      link: x.link,
      price: x.price
    });
    mid = createdProduct._id;
  }
  await MboardVendorList.deleteMany({ mboardid: mid });
  // const nationality = await drivers.findElement(By.id("i18nPrices"));
  // const ulElement = await nationality.findElement(By.tagName("ul"));
  // const htmlString = await ulElement.getAttribute("outerHTML");
  await saveToDatabase(drivers, mid, url);
  inn++;
}
// const getlink=(str)=>{
//   if(str.toLowerCase().includes("alternate"))return  "https://www.alternate.fr/Processeurs";
//   if(str.toLowerCase().includes("amazon"))return "https://www.amazon.it/dp/B0CFXZDLZD/?smid=A2NKETR112XW8D&tag=idealoit-mp-21&linkCode=asn&creative=6742&camp=1638&creativeASIN=B0CFXZDLZD&ascsubtag=2024-07-21_34a35559cdc77205700c21c4d9e6ead84b547193ceb106da190e6bec3034fdc4&th=1&psc=1";
//   if(str.toLowerCase().includes("bpm"))return  "https://www.bpm-power.com/it/online/componenti-pc/schede-madri";
//   if(str.toLowerCase().includes("computeruniverse"))return  "https://www.computeruniverse.net/de/c/hardware-komponenten/kuhlung-cooling";
//   if(str.toLowerCase().includes("cyberport"))return  "https://www.cyberport.at/pc-und-zubehoer/komponenten/mainboards.html";
//   if(str.toLowerCase().includes("ebay"))return  "https://www.ebay.it/itm/196115008578?var=0&mkevt=1&mkcid=1&mkrid=724-53478-19255-0&toolid=20006&campid=5337770569&customid=swBckVxgPQDe_7eiTtwCvg";
//   if(str.toLowerCase().includes("eprice"))return  "https://www.eprice.it/catalogo/informatica/componenti-pc";
//   if(str.toLowerCase().includes("esus"))return  "https://www.esus-it.it/ita_n_CPU-GPU-115.html";
//   if(str.toLowerCase().includes("eweki"))return  "https://www.eweki.it/informatica/componenti-assemblaggio/processori-cpu.html";
//   if(str.toLowerCase().includes("galaxus"))return  "https://www.galaxus.de/en/s1/producttype/processors-83";
//   if(str.toLowerCase().includes("geopc"))return  "https://geopc.it/componenti-hardware-informatica/cpu-processori-intel-amd";
//   if(str.toLowerCase().includes("goldenprice"))return  "https://www.goldenprice.it/informatica/componenti-assemblaggio/cpu";
//   if(str.toLowerCase().includes("ldc"))return  "https://www.ldc.it/141-processori-e-cpu";
//   if(str.toLowerCase().includes("notebooksbilliger"))return  "https://www.notebooksbilliger.de/pc+hardware/prozessoren+pc+hardware";
//   if(str.toLowerCase().includes("nullprozentshop"))return  "https://www.nullprozentshop.de/pc-hardware/amd/";
//   if(str.toLowerCase().includes("pc componentes"))return  "https://www.pccomponentes.it/processori";
//   if(str.toLowerCase().includes("pixmart"))return  "https://www.pixmart.it/prodotto/asrock-b650e-taichi-lite-amd-b650-socket-am5-atx/?utm_source=Idealo.it&amp;utm_campaign=Feed%20per%20Idealo&amp;utm_medium=cpc&amp;utm_term=53220";
//   if(str.toLowerCase().includes("proshop"))return  "https://www.proshop.at/CPU";
//   if(str.toLowerCase().includes("ollo"))return  "https://www.ollo.it/schede-madri/c_229";
//   if(str.toLowerCase().includes("onbuy"))return  "https://www.onbuy.com/gb/computer-processors~c8568/";
//   if(str.toLowerCase().includes("redcomputer"))return  "https://www.yeppon.it/c/videogames/componenti-gaming/processori-cpu-gaming";
//   if(str.toLowerCase().includes("redgaming"))return  "https://redgaming.it/schede-madri/16784-scheda-madre-asrock-b650m-pro-rs-amd-am5-ddr5-micro-atx-argento-4710483943096.html";
//   if(str.toLowerCase().includes("reichelt"))return  "https://www.reichelt.com/it/it/asrock-b650e-taichi-lite-am5--asr-90mxbmg0-p370362.html?utm_source=psuma&utm_medium=idealo.it&PROVID=2846";
//   if(str.toLowerCase().includes("senetic"))return  "https://www.senetic.es/product/100-100000063WOF";
//   if(str.toLowerCase().includes("sferaufficio"))return  "https://www.sferaufficio.com/articolo/asrock-b650e-taichi-lite-amd-b650-presa-di-corrente-am5-atx/L3507361353";
//   if(str.toLowerCase().includes("siimsrl"))return  "https://www.siimsrl.it/cpu.1.7.252.sp.uw?fd=1";
//   if(str.toLowerCase().includes("speedler"))return  "https://www.speedler.es/componentes-hardware/componentes/procesadores";
//   if(str.toLowerCase().includes("syswork"))return  "https://syswork.store/it/cpu";
//   if(str.toLowerCase().includes("topgamingpc"))return  "https://www.topgamingpc.it/categoria-prodotto/prodotti-it/cpu/?v=cd32106bcb6d";
//   if(str.toLowerCase().includes("techinn"))return  "https://www.tradeinn.com/techinn/it/componenti-processori/15978/s";
//   if(str.toLowerCase().includes("trippodo"))return  "https://www.trippodo.com/it/b650/201859-asrock-b650e-taichi-lite-amd-b650-presa-di-corrente-am5-atx-4710483943508.html";
//   if(str.toLowerCase().includes("xfilesaversa"))return  "https://www.xfilesaversa.it/it/informatica/componentistica/processori/";
//   if(str.toLowerCase().includes("yeppon"))return  "https://www.yeppon.it/c/videogames/componenti-gaming/processori-cpu-gaming";
//   return  "https://www.amazon.it/dp/B0CFXZDLZD/?smid=A2NKETR112XW8D&tag=idealoit-mp-21&linkCode=asn&creative=6742&camp=1638&creativeASIN=B0CFXZDLZD&ascsubtag=2024-07-21_34a35559cdc77205700c21c4d9e6ead84b547193ceb106da190e6bec3034fdc4&th=1&psc=1";

// }
const getlink = (str) => {
  if (str.toLowerCase().includes("0815"))return "https://www.0815.at/Smartphone-IT/Komponenten/Mainboards";    
  if (str.toLowerCase().includes("1fodiscount"))return "https://www.1fodiscount.com/f2-carte-mere/";
  if (str.toLowerCase().includes("25n"))return "https://25n.de/Hardware/Mainboard/";
  if (str.toLowerCase().includes("alternate"))return "https://www.alternate.fr/Cartes-m%C3%A8res";
  if (str.toLowerCase().includes("alza"))return "https://www.alza.at/motherboard/18842832.htm";
  if (str.toLowerCase().includes("amazon"))return "https://www.amazon.it/b/?ie=UTF8&node=460120031&pf_rd_p=131d0934-f79f-42da-9af6-6072b56601ed&pf_rd_r=Z3Z3VA6EEZCCTFM7DEE9&pf_rd_s=pc-subnav-flyout-content-7&pf_rd_t=SubnavFlyout&ref_=sn_gfs_co_pc_460120031_4";    
  if (str.toLowerCase().includes("awd"))return "https://www.awd-it.co.uk/components/motherboards.html";
  if (str.toLowerCase().includes("barax"))return "https://www.barax.de/_hardware/komponenten/mainboards/";  
  if (str.toLowerCase().includes("bora"))return "https://www.bora-computer.de/pc-hardware/mainboards/";   
  if (str.toLowerCase().includes("bpm"))return "https://www.bpm-power.com/it/online/componenti-pc/schede-madri";   
  if (str.toLowerCase().includes("buykingston"))return "https://www.buykingston.co.uk/intel-socket-boards";   
  if (str.toLowerCase().includes("cartes"))return "https://www.darty.com/nav/recherche/motherboard.html";
  if (str.toLowerCase().includes("castroelectronica"))return "https://www.castroelectronica.pt/es/loja-virtual/motherboards-1";
  if (str.toLowerCase().includes("cdiscount"))return "https://www.cdiscount.com/informatique/cartes-meres/l-10765.html?#_his_";
  if (str.toLowerCase().includes("cclonline"))return "https://www.cclonline.com/pc-components/motherboards/";
  if (str.toLowerCase().includes("computeruniverse"))return "https://www.computeruniverse.net/de/search?query=motherboard";
  if(str.toLowerCase().includes("coolmod"))return "https://www.coolmod.com/componentes-pc-placas-base/";
  if (str.toLowerCase().includes("cnishop"))return "https://www.cnishop.com/ricerca?controller=search&s=motherboard";
  if (str.toLowerCase().includes("currys"))return "https://www.currys.co.uk/computing/components-and-upgrades/motherboards";
  if (str.toLowerCase().includes("cyberport"))return "https://www.cyberport.at/tools/search.html?query=motherboard&page=1";
  if (str.toLowerCase().includes("ebay"))return "https://www.ebay.it/b/Schede-madri-per-prodotti-informatici/1244/bn_16546726";
  if (str.toLowerCase().includes("eprice"))return "https://www.eprice.it/pr/scheda-madre";  
  // if (str.toLowerCase().includes("esus"))return "https://www.esus-it.it/ita_n_CPU-GPU-115.html";
  if (str.toLowerCase().includes("eweki"))return "https://www.eweki.it/informatica.html?_=1722173075298&cat=346";
  if (str.toLowerCase().includes("galaxus"))return "https://www.galaxus.de/en/s1/producttype/motherboards-65";
  // if (str.toLowerCase().includes("geopc"))return "https://geopc.it/storage-hdd-ssd-ram-ddr-nas/hard-disk-interni-personal-computer";
  if (str.toLowerCase().includes("goldenprice"))return "https://www.goldenprice.it/informatica/componenti-assemblaggio/schede-madri";
  if (str.toLowerCase().includes("laptopout"))return "https://www.laptopoutlet.co.uk/components/motherboards.html";
  if (str.toLowerCase().includes("kovendo"))return "https://kovendor.co.uk/search?q=motherboard&options%5Bprefix%5D=last";
  if (str.toLowerCase().includes("ldc"))return "https://www.ldc.it/143-schede-madri";
  if (str.toLowerCase().includes("next"))return "https://www.nexths.it/Products/getSkuFromLev/page/1/l0/Hardware%20Software/l1/Mainboard";
  if (str.toLowerCase().includes("notebooksbilliger"))return "https://www.notebooksbilliger.de/pc+hardware/mainboards+pc+hardware";
  if (str.toLowerCase().includes("nullprozentshop"))return "https://www.notebooksbilliger.de/pc+hardware/mainboards+pc+hardware";
  if (str.toLowerCase().includes("pc componentes"))return "https://www.pccomponentes.it/schede-madri";
  if (str.toLowerCase().includes("pixmart"))return "https://www.pixmart.it/categoria-prodotto/componenti-pc/schede-madri/";
  if (str.toLowerCase().includes("proshop"))return "https://www.proshop.at/Mainboard";
  if (str.toLowerCase().includes("ollo"))return "https://www.ollo.it/schede-madri/c_229";
  if (str.toLowerCase().includes("onbuy"))return "https://www.onbuy.com/gb/motherboards~c8569/";
  if (str.toLowerCase().includes("overclocker"))return "https://www.onbuy.com/gb/motherboards~c8569/";
  if (str.toLowerCase().includes("quzo"))return "https://www.quzo.co.uk/products/motherboards/";
  if (str.toLowerCase().includes("redcomputer"))return "https://www.yeppon.it/c/videogames/componenti-gaming/mainboard-gaming";
  if (str.toLowerCase().includes("redgaming"))return "https://redgaming.it/6-schede-madri";
  if (str.toLowerCase().includes("reichelt"))
    return "https://www.reichelt.com/it/it/schede-madri-c6123.html?&nbc=1";
  if (str.toLowerCase().includes("scan"))return "https://www.scan.co.uk/shop/computer-hardware/motherboards-amd/all";
  if (str.toLowerCase().includes("sferaufficio"))return "https://www.sferaufficio.com/?ricerca=motherboard";
  if (str.toLowerCase().includes("siimsrl")) return "https://www.siimsrl.it/schede-madri.1.7.270.sp.uw?fd=1"; 
  if (str.toLowerCase().includes("smartteck"))return "https://www.smartteck.co.uk/search/motherboard";
  if (str.toLowerCase().includes("speedler"))return "https://www.speedler.es/componentes-hardware/componentes/tarjetas-graficas";
  if (str.toLowerCase().includes("syswork")) return "https://syswork.store/it/katid='Informatica@Componenti%20PC@Schede%20madri'";
  if (str.toLowerCase().includes("topgamingpc"))return "https://www.topgamingpc.it/categoria-prodotto/prodotti-it/motherboards/?v=cd32106bcb6d";
  if (str.toLowerCase().includes("techinn")) return "https://www.tradeinn.com/techinn/it/componenti-schede-madri/15977/s";
  if (str.toLowerCase().includes("technextday")) return "https://technextday.co.uk/product-category/pc-components/motherboards/";
  if (str.toLowerCase().includes("trippodo"))return "https://www.trippodo.com/it/576-schede-madri";
  if (str.toLowerCase().includes("very"))return "https://www.very.co.uk/search/motherboard";
  if (str.toLowerCase().includes("xfilesaversa"))return "https://www.xfilesaversa.it/it/informatica/componentistica/motherboard/";
  if (str.toLowerCase().includes("yeppon"))return "https://www.yeppon.it/c/videogames/componenti-gaming/mainboard-gaming";
  return "https://www.amazon.it/b/?ie=UTF8&node=460120031&pf_rd_p=131d0934-f79f-42da-9af6-6072b56601ed&pf_rd_r=Z3Z3VA6EEZCCTFM7DEE9&pf_rd_s=pc-subnav-flyout-content-7&pf_rd_t=SubnavFlyout&ref_=sn_gfs_co_pc_460120031_4";
};
async function saveToDatabase(drivers, mid, url) {
  try {
    await mongoose.connect(dbConfig.db);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const hrefRegex = /href="([^"]*)"/g;
    let outerHTML = "";
    try {
      const nationality = await drivers.findElement(By.id("i18nPrices"));
      const ulElement = await nationality.findElement(By.tagName("ul"));
      outerHTML = await ulElement.getAttribute("outerHTML");
    } catch {}

    let match;
    // console.log("url:",url)
    await getdatafromLink(drivers, mid, url);
    while ((match = hrefRegex.exec(outerHTML)) !== null) {
      await getdatafromLink(drivers, mid, match[1]);
    }
    await MboardNat.deleteMany({ mboardid: mid });
    await MboardNat.create({
      mboardid: mid,
      html: outerHTML
    });
  } catch (error) {
    console.error(error);
  }
}
async function handleform(
  drivers,
  url,
  current,
  nameVal,
  details,
  val,
  id,
  imgurl
) {
  // console.log(nameVal);
  await drivers.get(url);
  await drivers.wait(
    until.elementsLocated(By.css(".sr-resultList_NAJkZ")),
    timeout
  );
  const parentElement = await drivers.findElement(
    By.css(".sr-resultList_NAJkZ")
  );
  await drivers.wait(until.elementsLocated(By.tagName("form")), timeout);
  const formElements = await parentElement.findElements(By.tagName("form"));
  const formElement = formElements[current];
  const button = await formElement.findElement(
    By.css('button[role="button"].sr-resultItemLink__button_k3jEE')
  );
  const actions = drivers.actions();
  await actions.move({ origin: button }).perform();
  await drivers.executeScript("arguments[0].click();", button);
  const currentUrl = await drivers.getCurrentUrl();
  // console.log("changedurl:",currentUrl,nameVal);
  let x = {
    name: nameVal,
    details: details,
    price: val,
    link: currentUrl,
    productid: id,
    imgurl: imgurl
  };
  let existingProduct = await MboardList.findOne({
    productid: x.productid
  });
  let mid = "";
  if (existingProduct) {
    mid = existingProduct._id;
    await MboardList.updateOne(  
      { _id: mid }, // Query to find the document  
      { $set: { price: x.price } } // Update operation  
    ); 
  } else {
    let createdProduct = await MboardList.create({
      name: x.name,
      productid: x.productid,
      imgurl: x.imgurl,
      detail: x.details,
      link: x.link,
      price: x.price
    });
    mid = createdProduct._id;
  }
  await MboardVendorList.deleteMany({ mboardid: mid });
  await saveToDatabase(drivers, mid, currentUrl);
  handledform = current + 1;
  inn++;
}

async function fetchMboard() {
  let arr = [];
  let pages = 0;
  let count = 15;
  while (true) {
    const detail_driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(chromeOptions)
      .build();
    const driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(chromeOptions)
      .build();
    inn = 0;
    const url = `https://www.idealo.it/cat/3018I16-${
      count * pages
    }/schede-madri.html`;
    try {
      await driver.get(url);
      let shadowHost = null;
      const startTime = new Date().getTime();
      while (new Date().getTime() - startTime < timeout) {
        try {
          shadowHost = await driver.findElement(By.id("usercentrics-cmp-ui"));
          await driver.executeScript(
            `
                  const shadowRoot = arguments[0].shadowRoot; 
                  const acceptButton = shadowRoot.querySelector('button#accept');
                  acceptButton.click();
              `,
            shadowHost
          );
          break;
        } catch (error) {
          await driver.sleep(1000);
        }
      }
      await driver.wait(
        until.elementsLocated(By.className("sr-resultList_NAJkZ")),
        timeout
      );
      const parentElement = await driver.findElement(
        By.css(".sr-resultList_NAJkZ")
      );

      const priceElements = await parentElement.findElements(
        By.className("sr-resultList__item_m6xdA")
      );
      let formindex = 0;
      // console.log("Number of price elements found ", priceElements.length,"in page ",pages);
      for (const element of priceElements) {
        let href = "";
        const linkElements = await element.findElements(By.tagName("a"));
        const formElements = await element.findElements(By.tagName("form"));
        if (linkElements.length > 0) {
          const imgElements = await parentElement.findElement(
            By.className("sr-resultItemTile__image_ivkex")
          );
          const imgurl = await imgElements.getAttribute("src");
          const linkElement = linkElements[0];
          href = await linkElement.getAttribute("href");
          const spanElement = await element.findElement(
            By.css("span[data-wishlist-heart]")
          );
          const dataAttr = await spanElement.getAttribute(
            "data-wishlist-heart"
          );
          const data = JSON.parse(dataAttr);
          const id = data.id;
          const textContent = await element.getText();
          let a = textContent.split("\n");
          let details = a[1];
          const regex = /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))/;
          const prc = a[a.length - 1].match(regex);
          const val = prc ? prc[0] : "Price not found";
         
          let nameVal = a[0];
          // console.log(href, nameVal, details, val, id, imgurl);
          await handleA(detail_driver, href, nameVal, details, val, id, imgurl);
        } else if (formElements.length > 0) {
          if (formindex == handledform) {
            const imgElements = await parentElement.findElement(
              By.className("sr-resultItemTile__image_ivkex")
            );
            const imgurl = await imgElements.getAttribute("src");
            const spanElement = await element.findElement(
              By.css("span[data-wishlist-heart]")
            );

            const dataAttr = await spanElement.getAttribute(
              "data-wishlist-heart"
            );
            const data = JSON.parse(dataAttr);
            const id = data.id;
            const textContent = await element.getText();
            let a = textContent.split("\n");
            let details = a[1];
            const regex = /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))/;
            let nameVal = a[0];
            if (a[0].includes("%")) {
              const nameElements = await parentElement.findElement(
                By.className("sr-productSummary__title_f5flP")
              );
              nameVal = await nameElements.getText();
            }
            let divElement = await element.findElement(
              By.css(
                'div.sr-productSummary__title_f5flP[data-testid="productSummary__title"]'
              )
            );

            // Extract the text from the div tag
            let nametext = await divElement.getText();
            const prc = a[a.length - 1].match(regex);
            const val = prc ? prc[0] : "Price not found";
            await handleform(
              detail_driver,
              url,
              handledform,
              nametext,
              details,
              val,
              id,
              imgurl
            );
            // await detail_driver.executeScript("document.body.innerHTML = '';");
            formindex++;
          } else {
            formindex++;
            continue;
          }
        } else {
          // Handle cases where neither <a> nor <form> tags are found
          console.log("Element does not contain <a> or <form> tags");
        }
        // await new Promise(resolve => setTimeout(resolve, 1000));
      }
      console.log(url, inn);
      arr.push({ url: url, inn: inn });
      if (priceElements.length < 36) break;
    } catch (err) {
      console.error("An error occurred in iteration", pages, ":", err);
    } finally {
      if (driver) {
        await driver.manage().deleteAllCookies();
        await driver.quit();
      }
      if (detail_driver) {
        await detail_driver.manage().deleteAllCookies();
        await detail_driver.quit(); // Close the detail_driver at the end of each iteration
      }
    }
    pages++;
    handledform=0;
  }
  const csvRows = arr.map((row) => `${row.url}, ${row.inn}\n`).join("");
  const csvHeader = "url, counts\n";
  const csvData = csvHeader + csvRows;
  const csvFilePath = "outputmboard.csv";
  // fs.writeFileSync(csvFilePath, csvData);
  console.log("All data were just processed");
}
export { fetchMboard };
