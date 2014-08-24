/**
 * plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('code', function(editor, url) {
  function showDialog() {
    var win = editor.windowManager.open({
      title: "Source code",
      width: '900px',
      height: '710px',
      inline: true,
      url: url + '/modal.html',
      /*body: {
        type: 'textbox',
        name: 'code',
        multiline: true,
        minWidth: editor.getParam("code_dialog_width", 600),
        minHeight: editor.getParam("code_dialog_height", Math.min(tinymce.DOM.getViewPort().h - 200, 500)),
        spellcheck: false,
        style: 'direction: ltr; text-align: left'
      },*/
      onSubmit: function(e) {
        // We get a lovely "Wrong document" error in IE 11 if we
        // don't move the focus to the editor before creating an undo
        // transation since it tries to make a bookmark for the current selection
        editor.focus();

        editor.undoManager.transact(function() {
          //editor.setContent(e.data.code);
        });

        editor.selection.setCursorLocation();
        editor.nodeChanged();
      }
    }, {
      data: editor.getContent({source_view: true})
    });

    // Gecko has a major performance issue with textarea
    // contents so we need to set it when all reflows are done
    //win.find('#code').value(editor.getContent({source_view: true}));
  }

  editor.addCommand("mceCodeEditor", showDialog);

  editor.addButton('code', {
    icon: 'code',
    tooltip: 'Source code',
    onclick: showDialog
  });

  editor.addMenuItem('code', {
    icon: 'code',
    text: 'Source code',
    context: 'tools',
    onclick: showDialog
  });
});