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

tinymce.PluginManager.add('mysave', function(editor) {
  function save() {
    var formObj, content;

    formObj = tinymce.DOM.getParent(editor.id, 'form');

    // not dirty
    if (editor.getParam("save_enablewhendirty", true) && !editor.isDirty()) {
      return;
    }

    // update content
    editor.save();

    // Use callback instead
    if (editor.getParam("save_onsavecallback")) {
      editor.isNotDirty = false; // bug

      if (editor.execCallback('save_onsavecallback', editor)) {
        editor.undoManager.add();
        content = tinymce.trim(editor.getContent());
        editor.setContent(content);
        editor.isNotDirty = true;
        editor.nodeChanged();
      }

      return;
    }

    // if form exists
    if (formObj) {
      editor.isNotDirty = true;

      if (editor.settings.inline !== true && (!formObj.onsubmit || formObj.onsubmit())) {
        if (typeof(formObj.submit) === "function") {
          formObj.submit();
        }
        else {
          editor.windowManager.alert("Error: Form submit field collision.");
        }
      }

      editor.nodeChanged();
    }
    else {
      editor.windowManager.alert("Error: No form element found.");
    }
  }

  function cancel() {
    var content = tinymce.trim(editor.startContent);

    // Use callback instead
    if (editor.getParam("save_oncancelcallback")) {
      editor.execCallback('save_oncancelcallback', editor);
      return;
    }

    editor.setContent(content);
    editor.undoManager.clear();
    editor.nodeChanged();
  }

  function stateToggle() {
    var self = this;

    editor.on('nodeChange', function() {
      if (!editor.undoManager.hasUndo()) {
        editor.isNotDirty = true;
      }
      self.disabled(editor.getParam("save_enablewhendirty", true) && !editor.isDirty());
    });
  }

  editor.addCommand('mceSave', save);
  editor.addCommand('mceCancel', cancel);

  editor.addButton('mysave', {
    icon: 'save',
    text: 'Save',
    cmd: 'mceSave',
    disabled: true,
    onPostRender: stateToggle
  });

  editor.addButton('mycancel', {
    text: 'Close',
    icon: false,
    cmd: 'mceCancel'
  });

  editor.addShortcut('ctrl+s', '', 'mceSave');
});
