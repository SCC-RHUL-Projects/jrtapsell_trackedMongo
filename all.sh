#!/bin/bash
git pull && cd mongo && git pull && cd ../cluster && git pull && cd ../ && ./buildMongos.sh && ./buildImage.sh && ./launch.sh
