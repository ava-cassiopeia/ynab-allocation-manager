#! /bin/bash

for session in emulators build; do
  if screen -list | grep -q "\.${session}"; then
    echo "Sending Ctrl-C to screen session: $session"
    screen -S "$session" -p 0 -X stuff $'\003'
  else
    echo "Screen session '$session' not found."
  fi
done
