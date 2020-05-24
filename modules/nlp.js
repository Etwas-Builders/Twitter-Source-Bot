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
    w = w.replace(/["“”●☞']+/g, "");
    w = w.replace(
      /([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g,
      ""
    );
    if (isNaN(checkNum)) {
      if (!w.includes("/t.co/")) {
        // Check if its a twitter link
        let tempWs = w.split(/[,;?!.]+/);
        correctWords.push(...tempWs);
      } else {
        correctWords.push(w);
      }
    } else {
      correctWords.push(w);
    }
  }
  return correctWords;
};

let isSpecial = function (word) {
  try {
    let isSpecial =
      word === word.toUpperCase() ||
      word[0] === "!" ||
      word.includes("coronavirus") ||
      word.includes("covid");
    isSpecial = word.length < 3 ? false : isSpecial;
    //isSpecial ? console.info(isSpecial, word) : null;
    word = word.replace(/['"‘’“”?!●]+/g, "");
    word = word.replace(
      /([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g,
      ""
    );
    word = word.toLowerCase();
    return isSpecial ? word : NaN;
  } catch (err) {
    console.error(err);
    return null;
  }
};

let wordsToSearch = function FindWordsToSearch(text) {
  textArray = text.split(" ");
  let stopWords = stopwords.removeStopwords(textArray);
  //var finalWords = [];
  let word_json = [];

  let wordsToCopy = [];

  let wordsToSearch = [];
  for (let word of stopWords) {
    wordsToCopy.push(word);
    let correctWords = removePunctuation(word);
    wordsToSearch.push(...correctWords);
  }
  length = wordsToSearch.length;
  let mainWords = [];
  let normalNouns = [];
  let verbGerard = [];
  let special = [];
  for (index = 0; index < length; index++) {
    let currentCopy = wordsToCopy[index];
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
      if (isSpecial(currentCopy)) {
        mainWords = [
          {
            word: isSpecial(currentCopy),
            partOfSpeech: partOfSpeech,
          },
        ].concat(mainWords);
      } else {
        mainWords.push({ word: currentWord, partOfSpeech: partOfSpeech });
      }
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
      if (isSpecial(currentCopy)) {
        special.push({
          word: isSpecial(currentCopy),
          partOfSpeech: "SP",
        });
      } else {
        if (currentWord[0] === "#" && Math.random() <= 0.25) {
          normalNouns = [
            { word: currentWord, partOfSpeech: partOfSpeech },
          ].concat(normalNouns);
        } else {
          if (currentWord.includes("/t.co/")) {
            normalNouns = [
              { word: currentWord, partOfSpeech: partOfSpeech },
            ].concat(normalNouns);
          }

          normalNouns.push({ word: currentWord, partOfSpeech: partOfSpeech });
        }
      }
      wordsToSearch.splice(index, 1);
      index--;
      length = wordsToSearch.length;
    } else if (
      partOfSpeech === "VBG" ||
      partOfSpeech === "VBN" ||
      partOfSpeech === "VB"
    ) {
      if (isSpecial(currentCopy)) {
        special.push({
          word: isSpecial(currentCopy),
          partOfSpeech: "SP",
        });
      } else {
        //finalWords.push(currentWord);
        verbGerard.push({ word: currentWord, partOfSpeech: partOfSpeech });
        wordsToSearch.splice(index, 1);
        index--;
        length = wordsToSearch.length;
      }
    }
  }

  let remainingWords = [];
  for (index = 0; index < wordsToSearch.length; index++) {
    let currentWord = wordsToSearch[index];
    let currentCopy = wordsToCopy[index];
    let partOfSpeech = GetPartOfSpeech(currentWord);
    if (currentWord === "@whosaidthis_bot") {
      continue;
    }
    if (isSpecial(currentCopy)) {
      special.push({
        word: isSpecial(currentCopy),
        partOfSpeech: "SP",
      });
    } else {
      remainingWords.push({ word: currentWord, partOfSpeech: partOfSpeech });
    }
  }
  let temp = mainWords.concat(special);
  temp = temp.concat(normalNouns);
  temp = temp.concat(verbGerard);
  word_json = temp.concat(remainingWords);
  //finalWords.push(currentWord);

  word_json = _.uniqBy(word_json, "word");
  return word_json;
  //return finalWords;
};

function GetPartOfSpeech(word) {
  let sentence = tagger.tag(word.split(" "));
  return sentence["taggedWords"][0]["tag"];
}

exports.scorePage = async function (
  result,
  data,
  keywords,
  tweetId,
  userScreenName
) {
  keywords = keywords.filter((element) => {
    return !element.word.includes("/t.co/");
  });

  keywords.push({ word: userScreenName, partOfSpeech: "NNP" });
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
