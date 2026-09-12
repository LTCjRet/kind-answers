/* Movements overlay for The Ground (14-the-ground.html).

   A Leaflet consumer of assets/crossing-data.js - the same file that draws
   15-the-crossing.html and feeds fit-anchors.html. Three consumers, one set of
   coordinates: refit an anchor once and all three follow.

   14-the-ground.html owns the map, so it hands it over:
       if (window.KA_CROSSING_OVERLAY) window.KA_CROSSING_OVERLAY(map, L);

   Markup it expects (all optional - missing pieces are simply skipped):
       #ka-cross          checkbox, turns the layer on
       input[name=ka-day] radios, one per day, value = day id
       #ka-cross-short    one-line summary beside the radios
       #ka-cross-go       "Go there" button
       #ka-cross-panel    descriptor box below the map
       #ka-cross-body     its contents

   The day radios start on 3 October, not 7. A reader who has not reached the
   October chapter has to click forward to meet the outcome, the same courtesy
   the burial gate extends. */
window.KA_CROSSING_OVERLAY = function (map, L) {
  "use strict";

  var D = window.KA_CROSSING;
  if (!D || !map || !L) { return; }

  var COL = { us:"#2f4f63", flank:"#5c6b4a", enemy:"#7c2d2d", gold:"#a8853f", ink:"#1c1815" };
  var DASH = { stated:null, inferred:"14 9", conjectural:"2 7" };

  var A = D.anchors;
  function resolve(p) {
    if (typeof p === "string") { return [A[p].lat, A[p].lon]; }
    if (typeof p[0] === "string") { return [A[p[0]].lat + p[1], A[p[0]].lon + p[2]]; }
    return p;
  }

  var group = L.layerGroup();
  var corridors = [];          // band polylines, re-weighted on zoom
  var cur = D.days[0].id;
  var on = false;

  /* A corridor drawn in metres has to be re-weighted whenever the scale
     changes, or the uncertainty it represents silently grows and shrinks. */
  function metresToPixels(m) {
    var lat = map.getCenter().lat * Math.PI / 180;
    var res = 156543.03392 * Math.cos(lat) / Math.pow(2, map.getZoom());
    return Math.max(3, Math.min(70, m / res));
  }
  function reweight() {
    corridors.forEach(function (c) { c.line.setStyle({ weight: metresToPixels(c.m) }); });
  }
  map.on("zoomend", reweight);

  function draw() {
    group.clearLayers();
    corridors = [];

    D.features.forEach(function (f) {
      if (f.days.indexOf(cur) < 0) { return; }
      var pts = f.pts.map(resolve);
      if (f.type === "band") {
        var corridor = L.polyline(pts, {
          color: COL[f.color], weight: metresToPixels(f.width), opacity: 0.22,
          lineCap: "round", lineJoin: "round", interactive: false
        }).addTo(group);
        corridors.push({ line: corridor, m: f.width });
        L.polyline(pts, {
          color: COL[f.color], weight: 2, opacity: 0.9,
          dashArray: DASH[f.grade], interactive: false
        }).addTo(group);
      } else {
        L.polyline(pts, {
          color: COL[f.color], weight: f.width > 24 ? 5 : 4,
          opacity: f.grade === "conjectural" ? 0.6 : 0.9,
          dashArray: DASH[f.grade], lineCap: "round", lineJoin: "round"
        }).bindTooltip(f.label, { sticky: true }).addTo(group);
      }
    });

    D.marks.forEach(function (m) {
      if (m.days.indexOf(cur) < 0) { return; }
      var a = A[m.at]; if (!a) { return; }
      // The burial locations are the gated layer's business, not this one's.
      if (m.kind === "grave") { return; }
      var col = m.kind === "enemy" ? COL.enemy : m.kind === "kia" ? COL.gold
              : m.kind === "coL" ? COL.us : COL.flank;
      L.marker([a.lat + (m.dlat || 0), a.lon + (m.dlon || 0)], {
        icon: L.divIcon({
          className: "",
          html: '<span class="ka-unit" style="border-color:' + col + ';color:' + col + '">' +
                m.text + "</span>",
          iconSize: [0, 0], iconAnchor: [0, 0]
        }),
        interactive: false, keyboard: false
      }).addTo(group);
    });

    var day = byId(cur);
    if (day && day.focus && A[day.focus.at]) {
      var f = A[day.focus.at];
      L.marker([f.lat, f.lon], {
        icon: L.divIcon({
          className: "",
          html: '<span class="ka-pin"></span><span class="ka-pin-label">' + day.tab + "</span>",
          iconSize: [0, 0], iconAnchor: [0, 0]
        }),
        title: day.tab + " — " + f.name, alt: day.tab + " — " + f.name, keyboard: true
      }).bindPopup("<b>" + day.tab + " &mdash; " + day.title + "</b><br>" + day.short +
                   '<span class="ka-meta">Pin at ' + f.name +
                   (f.inferred ? " &middot; position inferred, &plusmn;" + f.inferred + " m" : "") +
                   "</span>").addTo(group);
    }
  }

  function byId(id) {
    for (var i = 0; i < D.days.length; i++) { if (D.days[i].id === id) { return D.days[i]; } }
    return null;
  }

  function goThere() {
    var day = byId(cur);
    if (!day || !day.focus) { return; }
    var a = A[day.focus.at]; if (!a) { return; }
    var dLat = day.focus.span / 111132;
    var dLon = day.focus.span / (111320 * Math.cos(a.lat * Math.PI / 180));
    map.flyToBounds(L.latLngBounds([a.lat - dLat, a.lon - dLon], [a.lat + dLat, a.lon + dLon]),
                    { duration: 0.8 });
  }

  function setDay(id) {
    cur = id;
    var day = byId(id); if (!day) { return; }
    var short = document.getElementById("ka-cross-short");
    if (short) { short.textContent = day.short; }
    var body = document.getElementById("ka-cross-body");
    if (body) {
      body.innerHTML =
        '<p class="ka-cross-ey">' + day.eyebrow + "</p>" +
        "<h3>" + day.title + "</h3>" +
        "<p>" + day.body + "</p>" +
        "<blockquote>" + day.quote + "<cite>" + day.cite + "</cite></blockquote>" +
        '<p class="ka-cross-cas">Regimental casualties that day: ' + day.cas + ".</p>";
    }
    if (on) { draw(); }
  }

  /* ---------- wiring ---------- */
  var box = document.getElementById("ka-cross");
  var panel = document.getElementById("ka-cross-panel");
  var radios = document.getElementsByName("ka-day");
  var go = document.getElementById("ka-cross-go");
  var rows = document.getElementById("ka-cross-rows");

  Array.prototype.forEach.call(radios, function (r) {
    r.addEventListener("change", function () { if (r.checked) { setDay(r.value); } });
  });
  if (go) { go.addEventListener("click", goThere); }

  function setOn(v) {
    on = v;
    if (rows)  { rows.classList.toggle("ka-disabled", !v); }
    if (panel) { panel.hidden = !v; }
    if (v) { draw(); group.addTo(map); } else { map.removeLayer(group); }
  }
  if (box) { box.addEventListener("change", function () { setOn(this.checked); }); }

  setDay(cur);
  setOn(box ? box.checked : false);
};
