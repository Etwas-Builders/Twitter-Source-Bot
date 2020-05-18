import string
import math
import spacy
import pytextrank
import re
import time
import nltk
from stop_words import get_stop_words
from nltk.corpus import stopwords
nltk.download('stopwords')

# Suppresses cli output
# import sys, os
# sys.stdout = open(os.devnull, 'w')


nlp = spacy.load("en_core_web_sm", disable=["ner"], batch_size=200)

text_rank = pytextrank.TextRank()
nlp.add_pipe(text_rank.PipelineComponent, name="textrank", last=True)


def generateChunkWords(nlp_text, start_time):

    chunks = []

    for phrase in nlp_text._.phrases:
        if (time.time() - start_time > 30):
            output.append("Overtime break")
            return (-1, output)

        rank = phrase.rank
        minimum_phrase_rank = 0.6 * \
            max([phrase.rank for phrase in nlp_text._.phrases])

        if (rank >= minimum_phrase_rank):
            chunk_words = [re.sub(r"""
                    [,.;@#?!&$]+
                    \ *
                    """,
                                  "",
                                  str(word), flags=re.VERBOSE).lower()
                           for line in set(phrase.chunks) for word in line]
            chunks.append(chunk_words)
    return chunks


async def getDocumentScore(data, url, keywords):

    output = []

    startTime = time.time()

    output.append(
        "\n ----- \n ---- New Source ---- \n ----- \n" + "URL:" + url)

    text = data["text"]

    if len(text) <= 0:
        return (-1, output)

    nlp_text = nlp(text)

    if len(nlp_text._.phrases) <= 0:
        return (-1, output)

    chunks = generateChunkWords(nlp_text, startTime)

    number_of_phrases = len(nlp_text._.phrases)
    output.append("Number of phrases: " + str(number_of_phrases))
    number_of_positive_scores = 0

    bigram_score = FindBigramsToSearch(nlp_text, keywords, chunks)

    for dictionary in keywords:
        if(time.time() - startTime > 30):
            output.append("Overtime break")
            return (-1, output)

        keyword = dictionary["word"]

        if "/tco/" in keyword:
            continue

        if "partOfSpeech" in list(dictionary.keys()):
            partOfSpeech = dictionary["partOfSpeech"]
        else:
            partOfSpeech = "None"

        keyword = keyword.lower()
        keyword = re.sub(r"""
            [,.;@#?!&$]+
            \ *
            """,
                         "",
                         keyword, flags=re.VERBOSE)

        keyword_occurrences = 0
        isProperNoun = False
        isVerb = False
        isNoun = False
        isSpecial = False

        if(partOfSpeech == "NNPS" or partOfSpeech == "NNP"):
            isProperNoun = True

        elif (partOfSpeech == "VBG" or partOfSpeech == "VBN" or partOfSpeech == "VB"):
            isVerb = True
        elif(partOfSpeech == "N" or partOfSpeech == "NN" or partOfSpeech == "NNS"):
            isNoun = True
        elif(partOfSpeech == "SP"):
            isSpecial = True

            output.append("Keyword: " + keyword)
            output.append("Phrase: " + str(phrase))

            if chunks != -1:
                for chunk_words in chunks:
                    output.append("Chunk words:")
                    output.append(" , ".join(chunk_words))
                    for word in chunk_words:
                        if(time.time() - startTime > 30):
                            output.append("Overtime break")
                            return (-1, output)
                        # Checks if 50% of the keyword is in the word from the phrase or vice-versa.
                        if keyword in word and (len(keyword) >= int(0.5 * len(word))) or word in keyword and (len(word) >= int(0.5 * len(keyword))):
                            keyword_occurrences += 1

        if keyword_occurrences > 0:
            output.append("Keyword occurrences: " + str(keyword_occurrences))
            if (isProperNoun):
                # Ranges between 5 to 15.
                score = 5 + (10 * (math.exp(keyword_occurrences) /
                                   (1 + math.exp(keyword_occurrences))))
            elif (isVerb):
                # Ranges between 2 to 12.
                score = 2 + (10 * (math.exp(keyword_occurrences) /
                                   (1 + math.exp(keyword_occurrences))))

            else:
                # Ranges between 0 to 10.
                score = (10 * (math.exp(keyword_occurrences) /
                               (1 + math.exp(keyword_occurrences))))
        else:
            score = 0

        output.append("Keyword score: " + str(score))

        if (score >= 6.5 and isProperNoun):
            number_of_positive_scores += 2.5
        elif (score >= 6.5 and isVerb):
            number_of_positive_scores += 1
        elif(score >= 8 and isNoun):
            number_of_positive_scores += 0.2
        elif(score >= 8 and isSpecial):
            number_of_positive_scores += 0.3
        elif (number_of_phrases > 100):
            number_of_positive_scores -= 0.02
        elif(number_of_phrases < 100):
            number_of_positive_scores -= 0.05

    output.append("Number of positive scores: " +
                  str(number_of_positive_scores) + "\n")

    output.append("URL: " + url + "\n")
    output.append("Number of phrases: " + str(number_of_phrases))

    adjusted_number_of_phrases = math.log(number_of_phrases, 50)

    output.append("Adjusted number of phrases: " +
                  str(adjusted_number_of_phrases))
    output.append("Final Score: " +
                  str(number_of_positive_scores / adjusted_number_of_phrases))

    return ((number_of_positive_scores / adjusted_number_of_phrases), output)


def FindBigramsToSearch(nlp_text, keywords, chunks):
    keyword_list = [dictionary["word"] for dictionary in keywords]
    bigrams = list(nltk.bigrams(keyword_list))
    stop_words = list(get_stop_words('en'))
    nltk_stop_words = list(stopwords.words('english'))
    stop_words.extend(nltk_stop_words)
    bigram_occurrences = 0

    for bigram in bigrams:
        for chunk_words in chunks:
            first_word = bigram[0]
            second_word = bigram[1]
            first_word_pos = None
            second_word_pos = None
            bigram_word = first_word + " " + second_word

            if (first_word in stop_words or second_word in stop_words):
                continue

            for dictionary in keywords:
                if "partOfSpeech" in list(dictionary.keys()):
                    partOfSpeech = dictionary["partOfSpeech"]
                else:
                    partOfSpeech = "None"

                if dictionary["word"] == first_word:
                    first_word_pos = partOfSpeech
                    is_first_word_pos = True

                if dictionary["word"] == second_word:
                    second_word_pos = partOfSpeech
                    is_first_word_pos = True

            if (first_word_pos != None and second_word_pos != None):
                if (bigram_word in chunk_words):
                    bigram_occurrences += 1
            print("Bigram occurrences: " + str(bigram_occurrences))
            # TODO: Normalize occurrences and score
