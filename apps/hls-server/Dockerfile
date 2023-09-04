FROM ghcr.io/puppeteer/puppeteer:latest

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

USER root
RUN chown -R _apt:root /var/lib/apt/lists/
RUN apt -y update
RUN apt -y install ffmpeg

WORKDIR /usr/src/app

COPY package*.json ./
COPY tools ./tools
RUN npm ci --legacy-peer-deps
COPY . .
CMD [ "npx", "nx", "run", "hls-server:serve:production" ]