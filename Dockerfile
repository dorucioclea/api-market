FROM google/nodejs
MAINTAINER Trust1Team <dev@trust1team.com>

RUN npm install -g grunt-cli
RUN npm install -g bower

WORKDIR /app
ADD package.json /app/
ADD . /app

RUN npm install
RUN bower install --config.interactive=false --allow-root

RUN grunt pub




