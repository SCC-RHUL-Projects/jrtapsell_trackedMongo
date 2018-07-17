FROM mongo:4.0-rc-xenial

ENTRYPOINT ["/entry.sh"]

RUN touch /provenance
RUN chown mongodb:mongodb /provenance
RUN chmod 666 /provenance

RUN touch /stdout
RUN chown mongodb:mongodb /stdout
RUN chmod 666 /stdout

RUN touch /stderr
RUN chown mongodb:mongodb /stderr
RUN chmod 666 /stderr

RUN apt-get update && apt-get install libcurl3-gnutls

ADD ./entry.sh /entry.sh
ADD ./mongos /usr/bin/mongos
ADD ./mongod /usr/bin/mongod
