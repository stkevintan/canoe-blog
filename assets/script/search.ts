const baseURL = window["baseURL"];
const lunr = window["lunr"]; // import will cause js error.

import U from "./domutil";
import easingFunctions, { cancelAnimate, animate } from "./animate";

lunr.trimmer = function(token) {
  //check token is chinese then not replace
  if (isChineseChar(token.str)) {
    return token;
  }
  token.str = token.str.replace(/^\W+/, "").replace(/\W+$/, "");
  return token;
};

function isChineseChar(str) {
  var reg = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
  return reg.test(str);
}

let db = null;

function getIdx() {
  if (db) return db;
  const url = baseURL + "/index.json";
  db = U.fetch(url)
    .then(res => res.json())
    .then(pages => {
      const pageMap = Object.create(null);
      for (const page of pages) {
        pageMap[page.uri] = page;
      }
      const index = lunr(function() {
        this.field("title", { boost: 10 });
        this.field("tags", { boost: 5 });
        this.field("content");
        this.ref("uri");
        pages.forEach(page => this.add(page));
      });
      return { pageMap: pageMap, index: index };
    })
    .catch(e => {
      console && console.log("Error while getting lunr index file: ", e);
    });
  return db;
}
function search(query) {
  return getIdx().then(data =>
    data.index.search(query).map(item => data.pageMap[item.ref])
  );
}

// const searchBtn = $('.search-btn');
const navbar = U.get(".navbar");
const searchForm = U.get(".nav-form", navbar);

const formInput = U.get("input", searchForm) as HTMLInputElement;
const formPanel = U.get(".search-result");
const label = U.get("label", formPanel);
const list = U.get("ul", formPanel);

//mobile
const searchBtn = U.get(".search-btn", navbar);
const mobilePanel = U.get(".mobile-search");
const mobilePanelClose = U.get(".mobile-search-close");
const mobileInput = U.get("input", mobilePanel) as HTMLInputElement;
const mobileLabel = U.get("label", mobilePanel);
const mobileList = U.get("ul", mobilePanel);

function init(input, label, list) {
  input.value = "";
  const clear = (msg?) => {
    label.textContent = msg || "暂无搜索结果";
    list.innerHTML = "";
  };
  const add = items => {
    if (!items || !items.length) {
      clear();
      return;
    }
    if (!Array.isArray(items)) items = [items];

    const itemStr = items.reduce(
      (str, item) => `${str}<li><a href="${item.uri}">${item.title}</a></li>`,
      ""
    );
    clear(`搜到了${items.length}项结果`);
    list.innerHTML = itemStr;
  };
  const doSearch = () => {
    const query = ("" + input.value).trim();
    if (query.length < 2) {
      clear();
      return;
    }
    clear("搜索中...");
    search(query)
      .then(items => add(items))
      .catch(() => clear("搜索失败, 请检查网络"));
  };
  input.addEventListener("keyup", e => {
    e.preventDefault();
    e.stopPropagation();
    doSearch();
  });
}

export default function() {
  if (!searchBtn || !searchForm || !mobilePanel) return;
  let searchOpened = false;
  searchForm.addEventListener("click", e => {
    if (searchOpened) return;
    searchOpened = true;
    navbar.classList.add("search-active");
  });

  searchForm.addEventListener("submit", e => {
    e.preventDefault();
    e.stopPropagation();
  });

  document.addEventListener("click", e => {
    if (
      !searchOpened ||
      searchForm === e.target ||
      searchForm.contains(e.target as Node)
    )
      return;
    searchOpened = false;
    navbar.classList.remove("search-active");
  });
  init(formInput, label, list);

  // mobile
  let animateID = null;
  searchBtn.addEventListener("click", () => {
    U.css(mobilePanel, "opacity", "0");
    document.body.classList.add("mobile-search-active");
    mobileInput.focus();
    animateID && cancelAnimate(animateID);
    animateID = animate(
      percent => U.css(mobilePanel, "opacity", `${percent}`),
      200,
      easingFunctions.easeOutCubic
    );
  });
  mobilePanelClose.addEventListener("click", () => {
    animateID && cancelAnimate(animateID);
    animateID = animate(
      percent => U.css(mobilePanel, "opacity", `${1 - percent}`),
      200,
      easingFunctions.easeOutCubic,
      () => document.body.classList.remove("mobile-search-active")
    );
  });

  init(mobileInput, mobileLabel, mobileList);
}
