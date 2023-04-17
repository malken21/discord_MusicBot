import discord
import json
import python.download as download
import python.server as server


# 読み込み
def read(path):
    with open(path, 'r', encoding="utf-8") as file:
        return json.load(file)


# "config.json" 読み込み
CONFIG = read("config.json")

# "config.json" のデータ 代入
TOKEN = CONFIG["TOKEN"]
GUILD = int(CONFIG["GUILD"])


class MyClient(discord.Client):
    # 起動が完了したら
    async def on_ready(self):
        print(f'Logged on as {self.user}!')


async def play(voice_channel: int, url: str):
    # ボイスチャンネル取得
    channel = client.get_guild(GUILD).get_channel(voice_channel)
    # ボイスチャンネルに入る
    voice_client = await channel.connect()

    # ビデオ or サウンド 再生
    voice_client.play(discord.FFmpegPCMAudio(download.load(
        url
    )))


intents = discord.Intents.all()

client = MyClient(intents=intents)

client.run(TOKEN)
