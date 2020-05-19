const scraper = require("./scraper");
var exports = (module.exports = {});

let manual = async function () {
  let urls = [
    // "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then",
    //"https://www.nytimes.com/2020/05/05/world/coronavirus-news.html",
    //"/home/rahultarak12345/Testing-Repo/modules/processing/image.html",
    "https://www.miamiherald.com/news/coronavirus/article242538781.html",
    "https://www.bizjournals.com/bizwomen/news/latest-news/2018/02/rometty-spurs-hiring-of-new-collar-tech-workers.html?page=all",
    // "https://www.vox.com/the-highlight/2020/2/18/21136863/alcoholism-sober-curious-mindful-drinking",
  ];
  let urlsLength = urls.length;
  let resolvedPromiseCount = 0;
  let outputs = [];
  let cluster = await scraper.createCluster();
  for (let url of urls) {
  }
  for (let i = 0; i < urls.length; i++) {
    outputs[i] = scraper.newUrl(cluster, urls[i]);
    outputs[i]
      .then((data) => {
        resolvedPromiseCount++;

        console.log(
          "Testing -> Resolved Promise -> outputs",
          i,
          "with title",
          data.title,
          data.text.length
        );

        if (resolvedPromiseCount === urlsLength) {
          scraper.closeCluster(cluster);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
};
//main();

let getPage = async function (url) {
  let cluster = await scraper.createCluster();
  let output = await scraper.newUrl(cluster, url);
  await scraper.closeCluster(cluster);
  return output;
};

exports.getPage = getPage;
