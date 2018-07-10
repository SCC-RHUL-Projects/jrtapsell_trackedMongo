#!/bin/bash

docker run --rm -ti mongo_patched mongos --configdb mongors1conf/mongo_config1:27017,mongo_config2:27017,mongo_config3:27017  --port 27017 --bind_ip 0.0.0.0

