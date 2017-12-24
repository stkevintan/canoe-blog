const baseURL = window["baseURL"];
import U from "./domutil";
import lunr from "lunr";

lunr.trimmer = function(token) {
  //check token is chinese then not replace
  if (isChineseChar(token)) {
    return token;
  }
  return token.replace(/^\W+/, "").replace(/\W+$/, "");
};

function isChineseChar(str) {
  var reg = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
  return reg.test(str);
}

let db = null;

function getIdx() {
  if (!db) return db;
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
      return { pageMap, index };
    })
    .catch(e => {
      console && console.log("Error while getting lunr index file: ", e);
      db = null;
    });
  return db;
}

export default function(){
  
}
