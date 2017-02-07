# Default GOPATH to the current directory
GOPATH ?= `pwd`
FIVECALLS_ARGS =
ifdef AIRTABLE_DATABASE
	FIVECALLS_ARGS = --airtable-base=$(AIRTABLE_DATABASE)
endif

.PHONY: default build build-dev build-prod deploy deploy-static deploy_static

default: build-dev

build: build-prod

# Install dependencies
deps:
	set -e
	set -x
	go get

# Run with reload
run:
	GOPATH=$(GOPATH) go run *.go $(FIVECALLS_ARGS)

# Build binary file locally
build-dev:
	set -e
	set -x

	GOPATH=$(GOPATH) go build -o fivecalls
	echo "Build done"

build-prod:
	set -e
	set -x

	# this works great for non-cgo stuff, we're using sqlite :(
	# GOOS=linux go build -o fivecalls-linux

	# install xgo and docker first, but pretty straightforward
	~/gocode/bin/xgo -out fivecalls -go 1.7.x --targets=linux/amd64 .
	echo "Built for linux"

deploy:
	set -e
	set -x

	# this works great for non-cgo stuff, we're using sqlite :(
	# GOOS=linux go build -o fivecalls-linux

	# install xgo and docker first, but pretty straightforward
	xgo -out fivecalls -go 1.7.x --targets=linux/amd64 .
	echo "Built for linux"

	scp index.html fivecalls@5calls.org:/home/fivecalls/
	scp -C fivecalls-linux-amd64 fivecalls@5calls.org:/home/fivecalls/fivecalls-linux-amd64.tmp
	ssh fivecalls@5calls.org install /home/fivecalls/fivecalls-linux-amd64.tmp /home/fivecalls/fivecalls-linux-amd64
	echo "Uploaded."

deploy-static: deploy_static

deploy_static:
	cd .. && gulp deploy

	sleep 0.1

	git rev-parse HEAD > ../static/html/VERSION

	scp -r ../app/static/* fivecalls@5calls.org:/var/www/5calls/html/
	echo "Sent static site to server"
