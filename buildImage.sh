#!/bin/bash
#strip --strip-all mongo/mongo*
cp mongo/mongod docker
cp mongo/mongos docker
docker build -t mongo_patched docker

cd cluster/clusterStatus/
docker build -t shard-viewer ./
