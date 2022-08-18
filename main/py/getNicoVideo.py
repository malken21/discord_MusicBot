import sys

from niconico import NicoNico
client = NicoNico()

import sys;
url = str(sys.argv[1])

with client.video.get_video(url) as video:
    print(video.download_link)