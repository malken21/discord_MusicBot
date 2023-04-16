import os
from yt_dlp import YoutubeDL

filename = "soundcloud.webm"
ydl_opts = {"outtmpl": filename}


def load(url: str):
    if (os.path.isfile(filename)):
        os.remove(filename)
    with YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])


def isURL(url: str):
    if (
        url.startswith("https://on.soundcloud.com/") or
        url.startswith("https://soundcloud.com/")
    ):
        return True
    return False
