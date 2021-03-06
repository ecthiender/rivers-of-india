// Constants
OSM_ATTRIBUTION = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
TOKEN = "pk.eyJ1IjoiZWN0aGllbmRlciIsImEiOiJja2xxcmNsbncxNWs3MnBxbTB2cWxzNzJwIn0.IhuSiCpVvP4K2JQQtXezuw"
OSM_DATA_URL = "/data/india-rivers.geojson"

RIVER_COLOR="#2976F2"
RIVER_COLOR_COMPL1="#A66F00"
RIVER_COLOR_COMPL2="#F2B029"
/* Original list of all languages the data set has
__LANGS__ = ["af","al","am","an","ar","as","az","be","bg","bn","bo","br","bs","ca","cs","cy","da","de","dv","el","en","eo","es","et","eu","fa","fi","fr","ga","gl","gu","he","hi","hr","hu","hy","ia","id","is","it","ja","jp","jv","ka","kk","kn","ko","ku","la","lb","li","lt","lv","mk","ml","mr","ms","my","ne","nl","nn","no","oc","or","pa","pl","ps","pt","ro","ru","sa","sd","sk","sl","sr","sv","sw","ta","te","tg","th","tk","tl","tr","uk","ur","vi","yi","zh"];
*/
// Filtered languages
LANGS = ["alt","ar","as","bn","en","gu","hi","kn","ml","mr","ne","or","pa","sa","sd","ta","te","ur"].map((l) => "name:" + l);

function runViz() {
  var mapL = L.map("map").setView([20.67085, 78.87206], 5);

  L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={token}", {
    attribution: OSM_ATTRIBUTION,
    maxZoom: 18,
    id: "mapbox/streets-v11",
    tileSize: 512,
    zoomOffset: -1,
    token: TOKEN
  }).addTo(mapL);

  fetch(OSM_DATA_URL)
  .then(res => res.json())
  .then(data => {
    // console.log('got response', data);
    addRivers(mapL, data)
  })
  .catch(error => {
    console.log('error fetching data', error);
    alert('Some error occurred while fetching data from server. Please try again in some time.')
  });
}

function addRivers(mapL, data) {
  const riverStyles = {
    color: RIVER_COLOR,
    weight: 3,
    opacity: 1
  };

  L.geoJSON(data, {
    style: riverStyles,
    onEachFeature: featureLogic
  }).addTo(mapL);
}

function featureLogic(feature, layer) {
  // set on hover styles
  layer.on('mouseover', () => layer.setStyle({color: RIVER_COLOR_COMPL2}));
  layer.on('mouseout', () => layer.setStyle({color: RIVER_COLOR}));

  // set on hover tooltip
  const name = getName(feature.properties);
  const title = "<div>" + name + "</div>";
  layer.bindTooltip(title, {sticky: true, className: "river-tooltip"});

  // set onclick popup
  const details = makeDetails(feature.properties);
  layer.bindPopup(details);
}

function makeDetails(props) {
  let html = "<h3>" + getName(props) + "</h3>";
  const availableLangs = LANGS.filter((lang) => props.hasOwnProperty(lang));
  const otherNames = availableLangs.map((lang) => props[lang]);
  html += "<p><b>Other names</b>: " + sanitizeDisplay(otherNames.join(", ")) + "</p>";
  html += "<p><b>Tributary of</b>: " + sanitizeDisplay(props["tributary_of"]) + "</p>";
  html += makeWikiLink(props["wikipedia"]);
  return html;
}

function makeWikiLink(wiki) {
  if (wiki) {
    const href = "https://wikipedia.org/wiki/" + encodeURIComponent(wiki);
    return "<p> More details: <a target='_blank' href=\"" + href + "\">Wikipedia</a> </p>";
  }
  return "";
}

// try to name of the river from various possible attributes
function getName(props) {
  const validAttrs = ["name", "name:en", "alt_name", "name:alt"];
  for (var i = 0; i < validAttrs.length; i++) {
    let p = validAttrs[i];
    if (props.hasOwnProperty(p)) {
      return props[p];
    }
  }
  return "<i>Unknown</i>";
}

function sanitizeDisplay(str) {
  if(!str) {
    return "<i> Data not available </i>";
  }
  return str;
}

window.onload = runViz;
