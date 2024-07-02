import axios from 'axios';
import cheerio from 'cheerio';

let arr=[];
const extractCoreThreads = (inputString) => {
  const lowercaseString = inputString.toLowerCase();
  const cpattern = /cores|cœurs/;
  const index = lowercaseString.search(cpattern);
  const npattern = /\d+/;
  if(inputString.substring(0,index).includes("Quad-Core"))return 2;
  else {
    const match = inputString.match(npattern);
    if (match) {
      const number = match[0];
      return number;
    } else { 
      if(inputString.includes("Core 2 Quad")||inputString.includes("Core 2 Duo"))return 2;
      else return 0;
    }
  }
};
const parseProductDetails = async (url) => {
  const response = await axios.get(url);
  // console.log(response.data)
  const html = response.data;
  const $ = cheerio.load(html);
  const listingInfinite = $('#listing-infinite').find('article').length; // Get the HTML content of the element with id 'listing-infinite'
  $('#listing-infinite').find('article').each((index, element) => {
    const nameVal = $(element).find('.item__caracs').text().trim();
    const cores=extractCoreThreads(nameVal)
    const priceVal=$(element).find('.item__price--new-box').text().trim().replace(/[\s]/g, "");;
    const Manufacturer=$(element).find('.item__fournisseur').text().trim();
    let x={Manufacturer:Manufacturer,name:nameVal, price:priceVal,CoreCount:cores,provider:"rueducommerce"}
    arr.push(x)
  });
  return listingInfinite;
};

const rueducommerceData = async () => {
  try {
    let i=1;
    let total=0;
    arr=[];
    while (true) {
      const newUrl = `https://www.rueducommerce.fr/rayon/composants-16/processeur-246?page=${i}`;
      let newcount=await parseProductDetails(newUrl);
      total+=newcount;
      if (newcount<60)break;
      else i += 1
    }
    console.log(`Total Rueducommerce items: ${total}`);
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
};

export { rueducommerceData };