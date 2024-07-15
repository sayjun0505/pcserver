import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

let handledform = 0;
let arr = [];

const delay = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// url, nameval, detail, price, productid, imgurl
async function handleform(url, current,nameval, detail, price, productid, imgurl) {
  const chromeOptions = new chrome.Options();
  chromeOptions.addArguments("--disable-gpu");
  chromeOptions.addArguments("--disable-images");

  const drivers = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(chromeOptions)
    .build();
  await drivers.get(url);
  const shadowHost = await drivers.findElement(By.id("usercentrics-cmp-ui"));
  await drivers.executeScript(
    `
        const shadowRoot = arguments[0].shadowRoot; 
        const acceptButton = shadowRoot.querySelector('button#accept');
        acceptButton.click();
    `,
    shadowHost
  );
  await delay(3000);
  const parentElement = await drivers.findElement(
    By.css(".sr-resultList_NAJkZ")
  );
  const formElements = await parentElement.findElements(By.tagName("form"));
  const formElement = formElements[current];
  const button = await formElement.findElement(
    By.css('button[role="button"].sr-resultItemLink__button_k3jEE')
  );
  const actions = drivers.actions();
  await actions.move({ origin: button }).perform();
  await drivers.executeScript("arguments[0].click();", button);
  const currentUrl = await drivers.getCurrentUrl();
  console.log("form tag:",currentUrl)

  // let x = {
  //   name: nameval,
  //   details: detail,
  //   price: price,
  //   link: currentUrl,
  //   productid: productid,
  //   imgurl: imgurl
  // };
  // let existingProduct = await CPUList.findOne({
  //   productid: x.productid
  // });
  // let cpuid = "";
  // if (existingProduct) {
  //   cpuid = existingProduct._id;
  // } else {
  //   let createdProduct = await CPUList.create({
  //     name: x.name,
  //     productid: x.productid,
  //     imgurl: x.imgurl,
  //     detail: x.details,
  //     link: x.link,
  //     price: x.price
  //   });
  //   cpuid = createdProduct._id;
  // }
  // await CPUVendorList.deleteMany({ cpuid: cpuid });

  // const nationality = await drivers.findElement(By.id("i18nPrices"));
  // const ulElement = await nationality.findElement(By.tagName("ul"));

  // const htmlString = ulElement.getAttribute("outerHTML");
  // await saveToDatabase(cpuid, htmlString);

  // arr.push(currentUrl);
  handledform++;
  await drivers.quit();
}

async function handleA(url, nameval, detail, price, productid, imgurl) {
  const chromeOptions = new chrome.Options();
  chromeOptions.addArguments("--disable-gpu");
  chromeOptions.addArguments("--disable-images");

  const drivers = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(chromeOptions)
    .build();
  await drivers.get(url);
  console.log("a tag:",url)
  // let x = {
  //   name: nameval,
  //   details: detail,
  //   price: price,
  //   link: url,
  //   productid: productid,
  //   imgurl: imgurl
  // };
  // let existingProduct = await CPUList.findOne({
  //   productid: x.productid
  // });
  // let cpuid = "";
  // if (existingProduct) {
  //   cpuid = existingProduct._id;
  // } else {
  //   let createdProduct = await CPUList.create({
  //     name: x.name,
  //     productid: x.productid,
  //     imgurl: x.imgurl,
  //     detail: x.details,
  //     link: x.link,
  //     price: x.price
  //   });
  //   cpuid = createdProduct._id;
  // }
  // await CPUVendorList.deleteMany({ cpuid: cpuid });

  // const nationality = await drivers.findElement(By.id("i18nPrices"));
  // const ulElement = await nationality.findElement(By.tagName("ul"));

  // const htmlString = ulElement.getAttribute("outerHTML");
  // await saveToDatabase(cpuid, htmlString);

  await drivers.quit();
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
async function fetchCPU() {
  const chromeOptions = new chrome.Options();
  chromeOptions.addArguments("--disable-gpu");
  chromeOptions.addArguments("--disable-images");

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(chromeOptions)
    .build();
  let pages = 5;
  let count = 15;
  try {
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
    const shadowHost = await driver.findElement(By.id("usercentrics-cmp-ui"));
    await driver.executeScript(
      `
        const shadowRoot = arguments[0].shadowRoot; 
        const acceptButton = shadowRoot.querySelector('button#accept');
        acceptButton.click();
    `,
      shadowHost
    );

    await delay(2000);
    let formindex = 0;
    for (const element of priceElements) {
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

      let href = "";

      const linkElements = await element.findElements(By.tagName("a"));
      const formElements = await element.findElements(By.tagName("form"));

      const imgElements = await parentElement.findElement(
        By.className("sr-resultItemTile__image_ivkex")
      );
      let nameVal = a[0];
      if (a[0].includes("%")) {
        const nameElements = await parentElement.findElement(
          By.className("sr-productSummary__title_f5flP")
        );
        nameVal = await nameElements.getText();
      }
      if (linkElements.length > 0) {
        // If <a> tag is found, process it
        const linkElement = linkElements[0]; // Assuming only one <a> tag is needed
        href = await linkElement.getAttribute("href");
        const imgurl = await imgElements.getAttribute("src");
        await handleA(href, nameVal, details, val, id, imgurl);
        // arr.push(href);
      } else if (formElements.length > 0) {
        if (formindex == handledform) {
          await handleform(url, handledform,nameVal, details, val, id, imgurl);
          // handleform(url, current,nameval, detail, price, productid, imgurl)
        } else {
        }
        formindex++;
      } else {
        console.log("Element does not contain <a> or <form> tags");
      }
    }
    console.log("All data were just processed");
  } catch (err) {
  } finally {
    if (driver) {
    console.log("Finally were just processed");
    await driver.quit();
      console.log(arr);
    }
  }
}
export { fetchCPU };
