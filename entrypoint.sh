#!/bin/bash
while true
do
    echo '--------- Start fetching! ---------'
    casperjs /srv/code/main.js
    sleep 43200
done &

cd /srv/html
exec python -m SimpleHTTPServer 8000
