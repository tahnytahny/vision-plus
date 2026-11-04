/* AXIA — design retenu : proposition 1 « Neon Blue ». Active le thème et charge ses animations après le socle. */
(function(){
  document.documentElement.classList.add("theme-p1");
  function load(){var s=document.createElement("script");s.src="themes/p1.js";document.body.appendChild(s);}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",load);else load();
})();
