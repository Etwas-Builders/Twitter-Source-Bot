const axios = require("axios");
var exports = (module.exports = {});

const IP = require("./ip");

let googleSearch = async function (query) {
  try {
    //let results = await pythonScraper(query);
    let results = await sebitesApi(query);
    if (results.length === 0) {
      return await pythonScraper(query);
    }
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
      useQueryString: true,
      params: {
        limit: 10,
        hl: "en-US",
        q: query,
      },
    });

    let results = response.data.results;

    let topResults = results.organic_results;
    //console.log("Rapid API Top Results", topResults);
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
  let words = keywords.map((e) => e.word);
  if (words.length > 10) {
    words = words.splice(0, Math.floor(words.length * 0.5));
  }

  let query = words.join(" ");
  query += ` "news"`;
  console.log("Tweet -> getSearchResults -> query", query);
  let results = googleSearch(query);
  query = words.join(" ");
  console.log("Tweet -> getSearchResults -> newQuery", query);
  let newResults = googleSearch(query);

  return await Promise.all([results, newResults]).then((allResults) => {
    console.info("Promise Resolution");
    let output = [];
    for (let result of allResults) {
      result = result.splice(0, 10);
      output = output.concat(result);
    }
    return output;
  });
};

exports.getSearchResults = getSearchResults;
exports.googleSearch = googleSearch;
