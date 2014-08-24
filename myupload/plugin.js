tinymce.PluginManager.add("upload", function (editor, url) {
  var body, $body, $parent, hasfiles,
    $$ = tinymce.dom.DomQuery,
    CLASS = 'mce-upload',
    CLASSES = 'mce-throbber mce-state-progress mce-file-';

  // editor.uploadWait - status of uploading
  // editor.uploadQueue - array of uploading requests

  editor.on('PreInit', function () {
    body = editor.getBody() || editor.bodyElement;
    $body = $$(body);

    // when drag files
    $$(document.body)
    .on('dragenter', function(e) {
      $parent = $$(e.target).parents('.mce-content-body');
      if ($parent.length && hasfiles > 0) {
        $parent.addClass(CLASS);
      }
    })
    .on('dragleave', function(e) {
      $parent = $$(e.target).parents('.mce-content-body');
      if (!$$(e.target).hasClass('mce-content-body') && !$parent.length && hasfiles > 0) {
        $body.removeClass(CLASS);
      }
      // when we drag over browser or to browser elements
      this.timeout = setTimeout(function() {
        clearTimeout(this.timeout);
        $body.removeClass(CLASS);
      }, 2000);
    });
  })

  // on remove editor
  .on('remove', function(e) {
    $$(document.body)
      .off('dragenter')
      .off('dragleave');
  })
  .on('dragover', function(e) {
    hasfiles = Editor.containsFiles(e);

    if (hasfiles > 0) {
      $body.addClass(CLASS);
    }
  })
  // TODO check if working
  .on('dragend', function(e) {
    $body.removeClass(CLASS);
  })

  // on drop editor
  .on('drop', function(e) {
    var files = e.dataTransfer.files,
      range = null;

    editor.uploadQueue = [];

    if (files.length && editor.settings.inline === true) {
      $body.removeClass(CLASS);
      Editor._setRange(editor, e);

      //editor.setProgressState(true);

      function removeQueue(item) {
        var i = editor.uploadQueue.indexOf(item);

        if (i != -1) {
          editor.uploadQueue.splice(i, 1);
        }

        if (editor.uploadQueue.length === 0) {
          editor.undoManager.add();
          editor.isNotDirty = false;
          editor.nodeChanged();
          editor.uploadWait = false;
        }
      }

      function uploadFile(file, node, type, index) {
        var fd, response;

        editor.selection.setNode(node);
        fd = new FormData();
        fd.append('document', file);
        fd.append('overwritingForced', true);
        response = Editor.sendFileToServer(fd, editor, file, '.mce-file-' + index, type);
        response.done(function() {
          removeQueue(response);
        })
        .fail(function() {
          removeQueue(response);
        });

        editor.uploadQueue.push(response);
      }

      Object.keys(files).forEach(function(i) {
        // support image
        if (files[i] && files[i].type && files[i].type.match('image.*')) {
          var reader = new FileReader(),
            range = editor.selection.getRng(),
            $newNode;

          reader.onload = function(e) {
            $newNode = $$('<img/>').attr({
              src: e.target.result,
              'class': CLASSES + i,
              alt: ''
            });

            editor.uploadWait = true;
            uploadFile(files[i], $newNode[0], 'photo', i);
          };
          reader.readAsDataURL(files[i]);
        }
        // support documents
        else if (files[i] && files[i].type && files[i].type.match('application.*')) {
          $newNode = $$('<hr/>').attr({
            title: 'uploading document...',
            'class': CLASSES + i,
          });

          editor.uploadWait = true;
          uploadFile(files[i], $newNode[0], 'document', i);
        }
        // support video
        else if (files[i] && files[i].type && files[i].type.match('video.*')) {
          $newNode = $$('<hr/>').attr({
            title: 'uploading video...',
            'class': CLASSES + i,
          });

          editor.uploadWait = true;
          uploadFile(files[i], $newNode[0], 'video', i);
        }
        // support audio
        else if (files[i] && files[i].type && files[i].type.match('audio.*')) {
          $newNode = $$('hr/>').attr({
            title: 'uploading audio...',
            'class': CLASSES + i,
          });

          editor.uploadWait = true;
          uploadFile(files[i], $newNode[0], 'audio', i);
        }
      });

      e.preventDefault();
    }
    return true;
  });
});