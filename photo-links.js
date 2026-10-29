/* Кнопка «Фото» в карточках склада: ссылка на папку Drive по VIN.
   Данные — photo-links.json {"updated":"ДД.ММ.ГГГГ","links":{VIN:url}}; файл можно заменить целиком. */
(function(){
  if (window.__photoLinksBoot) return;
  window.__photoLinksBoot = true;
  var LINKS = null;
  var css = document.createElement("style");
  css.textContent = ".st-more .st-photo{display:inline-flex;align-items:center;text-decoration:none;margin-left:6px}"+
    ".st-more .st-nophoto{display:inline-block;margin-left:6px;font-size:12px;color:#9aa0a6;white-space:nowrap}"+
    "@media (max-width:600px){.st-more .st-photo,.st-more .st-nophoto{margin-left:0;margin-top:6px}}";
  document.head.appendChild(css);
  function decorate(root){
    if (!LINKS) return;
    var btns = (root || document).querySelectorAll("article[data-st-card] .st-calc[data-km-vin]");
    for (var i = 0; i < btns.length; i++){
      var b = btns[i];
      var nx = b.nextElementSibling;
      if (nx && (nx.classList.contains("st-photo") || nx.classList.contains("st-nophoto"))) continue;
      var vin = String(b.getAttribute("data-km-vin") || "").trim().toUpperCase();
      var url = LINKS[vin];
      var el;
      if (url && /^https:\/\/drive\.google\.com\//.test(url)){
        el = document.createElement("a");
        el.className = "chip st-photo";
        el.href = url; el.target = "_blank"; el.rel = "noopener noreferrer";
        el.textContent = "Фото";
        el.addEventListener("click", function(e){ e.stopPropagation(); });
      } else {
        el = document.createElement("span");
        el.className = "st-nophoto";
        el.textContent = "нет фото";
      }
      b.insertAdjacentElement("afterend", el);
    }
  }
  var pending = false;
  new MutationObserver(function(){
    if (pending) return; pending = true;
    requestAnimationFrame(function(){ pending = false; decorate(); });
  }).observe(document.documentElement, {childList:true, subtree:true});
  fetch("photo-links.json?" + Date.now(), {cache:"no-store"})
    .then(function(r){ return r.ok ? r.json() : null; })
    .then(function(j){ LINKS = (j && j.links) || {}; decorate(); })
    .catch(function(){ LINKS = {}; decorate(); });
})();
