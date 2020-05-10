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
  //var finalWords = [];
  var word_json = [];
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
      //finalWords.push(currentWord);
      word_json.push({ word: currentWord, partOfSpeech: partOfSpeech });
      //Removes the current word from the list
      wordsToSearch.splice(index, 1);
      index--;
      length = wordsToSearch.length;
    } else if (
      partOfSpeech == "NNS" ||
      partOfSpeech == "NN" ||
      partOfSpeech == "N"
    ) {
      //finalWords.push(currentWord);
      word_json.push({ word: currentWord, partOfSpeech: partOfSpeech });
      wordsToSearch.splice(index, 1);
      index--;
      length = wordsToSearch.length;
    }
  }

  for (index = 0; index < wordsToSearch.length; index++) {
    let currentWord = wordsToSearch[index];
    let partOfSpeech = GetPartOfSpeech(currentWord);
    word_json.push({ word: currentWord, partOfSpeech: partOfSpeech });
    //finalWords.push(currentWord);
  }
  return word_json;
  //return finalWords;
};

function GetPartOfSpeech(text) {
  let sentence = tagger.tag(text.split(" "));
  return sentence["taggedWords"][0]["tag"];
}

exports.scorePage = async function (result, data, keywords) {
  let ip = await publicIp.v4();
  if (ip !== process.env.GCP_IP) {
    ip = "127.0.0.1";
  }
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
