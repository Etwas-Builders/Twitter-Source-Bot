/**
 * @jest-environment node
 */
const processing = require("../modules/processing/processing");

let cluster;

describe("Get Top Result", () => {
  it("Get Top Result is Defined", () => {
    expect(processing.getTopResult).toBeDefined();
  });
  it("Get Top Result is a function", () => {
    expect(typeof processing.getTopResult).toBe("function");
  });

  it("Get Top Result is active", async () => {
    const results = [{ url: "https://twittersourcebot.tech/" }];
    const username = "whosaidthisbot";
    const keywords = [
      { word: "Bot", partOfSpeech: "NNS" },
      { word: "tweet", partOfSpeech: "NNS" },
      { word: "Source", partOfSpeech: "NNS" },
    ];
    const tweetId = "jestPuppeteerActiveTest";

    const topResult = await processing.getTopResult(
      results,
      username,
      keywords,
      tweetId
    );
    expect(topResult).toBeDefined();
    cluster = topResult.cluster;
    console.log(topResult);
    expect(cluster).toBeDefined();
    expect(topResult.topResult).toBeNull;
  });

  it("No Access Denied Error", async () => {
    const results = [
      {
        url:
          "https://www.miamiherald.com/news/coronavirus/article242538781.html",
        url:
          "https://www.seattletimes.com/business/j-c-penney-talks-with-kkr-ares-lenders-on-bankruptcy-loan/",
      },
    ];
    const username = "whosaidthisbot";
    const keywords = [
      { word: "Bot", partOfSpeech: "NNS" },
      { word: "tweet", partOfSpeech: "NNS" },
      { word: "Source", partOfSpeech: "NNS" },
    ];
    const tweetId = "jestNoAccessDeniedTest";

    const topResult = await processing.getTopResult(
      results,
      username,
      keywords,
      tweetId
    );
    expect(topResult).toBeDefined();
    cluster = topResult.cluster;
    console.log(topResult);
    expect(cluster).toBeDefined();
    expect(topResult.topResult).toBeNull;
  });

  afterAll(async () => {
    let scraper = require("../modules/processing/scraper");
    await scraper.closeCluster(cluster);
  });
});
