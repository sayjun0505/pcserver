import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import { dbConfig } from "../db/pcbuilderdb.mjs";
import CPUList from "../model/cpulist.js";
import CPUVendorList from "../model/cpuvendorlist.js";
import CPUNat from "../model/cpunat.js";
import mongoose from "mongoose";
import fs from "fs";

const chromeOptions = new chrome.Options();
chromeOptions.addArguments("--disable-gpu");
chromeOptions.addArguments("--disable-images");
let handledform = 0;
let arr = [];
let inn = 0;
///a form test 75, form test 450
const delay = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const timeout = 20000;
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

  let existingProduct = await CPUList.findOne({
    productid: x.productid
  });
  let cpuid = "";
  if (existingProduct) {
    cpuid = existingProduct._id;
  } else {
    let createdProduct = await CPUList.create({
      name: x.name,
      productid: x.productid,
      imgurl: x.imgurl,
      detail: x.details,
      link: x.link,
      price: x.price
    });
    cpuid = createdProduct._id;
  }
  await CPUVendorList.deleteMany({ cpuid: cpuid });
  // const nationality = await drivers.findElement(By.id("i18nPrices"));
  // const ulElement = await nationality.findElement(By.tagName("ul"));
  // const htmlString = await ulElement.getAttribute("outerHTML");
  await saveToDatabase(drivers, cpuid, url);
  inn++;
}
async function getdatafromLink(countrywebshop, cpuid, link) {
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
          cpuid: cpuid,
          displayname: nameContent,
          payment: paymentContent,
          vendorimgurl: subimgurl,
          price: prcContent,
          alink: getlink(alt),
          directlink: detailHref
        };
        await CPUVendorList.create(item);
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
const getlink = (str) => {
  if (str.toLowerCase().includes("amazon"))
    return "https://www.amazon.it/b/?ie=UTF8&node=460126031&pf_rd_p=e0a2c917-a1dd-4f87-a63e-d37c11434f01&pf_rd_r=E55XPXKWCPJYSV7QF279&pf_rd_s=pc-subnav-flyout-content-6&pf_rd_t=SubnavFlyout&ref_=sn_gfs_co_pc_460126031_3";
  if (str.toLowerCase().includes("bpm"))
    return "https://www.bpm-power.com/it/online/componenti-pc/processori";
  if (str.toLowerCase().includes("eprice"))
    return "https://www.eprice.it/catalogo/informatica/componenti-pc";
  if (str.toLowerCase().includes("redgaming"))
    return "https://redgaming.it/3-cpu";
  if (str.toLowerCase().includes("topgamingpc"))
    return "https://www.topgamingpc.it/categoria-prodotto/prodotti-it/cpu/?v=cd32106bcb6d";
  if (str.toLowerCase().includes("techinn"))
    return "https://www.tradeinn.com/techinn/it/componenti-processori/15978/s";
  if (str.toLowerCase().includes("sferaufficio"))
    return "https://www.sferaufficio.com/offerte/pc-laptop-e-server";
  if (str.toLowerCase().includes("pixmart"))
    return "https://www.pixmart.it/categoria-prodotto/componenti-pc/processori/";
  if (str.toLowerCase().includes("pc componentes"))
    return "https://www.pccomponentes.it/processori";
  if (str.toLowerCase().includes("syswork"))
    return "https://syswork.store/it/cpu";
  if (str.toLowerCase().includes("ebay"))
    return "https://www.ebay.it/b/Processori-e-CPU-per-prodotti-informatici/164/bn_16546715";
  if (str.toLowerCase().includes("trippodo"))
    return "https://www.trippodo.com/it/573-processori";
  if (str.toLowerCase().includes("esus"))
    return "https://www.esus-it.it/ita_n_CPU-GPU-115.html";
  if (str.toLowerCase().includes("yeppon"))
    return "https://www.yeppon.it/c/videogames/componenti-gaming/processori-cpu-gaming";
  if (str.toLowerCase().includes("eweki"))
    return "https://www.eweki.it/informatica/componenti-assemblaggio/processori-cpu.html";
  if (str.toLowerCase().includes("ollo"))
    return "https://www.ollo.it/processori/c_334";
  if (str.toLowerCase().includes("siimsrl"))
    return "https://www.siimsrl.it/cpu.1.7.252.sp.uw?fd=1";
  if (str.toLowerCase().includes("goldenprice"))
    return "https://www.goldenprice.it/informatica/componenti-assemblaggio/cpu";
  if (str.toLowerCase().includes("xfilesaversa"))
    return "https://www.xfilesaversa.it/it/informatica/componentistica/processori/";
  if (str.toLowerCase().includes("geopc"))
    return "https://geopc.it/componenti-hardware-informatica/cpu-processori-intel-amd";
  if (str.toLowerCase().includes("ldc"))
    return "https://www.ldc.it/141-processori-e-cpu";
  if (str.toLowerCase().includes("cyberport"))
    return "https://www.cyberport.at/pc-und-zubehoer/komponenten/prozessoren-cpu.html";
  if (str.toLowerCase().includes("proshop"))
    return "https://www.proshop.at/CPU";
  if (str.toLowerCase().includes("redcomputer"))
    return "https://www.yeppon.it/c/videogames/componenti-gaming/processori-cpu-gaming";
  if (str.toLowerCase().includes("notebooksbilliger"))
    return "https://www.notebooksbilliger.de/pc+hardware/prozessoren+pc+hardware";
  if (str.toLowerCase().includes("nullprozentshop"))
    return "https://www.nullprozentshop.de/pc-hardware/amd/";
  if (str.toLowerCase().includes("galaxus"))
    return "https://www.galaxus.de/en/s1/producttype/processors-83";
  if (str.toLowerCase().includes("speedler"))
    return "https://www.speedler.es/componentes-hardware/componentes/procesadores";
  if (str.toLowerCase().includes("senetic"))
    return "https://www.senetic.es/product/100-100000063WOF";
  if (str.toLowerCase().includes("alternate"))
    return "https://www.alternate.fr/Processeurs";
  if (str.toLowerCase().includes("reichelt"))
    return "https://www.reichelt.com/fr/fr/processeurs-c6107.html?&nbc=1&SID=9375cc2b333b790349f63327bbddd5fe211712ca59a3416137c7a";
  if (str.toLowerCase().includes("onbuy"))
    return "https://www.onbuy.com/gb/computer-processors~c8568/";
  if (str.toLowerCase().includes("computeruniverse"))
    return "https://www.computeruniverse.net/de/c/hardware-komponenten/kuhlung-cooling";
  return "https://www.bpm-power.com/it/online/componenti-pc/processori";
};
async function saveToDatabase(drivers, cpuid, url) {
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
    await getdatafromLink(drivers, cpuid, url);
    while ((match = hrefRegex.exec(outerHTML)) !== null) {
      await getdatafromLink(drivers, cpuid, match[1]);
    }
    await CPUNat.deleteMany({ cpuid: cpuid });
    await CPUNat.create({
      cpuid: cpuid,
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
  let x = {
    name: nameVal,
    details: details,
    price: val,
    link: currentUrl,
    productid: id,
    imgurl: imgurl
  };
  let existingProduct = await CPUList.findOne({
    productid: x.productid
  });
  let cpuid = "";
  if (existingProduct) {
    cpuid = existingProduct._id;
  } else {
    let createdProduct = await CPUList.create({
      name: x.name,
      productid: x.productid,
      imgurl: x.imgurl,
      detail: x.details,
      link: x.link,
      price: x.price
    });
    cpuid = createdProduct._id;
  }
  await CPUVendorList.deleteMany({ cpuid: cpuid });
  await saveToDatabase(drivers, cpuid, currentUrl);
  handledform = current + 1;
  inn++;
}
async function fetchCPU4() {
  let pages = 19;
  let count = 15;
  let arr = [];
  const detail_driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(chromeOptions)
    .build();
  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(chromeOptions)
    .build();
  inn = 0;
  const url = `https://www.idealo.it/cat/3019I16-${
    count * pages
  }/processori-cpu.html`;
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

    for (const element of priceElements) {
      let href = "";
      const linkElements = await element.findElements(By.tagName("a"));
      const formElements = await element.findElements(By.tagName("form"));
      if (linkElements.length > 0) {
        const linkElement = linkElements[0];
        href = await linkElement.getAttribute("href");
        const spanElement = await element.findElement(
          By.css("span[data-wishlist-heart]")
        );
        const dataAttr = await spanElement.getAttribute("data-wishlist-heart");
        const data = JSON.parse(dataAttr);
        const id = data.id;
        const textContent = await element.getText();
        let a = textContent.split("\n");
        let details = "";
        const regex = /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))/;

        for (let i = 0; i < a.length - 1; i++) {
          if (a[i].includes("CPU")) {
            details = a[i];
            break;
          }
        }

        const prc = a[a.length - 1].match(regex);
        const val = prc ? prc[0] : "Price not found";

        const imgElements = await parentElement.findElement(
          By.className("sr-resultItemTile__image_ivkex")
        );
        const imgurl = await imgElements.getAttribute("src");
        let nameVal = a[0];
        await handleA(detail_driver, href, nameVal, details, val, id, imgurl);
      } else if (formElements.length > 0) {
        if (formindex == handledform) {
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
          let details = "";
          const regex = /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))/;

          for (let i = 0; i < a.length - 1; i++) {
            if (a[i].includes("CPU")) {
              details = a[i];
              break;
            }
          }
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
          let nametext = await divElement.getText();
          const prc = a[a.length - 1].match(regex);
          const val = prc ? prc[0] : "Price not found";
          const imgElements = await parentElement.findElement(
            By.className("sr-resultItemTile__image_ivkex")
          );
          const imgurl = await imgElements.getAttribute("src");

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
          formindex++;
        } else {
          formindex++;
          continue;
        }
      } else {
        console.log("Element does not contain <a> or <form> tags");
      }
    }
    console.log(url, inn);
    arr.push({ url: url, inn: inn });
  } catch (error) {
    console.error("An error occurred in iteration", pages, ":", error);
  } finally {
    if (driver) {
      await driver.quit();
    }

    if (detail_driver) {
      await detail_driver.quit();
    }
  }
  const csvRows = arr.map((row) => `${row.url}, ${row.inn}\n`).join("");
  const csvHeader = "url, counts\n";
  const csvData = csvHeader + csvRows;
  const csvFilePath = "output.csv";
  fs.writeFileSync(csvFilePath, csvData);
  console.log("All data were just processed");
}
export { fetchCPU4 };
