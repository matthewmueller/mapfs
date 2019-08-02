# Automatically install & include https://github.com/matthewmueller/make
ifeq ($(strip $(wildcard ${.INCLUDE_DIRS}/github.com/matthewmueller/make/all.mk)),)
	i := $(shell >&2 echo "installing github.com/matthewmueller/make..." && curl -sL https://git.io/fjD5i | sh)
endif
include github.com/matthewmueller/make/all.mk

GREP ?= ""

precommit: install test

clean:
	@ rm -rf node_modules

install: clean bin.yarn
	@ yarn install

check: bin.yarn
	@ yarn check --integrity --verify-tree
	@ ./node_modules/.bin/tsc

check.watch:
	@ ./node_modules/.bin/tsc -w

test: clean install check
	@ ./node_modules/.bin/taz -b -g "$(GREP)" --timeout 60s

test.only:
	@ ./node_modules/.bin/taz -b -g "$(GREP)" --timeout 60s

publish: bin.yarn bin.node bin.jq env.NPM_TOKEN test
	@ echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc
	@ if [ "$(shell yarn info -s $(shell jq '.name' < package.json) version)" != "$(shell jq .version < package.json)" ]; then \
			yarn publish; \
		fi
	@ rm .npmrc

# Run through CI
ci.test: test
ci.deploy: publish
