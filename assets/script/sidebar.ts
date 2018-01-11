import animate, { easeOutCubic } from "./animate";
import U from "./util";

//collapse
const trigger = U.get(".navbar .button-collapse");
const sidebar = U.get(`#${trigger.getAttribute("data-activates")}`);

const overlay = U.parseHtml(
  `<div id="sidenav-overlay" style="opacity:0"></div>`
) as HTMLElement;

let animateID = null;
function showOverlay() {
  const isInDom = !!U.get("#sidenav-overlay");
  if (isInDom && overlay.style.opacity === "1") return;
  overlay.style.opacity = "0";
  if (!isInDom) document.body.appendChild(overlay);
  animateID && animate.cancel(animateID);
  animateID = animate.exec(
    percent => (overlay.style.opacity = `${percent}`),
    200,
    easeOutCubic
  );
}

function hideOverlay() {
  const overlay = U.get("#sidenav-overlay") as HTMLElement;
  if (overlay === null) return;
  if (overlay.style.opacity === "0") {
    U.remove(overlay);
    return;
  }
  animateID && animate.cancel(animateID);
  animateID = animate.exec(
    percent => (overlay.style.opacity = `${1 - percent}`),
    200,
    easeOutCubic,
    () => U.remove(overlay)
  );
}

export default function() {
  if (!trigger || !sidebar) return;

  trigger.addEventListener("click", e => {
    e.preventDefault();
    showOverlay();
    document.body.classList.add("mobile-sidebar-active");
  });
  overlay.addEventListener("click", e => {
    e.stopPropagation();
    document.body.classList.remove("mobile-sidebar-active");
    hideOverlay();
  });
}
