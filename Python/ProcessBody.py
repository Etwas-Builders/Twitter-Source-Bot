import spacy
import pytextrank
nlp = spacy.load("en_core_web_sm")

text = '''But potentially harmful chain messages have gotten a massive second wind this year, as it became clear that America wouldn’t be able to dodge the coronavirus which had been ravaging China, Iran, and Italy. Almost two weeks ago, when people started realizing the scale of the threat and mobbing grocery stores in response, a hoax message went viral from someone who claimed to be friends of friends with someone at the New York Police Department saying that parts of the city’s transportation network would be “shutting down.” NBC’s Ben Collins chronicled how other false text messages warning of martial law surged nationwide. As early as January, even, before it became apparent that the coronavirus would affect the U.S. at scale, copypasta hit the internet from someone claiming to know someone at the Centers for Disease Control and Prevention, urging tips to combat the coronavirus, including the unsubstantiated advice that frequently drinking water would curb the virus. That message eventually ended up in my colleague Rebecca Leber’s inbox in March, suggesting that it later circulated widely as a chain email.'''
text_rank = pytextrank.TextRank(logger=None)
nlp.add_pipe(text_rank.PipelineComponent, name="textrank", last=True)

nlp_text = nlp(text)

for phrase in text_rank._.phrases:
    print("Text " + phrase.text)
    print("Rank " + phrase.rank)
    print("Occurrences " + phrase.count)
    print(phrase.chunks)







