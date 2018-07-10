#!/bin/bash
source venv/bin/activate
cd mongo
time ./buildscripts/scons.py mongos mongod CC=/usr/bin/gcc-5 CXX=/usr/bin/g++-5 -j 16 --disable-warnings-as-errors
deactivate
cd ../
./notify.sh "Build complete"

