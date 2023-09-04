FROM ghcr.io/puppeteer/puppeteer:16.2.1

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
CMD [ "npx", "nx", "run", "hls-server:start:production" ]