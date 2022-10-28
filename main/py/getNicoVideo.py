from niconico import NicoNico
import sys
import json

client = NicoNico()

data = json.loads(sys.stdin.readline())
with client.video.get_video(data["url"]) as video:
    print(json.dumps({"url": video.download_link}))
    data = sys.stdin.readline()
print(json.dumps({"end": True}))
