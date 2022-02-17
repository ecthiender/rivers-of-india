(function() {

// Constants
OSM_ATTRIBUTION = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
TOKEN = "pk.eyJ1IjoiZWN0aGllbmRlciIsImEiOiJja2xxcmNsbncxNWs3MnBxbTB2cWxzNzJwIn0.IhuSiCpVvP4K2JQQtXezuw"
OSM_DATA_URL = "/data/india-rivers.geojson"

// the color of the water in the leaflet map
LEAFLET_WATER_COLOR="#75cff0"
RIVER_COLOR="#6ABBD9"
RIVER_COLOR_ALT="#E67929"

/* Original list of all languages the data set has
__LANGS__ = ["af","al","am","an","ar","as","az","be","bg","bn","bo","br","bs","ca","cs","cy","da","de","dv","el","en","eo","es","et","eu","fa","fi","fr","ga","gl","gu","he","hi","hr","hu","hy","ia","id","is","it","ja","jp","jv","ka","kk","kn","ko","ku","la","lb","li","lt","lv","mk","ml","mr","ms","my","ne","nl","nn","no","oc","or","pa","pl","ps","pt","ro","ru","sa","sd","sk","sl","sr","sv","sw","ta","te","tg","th","tk","tl","tr","uk","ur","vi","yi","zh"];
*/
// Filtered languages
LANGS = ["alt","ar","as","bn","en","gu","hi","kn","ml","mr","ne","or","pa","sa","sd","ta","te","ur"].map((l) => "name:" + l);

function runViz() {

  const screenWidth = window.screen.width
  const screenHeight = window.screen.height

  const riverLineWeight = screenWidth > 1920 ? 4 : 3
  const initCoords = [20.67085, 78.87206]
  // FIXME: set this initial coordinates based on screen size. The below looks good for 1366x768 screens
  const initZoomLevel = screenWidth > 1920 ? 6 : 5

  const mapL = L.map('map').setView(initCoords, initZoomLevel);

  L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={token}", {
    attribution: OSM_ATTRIBUTION,
    maxZoom: 18,
    id: "mapbox/streets-v11",
    tileSize: 512,
    zoomOffset: -1,
    token: TOKEN
  }).addTo(mapL);

  // fetch the rivers data and initialize it on the map
  fetch(OSM_DATA_URL)
  .then(res => res.json())
  .then(data => {
    // console.log('got response', data);
    addRivers(mapL, data)
  })
  .catch(error => {
    console.log('error fetching data', error);
    alert('Some error occurred while fetching data from the server. Please try again in some time.')
  });
}

function addRivers(mapL, data) {
  const riverStyles = {
    color: RIVER_COLOR,
    weight: 4,
    opacity: 1
  }

  L.geoJSON(data, {
    style: riverStyles,
    onEachFeature: riverDetailsPopup
  }).addTo(mapL)
}

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

})()
