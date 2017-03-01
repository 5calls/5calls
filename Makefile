
.PHONY: default build deploy-static deploy_static

default: build

build:
	gulp deploy

deploy-static: deploy_static

deploy_static:
	gulp deploy

	sleep 0.1

	git rev-parse HEAD > static/html/VERSION

	scp -r app/static/* fivecalls@5calls.org:/var/www/5calls/html/
	echo "Sent static site to server"