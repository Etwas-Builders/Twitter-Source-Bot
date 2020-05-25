/**
 * @jest-environment node
 */
const nlp = require("../../modules/nlp");

describe("Remove Punctuation", () => {
  it("Remove punctuation is defined", () => {
    expect(nlp.removePunctuation).toBeDefined;
  });
  it("Remove Punctuation is a function", () => {
    expect(typeof nlp.removePunctuation).toBe("function");
  });
  it("Remove punctuation Successfully", () => {
    word = "t:e●st";
    let punctuationTest = nlp.removePunctuation(word);
    expect(punctuationTest).toStrictEqual(["test"]);
  });
  //it("Check for Twitter link", () => {
  //  word = "https:///t.co/?/!.test,:";
  //  let twitterTest = nlp.removePunctuation(word);
  //  expect(twitterTest).toBe(["tcotest"]);
  //});
});

describe("Update Word Type", () => {
  it("Update Word Type is Defined", () => {
    expect(nlp.updateWordType).toBeDefined;
    expect(typeof nlp.updateWordType).toBe("function");
  });
  it("Update Word Type NNP/NNPS Test", () => {
    let word = "Trump";
    let partOfSpeech = "NNP";
    let properNouns = nlp.updateWordType([], word, partOfSpeech, [
      "NNP",
      "NNPS",
    ]);
    expect(properNouns).toBeDefined;
    expect(properNouns.length).toBe(1);
  });
});

describe("Is Special", function () {
  it("Is Special is defined", () => {
    expect(nlp.isSpecial).toBeDefined;
  });
  it("Is Special is a function", () => {
    expect(typeof nlp.isSpecial).toBe("function");
  });
  it("Remove punctuation from Special Words", () => {
    word = "covid?";
    let isSpecialTest = nlp.isSpecial(word);
    expect(isSpecialTest).toBeTruthy;
    expect(isSpecialTest).toBe("covid");
  });
  it("Upper Case", () => {
    word = "COVID";
    let isSpecialTest = nlp.isSpecial(word);
    expect(isSpecialTest).toBeTruthy;
    expect(isSpecialTest).toBe("covid");
  });
  it("Cumulative Is Special Test", () => {
    word = "!COVID?";
    let isSpecialTest = nlp.isSpecial(word);
    expect(isSpecialTest).toBeTruthy;
    expect(isSpecialTest).toBe("covid");
  });
  it("Word is not Special", () => {
    word = "Test";
    let isSpecialTest = nlp.isSpecial(word);
    expect(isSpecialTest).toBeFalsy;
  });
});

describe("Check NNP Test", () => {
  it("CheckNNP is Defined", () => {
    expect(nlp.CheckIfNNP).toBeDefined;
    expect(typeof nlp.CheckIfNNP).toBe("function");
  });
  it("Check NNP True", () => {
    // let words = [{ word: "@Trump", partOfSpeech: "NNP" }];
    let NNPTest = nlp.CheckIfNNP("@Trump");
    expect(NNPTest).toBe("Trump");
  });
  it("Check NNP False", () => {
    let NNPTest = nlp.CheckIfNNP("@hello");
    expect(NNPTest).toBeDefined;
    expect(NNPTest).toBe("@hello");
  });
});

describe("Handling NA", () => {
  it("Handling Na is Defined", () => {
    expect(nlp.HandleNA).toBeDefined;
    expect(typeof nlp.HandleNA).toBe("function");
  });
  it("NA to NNP", () => {
    let NATest = nlp.HandleNA("OBama", "NA");
    expect(NATest).toBe("NNP");
  });
  it("NA to NN", () => {
    let NATest = nlp.HandleNA("bhatura", "NA");
    expect(NATest).toBe("NN");
  });
});

describe("Make Unique", () => {
  it("Make Unique is Defined", () => {
    expect(nlp.makeUnique).toBeDefined;
  });
  it("Make Unique should be function", () => {
    expect(typeof nlp.makeUnique).toBe("function");
  });
  it("Make Unique Simple Test", () => {
    let words = [
      { word: "Test", partOfSpeech: "SP" },
      { word: "Test", partOfSpeech: "NNP" },
    ];
    let unique = nlp.makeUnique(words);
    expect(unique).toBeDefined;
    expect(unique.length).toStrictEqual(1);
  });
  it("Make Unique #Hashtag Test", () => {
    let words = [
      { word: "#Test", partOfSpeech: "SP" },
      { word: "Test", partOfSpeech: "NNP" },
    ];
    let unique = nlp.makeUnique(words);
    expect(unique).toBeDefined;
    expect(unique.length).toStrictEqual(1);
    expect(unique).toStrictEqual([{ word: "#Test", partOfSpeech: "SP" }]);
  });
  it("Make Unique Capitalization Test", () => {
    let words = [
      { word: "test", partOfSpeech: "SP" },
      { word: "Test", partOfSpeech: "NNP" },
    ];
    let unique = nlp.makeUnique(words);
    expect(unique).toBeDefined;
    expect(unique.length).toStrictEqual(1);
    expect(unique).toStrictEqual([{ word: "test", partOfSpeech: "SP" }]);
  });
});

describe("Words to Search", function () {
  it("Words to Search is Defined", () => {
    expect(nlp.wordsToSearch).toBeDefined();
  });
  it("Words to Search should be a function", () => {
    expect(typeof nlp.wordsToSearch).toBe("function");
  });
  it("Words to Search on Basic Tweet ` Air conditioning is needed by so many people, especially in Miami!! The poor people are suffering most of all from this heat ` ", async () => {
    const input = ` Air conditioning is needed by so many people, especially in Miami!! The poor people are suffering most of all from this heat`;
    const results = await nlp.wordsToSearch(input);
    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);
    const firstWord = results[0].word;
    //console.info(results);
    expect(firstWord).toBeDefined();
    expect(firstWord.length).toBeGreaterThan(0);
    const partOfSpeech = results[0].partOfSpeech;
    expect(partOfSpeech).toBe("NNP");
    expect(firstWord.includes("!")).toBeFalsy;
    expect(firstWord[0] === "m").toBeTruthy;
  });
});

describe("Score Page", () => {
  it("Score Page is Defined", () => {
    expect(nlp.scorePage).toBeDefined();
  });
  it("Score Page is a function", () => {
    expect(typeof nlp.scorePage).toBe("function");
  });
  it("Score Page Api is active", async () => {
    const data = {
      title: "This is test",
      text: "This is a test body with test text",
    };
    const result = {
      url: "twittersourcebot.tech/nlp.spec/test",
    };
    const keywords = [
      { word: "Test", partOfSpeech: "NNS" },
      { word: "body", partOfSpeech: "NNS" },
    ];
    const tweetId = "jestTestTweet";

    const score = await nlp.scorePage(
      result,
      data,
      keywords,
      tweetId,
      "jestTest"
    );
    expect(score).toBeDefined();
    expect(typeof score).toBe("number");
  });
});
