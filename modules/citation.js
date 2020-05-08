const axios = require("axios");
const himalaya = require("himalaya");
const dom = require("./dom");
const Fuse = require("fuse.js");
var exports = (module.exports = {});

exports.googleNews = async function (data) {
  // Get Google News Citation
  let getNewsByKeyword = async (keyword) => {
    var url =
      "http://newsapi.org/v2/everything?" +
      `q=${keyword}&` +
      "from=2020-04-18&" +
      "sortBy=popularity&" +
      `apiKey=${process.env.SEARCH_API_KEY}`;

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
  let response = await axios({
    method: "GET",
    url: "https://google-search5.p.rapidapi.com/get-results",
    headers: {
      "content-type": "application/octet-stream",
      "x-rapidapi-host": "google-search5.p.rapidapi.com",
      "x-rapidapi-key": "a5a73f927dmsh0a78b954b177d5dp1d3218jsn53070cc53b99",
    },
    params: {
      country: "us",
      offset: "0",
      hl: "en-US",
      q: query,
    },
  });
  console.log("Citation -> googleSearch -> data", response.data);
  let results = response.data.results;
  console.log("Citation -> googleSearch -> results", results);
  let topResults = results.organic_results;
  return topResults;
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
