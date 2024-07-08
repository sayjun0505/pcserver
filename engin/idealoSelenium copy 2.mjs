import { Builder, By } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import { dbConfig } from "../db/pcbuilderdb.mjs";
import CPUList from "../model/cpulist.js";
import CPUVendorList from "../model/cpuvendorlist.js";
import mongoose from "mongoose";

async function fetchPageTitle() {
  const chromeOptions = new chrome.Options();
  chromeOptions.addArguments("--headless");

  const driver = await new Builder().forBrowser("chrome").build();
  let arr = [];
  let pages = 0;
  let count = 15;
  await mongoose.connect(dbConfig.db);
  try {
    while (true) {
      const url = `https://www.idealo.it/cat/3019I16-${
        count * pages
      }/processori-cpu.html`;
      await driver.get(url);
      const parentElement = await driver.findElement(
        By.css(".sr-resultList_NAJkZ")
      );
      const priceElements = await parentElement.findElements(
        By.className("sr-resultList__item_m6xdA")
      );

      for (const element of priceElements) {
        try {
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
          const linkElement = await element.findElement(By.css("a"));
          const href = await linkElement.getAttribute("href");

          
          const imgElements = await parentElement.findElement(
            By.className("sr-resultItemTile__image_ivkex")
          );
          const imgurl = await imgElements.getAttribute("src");
          let x = {
            name: a[0],
            details: details,
            price: parseFloat(val.replace(",", ".")),
            link: href,
            imgurl: imgurl
          };
          let existingProduct = await CPUList.findOne({
            name: x.name
          });
          let cpuid = "";
          if (existingProduct) {
            cpuid = existingProduct._id;
          } else {
            let createdProduct = await CPUList.create({
              name: x.name,
              imgurl: x.imgurl,
              detail: x.details,
              link: x.link,
              price: x.price
            });
            cpuid = createdProduct._id;
          }
          await CPUVendorList.deleteMany({ cpuid: cpuid });
        //   await new Promise(resolve => setTimeout(resolve, 200));
          const detail = await new Builder().forBrowser("chrome").build();
          await detail.get(href);
          const listinfo = await detail.findElements(
            By.className("product-offers-items-soop-4576-fallback")
          );
          for (const info of listinfo) {
            try {
              const nameinfo = await info.findElement(
                By.className("productOffers-listItemTitleWrapper")
              );
              const nameContent = await nameinfo.getText();

              const detailinfo = await info.findElement(
                By.className("productOffers-listItemTitle")
              );
              const detailContent =
                "https://www.idealo.it" +
                (await detailinfo.getAttribute("href"));

              const prcinfo = await info.findElement(
                By.className("productOffers-listItemOfferPrice")
              );
              const prcContent = await prcinfo.getText();

              const vendorinfo = await info.findElement(
                By.className("productOffers-listItemOfferShopV2LogoImage")
              );
              const subimgurl = await vendorinfo.getAttribute("src");
              let item={
                cpuid: cpuid,
                displayname: nameContent,
                vendorimgurl: subimgurl,
                price: parseFloat(prcContent.replace("€", "").trim().replace(",", ".").trim()),
                directlink: detailContent
              }
              await CPUVendorList.create(item);
            } catch (err) {
              console.error("Error processing element:", err.message);
            }
          }

        //   arr.push(x);
            await detail.quit();
        } catch (err) {
          console.error("Error processing element:", err.message);
        }
      }
      if (priceElements.length < 36) break; // Exit while loop if no price elements found
      pages++;
    }

    console.log(arr.length);
  } catch (err) {
    console.error("An error occurred:", err.message);
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

export { fetchPageTitle };
