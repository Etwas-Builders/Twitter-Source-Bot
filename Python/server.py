from tornado.web import Application, RequestHandler
from tornado.ioloop import IOLoop
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

        print(body)
        data = body["data"]
        keywords = body["keywords"]
        url = body["url"]

        score = await ProcessBody.getDocumentScore(data, url, keywords)
        print(score)

        self.write({"score": score})


def make_app():
    urls = [
        ("/", GetSample),
        ("/processBody", handleProcessBody)
    ]

    return Application(urls, debug=True)


if __name__ == "__main__":
    port = 5000

    app = make_app()
    app.listen(port)

    IOLoop.instance().start()

