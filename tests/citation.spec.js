/**
 * @jest-environment node
 */
const citation = require("../modules/citation");

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
