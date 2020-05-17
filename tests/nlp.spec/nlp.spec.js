/**
 * @jest-environment node
 */
const nlp = require("../../modules/nlp");
const whitelist = require("../../modules/processing/whitelist.json");
const blacklist = require("../../modules/processing/blacklist.json");
const testCases = require("./nlp.testCases.json");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);

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

    const score = await nlp.scorePage(
      result,
      data,
      keywords,
      tweetId,
      "jestTest"
    );
    expect(score).toBeDefined();
    expect(typeof score).toBe("number");
  });
});

describe("Score Page Automated Testing", () => {
  // beforeAll(async () => {
  //   await mongoose.connect(`mongodb://${process.env.MONGO_URL}`, (err) => {
  //     if (err) {
  //       console.log(err);
  //       expect(err).toThrowError(err);
  //     }
  //   });

  //   mongoose.connection.db.collection("nlpSchemas", async function (
  //     err,
  //     collection
  //   ) {
  //     if (err) {
  //       console.error(err);
  //     }
  //     console.info("schema accessed");
  //     let response = await collection.remove({
  //       tweetId: { $regex: "jestScorePageTest*" },
  //     });
  //     console.info(response);
  //   });
  // });

  testCases.forEach(({ id, type, content, pagePath, url, slow }) => {
    test(`${type} test of id ${id}`, async () => {
      let filePath = path.join(__dirname, pagePath);
      let text = fs.readFileSync(filePath).toString();
      //console.info(text);
      const keywords = await nlp.wordsToSearch(content);
      //console.info(id, keywords);
      expect(keywords).toBeTruthy;
      expect(keywords.length).toBeGreaterThan(0);
      expect(keywords[0].word).toBeTruthy;
      const data = {
        title: id,
        text: text,
      };
      const result = { url: pagePath };
      const tweetId = `jestScorePageTest-${id}`;
      let score = await nlp.scorePage(
        result,
        data,
        keywords,
        tweetId,
        "jestTest"
      );

      let pathArray = url.split("/");
      let host = pathArray[2];
      if (host.includes("www")) {
        host = host.slice(4);
      }
      if (host in whitelist) {
        score += 1;
      }
      if (host in blacklist) {
        score = blacklist[host] !== 1 ? score - 10 * blacklist[host] : -1;
        if (score === -1) {
          if (type === "Good") {
            expect(score).toThrowError("Good Case in Absolute Blacklist");
          }
        }
      }

      expect(score).toBeDefined;
      if (type === "Good") {
        expect(score).toBeGreaterThan(3);
      } else if (type === "Bad") {
        if (slow) {
          expect(score).toBeLessThan(5);
        } else {
          expect(score).toBeLessThan(3);
        }
      }
    });
  });
  // afterAll(async () => {
  //   console.info("Database closing");
  //   await mongoose.connection.close();
  //   console.info("Database closed");
  // });
});
