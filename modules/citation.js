const axios = require("axios");
const himalaya = require("himalaya");
const dom = require("./dom");
const Fuse = require("fuse.js");
var exports = (module.exports = {});
const publicIp = require("public-ip");

exports.googleNews = async function (data) {
  // Get Google News Citation
  let getNewsByKeyword = async (keyword) => {
    var url =
      "http://newsapi.org/v2/everything?" +
      `q=${keyword}&` +
      "from=2020-04-18&" +
      "sortBy=popularity&" +
      `apiKey=${process.env.NEWS_API_KEY}`;

    var res = await axios.get(url);
    return res.data;
  };

  (async () => {
    let output = await getNewsByKeyword("Apple");
    global.output = output;
    console.log(output.articles);
  })();
};

exports.googleSearch = async function (query) {
  // try {
  //   console.log("Executing Query!");
  //   let response = await axios({
  //     method: "GET",
  //     url: "https://google-search5.p.rapidapi.com/get-results",
  //     headers: {
  //       "content-type": "application/octet-stream",
  //       "x-rapidapi-host": "google-search5.p.rapidapi.com",
  //       "x-rapidapi-key": process.env.SEARCH_API_KEY,
  //     },
  //     params: {
  //       country: "us",
  //       offset: "0",
  //       hl: "en-US",
  //       q: query,
  //     },
  //   });

  //   let results = response.data.results;
  //   let topResults = results.organic_results;

  //   return topResults;
  //} catch (err) {
  try {
    console.log("Rapid Api Failed");
    let pythonResults = await pythonScraper(query);
    return pythonResults;
  } catch (err) {
    return [];
  }
  //}
};

let FindWiki = async (title) => {
  var url = `https://en.wikipedia.org/api/rest_v1/page/html/${title}`;
  var output = await axios.get(url);
  return output.data;
};

exports.wiki = async function (data) {
  // Get Wiki Citation
  let title = data.title;
  let html = await FindWiki(title);
  let json = await himalaya.parse(html);
  let document = json.find((el) => tagName == "html");
  let body = await dom.getElementByTag(document, "body")[0];
  let texts = await dom.getElementByType(document, "text");
  let allTextContent = [];

  for (let text of texts) {
    if (
      (text.content.includes("\n") && text.content.length <= 2) ||
      text.content == null ||
      text.content.length <= 2
    ) {
      continue;
    }
    allTextContent.push({ text: text.content }); // HERE
  }

  const options = {
    isCaseSensitive: false,
    findAllMatches: false,
    includeMatches: false,
    includeScore: true,
    useExtendedSearch: true,
    minMatchCharLength: 1,
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    keys: ["text"],
  };
  const fuse = new Fuse(allTextContent, options);
  let results = fuse.search("Rap");
  results.reverse();
};

let pythonScraper = async function (query) {
  let ip = await publicIp.v4();
  if (ip !== process.env.GCP_IP) {
    ip = "127.0.0.1";
  }
  let response = await axios.get(`http://${ip}:5000/search`, {
    params: {
      query: query,
    },
  });
  let results = response.data.results;
  console.log("results", results);
  if (results.length === 0) {
    return [];
  }
  return results;
};
