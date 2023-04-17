import http.server
import python.main as main
from urllib import parse
import base64
import json


# 読み込み
def read(path):
    with open(path, 'r', encoding="utf-8") as file:
        return json.load(file)


CONFIG = read("config.json")
PORT = CONFIG["port"]["Python"]
IP = CONFIG["ip"]["Python"]


class MyHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        url = parse.urlparse(self.path)

        # リクエストパスが"/play"の場合は"play"という文字を返す
        if url.path == "/play":

            self.send_response(200)
            self.send_header("Content-type", "text/plain")
            self.end_headers()
            self.wfile.write(b"play")

            query = parse.parse_qs(url.query)
            main.playList.append([
                int(query["voice_channel"][0]),
                base64.b64decode(query["url"][0]).decode()
            ])

        else:
            # それ以外の場合は404の処理を行う
            self.send_response(404)
            self.send_header("Content-type", "text/plain")
            self.end_headers()
            self.wfile.write(b"404")


# ポート番号は任意
server = http.server.HTTPServer((IP, PORT), MyHandler)


def setup():
    server.serve_forever()
