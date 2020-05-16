/**
 * @jest-environment node
 */
require("dotenv").config();
const database = require("../modules/database");
const mongoose = require("mongoose");

mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);

describe("Check Cached Tweets", () => {
  beforeAll(async () => {
    await mongoose.connect(`mongodb://${process.env.MONGO_URL}`, (err) => {
      if (err) {
        console.log(err);
        expect(err).toThrowError(err);
      }
    });
  });

  it("Check Tweet Cache is Defined", () => {
    expect(database.checkTweetCache).toBeDefined();
  });
  it("Check Tweet Cache is a function", () => {
    expect(typeof database.checkTweetCache).toBe("function");
  });
  it("Check Tweet Cache with valid tweetId but expired", async () => {
    try {
      let con = await mongoose.connect(`mongodb://${process.env.MONGO_URL}`);

      const tweetId = "1260243604125052929";
      const result = await database.checkTweetCache(tweetId);
      console.log("DB Result", result);
      expect(result).toBeDefined;
    } catch (err) {
      console.log("Error connecting", err);
      expect(err).toThrowError("Unable to connect to db");
    }
  });

  afterAll(async () => {
    console.log("Database closing");
    await mongoose.connection.close();
    console.log("Database closed");
  });
});
