stopwords = require("stopword");
wordnet = require("node-wordnet");
natural = require("natural");

const language = "EN"
const defaultCategory = 'N';
const defaultCategoryCapitalized = 'NNP';

var lexicon = new natural.Lexicon(language, defaultCategory, defaultCategoryCapitalized);
var ruleSet = new natural.RuleSet('EN');
var tagger = new natural.BrillPOSTagger(lexicon, ruleSet);

exports.WordsToSearch = function FindWordsToSearch(text) {
  const textArray = text.split(' ');
  var wordsToSearch = stopwords.removeStopwords(textArray);
  var finalWords = [];
  length = wordsToSearch.length

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
      length = wordsToSearch.length;
    } else if (partOfSpeech == "NNS" || partOfSpeech == "NN" || partOfSpeech == "N") {
      finalWords.push(currentWord);
      wordsToSearch.splice(index, 1);
      length = wordsToSearch.length;
    }
  }

  for (index = 0; index < wordsToSearch.length; index++) {
      let currentWord = wordsToSearch[index];
      finalWords.push(currentWord);
  }
  return finalWords;
}

function GetPartOfSpeech(text) {
  let sentence = tagger.tag(text.split(' '));
  return sentence['taggedWords'][0]['tag'];
}
