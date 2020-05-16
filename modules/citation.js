const axios = require("axios");
var exports = (module.exports = {});

const IP = require("./ip");

let googleSearch = async function (query) {
  try {
    let pythonResults = await pythonScraper(query);
    return pythonResults;
  } catch (err) {
    return [];
  }
};

let pythonScraper = async function (query) {
  let ip = await IP.getCurrentIp();
  let response = await axios.get(`http://${ip}:5000/search`, {
    params: {
      query: query,
    },
  });
  let results = response.data.results;
  //console.log("results", results);
  if (results.length === 0) {
    return [];
  }
  return results;
};

let getSearchResults = async function (keywords) {
  let query = keywords.map((e) => e.word).join(" ");
  query += ` "news"`;
  console.log("Tweet -> getSearchResults -> query", query);
  let results = await googleSearch(query);
  results = results.splice(0, 10);
  query = keywords.map((e) => e.word).join(" ");
  console.log("Tweet -> getSearchResults -> newQuery", query);
  let newResults = await googleSearch(query);
  if (newResults) {
    newResults = newResults.splice(0, 10);
    results.push(...newResults);
  }

  return results;
};

exports.getSearchResults = getSearchResults;
exports.googleSearch = googleSearch;
