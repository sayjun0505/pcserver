import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

let handledform = 0;
let arr=[];

const delay = async (ms) =>
      new Promise((resolve) => setTimeout(resolve, ms));



async function handleform(url,current) {
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
  const parentElement = await drivers.findElement(
    By.css(".sr-resultList_NAJkZ")
  );
  const formElements = await parentElement.findElements(By.tagName("form"));
  const formElement = formElements[current];
  const button = await formElement.findElement(By.css('button[role="button"].sr-resultItemLink__button_k3jEE'));  
  const actions = drivers.actions();
  await actions.move({ origin: button }).perform();  
  await drivers.executeScript("arguments[0].click();", button);    
  const currentUrl = await drivers.getCurrentUrl();  
  arr.push(currentUrl);
  console.log(currentUrl)
  handledform=current+1;
  await drivers.quit();
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
    let formindex=0;
    console.log(priceElements.length)
    for (const element of priceElements) {
      let href = "";
      const linkElements = await element.findElements(By.tagName("a"));
      const formElements = await element.findElements(By.tagName("form"));
      if (linkElements.length > 0) {
        const linkElement = linkElements[0];
        href = await linkElement.getAttribute("href");
        console.log("a tag:",href)
        arr.push(href)
      } else if (formElements.length > 0) {console.log("form met",formindex,handledform)
        if(formindex==handledform){
          await handleform(url,handledform);
        }
        else {formindex++;continue;}
        
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
      // console.log(arr)
    }
  }
}
export { fetchCPU };
