#!/bin/bash

#-----設定部分----- start

#screenの名前
screen_name_python=python_music

#実行するコマンド
command_python="python3 index.py"

#screenの名前
screen_name_nodejs=nodejs_music

#実行するコマンド
command_nodejs="node index.js"

#-----設定部分----- end

cd $(dirname $0)
screen -UAmdS $screen_name_python $command_python
echo Start!! $screen_name_python

screen -UAmdS $screen_name_nodejs $command_nodejs
echo Start!! $screen_name_nodejs
