# syntax=docker/dockerfile:1

FROM debian:10.9-slim
RUN apt-get update \
  && apt-get install -y unzip wget gnupg \
  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*
SHELL ["/bin/bash", "--login", "-c"]
RUN wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash
RUN . ~/.bashrc
RUN nvm install v18.7.0 > /dev/null
RUN npm install -g npm@8.19.2
WORKDIR /app
ADD https://github.com/gRoussac/evaluator/archive/refs/heads/docker.zip .
ARG TMP="./tmp"
RUN unzip -q ./*.zip -d ${TMP}
RUN mv ${TMP}/*/* ./ && rm -rf ${TMP} *.zip
ENV PORT=4000
RUN npm install --loglevel=error && npm run build --loglevel=error
CMD npm run serve
