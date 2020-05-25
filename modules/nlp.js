const stopwords = require("stopword");
const natural = require("natural");
const axios = require("axios");
const _ = require("lodash");

const IP = require("./ip");

var exports = (module.exports = {});

const language = "EN";
const defaultCategory = "NA";
const defaultCategoryCapitalized = "NA";

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
    w = w.replace(/[":“”●☞']+/g, "");
    w = w.replace(/([\u1000-\uFFFF])/g, "");
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
    if (word) {
      let isSpecial =
        word === word.toUpperCase() ||
        word[0] === "!" ||
        word.includes("coronavirus") ||
        word.includes("covid");
      isSpecial = word.length < 3 ? false : isSpecial;
      //isSpecial ? console.info(isSpecial, word) : null;
      word = word.replace(/[":“”?!●]+/g, "");
      word = word.replace(/([\u1000-\uFFFF])/g, "");
      word = word.toLowerCase();
      return isSpecial ? word : NaN;
    } else {
      return NaN;
    }
  } catch (err) {
    console.error(err);
    return null;
  }
};
let CheckIfNNP = function (currentWord) {
  let editedWord = currentWord[0] === "@" ? currentWord.slice(1) : currentWord;

  return GetPartOfSpeech(editedWord) === "NNPS" ||
    GetPartOfSpeech(editedWord) === "NNP"
    ? editedWord
    : currentWord;
};

let HandleNA = function (word, partOfSpeech) {
  if (word[0] === word[0].toUpperCase()) {
    partOfSpeech = "NNP";
  } else {
    partOfSpeech = "NN";
  }
  return partOfSpeech;
};

let updateWordType = function (list, word, partOfSpeech, types) {
  //console.log(types, typeof list);
  for (let type of types) {
    if (partOfSpeech === type) {
      list.push({ word: word, partOfSpeech: partOfSpeech });
      return list;
    }
  }
  return list;
};

let makeUnique = function (words) {
  let finalWords;
  words = words.map((e) => {
    let original = NaN;
    word = e.word.replace("#", "");

    word = word.toLowerCase();
    if (word !== e.word) {
      original = e.word;
    }
    return { word: word, partOfSpeech: e.partOfSpeech, original: original };
  });
  finalWords = _.uniqBy(words, "word");
  finalWords = finalWords.map((e) => {
    if (e.original) {
      return { word: e.original, partOfSpeech: e.partOfSpeech };
    } else {
      return { word: e.word, partOfSpeech: e.partOfSpeech };
    }
  });
  return finalWords;
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
  let verbGerund = [];
  let special = [];
  let remainingWords = [];
  for (index = 0; index < length; index++) {
    let currentCopy = wordsToCopy[index];
    let currentWord = wordsToSearch[index];

    if (currentWord === "@whosaidthis_bot") {
      continue;
    }

    currentWord = CheckIfNNP(currentWord);

    let noHashtagWord = currentWord.replace("#", "");
    let lowercaseWord = noHashtagWord.toLowerCase();
    let partOfSpeech = GetPartOfSpeech(lowercaseWord);

    if (partOfSpeech === "NA") {
      partOfSpeech = HandleNA(currentWord, partOfSpeech);
    }

    if (partOfSpeech === "FW") {
      special.push({ word: currentWord, partOfSpeech: "SP" });
      continue;
    }

    mainWords = updateWordType(mainWords, currentWord, partOfSpeech, [
      "NNPS",
      "NNP",
    ]);
    if (isSpecial(currentCopy)) {
      special.push({
        word: isSpecial(currentCopy),
        partOfSpeech:
          partOfSpeech === "NNP" || partOfSpeech === "NNPS"
            ? partOfSpeech
            : "SP",
      });
      continue;
    }
    normalNouns = updateWordType(normalNouns, currentWord, partOfSpeech, [
      "NNS",
      "NN",
      "N",
    ]);
    verbGerund = updateWordType(verbGerund, currentWord, partOfSpeech, [
      "VBG",
      "VBN",
      "VB",
    ]);

    remainingWords.push({ word: currentWord, partOfSpeech: partOfSpeech });
  }

  special.sort((a, b) => a.partOfSpeech - b.partOfSpeech);

  let temp = mainWords.concat(special);
  temp = temp.concat(normalNouns);
  temp = temp.concat(verbGerund);
  word_json = temp.concat(remainingWords);
  //finalWords.push(currentWord);

  word_json = makeUnique(word_json);
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
  console.log("NLP ScorePage Called", result.url);
  keywords = keywords.filter((element) => {
    return !element.word.includes("/t.co/");
  });

  keywords.push({ word: userScreenName, partOfSpeech: "SP" });
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

// Exports for Test
exports.removePunctuation = removePunctuation;
exports.isSpecial = isSpecial;
exports.makeUnique = makeUnique;
exports.updateWordType = updateWordType;
exports.CheckIfNNP = CheckIfNNP;
exports.HandleNA = HandleNA;
