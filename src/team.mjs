/**
 * The people screen at /team/.
 *
 * Separate from the CMS at /admin/ on purpose: managing who has access is a
 * different job from editing the menu, and the CMS has no concept of it. It
 * talks only to /api/users/, which does its own permission checks — nothing
 * here is trusted to enforce anything.
 */
export const teamPage = () => `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>People — Mr. Chile Taproom</title>
<style>
:root{--ink:#16100E;--ink2:#211815;--masa:#F2E9D8;--dim:#B7A992;--chile:#C1272D;
--marigold:#F0A830;--verde:#2E9E63;--line:rgba(242,233,216,.16)}
*{box-sizing:border-box}
body{margin:0;background:var(--ink);color:var(--masa);
font:400 16px/1.55 system-ui,-apple-system,sans-serif;padding:1.5rem 1.25rem 4rem}
.wrap{max-width:44rem;margin-inline:auto}
header{display:flex;align-items:center;gap:1rem;flex-wrap:wrap;margin-bottom:2rem}
header img{width:150px;height:auto}
header nav{margin-left:auto;display:flex;gap:1rem;font-size:.9rem}
header nav a{color:var(--dim)}
h1{font-size:1.3rem;margin:0 0 .3rem}
.sub{color:var(--dim);font-size:.9rem;margin:0 0 2rem}
.person{display:flex;align-items:center;gap:1rem;flex-wrap:wrap;
padding:1rem;border:1px solid var(--line);border-radius:12px;margin-bottom:.6rem;background:var(--ink2)}
.person .who{flex:1 1 12rem;min-width:0}
.person .nm{font-weight:600;overflow:hidden;text-overflow:ellipsis}
.person .em{color:var(--dim);font-size:.85rem;overflow:hidden;text-overflow:ellipsis}
.tag{font:600 .68rem/1 system-ui;letter-spacing:.09em;text-transform:uppercase;
padding:.38rem .6rem;border-radius:999px;border:1px solid var(--line);color:var(--dim)}
.tag.owner{color:var(--marigold);border-color:var(--marigold)}
.tag.invited{color:var(--marigold)}
.tag.suspended{color:var(--chile);border-color:var(--chile)}
.tag.active{color:var(--verde);border-color:var(--verde)}
.acts{display:flex;gap:.4rem;flex-wrap:wrap}
button,select,input{font:inherit}
button{padding:.5rem .85rem;border-radius:8px;border:1px solid var(--line);
background:transparent;color:var(--masa);cursor:pointer}
button.primary{background:var(--chile);border-color:var(--chile);color:#fff;font-weight:600}
button.danger{color:var(--chile);border-color:var(--chile)}
button:disabled{opacity:.5;cursor:default}
.card{border:1px solid var(--line);border-radius:12px;padding:1.25rem;background:var(--ink2);margin-top:2rem}
.card h2{font-size:1rem;margin:0 0 1rem}
label{display:block;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;
color:var(--dim);margin:0 0 .3rem}
input,select{width:100%;padding:.75rem .9rem;margin-bottom:.9rem;border-radius:9px;
border:1px solid var(--line);background:var(--ink);color:var(--masa)}
.msg{padding:.85rem 1rem;border-radius:10px;margin-bottom:1rem;font-size:.9rem;display:none}
.msg.err{background:rgba(193,39,45,.15);border:1px solid var(--chile)}
.msg.ok{background:rgba(46,158,99,.13);border:1px solid var(--verde)}
.link{word-break:break-all;font:400 .82rem ui-monospace,monospace;color:var(--marigold);
display:block;margin-top:.5rem}
.empty{color:var(--dim);padding:2rem 0;text-align:center}
</style></head><body>
<div class="wrap">
<header>
  <img src="/admin/logo.png" alt="Mr. Chile Taproom">
  <nav><a href="/admin/">Edit site</a><a href="#" id="out">Sign out</a></nav>
</header>

<h1>People</h1>
<p class="sub" id="sitename">Who can edit this website.</p>

<div class="msg err" id="err"></div>
<div class="msg ok" id="ok"></div>

<div id="people"><p class="empty">Loading…</p></div>

<div class="card" id="invitecard" style="display:none">
  <h2>Invite someone</h2>
  <label for="email">Email</label>
  <input id="email" type="email" autocapitalize="off" placeholder="name@example.com">
  <label for="name">Name (optional)</label>
  <input id="name" type="text">
  <label for="role">Role</label>
  <select id="role">
    <option value="editor">Editor — can change content</option>
    <option value="owner">Owner — can also manage people</option>
    <option value="viewer">Viewer — can look, not change</option>
  </select>
  <button class="primary" id="send">Send invitation</button>
</div>
</div>

<script>
(function(){
  var err=document.getElementById('err'), ok=document.getElementById('ok');
  function show(el,m){ el.textContent=m; el.style.display='block'; setTimeout(function(){},0); }
  function hide(){ err.style.display='none'; ok.style.display='none'; }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  var isOwner=false, meId=null;

  function load(){
    fetch('/api/users/',{headers:{accept:'application/json'}})
      .then(function(r){ if(r.status===401){ location.href='/api/auth/'; throw new Error('signin'); }
                         return r.json(); })
      .then(render).catch(function(e){ if(e.message!=='signin') show(err,'Could not load people.'); });
  }

  function render(d){
    if(d.error){ show(err,d.error); return; }
    isOwner=d.me.isOwner; meId=d.me.id;
    document.getElementById('sitename').textContent='Who can edit '+d.site.name+'.';
    document.getElementById('invitecard').style.display = isOwner ? 'block' : 'none';

    var box=document.getElementById('people');
    if(!d.people.length){ box.innerHTML='<p class="empty">Nobody yet.</p>'; return; }
    box.innerHTML=d.people.map(function(p){
      var self = p.id===meId;
      var acts = (isOwner && !self) ? (
        '<button data-act="'+(p.status==='suspended'?'active':'suspended')+'" data-id="'+p.id+'">'+
          (p.status==='suspended'?'Restore':'Suspend')+'</button>'+
        '<button class="danger" data-act="remove" data-id="'+p.id+'">Remove</button>') : '';
      return '<div class="person">'+
        '<div class="who"><div class="nm">'+esc(p.name||p.email.split('@')[0])+(self?' (you)':'')+'</div>'+
        '<div class="em">'+esc(p.email)+'</div></div>'+
        '<span class="tag '+esc(p.role)+'">'+esc(p.role)+'</span>'+
        '<span class="tag '+esc(p.status)+'">'+esc(p.status)+'</span>'+
        '<div class="acts">'+acts+'</div></div>';
    }).join('');

    Array.prototype.forEach.call(box.querySelectorAll('button[data-act]'),function(b){
      b.addEventListener('click',function(){ act(b.dataset.act,b.dataset.id,b); });
    });
  }

  function act(what,id,btn){
    hide();
    if(what==='remove' && !confirm('Remove this person? They lose access immediately.')) return;
    btn.disabled=true;
    var opts = what==='remove'
      ? { method:'DELETE' }
      : { method:'PATCH', headers:{'content-type':'application/json'},
          body: JSON.stringify({ id:id, status:what }) };
    var url = what==='remove' ? '/api/users/?id='+encodeURIComponent(id) : '/api/users/';
    fetch(url,opts).then(function(r){ return r.json(); }).then(function(d){
      if(d.error){ show(err,d.error); btn.disabled=false; return; }
      load();
    }).catch(function(){ show(err,'Something went wrong.'); btn.disabled=false; });
  }

  document.getElementById('send').addEventListener('click',function(){
    hide();
    var btn=this;
    var email=document.getElementById('email').value.trim();
    if(!email) return show(err,'Enter an email address.');
    btn.disabled=true; btn.textContent='Sending…';
    fetch('/api/users/',{method:'POST',headers:{'content-type':'application/json'},
      body: JSON.stringify({ email: email,
        name: document.getElementById('name').value,
        role: document.getElementById('role').value })})
      .then(function(r){ return r.json(); })
      .then(function(d){
        btn.disabled=false; btn.textContent='Send invitation';
        if(d.error){ show(err,d.error); return; }
        document.getElementById('email').value='';
        document.getElementById('name').value='';
        if(d.emailed){ show(ok,'Invitation emailed. It expires in '+d.expiresInDays+' days.'); }
        else { ok.innerHTML='Invitation created, but email is not set up yet — send them this link '+
               'yourself. It expires in '+d.expiresInDays+' days.<span class="link">'+esc(d.link)+'</span>';
               ok.style.display='block'; }
        load();
      }).catch(function(){ btn.disabled=false; btn.textContent='Send invitation'; show(err,'Something went wrong.'); });
  });

  document.getElementById('out').addEventListener('click',function(e){
    e.preventDefault();
    fetch('/api/logout/',{method:'POST'}).then(function(){ location.href='/'; });
  });

  load();
})();
</script>
</body></html>`;
