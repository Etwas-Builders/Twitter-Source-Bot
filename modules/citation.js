var exports = (module.exports = {});

exports.googleNews = async function (data) {
  // Get Google News Citation
  let text = data.text;
  var url =
    "http://newsapi.org/v2/everything?" +
    "q=Apple&" +
    "from=2020-04-18&" +
    "sortBy=popularity&" +
    "apiKey=9f378bb498a54e4f93e2c5dabc13a3e2";

  var req = new Request(url);

  fetch(req).then(function (response) {
    console.log(response.json());
  });
};

exports.wiki = async function (data) {
  // Get Wiki Citation
  let response = await fetch();
  let text = data.text;

  return "output"; // Returned output
};
