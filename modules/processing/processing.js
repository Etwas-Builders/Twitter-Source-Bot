var exports = (module.exports = {});

const whitelist = require("./whitelist.json");

exports.getTopResult = async function (results) {
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
      if (result.url in whitelist) {
        result.score = 1;
      } else {
        result.score = 0;
      }
    } else {
      result.score = -1;
    }
  }
  results.sort((a, b) => b.score - a.score); // Sort by score

  for (let result of results) {
    if (result.score !== -1) {
      topResult = result;
    }
  }
  return topResult;
};
