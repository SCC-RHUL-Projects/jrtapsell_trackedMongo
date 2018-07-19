#!/bin/bash
openssl rand -base64 756 > cluster/mongo-sharded/keyfile
chmod 400 cluster/mongo-sharded/keyfile
