import U from "./domutil";

let isTocSelect = true;
const toc = U.get(".toc-panel nav");
const footer = U.get("footer.page-footer");
const post = U.get(".main-panel .container");
const header = U.get("nav.navbar");
const gutterWidth = 20;
const items: Element[] = [].slice.call(U.getAll("li a", toc));

const getAnchor = correction =>
  items.map(elem => {
    const target = U.get(elem.getAttribute("href"));
    return Math.floor(U.offset(target).top - correction);
  });

function scrollToElement(elem, correction, cb){
  
}