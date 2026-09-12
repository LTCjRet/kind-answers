/* Movements of the 110th Infantry in the Aire valley, 3-9 October 1918.
   Single source of truth for 15-the-crossing.html and for fit-anchors.html.

   PROJECTION. Lambert Nord de Guerre (ATF Paris, EPSG:27500) fitted locally as an
   affine over this sheet; residual under 2 m. The -92 m E / -75 m N wartime-vs-modern
   shift is the one measured at the road fork SW of Ferme des Granges for the ABMC
   sheet, so a coordinate entered here lands in the same frame as ground-data.js.
   Check: Plat A-122's E 299.84 / N 279.62 resolves 14 m from the fitted Grave 1.

   ANCHORS. "src" means a position taken from an external authority. "inferred" is a
   radius in metres and means the position is reasoned, not surveyed - drag it in
   fit-anchors.html and paste the result back over the ANCHORS block below. */

window.KA_CROSSING = {

  proj: {
    lon0: 4.965, lat0: 49.285, shiftE: 92, shiftN: 75,
    ae: [72645.873696, 4087.980458, 298519.5954],
    an: [-2673.964996, 111061.630361, 279812.5881]
  },

  extent: { lonMin: 4.9330, lonMax: 5.0000, latMin: 49.2620, latMax: 49.3080 },

  /* --- ANCHORS (fit-anchors.html rewrites this block) --- */
  anchors: {
    apremont:   { lat:49.26849,  lon:4.98758,  name:"Apremont",        kind:"village", src:"OSM" },
    apChurch:   { lat:49.26959,  lon:4.98831,  name:"Église St-Martin",kind:"minor",   src:"OSM" },
    chatel:     { lat:49.28279,  lon:4.95421,  name:"Châtel-Chéhéry",  kind:"village", src:"OSM" },
    hill223:    { lat:49.28609,  lon:4.95283,  name:"Côte 223",        kind:"hill",    src:"OSM, tagged battlefield" },
    hill244:    { lat:49.28050,  lon:4.94500,  name:"Côte 244",        kind:"hill",    inferred:300 },
    york:       { lat:49.28730,  lon:4.94001,  name:"York site",       kind:"minor",   src:"OSM memorial" },
    laforge:    { lat:49.28390,  lon:4.96654,  name:"La Forge",        kind:"farm",    src:"read off the 1918 sheet and the IGN LiDAR: where the boundary road crosses the farm building axis. L93 843094 6911146" },
    abbatiale:  { lat:49.28873,  lon:4.97100,  name:"Abbatiale",       kind:"farm",    src:"Abbaye de Chéhéry, OSM" },
    pleinchamp: { lat:49.29076,  lon:4.97320,  name:"Pleinchamp Fme",  kind:"farm",    src:"Fme de Plein Champ, OSM" },
    granges:    { lat:49.28545,  lon:4.98121,  name:"Fme des Granges", kind:"farm",    src:"OSM" },
    fleville:   { lat:49.30534,  lon:4.97056,  name:"Fléville",        kind:"village", src:"OSM" },
    cornay:     { lat:49.30233,  lon:4.94958,  name:"Cornay",          kind:"village", src:"OSM" },
    exermont:   { lat:49.29437,  lon:5.00628,  name:"Exermont",        kind:"village", src:"OSM" },
    baulny:     { lat:49.26203,  lon:5.01388,  name:"Baulny",          kind:"village", src:"OSM" },
    ford:       { lat:49.27180,  lon:4.99260,  name:"Ford, 4 Oct",     kind:"minor",   inferred:200 },
    crossing:   { lat:49.28210,  lon:4.96575,  name:"Crossing",        kind:"minor",   inferred:250 },
    wounding:   { lat:49.28333,  lon:4.96257,  name:"",                kind:"minor",   inferred:170, src:"estimate only — see the notes" },
    grave8:     { lat:49.283149, lon:4.981736, name:"Grave 8",         kind:"grave",   src:"GRS Plat A-122; same point as ground-data.js" }
  },

  /* --- the Aire, OSM channel, thinned to ~60 m. NOT necessarily the 1918 bed. --- */
  aire: [[49.270117,4.994521],[49.27175,4.992814],[49.272705,4.992429],[49.273491,4.992394],
  [49.274154,4.99298],[49.27479,4.992096],[49.275315,4.991392],[49.27545,4.991259],[49.275613,4.990339],
  [49.275781,4.989317],[49.275863,4.988811],[49.276006,4.988194],[49.276079,4.987369],[49.275988,4.987082],
  [49.275849,4.986943],[49.27536,4.9871],[49.275245,4.987184],[49.274834,4.986915],[49.274664,4.985462],
  [49.2748,4.984478],[49.275042,4.984258],[49.275276,4.983945],[49.275382,4.98339],[49.275208,4.982915],
  [49.27514,4.981954],[49.275344,4.981212],[49.275826,4.980143],[49.276464,4.979223],[49.276577,4.979008],
  [49.276808,4.978564],[49.276837,4.977261],[49.277093,4.977832],[49.276609,4.976769],[49.27652,4.976325],
  [49.276636,4.97569],[49.27664,4.974641],[49.276911,4.973295],[49.277224,4.97272],[49.27772,4.971981],
  [49.278246,4.971246],[49.27866,4.970273],[49.27949,4.968945],[49.279901,4.968158],[49.280671,4.967498],
  [49.281309,4.966757],[49.282033,4.965862],[49.282922,4.965165],[49.28344,4.96459],[49.284013,4.963784],
  [49.284496,4.962965],[49.28498,4.962366],[49.28689,4.961181],[49.287672,4.960821],[49.288512,4.960904],
  [49.289641,4.96254],[49.290412,4.963649],[49.291456,4.964633],[49.292022,4.965273],[49.292424,4.965844],
  [49.292992,4.966272],[49.293794,4.966489],[49.294463,4.967393],[49.295404,4.968052],[49.296137,4.968193],
  [49.296817,4.968085],[49.297573,4.967579],[49.298266,4.966908],[49.298835,4.966848],[49.299421,4.967098],
  [49.299954,4.967877],[49.3015,4.9685],[49.3035,4.969],[49.3055,4.97]],

  /* --- routes and lines. "pts" is resolved by crossing-map.js: a string is an
         anchor key, [key,dlat,dlon] is an offset from one, [lat,lon] is literal. --- */
  features: [
    { id:"boundary", layer:"boundary", type:"band", grade:"inferred", color:"flank", width:230,
      days:["oct7","oct8","oct9"], label:"28th / 82nd Division boundary",
      /* The road itself, from points read off the laser survey: straight east-west
         from the fork south-west of Ferme des Granges (the 1919 plat's own control
         point, 49.283454 / 4.980351) to La Forge, then bending WSW to cross the Aire
         at 49.28331 / 4.96483. The field orders name those places as "inclusive" to
         the 82nd; the road through them is the only line on the ground that answers
         to that, so the boundary is drawn along it. */
      pts:[[49.28340,4.99300],["laforge",-0.00045,0.01381],["laforge",0,0],
           ["laforge",-0.00059,-0.00171],["chatel",-0.00060,0],["hill244",0.00100,-0.00200]] },

    { id:"advance4", layer:"route", type:"line", grade:"stated", color:"us", width:26,
      days:["oct4","oct5","oct6","night","oct7","oct8","oct9"], label:"4 Oct · ford at Apremont, advance north",
      pts:["apremont",["ford",0,-0.0012],"ford",[49.2760,4.9880],[49.2800,4.9840],["granges",-0.0020,-0.0010]] },

    { id:"bn3to4", layer:"route", type:"line", grade:"stated", color:"us", width:26,
      days:["oct4","oct5","oct6","night","oct7","oct8","oct9"], label:"4 Oct · 3rd Bn thrown in on the left, to La Forge",
      pts:[["granges",-0.0020,-0.0010],[49.2836,4.9760],"laforge"] },

    { id:"bn2to4", layer:"route", type:"line", grade:"stated", color:"flank", width:22,
      days:["oct4","oct5","oct6"], label:"4 Oct · 2nd Bn up the centre, to Pleinchamp",
      pts:[["granges",-0.0020,-0.0010],[49.2880,4.9770],"pleinchamp",[49.2980,4.9720]] },

    /* "Just south of La Forge Farm" is one statement, so it is encoded once: a
       single offset of 150 m south of the La Forge anchor, held along the whole
       length, running east from the right bank of the Aire to Ferme des Granges.
       Written as four independent offsets it used to wander across both the river
       and the later division boundary. Drawn as a band because 150 m is a reading
       of "just south", not a measurement. */
    { id:"line56", layer:"line", type:"band", grade:"inferred", color:"us", width:200,
      days:["oct5","oct6"], label:"5–6 Oct · line held just south of La Forge Farm",
      /* "Just south of La Forge Farm": 100 m south of the measured farm point, east
         to below the road fork, west only as far as the right bank. The west end is
         set by the river, not by shifting the road's own ford south - the Aire runs
         north-west here, so a point shifted south from the ford lands on the
         German-held bank, which is how this line went wrong the first time. */
      pts:[["laforge",-0.00090,-0.00074],["laforge",-0.00090,0],["laforge",-0.00135,0.01381]] },

    { id:"crossband", layer:"crossing", type:"band", grade:"inferred", color:"gold", width:215,
      days:["night","oct7","oct8"], label:"Crossing reach — the search box",
      pts:[[49.280671,4.967498],[49.281309,4.966757],[49.282033,4.965862],
           [49.282922,4.965165],[49.283440,4.964590]] },

    { id:"attack7", layer:"route", type:"line", grade:"stated", color:"us", width:30, arrow:true,
      days:["oct7","oct8","oct9"], label:"7 Oct 05:30 · 3rd Bn leads the attack west",
      pts:[["laforge",-0.00090,-0.00074],"crossing",[49.2825,4.9590],"chatel",[49.2832,4.9500]] },

    { id:"recon6", layer:"route", type:"line", grade:"conjectural", color:"ink", width:16,
      days:["oct6"], label:"6 Oct · reconnaissance of the enemy position",
      pts:[["laforge",-0.00090,-0.00074],[49.2830,4.9560],"hill244"] },

    { id:"relief9", layer:"route", type:"line", grade:"stated", color:"flank", width:24,
      days:["oct9"], label:"9 Oct · relieved 05:30, marched via Montblainville",
      pts:["chatel",[49.2810,4.9690],[49.2760,4.9840],"apremont",[49.2560,5.0060],[49.2480,5.0120]] },

    /* The only feature here that no record places. He was hit somewhere during
       the westward advance and carried back east to the aid station; that puts him
       between the river and the village. Drawn as a circle reaching from the Aire
       to the midpoint of La Forge – Châtel-Chéhéry, on the conjectural grade, and
       deliberately given no claim ID. It is an estimate and must read as one. */
    /* Where the aid station stood is not recorded. The carry is drawn to the burial
       plot because that is the only fixed point in the account - men who died at an
       aid post were commonly buried beside it - but that is an inference, so the
       route is conjecture and drawn as such. */
    { id:"carryback", layer:"wounding", type:"line", grade:"conjectural", color:"gold", width:18,
      days:["oct7b"], label:"Carried back to the first aid station",
      pts:["wounding",[49.28310,4.96480],[49.28320,4.97100],[49.28318,4.97600],"grave8"] },

    { id:"woundzone", layer:"wounding", type:"zone", grade:"conjectural", color:"gold",
      radius:170, days:["oct7","oct7b","oct8","oct9"], reveal:"label",
      centre:"wounding",
      label:"Estimated position of Sgt Bryant's wounding, 7 October" }
  ],

  marks: [
    { id:"co3",      days:["oct3"],                 at:"apremont",   kind:"unit",  text:"110th Inf" },
    { id:"coL4",     days:["oct4"],                 at:"laforge",    kind:"coL",   text:"Co. L" },
    { id:"bn24",     days:["oct4"],                 at:"pleinchamp", kind:"unit",  text:"2nd Bn" },
    { id:"coL5",     days:["oct5","oct6"],          at:"laforge",    kind:"coL",   text:"Co. L" },
    { id:"coLnight", days:["night"],                at:"crossing",   kind:"coL",   text:"Co. L" },
    { id:"coL7",     days:["oct7","oct8"],          at:"chatel",     kind:"coL",   text:"Co. L", dlat:0.0015, dlon:-0.0031 },
    { id:"mg223",    days:["oct5","oct6","night","oct7"], at:"hill223", kind:"enemy", text:"MG", dlat:0.0014, dlon:-0.0007 },
    { id:"mg244",    days:["oct5","oct6","night","oct7"], at:"hill244", kind:"enemy", text:"MG", dlat:0.0015, dlon:-0.0013 },
    { id:"hit",      days:["oct7","oct7b"],         at:"wounding",   kind:"kia",   text:"Sgt Bryant hit", dlat:-0.0017, dlon:0.0027, reveal:true },
    { id:"grave",    days:["oct7b","oct9"],         at:"grave8",     kind:"grave", text:"Grave 8", reveal:true }
  ],

  days: [
    { id:"oct3", tab:"3 Oct", cas:"—", eyebrow:"3 October 1918",
      short:"Reorganising under shellfire below Apremont.", focus:{ at:"apremont", span:1000 },
      title:"Patrolling below Apremont",
      body:"The regiment had taken Apremont and beaten off the German counter-attack of 1 October. It spent the 3rd reorganising under shellfire and preparing for the next advance.",
      quote:"Little was done on October 3rd, except in patrolling and in preparing for the advance on the following day. The Regiment, however, was under heavy artillery fire a great part of the time.",
      cite:"History of the 110th Infantry, ch. XXIX" },

    { id:"oct4", tab:"4 Oct", cas:"9 killed · 48 wounded", eyebrow:"4 October 1918",
      short:"3rd Battalion thrown in on the left, and on to La Forge.", focus:{ at:"laforge", span:2600 },
      title:"Across the Aire, and the 3rd Battalion goes left",
      body:"The regiment forded the Aire at Apremont and pushed north up the <em>east</em> bank, in a corridor between the river and the Baulny–Grandpré road. By noon the attack was held up. The 3rd Battalion — Company L's battalion — was thrown in on the left, along the river, and drove to La Forge. The 2nd Battalion carried the centre to Pleinchamp.",
      quote:"Regiment, after fording river at Apremont, attacked in a northerly direction in sector between the Fleville–Baulny road on the east and the Aire River on the west… 3rd Battalion thrown in on left near La Forge. 2nd Battalion advanced to Plain Champ Fme. and consolidated there. Heavy fighting all day.",
      cite:"110th Infantry abbreviated war diary" },

    { id:"oct5", tab:"5 Oct", cas:"2 killed · 7 wounded", eyebrow:"5 October 1918",
      short:"The line held just short of La Forge Farm.", focus:{ at:"laforge", span:1100 },
      title:"Holding the line south of La Forge",
      body:"A day of consolidation on the valley floor, with the 77th Division stalled in the forest across the river. The brigade line ran east–west just short of La Forge Farm. Company L is named at Pleinchamp Farm on this date in Sergeant Kokos's citation — the one point where the citation and the war diary do not sit flush.",
      quote:"On October 5 our line was just south of La Forge Farm with the Second Battalion and the Third Battalion on the line, and the First Battalion in support on the high ground immediately north of Apremont.",
      cite:"Martin, The Twenty-Eighth Division — 109th Infantry" },

    { id:"oct6", tab:"6 Oct", cas:"6 killed · 30 wounded", eyebrow:"6 October 1918",
      short:"Artillery all day, and the attack order enlarged.", focus:{ at:"laforge", span:1100 },
      title:"The attack order is enlarged",
      body:"Artillery on both sides was active all day while the ground west of the river was studied. A limited attack to seize Côte 244 was replaced from above by a combined 28th and 82nd Division attack across the Aire, intended to make the whole Argonne untenable.",
      quote:"…changed by higher command from a small attack, which had as its objective the seizing of Hill 244, to a larger attack by the 28th and 82nd Divisions for the purpose of forcing the evacuation of the Argonne forest.",
      cite:"History of the 110th Infantry, ch. XXIX" },

    { id:"night", tab:"Night 6/7", cas:"—", eyebrow:"Night of 6–7 October",
      short:"Over the Aire in the dark, south of La Forge.", focus:{ at:"crossing", span:700 },
      title:"Over the river in the dark",
      body:"The regiment crossed from the right bank to the left — east to west — at or immediately south of La Forge, in darkness, with no dependable bridge. Machine guns on Côte 223 and Côte 244 held the valley floor in daylight. That is why it was done at night.",
      quote:"After crossing Aire River at La Forge during the night.",
      cite:"110th Infantry abbreviated war diary" },

    { id:"oct7", tab:"7 Oct", cas:"6 killed · 19 wounded", eyebrow:"7 October 1918",
      short:"05:30 attack west; the village taken.", focus:{ at:"chatel", span:1100 },
      title:"Châtel-Chéhéry, and a sergeant hit",
      body:"At 05:30 the regiment attacked west with the 3rd Battalion leading, then the 2nd, then the 1st. The Germans did not hold the village but swept it from the two hills, and Company L was in the leading battalion. Somewhere in the ground between the river and the village, Sergeant Alexander Bryant — three weeks in the company — was hit in the chest. Sergeant Leslie Walker and another man picked him up and started back.",
      quote:"I helped carry Sgt. Alexander Bryant back to the first aid station. He was seriously wounded in the chest…",
      cite:"Sgt Leslie Walker, Co. L, 110th Infantry",
      shielded:{
        title:"Châtel-Chéhéry",
        body:"At 05:30 the regiment attacked west with the 3rd Battalion leading, then the 2nd, then the 1st. The Germans did not hold the village but swept it from the two hills, and Company L was in the leading battalion.",
        quote:"Regiment attacked at 5:30 A.M. in order, 3rd Battalion, 2nd Battalion, 1st Battalion… Regiment occupied Chatel Chehery, France. Sharp fighting but our casualties light.",
        cite:"110th Infantry abbreviated war diary" } },

    /* The second phase of 7 October exists only because of how the day ended, so it
       is marked reveal:true and is absent from the timeline entirely until the reader
       has cleared. There is no shielded version - there would be nothing in it. */
    { id:"oct7b", tab:"Aid station", cas:"—", eyebrow:"7 October 1918 · after the attack",
      reveal:true, showBurials:true,
      short:"Carried east; he died as they reached it.",
      focus:{ at:"grave8", span:1500 },
      title:"The carry back",
      body:"They carried him back east, across the Aire the battalion had crossed in the dark that morning. He died as they reached the first aid station. Where that station stood is not recorded anywhere in the account — the only fixed point is the field grave, plotted at Ferme des Granges by a Graves Registration survey party fourteen months later, and the route drawn here is conjecture between the two.",
      quote:"I helped carry Sgt. Alexander Bryant back to the first aid station. He was seriously wounded in the chest and died just as we reached the first aid station. This occurred on October 7th, 1918, at Chatel Chehery, France. I have no knowledge of when or where he was buried.",
      cite:"Sgt Leslie Walker, Co. L, 110th Infantry" },

    { id:"oct8", tab:"8 Oct", cas:"16 killed · 69 wounded", eyebrow:"8 October 1918",
      short:"Held under shellfire — the regiment’s worst day.", focus:{ at:"chatel", span:1100 },
      title:"The worst day",
      body:"The war diary records the situation as unchanged. It was the regiment's heaviest day of the week: shelling and sniping in and around the village while the hills were fought over. Three more Company L men — Keck, Morberg and Hightower — were shot by snipers.",
      quote:"Situation unchanged. Officers — killed 1, wounded 2. Enlisted men — killed 15, wounded 67, missing 23.",
      cite:"110th Infantry abbreviated war diary" },

    { id:"oct9", tab:"9 Oct", cas:"7 killed · 4 wounded", eyebrow:"9 October 1918",
      short:"Relieved at 05:30; the regiment marched out.", focus:{ at:"grave8", span:900 },
      title:"Relieved, and a grave at Ferme des Granges",
      body:"The 82nd Division completed the relief at 05:30 and the regiment marched out by battalions. The field grave was recorded at Ferme des Granges — ground that on 7 October lay inside the 82nd Division's sector, not his own regiment's.",
      quote:"Relief by the 82nd U.S. Division completed at 5:30 A.M. Regiment marched by battalions via Montblainville, France, to Camp de Bouzon.",
      cite:"110th Infantry abbreviated war diary",
      shielded:{
        title:"Relieved",
        focus:{ at:"chatel", span:1400 },
        body:"The 82nd Division completed the relief at 05:30 and the regiment marched out by battalions, back through Montblainville to Camp de Bouzon and into Corps reserve. Fourteen days of fighting had cost it nine officers and a hundred and four men killed." } }
  ],

  caveats: [
    ["La Forge","measured, not inferred. The farm point and the road that becomes the division boundary were read off the 1918 sheet and the IGN laser survey: the road crosses the farm’s building axis — buildings stand on both sides, on a roughly 010–190 bearing — at 49.28390 / 4.96654, and bends west-south-west immediately west of them to cross the Aire at 49.28331 / 4.96483. An earlier reconstruction from the 328th Infantry’s stated distances put the farm 178 m too far north, which pushed the 5–6 October line onto the wrong side of the road."],
    ["Côte 244","approximate. Côte 223 is confirmed; 244 is placed west-south-west of the village from the 109th Infantry's description of the Bois de Châtel lying south-west of it. The 1918 sheet also labels a Côte 243 nearby, which may or may not be the same feature."],
    ["The division boundary","drawn as a band, not a line, and deliberately so. The 328th's sector ran \"south by Ferme des Granges and La Forge and Chatel Chehery <em>inclusive</em>\", while the 110th was assigned \"that portion of the town of Chatel-Chehery\" lying between the two hills. Both divisions had a claim on the village."],
    ["The carry back","is drawn from the estimated wounding ground east to the burial plot, and every part of it is inference. Sgt Walker says only that he helped carry him back to the first aid station and that he died as they reached it. Where the station stood is not recorded. It is drawn to the plot at Ferme des Granges because that is the one fixed point there is, and because men who died at an aid post were commonly buried beside it — which is reasoning, not evidence."],
    ["The wounding position","is the one thing on this map that no document places. The records say only that he was hit during the advance and carried back to the aid station. The circle spans the ground between the Aire and the midpoint of La Forge and Châtel-Chéhéry, is drawn on the conjectural grade, and carries no claim ID — there is nothing to cite."],
    ["The 5–6 October line","runs about 100 m south of the road that became the division boundary on the 7th — because those really are nearly the same line. The 28th held to just south of La Forge Farm, and when the 82nd took the sector over the boundary was put along much the same ground. Both are shown as bands rather than lines so the map does not claim to separate them."],
    ["The crossing reach","the honest answer is a stretch of river, not a point. \"At La Forge\" (war diary) and \"immediately south of La Forge\" (regimental narrative) bound it; the band is what those two statements jointly allow."],
    ["The Aire's course","is the modern channel, from OpenStreetMap. The 1918 bed may differ, and a relict channel is among the things the laser survey could show."],
    ["Company L on 5 October","Kokos's citation names Pleinchamp Farm; the war diary puts the 3rd Battalion at La Forge and the 2nd at Pleinchamp. The marker carries that ambiguity rather than resolving it."],
    ["The casualty figures","on the timeline are the whole regiment's for that day, from the war diary — not Company L's."]
  ]
};
