FROM ubuntu:latest

RUN apt-get install -y nodejs
RUN apt-get install -y npm git git-extras
RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN ls -l /usr/bin/node*

ADD . /src
RUN cd /src; npm install
RUN npm install -g http-server

EXPOSE 3003
CMD ["/usr/bin/http-server", "-p",  "3003", "/src/app"]


