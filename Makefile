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
	@ jq --arg version "$(shell npm show taz version)" '. + {version: $$version}' < package.json > package.tmp.json
	@ mv package.tmp.json package.json
	@ npm version minor --force --no-commit-hooks --no-git-tag-version
	@ npm publish

# Run through CI
ci.test: test
ci.deploy: publish