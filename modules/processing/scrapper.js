const { Cluster } = require("puppeteer-cluster");

var exports = (module.exports = {});

exports.createCluster = async function () {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 10,
  });

  console.log("Created Cluster");

  await cluster.task(async ({ page, data: url }) => {
    console.log("Added url to queue", url);
    await page.goto(url, { waitUntil: "domcontentloaded" });

    await page.waitFor(200);
    const data = await page.evaluate(() => {
      const body = document.querySelector("body");
      let title = document.title;
      let text = body.innerText;
      console.log("Cluster -> Task -> title", title);
      let data = {};
      data.title = title;
      data.text = text;
      return data;
    });
    console.log("Data from scrapper", data.title);
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
  console.log("Close Cluster");
  //await cluster.idle();
  await cluster.close();
};
// Testing
