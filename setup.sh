#!/bin/bash
cd $(dirname $0)
npm i
python3 -m pip install -U yt_dlp
python3 -m pip install -U requests
python3 -m pip install -U discord.py[voice]
sudo apt install ffmpeg