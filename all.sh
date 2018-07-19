#!/bin/bash
git pull && cd mongo && git pull && cd mongo && git pull && cd ../ && ./buildMongos.sh && ./buildImage.sh && ./launch.sh
