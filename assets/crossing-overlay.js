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
window.KA_CROSSING_OVERLAY = function (map, L, opts) {
  "use strict";

  var D = window.KA_CROSSING;
  if (!D || !map || !L) { return; }
  opts = opts || {};

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
  var REVEALED = window.KA_REVEAL_ON ? !!window.KA_REVEALED : true;
  /* No reveal.js on the page means the site withholds nothing (Three Sergeants
     tells the outcome from its index), so default to showing everything. Where
     the module IS present, it owns the answer. */

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
      if (f.type === "zone") {
        var ctr = resolve(f.centre);
        var circ = L.circle(ctr, { radius:f.radius, color:COL[f.color], weight:2,
          opacity:.9, dashArray:DASH[f.grade], fillColor:COL[f.color], fillOpacity:.13,
          interactive: !!(REVEALED && f.label) });
        if (REVEALED && f.label) { circ.bindTooltip(f.label, { sticky:true }); }
        circ.addTo(group);
        return;
      }
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
      if (m.reveal && !REVEALED) { return; }
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

    var day = byId(cur), fo = focusOf(day);
    if (day && fo && A[fo.at]) {
      var f = A[fo.at];
      L.marker([f.lat, f.lon], {
        icon: L.divIcon({
          className: "",
          html: '<span class="ka-pin"></span><span class="ka-pin-label">' + day.tab + "</span>",
          iconSize: [0, 0], iconAnchor: [0, 0]
        }),
        title: day.tab + " — " + f.name, alt: day.tab + " — " + f.name, keyboard: true
      }).bindPopup("<b>" + day.tab + " &mdash; " + (view(day).title || day.title) + "</b><br>" +
                   (view(day).short || day.short) +
                   '<span class="ka-meta">Pin at ' + f.name +
                   (f.inferred ? " &middot; position inferred, &plusmn;" + f.inferred + " m" : "") +
                   "</span>").addTo(group);
    }
  }

  // Which day-record to read: the shielded one stands in until the reader clears.
  function view(day) { return (!REVEALED && day && day.shielded) ? day.shielded : {}; }
  function focusOf(day) { return view(day).focus || (day && day.focus); }

  function byId(id) {
    for (var i = 0; i < D.days.length; i++) { if (D.days[i].id === id) { return D.days[i]; } }
    return null;
  }

  function goThere() {
    var day = byId(cur), fo = focusOf(day);
    if (!day || !fo) { return; }
    var a = A[fo.at]; if (!a) { return; }
    var dLat = fo.span / 111132;
    var dLon = fo.span / (111320 * Math.cos(a.lat * Math.PI / 180));
    map.flyToBounds(L.latLngBounds([a.lat - dLat, a.lon - dLon], [a.lat + dLat, a.lon + dLon]),
                    { duration: 0.8 });
  }

  function setDay(id) {
    cur = id;
    var day = byId(id); if (!day) { return; }
    // A shielded variant is the same day told without its outcome.
    var v = view(day);
    var short = document.getElementById("ka-cross-short");
    if (short) { short.textContent = v.short || day.short; }
    var body = document.getElementById("ka-cross-body");
    if (body) {
      body.innerHTML =
        '<p class="ka-cross-ey">' + day.eyebrow + "</p>" +
        "<h3>" + (v.title || day.title) + "</h3>" +
        "<p>" + (v.body || day.body) + "</p>" +
        "<blockquote>" + (v.quote || day.quote) +
          "<cite>" + (v.cite || day.cite) + "</cite></blockquote>" +
        '<p class="ka-cross-cas">Regimental casualties that day: ' + day.cas + ".</p>";
    }
    if (on) { draw(); }
    // The page decides what a day means beyond the map - The Ground uses this to
    // bring up the plat and the burial markers when the reader reaches them.
    if (opts.onDay) { try { opts.onDay(day, REVEALED); } catch (e) { } }
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

  if (window.KA_REVEAL_ON) {
    window.KA_REVEAL_ON(function (val) {
      REVEALED = val;
      var d = byId(cur);
      if (!val && d && d.reveal) { cur = "oct7"; }   // the step they were on is gone
      var r = document.querySelector('input[name="ka-day"][value="' + cur + '"]');
      if (r) { r.checked = true; }
      setDay(cur);
    });
  }
  setDay(cur);
  setOn(box ? box.checked : false);
};
