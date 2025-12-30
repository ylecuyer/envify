lint:
	npx web-ext lint --source-dir=.

build:
	npx web-ext build --source-dir=. --artifacts-dir=./build

sign:
	npx web-ext sign --source-dir=. --api-key=$$WEB_EXT_API_KEY --api-secret=$$WEB_EXT_API_SECRET --artifacts-dir=./build