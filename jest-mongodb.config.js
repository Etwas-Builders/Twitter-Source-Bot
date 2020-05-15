module.exports = {
  mongodbMemoryServerOptions: {
    instance: {
      dbName: "tweets",
    },
    binary: {
      version: "3.6.3", // Version of MongoDB
      skipMD5: true,
    },
    autoStart: false,
  },
};
