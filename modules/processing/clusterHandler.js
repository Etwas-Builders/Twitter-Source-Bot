const scrapper = require("./scrapper");
let main = async function () {
  let urls = [
    "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then",
    "https://www.nytimes.com/2020/05/05/world/coronavirus-news.html",
    "https://www.vox.com/the-highlight/2020/2/18/21136863/alcoholism-sober-curious-mindful-drinking",
  ];
  let urlsLength = urls.length;
  let resolvedPromiseCount = 0;
  let outputs = [];
  let cluster = await scrapper.createCluster();
  for (let i = 0; i < urls.length; i++) {
    outputs[i] = scrapper.newUrl(cluster, urls[i]);
    outputs[i].then((data) => {
      resolvedPromiseCount++;

      console.log(
        "Testing -> Resolved Promise -> outputs",
        i,
        "with title",
        data.title
      );
      if (resolvedPromiseCount === urlsLength) {
        scrapper.closeCluster(cluster);
      }
    });
  }
};
main();
