# amplitude-freeze
This microservice solve problem of sharing amplitude's graphs with other people.

It uses phantomjs to login on https://amplitude.com as configured user (taken from env
variables `AMPFREEZE_LOGIN` and `AMPFREEZE_PASSW`) and then opens one by one all
pages from config file. After opening page it extracts graph html and all used
CSS styles.

At the end of this process all graphs are written into `/srv/html/index.html`
which is served with default python's `SimpleHTTPServer`.

## build
For manually building docker image simply run
```
docker build -t amplitude-freeze-image .
```

## run
You can run service from prebuilded image with command
```
docker run \
    --name amplitude-freeze \
    -ti \
    -e AMPFREEZE_LOGIN=amplitude-login@email.com \
    -e AMPFREEZE_PASSW=amplitude-password \
    -v /path/to/config.json:/srv/config.json \
    -p 8000:8000
    ontrif/amplitude-freeze
```

Config file `config.json` must describe all graphs with full urls:
```
[
    {
        "group": "First group",
        "graphs": [
            { "url" : "https://analytics.amplitude.com/org/123123/chart/mfmfmfmf", "title": "Example chart" }
        ]
    },
    {
        "group": "Second group",
        "graphs": [
            { "url" : "https://analytics.amplitude.com/org/123123/chart/11111111", "title": "Example chart 1" },
            { "url" : "https://analytics.amplitude.com/org/123123/chart/22222222", "title": "Example chart 2" },
            { "url" : "https://analytics.amplitude.com/org/123123/chart/33333333", "title": "Example chart 3" },
            { "url" : "https://analytics.amplitude.com/org/123123/chart/44444444", "title": "Example chart 4" }
        ]
    }
]
```

Then you can watch fetching process in terminal and then open http://localhost:8000 with result page.
