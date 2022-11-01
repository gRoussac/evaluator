# syntax=docker/dockerfile:1

FROM debian:10.9-slim
RUN apt-get update && apt-get install -y unzip wget bash
RUN apt-get update \
  && apt-get install -y wget gnupg \
  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

ARG USERNAME=user
RUN useradd --user-group --system --create-home --no-log-init ${USERNAME}
WORKDIR /home/${USERNAME}
USER $USERNAME

SHELL ["/bin/bash", "--login", "-c"]
RUN wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash
RUN nvm install v18.7.0
RUN npm install -g npm@8.19.2

RUN wget https://github.com/gRoussac/evaluator/archive/refs/heads/master.zip
ARG TMP="./tmp"
RUN unzip -q ./*.zip -d ${TMP}
RUN mv ${TMP}/*/* ./ && rm -rf ${TMP} *.zip
ENV PORT=4000
RUN npm install --loglevel=error && npm run build --loglevel=error
USER root
RUN cd .cache/puppeteer/chrome/linux-1056772/chrome-linux/ && chown root:root chrome_sandbox && chmod 4755 chrome_sandbox && cp -p chrome_sandbox /usr/local/sbin/chrome-devel-sandbox
USER $USERNAME
ENV CHROME_DEVEL_SANDBOX=/usr/local/sbin/chrome-devel-sandbox
RUN ls -al /usr/local/sbin/chrome-devel-sandbox
CMD  npm run serve
