import spacy
import pytextrank
nlp = spacy.load("en_core_web_sm")
import math
import string

def ProcessBody(data, keywords):
    text = '''The unanimous decision clears the convictions of two allies to former New Jersey Gov. Chris Christie.

M. Scott Mahaskey/POLITICO

By  and JOSH GERSTEIN

05/07/2020 10:08 AM EDT

Updated: 05/07/2020 12:10 PM EDT

The U.S. Supreme Court on Thursday tossed the federal government’s case in the infamous “Bridgegate” scandal, clearing the convictions of two allies of former New Jersey Gov. Chris Christie.

In a unanimous ruling that further chips away at the nation’s public corruption case law, the justices concluded that the two defendants — Bridget Ann Kelly and Bill Baroni — did not defraud the government of its “property” by closing off two local access lanes to the George Washington Bridge over three days in September 2013.

Advertisement

The traffic-snarling political stunt was designed to punish a Democratic mayor who had refused to endorse Christie, a Republican, for reelection as New Jersey governor.

Justice Elena Kagan said the kinds of decisions Kelly and Baroni made — and their less-than-candid explanations for them — could not be prosecuted as fraud under federal law.

“If U. S. Attorneys could prosecute as property fraud every lie a state or local official tells in making such a decision, the result would be … ‘a sweeping expansion of federal criminal jurisdiction,'” Kagan wrote. “In effect, the Federal Government could use the criminal law to enforce (its view of) integrity in broad swaths of state and local policymaking. The property fraud statutes do not countenance that outcome.”

Kagan sought to make clear that the court was not blessing the conduct of the former officials, only declaring that it was beyond the reach of federal corruption laws.

Advertisement

“As Kelly’s own lawyer acknowledged, this case involves an ‘abuse of power,’ she wrote. “The evidence the jury heard no doubt shows wrongdoing—deception, corruption, abuse of power. But the federal fraud statutes at issue do not criminalize all such conduct."

The court’s decision, which appears to end one of the strangest political dramas in American history, vacates an earlier ruling by the U.S. Court of Appeals for the 3rd Circuit in Philadelphia that had upheld most of the counts against Baroni and Kelly.

Baroni, who was Christie’s deputy executive director at the Port Authority of New York and New Jersey, and Kelly, who was Christie’s deputy chief of staff, were convicted in 2016 for their roles in closing the lanes. They worked with a third conspirator — David Wildstein, a former Port Authority official who pleaded guilty and testified against them — to orchestrate the political retribution scheme.

The Supreme Court agreed to hear the appeal after Baroni had already reported to federal prison, and as Kelly was preparing to do so. Both attended legal arguments in January, during which  about the case as Christie — now working as a law-firm attorney and ABC News commentator — watched from the front row.

Advertisement

The decision was quickly celebrated within Christie's circle — and by the former governor himself.

Christie, who has denied any involvement in the lane closures, used the ruling to accuse former President Barack Obama‘s Justice Department of leading a “political crusade“ against Kelly, Baroni and “dozens of members of my administration.“ He said prosecutors sought a “predetermined and biased outcome“ and “violated the oath sworn by every member of the Department of Justice.“

Christie singled out Paul Fishman, the former U.S. attorney for New Jersey who prosecuted the case, even though two Republican appeals court judges voted to uphold the convictions and the trial judge, Susan D. Wigenton, was nominated by President George W. Bush.

“It is good for all involved that today justice has finally been done,” Christie said in a statement. “What cannot be undone is the damage that was visited upon all of the people dragged through the mud who had nothing to do with this incident by the prosecutorial misconduct and personal vindictiveness of Paul Fishman.“

Christie, who was also U.S. attorney for New Jersey, said Fishman was “motivated by political partisanship and blind ambition that cost the taxpayers millions in legal fees and changed the course of history.“

“The leadership of the Obama Justice Department is also culpable for permitting this misconduct to happen right under their noses, authorizing Paul Fishman to weaponize the office for political and partisan reasons,” Christie said.

Fishman could not be immediately reached for comment.

President Donald Trump, too, was quick to weigh in with congratulations for Christie — a friend and occasional adviser to the president — and his cleared former aides.

Advertisement

Congratulations to former Governor of New Jersey, Chris Christie, and all others involved, on a complete and total exoneration (with a 9-0 vote by the U.S. Supreme Court) on the Obama DOJ Scam referred to as 'Bridgegate,'" Trump wrote, characterizing the court's decision as "exoneration" even though Kagan said Kelly and Baroni's actions included "deception, corruption, abuse of power."

"The Democrats are getting caught doing very evil things, and Republicans should take note. This was grave misconduct by the Obama Justice Department!" the president continued.

The decision on Thursday, which follows in a line of recent rulings that have diminished the power of federal prosecutors to go after corruption, marks another major blow to such efforts to root out malfeasance by public officials.

It comes nearly four years after the justices overturned the conviction of former Virginia Gov. Bob McDonnell on the grounds prosecutors had wrongly mixed evidence of potentially illegal acts aimed at influencing official government actions with proof of routine courtesies.

In this appeal, the Justice Department defended the case by arguing that no one involved in the political retribution scheme had the “authority” to realign the lanes at the bridge. Because they didn’t have the authority, the government said, the defendants lied — they claimed to be doing a “traffic study” — in order to take control of the costly resources needed to execute their political punishment scheme.

But Kelly and Baroni made a much more succinct argument, claiming the government’s case sought to criminalize “routine” political behavior and that what they were convicted of doing — the ethics of the matter aside — “is a case of bare-knuckle New Jersey politics, not graft.”

They said their decision to change the traffic patterns at the bridge was a government process and therefore they didn’t defraud the government of its “property.” And they argued that Baroni did, in fact, have the authority to change the lanes in his role as deputy executive director of the Port Authority, which operates the bridge.

Kelly initially received an 18-month sentence, which was cut to 13 months after the appeals court ruling on her case. She was allowed to remain free pending the outcome of her Supreme Court case.

Advertisement

Baroni, who previously served as a Republican state lawmaker in New Jersey, was initially sentenced to two years in prison. That was cut to 18 months after the 3rd Circuit ruling. He served almost three months in 2019 before being released to await the result of the Supreme Court litigation.

“I have always believed in public service. And now that the Supreme Court has ruled so clearly, I can continue my efforts to serve my community,” Baroni said in a statement. “And I am going to work to help those who are headed to prison, in prison, and getting out of prison. I have learned much in these past seven years about our criminal justice and prison systems. And I am going to spend these next years helping those that are caught in them.“

Kelly said in a statement the ruling “gave me back my name and began to reverse the six-and-a-half-year nightmare that has become my life.“

“Having been maligned, I now stand with my family and friends knowing that due process worked,” Kelly said. “While this may finally have made this case right for me, it does not absolve those who should have truly been held accountable.“

Matt Friedman contributed to this report.

FILED UNDER: , , 
 MOST READ
Sign up for  and get top news and scoops, every morning — in your inbox.

© 2020 POLITICO LLC
Testing -> Resolved Promise -> outputs 0 with title Supreme Court overturns ‘Bridgegate’ convictions as Christie slams ‘political crusade’

The unanimous decision clears the convictions of two allies to former New Jersey Gov. Chris Christie.

M. Scott Mahaskey/POLITICO

By  and JOSH GERSTEIN

05/07/2020 10:08 AM EDT

Updated: 05/07/2020 12:10 PM EDT

The U.S. Supreme Court on Thursday tossed the federal government’s case in the infamous “Bridgegate” scandal, clearing the convictions of two allies of former New Jersey Gov. Chris Christie.

In a unanimous ruling that further chips away at the nation’s public corruption case law, the justices concluded that the two defendants — Bridget Ann Kelly and Bill Baroni — did not defraud the government of its “property” by closing off two local access lanes to the George Washington Bridge over three days in September 2013.

Advertisement

The traffic-snarling political stunt was designed to punish a Democratic mayor who had refused to endorse Christie, a Republican, for reelection as New Jersey governor.

Justice Elena Kagan said the kinds of decisions Kelly and Baroni made — and their less-than-candid explanations for them — could not be prosecuted as fraud under federal law.

“If U. S. Attorneys could prosecute as property fraud every lie a state or local official tells in making such a decision, the result would be … ‘a sweeping expansion of federal criminal jurisdiction,'” Kagan wrote. “In effect, the Federal Government could use the criminal law to enforce (its view of) integrity in broad swaths of state and local policymaking. The property fraud statutes do not countenance that outcome.”

Kagan sought to make clear that the court was not blessing the conduct of the former officials, only declaring that it was beyond the reach of federal corruption laws.

Advertisement

“As Kelly’s own lawyer acknowledged, this case involves an ‘abuse of power,’ she wrote. “The evidence the jury heard no doubt shows wrongdoing—deception, corruption, abuse of power. But the federal fraud statutes at issue do not criminalize all such conduct."

The court’s decision, which appears to end one of the strangest political dramas in American history, vacates an earlier ruling by the U.S. Court of Appeals for the 3rd Circuit in Philadelphia that had upheld most of the counts against Baroni and Kelly.

Baroni, who was Christie’s deputy executive director at the Port Authority of New York and New Jersey, and Kelly, who was Christie’s deputy chief of staff, were convicted in 2016 for their roles in closing the lanes. They worked with a third conspirator — David Wildstein, a former Port Authority official who pleaded guilty and testified against them — to orchestrate the political retribution scheme.

The Supreme Court agreed to hear the appeal after Baroni had already reported to federal prison, and as Kelly was preparing to do so. Both attended legal arguments in January, during which  about the case as Christie — now working as a law-firm attorney and ABC News commentator — watched from the front row.

Advertisement

The decision was quickly celebrated within Christie's circle — and by the former governor himself.

Christie, who has denied any involvement in the lane closures, used the ruling to accuse former President Barack Obama‘s Justice Department of leading a “political crusade“ against Kelly, Baroni and “dozens of members of my administration.“ He said prosecutors sought a “predetermined and biased outcome“ and “violated the oath sworn by every member of the Department of Justice.“

Christie singled out Paul Fishman, the former U.S. attorney for New Jersey who prosecuted the case, even though two Republican appeals court judges voted to uphold the convictions and the trial judge, Susan D. Wigenton, was nominated by President George W. Bush.

“It is good for all involved that today justice has finally been done,” Christie said in a statement. “What cannot be undone is the damage that was visited upon all of the people dragged through the mud who had nothing to do with this incident by the prosecutorial misconduct and personal vindictiveness of Paul Fishman.“

Christie, who was also U.S. attorney for New Jersey, said Fishman was “motivated by political partisanship and blind ambition that cost the taxpayers millions in legal fees and changed the course of history.“

“The leadership of the Obama Justice Department is also culpable for permitting this misconduct to happen right under their noses, authorizing Paul Fishman to weaponize the office for political and partisan reasons,” Christie said.

Fishman could not be immediately reached for comment.

President Donald Trump, too, was quick to weigh in with congratulations for Christie — a friend and occasional adviser to the president — and his cleared former aides.

Advertisement

Congratulations to former Governor of New Jersey, Chris Christie, and all others involved, on a complete and total exoneration (with a 9-0 vote by the U.S. Supreme Court) on the Obama DOJ Scam referred to as 'Bridgegate,'" Trump wrote, characterizing the court's decision as "exoneration" even though Kagan said Kelly and Baroni's actions included "deception, corruption, abuse of power."

"The Democrats are getting caught doing very evil things, and Republicans should take note. This was grave misconduct by the Obama Justice Department!" the president continued.

The decision on Thursday, which follows in a line of recent rulings that have diminished the power of federal prosecutors to go after corruption, marks another major blow to such efforts to root out malfeasance by public officials.

It comes nearly four years after the justices overturned the conviction of former Virginia Gov. Bob McDonnell on the grounds prosecutors had wrongly mixed evidence of potentially illegal acts aimed at influencing official government actions with proof of routine courtesies.

In this appeal, the Justice Department defended the case by arguing that no one involved in the political retribution scheme had the “authority” to realign the lanes at the bridge. Because they didn’t have the authority, the government said, the defendants lied — they claimed to be doing a “traffic study” — in order to take control of the costly resources needed to execute their political punishment scheme.

But Kelly and Baroni made a much more succinct argument, claiming the government’s case sought to criminalize “routine” political behavior and that what they were convicted of doing — the ethics of the matter aside — “is a case of bare-knuckle New Jersey politics, not graft.”

They said their decision to change the traffic patterns at the bridge was a government process and therefore they didn’t defraud the government of its “property.” And they argued that Baroni did, in fact, have the authority to change the lanes in his role as deputy executive director of the Port Authority, which operates the bridge.

Kelly initially received an 18-month sentence, which was cut to 13 months after the appeals court ruling on her case. She was allowed to remain free pending the outcome of her Supreme Court case.

Advertisement

Baroni, who previously served as a Republican state lawmaker in New Jersey, was initially sentenced to two years in prison. That was cut to 18 months after the 3rd Circuit ruling. He served almost three months in 2019 before being released to await the result of the Supreme Court litigation.

“I have always believed in public service. And now that the Supreme Court has ruled so clearly, I can continue my efforts to serve my community,” Baroni said in a statement. “And I am going to work to help those who are headed to prison, in prison, and getting out of prison. I have learned much in these past seven years about our criminal justice and prison systems. And I am going to spend these next years helping those that are caught in them.“

Kelly said in a statement the ruling “gave me back my name and began to reverse the six-and-a-half-year nightmare that has become my life.“

“Having been maligned, I now stand with my family and friends knowing that due process worked,” Kelly said. “While this may finally have made this case right for me, it does not absolve those who should have truly been held accountable.“

Matt Friedman contributed to this report.

FILED UNDER: , , 
 MOST READ
Sign up for  and get top news and scoops, every morning — in your inbox.

© 2020 POLITICO LLC
'''

    text_rank = pytextrank.TextRank()
    nlp.add_pipe(text_rank.PipelineComponent, name="textrank", last=True)

    nlp_text = nlp(text)

    keywords = [
  'Congratulations', 'Governor',
  'New',             'Jersey,',
  'Chris',           'Christie,',
  'others',          'involved,',
  'exoneration',     '(with',
  '9-0',             'vote',
  'U.S.',            'Supreme',
  'Court)',          'Obama',
  'DOJ',             'Scam',
  '“Bridgegate.”',   'former',
  'complete',        'total',
  'referred',        'Democrats....'
]
    minimum_phrase_rank = 0.75 * max([phrase.rank for phrase in nlp_text._.phrases])
    number_of_phrases = len(nlp_text._.phrases)
    number_of_positive_scores = 0

    for keyword in keywords:
        keyword = keyword.strip(string.punctuation)
        keyword = keyword.lower()
        keyword_occurrences = 0

        for phrase in nlp_text._.phrases:
            rank = phrase.rank

            if (rank >= minimum_phrase_rank):
                chunk_words = [str(word).lower() for line in set(phrase.chunks) for word in line]

                for word in chunk_words:
                    #Checks if 50% of the keyword is in the word from the phrase or vice-versa.
                    if keyword in word and (len(keyword) >= int(0.5 * len(word))) or word in keyword and (len(word) >= int(0.5 * len(keyword))):
                        keyword_occurrences += 1

        if keyword_occurrences > 0:
            #Ranges between 0-1.
            score = math.exp(keyword_occurrences) / (1 + math.exp(keyword_occurrences))
        else:
            score = 0

        minimum_number_of_scores_needed  = math.log(number_of_phrases, 8)

        if (score > 0):
            number_of_positive_scores += 1
            print("Keyword: " + keyword)
            print("Score: " + str(score))
            print(keyword_occurrences)
            print("--------")

        if (number_of_positive_scores > minimum_number_of_scores_needed):
            return math.log(number_of_positive_scores / minimum_number_of_scores_needed)





print("Document rating " + str(ProcessBody(1, 2)))






