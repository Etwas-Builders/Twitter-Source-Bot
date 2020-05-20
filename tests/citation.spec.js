/**
 * @jest-environment node
 */
const citation = require("../modules/citation");

// undefined == null true
// undefined === null false

describe("Google Search API", () => {
  it("Google Search is Defined", function () {
    expect(citation.googleSearch).toBeDefined();
  });
  it("Google Search is a Function", function () {
    expect(typeof citation.googleSearch).toBe("function");
  });
  it("Gets Results for query speedtest", async () => {
    const result = await citation.googleSearch(`speedtest`);
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    const url = result[0].url;
    expect(url).toBeDefined();
    expect(url.length).toBeGreaterThan(0);
  });
});

describe("Get Search Results", () => {
  it("Search Results is a function", async () => {
    expect(typeof citation.getSearchResults).toBe("function");
  });
  it("Search results fit criteria", async () => {
    const results = await citation.getSearchResults([
      { word: "speedtest", partOfSpeech: "NNS" },
    ]);

    /*
     { url: 'https://www.ookla.com/about/press' },
      { url: 'https://economictimes.indiatimes.com/topic/SpeedTest' },
      { url: 'https://www.ndtv.com/topic/speedtest' },
    */

    expect(results.length).toBeLessThanOrEqual(20);
  });
});

describe("Se Scraper Test", () => {
  it("Se Scraper is Defined", () => {
    expect(citation.seScraper).toBeDefined;
  });
  it("Se Scraper is a Function", () => {
    expect(typeof citation.seScraper).toBe("function");
  });
  it("Se Scraper test query", async () => {
    let query = "test";
    let results = await citation.seScraper(query);
    expect(results).toBeDefined;
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].url).toBeDefined;
    expect(results[0].url.length).toBeGreaterThan(0);
  });
});
