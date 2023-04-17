import python.core.youtube as youtube
import python.core.nicovideo as nicovideo
import python.core.soundcloud as soundcloud
import python.core.twitter as twitter
import python.core.file as file


def load(url: str):
    if (youtube.isURL(url)):
        youtube.load(url)
        return youtube.filename
    if (nicovideo.isURL(url)):
        nicovideo.load(url)
        return nicovideo.filename
    if (soundcloud.isURL(url)):
        soundcloud.load(url)
        return soundcloud.filename
    if (twitter.isURL(url)):
        twitter.load(url)
        return twitter.filename
    file.load(url)
    return file.filename
