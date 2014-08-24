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

tinymce.PluginManager.add('mytemplate', function(editor, url) {
	var each = tinymce.each;

	function showDialog(templateList) {
		var win, values = [], templateHtml;

    // Simple default dialog
    win = editor.windowManager.open({
      title: 'Select template',
      width: '770px',
      height: '610px',
      inline: true,
      url: url + '/modal.html',
      buttons: [{
        text: 'Close',
        onclick: 'close'
      }]
    }, {});
	}

	/*function getDateTime(fmt, date) {
		var daysShort = "Sun Mon Tue Wed Thu Fri Sat Sun".split(' ');
		var daysLong = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday Sunday".split(' ');
		var monthsShort = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(' ');
		var monthsLong = "January February March April May June July August September October November December".split(' ');

		function addZeros(value, len) {
			value = "" + value;

			if (value.length < len) {
				for (var i = 0; i < (len - value.length); i++) {
					value = "0" + value;
				}
			}

			return value;
		}

		date = date || new Date();

		fmt = fmt.replace("%D", "%m/%d/%Y");
		fmt = fmt.replace("%r", "%I:%M:%S %p");
		fmt = fmt.replace("%Y", "" + date.getFullYear());
		fmt = fmt.replace("%y", "" + date.getYear());
		fmt = fmt.replace("%m", addZeros(date.getMonth() + 1, 2));
		fmt = fmt.replace("%d", addZeros(date.getDate(), 2));
		fmt = fmt.replace("%H", "" + addZeros(date.getHours(), 2));
		fmt = fmt.replace("%M", "" + addZeros(date.getMinutes(), 2));
		fmt = fmt.replace("%S", "" + addZeros(date.getSeconds(), 2));
		fmt = fmt.replace("%I", "" + ((date.getHours() + 11) % 12 + 1));
		fmt = fmt.replace("%p", "" + (date.getHours() < 12 ? "AM" : "PM"));
		fmt = fmt.replace("%B", "" + editor.translate(monthsLong[date.getMonth()]));
		fmt = fmt.replace("%b", "" + editor.translate(monthsShort[date.getMonth()]));
		fmt = fmt.replace("%A", "" + editor.translate(daysLong[date.getDay()]));
		fmt = fmt.replace("%a", "" + editor.translate(daysShort[date.getDay()]));
		fmt = fmt.replace("%%", "%");

		return fmt;
	}

	function replaceVals(e) {
		var dom = editor.dom, vl = editor.getParam('template_replace_values');

		each(dom.select('*', e), function(e) {
			each(vl, function(v, k) {
				if (dom.hasClass(e, k)) {
					if (typeof(vl[k]) == 'function') {
						vl[k](e);
					}
				}
			});
		});
	}

	function replaceTemplateValues(html, templateValuesOptionName) {
		each(editor.getParam(templateValuesOptionName), function(v, k) {
			if (typeof(v) != 'function') {
				html = html.replace(new RegExp('\\{\\$' + k + '\\}', 'g'), v);
			}
		});

		return html;
	}

	function insertTemplate(ui, html) {
		var el, n, dom = editor.dom, sel = editor.selection.getContent();

		html = replaceTemplateValues(html, 'template_replace_values');
		el = dom.create('div', null, html);

		// Find template element within div
		n = dom.select('.mceTmpl', el);
		if (n && n.length > 0) {
			el = dom.create('div', null);
			el.appendChild(n[0].cloneNode(true));
		}

		function hasClass(n, c) {
			return new RegExp('\\b' + c + '\\b', 'g').test(n.className);
		}

		each(dom.select('*', el), function(n) {
			// Replace cdate
			if (hasClass(n, editor.getParam('template_cdate_classes', 'cdate').replace(/\s+/g, '|'))) {
				n.innerHTML = getDateTime(editor.getParam("template_cdate_format", editor.getLang("template.cdate_format")));
			}

			// Replace mdate
			if (hasClass(n, editor.getParam('template_mdate_classes', 'mdate').replace(/\s+/g, '|'))) {
				n.innerHTML = getDateTime(editor.getParam("template_mdate_format", editor.getLang("template.mdate_format")));
			}

			// Replace selection
			if (hasClass(n, editor.getParam('template_selected_content_classes', 'selcontent').replace(/\s+/g, '|'))) {
				n.innerHTML = sel;
			}
		});

		replaceVals(el);

		editor.execCommand('mceInsertContent', false, el.innerHTML);
		editor.addVisual();
	}*/

	//editor.addCommand('mceInsertTemplate', insertTemplate);

	editor.addButton('mytemplate', {
		title: 'Insert template',
		onclick: showDialog
	});

	editor.addMenuItem('mytemplate', {
		text: 'Insert template',
		onclick: showDialog,
		context: 'insert'
	});

	/*editor.on('PreProcess', function(o) {
		var dom = editor.dom;

		each(dom.select('div', o.node), function(e) {
			if (dom.hasClass(e, 'mceTmpl')) {
				each(dom.select('*', e), function(e) {
					if (dom.hasClass(e, editor.getParam('template_mdate_classes', 'mdate').replace(/\s+/g, '|'))) {
						e.innerHTML = getDateTime(editor.getParam("template_mdate_format", editor.getLang("template.mdate_format")));
					}
				});

				replaceVals(e);
			}
		});
	});*/
});