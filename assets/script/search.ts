const baseURL = window["baseURL"];
// don't install @types/lunr, it's obsoletely!
import lunr from "lunr";
import U from "./util";
import animate, { easeOutCubic } from "./animate";

interface ILunrPage {
  uri: string;
  title: string;
  oriTitle: string;
  tags: string[];
}

interface IPageMap {
  [key: string]: ILunrPage;
}

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

const lunrLoader = (function() {
  const trimmer = function(token) {
    return token.update(str => {
      if (/[\u4E00-\u9FA5\uF900-\uFA2D]/.test(str)) return str;
      return str.replace(/^\W+/, "").replace(/\W+$/, "");
    });
  };
  const lunr_zh = function() {
    this.pipeline.reset();
    this.pipeline.add(trimmer, lunr.stopWordFilter, lunr.stemmer);
  };
  lunr.Pipeline.registerFunction(trimmer, "trimmer-zh");
  return U.memory(function() {
    const url = baseURL + "/index.json";
    return U.fetch(url)
      .then(res => res.json())
      .then((pages: ILunrPage[]) => {
        const pageMap: IPageMap = Object.create(null);
        pages.forEach(page => (pageMap[page.uri] = page));
        const index = lunr(function() {
          this.use(lunr_zh);
          this.field("title");
          this.field("tags");
          this.field("content");
          this.ref("uri");
          pages.forEach(page => this.add(page));
        });
        return { pageMap, index };
      })
      .catch(e => {
        console && console.log("Error while getting lunr index file: ", e);
      });
  });
})();

function common(inputEl, labelEl, listEl) {
  inputEl.value = "";

  const clear = (msg?: string) => {
    labelEl.textContent = msg || "暂无搜索结果";
    listEl.innerHTML = "";
  };

  const add = (items: ILunrPage[]) => {
    if (!items || !items.length) {
      clear();
      return;
    }
    if (!Array.isArray(items)) items = [items];

    clear(`搜到了${items.length}项结果`);

    listEl.innerHTML = items
      .map(t => `<li><a href="${baseURL}${t.uri}">${t.oriTitle}</a></li>`)
      .join("");
  };

  const search = (query: string) => {
    return lunrLoader().then(data => {
      if (!data) return [];
      return data.index.search(query).map(item => data.pageMap[item.ref]);
    });
  };

  inputEl.addEventListener("keyup", e => {
    e.preventDefault();
    e.stopPropagation();
    const query = ("" + inputEl.value).trim();
    if (query.length < 2) {
      clear();
      return;
    }
    clear("搜索中...");
    search(query)
      .then(items => add(items))
      .catch(() => clear("搜索失败, 请检查网络"));
  });
}

function pc() {
  let isOpen = false;
  searchForm.addEventListener("click", e => {
    if (isOpen) return;
    isOpen = true;
    navbar.classList.add("search-active");
  });

  searchForm.addEventListener("submit", e => {
    e.preventDefault();
    e.stopPropagation();
  });

  document.addEventListener("click", e => {
    if (
      !isOpen ||
      searchForm === e.target ||
      searchForm.contains(e.target as Node)
    )
      return;
    isOpen = false;
    navbar.classList.remove("search-active");
  });

  common(formInput, label, list);
}

function mobile() {
  // mobile
  let animateID = null;
  searchBtn.addEventListener("click", () => {
    U.css(mobilePanel, "opacity", "0");
    document.body.classList.add("mobile-search-active");
    mobileInput.focus();
    animateID && animate.cancel(animateID);
    animateID = animate.exec(
      percent => U.css(mobilePanel, "opacity", `${percent}`),
      200,
      easeOutCubic
    );
  });
  mobilePanelClose.addEventListener("click", () => {
    animateID && animate.cancel(animateID);
    animateID = animate.exec(
      percent => U.css(mobilePanel, "opacity", `${1 - percent}`),
      200,
      easeOutCubic,
      () => document.body.classList.remove("mobile-search-active")
    );
  });

  common(mobileInput, mobileLabel, mobileList);
}

export default function() {
  if (!searchBtn || !searchForm || !mobilePanel) return;
  lunrLoader();
  pc();
  mobile();
}
