#!/bin/bash
cd $(dirname $0)

python3 index.py &
node index.js &