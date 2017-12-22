const baseURL = window["baseURL"];
import U from "./domutil";

import "./search";
import toc from "./toc";

function initPlugins() {
  // enable `a` click event inside `li.tab`
}

function loadSvg() {
  const url = baseURL + "/svg/icon.svg";
  const body = U.get("body");
  const area = U.parseHtml('<div style="display:none"></div>');
  body.appendChild(area);
  U.fetch(url)
    .then(res => res.text())
    .then(text => (area.innerHTML = text));
}

U.domReady(() => {
  initPlugins();
  loadSvg();
  toc();
});
