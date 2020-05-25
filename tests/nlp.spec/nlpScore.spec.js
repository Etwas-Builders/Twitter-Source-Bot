/**
 * @jest-environment node
 */
require("dotenv").config();
const nlp = require("../../modules/nlp");
const whitelist = require("../../modules/processing/whitelist.json");
const blacklist = require("../../modules/processing/blacklist.json");
const testCases = require("./nlp.testCases.json");
const dbTestCases = require("./nlp.dbTestCases.json");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);

describe("Score Page JSON Automated Testing", () => {
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
});
describe("Score Page DB Automated Testing", () => {
  dbTestCases.forEach(({ id, type, tweetContent, citation }) => {
    test(`${type} test of id ${id}`, async () => {
      let url = citation.url;
      //console.info(text);
      const keywords = await nlp.wordsToSearch(tweetContent);
      //console.info(id, keywords);
      expect(keywords).toBeTruthy;
      expect(keywords.length).toBeGreaterThan(0);
      expect(keywords[0].word).toBeTruthy;
      const data = {
        title: citation.title,
        text: citation.body,
      };
      const result = { url: citation.url };
      const tweetId = `jestScorePageDbTest-${id}`;
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
        expect(score).toBeLessThan(2.9);
      }
    });
  });
});
