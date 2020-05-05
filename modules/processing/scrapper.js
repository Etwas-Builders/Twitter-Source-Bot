const { Cluster } = require("puppeteer-cluster");

let exports = (module.exports = {});

exports.createCluster = async function (urls) {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 10,
  });

  await cluster.task(async ({ page, data: url }) => {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    const data = await page.evaluate(() => {
      const body = document.querySelector("body");

      let text = body.innerText;

      return text;
    });

    return data;
  });

  for (let url of urls) {
    cluster.queue(url).then((data) => {
      console.log(
        "Scrapper -> createcluster -> Fetched complete page data for",
        url
      );
      // Call NLP
    });
  }
  // exports.addQueueElement = async function (url) {
  //   cluster.queue(url);
  // };
  await cluster.idle();
  await cluster.close();
};

// Testing

let urls = [
  "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then",
  "https://www.nytimes.com/2020/05/05/world/coronavirus-news.html",
  "https://www.vox.com/the-highlight/2020/2/18/21136863/alcoholism-sober-curious-mindful-drinking",
];

exports.createCluster(urls);
