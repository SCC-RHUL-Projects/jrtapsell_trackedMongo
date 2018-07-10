from mongo:4.0-rc-xenial
ADD ./mongos /usr/bin/mongos
ADD ./mongod /usr/bin/mongod
RUN touch /provenance
RUN chown mongodb:mongodb /provenance
RUN chmod 666 /provenance
RUN apt-get update && apt-get install libcurl3-gnutls
