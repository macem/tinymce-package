'use strict';

/**
 * fastedit tinymce plugin
 *
 * @author Marcin Sołtysiuk
 * @version 1.0b
 * @copyright Copyright 2014, Marcin Sołtysiuk
 * Released under LGPL License.
 *
 * @requires tinymce
 */

tinymce.PluginManager.add('fastedit', function (editor, url) {
  var $$ = null;

  // init

  editor.on('PreInit', function () {
    var dom = editor.dom,
      linkCss = dom.create('link', {
        id: dom.uniqueId(),
        rel: 'stylesheet',
        href: url + '/css/fastedit.css'
      }),
      HEIGHT = 25,
      body = editor.getBody(),
      offset,
      // extend plugin setting
      settings = tinymce.extend({
        media: {
          menu: [
            editor.menuItems['fastmedia'],
            editor.menuItems['fastimagelink'],
            editor.menuItems['fastshow'],
            editor.menuItems['fastremove']
          ],
          filter: function(node) {
            return settings.media.menu;
          },
          removeCommand: 'mceRemoveNode',
          is: function(node) {
            return node.nodeName === 'IMG' && node.getAttribute('data-mce-object');
          },
          left: function(node) {
            return $$(node).offset().left;
          },
          top: function(node) {
            return $$(node).offset().top + (node.offsetHeight < 35 ? node.offsetHeight : 0);
          }
        },
        image: {
          menu: [
            editor.menuItems['fastimage'],
            editor.menuItems['fastimagelink'],
            editor.menuItems['fastshow'],
            editor.menuItems['fastremove']
          ],
          filter: function(node) {
            /*var items;

            if (node.getAttribute('data-mce-object')) {
              items = [editor.menuItems['fastmedia']];
            }
            else {
              items = [editor.menuItems['fastimage']];
            }

            if (node.parentNode.tagName === 'A') {
              items.push(editor.menuItems['fastimagelink']);
            }

            items.push(editor.menuItems['fastshow']);
            items.push(editor.menuItems['fastremove']);*/

            return settings.image.menu;
          },
          removeCommand: 'mceRemoveNode',
          is: function(node) {
            return node.nodeName === 'IMG' && !node.getAttribute('data-mce-object')/*!node.getAttribute('data-mce-placeholder')*/;
          },
          left: function(node) {
            return $$(node).offset().left;
          },
          top: function(node) {
            return $$(node).offset().top + (node.offsetHeight < 35 ? node.offsetHeight : 0);
          }
        },
        link: {
          menu: [
            editor.menuItems['fastlink'],
            editor.menuItems['fastshow'],
            editor.menuItems['fastremove']
          ],
          filter: function() {
            return tinymce.extend(settings.link.menu);
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
          filter: function() {
            return [
              editor.menuItems['fasttable'],
              editor.menuItems['fastremove']
            ];
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
      }, editor.settings.fastedit),
      queue = [];

    $$ = tinymce.dom.DomQuery;

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
      var node = e.target, menu,
        iframe = editor.iframeElement,
        top = iframe ? editor.getContentAreaContainer().offsetTop + offset.top - body.scrollTop : 0,
        left = iframe ? editor.getContentAreaContainer().offsetLeft + offset.left : 0;

      // links
      if (settings.link.is(node)) {
        removeItems();

        menu = new tinymce.ui.Menu({
          items: settings.link.filter(node),
          context: 'contextmenu'
        })
        .addClass('toolbar-fast').renderTo();

        menu.show();
        menu.moveTo(settings.link.left(node) + left, settings.link.top(node) + top);

        menu.getEl().store = {
          node: node,
          removeCommand: settings.link.removeCommand
        };

        queue.push(menu);
      }
      // media
      else if (settings.media.is(node)) {
        removeItems();

        menu = new tinymce.ui.Menu({
          items: settings.media.filter(node),
          context: 'contextmenu'
        })
        .addClass('toolbar-fast').renderTo();

        menu.show();
        menu.moveTo(settings.media.left(node) + left, settings.media.top(node) + top);

        menu.getEl().store = {
          node: node,
          removeCommand: settings.media.removeCommand
        };

        menu.node = node;

        queue.push(menu);
      }
      // images
      else if (settings.image.is(node)) {
        removeItems();

        menu = new tinymce.ui.Menu({
          items: settings.image.filter(node),
          context: 'contextmenu'
        })
        .addClass('toolbar-fast').renderTo();

        menu.show();
        menu.moveTo(settings.image.left(node) + left, settings.image.top(node) + top);

        menu.getEl().store = {
          node: node,
          removeCommand: settings.image.removeCommand
        };

        console.log('-', menu, menu.getEl());

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
          items: settings.table.filter($table[0]),
          context: 'contextmenu'
        })
        .addClass('toolbar-fast').renderTo();

        menu.show();
        menu.moveTo(settings.table.left($table[0]) + left, settings.table.top($table[0]) + top);

        menu.getEl().store = {
          node: $table[0],
          removeCommand: settings.table.removeCommand
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

/*editor.addMenuItem('column', {
      text: 'Column',
      context: 'table',
      menu: [
        {text: 'Insert column before', onclick: cmd('mceTableInsertColBefore'), onPostRender: postRenderCell},
        {text: 'Insert column after', onclick: cmd('mceTableInsertColAfter'), onPostRender: postRenderCell},
        {text: 'Delete column', onclick: cmd('mceTableDeleteCol'), onPostRender: postRenderCell}
      ]
    });  */

  editor.addMenuItem('fastlabel', {
    icon: false,
    tooltip: 'edit link',
    //image: url + '/img/link.png',
    onclick: function(e) {
      editElement(e.target, 'mceLink');
    },
    context: 'insert',
    prependToContext: true
  });

  editor.addMenuItem('fastlink', {
    icon: 'fastlink',
    tooltip: 'edit link',
    //image: url + '/img/link.png',
    onclick: function(e) {
      editElement(e.target, 'mceLink');
    },
    context: 'insert',
    prependToContext: true
  });

  editor.addMenuItem('fastimage', {
    icon: 'fastimage',
    tooltip: 'edit image',
    onclick: function(e) {
      editElement(e.target, 'mceImage');
    },
    context: 'insert',
    prependToContext: true
  });

  editor.addMenuItem('fastimagelink', {
    icon: 'fastlink',
    tooltip: 'edit link',
    onPostRender: function(e) {
      var menu = tinymce.DOM.get(this.rootControl._id);
      //if (node.parentNode.tagName === 'A') {
        //this.disabled(node.parentNode.tagName !== 'A');
        //items.push(editor.menuItems['fastimagelink']);
      //}
      console.log('--', this, menu);
    },
    onclick: function(e) {
      editElement(e.target.parentNode, 'mceLink');
    },
    context: 'insert',
    prependToContext: true
  });

  editor.addMenuItem('fasttable', {
    icon: 'fasttable',
    onclick: function(e) {
      editElement(e.target, 'mceTableProps');
    },
    context: 'insert',
    prependToContext: true
  });

  editor.addMenuItem('fastmedia', {
    icon: 'fastmedia',
    tooltip: 'edit media',
    onclick: function(e) {
      editElement(e.target, 'mceMedia');
    },
    context: 'insert',
    prependToContext: true
  });

  editor.addMenuItem('fastshow', {
    icon: 'fastshow',
    tooltip: 'in new window',
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
    icon: 'fastremove',
    tooltip: 'remove',
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