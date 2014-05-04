FROM ubuntu:latest

RUN apt-get install -y nodejs
RUN apt-get install -y npm git git-extras
RUN ls -l /usr/bin/node*

ADD . /src
RUN cd /src; npm install

EXPOSE 3001
CMD ["/usr/bin/nodejs", "/src/app.js"]

