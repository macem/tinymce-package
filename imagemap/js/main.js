// load area
function load(img) {
  var name = img.getAttribute('usemap') || editor.dom.uniqueId('map'),
    $areas = $$(name, editor.contentDocument.body).find('area'),
    $node;

  $$('#imgmap_name', document.body)[0].value = name.replace('#', '');

  $areas.each(function() {
    $node = $$(this);

    var params = {
      href: $node.attr('href'),
      title: $node.attr('title'),
      type: $node.attr('shape'),
      coords: $node.attr('coords').split(',').map(function(i) {
        return parseInt(i);
      })
    };

    var $div = createArea({
      x: params.coords[0],
      y: params.coords[1],
      type: params.type,
      $to: $container
    });

    $div[0].coords = params.coords;

    $div.attr('data-href', params.href);
    $div.attr('data-title', params.title);

    // support rect
    if (params.type === 'rect') {
      $div.css({
        width: params.coords[2] - params.coords[0],
        height: params.coords[3] - params.coords[1]
      });
    }
    else if (params.type === 'circle') {
      $div.css({
        top: params.coords[1] - params.coords[2],
        left: params.coords[0] - params.coords[2],
        width: params.coords[2] * 2,
        height: params.coords[2] * 2
      });
    }
    else if (params.type === 'polygon') {
      var $item, i = 0, dimensions,
        len = params.coords.length/2,
        $canvas = $div.find('canvas');

      for (; i < len; ++i) {
        $item = addPoint($div, i+1, params.coords);
      }

      dimensions = dimensionsPoly(params.coords);
      renderPoly($canvas, params.coords, dimensions);
    }
  });
}

function addPoint($target, index, coords) {
  var $item = $target.find('.resize-' + index);

  if (!$item.length) {
    $item = $$('<a/>').attr({
      title: 'resize area',
      index: index,
      'class': 'mce-resize resize-' + index
    })
    .appendTo($target);
  }

  $item.css({
    top: coords[((index-1) * 2) + 1],
    left: coords[(index-1) * 2]
  });

  return $item;
}

function renderPoly($canvas, coords, param) {
  var context = $canvas[0].getContext('2d'),
    i = 1,
    len = coords.length/2;

  $canvas.css({
    top: param.top,
    left: param.left
  })
  .attr({
    width: param.right - param.left + 8,
    height: param.bottom - param.top + 8
  });

  $canvas.parent().find('.mce-link').css({
    left: (param.left + param.right)/2,
    top: (param.top + param.bottom)/2
  });

  context.clearRect(0, 0, $canvas[0].offsetWidth, $canvas[0].offsetHeight);
  context.beginPath();
  context.fillStyle = '#ffffff';
  context.globalAlpha=0.3;
  context.moveTo(coords[0] - param.left, coords[1] - param.top);
  for (; i < len; ++i) {
    context.lineTo(coords[i * 2] - param.left, coords[(i * 2) + 1] - param.top);
  }
  context.closePath();
  context.fill();
  context.stroke();
}

function dimensionsPoly(coords) {
  var param = {
    top: 10000,
    left: 10000,
    bottom: 0,
    right: 0
  },
  i = 0,
  len = coords.length/2;

  for (; i < len; ++i) {
    param.top = Math.min(param.top, coords[(i * 2) + 1]);
    param.bottom = Math.max(param.bottom, coords[(i * 2) + 1]);
    param.left = Math.min(param.left, coords[i * 2]);
    param.right = Math.max(param.right, coords[i * 2]);
  }

  return param;
}

// save area
function save(img) {
  var $areas = $container.find('> div'),
    $newmap = $$('<map/>'),
    name = img.getAttribute('usemap'),
    newname = $$('#imgmap_name', document.body)[0].value || editor.dom.uniqueId('map'),
    $map = $$(name, body),
    $node, $area, pos;

  $newmap.attr({
    name: newname,
    id: newname
  });

  $areas.each(function() {
    $node = $$(this);

    if ($node.attr('data-type') === 'rect') {
      $area = $$('<area/>');
      $area.attr({
        shape: 'rect',
        coords: [
          this.offsetLeft,
          this.offsetTop,
          this.offsetLeft + this.offsetWidth,
          this.offsetTop + this.offsetHeight
        ].join(','),
        href: $node.attr('data-href'),
        alt: 'link',
        title: $node.attr('data-title'),
        target: $node.attr('data-target')
      });

      $newmap.append($area);
    }
    else if ($node.attr('data-type') === 'circle') {
      $area = $$('<area/>');
      pos = [
        this.offsetLeft + (this.offsetWidth / 2),
        this.offsetTop + (this.offsetHeight / 2),
        this.offsetWidth / 2
      ];
      $area.attr({
        shape: 'circle',
        coords: pos.join(','),
        href: $node.attr('data-href'),
        alt: 'link',
        title: $node.attr('data-title'),
        target: $node.attr('data-target')
      });

      $newmap.append($area);
    }
    else if ($node.attr('data-type') === 'polygon') {
      $area = $$('<area/>');
      pos = [];

      $node.find('.mce-resize').each(function() {
        pos.push(this.offsetLeft);
        pos.push(this.offsetTop);
      });

      $area.attr({
        shape: 'polygon',
        coords: pos.join(','),
        href: $node.attr('data-href'),
        alt: 'link',
        title: $node.attr('data-title'),
        target: $node.attr('data-target')
      });

      $newmap.append($area);
    }
  });

  img.setAttribute('usemap', '#' + newname);

  if (img.getAttribute('usemap')) {
    $map.remove();
  }

  $$(img).after($newmap);
}

// edit area
function editArea(node) {
  var $modal = $$('.mce-modal-edit', document.body),
    $node = $$(node);

  $modal.find('#modal-href')[0].value = $node.attr('data-href') || '';
  $modal.find('#modal-title')[0].value = $node.attr('data-title') || '';
  $modal.find('#modal-target')[0].value = $node.attr('data-target') || '';

  $modal.find('#mce-modal-ok').off('click')
  .on('click', function() {
    $node.attr('data-href', $modal.find('#modal-href')[0].value);
    $node.attr('data-title', $modal.find('#modal-title')[0].value);
    $node.attr('data-target', $modal.find('#modal-target')[0].value);
    $modal.addClass('mce-hide');
    return false;
  });

  $modal.find('#mce-modal-cancel').off('click')
  .on('click', function() {
    $modal.addClass('mce-hide');
    return false;
  });

  $modal.removeClass('mce-hide');
}

// create area
function createArea(params) {
  var $div = $$(htmlArea),
    $canvas = $$('<canvas/>');

  if (params.type === 'polygon') {
    $canvas.css({
      top: params.y,
      left: params.x
    })
    .appendTo($div);
  }
  else {
    $div.css({
      top: params.y,
      left: params.x
    });
  }

  $div.addClass('mce-' + params.type)
  .attr('data-type', params.type)
  .appendTo(params.$to);

  return $div;
}


function resizeWE($this, $target, x) {
  var options = {},
    offset = $this[0].offsetLeft;

  if ($target.hasClass('resize-2')) {
    options.x = x - offset - $target.parent()[0].offsetWidth;
  }
  else {
    options.x = x - offset + $target.parent()[0].offsetWidth;
  }

  $this.on('mousemove', function(e) {
    var width = e.clientX - options.x - offset, css = {};

    if (width >= 0) {
      css.width = width;
    }
    else {
      css.left = e.clientX - offset;
      css.width = options.x - e.clientX + offset;
    }
    if ($target.parent().attr('data-type') === 'circle') {
      css.height = css.width;
    }
    $target.parent().css(css);
  })
  .on('mouseup', function(e) {
    $this.off('mousemove').off('mouseup');
  });
  return false;
}

function resizeNS($this, $target, y) {
  var options = {},
    offset = $this[0].offsetTop;

  if ($target.hasClass('resize-1')) {
    options.y = y - offset + $target.parent()[0].offsetHeight;
  }
  else {
    options.y = y - offset - $target.parent()[0].offsetHeight;
  }

  $this.on('mousemove', function(e) {
    var height = e.clientY - options.y - offset, css = {};

    if (height >= 0) {
      css.height = height;
    }
    else {
      css.top = e.clientY - offset;
      css.height = options.y - e.clientY + offset;
    }
    if ($target.parent().attr('data-type') === 'circle') {
      css.width = css.height;
    }

    $target.parent().css(css);
  })
  .on('mouseup', function(e) {
    $this.off('mousemove').off('mouseup');
  });
  return false;
}

function move($this, $target, e, callback, callbackend) {
  var from = {
    left: e.clientX - $target[0].offsetLeft,
    top: e.clientY - $target[0].offsetTop
  };

  var org = {
    left: $target[0].offsetLeft,
    top: $target[0].offsetTop
  };

  $target.find('.mce-link').addClass('mce-hide');

  $this.on('mousemove', function(e) {
    var pos = {
      top: e.clientY - from.top,
      left: e.clientX - from.left
    };

    $target.css(pos);

    if (callback) {
      callback($target, pos, org);
    }
  })
  .on('mouseup', function(e) {
    $this.off('mousemove').off('mouseup');

    if (callbackend) {
      callbackend($target, org);
    }

    $target.find('.mce-link').removeClass('mce-hide');
  });

  return false;
}

function create($this, $target, type, e) {
  var offset = $this[0].offsetTop,
    options = {
      x: e.clientX,
      y: e.clientY - offset
    },
    $div;

  $div = createArea({
    x: options.x,
    y: options.y,
    type: type,
    $to: $container
  });

  $this.on('mousemove', function(e) {
    var width = e.clientX - options.x,
      height = e.clientY - options.y - offset,
      css = {};

    if (type === 'circle') {
      width = height = Math.max(width, height);
    }

    if (width >= 0) {
      css.width = width;
    }
    else {
      css.left = e.clientX;
      css.width = options.x - e.clientX;
    }

    if (height >= 0) {
      css.height = height;
    }
    else {
      css.top = e.clientY - offset;
      css.height = options.y - e.clientY + offset;
    }

    $div.css(css);
  })
  .on('mouseup', function(e) {
    $this.off('mousemove').off('mouseup');
    if ($div[0].offsetWidth <= 15 || $div[0].offsetHeight <= 15) {
      $div.remove();
    }
  });

  return false;
}

function createPoly($this, $target, type, e) {
  var offset = $this[0].offsetTop,
    options = {
      x: e.clientX,
      y: e.clientY - offset
    },
    $div,
    dimensions, coords;

  $div = createArea({
    x: options.x,
    y: options.y,
    type: type,
    $to: $container
  });

  coords = [
    options.y, options.x,
    options.y, options.x + 60,
    options.y + 60, options.x + 80,
    options.y + 60, options.x + 20
  ];

  $div[0].coords = coords;

  $div.find('.mce-resize').each(function(i) {
    $$(this).css({
      top: coords[(i * 2) + 1],
      left: coords[i * 2]
    });
  });

  dimensions = dimensionsPoly(coords);
  renderPoly($div.find('canvas'), coords, dimensions);

  $this.on('mouseup', function(e) {
    $this.off('mouseup');
  });

  return false;
}