tinymce.PluginManager.add("fastedit", function (editor, url) {
  var $$ = null;

  // init

  editor.on('PreInit', function () {
    var dom = editor.dom,
      cssId = dom.uniqueId(),
      linkCss = dom.create('link', {
        id: cssId,
        rel: 'stylesheet',
        href: url + '/css/fastedit.css'
      }),
      HEIGHT = 25,
      body = editor.getBody(),
      offset,
      config = {
        image: {
          items: function(node) {
            if (node.getAttribute('data-mce-object')) {
              var items = [editor.menuItems['fastmedia']];
            }
            else {
              var items = [editor.menuItems['fastimage']];
            }

            if (node.parentNode.tagName === 'A') {
              items.push(editor.menuItems['fastimagelink']);
            }

            items.push(editor.menuItems['fastshow']);
            items.push(editor.menuItems['fastremove']);

            return items;
          },
          removeCommand: 'mceRemoveNode',
          is: function(node) {
            return node.nodeName === 'IMG' && !node.getAttribute('data-mce-placeholder');
          },
          left: function(node) {
            return $$(node).offset().left;
          },
          top: function(node) {
            return $$(node).offset().top + (node.offsetHeight < 35 ? node.offsetHeight : 0);
          }
        },
        link: {
          items: function(node) {
            return [
              editor.menuItems['fastlink'],
              editor.menuItems['fastshow'],
              editor.menuItems['fastremove']
            ]
          },
          removeCommand: 'mceRemoveNode',
          is: function(node) {
            return node.nodeName === 'A' && node.getAttribute('data-mce-href') && !$$(node).find('img').length;
          },
          left: function(node) {
            return $$(node).offset().left;
          },
          top: function(node) {
            return $$(node).offset().top + node.offsetHeight;
          }
        },
        table: {
          items: function(node) {
            return [
              editor.menuItems['fasttable'],
              editor.menuItems['fastremove']
            ]
          },
          removeCommand: 'mceTableDelete',
          is: function(node) {
            return node.nodeName === 'A' && node.getAttribute('data-mce-href');
          },
          left: function(node) {
            return $$(node).offset().left;
          },
          top: function(node) {
            return $$(node).offset().top - HEIGHT;
          }
        }
      },
      queue = [];

    $$ = tinymce.dom.DomQuery,

    offset = {
      top: $$(editor.getContainer()).offset().top,
      left: $$(editor.getContainer()).offset().left
    };

    //editor.getDoc()
    document.getElementsByTagName('head')[0].appendChild(linkCss);

    // remove menu

    function removeItems() {
      queue.forEach(function(item) {
        item.remove();
      });
    }

    editor.on('remove', function() {
      removeItems();
      $$(linkCss).remove();
    });

    // show menu

    dom.bind(body, 'mouseover', function(e) {
      var node = e.target,
        menu, items,
        iframe = editor.iframeElement,
        top = iframe ? editor.getContentAreaContainer().offsetTop + offset.top - body.scrollTop : 0,
        left = iframe ? editor.getContentAreaContainer().offsetLeft + offset.left : 0/*,
        tinymeEl = node.className.indexOf('mce-')*/;

      // links
      if (config.link.is(node)/* && tinymeEl === -1*/) {
        removeItems();

        menu = new tinymce.ui.Menu({
          items: config.link.items(node),
          context: 'contextmenu'
        })
        .addClass('toolbar-fast').renderTo();

        menu.show();
        menu.moveTo(config.link.left(node) + left, config.link.top(node) + top);

        menu.getEl().store = {
          node: node,
          removeCommand: config.link.removeCommand
        };

        queue.push(menu);
      }
      // images and media
      else if (config.image.is(node)/* && tinymeEl === -1*/) {
        removeItems();

        menu = new tinymce.ui.Menu({
          items: config.image.items(node),
          context: 'contextmenu'
        })
        .addClass('toolbar-fast').renderTo();

        menu.show();
        menu.moveTo(config.image.left(node) + left, config.image.top(node) + top);

        menu.getEl().store = {
          node: node,
          removeCommand: config.image.removeCommand
        };

        queue.push(menu);
      }
      // remove toolbar
      else {
        removeItems();
      }

      var $table = $$(node).parents('table');
      // table
      if ($table.length) {

        menu = new tinymce.ui.Menu({
          items: config.table.items($table[0]),
          context: 'contextmenu'
        })
        .addClass('toolbar-fast').renderTo();

        menu.show();
        menu.moveTo(config.table.left($table[0]) + left, config.table.top($table[0]) + top);

        menu.getEl().store = {
          node: $table[0],
          removeCommand: config.table.removeCommand
        };

        queue.push(menu);
      }
    });
  });

  // open modal to edit element

  function getStore(target) {
    return $$(target).parents('.mce-toolbar-fast')[0].store;
  }

  function editElement(target, command) {
    var store = getStore(target);

    if (store.node) {
      editor.selection.select(store.node);
      editor.undoManager.transact(function() {
        editor.execCommand(command, true);
      });
    }
  }

  // menu items

  editor.addMenuItem('fastlink', {
    icon: true,
    tooltip: 'edit link',
    image: url + '/img/link.png',
    onclick: function(e) {
      editElement(e.target, 'mceLink');
    },
    context: 'insert',
    prependToContext: true
  });

  editor.addMenuItem('fastimage', {
    icon: true,
    tooltip: 'edit image',
    image: url + '/img/image.png',
    onclick: function(e) {
      editElement(e.target, 'mceImage');
    },
    context: 'insert',
    prependToContext: true
  });

  editor.addMenuItem('fastimagelink', {
    icon: true,
    tooltip: 'edit link',
    image: url + '/img/link.png',
    onclick: function(e) {
      editElement(e.target.parentNode, 'mceLink');
    },
    context: 'insert',
    prependToContext: true
  });

  editor.addMenuItem('fasttable', {
    icon: true,
    tooltip: 'edit table',
    image: url + '/img/table.png',
    onclick: function(e) {
      editElement(e.target, 'mceTableProps');
    },
    context: 'insert',
    prependToContext: true
  });

  editor.addMenuItem('fastmedia', {
    icon: true,
    tooltip: 'edit media',
    image: url + '/img/media.png',
    onclick: function(e) {
      editElement(e.target, 'mceMedia');
    },
    context: 'insert',
    prependToContext: true
  });

  editor.addMenuItem('fastshow', {
    icon: true,
    tooltip: 'in new window',
    image: url + '/img/show.png',
    onclick: function(e) {
      var store = getStore(e.target);

      if (store.node) {
        window.open(
          store.node.href || store.node.src,
          '_blank'
        );
      }
    },
    context: 'insert',
    prependToContext: true
  });

  editor.addMenuItem('fastremove', {
    icon: true,
    tooltip: 'remove',
    image: url + '/img/remove.png',
    onclick: function(e) {
      var store = getStore(e.target);

      if (store.node) {
        editor.selection.select(store.node);
        editor.execCommand(store.removeCommand);
      }
    },
    context: 'insert',
    prependToContext: true
  });
});