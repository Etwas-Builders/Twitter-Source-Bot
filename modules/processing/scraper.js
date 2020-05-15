const { Cluster } = require("puppeteer-cluster");
const vanillaPuppeteer = require("puppeteer");

const { addExtra } = require("puppeteer-extra");
const Stealth = require("puppeteer-extra-plugin-stealth");
const Recaptcha = require("puppeteer-extra-plugin-recaptcha");

var exports = (module.exports = {});

const puppeteer = addExtra(vanillaPuppeteer);
puppeteer.use(Stealth());
puppeteer.use(Recaptcha());

exports.createCluster = async function () {
  const cluster = await Cluster.launch({
    puppeteer,
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 20,
  });

  console.log("Created Cluster");

  await cluster.task(async ({ page, data: url }) => {
    console.log("Added url to queue", url);

    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.addScriptTag({
      url: "https://code.jquery.com/jquery-3.2.1.min.js",
    });
    await page.waitFor(200);
    const data = await page.evaluate(() => {
      const body = document.querySelector("body");
      let title =
        document.querySelectorAll("head > meta[name='twitter:title']")[0]
          .content ||
        document.querySelectorAll("head > meta[name='og:title']")[0].content ||
        document.querySelectorAll("head > meta[name='title']")[0].content ||
        document.title;

      let text = body.innerText;
      //console.log("Cluster -> Task -> title", title);
      let data = {};
      data.title = title;
      data.text = text;
      return data;
    });
    console.log("Data from scrapper", data.title, data.text.length);
    if (!data.title) {
      data.title = "test";
      //await page.setViewport({ width: 1920, height: 1080 });
      await page.screenshot({ path: `./${data.title}.png`, fullPage: true });
    }

    return data;
  });
  // let output = []
  // for (let i = 0; i < urls.length; i++) {
  //   output[i] = cluster.execute(urls[i]);
  //   output[i].then((value) => {
  //     console.log("Promise Resolution", value.title)
  //     // Call NLP Here
  //   })
  // }

  // exports.addQueueElement = async function (url) {
  //   cluster.queue(url);
  // };
  return cluster;
};

exports.newUrl = async function (cluster, url) {
  let output = cluster.execute(url);
  return output;
};

exports.closeCluster = async function (cluster) {
  //await cluster.idle();
  await cluster.close();
  console.log("Close Cluster");
};
// Testing
