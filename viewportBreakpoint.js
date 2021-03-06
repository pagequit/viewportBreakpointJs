/**
 * @author Christian Klihm
 * @license MIT
 */


/**
 * @namespace viewport
 * @param {object} viewport
 */
(function ( viewport ) {

	/** @var {object} */
	const breakpointObserver = {};

	/** @var {object} */
	const breakpoints = [];

	/** @var {Breakpoint} */
	let breakpointReference;

	/**
	 * @param {object} updateData
	 */
	function dispatchBreakpointCallbacks(updateData) {
		breakpoints.forEach(breakpoint => {
			if ( breakpoint.isActive() && breakpoint.callbacks.up.length > 0 ) {
				breakpoint.callbacks.up.forEach(callback => {
					callback(updateData);
				});
			}
			else if ( !breakpoint.isActive() && breakpoint.callbacks.down.length > 0 ) {
				breakpoint.callbacks.down.forEach(callback => {
					callback(updateData);
				});
			}
		});
	}

	function invokeDefaultNotifier() {
		viewport.notifyBreakpointObserver({
			passed: breakpointReference,
			current: viewport.Breakpoint.current,
		});
	}


	/**
	 * @constructor
	 * @param {string} key
	 * @param {number} width
	 */
	viewport.Breakpoint = function(key, width) {
		this.key = key;
		this.width = width;
		this.callbacks = {
			up: [],
			down: [],
		};
	};

	/**
	 * Defines a magic getter which returns the current breakpoint.
	 * @static
	 * @member {Breakpoint} current
	 */
	Object.defineProperty(viewport.Breakpoint, 'current', {
		get: () => breakpoints.find(breakpoint => breakpoint.isActive())
	});

	/**
	 * @returns {string}
	 */
	viewport.Breakpoint.prototype.toString = function() {
		return this.key;
	};

	/**
	 * @returns {boolean}
	 */
	viewport.Breakpoint.prototype.isActive = function() {
		return this.width <= window.innerWidth;
	};

	/**
	 * @static
	 * @param {function} callback
	 */
	viewport.Breakpoint.each = function(callback) {
		breakpoints.forEach(breakpoint => {
			callback(breakpoint);
		});
	};

	/**
	 * @static
	 * @param {Breakpoint} breakpoint
	 */
	viewport.Breakpoint.add = function(breakpoint) {
		if ( !(breakpoint instanceof viewport.Breakpoint) ) {
			throw `error: '${breakpoint}' is not an instance of viewport.Breakpoint`;
		}

		if ( this[breakpoint.key] !== undefined ) {
			throw `error: '${breakpoint.key}' already exists`;
		}

		this[breakpoint.key] = breakpoint;
		breakpoints.push(breakpoint);
		breakpoints.sort((a, b) => {
			const widthA = a.width;
			const widthB = b.width;

			if ( widthA < widthB ) {
				return 1;
			}

			if ( widthA > widthB ) {
				return -1;
			}

			return 0;
		});
	};

	/**
	 * @static
	 * @param {string} key
	 */
	viewport.Breakpoint.remove = function(key) {
		if ( !(this[key] instanceof viewport.Breakpoint) ) {
			throw `error: '${this[key]}' is not an instance of viewport.Breakpoint`;
		}

		delete this[key];
		const breakpoint = breakpoints.find(breakpoint => breakpoint.key === key);
		const index = breakpoints.indexOf(breakpoint);
		breakpoints.splice(index, 1);
	};

	/**
	 * @param {function} callback
	 * @param {string} name
	 */
	viewport.addBreakpointObserver = function(callback, name) {
		if ( typeof callback === 'function' ) {
			breakpointObserver[name] = callback;
			invokeDefaultNotifier();
		}
		else {
			throw `error: '${callback}' is not function`;
		}
	};

	/**
	 * @param {string} name
	 */
	viewport.removeBreakpointObserver = function(name) {
		delete breakpointObserver[name];
	};

	/**
	 * @param {object} updateData
	 * @example
	 * {
	 * 	current: { key: "xs", width: 1, callbacks: {…} }
	 * 	passed: { key: "sm", width: 576, callbacks: {…} }
	 * }
	 */
	viewport.notifyBreakpointObserver = function(updateData) {
		for ( const callback in breakpointObserver ) {
			breakpointObserver[callback](updateData);
		}
	};

	/**
	 * @param {string} breakpointKey
	 * @param {function} callback
	 */
	viewport.up = function(breakpointKey, callback) {
		if ( !(typeof callback === 'function') ) {
			throw `error: '${callback}' is not function`;
		}

		if ( !(this.Breakpoint[breakpointKey] instanceof viewport.Breakpoint) ) {
			throw `error: '${this.Breakpoint[breakpointKey]}' is not an instance of viewport.Breakpoint`;
		}

		const breakpoint = this.Breakpoint[breakpointKey];

		breakpoint.callbacks.up.push(callback);
		if ( breakpoint.isActive() ) {
			callback({
				passed: breakpointReference,
				current: viewport.Breakpoint.current,
			});
		}
	};

	/**
	 * @param {string} breakpointKey
	 * @param {function} callback
	 */
	viewport.down = function(breakpointKey, callback) {
		if ( !(typeof callback === 'function') ) {
			throw `error: '${callback}' is not function`;
		}

		if ( !(this.Breakpoint[breakpointKey] instanceof viewport.Breakpoint) ) {
			throw `error: '${this.Breakpoint[breakpointKey]}' is not an instance of viewport.Breakpoint`;
		}

		const breakpoint = this.Breakpoint[breakpointKey];

		breakpoint.callbacks.down.push(callback);
		if ( !(breakpoint.isActive()) ) {
			callback({
				passed: breakpointReference,
				current: viewport.Breakpoint.current,
			});
		}
	};


	viewport.init = function(breakpoints) {
		if ( breakpoints.length < 1 ) {
			throw 'error: you have to commit a least one breakpoint for initialization';
		}

		breakpoints.forEach(breakpoint => this.Breakpoint.add(breakpoint));

		breakpointReference = this.Breakpoint.current;

		window.addEventListener('resize', () => {
			if ( breakpointReference != viewport.Breakpoint.current ) {
				invokeDefaultNotifier();
				breakpointReference = viewport.Breakpoint.current;
			}
		});

		viewport.addBreakpointObserver(
			dispatchBreakpointCallbacks,
			'dispatchBreakpointCallbacks'
		);

		invokeDefaultNotifier();
	};

})( window.viewport = window.viewport || {} );