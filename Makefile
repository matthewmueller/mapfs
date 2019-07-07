precommit: test

compile: clean
	@ ./node_modules/.bin/tsc

compile.watch: clean
	@ ./node_modules/.bin/tsc -w

test: clean
	@ ./node_modules/.bin/mocha --require ts-mocha lib/index_test.ts

test.watch: clean
	@ ./node_modules/.bin/mocha --require ts-mocha -w lib/index_test.ts

clean:
	@ rm -rf dist/