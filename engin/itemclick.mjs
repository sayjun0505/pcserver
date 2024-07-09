import { Builder, By, until } from "selenium-webdriver";
////////////////////////form cas it is right///////////////////////
async function itemclick() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    // Open the webpage
    await driver.get(
      "https://www.idealo.it/cat/3019I16-795/processori-cpu.html"
    );

    let divElement = await driver.findElements(
      By.className("sr-resultList__item_m6xdA")
    );
    let formElement = await divElement.findElement(By.tagName("form"));
  } catch (e) {
    // Wait for the cookie consent popup to disappear
    await driver.wait(
      until.elementIsNotVisible(
        driver.findElement(By.id("usercentrics-cmp-ui"))
      )
    );

    // Find the button element
    const button = await driver.findElement(
      By.css('button[role="button"].sr-resultItemLink__button_k3jEE')
    );

    // Move the cursor to a different location on the page to avoid interception
    const actions = driver.actions();
    await actions.move({ origin: button }).perform();

    // Click the button using JavaScript to avoid interception
    await driver.executeScript("arguments[0].click();", button);
    // const detail = await new Builder().forBrowser("chrome").build();
    // Get the URL of the current webpage
    const href = await driver.getCurrentUrl();

    console.log("Current URL:", href);
    await driver.get(href);
    const timeout = 10000;
    const listinfo = await driver.wait(
      until.elementsLocated(
        By.className("product-offers-items-soop-4576-fallback")
      ),
      timeout
    );
    for (const info of listinfo) {
      try {
        let button = await driver.findElements(
          By.className("uc-accept-button")
        );

        if (button.length > 0) {
          console.log(
            "Button with class 'uc-accept-button' exists on the webpage."
          );
        } else {
          console.log(
            "Button with class 'uc-accept-button' does not exist on the webpage."
          );
        }
        const nameinfo = await info.findElement(
          By.className("productOffers-listItemTitleWrapper")
        );
        const nameContent = await nameinfo.getText();

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
        //   cpuid: cpuid,
          displayname: nameContent,
          vendorimgurl: subimgurl,
          price: parseFloat(
            prcContent.replace("€", "").trim().replace(",", ".").trim()
          ),
          directlink: detailContent
        };
        console.log("item:",item)
        // await CPUVendorList.create(item);
      } catch (err) {
        console.error("Error processing element:", err.message);
      }
    }
  } finally {
    await driver.quit();
  }
}
itemclick();
// export { itemclick };
