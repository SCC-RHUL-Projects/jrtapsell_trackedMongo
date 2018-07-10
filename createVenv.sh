#!/bin/bash
rm -rf venv
python -m virtualenv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
