let searchDB = null;
const lunr = window["lunr"];
const baseURL = window["baseURL"];

function dbFactory() {
  if (searchDB) return searchDB;
  const url = baseURL + "/index.json";
  searchDB = $.getJSON(url)
    .then(pages => ({
      pageMap: pages.reduce((map, page) => {
        map[page.uri] = page;
        return map;
      }, Object.create(null)),
      index: lunr(function() {
        this.field("title", { boost: 10 });
        this.field("tags", { boost: 5 });
        this.field("content");
        this.ref("uri");
        pages.forEach(page => this.add(page));
      })
    }))
    .fail((jqxhr, textStatus, error) => {
      console.error(
        "Error getting Hugo index flie:",
        textStatus + ", " + error
      );
      searchDB = null;
    });
  return searchDB;
}

export default function() {
  const $in = $("#in-search");
  const $out = $("#out-search");

  const search = query =>
    dbFactory().then(data =>
      data.index.search(query).map(item => data.pageMap[item.ref])
    );

  const clear = (text = "No Result...") => {
    const $item = $(
      `<span class="collection-item text-grey" style="display:none">${text}</span>`
    );
    $out.empty().append($item.fadeIn(200));
  };
  clear();

  const add = items => {
    if (!items || !items.length) {
      clear();
      return;
    }
    if (!$.isArray(items)) items = [items];
    const $items = items.map(item =>
      $(
        `<a href="${
          item.uri
        }" class="collection-item nowrap" style="display:none"><i class="material-icons">description</i>${
          item.title
        }</a>`
      )
    );
    $out.empty().append($items);
    $items.forEach($item => $item.fadeIn(100));
  };

  $in.keyup(() => {
    const query = ("" + $in.val()).trim();
    if (query.length < 2) {
      clear();
      return;
    }
    clear("Searching...");
    search(query)
      .then(items => add(items))
      .fail(() => clear("Fail to execute search, Please check your network."));
  });
}
