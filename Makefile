
dev: build
	cd dist/ && python -m http.server

build: src
	mkdir -p dist/
	cp src/index.html dist/
	cp src/index.js dist/
	cp src/styles.css dist/
	cp -r data dist/

.PHONY: dev
