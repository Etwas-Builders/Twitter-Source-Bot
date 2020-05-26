/**
 * @jest-environment node
 */
const processing = require("../modules/processing/processing");
const scraper = require("../modules/processing/scraper");
const nlp = require("../modules/nlp");

let cluster;

describe("Time Difference", () => {
  it("Time Difference is Defined", () => {
    expect(processing.timeDif).toBeDefined();
  });
  it("Time Difference is a Function", () => {
    expect(typeof processing.timeDif).toBe("function");
  });
  it("Time Difference Under 30 Day Test", () => {
    let testDate = new Date();
    expect(processing.timeDif(testDate)).toBe(0.1);
  });
  it("Time Difference Not Found Test", () => {
    expect(processing.timeDif("Not Found")).toBe(0);
  });
  it("Time Difference Max Difference", () => {
    let testDate = new Date("2015");
    expect(processing.timeDif(testDate)).toBeLessThanOrEqual(0.5);
  });
});

describe("Url Sorting", () => {
  it("URL Sorting is defined", () => {
    expect(processing.urlSorting).toBeDefined();
  });
  it("URL Sorting is a function", () => {
    expect(typeof processing.urlSorting).toBe("function");
  });
  it("Http Test", () => {
    let results = [{ url: "http://httptest.com/1" }];
    let sortedResults = processing.urlSorting(results);
    expect(sortedResults).toBeDefined;
    expect(sortedResults.length).toBeGreaterThan(0);
    expect(sortedResults[0].score).toBe(-0.5);
  });
  it("Live/Latest and PDF Test", () => {
    let results = [
      { url: "https://livetest.com/live" },
      { url: "https://livetest.com/latest" },
      { url: "https://randomsite.com/" },
      { url: "https://randomsite.com/random-file.pdf" },
    ];

    const validScore = (element) => element.score === -0.75;

    let sortedResults = processing.urlSorting(results);
    expect(sortedResults).toBeDefined;
    expect(sortedResults.length).toBe(3);
    expect(sortedResults.every(validScore)).toBe(true);
  });
  it("Whitelist Test", () => {
    let results = [
      { url: "https://notinwhitelist.com/hello" },
      { url: "https://reuters.com/test" },
    ];
    let sortedResults = processing.urlSorting(results);
    expect(sortedResults).toBeDefined;
    expect(sortedResults.length).toBe(2);
    expect(sortedResults[0].url).toBe("https://reuters.com/test");
    expect(sortedResults[0].score).toBe(1);
    expect(sortedResults[1].score).toBe(0);
  });
  it("Blacklist test", () => {
    let results = [
      { url: "https://WolfStreet.com/1" },
      { url: "https://lifeprevention.com/1" },
      { url: "https://sensationalisttimes.com/1" },
      { url: "https://policestateusa.com/1" },
    ];
    let BlacklistResults = processing.urlSorting(results);
    expect(BlacklistResults).toBeDefined;
    expect(BlacklistResults.length).toBe(3);
    expect(BlacklistResults[0].score).toBe(-2.5);
    expect(BlacklistResults[1].score).toBe(-5);
    expect(BlacklistResults[2].score).toBe(-7.5);
  });

  it("Twitter Test", () => {
    let results = [
      { url: "https://twitter.com/CryogenicPlanet/status/1264453057607155712" },
    ];
    let username = "CryogenicPlanet";
    let sortedResults = processing.urlSorting(results, username);
    expect(sortedResults).toBeDefined;
    expect(sortedResults.length).toBe(0);
  });

  it("Cumulative Sorting Test", () => {
    let results = [
      { url: "https://WolfStreet.com/1" },
      { url: "https://twitter.com/CryogenicPlanet/status/1264453057607155712" },
      { url: "https://lifeprevention.com/1" },
      { url: "https://sensationalisttimes.com/1" },
      { url: "https://policestateusa.com/1" },
      { url: "https://livetest.com/live" },
      { url: "https://livetest.com/latest" },
      { url: "https://randomsite.com/" },
      { url: "https://notinwhitelist.com/hello" },
      { url: "https://reuters.com/test" },
      { url: "http://httptest.com/1" },
    ];
    let username = "CryogenicPlanet";
    let sortedResults = processing.urlSorting(results, username);
    expect(sortedResults).toBeDefined;
    expect(sortedResults.length).toBe(8);
    expect(sortedResults[0].url).toBe("https://reuters.com/test");
    expect(sortedResults[2].url).toBe("http://httptest.com/1");
    expect(sortedResults[4].score).toBe(-0.75);
    expect(sortedResults[sortedResults.length - 1].url).toBe(
      "https://WolfStreet.com/1"
    );
  });
});

describe("Mention Escaping", () => {
  it("Mention Escaping", () => {
    expect(processing.mentionEscaping).toBeDefined;
  });
  it("Mention is a function", () => {
    expect(typeof processing.mentionEscaping).toBe("function");
  });
  it("Mention Escaping Test With @", () => {
    expect(processing.mentionEscaping("@cryogenicplanet")).toBe(
      "@ cryogenicplanet"
    );
  });
  it("Mention Escaping Test without @", () => {
    expect(processing.mentionEscaping("cryogenicplanet")).toBe(
      "cryogenicplanet"
    );
  });
});

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
    await scraper.closeCluster(cluster);
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
    await scraper.closeCluster(cluster);
    expect(topResult.topResult).toBeNull;
  });

  afterAll(async () => {
    let scraper = require("../modules/processing/scraper");
    await scraper.closeCluster(cluster);
  });
});
