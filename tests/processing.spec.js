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
    const tweetId = "jestTestTweet";

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
