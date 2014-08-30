'use strict';

/**
 * myindent tinymce plugin
 *
 * @author Marcin Sołtysiuk
 * @version 1.0b
 * @copyright Copyright 2014, Marcin Sołtysiuk
 * Released under LGPL License.
 *
 * @requires tinymce
 */

tinymce.PluginManager.add('myindent', function(editor) {
  var dom = tinymce.dom,
    _trim = tinymce.trim,

    // extend plugin settings
    options = tinymce.extend({
      'filter': 'p,div,cite,code,td,pre,h1,h2,h3,h4,h5,h6,h7,figure,section,article,aside',
      'class' : 'indent-'
    }, editor.settings.indent),

    // tinymce indentation settings
    config = editor.settings.indentation;

  /**
   * Init plugin in editor
   */
  editor.on('PreInit', function() {
    var i, ruleStyle = 'padding-left: ',
      styles, isStyle, currentStyle,
      classes, isClass, currentClass,
      // get current plugin configuration
      prefixIndent = options.class,
      // get tinymce indentation number value from configuration
      paddingNumber = parseInt(config.match(/(\d*)(\w*)/)[1]),
      // get tinymce indentation string value from configuration
      paddingValue = config.match(/(\d*)(\w*)/)[2],
      // reqexp to match indent class
      reqExpClasses = new RegExp(prefixIndent + '(\\d)'),
      // reqexp to match indent style
      reqExpStyles = new RegExp(ruleStyle + '(\\d*)\\w*'),

      /**
       * Method get indentation class
       * @param {integer} value indentation value from style attribute
       */
      getIndentClass = function(value) {
        return prefixIndent + (parseInt(value) / paddingNumber);
      },
      /**
       * Method get indentation class
       * @param {integer} value indentation value from style attribute
       */
      getIndentStyle = function(value) {
        return ruleStyle + (parseInt(value) * paddingNumber) + paddingValue;
      };

    /**
     * Event toggle between Indent and Outdent command,
     * depending on if SHIFT is pressed
     * @event keydown
     */
    dom.DomQuery(editor.getBody()).on('keydown', function(e) {
      if (e.keyCode === 9 && !e.altKey && !e.ctrlKey) {
        editor.execCommand(e.shiftKey ? 'Outdent' : 'Indent');
        return dom.Event.cancel(e);
      }
    });

    /**
     * Filter node by selectors and replace indent class to style
     * @param {string} selectors which will be parsed, multiple use comma
     */
    editor.parser.addNodeFilter(options.filter, function(nodes) {
      i = nodes.length;

      while (i--) {
        classes = nodes[i].attr('class');
        // ex. [indent-, 2]
        isClass = classes && classes.match(reqExpClasses);

        if (!isClass) {
          continue;
        }

        currentClass = [prefixIndent, isClass[1]].join('');

        nodes[i].attr('style', [
          getIndentStyle(isClass[1]),
          nodes[i].attr('style') // existing styles
        ].join(';'));

        nodes[i].attr('class', _trim(classes.replace(currentClass, '')) || null);
      }
    });

    /**
     * Filter node by attributes and replace indent style to class
     * @param {string} attribute
     */
    editor.serializer.addAttributeFilter('style', function(nodes) {
      i = nodes.length;

      while (i--) {
        styles = nodes[i].attr('style');
        // ex. [padding-left:, 3]
        isStyle = styles && styles.match(reqExpStyles);

        if (!isStyle) {
          continue;
        }

        currentStyle = [ruleStyle, isStyle[1], paddingValue, ';'].join('');

        nodes[i].attr('class', [
          getIndentClass(isStyle[1]),
          nodes[i].attr('class') // existing classes
        ].join(' '));

        nodes[i].attr('style', _trim(styles.replace(currentStyle, '')) || null);
      }
    });
  });
});