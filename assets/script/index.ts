const baseURL = window["baseURL"];
import U from "./domutil";

import search from "./search";
import toc from "./toc";
import sidebar from "./sidebar";
import tab from "./tab";
import hitokoto from "./hitokoto";

function loadSvg() {
  const url = baseURL + "/svg/icon.svg";
  const body = U.get("body");
  const area = U.parseHtml('<div style="display:none"></div>');
  body.appendChild(area);
  U.fetch(url)
    .then(res => res.text())
    .then(text => (area.innerHTML = text));
}

// taxonomy
function taxonomy() {
  const trigger = U.get(".navbar .term-btn");
  const panelW = U.get(".taxonomy");
  const panel = U.get(".taxonomy-panel", panelW);
  if (!trigger || !panel) return;
  trigger.addEventListener("click", e => {
    e.preventDefault();
    panelW.classList.toggle("active");
  });
  document.addEventListener("click", e => {
    if (panel === e.target || panel.contains(e.target as Node)) return;
    if (trigger === e.target || trigger.contains(e.target as Node)) return;
    panelW.classList.remove("active");
  });
}
function reveal() {
  const reveals = U.getAll(".reveal");
  for (let i = 0; i < reveals.length; i++) {
    reveals[i].classList.add("enter");
  }
}
U.domReady(() => {
  tab();
  toc();
  search();
  taxonomy();
  sidebar();
  loadSvg();
  reveal();
  hitokoto();
});
