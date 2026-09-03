.PHONY: build-dev build-e2e build-service build e2e fmt lint test

DIST=./dist/new-collections

build-service:
	yarn esbuild ./src/background.ts --legal-comments=none --bundle --outfile=${DIST}/background.js --minify

build-dev:
	yarn ng build --configuration development
	make build-service

build-e2e:
	yarn ng build --configuration e2e
	make build-service

build:
	yarn ng build --configuration production --output-hashing none
	make build-service

e2e:
	make build-e2e
	yarn vitest

fmt:
	git diff --name-only --diff-filter=d | grep -E "\.(ts|json|html|scss)$$" | xargs yarn prettier -w

lint:
	yarn ng lint
	yarn stylelint "./src/**/*.scss"

test:
	yarn ng test

