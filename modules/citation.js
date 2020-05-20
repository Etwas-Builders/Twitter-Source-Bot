const axios = require("axios");
var exports = (module.exports = {});
const se_scraper = require("se-scraper");
const any = require("promise.any");

const IP = require("./ip");

let googleSearch = async function (query) {
  try {
    //let results = await pythonScraper(query);
    let results = await sebitesApi(query);
    if (results.length === 0) {
      console.error("RAPID API FAILED");
      let searches = [];
      searches.push(pythonScraper(query));
      searches.push(seScraper(query));
      return await any(searches)
        .then(async (results) => {
          return results;
        })
        .catch((err) => {
          console.error("No Results found from all three scraper");
          return [];
        });
    }
    return results;
  } catch (err) {
    console.error("RAPID API FAILED");
    let searches = [];
    searches.push(pythonScraper(query));
    searches.push(seScraper(query));
    return await any(searches)
      .then(async (results) => {
        return results;
      })
      .catch((err) => {
        console.error("No Results found from all three scraper");
        return [];
      });
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
        gl: "us",
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
  try {
    let response = await axios.get(`http://${ip}:5000/search`, {
      params: {
        query: query,
      },
    });
    let results = response.data.results;
    //console.log("results", results);
    if (results.length === 0) {
      return Promise.reject("Could Not Find Results");
    }
    return results;
  } catch (err) {
    return Promise.reject("Could Not Find Results");
  }
};

let getSearchResults = async function (keywords, userScreenName) {
  let words = keywords.map((e) => e.word);
  let parts = keywords.map((e) => e.partOfSpeech);
  if (!("NNS" in parts || "NNPS" in parts)) {
    keywords.push({ word: userScreenName, partOfSpeech: "SP" });
  }
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

let seScraper = async function (query) {
  try {
    let engines = ["bing", "google"];

    let browser_config = {
      debug_level: 1,
      block_assets: true,
      apply_evasion_techniques: true,
    };

    let scraper = new se_scraper.ScrapeManager(browser_config);

    await scraper.start();

    let search_words = [query];

    let scrape_results = {
      googleResults: scraper.scrape({
        search_engine: "google",
        keywords: search_words,
        num_pages: 1,
      }),
      bingResults: scraper.scrape({
        search_engine: "bing",
        keywords: search_words,
        num_pages: 1,
      }),
    };

    return await any(Object.values(scrape_results))
      .then(async (res) => {
        await scraper.quit();
        let processedResults = res.results[query]["1"].results;
        processedResults = processedResults.map((e) => {
          return { url: e.link, ...e };
        });

        return processedResults;
      })
      .catch(async function (error) {
        console.log(error);
        await scraper.quit();
        return Promise.reject("Could Not Find Results");
      });
  } catch (err) {
    return Promise.reject(`Error Occurred ${err}`);
  }
};

exports.seScraper = seScraper;
exports.getSearchResults = getSearchResults;
exports.googleSearch = googleSearch;
