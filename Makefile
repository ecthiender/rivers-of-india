
dev: build
	cd dist/ && python -m http.server

build: src
	mkdir -p dist/data/
	cp src/index.html dist/
	cp src/index.js dist/
	cp src/styles.css dist/
	$(shell cp -r data/*.geojson dist/data/)
	$(shell cp -r data/*.geojson.gz dist/data/ || true)

clean:
	rm -rf dist/

.PHONY: dev clean
