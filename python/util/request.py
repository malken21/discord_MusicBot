import requests
import json


# 読み込み
def read(path):
    with open(path, 'r', encoding="utf-8") as file:
        return json.load(file)


CONFIG = read("config.json")
PORT = CONFIG["port"]["Nodejs"]
IP = CONFIG["ip"]["Nodejs"]


def end():
    return requests.get(f"http://{IP}:{PORT}/end")
