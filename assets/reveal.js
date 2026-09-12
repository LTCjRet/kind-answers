/* Reading position - shared by 14-the-ground.html and 15-the-crossing.html.

   The account withholds the outcome of 7 October until the October chapter. Both
   map pages can get ahead of a reader who has not arrived there yet, so both ask
   once where they are and remember the answer for the visit.

   It asks about the reader's progress, not about what is being withheld: a gate
   that says "do you want to see the burials" has already told them there are
   burials. Nothing here names what is held back.

   Exposes:
     window.KA_REVEALED        boolean, false until the reader clears it
     window.KA_REVEAL_ON(fn)   run fn(revealed) now and on every change

   Storage is sessionStorage, so it lasts the visit and no longer, and every
   access is wrapped - a private window throws rather than returning null. */
(function () {
  "use strict";

  var KEY = "ka-reveal";
  var listeners = [];
  var answered = false;

  function read() {
    try { return window.sessionStorage.getItem(KEY); } catch (e) { return null; }
  }
  function write(v) {
    try { window.sessionStorage.setItem(KEY, v); } catch (e) { /* private window */ }
  }

  var stored = read();
  answered = (stored === "yes" || stored === "no");
  window.KA_REVEALED = (stored === "yes");

  /* Page chrome shields itself declaratively:
       data-ka-reveal="only"   shown only once the reader has cleared
       data-ka-reveal="until"  the stand-in, shown until then
     A gate is worth nothing if the standfirst above it already tells the story. */
  function applyDom() {
    var r = window.KA_REVEALED;
    Array.prototype.forEach.call(document.querySelectorAll('[data-ka-reveal="only"]'),
      function (e) { e.hidden = !r; });
    Array.prototype.forEach.call(document.querySelectorAll('[data-ka-reveal="until"]'),
      function (e) { e.hidden = r; });
  }

  function announce() {
    applyDom();
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](window.KA_REVEALED); } catch (e) { }
    }
    var radios = document.getElementsByName("ka-reveal");
    Array.prototype.forEach.call(radios, function (r) {
      r.checked = (r.value === (window.KA_REVEALED ? "yes" : "no"));
    });
  }

  function set(v) {
    window.KA_REVEALED = !!v;
    answered = true;
    write(v ? "yes" : "no");
    announce();
  }

  window.KA_REVEAL_ON = function (fn) {
    listeners.push(fn);
    try { fn(window.KA_REVEALED); } catch (e) { }
  };
  window.KA_REVEAL_SET = set;

  function buildGate() {
    var gate = document.createElement("div");
    gate.className = "ka-gate";
    gate.id = "ka-reveal-gate";
    gate.innerHTML =
      '<div class="ka-gate-box" role="dialog" aria-modal="true" aria-labelledby="ka-reveal-h">' +
        '<h3 id="ka-reveal-h">Where are you in the account?</h3>' +
        '<p>These maps carry the whole of the 110th Infantry&rsquo;s week in the Aire valley, ' +
        'the last day of it included. If you are reading the chapters in order and have not ' +
        'yet reached <a href="7-october.html">October</a>, part of what is drawn here will ' +
        'get ahead of the story.</p>' +
        '<p class="ka-reveal-choices">' +
          '<label><input type="radio" name="ka-reveal-gate" value="no" checked> ' +
            'I have not reached October &mdash; keep it back</label>' +
          '<label><input type="radio" name="ka-reveal-gate" value="yes"> ' +
            'I have read October &mdash; show everything</label>' +
        '</p>' +
        '<p><button type="button" id="ka-reveal-go">Continue</button></p>' +
        '<p class="ka-reveal-note">You can change this at any time in the map controls. ' +
        'The choice is remembered for this visit only and is not sent anywhere.</p>' +
      '</div>';
    document.body.appendChild(gate);
    document.getElementById("ka-reveal-go").addEventListener("click", function () {
      var picked = "no";
      Array.prototype.forEach.call(document.getElementsByName("ka-reveal-gate"), function (r) {
        if (r.checked) { picked = r.value; }
      });
      gate.parentNode.removeChild(gate);
      set(picked === "yes");
    });
  }

  function start() {
    Array.prototype.forEach.call(document.getElementsByName("ka-reveal"), function (r) {
      r.addEventListener("change", function () { if (r.checked) { set(r.value === "yes"); } });
    });
    announce();
    if (!answered) { buildGate(); }
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", start); }
  else { start(); }
})();
