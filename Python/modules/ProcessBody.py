import string
import math
import spacy
import pytextrank
nlp = spacy.load("en_core_web_sm")

text_rank = pytextrank.TextRank()
nlp.add_pipe(text_rank.PipelineComponent, name="textrank", last=True)


async def getDocumentScore(data, url, keywords):
    text = data["text"]

    nlp_text = nlp(text)

    minimum_phrase_rank = 0.75
    max([phrase.rank for phrase in nlp_text._.phrases])
    number_of_phrases = len(nlp_text._.phrases)
    number_of_positive_scores = 0
    print("URL:" + url)
    print(keywords)
    print("Number of phrases: " + str(number_of_phrases))

    for keyword in keywords:
        keyword = keyword.strip(string.punctuation)
        keyword = keyword.lower()
        keyword_occurrences = 0

        for phrase in nlp_text._.phrases:
            rank = phrase.rank

            if (rank >= minimum_phrase_rank):
                chunk_words = [str(word).lower()
                               for line in set(phrase.chunks) for word in line]

                for word in chunk_words:
                    # Checks if 50% of the keyword is in the word from the phrase or vice-versa.
                    if keyword in word and (len(keyword) >= int(0.5 * len(word))) or word in keyword and (len(word) >= int(0.5 * len(keyword))):
                        keyword_occurrences += 1

        if keyword_occurrences > 0:
            # Ranges between 0-1.
            score = math.exp(keyword_occurrences) / \
                (1 + math.exp(keyword_occurrences))
        else:
            score = 0

        minimum_number_of_scores_needed = math.log(number_of_phrases, 8)
        print("Minimum number: " + str(minimum_number_of_scores_needed))

        if (score > 0):
            number_of_positive_scores += 1
            print("Keyword: " + keyword)
            print("Score: " + str(score))
            print(keyword_occurrences)
            print("--------")

        if (number_of_positive_scores > minimum_number_of_scores_needed):
            return math.log(number_of_positive_scores / minimum_number_of_scores_needed)
        else:
            return 1
