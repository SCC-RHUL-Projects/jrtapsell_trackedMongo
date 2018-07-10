#!/bin/bash
curl -X POST -H 'Content-type: application/json' --data "{\"text\":\"$1\"}" https://hooks.slack.com/services/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 > /dev/null 2>&1
