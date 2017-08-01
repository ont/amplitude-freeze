FROM wernight/phantomjs

USER root
RUN apt-get update && \
    apt-get install -y --no-install-recommends npm && \
    npm install -g casperjs && \
    apt-get purge -y npm && \
    apt-get autoremove -y && \
    apt-get install -y python && \
    mkdir -p /srv/code /srv/html && \
    rm -rf /var/lib/apt/lists/*


ADD main.js /srv/code/
ADD entrypoint.sh /entrypoint.sh

EXPOSE 8000
ENTRYPOINT ["/entrypoint.sh"]
