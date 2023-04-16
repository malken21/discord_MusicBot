import os
from yt_dlp import YoutubeDL

filename = "twitter.webm"
ydl_opts = {"outtmpl": filename}


def load(url: str):
    if (os.path.isfile(filename)):
        os.remove(filename)
    with YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])


def isURL(url: str):
    if (
        url.startswith("https://twitter.com/")
    ):
        return True
    return False
