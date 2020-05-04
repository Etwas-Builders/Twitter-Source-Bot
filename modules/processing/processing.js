var exports = (module.exports = {});

const whitelist = require("./whitelist.json");

exports.getTopResult = async function (results, username) {
  let topResult;

  for (let result of results) {
    if (
      !(
        (result.url.includes(username) && result.url.includes("twitter")) ||
        result.url.includes("youtube") ||
        result.url.includes("facebook")
      )
    ) {
      // Check Language
      let pathArray = result.url.split("/");
      let host = pathArray[2];
      if (host.includes("www")) {
        host = host.slice(4);
      }
      console.log("Processing -> getTopResult -> url", host);
      if (host in whitelist) {
        result.score = 1;
        console.log("Found whitelisted source", host);
      } else {
        result.score = 0;
      }
    } else {
      result.score = -1;
    }
  }
  results.sort((a, b) => a.score - b.score); // Sort by score
  console.log("Processing -> getTopResult -> sortedResults", results);
  for (let result of results) {
    if (result.score !== -1) {
      topResult = result;
    }
  }
  return topResult;
};
