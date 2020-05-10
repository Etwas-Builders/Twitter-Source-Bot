from tornado.web import Application, RequestHandler
from tornado.ioloop import IOLoop
from googlesearch import search

from dotenv import load_dotenv
from pathlib import Path 

import os
import json
import requests

load_dotenv(dotenv_path=Path("../.env"))

from modules import ProcessBody

class GetSample(RequestHandler):
    def get(self):
        print("Baala is a big gay")
        self.write({"status": "true"})


class handleProcessBody(RequestHandler):
    async def post(self):
        body = self.request.body
        body = json.loads(body)

        print("---- New Request ----")
        data = body["data"]
        keywords = body["keywords"]
        url = body["url"]

        score = await ProcessBody.getDocumentScore(data, url, keywords)
        print("FINAL SCORE",score)

        self.write({"score": score})

class searchResults(RequestHandler):
    async def get(self):
        print("-- Search Request --")
        query = self.get_argument('query', None)

        results = list(search("{}".format(query), num=10, stop=10, pause=2))

        processed = [{"url": link} for link in results]
        print(processed)

        self.write({"results": processed})

def make_app():
    urls = [
        ("/", GetSample),
        ("/processBody", handleProcessBody),
        ('/search', searchResults)
    ]
    return Application(urls)

def discord_webhook():
        
    discord_url = os.getenv("DISCORD_WEBHOOK_URL")
    requests.post(discord_url, data = {'content':'Python Server running','username' : 'Who Said This Bot(Python)','avatar_url' : 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/1200px-Python-logo-notext.svg.png'})
    

if __name__ == "__main__":
    port = 5000
    print("Tornado is up and running!")
    discord_webhook()
    app = make_app()
    app.listen(port)
    
    IOLoop.instance().start()
    

