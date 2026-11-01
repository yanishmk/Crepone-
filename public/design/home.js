/* CrepOne : animations de la page d'accueil (GSAP + ScrollTrigger). */
(function(){
  if (window.__creponeDesign) return;
  window.__creponeDesign = true;
  const $ = s => document.querySelector(s);
  function sessionStorage_get(k){ try { return sessionStorage.getItem(k); } catch(e) { return null; } }
  function sessionStorage_set(k, v){ try { sessionStorage.setItem(k, v); } catch(e) {} }

  /* ---------- statut d'ouverture (heure de Gatineau) ---------- */
  function updateStatus(){
    let h, m;
    try{
      const parts = new Intl.DateTimeFormat('fr-CA',{timeZone:'America/Toronto',hour:'numeric',minute:'numeric',hourCycle:'h23'}).formatToParts(new Date());
      h = +parts.find(p=>p.type==='hour').value; m = +parts.find(p=>p.type==='minute').value;
    }catch(e){ const d = new Date(); h = d.getHours(); m = d.getMinutes(); }
    const close = 23*60+45, closeTxt = '23 h 45';
    const t = h*60+m, open = t >= 18*60 && t < close;
    const txt = t < 18*60 ? 'Fermé · ouvre à 18 h' : 'Fermé · ouvre demain à 18 h';
    document.querySelectorAll('.js-status').forEach(el=>{
      el.classList.toggle('open', open);
      el.querySelector('span').innerHTML = open ? '<b>Ouvert maintenant</b> · jusqu’à ' + closeTxt : txt;
    });
  }
  updateStatus(); setInterval(updateStatus, 60000);

  const intro0 = document.getElementById('intro');
  const reduce0 = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const skipIntro = reduce0 || !!location.hash || sessionStorage_get('crepone-intro-vu');
  if (skipIntro && intro0) intro0.remove();
  sessionStorage_set('crepone-intro-vu', '1');
  function load(src){ return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.async = false; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
  const fail = () => { const i = document.getElementById('intro'); if (i) i.remove(); document.documentElement.style.overflow = ''; };
  const guard = setTimeout(fail, 6000);
  (window.gsap && window.ScrollTrigger ? Promise.resolve() : load('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js').then(() => load('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js')))
    .then(() => { clearTimeout(guard); start(); }, () => { clearTimeout(guard); fail(); });

  function start(){
  if(!document.getElementById('heroPlate')) return;
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mm = gsap.matchMedia();

  // couleur de fond selon la section
  document.querySelectorAll('[data-zone]').forEach(sec=>{
    const z = sec.dataset.zone;
    const on = ()=>{ document.body.dataset.zone = z; };
    const off = ()=>{ if(document.body.dataset.zone===z) delete document.body.dataset.zone; };
    ScrollTrigger.create({trigger:sec,start:'top 55%',end:'bottom 55%',onEnter:on,onEnterBack:on,onLeave:off,onLeaveBack:off});
  });

  // filets de chocolat : longueur réelle de chaque tracé
  function prepStroke(sel){
    return gsap.utils.toArray(sel).map(p=>{ const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = 0; return p; });
  }

  /* ---------- entrée du héros ---------- */
  function buildHero(afterIntro){
    const dz = prepStroke('.dz');
    const tl = gsap.timeline({paused:true});
    tl.fromTo(dz,{strokeDashoffset:(i,el)=>el.getTotalLength()},{strokeDashoffset:0,duration:1.8,ease:'power2.inOut'},0)
      .from('.hero h1 .line>span',{yPercent:105,duration:1.1,ease:'power4.out',stagger:.1},.05)
      .from('.hero .eyebrow, .hero p, .hero .actions, .hero .status',{y:20,opacity:0,duration:.9,ease:'power3.out',stagger:.07},.3)
      .from('.halo',{scale:0,duration:1.1,ease:'back.out(1.5)'},.1)
      .from('.ptag',{y:60,rotate:-20,opacity:0,duration:.9,ease:'back.out(1.8)'},.7)
      .from('.seal',{scale:0,rotate:-160,duration:1,ease:'back.out(1.8)'},.8);
    if(!afterIntro){
      tl.from('#heroPlate',{scale:.5,rotate:-30,opacity:0,duration:1.1,ease:'back.out(1.4)'},.15);
    }
    return tl;
  }

  /* ---------- intro ---------- */
  function runIntro(){
    const intro = $('#intro'), plate = $('#introPlate'), heroPlate = $('#heroPlate');
    const html = document.documentElement;
    try{ history.scrollRestoration = 'manual'; }catch(e){}
    scrollTo(0,0);
    intro.hidden = false;
    html.style.overflow = 'hidden';
    heroPlate.style.visibility = 'hidden';
    const heroTl = buildHero(true);

    ['crepe_fruite_p','crepe_gourmande_p','crepe_lotus_p','waffle_bueno_p','hero_crepe'].forEach(k=>{
      const im = new Image(); im.src = '/images/v2/' + k + '.webp'; im.alt = ''; plate.appendChild(im);
    });
    const imgs = [...plate.querySelectorAll('img')];
    const W = innerWidth, H = innerHeight;
    const d = Math.min(240, W*.48);
    gsap.set(plate,{left:(W-d)/2, top:(H-d)/2, width:d, height:d, scale:0, rotate:-90});
    gsap.set(imgs,{opacity:0}); gsap.set(imgs[0],{opacity:1});

    const counter = {v:0}, countEl = $('#count');
    let finished = false;
    const tl = gsap.timeline();
    tl.from('.intro-word span',{yPercent:120,duration:1,ease:'power4.out',stagger:.055},0)
      .from('.intro-top, .intro-bottom',{opacity:0,duration:.6},.2)
      .to(counter,{v:100,duration:2.6,ease:'power2.inOut',onUpdate:()=>{countEl.textContent=String(Math.round(counter.v)).padStart(3,'0');}},0)
      .to(plate,{scale:1,rotate:0,duration:1,ease:'back.out(1.5)'},.5);
    imgs.slice(1).forEach((im,i)=>{
      const t = 1.3 + i*.32;
      tl.set(im,{opacity:1},t)
        .fromTo(im,{rotate:-70,scale:1.2},{rotate:0,scale:1,duration:.6,ease:'power3.out'},t)
        .to(plate,{rotate:'+=8',duration:.3,yoyo:true,repeat:1,ease:'sine.inOut'},t);
    });
    tl.to('.intro-word span',{yPercent:-120,duration:.8,ease:'power4.in',stagger:{each:.04,from:'center'}},2.7)
      .to('.intro-top, .intro-bottom',{opacity:0,duration:.4},2.7)
      .to(plate,{left:(W-Math.min(W,H)*.8)/2, top:(H-Math.min(W,H)*.8)/2, width:Math.min(W,H)*.8, height:Math.min(W,H)*.8, rotate:0, duration:.8, ease:'expo.inOut'},2.8)
      .call(fly,null,3.6);

    function fly(){
      const b = heroPlate.getBoundingClientRect(), w = heroPlate.offsetWidth, h = heroPlate.offsetHeight;
      gsap.to(plate,{left:b.left+b.width/2-w/2, top:b.top+b.height/2-h/2, width:w, height:h, rotate:360, duration:1.15, ease:'expo.inOut', onComplete:done});
      gsap.to(intro,{backgroundColor:'rgba(14,36,32,0)', duration:.7, delay:.45});
      gsap.delayedCall(.6,()=>heroTl.play());
    }
    function done(){
      if(finished) return; finished = true;
      heroPlate.style.visibility = '';
      intro.remove();
      html.style.overflow = '';
      ScrollTrigger.refresh();
    }
    $('#skip').addEventListener('click',()=>{
      tl.kill(); gsap.killTweensOf(plate); gsap.killTweensOf(intro);
      heroTl.progress(1); done();
    });
  }

  mm.add('(prefers-reduced-motion: no-preference)', ()=>{
    // assiette du héros qui tourne doucement au défilement + parallaxe
    // héros : profondeur au défilement + flottement
    const hs = {trigger:'.hero',start:'top top',end:'bottom top',scrub:true};
    gsap.to('#heroPlate',{rotate:14,yPercent:-6,ease:'none',scrollTrigger:hs});
    gsap.to('#heroImg',{scale:1.12,ease:'none',scrollTrigger:hs});
    gsap.to('.halo',{scale:1.15,ease:'none',scrollTrigger:hs});
    gsap.to('.ptag',{yPercent:-120,rotate:-6,ease:'none',scrollTrigger:hs});


    // bande réactive
    const band = gsap.to('.band-track',{xPercent:-50,ease:'none',duration:26,repeat:-1});
    ScrollTrigger.create({start:0,end:'max',onUpdate:self=>{
      const v = self.getVelocity(), dir = self.direction;
      gsap.to(band,{timeScale:dir*(1+Math.min(Math.abs(v)/250,6)),duration:.25,overwrite:true,onComplete:()=>gsap.to(band,{timeScale:dir,duration:1})});
    }});

    // progression, menu qui se cache, bouton haut
    gsap.to('.progress',{scaleX:1,ease:'none',scrollTrigger:{start:0,end:'max',scrub:.3}});
    const nav = document.querySelector('nav'), top = $('.totop');
    ScrollTrigger.create({start:0,end:'max',onUpdate:self=>{
      const y = self.scroll();
      gsap.to(nav,{yPercent:(self.direction===1 && y>300)?-110:0,duration:.35,ease:'power2.out',overwrite:'auto'});
      top.classList.toggle('on', y>700);
    }});

    // manifeste mot par mot
    const mf = $('#mf');
    [...mf.childNodes].forEach(n=>{
      if(n.nodeType!==3) return;
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(t=>{
        if(!t) return;
        if(/^\s+$/.test(t)){ frag.appendChild(document.createTextNode(t)); return; }
        const sp = document.createElement('span'); sp.className='w'; sp.textContent=t; frag.appendChild(sp);
      });
      n.replaceWith(frag);
    });
    gsap.fromTo('#mf .w, #mf .pill',{opacity:.14},{opacity:1,stagger:.08,ease:'none',scrollTrigger:{trigger:'#mf',start:'top 78%',end:'bottom 42%',scrub:true}});
    gsap.from('#mf .pill',{scale:0,rotate:-180,ease:'none',stagger:.3,scrollTrigger:{trigger:'#mf',start:'top 75%',end:'bottom 45%',scrub:true}});

    // titres
    gsap.utils.toArray('.sec-head h2, .feature-head h2, .visit h2').forEach(h=>{
      gsap.from(h,{y:50,opacity:.2,duration:1,ease:'power3.out',scrollTrigger:{trigger:h,start:'top 86%'}});
    });

    // mosaïque
    gsap.utils.toArray('.gcol').forEach((col,i)=>{
      const amt = [-22,14,-30][i];
      gsap.fromTo(col,{yPercent:-amt/2},{yPercent:amt/2,ease:'none',scrollTrigger:{trigger:'.gram-grid',start:'top bottom',end:'bottom top',scrub:true}});
    });

    // filet de chocolat qui se dessine
    const dv = prepStroke('.dv');
    gsap.fromTo(dv,{strokeDashoffset:(i,el)=>el.getTotalLength()},{strokeDashoffset:0,ease:'none',scrollTrigger:{trigger:'.divider',start:'top 90%',end:'bottom 40%',scrub:true}});

    // note Google qui compte
    const sc = {v:0}, scoreEl = $('#score');
    ScrollTrigger.create({trigger:'.score',start:'top 85%',once:true,onEnter:()=>{
      gsap.from('.score',{scale:.5,rotate:-30,duration:1,ease:'back.out(1.6)'});
      gsap.to(sc,{v:4.7,duration:1.6,ease:'power2.out',onUpdate:()=>{scoreEl.textContent=sc.v.toFixed(1).replace('.',',');}});
    }});

    // pied de page
    gsap.from('.foot-word span',{yPercent:100,stagger:.06,ease:'power2.out',scrollTrigger:{trigger:'.foot',start:'top 85%',end:'bottom bottom',scrub:1}});
  });

  // vedettes : défilement horizontal, les assiettes tournent
  mm.add('(min-width: 821px) and (prefers-reduced-motion: no-preference)', ()=>{
    const track = $('.track');
    const dist = ()=> track.scrollWidth - innerWidth + 40;
    const st = {trigger:'.feature',start:'top top',end:()=>'+='+dist(),scrub:1};
    gsap.to(track,{x:()=>-dist(),ease:'none',scrollTrigger:{...st,pin:true,invalidateOnRefresh:true}});
    gsap.utils.toArray('.card .stage img').forEach((p,i)=>gsap.fromTo(p,{rotate:i%2?14:-14,y:i%2?50:-10},{rotate:i%2?-10:10,y:i%2?-10:50,ease:'none',scrollTrigger:st}));
  });
  mm.add('(max-width: 820px) and (prefers-reduced-motion: no-preference)', ()=>{
    gsap.utils.toArray('.card .stage img').forEach((p,i)=>gsap.fromTo(p,{rotate:i%2?16:-16,scale:.75,y:40},{rotate:0,scale:1,y:0,ease:'none',scrollTrigger:{trigger:p,start:'top bottom',end:'center 55%',scrub:true}}));
  });

  // curseur, aperçu au survol, boutons magnétiques
  mm.add('(hover: hover) and (prefers-reduced-motion: no-preference)', ()=>{
    const c = $('.cursor');
    const xTo = gsap.quickTo(c,'x',{duration:.35,ease:'power3'}), yTo = gsap.quickTo(c,'y',{duration:.35,ease:'power3'});
    addEventListener('pointermove',e=>{xTo(e.clientX);yTo(e.clientY);});
    document.addEventListener('pointerover',e=>{ c.classList.toggle('big', !!e.target.closest('a, button, .card, .mcard')); });
    // les desserts du héros suivent la souris, chacun à sa profondeur
    const par = [['#heroPlate',16],['.halo',-10],['.ptag',30]].map(([s,k])=>({k,x:gsap.quickTo(s,'x',{duration:.9,ease:'power3'}),y:gsap.quickTo(s,'y',{duration:.9,ease:'power3'})}));
    document.querySelector('.hero').addEventListener('pointermove',e=>{
      const nx = e.clientX/innerWidth-.5, ny = e.clientY/innerHeight-.5;
      par.forEach(p=>{p.x(nx*p.k*2);p.y(ny*p.k*1.4);});
    });
    document.querySelectorAll('.btn').forEach(b=>{
      b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();gsap.to(b,{x:(e.clientX-r.left-r.width/2)*.25,y:(e.clientY-r.top-r.height/2)*.35,duration:.3});});
      b.addEventListener('pointerleave',()=>gsap.to(b,{x:0,y:0,duration:.5,ease:'elastic.out(1,.4)'}));
    });
  });

  if(reduce){ prepStroke('.dz'); }
  else if(!location.hash && !skipIntro){ runIntro(); }
  else { buildHero(false).play(); }

  addEventListener('load',()=>ScrollTrigger.refresh());
  document.addEventListener('crepone:menu',()=>ScrollTrigger.refresh());
  }
})();
