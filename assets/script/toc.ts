import U from "./domutil";
import easingFunctions, { requestAnimationFrame } from "./animate";

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
function scrollToElement(elem, cb) {
  if (elem.href) elem = U.get(elem.getAttribute("href"));
  const startOffset = window.pageYOffset;
  const targetOffset = U.offset(elem).top - headerHeight;
  const deltaOffset = targetOffset - startOffset;
  const duration = 400;
  const startTimeStamp = performance.now();
  function step(curTimeStamp = performance.now()) {
    const delta = curTimeStamp - startTimeStamp;
    if (delta < duration) {
      const percent = easingFunctions.easeInCubic(delta / duration);
      window.scroll(0, startOffset + deltaOffset * percent);
      requestAnimationFrame(step);
    } else {
      window.scroll(0, targetOffset);
      cb && cb();
    }
  }
  requestAnimationFrame(step);
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
    (toc as HTMLElement).style.cssText = `position:absolute;top: ${top}`;
  }
  if (!isFixed && a_height + headerHeight < b_height) {
    (toc as HTMLElement).style.cssText = "";
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
