import os
from yt_dlp import YoutubeDL

filename = "nicovideo.webm"
ydl_opts = {"outtmpl": filename}


def load(url: str):
    if (os.path.isfile(filename)):
        os.remove(filename)
    with YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])


def isURL(url: str):
    if (
        url.startswith("https://nico.ms/") or
        url.startswith("https://www.nicovideo.jp/")
    ):
        return True
    return False
