import { Builder, By } from "selenium-webdriver";
import cpulist from "../model/cpulist.js";
import CPUList from "../model/cpulist.js";

async function fetchPageTitle() {
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
          const regex = /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))/;
          const prc = a[a.length - 1].match(regex);
          const val = prc ? prc[0] : "Price not found";
          const linkElement = await element.findElement(By.css("a"));
          const href = await linkElement.getAttribute("href");

          const imgElement = await element.findElement(By.css("img"));
          const imgurl = await imgElement.getAttribute("src");
          let x = {
            name: a[0],
            detail: a[1],
            price: val,
            link: href,
            imgurl: imgurl
          };
          let existingProduct = await CPUList.findOne({
            name: x.name
          });
          if (!existingProduct) {
            await CPUList.create({
              name: x.name,
              imgurl: x.MPN,
              detail: x.detail,
              link: x.link,
              price: x.price
            });
          }

          const detail = await new Builder().forBrowser("chrome").build();
          await detail.get(href);
          const nameinfo = await detail.findElements(
            By.className("productOffers-listItemTitleWrapper")
          );
          const pricenfo = await detail.findElements(
            By.className("productOffers-listItemOfferPrice")
          );
          
          for (const info of nameinfo) {
            try {
              const textContent = await info.getText();
              console.log(textContent);
            } catch (err) {
              console.error("Error processing element:", err.message);
            }
          }
          for (const info of pricenfo) {
            try {
              const textContent = await info.getText();
              console.log(textContent);
            } catch (err) {
              console.error("Error processing element:", err.message);
            }
          }
          
          arr.push(x);
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
