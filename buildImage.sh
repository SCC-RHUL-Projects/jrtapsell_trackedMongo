#!/bin/bash
strip --strip-all mongo/mongo*
docker rmi mongo_patched
docker image prune -f > /dev/null
cp mongo/mongod docker
cp mongo/mongos docker
docker build -t mongo_patched docker

cd cluster/clusterStatus/
docker build -t shard-viewer ./
