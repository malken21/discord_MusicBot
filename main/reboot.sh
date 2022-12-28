#!/usr/bin/bash

screen -S MusicBot -X quit
cd ディレクトリ
screen -UAmdS MusicBot node index.js
