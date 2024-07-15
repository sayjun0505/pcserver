import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

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
    let i = 0;
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
    // let arr = [];
    const shadowHost = await driver.findElement(By.id("usercentrics-cmp-ui"));
    await driver.executeScript(
      `
        const shadowRoot = arguments[0].shadowRoot; 
        const acceptButton = shadowRoot.querySelector('button#accept');
        acceptButton.click();
    `,
      shadowHost
    );
    const delay = async (ms) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    await delay(2000);
    for (const element of priceElements) {
      let href = "";

      const linkElements = await element.findElements(By.tagName("a"));
      const formElements = await element.findElements(By.tagName("form"));

      if (linkElements.length > 0) {
        // If <a> tag is found, process it
        const linkElement = linkElements[0]; // Assuming only one <a> tag is needed
        href = await linkElement.getAttribute("href");
        console.log("a tag:", href);

        // Further processing for <a> tag
      } else if (formElements.length > 0) {
        // If <form> tag is found, process it
        const formElement = formElements[0]; // Assuming only one <form> tag is needed
        // interact with form element here
        console.log("form tag:", formElement);

        // Further processing for <form> tag
      } else {
        // Handle cases where neither <a> nor <form> tags are found
        console.log("Element does not contain <a> or <form> tags");
      }
    }
    console.log("All data were just processed");
  } catch (err) {
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}
export { fetchCPU };
