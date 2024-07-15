import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import { dbConfig } from "../db/pcbuilderdb.mjs";
import CPUList from "../model/cpulist.js";
import CPUVendorList from "../model/cpuvendorlist.js";
import CPUNat from "../model/cpunat.js";
import mongoose from "mongoose";

async function fetchCPU() {
  const chromeOptions = new chrome.Options();
  // chromeOptions.addArguments("--headless");
  chromeOptions.addArguments("--disable-gpu");
  chromeOptions.addArguments("--disable-images");

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(chromeOptions)
    .build();
  let arr = [];
  let pages = 5;
  let count = 15;
  await mongoose.connect(dbConfig.db);
  try {
    // while (true) {
    let i = 0;
    const url = `https://www.idealo.it/cat/3019I16-${
      count * pages
    }/processori-cpu.html`;
    // console.log("a");
    await driver.get(url);
    // console.log(url);
    const parentElement = await driver.findElement(
      By.css(".sr-resultList_NAJkZ")
    );
    const priceElements = await parentElement.findElements(
      By.className("sr-resultList__item_m6xdA")
    );
    let arr = [];

    // const shadowHost = document.getElementById('usercentrics-cmp-ui').querySelector("button#accept").click();;
    // shadowHost.shadowRoot.querySelector("button#accept").click();


    // // await driver.executeScript('document.getElementById(\'usercentrics-cmp-ui\').querySelector("button#accept").click();');
    // await driver.executeScript('document.getElementById("usercentrics-cmp-ui").querySelector("button#accept").click();');
    const shadowHost = await driver.findElement(By.id('usercentrics-cmp-ui'));

    await driver.executeScript(`
        const shadowRoot = arguments[0].shadowRoot; 
        const acceptButton = shadowRoot.querySelector('button#accept');
        acceptButton.click();
    `, shadowHost);
    
    // Add a delay using setTimeout
    const delay = async (ms) => new Promise(resolve => setTimeout(resolve, ms));
    await delay(2000);

    // for (const element of priceElements) {
    //   const spanElement = await element.findElement(
    //     By.css("span[data-wishlist-heart]")
    //   );
    //   const dataAttr = await spanElement.getAttribute("data-wishlist-heart");
    //   const data = JSON.parse(dataAttr);
    //   const id = data.id;
    //   const textContent = await element.getText();
    //   let a = textContent.split("\n");
    //   let details = "";
    //   const regex = /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))/;
    //   for (let i = 0; i < a.length - 1; i++)
    //     if (a[i].includes("CPU")) {
    //       details = a[i];
    //       break;
    //     }
    //   const prc = a[a.length - 1].match(regex);
    //   const val = prc ? prc[0] : "Price not found";
    //   let href = "";
    //   try {
    //     const linkElement = await element.findElement(By.tagName("a"));
    //     href = await linkElement.getAttribute("href");
    //   } catch (error) {
    //     const formElement = await driver.findElement(By.tagName('form'));
    //     await driver.wait(
    //       until.elementIsNotVisible(
    //         driver.findElement(By.id("usercentrics-cmp-ui"))
    //       ),1000
    //     );
    //     const button = await driver.findElement(
    //       By.css('button[role="button"].sr-resultItemLink__button_k3jEE')
    //     );
    //     const actions = driver.actions();
    //     await actions.move({ origin: button }).perform();
    //     await driver.executeScript("arguments[0].click();", button);
    //     await driver.wait(async () => {
    //         const currentUrl = await driver.getCurrentUrl();
    //         return currentUrl !== url; // Replace 'initialURL' with the initial URL before clicking the button
    //     });
    
    //     href = await driver.getCurrentUrl();
    //     await driver.get(url);
    //     console.log("form:",href);
    //   }
    //   const imgElements = await parentElement.findElement(
    //     By.className("sr-resultItemTile__image_ivkex")
    //   );
    //   let nameVal = a[0];
    //   if (a[0].includes("%")) {
    //     const nameElements = await parentElement.findElement(
    //       By.className("sr-productSummary__title_f5flP")
    //     );
    //     nameVal = await nameElements.getText();
    //   }
    //   const imgurl = await imgElements.getAttribute("src");
    //   let x = {
    //     name: nameVal,
    //     details: details,
    //     price: val,
    //     link: href,
    //     productid: id,
    //     imgurl: imgurl
    //   };
    //   arr.push(x);
    // }
    for (const element of priceElements) {  
      const spanElement = await element.findElement(By.css("span[data-wishlist-heart]"));  
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
      let href = "";  
      
      try {  
        const linkElement = await element.findElement(By.tagName("a"));  
        href = await linkElement.getAttribute("href");  
      } catch (error) {  
        try {  
          const usercentricsElement = await driver.findElement(By.id("usercentrics-cmp-ui"));  
          await driver.wait(until.elementIsNotVisible(usercentricsElement), 5000); // Adjust timeout as needed  
        } catch (error) {  
          console.error("Error while waiting for element to become invisible:", error);  
        }  
        
        const button = await driver.findElement(By.css('button[role="button"].sr-resultItemLink__button_k3jEE'));  
        const actions = driver.actions();  
        await actions.move({ origin: button }).perform();  
        await driver.executeScript("arguments[0].click();", button);  
        
        await driver.wait(async () => {  
          const currentUrl = await driver.getCurrentUrl();  
          return currentUrl !== url; // Replace 'initialURL' with the initial URL before clicking the button  
        });  
        
        href = await driver.getCurrentUrl();  
        await driver.get(url);  
      }  
      console.log("form:", href);  
      
      const imgElements = await parentElement.findElement(By.className("sr-resultItemTile__image_ivkex"));  
      let nameVal = a[0];  
      
      if (a[0].includes("%")) {  
        const nameElements = await parentElement.findElement(By.className("sr-productSummary__title_f5flP"));  
        nameVal = await nameElements.getText();  
      }  
      
      const imgurl = await imgElements.getAttribute("src");  
      let x = {  
        name: nameVal,  
        details: details,  
        price: val,  
        link: href,  
        productid: id,  
        imgurl: imgurl  
      };  
      
      arr.push(x);  
    }
    console.log(arr)
    console.log("All data were just processed");
  } catch (err) {
    // console.error("An error occurred:", err.message);
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}
async function getdatafromLink(cpuid, link) {
  const chromeOptions = new chrome.Options();
  // chromeOptions.addArguments("--headless");
  chromeOptions.addArguments("--disable-gpu");
  chromeOptions.addArguments("--disable-images");

  const countrywebshop = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(chromeOptions)
    .build();
  try {
    // console.log("Navigating to link:", link);
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
        const detailHref =
          "https://www.idealo.it" + (await detailinfo.getAttribute("href"));

        const prcinfo = await info.findElement(
          By.className("productOffers-listItemOfferPrice")
        );
        const prcContent = await prcinfo.getText();

        const vendorinfo = await info.findElement(
          By.className("productOffers-listItemOfferShopV2LogoImage")
        );
        const subimgurl = await vendorinfo.getAttribute("src");

        let item = {
          cpuid: cpuid,
          displayname: nameContent,
          payment: paymentContent,
          vendorimgurl: subimgurl,
          price: prcContent,
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
    console.error("Error accessing the webpage:", err);
  } finally {
    await countrywebshop.quit();
  }
}
async function saveToDatabase(cpuid, htmlString) {
  try {
    await mongoose.connect(dbConfig.db);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const html = await htmlString;
    const hrefRegex = /href="([^"]*)"/g;
    let hrefLinks = [];
    let match;
    while ((match = hrefRegex.exec(html)) !== null) {
      hrefLinks.push(match[1]);
      await getdatafromLink(cpuid, match[1]);
    }
    await CPUNat.deleteMany({ cpuid: cpuid });
    await CPUNat.create({
      cpuid: cpuid,
      html: html
    });
  } catch (error) {
    console.error(error);
  }
}

export { fetchCPU };
