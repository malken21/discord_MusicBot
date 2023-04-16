import core.youtube as youtube
import core.nicovideo as nicovideo
import core.soundcloud as soundcloud
import core.twitter as twitter
import core.file as file


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
