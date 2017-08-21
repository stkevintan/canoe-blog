$(() => {
  // enable `a` click event inside `li.tab`
  $('.tab').click(function(e) {
    window.location.href = $(this).find('a').prop('href');
  });
  $('.modal').modal();
  setTocToggle();
  setAsideToggle();
});

const setTocToggle = () => {
  let onscrollSelect = true;
  const $toc = $('.toc-panel nav');
  const $footer = $('footer.page-footer');
  const $post = $('.post .card');
  const $header = $('nav.navbar');
  const items = Array.from($toc.find('li a'));

  let tocHeight = $toc.outerHeight(); // 包括内边距
  let postOffset = $post.offset();
  let headerHeight = $header.height();
  let correction = headerHeight + 20;
  let anchor = getAnchor();
  //function animate above will convert float to int.
  function getAnchor() {
    return items.map(elem =>
      Math.floor($(elem.getAttribute('href')).offset().top - correction)
    );
  }

  function scrolltoElement(elem, cb) {
    var $elem = elem.href ? $(elem.getAttribute('href')) : $(elem);
    $('html, body').animate(
      { scrollTop: $elem.offset().top - correction + 1 },
      400,
      cb
    );
  }

  if ($toc.length === 0) return;

  $toc.on('click', 'a', function(e) {
    e.preventDefault();
    e.stopPropagation();
    onscrollSelect = false;
    $toc.find('a').removeClass('active');
    scrolltoElement(this, () => {
      onscrollSelect = true;
      $(this).addClass('active');
    });
  });

  var scrollListener = () => {
    if (!anchor) return;
    var postHeight = $post.height();
    var scrollTop = $('html').scrollTop() || $('body').scrollTop();
    var isset = false;

    if (scrollTop + headerHeight >= postOffset.top) {
      $toc.removeClass('absolute').addClass('fixed').css('top', headerHeight);
      isset = true;
    }

    if (scrollTop + headerHeight + tocHeight >= postOffset.top + postHeight) {
      $toc
        .removeClass('fixed')
        .addClass('absolute')
        .css({ top: postHeight - tocHeight });
      isset = true;
    }
    if (!isset) {
      $toc.removeClass('fixed').removeClass('absolute').css({ top: 'initial' });
    }
    if (onscrollSelect) {
      //binary search.
      var l = 0,
        r = anchor.length - 1,
        mid;
      while (l < r) {
        mid = (l + r + 1) >> 1;
        if (anchor[mid] === scrollTop) l = r = mid;
        else if (anchor[mid] < scrollTop) l = mid;
        else r = mid - 1;
      }
      $(items).removeClass('active').eq(l).addClass('active');
    }
  };

  $(window).resize(() => {
    anchor = getAnchor();
    postOffset = $post.offset();
    tocHeight = $toc.outerHeight(); // 包括内边距
    headerHeight = $header.height();
    correction = headerHeight + 20;
    onscrollSelect = true;
    scrollListener();
  });

  $(window).scroll(() => scrollListener());

  scrollListener();
};

const setAsideToggle = () => {
  const $aside = $('aside.side-panel');
  const $body = $('body');
  const $swither = $('.button-collapse');
  const $icon = $('i.material-icons', $swither);
  const $cover = $('<div id="js-cover"></div>');
  const onSwitcherClick = () => {
    if ($aside.hasClass('open')) {
      $aside.removeClass('open');
      $cover.fadeOut(400);
      $body.removeClass('covered');
      $icon.text('menu');
    } else {
      $aside.addClass('open');
      $cover.fadeIn(400);
      $body.addClass('covered');
      $icon.text('close');
    }
  };

  $cover.click(e => {
    e.stopPropagation();
    e.preventDefault();
    onSwitcherClick();
  });
  $cover.appendTo($body);

  $swither.click(onSwitcherClick);
};
