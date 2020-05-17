/**
 * @jest-environment node
 */
require("dotenv").config();
const database = require("../modules/database");
const mongoose = require("mongoose");

mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);

describe("All Database Test", () => {
  beforeAll(async () => {
    try {
      await mongoose.connect(`mongodb://${process.env.MONGO_URL}`, (err) => {
        if (err) {
          console.info(err);
          expect(err).toThrowError(err);
        }
      });
    } catch (err) {
      console.info(err);
      expect(err).toThrowError(err);
    }
  });

  it("Check Tweet Cache is Defined", () => {
    expect(database.checkTweetCache).toBeDefined();
  });
  it("Check Tweet Cache is a function", () => {
    expect(typeof database.checkTweetCache).toBe("function");
  });
  it("Check Tweet Cache with valid tweetId but expired", async () => {
    try {
      const tweetId = "1260243604125052929";
      const result = await database.checkTweetCache(tweetId);
      console.log("DB Result", result);
      expect(result).toBeDefined;
    } catch (err) {
      console.log("Error connecting", err);
      expect(err).toThrowError("Unable to connect to db");
    }
  });

  it("Is Tweet Handled is Defined", () => {
    expect(database.isTweetHandled).toBeDefined;
  });
  it("Is Tweet Handled is a function", () => {
    expect(typeof database.isTweetHandled).toBe("function");
  });
  it("Is Tweet Handled Test", async () => {
    expect(await database.isTweetHandled("1261877608490446848")).toBeTruthy;
  });
  it("Is Tweet Unhandled Test", async () => {
    expect(await database.isTweetHandled("unhandledJestTest")).toBeFalsy;
  });

  afterAll(async () => {
    try {
      //console.log("Database closing");
      await mongoose.connection.close();
      //console.log("Database closed");
    } catch (err) {
      expect(err).toThrowError(`Unable to Close Db \n ${err}`);
    }
  });
});
