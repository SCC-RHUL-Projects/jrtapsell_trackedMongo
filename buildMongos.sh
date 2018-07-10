#!/bin/bash
source venv/bin/activate
cd mongo
time ./buildscripts/scons.py mongos mongod CC=/usr/bin/gcc-5 CXX=/usr/bin/g++-5 -j 4 --disable-warnings-as-errors
deactivate
./notify.sh "Build complete"

