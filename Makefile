install:
	npm ci

build:
	npx webpack

dev:
	npx webpack serve --open

lint:
	npx eslint .

lint-fix:
	npx eslint . --fix
