/**
 * @jest-environment node
 */
const nlp = require("../../modules/nlp");
const testCases = require("./nlp.testCases.json");
const path = require("path");
const fs = require("fs");

describe("Words to Search", function () {
  it("Words to Search is Defined", () => {
    expect(nlp.wordsToSearch).toBeDefined();
  });
  it("Words to Search should be a function", () => {
    expect(typeof nlp.wordsToSearch).toBe("function");
  });
  it("Words to Search on Basic Tweet ` Air conditioning is needed by so many people, especially in Miami!! The poor people are suffering most of all from this heat ` ", async () => {
    const input = ` Air conditioning is needed by so many people, especially in Miami!! The poor people are suffering most of all from this heat`;
    const results = await nlp.wordsToSearch(input);
    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);
    const firstWord = results[0].word;
    //console.log(results);
    expect(firstWord).toBeDefined();
    expect(firstWord.length).toBeGreaterThan(0);
    const partOfSpeech = results[0].partOfSpeech;
    expect(partOfSpeech).toBe("NNP");
    expect(firstWord.includes("!")).toBeFalsy;
    expect(firstWord[0] === "m").toBeTruthy;
  });
});

describe("Score Page", () => {
  it("Score Page is Defined", () => {
    expect(nlp.scorePage).toBeDefined();
  });
  it("Score Page is a function", () => {
    expect(typeof nlp.scorePage).toBe("function");
  });
  it("Score Page Api is active", async () => {
    const data = {
      title: "This is test",
      text: "This is a test body with test text",
    };
    const result = {
      url: "twittersourcebot.tech/nlp.spec/test",
    };
    const keywords = [
      { word: "Test", partOfSpeech: "NNS" },
      { word: "body", partOfSpeech: "NNS" },
    ];
    const tweetId = "jestTestTweet";

    const score = await nlp.scorePage(result, data, keywords, tweetId);
    expect(score).toBeDefined();
    expect(typeof score).toBe("number");
  });
});

describe("Score Page Automated Test", () => {
  testCases.forEach(({ id, type, keywords, pagePath }) => {
    test(`${type} test of pagePath ${id}`, async () => {
      let filePath = path.join(__dirname, pagePath);
      let text = fs.readFileSync(filePath).toString();
      //console.info(text);
      const data = {
        title: id,
        text: text,
      };
      const result = { url: pagePath };
      const tweetId = `jestScorePageTest${id}`;
      const score = await nlp.scorePage(result, data, keywords, tweetId);
      expect(score).toBeDefined;
      if (type === "Good") {
        expect(score).toBeGreaterThan(0.45);
      } else if (type === "Bad") {
        expect(score).toBeLessThan(0.45);
      }
    });
  });
});
