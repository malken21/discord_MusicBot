import http.server
import python.main as main
from urllib import parse
import base64
import asyncio
import threading

discord = None


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
            # それ以外の場合はデフォルトの処理を行う
            self.send_response(404)
            self.send_header("Content-type", "text/plain")
            self.end_headers()
            self.wfile.write(b"404")


# ポート番号は任意
server = http.server.HTTPServer(("", 8000), MyHandler)


def setup():
    server.serve_forever()
