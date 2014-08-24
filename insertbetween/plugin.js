tinymce.PluginManager.add("insertbetween", function (editor, url) {
  var $$ = null;

  // init

  editor.on('PreInit', function () {
    var dom = editor.dom,
      body = editor.getBody(),
      offset;

    $$ = tinymce.dom.DomQuery;

    offset = {
      top: $$(editor.getContainer()).offset().top,
      left: $$(editor.getContainer()).offset().left
    };

    // show menu

    dom.bind(body, 'mouseover', function(e) {
      var node = e.target,
        menu, items,
        iframe = editor.iframeElement,
        top = iframe ? editor.getContentAreaContainer().offsetTop + offset.top - body.scrollTop : 0,
        left = iframe ? editor.getContentAreaContainer().offsetLeft + offset.left : 0;

      // links
      //if (config.link.is(node)) {

      //}
    });

  });

  // menu items

  editor.addMenuItem('insertbetween', {
    //icon: true,
    tooltip: 'insert',
    //image: url + '/img/link.png',
    onclick: function(e) {
      //editElement(e.target, 'mceLink');
    },
    context: 'insert',
    prependToContext: true
  });
});