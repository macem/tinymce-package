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

tinymce.PluginManager.add('myhelp', function(editor, url) {

  function showDialog() {
    var win, dom = editor.dom;

    // Simple default dialog
    win = editor.windowManager.open({
      title: 'Help',
      width: '500px',
      height: '600px',
      inline: true,
      url: url + '/modal.html',
      buttons: [{
        text: 'Close',
        onclick: 'close'
      }]
    });
  }

  editor.addButton('myhelp', {
    icon: 'help',
    text: false,
    tooltip: 'user help [Ctrl+/]',
    onclick: showDialog
  });

  editor.on('keydown', function(e) {
    if (e.ctrlKey && !e.altKey && !e.shiftKey && e.keyCode === 191) { // 'ctrl+/'
      showDialog();
    }
  });
});