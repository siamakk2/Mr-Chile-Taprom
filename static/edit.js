/**
 * On-site editing.
 *
 * Loaded only for someone carrying the editor marker cookie, so a visitor
 * never downloads it. Anything stamped with data-cms during the build becomes
 * clickable; edits PATCH to /api/content/, which does its own permission
 * checks — nothing here is trusted to enforce anything.
 *
 * Saving commits to the repository, so the page you are looking at is about a
 * minute behind the truth. The edited value is left on screen and marked as
 * publishing, rather than pretending it is already live.
 */
(function () {
  'use strict';
  if (window.__mctEditor) return;
  window.__mctEditor = true;

  var API = '/api/content/';
  var editing = null;
  var me = null;

  // ---- styles -------------------------------------------------------------
  var css = document.createElement('style');
  css.textContent = [
    '[data-cms]{outline:1px dashed rgba(240,168,48,.45);outline-offset:2px;',
    'border-radius:3px;cursor:text;transition:background .15s}',
    '[data-cms]:hover{background:rgba(240,168,48,.14)}',
    '[data-cms][contenteditable="true"]{outline:2px solid #F0A830;background:rgba(240,168,48,.1);',
    'cursor:text}',
    '[data-cms][data-state="saving"]{background:rgba(240,168,48,.25)}',
    '[data-cms][data-state="queued"]{background:rgba(46,158,99,.18);outline-color:#2E9E63}',
    '[data-cms][data-state="failed"]{background:rgba(193,39,45,.22);outline-color:#C1272D}',
    '#mct-bar{position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#16100E;',
    'color:#F2E9D8;border-top:1px solid rgba(242,233,216,.18);',
    'font:400 14px/1.4 system-ui,-apple-system,sans-serif;',
    'padding:.7rem 1rem calc(.7rem + env(safe-area-inset-bottom));',
    'display:flex;gap:.9rem;align-items:center;flex-wrap:wrap}',
    '#mct-bar b{color:#F0A830;font-weight:600}',
    '#mct-bar .sp{margin-left:auto;display:flex;gap:.5rem}',
    '#mct-bar button{font:inherit;padding:.4rem .8rem;border-radius:7px;cursor:pointer;',
    'border:1px solid rgba(242,233,216,.22);background:transparent;color:#F2E9D8}',
    '#mct-bar a{color:#B7A992}',
    '#mct-msg{color:#B7A992}'
  ].join('');
  document.head.appendChild(css);

  // ---- the bar ------------------------------------------------------------
  var bar = document.createElement('div');
  bar.id = 'mct-bar';
  bar.innerHTML =
    '<b>Editing this page</b><span id="mct-msg">Click any highlighted text to change it.</span>' +
    '<span class="sp"><a href="/admin/">Full editor</a>' +
    '<button id="mct-off">Stop editing</button></span>';
  document.body.appendChild(bar);
  document.body.style.paddingBottom = '4.5rem';

  document.getElementById('mct-off').addEventListener('click', function () {
    document.cookie = 'mct_editor=; Path=/; Max-Age=0; SameSite=Lax';
    location.reload();
  });

  var msg = document.getElementById('mct-msg');
  function say(text) { msg.textContent = text; }

  // ---- editing ------------------------------------------------------------
  function fields() { return document.querySelectorAll('[data-cms]'); }

  Array.prototype.forEach.call(fields(), function (el) {
    el.addEventListener('click', function (e) {
      if (el.getAttribute('contenteditable') === 'true') return;
      e.preventDefault();
      start(el);
    });
  });

  function start(el) {
    if (editing && editing !== el) finish(editing, true);
    editing = el;
    el.dataset.original = el.textContent;
    el.setAttribute('contenteditable', 'true');
    el.focus();
    // Put the caret at the end rather than wherever the click landed.
    var range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    say('Enter to save, Escape to cancel.');
  }

  document.addEventListener('keydown', function (e) {
    if (!editing) return;
    if (e.key === 'Enter') { e.preventDefault(); finish(editing, false); }
    if (e.key === 'Escape') {
      e.preventDefault();
      editing.textContent = editing.dataset.original;
      finish(editing, true);
    }
  });

  document.addEventListener('click', function (e) {
    if (editing && !editing.contains(e.target) && !bar.contains(e.target)) finish(editing, false);
  }, true);

  function finish(el, cancelled) {
    el.removeAttribute('contenteditable');
    var was = el.dataset.original;
    var now = el.textContent.replace(/\s+/g, ' ').trim();
    editing = null;
    if (cancelled || now === was) { say('Click any highlighted text to change it.'); return; }
    if (!now) { el.textContent = was; say('Left blank — change undone.'); return; }
    save(el, was, now);
  }

  function save(el, was, now) {
    var ref = el.getAttribute('data-cms').split(':');
    el.dataset.state = 'saving';
    say('Saving…');
    fetch(API, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ file: ref[0], path: ref[1], value: now })
    }).then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (!res.ok) {
          el.textContent = was;
          el.dataset.state = 'failed';
          say(res.d.error || 'Could not save.');
          setTimeout(function () { delete el.dataset.state; }, 4000);
          return;
        }
        el.dataset.state = 'queued';
        el.dataset.original = now;
        say('Saved. It goes live in about a minute.');
      }).catch(function () {
        el.textContent = was;
        el.dataset.state = 'failed';
        say('Network problem — change undone.');
      });
  }

  // ---- confirm we are allowed, before showing any of this -----------------
  fetch('/api/session/').then(function (r) { return r.json(); }).then(function (s) {
    me = s;
    if (!s.signedIn) { teardown('Sign in to edit.'); return; }
    if (!s.canEdit) { teardown('Your account can view but not change.'); return; }
    say('Signed in as ' + s.name + '. Click any highlighted text.');
  }).catch(function () { teardown('Could not check your sign-in.'); });

  function teardown(reason) {
    Array.prototype.forEach.call(fields(), function (el) { el.style.outline = 'none'; el.style.cursor = ''; });
    bar.innerHTML = '<b>Editing unavailable</b><span id="mct-msg">' + reason + '</span>' +
      '<span class="sp"><a href="/admin/">Sign in</a></span>';
  }
})();
