import http.server


async def setup():
    class MyHandler(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            # リクエストパスが"/play"の場合は"play"という文字を返す
            if self.path == "/play":
                self.send_response(200)
                self.send_header("Content-type", "text/plain")
                self.end_headers()
                self.wfile.write(b"play")
            else:
                # それ以外の場合はデフォルトの処理を行う
                self.send_response(404)
                self.send_header("Content-type", "text/plain")
                self.end_headers()
                self.wfile.write(b"404")

    # ポート番号は任意
    server = http.server.HTTPServer(("", 8000), MyHandler)
    server.serve_forever()
