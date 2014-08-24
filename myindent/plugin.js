/**
 * plugin.js
 *
 * Copyright, Marcin Sołtysiuk
 * Released under LGPL License.
 */

/*global tinymce:true */

tinymce.PluginManager.add('myindent', function(editor) {

  // toggle between Indent and Outdent command, depending on if SHIFT is pressed
  tinymce.dom.DomQuery(editor.targetElm).on('keydown', function(e) {
    if (e.keyCode === 9 && !e.altKey && !e.ctrlKey) {
      if (e.shiftKey) {
        editor.execCommand('Outdent');
      }
      else {
        editor.execCommand('Indent');
      }
      return tinymce.dom.Event.cancel(e);
    }
  });

  editor.on('PreInit', function (ed) {
    var $$ = tinymce.dom.DomQuery,
      i, node, style, classes, has,
      padding = 'padding-left: ';
      indentClasses = editor.settings.indent.classes;
      paddingSetting = editor.settings.indentation.match(/(\d*)(\w*)/);

    // replace class to style
    editor.parser.addNodeFilter(editor.settings.indent.selector, function(nodes, name) {
      i = nodes.length;

      while (i--) {
        node = nodes[i];
        classes = node.attr('class');

        if (!classes) {
          continue;
        }

        has = classes.match(new RegExp(indentClasses + '(\\d)'));
        if (!(has instanceof Array)) {
          continue;
        }

        node.attr('style', 'padding-left: ' + (parseInt(has[1]) * parseInt(paddingSetting[1])) + paddingSetting[2]);

        if (classes === indentClasses + has[1]) {
          node.attr('class', null);
        }
        else {
          node.attr('class', classes.replace(indentClasses + has[1], ''));
        }
      }
    });

    // replace indent tags to classes
    editor.serializer.addAttributeFilter('style', function(nodes, name) {
      i = nodes.length;

      while (i--) {
        node = nodes[i];
        style = node.attr('style');

        if (!style) {
          continue;
        }

        has = style.match(new RegExp(padding + '(\\d*)\w*'));

        if (!(has instanceof Array)) {
          continue;
        }

        node.attr('class', indentClasses + (parseInt(has[1]) / parseInt(paddingSetting[1])));

        if (style === padding + has[1] + paddingSetting[2] + ';') {
          node.attr('style', null);
        }
        else {
          node.attr('style', style.replace(padding + has[1] + paddingSetting[2], '') + ';');
        }
      }
    });
  });
});