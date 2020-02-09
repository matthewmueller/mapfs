GREP ?= ""

# Precommit hook
precommit: clean install check build test

clean:
	@ rm -rf node_modules
install: yarn.install
check: yarn.check
build: tsc.build
test: mocha.test

yarn.check: bin.yarn
	@ yarn check --integrity --verify-tree

yarn.install: bin.yarn
	@ yarn install

tsc.build:
	@ ./node_modules/.bin/tsc

tsc.watch:
	@ ./node_modules/.bin/tsc -w

mocha.test:
	@ ./node_modules/.bin/mocha -b -g "$(GREP)" dist/*_test.js

# Ensure we have the provided command binary in our $PATH
bin.%:
	@ if [ "$$(command -v ${*})" = "" ]; then \
		echo "Required binary \`${*}\` is not found in your \$$PATH."; \
		exit 1; \
	fi
.PHONY: bin bin. bin.%%