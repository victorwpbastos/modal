/**
* @name Modal
* @version 1.0.0
* @author Victor Bastos <victorwpbastos@gmail.com>
* @license MIT
*/
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery')) :
	typeof define === 'function' && define.amd ? define(['jquery'], factory) :
	(global.Modal = factory(global.$));
}(this, (function ($) { 'use strict';

$ = 'default' in $ ? $['default'] : $;

/**
 * dp - default parameters
 * @type Object
 */
var dp = {
	alert: {
		header: '',
		body: '',
		onClose: function () {},
		closeOnEsc: true
	},

	confirm: {
		header: '',
		body: '',
		footer: "\n\t\t\t<button type=\"button\" class=\"btn btn-default btn-no\">{{btnNo}}</button>\n\t\t\t<button type=\"button\" class=\"btn btn-success btn-yes\">{{btnYes}}</button>\n\t\t",
		btnLabels: ['No', 'Yes'],
		showCloseButton: false,
		onClose: function () {},
		closeOnEsc: true
	},

	prompt: {
		header: '',
		body: "\n\t\t\t<input type=\"text\" class=\"form-control\"/>\n\t\t",
		footer: "\n\t\t\t<button type=\"button\" class=\"btn btn-success btn-confirm\">{{btnLabel}}</button>\n\t\t",
		btnLabel: 'Confirm',
		validate: null,
		showCloseButton: false,
		onClose: function () {},
		closeOnEsc: false
	}
};

/**
 * removeModal - cleanup function to:
 *
 * - remove modal and modal background
 * - remove modal events
 * - fix scrolls
 * - set active modal background
 *
 * @param  DOMElement modal
 * @return void
 */
function removeModal (modal) {
	$(("[data-modal=\"" + (modal.data('modal')) + "\"]")).remove();

	modal.off();
	$(document).off(("." + (modal.data('modal'))));

	fixScrolls(true);

	$('.modal-background[data-modal]:last').css('display', 'block');
	$('.modal[data-modal]:last').addClass('active-modal');
}

/**
 * setupModalEvent - setup modal events
 * @param  DOMElement    modal
 * @param  String        event
 * @param  String|Number
 * @param  Function      fn
 * @return void
 */
function setupModalEvent (modal, event, target, fn) {
	event = event + "." + (modal.data('modal'));

	if (event.indexOf('key') !== -1) {
		$(document).on(event, function (e) {
			if (e.keyCode === target) {
				if (modal.hasClass('active-modal')) {
					fn();
				}
			}
		});
	} else {
		modal.on(event, target, function () {
			if (modal.hasClass('active-modal')) {
				fn();
			}
		});
	}
}

/**
 * fixScrolls - fix scroll when using multiple Modals
 * @param  Boolean onClose
 * @return void
 */
function fixScrolls (onClose) {
	if ( onClose === void 0 ) onClose = false;

	var page = $('html');
	var pageScrollWidth = window.innerWidth - $(window).width();
	var modals = $('.modal[data-modal]');
	var activeModal = modals.last();

	/**
	 * if page has scroll:
	 *
	 * - hide scroll of the page
	 * - include a padding on the page to fullfill the scroll place
	 */
	if (pageScrollWidth > 0) {
		page.css({
			'overflow-y': 'hidden',
			'padding-right': pageScrollWidth
		});
	}

	// if the active modal has scroll, show it
	try {
		var modalScrollWidth = window.innerWidth - activeModal[0].clientWidth;

		if (modalScrollWidth > 0) {
			activeModal.attr('data-scroll-width', modalScrollWidth);
			activeModal.css('overflow', 'hidden');
		}

		// force reflow to adjust padding
		$('[data-scroll-width]').css('display', 'none').height();
		$('[data-scroll-width]').css('display', 'block');

		if (onClose) {
			if (activeModal.data('scroll-width')) {
				activeModal.css('padding-left', activeModal.data('scroll-width'));
				activeModal.css('overflow', 'auto');
			}
		}
	} catch (e) {}

	/**
	 * if all modals are closed:
	 *
	 * - hide scroll of the page
	 * - remove padding of the page
	 */
	if (modals.length === 0) {
		page.css({
			'overflow-y': '',
			'padding-right': ''
		});
	}
}

/**
 * fixFocus - fix focus to prevent focus outside Modals
 */
function fixFocus () {
	$('.active-modal').focus();
	$('.active-modal').find(':input').not('button').focus();
}

/**
 * createModal
 * @param  String     header
 * @param  DOMElement body
 * @param  DOMElement footer
 * @param  Boolean    showCloseButton
 * @return DOMElement
 */
function createModal (ref) {
	var header = ref.header;
	var body = ref.body;
	var footer = ref.footer;
	var showCloseButton = ref.showCloseButton; if ( showCloseButton === void 0 ) showCloseButton = true;

	var modalId = "modal-" + (Date.now());
	var modalBackground = $(("<div class=\"modal-background\" data-modal=\"" + modalId + "\"/>"));
	var modal = $(("\n\t\t<div class=\"modal\" tabindex=\"-1\" data-modal=\"" + modalId + "\">\n\t\t\t<div class=\"modal-dialog\">\n\t\t\t\t<div class=\"modal-content\">\n\t\t\t\t\t<div class=\"modal-header\"></div>\n\t\t\t\t\t<div class=\"modal-body\"></div>\n\t\t\t\t\t<div class=\"modal-footer\"></div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\t"));

	// base styling
	modal.css({
		'display'  : 'block',
		'position' : 'fixed',
		'top'      : '0',
		'right'    : '0',
		'bottom'   : '0',
		'left'     : '0',
		'overflow' : 'auto',
		'z-index'  : ("" + (1000 + $('.modal[data-modal]').length))
	});

	modal.find('.modal-dialog').css({
		'position'   : 'relative',
		'margin'     : '40px auto',
		'max-height' : 'calc(100vh - 40px)'
	});

	modalBackground.css({
		'position'   : 'fixed',
		'top'        : '0',
		'right'      : '0',
		'bottom'     : '0',
		'left'       : '0',
		'background' : '#000000',
		'opacity'    : '0.5',
		'z-index'  : ("" + (1000 + $('.modal-background[data-modal]').length))
	});

	// custom styling
	if (header) {
		modal.find('.modal-header').html(header);
	} else {
		modal.find('.modal-header').remove();
	}

	if (body) {
		modal.find('.modal-body').html(body);
	}

	if (footer) {
		modal.find('.modal-footer').html(footer);
	} else {
		modal.find('.modal-footer').remove();
	}

	if (showCloseButton) {
		if (header) {
			modal.find('.modal-header').append("\n\t\t\t\t<button type=\"button\" class=\"close\">&times;</button>\n\t\t\t");
		} else {
			modal.find('.modal-body').prepend("\n\t\t\t\t<div>\n\t\t\t\t\t&nbsp;\n\t\t\t\t\t<button type=\"button\" class=\"close\">&times;</button>\n\t\t\t\t</div>\n\t\t\t");
		}
	}

	if (!header && !body && !footer) {
		modal.find('.modal-content').empty();
	}

	if ($('.modal-background[data-modal]').length === 0) {
		$('body').append(modalBackground);
	}

	$('body').append([modalBackground, modal]);

	return modal;
}

/**
 * Modal constructor
 * @param  Object params
 * @return Modal
 */
function Modal (params) {
	if ( params === void 0 ) params = {};

	$('.modal-background').css('display', 'none');
	$('.modal[data-modal]').removeClass('active-modal');

	var modal = createModal(params);

	modal.addClass('active-modal');

	fixFocus();

	fixScrolls();

	return {
		element: modal,
		close: function close () {
			removeModal(modal);
			fixFocus();
		}
	};
}

/**
 * defaults - get the Modal default parameters
 * @return Object default parameters
 */
Modal.getDefaults = function () {
	return dp;
};

/**
 * setDefaults - set the Modal default parameters
 * @param Object params
 */
Modal.setDefaults = function (params) {
	if ( params === void 0 ) params = {};

	$.extend(true, dp, params);
}

/**
 * Alert Modal
 * @param  Object params
 * @return Modal decorated with alert behavior
 */
Modal.alert = function (params) {
	if ( params === void 0 ) params = {};

	try {
		params = $.extend({}, dp.alert, params);

		params.body = $.trim(params.body.replace(/&nbsp;/g, ''));

		if (params.body === '') {
			throw {
				name: 'Alert Modal',
				message: 'body can\'t be blank!'
			}
		}

		var modal = new Modal(params);

		function close () {
			modal.close();
			params.onClose();
		}

		setupModalEvent(modal.element, 'click', '.close', close);

		if (params.closeOnEsc) {
			setupModalEvent(modal.element, 'keyup', 27, close);
		}
	} catch (err) {
		console.error(((err.name) + ": " + (err.message)));
	}
};

/**
 * Confirm Modal
 * @param  Object params
 * @return Modal decorated with confirm behavior
 */
Modal.confirm = function (params) {
	if ( params === void 0 ) params = {};

	try {
		params = $.extend({}, dp.confirm, params);

		params.footer = params.footer.replace('{{btnNo}}', params.btnLabels[0]);
		params.footer = params.footer.replace('{{btnYes}}', params.btnLabels[1]);
		params.body = $.trim(params.body.replace(/&nbsp;/g, ''));

		if (params.body === '') {
			throw {
				name: 'Confirm Modal',
				message: 'body can\'t be blank!'
			}
		}

		var modal = new Modal(params);

		function close (response) {
			modal.close();
			params.onClose(response);
		}

		setupModalEvent(modal.element, 'click', '.modal-footer > .btn-yes', function () { return close(true); });
		setupModalEvent(modal.element, 'click', '.modal-footer > .btn-no', function () { return close(false); });

		if (params.showCloseButton) {
			setupModalEvent(modal.element, 'click', '.close', function () { return close(null); });
		}

		if (params.closeOnEsc) {
			setupModalEvent(modal.element, 'keyup', 27, function () { return close(false); });
		}
	} catch (err) {
		console.error(((err.name) + ": " + (err.message)));
	}
};

/**
 * Prompt Modal
 * @param  Object params
 * @return Modal decorated with prompt behavior
 */
Modal.prompt = function (params) {
	if ( params === void 0 ) params = {};

	try {
		params = $.extend({}, dp.prompt, params);

		params.body = $.trim(params.body.replace(/&nbsp;/g, ''));

		if (params.body === '') {
			throw {
				name: 'Prompt Modal',
				message: 'body can\'t be blank!'
			}
		}

		params.footer = params.footer.replace('{{btnLabel}}', params.btnLabel);
		params.body = $('<div class="form-group" style="margin-bottom:0" />').html(params.body);

		var fields = params.body.find(':input');
		var modal = new Modal(params);

		// validation
		if (params.validate) {
			fields.on('input change', function (e) {
				if (e.type === 'change' || params.body.hasClass('validated')) {
					if (modal.element.hasClass('active-modal')) {
						var message = params.validate(fields);

						params.body.removeClass('has-error').find('.validation-message').remove();

						if (message) {
							params.body.addClass('validated has-error').append(("\n\t\t\t\t\t\t\t\t<span class=\"help-block validation-message\" style=\"margin:0\">" + message + "</span>\n\t\t\t\t\t\t\t"));

							modal.element.find('.modal-footer > button').attr('disabled', true);
						} else {
							modal.element.find('.modal-footer > button').attr('disabled', false);
						}
					}
				}
			});

			// first validation
			if (params.validate(fields)) {
				modal.element.find('.modal-footer > button').attr('disabled', true);
			}
		}

		function close (withResponse) {
			if ( withResponse === void 0 ) withResponse = true;

			var response = fields.val();

			modal.close();

			// checkboxes
			if (fields.filter(':checkbox').length > 0) {
				response = fields.filter(':checked').map(function (i, f) { return f.value; }).toArray();
			}

			// radios
			if (fields.filter(':radio').length > 0) {
				response = fields.filter(':checked')[0].value;
			}

			if (withResponse) {
				params.onClose(response);
			} else {
				params.onClose(null);
			}
		}

		setupModalEvent(modal.element, 'click', '.modal-footer > .btn-confirm', function () { return close(true); });

		setupModalEvent(modal.element, 'keypress', 13, function () {
			modal.element.find('.modal-footer > .btn-confirm').trigger('click');
		});

		if (params.showCloseButton) {
			setupModalEvent(modal.element, 'click', '.close', function () { return close(false); });
		}

		if (params.closeOnEsc) {
			setupModalEvent(modal.element, 'keyup', 27, function () { return close(false); });
		}
	} catch (err) {
		console.error(((err.name) + ": " + (err.message)));
	}
};

return Modal;

})));
