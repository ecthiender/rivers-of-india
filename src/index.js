// Constants
OSM_ATTRIBUTION = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
ACCESS_TOKEN = "pk.eyJ1IjoiZWN0aGllbmRlciIsImEiOiJja2xxcmNsbncxNWs3MnBxbTB2cWxzNzJwIn0.IhuSiCpVvP4K2JQQtXezuw"
OSM_DATA_URL = "/data/india-rivers.geojson"

RIVER_COLOR="#2976F2"
RIVER_COLOR_COMPL1="#A66F00"
RIVER_COLOR_COMPL2="#F2B029"

function runViz() {
  var mapL = L.map("map").setView([20.67085, 78.87206], 5);

  L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: OSM_ATTRIBUTION,
    maxZoom: 18,
    id: "mapbox/streets-v11",
    tileSize: 512,
    zoomOffset: -1,
    accessToken: ACCESS_TOKEN
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
  const name = "<div>" + feature.properties.name + "</div>";
  const details = makeDetails(feature.properties);
  layer.on('mouseover', () => layer.setStyle({color: RIVER_COLOR_COMPL2}));
  layer.on('mouseout', () => layer.setStyle({color: RIVER_COLOR}));
  layer.bindTooltip(name, {sticky: true, className: "river-tooltip"});
  layer.bindPopup(details);
}

function makeDetails(props) {
  var html = "<h3>" + props.name + "</h3>";
  html += "<p> <b>Other names</b>: " + props["name:en"] + ", " + props["name:hi"] + "</p>";
  html += "<p><b>Tributary of</b>: " + props["tributary_of"] + "</p>";
  return html;
}

window.onload = runViz;
