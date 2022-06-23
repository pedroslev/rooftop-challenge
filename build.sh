#!/bin/bash
set -o pipefail

IMAGE=rooftop-challenge
VERSION=v1.0.0

docker build -t ${IMAGE}:${VERSION} . | tee build.log || exit 1
ID=$(tail -1 build.log | awk '{print $3;}')
docker tag $ID ${IMAGE}:${VERSION}
