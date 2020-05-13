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
    startTime = time.time()
    print("URL:" + url)
    text = data["text"]

    if len(text) <= 0:
        return -1

    nlp_text = nlp(text)

    if len(nlp_text._.phrases) <= 0:
        return -1

    minimum_phrase_rank = 0.6 * \
        max([phrase.rank for phrase in nlp_text._.phrases])
    number_of_phrases = len(nlp_text._.phrases)
    number_of_positive_scores = 0

    # print(keywords)

    for dictionary in keywords:
        if(time.time() - startTime > 30):
            print("Overtime break")
            return -1

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

        if(partOfSpeech == "NNPS" or partOfSpeech == "NNP"):
            isProperNoun = True

        for phrase in nlp_text._.phrases:
            if(time.time() - startTime > 30):
                print("Overtime break")
                return -1

            rank = phrase.rank
            if (rank >= minimum_phrase_rank):
                chunk_words = [re.sub(r"""
            [,.;@#?!&$]+  
            \ *           
            """,
                                      "",
                                      str(word), flags=re.VERBOSE).lower()
                               for line in set(phrase.chunks) for word in line]
                print("Current Keyword: " + keyword)
                print("Chunk words:")
                print(chunk_words)

                for word in chunk_words:
                    if(time.time() - startTime > 30):
                        print("Overtime break")
                        return -1
                    # Checks if 50% of the keyword is in the word from the phrase or vice-versa.
                    if keyword in word and (len(keyword) >= int(0.5 * len(word))) or word in keyword and (len(word) >= int(0.5 * len(keyword))):
                        keyword_occurrences += 1

        if keyword_occurrences > 0:
            if (isProperNoun):
                # Ranges between 0-2.
                score = 0.5 + (2 * (math.exp(keyword_occurrences) /
                                    (1 + math.exp(keyword_occurrences))))
            else:
                # Ranges between 0-2.
                score = 2 * (math.exp(keyword_occurrences) /
                             (1 + math.exp(keyword_occurrences)))
        else:
            score = 0

        minimum_number_of_scores_needed = math.log(number_of_phrases, 8)
        print("Minimum number: " + str(minimum_number_of_scores_needed))

        if (score > 1.25):
            number_of_positive_scores += 1

    print("Number of positive scores: " + str(number_of_positive_scores))
    if (number_of_positive_scores > minimum_number_of_scores_needed and minimum_number_of_scores_needed != 0):
        print("Final Score: " + str((math.log(number_of_positive_scores /
                                              minimum_number_of_scores_needed))))
        return math.log(number_of_positive_scores / minimum_number_of_scores_needed)
    else:
        return 0
