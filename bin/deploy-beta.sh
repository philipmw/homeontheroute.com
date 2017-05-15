#!/bin/sh -ex

aws s3 cp index.html s3://beta.homeontheroute.com
aws s3 sync --delete built s3://beta.homeontheroute.com/built
