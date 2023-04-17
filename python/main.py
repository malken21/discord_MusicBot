import discord
import json
import python.util.download as download
import python.util.request as request
import threading
import asyncio
from discord.ext import tasks
import traceback


# 読み込み
def read(path):
    with open(path, 'r', encoding="utf-8") as file:
        return json.load(file)


# "config.json" 読み込み
CONFIG = read("config.json")

# "config.json" のデータ 代入
TOKEN = CONFIG["TOKEN"]
GUILD = int(CONFIG["GUILD"])

loop = asyncio.get_event_loop()

playList = []
isPlaying = False
isStop = False

voice_client = None
removeCount = 0


class MyClient(discord.Client):
    # 起動が完了したら
    async def on_ready(self):
        print(f'Logged on as {self.user}!')
        import python.util.server as server
        thread = threading.Thread(
            target=server.setup
        )
        thread.start()
        self.check_playList.start()

    @tasks.loop(seconds=1)
    async def check_playList(self):
        global isPlaying, isStop, voice_client, removeCount
        if (voice_client != None and isPlaying == False):
            print(removeCount)
            if (removeCount >= 50):
                await voice_client.disconnect()
                voice_client = None
                removeCount = 0
                return
            removeCount += 1
        if (isPlaying == False and len(playList) != 0):
            removeCount = 0

            voice_channel = playList[0][0]
            url = playList[0][1]

            # ボイスチャンネル取得
            channel = client.get_guild(GUILD).get_channel(voice_channel)
            # ボイスチャンネルに入る

            if (voice_client == None):
                voice_client = await channel.connect()

            print(voice_channel, url)
            try:
                # ビデオ or サウンド 再生
                voice_client.play(discord.FFmpegPCMAudio(download.load(
                    url
                )))
                while voice_client.is_playing():
                    await asyncio.sleep(1)
                    if (isStop):
                        await voice_client.disconnect()
                        del playList[0]
                        isPlaying = False
                        isStop = False
                        voice_client = None
                        print(request.end())
                        return
                del playList[0]
                isPlaying = False
                print(request.end())
            except Exception as e:
                print(type(e))
                print(traceback.format_exc())
                print(request.error())
                del playList[0]
                isPlaying = False


intents = discord.Intents.all()
client = MyClient(intents=intents)


def setup():
    client.run(TOKEN)
