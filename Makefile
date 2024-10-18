install:
	npm ci

build:
	NODE_ENV=production npx webpack

dev:
	npx webpack serve --open

lint:
	npx eslint .

lint-fix:
	npx eslint . --fix
