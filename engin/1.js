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
    let arr = [];
    const shadowHost = await driver.findElement(By.id('usercentrics-cmp-ui'));
    await driver.executeScript(`
        const shadowRoot = arguments[0].shadowRoot; 
        const acceptButton = shadowRoot.querySelector('button#accept');
        acceptButton.click();
    `, shadowHost);    
    const delay = async (ms) => new Promise(resolve => setTimeout(resolve, ms));
    await delay(2000);
    for (const element of priceElements) {  
      let href = "";        
      try {  
        const linkElement = await element.findElement(By.tagName("a"));  
        href = await linkElement.getAttribute("href");  
      } catch (error) {  
        const usercentricsElement = await driver.findElement(By.id("usercentrics-cmp-ui"));  
        await driver.wait(until.elementIsNotVisible(usercentricsElement), 5000); 
        const button = await driver.findElement(By.css('button[role="button"].sr-resultItemLink__button_k3jEE'));  
        const actions = driver.actions();  
        await actions.move({ origin: button }).perform();  
        await driver.executeScript("arguments[0].click();", button);          
        await driver.wait(async () => {  
          const currentUrl = await driver.getCurrentUrl();  
          return currentUrl !== url; 
        });          
        href = await driver.getCurrentUrl();  
        await driver.get(url);  
        continue;
      }  
      console.log("form:", href);  
      let x = {   
        details: details,  
        price: val,  
        link: href,  
        productid: id,  
      };        
      arr.push(x);  
    }
    console.log(arr)
    console.log("All data were just processed");
  } catch (err) {
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}
export { fetchCPU };
