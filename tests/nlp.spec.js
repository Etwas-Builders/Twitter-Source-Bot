/**
 * @jest-environment node
 */
const nlp = require("../modules/nlp");

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
  });
  // @rithvik MORE Unit tests here
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
