#!/bin/sh -ex

aws s3 cp index.html s3://homeontheroute.com
aws s3 sync --delete built s3://homeontheroute.com/built
