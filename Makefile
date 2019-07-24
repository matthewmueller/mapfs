# Automatically install `github.com/matthewmueller/make` if we haven't already
includes := $(wildcard ${.INCLUDE_DIRS}/github.com/matthewmueller/make/all.mk)
ifeq ($(strip ${includes}),)
	installer := $(shell >&2 echo "Installing 'github.com/matthewmueller/make'..." && \
		curl -sL https://raw.githubusercontent.com/matthewmueller/make/master/install.sh | sh)
endif
include github.com/matthewmueller/make/all.mk

precommit: test

clean:
	@ rm -rf node_modules

install:
	@ npm install

check:
	@ ./node_modules/.bin/tsc

check.watch:
	@ ./node_modules/.bin/tsc -w

test: clean install check
	@ ./node_modules/.bin/taz

publish: bin.npm bin.node bin.jq env.NPM_TOKEN test
	@ echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc
	@ jq --arg version "$(shell npm show $(shell jq '.name' < package.json) version)" '. + {version: $$version}' < package.json > package.tmp.json
	@ mv package.tmp.json package.json
	@ npm version minor --force --no-commit-hooks --no-git-tag-version
	@ npm publish

# Run through CI
ci.test: test
ci.deploy: publish