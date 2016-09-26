import $ from 'jquery';

/**
 * dp - default parameters
 * @type Object
 */
let dp = {
	alert: {
		header: '',
		body: '',
		onClose: () => {},
		closeOnEsc: true
	},

	confirm: {
		header: '',
		body: '',
		footer: `
			<button type="button" class="btn btn-default btn-no">{{btnNo}}</button>
			<button type="button" class="btn btn-success btn-yes">{{btnYes}}</button>
		`,
		btnLabels: ['No', 'Yes'],
		showCloseButton: false,
		onClose: () => {},
		closeOnEsc: true
	},

	prompt: {
		header: '',
		body: `
			<input type="text" class="form-control"/>
		`,
		footer: `
			<button type="button" class="btn btn-success btn-confirm">{{btnLabel}}</button>
		`,
		btnLabel: 'Confirm',
		validate: null,
		showCloseButton: false,
		onClose: () => {},
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
	$(`[data-modal="${modal.data('modal')}"]`).remove();

	modal.off();
	$(document).off(`.${modal.data('modal')}`);

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
	event = `${event}.${modal.data('modal')}`;

	if (event.indexOf('key') !== -1) {
		$(document).on(event, (e) => {
			if (e.keyCode === target) {
				if (modal.hasClass('active-modal')) {
					fn();
				}
			}
		});
	} else {
		modal.on(event, target, () => {
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
function fixScrolls (onClose = false) {
	let page = $('html');
	let pageScrollWidth = window.innerWidth - $(window).width();
	let modals = $('.modal[data-modal]');
	let activeModal = modals.last();

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
		let modalScrollWidth = window.innerWidth - activeModal[0].clientWidth;

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
function createModal ({ header, body, footer, showCloseButton = true }) {
	let modalId = `modal-${Date.now()}`;
	let modalBackground = $(`<div class="modal-background" data-modal="${modalId}"/>`);
	let modal = $(`
		<div class="modal" tabindex="-1" data-modal="${modalId}">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header"></div>
					<div class="modal-body"></div>
					<div class="modal-footer"></div>
				</div>
			</div>
		</div>
	`);

	// base styling
	modal.css({
		'display'  : 'block',
		'position' : 'fixed',
		'top'      : '0',
		'right'    : '0',
		'bottom'   : '0',
		'left'     : '0',
		'overflow' : 'auto',
		'z-index'  : `${1000 + $('.modal[data-modal]').length}`
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
		'z-index'  : `${1000 + $('.modal-background[data-modal]').length}`
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
			modal.find('.modal-header').append(`
				<button type="button" class="close">&times;</button>
			`);
		} else {
			modal.find('.modal-body').prepend(`
				<div>
					&nbsp;
					<button type="button" class="close">&times;</button>
				</div>
			`);
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
function Modal (params = {}) {
	$('.modal-background').css('display', 'none');
	$('.modal[data-modal]').removeClass('active-modal');

	let modal = createModal(params);

	modal.addClass('active-modal');

	fixFocus();

	fixScrolls();

	return {
		element: modal,
		close () {
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
Modal.setDefaults = function (params = {}) {
	$.extend(true, dp, params);
}

/**
 * Alert Modal
 * @param  Object params
 * @return Modal decorated with alert behavior
 */
Modal.alert = function (params = {}) {
	try {
		params = $.extend({}, dp.alert, params);

		params.body = $.trim(params.body.replace(/&nbsp;/g, ''));

		if (params.body === '') {
			throw {
				name: 'Alert Modal',
				message: 'body can\'t be blank!'
			}
		}

		let modal = new Modal(params);

		function close () {
			modal.close();
			params.onClose();
		}

		setupModalEvent(modal.element, 'click', '.close', close);

		if (params.closeOnEsc) {
			setupModalEvent(modal.element, 'keyup', 27, close);
		}
	} catch (err) {
		console.error(`${err.name}: ${err.message}`);
	}
};

/**
 * Confirm Modal
 * @param  Object params
 * @return Modal decorated with confirm behavior
 */
Modal.confirm = function (params = {}) {
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

		let modal = new Modal(params);

		function close (response) {
			modal.close();
			params.onClose(response);
		}

		setupModalEvent(modal.element, 'click', '.modal-footer > .btn-yes', () => close(true));
		setupModalEvent(modal.element, 'click', '.modal-footer > .btn-no', () => close(false));

		if (params.showCloseButton) {
			setupModalEvent(modal.element, 'click', '.close', () => close(null));
		}

		if (params.closeOnEsc) {
			setupModalEvent(modal.element, 'keyup', 27, () => close(false));
		}
	} catch (err) {
		console.error(`${err.name}: ${err.message}`);
	}
};

/**
 * Prompt Modal
 * @param  Object params
 * @return Modal decorated with prompt behavior
 */
Modal.prompt = function (params = {}) {
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

		let fields = params.body.find(':input');
		let modal = new Modal(params);

		// validation
		if (params.validate) {
			fields.on('input change', (e) => {
				if (e.type === 'change' || params.body.hasClass('validated')) {
					if (modal.element.hasClass('active-modal')) {
						let message = params.validate(fields);

						params.body.removeClass('has-error').find('.validation-message').remove();

						if (message) {
							params.body.addClass('validated has-error').append(`
								<span class="help-block validation-message" style="margin:0">${message}</span>
							`);

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

		function close (withResponse = true) {
			let response = fields.val();

			modal.close();

			// checkboxes
			if (fields.filter(':checkbox').length > 0) {
				response = fields.filter(':checked').map((i, f) => f.value).toArray();
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

		setupModalEvent(modal.element, 'click', '.modal-footer > .btn-confirm', () => close(true));

		setupModalEvent(modal.element, 'keypress', 13, () => {
			modal.element.find('.modal-footer > .btn-confirm').trigger('click');
		});

		if (params.showCloseButton) {
			setupModalEvent(modal.element, 'click', '.close', () => close(false));
		}

		if (params.closeOnEsc) {
			setupModalEvent(modal.element, 'keyup', 27, () => close(false));
		}
	} catch (err) {
		console.error(`${err.name}: ${err.message}`);
	}
};

export default Modal;