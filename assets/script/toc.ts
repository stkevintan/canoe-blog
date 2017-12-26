import U from "./domutil";
import easingFunctions, { animate, cancelAnimate } from "./animate";

const tocPanel = U.get(".toc-panel");
const toc = U.get("nav", tocPanel);
const footer = U.get("footer.page-footer");
const post = U.get(".main-panel .container");
const header = U.get("nav.navbar");
const items: Element[] = [].slice.call(U.getAll("li a", toc));
let isTocSelect, tocHeight, postOffset, headerHeight, anchor;

function getCurrentValue() {
  postOffset = U.offset(post);
  tocHeight = U.size(toc, true).height;
  headerHeight = U.size(header).height;
  anchor = getAnchor();
  isTocSelect = true;
}

function getAnchor() {
  return items.map(elem => {
    const target = U.get(elem.getAttribute("href"));
    return Math.round(U.offset(target).top - headerHeight - 20);
  });
}

let animateID = null;
function scrollToElement(elem, cb) {
  if (elem.href) elem = U.get(elem.getAttribute("href"));
  const startOffset = window.pageYOffset;
  const targetOffset = U.offset(elem).top - headerHeight;
  const deltaOffset = targetOffset - startOffset;

  animateID && cancelAnimate(animateID);
  animateID = animate(
    percent => window.scroll(0, startOffset + deltaOffset * percent),
    400,
    easingFunctions.easeInCubic,
    cb
  );
}

function onclick(e) {
  e.preventDefault();
  e.stopPropagation();
  const curEl = e.target as Element;
  if (curEl.tagName !== "A") return;
  const activeEl = U.get("a.active", toc);
  if (activeEl) activeEl.classList.remove("active");
  isTocSelect = false;
  scrollToElement(curEl, () => {
    isTocSelect = true;
    curEl.classList.add("active");
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

  items.forEach((item, index) => {
    if (index === l) item.classList.add("active");
    else item.classList.remove("active");
  });
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
