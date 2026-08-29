/**
 * Door scanner — staff only, noindex, no navigation.
 *
 * Written for one hand in the dark with a queue waiting. Everything is
 * decided by colour and size: a full-screen green or red flash carries the
 * verdict, because nobody reads a sentence at the door.
 *
 * Uses the browser's BarcodeDetector where it exists (Android Chrome, recent
 * Safari) and falls back to typing the human-readable code, which is also what
 * will-call needs when a phone is dead.
 */
export const doorPage = () => `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow"><title>Door — Mr. Chile Taproom</title>
<style>
:root{--ink:#16100E;--masa:#F2E9D8;--dim:#B7A992;--line:rgba(242,233,216,.16);
--ok:#2E9E63;--warn:#F0A830;--bad:#C1272D}
*{box-sizing:border-box}
body{margin:0;background:var(--ink);color:var(--masa);
font:400 16px/1.5 system-ui,-apple-system,sans-serif;
padding:env(safe-area-inset-top) 1rem calc(1rem + env(safe-area-inset-bottom))}
h1{font-size:1.1rem;margin:1rem 0 .25rem}
.sub{color:var(--dim);font-size:.85rem;margin:0 0 1rem}
label{display:block;font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;
color:var(--dim);margin:.9rem 0 .35rem}
input,select,button{width:100%;font:inherit;padding:.85rem 1rem;border-radius:10px;
border:1px solid var(--line);background:#211815;color:var(--masa)}
button{background:var(--masa);color:var(--ink);font-weight:700;border:0;margin-top:.75rem}
button.ghost{background:transparent;color:var(--masa);border:1px solid var(--line);font-weight:500}
#video{width:100%;border-radius:12px;background:#000;aspect-ratio:4/3;object-fit:cover;display:none}
#verdict{position:fixed;inset:0;display:none;place-items:center;text-align:center;
padding:2rem;z-index:10}
#verdict.show{display:grid}
#verdict[data-r=admitted]{background:var(--ok)}
#verdict[data-r=already_redeemed]{background:var(--warn);color:#16100E}
#verdict[data-r=void],#verdict[data-r=unknown],
#verdict[data-r=wrong_event],#verdict[data-r=bad_signature]{background:var(--bad)}
#verdict h2{font-size:2.4rem;margin:0 0 .4rem;letter-spacing:-.02em}
#verdict p{margin:0;font-size:1.05rem;opacity:.9}
.tally{display:flex;gap:1rem;margin-top:1rem;font-size:.85rem;color:var(--dim)}
.tally b{color:var(--masa);font-size:1.15rem;display:block}
</style></head><body>

<h1>Door scanner</h1>
<p class="sub">Mr. Chile Taproom · staff only</p>

<label for="ev">Event</label>
<select id="ev"></select>

<label for="code">Door code</label>
<input id="code" type="password" autocomplete="off" inputmode="text" placeholder="tonight's code">

<button id="start">Start camera</button>
<video id="video" playsinline muted></video>

<label for="manual">Or type the code</label>
<input id="manual" placeholder="MCT-XXXXX-XXXXX" autocapitalize="characters" autocomplete="off">
<button id="check" class="ghost">Check code</button>

<div class="tally">
  <span>Admitted<b id="nOk">0</b></span>
  <span>Rejected<b id="nNo">0</b></span>
</div>

<div id="verdict" role="status" aria-live="assertive"><div>
  <h2 id="vTitle"></h2><p id="vSub"></p>
</div></div>

<script>
(function(){
  var LS='mct-door';
  var els={ev:ev,code:code,manual:manual,video:video,verdict:verdict,
            vTitle:vTitle,vSub:vSub,nOk:nOk,nNo:nNo};
  var counts={ok:0,no:0}, busy=false, last='', lastAt=0;

  try{ var saved=JSON.parse(localStorage.getItem(LS)||'{}');
       if(saved.code) els.code.value=saved.code;
       if(saved.ev) els.ev.dataset.want=saved.ev; }catch(e){}

  fetch('/api/events/').then(function(r){return r.json()}).then(function(list){
    (list.events||[]).forEach(function(e){
      var o=document.createElement('option');
      o.value=e.id; o.textContent=e.name+' — '+e.occurs_on;
      els.ev.appendChild(o);
    });
    if(els.ev.dataset.want) els.ev.value=els.ev.dataset.want;
  }).catch(function(){
    var o=document.createElement('option');
    o.textContent='(could not load events)'; els.ev.appendChild(o);
  });

  function remember(){
    try{ localStorage.setItem(LS,JSON.stringify({code:els.code.value,ev:els.ev.value})); }catch(e){}
  }

  function show(result, holder, seq){
    els.verdict.dataset.r=result;
    var t={admitted:'LET THEM IN',already_redeemed:'ALREADY SCANNED',
           void:'NOT VALID',unknown:'NOT FOUND',wrong_event:'WRONG NIGHT',
           bad_signature:'FAKE CODE'}[result]||'NO';
    els.vTitle.textContent=t;
    els.vSub.textContent=(holder?holder+' · ':'')+(seq?'ticket '+seq:'');
    els.verdict.classList.add('show');
    if(navigator.vibrate) navigator.vibrate(result==='admitted'?60:[80,60,80]);
    if(result==='admitted'){counts.ok++;els.nOk.textContent=counts.ok;}
    else {counts.no++;els.nNo.textContent=counts.no;}
    setTimeout(function(){els.verdict.classList.remove('show');busy=false;}, result==='admitted'?900:1800);
  }

  function submit(serial){
    if(busy||!serial) return;
    // the same code read twice in a second is one person, not two
    if(serial===last && Date.now()-lastAt<2500) return;
    last=serial; lastAt=Date.now(); busy=true; remember();
    fetch('/api/scan/',{method:'POST',
      headers:{'content-type':'application/json','x-door-code':els.code.value},
      body:JSON.stringify({serial:serial,eventId:els.ev.value,by:'door'})})
    .then(function(r){return r.json()})
    .then(function(d){
      if(d.error){els.vTitle.textContent='ERROR';show('void',d.error,null);return;}
      show(d.result,d.holder,d.seq);
    }).catch(function(){show('void','network error',null);});
  }

  document.getElementById('check').addEventListener('click',function(){
    var v=els.manual.value.trim().toUpperCase().replace(/^MCT-/,'').replace(/-/g,'');
    els.manual.value='';
    if(v.length!==10){show('unknown','code should be 10 characters',null);return;}
    // will-call types the readable half; the server needs the signed form,
    // so it is resolved server-side by body rather than by full serial
    fetch('/api/scan/',{method:'POST',
      headers:{'content-type':'application/json','x-door-code':els.code.value},
      body:JSON.stringify({body:v,eventId:els.ev.value,by:'willcall'})})
    .then(function(r){return r.json()}).then(function(d){
      show(d.result||'unknown',d.holder,d.seq);
    }).catch(function(){show('void','network error',null);});
  });

  document.getElementById('start').addEventListener('click',function(){
    if(!('BarcodeDetector' in window)){
      show('unknown','this browser cannot scan — type the code',null);return;
    }
    navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}})
    .then(function(stream){
      els.video.style.display='block';
      els.video.srcObject=stream; els.video.play();
      var det=new BarcodeDetector({formats:['qr_code']});
      setInterval(function(){
        if(busy||els.video.readyState<2) return;
        det.detect(els.video).then(function(codes){
          if(codes && codes.length) submit(codes[0].rawValue);
        }).catch(function(){});
      },350);
    }).catch(function(){show('unknown','camera blocked',null);});
  });
})();
</script>
</body></html>`;
