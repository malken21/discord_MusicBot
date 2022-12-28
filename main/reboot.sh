#!/usr/bin/bash

screen -S MusicBot -X quit
cd /home/toroserver/discord/music-bot
screen -UAmdS MusicBot node index.js
