let isTocSelect = true;
const $toc = $(".toc-panel nav");
const $footer = $("footer.page-footer");
const $post = $(".main-panel .container");
const $header = $("nav.navbar");
const gutterWidth = 20;
const items = [].slice.call($toc.find("li a"));

//function animate above will convert float to int.
const getAnchor = correction =>
  items.map(elem =>
    Math.floor($(elem.getAttribute("href")).offset().top - correction)
  );

const scrolltoElement = (elem, correction, cb) => {
  const $elem = elem.href ? $(elem.getAttribute("href")) : $(elem);
  $("html, body").animate(
    { scrollTop: $elem.offset().top - correction + 1 },
    400,
    cb
  );
};

export default function() {
  let tocHeight = $toc.outerHeight(); // 包括内边距
  let postOffset = $post.offset();
  let headerHeight = $header.height();
  let correction = headerHeight + gutterWidth;
  let anchor = getAnchor(correction);
  if ($toc.length === 0) return;

  $toc.on("click", "a", e => {
    e.preventDefault();
    e.stopPropagation();
    isTocSelect = false;
    $toc.find("a").removeClass("active");
    scrolltoElement(e.currentTarget, correction, () => {
      isTocSelect = true;
      $(e.currentTarget).addClass("active");
    });
  });

  var onscroll = () => {
    if (!anchor) return;
    const postHeight = $post.height();
    const scrollTop = $("html").scrollTop() || $("body").scrollTop();
    const aheight = scrollTop + tocHeight + headerHeight;
    const bheight = postOffset.top + postHeight;
    if (aheight + headerHeight >= bheight) {
      $toc.css({ top: bheight - aheight });
    } else {
      $toc.css({ top: "" });
    }

    if (isTocSelect) {
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
      $(items)
        .removeClass("active")
        .eq(l)
        .addClass("active");
    }
  };

  $(window).resize(() => {
    anchor = getAnchor(correction);
    postOffset = $post.offset();
    tocHeight = $toc.outerHeight(); // 包括内边距
    headerHeight = $header.height();
    correction = headerHeight + 20;
    isTocSelect = true;
    onscroll();
  });

  $(window).scroll(() => onscroll());

  onscroll();
}
