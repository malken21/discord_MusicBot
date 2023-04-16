import os
from yt_dlp import YoutubeDL

filename = "youtube.webm"
ydl_opts = {"format": "bestaudio", "outtmpl": filename}


def load(url: str):
    if (os.path.isfile(filename)):
        os.remove(filename)
    with YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])


def isURL(url: str):
    if (
        url.startswith("https://youtu.be/") or
        url.startswith("https://www.youtube.com/")
    ):
        return True
    return False
