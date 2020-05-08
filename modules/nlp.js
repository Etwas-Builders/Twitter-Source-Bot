const stopwords = require("stopword");
const wordnet = require("node-wordnet");
const natural = require("natural");
const publicIp = require("public-ip");
const axios = require("axios");

var exports = (module.exports = {});

const language = "EN";
const defaultCategory = "N";
const defaultCategoryCapitalized = "NNP";

var lexicon = new natural.Lexicon(
  language,
  defaultCategory,
  defaultCategoryCapitalized
);
var ruleSet = new natural.RuleSet("EN");
var tagger = new natural.BrillPOSTagger(lexicon, ruleSet);

exports.wordsToSearch = function FindWordsToSearch(text) {
  const textArray = text.split(" ");
  var wordsToSearch = stopwords.removeStopwords(textArray);
  var finalWords = [];
  length = wordsToSearch.length;

  for (index = 0; index < length; index++) {
    let currentWord = wordsToSearch[index];

    //Removes hashtags from tweets
    if (currentWord[0] == "#") {
      editedWord = currentWord.slice(1, currentWord.length);
      currentWord = editedWord;
    }

    let partOfSpeech = GetPartOfSpeech(currentWord);

    if (partOfSpeech == "NNPS" || partOfSpeech == "NNP") {
      finalWords.push(currentWord);
      //Removes the current word from the list
      wordsToSearch.splice(index, 1);
      index--;
      length = wordsToSearch.length;
    } else if (
      partOfSpeech == "NNS" ||
      partOfSpeech == "NN" ||
      partOfSpeech == "N"
    ) {
      finalWords.push(currentWord);
      wordsToSearch.splice(index, 1);
      index--;
      length = wordsToSearch.length;
    }
  }

  for (index = 0; index < wordsToSearch.length; index++) {
    let currentWord = wordsToSearch[index];
    finalWords.push(currentWord);
  }
  return finalWords;
};

function GetPartOfSpeech(text) {
  let sentence = tagger.tag(text.split(" "));
  return sentence["taggedWords"][0]["tag"];
}

exports.scorePage = async function (result, data, keywords) {
  let ip = await publicIp.v4();
  console.log("NLP -> scorePage -> ip", ip);
  let response = await axios.post(`http://${ip}:5000/processBody`, {
    data: data,
    keywords: keywords,
    url: result.url,
  });
  let score = response.data.score;
  console.log("NLP -> scorePage -> score", score);
  return score; // Between 0 and 1
};
