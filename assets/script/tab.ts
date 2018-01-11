import U from "./util";

const tabul = U.get(".navbar ul.tabs");
const tabs = U.getAll("li.tab", tabul);

const indicator = U.parseHtml(`<li class="indicator"></li>`);
function moveIndicator(target: Element = U.get("a.active", tabul)) {
  let left = 0,
    width = 0;
  if (target != null) {
    const li = target.parentElement as HTMLElement;
    left = li.offsetLeft;
    width = U.size(li).width;
  }
  U.css(indicator, "cssText", `left:${left}px;width:${width}px`);
}

export default function() {
  if (!tabul || !tabs || !tabs.length) return;
  tabul.appendChild(indicator);
  moveIndicator();

  tabul.addEventListener("mouseover", e => {
    e.stopPropagation();
    const el = e.target as HTMLElement;
    if (el.tagName === "A") moveIndicator(el);
  });
  tabul.addEventListener("mouseout", e => {
    e.stopPropagation();
    const el = e.target as HTMLElement;
    if (el.tagName === "A") moveIndicator();
  });
}
