var exports = (module.exports = {});

//const scrapper = require("./scrapper");

const whitelist = require("./whitelist.json");
const blacklist = require("./blacklist.json");

/*
  BLACKLIST SCHEMA

  "hostName" : score

  Score categories 

  Custom BAN : -1, Example Youtube.com, Facebook.com

  List of sources https://docs.google.com/document/d/10eA5-mCZLSS4MQY5QGb5ewC3VAL6pLkT53V_81ZyitM/preview

  Score based on classification 

  Satire : -0.25
  Unknown : -0.5
  Unreliable : -0.75
  Everything Else : -1, Straight Ban


*/

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
      let protocol = pathArray[0]; // HTTPS or HTTP
      result.score = 0; // Initialization
      if (protocol === "https") {
        result.score += 0.5;
      }
      let host = pathArray[2];
      if (host.includes("www")) {
        host = host.slice(4);
      }
      console.log("Processing -> getTopResult -> url", host);
      if (host in blacklist) {
        result.score = blacklist[host];
        console.log("Found blacklisted score", host);
      }
      if (host in whitelist) {
        result.score += 1;
        console.log("Found whitelisted source", host);
      } else {
        result.score += 0;
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
