/**
 * @jest-environment node
 */
require("dotenv").config();
const { Autohook } = require("twitter-autohook");
const { createHttpTerminator } = require("http-terminator");

let webhook;
describe("Autohook Connection Test", () => {
  beforeAll(() => {
    webhook = new Autohook({
      token: process.env.ACCESS_TOKEN,
      token_secret: process.env.ACCESS_TOKEN_SECRET,
      consumer_key: process.env.CONSUMER_KEY,
      consumer_secret: process.env.CONSUMER_SECRET,
      env: process.env.TWITTER_WEBHOOK_ENV,
      port: 1337,
    });
  });
  it("Twitter Subscription Test", async () => {
    expect(webhook).toBeDefined;
    try {
      await webhook.removeWebhooks();

      // Listens to incoming activity
      webhook.on("event", (event) => console.info(event));

      // Starts a server and adds a new webhook
      await webhook.start();

      // Subscribes to a user's activity
      webhookSubscribe = await webhook.subscribe({
        oauth_token: process.env.ACCESS_TOKEN,
        oauth_token_secret: process.env.ACCESS_TOKEN_SECRET,
      });
    } catch (err) {
      expect(err).toThrowError(`Unable to connect to autohook \n ${err}`);
      process.exit(-1);
    }
    expect(webhookSubscribe).toBeTruthy;
  });

  it("Twitter UnSubscription Test", async () => {
    try {
      let unsubscriptionStatus = await webhook.unsubscribe(
        "1255487054219218944"
      );
      expect(unsubscriptionStatus).toBeTruthy;
    } catch (err) {
      expect(err).toThrowError(`Unable to unsubscribe from autohook \n ${err}`);
      process.exit(-1);
    }
  });

  afterAll(async () => {
    await webhook.removeWebhooks();
    let server = webhook.server;
    const httpTerminator = createHttpTerminator({
      server,
    });
    await httpTerminator.terminate();
  });
});
