/**
 * @jest-environment node
 */
require("dotenv").config();
const nlp = require("../../modules/nlp");
const whitelist = require("../../modules/processing/whitelist.json");
const blacklist = require("../../modules/processing/blacklist.json");
const testCases = require("./nlp.testCases.json");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const testerSchema = require("../../models/testerSchema");

describe("Score Page JSON Automated Testing", () => {
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
// const globalDatabase = {};

// describe("Score Page Mongo Automated Testing", () => {
//   let responses;
//   beforeAll(async () => {
//     try {
//       await mongoose.connect(`mongodb://${process.env.MONGO_URL}`, (err) => {
//         if (err) {
//           console.info(err);
//           expect(err).toThrowError(err);
//         }
//       });
//       responses = await testerSchema.TesterSchema.find();
//       return (globalDatabase.responses = responses);
//     } catch (err) {
//       console.info(err);
//       expect(err).toThrowError(err);
//     }
//   });

//   it("Responses is defined", () => {
//     expect(responses).toBeDefined;
//   });

// globalDatabase.responses.forEach(({ id, type, citation, tweetContent }) => {
//   test(`${type} test of id ${id}`, async () => {
//     const keywords = await nlp.wordsToSearch(tweetContent);
//     const { title, url, body } = citation;
//     const data = {
//       title: title,
//       text: body,
//     };
//     const result = { url: url };
//     const tweetId = `jestScoreMongo-${id}`;
//     let score = await nlp.scorePage(
//       result,
//       data,
//       keywords,
//       tweetId,
//       "jestTest"
//     );

//     let pathArray = url.split("/");
//     let host = pathArray[2];
//     if (host.includes("www")) {
//       host = host.slice(4);
//     }
//     if (host in whitelist) {
//       score += 1;
//     }
//     if (host in blacklist) {
//       score = blacklist[host] !== 1 ? score - 10 * blacklist[host] : -1;
//       if (score === -1) {
//         if (type === "Good") {
//           expect(score).toThrowError("Good Case in Absolute Blacklist");
//         }
//       }
//     }

//     expect(score).toBeDefined;
//     if (type === "Good") {
//       expect(score).toBeGreaterThan(3);
//     } else if (type === "Bad") {
//       if (slow) {
//         expect(score).toBeLessThan(5);
//       } else {
//         expect(score).toBeLessThan(3);
//       }
//     }
//   });
// });
//});
