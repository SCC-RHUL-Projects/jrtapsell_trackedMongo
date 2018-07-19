#!/bin/bash
../notify.sh "Run started at $(date)"
git pull && cd mongo && git pull && cd ../cluster && git pull && cd ../ && ./buildMongos.sh && ./buildImage.sh && ./launch.sh
../notify.sh "Run completed at $(date)"
