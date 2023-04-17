import discord
import json
import python.util.download as download
import python.util.request as request
import threading
import asyncio
from discord.ext import tasks


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

voice_client = None


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
        global isPlaying
        if (isPlaying == False and len(playList) != 0):

            voice_channel = playList[0][0]
            url = playList[0][1]

            # ボイスチャンネル取得
            channel = client.get_guild(GUILD).get_channel(voice_channel)
            # ボイスチャンネルに入る

            global voice_client
            if (voice_client == None):
                voice_client = await channel.connect()

            print(voice_channel, url)

            # ビデオ or サウンド 再生
            voice_client.play(discord.FFmpegPCMAudio(download.load(
                url
            )))
            while voice_client.is_playing():
                await asyncio.sleep(1)
            del playList[0]
            isPlaying = False
            print(request.end())


intents = discord.Intents.all()
client = MyClient(intents=intents)


def setup():
    client.run(TOKEN)
