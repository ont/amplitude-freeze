FROM wernight/phantomjs

USER root
RUN apt-get update
RUN apt-get install -y --no-install-recommends npm
RUN npm install -g casperjs
RUN apt-get purge -y npm
RUN mkdir -p /srv/code /srv/html
RUN apt-get autoremove -y
RUN apt-get install -y python

ADD main.js /srv/code/
ADD entrypoint.sh /entrypoint.sh

RUN rm -rf /var/lib/apt/lists/*

EXPOSE 8000
ENTRYPOINT ["/entrypoint.sh"]
