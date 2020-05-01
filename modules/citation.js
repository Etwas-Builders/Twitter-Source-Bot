const axios = require("axios");
const himalaya = require("himalaya");
const dom = require("./dom");
const Fuse = require('fuse.js')
var exports = (module.exports = {});

exports.googleNews = async function (data) {
  // Get Google News Citation
  let getNewsByKeyword = async (keyword) => {
    var url =
      "http://newsapi.org/v2/everything?" +
      `q=${keyword}&` +
      "from=2020-04-18&" +
      "sortBy=popularity&" +
      "apiKey=9f378bb498a54e4f93e2c5dabc13a3e2";

    var res = await axios.get(url);
    return res.data;
  };

  (async () => {
    let output = await getNewsByKeyword("Apple");
    global.output = output;
    console.log(output.articles);
  })();
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
    if (text.content.includes("\n") && text.content.length <= 2) || text.content == null || text.content.length <=2 {
      continue;
    }
    allTextContent.push({"text" : text.content}) // HERE
  }
    
    const options = {
      isCaseSensitive: false,
      findAllMatches: false,
      includeMatches: false,
      includeScore: true,
      useExtendedSearch: true,
      minMatchCharLength: 1,
      shouldSort: true,
      threshold:0.6,
      location: 0,
      distance: 100,
      keys: [
        "text"
      ]
  };
  const fuse = new Fuse(allTextContent, options);
  let results = fuse.search("Rap")
  results.reverse()
  
  }

  return "output"; // Returned output
};
