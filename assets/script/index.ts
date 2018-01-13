const baseURL = window["baseURL"];

import U from "./util";

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

function headerlink() {
  const postsummary = U.get(".post-summary");
  const article = U.get(".article");
  if (!article || postsummary) return;
  const headers = U.getAll("h1,h2,h3,h4,h5,h6", article);
  for (let i = 0; i < headers.length; i++) {
    const aHtml = `<a href="#${
      headers[i].id
    }" class="headerlink" title="Permanent link">#</a>`;
    headers[i].appendChild(U.parseHtml(aHtml));
  }
}

function loadValine() {
  const config = window["VALINECONFIG"];
  if (!config) return;
  const urls = [`${baseURL}/js/av-min.js`, `${baseURL}/js/Valine.min.js`];
  const asyncloader = url =>
    new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.addEventListener("load", _ => resolve(), false);
      script.addEventListener("error", _ => reject(), false);
      document.body.appendChild(script);
    });
  Promise.all(urls.map(asyncloader))
    .then(() => new window["Valine"](config))
    .catch(e => U.log("load Valine Failed,", e));
}

U.domReady(() => {
  toc();
  loadValine();
  loadSvg();
  // headerlink();
  // 文章未显示
  reveal();
  // 文章已显示
  tab();
  sidebar();
  search();
  taxonomy();
  hitokoto();
});
