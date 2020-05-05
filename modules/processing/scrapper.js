const puppeteer = require("puppeteer");
const fs = require('fs')

const scrapeImages = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(
    "https://www.nytimes.com/2020/05/05/world/coronavirus-news.html"
  );

  // Login form
  await page.screenshot({ path: "1.png" });

  // await page.type("[name=username]", "fireship_dev");

  // await page.type("[name=password]", "some-pa$$word");

  // await page.click("[type=submit]");

  // Social Page

  await page.waitFor(500);

  await page.screenshot({ path: "2.png" });

  // await page.waitForSelector("img ", {
  //   visible: true,
  // });

  // Execute code in the DOM
  const data = await page.evaluate(() => {
    const body = document.querySelector("body");

    let text = body.innerText;

    return text;
  });

  await browser.close();

  //console.log(data);

  return data;
};
(async function () {
  const text = await scrapeImages();
  // let json = JSON.stringify(originalTweet_response);
  fs.writeFile("website-text.txt", text, function (err) {
    if (err) throw err;
    console.log("Saved!");
  });
})();
