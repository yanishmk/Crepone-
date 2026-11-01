// Markup statique du nouveau design (intro, héros, vedettes, galerie, visite, pied de page).
// Les animations sont dans public/design/home.js.

export const DESIGN_TOP = `

<div class="intro" id="intro">
  <div class="intro-word" aria-hidden="true"><span>C</span><span>r</span><span>e</span><span>p</span><span class="g">O</span><span class="g">n</span><span class="g">e</span></div>
  <div class="intro-plate" id="introPlate" aria-hidden="true"></div>
  <div class="intro-top"><span class="logo"><img src="/images/crepone-logo.jpg" alt=""><span class="eyebrow">Ice &amp; Crêpe · Gatineau</span></span><span class="count" id="count" aria-hidden="true">000</span></div>
  <div class="intro-bottom"><span>Crêpes · Gaufres · Poff's · Shakes</span><button class="skip" id="skip" type="button">Passer l'intro</button></div>
</div>
<div class="grain" aria-hidden="true"></div>
<div class="progress" aria-hidden="true"></div>
<a class="totop" href="#top" aria-label="Retour en haut">↑</a>
<div class="cursor" aria-hidden="true"></div>

<nav aria-label="Navigation principale">
  <div class="wrap">
    <a class="logo" href="#top"><img src="/images/crepone-logo.jpg" alt="Logo CrepOne"><span>Crep<b>One</b></span></a>
    <ul>
      <li><a href="#vedettes">Vedettes</a></li>
      <li><a href="#menu">Menu</a></li>
      <li><a href="#galerie">Galerie</a></li>
      <li><a href="#visite">Visiter</a></li>
    </ul>
    <div class="nav-right"><span class="status js-status"><i></i><span>Ouvert dès 18 h</span></span><button type="button" class="btn" data-open-cart>Panier</button></div>
  </div>
</nav>

<header class="hero" id="top">
  <svg class="drizzle" viewBox="0 0 1200 500" preserveAspectRatio="none" aria-hidden="true">
    <path class="dz" d="M-20 380 C 140 300, 220 470, 360 380 S 560 180, 700 300 S 900 460, 1020 330 S 1180 160, 1240 240" stroke="#3a1c0b" stroke-width="22"/>
    <path class="dz" d="M-20 380 C 140 300, 220 470, 360 380 S 560 180, 700 300 S 900 460, 1020 330 S 1180 160, 1240 240" stroke="#6a3517" stroke-width="14"/>
    <path class="dz" d="M-20 376 C 140 296, 220 466, 360 376 S 560 176, 700 296 S 900 456, 1020 326 S 1180 156, 1240 236" stroke="rgba(255,220,180,.35)" stroke-width="3"/>
  </svg>
  <div class="wrap">
    <div>
      <div class="eyebrow">Ice &amp; Crêpe · 668 boul. Saint-Joseph</div>
      <h1>
        <span class="line"><span>Dessert</span></span>
        <span class="line"><span><em>signature.</em></span></span>
      </h1>
      <p>Crêpes artisanales, gaufres belges, croffles, Poff's et milkshakes, faits à la commande tous les soirs à Gatineau.</p>
      <div class="actions">
        <a class="btn" href="#menu">Commander en ligne</a>
        <a class="btn ghost" href="#menu">Voir le menu</a>
      </div>
      <div class="status js-status"><i></i><span>Ouvert tous les soirs, 18 h – 23 h 45</span></div>
    </div>
    <div class="hero-art">
      <div class="halo"></div>
      <div class="splate" id="heroPlate"><img id="heroImg" src="/images/v2/hero_crepe.webp" alt="Crêpe Nutella et fraises fraîches, nappée de chocolat"></div>
      <div class="ptag"><span>Crêpe Nutella &amp; Fraise</span><b data-price-for="Crêpe classique Nutella &amp; Fraise">13,99 $</b></div>
      <div class="seal" aria-hidden="true">
        <svg viewBox="0 0 132 132"><defs><path id="circ" d="M66,66 m-50,0 a50,50 0 1,1 100,0 a50,50 0 1,1 -100,0"/></defs><circle cx="66" cy="66" r="65" fill="#f5c518"/><text><textPath href="#circ" textLength="312" lengthAdjust="spacing">CREPONE · ICE &amp; CRÊPE · GATINEAU · </textPath></text></svg>
        <img src="/images/crepone-logo.jpg" alt="">
      </div>
    </div>
  </div>
</header>

<div class="band" aria-hidden="true">
  <div class="band-track">
    <span>Crêpes <i>●</i></span><span>Gaufres <i>●</i></span><span>Croffles <i>●</i></span><span>Poff's <i>●</i></span><span>Milkshakes <i>●</i></span><span>Coupes de fraises <i>●</i></span><span>Cheesecakes <i>●</i></span>
    <span>Crêpes <i>●</i></span><span>Gaufres <i>●</i></span><span>Croffles <i>●</i></span><span>Poff's <i>●</i></span><span>Milkshakes <i>●</i></span><span>Coupes de fraises <i>●</i></span><span>Cheesecakes <i>●</i></span>
  </div>
</div>

<section class="manifesto" data-zone="choco" aria-label="Notre façon de faire">
  <div class="wrap">
    <p class="mf-text" id="mf">Chaque crêpe <span class="pill"><img src="/images/v2/crepe_fraise_p.webp" alt=""></span> est faite à la commande, nappée de chocolat belge, de crème pistache <span class="pill"><img src="/images/v2/crepe_pistache_p.webp" alt=""></span> ou de Lotus <span class="pill cut"><img src="/images/v2/croffle_lotus_c.webp" alt=""></span> et servie chaude, tous les soirs.</p>
    <div class="mf-sign">L'équipe CrepOne</div>
  </div>
</section>

<section class="feature" id="vedettes" data-zone="pist">
  <div class="feature-inner">
    <div class="wrap feature-head">
      <div class="eyebrow">Best-sellers · classement Uber Eats</div>
      <h2>Ce que Gatineau commande</h2>
    </div>
    <div class="track">
      <article class="card"><div class="stage photo"><img src="/images/v2/crepe_bueno_p.webp" alt="Crêpe classique Bueno"></div><span class="tagline">#1 le plus commandé</span><div class="row"><h3>Crêpe Bueno</h3><span class="price" data-price-for="Crêpe classique Bueno">15,99 $</span></div><p>Crème de noisette Kinder Bueno, chocolat au lait et éclats de Bueno.</p><span class="like">76 % aiment · 13 avis</span><button type="button" class="btn add-btn" data-add-name="Crêpe classique Bueno">+ Ajouter</button></article>
      <article class="card"><div class="stage photo"><img src="/images/v2/crepe_fraise_p.webp" alt="Crêpe Nutella et fraises"></div><span class="tagline">#2 le plus commandé</span><div class="row"><h3>Crêpe Nutella &amp; Fraise</h3><span class="price" data-price-for="Crêpe classique Nutella &amp; Fraise">12,99 $</span></div><p>Fraises fraîches et Nutella fondant sur une crêpe fine et moelleuse.</p><span class="like">Nouveau favori</span><button type="button" class="btn add-btn" data-add-name="Crêpe classique Nutella &amp; Fraise">+ Ajouter</button></article>
      <article class="card"><div class="stage photo"><img src="/images/v2/crepe_dubai_ai_p.webp" alt="Crêpe Dubai"></div><span class="tagline">#3 le plus commandé</span><div class="row"><h3>Crêpe Dubai</h3><span class="price" data-price-for="Crêpe classique Dubai">15,99 $</span></div><p>Crème pistache, kadaifi croustillant et chocolat belge.</p><span class="like">92 % aiment · 14 avis</span><button type="button" class="btn add-btn" data-add-name="Crêpe classique Dubai">+ Ajouter</button></article>
      <article class="card"><div class="stage"><img src="/images/v2/crepe_strawberry_dubai_c.webp" alt="Coupe Strawberry Dubai"></div><span class="tagline">Le plus noté</span><div class="row"><h3>Strawberry Dubai</h3><span class="price" data-price-for="Strawberry Dubai">11,99 $</span></div><p>Fraises fraîches, crème pistache, kounafa croustillant et Nutella.</p><span class="like">87 % aiment · 56 avis</span><button type="button" class="btn add-btn" data-add-name="Strawberry Dubai">+ Ajouter</button></article>
      <article class="card"><div class="stage photo"><img src="/images/v2/crepe_oreo_p.webp" alt="Crêpe Oreo"></div><span class="tagline">Coup de cœur</span><div class="row"><h3>Crêpe Oreo</h3><span class="price" data-price-for="Crêpe classique Oreo">13,99 $</span></div><p>Miettes d'Oreo, crème vanille et chocolat fondu.</p><span class="like">84 % aiment · 19 avis</span><button type="button" class="btn add-btn" data-add-name="Crêpe classique Oreo">+ Ajouter</button></article>
      <article class="card"><div class="stage"><img src="/images/v2/poffs_pistache_dubai_c.webp" alt="Poff's Dubai"></div><span class="tagline">Nouveau</span><div class="row"><h3>Poff's Dubai</h3><span class="price" data-price-for="Poff's Dubai">14,49 $</span></div><p>Mini-crêpes, crème pistache, kounafa croustillant et Nutella.</p><span class="like">81 % aiment · 11 avis</span><button type="button" class="btn add-btn" data-add-name="Poff's Dubai">+ Ajouter</button></article>
    </div>
  </div>
</section>

`;

export const DESIGN_BOTTOM = `

<section class="gram" id="galerie" aria-label="Galerie">
  <div class="wrap">
    <div class="sec-head">
      <div>
        <div class="eyebrow">Instagram · TikTok</div>
        <h2>@crep_one</h2>
      </div>
      <p>La boutique, nos clients et les nouveautés du soir, en direct de notre Instagram. Touche une photo pour voir la vidéo.</p>
    </div>
  </div>
  <div class="gram-grid">
    <div class="gcol"><a href="https://www.instagram.com/crep_one/reel/DSd8oHljOhC/" target="_blank" rel="noopener"><img src="/images/v2/ig01.webp" alt="Table de crêpes, Poff's et milkshakes CrepOne à Gatineau" loading="lazy"></a><a href="https://www.instagram.com/crep_one/reel/DcXE5IkJtLw/" target="_blank" rel="noopener"><img src="/images/v2/ig05.webp" alt="Clientes qui goûtent leurs desserts CrepOne" loading="lazy"></a><a href="https://www.instagram.com/crep_one/reel/DZ0fcjORMA3/" target="_blank" rel="noopener"><img src="/images/v2/ig09.webp" alt="Coupe Strawberry Dubai édition Coupe du monde" loading="lazy"></a><a href="https://www.instagram.com/crep_one/reel/Dc7pi7TtJjT/" target="_blank" rel="noopener"><img src="/images/v2/ig03.webp" alt="Boîtes à emporter CrepOne" loading="lazy"></a></div>
    <div class="gcol"><a href="https://www.instagram.com/crep_one/reel/DczfMp3JT3m/" target="_blank" rel="noopener"><img src="/images/v2/ig04.webp" alt="Dessert pistache dans la boutique, mur végétal et néon" loading="lazy"></a><a href="https://www.instagram.com/crep_one/reel/DdzlMdxtr6u/" target="_blank" rel="noopener"><img src="/images/v2/ig02.webp" alt="Coupe Strawberry Dubai en parachute" loading="lazy"></a><a href="https://www.instagram.com/crep_one/reel/DaSVjQYNT3V/" target="_blank" rel="noopener"><img src="/images/v2/ig07.webp" alt="Sorbet maison à la machine" loading="lazy"></a><a href="https://www.instagram.com/crep_one/reel/DaQ7h0KhNWv/" target="_blank" rel="noopener"><img src="/images/v2/ig08.webp" alt="Fraise Dubai spéciale fête du Canada" loading="lazy"></a></div>
    <div class="gcol"><a href="https://www.instagram.com/crep_one/reel/DZpfh0qNmS3/" target="_blank" rel="noopener"><img src="/images/v2/ig10.webp" alt="Coupe de fruits frais devant le néon CrepOne" loading="lazy"></a><a href="https://www.instagram.com/crep_one/reel/DaSzYhkREMz/" target="_blank" rel="noopener"><img src="/images/v2/ig06.webp" alt="Affiche CrepOne Desserts et love" loading="lazy"></a><a href="https://www.instagram.com/crep_one/reel/DbEybXDpp-C/" target="_blank" rel="noopener"><img src="/images/v2/ig00.webp" alt="Affiche CrepOne : trouve le logo" loading="lazy"></a><a href="https://www.instagram.com/crep_one/reel/DSd8oHljOhC/" target="_blank" rel="noopener"><img src="/images/v2/ig01.webp" alt="Table de crêpes, Poff's et milkshakes CrepOne à Gatineau" loading="lazy"></a></div>
  </div>
</section>

<svg class="divider" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true">
  <path class="dv" d="M-10 60 C 150 10, 260 110, 420 60 S 700 10, 860 64 S 1100 110, 1210 50" stroke="#6a3517" stroke-width="12"/>
  <path class="dv" d="M-10 57 C 150 7, 260 107, 420 57 S 700 7, 860 61 S 1100 107, 1210 47" stroke="rgba(255,220,180,.35)" stroke-width="2.5"/>
</svg>

<section id="visite" data-zone="choco">
  <div class="wrap visit">
    <div>
      <div class="eyebrow">Viens nous voir</div>
      <h2>CrepOne à Gatineau</h2>
      <dl>
        <dt>Adresse</dt><dd>668, boulevard Saint-Joseph<br>Gatineau (QC) J8Y 4B4</dd>
        <dt>Heures</dt><dd>Tous les jours, 18 h – 23 h 45</dd>
        <dt>Téléphone</dt><dd>438 229-5272</dd>
        <dt>Statut</dt><dd><span class="status js-status"><i></i><span>Ouvert tous les soirs</span></span></dd>
      </dl>
      <div class="actions">
        <button type="button" class="btn" data-open-cart>Commander maintenant</button>
        <a class="btn ghost" href="https://www.ubereats.com/ca-fr/store/crepone/Z1HdH29GWI6fRHH_3HRHZQ" target="_blank" rel="noopener">Livraison Uber Eats</a>
        <a class="btn ghost" href="https://maps.google.com/?q=668+Boulevard+Saint-Joseph+Gatineau+QC" target="_blank" rel="noopener">Itinéraire</a>
      </div>
    </div>
    <div class="score reveal"><b id="score">4,7</b><span>Google · 460+ avis</span><span><strong>4,6</strong> sur Uber Eats · 600+ notes</span></div>
  </div>
</section>

<footer class="foot">
  <div class="wrap foot-top">
    <div><h4>Explorer</h4><a href="#vedettes">Vedettes</a><a href="#menu">Menu</a><a href="#galerie">Galerie</a><a href="#visite">Visiter</a></div>
    <div><h4>Suivre</h4><a href="https://www.instagram.com/crep_one/" target="_blank" rel="noopener">Instagram @crep_one</a><a href="https://www.tiktok.com/@crepone7" target="_blank" rel="noopener">TikTok @crepone7</a><a href="https://www.facebook.com/p/CrepOne-61566200200895/" target="_blank" rel="noopener">Facebook</a></div>
    <div><h4>Trouver</h4><p>668, boul. Saint-Joseph, Gatineau</p><p>18 h – 23 h 45, tous les jours</p><p>438 229-5272</p></div>
  </div>
  <div class="foot-word" aria-hidden="true"><span>C</span><span>r</span><span>e</span><span>p</span><span class="g">O</span><span class="g">n</span><span class="g">e</span></div>
  <div class="wrap foot-bottom"><span>© 2026 CrepOne · Ice &amp; Crêpe</span><a class="mgr-link" href="/admin">Espace gestionnaire</a></div>
</footer>

`;
