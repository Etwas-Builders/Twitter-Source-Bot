import string
import math
import spacy
import pytextrank
import re
import time

# Suppresses cli output
# import sys, os
# sys.stdout = open(os.devnull, 'w')

nlp = spacy.load("en_core_web_sm", disable=["ner"], batch_size=200)

text_rank = pytextrank.TextRank()
nlp.add_pipe(text_rank.PipelineComponent, name="textrank", last=True)


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

    minimum_phrase_rank = 0.6 * \
        max([phrase.rank for phrase in nlp_text._.phrases])
    number_of_phrases = len(nlp_text._.phrases)
    output.append("Number of phrases: " + str(number_of_phrases))
    number_of_positive_scores = 0

    # output.append(keywords)

    for dictionary in keywords:
        if(time.time() - startTime > 30):
            output.append("Overtime break")
            return (-1, output)

        keyword = dictionary["word"]

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

        if(partOfSpeech == "NNPS" or partOfSpeech == "NNP"):
            isProperNoun = True

        elif (partOfSpeech == "VBG" or partOfSpeech == "VBN" or partOfSpeech == "VB"):
            isVerb = True

        for phrase in nlp_text._.phrases:
            if(time.time() - startTime > 30):
                output.append("Overtime break")
                return (-1, output)

            rank = phrase.rank
            if (rank >= minimum_phrase_rank):
                chunk_words = [re.sub(r"""
            [,.;@#?!&$]+
            \ *
            """,
                                      "",
                                      str(word), flags=re.VERBOSE).lower()
                               for line in set(phrase.chunks) for word in line]
                output.append("Keyword: " + keyword)
                output.append("Phrase: " + str(phrase))
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
        elif (number_of_phrases > 100):
            number_of_positive_scores -= 0.02
        elif(number_of_phrases < 100):
            number_of_positive_scores -= 0.05

    output.append("Number of positive scores: " +
                  str(number_of_positive_scores) + "\n")
    '''if (number_of_positive_scores > minimum_number_of_scores_needed and minimum_number_of_scores_needed != 0):
        output.append("Final Score with base e: " + str((math.log(number_of_positive_scores /
                                                                  minimum_number_of_scores_needed))) + "\n")
        return (math.log(number_of_positive_scores / minimum_number_of_scores_needed), output)

    elif(number_of_positive_scores > 0.5 * (minimum_number_of_scores_needed and minimum_number_of_scores_needed != 0)):
        output.append("Final Score with base 4.5: " + str(abs((math.log(
            minimum_number_of_scores_needed - number_of_positive_scores, 4.5)))) + "\n")
        return (abs((math.log(
            minimum_number_of_scores_needed - number_of_positive_scores, 4.5))), output)

    else:
        return (0, output)'''
    output.append("URL: " + url + "\n")
    output.append("Number of phrases: " + str(number_of_phrases))
    adjusted_number_of_phrases = math.log(number_of_phrases, 50)
    output.append("Adjusted number of phrases: " +
                  str(adjusted_number_of_phrases))
    output.append("Final Score: " +
                  str(number_of_positive_scores / adjusted_number_of_phrases))
    return ((number_of_positive_scores / adjusted_number_of_phrases), output)
