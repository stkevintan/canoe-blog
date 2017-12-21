const baseURL = window["baseURL"];
import search from "./search";
import toc from "./toc";

function initPlugins() {
  // enable `a` click event inside `li.tab`
  $(".tab").click(function(e) {
    window.location.href = $(this)
      .find("a")
      .prop("href");
  });
  ($(".button-collapse") as any).sideNav();
  ($(".modal") as any).modal();
}

function loadSvg() {
  const url = baseURL + "/svg/icon.svg";
  const $area = $('<div style="display:none"></div>').appendTo($("body"));
  $area.load(url);
}

$(() => {
  initPlugins();
  toc();
  loadSvg();
  search();
});
