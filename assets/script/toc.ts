import U from "./util";
import animate, { easeInCubic } from "./animate";

const tocPanel = U.get(".toc-panel");
const toc = U.get("nav", tocPanel);
const footer = U.get("footer.page-footer");
const post = U.get(".main-panel .container");
const header = U.get("nav.navbar");
const items: Element[] = [].slice.call(U.getAll("li a", toc));

let activeItem = null;

let isTocSelect, tocHeight, postOffset, headerHeight, anchor;

function getCurrentValue() {
  postOffset = U.offset(post);
  tocHeight = U.size(toc, true).height;
  headerHeight = U.size(header).height;
  anchor = getAnchor();
  isTocSelect = true;
}

function getAnchorTarget(elem) {
  //some id may be invalid, use attribute selector !
  // do not use const target = U.get(elem.getAttribute("href"));
  const id = elem.getAttribute("href").substr(1);
  return U.get(`[id="${id}"]`);
}

function getAnchor() {
  return items.map(elem => {
    const target = getAnchorTarget(elem);
    if (target == null) return 0;
    return Math.round(U.offset(target).top - headerHeight - 20);
  });
}

let animateID = null;
function scrollToElement(elem, cb) {
  if (elem.href) elem = getAnchorTarget(elem);
  if (elem == null) return;
  const startOffset = window.pageYOffset;
  const targetOffset = U.offset(elem).top - headerHeight;
  const deltaOffset = targetOffset - startOffset;

  animateID && animate.cancel(animateID);
  animateID = animate.exec(
    percent => window.scroll(0, startOffset + deltaOffset * percent),
    400,
    easeInCubic,
    cb
  );
}
const indicatorFn = U.memory(() => {
  const str = `<div class="indicator"></div>`;
  const el = U.parseHtml(str);
  toc.appendChild(el);
  return el;
});

function setactive(el) {
  console.log(el);
  if (activeItem === el) return;
  if (activeItem) {
    activeItem.classList.remove("active");
    el.classList.add("active");
  } else {
    for (const item of items) {
      if (item === el) item.classList.add("active");
      else item.classList.remove("active");
    }
  }

  activeItem = el;
  const indicator = indicatorFn();
  U.css(indicator, "top", `${el.offsetTop}px`);
  indicator.classList.add("show");
}

function onclick(e) {
  e.preventDefault();
  e.stopPropagation();
  const curEl = e.target as Element;
  if (curEl.tagName !== "A") return;
  isTocSelect = false;
  setactive(curEl);
  scrollToElement(curEl, () => {
    isTocSelect = true;
  });
}

function onscroll() {
  if (!anchor) return;
  const postHeight = U.size(post).height;
  const scrollTop = window.pageYOffset;
  const a_height = scrollTop + tocHeight + headerHeight;
  const b_height = postOffset.top + postHeight;
  const styles = getComputedStyle(toc);
  const isFixed = styles.position === "fixed";
  if (isFixed && a_height + headerHeight >= b_height) {
    const top =
      -tocPanel.getBoundingClientRect().top + b_height - a_height + "px";
    U.css(toc, "cssText", `position:absolute;top: ${top}`);
  }
  if (!isFixed && a_height + headerHeight < b_height) {
    U.css(toc, "cssText", "");
  }

  if (!isTocSelect) return;
  //binary search.
  let l = 0;
  let r = anchor.length - 1;
  let mid;
  while (l < r) {
    mid = (l + r + 1) >> 1;
    if (anchor[mid] === scrollTop) l = r = mid;
    else if (anchor[mid] < scrollTop) l = mid;
    else r = mid - 1;
  }
  setactive(items[l]);
}

export default function() {
  if (toc === null) return;
  toc.addEventListener("click", onclick);
  window.addEventListener("scroll", onscroll);
  ["resize", "load"].map(evtName => {
    window.addEventListener(evtName, () => {
      getCurrentValue();
      onscroll();
    });
  });
  getCurrentValue();
  onscroll();
}
