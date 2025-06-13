#! /bin/bash

screen -dmS emulators bash -c "npm run emulate"
screen -dmS build bash -c "npm run watch"

echo "Started dev screen sessions!"
