const axios = require("axios");
var exports = (module.exports = {});

const IP = require("./ip");

let googleSearch = async function (query) {
  try {
    //let results = await pythonScraper(query);
    let results = await sebitesApi(query);
    return results;
  } catch (err) {
    return await pythonScraper(query);
  }
};

let sebitesApi = async function (query) {
  try {
    console.log("Rapid Api!");
    let response = await axios({
      method: "GET",
      url: "https://api.sebites.com/gs/search-results",
      headers: {
        "content-type": "application/octet-stream",
        "X-SEBITES-KEY": process.env.SEARCH_API_KEY,
      },
      params: {
        country: "us",
        hl: "en-US",
        q: query,
      },
    });

    let results = response.data.results;
    let topResults = results.organic_results;

    return topResults;
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
