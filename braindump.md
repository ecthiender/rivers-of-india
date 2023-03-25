# Braindump of building this

Something trivial like this also might require careful thoughts and
considerations when rolling out to production. I coded this up over a weekend,
and it was no problem. I solved the problem I wanted to solve, and gained
insights, played around with it. But when I wanted to make this live on the
internet I had to consider so many things. I'm using this document to dump what
all I had to go through.

## Finding the data source
First during the initial dev, the main challenge or the problem was getting the
data on rivers of India. Had to search around many places. Fiddle with various
OSM options and overpass query engine, and overpass queries etc. 

> TODO: fill this out with all the details

## How to best render this info on the map?
Popups, Text content, Layout etc.

## Optimizations -> User Experience blocker
The GeoJSON file is 30MB! Downloading this for a lot of users would be a
disaster in user experience. How can we optimize this?

> Thoughts of building a minifier CLI in haskell :P

> TODO: fill out all the details -> gzip -> streaming -> splitting the file
> itself -> final decision of minification + download progress bar

For the download progress bar its easiest to use async/await
(https://javascript.info/fetch-progress). But async/await is not supported on
IE. Hence we have to forego IE
(https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function).

That leads to thinking, we should display nice errors for unsupported versions.
Error collection and reporting / analytics would be helpful here to see what
kind of users we have.

## Favicon
Have to design a favicon?

Update: downloaded a free icon from the web

# Compress the geojson
Compress the geojson and then use something like Pako
(https://github.com/nodeca/pako) on the client side to decompress.

Update: this is not required anymore. Minification is good enough. Netlify
compresses the geojson anyway, and sends relevant caching headers.

# Future work

## Better data
Get better data

- More rivers. Many major rivers like Teesta etc. are missing
- Length of each river
- Actual source of each river
- Destination of each river
- "Tributary of" info of each river

## Error reporting
How can I reliably collect errors for my observability. I want a self hosted
solution, and not use a SaaS (like Sentry).

https://github.com/cheeaun/javascript-error-logging

## Even better UX
The river colour looks to similar to the ocean colour. Maybe its hard to
distinguish for people that they can hover of the rivers.

### Animate rivers
We can animate the rivers. Atleast on the first render.

Options - 
- https://github.com/IvanSanchez/Leaflet.Polyline.SnakeAnim/
- https://rubenspgcavalcante.github.io/leaflet-ant-path/

### A leaflet plugin for rendering variable width rivers

https://github.com/ggolikov/Leaflet.River
