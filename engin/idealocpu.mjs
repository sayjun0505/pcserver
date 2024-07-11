import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import { dbConfig } from "../db/pcbuilderdb.mjs";
import CPUList from "../model/cpulist.js";
import CPUVendorList from "../model/cpuvendorlist.js";
import CPUNat from "../model/cpunat.js";
import mongoose from "mongoose";

async function fetchCPU() {
  const chromeOptions = new chrome.Options();
  chromeOptions.addArguments("--headless");

  const driver = await new Builder().forBrowser("chrome").build();
  let arr = [];
  let pages = 1;
  let count = 15;
  await mongoose.connect(dbConfig.db);
  try {
    while (true) {
      const url = `https://www.idealo.it/cat/3019I16-${
        count * pages
      }/processori-cpu.html`;
      await driver.get(url);
      console.log(url)
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
          for (let i = 0; i < a.length - 1; i++)
            if (a[i].includes("CPU")) {
              details = a[i];
              break;
            }
          const prc = a[a.length - 1].match(regex);
          const val = prc ? prc[0] : "Price not found";
          var linkElement;
          try {
            linkElement = await element.findElement(By.css("a"));
            const href = await linkElement.getAttribute("href");
            const imgElements = await parentElement.findElement(
              By.className("sr-resultItemTile__image_ivkex")
            );
            const imgurl = await imgElements.getAttribute("src");
            let x = {
              name: a[0],
              details: details,
              price: val,
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
            console.log("Acurrent url:", href);
            const nationality = await detail.findElement(By.id("i18nPrices"));
            const ulElement = await nationality.findElement(By.tagName("ul"));

            const htmlString = ulElement.getAttribute("outerHTML");
            await saveToDatabase(cpuid, htmlString);

            const timeout = 10000;
            const listinfo = await detail.wait(
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
                  By.className(
                    "productOffers-listItemOfferShippingDetailsRight"
                  )
                );
                const paymentContent = await paymentinfo.getAttribute(
                  "outerHTML"
                );

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
                let item = {
                  cpuid: cpuid,
                  displayname: nameContent,
                  payment: paymentContent,
                  vendorimgurl: subimgurl,
                  // price: parseFloat(
                  //   prcContent.replace("€", "").trim().replace(",", ".").trim().replace(" ", "")
                  // ),
                  price:prcContent,
                  directlink: detailContent
                };
                await CPUVendorList.create(item);
              } catch (err) {
                console.error("Error processing element:", err.message);
              }
              if (count >= 3) break;
              count++;
            }
            await driver.manage().deleteAllCookies();

            await detail.quit();
          } catch (err) {
            if (err.name === "NoSuchElementError") {
              // console.log("There happened no 'a' tag");
              await driver.wait(
                until.elementIsNotVisible(
                  driver.findElement(By.id("usercentrics-cmp-ui"))
                )
              );
              const button = await driver.findElement(
                By.css('button[role="button"].sr-resultItemLink__button_k3jEE')
              );
              const actions = driver.actions();
              await actions.move({ origin: button }).perform();
              await driver.executeScript("arguments[0].click();", button);
              const href = await driver.getCurrentUrl();
              const pr = await driver.findElement(
                By.css(".pageContent-wrapper")
              );
              let imgurl = "";
              try {
                const imgElements = await pr.findElement(
                  By.className("oopStage-galleryCollageImage")
                );
                imgurl = "https:" + (await imgElements.getAttribute("src"));
              } catch (e) {
                const divElement = await pr.findElement(
                  By.className("simple-carousel-item")
                );
                if (divElement) {
                  const imgElement = await divElement.findElement(
                    By.tagName("img")
                  );
                  if (imgElement) {
                    const src = await imgElement.getAttribute("src");
                    imgurl = "https:" + src;
                  } else {
                    console.log(
                      "No img tag found within div with class simple-carousel-item"
                    );
                  }
                } else {
                  console.log("No div found with class simple-carousel-item");
                }
              }
              let x = {
                name: a[0],
                details: details,
                // price: parseFloat(val.replace(",", ".")),
                price: val,
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
              const detail = await new Builder().forBrowser("chrome").build();
              await detail.get(href);
              console.log("Bcurrent url:", href);

              const timeout = 10000;
              const listinfo = await detail.wait(
                until.elementsLocated(
                  By.className("product-offers-items-soop-4576-fallback")
                ),
                timeout
              );
              const nationality = await detail.findElement(By.id("i18nPrices"));
              const ulElement = await nationality.findElement(By.tagName("ul"));
              const htmlString = ulElement.getAttribute("outerHTML");
              await saveToDatabase(cpuid, htmlString);
              let count = 0;
              for (const info of listinfo) {
                try {
                  const nameinfo = await info.findElement(
                    By.className("productOffers-listItemTitleWrapper")
                  );
                  const nameContent = await nameinfo.getText();

                  const paymentinfo = await info.findElement(
                    By.className(
                      "productOffers-listItemOfferShippingDetailsRight"
                    )
                  );
                  const paymentContent = await paymentinfo.getAttribute(
                    "outerHTML"
                  );

                  const detailinfo = await info.findElement(
                    By.className("productOffers-listItemTitle")
                  );
                  const detailContent =
                    "https://www.idealo.it" +
                    (await detailinfo.getAttribute("href"));

                  // const driverURL = await new Builder().forBrowser('chrome').build(); 
                  // await driverURL.get(detailContent);
                  // let currentUrl = await driver.getCurrentUrl();
                  // console.log("AAA----------------currentUrl:",currentUrl)
                  // await driverURL.quit();



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
                    // price: parseFloat(
                    //   prcContent
                    //     .replace("€", "")
                    //     .trim()
                    //     .replace(",", ".")
                    //     .trim()
                    // ),
                    price:prcContent,
                    directlink: detailContent
                  };
                  await CPUVendorList.create(item);
                } catch (err) {
                  console.error("Error processing element:", err.message);
                }
                if (count >= 3) break;
                count++;
              }
              await driver.manage().deleteAllCookies();
              await detail.quit();
            }
          }
        } catch (err) {}
      }
      if (priceElements.length < 36) break; // Exit while loop if no price elements found
      pages++;
    }
    console.log("All data were just processed");
  } catch (err) {
    console.error("An error occurred:", err.message);
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}
async function getdatafromLink(cpuid, link) {
  const countrywebshop = await new Builder().forBrowser("chrome").build();
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
      const detailContent =
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
        // price: parseFloat(
        //   prcContent
        //     .replace("€", "")
        //     .replace("£", "")
        //     .trim()
        //     .replace(",", ".")
        //     .trim()
        // ),
        price:prcContent,
        directlink: detailContent
      };
      await CPUVendorList.create(item);
      if (count >= 3) {
        break;
      }
      count++;
    } catch (err) {
      console.error("Error processing element:", err.message);
    }
  }
  await countrywebshop.quit();
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
