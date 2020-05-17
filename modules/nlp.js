const stopwords = require("stopword");
const natural = require("natural");
const axios = require("axios");
const _ = require("lodash");

const IP = require("./ip");

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

let removePunctuation = function (word) {
  let newline_separator = ["\n", "\n\n"];
  let words = word.split(new RegExp(newline_separator.join("|"), "g"));
  let correctWords = [];
  for (let w of words) {
    let checkNum = word.replace(",", "");
    w = w.replace(/['"‘’“”!?]+/g, "");
    if (isNaN(checkNum)) {
      let tempWs = w.split(",");
      correctWords.push(...tempWs);
    } else {
      correctWords.push(w);
    }
  }
  return correctWords;
};

let wordsToSearch = function FindWordsToSearch(text) {
  textArray = text.split(" ");
  let stopWords = stopwords.removeStopwords(textArray);
  //var finalWords = [];
  let word_json = [];

  let wordsToSearch = [];
  for (let word of stopWords) {
    let correctWords = removePunctuation(word);
    wordsToSearch.push(...correctWords);
  }
  length = wordsToSearch.length;
  let mainWords = [];
  let normalNouns = [];
  for (index = 0; index < length; index++) {
    let currentWord = wordsToSearch[index];

    if (currentWord === "@whosaidthis_bot") {
      continue;
    }
    let editedWord =
      currentWord[0] === "@" || currentWord[0] === "#"
        ? currentWord.slice(1)
        : currentWord;

    currentWord =
      GetPartOfSpeech(editedWord) === "NNPS" ||
      GetPartOfSpeech(editedWord) === "NNP"
        ? editedWord
        : currentWord;

    let partOfSpeech = GetPartOfSpeech(currentWord);

    if (partOfSpeech == "NNPS" || partOfSpeech == "NNP") {
      //finalWords.push(currentWord);
      mainWords.push({ word: currentWord, partOfSpeech: partOfSpeech });
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
      if (currentWord[0] === "#" && Math.random() <= 0.25) {
        normalNouns = [
          { word: currentWord, partOfSpeech: partOfSpeech },
        ].concat(normalNouns);
      } else {
        normalNouns.push({ word: currentWord, partOfSpeech: partOfSpeech });
      }
      wordsToSearch.splice(index, 1);
      index--;
      length = wordsToSearch.length;
    } else if (
      partOfSpeech === "VBG" ||
      partOfSpeech === "VBN" ||
      partOfSpeech === "VB"
    ) {
      //finalWords.push(currentWord);
      word_json.push({ word: currentWord, partOfSpeech: partOfSpeech });
      wordsToSearch.splice(index, 1);
      index--;
      length = wordsToSearch.length;
    }
  }
  let temp = mainWords.concat(normalNouns);
  word_json = mainWords.concat(temp);
  for (index = 0; index < wordsToSearch.length; index++) {
    let currentWord = wordsToSearch[index];
    if (currentWord === "@whosaidthis_bot") {
      continue;
    }
    let partOfSpeech = GetPartOfSpeech(currentWord);
    word_json.push({ word: currentWord, partOfSpeech: partOfSpeech });
  }

  //finalWords.push(currentWord);

  word_json = _.uniqBy(word_json, "word");
  return word_json;
  //return finalWords;
};

function GetPartOfSpeech(word) {
  let sentence = tagger.tag(word.split(" "));
  return sentence["taggedWords"][0]["tag"];
}

exports.scorePage = async function (result, data, keywords, tweetId) {
  let ip = await IP.getCurrentIp();
  let response = await axios.post(`http://${ip}:5000/processBody`, {
    data: data,
    keywords: keywords,
    url: result.url,
    tweetId: tweetId,
  });
  let score = response.data.score;
  console.log("NLP -> scorePage -> score", score);
  return score; // Between 0 and 1
};

exports.handleThread = async function (text) {
  let keywords = await wordsToSearch(text);
  keywords = keywords.splice(0, 25);
  return keywords;
};

exports.wordsToSearch = wordsToSearch;
