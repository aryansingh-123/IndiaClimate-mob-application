import { INDIA_CENTER, INDIA_ZOOM, OSM_TILE_URL } from "@/constants/map";
import { LEAFLET_CSS, LEAFLET_JS } from "@/components/map/vendor/leaflet";

// Inline SVG glyphs for markers. Kept small and dependency-free, since the
// WebView cannot use the React Native icon set.
const ICONS = `{
  sun: '<circle cx="12" cy="12" r="4.5" fill="#FFB347"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" stroke="#FFB347" stroke-width="2" stroke-linecap="round"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="#BFD7FF"/>',
  cloud: '<path d="M7 18h10a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.6 1.5A3.2 3.2 0 0 0 7 18z" fill="#DCE6F2"/>',
  rain: '<path d="M7 14h10a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.6 1.5A3.2 3.2 0 0 0 7 14z" fill="#B8C7DA"/><path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3" stroke="#4FA3E0" stroke-width="2" stroke-linecap="round"/>',
  storm: '<path d="M7 14h10a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.6 1.5A3.2 3.2 0 0 0 7 14z" fill="#8A97A8"/><path d="M13 14l-3 4h3l-2 4" stroke="#FFD166" stroke-width="2" fill="none" stroke-linejoin="round"/>',
  snow: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9" stroke="#CFE8FF" stroke-width="2" stroke-linecap="round"/>'
}`;

// Builds the Leaflet page. Data is pushed in with window.setState and map
// commands with window.command. Events go back to React Native as JSON messages.
export function buildMapHtml(): string {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
<style>${LEAFLET_CSS}</style>
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; background: #dfe9f3; }
  .marker { display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); font-family: sans-serif; }
  .bubble { display: flex; align-items: center; gap: 3px; background: #fff; border-radius: 14px; padding: 2px 8px 2px 3px; box-shadow: 0 2px 6px rgba(0,0,0,.25); font-weight: 700; font-size: 13px; color: #0B2545; white-space: nowrap; }
  .bubble.sel { outline: 2px solid #F28C28; }
  .bubble svg { width: 20px; height: 20px; }
  .name { margin-top: 3px; font-size: 11px; font-weight: 600; color: #0B2545; background: rgba(255,255,255,.92); border-radius: 6px; padding: 1px 6px; white-space: nowrap; }
  .gps { width: 16px; height: 16px; border-radius: 50%; background: #2F80ED; border: 3px solid #fff; box-shadow: 0 0 0 6px rgba(47,128,237,.25); }
  .pin { width: 18px; height: 18px; border-radius: 50%; background: #F28C28; border: 3px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,.35); }
</style>
</head>
<body>
<div id="map"></div>
<script>${LEAFLET_JS}</script>
<script>
(function () {
  function post(message) {
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(message));
  }
  if (typeof L === "undefined") {
    post({ type: "error", detail: "The map library did not initialise." });
    return;
  }

  var ICONS = ${ICONS};
  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var map = L.map("map", { zoomControl: false, minZoom: 3, maxZoom: 18 }).setView([${INDIA_CENTER.latitude}, ${INDIA_CENTER.longitude}], ${INDIA_ZOOM});
  L.tileLayer("${OSM_TILE_URL}", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  var markerLayer = L.layerGroup().addTo(map);
  var gpsLayer = L.layerGroup().addTo(map);
  var pointLayer = L.layerGroup().addTo(map);
  var lastFocusNonce = null;

  map.on("click", function (event) {
    post({ type: "tap", latitude: event.latlng.lat, longitude: event.latlng.lng });
  });

  window.setState = function (state) {
    markerLayer.clearLayers();
    gpsLayer.clearLayers();
    pointLayer.clearLayers();

    (state.markers || []).forEach(function (m) {
      var selected = m.id === state.selectedId;
      var html = '<div class="marker"><div class="bubble' + (selected ? " sel" : "") + '">'
        + '<svg viewBox="0 0 24 24">' + ICONS[m.icon] + "</svg>"
        + "<span>" + escapeHtml(m.label) + "</span></div>"
        + (selected ? '<div class="name">' + escapeHtml(m.name) + "</div>" : "")
        + "</div>";
      var icon = L.divIcon({ className: "", iconSize: null, html: html });
      L.marker([m.latitude, m.longitude], { icon: icon, title: m.name })
        .on("click", function (event) {
          L.DomEvent.stopPropagation(event);
          post({ type: "marker", id: m.id });
        })
        .addTo(markerLayer);
    });

    if (state.gps) {
      L.marker([state.gps.latitude, state.gps.longitude], {
        icon: L.divIcon({ className: "", iconSize: [16, 16], html: '<div class="gps"></div>' }),
        interactive: false
      }).addTo(gpsLayer);
    }

    if (state.point) {
      L.marker([state.point.latitude, state.point.longitude], {
        icon: L.divIcon({ className: "", iconSize: [18, 18], html: '<div class="pin"></div>' }),
        interactive: false
      }).addTo(pointLayer);
    }

    // Fly only when the focus request changes, so routine data updates never move the map.
    if (state.focus && state.focus.nonce !== lastFocusNonce) {
      lastFocusNonce = state.focus.nonce;
      map.flyTo([state.focus.latitude, state.focus.longitude], state.focus.zoom, { duration: 0.8 });
    }
  };

  window.command = function (command) {
    if (command.name === "zoomIn") map.zoomIn();
    if (command.name === "zoomOut") map.zoomOut();
  };

  // Runtime errors are reported as logs. The React Native side decides whether the map has failed.
  window.addEventListener("error", function (event) { post({ type: "log", message: String(event.message) }); });
  post({ type: "ready" });
})();
</script>
</body>
</html>`;
}
