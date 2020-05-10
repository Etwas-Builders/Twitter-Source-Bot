from tornado.web import Application, RequestHandler
from tornado.ioloop import IOLoop
from googlesearch import search
import json

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
    
    return Application(urls, debug=True)


if __name__ == "__main__":
    port = 5000

    app = make_app()
    app.listen(port)
    print("Tornado is up and running!")
    IOLoop.instance().start()
    

