/**
 * The site editor at /admin/.
 *
 * Replaces the third-party CMS, which could not work here: its GitHub backend
 * calls GET /user to identify the signed-in person, and a GitHub App
 * installation token cannot — it is an app, not a user. Making it work would
 * have meant giving every editor a GitHub account, which is the exact thing
 * this was built to avoid.
 *
 * So it talks to our own API instead. Sessions are our cookies, writes go
 * through /api/content/ one field at a time, and the browser never sees
 * GitHub at all.
 *
 * Field shapes are derived from the data rather than declared twice: a value
 * holding { en, es } renders as a pair of inputs, a long string as a textarea,
 * a boolean as a switch. Anything the JSON grows appears here on its own,
 * which is what stops the editor drifting out of step with the content.
 */
export const adminApp = () => `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Edit the site — Mr. Chile Taproom</title>
<style>
:root{--ink:#16100E;--ink2:#211815;--ink3:#2a201c;--masa:#F2E9D8;--dim:#B7A992;
--chile:#C1272D;--marigold:#F0A830;--verde:#2E9E63;--line:rgba(242,233,216,.16)}
*{box-sizing:border-box}
body{margin:0;background:var(--ink);color:var(--masa);
font:400 16px/1.55 system-ui,-apple-system,sans-serif}
a{color:var(--marigold)}
.top{position:sticky;top:0;z-index:20;background:var(--ink);border-bottom:1px solid var(--line);
padding:.8rem 1.25rem;display:flex;align-items:center;gap:1rem;flex-wrap:wrap}
.top img{height:34px;width:auto}
.top nav{margin-left:auto;display:flex;gap:1rem;font-size:.9rem;align-items:center}
.top nav a,.top nav button{color:var(--dim);background:none;border:0;font:inherit;cursor:pointer}
.shell{display:grid;grid-template-columns:1fr;max-width:64rem;margin-inline:auto}
@media(min-width:820px){.shell{grid-template-columns:13rem 1fr;gap:2rem}}
.side{padding:1.25rem}
.side button{display:block;width:100%;text-align:left;font:inherit;padding:.6rem .8rem;
margin-bottom:.25rem;border:0;border-radius:8px;background:transparent;color:var(--dim);cursor:pointer}
.side button[aria-current=true]{background:var(--ink2);color:var(--masa);font-weight:600}
main{padding:1.25rem 1.25rem 5rem}
h1{font-size:1.25rem;margin:0 0 .25rem}
.hint{color:var(--dim);font-size:.88rem;margin:0 0 1.5rem}
fieldset{border:1px solid var(--line);border-radius:12px;padding:1.1rem;margin:0 0 1rem;background:var(--ink2)}
legend{padding:0 .5rem;font:600 .8rem system-ui;letter-spacing:.08em;text-transform:uppercase;color:var(--marigold)}
label{display:block;font-size:.72rem;letter-spacing:.09em;text-transform:uppercase;color:var(--dim);margin:.9rem 0 .3rem}
input[type=text],textarea,select{width:100%;font:inherit;padding:.7rem .85rem;border-radius:9px;
border:1px solid var(--line);background:var(--ink);color:var(--masa)}
textarea{min-height:5rem;resize:vertical}
input:focus,textarea:focus{outline:2px solid var(--marigold);outline-offset:1px}
.pair{display:grid;gap:.6rem}
@media(min-width:620px){.pair{grid-template-columns:1fr 1fr}}
.pair .lang{font-size:.65rem;color:var(--dim);letter-spacing:.1em}
.row{display:flex;align-items:center;gap:.6rem;margin:.9rem 0}
.row input[type=checkbox]{width:1.15rem;height:1.15rem}
.dirty{outline:2px solid var(--marigold)!important}
.saved{outline:2px solid var(--verde)!important}
.bar{position:fixed;left:0;right:0;bottom:0;z-index:30;background:var(--ink3);
border-top:1px solid var(--line);padding:.85rem 1.25rem calc(.85rem + env(safe-area-inset-bottom));
display:flex;gap:1rem;align-items:center;flex-wrap:wrap}
.bar button{font:600 1rem system-ui;padding:.6rem 1.2rem;border:0;border-radius:9px;
background:var(--chile);color:#fff;cursor:pointer}
.bar button.ghost{background:transparent;border:1px solid var(--line);color:var(--masa);font-weight:400}
.bar button:disabled{opacity:.5;cursor:default}
.status{color:var(--dim);font-size:.9rem}
.msg{padding:.8rem 1rem;border-radius:10px;margin-bottom:1rem;font-size:.9rem;display:none}
.msg.err{background:rgba(193,39,45,.15);border:1px solid var(--chile);display:block}
.msg.ok{background:rgba(46,158,99,.13);border:1px solid var(--verde);display:block}
.center{max-width:22rem;margin:15vh auto;text-align:center;padding:1.25rem}
.center img{width:200px;margin-bottom:1.5rem}
.center input{margin-bottom:.9rem;text-align:left}
.center button{width:100%;font:600 1rem system-ui;padding:.85rem;border:0;border-radius:10px;
background:var(--chile);color:#fff;cursor:pointer}
.viewlink{font-size:.85rem}
</style></head>
<body>
<div id="app"><p class="center">Loading…</p></div>

<script>
(function(){
  var FILES = [
    { file:'hours.json',          label:'Hours',           page:'/visit/' },
    { file:'menu.json',           label:'Menu',            page:'/menu/' },
    { file:'events.json',         label:'Events',          page:'/events/' },
    { file:'private-events.json', label:'Private events',  page:'/private-events/' },
    { file:'faq.json',            label:'FAQ',             page:'/faq/' },
    { file:'amenities.json',      label:'Amenities',       page:'/visit/' },
    { file:'business.json',       label:'Contact details', page:'/visit/' }
  ];
  var LABELS = {
    en:'English', es:'Español', name:'Name', desc:'Description', price:'Price',
    section:'Section', note:'Note', label:'Shown as', open:'Opens', close:'Closes',
    q:'Question', a:'Answer', capacity:'Capacity', best:'Best for', includes:'Includes',
    detail:'Detail', kicker:'When', short:'Short line', long:'Full description',
    startTime:'Starts', endTime:'Ends', age:'Age policy', tagline:'Tagline',
    pricesConfirmed:'Show prices on the site'
  };
  // Never editable here: identifiers and machine values that would break links
  // or structured data if a human retyped them.
  var LOCKED = ['slug','pageKey','schemaDay','schemaDays','image','byDay','byMonthWeek','seriesSlug','id'];

  var app = document.getElementById('app');
  var state = { file:null, data:null, dirty:{}, role:null, name:null };

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function human(k){ return LABELS[k] || k.replace(/([A-Z])/g,' \$1').replace(/^./,function(c){return c.toUpperCase();}); }

  // ---- boot --------------------------------------------------------------
  fetch('/api/session/').then(function(r){return r.json();}).then(function(s){
    if(!s.signedIn) return signIn();
    state.role = s.role; state.name = s.name;
    open(FILES[1]);
  }).catch(function(){ signIn('Could not reach the server.'); });

  function signIn(err){
    app.innerHTML =
      '<div class="center"><img src="/admin/logo.png" alt="Mr. Chile Taproom">'+
      (err?'<div class="msg err">'+esc(err)+'</div>':'')+
      '<div class="msg err" id="e" style="display:none"></div>'+
      '<input id="em" type="email" placeholder="Email" autocapitalize="off">'+
      '<input id="pw" type="password" placeholder="Password">'+
      '<button id="go">Sign in</button></div>';
    var go=document.getElementById('go');
    function submit(){
      var e=document.getElementById('e');
      go.disabled=true; go.textContent='Signing in…';
      fetch('/api/auth/',{method:'POST',headers:{'content-type':'application/json'},
        body:JSON.stringify({email:document.getElementById('em').value.trim(),
                             password:document.getElementById('pw').value})})
        .then(function(r){return r.json().then(function(d){return {ok:r.ok,d:d};});})
        .then(function(res){
          if(!res.ok){ e.textContent=res.d.error||'Could not sign in.'; e.style.display='block';
                       go.disabled=false; go.textContent='Sign in'; return; }
          location.reload();
        }).catch(function(){ go.disabled=false; go.textContent='Sign in'; });
    }
    go.addEventListener('click',submit);
    document.getElementById('pw').addEventListener('keydown',function(ev){ if(ev.key==='Enter') submit(); });
  }

  // ---- shell -------------------------------------------------------------
  function chrome(inner, current){
    return '<div class="top"><img src="/admin/logo.png" alt="">'+
      '<nav><a href="/team/">People</a><a href="/" target="_blank">View site</a>'+
      '<button id="out">Sign out</button></nav></div>'+
      '<div class="shell"><div class="side">'+
      FILES.map(function(f){ return '<button data-f="'+f.file+'"'+
        (f.file===current?' aria-current="true"':'')+'>'+esc(f.label)+'</button>'; }).join('')+
      '</div><main>'+inner+'</main></div>'+
      '<div class="bar"><button id="save" disabled>Save changes</button>'+
      '<button class="ghost" id="reset" disabled>Discard</button>'+
      '<span class="status" id="st">Signed in as '+esc(state.name)+'</span></div>';
  }

  function open(entry){
    if(Object.keys(state.dirty).length && !confirm('You have unsaved changes. Leave them?')) return;
    state.file=entry.file; state.dirty={};
    app.innerHTML = chrome('<p class="center">Loading…</p>', entry.file);
    wire();
    fetch('/api/content/?file='+encodeURIComponent(entry.file))
      .then(function(r){return r.json();})
      .then(function(d){
        if(d.error){ app.innerHTML=chrome('<div class="msg err">'+esc(d.error)+'</div>',entry.file); wire(); return; }
        state.data=d.data; state.role=d.role;
        var body='<h1>'+esc(entry.label)+'</h1>'+
          '<p class="hint">Changes go live about a minute after saving. '+
          '<a class="viewlink" href="'+entry.page+'" target="_blank">See this on the site</a></p>'+
          '<div class="msg" id="m"></div>'+ render(state.data,'');
        app.innerHTML = chrome(body, entry.file);
        wire();
      });
  }

  // ---- rendering ---------------------------------------------------------
  function isPair(v){ return v && typeof v==='object' && !Array.isArray(v) && ('en' in v || 'es' in v); }

  function render(node, path){
    var out='';
    for(var k in node){
      if(!Object.prototype.hasOwnProperty.call(node,k)) continue;
      if(LOCKED.indexOf(k)>=0) continue;
      var v=node[k], p=path?path+'.'+k:k;
      if(isPair(v)) out+=pairField(v,p,k);
      else if(typeof v==='string') out+=textField(v,p,k);
      else if(typeof v==='boolean') out+=boolField(v,p,k);
      else if(v===null) out+=textField('',p,k);
      else if(Array.isArray(v)) out+=list(v,p,k);
      else if(typeof v==='object') out+='<fieldset><legend>'+esc(human(k))+'</legend>'+render(v,p)+'</fieldset>';
    }
    return out;
  }

  function list(arr,path,key){
    var out='<fieldset><legend>'+esc(human(key))+'</legend>';
    for(var i=0;i<arr.length;i++){
      var item=arr[i];
      var title = item && (pick(item.name)||pick(item.section)||pick(item.q)||pick(item.day)||item.date||('Item '+(i+1)));
      out+='<fieldset><legend>'+esc(title)+'</legend>'+
        (typeof item==='object'&&item!==null?render(item,path+'['+i+']'):textField(item,path+'['+i+']',''))+
        '</fieldset>';
    }
    return out+'</fieldset>';
  }
  function pick(v){ return isPair(v)?v.en:(typeof v==='string'?v:null); }

  function textField(v,path,key){
    var long = String(v||'').length>70;
    var id='f_'+path.replace(/[^a-z0-9]/gi,'_');
    return '<label for="'+id+'">'+esc(human(key))+'</label>'+
      (long?'<textarea id="'+id+'" data-p="'+esc(path)+'">'+esc(v)+'</textarea>'
           :'<input type="text" id="'+id+'" data-p="'+esc(path)+'" value="'+esc(v)+'">');
  }

  function pairField(v,path,key){
    var idE='f_'+path.replace(/[^a-z0-9]/gi,'_')+'_en';
    var idS='f_'+path.replace(/[^a-z0-9]/gi,'_')+'_es';
    var long = String(v.en||'').length>70;
    function box(id,val,p){ return long
      ? '<textarea id="'+id+'" data-p="'+esc(p)+'">'+esc(val)+'</textarea>'
      : '<input type="text" id="'+id+'" data-p="'+esc(p)+'" value="'+esc(val)+'">'; }
    return '<label>'+esc(human(key))+'</label><div class="pair">'+
      '<div><div class="lang">ENGLISH</div>'+box(idE,v.en,path+'.en')+'</div>'+
      '<div><div class="lang">ESPAÑOL</div>'+box(idS,v.es,path+'.es')+'</div></div>';
  }

  function boolField(v,path,key){
    var id='f_'+path.replace(/[^a-z0-9]/gi,'_');
    return '<div class="row"><input type="checkbox" id="'+id+'" data-p="'+esc(path)+'"'+
      (v?' checked':'')+'><label for="'+id+'" style="margin:0;text-transform:none;letter-spacing:0;font-size:.95rem;color:var(--masa)">'+
      esc(human(key))+'</label></div>';
  }

  // ---- editing -----------------------------------------------------------
  function wire(){
    var out=document.getElementById('out');
    if(out) out.addEventListener('click',function(){
      fetch('/api/logout/',{method:'POST'}).then(function(){ location.href='/'; }); });

    Array.prototype.forEach.call(document.querySelectorAll('.side button'),function(b){
      b.addEventListener('click',function(){
        var e=FILES.filter(function(f){return f.file===b.dataset.f;})[0];
        if(e) open(e);
      });
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-p]'),function(el){
      var ev = el.type==='checkbox' ? 'change' : 'input';
      el.addEventListener(ev,function(){
        var val = el.type==='checkbox' ? el.checked : el.value;
        state.dirty[el.dataset.p]=val;
        el.classList.add('dirty'); el.classList.remove('saved');
        refresh();
      });
    });

    var save=document.getElementById('save'), reset=document.getElementById('reset');
    if(save) save.addEventListener('click',commit);
    if(reset) reset.addEventListener('click',function(){
      var e=FILES.filter(function(f){return f.file===state.file;})[0]; state.dirty={}; open(e); });
    refresh();
  }

  function refresh(){
    var n=Object.keys(state.dirty).length;
    var save=document.getElementById('save'), reset=document.getElementById('reset'),
        st=document.getElementById('st');
    if(!save) return;
    var readOnly = state.role==='viewer';
    save.disabled = n===0 || readOnly; reset.disabled = n===0;
    st.textContent = readOnly ? 'You can look but not change.'
      : n ? (n===1?'1 change not saved':n+' changes not saved')
          : 'Signed in as '+state.name;
  }

  function commit(){
    var paths=Object.keys(state.dirty);
    if(!paths.length) return;
    var save=document.getElementById('save'), st=document.getElementById('st'),
        m=document.getElementById('m');
    save.disabled=true;
    var done=0, failed=[];

    // One request per changed value. Slower than a bulk write and much safer:
    // each is validated on its own and a bad one cannot take the rest with it.
    (function next(){
      if(!paths.length){
        state.dirty={};
        if(m){ m.className='msg '+(failed.length?'err':'ok');
          m.textContent = failed.length
            ? 'Saved '+done+', but these did not save: '+failed.join(', ')
            : 'Saved '+done+(done===1?' change':' changes')+'. Live in about a minute.'; }
        refresh(); return;
      }
      var p=paths.shift();
      fetch('/api/content/',{method:'PATCH',headers:{'content-type':'application/json'},
        body:JSON.stringify({file:state.file,path:p,value:state.dirty[p]})})
        .then(function(r){return r.json().then(function(d){return {ok:r.ok,d:d};});})
        .then(function(res){
          var el=document.querySelector('[data-p="'+p.replace(/"/g,'\\\\"')+'"]');
          if(res.ok){ done++; if(el){ el.classList.remove('dirty'); el.classList.add('saved'); } }
          else { failed.push(p); }
          st.textContent='Saving… '+done+'/'+(done+paths.length+failed.length);
          next();
        }).catch(function(){ failed.push(p); next(); });
    })();
  }

  window.addEventListener('beforeunload',function(e){
    if(Object.keys(state.dirty).length){ e.preventDefault(); e.returnValue=''; }
  });
})();
</script>
</body></html>`;
