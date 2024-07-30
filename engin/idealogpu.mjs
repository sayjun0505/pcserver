import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import { dbConfig } from "../db/pcbuilderdb.mjs";
import GPUList from "../model/gpulist.js";
import GPUVendorList from "../model/gpuvendorlist.js";
import GPUNat from "../model/gpunat.js";
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
        const alt = await vendorinfo.getAttribute("alt");

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
          gpuid: mid,
          displayname: nameContent,
          payment: paymentContent,
          vendorimgurl: subimgurl,
          price: prcContent,
          alink: getlink(alt),
          directlink: detailHref
        };
        await GPUVendorList.create(item);
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
  // console.log("changedurl in a tag:",imgurl,nameval);
  let x = {
    name: nameval,
    details: detail,
    price: price,
    link: url,
    productid: productid,
    imgurl: imgurl
  };
  let existingProduct = await GPUList.findOne({
    productid: x.productid
  });
  let mid = "";
  if (existingProduct) {
    mid = existingProduct._id;
    await GPUList.updateOne(  
      { _id: mid }, // Query to find the document  
      { $set: { price: x.price } } // Update operation  
    ); 
  } else {
    let createdProduct = await GPUList.create({
      name: x.name,
      productid: x.productid,
      imgurl: x.imgurl,
      detail: x.details,
      link: x.link,
      price: x.price
    });
    mid = createdProduct._id;
  }
  await GPUVendorList.deleteMany({ gpuid: mid });
  await saveToDatabase(drivers, mid, url);
  inn++;
}
const getlink = (str) => {
  if (str.toLowerCase().includes("0815"))return "https://www.0815.at/Smartphone-IT/Komponenten/Grafikkarten";    
  if (str.toLowerCase().includes("1fodiscount"))return "https://www.1fodiscount.com/f7-carte-graphique/";
  if (str.toLowerCase().includes("25n"))return "https://25n.de/Hardware/Grafikkarten/";
  if (str.toLowerCase().includes("alternate"))return "https://www.alternate.fr/Cartes-graphiques";
  if (str.toLowerCase().includes("amazon"))return "https://www.amazon.it/s?i=computers&bbn=460080031&rh=n%3A425916031%2Cn%3A460080031%2Cn%3A17492754031%2Cn%3A460090031&dc&qid=1722126800&rnid=17492754031&ref=sr_nr_n_8&ds=v1%3AlhyHzpN4YMZNyhvnBCbYmLONL8DT7KgYNayER44foYw";    
  if (str.toLowerCase().includes("awd"))return "https://www.awd-it.co.uk/components/graphics-cards.html";
  if (str.toLowerCase().includes("barax"))return "https://www.barax.de/_hardware/komponenten/grafikkarten/";  
  if (str.toLowerCase().includes("bpm"))return "https://www.bpm-power.com/it/online/componenti-pc/schede-video";   
  if (str.toLowerCase().includes("cdiscount"))return "https://www.cdiscount.com/informatique/cartes-graphiques/l-10767.html#_his_";
  if (str.toLowerCase().includes("computeruniverse"))return "https://www.computeruniverse.net/de/c/hardware-komponenten/kuhlung-cooling";
  if(str.toLowerCase().includes("coolmod"))return "https://www.coolmod.com/tarjetas-graficas/";
  if (str.toLowerCase().includes("cyberport"))return "https://www.cyberport.at/pc-und-zubehoer/komponenten/grafikkarten.html";
  if (str.toLowerCase().includes("ebay"))return "https://www.ebay.it/b/Schede-video-e-grafiche-per-prodotti-informatici/27386/bn_16546728";
  if (str.toLowerCase().includes("eprice"))return "https://www.eprice.it/pr/scheda-video";  
  if (str.toLowerCase().includes("esus"))return "https://www.esus-it.it/ita_n_CPU-GPU-115.html";
  if (str.toLowerCase().includes("eweki"))return "https://www.eweki.it/informatica/componenti-assemblaggio.html?_=1722133509875&cat=347";
  if (str.toLowerCase().includes("galaxus"))return "https://www.galaxus.de/en/s1/producttype/graphics-card-106";
  if (str.toLowerCase().includes("geopc"))return "https://geopc.it/componenti-hardware-informatica/schede-video-nvidia-radeon-amd-geforce";
  if (str.toLowerCase().includes("goldenprice"))return "https://www.goldenprice.it/informatica/componenti-assemblaggio/schede-video";
  if (str.toLowerCase().includes("kovendor"))return "https://kovendor.co.uk/search?q=gpu&options%5Bprefix%5D=last&filter.v.price.gte=&filter.v.price.lte=&filter.p.product_type=Graphics+Cards&sort_by=relevance";
  if (str.toLowerCase().includes("ldc"))return "https://www.ldc.it/144-schede-video-e-grafiche";
  if (str.toLowerCase().includes("notebooksbilliger"))return "https://www.notebooksbilliger.de/pc+hardware/grafikkarten";
  if (str.toLowerCase().includes("nullprozentshop"))return "https://www.nullprozentshop.de/pc-hardware/gigabyte/";
  if (str.toLowerCase().includes("pc componentes"))return "https://www.pccomponentes.it/processori";
  if (str.toLowerCase().includes("pixmart"))return "https://www.pixmart.it/categoria-prodotto/componenti-pc/?swoof=1&product_cat=schede-video&really_curr_tax=151-product_cat";
  if (str.toLowerCase().includes("proshop"))return "https://www.proshop.at/Grafikkarte";
  if (str.toLowerCase().includes("ollo"))return "https://www.ollo.it/schede-video/c_198";
  if (str.toLowerCase().includes("onbuy"))return "https://www.onbuy.com/gb/graphics-cards~c8572/";
  if (str.toLowerCase().includes("quzo"))return "https://www.quzo.co.uk/products/graphics-cards/";
 
  if (str.toLowerCase().includes("redcomputer"))return "https://www.yeppon.it/c/videogames/componenti-gaming/schede-grafiche-gaming";
  if (str.toLowerCase().includes("redgaming"))return "https://redgaming.it/9-schede-video";
  if (str.toLowerCase().includes("reichelt"))
    return "https://www.reichelt.com/it/it/asrock-b650e-taichi-lite-am5--asr-90mxbmg0-p370362.html?utm_source=psuma&utm_medium=idealo.it&PROVID=2846";
  if (str.toLowerCase().includes("senetic"))return "https://www.senetic.es/product/100-100000063WOF";
  if (str.toLowerCase().includes("sferaufficio"))return "https://www.sferaufficio.com/categorie/schede-video";
  if (str.toLowerCase().includes("siimsrl")) return "https://www.siimsrl.it/schede-video.1.7.248.sp.uw?fd=1"; 
  if (str.toLowerCase().includes("smartteck"))return "https://www.smartteck.co.uk/pc-components/graphics-cards-i-o";
  if (str.toLowerCase().includes("speedler"))return "https://www.speedler.es/componentes-hardware/componentes/tarjetas-graficas";
  if (str.toLowerCase().includes("syswork")) return "https://syswork.store/it/cpu";
  if (str.toLowerCase().includes("topgamingpc"))return "https://www.topgamingpc.it/categoria-prodotto/prodotti-it/schede-video/?v=cd32106bcb6d";
  if (str.toLowerCase().includes("techinn")) return "https://www.tradeinn.com/techinn/it/componenti-schede-grafiche/15980/s";
  if (str.toLowerCase().includes("technextday")) return "https://technextday.co.uk/product-category/pc-components/graphics-cards/";
  if (str.toLowerCase().includes("trippodo"))return "https://www.trippodo.com/it/491-schede-video";
  if (str.toLowerCase().includes("voelkner"))return "https://www.voelkner.de/categories/13140_13217_13616/Computer-Buero/PC-Komponenten/Grafikkarten.html?filter_cbeef3905458e7917901a59e2c6bc15e%5Bf%5D=Grafik-Prozessor+%2F+Marke&filter_cbeef3905458e7917901a59e2c6bc15e%5Bv%5D%5B%5D=0%7Cor%7CAMD&filter_cbeef3905458e7917901a59e2c6bc15e%5Bv%5D%5B%5D=0%7Cor%7CIntel&filter_cbeef3905458e7917901a59e2c6bc15e%5Bv%5D%5B%5D=0%7Cor%7CMicrosoft&filter_cbeef3905458e7917901a59e2c6bc15e%5Bv%5D%5B%5D=0%7Cor%7CNVIDIA&filter_90a93fbb6110f89425b9808f8d5bd318%5Bf%5D=showInCategory&filter_90a93fbb6110f89425b9808f8d5bd318%5Bv%5D%5B%5D=0%7Cor%7Ctrue&version=5&viewport=desktop&cPath=13140_13217_13616";
  if (str.toLowerCase().includes("xfilesaversa"))return "https://www.xfilesaversa.it/it/informatica/componenti/";
  if (str.toLowerCase().includes("yeppon"))return "https://www.yeppon.it/c/videogames/componenti-gaming/schede-grafiche-gaming";
  return "https://www.amazon.it/s?i=computers&bbn=460080031&rh=n%3A425916031%2Cn%3A460080031%2Cn%3A17492754031%2Cn%3A460090031&dc&qid=1722126800&rnid=17492754031&ref=sr_nr_n_8&ds=v1%3AlhyHzpN4YMZNyhvnBCbYmLONL8DT7KgYNayER44foYw";
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
    await GPUNat.deleteMany({ gpuid: mid });
    await GPUNat.create({
      gpuid: mid,
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
  // console.log("changedurl in form tag:",currentUrl,nameVal);
  let x = {
    name: nameVal,
    details: details,
    price: val,
    link: currentUrl,
    productid: id,
    imgurl: imgurl
  };
  let existingProduct = await GPUList.findOne({
    productid: x.productid
  });
  let mid = "";
  if (existingProduct) {
    mid = existingProduct._id;
    await GPUList.updateOne(  
      { _id: mid }, // Query to find the document  
      { $set: { price: x.price } } // Update operation  
    ); 
  } else {
    let createdProduct = await GPUList.create({
      name: x.name,
      productid: x.productid,
      imgurl: x.imgurl,
      detail: x.details,
      link: x.link,
      price: x.price
    });
    mid = createdProduct._id;
  }
  await GPUVendorList.deleteMany({ gpuid: mid });
  await saveToDatabase(drivers, mid, currentUrl);
  handledform = current + 1;
  inn++;
}

async function fetchGPU() {
  let arr = [];
  let pages = 10;
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
    const url = `https://www.idealo.it/cat/16073I16-${
      count * pages
    }/schede-video.html`;
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
      console.log("Number of price elements found ", priceElements.length,"in page ",pages);
      for (const element of priceElements) {
        let href = "";
        const linkElements = await element.findElements(By.tagName("a"));
        const formElements = await element.findElements(By.tagName("form"));
        if (linkElements.length > 0) {
          const linkElement = linkElements[0];
          const imgElements = await parentElement.findElement(
            By.className("sr-resultItemTile__image_ivkex")
          );
          const imgurl = await imgElements.getAttribute("src");
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
  const csvFilePath = "outputgpu.csv";
  // fs.writeFileSync(csvFilePath, csvData);
  console.log("All data were just processed");
}
export { fetchGPU };
