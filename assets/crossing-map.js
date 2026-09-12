/* Renderer for the 110th Infantry crossing map. Reads assets/crossing-data.js.

   The public page (15-the-crossing.html) loads this as-is.
   fit-anchors.html sets window.KA_FIT = true BEFORE loading this file, which turns on
   anchor dragging, the coordinate readout, the Nord de Guerre converter and the
   write-out panel. Nothing about the geometry differs between the two - that is the
   point of keeping one file. */
(function () {
  "use strict";

  var D = window.KA_CROSSING;
  if (!D) { return; }
  var FIT = !!window.KA_FIT;
  var NS = "http://www.w3.org/2000/svg";

  /* ---------- projection ---------- */
  var P = D.proj;
  function toNdG(lat, lon) {
    var dl = lon - P.lon0, dp = lat - P.lat0;
    return [P.ae[0]*dl + P.ae[1]*dp + P.ae[2] + P.shiftE,
            P.an[0]*dl + P.an[1]*dp + P.an[2] + P.shiftN];
  }
  function fromNdG(E, N) {
    var e = E - P.ae[2] - P.shiftE, n = N - P.an[2] - P.shiftN;
    var det = P.ae[0]*P.an[1] - P.ae[1]*P.an[0];
    return [P.lat0 + (P.ae[0]*n - P.an[0]*e)/det, P.lon0 + (P.an[1]*e - P.ae[1]*n)/det];
  }
  var X0 = D.extent, MPD_LON = 111320*Math.cos(P.lat0*Math.PI/180), MPD_LAT = 111132;
  function X(lon) { return (lon - X0.lonMin) * MPD_LON; }
  function Y(lat) { return (X0.latMax - lat) * MPD_LAT; }
  var W = X(X0.lonMax), H = Y(X0.latMin);

  /* ---------- state ---------- */
  var BASE = JSON.parse(JSON.stringify(D.anchors));
  var A = JSON.parse(JSON.stringify(D.anchors));
  var cur = "oct7", drag = null;
  var REVEALED = window.KA_REVEAL_ON ? !!window.KA_REVEALED : true;
  /* No reveal.js on the page means the site withholds nothing (Three Sergeants
     tells the outcome from its index), so default to showing everything. Where
     the module IS present, it owns the answer. */
  var layers = { route:1, line:1, boundary:1, crossing:1, wounding:1, marks:1, places:1, grid:1 };

  /* ---------- helpers ---------- */
  function el(n, at) { var e = document.createElementNS(NS, n); for (var k in at) e.setAttribute(k, at[k]); return e; }
  function C(n) { return "var(--map-" + n + ")"; }
  function $(id) { return document.getElementById(id); }
  function resolve(p) {
    if (typeof p === "string") { return [A[p].lat, A[p].lon]; }
    if (typeof p[0] === "string") { return [A[p[0]].lat + p[1], A[p[0]].lon + p[2]]; }
    return p;
  }
  function pathOf(pts) {
    return pts.map(function (p, i) {
      var q = resolve(p);
      return (i ? "L" : "M") + X(q[1]).toFixed(1) + " " + Y(q[0]).toFixed(1);
    }).join(" ");
  }
  var GRADE = { stated:{dash:"none",op:1}, inferred:{dash:"46 26",op:.9}, conjectural:{dash:"7 17",op:.72} };

  /* ---------- grid ---------- */
  function grid(g) {
    var cE = [toNdG(X0.latMax, X0.lonMin)[0], toNdG(X0.latMin, X0.lonMax)[0]];
    for (var E = Math.ceil(Math.min.apply(null,cE)/1000); E <= Math.floor(Math.max.apply(null,cE)/1000); E++) {
      var a = fromNdG(E*1000, toNdG(X0.latMax, X0.lonMin)[1]);
      var b = fromNdG(E*1000, toNdG(X0.latMin, X0.lonMin)[1]);
      g.appendChild(el("line", {x1:X(a[1]), y1:Y(a[0]), x2:X(b[1]), y2:Y(b[0]), stroke:C("grid"), "stroke-width":2}));
      var t = el("text", {x:X(a[1]), y:-34, "text-anchor":"middle", "font-size":104, "letter-spacing":6, fill:C("faint")});
      t.textContent = E; g.appendChild(t);
    }
    var cN = [toNdG(X0.latMax, X0.lonMin)[1], toNdG(X0.latMin, X0.lonMax)[1]];
    for (var N = Math.ceil(Math.min.apply(null,cN)/1000); N <= Math.floor(Math.max.apply(null,cN)/1000); N++) {
      var c = fromNdG(toNdG(X0.latMin, X0.lonMin)[0], N*1000);
      var d = fromNdG(toNdG(X0.latMin, X0.lonMax)[0], N*1000);
      g.appendChild(el("line", {x1:X(c[1]), y1:Y(c[0]), x2:X(d[1]), y2:Y(d[0]), stroke:C("grid"), "stroke-width":2}));
      var t2 = el("text", {x:-30, y:Y(c[0])+34, "text-anchor":"end", "font-size":104, "letter-spacing":6, fill:C("faint")});
      t2.textContent = N; g.appendChild(t2);
    }
  }

  /* ---------- render ---------- */
  function render() {
    var svg = $("ka-plan");
    if (!svg) { return; }
    while (svg.firstChild) { svg.removeChild(svg.firstChild); }

    var defs = el("defs");
    var mk = el("marker", {id:"kaArrow", viewBox:"0 0 10 10", refX:7, refY:5,
      markerWidth:5, markerHeight:5, orient:"auto-start-reverse"});
    mk.appendChild(el("path", {d:"M0 0 L10 5 L0 10 z", fill:C("us")}));
    defs.appendChild(mk); svg.appendChild(defs);

    svg.appendChild(el("rect", {x:-300, y:-300, width:W+600, height:H+600, fill:C("paper")}));

    var frame = el("g");
    if (layers.grid) { grid(frame); }
    frame.appendChild(el("rect", {x:0, y:0, width:W, height:H, fill:"none", stroke:C("rule"), "stroke-width":4}));
    svg.appendChild(frame);

    svg.appendChild(el("path", {d:pathOf(D.aire), fill:"none", stroke:C("water"),
      "stroke-width":26, "stroke-linejoin":"round", "stroke-linecap":"round", opacity:.85}));
    var aw = el("text", {x:X(4.9668)+40, y:Y(49.2955), "font-size":118,
      "font-style":"italic", fill:C("water")});
    aw.textContent = "L'Aire"; svg.appendChild(aw);

    D.features.forEach(function (f) {
      if (f.days.indexOf(cur) < 0 || !layers[f.layer]) { return; }
      var g = GRADE[f.grade];
      if (f.type === "zone") {
        var ctr = resolve(f.centre);
        svg.appendChild(el("circle", {cx:X(ctr[1]), cy:Y(ctr[0]), r:f.radius,
          fill:C(f.color), "fill-opacity":.13, stroke:C(f.color), "stroke-width":7,
          "stroke-dasharray":g.dash, opacity:.9}));
        if (REVEALED && f.label) {
          var zt = el("text", {x:X(ctr[1]), y:Y(ctr[0]) - f.radius - 60, "text-anchor":"middle",
            "font-size":96, "font-style":"italic", fill:C(f.color)});
          zt.textContent = "wounded, about here"; svg.appendChild(zt);
        }
        return;
      }
      var d = pathOf(f.pts);
      if (f.type === "band") {
        svg.appendChild(el("path", {d:d, fill:"none", stroke:C(f.color), "stroke-width":f.width,
          opacity:.28, "stroke-linecap":"round", "stroke-linejoin":"round"}));
        svg.appendChild(el("path", {d:d, fill:"none", stroke:C(f.color), "stroke-width":8,
          "stroke-dasharray":g.dash, opacity:.85, "stroke-linecap":"round"}));
      } else {
        var at = {d:d, fill:"none", stroke:C(f.color), "stroke-width":f.width,
          "stroke-dasharray":g.dash, opacity:g.op, "stroke-linecap":"round", "stroke-linejoin":"round"};
        if (f.arrow) { at["marker-end"] = "url(#kaArrow)"; }
        svg.appendChild(el("path", at));
      }
    });

    if (layers.places) { Object.keys(A).forEach(function (k) {
      var a = A[k];
      if (a.kind === "grave" && (cur !== "oct9" || !REVEALED)) { return; }
      var x = X(a.lon), y = Y(a.lat);
      if (a.inferred && FIT) {
        svg.appendChild(el("circle", {cx:x, cy:y, r:a.inferred, fill:C("gold"), opacity:.10,
          stroke:C("gold"), "stroke-width":3, "stroke-dasharray":"12 14"}));
      }
      if (a.kind === "hill") {
        svg.appendChild(el("path", {d:"M"+x+" "+(y-52)+" L"+(x+48)+" "+(y+34)+" L"+(x-48)+" "+(y+34)+" z",
          fill:"none", stroke:C("enemy"), "stroke-width":9}));
      } else if (a.kind === "grave") {
        svg.appendChild(el("path", {d:"M"+x+" "+(y-58)+" V"+(y+40)+" M"+(x-34)+" "+(y-26)+" H"+(x+34),
          stroke:C("ink"), "stroke-width":11, "stroke-linecap":"round"}));
      } else if (a.inferred && FIT) {
        svg.appendChild(el("rect", {x:x-34, y:y-34, width:68, height:68, fill:C("paper"),
          stroke:C("gold"), "stroke-width":10, "data-anchor":k, style:"cursor:grab"}));
      } else {
        var r = a.kind === "village" ? 34 : a.kind === "farm" ? 26 : 17;
        svg.appendChild(el("circle", {cx:x, cy:y, r:r,
          fill:a.kind === "minor" ? C("paper") : C("ink"), stroke:C("ink"), "stroke-width":8}));
      }
      var t = el("text", {x:x + (a.kind === "village" ? 54 : 44), y:y+34,
        "font-size":a.kind === "village" ? 132 : 112,
        "font-weight":a.kind === "village" ? 700 : 500,
        "letter-spacing":a.kind === "village" ? 4 : 2,
        fill:C(a.kind === "hill" ? "enemy" : "label")});
      t.textContent = a.name; svg.appendChild(t);
    }); }

    if (layers.marks) { D.marks.forEach(function (m) {
      if (m.days.indexOf(cur) < 0) { return; }
      if (m.reveal && !REVEALED) { return; }
      var a = A[m.at]; if (!a) { return; }
      var ax = X(a.lon), ay = Y(a.lat);
      var x = X(a.lon + (m.dlon||0)), y = Y(a.lat + (m.dlat||0));
      var col = m.kind === "enemy" ? "enemy" : m.kind === "kia" ? "gold"
              : m.kind === "coL" ? "us" : m.kind === "grave" ? "ink" : "flank";
      var w = m.kind === "kia" ? 600 : 310, h = 150;
      if (m.dlat || m.dlon) {
        svg.appendChild(el("line", {x1:x, y1:y-12, x2:ax, y2:ay, stroke:C(col),
          "stroke-width":5, "stroke-dasharray":"14 12", opacity:.65}));
        svg.appendChild(el("circle", {cx:ax, cy:ay, r:13, fill:C(col)}));
      }
      svg.appendChild(el("rect", {x:x-w/2, y:y-h-64, width:w, height:h,
        fill:C("paper"), stroke:C(col), "stroke-width":10}));
      if (m.kind === "coL") {
        svg.appendChild(el("line", {x1:x-w/2, y1:y-h-64, x2:x+w/2, y2:y-64, stroke:C(col), "stroke-width":6, opacity:.5}));
        svg.appendChild(el("line", {x1:x-w/2, y1:y-64, x2:x+w/2, y2:y-h-64, stroke:C(col), "stroke-width":6, opacity:.5}));
      }
      var t = el("text", {x:x, y:y-h+34, "text-anchor":"middle", "font-size":104,
        "font-weight":700, fill:C(col)});
      t.textContent = m.text; svg.appendChild(t);
      svg.appendChild(el("line", {x1:x, y1:y-64, x2:x, y2:y-12, stroke:C(col), "stroke-width":8}));
    }); }

    var sb = el("g", {transform:"translate(" + (W-1180) + "," + (H-190) + ")"});
    sb.appendChild(el("rect", {x:0, y:0, width:1000, height:34, fill:C("ink")}));
    sb.appendChild(el("rect", {x:0, y:0, width:500, height:34, fill:C("paper"), stroke:C("ink"), "stroke-width":7}));
    sb.appendChild(el("rect", {x:500, y:0, width:500, height:34, fill:C("ink")}));
    var s1 = el("text", {x:0, y:-28, "font-size":96, fill:C("faint")}); s1.textContent = "0";
    var s2 = el("text", {x:1000, y:-28, "text-anchor":"end", "font-size":96, fill:C("faint")}); s2.textContent = "1 km";
    sb.appendChild(s1); sb.appendChild(s2); svg.appendChild(sb);

    var na = el("g", {transform:"translate(" + (W-200) + ",320)"});
    na.appendChild(el("path", {d:"M0 -150 L58 110 L0 52 L-58 110 z", fill:C("ink")}));
    var nt = el("text", {x:0, y:212, "text-anchor":"middle", "font-size":100, "font-weight":700, fill:C("label")});
    nt.textContent = "N"; na.appendChild(nt); svg.appendChild(na);
  }

  /* ---------- chrome ---------- */
  function setDay(id) {
    cur = id;
    var d = D.days.filter(function (x) { return x.id === id; })[0];
    // A shielded variant is the same day told without its outcome.
    var v = (!REVEALED && d.shielded) ? d.shielded : {};
    if ($("ka-eyebrow")) { $("ka-eyebrow").textContent = d.eyebrow; }
    if ($("ka-title"))   { $("ka-title").textContent = v.title || d.title; }
    if ($("ka-body"))    {
      $("ka-body").innerHTML = "<p>" + (v.body || d.body) + "</p><blockquote>" +
        (v.quote || d.quote) + "<cite>" + (v.cite || d.cite) + "</cite></blockquote>";
    }
    Array.prototype.forEach.call(document.querySelectorAll("#ka-timeline button"), function (b) {
      b.setAttribute("aria-current", b.getAttribute("data-day") === id ? "true" : "false");
    });
    render();
  }

  // Days marked reveal:true are not in the timeline at all until the reader has
  // cleared - a greyed-out step labelled "Aid station" would announce itself.
  function visibleDays() {
    return D.days.filter(function (d) { return !(d.reveal && !REVEALED); });
  }

  function buildTimeline() {
    var ol = $("ka-timeline"); if (!ol) { return; }
    while (ol.firstChild) { ol.removeChild(ol.firstChild); }
    visibleDays().forEach(function (d) {
      var li = document.createElement("li"), b = document.createElement("button");
      b.type = "button"; b.setAttribute("data-day", d.id);
      b.innerHTML = d.tab + '<span class="cas">' + d.cas + "</span>";
      b.addEventListener("click", function () { setDay(d.id); });
      li.appendChild(b); ol.appendChild(li);
    });
  }

  function buildLegend() {
    var ev = $("ka-legend-evidence"), un = $("ka-legend-units");
    if (ev) {
      [["solid","Stated in the war diary or regimental narrative"],
       ["dashed","Inferred from an adjacent unit's records"],
       ["dotted","Conjectural — shown so it can be argued with"]].forEach(function (r) {
        var dt = document.createElement("dt");
        dt.style.borderTopStyle = r[0]; dt.style.borderTopColor = "var(--map-label)";
        var dd = document.createElement("dd"); dd.textContent = r[1];
        ev.appendChild(dt); ev.appendChild(dd);
      });
    }
    if (un) {
      [["us","110th Infantry — 3rd Battalion and Company L"],
       ["flank","Adjacent: 2nd Battalion, 82nd Division, the relief"],
       ["enemy","German positions on Côte 223 and Côte 244"],
       ["gold","The crossing reach, and Sergeant Bryant"],
       ["water","The Aire, modern channel"]].forEach(function (r) {
        var dt = document.createElement("dt");
        dt.style.borderTopStyle = "solid"; dt.style.borderTopColor = "var(--map-" + r[0] + ")";
        var dd = document.createElement("dd"); dd.textContent = r[1];
        un.appendChild(dt); un.appendChild(dd);
      });
    }
  }

  function buildCaveats() {
    var ul = $("ka-caveats"); if (!ul) { return; }
    D.caveats.forEach(function (c) {
      var li = document.createElement("li");
      li.innerHTML = "<b>" + c[0] + "</b> — " + c[1];
      ul.appendChild(li);
    });
  }

  /* ---------- fit mode ---------- */
  function svgPt(evt) {
    var svg = $("ka-plan"), r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
    var x = vb.x + (evt.clientX - r.left)/r.width * vb.width;
    var y = vb.y + (evt.clientY - r.top)/r.height * vb.height;
    return {lat:X0.latMax - y/MPD_LAT, lon:X0.lonMin + x/MPD_LON};
  }
  function normGrid(v, base) {
    if (v > 100000) { return v; }
    if (v < 400) { v *= 1000; }
    return v < 250000 ? v + base : v;
  }
  function writeAnchors() {
    var lines = Object.keys(A).map(function (k) {
      var a = A[k], pad = function (s, n) { while (s.length < n) { s += " "; } return s; };
      var tail = a.inferred ? "inferred:" + a.inferred : 'src:"' + (a.src || "") + '"';
      return "    " + pad(k + ":", 13) + "{ lat:" + a.lat.toFixed(6) + ",  lon:" + a.lon.toFixed(6) +
             ',  name:"' + a.name + '", kind:"' + a.kind + '", ' + tail + " },";
    });
    lines[lines.length-1] = lines[lines.length-1].replace(/,$/, "");
    return "  anchors: {\n" + lines.join("\n") + "\n  },";
  }
  function initFit() {
    var svg = $("ka-plan");
    svg.addEventListener("pointermove", function (e) {
      var p = svgPt(e);
      if (drag) { A[drag].lat = p.lat; A[drag].lon = p.lon; render(); }
      var g = toNdG(p.lat, p.lon), out = $("ka-readout");
      if (out) {
        out.textContent = "WGS84   " + p.lat.toFixed(6) + ", " + p.lon.toFixed(6) + "\n" +
          "NdG     E " + (g[0]/1000).toFixed(3) + " / N " + (g[1]/1000).toFixed(3) + " km\n" +
          "        E " + Math.round(g[0]) + " / N " + Math.round(g[1]) + " m";
      }
    });
    svg.addEventListener("pointerdown", function (e) {
      var k = e.target && e.target.getAttribute && e.target.getAttribute("data-anchor");
      if (k) { drag = k; svg.setPointerCapture(e.pointerId); e.preventDefault(); }
    });
    svg.addEventListener("pointerup", function (e) {
      if (drag) { drag = null; try { svg.releasePointerCapture(e.pointerId); } catch (err) {} }
    });
    if ($("ka-conv-go")) { $("ka-conv-go").addEventListener("click", function () {
      var e = parseFloat($("ka-ndg-e").value), n = parseFloat($("ka-ndg-n").value);
      if (isNaN(e) || isNaN(n)) { $("ka-conv-out").textContent = "Enter two numbers."; return; }
      var ll = fromNdG(normGrid(e, 300000), normGrid(n, 200000));
      $("ka-conv-out").textContent = "NdG E " + Math.round(normGrid(e,300000)) +
        " / N " + Math.round(normGrid(n,200000)) + " m\n→ " + ll[0].toFixed(6) + ", " + ll[1].toFixed(6);
    }); }
    if ($("ka-write")) { $("ka-write").addEventListener("click", function () {
      var ta = $("ka-out"); ta.hidden = false; ta.value = writeAnchors(); ta.focus(); ta.select();
    }); }
    if ($("ka-reset")) { $("ka-reset").addEventListener("click", function () {
      A = JSON.parse(JSON.stringify(BASE)); render();
    }); }
    var host = $("ka-layers");
    if (host) {
      [["route","Movement traces"],["line","Front lines"],["boundary","Division boundary"],
       ["crossing","Crossing reach"],["wounding","Wounding estimate"],
       ["marks","Unit markers"],["places","Place names"],
       ["grid","Nord de Guerre grid"]].forEach(function (r) {
        var l = document.createElement("label"); l.className = "ck";
        var c = document.createElement("input");
        c.type = "checkbox"; c.checked = true; c.id = "ka-ly-" + r[0];
        c.addEventListener("change", function () { layers[r[0]] = c.checked; render(); });
        var s = document.createElement("span"); s.textContent = r[1];
        l.appendChild(c); l.appendChild(s); host.appendChild(l);
      });
    }
  }

  /* ---------- boot ---------- */
  function start() {
    var svg = $("ka-plan");
    if (svg) { svg.setAttribute("viewBox", "-300 -300 " + (W+600) + " " + (H+600)); }
    buildTimeline(); buildLegend(); buildCaveats();
    if (window.KA_REVEAL_ON) {
      window.KA_REVEAL_ON(function (val) {
        REVEALED = val;
        buildTimeline();
        var ok = visibleDays().some(function (d) { return d.id === cur; });
        setDay(ok ? cur : "oct7");
      });
    }
    if (FIT) { initFit(); }
    document.addEventListener("keydown", function (e) {
      if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) { return; }
      var ids = visibleDays().map(function (d) { return d.id; }), i = ids.indexOf(cur);
      if (e.key === "ArrowRight" && i < ids.length-1) { setDay(ids[i+1]); e.preventDefault(); }
      if (e.key === "ArrowLeft"  && i > 0)            { setDay(ids[i-1]); e.preventDefault(); }
    });
    setDay("oct7");
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", start); }
  else { start(); }
})();
