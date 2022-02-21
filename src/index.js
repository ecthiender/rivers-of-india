(function() {
// Codenamed: nadiviz; nadi.anonray.in / nadiviz.anonray.in

// Constants
OSM_ATTRIBUTION = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
TOKEN = "pk.eyJ1IjoiZWN0aGllbmRlciIsImEiOiJja2xxcmNsbncxNWs3MnBxbTB2cWxzNzJwIn0.IhuSiCpVvP4K2JQQtXezuw"
OSM_DATA_URL = "/data/india-rivers.min.geojson"

// the color of the water in the leaflet map
LEAFLET_WATER_COLOR="#75cff0"
// RIVER_COLOR="#6ABBD9"
RIVER_COLOR="#75cff0"
RIVER_COLOR_ALT="#E67929"

/* Original list of all languages the data set has
__LANGS__ = ["af","al","am","an","ar","as","az","be","bg","bn","bo","br","bs","ca","cs","cy","da","de","dv","el","en","eo","es","et","eu","fa","fi","fr","ga","gl","gu","he","hi","hr","hu","hy","ia","id","is","it","ja","jp","jv","ka","kk","kn","ko","ku","la","lb","li","lt","lv","mk","ml","mr","ms","my","ne","nl","nn","no","oc","or","pa","pl","ps","pt","ro","ru","sa","sd","sk","sl","sr","sv","sw","ta","te","tg","th","tk","tl","tr","uk","ur","vi","yi","zh"];
*/
// Filtered languages
LANGS = ["alt","ar","as","bn","en","gu","hi","kn","ml","mr","ne","or","pa","sa","sd","ta","te","ur"].map((l) => "name:" + l);

// Main function which sets up the map, downloads the data, and renders it on the map
async function runViz() {
  const screenWidth = window.screen.width
  const screenHeight = window.screen.height

  const riverLineWeight = screenWidth > 1920 ? 4 : 3
  const initCoords = [20.67085, 78.87206]
  const initZoomLevel = screenWidth > 1920 ? 6 : 5

  const satelliteView = newTileLayer('mapbox/satellite-streets-v11')
  const streetView = newTileLayer('mapbox/streets-v11')

  const mapL = L.map('map', {
    center: initCoords,
    zoom: initZoomLevel,
    layers: [satelliteView, streetView]
  })

  const baseMaps = {
    "<span class='leaflet-override-custom'>Street View</span>": streetView,
    "<span class='leaflet-override-custom'> Satellite View </span>": satelliteView,
  }

  L.control.layers(baseMaps).addTo(mapL)

  // load data and initialize it on the map
  let res
  try {
    res = await downloadWithProgress(OSM_DATA_URL, downloadProgressBar)
  } catch (error) {
    console.log('error fetching data', error);
    alert('Some error occurred while fetching data from the server. Please try again in some time.')
  }
  const data = JSON.parse(res)
  addRivers(mapL, data)
}

// shows progress of the download of the dataset
function downloadProgressBar(total, current) {
  const wrapperEl = document.getElementById('download-progress')
  const el = document.getElementById('dl-prg-content')
  if (current >= total) {
    wrapperEl.style.display = 'none'
    return
  }
  wrapperEl.style.display = 'block'
  const progressPercent = Math.round((current / total) * 100)
  const totalSizeMB = (total / 1024 / 1024).toFixed(2) // total is in bytes
  // el.innerHTML = `Downloading dataset. Size: ${totalSizeMB}MB. Downloaded: ${progressPercent}%`
  el.innerHTML = `Downloading dataset. Size: ${totalSizeMB}MB`
  if (totalSizeMB == 0 || progressPercent == Infinity) {
    wrapperEl.style.display = 'none'
  }
}

// adds the dataset to the map as layer
function addRivers(mapL, data) {
  const riverStyles = {
    color: RIVER_COLOR,
    weight: 4,
    opacity: 0.9
  }

  L.geoJSON(data, {
    style: riverStyles,
    onEachFeature: riverDetailsPopup
  }).addTo(mapL)
}

// sets up a popup for each river feature
function riverDetailsPopup(feature, layer) {
  // set on hover styles
  layer.on('mouseover', () => layer.setStyle({color: RIVER_COLOR_ALT}));
  layer.on('mouseout', () => layer.setStyle({color: RIVER_COLOR}));

  // set on hover tooltip
  const title = `<div>${getRiverName(feature.properties)}</div>`
  layer.bindTooltip(title, {sticky: true, className: 'river-tooltip'});

  // set onclick popup
  layer.bindPopup(makeDetails(feature.properties));
}

// helper function to create the copy in the popup
function makeDetails(props) {
  let html = `<div class="popup-title"> ${getRiverName(props)} </div>`;
  const availableLangs = LANGS.filter((lang) => props.hasOwnProperty(lang));
  const otherNames = availableLangs.map((lang) => props[lang]);
  html += makeDetail('Source', props["source"] || props['source:name:uk'])
  html += makeDetail('Destination', props["destination"])
  html += makeDetail('Tributary of', props["tributary_of"])
  html += makeDetail('Role', props["role"])
  html += makeDetail('Service', props["service"])
  html += makeDetail('Width', props["width"])
  html += makeDetail('Other names', otherNames.join(', '))
  html += makeWikiLink(props["wikipedia"])
  return html
}

function makeDetail(label, value) {
  if (!value) {
    return ''
  }
  return `<div><b>${label}</b>: ${value} </div>`
}

function makeWikiLink(wiki) {
  if (wiki) {
    const href = `https://wikipedia.org/wiki/${encodeURIComponent(wiki)}`
    return `<p> <a target='_blank' href="${href}">Learn More</a> </p>`
  }
  return ''
}

// try to name of the river from various possible attributes
function getRiverName(props) {
  const validAttrs = ["name", "name:en", "alt_name", "name:alt"];
  for (var i = 0; i < validAttrs.length; i++) {
    let p = validAttrs[i];
    if (props.hasOwnProperty(p)) {
      return props[p];
    }
  }
  return "<i>Unknown</i>";
}

window.onload = runViz;

/*----------------------------*/

/* Various helper/utility/internal functions */

// function wrrapping the mapbox API and leaflet tilelayer API.
//  args: map box tileset id
// returns: leaflet tile layer
function newTileLayer(tilesetId) {
  // uses the static tiles API - https://docs.mapbox.com/api/maps/static-tiles
  const mapboxUrl = "https://api.mapbox.com/styles/v1/{tileset_id}/tiles/{z}/{x}/{y}?access_token={token}"
  const mapboxDefs = {
    attribution: OSM_ATTRIBUTION,
    maxZoom: 18,
    tileSize: 512,
    zoomOffset: -1,
    token: TOKEN
  }
  return L.tileLayer(mapboxUrl, {...mapboxDefs, tileset_id: tilesetId})
}

async function downloadWithProgress(url, progressCallback) {
  // Step 1: start the fetch and obtain a reader
  const response = await fetch(url)
  const reader = response.body.getReader()

  // Step 2: get total length
  const contentLength = +(response.headers.get('content-length') || response.headers.get('Content-Length'))

  // Step 3: read the data
  let receivedLength = 0
  // initial call to the progress stepper function with 0 receivedLength
  progressCallback(contentLength, receivedLength)
  let chunks = []
  while(true) {
    const {done, value} = await reader.read()
    if (done) {
      break
    }
    chunks.push(value)
    receivedLength += value.length
    // console.log(` [DOWNLOADING] =======>>>> Received ${receivedLength} of ${contentLength} bytes`)
    // FIXME: figure out how to reliably calculate percentages when chunk size and content-length headers dont match
    progressCallback(contentLength, receivedLength)
  }
  // Step 4: concatenate chunks into single Uint8Array
  let chunksAll = new Uint8Array(receivedLength) // (4.1)
  let position = 0;
  for(let chunk of chunks) {
    chunksAll.set(chunk, position) // (4.2)
    position += chunk.length
  }
  // Step 5: decode into a string and return
  const result = new TextDecoder('utf-8').decode(chunksAll)
  return result
}

})()
