mocha 		= ./node_modules/.bin/mocha
jshint		= ./node_modules/.bin/jshint
linelint	= ./node_modules/.bin/linelint
lintspaces 	= ./node_modules/.bin/lintspaces

.PHONY : test

default: format

# Test file for formatting and errors, then run tests
test:format
	$(mocha) -R spec ./test/*.js

# Test file formatting and for errors
format:
	$(lintspaces) -nt -i js-comments -d spaces -s 2 ./index.js
	@echo "lintspaces pass!\n"
	$(linelint) ./index.js
	@echo "linelint pass!\n"
	$(jshint) ./index.js
	@echo "JSHint pass!\n"