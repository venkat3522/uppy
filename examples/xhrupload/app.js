(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * cuid.js
 * Collision-resistant UID generator for browsers and node.
 * Sequential for fast db lookups and recency sorting.
 * Safe for element IDs and server-side lookups.
 *
 * Extracted from CLCTR
 *
 * Copyright (c) Eric Elliott 2012
 * MIT License
 */

var fingerprint = require('./lib/fingerprint.js');
var pad = require('./lib/pad.js');
var getRandomValue = require('./lib/getRandomValue.js');

var c = 0,
  blockSize = 4,
  base = 36,
  discreteValues = Math.pow(base, blockSize);

function randomBlock () {
  return pad((getRandomValue() *
    discreteValues << 0)
    .toString(base), blockSize);
}

function safeCounter () {
  c = c < discreteValues ? c : 0;
  c++; // this is not subliminal
  return c - 1;
}

function cuid () {
  // Starting with a lowercase letter makes
  // it HTML element ID friendly.
  var letter = 'c', // hard-coded allows for sequential access

    // timestamp
    // warning: this exposes the exact date and time
    // that the uid was created.
    timestamp = (new Date().getTime()).toString(base),

    // Prevent same-machine collisions.
    counter = pad(safeCounter().toString(base), blockSize),

    // A few chars to generate distinct ids for different
    // clients (so different computers are far less
    // likely to generate the same id)
    print = fingerprint(),

    // Grab some more chars from Math.random()
    random = randomBlock() + randomBlock();

  return letter + timestamp + counter + print + random;
}

cuid.slug = function slug () {
  var date = new Date().getTime().toString(36),
    counter = safeCounter().toString(36).slice(-4),
    print = fingerprint().slice(0, 1) +
      fingerprint().slice(-1),
    random = randomBlock().slice(-2);

  return date.slice(-2) +
    counter + print + random;
};

cuid.isCuid = function isCuid (stringToCheck) {
  if (typeof stringToCheck !== 'string') return false;
  if (stringToCheck.startsWith('c')) return true;
  return false;
};

cuid.isSlug = function isSlug (stringToCheck) {
  if (typeof stringToCheck !== 'string') return false;
  var stringLength = stringToCheck.length;
  if (stringLength >= 7 && stringLength <= 10) return true;
  return false;
};

cuid.fingerprint = fingerprint;

module.exports = cuid;

},{"./lib/fingerprint.js":2,"./lib/getRandomValue.js":3,"./lib/pad.js":4}],2:[function(require,module,exports){
var pad = require('./pad.js');

var env = typeof window === 'object' ? window : self;
var globalCount = Object.keys(env).length;
var mimeTypesLength = navigator.mimeTypes ? navigator.mimeTypes.length : 0;
var clientId = pad((mimeTypesLength +
  navigator.userAgent.length).toString(36) +
  globalCount.toString(36), 4);

module.exports = function fingerprint () {
  return clientId;
};

},{"./pad.js":4}],3:[function(require,module,exports){

var getRandomValue;

var crypto = window.crypto || window.msCrypto;

if (crypto) {
    var lim = Math.pow(2, 32) - 1;
    getRandomValue = function () {
        return Math.abs(crypto.getRandomValues(new Uint32Array(1))[0] / lim);
    };
} else {
    getRandomValue = Math.random;
}

module.exports = getRandomValue;

},{}],4:[function(require,module,exports){
module.exports = function pad (num, size) {
  var s = '000000000' + num;
  return s.substr(s.length - size);
};

},{}],5:[function(require,module,exports){
// This file can be required in Browserify and Node.js for automatic polyfill
// To use it:  require('es6-promise/auto');
'use strict';
module.exports = require('./').polyfill();

},{"./":6}],6:[function(require,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   v4.2.5+7f2b526d
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.ES6Promise = factory());
}(this, (function () { 'use strict';

function objectOrFunction(x) {
  var type = typeof x;
  return x !== null && (type === 'object' || type === 'function');
}

function isFunction(x) {
  return typeof x === 'function';
}



var _isArray = void 0;
if (Array.isArray) {
  _isArray = Array.isArray;
} else {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
}

var isArray = _isArray;

var len = 0;
var vertxNext = void 0;
var customSchedulerFn = void 0;

var asap = function asap(callback, arg) {
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 2, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    if (customSchedulerFn) {
      customSchedulerFn(flush);
    } else {
      scheduleFlush();
    }
  }
};

function setScheduler(scheduleFn) {
  customSchedulerFn = scheduleFn;
}

function setAsap(asapFn) {
  asap = asapFn;
}

var browserWindow = typeof window !== 'undefined' ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
  // see https://github.com/cujojs/when/issues/410 for details
  return function () {
    return process.nextTick(flush);
  };
}

// vertx
function useVertxTimer() {
  if (typeof vertxNext !== 'undefined') {
    return function () {
      vertxNext(flush);
    };
  }

  return useSetTimeout();
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function () {
    node.data = iterations = ++iterations % 2;
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    return channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  // Store setTimeout reference so es6-promise will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var globalSetTimeout = setTimeout;
  return function () {
    return globalSetTimeout(flush, 1);
  };
}

var queue = new Array(1000);
function flush() {
  for (var i = 0; i < len; i += 2) {
    var callback = queue[i];
    var arg = queue[i + 1];

    callback(arg);

    queue[i] = undefined;
    queue[i + 1] = undefined;
  }

  len = 0;
}

function attemptVertx() {
  try {
    var vertx = Function('return this')().require('vertx');
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush = void 0;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && typeof require === 'function') {
  scheduleFlush = attemptVertx();
} else {
  scheduleFlush = useSetTimeout();
}

function then(onFulfillment, onRejection) {
  var parent = this;

  var child = new this.constructor(noop);

  if (child[PROMISE_ID] === undefined) {
    makePromise(child);
  }

  var _state = parent._state;


  if (_state) {
    var callback = arguments[_state - 1];
    asap(function () {
      return invokeCallback(_state, child, callback, parent._result);
    });
  } else {
    subscribe(parent, child, onFulfillment, onRejection);
  }

  return child;
}

/**
  `Promise.resolve` returns a promise that will become resolved with the
  passed `value`. It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @static
  @param {Any} value value that the returned promise will be resolved with
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve$1(object) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop);
  resolve(promise, object);
  return promise;
}

var PROMISE_ID = Math.random().toString(36).substring(2);

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

var TRY_CATCH_ERROR = { error: null };

function selfFulfillment() {
  return new TypeError("You cannot resolve a promise with itself");
}

function cannotReturnOwn() {
  return new TypeError('A promises callback cannot return that same promise.');
}

function getThen(promise) {
  try {
    return promise.then;
  } catch (error) {
    TRY_CATCH_ERROR.error = error;
    return TRY_CATCH_ERROR;
  }
}

function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
  try {
    then$$1.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then$$1) {
  asap(function (promise) {
    var sealed = false;
    var error = tryThen(then$$1, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        resolve(promise, value);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      return resolve(promise, value);
    }, function (reason) {
      return reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable, then$$1) {
  if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
    handleOwnThenable(promise, maybeThenable);
  } else {
    if (then$$1 === TRY_CATCH_ERROR) {
      reject(promise, TRY_CATCH_ERROR.error);
      TRY_CATCH_ERROR.error = null;
    } else if (then$$1 === undefined) {
      fulfill(promise, maybeThenable);
    } else if (isFunction(then$$1)) {
      handleForeignThenable(promise, maybeThenable, then$$1);
    } else {
      fulfill(promise, maybeThenable);
    }
  }
}

function resolve(promise, value) {
  if (promise === value) {
    reject(promise, selfFulfillment());
  } else if (objectOrFunction(value)) {
    handleMaybeThenable(promise, value, getThen(value));
  } else {
    fulfill(promise, value);
  }
}

function publishRejection(promise) {
  if (promise._onerror) {
    promise._onerror(promise._result);
  }

  publish(promise);
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) {
    return;
  }

  promise._result = value;
  promise._state = FULFILLED;

  if (promise._subscribers.length !== 0) {
    asap(publish, promise);
  }
}

function reject(promise, reason) {
  if (promise._state !== PENDING) {
    return;
  }
  promise._state = REJECTED;
  promise._result = reason;

  asap(publishRejection, promise);
}

function subscribe(parent, child, onFulfillment, onRejection) {
  var _subscribers = parent._subscribers;
  var length = _subscribers.length;


  parent._onerror = null;

  _subscribers[length] = child;
  _subscribers[length + FULFILLED] = onFulfillment;
  _subscribers[length + REJECTED] = onRejection;

  if (length === 0 && parent._state) {
    asap(publish, parent);
  }
}

function publish(promise) {
  var subscribers = promise._subscribers;
  var settled = promise._state;

  if (subscribers.length === 0) {
    return;
  }

  var child = void 0,
      callback = void 0,
      detail = promise._result;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    if (child) {
      invokeCallback(settled, child, callback, detail);
    } else {
      callback(detail);
    }
  }

  promise._subscribers.length = 0;
}

function tryCatch(callback, detail) {
  try {
    return callback(detail);
  } catch (e) {
    TRY_CATCH_ERROR.error = e;
    return TRY_CATCH_ERROR;
  }
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value = void 0,
      error = void 0,
      succeeded = void 0,
      failed = void 0;

  if (hasCallback) {
    value = tryCatch(callback, detail);

    if (value === TRY_CATCH_ERROR) {
      failed = true;
      error = value.error;
      value.error = null;
    } else {
      succeeded = true;
    }

    if (promise === value) {
      reject(promise, cannotReturnOwn());
      return;
    }
  } else {
    value = detail;
    succeeded = true;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && succeeded) {
    resolve(promise, value);
  } else if (failed) {
    reject(promise, error);
  } else if (settled === FULFILLED) {
    fulfill(promise, value);
  } else if (settled === REJECTED) {
    reject(promise, value);
  }
}

function initializePromise(promise, resolver) {
  try {
    resolver(function resolvePromise(value) {
      resolve(promise, value);
    }, function rejectPromise(reason) {
      reject(promise, reason);
    });
  } catch (e) {
    reject(promise, e);
  }
}

var id = 0;
function nextId() {
  return id++;
}

function makePromise(promise) {
  promise[PROMISE_ID] = id++;
  promise._state = undefined;
  promise._result = undefined;
  promise._subscribers = [];
}

function validationError() {
  return new Error('Array Methods must be provided an Array');
}

var Enumerator = function () {
  function Enumerator(Constructor, input) {
    this._instanceConstructor = Constructor;
    this.promise = new Constructor(noop);

    if (!this.promise[PROMISE_ID]) {
      makePromise(this.promise);
    }

    if (isArray(input)) {
      this.length = input.length;
      this._remaining = input.length;

      this._result = new Array(this.length);

      if (this.length === 0) {
        fulfill(this.promise, this._result);
      } else {
        this.length = this.length || 0;
        this._enumerate(input);
        if (this._remaining === 0) {
          fulfill(this.promise, this._result);
        }
      }
    } else {
      reject(this.promise, validationError());
    }
  }

  Enumerator.prototype._enumerate = function _enumerate(input) {
    for (var i = 0; this._state === PENDING && i < input.length; i++) {
      this._eachEntry(input[i], i);
    }
  };

  Enumerator.prototype._eachEntry = function _eachEntry(entry, i) {
    var c = this._instanceConstructor;
    var resolve$$1 = c.resolve;


    if (resolve$$1 === resolve$1) {
      var _then = getThen(entry);

      if (_then === then && entry._state !== PENDING) {
        this._settledAt(entry._state, i, entry._result);
      } else if (typeof _then !== 'function') {
        this._remaining--;
        this._result[i] = entry;
      } else if (c === Promise$1) {
        var promise = new c(noop);
        handleMaybeThenable(promise, entry, _then);
        this._willSettleAt(promise, i);
      } else {
        this._willSettleAt(new c(function (resolve$$1) {
          return resolve$$1(entry);
        }), i);
      }
    } else {
      this._willSettleAt(resolve$$1(entry), i);
    }
  };

  Enumerator.prototype._settledAt = function _settledAt(state, i, value) {
    var promise = this.promise;


    if (promise._state === PENDING) {
      this._remaining--;

      if (state === REJECTED) {
        reject(promise, value);
      } else {
        this._result[i] = value;
      }
    }

    if (this._remaining === 0) {
      fulfill(promise, this._result);
    }
  };

  Enumerator.prototype._willSettleAt = function _willSettleAt(promise, i) {
    var enumerator = this;

    subscribe(promise, undefined, function (value) {
      return enumerator._settledAt(FULFILLED, i, value);
    }, function (reason) {
      return enumerator._settledAt(REJECTED, i, reason);
    });
  };

  return Enumerator;
}();

/**
  `Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = resolve(2);
  let promise3 = resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = reject(new Error("2"));
  let promise3 = reject(new Error("3"));
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/
function all(entries) {
  return new Enumerator(this, entries).promise;
}

/**
  `Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
  ```

  `Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} promises array of promises to observe
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/
function race(entries) {
  /*jshint validthis:true */
  var Constructor = this;

  if (!isArray(entries)) {
    return new Constructor(function (_, reject) {
      return reject(new TypeError('You must pass an array to race.'));
    });
  } else {
    return new Constructor(function (resolve, reject) {
      var length = entries.length;
      for (var i = 0; i < length; i++) {
        Constructor.resolve(entries[i]).then(resolve, reject);
      }
    });
  }
}

/**
  `Promise.reject` returns a promise rejected with the passed `reason`.
  It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @static
  @param {Any} reason value that the returned promise will be rejected with.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/
function reject$1(reason) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(noop);
  reject(promise, reason);
  return promise;
}

function needsResolver() {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew() {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}

/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise's eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class Promise
  @param {Function} resolver
  Useful for tooling.
  @constructor
*/

var Promise$1 = function () {
  function Promise(resolver) {
    this[PROMISE_ID] = nextId();
    this._result = this._state = undefined;
    this._subscribers = [];

    if (noop !== resolver) {
      typeof resolver !== 'function' && needsResolver();
      this instanceof Promise ? initializePromise(this, resolver) : needsNew();
    }
  }

  /**
  The primary way of interacting with a promise is through its `then` method,
  which registers callbacks to receive either a promise's eventual value or the
  reason why the promise cannot be fulfilled.
   ```js
  findUser().then(function(user){
    // user is available
  }, function(reason){
    // user is unavailable, and you are given the reason why
  });
  ```
   Chaining
  --------
   The return value of `then` is itself a promise.  This second, 'downstream'
  promise is resolved with the return value of the first promise's fulfillment
  or rejection handler, or rejected if the handler throws an exception.
   ```js
  findUser().then(function (user) {
    return user.name;
  }, function (reason) {
    return 'default name';
  }).then(function (userName) {
    // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
    // will be `'default name'`
  });
   findUser().then(function (user) {
    throw new Error('Found user, but still unhappy');
  }, function (reason) {
    throw new Error('`findUser` rejected and we're unhappy');
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
    // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
  });
  ```
  If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
   ```js
  findUser().then(function (user) {
    throw new PedagogicalException('Upstream error');
  }).then(function (value) {
    // never reached
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // The `PedgagocialException` is propagated all the way down to here
  });
  ```
   Assimilation
  ------------
   Sometimes the value you want to propagate to a downstream promise can only be
  retrieved asynchronously. This can be achieved by returning a promise in the
  fulfillment or rejection handler. The downstream promise will then be pending
  until the returned promise is settled. This is called *assimilation*.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // The user's comments are now available
  });
  ```
   If the assimliated promise rejects, then the downstream promise will also reject.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // If `findCommentsByAuthor` fulfills, we'll have the value here
  }, function (reason) {
    // If `findCommentsByAuthor` rejects, we'll have the reason here
  });
  ```
   Simple Example
  --------------
   Synchronous Example
   ```javascript
  let result;
   try {
    result = findResult();
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
  findResult(function(result, err){
    if (err) {
      // failure
    } else {
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findResult().then(function(result){
    // success
  }, function(reason){
    // failure
  });
  ```
   Advanced Example
  --------------
   Synchronous Example
   ```javascript
  let author, books;
   try {
    author = findAuthor();
    books  = findBooksByAuthor(author);
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
   function foundBooks(books) {
   }
   function failure(reason) {
   }
   findAuthor(function(author, err){
    if (err) {
      failure(err);
      // failure
    } else {
      try {
        findBoooksByAuthor(author, function(books, err) {
          if (err) {
            failure(err);
          } else {
            try {
              foundBooks(books);
            } catch(reason) {
              failure(reason);
            }
          }
        });
      } catch(error) {
        failure(err);
      }
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findAuthor().
    then(findBooksByAuthor).
    then(function(books){
      // found books
  }).catch(function(reason){
    // something went wrong
  });
  ```
   @method then
  @param {Function} onFulfilled
  @param {Function} onRejected
  Useful for tooling.
  @return {Promise}
  */

  /**
  `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
  as the catch block of a try/catch statement.
  ```js
  function findAuthor(){
  throw new Error('couldn't find that author');
  }
  // synchronous
  try {
  findAuthor();
  } catch(reason) {
  // something went wrong
  }
  // async with promises
  findAuthor().catch(function(reason){
  // something went wrong
  });
  ```
  @method catch
  @param {Function} onRejection
  Useful for tooling.
  @return {Promise}
  */


  Promise.prototype.catch = function _catch(onRejection) {
    return this.then(null, onRejection);
  };

  /**
    `finally` will be invoked regardless of the promise's fate just as native
    try/catch/finally behaves
  
    Synchronous example:
  
    ```js
    findAuthor() {
      if (Math.random() > 0.5) {
        throw new Error();
      }
      return new Author();
    }
  
    try {
      return findAuthor(); // succeed or fail
    } catch(error) {
      return findOtherAuther();
    } finally {
      // always runs
      // doesn't affect the return value
    }
    ```
  
    Asynchronous example:
  
    ```js
    findAuthor().catch(function(reason){
      return findOtherAuther();
    }).finally(function(){
      // author was either found, or not
    });
    ```
  
    @method finally
    @param {Function} callback
    @return {Promise}
  */


  Promise.prototype.finally = function _finally(callback) {
    var promise = this;
    var constructor = promise.constructor;

    if (isFunction(callback)) {
      return promise.then(function (value) {
        return constructor.resolve(callback()).then(function () {
          return value;
        });
      }, function (reason) {
        return constructor.resolve(callback()).then(function () {
          throw reason;
        });
      });
    }

    return promise.then(callback, callback);
  };

  return Promise;
}();

Promise$1.prototype.then = then;
Promise$1.all = all;
Promise$1.race = race;
Promise$1.resolve = resolve$1;
Promise$1.reject = reject$1;
Promise$1._setScheduler = setScheduler;
Promise$1._setAsap = setAsap;
Promise$1._asap = asap;

/*global self*/
function polyfill() {
  var local = void 0;

  if (typeof global !== 'undefined') {
    local = global;
  } else if (typeof self !== 'undefined') {
    local = self;
  } else {
    try {
      local = Function('return this')();
    } catch (e) {
      throw new Error('polyfill failed because global object is unavailable in this environment');
    }
  }

  var P = local.Promise;

  if (P) {
    var promiseToString = null;
    try {
      promiseToString = Object.prototype.toString.call(P.resolve());
    } catch (e) {
      // silently ignored
    }

    if (promiseToString === '[object Promise]' && !P.cast) {
      return;
    }
  }

  local.Promise = Promise$1;
}

// Strange compat..
Promise$1.polyfill = polyfill;
Promise$1.Promise = Promise$1;

return Promise$1;

})));





}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":40}],7:[function(require,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root.Date.now();
};

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds. The throttled function comes with a `cancel`
 * method to cancel delayed `func` invocations and a `flush` method to
 * immediately invoke them. Provide `options` to indicate whether `func`
 * should be invoked on the leading and/or trailing edge of the `wait`
 * timeout. The `func` is invoked with the last arguments provided to the
 * throttled function. Subsequent calls to the throttled function return the
 * result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the throttled function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.throttle` and `_.debounce`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to throttle.
 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=true]
 *  Specify invoking on the leading edge of the timeout.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // Avoid excessively updating the position while scrolling.
 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
 *
 * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
 * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
 * jQuery(element).on('click', throttled);
 *
 * // Cancel the trailing throttled invocation.
 * jQuery(window).on('popstate', throttled.cancel);
 */
function throttle(func, wait, options) {
  var leading = true,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, {
    'leading': leading,
    'maxWait': wait,
    'trailing': trailing
  });
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = throttle;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],8:[function(require,module,exports){
var wildcard = require('wildcard');
var reMimePartSplit = /[\/\+\.]/;

/**
  # mime-match

  A simple function to checker whether a target mime type matches a mime-type
  pattern (e.g. image/jpeg matches image/jpeg OR image/*).

  ## Example Usage

  <<< example.js

**/
module.exports = function(target, pattern) {
  function test(pattern) {
    var result = wildcard(pattern, target, reMimePartSplit);

    // ensure that we have a valid mime type (should have two parts)
    return result && result.length >= 2;
  }

  return pattern ? test(pattern.split(';')[0]) : test;
};

},{"wildcard":13}],9:[function(require,module,exports){
/**
* Create an event emitter with namespaces
* @name createNamespaceEmitter
* @example
* var emitter = require('./index')()
*
* emitter.on('*', function () {
*   console.log('all events emitted', this.event)
* })
*
* emitter.on('example', function () {
*   console.log('example event emitted')
* })
*/
module.exports = function createNamespaceEmitter () {
  var emitter = {}
  var _fns = emitter._fns = {}

  /**
  * Emit an event. Optionally namespace the event. Handlers are fired in the order in which they were added with exact matches taking precedence. Separate the namespace and event with a `:`
  * @name emit
  * @param {String} event – the name of the event, with optional namespace
  * @param {...*} data – up to 6 arguments that are passed to the event listener
  * @example
  * emitter.emit('example')
  * emitter.emit('demo:test')
  * emitter.emit('data', { example: true}, 'a string', 1)
  */
  emitter.emit = function emit (event, arg1, arg2, arg3, arg4, arg5, arg6) {
    var toEmit = getListeners(event)

    if (toEmit.length) {
      emitAll(event, toEmit, [arg1, arg2, arg3, arg4, arg5, arg6])
    }
  }

  /**
  * Create en event listener.
  * @name on
  * @param {String} event
  * @param {Function} fn
  * @example
  * emitter.on('example', function () {})
  * emitter.on('demo', function () {})
  */
  emitter.on = function on (event, fn) {
    if (!_fns[event]) {
      _fns[event] = []
    }

    _fns[event].push(fn)
  }

  /**
  * Create en event listener that fires once.
  * @name once
  * @param {String} event
  * @param {Function} fn
  * @example
  * emitter.once('example', function () {})
  * emitter.once('demo', function () {})
  */
  emitter.once = function once (event, fn) {
    function one () {
      fn.apply(this, arguments)
      emitter.off(event, one)
    }
    this.on(event, one)
  }

  /**
  * Stop listening to an event. Stop all listeners on an event by only passing the event name. Stop a single listener by passing that event handler as a callback.
  * You must be explicit about what will be unsubscribed: `emitter.off('demo')` will unsubscribe an `emitter.on('demo')` listener,
  * `emitter.off('demo:example')` will unsubscribe an `emitter.on('demo:example')` listener
  * @name off
  * @param {String} event
  * @param {Function} [fn] – the specific handler
  * @example
  * emitter.off('example')
  * emitter.off('demo', function () {})
  */
  emitter.off = function off (event, fn) {
    var keep = []

    if (event && fn) {
      var fns = this._fns[event]
      var i = 0
      var l = fns ? fns.length : 0

      for (i; i < l; i++) {
        if (fns[i] !== fn) {
          keep.push(fns[i])
        }
      }
    }

    keep.length ? this._fns[event] = keep : delete this._fns[event]
  }

  function getListeners (e) {
    var out = _fns[e] ? _fns[e] : []
    var idx = e.indexOf(':')
    var args = (idx === -1) ? [e] : [e.substring(0, idx), e.substring(idx + 1)]

    var keys = Object.keys(_fns)
    var i = 0
    var l = keys.length

    for (i; i < l; i++) {
      var key = keys[i]
      if (key === '*') {
        out = out.concat(_fns[key])
      }

      if (args.length === 2 && args[0] === key) {
        out = out.concat(_fns[key])
        break
      }
    }

    return out
  }

  function emitAll (e, fns, args) {
    var i = 0
    var l = fns.length

    for (i; i < l; i++) {
      if (!fns[i]) break
      fns[i].event = e
      fns[i].apply(fns[i], args)
    }
  }

  return emitter
}

},{}],10:[function(require,module,exports){
!function() {
    'use strict';
    function h(nodeName, attributes) {
        var lastSimple, child, simple, i, children = EMPTY_CHILDREN;
        for (i = arguments.length; i-- > 2; ) stack.push(arguments[i]);
        if (attributes && null != attributes.children) {
            if (!stack.length) stack.push(attributes.children);
            delete attributes.children;
        }
        while (stack.length) if ((child = stack.pop()) && void 0 !== child.pop) for (i = child.length; i--; ) stack.push(child[i]); else {
            if ('boolean' == typeof child) child = null;
            if (simple = 'function' != typeof nodeName) if (null == child) child = ''; else if ('number' == typeof child) child = String(child); else if ('string' != typeof child) simple = !1;
            if (simple && lastSimple) children[children.length - 1] += child; else if (children === EMPTY_CHILDREN) children = [ child ]; else children.push(child);
            lastSimple = simple;
        }
        var p = new VNode();
        p.nodeName = nodeName;
        p.children = children;
        p.attributes = null == attributes ? void 0 : attributes;
        p.key = null == attributes ? void 0 : attributes.key;
        if (void 0 !== options.vnode) options.vnode(p);
        return p;
    }
    function extend(obj, props) {
        for (var i in props) obj[i] = props[i];
        return obj;
    }
    function applyRef(ref, value) {
        if (null != ref) if ('function' == typeof ref) ref(value); else ref.current = value;
    }
    function cloneElement(vnode, props) {
        return h(vnode.nodeName, extend(extend({}, vnode.attributes), props), arguments.length > 2 ? [].slice.call(arguments, 2) : vnode.children);
    }
    function enqueueRender(component) {
        if (!component.__d && (component.__d = !0) && 1 == items.push(component)) (options.debounceRendering || defer)(rerender);
    }
    function rerender() {
        var p;
        while (p = items.pop()) if (p.__d) renderComponent(p);
    }
    function isSameNodeType(node, vnode, hydrating) {
        if ('string' == typeof vnode || 'number' == typeof vnode) return void 0 !== node.splitText;
        if ('string' == typeof vnode.nodeName) return !node._componentConstructor && isNamedNode(node, vnode.nodeName); else return hydrating || node._componentConstructor === vnode.nodeName;
    }
    function isNamedNode(node, nodeName) {
        return node.__n === nodeName || node.nodeName.toLowerCase() === nodeName.toLowerCase();
    }
    function getNodeProps(vnode) {
        var props = extend({}, vnode.attributes);
        props.children = vnode.children;
        var defaultProps = vnode.nodeName.defaultProps;
        if (void 0 !== defaultProps) for (var i in defaultProps) if (void 0 === props[i]) props[i] = defaultProps[i];
        return props;
    }
    function createNode(nodeName, isSvg) {
        var node = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName);
        node.__n = nodeName;
        return node;
    }
    function removeNode(node) {
        var parentNode = node.parentNode;
        if (parentNode) parentNode.removeChild(node);
    }
    function setAccessor(node, name, old, value, isSvg) {
        if ('className' === name) name = 'class';
        if ('key' === name) ; else if ('ref' === name) {
            applyRef(old, null);
            applyRef(value, node);
        } else if ('class' === name && !isSvg) node.className = value || ''; else if ('style' === name) {
            if (!value || 'string' == typeof value || 'string' == typeof old) node.style.cssText = value || '';
            if (value && 'object' == typeof value) {
                if ('string' != typeof old) for (var i in old) if (!(i in value)) node.style[i] = '';
                for (var i in value) node.style[i] = 'number' == typeof value[i] && !1 === IS_NON_DIMENSIONAL.test(i) ? value[i] + 'px' : value[i];
            }
        } else if ('dangerouslySetInnerHTML' === name) {
            if (value) node.innerHTML = value.__html || '';
        } else if ('o' == name[0] && 'n' == name[1]) {
            var useCapture = name !== (name = name.replace(/Capture$/, ''));
            name = name.toLowerCase().substring(2);
            if (value) {
                if (!old) node.addEventListener(name, eventProxy, useCapture);
            } else node.removeEventListener(name, eventProxy, useCapture);
            (node.__l || (node.__l = {}))[name] = value;
        } else if ('list' !== name && 'type' !== name && !isSvg && name in node) {
            try {
                node[name] = null == value ? '' : value;
            } catch (e) {}
            if ((null == value || !1 === value) && 'spellcheck' != name) node.removeAttribute(name);
        } else {
            var ns = isSvg && name !== (name = name.replace(/^xlink:?/, ''));
            if (null == value || !1 === value) if (ns) node.removeAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase()); else node.removeAttribute(name); else if ('function' != typeof value) if (ns) node.setAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase(), value); else node.setAttribute(name, value);
        }
    }
    function eventProxy(e) {
        return this.__l[e.type](options.event && options.event(e) || e);
    }
    function flushMounts() {
        var c;
        while (c = mounts.shift()) {
            if (options.afterMount) options.afterMount(c);
            if (c.componentDidMount) c.componentDidMount();
        }
    }
    function diff(dom, vnode, context, mountAll, parent, componentRoot) {
        if (!diffLevel++) {
            isSvgMode = null != parent && void 0 !== parent.ownerSVGElement;
            hydrating = null != dom && !('__preactattr_' in dom);
        }
        var ret = idiff(dom, vnode, context, mountAll, componentRoot);
        if (parent && ret.parentNode !== parent) parent.appendChild(ret);
        if (!--diffLevel) {
            hydrating = !1;
            if (!componentRoot) flushMounts();
        }
        return ret;
    }
    function idiff(dom, vnode, context, mountAll, componentRoot) {
        var out = dom, prevSvgMode = isSvgMode;
        if (null == vnode || 'boolean' == typeof vnode) vnode = '';
        if ('string' == typeof vnode || 'number' == typeof vnode) {
            if (dom && void 0 !== dom.splitText && dom.parentNode && (!dom._component || componentRoot)) {
                if (dom.nodeValue != vnode) dom.nodeValue = vnode;
            } else {
                out = document.createTextNode(vnode);
                if (dom) {
                    if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
                    recollectNodeTree(dom, !0);
                }
            }
            out.__preactattr_ = !0;
            return out;
        }
        var vnodeName = vnode.nodeName;
        if ('function' == typeof vnodeName) return buildComponentFromVNode(dom, vnode, context, mountAll);
        isSvgMode = 'svg' === vnodeName ? !0 : 'foreignObject' === vnodeName ? !1 : isSvgMode;
        vnodeName = String(vnodeName);
        if (!dom || !isNamedNode(dom, vnodeName)) {
            out = createNode(vnodeName, isSvgMode);
            if (dom) {
                while (dom.firstChild) out.appendChild(dom.firstChild);
                if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
                recollectNodeTree(dom, !0);
            }
        }
        var fc = out.firstChild, props = out.__preactattr_, vchildren = vnode.children;
        if (null == props) {
            props = out.__preactattr_ = {};
            for (var a = out.attributes, i = a.length; i--; ) props[a[i].name] = a[i].value;
        }
        if (!hydrating && vchildren && 1 === vchildren.length && 'string' == typeof vchildren[0] && null != fc && void 0 !== fc.splitText && null == fc.nextSibling) {
            if (fc.nodeValue != vchildren[0]) fc.nodeValue = vchildren[0];
        } else if (vchildren && vchildren.length || null != fc) innerDiffNode(out, vchildren, context, mountAll, hydrating || null != props.dangerouslySetInnerHTML);
        diffAttributes(out, vnode.attributes, props);
        isSvgMode = prevSvgMode;
        return out;
    }
    function innerDiffNode(dom, vchildren, context, mountAll, isHydrating) {
        var j, c, f, vchild, child, originalChildren = dom.childNodes, children = [], keyed = {}, keyedLen = 0, min = 0, len = originalChildren.length, childrenLen = 0, vlen = vchildren ? vchildren.length : 0;
        if (0 !== len) for (var i = 0; i < len; i++) {
            var _child = originalChildren[i], props = _child.__preactattr_, key = vlen && props ? _child._component ? _child._component.__k : props.key : null;
            if (null != key) {
                keyedLen++;
                keyed[key] = _child;
            } else if (props || (void 0 !== _child.splitText ? isHydrating ? _child.nodeValue.trim() : !0 : isHydrating)) children[childrenLen++] = _child;
        }
        if (0 !== vlen) for (var i = 0; i < vlen; i++) {
            vchild = vchildren[i];
            child = null;
            var key = vchild.key;
            if (null != key) {
                if (keyedLen && void 0 !== keyed[key]) {
                    child = keyed[key];
                    keyed[key] = void 0;
                    keyedLen--;
                }
            } else if (min < childrenLen) for (j = min; j < childrenLen; j++) if (void 0 !== children[j] && isSameNodeType(c = children[j], vchild, isHydrating)) {
                child = c;
                children[j] = void 0;
                if (j === childrenLen - 1) childrenLen--;
                if (j === min) min++;
                break;
            }
            child = idiff(child, vchild, context, mountAll);
            f = originalChildren[i];
            if (child && child !== dom && child !== f) if (null == f) dom.appendChild(child); else if (child === f.nextSibling) removeNode(f); else dom.insertBefore(child, f);
        }
        if (keyedLen) for (var i in keyed) if (void 0 !== keyed[i]) recollectNodeTree(keyed[i], !1);
        while (min <= childrenLen) if (void 0 !== (child = children[childrenLen--])) recollectNodeTree(child, !1);
    }
    function recollectNodeTree(node, unmountOnly) {
        var component = node._component;
        if (component) unmountComponent(component); else {
            if (null != node.__preactattr_) applyRef(node.__preactattr_.ref, null);
            if (!1 === unmountOnly || null == node.__preactattr_) removeNode(node);
            removeChildren(node);
        }
    }
    function removeChildren(node) {
        node = node.lastChild;
        while (node) {
            var next = node.previousSibling;
            recollectNodeTree(node, !0);
            node = next;
        }
    }
    function diffAttributes(dom, attrs, old) {
        var name;
        for (name in old) if ((!attrs || null == attrs[name]) && null != old[name]) setAccessor(dom, name, old[name], old[name] = void 0, isSvgMode);
        for (name in attrs) if (!('children' === name || 'innerHTML' === name || name in old && attrs[name] === ('value' === name || 'checked' === name ? dom[name] : old[name]))) setAccessor(dom, name, old[name], old[name] = attrs[name], isSvgMode);
    }
    function createComponent(Ctor, props, context) {
        var inst, i = recyclerComponents.length;
        if (Ctor.prototype && Ctor.prototype.render) {
            inst = new Ctor(props, context);
            Component.call(inst, props, context);
        } else {
            inst = new Component(props, context);
            inst.constructor = Ctor;
            inst.render = doRender;
        }
        while (i--) if (recyclerComponents[i].constructor === Ctor) {
            inst.__b = recyclerComponents[i].__b;
            recyclerComponents.splice(i, 1);
            return inst;
        }
        return inst;
    }
    function doRender(props, state, context) {
        return this.constructor(props, context);
    }
    function setComponentProps(component, props, renderMode, context, mountAll) {
        if (!component.__x) {
            component.__x = !0;
            component.__r = props.ref;
            component.__k = props.key;
            delete props.ref;
            delete props.key;
            if (void 0 === component.constructor.getDerivedStateFromProps) if (!component.base || mountAll) {
                if (component.componentWillMount) component.componentWillMount();
            } else if (component.componentWillReceiveProps) component.componentWillReceiveProps(props, context);
            if (context && context !== component.context) {
                if (!component.__c) component.__c = component.context;
                component.context = context;
            }
            if (!component.__p) component.__p = component.props;
            component.props = props;
            component.__x = !1;
            if (0 !== renderMode) if (1 === renderMode || !1 !== options.syncComponentUpdates || !component.base) renderComponent(component, 1, mountAll); else enqueueRender(component);
            applyRef(component.__r, component);
        }
    }
    function renderComponent(component, renderMode, mountAll, isChild) {
        if (!component.__x) {
            var rendered, inst, cbase, props = component.props, state = component.state, context = component.context, previousProps = component.__p || props, previousState = component.__s || state, previousContext = component.__c || context, isUpdate = component.base, nextBase = component.__b, initialBase = isUpdate || nextBase, initialChildComponent = component._component, skip = !1, snapshot = previousContext;
            if (component.constructor.getDerivedStateFromProps) {
                state = extend(extend({}, state), component.constructor.getDerivedStateFromProps(props, state));
                component.state = state;
            }
            if (isUpdate) {
                component.props = previousProps;
                component.state = previousState;
                component.context = previousContext;
                if (2 !== renderMode && component.shouldComponentUpdate && !1 === component.shouldComponentUpdate(props, state, context)) skip = !0; else if (component.componentWillUpdate) component.componentWillUpdate(props, state, context);
                component.props = props;
                component.state = state;
                component.context = context;
            }
            component.__p = component.__s = component.__c = component.__b = null;
            component.__d = !1;
            if (!skip) {
                rendered = component.render(props, state, context);
                if (component.getChildContext) context = extend(extend({}, context), component.getChildContext());
                if (isUpdate && component.getSnapshotBeforeUpdate) snapshot = component.getSnapshotBeforeUpdate(previousProps, previousState);
                var toUnmount, base, childComponent = rendered && rendered.nodeName;
                if ('function' == typeof childComponent) {
                    var childProps = getNodeProps(rendered);
                    inst = initialChildComponent;
                    if (inst && inst.constructor === childComponent && childProps.key == inst.__k) setComponentProps(inst, childProps, 1, context, !1); else {
                        toUnmount = inst;
                        component._component = inst = createComponent(childComponent, childProps, context);
                        inst.__b = inst.__b || nextBase;
                        inst.__u = component;
                        setComponentProps(inst, childProps, 0, context, !1);
                        renderComponent(inst, 1, mountAll, !0);
                    }
                    base = inst.base;
                } else {
                    cbase = initialBase;
                    toUnmount = initialChildComponent;
                    if (toUnmount) cbase = component._component = null;
                    if (initialBase || 1 === renderMode) {
                        if (cbase) cbase._component = null;
                        base = diff(cbase, rendered, context, mountAll || !isUpdate, initialBase && initialBase.parentNode, !0);
                    }
                }
                if (initialBase && base !== initialBase && inst !== initialChildComponent) {
                    var baseParent = initialBase.parentNode;
                    if (baseParent && base !== baseParent) {
                        baseParent.replaceChild(base, initialBase);
                        if (!toUnmount) {
                            initialBase._component = null;
                            recollectNodeTree(initialBase, !1);
                        }
                    }
                }
                if (toUnmount) unmountComponent(toUnmount);
                component.base = base;
                if (base && !isChild) {
                    var componentRef = component, t = component;
                    while (t = t.__u) (componentRef = t).base = base;
                    base._component = componentRef;
                    base._componentConstructor = componentRef.constructor;
                }
            }
            if (!isUpdate || mountAll) mounts.push(component); else if (!skip) {
                if (component.componentDidUpdate) component.componentDidUpdate(previousProps, previousState, snapshot);
                if (options.afterUpdate) options.afterUpdate(component);
            }
            while (component.__h.length) component.__h.pop().call(component);
            if (!diffLevel && !isChild) flushMounts();
        }
    }
    function buildComponentFromVNode(dom, vnode, context, mountAll) {
        var c = dom && dom._component, originalComponent = c, oldDom = dom, isDirectOwner = c && dom._componentConstructor === vnode.nodeName, isOwner = isDirectOwner, props = getNodeProps(vnode);
        while (c && !isOwner && (c = c.__u)) isOwner = c.constructor === vnode.nodeName;
        if (c && isOwner && (!mountAll || c._component)) {
            setComponentProps(c, props, 3, context, mountAll);
            dom = c.base;
        } else {
            if (originalComponent && !isDirectOwner) {
                unmountComponent(originalComponent);
                dom = oldDom = null;
            }
            c = createComponent(vnode.nodeName, props, context);
            if (dom && !c.__b) {
                c.__b = dom;
                oldDom = null;
            }
            setComponentProps(c, props, 1, context, mountAll);
            dom = c.base;
            if (oldDom && dom !== oldDom) {
                oldDom._component = null;
                recollectNodeTree(oldDom, !1);
            }
        }
        return dom;
    }
    function unmountComponent(component) {
        if (options.beforeUnmount) options.beforeUnmount(component);
        var base = component.base;
        component.__x = !0;
        if (component.componentWillUnmount) component.componentWillUnmount();
        component.base = null;
        var inner = component._component;
        if (inner) unmountComponent(inner); else if (base) {
            if (null != base.__preactattr_) applyRef(base.__preactattr_.ref, null);
            component.__b = base;
            removeNode(base);
            recyclerComponents.push(component);
            removeChildren(base);
        }
        applyRef(component.__r, null);
    }
    function Component(props, context) {
        this.__d = !0;
        this.context = context;
        this.props = props;
        this.state = this.state || {};
        this.__h = [];
    }
    function render(vnode, parent, merge) {
        return diff(merge, vnode, {}, !1, parent, !1);
    }
    function createRef() {
        return {};
    }
    var VNode = function() {};
    var options = {};
    var stack = [];
    var EMPTY_CHILDREN = [];
    var defer = 'function' == typeof Promise ? Promise.resolve().then.bind(Promise.resolve()) : setTimeout;
    var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;
    var items = [];
    var mounts = [];
    var diffLevel = 0;
    var isSvgMode = !1;
    var hydrating = !1;
    var recyclerComponents = [];
    extend(Component.prototype, {
        setState: function(state, callback) {
            if (!this.__s) this.__s = this.state;
            this.state = extend(extend({}, this.state), 'function' == typeof state ? state(this.state, this.props) : state);
            if (callback) this.__h.push(callback);
            enqueueRender(this);
        },
        forceUpdate: function(callback) {
            if (callback) this.__h.push(callback);
            renderComponent(this, 2);
        },
        render: function() {}
    });
    var preact = {
        h: h,
        createElement: h,
        cloneElement: cloneElement,
        createRef: createRef,
        Component: Component,
        render: render,
        rerender: rerender,
        options: options
    };
    if ('undefined' != typeof module) module.exports = preact; else self.preact = preact;
}();

},{}],11:[function(require,module,exports){
module.exports = prettierBytes

function prettierBytes (num) {
  if (typeof num !== 'number' || isNaN(num)) {
    throw new TypeError('Expected a number, got ' + typeof num)
  }

  var neg = num < 0
  var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  if (neg) {
    num = -num
  }

  if (num < 1) {
    return (neg ? '-' : '') + num + ' B'
  }

  var exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1)
  num = Number(num / Math.pow(1000, exponent))
  var unit = units[exponent]

  if (num >= 10 || num % 1 === 0) {
    // Do not show decimals when the number is two-digit, or if the number has no
    // decimal component.
    return (neg ? '-' : '') + num.toFixed(0) + ' ' + unit
  } else {
    return (neg ? '-' : '') + num.toFixed(1) + ' ' + unit
  }
}

},{}],12:[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.WHATWGFetch = {})));
}(this, (function (exports) { 'use strict';

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob:
      'FileReader' in self &&
      'Blob' in self &&
      (function() {
        try {
          new Blob();
          return true
        } catch (e) {
          return false
        }
      })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  };

  function isDataView(obj) {
    return obj && DataView.prototype.isPrototypeOf(obj)
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ];

    var isArrayBufferView =
      ArrayBuffer.isView ||
      function(obj) {
        return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
      };
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name);
    }
    if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift();
        return {done: value === undefined, value: value}
      }
    };

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      };
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {};

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value);
      }, this);
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1]);
      }, this);
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name]);
      }, this);
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    var oldValue = this.map[name];
    this.map[name] = oldValue ? oldValue + ', ' + value : value;
  };

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function(name) {
    name = normalizeName(name);
    return this.has(name) ? this.map[name] : null
  };

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  };

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value);
  };

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this);
      }
    }
  };

  Headers.prototype.keys = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push(name);
    });
    return iteratorFor(items)
  };

  Headers.prototype.values = function() {
    var items = [];
    this.forEach(function(value) {
      items.push(value);
    });
    return iteratorFor(items)
  };

  Headers.prototype.entries = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push([name, value]);
    });
    return iteratorFor(items)
  };

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true;
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result);
      };
      reader.onerror = function() {
        reject(reader.error);
      };
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsArrayBuffer(blob);
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsText(blob);
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf);
    var chars = new Array(view.length);

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i]);
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength);
      view.set(new Uint8Array(buf));
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false;

    this._initBody = function(body) {
      this._bodyInit = body;
      if (!body) {
        this._bodyText = '';
      } else if (typeof body === 'string') {
        this._bodyText = body;
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body;
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body;
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString();
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer);
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer]);
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body);
      } else {
        this._bodyText = body = Object.prototype.toString.call(body);
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8');
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type);
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
      }
    };

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this);
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      };

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      };
    }

    this.text = function() {
      var rejected = consumed(this);
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    };

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      };
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    };

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

  function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return methods.indexOf(upcased) > -1 ? upcased : method
  }

  function Request(input, options) {
    options = options || {};
    var body = options.body;

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url;
      this.credentials = input.credentials;
      if (!options.headers) {
        this.headers = new Headers(input.headers);
      }
      this.method = input.method;
      this.mode = input.mode;
      this.signal = input.signal;
      if (!body && input._bodyInit != null) {
        body = input._bodyInit;
        input.bodyUsed = true;
      }
    } else {
      this.url = String(input);
    }

    this.credentials = options.credentials || this.credentials || 'same-origin';
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers);
    }
    this.method = normalizeMethod(options.method || this.method || 'GET');
    this.mode = options.mode || this.mode || null;
    this.signal = options.signal || this.signal;
    this.referrer = null;

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body);
  }

  Request.prototype.clone = function() {
    return new Request(this, {body: this._bodyInit})
  };

  function decode(body) {
    var form = new FormData();
    body
      .trim()
      .split('&')
      .forEach(function(bytes) {
        if (bytes) {
          var split = bytes.split('=');
          var name = split.shift().replace(/\+/g, ' ');
          var value = split.join('=').replace(/\+/g, ' ');
          form.append(decodeURIComponent(name), decodeURIComponent(value));
        }
      });
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers();
    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2
    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
    preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':');
      var key = parts.shift().trim();
      if (key) {
        var value = parts.join(':').trim();
        headers.append(key, value);
      }
    });
    return headers
  }

  Body.call(Request.prototype);

  function Response(bodyInit, options) {
    if (!options) {
      options = {};
    }

    this.type = 'default';
    this.status = options.status === undefined ? 200 : options.status;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = 'statusText' in options ? options.statusText : 'OK';
    this.headers = new Headers(options.headers);
    this.url = options.url || '';
    this._initBody(bodyInit);
  }

  Body.call(Response.prototype);

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  };

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''});
    response.type = 'error';
    return response
  };

  var redirectStatuses = [301, 302, 303, 307, 308];

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  };

  exports.DOMException = self.DOMException;
  try {
    new exports.DOMException();
  } catch (err) {
    exports.DOMException = function(message, name) {
      this.message = message;
      this.name = name;
      var error = Error(message);
      this.stack = error.stack;
    };
    exports.DOMException.prototype = Object.create(Error.prototype);
    exports.DOMException.prototype.constructor = exports.DOMException;
  }

  function fetch(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init);

      if (request.signal && request.signal.aborted) {
        return reject(new exports.DOMException('Aborted', 'AbortError'))
      }

      var xhr = new XMLHttpRequest();

      function abortXhr() {
        xhr.abort();
      }

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        };
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options));
      };

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.onabort = function() {
        reject(new exports.DOMException('Aborted', 'AbortError'));
      };

      xhr.open(request.method, request.url, true);

      if (request.credentials === 'include') {
        xhr.withCredentials = true;
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false;
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob';
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value);
      });

      if (request.signal) {
        request.signal.addEventListener('abort', abortXhr);

        xhr.onreadystatechange = function() {
          // DONE (success or failure)
          if (xhr.readyState === 4) {
            request.signal.removeEventListener('abort', abortXhr);
          }
        };
      }

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    })
  }

  fetch.polyfill = true;

  if (!self.fetch) {
    self.fetch = fetch;
    self.Headers = Headers;
    self.Request = Request;
    self.Response = Response;
  }

  exports.Headers = Headers;
  exports.Request = Request;
  exports.Response = Response;
  exports.fetch = fetch;

  Object.defineProperty(exports, '__esModule', { value: true });

})));

},{}],13:[function(require,module,exports){
/* jshint node: true */
'use strict';

/**
  # wildcard

  Very simple wildcard matching, which is designed to provide the same
  functionality that is found in the
  [eve](https://github.com/adobe-webplatform/eve) eventing library.

  ## Usage

  It works with strings:

  <<< examples/strings.js

  Arrays:

  <<< examples/arrays.js

  Objects (matching against keys):

  <<< examples/objects.js

  While the library works in Node, if you are are looking for file-based
  wildcard matching then you should have a look at:

  <https://github.com/isaacs/node-glob>
**/

function WildcardMatcher(text, separator) {
  this.text = text = text || '';
  this.hasWild = ~text.indexOf('*');
  this.separator = separator;
  this.parts = text.split(separator);
}

WildcardMatcher.prototype.match = function(input) {
  var matches = true;
  var parts = this.parts;
  var ii;
  var partsCount = parts.length;
  var testParts;

  if (typeof input == 'string' || input instanceof String) {
    if (!this.hasWild && this.text != input) {
      matches = false;
    } else {
      testParts = (input || '').split(this.separator);
      for (ii = 0; matches && ii < partsCount; ii++) {
        if (parts[ii] === '*')  {
          continue;
        } else if (ii < testParts.length) {
          matches = parts[ii] === testParts[ii];
        } else {
          matches = false;
        }
      }

      // If matches, then return the component parts
      matches = matches && testParts;
    }
  }
  else if (typeof input.splice == 'function') {
    matches = [];

    for (ii = input.length; ii--; ) {
      if (this.match(input[ii])) {
        matches[matches.length] = input[ii];
      }
    }
  }
  else if (typeof input == 'object') {
    matches = {};

    for (var key in input) {
      if (this.match(key)) {
        matches[key] = input[key];
      }
    }
  }

  return matches;
};

module.exports = function(text, test, separator) {
  var matcher = new WildcardMatcher(text, separator || /[\/\.]/);
  if (typeof test != 'undefined') {
    return matcher.match(test);
  }

  return matcher;
};

},{}],14:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AuthError = function (_Error) {
  _inherits(AuthError, _Error);

  function AuthError() {
    _classCallCheck(this, AuthError);

    var _this = _possibleConstructorReturn(this, _Error.call(this, 'Authorization required'));

    _this.name = 'AuthError';
    _this.isAuthError = true;
    return _this;
  }

  return AuthError;
}(Error);

module.exports = AuthError;

},{}],15:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RequestClient = require('./RequestClient');
var tokenStorage = require('./tokenStorage');

var _getName = function _getName(id) {
  return id.split('-').map(function (s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }).join(' ');
};

module.exports = function (_RequestClient) {
  _inherits(Provider, _RequestClient);

  function Provider(uppy, opts) {
    _classCallCheck(this, Provider);

    var _this = _possibleConstructorReturn(this, _RequestClient.call(this, uppy, opts));

    _this.provider = opts.provider;
    _this.id = _this.provider;
    _this.authProvider = opts.authProvider || _this.provider;
    _this.name = _this.opts.name || _getName(_this.id);
    _this.pluginId = _this.opts.pluginId;
    _this.tokenKey = 'companion-' + _this.pluginId + '-auth-token';
    return _this;
  }

  Provider.prototype.headers = function headers() {
    var _this2 = this;

    return new Promise(function (resolve, reject) {
      _RequestClient.prototype.headers.call(_this2).then(function (headers) {
        _this2.getAuthToken().then(function (token) {
          resolve(_extends({}, headers, { 'uppy-auth-token': token }));
        });
      }).catch(reject);
    });
  };

  Provider.prototype.onReceiveResponse = function onReceiveResponse(response) {
    response = _RequestClient.prototype.onReceiveResponse.call(this, response);
    var authenticated = response.status !== 401;
    this.uppy.getPlugin(this.pluginId).setPluginState({ authenticated: authenticated });
    return response;
  };

  // @todo(i.olarewaju) consider whether or not this method should be exposed


  Provider.prototype.setAuthToken = function setAuthToken(token) {
    return this.uppy.getPlugin(this.pluginId).storage.setItem(this.tokenKey, token);
  };

  Provider.prototype.getAuthToken = function getAuthToken() {
    return this.uppy.getPlugin(this.pluginId).storage.getItem(this.tokenKey);
  };

  Provider.prototype.authUrl = function authUrl() {
    return this.hostname + '/' + this.id + '/connect';
  };

  Provider.prototype.fileUrl = function fileUrl(id) {
    return this.hostname + '/' + this.id + '/get/' + id;
  };

  Provider.prototype.list = function list(directory) {
    return this.get(this.id + '/list/' + (directory || ''));
  };

  Provider.prototype.logout = function logout() {
    var _this3 = this;

    var redirect = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : location.href;

    return new Promise(function (resolve, reject) {
      _this3.get(_this3.id + '/logout?redirect=' + redirect).then(function (res) {
        _this3.uppy.getPlugin(_this3.pluginId).storage.removeItem(_this3.tokenKey).then(function () {
          return resolve(res);
        }).catch(reject);
      }).catch(reject);
    });
  };

  Provider.initPlugin = function initPlugin(plugin, opts, defaultOpts) {
    plugin.type = 'acquirer';
    plugin.files = [];
    if (defaultOpts) {
      plugin.opts = _extends({}, defaultOpts, opts);
    }

    if (opts.serverPattern) {
      var pattern = opts.serverPattern;
      // validate serverPattern param
      if (typeof pattern !== 'string' && !Array.isArray(pattern) && !(pattern instanceof RegExp)) {
        throw new TypeError(plugin.id + ': the option "serverPattern" must be one of string, Array, RegExp');
      }
      plugin.opts.serverPattern = pattern;
    } else {
      // does not start with https://
      if (/^(?!https?:\/\/).*$/i.test(opts.serverUrl)) {
        plugin.opts.serverPattern = 'https://' + opts.serverUrl.replace(/^\/\//, '');
      } else {
        plugin.opts.serverPattern = opts.serverUrl;
      }
    }

    plugin.storage = plugin.opts.storage || tokenStorage;
  };

  return Provider;
}(RequestClient);

},{"./RequestClient":16,"./tokenStorage":19}],16:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AuthError = require('./AuthError');

// Remove the trailing slash so we can always safely append /xyz.
function stripSlash(url) {
  return url.replace(/\/$/, '');
}

module.exports = function () {
  function RequestClient(uppy, opts) {
    _classCallCheck(this, RequestClient);

    this.uppy = uppy;
    this.opts = opts;
    this.onReceiveResponse = this.onReceiveResponse.bind(this);
  }

  RequestClient.prototype.headers = function headers() {
    return Promise.resolve(_extends({}, this.defaultHeaders, this.opts.serverHeaders || {}));
  };

  RequestClient.prototype._getPostResponseFunc = function _getPostResponseFunc(skip) {
    var _this = this;

    return function (response) {
      if (!skip) {
        return _this.onReceiveResponse(response);
      }

      return response;
    };
  };

  RequestClient.prototype.onReceiveResponse = function onReceiveResponse(response) {
    var state = this.uppy.getState();
    var companion = state.companion || {};
    var host = this.opts.serverUrl;
    var headers = response.headers;
    // Store the self-identified domain name for the Companion instance we just hit.
    if (headers.has('i-am') && headers.get('i-am') !== companion[host]) {
      var _extends2;

      this.uppy.setState({
        companion: _extends({}, companion, (_extends2 = {}, _extends2[host] = headers.get('i-am'), _extends2))
      });
    }
    return response;
  };

  RequestClient.prototype._getUrl = function _getUrl(url) {
    if (/^(https?:|)\/\//.test(url)) {
      return url;
    }
    return this.hostname + '/' + url;
  };

  RequestClient.prototype._json = function _json(res) {
    if (res.status === 401) {
      throw new AuthError();
    }

    if (res.status < 200 || res.status > 300) {
      throw new Error('Failed request to ' + res.url + '. ' + res.statusText);
    }
    return res.json();
  };

  RequestClient.prototype.get = function get(path, skipPostResponse) {
    var _this2 = this;

    return new Promise(function (resolve, reject) {
      _this2.headers().then(function (headers) {
        fetch(_this2._getUrl(path), {
          method: 'get',
          headers: headers,
          credentials: 'same-origin'
        }).then(_this2._getPostResponseFunc(skipPostResponse)).then(function (res) {
          return _this2._json(res).then(resolve);
        }).catch(function (err) {
          err = err.isAuthError ? err : new Error('Could not get ' + _this2._getUrl(path) + '. ' + err);
          reject(err);
        });
      });
    });
  };

  RequestClient.prototype.post = function post(path, data, skipPostResponse) {
    var _this3 = this;

    return new Promise(function (resolve, reject) {
      _this3.headers().then(function (headers) {
        fetch(_this3._getUrl(path), {
          method: 'post',
          headers: headers,
          credentials: 'same-origin',
          body: JSON.stringify(data)
        }).then(_this3._getPostResponseFunc(skipPostResponse)).then(function (res) {
          return _this3._json(res).then(resolve);
        }).catch(function (err) {
          err = err.isAuthError ? err : new Error('Could not post ' + _this3._getUrl(path) + '. ' + err);
          reject(err);
        });
      });
    });
  };

  RequestClient.prototype.delete = function _delete(path, data, skipPostResponse) {
    var _this4 = this;

    return new Promise(function (resolve, reject) {
      _this4.headers().then(function (headers) {
        fetch(_this4.hostname + '/' + path, {
          method: 'delete',
          headers: headers,
          credentials: 'same-origin',
          body: data ? JSON.stringify(data) : null
        }).then(_this4._getPostResponseFunc(skipPostResponse)).then(function (res) {
          return _this4._json(res).then(resolve);
        }).catch(function (err) {
          err = err.isAuthError ? err : new Error('Could not delete ' + _this4._getUrl(path) + '. ' + err);
          reject(err);
        });
      });
    });
  };

  _createClass(RequestClient, [{
    key: 'hostname',
    get: function get() {
      var _uppy$getState = this.uppy.getState(),
          companion = _uppy$getState.companion;

      var host = this.opts.serverUrl;
      return stripSlash(companion && companion[host] ? companion[host] : host);
    }
  }, {
    key: 'defaultHeaders',
    get: function get() {
      return {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
    }
  }]);

  return RequestClient;
}();

},{"./AuthError":14}],17:[function(require,module,exports){
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ee = require('namespace-emitter');

module.exports = function () {
  function UppySocket(opts) {
    var _this = this;

    _classCallCheck(this, UppySocket);

    this.queued = [];
    this.isOpen = false;
    this.socket = new WebSocket(opts.target);
    this.emitter = ee();

    this.socket.onopen = function (e) {
      _this.isOpen = true;

      while (_this.queued.length > 0 && _this.isOpen) {
        var first = _this.queued[0];
        _this.send(first.action, first.payload);
        _this.queued = _this.queued.slice(1);
      }
    };

    this.socket.onclose = function (e) {
      _this.isOpen = false;
    };

    this._handleMessage = this._handleMessage.bind(this);

    this.socket.onmessage = this._handleMessage;

    this.close = this.close.bind(this);
    this.emit = this.emit.bind(this);
    this.on = this.on.bind(this);
    this.once = this.once.bind(this);
    this.send = this.send.bind(this);
  }

  UppySocket.prototype.close = function close() {
    return this.socket.close();
  };

  UppySocket.prototype.send = function send(action, payload) {
    // attach uuid

    if (!this.isOpen) {
      this.queued.push({ action: action, payload: payload });
      return;
    }

    this.socket.send(JSON.stringify({
      action: action,
      payload: payload
    }));
  };

  UppySocket.prototype.on = function on(action, handler) {
    this.emitter.on(action, handler);
  };

  UppySocket.prototype.emit = function emit(action, payload) {
    this.emitter.emit(action, payload);
  };

  UppySocket.prototype.once = function once(action, handler) {
    this.emitter.once(action, handler);
  };

  UppySocket.prototype._handleMessage = function _handleMessage(e) {
    try {
      var message = JSON.parse(e.data);
      this.emit(message.action, message.payload);
    } catch (err) {
      console.log(err);
    }
  };

  return UppySocket;
}();

},{"namespace-emitter":9}],18:[function(require,module,exports){
'use-strict';
/**
 * Manages communications with Companion
 */

var RequestClient = require('./RequestClient');
var Provider = require('./Provider');
var Socket = require('./Socket');

module.exports = {
  RequestClient: RequestClient,
  Provider: Provider,
  Socket: Socket
};

},{"./Provider":15,"./RequestClient":16,"./Socket":17}],19:[function(require,module,exports){
'use strict';
/**
 * This module serves as an Async wrapper for LocalStorage
 */

module.exports.setItem = function (key, value) {
  return new Promise(function (resolve) {
    localStorage.setItem(key, value);
    resolve();
  });
};

module.exports.getItem = function (key) {
  return Promise.resolve(localStorage.getItem(key));
};

module.exports.removeItem = function (key) {
  return new Promise(function (resolve) {
    localStorage.removeItem(key);
    resolve();
  });
};

},{}],20:[function(require,module,exports){
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var preact = require('preact');
var findDOMElement = require('./../../utils/lib/findDOMElement');

/**
 * Defer a frequent call to the microtask queue.
 */
function debounce(fn) {
  var calling = null;
  var latestArgs = null;
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    latestArgs = args;
    if (!calling) {
      calling = Promise.resolve().then(function () {
        calling = null;
        // At this point `args` may be different from the most
        // recent state, if multiple calls happened since this task
        // was queued. So we use the `latestArgs`, which definitely
        // is the most recent call.
        return fn.apply(undefined, latestArgs);
      });
    }
    return calling;
  };
}

/**
 * Boilerplate that all Plugins share - and should not be used
 * directly. It also shows which methods final plugins should implement/override,
 * this deciding on structure.
 *
 * @param {object} main Uppy core object
 * @param {object} object with plugin options
 * @return {array | string} files or success/fail message
 */
module.exports = function () {
  function Plugin(uppy, opts) {
    _classCallCheck(this, Plugin);

    this.uppy = uppy;
    this.opts = opts || {};

    this.update = this.update.bind(this);
    this.mount = this.mount.bind(this);
    this.install = this.install.bind(this);
    this.uninstall = this.uninstall.bind(this);
  }

  Plugin.prototype.getPluginState = function getPluginState() {
    var _uppy$getState = this.uppy.getState(),
        plugins = _uppy$getState.plugins;

    return plugins[this.id] || {};
  };

  Plugin.prototype.setPluginState = function setPluginState(update) {
    var _extends2;

    var _uppy$getState2 = this.uppy.getState(),
        plugins = _uppy$getState2.plugins;

    this.uppy.setState({
      plugins: _extends({}, plugins, (_extends2 = {}, _extends2[this.id] = _extends({}, plugins[this.id], update), _extends2))
    });
  };

  Plugin.prototype.update = function update(state) {
    if (typeof this.el === 'undefined') {
      return;
    }

    if (this._updateUI) {
      this._updateUI(state);
    }
  };

  /**
  * Called when plugin is mounted, whether in DOM or into another plugin.
  * Needed because sometimes plugins are mounted separately/after `install`,
  * so this.el and this.parent might not be available in `install`.
  * This is the case with @uppy/react plugins, for example.
  */


  Plugin.prototype.onMount = function onMount() {};

  /**
   * Check if supplied `target` is a DOM element or an `object`.
   * If it’s an object — target is a plugin, and we search `plugins`
   * for a plugin with same name and return its target.
   *
   * @param {String|Object} target
   *
   */


  Plugin.prototype.mount = function mount(target, plugin) {
    var _this = this;

    var callerPluginName = plugin.id;

    var targetElement = findDOMElement(target);

    if (targetElement) {
      this.isTargetDOMEl = true;

      // API for plugins that require a synchronous rerender.
      this.rerender = function (state) {
        // plugin could be removed, but this.rerender is debounced below,
        // so it could still be called even after uppy.removePlugin or uppy.close
        // hence the check
        if (!_this.uppy.getPlugin(_this.id)) return;
        _this.el = preact.render(_this.render(state), targetElement, _this.el);
      };
      this._updateUI = debounce(this.rerender);

      this.uppy.log('Installing ' + callerPluginName + ' to a DOM element');

      // clear everything inside the target container
      if (this.opts.replaceTargetContent) {
        targetElement.innerHTML = '';
      }

      this.el = preact.render(this.render(this.uppy.getState()), targetElement);

      this.onMount();
      return this.el;
    }

    var targetPlugin = void 0;
    if ((typeof target === 'undefined' ? 'undefined' : _typeof(target)) === 'object' && target instanceof Plugin) {
      // Targeting a plugin *instance*
      targetPlugin = target;
    } else if (typeof target === 'function') {
      // Targeting a plugin type
      var Target = target;
      // Find the target plugin instance.
      this.uppy.iteratePlugins(function (plugin) {
        if (plugin instanceof Target) {
          targetPlugin = plugin;
          return false;
        }
      });
    }

    if (targetPlugin) {
      this.uppy.log('Installing ' + callerPluginName + ' to ' + targetPlugin.id);
      this.parent = targetPlugin;
      this.el = targetPlugin.addTarget(plugin);

      this.onMount();
      return this.el;
    }

    this.uppy.log('Not installing ' + callerPluginName);
    throw new Error('Invalid target option given to ' + callerPluginName + '. Please make sure that the element \n      exists on the page, or that the plugin you are targeting has been installed. Check that the <script> tag initializing Uppy \n      comes at the bottom of the page, before the closing </body> tag (see https://github.com/transloadit/uppy/issues/1042).');
  };

  Plugin.prototype.render = function render(state) {
    throw new Error('Extend the render method to add your plugin to a DOM element');
  };

  Plugin.prototype.addTarget = function addTarget(plugin) {
    throw new Error('Extend the addTarget method to add your plugin to another plugin\'s target');
  };

  Plugin.prototype.unmount = function unmount() {
    if (this.isTargetDOMEl && this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
  };

  Plugin.prototype.install = function install() {};

  Plugin.prototype.uninstall = function uninstall() {
    this.unmount();
  };

  return Plugin;
}();

},{"./../../utils/lib/findDOMElement":28,"preact":10}],21:[function(require,module,exports){
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Translator = require('./../../utils/lib/Translator');
var ee = require('namespace-emitter');
var cuid = require('cuid');
// const throttle = require('lodash.throttle')
var prettyBytes = require('prettier-bytes');
var match = require('mime-match');
var DefaultStore = require('./../../store-default');
var getFileType = require('./../../utils/lib/getFileType');
var getFileNameAndExtension = require('./../../utils/lib/getFileNameAndExtension');
var generateFileID = require('./../../utils/lib/generateFileID');
var getTimeStamp = require('./../../utils/lib/getTimeStamp');
var supportsUploadProgress = require('./supportsUploadProgress');
var Plugin = require('./Plugin'); // Exported from here.

/**
 * Uppy Core module.
 * Manages plugins, state updates, acts as an event bus,
 * adds/removes files and metadata.
 */

var Uppy = function () {
  /**
  * Instantiate Uppy
  * @param {object} opts — Uppy options
  */
  function Uppy(opts) {
    var _this = this;

    _classCallCheck(this, Uppy);

    var defaultLocale = {
      strings: {
        youCanOnlyUploadX: {
          0: 'You can only upload %{smart_count} file',
          1: 'You can only upload %{smart_count} files'
        },
        youHaveToAtLeastSelectX: {
          0: 'You have to select at least %{smart_count} file',
          1: 'You have to select at least %{smart_count} files'
        },
        exceedsSize: 'This file exceeds maximum allowed size of',
        youCanOnlyUploadFileTypes: 'You can only upload: %{types}',
        companionError: 'Connection with Companion failed',
        companionAuthError: 'Authorization required',
        failedToUpload: 'Failed to upload %{file}',
        noInternetConnection: 'No Internet connection',
        connectedToInternet: 'Connected to the Internet',
        // Strings for remote providers
        noFilesFound: 'You have no files or folders here',
        selectXFiles: {
          0: 'Select %{smart_count} file',
          1: 'Select %{smart_count} files'
        },
        cancel: 'Cancel',
        logOut: 'Log out',
        filter: 'Filter',
        resetFilter: 'Reset filter'
      }

      // set default options
    };var defaultOptions = {
      id: 'uppy',
      autoProceed: false,
      allowMultipleUploads: true,
      debug: false,
      restrictions: {
        maxFileSize: null,
        maxNumberOfFiles: null,
        minNumberOfFiles: null,
        allowedFileTypes: null
      },
      meta: {},
      onBeforeFileAdded: function onBeforeFileAdded(currentFile, files) {
        return currentFile;
      },
      onBeforeUpload: function onBeforeUpload(files) {
        return files;
      },
      locale: defaultLocale,
      store: DefaultStore()

      // Merge default options with the ones set by user
    };this.opts = _extends({}, defaultOptions, opts);
    this.opts.restrictions = _extends({}, defaultOptions.restrictions, this.opts.restrictions);

    // i18n
    this.translator = new Translator([defaultLocale, this.opts.locale]);
    this.locale = this.translator.locale;
    this.i18n = this.translator.translate.bind(this.translator);

    // Container for different types of plugins
    this.plugins = {};

    this.getState = this.getState.bind(this);
    this.getPlugin = this.getPlugin.bind(this);
    this.setFileMeta = this.setFileMeta.bind(this);
    this.setFileState = this.setFileState.bind(this);
    this.log = this.log.bind(this);
    this.info = this.info.bind(this);
    this.hideInfo = this.hideInfo.bind(this);
    this.addFile = this.addFile.bind(this);
    this.removeFile = this.removeFile.bind(this);
    this.pauseResume = this.pauseResume.bind(this);
    this._calculateProgress = this._calculateProgress.bind(this);
    this.updateOnlineStatus = this.updateOnlineStatus.bind(this);
    this.resetProgress = this.resetProgress.bind(this);

    this.pauseAll = this.pauseAll.bind(this);
    this.resumeAll = this.resumeAll.bind(this);
    this.retryAll = this.retryAll.bind(this);
    this.cancelAll = this.cancelAll.bind(this);
    this.retryUpload = this.retryUpload.bind(this);
    this.upload = this.upload.bind(this);

    this.emitter = ee();
    this.on = this.on.bind(this);
    this.off = this.off.bind(this);
    this.once = this.emitter.once.bind(this.emitter);
    this.emit = this.emitter.emit.bind(this.emitter);

    this.preProcessors = [];
    this.uploaders = [];
    this.postProcessors = [];

    this.store = this.opts.store;
    this.setState({
      plugins: {},
      files: {},
      currentUploads: {},
      allowNewUpload: true,
      capabilities: {
        uploadProgress: supportsUploadProgress(),
        resumableUploads: false
      },
      totalProgress: 0,
      meta: _extends({}, this.opts.meta),
      info: {
        isHidden: true,
        type: 'info',
        message: ''
      }
    });

    this._storeUnsubscribe = this.store.subscribe(function (prevState, nextState, patch) {
      _this.emit('state-update', prevState, nextState, patch);
      _this.updateAll(nextState);
    });

    // for debugging and testing
    // this.updateNum = 0
    if (this.opts.debug && typeof window !== 'undefined') {
      window['uppyLog'] = '';
      window[this.opts.id] = this;
    }

    this._addListeners();
  }

  Uppy.prototype.on = function on(event, callback) {
    this.emitter.on(event, callback);
    return this;
  };

  Uppy.prototype.off = function off(event, callback) {
    this.emitter.off(event, callback);
    return this;
  };

  /**
   * Iterate on all plugins and run `update` on them.
   * Called each time state changes.
   *
   */


  Uppy.prototype.updateAll = function updateAll(state) {
    this.iteratePlugins(function (plugin) {
      plugin.update(state);
    });
  };

  /**
   * Updates state with a patch
   *
   * @param {object} patch {foo: 'bar'}
   */


  Uppy.prototype.setState = function setState(patch) {
    this.store.setState(patch);
  };

  /**
   * Returns current state.
   * @return {object}
   */


  Uppy.prototype.getState = function getState() {
    return this.store.getState();
  };

  /**
  * Back compat for when uppy.state is used instead of uppy.getState().
  */


  /**
  * Shorthand to set state for a specific file.
  */
  Uppy.prototype.setFileState = function setFileState(fileID, state) {
    var _extends2;

    if (!this.getState().files[fileID]) {
      throw new Error('Can\u2019t set state for ' + fileID + ' (the file could have been removed)');
    }

    this.setState({
      files: _extends({}, this.getState().files, (_extends2 = {}, _extends2[fileID] = _extends({}, this.getState().files[fileID], state), _extends2))
    });
  };

  Uppy.prototype.resetProgress = function resetProgress() {
    var defaultProgress = {
      percentage: 0,
      bytesUploaded: 0,
      uploadComplete: false,
      uploadStarted: false
    };
    var files = _extends({}, this.getState().files);
    var updatedFiles = {};
    Object.keys(files).forEach(function (fileID) {
      var updatedFile = _extends({}, files[fileID]);
      updatedFile.progress = _extends({}, updatedFile.progress, defaultProgress);
      updatedFiles[fileID] = updatedFile;
    });

    this.setState({
      files: updatedFiles,
      totalProgress: 0
    });

    // TODO Document on the website
    this.emit('reset-progress');
  };

  Uppy.prototype.addPreProcessor = function addPreProcessor(fn) {
    this.preProcessors.push(fn);
  };

  Uppy.prototype.removePreProcessor = function removePreProcessor(fn) {
    var i = this.preProcessors.indexOf(fn);
    if (i !== -1) {
      this.preProcessors.splice(i, 1);
    }
  };

  Uppy.prototype.addPostProcessor = function addPostProcessor(fn) {
    this.postProcessors.push(fn);
  };

  Uppy.prototype.removePostProcessor = function removePostProcessor(fn) {
    var i = this.postProcessors.indexOf(fn);
    if (i !== -1) {
      this.postProcessors.splice(i, 1);
    }
  };

  Uppy.prototype.addUploader = function addUploader(fn) {
    this.uploaders.push(fn);
  };

  Uppy.prototype.removeUploader = function removeUploader(fn) {
    var i = this.uploaders.indexOf(fn);
    if (i !== -1) {
      this.uploaders.splice(i, 1);
    }
  };

  Uppy.prototype.setMeta = function setMeta(data) {
    var updatedMeta = _extends({}, this.getState().meta, data);
    var updatedFiles = _extends({}, this.getState().files);

    Object.keys(updatedFiles).forEach(function (fileID) {
      updatedFiles[fileID] = _extends({}, updatedFiles[fileID], {
        meta: _extends({}, updatedFiles[fileID].meta, data)
      });
    });

    this.log('Adding metadata:');
    this.log(data);

    this.setState({
      meta: updatedMeta,
      files: updatedFiles
    });
  };

  Uppy.prototype.setFileMeta = function setFileMeta(fileID, data) {
    var updatedFiles = _extends({}, this.getState().files);
    if (!updatedFiles[fileID]) {
      this.log('Was trying to set metadata for a file that’s not with us anymore: ', fileID);
      return;
    }
    var newMeta = _extends({}, updatedFiles[fileID].meta, data);
    updatedFiles[fileID] = _extends({}, updatedFiles[fileID], {
      meta: newMeta
    });
    this.setState({ files: updatedFiles });
  };

  /**
   * Get a file object.
   *
   * @param {string} fileID The ID of the file object to return.
   */


  Uppy.prototype.getFile = function getFile(fileID) {
    return this.getState().files[fileID];
  };

  /**
   * Get all files in an array.
   */


  Uppy.prototype.getFiles = function getFiles() {
    var _getState = this.getState(),
        files = _getState.files;

    return Object.keys(files).map(function (fileID) {
      return files[fileID];
    });
  };

  /**
  * Check if minNumberOfFiles restriction is reached before uploading.
  *
  * @private
  */


  Uppy.prototype._checkMinNumberOfFiles = function _checkMinNumberOfFiles(files) {
    var minNumberOfFiles = this.opts.restrictions.minNumberOfFiles;

    if (Object.keys(files).length < minNumberOfFiles) {
      throw new Error('' + this.i18n('youHaveToAtLeastSelectX', { smart_count: minNumberOfFiles }));
    }
  };

  /**
  * Check if file passes a set of restrictions set in options: maxFileSize,
  * maxNumberOfFiles and allowedFileTypes.
  *
  * @param {object} file object to check
  * @private
  */


  Uppy.prototype._checkRestrictions = function _checkRestrictions(file) {
    var _opts$restrictions = this.opts.restrictions,
        maxFileSize = _opts$restrictions.maxFileSize,
        maxNumberOfFiles = _opts$restrictions.maxNumberOfFiles,
        allowedFileTypes = _opts$restrictions.allowedFileTypes;


    if (maxNumberOfFiles) {
      if (Object.keys(this.getState().files).length + 1 > maxNumberOfFiles) {
        throw new Error('' + this.i18n('youCanOnlyUploadX', { smart_count: maxNumberOfFiles }));
      }
    }

    if (allowedFileTypes) {
      var isCorrectFileType = allowedFileTypes.some(function (type) {
        // if (!file.type) return false

        // is this is a mime-type
        if (type.indexOf('/') > -1) {
          if (!file.type) return false;
          return match(file.type, type);
        }

        // otherwise this is likely an extension
        if (type[0] === '.') {
          return file.extension.toLowerCase() === type.substr(1).toLowerCase();
        }
        return false;
      });

      if (!isCorrectFileType) {
        var allowedFileTypesString = allowedFileTypes.join(', ');
        throw new Error(this.i18n('youCanOnlyUploadFileTypes', { types: allowedFileTypesString }));
      }
    }

    if (maxFileSize) {
      if (file.data.size > maxFileSize) {
        throw new Error(this.i18n('exceedsSize') + ' ' + prettyBytes(maxFileSize));
      }
    }
  };

  /**
  * Add a new file to `state.files`. This will run `onBeforeFileAdded`,
  * try to guess file type in a clever way, check file against restrictions,
  * and start an upload if `autoProceed === true`.
  *
  * @param {object} file object to add
  */


  Uppy.prototype.addFile = function addFile(file) {
    var _this2 = this,
        _extends3;

    var _getState2 = this.getState(),
        files = _getState2.files,
        allowNewUpload = _getState2.allowNewUpload;

    var onError = function onError(msg) {
      var err = (typeof msg === 'undefined' ? 'undefined' : _typeof(msg)) === 'object' ? msg : new Error(msg);
      _this2.log(err.message);
      _this2.info(err.message, 'error', 5000);
      throw err;
    };

    if (allowNewUpload === false) {
      onError(new Error('Cannot add new files: already uploading.'));
    }

    var onBeforeFileAddedResult = this.opts.onBeforeFileAdded(file, files);

    if (onBeforeFileAddedResult === false) {
      this.log('Not adding file because onBeforeFileAdded returned false');
      return;
    }

    if ((typeof onBeforeFileAddedResult === 'undefined' ? 'undefined' : _typeof(onBeforeFileAddedResult)) === 'object' && onBeforeFileAddedResult) {
      // warning after the change in 0.24
      if (onBeforeFileAddedResult.then) {
        throw new TypeError('onBeforeFileAdded() returned a Promise, but this is no longer supported. It must be synchronous.');
      }
      file = onBeforeFileAddedResult;
    }

    var fileType = getFileType(file);
    var fileName = void 0;
    if (file.name) {
      fileName = file.name;
    } else if (fileType.split('/')[0] === 'image') {
      fileName = fileType.split('/')[0] + '.' + fileType.split('/')[1];
    } else {
      fileName = 'noname';
    }
    var fileExtension = getFileNameAndExtension(fileName).extension;
    var isRemote = file.isRemote || false;

    var fileID = generateFileID(file);

    var meta = file.meta || {};
    meta.name = fileName;
    meta.type = fileType;

    var newFile = {
      source: file.source || '',
      id: fileID,
      name: fileName,
      extension: fileExtension || '',
      meta: _extends({}, this.getState().meta, meta),
      type: fileType,
      data: file.data,
      progress: {
        percentage: 0,
        bytesUploaded: 0,
        bytesTotal: file.data.size || 0,
        uploadComplete: false,
        uploadStarted: false
      },
      size: file.data.size || 0,
      isRemote: isRemote,
      remote: file.remote || '',
      preview: file.preview
    };

    try {
      this._checkRestrictions(newFile);
    } catch (err) {
      onError(err);
    }

    this.setState({
      files: _extends({}, files, (_extends3 = {}, _extends3[fileID] = newFile, _extends3))
    });

    this.emit('file-added', newFile);
    this.log('Added file: ' + fileName + ', ' + fileID + ', mime type: ' + fileType);

    if (this.opts.autoProceed && !this.scheduledAutoProceed) {
      this.scheduledAutoProceed = setTimeout(function () {
        _this2.scheduledAutoProceed = null;
        _this2.upload().catch(function (err) {
          console.error(err.stack || err.message || err);
        });
      }, 4);
    }
  };

  Uppy.prototype.removeFile = function removeFile(fileID) {
    var _this3 = this;

    var _getState3 = this.getState(),
        files = _getState3.files,
        currentUploads = _getState3.currentUploads;

    var updatedFiles = _extends({}, files);
    var removedFile = updatedFiles[fileID];
    delete updatedFiles[fileID];

    // Remove this file from its `currentUpload`.
    var updatedUploads = _extends({}, currentUploads);
    var removeUploads = [];
    Object.keys(updatedUploads).forEach(function (uploadID) {
      var newFileIDs = currentUploads[uploadID].fileIDs.filter(function (uploadFileID) {
        return uploadFileID !== fileID;
      });
      // Remove the upload if no files are associated with it anymore.
      if (newFileIDs.length === 0) {
        removeUploads.push(uploadID);
        return;
      }

      updatedUploads[uploadID] = _extends({}, currentUploads[uploadID], {
        fileIDs: newFileIDs
      });
    });

    this.setState({
      currentUploads: updatedUploads,
      files: updatedFiles
    });

    removeUploads.forEach(function (uploadID) {
      _this3._removeUpload(uploadID);
    });

    this._calculateTotalProgress();
    this.emit('file-removed', removedFile);
    this.log('File removed: ' + removedFile.id);
  };

  Uppy.prototype.pauseResume = function pauseResume(fileID) {
    if (!this.getState().capabilities.resumableUploads || this.getFile(fileID).uploadComplete) {
      return;
    }

    var wasPaused = this.getFile(fileID).isPaused || false;
    var isPaused = !wasPaused;

    this.setFileState(fileID, {
      isPaused: isPaused
    });

    this.emit('upload-pause', fileID, isPaused);

    return isPaused;
  };

  Uppy.prototype.pauseAll = function pauseAll() {
    var updatedFiles = _extends({}, this.getState().files);
    var inProgressUpdatedFiles = Object.keys(updatedFiles).filter(function (file) {
      return !updatedFiles[file].progress.uploadComplete && updatedFiles[file].progress.uploadStarted;
    });

    inProgressUpdatedFiles.forEach(function (file) {
      var updatedFile = _extends({}, updatedFiles[file], {
        isPaused: true
      });
      updatedFiles[file] = updatedFile;
    });
    this.setState({ files: updatedFiles });

    this.emit('pause-all');
  };

  Uppy.prototype.resumeAll = function resumeAll() {
    var updatedFiles = _extends({}, this.getState().files);
    var inProgressUpdatedFiles = Object.keys(updatedFiles).filter(function (file) {
      return !updatedFiles[file].progress.uploadComplete && updatedFiles[file].progress.uploadStarted;
    });

    inProgressUpdatedFiles.forEach(function (file) {
      var updatedFile = _extends({}, updatedFiles[file], {
        isPaused: false,
        error: null
      });
      updatedFiles[file] = updatedFile;
    });
    this.setState({ files: updatedFiles });

    this.emit('resume-all');
  };

  Uppy.prototype.retryAll = function retryAll() {
    var updatedFiles = _extends({}, this.getState().files);
    var filesToRetry = Object.keys(updatedFiles).filter(function (file) {
      return updatedFiles[file].error;
    });

    filesToRetry.forEach(function (file) {
      var updatedFile = _extends({}, updatedFiles[file], {
        isPaused: false,
        error: null
      });
      updatedFiles[file] = updatedFile;
    });
    this.setState({
      files: updatedFiles,
      error: null
    });

    this.emit('retry-all', filesToRetry);

    var uploadID = this._createUpload(filesToRetry);
    return this._runUpload(uploadID);
  };

  Uppy.prototype.cancelAll = function cancelAll() {
    var _this4 = this;

    this.emit('cancel-all');

    var files = Object.keys(this.getState().files);
    files.forEach(function (fileID) {
      _this4.removeFile(fileID);
    });

    this.setState({
      allowNewUpload: true,
      totalProgress: 0,
      error: null
    });
  };

  Uppy.prototype.retryUpload = function retryUpload(fileID) {
    var updatedFiles = _extends({}, this.getState().files);
    var updatedFile = _extends({}, updatedFiles[fileID], { error: null, isPaused: false });
    updatedFiles[fileID] = updatedFile;
    this.setState({
      files: updatedFiles
    });

    this.emit('upload-retry', fileID);

    var uploadID = this._createUpload([fileID]);
    return this._runUpload(uploadID);
  };

  Uppy.prototype.reset = function reset() {
    this.cancelAll();
  };

  Uppy.prototype._calculateProgress = function _calculateProgress(file, data) {
    if (!this.getFile(file.id)) {
      this.log('Not setting progress for a file that has been removed: ' + file.id);
      return;
    }

    this.setFileState(file.id, {
      progress: _extends({}, this.getFile(file.id).progress, {
        bytesUploaded: data.bytesUploaded,
        bytesTotal: data.bytesTotal,
        percentage: Math.floor((data.bytesUploaded / data.bytesTotal * 100).toFixed(2))
      })
    });

    this._calculateTotalProgress();
  };

  Uppy.prototype._calculateTotalProgress = function _calculateTotalProgress() {
    // calculate total progress, using the number of files currently uploading,
    // multiplied by 100 and the summ of individual progress of each file
    var files = this.getFiles();

    var inProgress = files.filter(function (file) {
      return file.progress.uploadStarted;
    });

    if (inProgress.length === 0) {
      this.emit('progress', 0);
      this.setState({ totalProgress: 0 });
      return;
    }

    var sizedFiles = inProgress.filter(function (file) {
      return file.progress.bytesTotal != null;
    });
    var unsizedFiles = inProgress.filter(function (file) {
      return file.progress.bytesTotal == null;
    });

    if (sizedFiles.length === 0) {
      var progressMax = inProgress.length;
      var currentProgress = unsizedFiles.reduce(function (acc, file) {
        return acc + file.progress.percentage;
      }, 0);
      var _totalProgress = Math.round(currentProgress / progressMax * 100);
      this.setState({ totalProgress: _totalProgress });
      return;
    }

    var totalSize = sizedFiles.reduce(function (acc, file) {
      return acc + file.progress.bytesTotal;
    }, 0);
    var averageSize = totalSize / sizedFiles.length;
    totalSize += averageSize * unsizedFiles.length;

    var uploadedSize = 0;
    sizedFiles.forEach(function (file) {
      uploadedSize += file.progress.bytesUploaded;
    });
    unsizedFiles.forEach(function (file) {
      uploadedSize += averageSize * (file.progress.percentage || 0);
    });

    var totalProgress = totalSize === 0 ? 0 : Math.round(uploadedSize / totalSize * 100);

    this.setState({ totalProgress: totalProgress });
    this.emit('progress', totalProgress);
  };

  /**
   * Registers listeners for all global actions, like:
   * `error`, `file-removed`, `upload-progress`
   */


  Uppy.prototype._addListeners = function _addListeners() {
    var _this5 = this;

    this.on('error', function (error) {
      _this5.setState({ error: error.message });
    });

    this.on('upload-error', function (file, error, response) {
      _this5.setFileState(file.id, {
        error: error.message,
        response: response
      });

      _this5.setState({ error: error.message });

      var message = _this5.i18n('failedToUpload', { file: file.name });
      if ((typeof error === 'undefined' ? 'undefined' : _typeof(error)) === 'object' && error.message) {
        message = { message: message, details: error.message };
      }
      _this5.info(message, 'error', 5000);
    });

    this.on('upload', function () {
      _this5.setState({ error: null });
    });

    this.on('upload-started', function (file, upload) {
      if (!_this5.getFile(file.id)) {
        _this5.log('Not setting progress for a file that has been removed: ' + file.id);
        return;
      }
      _this5.setFileState(file.id, {
        progress: {
          uploadStarted: Date.now(),
          uploadComplete: false,
          percentage: 0,
          bytesUploaded: 0,
          bytesTotal: file.size
        }
      });
    });

    // upload progress events can occur frequently, especially when you have a good
    // connection to the remote server. Therefore, we are throtteling them to
    // prevent accessive function calls.
    // see also: https://github.com/tus/tus-js-client/commit/9940f27b2361fd7e10ba58b09b60d82422183bbb
    // const _throttledCalculateProgress = throttle(this._calculateProgress, 100, { leading: true, trailing: true })

    this.on('upload-progress', this._calculateProgress);

    this.on('upload-success', function (file, uploadResp) {
      var currentProgress = _this5.getFile(file.id).progress;
      _this5.setFileState(file.id, {
        progress: _extends({}, currentProgress, {
          uploadComplete: true,
          percentage: 100,
          bytesUploaded: currentProgress.bytesTotal
        }),
        response: uploadResp,
        uploadURL: uploadResp.uploadURL,
        isPaused: false
      });

      _this5._calculateTotalProgress();
    });

    this.on('preprocess-progress', function (file, progress) {
      if (!_this5.getFile(file.id)) {
        _this5.log('Not setting progress for a file that has been removed: ' + file.id);
        return;
      }
      _this5.setFileState(file.id, {
        progress: _extends({}, _this5.getFile(file.id).progress, {
          preprocess: progress
        })
      });
    });

    this.on('preprocess-complete', function (file) {
      if (!_this5.getFile(file.id)) {
        _this5.log('Not setting progress for a file that has been removed: ' + file.id);
        return;
      }
      var files = _extends({}, _this5.getState().files);
      files[file.id] = _extends({}, files[file.id], {
        progress: _extends({}, files[file.id].progress)
      });
      delete files[file.id].progress.preprocess;

      _this5.setState({ files: files });
    });

    this.on('postprocess-progress', function (file, progress) {
      if (!_this5.getFile(file.id)) {
        _this5.log('Not setting progress for a file that has been removed: ' + file.id);
        return;
      }
      _this5.setFileState(file.id, {
        progress: _extends({}, _this5.getState().files[file.id].progress, {
          postprocess: progress
        })
      });
    });

    this.on('postprocess-complete', function (file) {
      if (!_this5.getFile(file.id)) {
        _this5.log('Not setting progress for a file that has been removed: ' + file.id);
        return;
      }
      var files = _extends({}, _this5.getState().files);
      files[file.id] = _extends({}, files[file.id], {
        progress: _extends({}, files[file.id].progress)
      });
      delete files[file.id].progress.postprocess;
      // TODO should we set some kind of `fullyComplete` property on the file object
      // so it's easier to see that the file is upload…fully complete…rather than
      // what we have to do now (`uploadComplete && !postprocess`)

      _this5.setState({ files: files });
    });

    this.on('restored', function () {
      // Files may have changed--ensure progress is still accurate.
      _this5._calculateTotalProgress();
    });

    // show informer if offline
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('online', function () {
        return _this5.updateOnlineStatus();
      });
      window.addEventListener('offline', function () {
        return _this5.updateOnlineStatus();
      });
      setTimeout(function () {
        return _this5.updateOnlineStatus();
      }, 3000);
    }
  };

  Uppy.prototype.updateOnlineStatus = function updateOnlineStatus() {
    var online = typeof window.navigator.onLine !== 'undefined' ? window.navigator.onLine : true;
    if (!online) {
      this.emit('is-offline');
      this.info(this.i18n('noInternetConnection'), 'error', 0);
      this.wasOffline = true;
    } else {
      this.emit('is-online');
      if (this.wasOffline) {
        this.emit('back-online');
        this.info(this.i18n('connectedToInternet'), 'success', 3000);
        this.wasOffline = false;
      }
    }
  };

  Uppy.prototype.getID = function getID() {
    return this.opts.id;
  };

  /**
   * Registers a plugin with Core.
   *
   * @param {object} Plugin object
   * @param {object} [opts] object with options to be passed to Plugin
   * @return {Object} self for chaining
   */


  Uppy.prototype.use = function use(Plugin, opts) {
    if (typeof Plugin !== 'function') {
      var msg = 'Expected a plugin class, but got ' + (Plugin === null ? 'null' : typeof Plugin === 'undefined' ? 'undefined' : _typeof(Plugin)) + '.' + ' Please verify that the plugin was imported and spelled correctly.';
      throw new TypeError(msg);
    }

    // Instantiate
    var plugin = new Plugin(this, opts);
    var pluginId = plugin.id;
    this.plugins[plugin.type] = this.plugins[plugin.type] || [];

    if (!pluginId) {
      throw new Error('Your plugin must have an id');
    }

    if (!plugin.type) {
      throw new Error('Your plugin must have a type');
    }

    var existsPluginAlready = this.getPlugin(pluginId);
    if (existsPluginAlready) {
      var _msg = 'Already found a plugin named \'' + existsPluginAlready.id + '\'. ' + ('Tried to use: \'' + pluginId + '\'.\n') + 'Uppy plugins must have unique \'id\' options. See https://uppy.io/docs/plugins/#id.';
      throw new Error(_msg);
    }

    this.plugins[plugin.type].push(plugin);
    plugin.install();

    return this;
  };

  /**
   * Find one Plugin by name.
   *
   * @param {string} id plugin id
   * @return {object | boolean}
   */


  Uppy.prototype.getPlugin = function getPlugin(id) {
    var foundPlugin = null;
    this.iteratePlugins(function (plugin) {
      if (plugin.id === id) {
        foundPlugin = plugin;
        return false;
      }
    });
    return foundPlugin;
  };

  /**
   * Iterate through all `use`d plugins.
   *
   * @param {function} method that will be run on each plugin
   */


  Uppy.prototype.iteratePlugins = function iteratePlugins(method) {
    var _this6 = this;

    Object.keys(this.plugins).forEach(function (pluginType) {
      _this6.plugins[pluginType].forEach(method);
    });
  };

  /**
   * Uninstall and remove a plugin.
   *
   * @param {object} instance The plugin instance to remove.
   */


  Uppy.prototype.removePlugin = function removePlugin(instance) {
    this.log('Removing plugin ' + instance.id);
    this.emit('plugin-remove', instance);

    if (instance.uninstall) {
      instance.uninstall();
    }

    var list = this.plugins[instance.type].slice();
    var index = list.indexOf(instance);
    if (index !== -1) {
      list.splice(index, 1);
      this.plugins[instance.type] = list;
    }

    var updatedState = this.getState();
    delete updatedState.plugins[instance.id];
    this.setState(updatedState);
  };

  /**
   * Uninstall all plugins and close down this Uppy instance.
   */


  Uppy.prototype.close = function close() {
    var _this7 = this;

    this.log('Closing Uppy instance ' + this.opts.id + ': removing all files and uninstalling plugins');

    this.reset();

    this._storeUnsubscribe();

    this.iteratePlugins(function (plugin) {
      _this7.removePlugin(plugin);
    });
  };

  /**
  * Set info message in `state.info`, so that UI plugins like `Informer`
  * can display the message.
  *
  * @param {string | object} message Message to be displayed by the informer
  * @param {string} [type]
  * @param {number} [duration]
  */

  Uppy.prototype.info = function info(message) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'info';
    var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 3000;

    var isComplexMessage = (typeof message === 'undefined' ? 'undefined' : _typeof(message)) === 'object';

    this.setState({
      info: {
        isHidden: false,
        type: type,
        message: isComplexMessage ? message.message : message,
        details: isComplexMessage ? message.details : null
      }
    });

    this.emit('info-visible');

    clearTimeout(this.infoTimeoutID);
    if (duration === 0) {
      this.infoTimeoutID = undefined;
      return;
    }

    // hide the informer after `duration` milliseconds
    this.infoTimeoutID = setTimeout(this.hideInfo, duration);
  };

  Uppy.prototype.hideInfo = function hideInfo() {
    var newInfo = _extends({}, this.getState().info, {
      isHidden: true
    });
    this.setState({
      info: newInfo
    });
    this.emit('info-hidden');
  };

  /**
   * Logs stuff to console, only if `debug` is set to true. Silent in production.
   *
   * @param {String|Object} msg to log
   * @param {String} [type] optional `error` or `warning`
   */


  Uppy.prototype.log = function log(msg, type) {
    if (!this.opts.debug) {
      return;
    }

    var message = '[Uppy] [' + getTimeStamp() + '] ' + msg;

    window['uppyLog'] = window['uppyLog'] + '\n' + 'DEBUG LOG: ' + msg;

    if (type === 'error') {
      console.error(message);
      return;
    }

    if (type === 'warning') {
      console.warn(message);
      return;
    }

    if (msg === '' + msg) {
      console.log(message);
    } else {
      message = '[Uppy] [' + getTimeStamp() + ']';
      console.log(message);
      console.dir(msg);
    }
  };

  /**
   * Obsolete, event listeners are now added in the constructor.
   */


  Uppy.prototype.run = function run() {
    this.log('Calling run() is no longer necessary.', 'warning');
    return this;
  };

  /**
   * Restore an upload by its ID.
   */


  Uppy.prototype.restore = function restore(uploadID) {
    this.log('Core: attempting to restore upload "' + uploadID + '"');

    if (!this.getState().currentUploads[uploadID]) {
      this._removeUpload(uploadID);
      return Promise.reject(new Error('Nonexistent upload'));
    }

    return this._runUpload(uploadID);
  };

  /**
   * Create an upload for a bunch of files.
   *
   * @param {Array<string>} fileIDs File IDs to include in this upload.
   * @return {string} ID of this upload.
   */


  Uppy.prototype._createUpload = function _createUpload(fileIDs) {
    var _extends4;

    var _getState4 = this.getState(),
        allowNewUpload = _getState4.allowNewUpload,
        currentUploads = _getState4.currentUploads;

    if (!allowNewUpload) {
      throw new Error('Cannot create a new upload: already uploading.');
    }

    var uploadID = cuid();

    this.emit('upload', {
      id: uploadID,
      fileIDs: fileIDs
    });

    this.setState({
      allowNewUpload: this.opts.allowMultipleUploads !== false,

      currentUploads: _extends({}, currentUploads, (_extends4 = {}, _extends4[uploadID] = {
        fileIDs: fileIDs,
        step: 0,
        result: {}
      }, _extends4))
    });

    return uploadID;
  };

  Uppy.prototype._getUpload = function _getUpload(uploadID) {
    var _getState5 = this.getState(),
        currentUploads = _getState5.currentUploads;

    return currentUploads[uploadID];
  };

  /**
   * Add data to an upload's result object.
   *
   * @param {string} uploadID The ID of the upload.
   * @param {object} data Data properties to add to the result object.
   */


  Uppy.prototype.addResultData = function addResultData(uploadID, data) {
    var _extends5;

    if (!this._getUpload(uploadID)) {
      this.log('Not setting result for an upload that has been removed: ' + uploadID);
      return;
    }
    var currentUploads = this.getState().currentUploads;
    var currentUpload = _extends({}, currentUploads[uploadID], {
      result: _extends({}, currentUploads[uploadID].result, data)
    });
    this.setState({
      currentUploads: _extends({}, currentUploads, (_extends5 = {}, _extends5[uploadID] = currentUpload, _extends5))
    });
  };

  /**
   * Remove an upload, eg. if it has been canceled or completed.
   *
   * @param {string} uploadID The ID of the upload.
   */


  Uppy.prototype._removeUpload = function _removeUpload(uploadID) {
    var currentUploads = _extends({}, this.getState().currentUploads);
    delete currentUploads[uploadID];

    this.setState({
      currentUploads: currentUploads
    });
  };

  /**
   * Run an upload. This picks up where it left off in case the upload is being restored.
   *
   * @private
   */


  Uppy.prototype._runUpload = function _runUpload(uploadID) {
    var _this8 = this;

    var uploadData = this.getState().currentUploads[uploadID];
    var restoreStep = uploadData.step;

    var steps = [].concat(this.preProcessors, this.uploaders, this.postProcessors);
    var lastStep = Promise.resolve();
    steps.forEach(function (fn, step) {
      // Skip this step if we are restoring and have already completed this step before.
      if (step < restoreStep) {
        return;
      }

      lastStep = lastStep.then(function () {
        var _extends6;

        var _getState6 = _this8.getState(),
            currentUploads = _getState6.currentUploads;

        var currentUpload = _extends({}, currentUploads[uploadID], {
          step: step
        });
        _this8.setState({
          currentUploads: _extends({}, currentUploads, (_extends6 = {}, _extends6[uploadID] = currentUpload, _extends6))
        });

        // TODO give this the `currentUpload` object as its only parameter maybe?
        // Otherwise when more metadata may be added to the upload this would keep getting more parameters
        return fn(currentUpload.fileIDs, uploadID);
      }).then(function (result) {
        return null;
      });
    });

    // Not returning the `catch`ed promise, because we still want to return a rejected
    // promise from this method if the upload failed.
    lastStep.catch(function (err) {
      _this8.emit('error', err, uploadID);
      _this8._removeUpload(uploadID);
    });

    return lastStep.then(function () {
      // Set result data.
      var _getState7 = _this8.getState(),
          currentUploads = _getState7.currentUploads;

      var currentUpload = currentUploads[uploadID];
      if (!currentUpload) {
        _this8.log('Not setting result for an upload that has been removed: ' + uploadID);
        return;
      }

      var files = currentUpload.fileIDs.map(function (fileID) {
        return _this8.getFile(fileID);
      });
      var successful = files.filter(function (file) {
        return !file.error;
      });
      var failed = files.filter(function (file) {
        return file.error;
      });
      _this8.addResultData(uploadID, { successful: successful, failed: failed, uploadID: uploadID });
    }).then(function () {
      // Emit completion events.
      // This is in a separate function so that the `currentUploads` variable
      // always refers to the latest state. In the handler right above it refers
      // to an outdated object without the `.result` property.
      var _getState8 = _this8.getState(),
          currentUploads = _getState8.currentUploads;

      if (!currentUploads[uploadID]) {
        _this8.log('Not setting result for an upload that has been canceled: ' + uploadID);
        return;
      }
      var currentUpload = currentUploads[uploadID];
      var result = currentUpload.result;
      _this8.emit('complete', result);

      _this8._removeUpload(uploadID);

      return result;
    });
  };

  /**
   * Start an upload for all the files that are not currently being uploaded.
   *
   * @return {Promise}
   */


  Uppy.prototype.upload = function upload() {
    var _this9 = this;

    if (!this.plugins.uploader) {
      this.log('No uploader type plugins are used', 'warning');
    }

    var files = this.getState().files;
    var onBeforeUploadResult = this.opts.onBeforeUpload(files);

    if (onBeforeUploadResult === false) {
      return Promise.reject(new Error('Not starting the upload because onBeforeUpload returned false'));
    }

    if (onBeforeUploadResult && (typeof onBeforeUploadResult === 'undefined' ? 'undefined' : _typeof(onBeforeUploadResult)) === 'object') {
      // warning after the change in 0.24
      if (onBeforeUploadResult.then) {
        throw new TypeError('onBeforeUpload() returned a Promise, but this is no longer supported. It must be synchronous.');
      }

      files = onBeforeUploadResult;
    }

    return Promise.resolve().then(function () {
      return _this9._checkMinNumberOfFiles(files);
    }).then(function () {
      var _getState9 = _this9.getState(),
          currentUploads = _getState9.currentUploads;
      // get a list of files that are currently assigned to uploads


      var currentlyUploadingFiles = Object.keys(currentUploads).reduce(function (prev, curr) {
        return prev.concat(currentUploads[curr].fileIDs);
      }, []);

      var waitingFileIDs = [];
      Object.keys(files).forEach(function (fileID) {
        var file = _this9.getFile(fileID);
        // if the file hasn't started uploading and hasn't already been assigned to an upload..
        if (!file.progress.uploadStarted && currentlyUploadingFiles.indexOf(fileID) === -1) {
          waitingFileIDs.push(file.id);
        }
      });

      var uploadID = _this9._createUpload(waitingFileIDs);
      return _this9._runUpload(uploadID);
    }).catch(function (err) {
      var message = (typeof err === 'undefined' ? 'undefined' : _typeof(err)) === 'object' ? err.message : err;
      var details = (typeof err === 'undefined' ? 'undefined' : _typeof(err)) === 'object' ? err.details : null;
      _this9.log(message + ' ' + details);
      _this9.info({ message: message, details: details }, 'error', 4000);
      return Promise.reject((typeof err === 'undefined' ? 'undefined' : _typeof(err)) === 'object' ? err : new Error(err));
    });
  };

  _createClass(Uppy, [{
    key: 'state',
    get: function get() {
      return this.getState();
    }
  }]);

  return Uppy;
}();

module.exports = function (opts) {
  return new Uppy(opts);
};

// Expose class constructor.
module.exports.Uppy = Uppy;
module.exports.Plugin = Plugin;

},{"./../../store-default":25,"./../../utils/lib/Translator":26,"./../../utils/lib/generateFileID":29,"./../../utils/lib/getFileNameAndExtension":30,"./../../utils/lib/getFileType":31,"./../../utils/lib/getTimeStamp":33,"./Plugin":20,"./supportsUploadProgress":22,"cuid":1,"mime-match":8,"namespace-emitter":9,"prettier-bytes":11}],22:[function(require,module,exports){
// Edge 15.x does not fire 'progress' events on uploads.
// See https://github.com/transloadit/uppy/issues/945
// And https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/12224510/
module.exports = function supportsUploadProgress(userAgent) {
  // Allow passing in userAgent for tests
  if (userAgent == null) {
    userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null;
  }
  // Assume it works because basically everything supports progress events.
  if (!userAgent) return true;

  var m = /Edge\/(\d+\.\d+)/.exec(userAgent);
  if (!m) return true;

  var edgeVersion = m[1];

  var _edgeVersion$split = edgeVersion.split('.'),
      major = _edgeVersion$split[0],
      minor = _edgeVersion$split[1];

  major = parseInt(major, 10);
  minor = parseInt(minor, 10);

  // Worked before:
  // Edge 40.15063.0.0
  // Microsoft EdgeHTML 15.15063
  if (major < 15 || major === 15 && minor < 15063) {
    return true;
  }

  // Fixed in:
  // Microsoft EdgeHTML 18.18218
  if (major > 18 || major === 18 && minor >= 18218) {
    return true;
  }

  // other versions don't work.
  return false;
};

},{}],23:[function(require,module,exports){
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('./../../core'),
    Plugin = _require.Plugin;

var toArray = require('./../../utils/lib/toArray');
var Translator = require('./../../utils/lib/Translator');

var _require2 = require('preact'),
    h = _require2.h;

module.exports = function (_Plugin) {
  _inherits(FileInput, _Plugin);

  function FileInput(uppy, opts) {
    _classCallCheck(this, FileInput);

    var _this = _possibleConstructorReturn(this, _Plugin.call(this, uppy, opts));

    _this.id = _this.opts.id || 'FileInput';
    _this.title = 'File Input';
    _this.type = 'acquirer';

    var defaultLocale = {
      strings: {
        chooseFiles: 'Choose files'
      }

      // Default options
    };var defaultOptions = {
      target: null,
      pretty: true,
      inputName: 'files[]',
      locale: defaultLocale

      // Merge default options with the ones set by user
    };_this.opts = _extends({}, defaultOptions, opts);

    // i18n
    _this.translator = new Translator([defaultLocale, _this.uppy.locale, _this.opts.locale]);
    _this.i18n = _this.translator.translate.bind(_this.translator);
    _this.i18nArray = _this.translator.translateArray.bind(_this.translator);

    _this.render = _this.render.bind(_this);
    _this.handleInputChange = _this.handleInputChange.bind(_this);
    _this.handleClick = _this.handleClick.bind(_this);
    return _this;
  }

  FileInput.prototype.handleInputChange = function handleInputChange(ev) {
    var _this2 = this;

    this.uppy.log('[FileInput] Something selected through input...');

    var files = toArray(ev.target.files);

    files.forEach(function (file) {
      try {
        _this2.uppy.addFile({
          source: _this2.id,
          name: file.name,
          type: file.type,
          data: file
        });
      } catch (err) {
        // Nothing, restriction errors handled in Core
      }
    });
  };

  FileInput.prototype.handleClick = function handleClick(ev) {
    this.input.click();
  };

  FileInput.prototype.render = function render(state) {
    var _this3 = this;

    /* http://tympanus.net/codrops/2015/09/15/styling-customizing-file-inputs-smart-way/ */
    var hiddenInputStyle = {
      width: '0.1px',
      height: '0.1px',
      opacity: 0,
      overflow: 'hidden',
      position: 'absolute',
      zIndex: -1
    };

    var restrictions = this.uppy.opts.restrictions;
    var accept = restrictions.allowedFileTypes ? restrictions.allowedFileTypes.join(',') : null;

    // empty value="" on file input, so that the input is cleared after a file is selected,
    // because Uppy will be handling the upload and so we can select same file
    // after removing — otherwise browser thinks it’s already selected
    return h(
      'div',
      { 'class': 'uppy-Root uppy-FileInput-container' },
      h('input', { 'class': 'uppy-FileInput-input',
        style: this.opts.pretty && hiddenInputStyle,
        type: 'file',
        name: this.opts.inputName,
        onchange: this.handleInputChange,
        multiple: restrictions.maxNumberOfFiles !== 1,
        accept: accept,
        ref: function ref(input) {
          _this3.input = input;
        },
        value: '' }),
      this.opts.pretty && h(
        'button',
        { 'class': 'uppy-FileInput-btn', type: 'button', onclick: this.handleClick },
        this.i18n('chooseFiles')
      )
    );
  };

  FileInput.prototype.install = function install() {
    var target = this.opts.target;
    if (target) {
      this.mount(target, this);
    }
  };

  FileInput.prototype.uninstall = function uninstall() {
    this.unmount();
  };

  return FileInput;
}(Plugin);

},{"./../../core":21,"./../../utils/lib/Translator":26,"./../../utils/lib/toArray":38,"preact":10}],24:[function(require,module,exports){
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('./../../core'),
    Plugin = _require.Plugin;

var _require2 = require('preact'),
    h = _require2.h;

/**
 * Progress bar
 *
 */


module.exports = function (_Plugin) {
  _inherits(ProgressBar, _Plugin);

  function ProgressBar(uppy, opts) {
    _classCallCheck(this, ProgressBar);

    var _this = _possibleConstructorReturn(this, _Plugin.call(this, uppy, opts));

    _this.id = _this.opts.id || 'ProgressBar';
    _this.title = 'Progress Bar';
    _this.type = 'progressindicator';

    // set default options
    var defaultOptions = {
      target: 'body',
      replaceTargetContent: false,
      fixed: false,
      hideAfterFinish: true

      // merge default options with the ones set by user
    };_this.opts = _extends({}, defaultOptions, opts);

    _this.render = _this.render.bind(_this);
    return _this;
  }

  ProgressBar.prototype.render = function render(state) {
    var progress = state.totalProgress || 0;
    var isHidden = progress === 100 && this.opts.hideAfterFinish;
    return h(
      'div',
      { 'class': 'uppy uppy-ProgressBar', style: { position: this.opts.fixed ? 'fixed' : 'initial' }, 'aria-hidden': isHidden },
      h('div', { 'class': 'uppy-ProgressBar-inner', style: { width: progress + '%' } }),
      h(
        'div',
        { 'class': 'uppy-ProgressBar-percentage' },
        progress
      )
    );
  };

  ProgressBar.prototype.install = function install() {
    var target = this.opts.target;
    if (target) {
      this.mount(target, this);
    }
  };

  ProgressBar.prototype.uninstall = function uninstall() {
    this.unmount();
  };

  return ProgressBar;
}(Plugin);

},{"./../../core":21,"preact":10}],25:[function(require,module,exports){
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Default store that keeps state in a simple object.
 */
var DefaultStore = function () {
  function DefaultStore() {
    _classCallCheck(this, DefaultStore);

    this.state = {};
    this.callbacks = [];
  }

  DefaultStore.prototype.getState = function getState() {
    return this.state;
  };

  DefaultStore.prototype.setState = function setState(patch) {
    var prevState = _extends({}, this.state);
    var nextState = _extends({}, this.state, patch);

    this.state = nextState;
    this._publish(prevState, nextState, patch);
  };

  DefaultStore.prototype.subscribe = function subscribe(listener) {
    var _this = this;

    this.callbacks.push(listener);
    return function () {
      // Remove the listener.
      _this.callbacks.splice(_this.callbacks.indexOf(listener), 1);
    };
  };

  DefaultStore.prototype._publish = function _publish() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    this.callbacks.forEach(function (listener) {
      listener.apply(undefined, args);
    });
  };

  return DefaultStore;
}();

module.exports = function defaultStore() {
  return new DefaultStore();
};

},{}],26:[function(require,module,exports){
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Translates strings with interpolation & pluralization support.
 * Extensible with custom dictionaries and pluralization functions.
 *
 * Borrows heavily from and inspired by Polyglot https://github.com/airbnb/polyglot.js,
 * basically a stripped-down version of it. Differences: pluralization functions are not hardcoded
 * and can be easily added among with dictionaries, nested objects are used for pluralization
 * as opposed to `||||` delimeter
 *
 * Usage example: `translator.translate('files_chosen', {smart_count: 3})`
 *
 * @param {object|Array<object>} locale Locale or list of locales.
 */
module.exports = function () {
  function Translator(locales) {
    var _this = this;

    _classCallCheck(this, Translator);

    this.locale = {
      strings: {},
      pluralize: function pluralize(n) {
        if (n === 1) {
          return 0;
        }
        return 1;
      }
    };

    if (Array.isArray(locales)) {
      locales.forEach(function (locale) {
        return _this._apply(locale);
      });
    } else {
      this._apply(locales);
    }
  }

  Translator.prototype._apply = function _apply(locale) {
    if (!locale || !locale.strings) {
      return;
    }

    var prevLocale = this.locale;
    this.locale = _extends({}, prevLocale, {
      strings: _extends({}, prevLocale.strings, locale.strings)
    });
    this.locale.pluralize = locale.pluralize || prevLocale.pluralize;
  };

  /**
   * Takes a string with placeholder variables like `%{smart_count} file selected`
   * and replaces it with values from options `{smart_count: 5}`
   *
   * @license https://github.com/airbnb/polyglot.js/blob/master/LICENSE
   * taken from https://github.com/airbnb/polyglot.js/blob/master/lib/polyglot.js#L299
   *
   * @param {string} phrase that needs interpolation, with placeholders
   * @param {object} options with values that will be used to replace placeholders
   * @return {string} interpolated
   */


  Translator.prototype.interpolate = function interpolate(phrase, options) {
    var _String$prototype = String.prototype,
        split = _String$prototype.split,
        replace = _String$prototype.replace;

    var dollarRegex = /\$/g;
    var dollarBillsYall = '$$$$';
    var interpolated = [phrase];

    for (var arg in options) {
      if (arg !== '_' && options.hasOwnProperty(arg)) {
        // Ensure replacement value is escaped to prevent special $-prefixed
        // regex replace tokens. the "$$$$" is needed because each "$" needs to
        // be escaped with "$" itself, and we need two in the resulting output.
        var replacement = options[arg];
        if (typeof replacement === 'string') {
          replacement = replace.call(options[arg], dollarRegex, dollarBillsYall);
        }
        // We create a new `RegExp` each time instead of using a more-efficient
        // string replace so that the same argument can be replaced multiple times
        // in the same phrase.
        interpolated = insertReplacement(interpolated, new RegExp('%\\{' + arg + '\\}', 'g'), replacement);
      }
    }

    return interpolated;

    function insertReplacement(source, rx, replacement) {
      var newParts = [];
      source.forEach(function (chunk) {
        split.call(chunk, rx).forEach(function (raw, i, list) {
          if (raw !== '') {
            newParts.push(raw);
          }

          // Interlace with the `replacement` value
          if (i < list.length - 1) {
            newParts.push(replacement);
          }
        });
      });
      return newParts;
    }
  };

  /**
   * Public translate method
   *
   * @param {string} key
   * @param {object} options with values that will be used later to replace placeholders in string
   * @return {string} translated (and interpolated)
   */


  Translator.prototype.translate = function translate(key, options) {
    return this.translateArray(key, options).join('');
  };

  /**
   * Get a translation and return the translated and interpolated parts as an array.
   * @param {string} key
   * @param {object} options with values that will be used to replace placeholders
   * @return {Array} The translated and interpolated parts, in order.
   */


  Translator.prototype.translateArray = function translateArray(key, options) {
    if (options && typeof options.smart_count !== 'undefined') {
      var plural = this.locale.pluralize(options.smart_count);
      return this.interpolate(this.locale.strings[key][plural], options);
    }

    return this.interpolate(this.locale.strings[key], options);
  };

  return Translator;
}();

},{}],27:[function(require,module,exports){
var throttle = require('lodash.throttle');

function _emitSocketProgress(uploader, progressData, file) {
  var progress = progressData.progress,
      bytesUploaded = progressData.bytesUploaded,
      bytesTotal = progressData.bytesTotal;

  if (progress) {
    uploader.uppy.log('Upload progress: ' + progress);
    uploader.uppy.emit('upload-progress', file, {
      uploader: uploader,
      bytesUploaded: bytesUploaded,
      bytesTotal: bytesTotal
    });
  }
}

module.exports = throttle(_emitSocketProgress, 300, { leading: true, trailing: true });

},{"lodash.throttle":7}],28:[function(require,module,exports){
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var isDOMElement = require('./isDOMElement');

/**
 * Find a DOM element.
 *
 * @param {Node|string} element
 * @return {Node|null}
 */
module.exports = function findDOMElement(element) {
  var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

  if (typeof element === 'string') {
    return context.querySelector(element);
  }

  if ((typeof element === 'undefined' ? 'undefined' : _typeof(element)) === 'object' && isDOMElement(element)) {
    return element;
  }
};

},{"./isDOMElement":34}],29:[function(require,module,exports){
/**
 * Takes a file object and turns it into fileID, by converting file.name to lowercase,
 * removing extra characters and adding type, size and lastModified
 *
 * @param {Object} file
 * @return {String} the fileID
 *
 */
module.exports = function generateFileID(file) {
  // filter is needed to not join empty values with `-`
  return ['uppy', file.name ? file.name.toLowerCase().replace(/[^A-Z0-9]/ig, '') : '', file.type, file.data.size, file.data.lastModified].filter(function (val) {
    return val;
  }).join('-');
};

},{}],30:[function(require,module,exports){
/**
* Takes a full filename string and returns an object {name, extension}
*
* @param {string} fullFileName
* @return {object} {name, extension}
*/
module.exports = function getFileNameAndExtension(fullFileName) {
  var re = /(?:\.([^.]+))?$/;
  var fileExt = re.exec(fullFileName)[1];
  var fileName = fullFileName.replace('.' + fileExt, '');
  return {
    name: fileName,
    extension: fileExt
  };
};

},{}],31:[function(require,module,exports){
var getFileNameAndExtension = require('./getFileNameAndExtension');
var mimeTypes = require('./mimeTypes');

module.exports = function getFileType(file) {
  var fileExtension = file.name ? getFileNameAndExtension(file.name).extension : null;
  fileExtension = fileExtension ? fileExtension.toLowerCase() : null;

  if (file.isRemote) {
    // some remote providers do not support file types
    return file.type ? file.type : mimeTypes[fileExtension];
  }

  // check if mime type is set in the file object
  if (file.type) {
    return file.type;
  }

  // see if we can map extension to a mime type
  if (fileExtension && mimeTypes[fileExtension]) {
    return mimeTypes[fileExtension];
  }

  // if all fails, fall back to a generic byte stream type
  return 'application/octet-stream';
};

},{"./getFileNameAndExtension":30,"./mimeTypes":36}],32:[function(require,module,exports){
module.exports = function getSocketHost(url) {
  // get the host domain
  var regex = /^(?:https?:\/\/|\/\/)?(?:[^@\n]+@)?(?:www\.)?([^\n]+)/i;
  var host = regex.exec(url)[1];
  var socketProtocol = /^http:\/\//i.test(url) ? 'ws' : 'wss';

  return socketProtocol + '://' + host;
};

},{}],33:[function(require,module,exports){
/**
 * Returns a timestamp in the format of `hours:minutes:seconds`
*/
module.exports = function getTimeStamp() {
  var date = new Date();
  var hours = pad(date.getHours().toString());
  var minutes = pad(date.getMinutes().toString());
  var seconds = pad(date.getSeconds().toString());
  return hours + ':' + minutes + ':' + seconds;
};

/**
 * Adds zero to strings shorter than two characters
*/
function pad(str) {
  return str.length !== 2 ? 0 + str : str;
}

},{}],34:[function(require,module,exports){
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * Check if an object is a DOM element. Duck-typing based on `nodeType`.
 *
 * @param {*} obj
 */
module.exports = function isDOMElement(obj) {
  return obj && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && obj.nodeType === Node.ELEMENT_NODE;
};

},{}],35:[function(require,module,exports){
/**
 * Limit the amount of simultaneously pending Promises.
 * Returns a function that, when passed a function `fn`,
 * will make sure that at most `limit` calls to `fn` are pending.
 *
 * @param {number} limit
 * @return {function()}
 */
module.exports = function limitPromises(limit) {
  var pending = 0;
  var queue = [];
  return function (fn) {
    return function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var call = function call() {
        pending++;
        var promise = fn.apply(undefined, args);
        promise.then(onfinish, onfinish);
        return promise;
      };

      if (pending >= limit) {
        return new Promise(function (resolve, reject) {
          queue.push(function () {
            call().then(resolve, reject);
          });
        });
      }
      return call();
    };
  };
  function onfinish() {
    pending--;
    var next = queue.shift();
    if (next) next();
  }
};

},{}],36:[function(require,module,exports){
module.exports = {
  'md': 'text/markdown',
  'markdown': 'text/markdown',
  'mp4': 'video/mp4',
  'mp3': 'audio/mp3',
  'svg': 'image/svg+xml',
  'jpg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'yaml': 'text/yaml',
  'yml': 'text/yaml',
  'csv': 'text/csv',
  'avi': 'video/x-msvideo',
  'mks': 'video/x-matroska',
  'mkv': 'video/x-matroska',
  'mov': 'video/quicktime',
  'doc': 'application/msword',
  'docm': 'application/vnd.ms-word.document.macroenabled.12',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'dot': 'application/msword',
  'dotm': 'application/vnd.ms-word.template.macroenabled.12',
  'dotx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
  'xla': 'application/vnd.ms-excel',
  'xlam': 'application/vnd.ms-excel.addin.macroenabled.12',
  'xlc': 'application/vnd.ms-excel',
  'xlf': 'application/x-xliff+xml',
  'xlm': 'application/vnd.ms-excel',
  'xls': 'application/vnd.ms-excel',
  'xlsb': 'application/vnd.ms-excel.sheet.binary.macroenabled.12',
  'xlsm': 'application/vnd.ms-excel.sheet.macroenabled.12',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'xlt': 'application/vnd.ms-excel',
  'xltm': 'application/vnd.ms-excel.template.macroenabled.12',
  'xltx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
  'xlw': 'application/vnd.ms-excel'
};

},{}],37:[function(require,module,exports){
module.exports = function settle(promises) {
  var resolutions = [];
  var rejections = [];
  function resolved(value) {
    resolutions.push(value);
  }
  function rejected(error) {
    rejections.push(error);
  }

  var wait = Promise.all(promises.map(function (promise) {
    return promise.then(resolved, rejected);
  }));

  return wait.then(function () {
    return {
      successful: resolutions,
      failed: rejections
    };
  });
};

},{}],38:[function(require,module,exports){
/**
 * Converts list into array
*/
module.exports = function toArray(list) {
  return Array.prototype.slice.call(list || [], 0);
};

},{}],39:[function(require,module,exports){
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('./../../core'),
    Plugin = _require.Plugin;

var cuid = require('cuid');
var Translator = require('./../../utils/lib/Translator');

var _require2 = require('./../../companion-client'),
    Provider = _require2.Provider,
    RequestClient = _require2.RequestClient,
    Socket = _require2.Socket;

var emitSocketProgress = require('./../../utils/lib/emitSocketProgress');
var getSocketHost = require('./../../utils/lib/getSocketHost');
var settle = require('./../../utils/lib/settle');
var limitPromises = require('./../../utils/lib/limitPromises');

function buildResponseError(xhr, error) {
  // No error message
  if (!error) error = new Error('Upload error');
  // Got an error message string
  if (typeof error === 'string') error = new Error(error);
  // Got something else
  if (!(error instanceof Error)) {
    error = _extends(new Error('Upload error'), { data: error });
  }

  error.request = xhr;
  return error;
}

module.exports = function (_Plugin) {
  _inherits(XHRUpload, _Plugin);

  function XHRUpload(uppy, opts) {
    _classCallCheck(this, XHRUpload);

    var _this = _possibleConstructorReturn(this, _Plugin.call(this, uppy, opts));

    _this.type = 'uploader';
    _this.id = 'XHRUpload';
    _this.title = 'XHRUpload';

    var defaultLocale = {
      strings: {
        timedOut: 'Upload stalled for %{seconds} seconds, aborting.'
      }

      // Default options
    };var defaultOptions = {
      formData: true,
      fieldName: 'files[]',
      method: 'post',
      metaFields: null,
      responseUrlFieldName: 'url',
      bundle: false,
      headers: {},
      locale: defaultLocale,
      timeout: 30 * 1000,
      limit: 0,
      withCredentials: false,
      responseType: '',
      /**
       * @typedef respObj
       * @property {string} responseText
       * @property {number} status
       * @property {string} statusText
       * @property {Object.<string, string>} headers
       *
       * @param {string} responseText the response body string
       * @param {XMLHttpRequest | respObj} response the response object (XHR or similar)
       */
      getResponseData: function getResponseData(responseText, response) {
        var parsedResponse = {};
        try {
          parsedResponse = JSON.parse(responseText);
        } catch (err) {
          console.log(err);
        }

        return parsedResponse;
      },

      /**
       *
       * @param {string} responseText the response body string
       * @param {XMLHttpRequest | respObj} response the response object (XHR or similar)
       */
      getResponseError: function getResponseError(responseText, response) {
        return new Error('Upload error');
      }
    };

    // Merge default options with the ones set by user
    _this.opts = _extends({}, defaultOptions, opts);

    // i18n
    _this.translator = new Translator([defaultLocale, _this.uppy.locale, _this.opts.locale]);
    _this.i18n = _this.translator.translate.bind(_this.translator);
    _this.i18nArray = _this.translator.translateArray.bind(_this.translator);

    _this.handleUpload = _this.handleUpload.bind(_this);

    // Simultaneous upload limiting is shared across all uploads with this plugin.
    if (typeof _this.opts.limit === 'number' && _this.opts.limit !== 0) {
      _this.limitUploads = limitPromises(_this.opts.limit);
    } else {
      _this.limitUploads = function (fn) {
        return fn;
      };
    }

    if (_this.opts.bundle && !_this.opts.formData) {
      throw new Error('`opts.formData` must be true when `opts.bundle` is enabled.');
    }
    return _this;
  }

  XHRUpload.prototype.getOptions = function getOptions(file) {
    var overrides = this.uppy.getState().xhrUpload;
    var opts = _extends({}, this.opts, overrides || {}, file.xhrUpload || {});
    opts.headers = {};
    _extends(opts.headers, this.opts.headers);
    if (overrides) {
      _extends(opts.headers, overrides.headers);
    }
    if (file.xhrUpload) {
      _extends(opts.headers, file.xhrUpload.headers);
    }

    return opts;
  };

  // Helper to abort upload requests if there has not been any progress for `timeout` ms.
  // Create an instance using `timer = createProgressTimeout(10000, onTimeout)`
  // Call `timer.progress()` to signal that there has been progress of any kind.
  // Call `timer.done()` when the upload has completed.


  XHRUpload.prototype.createProgressTimeout = function createProgressTimeout(timeout, timeoutHandler) {
    var uppy = this.uppy;
    var self = this;
    var isDone = false;

    function onTimedOut() {
      uppy.log('[XHRUpload] timed out');
      var error = new Error(self.i18n('timedOut', { seconds: Math.ceil(timeout / 1000) }));
      timeoutHandler(error);
    }

    var aliveTimer = null;
    function progress() {
      // Some browsers fire another progress event when the upload is
      // cancelled, so we have to ignore progress after the timer was
      // told to stop.
      if (isDone) return;

      if (timeout > 0) {
        if (aliveTimer) clearTimeout(aliveTimer);
        aliveTimer = setTimeout(onTimedOut, timeout);
      }
    }

    function done() {
      uppy.log('[XHRUpload] timer done');
      if (aliveTimer) {
        clearTimeout(aliveTimer);
        aliveTimer = null;
      }
      isDone = true;
    }

    return {
      progress: progress,
      done: done
    };
  };

  XHRUpload.prototype.createFormDataUpload = function createFormDataUpload(file, opts) {
    var formPost = new FormData();

    var metaFields = Array.isArray(opts.metaFields) ? opts.metaFields
    // Send along all fields by default.
    : Object.keys(file.meta);
    metaFields.forEach(function (item) {
      formPost.append(item, file.meta[item]);
    });

    if (file.name) {
      formPost.append(opts.fieldName, file.data, file.name);
    } else {
      formPost.append(opts.fieldName, file.data);
    }

    return formPost;
  };

  XHRUpload.prototype.createBareUpload = function createBareUpload(file, opts) {
    return file.data;
  };

  XHRUpload.prototype.upload = function upload(file, current, total) {
    var _this2 = this;

    var opts = this.getOptions(file);

    this.uppy.log('uploading ' + current + ' of ' + total);
    return new Promise(function (resolve, reject) {
      var data = opts.formData ? _this2.createFormDataUpload(file, opts) : _this2.createBareUpload(file, opts);

      var timer = _this2.createProgressTimeout(opts.timeout, function (error) {
        xhr.abort();
        _this2.uppy.emit('upload-error', file, error);
        reject(error);
      });

      var xhr = new XMLHttpRequest();

      var id = cuid();

      xhr.upload.addEventListener('loadstart', function (ev) {
        _this2.uppy.log('[XHRUpload] ' + id + ' started');
      });

      xhr.upload.addEventListener('progress', function (ev) {
        _this2.uppy.log('[XHRUpload] ' + id + ' progress: ' + ev.loaded + ' / ' + ev.total);
        // Begin checking for timeouts when progress starts, instead of loading,
        // to avoid timing out requests on browser concurrency queue
        timer.progress();

        if (ev.lengthComputable) {
          _this2.uppy.emit('upload-progress', file, {
            uploader: _this2,
            bytesUploaded: ev.loaded,
            bytesTotal: ev.total
          });
        }
      });

      xhr.addEventListener('load', function (ev) {
        _this2.uppy.log('[XHRUpload] ' + id + ' finished');
        timer.done();

        if (ev.target.status >= 200 && ev.target.status < 300) {
          var body = opts.getResponseData(xhr.responseText, xhr);
          var uploadURL = body[opts.responseUrlFieldName];

          var uploadResp = {
            status: ev.target.status,
            body: body,
            uploadURL: uploadURL
          };

          _this2.uppy.emit('upload-success', file, uploadResp);

          if (uploadURL) {
            _this2.uppy.log('Download ' + file.name + ' from ' + file.uploadURL);
          }

          return resolve(file);
        } else {
          var _body = opts.getResponseData(xhr.responseText, xhr);
          var error = buildResponseError(xhr, opts.getResponseError(xhr.responseText, xhr));

          var response = {
            status: ev.target.status,
            body: _body
          };

          _this2.uppy.emit('upload-error', file, error, response);
          return reject(error);
        }
      });

      xhr.addEventListener('error', function (ev) {
        _this2.uppy.log('[XHRUpload] ' + id + ' errored');
        timer.done();

        var error = buildResponseError(xhr, opts.getResponseError(xhr.responseText, xhr));
        _this2.uppy.emit('upload-error', file, error);
        return reject(error);
      });

      xhr.open(opts.method.toUpperCase(), opts.endpoint, true);
      // IE10 does not allow setting `withCredentials` and `responseType`
      // before `open()` is called.
      xhr.withCredentials = opts.withCredentials;
      if (opts.responseType !== '') {
        xhr.responseType = opts.responseType;
      }

      Object.keys(opts.headers).forEach(function (header) {
        xhr.setRequestHeader(header, opts.headers[header]);
      });

      xhr.send(data);

      _this2.uppy.on('file-removed', function (removedFile) {
        if (removedFile.id === file.id) {
          timer.done();
          xhr.abort();
          reject(new Error('File removed'));
        }
      });

      _this2.uppy.on('cancel-all', function () {
        timer.done();
        xhr.abort();
        reject(new Error('Upload cancelled'));
      });
    });
  };

  XHRUpload.prototype.uploadRemote = function uploadRemote(file, current, total) {
    var _this3 = this;

    var opts = this.getOptions(file);
    return new Promise(function (resolve, reject) {
      var fields = {};
      var metaFields = Array.isArray(opts.metaFields) ? opts.metaFields
      // Send along all fields by default.
      : Object.keys(file.meta);

      metaFields.forEach(function (name) {
        fields[name] = file.meta[name];
      });

      var Client = file.remote.providerOptions.provider ? Provider : RequestClient;
      var client = new Client(_this3.uppy, file.remote.providerOptions);
      client.post(file.remote.url, _extends({}, file.remote.body, {
        endpoint: opts.endpoint,
        size: file.data.size,
        fieldname: opts.fieldName,
        metadata: fields,
        headers: opts.headers
      })).then(function (res) {
        var token = res.token;
        var host = getSocketHost(file.remote.serverUrl);
        var socket = new Socket({ target: host + '/api/' + token });

        socket.on('progress', function (progressData) {
          return emitSocketProgress(_this3, progressData, file);
        });

        socket.on('success', function (data) {
          var body = opts.getResponseData(data.response.responseText, data.response);
          var uploadURL = body[opts.responseUrlFieldName];

          var uploadResp = {
            status: data.response.status,
            body: body,
            uploadURL: uploadURL
          };

          _this3.uppy.emit('upload-success', file, uploadResp);
          socket.close();
          return resolve();
        });

        socket.on('error', function (errData) {
          var resp = errData.response;
          var error = resp ? opts.getResponseError(resp.responseText, resp) : _extends(new Error(errData.error.message), { cause: errData.error });
          _this3.uppy.emit('upload-error', file, error);
          reject(error);
        });
      });
    });
  };

  XHRUpload.prototype.uploadBundle = function uploadBundle(files) {
    var _this4 = this;

    return new Promise(function (resolve, reject) {
      var endpoint = _this4.opts.endpoint;
      var method = _this4.opts.method;

      var formData = new FormData();
      files.forEach(function (file, i) {
        var opts = _this4.getOptions(file);
        formData.append(opts.fieldName, file.data);
      });

      var xhr = new XMLHttpRequest();

      var timer = _this4.createProgressTimeout(_this4.opts.timeout, function (error) {
        xhr.abort();
        emitError(error);
        reject(error);
      });

      var emitError = function emitError(error) {
        files.forEach(function (file) {
          _this4.uppy.emit('upload-error', file, error);
        });
      };

      xhr.upload.addEventListener('loadstart', function (ev) {
        _this4.uppy.log('[XHRUpload] started uploading bundle');
        timer.progress();
      });

      xhr.upload.addEventListener('progress', function (ev) {
        timer.progress();

        if (!ev.lengthComputable) return;

        files.forEach(function (file) {
          _this4.uppy.emit('upload-progress', file, {
            uploader: _this4,
            bytesUploaded: ev.loaded / ev.total * file.size,
            bytesTotal: file.size
          });
        });
      });

      xhr.addEventListener('load', function (ev) {
        timer.done();

        if (ev.target.status >= 200 && ev.target.status < 300) {
          var body = _this4.opts.getResponseData(xhr.responseText, xhr);
          var uploadResp = {
            status: ev.target.status,
            body: body
          };
          files.forEach(function (file) {
            _this4.uppy.emit('upload-success', file, uploadResp);
          });
          return resolve();
        }

        var error = _this4.opts.getResponseError(xhr.responseText, xhr) || new Error('Upload error');
        error.request = xhr;
        emitError(error);
        return reject(error);
      });

      xhr.addEventListener('error', function (ev) {
        timer.done();

        var error = _this4.opts.getResponseError(xhr.responseText, xhr) || new Error('Upload error');
        emitError(error);
        return reject(error);
      });

      _this4.uppy.on('cancel-all', function () {
        timer.done();
        xhr.abort();
      });

      xhr.open(method.toUpperCase(), endpoint, true);
      // IE10 does not allow setting `withCredentials` and `responseType`
      // before `open()` is called.
      xhr.withCredentials = _this4.opts.withCredentials;
      if (_this4.opts.responseType !== '') {
        xhr.responseType = _this4.opts.responseType;
      }

      Object.keys(_this4.opts.headers).forEach(function (header) {
        xhr.setRequestHeader(header, _this4.opts.headers[header]);
      });

      xhr.send(formData);

      files.forEach(function (file) {
        _this4.uppy.emit('upload-started', file);
      });
    });
  };

  XHRUpload.prototype.uploadFiles = function uploadFiles(files) {
    var _this5 = this;

    var actions = files.map(function (file, i) {
      var current = parseInt(i, 10) + 1;
      var total = files.length;

      if (file.error) {
        return function () {
          return Promise.reject(new Error(file.error));
        };
      } else if (file.isRemote) {
        // We emit upload-started here, so that it's also emitted for files
        // that have to wait due to the `limit` option.
        _this5.uppy.emit('upload-started', file);
        return _this5.uploadRemote.bind(_this5, file, current, total);
      } else {
        _this5.uppy.emit('upload-started', file);
        return _this5.upload.bind(_this5, file, current, total);
      }
    });

    var promises = actions.map(function (action) {
      var limitedAction = _this5.limitUploads(action);
      return limitedAction();
    });

    return settle(promises);
  };

  XHRUpload.prototype.handleUpload = function handleUpload(fileIDs) {
    var _this6 = this;

    if (fileIDs.length === 0) {
      this.uppy.log('[XHRUpload] No files to upload!');
      return Promise.resolve();
    }

    this.uppy.log('[XHRUpload] Uploading...');
    var files = fileIDs.map(function (fileID) {
      return _this6.uppy.getFile(fileID);
    });

    if (this.opts.bundle) {
      return this.uploadBundle(files);
    }

    return this.uploadFiles(files).then(function () {
      return null;
    });
  };

  XHRUpload.prototype.install = function install() {
    if (this.opts.bundle) {
      this.uppy.setState({
        capabilities: _extends({}, this.uppy.getState().capabilities, {
          bundled: true
        })
      });
    }

    this.uppy.addUploader(this.handleUpload);
  };

  XHRUpload.prototype.uninstall = function uninstall() {
    if (this.opts.bundle) {
      this.uppy.setState({
        capabilities: _extends({}, this.uppy.getState().capabilities, {
          bundled: true
        })
      });
    }

    this.uppy.removeUploader(this.handleUpload);
  };

  return XHRUpload;
}(Plugin);

},{"./../../companion-client":18,"./../../core":21,"./../../utils/lib/Translator":26,"./../../utils/lib/emitSocketProgress":27,"./../../utils/lib/getSocketHost":32,"./../../utils/lib/limitPromises":35,"./../../utils/lib/settle":37,"cuid":1}],40:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],41:[function(require,module,exports){
require('es6-promise/auto');
require('whatwg-fetch');
var Uppy = require('./../../../../packages/@uppy/core');
var FileInput = require('./../../../../packages/@uppy/file-input');
var XHRUpload = require('./../../../../packages/@uppy/xhr-upload');
var ProgressBar = require('./../../../../packages/@uppy/progress-bar');

var uppy = new Uppy({ debug: true, autoProceed: true });
uppy.use(FileInput, { target: '.UppyForm', replaceTargetContent: true });
uppy.use(XHRUpload, {
  endpoint: '//api2.transloadit.com',
  formData: true,
  fieldName: 'files[]'
});
uppy.use(ProgressBar, {
  target: 'body',
  fixed: true,
  hideAfterFinish: false
});

console.log('Uppy with Formtag and XHRUpload is loaded');

},{"./../../../../packages/@uppy/core":21,"./../../../../packages/@uppy/file-input":23,"./../../../../packages/@uppy/progress-bar":24,"./../../../../packages/@uppy/xhr-upload":39,"es6-promise/auto":5,"whatwg-fetch":12}]},{},[41])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9ub2RlX21vZHVsZXMvY3VpZC9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jdWlkL2xpYi9maW5nZXJwcmludC5icm93c2VyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2N1aWQvbGliL2dldFJhbmRvbVZhbHVlLmJyb3dzZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvY3VpZC9saWIvcGFkLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2VzNi1wcm9taXNlL2F1dG8uanMiLCIuLi9ub2RlX21vZHVsZXMvZXM2LXByb21pc2UvZGlzdC9lczYtcHJvbWlzZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gudGhyb3R0bGUvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvbWltZS1tYXRjaC9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9uYW1lc3BhY2UtZW1pdHRlci9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9wcmVhY3QvZGlzdC9wcmVhY3QuanMiLCIuLi9ub2RlX21vZHVsZXMvcHJldHRpZXItYnl0ZXMvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvd2hhdHdnLWZldGNoL2Rpc3QvZmV0Y2gudW1kLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3dpbGRjYXJkL2luZGV4LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvY29tcGFuaW9uLWNsaWVudC9zcmMvQXV0aEVycm9yLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvY29tcGFuaW9uLWNsaWVudC9zcmMvUHJvdmlkZXIuanMiLCIuLi9wYWNrYWdlcy9AdXBweS9jb21wYW5pb24tY2xpZW50L3NyYy9SZXF1ZXN0Q2xpZW50LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvY29tcGFuaW9uLWNsaWVudC9zcmMvU29ja2V0LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvY29tcGFuaW9uLWNsaWVudC9zcmMvaW5kZXguanMiLCIuLi9wYWNrYWdlcy9AdXBweS9jb21wYW5pb24tY2xpZW50L3NyYy90b2tlblN0b3JhZ2UuanMiLCIuLi9wYWNrYWdlcy9AdXBweS9jb3JlL3NyYy9QbHVnaW4uanMiLCIuLi9wYWNrYWdlcy9AdXBweS9jb3JlL3NyYy9pbmRleC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L2NvcmUvc3JjL3N1cHBvcnRzVXBsb2FkUHJvZ3Jlc3MuanMiLCIuLi9wYWNrYWdlcy9AdXBweS9maWxlLWlucHV0L3NyYy9pbmRleC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3Byb2dyZXNzLWJhci9zcmMvaW5kZXguanMiLCIuLi9wYWNrYWdlcy9AdXBweS9zdG9yZS1kZWZhdWx0L3NyYy9pbmRleC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9UcmFuc2xhdG9yLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvc3JjL2VtaXRTb2NrZXRQcm9ncmVzcy5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9maW5kRE9NRWxlbWVudC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9nZW5lcmF0ZUZpbGVJRC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9nZXRGaWxlTmFtZUFuZEV4dGVuc2lvbi5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9nZXRGaWxlVHlwZS5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9nZXRTb2NrZXRIb3N0LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvc3JjL2dldFRpbWVTdGFtcC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9pc0RPTUVsZW1lbnQuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9zcmMvbGltaXRQcm9taXNlcy5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9taW1lVHlwZXMuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9zcmMvc2V0dGxlLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvc3JjL3RvQXJyYXkuanMiLCIuLi9wYWNrYWdlcy9AdXBweS94aHItdXBsb2FkL3NyYy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJzcmMvZXhhbXBsZXMveGhydXBsb2FkL2FwcC5lczYiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQy9wQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3ZiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbmhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RkE7Ozs7Ozs7O0lBRU0sUzs7O0FBQ0osdUJBQWU7QUFBQTs7QUFBQSxpREFDYixrQkFBTSx3QkFBTixDQURhOztBQUViLFVBQUssSUFBTCxHQUFZLFdBQVo7QUFDQSxVQUFLLFdBQUwsR0FBbUIsSUFBbkI7QUFIYTtBQUlkOzs7RUFMcUIsSzs7QUFReEIsT0FBTyxPQUFQLEdBQWlCLFNBQWpCOzs7QUNWQTs7Ozs7Ozs7OztBQUVBLElBQU0sZ0JBQWdCLFFBQVEsaUJBQVIsQ0FBdEI7QUFDQSxJQUFNLGVBQWUsUUFBUSxnQkFBUixDQUFyQjs7QUFFQSxJQUFNLFdBQVcsU0FBWCxRQUFXLENBQUMsRUFBRCxFQUFRO0FBQ3ZCLFNBQU8sR0FBRyxLQUFILENBQVMsR0FBVCxFQUFjLEdBQWQsQ0FBa0IsVUFBQyxDQUFEO0FBQUEsV0FBTyxFQUFFLE1BQUYsQ0FBUyxDQUFULEVBQVksV0FBWixLQUE0QixFQUFFLEtBQUYsQ0FBUSxDQUFSLENBQW5DO0FBQUEsR0FBbEIsRUFBaUUsSUFBakUsQ0FBc0UsR0FBdEUsQ0FBUDtBQUNELENBRkQ7O0FBSUEsT0FBTyxPQUFQO0FBQUE7O0FBQ0Usb0JBQWEsSUFBYixFQUFtQixJQUFuQixFQUF5QjtBQUFBOztBQUFBLGlEQUN2QiwwQkFBTSxJQUFOLEVBQVksSUFBWixDQUR1Qjs7QUFFdkIsVUFBSyxRQUFMLEdBQWdCLEtBQUssUUFBckI7QUFDQSxVQUFLLEVBQUwsR0FBVSxNQUFLLFFBQWY7QUFDQSxVQUFLLFlBQUwsR0FBb0IsS0FBSyxZQUFMLElBQXFCLE1BQUssUUFBOUM7QUFDQSxVQUFLLElBQUwsR0FBWSxNQUFLLElBQUwsQ0FBVSxJQUFWLElBQWtCLFNBQVMsTUFBSyxFQUFkLENBQTlCO0FBQ0EsVUFBSyxRQUFMLEdBQWdCLE1BQUssSUFBTCxDQUFVLFFBQTFCO0FBQ0EsVUFBSyxRQUFMLGtCQUE2QixNQUFLLFFBQWxDO0FBUHVCO0FBUXhCOztBQVRILHFCQVdFLE9BWEYsc0JBV2E7QUFBQTs7QUFDVCxXQUFPLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBcUI7QUFDdEMsK0JBQU0sT0FBTixjQUFnQixJQUFoQixDQUFxQixVQUFDLE9BQUQsRUFBYTtBQUNoQyxlQUFLLFlBQUwsR0FBb0IsSUFBcEIsQ0FBeUIsVUFBQyxLQUFELEVBQVc7QUFDbEMsa0JBQVEsU0FBYyxFQUFkLEVBQWtCLE9BQWxCLEVBQTJCLEVBQUUsbUJBQW1CLEtBQXJCLEVBQTNCLENBQVI7QUFDRCxTQUZEO0FBR0QsT0FKRCxFQUlHLEtBSkgsQ0FJUyxNQUpUO0FBS0QsS0FOTSxDQUFQO0FBT0QsR0FuQkg7O0FBQUEscUJBcUJFLGlCQXJCRiw4QkFxQnFCLFFBckJyQixFQXFCK0I7QUFDM0IsZUFBVyx5QkFBTSxpQkFBTixZQUF3QixRQUF4QixDQUFYO0FBQ0EsUUFBTSxnQkFBZ0IsU0FBUyxNQUFULEtBQW9CLEdBQTFDO0FBQ0EsU0FBSyxJQUFMLENBQVUsU0FBVixDQUFvQixLQUFLLFFBQXpCLEVBQW1DLGNBQW5DLENBQWtELEVBQUUsNEJBQUYsRUFBbEQ7QUFDQSxXQUFPLFFBQVA7QUFDRCxHQTFCSDs7QUE0QkU7OztBQTVCRixxQkE2QkUsWUE3QkYseUJBNkJnQixLQTdCaEIsRUE2QnVCO0FBQ25CLFdBQU8sS0FBSyxJQUFMLENBQVUsU0FBVixDQUFvQixLQUFLLFFBQXpCLEVBQW1DLE9BQW5DLENBQTJDLE9BQTNDLENBQW1ELEtBQUssUUFBeEQsRUFBa0UsS0FBbEUsQ0FBUDtBQUNELEdBL0JIOztBQUFBLHFCQWlDRSxZQWpDRiwyQkFpQ2tCO0FBQ2QsV0FBTyxLQUFLLElBQUwsQ0FBVSxTQUFWLENBQW9CLEtBQUssUUFBekIsRUFBbUMsT0FBbkMsQ0FBMkMsT0FBM0MsQ0FBbUQsS0FBSyxRQUF4RCxDQUFQO0FBQ0QsR0FuQ0g7O0FBQUEscUJBcUNFLE9BckNGLHNCQXFDYTtBQUNULFdBQVUsS0FBSyxRQUFmLFNBQTJCLEtBQUssRUFBaEM7QUFDRCxHQXZDSDs7QUFBQSxxQkF5Q0UsT0F6Q0Ysb0JBeUNXLEVBekNYLEVBeUNlO0FBQ1gsV0FBVSxLQUFLLFFBQWYsU0FBMkIsS0FBSyxFQUFoQyxhQUEwQyxFQUExQztBQUNELEdBM0NIOztBQUFBLHFCQTZDRSxJQTdDRixpQkE2Q1EsU0E3Q1IsRUE2Q21CO0FBQ2YsV0FBTyxLQUFLLEdBQUwsQ0FBWSxLQUFLLEVBQWpCLGVBQTRCLGFBQWEsRUFBekMsRUFBUDtBQUNELEdBL0NIOztBQUFBLHFCQWlERSxNQWpERixxQkFpRG9DO0FBQUE7O0FBQUEsUUFBMUIsUUFBMEIsdUVBQWYsU0FBUyxJQUFNOztBQUNoQyxXQUFPLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBcUI7QUFDdEMsYUFBSyxHQUFMLENBQVksT0FBSyxFQUFqQix5QkFBdUMsUUFBdkMsRUFDRyxJQURILENBQ1EsVUFBQyxHQUFELEVBQVM7QUFDYixlQUFLLElBQUwsQ0FBVSxTQUFWLENBQW9CLE9BQUssUUFBekIsRUFBbUMsT0FBbkMsQ0FBMkMsVUFBM0MsQ0FBc0QsT0FBSyxRQUEzRCxFQUNHLElBREgsQ0FDUTtBQUFBLGlCQUFNLFFBQVEsR0FBUixDQUFOO0FBQUEsU0FEUixFQUVHLEtBRkgsQ0FFUyxNQUZUO0FBR0QsT0FMSCxFQUtLLEtBTEwsQ0FLVyxNQUxYO0FBTUQsS0FQTSxDQUFQO0FBUUQsR0ExREg7O0FBQUEsV0E0RFMsVUE1RFQsdUJBNERxQixNQTVEckIsRUE0RDZCLElBNUQ3QixFQTREbUMsV0E1RG5DLEVBNERnRDtBQUM1QyxXQUFPLElBQVAsR0FBYyxVQUFkO0FBQ0EsV0FBTyxLQUFQLEdBQWUsRUFBZjtBQUNBLFFBQUksV0FBSixFQUFpQjtBQUNmLGFBQU8sSUFBUCxHQUFjLFNBQWMsRUFBZCxFQUFrQixXQUFsQixFQUErQixJQUEvQixDQUFkO0FBQ0Q7O0FBRUQsUUFBSSxLQUFLLGFBQVQsRUFBd0I7QUFDdEIsVUFBTSxVQUFVLEtBQUssYUFBckI7QUFDQTtBQUNBLFVBQUksT0FBTyxPQUFQLEtBQW1CLFFBQW5CLElBQStCLENBQUMsTUFBTSxPQUFOLENBQWMsT0FBZCxDQUFoQyxJQUEwRCxFQUFFLG1CQUFtQixNQUFyQixDQUE5RCxFQUE0RjtBQUMxRixjQUFNLElBQUksU0FBSixDQUFpQixPQUFPLEVBQXhCLHVFQUFOO0FBQ0Q7QUFDRCxhQUFPLElBQVAsQ0FBWSxhQUFaLEdBQTRCLE9BQTVCO0FBQ0QsS0FQRCxNQU9PO0FBQ0w7QUFDQSxVQUFJLHVCQUF1QixJQUF2QixDQUE0QixLQUFLLFNBQWpDLENBQUosRUFBaUQ7QUFDL0MsZUFBTyxJQUFQLENBQVksYUFBWixnQkFBdUMsS0FBSyxTQUFMLENBQWUsT0FBZixDQUF1QixPQUF2QixFQUFnQyxFQUFoQyxDQUF2QztBQUNELE9BRkQsTUFFTztBQUNMLGVBQU8sSUFBUCxDQUFZLGFBQVosR0FBNEIsS0FBSyxTQUFqQztBQUNEO0FBQ0Y7O0FBRUQsV0FBTyxPQUFQLEdBQWlCLE9BQU8sSUFBUCxDQUFZLE9BQVosSUFBdUIsWUFBeEM7QUFDRCxHQXBGSDs7QUFBQTtBQUFBLEVBQXdDLGFBQXhDOzs7QUNUQTs7Ozs7Ozs7QUFFQSxJQUFNLFlBQVksUUFBUSxhQUFSLENBQWxCOztBQUVBO0FBQ0EsU0FBUyxVQUFULENBQXFCLEdBQXJCLEVBQTBCO0FBQ3hCLFNBQU8sSUFBSSxPQUFKLENBQVksS0FBWixFQUFtQixFQUFuQixDQUFQO0FBQ0Q7O0FBRUQsT0FBTyxPQUFQO0FBQ0UseUJBQWEsSUFBYixFQUFtQixJQUFuQixFQUF5QjtBQUFBOztBQUN2QixTQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0EsU0FBSyxJQUFMLEdBQVksSUFBWjtBQUNBLFNBQUssaUJBQUwsR0FBeUIsS0FBSyxpQkFBTCxDQUF1QixJQUF2QixDQUE0QixJQUE1QixDQUF6QjtBQUNEOztBQUxILDBCQW9CRSxPQXBCRixzQkFvQmE7QUFDVCxXQUFPLFFBQVEsT0FBUixDQUFnQixTQUFjLEVBQWQsRUFBa0IsS0FBSyxjQUF2QixFQUF1QyxLQUFLLElBQUwsQ0FBVSxhQUFWLElBQTJCLEVBQWxFLENBQWhCLENBQVA7QUFDRCxHQXRCSDs7QUFBQSwwQkF3QkUsb0JBeEJGLGlDQXdCd0IsSUF4QnhCLEVBd0I4QjtBQUFBOztBQUMxQixXQUFPLFVBQUMsUUFBRCxFQUFjO0FBQ25CLFVBQUksQ0FBQyxJQUFMLEVBQVc7QUFDVCxlQUFPLE1BQUssaUJBQUwsQ0FBdUIsUUFBdkIsQ0FBUDtBQUNEOztBQUVELGFBQU8sUUFBUDtBQUNELEtBTkQ7QUFPRCxHQWhDSDs7QUFBQSwwQkFrQ0UsaUJBbENGLDhCQWtDcUIsUUFsQ3JCLEVBa0MrQjtBQUMzQixRQUFNLFFBQVEsS0FBSyxJQUFMLENBQVUsUUFBVixFQUFkO0FBQ0EsUUFBTSxZQUFZLE1BQU0sU0FBTixJQUFtQixFQUFyQztBQUNBLFFBQU0sT0FBTyxLQUFLLElBQUwsQ0FBVSxTQUF2QjtBQUNBLFFBQU0sVUFBVSxTQUFTLE9BQXpCO0FBQ0E7QUFDQSxRQUFJLFFBQVEsR0FBUixDQUFZLE1BQVosS0FBdUIsUUFBUSxHQUFSLENBQVksTUFBWixNQUF3QixVQUFVLElBQVYsQ0FBbkQsRUFBb0U7QUFBQTs7QUFDbEUsV0FBSyxJQUFMLENBQVUsUUFBVixDQUFtQjtBQUNqQixtQkFBVyxTQUFjLEVBQWQsRUFBa0IsU0FBbEIsNkJBQ1IsSUFEUSxJQUNELFFBQVEsR0FBUixDQUFZLE1BQVosQ0FEQztBQURNLE9BQW5CO0FBS0Q7QUFDRCxXQUFPLFFBQVA7QUFDRCxHQWhESDs7QUFBQSwwQkFrREUsT0FsREYsb0JBa0RXLEdBbERYLEVBa0RnQjtBQUNaLFFBQUksa0JBQWtCLElBQWxCLENBQXVCLEdBQXZCLENBQUosRUFBaUM7QUFDL0IsYUFBTyxHQUFQO0FBQ0Q7QUFDRCxXQUFVLEtBQUssUUFBZixTQUEyQixHQUEzQjtBQUNELEdBdkRIOztBQUFBLDBCQXlERSxLQXpERixrQkF5RFMsR0F6RFQsRUF5RGM7QUFDVixRQUFJLElBQUksTUFBSixLQUFlLEdBQW5CLEVBQXdCO0FBQ3RCLFlBQU0sSUFBSSxTQUFKLEVBQU47QUFDRDs7QUFFRCxRQUFJLElBQUksTUFBSixHQUFhLEdBQWIsSUFBb0IsSUFBSSxNQUFKLEdBQWEsR0FBckMsRUFBMEM7QUFDeEMsWUFBTSxJQUFJLEtBQUosd0JBQStCLElBQUksR0FBbkMsVUFBMkMsSUFBSSxVQUEvQyxDQUFOO0FBQ0Q7QUFDRCxXQUFPLElBQUksSUFBSixFQUFQO0FBQ0QsR0FsRUg7O0FBQUEsMEJBb0VFLEdBcEVGLGdCQW9FTyxJQXBFUCxFQW9FYSxnQkFwRWIsRUFvRStCO0FBQUE7O0FBQzNCLFdBQU8sSUFBSSxPQUFKLENBQVksVUFBQyxPQUFELEVBQVUsTUFBVixFQUFxQjtBQUN0QyxhQUFLLE9BQUwsR0FBZSxJQUFmLENBQW9CLFVBQUMsT0FBRCxFQUFhO0FBQy9CLGNBQU0sT0FBSyxPQUFMLENBQWEsSUFBYixDQUFOLEVBQTBCO0FBQ3hCLGtCQUFRLEtBRGdCO0FBRXhCLG1CQUFTLE9BRmU7QUFHeEIsdUJBQWE7QUFIVyxTQUExQixFQUtHLElBTEgsQ0FLUSxPQUFLLG9CQUFMLENBQTBCLGdCQUExQixDQUxSLEVBTUcsSUFOSCxDQU1RLFVBQUMsR0FBRDtBQUFBLGlCQUFTLE9BQUssS0FBTCxDQUFXLEdBQVgsRUFBZ0IsSUFBaEIsQ0FBcUIsT0FBckIsQ0FBVDtBQUFBLFNBTlIsRUFPRyxLQVBILENBT1MsVUFBQyxHQUFELEVBQVM7QUFDZCxnQkFBTSxJQUFJLFdBQUosR0FBa0IsR0FBbEIsR0FBd0IsSUFBSSxLQUFKLG9CQUEyQixPQUFLLE9BQUwsQ0FBYSxJQUFiLENBQTNCLFVBQWtELEdBQWxELENBQTlCO0FBQ0EsaUJBQU8sR0FBUDtBQUNELFNBVkg7QUFXRCxPQVpEO0FBYUQsS0FkTSxDQUFQO0FBZUQsR0FwRkg7O0FBQUEsMEJBc0ZFLElBdEZGLGlCQXNGUSxJQXRGUixFQXNGYyxJQXRGZCxFQXNGb0IsZ0JBdEZwQixFQXNGc0M7QUFBQTs7QUFDbEMsV0FBTyxJQUFJLE9BQUosQ0FBWSxVQUFDLE9BQUQsRUFBVSxNQUFWLEVBQXFCO0FBQ3RDLGFBQUssT0FBTCxHQUFlLElBQWYsQ0FBb0IsVUFBQyxPQUFELEVBQWE7QUFDL0IsY0FBTSxPQUFLLE9BQUwsQ0FBYSxJQUFiLENBQU4sRUFBMEI7QUFDeEIsa0JBQVEsTUFEZ0I7QUFFeEIsbUJBQVMsT0FGZTtBQUd4Qix1QkFBYSxhQUhXO0FBSXhCLGdCQUFNLEtBQUssU0FBTCxDQUFlLElBQWY7QUFKa0IsU0FBMUIsRUFNRyxJQU5ILENBTVEsT0FBSyxvQkFBTCxDQUEwQixnQkFBMUIsQ0FOUixFQU9HLElBUEgsQ0FPUSxVQUFDLEdBQUQ7QUFBQSxpQkFBUyxPQUFLLEtBQUwsQ0FBVyxHQUFYLEVBQWdCLElBQWhCLENBQXFCLE9BQXJCLENBQVQ7QUFBQSxTQVBSLEVBUUcsS0FSSCxDQVFTLFVBQUMsR0FBRCxFQUFTO0FBQ2QsZ0JBQU0sSUFBSSxXQUFKLEdBQWtCLEdBQWxCLEdBQXdCLElBQUksS0FBSixxQkFBNEIsT0FBSyxPQUFMLENBQWEsSUFBYixDQUE1QixVQUFtRCxHQUFuRCxDQUE5QjtBQUNBLGlCQUFPLEdBQVA7QUFDRCxTQVhIO0FBWUQsT0FiRDtBQWNELEtBZk0sQ0FBUDtBQWdCRCxHQXZHSDs7QUFBQSwwQkF5R0UsTUF6R0Ysb0JBeUdVLElBekdWLEVBeUdnQixJQXpHaEIsRUF5R3NCLGdCQXpHdEIsRUF5R3dDO0FBQUE7O0FBQ3BDLFdBQU8sSUFBSSxPQUFKLENBQVksVUFBQyxPQUFELEVBQVUsTUFBVixFQUFxQjtBQUN0QyxhQUFLLE9BQUwsR0FBZSxJQUFmLENBQW9CLFVBQUMsT0FBRCxFQUFhO0FBQy9CLGNBQVMsT0FBSyxRQUFkLFNBQTBCLElBQTFCLEVBQWtDO0FBQ2hDLGtCQUFRLFFBRHdCO0FBRWhDLG1CQUFTLE9BRnVCO0FBR2hDLHVCQUFhLGFBSG1CO0FBSWhDLGdCQUFNLE9BQU8sS0FBSyxTQUFMLENBQWUsSUFBZixDQUFQLEdBQThCO0FBSkosU0FBbEMsRUFNRyxJQU5ILENBTVEsT0FBSyxvQkFBTCxDQUEwQixnQkFBMUIsQ0FOUixFQU9HLElBUEgsQ0FPUSxVQUFDLEdBQUQ7QUFBQSxpQkFBUyxPQUFLLEtBQUwsQ0FBVyxHQUFYLEVBQWdCLElBQWhCLENBQXFCLE9BQXJCLENBQVQ7QUFBQSxTQVBSLEVBUUcsS0FSSCxDQVFTLFVBQUMsR0FBRCxFQUFTO0FBQ2QsZ0JBQU0sSUFBSSxXQUFKLEdBQWtCLEdBQWxCLEdBQXdCLElBQUksS0FBSix1QkFBOEIsT0FBSyxPQUFMLENBQWEsSUFBYixDQUE5QixVQUFxRCxHQUFyRCxDQUE5QjtBQUNBLGlCQUFPLEdBQVA7QUFDRCxTQVhIO0FBWUQsT0FiRDtBQWNELEtBZk0sQ0FBUDtBQWdCRCxHQTFISDs7QUFBQTtBQUFBO0FBQUEsd0JBT2tCO0FBQUEsMkJBQ1EsS0FBSyxJQUFMLENBQVUsUUFBVixFQURSO0FBQUEsVUFDTixTQURNLGtCQUNOLFNBRE07O0FBRWQsVUFBTSxPQUFPLEtBQUssSUFBTCxDQUFVLFNBQXZCO0FBQ0EsYUFBTyxXQUFXLGFBQWEsVUFBVSxJQUFWLENBQWIsR0FBK0IsVUFBVSxJQUFWLENBQS9CLEdBQWlELElBQTVELENBQVA7QUFDRDtBQVhIO0FBQUE7QUFBQSx3QkFhd0I7QUFDcEIsYUFBTztBQUNMLGtCQUFVLGtCQURMO0FBRUwsd0JBQWdCO0FBRlgsT0FBUDtBQUlEO0FBbEJIOztBQUFBO0FBQUE7Ozs7O0FDVEEsSUFBTSxLQUFLLFFBQVEsbUJBQVIsQ0FBWDs7QUFFQSxPQUFPLE9BQVA7QUFDRSxzQkFBYSxJQUFiLEVBQW1CO0FBQUE7O0FBQUE7O0FBQ2pCLFNBQUssTUFBTCxHQUFjLEVBQWQ7QUFDQSxTQUFLLE1BQUwsR0FBYyxLQUFkO0FBQ0EsU0FBSyxNQUFMLEdBQWMsSUFBSSxTQUFKLENBQWMsS0FBSyxNQUFuQixDQUFkO0FBQ0EsU0FBSyxPQUFMLEdBQWUsSUFBZjs7QUFFQSxTQUFLLE1BQUwsQ0FBWSxNQUFaLEdBQXFCLFVBQUMsQ0FBRCxFQUFPO0FBQzFCLFlBQUssTUFBTCxHQUFjLElBQWQ7O0FBRUEsYUFBTyxNQUFLLE1BQUwsQ0FBWSxNQUFaLEdBQXFCLENBQXJCLElBQTBCLE1BQUssTUFBdEMsRUFBOEM7QUFDNUMsWUFBTSxRQUFRLE1BQUssTUFBTCxDQUFZLENBQVosQ0FBZDtBQUNBLGNBQUssSUFBTCxDQUFVLE1BQU0sTUFBaEIsRUFBd0IsTUFBTSxPQUE5QjtBQUNBLGNBQUssTUFBTCxHQUFjLE1BQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsQ0FBbEIsQ0FBZDtBQUNEO0FBQ0YsS0FSRDs7QUFVQSxTQUFLLE1BQUwsQ0FBWSxPQUFaLEdBQXNCLFVBQUMsQ0FBRCxFQUFPO0FBQzNCLFlBQUssTUFBTCxHQUFjLEtBQWQ7QUFDRCxLQUZEOztBQUlBLFNBQUssY0FBTCxHQUFzQixLQUFLLGNBQUwsQ0FBb0IsSUFBcEIsQ0FBeUIsSUFBekIsQ0FBdEI7O0FBRUEsU0FBSyxNQUFMLENBQVksU0FBWixHQUF3QixLQUFLLGNBQTdCOztBQUVBLFNBQUssS0FBTCxHQUFhLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsSUFBaEIsQ0FBYjtBQUNBLFNBQUssSUFBTCxHQUFZLEtBQUssSUFBTCxDQUFVLElBQVYsQ0FBZSxJQUFmLENBQVo7QUFDQSxTQUFLLEVBQUwsR0FBVSxLQUFLLEVBQUwsQ0FBUSxJQUFSLENBQWEsSUFBYixDQUFWO0FBQ0EsU0FBSyxJQUFMLEdBQVksS0FBSyxJQUFMLENBQVUsSUFBVixDQUFlLElBQWYsQ0FBWjtBQUNBLFNBQUssSUFBTCxHQUFZLEtBQUssSUFBTCxDQUFVLElBQVYsQ0FBZSxJQUFmLENBQVo7QUFDRDs7QUE5QkgsdUJBZ0NFLEtBaENGLG9CQWdDVztBQUNQLFdBQU8sS0FBSyxNQUFMLENBQVksS0FBWixFQUFQO0FBQ0QsR0FsQ0g7O0FBQUEsdUJBb0NFLElBcENGLGlCQW9DUSxNQXBDUixFQW9DZ0IsT0FwQ2hCLEVBb0N5QjtBQUNyQjs7QUFFQSxRQUFJLENBQUMsS0FBSyxNQUFWLEVBQWtCO0FBQ2hCLFdBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsRUFBQyxjQUFELEVBQVMsZ0JBQVQsRUFBakI7QUFDQTtBQUNEOztBQUVELFNBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsS0FBSyxTQUFMLENBQWU7QUFDOUIsb0JBRDhCO0FBRTlCO0FBRjhCLEtBQWYsQ0FBakI7QUFJRCxHQWhESDs7QUFBQSx1QkFrREUsRUFsREYsZUFrRE0sTUFsRE4sRUFrRGMsT0FsRGQsRUFrRHVCO0FBQ25CLFNBQUssT0FBTCxDQUFhLEVBQWIsQ0FBZ0IsTUFBaEIsRUFBd0IsT0FBeEI7QUFDRCxHQXBESDs7QUFBQSx1QkFzREUsSUF0REYsaUJBc0RRLE1BdERSLEVBc0RnQixPQXREaEIsRUFzRHlCO0FBQ3JCLFNBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsTUFBbEIsRUFBMEIsT0FBMUI7QUFDRCxHQXhESDs7QUFBQSx1QkEwREUsSUExREYsaUJBMERRLE1BMURSLEVBMERnQixPQTFEaEIsRUEwRHlCO0FBQ3JCLFNBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsTUFBbEIsRUFBMEIsT0FBMUI7QUFDRCxHQTVESDs7QUFBQSx1QkE4REUsY0E5REYsMkJBOERrQixDQTlEbEIsRUE4RHFCO0FBQ2pCLFFBQUk7QUFDRixVQUFNLFVBQVUsS0FBSyxLQUFMLENBQVcsRUFBRSxJQUFiLENBQWhCO0FBQ0EsV0FBSyxJQUFMLENBQVUsUUFBUSxNQUFsQixFQUEwQixRQUFRLE9BQWxDO0FBQ0QsS0FIRCxDQUdFLE9BQU8sR0FBUCxFQUFZO0FBQ1osY0FBUSxHQUFSLENBQVksR0FBWjtBQUNEO0FBQ0YsR0FyRUg7O0FBQUE7QUFBQTs7O0FDRkE7QUFDQTs7OztBQUlBLElBQU0sZ0JBQWdCLFFBQVEsaUJBQVIsQ0FBdEI7QUFDQSxJQUFNLFdBQVcsUUFBUSxZQUFSLENBQWpCO0FBQ0EsSUFBTSxTQUFTLFFBQVEsVUFBUixDQUFmOztBQUVBLE9BQU8sT0FBUCxHQUFpQjtBQUNmLDhCQURlO0FBRWYsb0JBRmU7QUFHZjtBQUhlLENBQWpCOzs7QUNUQTtBQUNBOzs7O0FBR0EsT0FBTyxPQUFQLENBQWUsT0FBZixHQUF5QixVQUFDLEdBQUQsRUFBTSxLQUFOLEVBQWdCO0FBQ3ZDLFNBQU8sSUFBSSxPQUFKLENBQVksVUFBQyxPQUFELEVBQWE7QUFDOUIsaUJBQWEsT0FBYixDQUFxQixHQUFyQixFQUEwQixLQUExQjtBQUNBO0FBQ0QsR0FITSxDQUFQO0FBSUQsQ0FMRDs7QUFPQSxPQUFPLE9BQVAsQ0FBZSxPQUFmLEdBQXlCLFVBQUMsR0FBRCxFQUFTO0FBQ2hDLFNBQU8sUUFBUSxPQUFSLENBQWdCLGFBQWEsT0FBYixDQUFxQixHQUFyQixDQUFoQixDQUFQO0FBQ0QsQ0FGRDs7QUFJQSxPQUFPLE9BQVAsQ0FBZSxVQUFmLEdBQTRCLFVBQUMsR0FBRCxFQUFTO0FBQ25DLFNBQU8sSUFBSSxPQUFKLENBQVksVUFBQyxPQUFELEVBQWE7QUFDOUIsaUJBQWEsVUFBYixDQUF3QixHQUF4QjtBQUNBO0FBQ0QsR0FITSxDQUFQO0FBSUQsQ0FMRDs7Ozs7Ozs7O0FDZkEsSUFBTSxTQUFTLFFBQVEsUUFBUixDQUFmO0FBQ0EsSUFBTSxpQkFBaUIsUUFBUSxnQ0FBUixDQUF2Qjs7QUFFQTs7O0FBR0EsU0FBUyxRQUFULENBQW1CLEVBQW5CLEVBQXVCO0FBQ3JCLE1BQUksVUFBVSxJQUFkO0FBQ0EsTUFBSSxhQUFhLElBQWpCO0FBQ0EsU0FBTyxZQUFhO0FBQUEsc0NBQVQsSUFBUztBQUFULFVBQVM7QUFBQTs7QUFDbEIsaUJBQWEsSUFBYjtBQUNBLFFBQUksQ0FBQyxPQUFMLEVBQWM7QUFDWixnQkFBVSxRQUFRLE9BQVIsR0FBa0IsSUFBbEIsQ0FBdUIsWUFBTTtBQUNyQyxrQkFBVSxJQUFWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFPLG9CQUFNLFVBQU4sQ0FBUDtBQUNELE9BUFMsQ0FBVjtBQVFEO0FBQ0QsV0FBTyxPQUFQO0FBQ0QsR0FiRDtBQWNEOztBQUVEOzs7Ozs7Ozs7QUFTQSxPQUFPLE9BQVA7QUFDRSxrQkFBYSxJQUFiLEVBQW1CLElBQW5CLEVBQXlCO0FBQUE7O0FBQ3ZCLFNBQUssSUFBTCxHQUFZLElBQVo7QUFDQSxTQUFLLElBQUwsR0FBWSxRQUFRLEVBQXBCOztBQUVBLFNBQUssTUFBTCxHQUFjLEtBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsSUFBakIsQ0FBZDtBQUNBLFNBQUssS0FBTCxHQUFhLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsSUFBaEIsQ0FBYjtBQUNBLFNBQUssT0FBTCxHQUFlLEtBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsSUFBbEIsQ0FBZjtBQUNBLFNBQUssU0FBTCxHQUFpQixLQUFLLFNBQUwsQ0FBZSxJQUFmLENBQW9CLElBQXBCLENBQWpCO0FBQ0Q7O0FBVEgsbUJBV0UsY0FYRiw2QkFXb0I7QUFBQSx5QkFDSSxLQUFLLElBQUwsQ0FBVSxRQUFWLEVBREo7QUFBQSxRQUNSLE9BRFEsa0JBQ1IsT0FEUTs7QUFFaEIsV0FBTyxRQUFRLEtBQUssRUFBYixLQUFvQixFQUEzQjtBQUNELEdBZEg7O0FBQUEsbUJBZ0JFLGNBaEJGLDJCQWdCa0IsTUFoQmxCLEVBZ0IwQjtBQUFBOztBQUFBLDBCQUNGLEtBQUssSUFBTCxDQUFVLFFBQVYsRUFERTtBQUFBLFFBQ2QsT0FEYyxtQkFDZCxPQURjOztBQUd0QixTQUFLLElBQUwsQ0FBVSxRQUFWLENBQW1CO0FBQ2pCLDRCQUNLLE9BREwsNkJBRUcsS0FBSyxFQUZSLGlCQUdPLFFBQVEsS0FBSyxFQUFiLENBSFAsRUFJTyxNQUpQO0FBRGlCLEtBQW5CO0FBU0QsR0E1Qkg7O0FBQUEsbUJBOEJFLE1BOUJGLG1CQThCVSxLQTlCVixFQThCaUI7QUFDYixRQUFJLE9BQU8sS0FBSyxFQUFaLEtBQW1CLFdBQXZCLEVBQW9DO0FBQ2xDO0FBQ0Q7O0FBRUQsUUFBSSxLQUFLLFNBQVQsRUFBb0I7QUFDbEIsV0FBSyxTQUFMLENBQWUsS0FBZjtBQUNEO0FBQ0YsR0F0Q0g7O0FBd0NFOzs7Ozs7OztBQXhDRixtQkE4Q0UsT0E5Q0Ysc0JBOENhLENBRVYsQ0FoREg7O0FBa0RFOzs7Ozs7Ozs7O0FBbERGLG1CQTBERSxLQTFERixrQkEwRFMsTUExRFQsRUEwRGlCLE1BMURqQixFQTBEeUI7QUFBQTs7QUFDckIsUUFBTSxtQkFBbUIsT0FBTyxFQUFoQzs7QUFFQSxRQUFNLGdCQUFnQixlQUFlLE1BQWYsQ0FBdEI7O0FBRUEsUUFBSSxhQUFKLEVBQW1CO0FBQ2pCLFdBQUssYUFBTCxHQUFxQixJQUFyQjs7QUFFQTtBQUNBLFdBQUssUUFBTCxHQUFnQixVQUFDLEtBQUQsRUFBVztBQUN6QjtBQUNBO0FBQ0E7QUFDQSxZQUFJLENBQUMsTUFBSyxJQUFMLENBQVUsU0FBVixDQUFvQixNQUFLLEVBQXpCLENBQUwsRUFBbUM7QUFDbkMsY0FBSyxFQUFMLEdBQVUsT0FBTyxNQUFQLENBQWMsTUFBSyxNQUFMLENBQVksS0FBWixDQUFkLEVBQWtDLGFBQWxDLEVBQWlELE1BQUssRUFBdEQsQ0FBVjtBQUNELE9BTkQ7QUFPQSxXQUFLLFNBQUwsR0FBaUIsU0FBUyxLQUFLLFFBQWQsQ0FBakI7O0FBRUEsV0FBSyxJQUFMLENBQVUsR0FBVixpQkFBNEIsZ0JBQTVCOztBQUVBO0FBQ0EsVUFBSSxLQUFLLElBQUwsQ0FBVSxvQkFBZCxFQUFvQztBQUNsQyxzQkFBYyxTQUFkLEdBQTBCLEVBQTFCO0FBQ0Q7O0FBRUQsV0FBSyxFQUFMLEdBQVUsT0FBTyxNQUFQLENBQWMsS0FBSyxNQUFMLENBQVksS0FBSyxJQUFMLENBQVUsUUFBVixFQUFaLENBQWQsRUFBaUQsYUFBakQsQ0FBVjs7QUFFQSxXQUFLLE9BQUw7QUFDQSxhQUFPLEtBQUssRUFBWjtBQUNEOztBQUVELFFBQUkscUJBQUo7QUFDQSxRQUFJLFFBQU8sTUFBUCx5Q0FBTyxNQUFQLE9BQWtCLFFBQWxCLElBQThCLGtCQUFrQixNQUFwRCxFQUE0RDtBQUMxRDtBQUNBLHFCQUFlLE1BQWY7QUFDRCxLQUhELE1BR08sSUFBSSxPQUFPLE1BQVAsS0FBa0IsVUFBdEIsRUFBa0M7QUFDdkM7QUFDQSxVQUFNLFNBQVMsTUFBZjtBQUNBO0FBQ0EsV0FBSyxJQUFMLENBQVUsY0FBVixDQUF5QixVQUFDLE1BQUQsRUFBWTtBQUNuQyxZQUFJLGtCQUFrQixNQUF0QixFQUE4QjtBQUM1Qix5QkFBZSxNQUFmO0FBQ0EsaUJBQU8sS0FBUDtBQUNEO0FBQ0YsT0FMRDtBQU1EOztBQUVELFFBQUksWUFBSixFQUFrQjtBQUNoQixXQUFLLElBQUwsQ0FBVSxHQUFWLGlCQUE0QixnQkFBNUIsWUFBbUQsYUFBYSxFQUFoRTtBQUNBLFdBQUssTUFBTCxHQUFjLFlBQWQ7QUFDQSxXQUFLLEVBQUwsR0FBVSxhQUFhLFNBQWIsQ0FBdUIsTUFBdkIsQ0FBVjs7QUFFQSxXQUFLLE9BQUw7QUFDQSxhQUFPLEtBQUssRUFBWjtBQUNEOztBQUVELFNBQUssSUFBTCxDQUFVLEdBQVYscUJBQWdDLGdCQUFoQztBQUNBLFVBQU0sSUFBSSxLQUFKLHFDQUE0QyxnQkFBNUMsMlNBQU47QUFHRCxHQXRISDs7QUFBQSxtQkF3SEUsTUF4SEYsbUJBd0hVLEtBeEhWLEVBd0hpQjtBQUNiLFVBQU8sSUFBSSxLQUFKLENBQVUsOERBQVYsQ0FBUDtBQUNELEdBMUhIOztBQUFBLG1CQTRIRSxTQTVIRixzQkE0SGEsTUE1SGIsRUE0SHFCO0FBQ2pCLFVBQU8sSUFBSSxLQUFKLENBQVUsNEVBQVYsQ0FBUDtBQUNELEdBOUhIOztBQUFBLG1CQWdJRSxPQWhJRixzQkFnSWE7QUFDVCxRQUFJLEtBQUssYUFBTCxJQUFzQixLQUFLLEVBQTNCLElBQWlDLEtBQUssRUFBTCxDQUFRLFVBQTdDLEVBQXlEO0FBQ3ZELFdBQUssRUFBTCxDQUFRLFVBQVIsQ0FBbUIsV0FBbkIsQ0FBK0IsS0FBSyxFQUFwQztBQUNEO0FBQ0YsR0FwSUg7O0FBQUEsbUJBc0lFLE9BdElGLHNCQXNJYSxDQUVWLENBeElIOztBQUFBLG1CQTBJRSxTQTFJRix3QkEwSWU7QUFDWCxTQUFLLE9BQUw7QUFDRCxHQTVJSDs7QUFBQTtBQUFBOzs7Ozs7Ozs7OztBQ2xDQSxJQUFNLGFBQWEsUUFBUSw0QkFBUixDQUFuQjtBQUNBLElBQU0sS0FBSyxRQUFRLG1CQUFSLENBQVg7QUFDQSxJQUFNLE9BQU8sUUFBUSxNQUFSLENBQWI7QUFDQTtBQUNBLElBQU0sY0FBYyxRQUFRLGdCQUFSLENBQXBCO0FBQ0EsSUFBTSxRQUFRLFFBQVEsWUFBUixDQUFkO0FBQ0EsSUFBTSxlQUFlLFFBQVEscUJBQVIsQ0FBckI7QUFDQSxJQUFNLGNBQWMsUUFBUSw2QkFBUixDQUFwQjtBQUNBLElBQU0sMEJBQTBCLFFBQVEseUNBQVIsQ0FBaEM7QUFDQSxJQUFNLGlCQUFpQixRQUFRLGdDQUFSLENBQXZCO0FBQ0EsSUFBTSxlQUFlLFFBQVEsOEJBQVIsQ0FBckI7QUFDQSxJQUFNLHlCQUF5QixRQUFRLDBCQUFSLENBQS9CO0FBQ0EsSUFBTSxTQUFTLFFBQVEsVUFBUixDQUFmLEMsQ0FBbUM7O0FBRW5DOzs7Ozs7SUFLTSxJO0FBQ0o7Ozs7QUFJQSxnQkFBYSxJQUFiLEVBQW1CO0FBQUE7O0FBQUE7O0FBQ2pCLFFBQU0sZ0JBQWdCO0FBQ3BCLGVBQVM7QUFDUCwyQkFBbUI7QUFDakIsYUFBRyx5Q0FEYztBQUVqQixhQUFHO0FBRmMsU0FEWjtBQUtQLGlDQUF5QjtBQUN2QixhQUFHLGlEQURvQjtBQUV2QixhQUFHO0FBRm9CLFNBTGxCO0FBU1AscUJBQWEsMkNBVE47QUFVUCxtQ0FBMkIsK0JBVnBCO0FBV1Asd0JBQWdCLGtDQVhUO0FBWVAsNEJBQW9CLHdCQVpiO0FBYVAsd0JBQWdCLDBCQWJUO0FBY1AsOEJBQXNCLHdCQWRmO0FBZVAsNkJBQXFCLDJCQWZkO0FBZ0JQO0FBQ0Esc0JBQWMsbUNBakJQO0FBa0JQLHNCQUFjO0FBQ1osYUFBRyw0QkFEUztBQUVaLGFBQUc7QUFGUyxTQWxCUDtBQXNCUCxnQkFBUSxRQXRCRDtBQXVCUCxnQkFBUSxTQXZCRDtBQXdCUCxnQkFBUSxRQXhCRDtBQXlCUCxxQkFBYTtBQXpCTjs7QUE2Qlg7QUE5QnNCLEtBQXRCLENBK0JBLElBQU0saUJBQWlCO0FBQ3JCLFVBQUksTUFEaUI7QUFFckIsbUJBQWEsS0FGUTtBQUdyQiw0QkFBc0IsSUFIRDtBQUlyQixhQUFPLEtBSmM7QUFLckIsb0JBQWM7QUFDWixxQkFBYSxJQUREO0FBRVosMEJBQWtCLElBRk47QUFHWiwwQkFBa0IsSUFITjtBQUlaLDBCQUFrQjtBQUpOLE9BTE87QUFXckIsWUFBTSxFQVhlO0FBWXJCLHlCQUFtQiwyQkFBQyxXQUFELEVBQWMsS0FBZDtBQUFBLGVBQXdCLFdBQXhCO0FBQUEsT0FaRTtBQWFyQixzQkFBZ0Isd0JBQUMsS0FBRDtBQUFBLGVBQVcsS0FBWDtBQUFBLE9BYks7QUFjckIsY0FBUSxhQWRhO0FBZXJCLGFBQU87O0FBR1Q7QUFsQnVCLEtBQXZCLENBbUJBLEtBQUssSUFBTCxHQUFZLFNBQWMsRUFBZCxFQUFrQixjQUFsQixFQUFrQyxJQUFsQyxDQUFaO0FBQ0EsU0FBSyxJQUFMLENBQVUsWUFBVixHQUF5QixTQUFjLEVBQWQsRUFBa0IsZUFBZSxZQUFqQyxFQUErQyxLQUFLLElBQUwsQ0FBVSxZQUF6RCxDQUF6Qjs7QUFFQTtBQUNBLFNBQUssVUFBTCxHQUFrQixJQUFJLFVBQUosQ0FBZSxDQUFFLGFBQUYsRUFBaUIsS0FBSyxJQUFMLENBQVUsTUFBM0IsQ0FBZixDQUFsQjtBQUNBLFNBQUssTUFBTCxHQUFjLEtBQUssVUFBTCxDQUFnQixNQUE5QjtBQUNBLFNBQUssSUFBTCxHQUFZLEtBQUssVUFBTCxDQUFnQixTQUFoQixDQUEwQixJQUExQixDQUErQixLQUFLLFVBQXBDLENBQVo7O0FBRUE7QUFDQSxTQUFLLE9BQUwsR0FBZSxFQUFmOztBQUVBLFNBQUssUUFBTCxHQUFnQixLQUFLLFFBQUwsQ0FBYyxJQUFkLENBQW1CLElBQW5CLENBQWhCO0FBQ0EsU0FBSyxTQUFMLEdBQWlCLEtBQUssU0FBTCxDQUFlLElBQWYsQ0FBb0IsSUFBcEIsQ0FBakI7QUFDQSxTQUFLLFdBQUwsR0FBbUIsS0FBSyxXQUFMLENBQWlCLElBQWpCLENBQXNCLElBQXRCLENBQW5CO0FBQ0EsU0FBSyxZQUFMLEdBQW9CLEtBQUssWUFBTCxDQUFrQixJQUFsQixDQUF1QixJQUF2QixDQUFwQjtBQUNBLFNBQUssR0FBTCxHQUFXLEtBQUssR0FBTCxDQUFTLElBQVQsQ0FBYyxJQUFkLENBQVg7QUFDQSxTQUFLLElBQUwsR0FBWSxLQUFLLElBQUwsQ0FBVSxJQUFWLENBQWUsSUFBZixDQUFaO0FBQ0EsU0FBSyxRQUFMLEdBQWdCLEtBQUssUUFBTCxDQUFjLElBQWQsQ0FBbUIsSUFBbkIsQ0FBaEI7QUFDQSxTQUFLLE9BQUwsR0FBZSxLQUFLLE9BQUwsQ0FBYSxJQUFiLENBQWtCLElBQWxCLENBQWY7QUFDQSxTQUFLLFVBQUwsR0FBa0IsS0FBSyxVQUFMLENBQWdCLElBQWhCLENBQXFCLElBQXJCLENBQWxCO0FBQ0EsU0FBSyxXQUFMLEdBQW1CLEtBQUssV0FBTCxDQUFpQixJQUFqQixDQUFzQixJQUF0QixDQUFuQjtBQUNBLFNBQUssa0JBQUwsR0FBMEIsS0FBSyxrQkFBTCxDQUF3QixJQUF4QixDQUE2QixJQUE3QixDQUExQjtBQUNBLFNBQUssa0JBQUwsR0FBMEIsS0FBSyxrQkFBTCxDQUF3QixJQUF4QixDQUE2QixJQUE3QixDQUExQjtBQUNBLFNBQUssYUFBTCxHQUFxQixLQUFLLGFBQUwsQ0FBbUIsSUFBbkIsQ0FBd0IsSUFBeEIsQ0FBckI7O0FBRUEsU0FBSyxRQUFMLEdBQWdCLEtBQUssUUFBTCxDQUFjLElBQWQsQ0FBbUIsSUFBbkIsQ0FBaEI7QUFDQSxTQUFLLFNBQUwsR0FBaUIsS0FBSyxTQUFMLENBQWUsSUFBZixDQUFvQixJQUFwQixDQUFqQjtBQUNBLFNBQUssUUFBTCxHQUFnQixLQUFLLFFBQUwsQ0FBYyxJQUFkLENBQW1CLElBQW5CLENBQWhCO0FBQ0EsU0FBSyxTQUFMLEdBQWlCLEtBQUssU0FBTCxDQUFlLElBQWYsQ0FBb0IsSUFBcEIsQ0FBakI7QUFDQSxTQUFLLFdBQUwsR0FBbUIsS0FBSyxXQUFMLENBQWlCLElBQWpCLENBQXNCLElBQXRCLENBQW5CO0FBQ0EsU0FBSyxNQUFMLEdBQWMsS0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixJQUFqQixDQUFkOztBQUVBLFNBQUssT0FBTCxHQUFlLElBQWY7QUFDQSxTQUFLLEVBQUwsR0FBVSxLQUFLLEVBQUwsQ0FBUSxJQUFSLENBQWEsSUFBYixDQUFWO0FBQ0EsU0FBSyxHQUFMLEdBQVcsS0FBSyxHQUFMLENBQVMsSUFBVCxDQUFjLElBQWQsQ0FBWDtBQUNBLFNBQUssSUFBTCxHQUFZLEtBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsSUFBbEIsQ0FBdUIsS0FBSyxPQUE1QixDQUFaO0FBQ0EsU0FBSyxJQUFMLEdBQVksS0FBSyxPQUFMLENBQWEsSUFBYixDQUFrQixJQUFsQixDQUF1QixLQUFLLE9BQTVCLENBQVo7O0FBRUEsU0FBSyxhQUFMLEdBQXFCLEVBQXJCO0FBQ0EsU0FBSyxTQUFMLEdBQWlCLEVBQWpCO0FBQ0EsU0FBSyxjQUFMLEdBQXNCLEVBQXRCOztBQUVBLFNBQUssS0FBTCxHQUFhLEtBQUssSUFBTCxDQUFVLEtBQXZCO0FBQ0EsU0FBSyxRQUFMLENBQWM7QUFDWixlQUFTLEVBREc7QUFFWixhQUFPLEVBRks7QUFHWixzQkFBZ0IsRUFISjtBQUlaLHNCQUFnQixJQUpKO0FBS1osb0JBQWM7QUFDWix3QkFBZ0Isd0JBREo7QUFFWiwwQkFBa0I7QUFGTixPQUxGO0FBU1oscUJBQWUsQ0FUSDtBQVVaLHlCQUFXLEtBQUssSUFBTCxDQUFVLElBQXJCLENBVlk7QUFXWixZQUFNO0FBQ0osa0JBQVUsSUFETjtBQUVKLGNBQU0sTUFGRjtBQUdKLGlCQUFTO0FBSEw7QUFYTSxLQUFkOztBQWtCQSxTQUFLLGlCQUFMLEdBQXlCLEtBQUssS0FBTCxDQUFXLFNBQVgsQ0FBcUIsVUFBQyxTQUFELEVBQVksU0FBWixFQUF1QixLQUF2QixFQUFpQztBQUM3RSxZQUFLLElBQUwsQ0FBVSxjQUFWLEVBQTBCLFNBQTFCLEVBQXFDLFNBQXJDLEVBQWdELEtBQWhEO0FBQ0EsWUFBSyxTQUFMLENBQWUsU0FBZjtBQUNELEtBSHdCLENBQXpCOztBQUtBO0FBQ0E7QUFDQSxRQUFJLEtBQUssSUFBTCxDQUFVLEtBQVYsSUFBbUIsT0FBTyxNQUFQLEtBQWtCLFdBQXpDLEVBQXNEO0FBQ3BELGFBQU8sU0FBUCxJQUFvQixFQUFwQjtBQUNBLGFBQU8sS0FBSyxJQUFMLENBQVUsRUFBakIsSUFBdUIsSUFBdkI7QUFDRDs7QUFFRCxTQUFLLGFBQUw7QUFDRDs7aUJBRUQsRSxlQUFJLEssRUFBTyxRLEVBQVU7QUFDbkIsU0FBSyxPQUFMLENBQWEsRUFBYixDQUFnQixLQUFoQixFQUF1QixRQUF2QjtBQUNBLFdBQU8sSUFBUDtBQUNELEc7O2lCQUVELEcsZ0JBQUssSyxFQUFPLFEsRUFBVTtBQUNwQixTQUFLLE9BQUwsQ0FBYSxHQUFiLENBQWlCLEtBQWpCLEVBQXdCLFFBQXhCO0FBQ0EsV0FBTyxJQUFQO0FBQ0QsRzs7QUFFRDs7Ozs7OztpQkFLQSxTLHNCQUFXLEssRUFBTztBQUNoQixTQUFLLGNBQUwsQ0FBb0Isa0JBQVU7QUFDNUIsYUFBTyxNQUFQLENBQWMsS0FBZDtBQUNELEtBRkQ7QUFHRCxHOztBQUVEOzs7Ozs7O2lCQUtBLFEscUJBQVUsSyxFQUFPO0FBQ2YsU0FBSyxLQUFMLENBQVcsUUFBWCxDQUFvQixLQUFwQjtBQUNELEc7O0FBRUQ7Ozs7OztpQkFJQSxRLHVCQUFZO0FBQ1YsV0FBTyxLQUFLLEtBQUwsQ0FBVyxRQUFYLEVBQVA7QUFDRCxHOztBQUVEOzs7OztBQU9BOzs7aUJBR0EsWSx5QkFBYyxNLEVBQVEsSyxFQUFPO0FBQUE7O0FBQzNCLFFBQUksQ0FBQyxLQUFLLFFBQUwsR0FBZ0IsS0FBaEIsQ0FBc0IsTUFBdEIsQ0FBTCxFQUFvQztBQUNsQyxZQUFNLElBQUksS0FBSiwrQkFBaUMsTUFBakMseUNBQU47QUFDRDs7QUFFRCxTQUFLLFFBQUwsQ0FBYztBQUNaLGFBQU8sU0FBYyxFQUFkLEVBQWtCLEtBQUssUUFBTCxHQUFnQixLQUFsQyw2QkFDSixNQURJLElBQ0ssU0FBYyxFQUFkLEVBQWtCLEtBQUssUUFBTCxHQUFnQixLQUFoQixDQUFzQixNQUF0QixDQUFsQixFQUFpRCxLQUFqRCxDQURMO0FBREssS0FBZDtBQUtELEc7O2lCQUVELGEsNEJBQWlCO0FBQ2YsUUFBTSxrQkFBa0I7QUFDdEIsa0JBQVksQ0FEVTtBQUV0QixxQkFBZSxDQUZPO0FBR3RCLHNCQUFnQixLQUhNO0FBSXRCLHFCQUFlO0FBSk8sS0FBeEI7QUFNQSxRQUFNLFFBQVEsU0FBYyxFQUFkLEVBQWtCLEtBQUssUUFBTCxHQUFnQixLQUFsQyxDQUFkO0FBQ0EsUUFBTSxlQUFlLEVBQXJCO0FBQ0EsV0FBTyxJQUFQLENBQVksS0FBWixFQUFtQixPQUFuQixDQUEyQixrQkFBVTtBQUNuQyxVQUFNLGNBQWMsU0FBYyxFQUFkLEVBQWtCLE1BQU0sTUFBTixDQUFsQixDQUFwQjtBQUNBLGtCQUFZLFFBQVosR0FBdUIsU0FBYyxFQUFkLEVBQWtCLFlBQVksUUFBOUIsRUFBd0MsZUFBeEMsQ0FBdkI7QUFDQSxtQkFBYSxNQUFiLElBQXVCLFdBQXZCO0FBQ0QsS0FKRDs7QUFNQSxTQUFLLFFBQUwsQ0FBYztBQUNaLGFBQU8sWUFESztBQUVaLHFCQUFlO0FBRkgsS0FBZDs7QUFLQTtBQUNBLFNBQUssSUFBTCxDQUFVLGdCQUFWO0FBQ0QsRzs7aUJBRUQsZSw0QkFBaUIsRSxFQUFJO0FBQ25CLFNBQUssYUFBTCxDQUFtQixJQUFuQixDQUF3QixFQUF4QjtBQUNELEc7O2lCQUVELGtCLCtCQUFvQixFLEVBQUk7QUFDdEIsUUFBTSxJQUFJLEtBQUssYUFBTCxDQUFtQixPQUFuQixDQUEyQixFQUEzQixDQUFWO0FBQ0EsUUFBSSxNQUFNLENBQUMsQ0FBWCxFQUFjO0FBQ1osV0FBSyxhQUFMLENBQW1CLE1BQW5CLENBQTBCLENBQTFCLEVBQTZCLENBQTdCO0FBQ0Q7QUFDRixHOztpQkFFRCxnQiw2QkFBa0IsRSxFQUFJO0FBQ3BCLFNBQUssY0FBTCxDQUFvQixJQUFwQixDQUF5QixFQUF6QjtBQUNELEc7O2lCQUVELG1CLGdDQUFxQixFLEVBQUk7QUFDdkIsUUFBTSxJQUFJLEtBQUssY0FBTCxDQUFvQixPQUFwQixDQUE0QixFQUE1QixDQUFWO0FBQ0EsUUFBSSxNQUFNLENBQUMsQ0FBWCxFQUFjO0FBQ1osV0FBSyxjQUFMLENBQW9CLE1BQXBCLENBQTJCLENBQTNCLEVBQThCLENBQTlCO0FBQ0Q7QUFDRixHOztpQkFFRCxXLHdCQUFhLEUsRUFBSTtBQUNmLFNBQUssU0FBTCxDQUFlLElBQWYsQ0FBb0IsRUFBcEI7QUFDRCxHOztpQkFFRCxjLDJCQUFnQixFLEVBQUk7QUFDbEIsUUFBTSxJQUFJLEtBQUssU0FBTCxDQUFlLE9BQWYsQ0FBdUIsRUFBdkIsQ0FBVjtBQUNBLFFBQUksTUFBTSxDQUFDLENBQVgsRUFBYztBQUNaLFdBQUssU0FBTCxDQUFlLE1BQWYsQ0FBc0IsQ0FBdEIsRUFBeUIsQ0FBekI7QUFDRDtBQUNGLEc7O2lCQUVELE8sb0JBQVMsSSxFQUFNO0FBQ2IsUUFBTSxjQUFjLFNBQWMsRUFBZCxFQUFrQixLQUFLLFFBQUwsR0FBZ0IsSUFBbEMsRUFBd0MsSUFBeEMsQ0FBcEI7QUFDQSxRQUFNLGVBQWUsU0FBYyxFQUFkLEVBQWtCLEtBQUssUUFBTCxHQUFnQixLQUFsQyxDQUFyQjs7QUFFQSxXQUFPLElBQVAsQ0FBWSxZQUFaLEVBQTBCLE9BQTFCLENBQWtDLFVBQUMsTUFBRCxFQUFZO0FBQzVDLG1CQUFhLE1BQWIsSUFBdUIsU0FBYyxFQUFkLEVBQWtCLGFBQWEsTUFBYixDQUFsQixFQUF3QztBQUM3RCxjQUFNLFNBQWMsRUFBZCxFQUFrQixhQUFhLE1BQWIsRUFBcUIsSUFBdkMsRUFBNkMsSUFBN0M7QUFEdUQsT0FBeEMsQ0FBdkI7QUFHRCxLQUpEOztBQU1BLFNBQUssR0FBTCxDQUFTLGtCQUFUO0FBQ0EsU0FBSyxHQUFMLENBQVMsSUFBVDs7QUFFQSxTQUFLLFFBQUwsQ0FBYztBQUNaLFlBQU0sV0FETTtBQUVaLGFBQU87QUFGSyxLQUFkO0FBSUQsRzs7aUJBRUQsVyx3QkFBYSxNLEVBQVEsSSxFQUFNO0FBQ3pCLFFBQU0sZUFBZSxTQUFjLEVBQWQsRUFBa0IsS0FBSyxRQUFMLEdBQWdCLEtBQWxDLENBQXJCO0FBQ0EsUUFBSSxDQUFDLGFBQWEsTUFBYixDQUFMLEVBQTJCO0FBQ3pCLFdBQUssR0FBTCxDQUFTLG9FQUFULEVBQStFLE1BQS9FO0FBQ0E7QUFDRDtBQUNELFFBQU0sVUFBVSxTQUFjLEVBQWQsRUFBa0IsYUFBYSxNQUFiLEVBQXFCLElBQXZDLEVBQTZDLElBQTdDLENBQWhCO0FBQ0EsaUJBQWEsTUFBYixJQUF1QixTQUFjLEVBQWQsRUFBa0IsYUFBYSxNQUFiLENBQWxCLEVBQXdDO0FBQzdELFlBQU07QUFEdUQsS0FBeEMsQ0FBdkI7QUFHQSxTQUFLLFFBQUwsQ0FBYyxFQUFDLE9BQU8sWUFBUixFQUFkO0FBQ0QsRzs7QUFFRDs7Ozs7OztpQkFLQSxPLG9CQUFTLE0sRUFBUTtBQUNmLFdBQU8sS0FBSyxRQUFMLEdBQWdCLEtBQWhCLENBQXNCLE1BQXRCLENBQVA7QUFDRCxHOztBQUVEOzs7OztpQkFHQSxRLHVCQUFZO0FBQUEsb0JBQ1EsS0FBSyxRQUFMLEVBRFI7QUFBQSxRQUNGLEtBREUsYUFDRixLQURFOztBQUVWLFdBQU8sT0FBTyxJQUFQLENBQVksS0FBWixFQUFtQixHQUFuQixDQUF1QixVQUFDLE1BQUQ7QUFBQSxhQUFZLE1BQU0sTUFBTixDQUFaO0FBQUEsS0FBdkIsQ0FBUDtBQUNELEc7O0FBRUQ7Ozs7Ozs7aUJBS0Esc0IsbUNBQXdCLEssRUFBTztBQUFBLFFBQ3RCLGdCQURzQixHQUNGLEtBQUssSUFBTCxDQUFVLFlBRFIsQ0FDdEIsZ0JBRHNCOztBQUU3QixRQUFJLE9BQU8sSUFBUCxDQUFZLEtBQVosRUFBbUIsTUFBbkIsR0FBNEIsZ0JBQWhDLEVBQWtEO0FBQ2hELFlBQU0sSUFBSSxLQUFKLE1BQWEsS0FBSyxJQUFMLENBQVUseUJBQVYsRUFBcUMsRUFBRSxhQUFhLGdCQUFmLEVBQXJDLENBQWIsQ0FBTjtBQUNEO0FBQ0YsRzs7QUFFRDs7Ozs7Ozs7O2lCQU9BLGtCLCtCQUFvQixJLEVBQU07QUFBQSw2QkFDa0MsS0FBSyxJQUFMLENBQVUsWUFENUM7QUFBQSxRQUNqQixXQURpQixzQkFDakIsV0FEaUI7QUFBQSxRQUNKLGdCQURJLHNCQUNKLGdCQURJO0FBQUEsUUFDYyxnQkFEZCxzQkFDYyxnQkFEZDs7O0FBR3hCLFFBQUksZ0JBQUosRUFBc0I7QUFDcEIsVUFBSSxPQUFPLElBQVAsQ0FBWSxLQUFLLFFBQUwsR0FBZ0IsS0FBNUIsRUFBbUMsTUFBbkMsR0FBNEMsQ0FBNUMsR0FBZ0QsZ0JBQXBELEVBQXNFO0FBQ3BFLGNBQU0sSUFBSSxLQUFKLE1BQWEsS0FBSyxJQUFMLENBQVUsbUJBQVYsRUFBK0IsRUFBRSxhQUFhLGdCQUFmLEVBQS9CLENBQWIsQ0FBTjtBQUNEO0FBQ0Y7O0FBRUQsUUFBSSxnQkFBSixFQUFzQjtBQUNwQixVQUFNLG9CQUFvQixpQkFBaUIsSUFBakIsQ0FBc0IsVUFBQyxJQUFELEVBQVU7QUFDeEQ7O0FBRUE7QUFDQSxZQUFJLEtBQUssT0FBTCxDQUFhLEdBQWIsSUFBb0IsQ0FBQyxDQUF6QixFQUE0QjtBQUMxQixjQUFJLENBQUMsS0FBSyxJQUFWLEVBQWdCLE9BQU8sS0FBUDtBQUNoQixpQkFBTyxNQUFNLEtBQUssSUFBWCxFQUFpQixJQUFqQixDQUFQO0FBQ0Q7O0FBRUQ7QUFDQSxZQUFJLEtBQUssQ0FBTCxNQUFZLEdBQWhCLEVBQXFCO0FBQ25CLGlCQUFPLEtBQUssU0FBTCxDQUFlLFdBQWYsT0FBaUMsS0FBSyxNQUFMLENBQVksQ0FBWixFQUFlLFdBQWYsRUFBeEM7QUFDRDtBQUNELGVBQU8sS0FBUDtBQUNELE9BZHlCLENBQTFCOztBQWdCQSxVQUFJLENBQUMsaUJBQUwsRUFBd0I7QUFDdEIsWUFBTSx5QkFBeUIsaUJBQWlCLElBQWpCLENBQXNCLElBQXRCLENBQS9CO0FBQ0EsY0FBTSxJQUFJLEtBQUosQ0FBVSxLQUFLLElBQUwsQ0FBVSwyQkFBVixFQUF1QyxFQUFFLE9BQU8sc0JBQVQsRUFBdkMsQ0FBVixDQUFOO0FBQ0Q7QUFDRjs7QUFFRCxRQUFJLFdBQUosRUFBaUI7QUFDZixVQUFJLEtBQUssSUFBTCxDQUFVLElBQVYsR0FBaUIsV0FBckIsRUFBa0M7QUFDaEMsY0FBTSxJQUFJLEtBQUosQ0FBYSxLQUFLLElBQUwsQ0FBVSxhQUFWLENBQWIsU0FBeUMsWUFBWSxXQUFaLENBQXpDLENBQU47QUFDRDtBQUNGO0FBQ0YsRzs7QUFFRDs7Ozs7Ozs7O2lCQU9BLE8sb0JBQVMsSSxFQUFNO0FBQUE7QUFBQTs7QUFBQSxxQkFDcUIsS0FBSyxRQUFMLEVBRHJCO0FBQUEsUUFDTCxLQURLLGNBQ0wsS0FESztBQUFBLFFBQ0UsY0FERixjQUNFLGNBREY7O0FBR2IsUUFBTSxVQUFVLFNBQVYsT0FBVSxDQUFDLEdBQUQsRUFBUztBQUN2QixVQUFNLE1BQU0sUUFBTyxHQUFQLHlDQUFPLEdBQVAsT0FBZSxRQUFmLEdBQTBCLEdBQTFCLEdBQWdDLElBQUksS0FBSixDQUFVLEdBQVYsQ0FBNUM7QUFDQSxhQUFLLEdBQUwsQ0FBUyxJQUFJLE9BQWI7QUFDQSxhQUFLLElBQUwsQ0FBVSxJQUFJLE9BQWQsRUFBdUIsT0FBdkIsRUFBZ0MsSUFBaEM7QUFDQSxZQUFNLEdBQU47QUFDRCxLQUxEOztBQU9BLFFBQUksbUJBQW1CLEtBQXZCLEVBQThCO0FBQzVCLGNBQVEsSUFBSSxLQUFKLENBQVUsMENBQVYsQ0FBUjtBQUNEOztBQUVELFFBQU0sMEJBQTBCLEtBQUssSUFBTCxDQUFVLGlCQUFWLENBQTRCLElBQTVCLEVBQWtDLEtBQWxDLENBQWhDOztBQUVBLFFBQUksNEJBQTRCLEtBQWhDLEVBQXVDO0FBQ3JDLFdBQUssR0FBTCxDQUFTLDBEQUFUO0FBQ0E7QUFDRDs7QUFFRCxRQUFJLFFBQU8sdUJBQVAseUNBQU8sdUJBQVAsT0FBbUMsUUFBbkMsSUFBK0MsdUJBQW5ELEVBQTRFO0FBQzFFO0FBQ0EsVUFBSSx3QkFBd0IsSUFBNUIsRUFBa0M7QUFDaEMsY0FBTSxJQUFJLFNBQUosQ0FBYyxrR0FBZCxDQUFOO0FBQ0Q7QUFDRCxhQUFPLHVCQUFQO0FBQ0Q7O0FBRUQsUUFBTSxXQUFXLFlBQVksSUFBWixDQUFqQjtBQUNBLFFBQUksaUJBQUo7QUFDQSxRQUFJLEtBQUssSUFBVCxFQUFlO0FBQ2IsaUJBQVcsS0FBSyxJQUFoQjtBQUNELEtBRkQsTUFFTyxJQUFJLFNBQVMsS0FBVCxDQUFlLEdBQWYsRUFBb0IsQ0FBcEIsTUFBMkIsT0FBL0IsRUFBd0M7QUFDN0MsaUJBQVcsU0FBUyxLQUFULENBQWUsR0FBZixFQUFvQixDQUFwQixJQUF5QixHQUF6QixHQUErQixTQUFTLEtBQVQsQ0FBZSxHQUFmLEVBQW9CLENBQXBCLENBQTFDO0FBQ0QsS0FGTSxNQUVBO0FBQ0wsaUJBQVcsUUFBWDtBQUNEO0FBQ0QsUUFBTSxnQkFBZ0Isd0JBQXdCLFFBQXhCLEVBQWtDLFNBQXhEO0FBQ0EsUUFBTSxXQUFXLEtBQUssUUFBTCxJQUFpQixLQUFsQzs7QUFFQSxRQUFNLFNBQVMsZUFBZSxJQUFmLENBQWY7O0FBRUEsUUFBTSxPQUFPLEtBQUssSUFBTCxJQUFhLEVBQTFCO0FBQ0EsU0FBSyxJQUFMLEdBQVksUUFBWjtBQUNBLFNBQUssSUFBTCxHQUFZLFFBQVo7O0FBRUEsUUFBTSxVQUFVO0FBQ2QsY0FBUSxLQUFLLE1BQUwsSUFBZSxFQURUO0FBRWQsVUFBSSxNQUZVO0FBR2QsWUFBTSxRQUhRO0FBSWQsaUJBQVcsaUJBQWlCLEVBSmQ7QUFLZCxZQUFNLFNBQWMsRUFBZCxFQUFrQixLQUFLLFFBQUwsR0FBZ0IsSUFBbEMsRUFBd0MsSUFBeEMsQ0FMUTtBQU1kLFlBQU0sUUFOUTtBQU9kLFlBQU0sS0FBSyxJQVBHO0FBUWQsZ0JBQVU7QUFDUixvQkFBWSxDQURKO0FBRVIsdUJBQWUsQ0FGUDtBQUdSLG9CQUFZLEtBQUssSUFBTCxDQUFVLElBQVYsSUFBa0IsQ0FIdEI7QUFJUix3QkFBZ0IsS0FKUjtBQUtSLHVCQUFlO0FBTFAsT0FSSTtBQWVkLFlBQU0sS0FBSyxJQUFMLENBQVUsSUFBVixJQUFrQixDQWZWO0FBZ0JkLGdCQUFVLFFBaEJJO0FBaUJkLGNBQVEsS0FBSyxNQUFMLElBQWUsRUFqQlQ7QUFrQmQsZUFBUyxLQUFLO0FBbEJBLEtBQWhCOztBQXFCQSxRQUFJO0FBQ0YsV0FBSyxrQkFBTCxDQUF3QixPQUF4QjtBQUNELEtBRkQsQ0FFRSxPQUFPLEdBQVAsRUFBWTtBQUNaLGNBQVEsR0FBUjtBQUNEOztBQUVELFNBQUssUUFBTCxDQUFjO0FBQ1osYUFBTyxTQUFjLEVBQWQsRUFBa0IsS0FBbEIsNkJBQ0osTUFESSxJQUNLLE9BREw7QUFESyxLQUFkOztBQU1BLFNBQUssSUFBTCxDQUFVLFlBQVYsRUFBd0IsT0FBeEI7QUFDQSxTQUFLLEdBQUwsa0JBQXdCLFFBQXhCLFVBQXFDLE1BQXJDLHFCQUEyRCxRQUEzRDs7QUFFQSxRQUFJLEtBQUssSUFBTCxDQUFVLFdBQVYsSUFBeUIsQ0FBQyxLQUFLLG9CQUFuQyxFQUF5RDtBQUN2RCxXQUFLLG9CQUFMLEdBQTRCLFdBQVcsWUFBTTtBQUMzQyxlQUFLLG9CQUFMLEdBQTRCLElBQTVCO0FBQ0EsZUFBSyxNQUFMLEdBQWMsS0FBZCxDQUFvQixVQUFDLEdBQUQsRUFBUztBQUMzQixrQkFBUSxLQUFSLENBQWMsSUFBSSxLQUFKLElBQWEsSUFBSSxPQUFqQixJQUE0QixHQUExQztBQUNELFNBRkQ7QUFHRCxPQUwyQixFQUt6QixDQUx5QixDQUE1QjtBQU1EO0FBQ0YsRzs7aUJBRUQsVSx1QkFBWSxNLEVBQVE7QUFBQTs7QUFBQSxxQkFDZ0IsS0FBSyxRQUFMLEVBRGhCO0FBQUEsUUFDVixLQURVLGNBQ1YsS0FEVTtBQUFBLFFBQ0gsY0FERyxjQUNILGNBREc7O0FBRWxCLFFBQU0sZUFBZSxTQUFjLEVBQWQsRUFBa0IsS0FBbEIsQ0FBckI7QUFDQSxRQUFNLGNBQWMsYUFBYSxNQUFiLENBQXBCO0FBQ0EsV0FBTyxhQUFhLE1BQWIsQ0FBUDs7QUFFQTtBQUNBLFFBQU0saUJBQWlCLFNBQWMsRUFBZCxFQUFrQixjQUFsQixDQUF2QjtBQUNBLFFBQU0sZ0JBQWdCLEVBQXRCO0FBQ0EsV0FBTyxJQUFQLENBQVksY0FBWixFQUE0QixPQUE1QixDQUFvQyxVQUFDLFFBQUQsRUFBYztBQUNoRCxVQUFNLGFBQWEsZUFBZSxRQUFmLEVBQXlCLE9BQXpCLENBQWlDLE1BQWpDLENBQXdDLFVBQUMsWUFBRDtBQUFBLGVBQWtCLGlCQUFpQixNQUFuQztBQUFBLE9BQXhDLENBQW5CO0FBQ0E7QUFDQSxVQUFJLFdBQVcsTUFBWCxLQUFzQixDQUExQixFQUE2QjtBQUMzQixzQkFBYyxJQUFkLENBQW1CLFFBQW5CO0FBQ0E7QUFDRDs7QUFFRCxxQkFBZSxRQUFmLElBQTJCLFNBQWMsRUFBZCxFQUFrQixlQUFlLFFBQWYsQ0FBbEIsRUFBNEM7QUFDckUsaUJBQVM7QUFENEQsT0FBNUMsQ0FBM0I7QUFHRCxLQVhEOztBQWFBLFNBQUssUUFBTCxDQUFjO0FBQ1osc0JBQWdCLGNBREo7QUFFWixhQUFPO0FBRkssS0FBZDs7QUFLQSxrQkFBYyxPQUFkLENBQXNCLFVBQUMsUUFBRCxFQUFjO0FBQ2xDLGFBQUssYUFBTCxDQUFtQixRQUFuQjtBQUNELEtBRkQ7O0FBSUEsU0FBSyx1QkFBTDtBQUNBLFNBQUssSUFBTCxDQUFVLGNBQVYsRUFBMEIsV0FBMUI7QUFDQSxTQUFLLEdBQUwsb0JBQTBCLFlBQVksRUFBdEM7QUFDRCxHOztpQkFFRCxXLHdCQUFhLE0sRUFBUTtBQUNuQixRQUFJLENBQUMsS0FBSyxRQUFMLEdBQWdCLFlBQWhCLENBQTZCLGdCQUE5QixJQUNDLEtBQUssT0FBTCxDQUFhLE1BQWIsRUFBcUIsY0FEMUIsRUFDMEM7QUFDeEM7QUFDRDs7QUFFRCxRQUFNLFlBQVksS0FBSyxPQUFMLENBQWEsTUFBYixFQUFxQixRQUFyQixJQUFpQyxLQUFuRDtBQUNBLFFBQU0sV0FBVyxDQUFDLFNBQWxCOztBQUVBLFNBQUssWUFBTCxDQUFrQixNQUFsQixFQUEwQjtBQUN4QixnQkFBVTtBQURjLEtBQTFCOztBQUlBLFNBQUssSUFBTCxDQUFVLGNBQVYsRUFBMEIsTUFBMUIsRUFBa0MsUUFBbEM7O0FBRUEsV0FBTyxRQUFQO0FBQ0QsRzs7aUJBRUQsUSx1QkFBWTtBQUNWLFFBQU0sZUFBZSxTQUFjLEVBQWQsRUFBa0IsS0FBSyxRQUFMLEdBQWdCLEtBQWxDLENBQXJCO0FBQ0EsUUFBTSx5QkFBeUIsT0FBTyxJQUFQLENBQVksWUFBWixFQUEwQixNQUExQixDQUFpQyxVQUFDLElBQUQsRUFBVTtBQUN4RSxhQUFPLENBQUMsYUFBYSxJQUFiLEVBQW1CLFFBQW5CLENBQTRCLGNBQTdCLElBQ0EsYUFBYSxJQUFiLEVBQW1CLFFBQW5CLENBQTRCLGFBRG5DO0FBRUQsS0FIOEIsQ0FBL0I7O0FBS0EsMkJBQXVCLE9BQXZCLENBQStCLFVBQUMsSUFBRCxFQUFVO0FBQ3ZDLFVBQU0sY0FBYyxTQUFjLEVBQWQsRUFBa0IsYUFBYSxJQUFiLENBQWxCLEVBQXNDO0FBQ3hELGtCQUFVO0FBRDhDLE9BQXRDLENBQXBCO0FBR0EsbUJBQWEsSUFBYixJQUFxQixXQUFyQjtBQUNELEtBTEQ7QUFNQSxTQUFLLFFBQUwsQ0FBYyxFQUFDLE9BQU8sWUFBUixFQUFkOztBQUVBLFNBQUssSUFBTCxDQUFVLFdBQVY7QUFDRCxHOztpQkFFRCxTLHdCQUFhO0FBQ1gsUUFBTSxlQUFlLFNBQWMsRUFBZCxFQUFrQixLQUFLLFFBQUwsR0FBZ0IsS0FBbEMsQ0FBckI7QUFDQSxRQUFNLHlCQUF5QixPQUFPLElBQVAsQ0FBWSxZQUFaLEVBQTBCLE1BQTFCLENBQWlDLFVBQUMsSUFBRCxFQUFVO0FBQ3hFLGFBQU8sQ0FBQyxhQUFhLElBQWIsRUFBbUIsUUFBbkIsQ0FBNEIsY0FBN0IsSUFDQSxhQUFhLElBQWIsRUFBbUIsUUFBbkIsQ0FBNEIsYUFEbkM7QUFFRCxLQUg4QixDQUEvQjs7QUFLQSwyQkFBdUIsT0FBdkIsQ0FBK0IsVUFBQyxJQUFELEVBQVU7QUFDdkMsVUFBTSxjQUFjLFNBQWMsRUFBZCxFQUFrQixhQUFhLElBQWIsQ0FBbEIsRUFBc0M7QUFDeEQsa0JBQVUsS0FEOEM7QUFFeEQsZUFBTztBQUZpRCxPQUF0QyxDQUFwQjtBQUlBLG1CQUFhLElBQWIsSUFBcUIsV0FBckI7QUFDRCxLQU5EO0FBT0EsU0FBSyxRQUFMLENBQWMsRUFBQyxPQUFPLFlBQVIsRUFBZDs7QUFFQSxTQUFLLElBQUwsQ0FBVSxZQUFWO0FBQ0QsRzs7aUJBRUQsUSx1QkFBWTtBQUNWLFFBQU0sZUFBZSxTQUFjLEVBQWQsRUFBa0IsS0FBSyxRQUFMLEdBQWdCLEtBQWxDLENBQXJCO0FBQ0EsUUFBTSxlQUFlLE9BQU8sSUFBUCxDQUFZLFlBQVosRUFBMEIsTUFBMUIsQ0FBaUMsZ0JBQVE7QUFDNUQsYUFBTyxhQUFhLElBQWIsRUFBbUIsS0FBMUI7QUFDRCxLQUZvQixDQUFyQjs7QUFJQSxpQkFBYSxPQUFiLENBQXFCLFVBQUMsSUFBRCxFQUFVO0FBQzdCLFVBQU0sY0FBYyxTQUFjLEVBQWQsRUFBa0IsYUFBYSxJQUFiLENBQWxCLEVBQXNDO0FBQ3hELGtCQUFVLEtBRDhDO0FBRXhELGVBQU87QUFGaUQsT0FBdEMsQ0FBcEI7QUFJQSxtQkFBYSxJQUFiLElBQXFCLFdBQXJCO0FBQ0QsS0FORDtBQU9BLFNBQUssUUFBTCxDQUFjO0FBQ1osYUFBTyxZQURLO0FBRVosYUFBTztBQUZLLEtBQWQ7O0FBS0EsU0FBSyxJQUFMLENBQVUsV0FBVixFQUF1QixZQUF2Qjs7QUFFQSxRQUFNLFdBQVcsS0FBSyxhQUFMLENBQW1CLFlBQW5CLENBQWpCO0FBQ0EsV0FBTyxLQUFLLFVBQUwsQ0FBZ0IsUUFBaEIsQ0FBUDtBQUNELEc7O2lCQUVELFMsd0JBQWE7QUFBQTs7QUFDWCxTQUFLLElBQUwsQ0FBVSxZQUFWOztBQUVBLFFBQU0sUUFBUSxPQUFPLElBQVAsQ0FBWSxLQUFLLFFBQUwsR0FBZ0IsS0FBNUIsQ0FBZDtBQUNBLFVBQU0sT0FBTixDQUFjLFVBQUMsTUFBRCxFQUFZO0FBQ3hCLGFBQUssVUFBTCxDQUFnQixNQUFoQjtBQUNELEtBRkQ7O0FBSUEsU0FBSyxRQUFMLENBQWM7QUFDWixzQkFBZ0IsSUFESjtBQUVaLHFCQUFlLENBRkg7QUFHWixhQUFPO0FBSEssS0FBZDtBQUtELEc7O2lCQUVELFcsd0JBQWEsTSxFQUFRO0FBQ25CLFFBQU0sZUFBZSxTQUFjLEVBQWQsRUFBa0IsS0FBSyxRQUFMLEdBQWdCLEtBQWxDLENBQXJCO0FBQ0EsUUFBTSxjQUFjLFNBQWMsRUFBZCxFQUFrQixhQUFhLE1BQWIsQ0FBbEIsRUFDbEIsRUFBRSxPQUFPLElBQVQsRUFBZSxVQUFVLEtBQXpCLEVBRGtCLENBQXBCO0FBR0EsaUJBQWEsTUFBYixJQUF1QixXQUF2QjtBQUNBLFNBQUssUUFBTCxDQUFjO0FBQ1osYUFBTztBQURLLEtBQWQ7O0FBSUEsU0FBSyxJQUFMLENBQVUsY0FBVixFQUEwQixNQUExQjs7QUFFQSxRQUFNLFdBQVcsS0FBSyxhQUFMLENBQW1CLENBQUUsTUFBRixDQUFuQixDQUFqQjtBQUNBLFdBQU8sS0FBSyxVQUFMLENBQWdCLFFBQWhCLENBQVA7QUFDRCxHOztpQkFFRCxLLG9CQUFTO0FBQ1AsU0FBSyxTQUFMO0FBQ0QsRzs7aUJBRUQsa0IsK0JBQW9CLEksRUFBTSxJLEVBQU07QUFDOUIsUUFBSSxDQUFDLEtBQUssT0FBTCxDQUFhLEtBQUssRUFBbEIsQ0FBTCxFQUE0QjtBQUMxQixXQUFLLEdBQUwsNkRBQW1FLEtBQUssRUFBeEU7QUFDQTtBQUNEOztBQUVELFNBQUssWUFBTCxDQUFrQixLQUFLLEVBQXZCLEVBQTJCO0FBQ3pCLGdCQUFVLFNBQWMsRUFBZCxFQUFrQixLQUFLLE9BQUwsQ0FBYSxLQUFLLEVBQWxCLEVBQXNCLFFBQXhDLEVBQWtEO0FBQzFELHVCQUFlLEtBQUssYUFEc0M7QUFFMUQsb0JBQVksS0FBSyxVQUZ5QztBQUcxRCxvQkFBWSxLQUFLLEtBQUwsQ0FBVyxDQUFDLEtBQUssYUFBTCxHQUFxQixLQUFLLFVBQTFCLEdBQXVDLEdBQXhDLEVBQTZDLE9BQTdDLENBQXFELENBQXJELENBQVg7QUFIOEMsT0FBbEQ7QUFEZSxLQUEzQjs7QUFRQSxTQUFLLHVCQUFMO0FBQ0QsRzs7aUJBRUQsdUIsc0NBQTJCO0FBQ3pCO0FBQ0E7QUFDQSxRQUFNLFFBQVEsS0FBSyxRQUFMLEVBQWQ7O0FBRUEsUUFBTSxhQUFhLE1BQU0sTUFBTixDQUFhLFVBQUMsSUFBRCxFQUFVO0FBQ3hDLGFBQU8sS0FBSyxRQUFMLENBQWMsYUFBckI7QUFDRCxLQUZrQixDQUFuQjs7QUFJQSxRQUFJLFdBQVcsTUFBWCxLQUFzQixDQUExQixFQUE2QjtBQUMzQixXQUFLLElBQUwsQ0FBVSxVQUFWLEVBQXNCLENBQXRCO0FBQ0EsV0FBSyxRQUFMLENBQWMsRUFBRSxlQUFlLENBQWpCLEVBQWQ7QUFDQTtBQUNEOztBQUVELFFBQU0sYUFBYSxXQUFXLE1BQVgsQ0FBa0IsVUFBQyxJQUFEO0FBQUEsYUFBVSxLQUFLLFFBQUwsQ0FBYyxVQUFkLElBQTRCLElBQXRDO0FBQUEsS0FBbEIsQ0FBbkI7QUFDQSxRQUFNLGVBQWUsV0FBVyxNQUFYLENBQWtCLFVBQUMsSUFBRDtBQUFBLGFBQVUsS0FBSyxRQUFMLENBQWMsVUFBZCxJQUE0QixJQUF0QztBQUFBLEtBQWxCLENBQXJCOztBQUVBLFFBQUksV0FBVyxNQUFYLEtBQXNCLENBQTFCLEVBQTZCO0FBQzNCLFVBQU0sY0FBYyxXQUFXLE1BQS9CO0FBQ0EsVUFBTSxrQkFBa0IsYUFBYSxNQUFiLENBQW9CLFVBQUMsR0FBRCxFQUFNLElBQU4sRUFBZTtBQUN6RCxlQUFPLE1BQU0sS0FBSyxRQUFMLENBQWMsVUFBM0I7QUFDRCxPQUZ1QixFQUVyQixDQUZxQixDQUF4QjtBQUdBLFVBQU0saUJBQWdCLEtBQUssS0FBTCxDQUFXLGtCQUFrQixXQUFsQixHQUFnQyxHQUEzQyxDQUF0QjtBQUNBLFdBQUssUUFBTCxDQUFjLEVBQUUsNkJBQUYsRUFBZDtBQUNBO0FBQ0Q7O0FBRUQsUUFBSSxZQUFZLFdBQVcsTUFBWCxDQUFrQixVQUFDLEdBQUQsRUFBTSxJQUFOLEVBQWU7QUFDL0MsYUFBTyxNQUFNLEtBQUssUUFBTCxDQUFjLFVBQTNCO0FBQ0QsS0FGZSxFQUViLENBRmEsQ0FBaEI7QUFHQSxRQUFNLGNBQWMsWUFBWSxXQUFXLE1BQTNDO0FBQ0EsaUJBQWEsY0FBYyxhQUFhLE1BQXhDOztBQUVBLFFBQUksZUFBZSxDQUFuQjtBQUNBLGVBQVcsT0FBWCxDQUFtQixVQUFDLElBQUQsRUFBVTtBQUMzQixzQkFBZ0IsS0FBSyxRQUFMLENBQWMsYUFBOUI7QUFDRCxLQUZEO0FBR0EsaUJBQWEsT0FBYixDQUFxQixVQUFDLElBQUQsRUFBVTtBQUM3QixzQkFBZ0IsZUFBZSxLQUFLLFFBQUwsQ0FBYyxVQUFkLElBQTRCLENBQTNDLENBQWhCO0FBQ0QsS0FGRDs7QUFJQSxRQUFNLGdCQUFnQixjQUFjLENBQWQsR0FDbEIsQ0FEa0IsR0FFbEIsS0FBSyxLQUFMLENBQVcsZUFBZSxTQUFmLEdBQTJCLEdBQXRDLENBRko7O0FBSUEsU0FBSyxRQUFMLENBQWMsRUFBRSw0QkFBRixFQUFkO0FBQ0EsU0FBSyxJQUFMLENBQVUsVUFBVixFQUFzQixhQUF0QjtBQUNELEc7O0FBRUQ7Ozs7OztpQkFJQSxhLDRCQUFpQjtBQUFBOztBQUNmLFNBQUssRUFBTCxDQUFRLE9BQVIsRUFBaUIsVUFBQyxLQUFELEVBQVc7QUFDMUIsYUFBSyxRQUFMLENBQWMsRUFBRSxPQUFPLE1BQU0sT0FBZixFQUFkO0FBQ0QsS0FGRDs7QUFJQSxTQUFLLEVBQUwsQ0FBUSxjQUFSLEVBQXdCLFVBQUMsSUFBRCxFQUFPLEtBQVAsRUFBYyxRQUFkLEVBQTJCO0FBQ2pELGFBQUssWUFBTCxDQUFrQixLQUFLLEVBQXZCLEVBQTJCO0FBQ3pCLGVBQU8sTUFBTSxPQURZO0FBRXpCO0FBRnlCLE9BQTNCOztBQUtBLGFBQUssUUFBTCxDQUFjLEVBQUUsT0FBTyxNQUFNLE9BQWYsRUFBZDs7QUFFQSxVQUFJLFVBQVUsT0FBSyxJQUFMLENBQVUsZ0JBQVYsRUFBNEIsRUFBRSxNQUFNLEtBQUssSUFBYixFQUE1QixDQUFkO0FBQ0EsVUFBSSxRQUFPLEtBQVAseUNBQU8sS0FBUCxPQUFpQixRQUFqQixJQUE2QixNQUFNLE9BQXZDLEVBQWdEO0FBQzlDLGtCQUFVLEVBQUUsU0FBUyxPQUFYLEVBQW9CLFNBQVMsTUFBTSxPQUFuQyxFQUFWO0FBQ0Q7QUFDRCxhQUFLLElBQUwsQ0FBVSxPQUFWLEVBQW1CLE9BQW5CLEVBQTRCLElBQTVCO0FBQ0QsS0FiRDs7QUFlQSxTQUFLLEVBQUwsQ0FBUSxRQUFSLEVBQWtCLFlBQU07QUFDdEIsYUFBSyxRQUFMLENBQWMsRUFBRSxPQUFPLElBQVQsRUFBZDtBQUNELEtBRkQ7O0FBSUEsU0FBSyxFQUFMLENBQVEsZ0JBQVIsRUFBMEIsVUFBQyxJQUFELEVBQU8sTUFBUCxFQUFrQjtBQUMxQyxVQUFJLENBQUMsT0FBSyxPQUFMLENBQWEsS0FBSyxFQUFsQixDQUFMLEVBQTRCO0FBQzFCLGVBQUssR0FBTCw2REFBbUUsS0FBSyxFQUF4RTtBQUNBO0FBQ0Q7QUFDRCxhQUFLLFlBQUwsQ0FBa0IsS0FBSyxFQUF2QixFQUEyQjtBQUN6QixrQkFBVTtBQUNSLHlCQUFlLEtBQUssR0FBTCxFQURQO0FBRVIsMEJBQWdCLEtBRlI7QUFHUixzQkFBWSxDQUhKO0FBSVIseUJBQWUsQ0FKUDtBQUtSLHNCQUFZLEtBQUs7QUFMVDtBQURlLE9BQTNCO0FBU0QsS0FkRDs7QUFnQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFLLEVBQUwsQ0FBUSxpQkFBUixFQUEyQixLQUFLLGtCQUFoQzs7QUFFQSxTQUFLLEVBQUwsQ0FBUSxnQkFBUixFQUEwQixVQUFDLElBQUQsRUFBTyxVQUFQLEVBQXNCO0FBQzlDLFVBQU0sa0JBQWtCLE9BQUssT0FBTCxDQUFhLEtBQUssRUFBbEIsRUFBc0IsUUFBOUM7QUFDQSxhQUFLLFlBQUwsQ0FBa0IsS0FBSyxFQUF2QixFQUEyQjtBQUN6QixrQkFBVSxTQUFjLEVBQWQsRUFBa0IsZUFBbEIsRUFBbUM7QUFDM0MsMEJBQWdCLElBRDJCO0FBRTNDLHNCQUFZLEdBRitCO0FBRzNDLHlCQUFlLGdCQUFnQjtBQUhZLFNBQW5DLENBRGU7QUFNekIsa0JBQVUsVUFOZTtBQU96QixtQkFBVyxXQUFXLFNBUEc7QUFRekIsa0JBQVU7QUFSZSxPQUEzQjs7QUFXQSxhQUFLLHVCQUFMO0FBQ0QsS0FkRDs7QUFnQkEsU0FBSyxFQUFMLENBQVEscUJBQVIsRUFBK0IsVUFBQyxJQUFELEVBQU8sUUFBUCxFQUFvQjtBQUNqRCxVQUFJLENBQUMsT0FBSyxPQUFMLENBQWEsS0FBSyxFQUFsQixDQUFMLEVBQTRCO0FBQzFCLGVBQUssR0FBTCw2REFBbUUsS0FBSyxFQUF4RTtBQUNBO0FBQ0Q7QUFDRCxhQUFLLFlBQUwsQ0FBa0IsS0FBSyxFQUF2QixFQUEyQjtBQUN6QixrQkFBVSxTQUFjLEVBQWQsRUFBa0IsT0FBSyxPQUFMLENBQWEsS0FBSyxFQUFsQixFQUFzQixRQUF4QyxFQUFrRDtBQUMxRCxzQkFBWTtBQUQ4QyxTQUFsRDtBQURlLE9BQTNCO0FBS0QsS0FWRDs7QUFZQSxTQUFLLEVBQUwsQ0FBUSxxQkFBUixFQUErQixVQUFDLElBQUQsRUFBVTtBQUN2QyxVQUFJLENBQUMsT0FBSyxPQUFMLENBQWEsS0FBSyxFQUFsQixDQUFMLEVBQTRCO0FBQzFCLGVBQUssR0FBTCw2REFBbUUsS0FBSyxFQUF4RTtBQUNBO0FBQ0Q7QUFDRCxVQUFNLFFBQVEsU0FBYyxFQUFkLEVBQWtCLE9BQUssUUFBTCxHQUFnQixLQUFsQyxDQUFkO0FBQ0EsWUFBTSxLQUFLLEVBQVgsSUFBaUIsU0FBYyxFQUFkLEVBQWtCLE1BQU0sS0FBSyxFQUFYLENBQWxCLEVBQWtDO0FBQ2pELGtCQUFVLFNBQWMsRUFBZCxFQUFrQixNQUFNLEtBQUssRUFBWCxFQUFlLFFBQWpDO0FBRHVDLE9BQWxDLENBQWpCO0FBR0EsYUFBTyxNQUFNLEtBQUssRUFBWCxFQUFlLFFBQWYsQ0FBd0IsVUFBL0I7O0FBRUEsYUFBSyxRQUFMLENBQWMsRUFBRSxPQUFPLEtBQVQsRUFBZDtBQUNELEtBWkQ7O0FBY0EsU0FBSyxFQUFMLENBQVEsc0JBQVIsRUFBZ0MsVUFBQyxJQUFELEVBQU8sUUFBUCxFQUFvQjtBQUNsRCxVQUFJLENBQUMsT0FBSyxPQUFMLENBQWEsS0FBSyxFQUFsQixDQUFMLEVBQTRCO0FBQzFCLGVBQUssR0FBTCw2REFBbUUsS0FBSyxFQUF4RTtBQUNBO0FBQ0Q7QUFDRCxhQUFLLFlBQUwsQ0FBa0IsS0FBSyxFQUF2QixFQUEyQjtBQUN6QixrQkFBVSxTQUFjLEVBQWQsRUFBa0IsT0FBSyxRQUFMLEdBQWdCLEtBQWhCLENBQXNCLEtBQUssRUFBM0IsRUFBK0IsUUFBakQsRUFBMkQ7QUFDbkUsdUJBQWE7QUFEc0QsU0FBM0Q7QUFEZSxPQUEzQjtBQUtELEtBVkQ7O0FBWUEsU0FBSyxFQUFMLENBQVEsc0JBQVIsRUFBZ0MsVUFBQyxJQUFELEVBQVU7QUFDeEMsVUFBSSxDQUFDLE9BQUssT0FBTCxDQUFhLEtBQUssRUFBbEIsQ0FBTCxFQUE0QjtBQUMxQixlQUFLLEdBQUwsNkRBQW1FLEtBQUssRUFBeEU7QUFDQTtBQUNEO0FBQ0QsVUFBTSxRQUFRLFNBQWMsRUFBZCxFQUFrQixPQUFLLFFBQUwsR0FBZ0IsS0FBbEMsQ0FBZDtBQUNBLFlBQU0sS0FBSyxFQUFYLElBQWlCLFNBQWMsRUFBZCxFQUFrQixNQUFNLEtBQUssRUFBWCxDQUFsQixFQUFrQztBQUNqRCxrQkFBVSxTQUFjLEVBQWQsRUFBa0IsTUFBTSxLQUFLLEVBQVgsRUFBZSxRQUFqQztBQUR1QyxPQUFsQyxDQUFqQjtBQUdBLGFBQU8sTUFBTSxLQUFLLEVBQVgsRUFBZSxRQUFmLENBQXdCLFdBQS9CO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGFBQUssUUFBTCxDQUFjLEVBQUUsT0FBTyxLQUFULEVBQWQ7QUFDRCxLQWZEOztBQWlCQSxTQUFLLEVBQUwsQ0FBUSxVQUFSLEVBQW9CLFlBQU07QUFDeEI7QUFDQSxhQUFLLHVCQUFMO0FBQ0QsS0FIRDs7QUFLQTtBQUNBLFFBQUksT0FBTyxNQUFQLEtBQWtCLFdBQWxCLElBQWlDLE9BQU8sZ0JBQTVDLEVBQThEO0FBQzVELGFBQU8sZ0JBQVAsQ0FBd0IsUUFBeEIsRUFBa0M7QUFBQSxlQUFNLE9BQUssa0JBQUwsRUFBTjtBQUFBLE9BQWxDO0FBQ0EsYUFBTyxnQkFBUCxDQUF3QixTQUF4QixFQUFtQztBQUFBLGVBQU0sT0FBSyxrQkFBTCxFQUFOO0FBQUEsT0FBbkM7QUFDQSxpQkFBVztBQUFBLGVBQU0sT0FBSyxrQkFBTCxFQUFOO0FBQUEsT0FBWCxFQUE0QyxJQUE1QztBQUNEO0FBQ0YsRzs7aUJBRUQsa0IsaUNBQXNCO0FBQ3BCLFFBQU0sU0FDSixPQUFPLE9BQU8sU0FBUCxDQUFpQixNQUF4QixLQUFtQyxXQUFuQyxHQUNJLE9BQU8sU0FBUCxDQUFpQixNQURyQixHQUVJLElBSE47QUFJQSxRQUFJLENBQUMsTUFBTCxFQUFhO0FBQ1gsV0FBSyxJQUFMLENBQVUsWUFBVjtBQUNBLFdBQUssSUFBTCxDQUFVLEtBQUssSUFBTCxDQUFVLHNCQUFWLENBQVYsRUFBNkMsT0FBN0MsRUFBc0QsQ0FBdEQ7QUFDQSxXQUFLLFVBQUwsR0FBa0IsSUFBbEI7QUFDRCxLQUpELE1BSU87QUFDTCxXQUFLLElBQUwsQ0FBVSxXQUFWO0FBQ0EsVUFBSSxLQUFLLFVBQVQsRUFBcUI7QUFDbkIsYUFBSyxJQUFMLENBQVUsYUFBVjtBQUNBLGFBQUssSUFBTCxDQUFVLEtBQUssSUFBTCxDQUFVLHFCQUFWLENBQVYsRUFBNEMsU0FBNUMsRUFBdUQsSUFBdkQ7QUFDQSxhQUFLLFVBQUwsR0FBa0IsS0FBbEI7QUFDRDtBQUNGO0FBQ0YsRzs7aUJBRUQsSyxvQkFBUztBQUNQLFdBQU8sS0FBSyxJQUFMLENBQVUsRUFBakI7QUFDRCxHOztBQUVEOzs7Ozs7Ozs7aUJBT0EsRyxnQkFBSyxNLEVBQVEsSSxFQUFNO0FBQ2pCLFFBQUksT0FBTyxNQUFQLEtBQWtCLFVBQXRCLEVBQWtDO0FBQ2hDLFVBQUksTUFBTSx1Q0FBb0MsV0FBVyxJQUFYLEdBQWtCLE1BQWxCLFVBQWtDLE1BQWxDLHlDQUFrQyxNQUFsQyxDQUFwQyxVQUNSLG9FQURGO0FBRUEsWUFBTSxJQUFJLFNBQUosQ0FBYyxHQUFkLENBQU47QUFDRDs7QUFFRDtBQUNBLFFBQU0sU0FBUyxJQUFJLE1BQUosQ0FBVyxJQUFYLEVBQWlCLElBQWpCLENBQWY7QUFDQSxRQUFNLFdBQVcsT0FBTyxFQUF4QjtBQUNBLFNBQUssT0FBTCxDQUFhLE9BQU8sSUFBcEIsSUFBNEIsS0FBSyxPQUFMLENBQWEsT0FBTyxJQUFwQixLQUE2QixFQUF6RDs7QUFFQSxRQUFJLENBQUMsUUFBTCxFQUFlO0FBQ2IsWUFBTSxJQUFJLEtBQUosQ0FBVSw2QkFBVixDQUFOO0FBQ0Q7O0FBRUQsUUFBSSxDQUFDLE9BQU8sSUFBWixFQUFrQjtBQUNoQixZQUFNLElBQUksS0FBSixDQUFVLDhCQUFWLENBQU47QUFDRDs7QUFFRCxRQUFJLHNCQUFzQixLQUFLLFNBQUwsQ0FBZSxRQUFmLENBQTFCO0FBQ0EsUUFBSSxtQkFBSixFQUF5QjtBQUN2QixVQUFJLE9BQU0sb0NBQWlDLG9CQUFvQixFQUFyRCxrQ0FDVSxRQURWLG1HQUFWO0FBR0EsWUFBTSxJQUFJLEtBQUosQ0FBVSxJQUFWLENBQU47QUFDRDs7QUFFRCxTQUFLLE9BQUwsQ0FBYSxPQUFPLElBQXBCLEVBQTBCLElBQTFCLENBQStCLE1BQS9CO0FBQ0EsV0FBTyxPQUFQOztBQUVBLFdBQU8sSUFBUDtBQUNELEc7O0FBRUQ7Ozs7Ozs7O2lCQU1BLFMsc0JBQVcsRSxFQUFJO0FBQ2IsUUFBSSxjQUFjLElBQWxCO0FBQ0EsU0FBSyxjQUFMLENBQW9CLFVBQUMsTUFBRCxFQUFZO0FBQzlCLFVBQUksT0FBTyxFQUFQLEtBQWMsRUFBbEIsRUFBc0I7QUFDcEIsc0JBQWMsTUFBZDtBQUNBLGVBQU8sS0FBUDtBQUNEO0FBQ0YsS0FMRDtBQU1BLFdBQU8sV0FBUDtBQUNELEc7O0FBRUQ7Ozs7Ozs7aUJBS0EsYywyQkFBZ0IsTSxFQUFRO0FBQUE7O0FBQ3RCLFdBQU8sSUFBUCxDQUFZLEtBQUssT0FBakIsRUFBMEIsT0FBMUIsQ0FBa0Msc0JBQWM7QUFDOUMsYUFBSyxPQUFMLENBQWEsVUFBYixFQUF5QixPQUF6QixDQUFpQyxNQUFqQztBQUNELEtBRkQ7QUFHRCxHOztBQUVEOzs7Ozs7O2lCQUtBLFkseUJBQWMsUSxFQUFVO0FBQ3RCLFNBQUssR0FBTCxzQkFBNEIsU0FBUyxFQUFyQztBQUNBLFNBQUssSUFBTCxDQUFVLGVBQVYsRUFBMkIsUUFBM0I7O0FBRUEsUUFBSSxTQUFTLFNBQWIsRUFBd0I7QUFDdEIsZUFBUyxTQUFUO0FBQ0Q7O0FBRUQsUUFBTSxPQUFPLEtBQUssT0FBTCxDQUFhLFNBQVMsSUFBdEIsRUFBNEIsS0FBNUIsRUFBYjtBQUNBLFFBQU0sUUFBUSxLQUFLLE9BQUwsQ0FBYSxRQUFiLENBQWQ7QUFDQSxRQUFJLFVBQVUsQ0FBQyxDQUFmLEVBQWtCO0FBQ2hCLFdBQUssTUFBTCxDQUFZLEtBQVosRUFBbUIsQ0FBbkI7QUFDQSxXQUFLLE9BQUwsQ0FBYSxTQUFTLElBQXRCLElBQThCLElBQTlCO0FBQ0Q7O0FBRUQsUUFBTSxlQUFlLEtBQUssUUFBTCxFQUFyQjtBQUNBLFdBQU8sYUFBYSxPQUFiLENBQXFCLFNBQVMsRUFBOUIsQ0FBUDtBQUNBLFNBQUssUUFBTCxDQUFjLFlBQWQ7QUFDRCxHOztBQUVEOzs7OztpQkFHQSxLLG9CQUFTO0FBQUE7O0FBQ1AsU0FBSyxHQUFMLDRCQUFrQyxLQUFLLElBQUwsQ0FBVSxFQUE1Qzs7QUFFQSxTQUFLLEtBQUw7O0FBRUEsU0FBSyxpQkFBTDs7QUFFQSxTQUFLLGNBQUwsQ0FBb0IsVUFBQyxNQUFELEVBQVk7QUFDOUIsYUFBSyxZQUFMLENBQWtCLE1BQWxCO0FBQ0QsS0FGRDtBQUdELEc7O0FBRUQ7Ozs7Ozs7OztpQkFTQSxJLGlCQUFNLE8sRUFBeUM7QUFBQSxRQUFoQyxJQUFnQyx1RUFBekIsTUFBeUI7QUFBQSxRQUFqQixRQUFpQix1RUFBTixJQUFNOztBQUM3QyxRQUFNLG1CQUFtQixRQUFPLE9BQVAseUNBQU8sT0FBUCxPQUFtQixRQUE1Qzs7QUFFQSxTQUFLLFFBQUwsQ0FBYztBQUNaLFlBQU07QUFDSixrQkFBVSxLQUROO0FBRUosY0FBTSxJQUZGO0FBR0osaUJBQVMsbUJBQW1CLFFBQVEsT0FBM0IsR0FBcUMsT0FIMUM7QUFJSixpQkFBUyxtQkFBbUIsUUFBUSxPQUEzQixHQUFxQztBQUoxQztBQURNLEtBQWQ7O0FBU0EsU0FBSyxJQUFMLENBQVUsY0FBVjs7QUFFQSxpQkFBYSxLQUFLLGFBQWxCO0FBQ0EsUUFBSSxhQUFhLENBQWpCLEVBQW9CO0FBQ2xCLFdBQUssYUFBTCxHQUFxQixTQUFyQjtBQUNBO0FBQ0Q7O0FBRUQ7QUFDQSxTQUFLLGFBQUwsR0FBcUIsV0FBVyxLQUFLLFFBQWhCLEVBQTBCLFFBQTFCLENBQXJCO0FBQ0QsRzs7aUJBRUQsUSx1QkFBWTtBQUNWLFFBQU0sVUFBVSxTQUFjLEVBQWQsRUFBa0IsS0FBSyxRQUFMLEdBQWdCLElBQWxDLEVBQXdDO0FBQ3RELGdCQUFVO0FBRDRDLEtBQXhDLENBQWhCO0FBR0EsU0FBSyxRQUFMLENBQWM7QUFDWixZQUFNO0FBRE0sS0FBZDtBQUdBLFNBQUssSUFBTCxDQUFVLGFBQVY7QUFDRCxHOztBQUVEOzs7Ozs7OztpQkFNQSxHLGdCQUFLLEcsRUFBSyxJLEVBQU07QUFDZCxRQUFJLENBQUMsS0FBSyxJQUFMLENBQVUsS0FBZixFQUFzQjtBQUNwQjtBQUNEOztBQUVELFFBQUksdUJBQXFCLGNBQXJCLFVBQXdDLEdBQTVDOztBQUVBLFdBQU8sU0FBUCxJQUFvQixPQUFPLFNBQVAsSUFBb0IsSUFBcEIsR0FBMkIsYUFBM0IsR0FBMkMsR0FBL0Q7O0FBRUEsUUFBSSxTQUFTLE9BQWIsRUFBc0I7QUFDcEIsY0FBUSxLQUFSLENBQWMsT0FBZDtBQUNBO0FBQ0Q7O0FBRUQsUUFBSSxTQUFTLFNBQWIsRUFBd0I7QUFDdEIsY0FBUSxJQUFSLENBQWEsT0FBYjtBQUNBO0FBQ0Q7O0FBRUQsUUFBSSxhQUFXLEdBQWYsRUFBc0I7QUFDcEIsY0FBUSxHQUFSLENBQVksT0FBWjtBQUNELEtBRkQsTUFFTztBQUNMLDZCQUFxQixjQUFyQjtBQUNBLGNBQVEsR0FBUixDQUFZLE9BQVo7QUFDQSxjQUFRLEdBQVIsQ0FBWSxHQUFaO0FBQ0Q7QUFDRixHOztBQUVEOzs7OztpQkFHQSxHLGtCQUFPO0FBQ0wsU0FBSyxHQUFMLENBQVMsdUNBQVQsRUFBa0QsU0FBbEQ7QUFDQSxXQUFPLElBQVA7QUFDRCxHOztBQUVEOzs7OztpQkFHQSxPLG9CQUFTLFEsRUFBVTtBQUNqQixTQUFLLEdBQUwsMENBQWdELFFBQWhEOztBQUVBLFFBQUksQ0FBQyxLQUFLLFFBQUwsR0FBZ0IsY0FBaEIsQ0FBK0IsUUFBL0IsQ0FBTCxFQUErQztBQUM3QyxXQUFLLGFBQUwsQ0FBbUIsUUFBbkI7QUFDQSxhQUFPLFFBQVEsTUFBUixDQUFlLElBQUksS0FBSixDQUFVLG9CQUFWLENBQWYsQ0FBUDtBQUNEOztBQUVELFdBQU8sS0FBSyxVQUFMLENBQWdCLFFBQWhCLENBQVA7QUFDRCxHOztBQUVEOzs7Ozs7OztpQkFNQSxhLDBCQUFlLE8sRUFBUztBQUFBOztBQUFBLHFCQUNxQixLQUFLLFFBQUwsRUFEckI7QUFBQSxRQUNkLGNBRGMsY0FDZCxjQURjO0FBQUEsUUFDRSxjQURGLGNBQ0UsY0FERjs7QUFFdEIsUUFBSSxDQUFDLGNBQUwsRUFBcUI7QUFDbkIsWUFBTSxJQUFJLEtBQUosQ0FBVSxnREFBVixDQUFOO0FBQ0Q7O0FBRUQsUUFBTSxXQUFXLE1BQWpCOztBQUVBLFNBQUssSUFBTCxDQUFVLFFBQVYsRUFBb0I7QUFDbEIsVUFBSSxRQURjO0FBRWxCLGVBQVM7QUFGUyxLQUFwQjs7QUFLQSxTQUFLLFFBQUwsQ0FBYztBQUNaLHNCQUFnQixLQUFLLElBQUwsQ0FBVSxvQkFBVixLQUFtQyxLQUR2Qzs7QUFHWixtQ0FDSyxjQURMLDZCQUVHLFFBRkgsSUFFYztBQUNWLGlCQUFTLE9BREM7QUFFVixjQUFNLENBRkk7QUFHVixnQkFBUTtBQUhFLE9BRmQ7QUFIWSxLQUFkOztBQWFBLFdBQU8sUUFBUDtBQUNELEc7O2lCQUVELFUsdUJBQVksUSxFQUFVO0FBQUEscUJBQ08sS0FBSyxRQUFMLEVBRFA7QUFBQSxRQUNaLGNBRFksY0FDWixjQURZOztBQUdwQixXQUFPLGVBQWUsUUFBZixDQUFQO0FBQ0QsRzs7QUFFRDs7Ozs7Ozs7aUJBTUEsYSwwQkFBZSxRLEVBQVUsSSxFQUFNO0FBQUE7O0FBQzdCLFFBQUksQ0FBQyxLQUFLLFVBQUwsQ0FBZ0IsUUFBaEIsQ0FBTCxFQUFnQztBQUM5QixXQUFLLEdBQUwsOERBQW9FLFFBQXBFO0FBQ0E7QUFDRDtBQUNELFFBQU0saUJBQWlCLEtBQUssUUFBTCxHQUFnQixjQUF2QztBQUNBLFFBQU0sZ0JBQWdCLFNBQWMsRUFBZCxFQUFrQixlQUFlLFFBQWYsQ0FBbEIsRUFBNEM7QUFDaEUsY0FBUSxTQUFjLEVBQWQsRUFBa0IsZUFBZSxRQUFmLEVBQXlCLE1BQTNDLEVBQW1ELElBQW5EO0FBRHdELEtBQTVDLENBQXRCO0FBR0EsU0FBSyxRQUFMLENBQWM7QUFDWixzQkFBZ0IsU0FBYyxFQUFkLEVBQWtCLGNBQWxCLDZCQUNiLFFBRGEsSUFDRixhQURFO0FBREosS0FBZDtBQUtELEc7O0FBRUQ7Ozs7Ozs7aUJBS0EsYSwwQkFBZSxRLEVBQVU7QUFDdkIsUUFBTSxpQkFBaUIsU0FBYyxFQUFkLEVBQWtCLEtBQUssUUFBTCxHQUFnQixjQUFsQyxDQUF2QjtBQUNBLFdBQU8sZUFBZSxRQUFmLENBQVA7O0FBRUEsU0FBSyxRQUFMLENBQWM7QUFDWixzQkFBZ0I7QUFESixLQUFkO0FBR0QsRzs7QUFFRDs7Ozs7OztpQkFLQSxVLHVCQUFZLFEsRUFBVTtBQUFBOztBQUNwQixRQUFNLGFBQWEsS0FBSyxRQUFMLEdBQWdCLGNBQWhCLENBQStCLFFBQS9CLENBQW5CO0FBQ0EsUUFBTSxjQUFjLFdBQVcsSUFBL0I7O0FBRUEsUUFBTSxrQkFDRCxLQUFLLGFBREosRUFFRCxLQUFLLFNBRkosRUFHRCxLQUFLLGNBSEosQ0FBTjtBQUtBLFFBQUksV0FBVyxRQUFRLE9BQVIsRUFBZjtBQUNBLFVBQU0sT0FBTixDQUFjLFVBQUMsRUFBRCxFQUFLLElBQUwsRUFBYztBQUMxQjtBQUNBLFVBQUksT0FBTyxXQUFYLEVBQXdCO0FBQ3RCO0FBQ0Q7O0FBRUQsaUJBQVcsU0FBUyxJQUFULENBQWMsWUFBTTtBQUFBOztBQUFBLHlCQUNGLE9BQUssUUFBTCxFQURFO0FBQUEsWUFDckIsY0FEcUIsY0FDckIsY0FEcUI7O0FBRTdCLFlBQU0sZ0JBQWdCLFNBQWMsRUFBZCxFQUFrQixlQUFlLFFBQWYsQ0FBbEIsRUFBNEM7QUFDaEUsZ0JBQU07QUFEMEQsU0FBNUMsQ0FBdEI7QUFHQSxlQUFLLFFBQUwsQ0FBYztBQUNaLDBCQUFnQixTQUFjLEVBQWQsRUFBa0IsY0FBbEIsNkJBQ2IsUUFEYSxJQUNGLGFBREU7QUFESixTQUFkOztBQU1BO0FBQ0E7QUFDQSxlQUFPLEdBQUcsY0FBYyxPQUFqQixFQUEwQixRQUExQixDQUFQO0FBQ0QsT0FkVSxFQWNSLElBZFEsQ0FjSCxVQUFDLE1BQUQsRUFBWTtBQUNsQixlQUFPLElBQVA7QUFDRCxPQWhCVSxDQUFYO0FBaUJELEtBdkJEOztBQXlCQTtBQUNBO0FBQ0EsYUFBUyxLQUFULENBQWUsVUFBQyxHQUFELEVBQVM7QUFDdEIsYUFBSyxJQUFMLENBQVUsT0FBVixFQUFtQixHQUFuQixFQUF3QixRQUF4QjtBQUNBLGFBQUssYUFBTCxDQUFtQixRQUFuQjtBQUNELEtBSEQ7O0FBS0EsV0FBTyxTQUFTLElBQVQsQ0FBYyxZQUFNO0FBQ3pCO0FBRHlCLHVCQUVFLE9BQUssUUFBTCxFQUZGO0FBQUEsVUFFakIsY0FGaUIsY0FFakIsY0FGaUI7O0FBR3pCLFVBQU0sZ0JBQWdCLGVBQWUsUUFBZixDQUF0QjtBQUNBLFVBQUksQ0FBQyxhQUFMLEVBQW9CO0FBQ2xCLGVBQUssR0FBTCw4REFBb0UsUUFBcEU7QUFDQTtBQUNEOztBQUVELFVBQU0sUUFBUSxjQUFjLE9BQWQsQ0FDWCxHQURXLENBQ1AsVUFBQyxNQUFEO0FBQUEsZUFBWSxPQUFLLE9BQUwsQ0FBYSxNQUFiLENBQVo7QUFBQSxPQURPLENBQWQ7QUFFQSxVQUFNLGFBQWEsTUFBTSxNQUFOLENBQWEsVUFBQyxJQUFEO0FBQUEsZUFBVSxDQUFDLEtBQUssS0FBaEI7QUFBQSxPQUFiLENBQW5CO0FBQ0EsVUFBTSxTQUFTLE1BQU0sTUFBTixDQUFhLFVBQUMsSUFBRDtBQUFBLGVBQVUsS0FBSyxLQUFmO0FBQUEsT0FBYixDQUFmO0FBQ0EsYUFBSyxhQUFMLENBQW1CLFFBQW5CLEVBQTZCLEVBQUUsc0JBQUYsRUFBYyxjQUFkLEVBQXNCLGtCQUF0QixFQUE3QjtBQUNELEtBZE0sRUFjSixJQWRJLENBY0MsWUFBTTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBSlksdUJBS2UsT0FBSyxRQUFMLEVBTGY7QUFBQSxVQUtKLGNBTEksY0FLSixjQUxJOztBQU1aLFVBQUksQ0FBQyxlQUFlLFFBQWYsQ0FBTCxFQUErQjtBQUM3QixlQUFLLEdBQUwsK0RBQXFFLFFBQXJFO0FBQ0E7QUFDRDtBQUNELFVBQU0sZ0JBQWdCLGVBQWUsUUFBZixDQUF0QjtBQUNBLFVBQU0sU0FBUyxjQUFjLE1BQTdCO0FBQ0EsYUFBSyxJQUFMLENBQVUsVUFBVixFQUFzQixNQUF0Qjs7QUFFQSxhQUFLLGFBQUwsQ0FBbUIsUUFBbkI7O0FBRUEsYUFBTyxNQUFQO0FBQ0QsS0EvQk0sQ0FBUDtBQWdDRCxHOztBQUVEOzs7Ozs7O2lCQUtBLE0scUJBQVU7QUFBQTs7QUFDUixRQUFJLENBQUMsS0FBSyxPQUFMLENBQWEsUUFBbEIsRUFBNEI7QUFDMUIsV0FBSyxHQUFMLENBQVMsbUNBQVQsRUFBOEMsU0FBOUM7QUFDRDs7QUFFRCxRQUFJLFFBQVEsS0FBSyxRQUFMLEdBQWdCLEtBQTVCO0FBQ0EsUUFBTSx1QkFBdUIsS0FBSyxJQUFMLENBQVUsY0FBVixDQUF5QixLQUF6QixDQUE3Qjs7QUFFQSxRQUFJLHlCQUF5QixLQUE3QixFQUFvQztBQUNsQyxhQUFPLFFBQVEsTUFBUixDQUFlLElBQUksS0FBSixDQUFVLCtEQUFWLENBQWYsQ0FBUDtBQUNEOztBQUVELFFBQUksd0JBQXdCLFFBQU8sb0JBQVAseUNBQU8sb0JBQVAsT0FBZ0MsUUFBNUQsRUFBc0U7QUFDcEU7QUFDQSxVQUFJLHFCQUFxQixJQUF6QixFQUErQjtBQUM3QixjQUFNLElBQUksU0FBSixDQUFjLCtGQUFkLENBQU47QUFDRDs7QUFFRCxjQUFRLG9CQUFSO0FBQ0Q7O0FBRUQsV0FBTyxRQUFRLE9BQVIsR0FDSixJQURJLENBQ0M7QUFBQSxhQUFNLE9BQUssc0JBQUwsQ0FBNEIsS0FBNUIsQ0FBTjtBQUFBLEtBREQsRUFFSixJQUZJLENBRUMsWUFBTTtBQUFBLHVCQUNpQixPQUFLLFFBQUwsRUFEakI7QUFBQSxVQUNGLGNBREUsY0FDRixjQURFO0FBRVY7OztBQUNBLFVBQU0sMEJBQTBCLE9BQU8sSUFBUCxDQUFZLGNBQVosRUFBNEIsTUFBNUIsQ0FBbUMsVUFBQyxJQUFELEVBQU8sSUFBUDtBQUFBLGVBQWdCLEtBQUssTUFBTCxDQUFZLGVBQWUsSUFBZixFQUFxQixPQUFqQyxDQUFoQjtBQUFBLE9BQW5DLEVBQThGLEVBQTlGLENBQWhDOztBQUVBLFVBQU0saUJBQWlCLEVBQXZCO0FBQ0EsYUFBTyxJQUFQLENBQVksS0FBWixFQUFtQixPQUFuQixDQUEyQixVQUFDLE1BQUQsRUFBWTtBQUNyQyxZQUFNLE9BQU8sT0FBSyxPQUFMLENBQWEsTUFBYixDQUFiO0FBQ0E7QUFDQSxZQUFLLENBQUMsS0FBSyxRQUFMLENBQWMsYUFBaEIsSUFBbUMsd0JBQXdCLE9BQXhCLENBQWdDLE1BQWhDLE1BQTRDLENBQUMsQ0FBcEYsRUFBd0Y7QUFDdEYseUJBQWUsSUFBZixDQUFvQixLQUFLLEVBQXpCO0FBQ0Q7QUFDRixPQU5EOztBQVFBLFVBQU0sV0FBVyxPQUFLLGFBQUwsQ0FBbUIsY0FBbkIsQ0FBakI7QUFDQSxhQUFPLE9BQUssVUFBTCxDQUFnQixRQUFoQixDQUFQO0FBQ0QsS0FsQkksRUFtQkosS0FuQkksQ0FtQkUsVUFBQyxHQUFELEVBQVM7QUFDZCxVQUFNLFVBQVUsUUFBTyxHQUFQLHlDQUFPLEdBQVAsT0FBZSxRQUFmLEdBQTBCLElBQUksT0FBOUIsR0FBd0MsR0FBeEQ7QUFDQSxVQUFNLFVBQVUsUUFBTyxHQUFQLHlDQUFPLEdBQVAsT0FBZSxRQUFmLEdBQTBCLElBQUksT0FBOUIsR0FBd0MsSUFBeEQ7QUFDQSxhQUFLLEdBQUwsQ0FBWSxPQUFaLFNBQXVCLE9BQXZCO0FBQ0EsYUFBSyxJQUFMLENBQVUsRUFBRSxTQUFTLE9BQVgsRUFBb0IsU0FBUyxPQUE3QixFQUFWLEVBQWtELE9BQWxELEVBQTJELElBQTNEO0FBQ0EsYUFBTyxRQUFRLE1BQVIsQ0FBZSxRQUFPLEdBQVAseUNBQU8sR0FBUCxPQUFlLFFBQWYsR0FBMEIsR0FBMUIsR0FBZ0MsSUFBSSxLQUFKLENBQVUsR0FBVixDQUEvQyxDQUFQO0FBQ0QsS0F6QkksQ0FBUDtBQTBCRCxHOzs7O3dCQXJqQ1k7QUFDWCxhQUFPLEtBQUssUUFBTCxFQUFQO0FBQ0Q7Ozs7OztBQXNqQ0gsT0FBTyxPQUFQLEdBQWlCLFVBQVUsSUFBVixFQUFnQjtBQUMvQixTQUFPLElBQUksSUFBSixDQUFTLElBQVQsQ0FBUDtBQUNELENBRkQ7O0FBSUE7QUFDQSxPQUFPLE9BQVAsQ0FBZSxJQUFmLEdBQXNCLElBQXRCO0FBQ0EsT0FBTyxPQUFQLENBQWUsTUFBZixHQUF3QixNQUF4Qjs7O0FDOXZDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLE9BQVAsR0FBaUIsU0FBUyxzQkFBVCxDQUFpQyxTQUFqQyxFQUE0QztBQUMzRDtBQUNBLE1BQUksYUFBYSxJQUFqQixFQUF1QjtBQUNyQixnQkFBWSxPQUFPLFNBQVAsS0FBcUIsV0FBckIsR0FBbUMsVUFBVSxTQUE3QyxHQUF5RCxJQUFyRTtBQUNEO0FBQ0Q7QUFDQSxNQUFJLENBQUMsU0FBTCxFQUFnQixPQUFPLElBQVA7O0FBRWhCLE1BQU0sSUFBSSxtQkFBbUIsSUFBbkIsQ0FBd0IsU0FBeEIsQ0FBVjtBQUNBLE1BQUksQ0FBQyxDQUFMLEVBQVEsT0FBTyxJQUFQOztBQUVSLE1BQU0sY0FBYyxFQUFFLENBQUYsQ0FBcEI7O0FBWDJELDJCQVl0QyxZQUFZLEtBQVosQ0FBa0IsR0FBbEIsQ0Fac0M7QUFBQSxNQVl0RCxLQVpzRDtBQUFBLE1BWS9DLEtBWitDOztBQWEzRCxVQUFRLFNBQVMsS0FBVCxFQUFnQixFQUFoQixDQUFSO0FBQ0EsVUFBUSxTQUFTLEtBQVQsRUFBZ0IsRUFBaEIsQ0FBUjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxNQUFJLFFBQVEsRUFBUixJQUFlLFVBQVUsRUFBVixJQUFnQixRQUFRLEtBQTNDLEVBQW1EO0FBQ2pELFdBQU8sSUFBUDtBQUNEOztBQUVEO0FBQ0E7QUFDQSxNQUFJLFFBQVEsRUFBUixJQUFlLFVBQVUsRUFBVixJQUFnQixTQUFTLEtBQTVDLEVBQW9EO0FBQ2xELFdBQU8sSUFBUDtBQUNEOztBQUVEO0FBQ0EsU0FBTyxLQUFQO0FBQ0QsQ0EvQkQ7Ozs7Ozs7Ozs7O2VDSG1CLFFBQVEsWUFBUixDO0lBQVgsTSxZQUFBLE07O0FBQ1IsSUFBTSxVQUFVLFFBQVEseUJBQVIsQ0FBaEI7QUFDQSxJQUFNLGFBQWEsUUFBUSw0QkFBUixDQUFuQjs7Z0JBQ2MsUUFBUSxRQUFSLEM7SUFBTixDLGFBQUEsQzs7QUFFUixPQUFPLE9BQVA7QUFBQTs7QUFDRSxxQkFBYSxJQUFiLEVBQW1CLElBQW5CLEVBQXlCO0FBQUE7O0FBQUEsaURBQ3ZCLG1CQUFNLElBQU4sRUFBWSxJQUFaLENBRHVCOztBQUV2QixVQUFLLEVBQUwsR0FBVSxNQUFLLElBQUwsQ0FBVSxFQUFWLElBQWdCLFdBQTFCO0FBQ0EsVUFBSyxLQUFMLEdBQWEsWUFBYjtBQUNBLFVBQUssSUFBTCxHQUFZLFVBQVo7O0FBRUEsUUFBTSxnQkFBZ0I7QUFDcEIsZUFBUztBQUNQLHFCQUFhO0FBRE47O0FBS1g7QUFOc0IsS0FBdEIsQ0FPQSxJQUFNLGlCQUFpQjtBQUNyQixjQUFRLElBRGE7QUFFckIsY0FBUSxJQUZhO0FBR3JCLGlCQUFXLFNBSFU7QUFJckIsY0FBUTs7QUFHVjtBQVB1QixLQUF2QixDQVFBLE1BQUssSUFBTCxHQUFZLFNBQWMsRUFBZCxFQUFrQixjQUFsQixFQUFrQyxJQUFsQyxDQUFaOztBQUVBO0FBQ0EsVUFBSyxVQUFMLEdBQWtCLElBQUksVUFBSixDQUFlLENBQUUsYUFBRixFQUFpQixNQUFLLElBQUwsQ0FBVSxNQUEzQixFQUFtQyxNQUFLLElBQUwsQ0FBVSxNQUE3QyxDQUFmLENBQWxCO0FBQ0EsVUFBSyxJQUFMLEdBQVksTUFBSyxVQUFMLENBQWdCLFNBQWhCLENBQTBCLElBQTFCLENBQStCLE1BQUssVUFBcEMsQ0FBWjtBQUNBLFVBQUssU0FBTCxHQUFpQixNQUFLLFVBQUwsQ0FBZ0IsY0FBaEIsQ0FBK0IsSUFBL0IsQ0FBb0MsTUFBSyxVQUF6QyxDQUFqQjs7QUFFQSxVQUFLLE1BQUwsR0FBYyxNQUFLLE1BQUwsQ0FBWSxJQUFaLE9BQWQ7QUFDQSxVQUFLLGlCQUFMLEdBQXlCLE1BQUssaUJBQUwsQ0FBdUIsSUFBdkIsT0FBekI7QUFDQSxVQUFLLFdBQUwsR0FBbUIsTUFBSyxXQUFMLENBQWlCLElBQWpCLE9BQW5CO0FBOUJ1QjtBQStCeEI7O0FBaENILHNCQWtDRSxpQkFsQ0YsOEJBa0NxQixFQWxDckIsRUFrQ3lCO0FBQUE7O0FBQ3JCLFNBQUssSUFBTCxDQUFVLEdBQVYsQ0FBYyxpREFBZDs7QUFFQSxRQUFNLFFBQVEsUUFBUSxHQUFHLE1BQUgsQ0FBVSxLQUFsQixDQUFkOztBQUVBLFVBQU0sT0FBTixDQUFjLFVBQUMsSUFBRCxFQUFVO0FBQ3RCLFVBQUk7QUFDRixlQUFLLElBQUwsQ0FBVSxPQUFWLENBQWtCO0FBQ2hCLGtCQUFRLE9BQUssRUFERztBQUVoQixnQkFBTSxLQUFLLElBRks7QUFHaEIsZ0JBQU0sS0FBSyxJQUhLO0FBSWhCLGdCQUFNO0FBSlUsU0FBbEI7QUFNRCxPQVBELENBT0UsT0FBTyxHQUFQLEVBQVk7QUFDWjtBQUNEO0FBQ0YsS0FYRDtBQVlELEdBbkRIOztBQUFBLHNCQXFERSxXQXJERix3QkFxRGUsRUFyRGYsRUFxRG1CO0FBQ2YsU0FBSyxLQUFMLENBQVcsS0FBWDtBQUNELEdBdkRIOztBQUFBLHNCQXlERSxNQXpERixtQkF5RFUsS0F6RFYsRUF5RGlCO0FBQUE7O0FBQ2I7QUFDQSxRQUFNLG1CQUFtQjtBQUN2QixhQUFPLE9BRGdCO0FBRXZCLGNBQVEsT0FGZTtBQUd2QixlQUFTLENBSGM7QUFJdkIsZ0JBQVUsUUFKYTtBQUt2QixnQkFBVSxVQUxhO0FBTXZCLGNBQVEsQ0FBQztBQU5jLEtBQXpCOztBQVNBLFFBQU0sZUFBZSxLQUFLLElBQUwsQ0FBVSxJQUFWLENBQWUsWUFBcEM7QUFDQSxRQUFNLFNBQVMsYUFBYSxnQkFBYixHQUFnQyxhQUFhLGdCQUFiLENBQThCLElBQTlCLENBQW1DLEdBQW5DLENBQWhDLEdBQTBFLElBQXpGOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQU87QUFBQTtBQUFBLFFBQUssU0FBTSxvQ0FBWDtBQUNMLG1CQUFPLFNBQU0sc0JBQWI7QUFDRSxlQUFPLEtBQUssSUFBTCxDQUFVLE1BQVYsSUFBb0IsZ0JBRDdCO0FBRUUsY0FBSyxNQUZQO0FBR0UsY0FBTSxLQUFLLElBQUwsQ0FBVSxTQUhsQjtBQUlFLGtCQUFVLEtBQUssaUJBSmpCO0FBS0Usa0JBQVUsYUFBYSxnQkFBYixLQUFrQyxDQUw5QztBQU1FLGdCQUFRLE1BTlY7QUFPRSxhQUFLLGFBQUMsS0FBRCxFQUFXO0FBQUUsaUJBQUssS0FBTCxHQUFhLEtBQWI7QUFBb0IsU0FQeEM7QUFRRSxlQUFNLEVBUlIsR0FESztBQVVKLFdBQUssSUFBTCxDQUFVLE1BQVYsSUFDQztBQUFBO0FBQUEsVUFBUSxTQUFNLG9CQUFkLEVBQW1DLE1BQUssUUFBeEMsRUFBaUQsU0FBUyxLQUFLLFdBQS9EO0FBQ0csYUFBSyxJQUFMLENBQVUsYUFBVjtBQURIO0FBWEcsS0FBUDtBQWdCRCxHQTFGSDs7QUFBQSxzQkE0RkUsT0E1RkYsc0JBNEZhO0FBQ1QsUUFBTSxTQUFTLEtBQUssSUFBTCxDQUFVLE1BQXpCO0FBQ0EsUUFBSSxNQUFKLEVBQVk7QUFDVixXQUFLLEtBQUwsQ0FBVyxNQUFYLEVBQW1CLElBQW5CO0FBQ0Q7QUFDRixHQWpHSDs7QUFBQSxzQkFtR0UsU0FuR0Ysd0JBbUdlO0FBQ1gsU0FBSyxPQUFMO0FBQ0QsR0FyR0g7O0FBQUE7QUFBQSxFQUF5QyxNQUF6Qzs7Ozs7Ozs7Ozs7ZUNMbUIsUUFBUSxZQUFSLEM7SUFBWCxNLFlBQUEsTTs7Z0JBQ00sUUFBUSxRQUFSLEM7SUFBTixDLGFBQUEsQzs7QUFFUjs7Ozs7O0FBSUEsT0FBTyxPQUFQO0FBQUE7O0FBQ0UsdUJBQWEsSUFBYixFQUFtQixJQUFuQixFQUF5QjtBQUFBOztBQUFBLGlEQUN2QixtQkFBTSxJQUFOLEVBQVksSUFBWixDQUR1Qjs7QUFFdkIsVUFBSyxFQUFMLEdBQVUsTUFBSyxJQUFMLENBQVUsRUFBVixJQUFnQixhQUExQjtBQUNBLFVBQUssS0FBTCxHQUFhLGNBQWI7QUFDQSxVQUFLLElBQUwsR0FBWSxtQkFBWjs7QUFFQTtBQUNBLFFBQU0saUJBQWlCO0FBQ3JCLGNBQVEsTUFEYTtBQUVyQiw0QkFBc0IsS0FGRDtBQUdyQixhQUFPLEtBSGM7QUFJckIsdUJBQWlCOztBQUduQjtBQVB1QixLQUF2QixDQVFBLE1BQUssSUFBTCxHQUFZLFNBQWMsRUFBZCxFQUFrQixjQUFsQixFQUFrQyxJQUFsQyxDQUFaOztBQUVBLFVBQUssTUFBTCxHQUFjLE1BQUssTUFBTCxDQUFZLElBQVosT0FBZDtBQWpCdUI7QUFrQnhCOztBQW5CSCx3QkFxQkUsTUFyQkYsbUJBcUJVLEtBckJWLEVBcUJpQjtBQUNiLFFBQU0sV0FBVyxNQUFNLGFBQU4sSUFBdUIsQ0FBeEM7QUFDQSxRQUFNLFdBQVcsYUFBYSxHQUFiLElBQW9CLEtBQUssSUFBTCxDQUFVLGVBQS9DO0FBQ0EsV0FBTztBQUFBO0FBQUEsUUFBSyxTQUFNLHVCQUFYLEVBQW1DLE9BQU8sRUFBRSxVQUFVLEtBQUssSUFBTCxDQUFVLEtBQVYsR0FBa0IsT0FBbEIsR0FBNEIsU0FBeEMsRUFBMUMsRUFBK0YsZUFBYSxRQUE1RztBQUNMLGlCQUFLLFNBQU0sd0JBQVgsRUFBb0MsT0FBTyxFQUFFLE9BQU8sV0FBVyxHQUFwQixFQUEzQyxHQURLO0FBRUw7QUFBQTtBQUFBLFVBQUssU0FBTSw2QkFBWDtBQUEwQztBQUExQztBQUZLLEtBQVA7QUFJRCxHQTVCSDs7QUFBQSx3QkE4QkUsT0E5QkYsc0JBOEJhO0FBQ1QsUUFBTSxTQUFTLEtBQUssSUFBTCxDQUFVLE1BQXpCO0FBQ0EsUUFBSSxNQUFKLEVBQVk7QUFDVixXQUFLLEtBQUwsQ0FBVyxNQUFYLEVBQW1CLElBQW5CO0FBQ0Q7QUFDRixHQW5DSDs7QUFBQSx3QkFxQ0UsU0FyQ0Ysd0JBcUNlO0FBQ1gsU0FBSyxPQUFMO0FBQ0QsR0F2Q0g7O0FBQUE7QUFBQSxFQUEyQyxNQUEzQzs7Ozs7OztBQ1BBOzs7SUFHTSxZO0FBQ0osMEJBQWU7QUFBQTs7QUFDYixTQUFLLEtBQUwsR0FBYSxFQUFiO0FBQ0EsU0FBSyxTQUFMLEdBQWlCLEVBQWpCO0FBQ0Q7O3lCQUVELFEsdUJBQVk7QUFDVixXQUFPLEtBQUssS0FBWjtBQUNELEc7O3lCQUVELFEscUJBQVUsSyxFQUFPO0FBQ2YsUUFBTSxZQUFZLFNBQWMsRUFBZCxFQUFrQixLQUFLLEtBQXZCLENBQWxCO0FBQ0EsUUFBTSxZQUFZLFNBQWMsRUFBZCxFQUFrQixLQUFLLEtBQXZCLEVBQThCLEtBQTlCLENBQWxCOztBQUVBLFNBQUssS0FBTCxHQUFhLFNBQWI7QUFDQSxTQUFLLFFBQUwsQ0FBYyxTQUFkLEVBQXlCLFNBQXpCLEVBQW9DLEtBQXBDO0FBQ0QsRzs7eUJBRUQsUyxzQkFBVyxRLEVBQVU7QUFBQTs7QUFDbkIsU0FBSyxTQUFMLENBQWUsSUFBZixDQUFvQixRQUFwQjtBQUNBLFdBQU8sWUFBTTtBQUNYO0FBQ0EsWUFBSyxTQUFMLENBQWUsTUFBZixDQUNFLE1BQUssU0FBTCxDQUFlLE9BQWYsQ0FBdUIsUUFBdkIsQ0FERixFQUVFLENBRkY7QUFJRCxLQU5EO0FBT0QsRzs7eUJBRUQsUSx1QkFBbUI7QUFBQSxzQ0FBTixJQUFNO0FBQU4sVUFBTTtBQUFBOztBQUNqQixTQUFLLFNBQUwsQ0FBZSxPQUFmLENBQXVCLFVBQUMsUUFBRCxFQUFjO0FBQ25DLGdDQUFZLElBQVo7QUFDRCxLQUZEO0FBR0QsRzs7Ozs7QUFHSCxPQUFPLE9BQVAsR0FBaUIsU0FBUyxZQUFULEdBQXlCO0FBQ3hDLFNBQU8sSUFBSSxZQUFKLEVBQVA7QUFDRCxDQUZEOzs7Ozs7O0FDdkNBOzs7Ozs7Ozs7Ozs7O0FBYUEsT0FBTyxPQUFQO0FBQ0Usc0JBQWEsT0FBYixFQUFzQjtBQUFBOztBQUFBOztBQUNwQixTQUFLLE1BQUwsR0FBYztBQUNaLGVBQVMsRUFERztBQUVaLGlCQUFXLG1CQUFVLENBQVYsRUFBYTtBQUN0QixZQUFJLE1BQU0sQ0FBVixFQUFhO0FBQ1gsaUJBQU8sQ0FBUDtBQUNEO0FBQ0QsZUFBTyxDQUFQO0FBQ0Q7QUFQVyxLQUFkOztBQVVBLFFBQUksTUFBTSxPQUFOLENBQWMsT0FBZCxDQUFKLEVBQTRCO0FBQzFCLGNBQVEsT0FBUixDQUFnQixVQUFDLE1BQUQ7QUFBQSxlQUFZLE1BQUssTUFBTCxDQUFZLE1BQVosQ0FBWjtBQUFBLE9BQWhCO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsV0FBSyxNQUFMLENBQVksT0FBWjtBQUNEO0FBQ0Y7O0FBakJILHVCQW1CRSxNQW5CRixtQkFtQlUsTUFuQlYsRUFtQmtCO0FBQ2QsUUFBSSxDQUFDLE1BQUQsSUFBVyxDQUFDLE9BQU8sT0FBdkIsRUFBZ0M7QUFDOUI7QUFDRDs7QUFFRCxRQUFNLGFBQWEsS0FBSyxNQUF4QjtBQUNBLFNBQUssTUFBTCxHQUFjLFNBQWMsRUFBZCxFQUFrQixVQUFsQixFQUE4QjtBQUMxQyxlQUFTLFNBQWMsRUFBZCxFQUFrQixXQUFXLE9BQTdCLEVBQXNDLE9BQU8sT0FBN0M7QUFEaUMsS0FBOUIsQ0FBZDtBQUdBLFNBQUssTUFBTCxDQUFZLFNBQVosR0FBd0IsT0FBTyxTQUFQLElBQW9CLFdBQVcsU0FBdkQ7QUFDRCxHQTdCSDs7QUErQkU7Ozs7Ozs7Ozs7Ozs7QUEvQkYsdUJBMENFLFdBMUNGLHdCQTBDZSxNQTFDZixFQTBDdUIsT0ExQ3ZCLEVBMENnQztBQUFBLDRCQUNELE9BQU8sU0FETjtBQUFBLFFBQ3BCLEtBRG9CLHFCQUNwQixLQURvQjtBQUFBLFFBQ2IsT0FEYSxxQkFDYixPQURhOztBQUU1QixRQUFNLGNBQWMsS0FBcEI7QUFDQSxRQUFNLGtCQUFrQixNQUF4QjtBQUNBLFFBQUksZUFBZSxDQUFDLE1BQUQsQ0FBbkI7O0FBRUEsU0FBSyxJQUFJLEdBQVQsSUFBZ0IsT0FBaEIsRUFBeUI7QUFDdkIsVUFBSSxRQUFRLEdBQVIsSUFBZSxRQUFRLGNBQVIsQ0FBdUIsR0FBdkIsQ0FBbkIsRUFBZ0Q7QUFDOUM7QUFDQTtBQUNBO0FBQ0EsWUFBSSxjQUFjLFFBQVEsR0FBUixDQUFsQjtBQUNBLFlBQUksT0FBTyxXQUFQLEtBQXVCLFFBQTNCLEVBQXFDO0FBQ25DLHdCQUFjLFFBQVEsSUFBUixDQUFhLFFBQVEsR0FBUixDQUFiLEVBQTJCLFdBQTNCLEVBQXdDLGVBQXhDLENBQWQ7QUFDRDtBQUNEO0FBQ0E7QUFDQTtBQUNBLHVCQUFlLGtCQUFrQixZQUFsQixFQUFnQyxJQUFJLE1BQUosQ0FBVyxTQUFTLEdBQVQsR0FBZSxLQUExQixFQUFpQyxHQUFqQyxDQUFoQyxFQUF1RSxXQUF2RSxDQUFmO0FBQ0Q7QUFDRjs7QUFFRCxXQUFPLFlBQVA7O0FBRUEsYUFBUyxpQkFBVCxDQUE0QixNQUE1QixFQUFvQyxFQUFwQyxFQUF3QyxXQUF4QyxFQUFxRDtBQUNuRCxVQUFNLFdBQVcsRUFBakI7QUFDQSxhQUFPLE9BQVAsQ0FBZSxVQUFDLEtBQUQsRUFBVztBQUN4QixjQUFNLElBQU4sQ0FBVyxLQUFYLEVBQWtCLEVBQWxCLEVBQXNCLE9BQXRCLENBQThCLFVBQUMsR0FBRCxFQUFNLENBQU4sRUFBUyxJQUFULEVBQWtCO0FBQzlDLGNBQUksUUFBUSxFQUFaLEVBQWdCO0FBQ2QscUJBQVMsSUFBVCxDQUFjLEdBQWQ7QUFDRDs7QUFFRDtBQUNBLGNBQUksSUFBSSxLQUFLLE1BQUwsR0FBYyxDQUF0QixFQUF5QjtBQUN2QixxQkFBUyxJQUFULENBQWMsV0FBZDtBQUNEO0FBQ0YsU0FURDtBQVVELE9BWEQ7QUFZQSxhQUFPLFFBQVA7QUFDRDtBQUNGLEdBbEZIOztBQW9GRTs7Ozs7Ozs7O0FBcEZGLHVCQTJGRSxTQTNGRixzQkEyRmEsR0EzRmIsRUEyRmtCLE9BM0ZsQixFQTJGMkI7QUFDdkIsV0FBTyxLQUFLLGNBQUwsQ0FBb0IsR0FBcEIsRUFBeUIsT0FBekIsRUFBa0MsSUFBbEMsQ0FBdUMsRUFBdkMsQ0FBUDtBQUNELEdBN0ZIOztBQStGRTs7Ozs7Ozs7QUEvRkYsdUJBcUdFLGNBckdGLDJCQXFHa0IsR0FyR2xCLEVBcUd1QixPQXJHdkIsRUFxR2dDO0FBQzVCLFFBQUksV0FBVyxPQUFPLFFBQVEsV0FBZixLQUErQixXQUE5QyxFQUEyRDtBQUN6RCxVQUFJLFNBQVMsS0FBSyxNQUFMLENBQVksU0FBWixDQUFzQixRQUFRLFdBQTlCLENBQWI7QUFDQSxhQUFPLEtBQUssV0FBTCxDQUFpQixLQUFLLE1BQUwsQ0FBWSxPQUFaLENBQW9CLEdBQXBCLEVBQXlCLE1BQXpCLENBQWpCLEVBQW1ELE9BQW5ELENBQVA7QUFDRDs7QUFFRCxXQUFPLEtBQUssV0FBTCxDQUFpQixLQUFLLE1BQUwsQ0FBWSxPQUFaLENBQW9CLEdBQXBCLENBQWpCLEVBQTJDLE9BQTNDLENBQVA7QUFDRCxHQTVHSDs7QUFBQTtBQUFBOzs7QUNiQSxJQUFNLFdBQVcsUUFBUSxpQkFBUixDQUFqQjs7QUFFQSxTQUFTLG1CQUFULENBQThCLFFBQTlCLEVBQXdDLFlBQXhDLEVBQXNELElBQXRELEVBQTREO0FBQUEsTUFDbEQsUUFEa0QsR0FDVixZQURVLENBQ2xELFFBRGtEO0FBQUEsTUFDeEMsYUFEd0MsR0FDVixZQURVLENBQ3hDLGFBRHdDO0FBQUEsTUFDekIsVUFEeUIsR0FDVixZQURVLENBQ3pCLFVBRHlCOztBQUUxRCxNQUFJLFFBQUosRUFBYztBQUNaLGFBQVMsSUFBVCxDQUFjLEdBQWQsdUJBQXNDLFFBQXRDO0FBQ0EsYUFBUyxJQUFULENBQWMsSUFBZCxDQUFtQixpQkFBbkIsRUFBc0MsSUFBdEMsRUFBNEM7QUFDMUMsd0JBRDBDO0FBRTFDLHFCQUFlLGFBRjJCO0FBRzFDLGtCQUFZO0FBSDhCLEtBQTVDO0FBS0Q7QUFDRjs7QUFFRCxPQUFPLE9BQVAsR0FBaUIsU0FBUyxtQkFBVCxFQUE4QixHQUE5QixFQUFtQyxFQUFDLFNBQVMsSUFBVixFQUFnQixVQUFVLElBQTFCLEVBQW5DLENBQWpCOzs7OztBQ2RBLElBQU0sZUFBZSxRQUFRLGdCQUFSLENBQXJCOztBQUVBOzs7Ozs7QUFNQSxPQUFPLE9BQVAsR0FBaUIsU0FBUyxjQUFULENBQXlCLE9BQXpCLEVBQXNEO0FBQUEsTUFBcEIsT0FBb0IsdUVBQVYsUUFBVTs7QUFDckUsTUFBSSxPQUFPLE9BQVAsS0FBbUIsUUFBdkIsRUFBaUM7QUFDL0IsV0FBTyxRQUFRLGFBQVIsQ0FBc0IsT0FBdEIsQ0FBUDtBQUNEOztBQUVELE1BQUksUUFBTyxPQUFQLHlDQUFPLE9BQVAsT0FBbUIsUUFBbkIsSUFBK0IsYUFBYSxPQUFiLENBQW5DLEVBQTBEO0FBQ3hELFdBQU8sT0FBUDtBQUNEO0FBQ0YsQ0FSRDs7O0FDUkE7Ozs7Ozs7O0FBUUEsT0FBTyxPQUFQLEdBQWlCLFNBQVMsY0FBVCxDQUF5QixJQUF6QixFQUErQjtBQUM5QztBQUNBLFNBQU8sQ0FDTCxNQURLLEVBRUwsS0FBSyxJQUFMLEdBQVksS0FBSyxJQUFMLENBQVUsV0FBVixHQUF3QixPQUF4QixDQUFnQyxhQUFoQyxFQUErQyxFQUEvQyxDQUFaLEdBQWlFLEVBRjVELEVBR0wsS0FBSyxJQUhBLEVBSUwsS0FBSyxJQUFMLENBQVUsSUFKTCxFQUtMLEtBQUssSUFBTCxDQUFVLFlBTEwsRUFNTCxNQU5LLENBTUU7QUFBQSxXQUFPLEdBQVA7QUFBQSxHQU5GLEVBTWMsSUFOZCxDQU1tQixHQU5uQixDQUFQO0FBT0QsQ0FURDs7O0FDUkE7Ozs7OztBQU1BLE9BQU8sT0FBUCxHQUFpQixTQUFTLHVCQUFULENBQWtDLFlBQWxDLEVBQWdEO0FBQy9ELE1BQUksS0FBSyxpQkFBVDtBQUNBLE1BQUksVUFBVSxHQUFHLElBQUgsQ0FBUSxZQUFSLEVBQXNCLENBQXRCLENBQWQ7QUFDQSxNQUFJLFdBQVcsYUFBYSxPQUFiLENBQXFCLE1BQU0sT0FBM0IsRUFBb0MsRUFBcEMsQ0FBZjtBQUNBLFNBQU87QUFDTCxVQUFNLFFBREQ7QUFFTCxlQUFXO0FBRk4sR0FBUDtBQUlELENBUkQ7OztBQ05BLElBQU0sMEJBQTBCLFFBQVEsMkJBQVIsQ0FBaEM7QUFDQSxJQUFNLFlBQVksUUFBUSxhQUFSLENBQWxCOztBQUVBLE9BQU8sT0FBUCxHQUFpQixTQUFTLFdBQVQsQ0FBc0IsSUFBdEIsRUFBNEI7QUFDM0MsTUFBSSxnQkFBZ0IsS0FBSyxJQUFMLEdBQVksd0JBQXdCLEtBQUssSUFBN0IsRUFBbUMsU0FBL0MsR0FBMkQsSUFBL0U7QUFDQSxrQkFBZ0IsZ0JBQWdCLGNBQWMsV0FBZCxFQUFoQixHQUE4QyxJQUE5RDs7QUFFQSxNQUFJLEtBQUssUUFBVCxFQUFtQjtBQUNqQjtBQUNBLFdBQU8sS0FBSyxJQUFMLEdBQVksS0FBSyxJQUFqQixHQUF3QixVQUFVLGFBQVYsQ0FBL0I7QUFDRDs7QUFFRDtBQUNBLE1BQUksS0FBSyxJQUFULEVBQWU7QUFDYixXQUFPLEtBQUssSUFBWjtBQUNEOztBQUVEO0FBQ0EsTUFBSSxpQkFBaUIsVUFBVSxhQUFWLENBQXJCLEVBQStDO0FBQzdDLFdBQU8sVUFBVSxhQUFWLENBQVA7QUFDRDs7QUFFRDtBQUNBLFNBQU8sMEJBQVA7QUFDRCxDQXJCRDs7O0FDSEEsT0FBTyxPQUFQLEdBQWlCLFNBQVMsYUFBVCxDQUF3QixHQUF4QixFQUE2QjtBQUM1QztBQUNBLE1BQUksUUFBUSx3REFBWjtBQUNBLE1BQUksT0FBTyxNQUFNLElBQU4sQ0FBVyxHQUFYLEVBQWdCLENBQWhCLENBQVg7QUFDQSxNQUFJLGlCQUFpQixjQUFjLElBQWQsQ0FBbUIsR0FBbkIsSUFBMEIsSUFBMUIsR0FBaUMsS0FBdEQ7O0FBRUEsU0FBVSxjQUFWLFdBQThCLElBQTlCO0FBQ0QsQ0FQRDs7O0FDQUE7OztBQUdBLE9BQU8sT0FBUCxHQUFpQixTQUFTLFlBQVQsR0FBeUI7QUFDeEMsTUFBSSxPQUFPLElBQUksSUFBSixFQUFYO0FBQ0EsTUFBSSxRQUFRLElBQUksS0FBSyxRQUFMLEdBQWdCLFFBQWhCLEVBQUosQ0FBWjtBQUNBLE1BQUksVUFBVSxJQUFJLEtBQUssVUFBTCxHQUFrQixRQUFsQixFQUFKLENBQWQ7QUFDQSxNQUFJLFVBQVUsSUFBSSxLQUFLLFVBQUwsR0FBa0IsUUFBbEIsRUFBSixDQUFkO0FBQ0EsU0FBTyxRQUFRLEdBQVIsR0FBYyxPQUFkLEdBQXdCLEdBQXhCLEdBQThCLE9BQXJDO0FBQ0QsQ0FORDs7QUFRQTs7O0FBR0EsU0FBUyxHQUFULENBQWMsR0FBZCxFQUFtQjtBQUNqQixTQUFPLElBQUksTUFBSixLQUFlLENBQWYsR0FBbUIsSUFBSSxHQUF2QixHQUE2QixHQUFwQztBQUNEOzs7OztBQ2hCRDs7Ozs7QUFLQSxPQUFPLE9BQVAsR0FBaUIsU0FBUyxZQUFULENBQXVCLEdBQXZCLEVBQTRCO0FBQzNDLFNBQU8sT0FBTyxRQUFPLEdBQVAseUNBQU8sR0FBUCxPQUFlLFFBQXRCLElBQWtDLElBQUksUUFBSixLQUFpQixLQUFLLFlBQS9EO0FBQ0QsQ0FGRDs7O0FDTEE7Ozs7Ozs7O0FBUUEsT0FBTyxPQUFQLEdBQWlCLFNBQVMsYUFBVCxDQUF3QixLQUF4QixFQUErQjtBQUM5QyxNQUFJLFVBQVUsQ0FBZDtBQUNBLE1BQU0sUUFBUSxFQUFkO0FBQ0EsU0FBTyxVQUFDLEVBQUQsRUFBUTtBQUNiLFdBQU8sWUFBYTtBQUFBLHdDQUFULElBQVM7QUFBVCxZQUFTO0FBQUE7O0FBQ2xCLFVBQU0sT0FBTyxTQUFQLElBQU8sR0FBTTtBQUNqQjtBQUNBLFlBQU0sVUFBVSxvQkFBTSxJQUFOLENBQWhCO0FBQ0EsZ0JBQVEsSUFBUixDQUFhLFFBQWIsRUFBdUIsUUFBdkI7QUFDQSxlQUFPLE9BQVA7QUFDRCxPQUxEOztBQU9BLFVBQUksV0FBVyxLQUFmLEVBQXNCO0FBQ3BCLGVBQU8sSUFBSSxPQUFKLENBQVksVUFBQyxPQUFELEVBQVUsTUFBVixFQUFxQjtBQUN0QyxnQkFBTSxJQUFOLENBQVcsWUFBTTtBQUNmLG1CQUFPLElBQVAsQ0FBWSxPQUFaLEVBQXFCLE1BQXJCO0FBQ0QsV0FGRDtBQUdELFNBSk0sQ0FBUDtBQUtEO0FBQ0QsYUFBTyxNQUFQO0FBQ0QsS0FoQkQ7QUFpQkQsR0FsQkQ7QUFtQkEsV0FBUyxRQUFULEdBQXFCO0FBQ25CO0FBQ0EsUUFBTSxPQUFPLE1BQU0sS0FBTixFQUFiO0FBQ0EsUUFBSSxJQUFKLEVBQVU7QUFDWDtBQUNGLENBM0JEOzs7QUNSQSxPQUFPLE9BQVAsR0FBaUI7QUFDZixRQUFNLGVBRFM7QUFFZixjQUFZLGVBRkc7QUFHZixTQUFPLFdBSFE7QUFJZixTQUFPLFdBSlE7QUFLZixTQUFPLGVBTFE7QUFNZixTQUFPLFlBTlE7QUFPZixTQUFPLFdBUFE7QUFRZixTQUFPLFdBUlE7QUFTZixVQUFRLFdBVE87QUFVZixTQUFPLFdBVlE7QUFXZixTQUFPLFVBWFE7QUFZZixTQUFPLGlCQVpRO0FBYWYsU0FBTyxrQkFiUTtBQWNmLFNBQU8sa0JBZFE7QUFlZixTQUFPLGlCQWZRO0FBZ0JmLFNBQU8sb0JBaEJRO0FBaUJmLFVBQVEsa0RBakJPO0FBa0JmLFVBQVEseUVBbEJPO0FBbUJmLFNBQU8sb0JBbkJRO0FBb0JmLFVBQVEsa0RBcEJPO0FBcUJmLFVBQVEseUVBckJPO0FBc0JmLFNBQU8sMEJBdEJRO0FBdUJmLFVBQVEsZ0RBdkJPO0FBd0JmLFNBQU8sMEJBeEJRO0FBeUJmLFNBQU8seUJBekJRO0FBMEJmLFNBQU8sMEJBMUJRO0FBMkJmLFNBQU8sMEJBM0JRO0FBNEJmLFVBQVEsdURBNUJPO0FBNkJmLFVBQVEsZ0RBN0JPO0FBOEJmLFVBQVEsbUVBOUJPO0FBK0JmLFNBQU8sMEJBL0JRO0FBZ0NmLFVBQVEsbURBaENPO0FBaUNmLFVBQVEsc0VBakNPO0FBa0NmLFNBQU87QUFsQ1EsQ0FBakI7OztBQ0FBLE9BQU8sT0FBUCxHQUFpQixTQUFTLE1BQVQsQ0FBaUIsUUFBakIsRUFBMkI7QUFDMUMsTUFBTSxjQUFjLEVBQXBCO0FBQ0EsTUFBTSxhQUFhLEVBQW5CO0FBQ0EsV0FBUyxRQUFULENBQW1CLEtBQW5CLEVBQTBCO0FBQ3hCLGdCQUFZLElBQVosQ0FBaUIsS0FBakI7QUFDRDtBQUNELFdBQVMsUUFBVCxDQUFtQixLQUFuQixFQUEwQjtBQUN4QixlQUFXLElBQVgsQ0FBZ0IsS0FBaEI7QUFDRDs7QUFFRCxNQUFNLE9BQU8sUUFBUSxHQUFSLENBQ1gsU0FBUyxHQUFULENBQWEsVUFBQyxPQUFEO0FBQUEsV0FBYSxRQUFRLElBQVIsQ0FBYSxRQUFiLEVBQXVCLFFBQXZCLENBQWI7QUFBQSxHQUFiLENBRFcsQ0FBYjs7QUFJQSxTQUFPLEtBQUssSUFBTCxDQUFVLFlBQU07QUFDckIsV0FBTztBQUNMLGtCQUFZLFdBRFA7QUFFTCxjQUFRO0FBRkgsS0FBUDtBQUlELEdBTE0sQ0FBUDtBQU1ELENBcEJEOzs7QUNBQTs7O0FBR0EsT0FBTyxPQUFQLEdBQWlCLFNBQVMsT0FBVCxDQUFrQixJQUFsQixFQUF3QjtBQUN2QyxTQUFPLE1BQU0sU0FBTixDQUFnQixLQUFoQixDQUFzQixJQUF0QixDQUEyQixRQUFRLEVBQW5DLEVBQXVDLENBQXZDLENBQVA7QUFDRCxDQUZEOzs7Ozs7Ozs7OztlQ0htQixRQUFRLFlBQVIsQztJQUFYLE0sWUFBQSxNOztBQUNSLElBQU0sT0FBTyxRQUFRLE1BQVIsQ0FBYjtBQUNBLElBQU0sYUFBYSxRQUFRLDRCQUFSLENBQW5COztnQkFDNEMsUUFBUSx3QkFBUixDO0lBQXBDLFEsYUFBQSxRO0lBQVUsYSxhQUFBLGE7SUFBZSxNLGFBQUEsTTs7QUFDakMsSUFBTSxxQkFBcUIsUUFBUSxvQ0FBUixDQUEzQjtBQUNBLElBQU0sZ0JBQWdCLFFBQVEsK0JBQVIsQ0FBdEI7QUFDQSxJQUFNLFNBQVMsUUFBUSx3QkFBUixDQUFmO0FBQ0EsSUFBTSxnQkFBZ0IsUUFBUSwrQkFBUixDQUF0Qjs7QUFFQSxTQUFTLGtCQUFULENBQTZCLEdBQTdCLEVBQWtDLEtBQWxDLEVBQXlDO0FBQ3ZDO0FBQ0EsTUFBSSxDQUFDLEtBQUwsRUFBWSxRQUFRLElBQUksS0FBSixDQUFVLGNBQVYsQ0FBUjtBQUNaO0FBQ0EsTUFBSSxPQUFPLEtBQVAsS0FBaUIsUUFBckIsRUFBK0IsUUFBUSxJQUFJLEtBQUosQ0FBVSxLQUFWLENBQVI7QUFDL0I7QUFDQSxNQUFJLEVBQUUsaUJBQWlCLEtBQW5CLENBQUosRUFBK0I7QUFDN0IsWUFBUSxTQUFjLElBQUksS0FBSixDQUFVLGNBQVYsQ0FBZCxFQUF5QyxFQUFFLE1BQU0sS0FBUixFQUF6QyxDQUFSO0FBQ0Q7O0FBRUQsUUFBTSxPQUFOLEdBQWdCLEdBQWhCO0FBQ0EsU0FBTyxLQUFQO0FBQ0Q7O0FBRUQsT0FBTyxPQUFQO0FBQUE7O0FBQ0UscUJBQWEsSUFBYixFQUFtQixJQUFuQixFQUF5QjtBQUFBOztBQUFBLGlEQUN2QixtQkFBTSxJQUFOLEVBQVksSUFBWixDQUR1Qjs7QUFFdkIsVUFBSyxJQUFMLEdBQVksVUFBWjtBQUNBLFVBQUssRUFBTCxHQUFVLFdBQVY7QUFDQSxVQUFLLEtBQUwsR0FBYSxXQUFiOztBQUVBLFFBQU0sZ0JBQWdCO0FBQ3BCLGVBQVM7QUFDUCxrQkFBVTtBQURIOztBQUtYO0FBTnNCLEtBQXRCLENBT0EsSUFBTSxpQkFBaUI7QUFDckIsZ0JBQVUsSUFEVztBQUVyQixpQkFBVyxTQUZVO0FBR3JCLGNBQVEsTUFIYTtBQUlyQixrQkFBWSxJQUpTO0FBS3JCLDRCQUFzQixLQUxEO0FBTXJCLGNBQVEsS0FOYTtBQU9yQixlQUFTLEVBUFk7QUFRckIsY0FBUSxhQVJhO0FBU3JCLGVBQVMsS0FBSyxJQVRPO0FBVXJCLGFBQU8sQ0FWYztBQVdyQix1QkFBaUIsS0FYSTtBQVlyQixvQkFBYyxFQVpPO0FBYXJCOzs7Ozs7Ozs7O0FBVUEscUJBdkJxQiwyQkF1QkosWUF2QkksRUF1QlUsUUF2QlYsRUF1Qm9CO0FBQ3ZDLFlBQUksaUJBQWlCLEVBQXJCO0FBQ0EsWUFBSTtBQUNGLDJCQUFpQixLQUFLLEtBQUwsQ0FBVyxZQUFYLENBQWpCO0FBQ0QsU0FGRCxDQUVFLE9BQU8sR0FBUCxFQUFZO0FBQ1osa0JBQVEsR0FBUixDQUFZLEdBQVo7QUFDRDs7QUFFRCxlQUFPLGNBQVA7QUFDRCxPQWhDb0I7O0FBaUNyQjs7Ozs7QUFLQSxzQkF0Q3FCLDRCQXNDSCxZQXRDRyxFQXNDVyxRQXRDWCxFQXNDcUI7QUFDeEMsZUFBTyxJQUFJLEtBQUosQ0FBVSxjQUFWLENBQVA7QUFDRDtBQXhDb0IsS0FBdkI7O0FBMkNBO0FBQ0EsVUFBSyxJQUFMLEdBQVksU0FBYyxFQUFkLEVBQWtCLGNBQWxCLEVBQWtDLElBQWxDLENBQVo7O0FBRUE7QUFDQSxVQUFLLFVBQUwsR0FBa0IsSUFBSSxVQUFKLENBQWUsQ0FBRSxhQUFGLEVBQWlCLE1BQUssSUFBTCxDQUFVLE1BQTNCLEVBQW1DLE1BQUssSUFBTCxDQUFVLE1BQTdDLENBQWYsQ0FBbEI7QUFDQSxVQUFLLElBQUwsR0FBWSxNQUFLLFVBQUwsQ0FBZ0IsU0FBaEIsQ0FBMEIsSUFBMUIsQ0FBK0IsTUFBSyxVQUFwQyxDQUFaO0FBQ0EsVUFBSyxTQUFMLEdBQWlCLE1BQUssVUFBTCxDQUFnQixjQUFoQixDQUErQixJQUEvQixDQUFvQyxNQUFLLFVBQXpDLENBQWpCOztBQUVBLFVBQUssWUFBTCxHQUFvQixNQUFLLFlBQUwsQ0FBa0IsSUFBbEIsT0FBcEI7O0FBRUE7QUFDQSxRQUFJLE9BQU8sTUFBSyxJQUFMLENBQVUsS0FBakIsS0FBMkIsUUFBM0IsSUFBdUMsTUFBSyxJQUFMLENBQVUsS0FBVixLQUFvQixDQUEvRCxFQUFrRTtBQUNoRSxZQUFLLFlBQUwsR0FBb0IsY0FBYyxNQUFLLElBQUwsQ0FBVSxLQUF4QixDQUFwQjtBQUNELEtBRkQsTUFFTztBQUNMLFlBQUssWUFBTCxHQUFvQixVQUFDLEVBQUQ7QUFBQSxlQUFRLEVBQVI7QUFBQSxPQUFwQjtBQUNEOztBQUVELFFBQUksTUFBSyxJQUFMLENBQVUsTUFBVixJQUFvQixDQUFDLE1BQUssSUFBTCxDQUFVLFFBQW5DLEVBQTZDO0FBQzNDLFlBQU0sSUFBSSxLQUFKLENBQVUsNkRBQVYsQ0FBTjtBQUNEO0FBM0VzQjtBQTRFeEI7O0FBN0VILHNCQStFRSxVQS9FRix1QkErRWMsSUEvRWQsRUErRW9CO0FBQ2hCLFFBQU0sWUFBWSxLQUFLLElBQUwsQ0FBVSxRQUFWLEdBQXFCLFNBQXZDO0FBQ0EsUUFBTSxPQUFPLFNBQWMsRUFBZCxFQUNYLEtBQUssSUFETSxFQUVYLGFBQWEsRUFGRixFQUdYLEtBQUssU0FBTCxJQUFrQixFQUhQLENBQWI7QUFLQSxTQUFLLE9BQUwsR0FBZSxFQUFmO0FBQ0EsYUFBYyxLQUFLLE9BQW5CLEVBQTRCLEtBQUssSUFBTCxDQUFVLE9BQXRDO0FBQ0EsUUFBSSxTQUFKLEVBQWU7QUFDYixlQUFjLEtBQUssT0FBbkIsRUFBNEIsVUFBVSxPQUF0QztBQUNEO0FBQ0QsUUFBSSxLQUFLLFNBQVQsRUFBb0I7QUFDbEIsZUFBYyxLQUFLLE9BQW5CLEVBQTRCLEtBQUssU0FBTCxDQUFlLE9BQTNDO0FBQ0Q7O0FBRUQsV0FBTyxJQUFQO0FBQ0QsR0FoR0g7O0FBa0dFO0FBQ0E7QUFDQTtBQUNBOzs7QUFyR0Ysc0JBc0dFLHFCQXRHRixrQ0FzR3lCLE9BdEd6QixFQXNHa0MsY0F0R2xDLEVBc0drRDtBQUM5QyxRQUFNLE9BQU8sS0FBSyxJQUFsQjtBQUNBLFFBQU0sT0FBTyxJQUFiO0FBQ0EsUUFBSSxTQUFTLEtBQWI7O0FBRUEsYUFBUyxVQUFULEdBQXVCO0FBQ3JCLFdBQUssR0FBTDtBQUNBLFVBQU0sUUFBUSxJQUFJLEtBQUosQ0FBVSxLQUFLLElBQUwsQ0FBVSxVQUFWLEVBQXNCLEVBQUUsU0FBUyxLQUFLLElBQUwsQ0FBVSxVQUFVLElBQXBCLENBQVgsRUFBdEIsQ0FBVixDQUFkO0FBQ0EscUJBQWUsS0FBZjtBQUNEOztBQUVELFFBQUksYUFBYSxJQUFqQjtBQUNBLGFBQVMsUUFBVCxHQUFxQjtBQUNuQjtBQUNBO0FBQ0E7QUFDQSxVQUFJLE1BQUosRUFBWTs7QUFFWixVQUFJLFVBQVUsQ0FBZCxFQUFpQjtBQUNmLFlBQUksVUFBSixFQUFnQixhQUFhLFVBQWI7QUFDaEIscUJBQWEsV0FBVyxVQUFYLEVBQXVCLE9BQXZCLENBQWI7QUFDRDtBQUNGOztBQUVELGFBQVMsSUFBVCxHQUFpQjtBQUNmLFdBQUssR0FBTDtBQUNBLFVBQUksVUFBSixFQUFnQjtBQUNkLHFCQUFhLFVBQWI7QUFDQSxxQkFBYSxJQUFiO0FBQ0Q7QUFDRCxlQUFTLElBQVQ7QUFDRDs7QUFFRCxXQUFPO0FBQ0wsd0JBREs7QUFFTDtBQUZLLEtBQVA7QUFJRCxHQTNJSDs7QUFBQSxzQkE2SUUsb0JBN0lGLGlDQTZJd0IsSUE3SXhCLEVBNkk4QixJQTdJOUIsRUE2SW9DO0FBQ2hDLFFBQU0sV0FBVyxJQUFJLFFBQUosRUFBakI7O0FBRUEsUUFBTSxhQUFhLE1BQU0sT0FBTixDQUFjLEtBQUssVUFBbkIsSUFDZixLQUFLO0FBQ1A7QUFGaUIsTUFHZixPQUFPLElBQVAsQ0FBWSxLQUFLLElBQWpCLENBSEo7QUFJQSxlQUFXLE9BQVgsQ0FBbUIsVUFBQyxJQUFELEVBQVU7QUFDM0IsZUFBUyxNQUFULENBQWdCLElBQWhCLEVBQXNCLEtBQUssSUFBTCxDQUFVLElBQVYsQ0FBdEI7QUFDRCxLQUZEOztBQUlBLFFBQUksS0FBSyxJQUFULEVBQWU7QUFDYixlQUFTLE1BQVQsQ0FBZ0IsS0FBSyxTQUFyQixFQUFnQyxLQUFLLElBQXJDLEVBQTJDLEtBQUssSUFBaEQ7QUFDRCxLQUZELE1BRU87QUFDTCxlQUFTLE1BQVQsQ0FBZ0IsS0FBSyxTQUFyQixFQUFnQyxLQUFLLElBQXJDO0FBQ0Q7O0FBRUQsV0FBTyxRQUFQO0FBQ0QsR0EvSkg7O0FBQUEsc0JBaUtFLGdCQWpLRiw2QkFpS29CLElBaktwQixFQWlLMEIsSUFqSzFCLEVBaUtnQztBQUM1QixXQUFPLEtBQUssSUFBWjtBQUNELEdBbktIOztBQUFBLHNCQXFLRSxNQXJLRixtQkFxS1UsSUFyS1YsRUFxS2dCLE9BcktoQixFQXFLeUIsS0FyS3pCLEVBcUtnQztBQUFBOztBQUM1QixRQUFNLE9BQU8sS0FBSyxVQUFMLENBQWdCLElBQWhCLENBQWI7O0FBRUEsU0FBSyxJQUFMLENBQVUsR0FBVixnQkFBMkIsT0FBM0IsWUFBeUMsS0FBekM7QUFDQSxXQUFPLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBcUI7QUFDdEMsVUFBTSxPQUFPLEtBQUssUUFBTCxHQUNULE9BQUssb0JBQUwsQ0FBMEIsSUFBMUIsRUFBZ0MsSUFBaEMsQ0FEUyxHQUVULE9BQUssZ0JBQUwsQ0FBc0IsSUFBdEIsRUFBNEIsSUFBNUIsQ0FGSjs7QUFJQSxVQUFNLFFBQVEsT0FBSyxxQkFBTCxDQUEyQixLQUFLLE9BQWhDLEVBQXlDLFVBQUMsS0FBRCxFQUFXO0FBQ2hFLFlBQUksS0FBSjtBQUNBLGVBQUssSUFBTCxDQUFVLElBQVYsQ0FBZSxjQUFmLEVBQStCLElBQS9CLEVBQXFDLEtBQXJDO0FBQ0EsZUFBTyxLQUFQO0FBQ0QsT0FKYSxDQUFkOztBQU1BLFVBQU0sTUFBTSxJQUFJLGNBQUosRUFBWjs7QUFFQSxVQUFNLEtBQUssTUFBWDs7QUFFQSxVQUFJLE1BQUosQ0FBVyxnQkFBWCxDQUE0QixXQUE1QixFQUF5QyxVQUFDLEVBQUQsRUFBUTtBQUMvQyxlQUFLLElBQUwsQ0FBVSxHQUFWLGtCQUE2QixFQUE3QjtBQUNELE9BRkQ7O0FBSUEsVUFBSSxNQUFKLENBQVcsZ0JBQVgsQ0FBNEIsVUFBNUIsRUFBd0MsVUFBQyxFQUFELEVBQVE7QUFDOUMsZUFBSyxJQUFMLENBQVUsR0FBVixrQkFBNkIsRUFBN0IsbUJBQTZDLEdBQUcsTUFBaEQsV0FBNEQsR0FBRyxLQUEvRDtBQUNBO0FBQ0E7QUFDQSxjQUFNLFFBQU47O0FBRUEsWUFBSSxHQUFHLGdCQUFQLEVBQXlCO0FBQ3ZCLGlCQUFLLElBQUwsQ0FBVSxJQUFWLENBQWUsaUJBQWYsRUFBa0MsSUFBbEMsRUFBd0M7QUFDdEMsc0JBQVUsTUFENEI7QUFFdEMsMkJBQWUsR0FBRyxNQUZvQjtBQUd0Qyx3QkFBWSxHQUFHO0FBSHVCLFdBQXhDO0FBS0Q7QUFDRixPQWJEOztBQWVBLFVBQUksZ0JBQUosQ0FBcUIsTUFBckIsRUFBNkIsVUFBQyxFQUFELEVBQVE7QUFDbkMsZUFBSyxJQUFMLENBQVUsR0FBVixrQkFBNkIsRUFBN0I7QUFDQSxjQUFNLElBQU47O0FBRUEsWUFBSSxHQUFHLE1BQUgsQ0FBVSxNQUFWLElBQW9CLEdBQXBCLElBQTJCLEdBQUcsTUFBSCxDQUFVLE1BQVYsR0FBbUIsR0FBbEQsRUFBdUQ7QUFDckQsY0FBTSxPQUFPLEtBQUssZUFBTCxDQUFxQixJQUFJLFlBQXpCLEVBQXVDLEdBQXZDLENBQWI7QUFDQSxjQUFNLFlBQVksS0FBSyxLQUFLLG9CQUFWLENBQWxCOztBQUVBLGNBQU0sYUFBYTtBQUNqQixvQkFBUSxHQUFHLE1BQUgsQ0FBVSxNQUREO0FBRWpCLHNCQUZpQjtBQUdqQjtBQUhpQixXQUFuQjs7QUFNQSxpQkFBSyxJQUFMLENBQVUsSUFBVixDQUFlLGdCQUFmLEVBQWlDLElBQWpDLEVBQXVDLFVBQXZDOztBQUVBLGNBQUksU0FBSixFQUFlO0FBQ2IsbUJBQUssSUFBTCxDQUFVLEdBQVYsZUFBMEIsS0FBSyxJQUEvQixjQUE0QyxLQUFLLFNBQWpEO0FBQ0Q7O0FBRUQsaUJBQU8sUUFBUSxJQUFSLENBQVA7QUFDRCxTQWpCRCxNQWlCTztBQUNMLGNBQU0sUUFBTyxLQUFLLGVBQUwsQ0FBcUIsSUFBSSxZQUF6QixFQUF1QyxHQUF2QyxDQUFiO0FBQ0EsY0FBTSxRQUFRLG1CQUFtQixHQUFuQixFQUF3QixLQUFLLGdCQUFMLENBQXNCLElBQUksWUFBMUIsRUFBd0MsR0FBeEMsQ0FBeEIsQ0FBZDs7QUFFQSxjQUFNLFdBQVc7QUFDZixvQkFBUSxHQUFHLE1BQUgsQ0FBVSxNQURIO0FBRWY7QUFGZSxXQUFqQjs7QUFLQSxpQkFBSyxJQUFMLENBQVUsSUFBVixDQUFlLGNBQWYsRUFBK0IsSUFBL0IsRUFBcUMsS0FBckMsRUFBNEMsUUFBNUM7QUFDQSxpQkFBTyxPQUFPLEtBQVAsQ0FBUDtBQUNEO0FBQ0YsT0FqQ0Q7O0FBbUNBLFVBQUksZ0JBQUosQ0FBcUIsT0FBckIsRUFBOEIsVUFBQyxFQUFELEVBQVE7QUFDcEMsZUFBSyxJQUFMLENBQVUsR0FBVixrQkFBNkIsRUFBN0I7QUFDQSxjQUFNLElBQU47O0FBRUEsWUFBTSxRQUFRLG1CQUFtQixHQUFuQixFQUF3QixLQUFLLGdCQUFMLENBQXNCLElBQUksWUFBMUIsRUFBd0MsR0FBeEMsQ0FBeEIsQ0FBZDtBQUNBLGVBQUssSUFBTCxDQUFVLElBQVYsQ0FBZSxjQUFmLEVBQStCLElBQS9CLEVBQXFDLEtBQXJDO0FBQ0EsZUFBTyxPQUFPLEtBQVAsQ0FBUDtBQUNELE9BUEQ7O0FBU0EsVUFBSSxJQUFKLENBQVMsS0FBSyxNQUFMLENBQVksV0FBWixFQUFULEVBQW9DLEtBQUssUUFBekMsRUFBbUQsSUFBbkQ7QUFDQTtBQUNBO0FBQ0EsVUFBSSxlQUFKLEdBQXNCLEtBQUssZUFBM0I7QUFDQSxVQUFJLEtBQUssWUFBTCxLQUFzQixFQUExQixFQUE4QjtBQUM1QixZQUFJLFlBQUosR0FBbUIsS0FBSyxZQUF4QjtBQUNEOztBQUVELGFBQU8sSUFBUCxDQUFZLEtBQUssT0FBakIsRUFBMEIsT0FBMUIsQ0FBa0MsVUFBQyxNQUFELEVBQVk7QUFDNUMsWUFBSSxnQkFBSixDQUFxQixNQUFyQixFQUE2QixLQUFLLE9BQUwsQ0FBYSxNQUFiLENBQTdCO0FBQ0QsT0FGRDs7QUFJQSxVQUFJLElBQUosQ0FBUyxJQUFUOztBQUVBLGFBQUssSUFBTCxDQUFVLEVBQVYsQ0FBYSxjQUFiLEVBQTZCLFVBQUMsV0FBRCxFQUFpQjtBQUM1QyxZQUFJLFlBQVksRUFBWixLQUFtQixLQUFLLEVBQTVCLEVBQWdDO0FBQzlCLGdCQUFNLElBQU47QUFDQSxjQUFJLEtBQUo7QUFDQSxpQkFBTyxJQUFJLEtBQUosQ0FBVSxjQUFWLENBQVA7QUFDRDtBQUNGLE9BTkQ7O0FBUUEsYUFBSyxJQUFMLENBQVUsRUFBVixDQUFhLFlBQWIsRUFBMkIsWUFBTTtBQUMvQixjQUFNLElBQU47QUFDQSxZQUFJLEtBQUo7QUFDQSxlQUFPLElBQUksS0FBSixDQUFVLGtCQUFWLENBQVA7QUFDRCxPQUpEO0FBS0QsS0F6R00sQ0FBUDtBQTBHRCxHQW5SSDs7QUFBQSxzQkFxUkUsWUFyUkYseUJBcVJnQixJQXJSaEIsRUFxUnNCLE9BclJ0QixFQXFSK0IsS0FyUi9CLEVBcVJzQztBQUFBOztBQUNsQyxRQUFNLE9BQU8sS0FBSyxVQUFMLENBQWdCLElBQWhCLENBQWI7QUFDQSxXQUFPLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBcUI7QUFDdEMsVUFBTSxTQUFTLEVBQWY7QUFDQSxVQUFNLGFBQWEsTUFBTSxPQUFOLENBQWMsS0FBSyxVQUFuQixJQUNmLEtBQUs7QUFDUDtBQUZpQixRQUdmLE9BQU8sSUFBUCxDQUFZLEtBQUssSUFBakIsQ0FISjs7QUFLQSxpQkFBVyxPQUFYLENBQW1CLFVBQUMsSUFBRCxFQUFVO0FBQzNCLGVBQU8sSUFBUCxJQUFlLEtBQUssSUFBTCxDQUFVLElBQVYsQ0FBZjtBQUNELE9BRkQ7O0FBSUEsVUFBTSxTQUFTLEtBQUssTUFBTCxDQUFZLGVBQVosQ0FBNEIsUUFBNUIsR0FBdUMsUUFBdkMsR0FBa0QsYUFBakU7QUFDQSxVQUFNLFNBQVMsSUFBSSxNQUFKLENBQVcsT0FBSyxJQUFoQixFQUFzQixLQUFLLE1BQUwsQ0FBWSxlQUFsQyxDQUFmO0FBQ0EsYUFBTyxJQUFQLENBQ0UsS0FBSyxNQUFMLENBQVksR0FEZCxFQUVFLFNBQWMsRUFBZCxFQUFrQixLQUFLLE1BQUwsQ0FBWSxJQUE5QixFQUFvQztBQUNsQyxrQkFBVSxLQUFLLFFBRG1CO0FBRWxDLGNBQU0sS0FBSyxJQUFMLENBQVUsSUFGa0I7QUFHbEMsbUJBQVcsS0FBSyxTQUhrQjtBQUlsQyxrQkFBVSxNQUp3QjtBQUtsQyxpQkFBUyxLQUFLO0FBTG9CLE9BQXBDLENBRkYsRUFVQyxJQVZELENBVU0sVUFBQyxHQUFELEVBQVM7QUFDYixZQUFNLFFBQVEsSUFBSSxLQUFsQjtBQUNBLFlBQU0sT0FBTyxjQUFjLEtBQUssTUFBTCxDQUFZLFNBQTFCLENBQWI7QUFDQSxZQUFNLFNBQVMsSUFBSSxNQUFKLENBQVcsRUFBRSxRQUFXLElBQVgsYUFBdUIsS0FBekIsRUFBWCxDQUFmOztBQUVBLGVBQU8sRUFBUCxDQUFVLFVBQVYsRUFBc0IsVUFBQyxZQUFEO0FBQUEsaUJBQWtCLG1CQUFtQixNQUFuQixFQUF5QixZQUF6QixFQUF1QyxJQUF2QyxDQUFsQjtBQUFBLFNBQXRCOztBQUVBLGVBQU8sRUFBUCxDQUFVLFNBQVYsRUFBcUIsVUFBQyxJQUFELEVBQVU7QUFDN0IsY0FBTSxPQUFPLEtBQUssZUFBTCxDQUFxQixLQUFLLFFBQUwsQ0FBYyxZQUFuQyxFQUFpRCxLQUFLLFFBQXRELENBQWI7QUFDQSxjQUFNLFlBQVksS0FBSyxLQUFLLG9CQUFWLENBQWxCOztBQUVBLGNBQU0sYUFBYTtBQUNqQixvQkFBUSxLQUFLLFFBQUwsQ0FBYyxNQURMO0FBRWpCLHNCQUZpQjtBQUdqQjtBQUhpQixXQUFuQjs7QUFNQSxpQkFBSyxJQUFMLENBQVUsSUFBVixDQUFlLGdCQUFmLEVBQWlDLElBQWpDLEVBQXVDLFVBQXZDO0FBQ0EsaUJBQU8sS0FBUDtBQUNBLGlCQUFPLFNBQVA7QUFDRCxTQWJEOztBQWVBLGVBQU8sRUFBUCxDQUFVLE9BQVYsRUFBbUIsVUFBQyxPQUFELEVBQWE7QUFDOUIsY0FBTSxPQUFPLFFBQVEsUUFBckI7QUFDQSxjQUFNLFFBQVEsT0FDVixLQUFLLGdCQUFMLENBQXNCLEtBQUssWUFBM0IsRUFBeUMsSUFBekMsQ0FEVSxHQUVWLFNBQWMsSUFBSSxLQUFKLENBQVUsUUFBUSxLQUFSLENBQWMsT0FBeEIsQ0FBZCxFQUFnRCxFQUFFLE9BQU8sUUFBUSxLQUFqQixFQUFoRCxDQUZKO0FBR0EsaUJBQUssSUFBTCxDQUFVLElBQVYsQ0FBZSxjQUFmLEVBQStCLElBQS9CLEVBQXFDLEtBQXJDO0FBQ0EsaUJBQU8sS0FBUDtBQUNELFNBUEQ7QUFRRCxPQXhDRDtBQXlDRCxLQXRETSxDQUFQO0FBdURELEdBOVVIOztBQUFBLHNCQWdWRSxZQWhWRix5QkFnVmdCLEtBaFZoQixFQWdWdUI7QUFBQTs7QUFDbkIsV0FBTyxJQUFJLE9BQUosQ0FBWSxVQUFDLE9BQUQsRUFBVSxNQUFWLEVBQXFCO0FBQ3RDLFVBQU0sV0FBVyxPQUFLLElBQUwsQ0FBVSxRQUEzQjtBQUNBLFVBQU0sU0FBUyxPQUFLLElBQUwsQ0FBVSxNQUF6Qjs7QUFFQSxVQUFNLFdBQVcsSUFBSSxRQUFKLEVBQWpCO0FBQ0EsWUFBTSxPQUFOLENBQWMsVUFBQyxJQUFELEVBQU8sQ0FBUCxFQUFhO0FBQ3pCLFlBQU0sT0FBTyxPQUFLLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBYjtBQUNBLGlCQUFTLE1BQVQsQ0FBZ0IsS0FBSyxTQUFyQixFQUFnQyxLQUFLLElBQXJDO0FBQ0QsT0FIRDs7QUFLQSxVQUFNLE1BQU0sSUFBSSxjQUFKLEVBQVo7O0FBRUEsVUFBTSxRQUFRLE9BQUsscUJBQUwsQ0FBMkIsT0FBSyxJQUFMLENBQVUsT0FBckMsRUFBOEMsVUFBQyxLQUFELEVBQVc7QUFDckUsWUFBSSxLQUFKO0FBQ0Esa0JBQVUsS0FBVjtBQUNBLGVBQU8sS0FBUDtBQUNELE9BSmEsQ0FBZDs7QUFNQSxVQUFNLFlBQVksU0FBWixTQUFZLENBQUMsS0FBRCxFQUFXO0FBQzNCLGNBQU0sT0FBTixDQUFjLFVBQUMsSUFBRCxFQUFVO0FBQ3RCLGlCQUFLLElBQUwsQ0FBVSxJQUFWLENBQWUsY0FBZixFQUErQixJQUEvQixFQUFxQyxLQUFyQztBQUNELFNBRkQ7QUFHRCxPQUpEOztBQU1BLFVBQUksTUFBSixDQUFXLGdCQUFYLENBQTRCLFdBQTVCLEVBQXlDLFVBQUMsRUFBRCxFQUFRO0FBQy9DLGVBQUssSUFBTCxDQUFVLEdBQVYsQ0FBYyxzQ0FBZDtBQUNBLGNBQU0sUUFBTjtBQUNELE9BSEQ7O0FBS0EsVUFBSSxNQUFKLENBQVcsZ0JBQVgsQ0FBNEIsVUFBNUIsRUFBd0MsVUFBQyxFQUFELEVBQVE7QUFDOUMsY0FBTSxRQUFOOztBQUVBLFlBQUksQ0FBQyxHQUFHLGdCQUFSLEVBQTBCOztBQUUxQixjQUFNLE9BQU4sQ0FBYyxVQUFDLElBQUQsRUFBVTtBQUN0QixpQkFBSyxJQUFMLENBQVUsSUFBVixDQUFlLGlCQUFmLEVBQWtDLElBQWxDLEVBQXdDO0FBQ3RDLHNCQUFVLE1BRDRCO0FBRXRDLDJCQUFlLEdBQUcsTUFBSCxHQUFZLEdBQUcsS0FBZixHQUF1QixLQUFLLElBRkw7QUFHdEMsd0JBQVksS0FBSztBQUhxQixXQUF4QztBQUtELFNBTkQ7QUFPRCxPQVpEOztBQWNBLFVBQUksZ0JBQUosQ0FBcUIsTUFBckIsRUFBNkIsVUFBQyxFQUFELEVBQVE7QUFDbkMsY0FBTSxJQUFOOztBQUVBLFlBQUksR0FBRyxNQUFILENBQVUsTUFBVixJQUFvQixHQUFwQixJQUEyQixHQUFHLE1BQUgsQ0FBVSxNQUFWLEdBQW1CLEdBQWxELEVBQXVEO0FBQ3JELGNBQU0sT0FBTyxPQUFLLElBQUwsQ0FBVSxlQUFWLENBQTBCLElBQUksWUFBOUIsRUFBNEMsR0FBNUMsQ0FBYjtBQUNBLGNBQU0sYUFBYTtBQUNqQixvQkFBUSxHQUFHLE1BQUgsQ0FBVSxNQUREO0FBRWpCO0FBRmlCLFdBQW5CO0FBSUEsZ0JBQU0sT0FBTixDQUFjLFVBQUMsSUFBRCxFQUFVO0FBQ3RCLG1CQUFLLElBQUwsQ0FBVSxJQUFWLENBQWUsZ0JBQWYsRUFBaUMsSUFBakMsRUFBdUMsVUFBdkM7QUFDRCxXQUZEO0FBR0EsaUJBQU8sU0FBUDtBQUNEOztBQUVELFlBQU0sUUFBUSxPQUFLLElBQUwsQ0FBVSxnQkFBVixDQUEyQixJQUFJLFlBQS9CLEVBQTZDLEdBQTdDLEtBQXFELElBQUksS0FBSixDQUFVLGNBQVYsQ0FBbkU7QUFDQSxjQUFNLE9BQU4sR0FBZ0IsR0FBaEI7QUFDQSxrQkFBVSxLQUFWO0FBQ0EsZUFBTyxPQUFPLEtBQVAsQ0FBUDtBQUNELE9BbkJEOztBQXFCQSxVQUFJLGdCQUFKLENBQXFCLE9BQXJCLEVBQThCLFVBQUMsRUFBRCxFQUFRO0FBQ3BDLGNBQU0sSUFBTjs7QUFFQSxZQUFNLFFBQVEsT0FBSyxJQUFMLENBQVUsZ0JBQVYsQ0FBMkIsSUFBSSxZQUEvQixFQUE2QyxHQUE3QyxLQUFxRCxJQUFJLEtBQUosQ0FBVSxjQUFWLENBQW5FO0FBQ0Esa0JBQVUsS0FBVjtBQUNBLGVBQU8sT0FBTyxLQUFQLENBQVA7QUFDRCxPQU5EOztBQVFBLGFBQUssSUFBTCxDQUFVLEVBQVYsQ0FBYSxZQUFiLEVBQTJCLFlBQU07QUFDL0IsY0FBTSxJQUFOO0FBQ0EsWUFBSSxLQUFKO0FBQ0QsT0FIRDs7QUFLQSxVQUFJLElBQUosQ0FBUyxPQUFPLFdBQVAsRUFBVCxFQUErQixRQUEvQixFQUF5QyxJQUF6QztBQUNBO0FBQ0E7QUFDQSxVQUFJLGVBQUosR0FBc0IsT0FBSyxJQUFMLENBQVUsZUFBaEM7QUFDQSxVQUFJLE9BQUssSUFBTCxDQUFVLFlBQVYsS0FBMkIsRUFBL0IsRUFBbUM7QUFDakMsWUFBSSxZQUFKLEdBQW1CLE9BQUssSUFBTCxDQUFVLFlBQTdCO0FBQ0Q7O0FBRUQsYUFBTyxJQUFQLENBQVksT0FBSyxJQUFMLENBQVUsT0FBdEIsRUFBK0IsT0FBL0IsQ0FBdUMsVUFBQyxNQUFELEVBQVk7QUFDakQsWUFBSSxnQkFBSixDQUFxQixNQUFyQixFQUE2QixPQUFLLElBQUwsQ0FBVSxPQUFWLENBQWtCLE1BQWxCLENBQTdCO0FBQ0QsT0FGRDs7QUFJQSxVQUFJLElBQUosQ0FBUyxRQUFUOztBQUVBLFlBQU0sT0FBTixDQUFjLFVBQUMsSUFBRCxFQUFVO0FBQ3RCLGVBQUssSUFBTCxDQUFVLElBQVYsQ0FBZSxnQkFBZixFQUFpQyxJQUFqQztBQUNELE9BRkQ7QUFHRCxLQTlGTSxDQUFQO0FBK0ZELEdBaGJIOztBQUFBLHNCQWtiRSxXQWxiRix3QkFrYmUsS0FsYmYsRUFrYnNCO0FBQUE7O0FBQ2xCLFFBQU0sVUFBVSxNQUFNLEdBQU4sQ0FBVSxVQUFDLElBQUQsRUFBTyxDQUFQLEVBQWE7QUFDckMsVUFBTSxVQUFVLFNBQVMsQ0FBVCxFQUFZLEVBQVosSUFBa0IsQ0FBbEM7QUFDQSxVQUFNLFFBQVEsTUFBTSxNQUFwQjs7QUFFQSxVQUFJLEtBQUssS0FBVCxFQUFnQjtBQUNkLGVBQU87QUFBQSxpQkFBTSxRQUFRLE1BQVIsQ0FBZSxJQUFJLEtBQUosQ0FBVSxLQUFLLEtBQWYsQ0FBZixDQUFOO0FBQUEsU0FBUDtBQUNELE9BRkQsTUFFTyxJQUFJLEtBQUssUUFBVCxFQUFtQjtBQUN4QjtBQUNBO0FBQ0EsZUFBSyxJQUFMLENBQVUsSUFBVixDQUFlLGdCQUFmLEVBQWlDLElBQWpDO0FBQ0EsZUFBTyxPQUFLLFlBQUwsQ0FBa0IsSUFBbEIsQ0FBdUIsTUFBdkIsRUFBNkIsSUFBN0IsRUFBbUMsT0FBbkMsRUFBNEMsS0FBNUMsQ0FBUDtBQUNELE9BTE0sTUFLQTtBQUNMLGVBQUssSUFBTCxDQUFVLElBQVYsQ0FBZSxnQkFBZixFQUFpQyxJQUFqQztBQUNBLGVBQU8sT0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixNQUFqQixFQUF1QixJQUF2QixFQUE2QixPQUE3QixFQUFzQyxLQUF0QyxDQUFQO0FBQ0Q7QUFDRixLQWZlLENBQWhCOztBQWlCQSxRQUFNLFdBQVcsUUFBUSxHQUFSLENBQVksVUFBQyxNQUFELEVBQVk7QUFDdkMsVUFBTSxnQkFBZ0IsT0FBSyxZQUFMLENBQWtCLE1BQWxCLENBQXRCO0FBQ0EsYUFBTyxlQUFQO0FBQ0QsS0FIZ0IsQ0FBakI7O0FBS0EsV0FBTyxPQUFPLFFBQVAsQ0FBUDtBQUNELEdBMWNIOztBQUFBLHNCQTRjRSxZQTVjRix5QkE0Y2dCLE9BNWNoQixFQTRjeUI7QUFBQTs7QUFDckIsUUFBSSxRQUFRLE1BQVIsS0FBbUIsQ0FBdkIsRUFBMEI7QUFDeEIsV0FBSyxJQUFMLENBQVUsR0FBVixDQUFjLGlDQUFkO0FBQ0EsYUFBTyxRQUFRLE9BQVIsRUFBUDtBQUNEOztBQUVELFNBQUssSUFBTCxDQUFVLEdBQVYsQ0FBYywwQkFBZDtBQUNBLFFBQU0sUUFBUSxRQUFRLEdBQVIsQ0FBWSxVQUFDLE1BQUQ7QUFBQSxhQUFZLE9BQUssSUFBTCxDQUFVLE9BQVYsQ0FBa0IsTUFBbEIsQ0FBWjtBQUFBLEtBQVosQ0FBZDs7QUFFQSxRQUFJLEtBQUssSUFBTCxDQUFVLE1BQWQsRUFBc0I7QUFDcEIsYUFBTyxLQUFLLFlBQUwsQ0FBa0IsS0FBbEIsQ0FBUDtBQUNEOztBQUVELFdBQU8sS0FBSyxXQUFMLENBQWlCLEtBQWpCLEVBQXdCLElBQXhCLENBQTZCO0FBQUEsYUFBTSxJQUFOO0FBQUEsS0FBN0IsQ0FBUDtBQUNELEdBMWRIOztBQUFBLHNCQTRkRSxPQTVkRixzQkE0ZGE7QUFDVCxRQUFJLEtBQUssSUFBTCxDQUFVLE1BQWQsRUFBc0I7QUFDcEIsV0FBSyxJQUFMLENBQVUsUUFBVixDQUFtQjtBQUNqQixzQkFBYyxTQUFjLEVBQWQsRUFBa0IsS0FBSyxJQUFMLENBQVUsUUFBVixHQUFxQixZQUF2QyxFQUFxRDtBQUNqRSxtQkFBUztBQUR3RCxTQUFyRDtBQURHLE9BQW5CO0FBS0Q7O0FBRUQsU0FBSyxJQUFMLENBQVUsV0FBVixDQUFzQixLQUFLLFlBQTNCO0FBQ0QsR0F0ZUg7O0FBQUEsc0JBd2VFLFNBeGVGLHdCQXdlZTtBQUNYLFFBQUksS0FBSyxJQUFMLENBQVUsTUFBZCxFQUFzQjtBQUNwQixXQUFLLElBQUwsQ0FBVSxRQUFWLENBQW1CO0FBQ2pCLHNCQUFjLFNBQWMsRUFBZCxFQUFrQixLQUFLLElBQUwsQ0FBVSxRQUFWLEdBQXFCLFlBQXZDLEVBQXFEO0FBQ2pFLG1CQUFTO0FBRHdELFNBQXJEO0FBREcsT0FBbkI7QUFLRDs7QUFFRCxTQUFLLElBQUwsQ0FBVSxjQUFWLENBQXlCLEtBQUssWUFBOUI7QUFDRCxHQWxmSDs7QUFBQTtBQUFBLEVBQXlDLE1BQXpDOzs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TEEsUUFBUSxrQkFBUjtBQUNBLFFBQVEsY0FBUjtBQUNBLElBQU0sT0FBTyxRQUFRLFlBQVIsQ0FBYjtBQUNBLElBQU0sWUFBWSxRQUFRLGtCQUFSLENBQWxCO0FBQ0EsSUFBTSxZQUFZLFFBQVEsa0JBQVIsQ0FBbEI7QUFDQSxJQUFNLGNBQWMsUUFBUSxvQkFBUixDQUFwQjs7QUFFQSxJQUFNLE9BQU8sSUFBSSxJQUFKLENBQVMsRUFBRSxPQUFPLElBQVQsRUFBZSxhQUFhLElBQTVCLEVBQVQsQ0FBYjtBQUNBLEtBQUssR0FBTCxDQUFTLFNBQVQsRUFBb0IsRUFBRSxRQUFRLFdBQVYsRUFBdUIsc0JBQXNCLElBQTdDLEVBQXBCO0FBQ0EsS0FBSyxHQUFMLENBQVMsU0FBVCxFQUFvQjtBQUNsQixZQUFVLHdCQURRO0FBRWxCLFlBQVUsSUFGUTtBQUdsQixhQUFXO0FBSE8sQ0FBcEI7QUFLQSxLQUFLLEdBQUwsQ0FBUyxXQUFULEVBQXNCO0FBQ3BCLFVBQVEsTUFEWTtBQUVwQixTQUFPLElBRmE7QUFHcEIsbUJBQWlCO0FBSEcsQ0FBdEI7O0FBTUEsUUFBUSxHQUFSLENBQVksMkNBQVoiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKipcbiAqIGN1aWQuanNcbiAqIENvbGxpc2lvbi1yZXNpc3RhbnQgVUlEIGdlbmVyYXRvciBmb3IgYnJvd3NlcnMgYW5kIG5vZGUuXG4gKiBTZXF1ZW50aWFsIGZvciBmYXN0IGRiIGxvb2t1cHMgYW5kIHJlY2VuY3kgc29ydGluZy5cbiAqIFNhZmUgZm9yIGVsZW1lbnQgSURzIGFuZCBzZXJ2ZXItc2lkZSBsb29rdXBzLlxuICpcbiAqIEV4dHJhY3RlZCBmcm9tIENMQ1RSXG4gKlxuICogQ29weXJpZ2h0IChjKSBFcmljIEVsbGlvdHQgMjAxMlxuICogTUlUIExpY2Vuc2VcbiAqL1xuXG52YXIgZmluZ2VycHJpbnQgPSByZXF1aXJlKCcuL2xpYi9maW5nZXJwcmludC5qcycpO1xudmFyIHBhZCA9IHJlcXVpcmUoJy4vbGliL3BhZC5qcycpO1xudmFyIGdldFJhbmRvbVZhbHVlID0gcmVxdWlyZSgnLi9saWIvZ2V0UmFuZG9tVmFsdWUuanMnKTtcblxudmFyIGMgPSAwLFxuICBibG9ja1NpemUgPSA0LFxuICBiYXNlID0gMzYsXG4gIGRpc2NyZXRlVmFsdWVzID0gTWF0aC5wb3coYmFzZSwgYmxvY2tTaXplKTtcblxuZnVuY3Rpb24gcmFuZG9tQmxvY2sgKCkge1xuICByZXR1cm4gcGFkKChnZXRSYW5kb21WYWx1ZSgpICpcbiAgICBkaXNjcmV0ZVZhbHVlcyA8PCAwKVxuICAgIC50b1N0cmluZyhiYXNlKSwgYmxvY2tTaXplKTtcbn1cblxuZnVuY3Rpb24gc2FmZUNvdW50ZXIgKCkge1xuICBjID0gYyA8IGRpc2NyZXRlVmFsdWVzID8gYyA6IDA7XG4gIGMrKzsgLy8gdGhpcyBpcyBub3Qgc3VibGltaW5hbFxuICByZXR1cm4gYyAtIDE7XG59XG5cbmZ1bmN0aW9uIGN1aWQgKCkge1xuICAvLyBTdGFydGluZyB3aXRoIGEgbG93ZXJjYXNlIGxldHRlciBtYWtlc1xuICAvLyBpdCBIVE1MIGVsZW1lbnQgSUQgZnJpZW5kbHkuXG4gIHZhciBsZXR0ZXIgPSAnYycsIC8vIGhhcmQtY29kZWQgYWxsb3dzIGZvciBzZXF1ZW50aWFsIGFjY2Vzc1xuXG4gICAgLy8gdGltZXN0YW1wXG4gICAgLy8gd2FybmluZzogdGhpcyBleHBvc2VzIHRoZSBleGFjdCBkYXRlIGFuZCB0aW1lXG4gICAgLy8gdGhhdCB0aGUgdWlkIHdhcyBjcmVhdGVkLlxuICAgIHRpbWVzdGFtcCA9IChuZXcgRGF0ZSgpLmdldFRpbWUoKSkudG9TdHJpbmcoYmFzZSksXG5cbiAgICAvLyBQcmV2ZW50IHNhbWUtbWFjaGluZSBjb2xsaXNpb25zLlxuICAgIGNvdW50ZXIgPSBwYWQoc2FmZUNvdW50ZXIoKS50b1N0cmluZyhiYXNlKSwgYmxvY2tTaXplKSxcblxuICAgIC8vIEEgZmV3IGNoYXJzIHRvIGdlbmVyYXRlIGRpc3RpbmN0IGlkcyBmb3IgZGlmZmVyZW50XG4gICAgLy8gY2xpZW50cyAoc28gZGlmZmVyZW50IGNvbXB1dGVycyBhcmUgZmFyIGxlc3NcbiAgICAvLyBsaWtlbHkgdG8gZ2VuZXJhdGUgdGhlIHNhbWUgaWQpXG4gICAgcHJpbnQgPSBmaW5nZXJwcmludCgpLFxuXG4gICAgLy8gR3JhYiBzb21lIG1vcmUgY2hhcnMgZnJvbSBNYXRoLnJhbmRvbSgpXG4gICAgcmFuZG9tID0gcmFuZG9tQmxvY2soKSArIHJhbmRvbUJsb2NrKCk7XG5cbiAgcmV0dXJuIGxldHRlciArIHRpbWVzdGFtcCArIGNvdW50ZXIgKyBwcmludCArIHJhbmRvbTtcbn1cblxuY3VpZC5zbHVnID0gZnVuY3Rpb24gc2x1ZyAoKSB7XG4gIHZhciBkYXRlID0gbmV3IERhdGUoKS5nZXRUaW1lKCkudG9TdHJpbmcoMzYpLFxuICAgIGNvdW50ZXIgPSBzYWZlQ291bnRlcigpLnRvU3RyaW5nKDM2KS5zbGljZSgtNCksXG4gICAgcHJpbnQgPSBmaW5nZXJwcmludCgpLnNsaWNlKDAsIDEpICtcbiAgICAgIGZpbmdlcnByaW50KCkuc2xpY2UoLTEpLFxuICAgIHJhbmRvbSA9IHJhbmRvbUJsb2NrKCkuc2xpY2UoLTIpO1xuXG4gIHJldHVybiBkYXRlLnNsaWNlKC0yKSArXG4gICAgY291bnRlciArIHByaW50ICsgcmFuZG9tO1xufTtcblxuY3VpZC5pc0N1aWQgPSBmdW5jdGlvbiBpc0N1aWQgKHN0cmluZ1RvQ2hlY2spIHtcbiAgaWYgKHR5cGVvZiBzdHJpbmdUb0NoZWNrICE9PSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xuICBpZiAoc3RyaW5nVG9DaGVjay5zdGFydHNXaXRoKCdjJykpIHJldHVybiB0cnVlO1xuICByZXR1cm4gZmFsc2U7XG59O1xuXG5jdWlkLmlzU2x1ZyA9IGZ1bmN0aW9uIGlzU2x1ZyAoc3RyaW5nVG9DaGVjaykge1xuICBpZiAodHlwZW9mIHN0cmluZ1RvQ2hlY2sgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG4gIHZhciBzdHJpbmdMZW5ndGggPSBzdHJpbmdUb0NoZWNrLmxlbmd0aDtcbiAgaWYgKHN0cmluZ0xlbmd0aCA+PSA3ICYmIHN0cmluZ0xlbmd0aCA8PSAxMCkgcmV0dXJuIHRydWU7XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbmN1aWQuZmluZ2VycHJpbnQgPSBmaW5nZXJwcmludDtcblxubW9kdWxlLmV4cG9ydHMgPSBjdWlkO1xuIiwidmFyIHBhZCA9IHJlcXVpcmUoJy4vcGFkLmpzJyk7XG5cbnZhciBlbnYgPSB0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JyA/IHdpbmRvdyA6IHNlbGY7XG52YXIgZ2xvYmFsQ291bnQgPSBPYmplY3Qua2V5cyhlbnYpLmxlbmd0aDtcbnZhciBtaW1lVHlwZXNMZW5ndGggPSBuYXZpZ2F0b3IubWltZVR5cGVzID8gbmF2aWdhdG9yLm1pbWVUeXBlcy5sZW5ndGggOiAwO1xudmFyIGNsaWVudElkID0gcGFkKChtaW1lVHlwZXNMZW5ndGggK1xuICBuYXZpZ2F0b3IudXNlckFnZW50Lmxlbmd0aCkudG9TdHJpbmcoMzYpICtcbiAgZ2xvYmFsQ291bnQudG9TdHJpbmcoMzYpLCA0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBmaW5nZXJwcmludCAoKSB7XG4gIHJldHVybiBjbGllbnRJZDtcbn07XG4iLCJcbnZhciBnZXRSYW5kb21WYWx1ZTtcblxudmFyIGNyeXB0byA9IHdpbmRvdy5jcnlwdG8gfHwgd2luZG93Lm1zQ3J5cHRvO1xuXG5pZiAoY3J5cHRvKSB7XG4gICAgdmFyIGxpbSA9IE1hdGgucG93KDIsIDMyKSAtIDE7XG4gICAgZ2V0UmFuZG9tVmFsdWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmFicyhjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50MzJBcnJheSgxKSlbMF0gLyBsaW0pO1xuICAgIH07XG59IGVsc2Uge1xuICAgIGdldFJhbmRvbVZhbHVlID0gTWF0aC5yYW5kb207XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0UmFuZG9tVmFsdWU7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBhZCAobnVtLCBzaXplKSB7XG4gIHZhciBzID0gJzAwMDAwMDAwMCcgKyBudW07XG4gIHJldHVybiBzLnN1YnN0cihzLmxlbmd0aCAtIHNpemUpO1xufTtcbiIsIi8vIFRoaXMgZmlsZSBjYW4gYmUgcmVxdWlyZWQgaW4gQnJvd3NlcmlmeSBhbmQgTm9kZS5qcyBmb3IgYXV0b21hdGljIHBvbHlmaWxsXG4vLyBUbyB1c2UgaXQ6ICByZXF1aXJlKCdlczYtcHJvbWlzZS9hdXRvJyk7XG4ndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vJykucG9seWZpbGwoKTtcbiIsIi8qIVxuICogQG92ZXJ2aWV3IGVzNi1wcm9taXNlIC0gYSB0aW55IGltcGxlbWVudGF0aW9uIG9mIFByb21pc2VzL0ErLlxuICogQGNvcHlyaWdodCBDb3B5cmlnaHQgKGMpIDIwMTQgWWVodWRhIEthdHosIFRvbSBEYWxlLCBTdGVmYW4gUGVubmVyIGFuZCBjb250cmlidXRvcnMgKENvbnZlcnNpb24gdG8gRVM2IEFQSSBieSBKYWtlIEFyY2hpYmFsZClcbiAqIEBsaWNlbnNlICAgTGljZW5zZWQgdW5kZXIgTUlUIGxpY2Vuc2VcbiAqICAgICAgICAgICAgU2VlIGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9zdGVmYW5wZW5uZXIvZXM2LXByb21pc2UvbWFzdGVyL0xJQ0VOU0VcbiAqIEB2ZXJzaW9uICAgdjQuMi41KzdmMmI1MjZkXG4gKi9cblxuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcblx0dHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCkgOlxuXHR0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoZmFjdG9yeSkgOlxuXHQoZ2xvYmFsLkVTNlByb21pc2UgPSBmYWN0b3J5KCkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKCkgeyAndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIG9iamVjdE9yRnVuY3Rpb24oeCkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB4O1xuICByZXR1cm4geCAhPT0gbnVsbCAmJiAodHlwZSA9PT0gJ29iamVjdCcgfHwgdHlwZSA9PT0gJ2Z1bmN0aW9uJyk7XG59XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oeCkge1xuICByZXR1cm4gdHlwZW9mIHggPT09ICdmdW5jdGlvbic7XG59XG5cblxuXG52YXIgX2lzQXJyYXkgPSB2b2lkIDA7XG5pZiAoQXJyYXkuaXNBcnJheSkge1xuICBfaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG59IGVsc2Uge1xuICBfaXNBcnJheSA9IGZ1bmN0aW9uICh4KSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4KSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgfTtcbn1cblxudmFyIGlzQXJyYXkgPSBfaXNBcnJheTtcblxudmFyIGxlbiA9IDA7XG52YXIgdmVydHhOZXh0ID0gdm9pZCAwO1xudmFyIGN1c3RvbVNjaGVkdWxlckZuID0gdm9pZCAwO1xuXG52YXIgYXNhcCA9IGZ1bmN0aW9uIGFzYXAoY2FsbGJhY2ssIGFyZykge1xuICBxdWV1ZVtsZW5dID0gY2FsbGJhY2s7XG4gIHF1ZXVlW2xlbiArIDFdID0gYXJnO1xuICBsZW4gKz0gMjtcbiAgaWYgKGxlbiA9PT0gMikge1xuICAgIC8vIElmIGxlbiBpcyAyLCB0aGF0IG1lYW5zIHRoYXQgd2UgbmVlZCB0byBzY2hlZHVsZSBhbiBhc3luYyBmbHVzaC5cbiAgICAvLyBJZiBhZGRpdGlvbmFsIGNhbGxiYWNrcyBhcmUgcXVldWVkIGJlZm9yZSB0aGUgcXVldWUgaXMgZmx1c2hlZCwgdGhleVxuICAgIC8vIHdpbGwgYmUgcHJvY2Vzc2VkIGJ5IHRoaXMgZmx1c2ggdGhhdCB3ZSBhcmUgc2NoZWR1bGluZy5cbiAgICBpZiAoY3VzdG9tU2NoZWR1bGVyRm4pIHtcbiAgICAgIGN1c3RvbVNjaGVkdWxlckZuKGZsdXNoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2NoZWR1bGVGbHVzaCgpO1xuICAgIH1cbiAgfVxufTtcblxuZnVuY3Rpb24gc2V0U2NoZWR1bGVyKHNjaGVkdWxlRm4pIHtcbiAgY3VzdG9tU2NoZWR1bGVyRm4gPSBzY2hlZHVsZUZuO1xufVxuXG5mdW5jdGlvbiBzZXRBc2FwKGFzYXBGbikge1xuICBhc2FwID0gYXNhcEZuO1xufVxuXG52YXIgYnJvd3NlcldpbmRvdyA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogdW5kZWZpbmVkO1xudmFyIGJyb3dzZXJHbG9iYWwgPSBicm93c2VyV2luZG93IHx8IHt9O1xudmFyIEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyID0gYnJvd3Nlckdsb2JhbC5NdXRhdGlvbk9ic2VydmVyIHx8IGJyb3dzZXJHbG9iYWwuV2ViS2l0TXV0YXRpb25PYnNlcnZlcjtcbnZhciBpc05vZGUgPSB0eXBlb2Ygc2VsZiA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHt9LnRvU3RyaW5nLmNhbGwocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJztcblxuLy8gdGVzdCBmb3Igd2ViIHdvcmtlciBidXQgbm90IGluIElFMTBcbnZhciBpc1dvcmtlciA9IHR5cGVvZiBVaW50OENsYW1wZWRBcnJheSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGltcG9ydFNjcmlwdHMgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCAhPT0gJ3VuZGVmaW5lZCc7XG5cbi8vIG5vZGVcbmZ1bmN0aW9uIHVzZU5leHRUaWNrKCkge1xuICAvLyBub2RlIHZlcnNpb24gMC4xMC54IGRpc3BsYXlzIGEgZGVwcmVjYXRpb24gd2FybmluZyB3aGVuIG5leHRUaWNrIGlzIHVzZWQgcmVjdXJzaXZlbHlcbiAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9jdWpvanMvd2hlbi9pc3N1ZXMvNDEwIGZvciBkZXRhaWxzXG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHByb2Nlc3MubmV4dFRpY2soZmx1c2gpO1xuICB9O1xufVxuXG4vLyB2ZXJ0eFxuZnVuY3Rpb24gdXNlVmVydHhUaW1lcigpIHtcbiAgaWYgKHR5cGVvZiB2ZXJ0eE5leHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZlcnR4TmV4dChmbHVzaCk7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiB1c2VTZXRUaW1lb3V0KCk7XG59XG5cbmZ1bmN0aW9uIHVzZU11dGF0aW9uT2JzZXJ2ZXIoKSB7XG4gIHZhciBpdGVyYXRpb25zID0gMDtcbiAgdmFyIG9ic2VydmVyID0gbmV3IEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyKGZsdXNoKTtcbiAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG4gIG9ic2VydmVyLm9ic2VydmUobm9kZSwgeyBjaGFyYWN0ZXJEYXRhOiB0cnVlIH0pO1xuXG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgbm9kZS5kYXRhID0gaXRlcmF0aW9ucyA9ICsraXRlcmF0aW9ucyAlIDI7XG4gIH07XG59XG5cbi8vIHdlYiB3b3JrZXJcbmZ1bmN0aW9uIHVzZU1lc3NhZ2VDaGFubmVsKCkge1xuICB2YXIgY2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbCgpO1xuICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGZsdXNoO1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBjaGFubmVsLnBvcnQyLnBvc3RNZXNzYWdlKDApO1xuICB9O1xufVxuXG5mdW5jdGlvbiB1c2VTZXRUaW1lb3V0KCkge1xuICAvLyBTdG9yZSBzZXRUaW1lb3V0IHJlZmVyZW5jZSBzbyBlczYtcHJvbWlzZSB3aWxsIGJlIHVuYWZmZWN0ZWQgYnlcbiAgLy8gb3RoZXIgY29kZSBtb2RpZnlpbmcgc2V0VGltZW91dCAobGlrZSBzaW5vbi51c2VGYWtlVGltZXJzKCkpXG4gIHZhciBnbG9iYWxTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZ2xvYmFsU2V0VGltZW91dChmbHVzaCwgMSk7XG4gIH07XG59XG5cbnZhciBxdWV1ZSA9IG5ldyBBcnJheSgxMDAwKTtcbmZ1bmN0aW9uIGZsdXNoKCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSArPSAyKSB7XG4gICAgdmFyIGNhbGxiYWNrID0gcXVldWVbaV07XG4gICAgdmFyIGFyZyA9IHF1ZXVlW2kgKyAxXTtcblxuICAgIGNhbGxiYWNrKGFyZyk7XG5cbiAgICBxdWV1ZVtpXSA9IHVuZGVmaW5lZDtcbiAgICBxdWV1ZVtpICsgMV0gPSB1bmRlZmluZWQ7XG4gIH1cblxuICBsZW4gPSAwO1xufVxuXG5mdW5jdGlvbiBhdHRlbXB0VmVydHgoKSB7XG4gIHRyeSB7XG4gICAgdmFyIHZlcnR4ID0gRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKS5yZXF1aXJlKCd2ZXJ0eCcpO1xuICAgIHZlcnR4TmV4dCA9IHZlcnR4LnJ1bk9uTG9vcCB8fCB2ZXJ0eC5ydW5PbkNvbnRleHQ7XG4gICAgcmV0dXJuIHVzZVZlcnR4VGltZXIoKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiB1c2VTZXRUaW1lb3V0KCk7XG4gIH1cbn1cblxudmFyIHNjaGVkdWxlRmx1c2ggPSB2b2lkIDA7XG4vLyBEZWNpZGUgd2hhdCBhc3luYyBtZXRob2QgdG8gdXNlIHRvIHRyaWdnZXJpbmcgcHJvY2Vzc2luZyBvZiBxdWV1ZWQgY2FsbGJhY2tzOlxuaWYgKGlzTm9kZSkge1xuICBzY2hlZHVsZUZsdXNoID0gdXNlTmV4dFRpY2soKTtcbn0gZWxzZSBpZiAoQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgc2NoZWR1bGVGbHVzaCA9IHVzZU11dGF0aW9uT2JzZXJ2ZXIoKTtcbn0gZWxzZSBpZiAoaXNXb3JrZXIpIHtcbiAgc2NoZWR1bGVGbHVzaCA9IHVzZU1lc3NhZ2VDaGFubmVsKCk7XG59IGVsc2UgaWYgKGJyb3dzZXJXaW5kb3cgPT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgcmVxdWlyZSA9PT0gJ2Z1bmN0aW9uJykge1xuICBzY2hlZHVsZUZsdXNoID0gYXR0ZW1wdFZlcnR4KCk7XG59IGVsc2Uge1xuICBzY2hlZHVsZUZsdXNoID0gdXNlU2V0VGltZW91dCgpO1xufVxuXG5mdW5jdGlvbiB0aGVuKG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uKSB7XG4gIHZhciBwYXJlbnQgPSB0aGlzO1xuXG4gIHZhciBjaGlsZCA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKG5vb3ApO1xuXG4gIGlmIChjaGlsZFtQUk9NSVNFX0lEXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgbWFrZVByb21pc2UoY2hpbGQpO1xuICB9XG5cbiAgdmFyIF9zdGF0ZSA9IHBhcmVudC5fc3RhdGU7XG5cblxuICBpZiAoX3N0YXRlKSB7XG4gICAgdmFyIGNhbGxiYWNrID0gYXJndW1lbnRzW19zdGF0ZSAtIDFdO1xuICAgIGFzYXAoZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGludm9rZUNhbGxiYWNrKF9zdGF0ZSwgY2hpbGQsIGNhbGxiYWNrLCBwYXJlbnQuX3Jlc3VsdCk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgc3Vic2NyaWJlKHBhcmVudCwgY2hpbGQsIG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uKTtcbiAgfVxuXG4gIHJldHVybiBjaGlsZDtcbn1cblxuLyoqXG4gIGBQcm9taXNlLnJlc29sdmVgIHJldHVybnMgYSBwcm9taXNlIHRoYXQgd2lsbCBiZWNvbWUgcmVzb2x2ZWQgd2l0aCB0aGVcbiAgcGFzc2VkIGB2YWx1ZWAuIEl0IGlzIHNob3J0aGFuZCBmb3IgdGhlIGZvbGxvd2luZzpcblxuICBgYGBqYXZhc2NyaXB0XG4gIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICByZXNvbHZlKDEpO1xuICB9KTtcblxuICBwcm9taXNlLnRoZW4oZnVuY3Rpb24odmFsdWUpe1xuICAgIC8vIHZhbHVlID09PSAxXG4gIH0pO1xuICBgYGBcblxuICBJbnN0ZWFkIG9mIHdyaXRpbmcgdGhlIGFib3ZlLCB5b3VyIGNvZGUgbm93IHNpbXBseSBiZWNvbWVzIHRoZSBmb2xsb3dpbmc6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBsZXQgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgxKTtcblxuICBwcm9taXNlLnRoZW4oZnVuY3Rpb24odmFsdWUpe1xuICAgIC8vIHZhbHVlID09PSAxXG4gIH0pO1xuICBgYGBcblxuICBAbWV0aG9kIHJlc29sdmVcbiAgQHN0YXRpY1xuICBAcGFyYW0ge0FueX0gdmFsdWUgdmFsdWUgdGhhdCB0aGUgcmV0dXJuZWQgcHJvbWlzZSB3aWxsIGJlIHJlc29sdmVkIHdpdGhcbiAgVXNlZnVsIGZvciB0b29saW5nLlxuICBAcmV0dXJuIHtQcm9taXNlfSBhIHByb21pc2UgdGhhdCB3aWxsIGJlY29tZSBmdWxmaWxsZWQgd2l0aCB0aGUgZ2l2ZW5cbiAgYHZhbHVlYFxuKi9cbmZ1bmN0aW9uIHJlc29sdmUkMShvYmplY3QpIHtcbiAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgdmFyIENvbnN0cnVjdG9yID0gdGhpcztcblxuICBpZiAob2JqZWN0ICYmIHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnICYmIG9iamVjdC5jb25zdHJ1Y3RvciA9PT0gQ29uc3RydWN0b3IpIHtcbiAgICByZXR1cm4gb2JqZWN0O1xuICB9XG5cbiAgdmFyIHByb21pc2UgPSBuZXcgQ29uc3RydWN0b3Iobm9vcCk7XG4gIHJlc29sdmUocHJvbWlzZSwgb2JqZWN0KTtcbiAgcmV0dXJuIHByb21pc2U7XG59XG5cbnZhciBQUk9NSVNFX0lEID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDIpO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxudmFyIFBFTkRJTkcgPSB2b2lkIDA7XG52YXIgRlVMRklMTEVEID0gMTtcbnZhciBSRUpFQ1RFRCA9IDI7XG5cbnZhciBUUllfQ0FUQ0hfRVJST1IgPSB7IGVycm9yOiBudWxsIH07XG5cbmZ1bmN0aW9uIHNlbGZGdWxmaWxsbWVudCgpIHtcbiAgcmV0dXJuIG5ldyBUeXBlRXJyb3IoXCJZb3UgY2Fubm90IHJlc29sdmUgYSBwcm9taXNlIHdpdGggaXRzZWxmXCIpO1xufVxuXG5mdW5jdGlvbiBjYW5ub3RSZXR1cm5Pd24oKSB7XG4gIHJldHVybiBuZXcgVHlwZUVycm9yKCdBIHByb21pc2VzIGNhbGxiYWNrIGNhbm5vdCByZXR1cm4gdGhhdCBzYW1lIHByb21pc2UuJyk7XG59XG5cbmZ1bmN0aW9uIGdldFRoZW4ocHJvbWlzZSkge1xuICB0cnkge1xuICAgIHJldHVybiBwcm9taXNlLnRoZW47XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgVFJZX0NBVENIX0VSUk9SLmVycm9yID0gZXJyb3I7XG4gICAgcmV0dXJuIFRSWV9DQVRDSF9FUlJPUjtcbiAgfVxufVxuXG5mdW5jdGlvbiB0cnlUaGVuKHRoZW4kJDEsIHZhbHVlLCBmdWxmaWxsbWVudEhhbmRsZXIsIHJlamVjdGlvbkhhbmRsZXIpIHtcbiAgdHJ5IHtcbiAgICB0aGVuJCQxLmNhbGwodmFsdWUsIGZ1bGZpbGxtZW50SGFuZGxlciwgcmVqZWN0aW9uSGFuZGxlcik7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBoYW5kbGVGb3JlaWduVGhlbmFibGUocHJvbWlzZSwgdGhlbmFibGUsIHRoZW4kJDEpIHtcbiAgYXNhcChmdW5jdGlvbiAocHJvbWlzZSkge1xuICAgIHZhciBzZWFsZWQgPSBmYWxzZTtcbiAgICB2YXIgZXJyb3IgPSB0cnlUaGVuKHRoZW4kJDEsIHRoZW5hYmxlLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIGlmIChzZWFsZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgc2VhbGVkID0gdHJ1ZTtcbiAgICAgIGlmICh0aGVuYWJsZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICBpZiAoc2VhbGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHNlYWxlZCA9IHRydWU7XG5cbiAgICAgIHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgIH0sICdTZXR0bGU6ICcgKyAocHJvbWlzZS5fbGFiZWwgfHwgJyB1bmtub3duIHByb21pc2UnKSk7XG5cbiAgICBpZiAoIXNlYWxlZCAmJiBlcnJvcikge1xuICAgICAgc2VhbGVkID0gdHJ1ZTtcbiAgICAgIHJlamVjdChwcm9taXNlLCBlcnJvcik7XG4gICAgfVxuICB9LCBwcm9taXNlKTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlT3duVGhlbmFibGUocHJvbWlzZSwgdGhlbmFibGUpIHtcbiAgaWYgKHRoZW5hYmxlLl9zdGF0ZSA9PT0gRlVMRklMTEVEKSB7XG4gICAgZnVsZmlsbChwcm9taXNlLCB0aGVuYWJsZS5fcmVzdWx0KTtcbiAgfSBlbHNlIGlmICh0aGVuYWJsZS5fc3RhdGUgPT09IFJFSkVDVEVEKSB7XG4gICAgcmVqZWN0KHByb21pc2UsIHRoZW5hYmxlLl9yZXN1bHQpO1xuICB9IGVsc2Uge1xuICAgIHN1YnNjcmliZSh0aGVuYWJsZSwgdW5kZWZpbmVkLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHJldHVybiByZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICByZXR1cm4gcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlTWF5YmVUaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlLCB0aGVuJCQxKSB7XG4gIGlmIChtYXliZVRoZW5hYmxlLmNvbnN0cnVjdG9yID09PSBwcm9taXNlLmNvbnN0cnVjdG9yICYmIHRoZW4kJDEgPT09IHRoZW4gJiYgbWF5YmVUaGVuYWJsZS5jb25zdHJ1Y3Rvci5yZXNvbHZlID09PSByZXNvbHZlJDEpIHtcbiAgICBoYW5kbGVPd25UaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAodGhlbiQkMSA9PT0gVFJZX0NBVENIX0VSUk9SKSB7XG4gICAgICByZWplY3QocHJvbWlzZSwgVFJZX0NBVENIX0VSUk9SLmVycm9yKTtcbiAgICAgIFRSWV9DQVRDSF9FUlJPUi5lcnJvciA9IG51bGw7XG4gICAgfSBlbHNlIGlmICh0aGVuJCQxID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGZ1bGZpbGwocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSk7XG4gICAgfSBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoZW4kJDEpKSB7XG4gICAgICBoYW5kbGVGb3JlaWduVGhlbmFibGUocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSwgdGhlbiQkMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZ1bGZpbGwocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlc29sdmUocHJvbWlzZSwgdmFsdWUpIHtcbiAgaWYgKHByb21pc2UgPT09IHZhbHVlKSB7XG4gICAgcmVqZWN0KHByb21pc2UsIHNlbGZGdWxmaWxsbWVudCgpKTtcbiAgfSBlbHNlIGlmIChvYmplY3RPckZ1bmN0aW9uKHZhbHVlKSkge1xuICAgIGhhbmRsZU1heWJlVGhlbmFibGUocHJvbWlzZSwgdmFsdWUsIGdldFRoZW4odmFsdWUpKTtcbiAgfSBlbHNlIHtcbiAgICBmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBwdWJsaXNoUmVqZWN0aW9uKHByb21pc2UpIHtcbiAgaWYgKHByb21pc2UuX29uZXJyb3IpIHtcbiAgICBwcm9taXNlLl9vbmVycm9yKHByb21pc2UuX3Jlc3VsdCk7XG4gIH1cblxuICBwdWJsaXNoKHByb21pc2UpO1xufVxuXG5mdW5jdGlvbiBmdWxmaWxsKHByb21pc2UsIHZhbHVlKSB7XG4gIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gUEVORElORykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHByb21pc2UuX3Jlc3VsdCA9IHZhbHVlO1xuICBwcm9taXNlLl9zdGF0ZSA9IEZVTEZJTExFRDtcblxuICBpZiAocHJvbWlzZS5fc3Vic2NyaWJlcnMubGVuZ3RoICE9PSAwKSB7XG4gICAgYXNhcChwdWJsaXNoLCBwcm9taXNlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZWplY3QocHJvbWlzZSwgcmVhc29uKSB7XG4gIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gUEVORElORykge1xuICAgIHJldHVybjtcbiAgfVxuICBwcm9taXNlLl9zdGF0ZSA9IFJFSkVDVEVEO1xuICBwcm9taXNlLl9yZXN1bHQgPSByZWFzb247XG5cbiAgYXNhcChwdWJsaXNoUmVqZWN0aW9uLCBwcm9taXNlKTtcbn1cblxuZnVuY3Rpb24gc3Vic2NyaWJlKHBhcmVudCwgY2hpbGQsIG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uKSB7XG4gIHZhciBfc3Vic2NyaWJlcnMgPSBwYXJlbnQuX3N1YnNjcmliZXJzO1xuICB2YXIgbGVuZ3RoID0gX3N1YnNjcmliZXJzLmxlbmd0aDtcblxuXG4gIHBhcmVudC5fb25lcnJvciA9IG51bGw7XG5cbiAgX3N1YnNjcmliZXJzW2xlbmd0aF0gPSBjaGlsZDtcbiAgX3N1YnNjcmliZXJzW2xlbmd0aCArIEZVTEZJTExFRF0gPSBvbkZ1bGZpbGxtZW50O1xuICBfc3Vic2NyaWJlcnNbbGVuZ3RoICsgUkVKRUNURURdID0gb25SZWplY3Rpb247XG5cbiAgaWYgKGxlbmd0aCA9PT0gMCAmJiBwYXJlbnQuX3N0YXRlKSB7XG4gICAgYXNhcChwdWJsaXNoLCBwYXJlbnQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHB1Ymxpc2gocHJvbWlzZSkge1xuICB2YXIgc3Vic2NyaWJlcnMgPSBwcm9taXNlLl9zdWJzY3JpYmVycztcbiAgdmFyIHNldHRsZWQgPSBwcm9taXNlLl9zdGF0ZTtcblxuICBpZiAoc3Vic2NyaWJlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGNoaWxkID0gdm9pZCAwLFxuICAgICAgY2FsbGJhY2sgPSB2b2lkIDAsXG4gICAgICBkZXRhaWwgPSBwcm9taXNlLl9yZXN1bHQ7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdWJzY3JpYmVycy5sZW5ndGg7IGkgKz0gMykge1xuICAgIGNoaWxkID0gc3Vic2NyaWJlcnNbaV07XG4gICAgY2FsbGJhY2sgPSBzdWJzY3JpYmVyc1tpICsgc2V0dGxlZF07XG5cbiAgICBpZiAoY2hpbGQpIHtcbiAgICAgIGludm9rZUNhbGxiYWNrKHNldHRsZWQsIGNoaWxkLCBjYWxsYmFjaywgZGV0YWlsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2FsbGJhY2soZGV0YWlsKTtcbiAgICB9XG4gIH1cblxuICBwcm9taXNlLl9zdWJzY3JpYmVycy5sZW5ndGggPSAwO1xufVxuXG5mdW5jdGlvbiB0cnlDYXRjaChjYWxsYmFjaywgZGV0YWlsKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrKGRldGFpbCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBUUllfQ0FUQ0hfRVJST1IuZXJyb3IgPSBlO1xuICAgIHJldHVybiBUUllfQ0FUQ0hfRVJST1I7XG4gIH1cbn1cblxuZnVuY3Rpb24gaW52b2tlQ2FsbGJhY2soc2V0dGxlZCwgcHJvbWlzZSwgY2FsbGJhY2ssIGRldGFpbCkge1xuICB2YXIgaGFzQ2FsbGJhY2sgPSBpc0Z1bmN0aW9uKGNhbGxiYWNrKSxcbiAgICAgIHZhbHVlID0gdm9pZCAwLFxuICAgICAgZXJyb3IgPSB2b2lkIDAsXG4gICAgICBzdWNjZWVkZWQgPSB2b2lkIDAsXG4gICAgICBmYWlsZWQgPSB2b2lkIDA7XG5cbiAgaWYgKGhhc0NhbGxiYWNrKSB7XG4gICAgdmFsdWUgPSB0cnlDYXRjaChjYWxsYmFjaywgZGV0YWlsKTtcblxuICAgIGlmICh2YWx1ZSA9PT0gVFJZX0NBVENIX0VSUk9SKSB7XG4gICAgICBmYWlsZWQgPSB0cnVlO1xuICAgICAgZXJyb3IgPSB2YWx1ZS5lcnJvcjtcbiAgICAgIHZhbHVlLmVycm9yID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3VjY2VlZGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAocHJvbWlzZSA9PT0gdmFsdWUpIHtcbiAgICAgIHJlamVjdChwcm9taXNlLCBjYW5ub3RSZXR1cm5Pd24oKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHZhbHVlID0gZGV0YWlsO1xuICAgIHN1Y2NlZWRlZCA9IHRydWU7XG4gIH1cblxuICBpZiAocHJvbWlzZS5fc3RhdGUgIT09IFBFTkRJTkcpIHtcbiAgICAvLyBub29wXG4gIH0gZWxzZSBpZiAoaGFzQ2FsbGJhY2sgJiYgc3VjY2VlZGVkKSB7XG4gICAgcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gIH0gZWxzZSBpZiAoZmFpbGVkKSB7XG4gICAgcmVqZWN0KHByb21pc2UsIGVycm9yKTtcbiAgfSBlbHNlIGlmIChzZXR0bGVkID09PSBGVUxGSUxMRUQpIHtcbiAgICBmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgfSBlbHNlIGlmIChzZXR0bGVkID09PSBSRUpFQ1RFRCkge1xuICAgIHJlamVjdChwcm9taXNlLCB2YWx1ZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaW5pdGlhbGl6ZVByb21pc2UocHJvbWlzZSwgcmVzb2x2ZXIpIHtcbiAgdHJ5IHtcbiAgICByZXNvbHZlcihmdW5jdGlvbiByZXNvbHZlUHJvbWlzZSh2YWx1ZSkge1xuICAgICAgcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgfSwgZnVuY3Rpb24gcmVqZWN0UHJvbWlzZShyZWFzb24pIHtcbiAgICAgIHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgIH0pO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmVqZWN0KHByb21pc2UsIGUpO1xuICB9XG59XG5cbnZhciBpZCA9IDA7XG5mdW5jdGlvbiBuZXh0SWQoKSB7XG4gIHJldHVybiBpZCsrO1xufVxuXG5mdW5jdGlvbiBtYWtlUHJvbWlzZShwcm9taXNlKSB7XG4gIHByb21pc2VbUFJPTUlTRV9JRF0gPSBpZCsrO1xuICBwcm9taXNlLl9zdGF0ZSA9IHVuZGVmaW5lZDtcbiAgcHJvbWlzZS5fcmVzdWx0ID0gdW5kZWZpbmVkO1xuICBwcm9taXNlLl9zdWJzY3JpYmVycyA9IFtdO1xufVxuXG5mdW5jdGlvbiB2YWxpZGF0aW9uRXJyb3IoKSB7XG4gIHJldHVybiBuZXcgRXJyb3IoJ0FycmF5IE1ldGhvZHMgbXVzdCBiZSBwcm92aWRlZCBhbiBBcnJheScpO1xufVxuXG52YXIgRW51bWVyYXRvciA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gRW51bWVyYXRvcihDb25zdHJ1Y3RvciwgaW5wdXQpIHtcbiAgICB0aGlzLl9pbnN0YW5jZUNvbnN0cnVjdG9yID0gQ29uc3RydWN0b3I7XG4gICAgdGhpcy5wcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKG5vb3ApO1xuXG4gICAgaWYgKCF0aGlzLnByb21pc2VbUFJPTUlTRV9JRF0pIHtcbiAgICAgIG1ha2VQcm9taXNlKHRoaXMucHJvbWlzZSk7XG4gICAgfVxuXG4gICAgaWYgKGlzQXJyYXkoaW5wdXQpKSB7XG4gICAgICB0aGlzLmxlbmd0aCA9IGlucHV0Lmxlbmd0aDtcbiAgICAgIHRoaXMuX3JlbWFpbmluZyA9IGlucHV0Lmxlbmd0aDtcblxuICAgICAgdGhpcy5fcmVzdWx0ID0gbmV3IEFycmF5KHRoaXMubGVuZ3RoKTtcblxuICAgICAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGZ1bGZpbGwodGhpcy5wcm9taXNlLCB0aGlzLl9yZXN1bHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5sZW5ndGggPSB0aGlzLmxlbmd0aCB8fCAwO1xuICAgICAgICB0aGlzLl9lbnVtZXJhdGUoaW5wdXQpO1xuICAgICAgICBpZiAodGhpcy5fcmVtYWluaW5nID09PSAwKSB7XG4gICAgICAgICAgZnVsZmlsbCh0aGlzLnByb21pc2UsIHRoaXMuX3Jlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmVqZWN0KHRoaXMucHJvbWlzZSwgdmFsaWRhdGlvbkVycm9yKCkpO1xuICAgIH1cbiAgfVxuXG4gIEVudW1lcmF0b3IucHJvdG90eXBlLl9lbnVtZXJhdGUgPSBmdW5jdGlvbiBfZW51bWVyYXRlKGlucHV0KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IHRoaXMuX3N0YXRlID09PSBQRU5ESU5HICYmIGkgPCBpbnB1dC5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5fZWFjaEVudHJ5KGlucHV0W2ldLCBpKTtcbiAgICB9XG4gIH07XG5cbiAgRW51bWVyYXRvci5wcm90b3R5cGUuX2VhY2hFbnRyeSA9IGZ1bmN0aW9uIF9lYWNoRW50cnkoZW50cnksIGkpIHtcbiAgICB2YXIgYyA9IHRoaXMuX2luc3RhbmNlQ29uc3RydWN0b3I7XG4gICAgdmFyIHJlc29sdmUkJDEgPSBjLnJlc29sdmU7XG5cblxuICAgIGlmIChyZXNvbHZlJCQxID09PSByZXNvbHZlJDEpIHtcbiAgICAgIHZhciBfdGhlbiA9IGdldFRoZW4oZW50cnkpO1xuXG4gICAgICBpZiAoX3RoZW4gPT09IHRoZW4gJiYgZW50cnkuX3N0YXRlICE9PSBQRU5ESU5HKSB7XG4gICAgICAgIHRoaXMuX3NldHRsZWRBdChlbnRyeS5fc3RhdGUsIGksIGVudHJ5Ll9yZXN1bHQpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgX3RoZW4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5fcmVtYWluaW5nLS07XG4gICAgICAgIHRoaXMuX3Jlc3VsdFtpXSA9IGVudHJ5O1xuICAgICAgfSBlbHNlIGlmIChjID09PSBQcm9taXNlJDEpIHtcbiAgICAgICAgdmFyIHByb21pc2UgPSBuZXcgYyhub29wKTtcbiAgICAgICAgaGFuZGxlTWF5YmVUaGVuYWJsZShwcm9taXNlLCBlbnRyeSwgX3RoZW4pO1xuICAgICAgICB0aGlzLl93aWxsU2V0dGxlQXQocHJvbWlzZSwgaSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl93aWxsU2V0dGxlQXQobmV3IGMoZnVuY3Rpb24gKHJlc29sdmUkJDEpIHtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZSQkMShlbnRyeSk7XG4gICAgICAgIH0pLCBpKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fd2lsbFNldHRsZUF0KHJlc29sdmUkJDEoZW50cnkpLCBpKTtcbiAgICB9XG4gIH07XG5cbiAgRW51bWVyYXRvci5wcm90b3R5cGUuX3NldHRsZWRBdCA9IGZ1bmN0aW9uIF9zZXR0bGVkQXQoc3RhdGUsIGksIHZhbHVlKSB7XG4gICAgdmFyIHByb21pc2UgPSB0aGlzLnByb21pc2U7XG5cblxuICAgIGlmIChwcm9taXNlLl9zdGF0ZSA9PT0gUEVORElORykge1xuICAgICAgdGhpcy5fcmVtYWluaW5nLS07XG5cbiAgICAgIGlmIChzdGF0ZSA9PT0gUkVKRUNURUQpIHtcbiAgICAgICAgcmVqZWN0KHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3Jlc3VsdFtpXSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLl9yZW1haW5pbmcgPT09IDApIHtcbiAgICAgIGZ1bGZpbGwocHJvbWlzZSwgdGhpcy5fcmVzdWx0KTtcbiAgICB9XG4gIH07XG5cbiAgRW51bWVyYXRvci5wcm90b3R5cGUuX3dpbGxTZXR0bGVBdCA9IGZ1bmN0aW9uIF93aWxsU2V0dGxlQXQocHJvbWlzZSwgaSkge1xuICAgIHZhciBlbnVtZXJhdG9yID0gdGhpcztcblxuICAgIHN1YnNjcmliZShwcm9taXNlLCB1bmRlZmluZWQsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIGVudW1lcmF0b3IuX3NldHRsZWRBdChGVUxGSUxMRUQsIGksIHZhbHVlKTtcbiAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICByZXR1cm4gZW51bWVyYXRvci5fc2V0dGxlZEF0KFJFSkVDVEVELCBpLCByZWFzb24pO1xuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiBFbnVtZXJhdG9yO1xufSgpO1xuXG4vKipcbiAgYFByb21pc2UuYWxsYCBhY2NlcHRzIGFuIGFycmF5IG9mIHByb21pc2VzLCBhbmQgcmV0dXJucyBhIG5ldyBwcm9taXNlIHdoaWNoXG4gIGlzIGZ1bGZpbGxlZCB3aXRoIGFuIGFycmF5IG9mIGZ1bGZpbGxtZW50IHZhbHVlcyBmb3IgdGhlIHBhc3NlZCBwcm9taXNlcywgb3JcbiAgcmVqZWN0ZWQgd2l0aCB0aGUgcmVhc29uIG9mIHRoZSBmaXJzdCBwYXNzZWQgcHJvbWlzZSB0byBiZSByZWplY3RlZC4gSXQgY2FzdHMgYWxsXG4gIGVsZW1lbnRzIG9mIHRoZSBwYXNzZWQgaXRlcmFibGUgdG8gcHJvbWlzZXMgYXMgaXQgcnVucyB0aGlzIGFsZ29yaXRobS5cblxuICBFeGFtcGxlOlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgbGV0IHByb21pc2UxID0gcmVzb2x2ZSgxKTtcbiAgbGV0IHByb21pc2UyID0gcmVzb2x2ZSgyKTtcbiAgbGV0IHByb21pc2UzID0gcmVzb2x2ZSgzKTtcbiAgbGV0IHByb21pc2VzID0gWyBwcm9taXNlMSwgcHJvbWlzZTIsIHByb21pc2UzIF07XG5cbiAgUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24oYXJyYXkpe1xuICAgIC8vIFRoZSBhcnJheSBoZXJlIHdvdWxkIGJlIFsgMSwgMiwgMyBdO1xuICB9KTtcbiAgYGBgXG5cbiAgSWYgYW55IG9mIHRoZSBgcHJvbWlzZXNgIGdpdmVuIHRvIGBhbGxgIGFyZSByZWplY3RlZCwgdGhlIGZpcnN0IHByb21pc2VcbiAgdGhhdCBpcyByZWplY3RlZCB3aWxsIGJlIGdpdmVuIGFzIGFuIGFyZ3VtZW50IHRvIHRoZSByZXR1cm5lZCBwcm9taXNlcydzXG4gIHJlamVjdGlvbiBoYW5kbGVyLiBGb3IgZXhhbXBsZTpcblxuICBFeGFtcGxlOlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgbGV0IHByb21pc2UxID0gcmVzb2x2ZSgxKTtcbiAgbGV0IHByb21pc2UyID0gcmVqZWN0KG5ldyBFcnJvcihcIjJcIikpO1xuICBsZXQgcHJvbWlzZTMgPSByZWplY3QobmV3IEVycm9yKFwiM1wiKSk7XG4gIGxldCBwcm9taXNlcyA9IFsgcHJvbWlzZTEsIHByb21pc2UyLCBwcm9taXNlMyBdO1xuXG4gIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uKGFycmF5KXtcbiAgICAvLyBDb2RlIGhlcmUgbmV2ZXIgcnVucyBiZWNhdXNlIHRoZXJlIGFyZSByZWplY3RlZCBwcm9taXNlcyFcbiAgfSwgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAvLyBlcnJvci5tZXNzYWdlID09PSBcIjJcIlxuICB9KTtcbiAgYGBgXG5cbiAgQG1ldGhvZCBhbGxcbiAgQHN0YXRpY1xuICBAcGFyYW0ge0FycmF5fSBlbnRyaWVzIGFycmF5IG9mIHByb21pc2VzXG4gIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCBvcHRpb25hbCBzdHJpbmcgZm9yIGxhYmVsaW5nIHRoZSBwcm9taXNlLlxuICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gIEByZXR1cm4ge1Byb21pc2V9IHByb21pc2UgdGhhdCBpcyBmdWxmaWxsZWQgd2hlbiBhbGwgYHByb21pc2VzYCBoYXZlIGJlZW5cbiAgZnVsZmlsbGVkLCBvciByZWplY3RlZCBpZiBhbnkgb2YgdGhlbSBiZWNvbWUgcmVqZWN0ZWQuXG4gIEBzdGF0aWNcbiovXG5mdW5jdGlvbiBhbGwoZW50cmllcykge1xuICByZXR1cm4gbmV3IEVudW1lcmF0b3IodGhpcywgZW50cmllcykucHJvbWlzZTtcbn1cblxuLyoqXG4gIGBQcm9taXNlLnJhY2VgIHJldHVybnMgYSBuZXcgcHJvbWlzZSB3aGljaCBpcyBzZXR0bGVkIGluIHRoZSBzYW1lIHdheSBhcyB0aGVcbiAgZmlyc3QgcGFzc2VkIHByb21pc2UgdG8gc2V0dGxlLlxuXG4gIEV4YW1wbGU6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBsZXQgcHJvbWlzZTEgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHJlc29sdmUoJ3Byb21pc2UgMScpO1xuICAgIH0sIDIwMCk7XG4gIH0pO1xuXG4gIGxldCBwcm9taXNlMiA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgcmVzb2x2ZSgncHJvbWlzZSAyJyk7XG4gICAgfSwgMTAwKTtcbiAgfSk7XG5cbiAgUHJvbWlzZS5yYWNlKFtwcm9taXNlMSwgcHJvbWlzZTJdKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCl7XG4gICAgLy8gcmVzdWx0ID09PSAncHJvbWlzZSAyJyBiZWNhdXNlIGl0IHdhcyByZXNvbHZlZCBiZWZvcmUgcHJvbWlzZTFcbiAgICAvLyB3YXMgcmVzb2x2ZWQuXG4gIH0pO1xuICBgYGBcblxuICBgUHJvbWlzZS5yYWNlYCBpcyBkZXRlcm1pbmlzdGljIGluIHRoYXQgb25seSB0aGUgc3RhdGUgb2YgdGhlIGZpcnN0XG4gIHNldHRsZWQgcHJvbWlzZSBtYXR0ZXJzLiBGb3IgZXhhbXBsZSwgZXZlbiBpZiBvdGhlciBwcm9taXNlcyBnaXZlbiB0byB0aGVcbiAgYHByb21pc2VzYCBhcnJheSBhcmd1bWVudCBhcmUgcmVzb2x2ZWQsIGJ1dCB0aGUgZmlyc3Qgc2V0dGxlZCBwcm9taXNlIGhhc1xuICBiZWNvbWUgcmVqZWN0ZWQgYmVmb3JlIHRoZSBvdGhlciBwcm9taXNlcyBiZWNhbWUgZnVsZmlsbGVkLCB0aGUgcmV0dXJuZWRcbiAgcHJvbWlzZSB3aWxsIGJlY29tZSByZWplY3RlZDpcblxuICBgYGBqYXZhc2NyaXB0XG4gIGxldCBwcm9taXNlMSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgcmVzb2x2ZSgncHJvbWlzZSAxJyk7XG4gICAgfSwgMjAwKTtcbiAgfSk7XG5cbiAgbGV0IHByb21pc2UyID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICByZWplY3QobmV3IEVycm9yKCdwcm9taXNlIDInKSk7XG4gICAgfSwgMTAwKTtcbiAgfSk7XG5cbiAgUHJvbWlzZS5yYWNlKFtwcm9taXNlMSwgcHJvbWlzZTJdKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCl7XG4gICAgLy8gQ29kZSBoZXJlIG5ldmVyIHJ1bnNcbiAgfSwgZnVuY3Rpb24ocmVhc29uKXtcbiAgICAvLyByZWFzb24ubWVzc2FnZSA9PT0gJ3Byb21pc2UgMicgYmVjYXVzZSBwcm9taXNlIDIgYmVjYW1lIHJlamVjdGVkIGJlZm9yZVxuICAgIC8vIHByb21pc2UgMSBiZWNhbWUgZnVsZmlsbGVkXG4gIH0pO1xuICBgYGBcblxuICBBbiBleGFtcGxlIHJlYWwtd29ybGQgdXNlIGNhc2UgaXMgaW1wbGVtZW50aW5nIHRpbWVvdXRzOlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgUHJvbWlzZS5yYWNlKFthamF4KCdmb28uanNvbicpLCB0aW1lb3V0KDUwMDApXSlcbiAgYGBgXG5cbiAgQG1ldGhvZCByYWNlXG4gIEBzdGF0aWNcbiAgQHBhcmFtIHtBcnJheX0gcHJvbWlzZXMgYXJyYXkgb2YgcHJvbWlzZXMgdG8gb2JzZXJ2ZVxuICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gIEByZXR1cm4ge1Byb21pc2V9IGEgcHJvbWlzZSB3aGljaCBzZXR0bGVzIGluIHRoZSBzYW1lIHdheSBhcyB0aGUgZmlyc3QgcGFzc2VkXG4gIHByb21pc2UgdG8gc2V0dGxlLlxuKi9cbmZ1bmN0aW9uIHJhY2UoZW50cmllcykge1xuICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuXG4gIGlmICghaXNBcnJheShlbnRyaWVzKSkge1xuICAgIHJldHVybiBuZXcgQ29uc3RydWN0b3IoZnVuY3Rpb24gKF8sIHJlamVjdCkge1xuICAgICAgcmV0dXJuIHJlamVjdChuZXcgVHlwZUVycm9yKCdZb3UgbXVzdCBwYXNzIGFuIGFycmF5IHRvIHJhY2UuJykpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuZXcgQ29uc3RydWN0b3IoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIGxlbmd0aCA9IGVudHJpZXMubGVuZ3RoO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBDb25zdHJ1Y3Rvci5yZXNvbHZlKGVudHJpZXNbaV0pLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAgYFByb21pc2UucmVqZWN0YCByZXR1cm5zIGEgcHJvbWlzZSByZWplY3RlZCB3aXRoIHRoZSBwYXNzZWQgYHJlYXNvbmAuXG4gIEl0IGlzIHNob3J0aGFuZCBmb3IgdGhlIGZvbGxvd2luZzpcblxuICBgYGBqYXZhc2NyaXB0XG4gIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICByZWplY3QobmV3IEVycm9yKCdXSE9PUFMnKSk7XG4gIH0pO1xuXG4gIHByb21pc2UudGhlbihmdW5jdGlvbih2YWx1ZSl7XG4gICAgLy8gQ29kZSBoZXJlIGRvZXNuJ3QgcnVuIGJlY2F1c2UgdGhlIHByb21pc2UgaXMgcmVqZWN0ZWQhXG4gIH0sIGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgLy8gcmVhc29uLm1lc3NhZ2UgPT09ICdXSE9PUFMnXG4gIH0pO1xuICBgYGBcblxuICBJbnN0ZWFkIG9mIHdyaXRpbmcgdGhlIGFib3ZlLCB5b3VyIGNvZGUgbm93IHNpbXBseSBiZWNvbWVzIHRoZSBmb2xsb3dpbmc6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBsZXQgcHJvbWlzZSA9IFByb21pc2UucmVqZWN0KG5ldyBFcnJvcignV0hPT1BTJykpO1xuXG4gIHByb21pc2UudGhlbihmdW5jdGlvbih2YWx1ZSl7XG4gICAgLy8gQ29kZSBoZXJlIGRvZXNuJ3QgcnVuIGJlY2F1c2UgdGhlIHByb21pc2UgaXMgcmVqZWN0ZWQhXG4gIH0sIGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgLy8gcmVhc29uLm1lc3NhZ2UgPT09ICdXSE9PUFMnXG4gIH0pO1xuICBgYGBcblxuICBAbWV0aG9kIHJlamVjdFxuICBAc3RhdGljXG4gIEBwYXJhbSB7QW55fSByZWFzb24gdmFsdWUgdGhhdCB0aGUgcmV0dXJuZWQgcHJvbWlzZSB3aWxsIGJlIHJlamVjdGVkIHdpdGguXG4gIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgQHJldHVybiB7UHJvbWlzZX0gYSBwcm9taXNlIHJlamVjdGVkIHdpdGggdGhlIGdpdmVuIGByZWFzb25gLlxuKi9cbmZ1bmN0aW9uIHJlamVjdCQxKHJlYXNvbikge1xuICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuICB2YXIgcHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3Rvcihub29wKTtcbiAgcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gIHJldHVybiBwcm9taXNlO1xufVxuXG5mdW5jdGlvbiBuZWVkc1Jlc29sdmVyKCkge1xuICB0aHJvdyBuZXcgVHlwZUVycm9yKCdZb3UgbXVzdCBwYXNzIGEgcmVzb2x2ZXIgZnVuY3Rpb24gYXMgdGhlIGZpcnN0IGFyZ3VtZW50IHRvIHRoZSBwcm9taXNlIGNvbnN0cnVjdG9yJyk7XG59XG5cbmZ1bmN0aW9uIG5lZWRzTmV3KCkge1xuICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRmFpbGVkIHRvIGNvbnN0cnVjdCAnUHJvbWlzZSc6IFBsZWFzZSB1c2UgdGhlICduZXcnIG9wZXJhdG9yLCB0aGlzIG9iamVjdCBjb25zdHJ1Y3RvciBjYW5ub3QgYmUgY2FsbGVkIGFzIGEgZnVuY3Rpb24uXCIpO1xufVxuXG4vKipcbiAgUHJvbWlzZSBvYmplY3RzIHJlcHJlc2VudCB0aGUgZXZlbnR1YWwgcmVzdWx0IG9mIGFuIGFzeW5jaHJvbm91cyBvcGVyYXRpb24uIFRoZVxuICBwcmltYXJ5IHdheSBvZiBpbnRlcmFjdGluZyB3aXRoIGEgcHJvbWlzZSBpcyB0aHJvdWdoIGl0cyBgdGhlbmAgbWV0aG9kLCB3aGljaFxuICByZWdpc3RlcnMgY2FsbGJhY2tzIHRvIHJlY2VpdmUgZWl0aGVyIGEgcHJvbWlzZSdzIGV2ZW50dWFsIHZhbHVlIG9yIHRoZSByZWFzb25cbiAgd2h5IHRoZSBwcm9taXNlIGNhbm5vdCBiZSBmdWxmaWxsZWQuXG5cbiAgVGVybWlub2xvZ3lcbiAgLS0tLS0tLS0tLS1cblxuICAtIGBwcm9taXNlYCBpcyBhbiBvYmplY3Qgb3IgZnVuY3Rpb24gd2l0aCBhIGB0aGVuYCBtZXRob2Qgd2hvc2UgYmVoYXZpb3IgY29uZm9ybXMgdG8gdGhpcyBzcGVjaWZpY2F0aW9uLlxuICAtIGB0aGVuYWJsZWAgaXMgYW4gb2JqZWN0IG9yIGZ1bmN0aW9uIHRoYXQgZGVmaW5lcyBhIGB0aGVuYCBtZXRob2QuXG4gIC0gYHZhbHVlYCBpcyBhbnkgbGVnYWwgSmF2YVNjcmlwdCB2YWx1ZSAoaW5jbHVkaW5nIHVuZGVmaW5lZCwgYSB0aGVuYWJsZSwgb3IgYSBwcm9taXNlKS5cbiAgLSBgZXhjZXB0aW9uYCBpcyBhIHZhbHVlIHRoYXQgaXMgdGhyb3duIHVzaW5nIHRoZSB0aHJvdyBzdGF0ZW1lbnQuXG4gIC0gYHJlYXNvbmAgaXMgYSB2YWx1ZSB0aGF0IGluZGljYXRlcyB3aHkgYSBwcm9taXNlIHdhcyByZWplY3RlZC5cbiAgLSBgc2V0dGxlZGAgdGhlIGZpbmFsIHJlc3Rpbmcgc3RhdGUgb2YgYSBwcm9taXNlLCBmdWxmaWxsZWQgb3IgcmVqZWN0ZWQuXG5cbiAgQSBwcm9taXNlIGNhbiBiZSBpbiBvbmUgb2YgdGhyZWUgc3RhdGVzOiBwZW5kaW5nLCBmdWxmaWxsZWQsIG9yIHJlamVjdGVkLlxuXG4gIFByb21pc2VzIHRoYXQgYXJlIGZ1bGZpbGxlZCBoYXZlIGEgZnVsZmlsbG1lbnQgdmFsdWUgYW5kIGFyZSBpbiB0aGUgZnVsZmlsbGVkXG4gIHN0YXRlLiAgUHJvbWlzZXMgdGhhdCBhcmUgcmVqZWN0ZWQgaGF2ZSBhIHJlamVjdGlvbiByZWFzb24gYW5kIGFyZSBpbiB0aGVcbiAgcmVqZWN0ZWQgc3RhdGUuICBBIGZ1bGZpbGxtZW50IHZhbHVlIGlzIG5ldmVyIGEgdGhlbmFibGUuXG5cbiAgUHJvbWlzZXMgY2FuIGFsc28gYmUgc2FpZCB0byAqcmVzb2x2ZSogYSB2YWx1ZS4gIElmIHRoaXMgdmFsdWUgaXMgYWxzbyBhXG4gIHByb21pc2UsIHRoZW4gdGhlIG9yaWdpbmFsIHByb21pc2UncyBzZXR0bGVkIHN0YXRlIHdpbGwgbWF0Y2ggdGhlIHZhbHVlJ3NcbiAgc2V0dGxlZCBzdGF0ZS4gIFNvIGEgcHJvbWlzZSB0aGF0ICpyZXNvbHZlcyogYSBwcm9taXNlIHRoYXQgcmVqZWN0cyB3aWxsXG4gIGl0c2VsZiByZWplY3QsIGFuZCBhIHByb21pc2UgdGhhdCAqcmVzb2x2ZXMqIGEgcHJvbWlzZSB0aGF0IGZ1bGZpbGxzIHdpbGxcbiAgaXRzZWxmIGZ1bGZpbGwuXG5cblxuICBCYXNpYyBVc2FnZTpcbiAgLS0tLS0tLS0tLS0tXG5cbiAgYGBganNcbiAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAvLyBvbiBzdWNjZXNzXG4gICAgcmVzb2x2ZSh2YWx1ZSk7XG5cbiAgICAvLyBvbiBmYWlsdXJlXG4gICAgcmVqZWN0KHJlYXNvbik7XG4gIH0pO1xuXG4gIHByb21pc2UudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgIC8vIG9uIGZ1bGZpbGxtZW50XG4gIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgIC8vIG9uIHJlamVjdGlvblxuICB9KTtcbiAgYGBgXG5cbiAgQWR2YW5jZWQgVXNhZ2U6XG4gIC0tLS0tLS0tLS0tLS0tLVxuXG4gIFByb21pc2VzIHNoaW5lIHdoZW4gYWJzdHJhY3RpbmcgYXdheSBhc3luY2hyb25vdXMgaW50ZXJhY3Rpb25zIHN1Y2ggYXNcbiAgYFhNTEh0dHBSZXF1ZXN0YHMuXG5cbiAgYGBganNcbiAgZnVuY3Rpb24gZ2V0SlNPTih1cmwpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICAgIGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgeGhyLm9wZW4oJ0dFVCcsIHVybCk7XG4gICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gaGFuZGxlcjtcbiAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnanNvbic7XG4gICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgIHhoci5zZW5kKCk7XG5cbiAgICAgIGZ1bmN0aW9uIGhhbmRsZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IHRoaXMuRE9ORSkge1xuICAgICAgICAgIGlmICh0aGlzLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICByZXNvbHZlKHRoaXMucmVzcG9uc2UpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdnZXRKU09OOiBgJyArIHVybCArICdgIGZhaWxlZCB3aXRoIHN0YXR1czogWycgKyB0aGlzLnN0YXR1cyArICddJykpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldEpTT04oJy9wb3N0cy5qc29uJykudGhlbihmdW5jdGlvbihqc29uKSB7XG4gICAgLy8gb24gZnVsZmlsbG1lbnRcbiAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgLy8gb24gcmVqZWN0aW9uXG4gIH0pO1xuICBgYGBcblxuICBVbmxpa2UgY2FsbGJhY2tzLCBwcm9taXNlcyBhcmUgZ3JlYXQgY29tcG9zYWJsZSBwcmltaXRpdmVzLlxuXG4gIGBgYGpzXG4gIFByb21pc2UuYWxsKFtcbiAgICBnZXRKU09OKCcvcG9zdHMnKSxcbiAgICBnZXRKU09OKCcvY29tbWVudHMnKVxuICBdKS50aGVuKGZ1bmN0aW9uKHZhbHVlcyl7XG4gICAgdmFsdWVzWzBdIC8vID0+IHBvc3RzSlNPTlxuICAgIHZhbHVlc1sxXSAvLyA9PiBjb21tZW50c0pTT05cblxuICAgIHJldHVybiB2YWx1ZXM7XG4gIH0pO1xuICBgYGBcblxuICBAY2xhc3MgUHJvbWlzZVxuICBAcGFyYW0ge0Z1bmN0aW9ufSByZXNvbHZlclxuICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gIEBjb25zdHJ1Y3RvclxuKi9cblxudmFyIFByb21pc2UkMSA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gUHJvbWlzZShyZXNvbHZlcikge1xuICAgIHRoaXNbUFJPTUlTRV9JRF0gPSBuZXh0SWQoKTtcbiAgICB0aGlzLl9yZXN1bHQgPSB0aGlzLl9zdGF0ZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9zdWJzY3JpYmVycyA9IFtdO1xuXG4gICAgaWYgKG5vb3AgIT09IHJlc29sdmVyKSB7XG4gICAgICB0eXBlb2YgcmVzb2x2ZXIgIT09ICdmdW5jdGlvbicgJiYgbmVlZHNSZXNvbHZlcigpO1xuICAgICAgdGhpcyBpbnN0YW5jZW9mIFByb21pc2UgPyBpbml0aWFsaXplUHJvbWlzZSh0aGlzLCByZXNvbHZlcikgOiBuZWVkc05ldygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICBUaGUgcHJpbWFyeSB3YXkgb2YgaW50ZXJhY3Rpbmcgd2l0aCBhIHByb21pc2UgaXMgdGhyb3VnaCBpdHMgYHRoZW5gIG1ldGhvZCxcbiAgd2hpY2ggcmVnaXN0ZXJzIGNhbGxiYWNrcyB0byByZWNlaXZlIGVpdGhlciBhIHByb21pc2UncyBldmVudHVhbCB2YWx1ZSBvciB0aGVcbiAgcmVhc29uIHdoeSB0aGUgcHJvbWlzZSBjYW5ub3QgYmUgZnVsZmlsbGVkLlxuICAgYGBganNcbiAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uKHVzZXIpe1xuICAgIC8vIHVzZXIgaXMgYXZhaWxhYmxlXG4gIH0sIGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgLy8gdXNlciBpcyB1bmF2YWlsYWJsZSwgYW5kIHlvdSBhcmUgZ2l2ZW4gdGhlIHJlYXNvbiB3aHlcbiAgfSk7XG4gIGBgYFxuICAgQ2hhaW5pbmdcbiAgLS0tLS0tLS1cbiAgIFRoZSByZXR1cm4gdmFsdWUgb2YgYHRoZW5gIGlzIGl0c2VsZiBhIHByb21pc2UuICBUaGlzIHNlY29uZCwgJ2Rvd25zdHJlYW0nXG4gIHByb21pc2UgaXMgcmVzb2x2ZWQgd2l0aCB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBmaXJzdCBwcm9taXNlJ3MgZnVsZmlsbG1lbnRcbiAgb3IgcmVqZWN0aW9uIGhhbmRsZXIsIG9yIHJlamVjdGVkIGlmIHRoZSBoYW5kbGVyIHRocm93cyBhbiBleGNlcHRpb24uXG4gICBgYGBqc1xuICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICByZXR1cm4gdXNlci5uYW1lO1xuICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgcmV0dXJuICdkZWZhdWx0IG5hbWUnO1xuICB9KS50aGVuKGZ1bmN0aW9uICh1c2VyTmFtZSkge1xuICAgIC8vIElmIGBmaW5kVXNlcmAgZnVsZmlsbGVkLCBgdXNlck5hbWVgIHdpbGwgYmUgdGhlIHVzZXIncyBuYW1lLCBvdGhlcndpc2UgaXRcbiAgICAvLyB3aWxsIGJlIGAnZGVmYXVsdCBuYW1lJ2BcbiAgfSk7XG4gICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZvdW5kIHVzZXIsIGJ1dCBzdGlsbCB1bmhhcHB5Jyk7XG4gIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2BmaW5kVXNlcmAgcmVqZWN0ZWQgYW5kIHdlJ3JlIHVuaGFwcHknKTtcbiAgfSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAvLyBuZXZlciByZWFjaGVkXG4gIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAvLyBpZiBgZmluZFVzZXJgIGZ1bGZpbGxlZCwgYHJlYXNvbmAgd2lsbCBiZSAnRm91bmQgdXNlciwgYnV0IHN0aWxsIHVuaGFwcHknLlxuICAgIC8vIElmIGBmaW5kVXNlcmAgcmVqZWN0ZWQsIGByZWFzb25gIHdpbGwgYmUgJ2BmaW5kVXNlcmAgcmVqZWN0ZWQgYW5kIHdlJ3JlIHVuaGFwcHknLlxuICB9KTtcbiAgYGBgXG4gIElmIHRoZSBkb3duc3RyZWFtIHByb21pc2UgZG9lcyBub3Qgc3BlY2lmeSBhIHJlamVjdGlvbiBoYW5kbGVyLCByZWplY3Rpb24gcmVhc29ucyB3aWxsIGJlIHByb3BhZ2F0ZWQgZnVydGhlciBkb3duc3RyZWFtLlxuICAgYGBganNcbiAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgdGhyb3cgbmV3IFBlZGFnb2dpY2FsRXhjZXB0aW9uKCdVcHN0cmVhbSBlcnJvcicpO1xuICB9KS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIC8vIG5ldmVyIHJlYWNoZWRcbiAgfSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAvLyBuZXZlciByZWFjaGVkXG4gIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAvLyBUaGUgYFBlZGdhZ29jaWFsRXhjZXB0aW9uYCBpcyBwcm9wYWdhdGVkIGFsbCB0aGUgd2F5IGRvd24gdG8gaGVyZVxuICB9KTtcbiAgYGBgXG4gICBBc3NpbWlsYXRpb25cbiAgLS0tLS0tLS0tLS0tXG4gICBTb21ldGltZXMgdGhlIHZhbHVlIHlvdSB3YW50IHRvIHByb3BhZ2F0ZSB0byBhIGRvd25zdHJlYW0gcHJvbWlzZSBjYW4gb25seSBiZVxuICByZXRyaWV2ZWQgYXN5bmNocm9ub3VzbHkuIFRoaXMgY2FuIGJlIGFjaGlldmVkIGJ5IHJldHVybmluZyBhIHByb21pc2UgaW4gdGhlXG4gIGZ1bGZpbGxtZW50IG9yIHJlamVjdGlvbiBoYW5kbGVyLiBUaGUgZG93bnN0cmVhbSBwcm9taXNlIHdpbGwgdGhlbiBiZSBwZW5kaW5nXG4gIHVudGlsIHRoZSByZXR1cm5lZCBwcm9taXNlIGlzIHNldHRsZWQuIFRoaXMgaXMgY2FsbGVkICphc3NpbWlsYXRpb24qLlxuICAgYGBganNcbiAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgcmV0dXJuIGZpbmRDb21tZW50c0J5QXV0aG9yKHVzZXIpO1xuICB9KS50aGVuKGZ1bmN0aW9uIChjb21tZW50cykge1xuICAgIC8vIFRoZSB1c2VyJ3MgY29tbWVudHMgYXJlIG5vdyBhdmFpbGFibGVcbiAgfSk7XG4gIGBgYFxuICAgSWYgdGhlIGFzc2ltbGlhdGVkIHByb21pc2UgcmVqZWN0cywgdGhlbiB0aGUgZG93bnN0cmVhbSBwcm9taXNlIHdpbGwgYWxzbyByZWplY3QuXG4gICBgYGBqc1xuICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICByZXR1cm4gZmluZENvbW1lbnRzQnlBdXRob3IodXNlcik7XG4gIH0pLnRoZW4oZnVuY3Rpb24gKGNvbW1lbnRzKSB7XG4gICAgLy8gSWYgYGZpbmRDb21tZW50c0J5QXV0aG9yYCBmdWxmaWxscywgd2UnbGwgaGF2ZSB0aGUgdmFsdWUgaGVyZVxuICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgLy8gSWYgYGZpbmRDb21tZW50c0J5QXV0aG9yYCByZWplY3RzLCB3ZSdsbCBoYXZlIHRoZSByZWFzb24gaGVyZVxuICB9KTtcbiAgYGBgXG4gICBTaW1wbGUgRXhhbXBsZVxuICAtLS0tLS0tLS0tLS0tLVxuICAgU3luY2hyb25vdXMgRXhhbXBsZVxuICAgYGBgamF2YXNjcmlwdFxuICBsZXQgcmVzdWx0O1xuICAgdHJ5IHtcbiAgICByZXN1bHQgPSBmaW5kUmVzdWx0KCk7XG4gICAgLy8gc3VjY2Vzc1xuICB9IGNhdGNoKHJlYXNvbikge1xuICAgIC8vIGZhaWx1cmVcbiAgfVxuICBgYGBcbiAgIEVycmJhY2sgRXhhbXBsZVxuICAgYGBganNcbiAgZmluZFJlc3VsdChmdW5jdGlvbihyZXN1bHQsIGVycil7XG4gICAgaWYgKGVycikge1xuICAgICAgLy8gZmFpbHVyZVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBzdWNjZXNzXG4gICAgfVxuICB9KTtcbiAgYGBgXG4gICBQcm9taXNlIEV4YW1wbGU7XG4gICBgYGBqYXZhc2NyaXB0XG4gIGZpbmRSZXN1bHQoKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCl7XG4gICAgLy8gc3VjY2Vzc1xuICB9LCBmdW5jdGlvbihyZWFzb24pe1xuICAgIC8vIGZhaWx1cmVcbiAgfSk7XG4gIGBgYFxuICAgQWR2YW5jZWQgRXhhbXBsZVxuICAtLS0tLS0tLS0tLS0tLVxuICAgU3luY2hyb25vdXMgRXhhbXBsZVxuICAgYGBgamF2YXNjcmlwdFxuICBsZXQgYXV0aG9yLCBib29rcztcbiAgIHRyeSB7XG4gICAgYXV0aG9yID0gZmluZEF1dGhvcigpO1xuICAgIGJvb2tzICA9IGZpbmRCb29rc0J5QXV0aG9yKGF1dGhvcik7XG4gICAgLy8gc3VjY2Vzc1xuICB9IGNhdGNoKHJlYXNvbikge1xuICAgIC8vIGZhaWx1cmVcbiAgfVxuICBgYGBcbiAgIEVycmJhY2sgRXhhbXBsZVxuICAgYGBganNcbiAgIGZ1bmN0aW9uIGZvdW5kQm9va3MoYm9va3MpIHtcbiAgIH1cbiAgIGZ1bmN0aW9uIGZhaWx1cmUocmVhc29uKSB7XG4gICB9XG4gICBmaW5kQXV0aG9yKGZ1bmN0aW9uKGF1dGhvciwgZXJyKXtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBmYWlsdXJlKGVycik7XG4gICAgICAvLyBmYWlsdXJlXG4gICAgfSBlbHNlIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGZpbmRCb29va3NCeUF1dGhvcihhdXRob3IsIGZ1bmN0aW9uKGJvb2tzLCBlcnIpIHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBmYWlsdXJlKGVycik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGZvdW5kQm9va3MoYm9va3MpO1xuICAgICAgICAgICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgICAgICAgICAgZmFpbHVyZShyZWFzb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgIGZhaWx1cmUoZXJyKTtcbiAgICAgIH1cbiAgICAgIC8vIHN1Y2Nlc3NcbiAgICB9XG4gIH0pO1xuICBgYGBcbiAgIFByb21pc2UgRXhhbXBsZTtcbiAgIGBgYGphdmFzY3JpcHRcbiAgZmluZEF1dGhvcigpLlxuICAgIHRoZW4oZmluZEJvb2tzQnlBdXRob3IpLlxuICAgIHRoZW4oZnVuY3Rpb24oYm9va3Mpe1xuICAgICAgLy8gZm91bmQgYm9va3NcbiAgfSkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKXtcbiAgICAvLyBzb21ldGhpbmcgd2VudCB3cm9uZ1xuICB9KTtcbiAgYGBgXG4gICBAbWV0aG9kIHRoZW5cbiAgQHBhcmFtIHtGdW5jdGlvbn0gb25GdWxmaWxsZWRcbiAgQHBhcmFtIHtGdW5jdGlvbn0gb25SZWplY3RlZFxuICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gIEByZXR1cm4ge1Byb21pc2V9XG4gICovXG5cbiAgLyoqXG4gIGBjYXRjaGAgaXMgc2ltcGx5IHN1Z2FyIGZvciBgdGhlbih1bmRlZmluZWQsIG9uUmVqZWN0aW9uKWAgd2hpY2ggbWFrZXMgaXQgdGhlIHNhbWVcbiAgYXMgdGhlIGNhdGNoIGJsb2NrIG9mIGEgdHJ5L2NhdGNoIHN0YXRlbWVudC5cbiAgYGBganNcbiAgZnVuY3Rpb24gZmluZEF1dGhvcigpe1xuICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkbid0IGZpbmQgdGhhdCBhdXRob3InKTtcbiAgfVxuICAvLyBzeW5jaHJvbm91c1xuICB0cnkge1xuICBmaW5kQXV0aG9yKCk7XG4gIH0gY2F0Y2gocmVhc29uKSB7XG4gIC8vIHNvbWV0aGluZyB3ZW50IHdyb25nXG4gIH1cbiAgLy8gYXN5bmMgd2l0aCBwcm9taXNlc1xuICBmaW5kQXV0aG9yKCkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKXtcbiAgLy8gc29tZXRoaW5nIHdlbnQgd3JvbmdcbiAgfSk7XG4gIGBgYFxuICBAbWV0aG9kIGNhdGNoXG4gIEBwYXJhbSB7RnVuY3Rpb259IG9uUmVqZWN0aW9uXG4gIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgQHJldHVybiB7UHJvbWlzZX1cbiAgKi9cblxuXG4gIFByb21pc2UucHJvdG90eXBlLmNhdGNoID0gZnVuY3Rpb24gX2NhdGNoKG9uUmVqZWN0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihudWxsLCBvblJlamVjdGlvbik7XG4gIH07XG5cbiAgLyoqXG4gICAgYGZpbmFsbHlgIHdpbGwgYmUgaW52b2tlZCByZWdhcmRsZXNzIG9mIHRoZSBwcm9taXNlJ3MgZmF0ZSBqdXN0IGFzIG5hdGl2ZVxuICAgIHRyeS9jYXRjaC9maW5hbGx5IGJlaGF2ZXNcbiAgXG4gICAgU3luY2hyb25vdXMgZXhhbXBsZTpcbiAgXG4gICAgYGBganNcbiAgICBmaW5kQXV0aG9yKCkge1xuICAgICAgaWYgKE1hdGgucmFuZG9tKCkgPiAwLjUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IEF1dGhvcigpO1xuICAgIH1cbiAgXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBmaW5kQXV0aG9yKCk7IC8vIHN1Y2NlZWQgb3IgZmFpbFxuICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgIHJldHVybiBmaW5kT3RoZXJBdXRoZXIoKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgLy8gYWx3YXlzIHJ1bnNcbiAgICAgIC8vIGRvZXNuJ3QgYWZmZWN0IHRoZSByZXR1cm4gdmFsdWVcbiAgICB9XG4gICAgYGBgXG4gIFxuICAgIEFzeW5jaHJvbm91cyBleGFtcGxlOlxuICBcbiAgICBgYGBqc1xuICAgIGZpbmRBdXRob3IoKS5jYXRjaChmdW5jdGlvbihyZWFzb24pe1xuICAgICAgcmV0dXJuIGZpbmRPdGhlckF1dGhlcigpO1xuICAgIH0pLmZpbmFsbHkoZnVuY3Rpb24oKXtcbiAgICAgIC8vIGF1dGhvciB3YXMgZWl0aGVyIGZvdW5kLCBvciBub3RcbiAgICB9KTtcbiAgICBgYGBcbiAgXG4gICAgQG1ldGhvZCBmaW5hbGx5XG4gICAgQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAgICBAcmV0dXJuIHtQcm9taXNlfVxuICAqL1xuXG5cbiAgUHJvbWlzZS5wcm90b3R5cGUuZmluYWxseSA9IGZ1bmN0aW9uIF9maW5hbGx5KGNhbGxiYWNrKSB7XG4gICAgdmFyIHByb21pc2UgPSB0aGlzO1xuICAgIHZhciBjb25zdHJ1Y3RvciA9IHByb21pc2UuY29uc3RydWN0b3I7XG5cbiAgICBpZiAoaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcbiAgICAgIHJldHVybiBwcm9taXNlLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBjb25zdHJ1Y3Rvci5yZXNvbHZlKGNhbGxiYWNrKCkpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSk7XG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIHJldHVybiBjb25zdHJ1Y3Rvci5yZXNvbHZlKGNhbGxiYWNrKCkpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHRocm93IHJlYXNvbjtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvbWlzZS50aGVuKGNhbGxiYWNrLCBjYWxsYmFjayk7XG4gIH07XG5cbiAgcmV0dXJuIFByb21pc2U7XG59KCk7XG5cblByb21pc2UkMS5wcm90b3R5cGUudGhlbiA9IHRoZW47XG5Qcm9taXNlJDEuYWxsID0gYWxsO1xuUHJvbWlzZSQxLnJhY2UgPSByYWNlO1xuUHJvbWlzZSQxLnJlc29sdmUgPSByZXNvbHZlJDE7XG5Qcm9taXNlJDEucmVqZWN0ID0gcmVqZWN0JDE7XG5Qcm9taXNlJDEuX3NldFNjaGVkdWxlciA9IHNldFNjaGVkdWxlcjtcblByb21pc2UkMS5fc2V0QXNhcCA9IHNldEFzYXA7XG5Qcm9taXNlJDEuX2FzYXAgPSBhc2FwO1xuXG4vKmdsb2JhbCBzZWxmKi9cbmZ1bmN0aW9uIHBvbHlmaWxsKCkge1xuICB2YXIgbG9jYWwgPSB2b2lkIDA7XG5cbiAgaWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbG9jYWwgPSBnbG9iYWw7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbG9jYWwgPSBzZWxmO1xuICB9IGVsc2Uge1xuICAgIHRyeSB7XG4gICAgICBsb2NhbCA9IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdwb2x5ZmlsbCBmYWlsZWQgYmVjYXVzZSBnbG9iYWwgb2JqZWN0IGlzIHVuYXZhaWxhYmxlIGluIHRoaXMgZW52aXJvbm1lbnQnKTtcbiAgICB9XG4gIH1cblxuICB2YXIgUCA9IGxvY2FsLlByb21pc2U7XG5cbiAgaWYgKFApIHtcbiAgICB2YXIgcHJvbWlzZVRvU3RyaW5nID0gbnVsbDtcbiAgICB0cnkge1xuICAgICAgcHJvbWlzZVRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKFAucmVzb2x2ZSgpKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBzaWxlbnRseSBpZ25vcmVkXG4gICAgfVxuXG4gICAgaWYgKHByb21pc2VUb1N0cmluZyA9PT0gJ1tvYmplY3QgUHJvbWlzZV0nICYmICFQLmNhc3QpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICBsb2NhbC5Qcm9taXNlID0gUHJvbWlzZSQxO1xufVxuXG4vLyBTdHJhbmdlIGNvbXBhdC4uXG5Qcm9taXNlJDEucG9seWZpbGwgPSBwb2x5ZmlsbDtcblByb21pc2UkMS5Qcm9taXNlID0gUHJvbWlzZSQxO1xuXG5yZXR1cm4gUHJvbWlzZSQxO1xuXG59KSkpO1xuXG5cblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZXM2LXByb21pc2UubWFwXG4iLCIvKipcbiAqIGxvZGFzaCAoQ3VzdG9tIEJ1aWxkKSA8aHR0cHM6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgZXhwb3J0cz1cIm5wbVwiIC1vIC4vYFxuICogQ29weXJpZ2h0IGpRdWVyeSBGb3VuZGF0aW9uIGFuZCBvdGhlciBjb250cmlidXRvcnMgPGh0dHBzOi8vanF1ZXJ5Lm9yZy8+XG4gKiBSZWxlYXNlZCB1bmRlciBNSVQgbGljZW5zZSA8aHR0cHM6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuOC4zIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKi9cblxuLyoqIFVzZWQgYXMgdGhlIGBUeXBlRXJyb3JgIG1lc3NhZ2UgZm9yIFwiRnVuY3Rpb25zXCIgbWV0aG9kcy4gKi9cbnZhciBGVU5DX0VSUk9SX1RFWFQgPSAnRXhwZWN0ZWQgYSBmdW5jdGlvbic7XG5cbi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIE5BTiA9IDAgLyAwO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgc3ltYm9sVGFnID0gJ1tvYmplY3QgU3ltYm9sXSc7XG5cbi8qKiBVc2VkIHRvIG1hdGNoIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UuICovXG52YXIgcmVUcmltID0gL15cXHMrfFxccyskL2c7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBiYWQgc2lnbmVkIGhleGFkZWNpbWFsIHN0cmluZyB2YWx1ZXMuICovXG52YXIgcmVJc0JhZEhleCA9IC9eWy0rXTB4WzAtOWEtZl0rJC9pO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgYmluYXJ5IHN0cmluZyB2YWx1ZXMuICovXG52YXIgcmVJc0JpbmFyeSA9IC9eMGJbMDFdKyQvaTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IG9jdGFsIHN0cmluZyB2YWx1ZXMuICovXG52YXIgcmVJc09jdGFsID0gL14wb1swLTddKyQvaTtcblxuLyoqIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHdpdGhvdXQgYSBkZXBlbmRlbmN5IG9uIGByb290YC4gKi9cbnZhciBmcmVlUGFyc2VJbnQgPSBwYXJzZUludDtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBnbG9iYWxgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwgJiYgZ2xvYmFsLk9iamVjdCA9PT0gT2JqZWN0ICYmIGdsb2JhbDtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBzZWxmYC4gKi9cbnZhciBmcmVlU2VsZiA9IHR5cGVvZiBzZWxmID09ICdvYmplY3QnICYmIHNlbGYgJiYgc2VsZi5PYmplY3QgPT09IE9iamVjdCAmJiBzZWxmO1xuXG4vKiogVXNlZCBhcyBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsIG9iamVjdC4gKi9cbnZhciByb290ID0gZnJlZUdsb2JhbCB8fCBmcmVlU2VsZiB8fCBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgb2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZU1heCA9IE1hdGgubWF4LFxuICAgIG5hdGl2ZU1pbiA9IE1hdGgubWluO1xuXG4vKipcbiAqIEdldHMgdGhlIHRpbWVzdGFtcCBvZiB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0aGF0IGhhdmUgZWxhcHNlZCBzaW5jZVxuICogdGhlIFVuaXggZXBvY2ggKDEgSmFudWFyeSAxOTcwIDAwOjAwOjAwIFVUQykuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAyLjQuMFxuICogQGNhdGVnb3J5IERhdGVcbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIHRpbWVzdGFtcC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5kZWZlcihmdW5jdGlvbihzdGFtcCkge1xuICogICBjb25zb2xlLmxvZyhfLm5vdygpIC0gc3RhbXApO1xuICogfSwgXy5ub3coKSk7XG4gKiAvLyA9PiBMb2dzIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGl0IHRvb2sgZm9yIHRoZSBkZWZlcnJlZCBpbnZvY2F0aW9uLlxuICovXG52YXIgbm93ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiByb290LkRhdGUubm93KCk7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBkZWJvdW5jZWQgZnVuY3Rpb24gdGhhdCBkZWxheXMgaW52b2tpbmcgYGZ1bmNgIHVudGlsIGFmdGVyIGB3YWl0YFxuICogbWlsbGlzZWNvbmRzIGhhdmUgZWxhcHNlZCBzaW5jZSB0aGUgbGFzdCB0aW1lIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gd2FzXG4gKiBpbnZva2VkLiBUaGUgZGVib3VuY2VkIGZ1bmN0aW9uIGNvbWVzIHdpdGggYSBgY2FuY2VsYCBtZXRob2QgdG8gY2FuY2VsXG4gKiBkZWxheWVkIGBmdW5jYCBpbnZvY2F0aW9ucyBhbmQgYSBgZmx1c2hgIG1ldGhvZCB0byBpbW1lZGlhdGVseSBpbnZva2UgdGhlbS5cbiAqIFByb3ZpZGUgYG9wdGlvbnNgIHRvIGluZGljYXRlIHdoZXRoZXIgYGZ1bmNgIHNob3VsZCBiZSBpbnZva2VkIG9uIHRoZVxuICogbGVhZGluZyBhbmQvb3IgdHJhaWxpbmcgZWRnZSBvZiB0aGUgYHdhaXRgIHRpbWVvdXQuIFRoZSBgZnVuY2AgaXMgaW52b2tlZFxuICogd2l0aCB0aGUgbGFzdCBhcmd1bWVudHMgcHJvdmlkZWQgdG8gdGhlIGRlYm91bmNlZCBmdW5jdGlvbi4gU3Vic2VxdWVudFxuICogY2FsbHMgdG8gdGhlIGRlYm91bmNlZCBmdW5jdGlvbiByZXR1cm4gdGhlIHJlc3VsdCBvZiB0aGUgbGFzdCBgZnVuY2BcbiAqIGludm9jYXRpb24uXG4gKlxuICogKipOb3RlOioqIElmIGBsZWFkaW5nYCBhbmQgYHRyYWlsaW5nYCBvcHRpb25zIGFyZSBgdHJ1ZWAsIGBmdW5jYCBpc1xuICogaW52b2tlZCBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dCBvbmx5IGlmIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb25cbiAqIGlzIGludm9rZWQgbW9yZSB0aGFuIG9uY2UgZHVyaW5nIHRoZSBgd2FpdGAgdGltZW91dC5cbiAqXG4gKiBJZiBgd2FpdGAgaXMgYDBgIGFuZCBgbGVhZGluZ2AgaXMgYGZhbHNlYCwgYGZ1bmNgIGludm9jYXRpb24gaXMgZGVmZXJyZWRcbiAqIHVudGlsIHRvIHRoZSBuZXh0IHRpY2ssIHNpbWlsYXIgdG8gYHNldFRpbWVvdXRgIHdpdGggYSB0aW1lb3V0IG9mIGAwYC5cbiAqXG4gKiBTZWUgW0RhdmlkIENvcmJhY2hvJ3MgYXJ0aWNsZV0oaHR0cHM6Ly9jc3MtdHJpY2tzLmNvbS9kZWJvdW5jaW5nLXRocm90dGxpbmctZXhwbGFpbmVkLWV4YW1wbGVzLylcbiAqIGZvciBkZXRhaWxzIG92ZXIgdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gYF8uZGVib3VuY2VgIGFuZCBgXy50aHJvdHRsZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBkZWJvdW5jZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbd2FpdD0wXSBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byBkZWxheS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gVGhlIG9wdGlvbnMgb2JqZWN0LlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5sZWFkaW5nPWZhbHNlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIGxlYWRpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5tYXhXYWl0XVxuICogIFRoZSBtYXhpbXVtIHRpbWUgYGZ1bmNgIGlzIGFsbG93ZWQgdG8gYmUgZGVsYXllZCBiZWZvcmUgaXQncyBpbnZva2VkLlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy50cmFpbGluZz10cnVlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBkZWJvdW5jZWQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIEF2b2lkIGNvc3RseSBjYWxjdWxhdGlvbnMgd2hpbGUgdGhlIHdpbmRvdyBzaXplIGlzIGluIGZsdXguXG4gKiBqUXVlcnkod2luZG93KS5vbigncmVzaXplJywgXy5kZWJvdW5jZShjYWxjdWxhdGVMYXlvdXQsIDE1MCkpO1xuICpcbiAqIC8vIEludm9rZSBgc2VuZE1haWxgIHdoZW4gY2xpY2tlZCwgZGVib3VuY2luZyBzdWJzZXF1ZW50IGNhbGxzLlxuICogalF1ZXJ5KGVsZW1lbnQpLm9uKCdjbGljaycsIF8uZGVib3VuY2Uoc2VuZE1haWwsIDMwMCwge1xuICogICAnbGVhZGluZyc6IHRydWUsXG4gKiAgICd0cmFpbGluZyc6IGZhbHNlXG4gKiB9KSk7XG4gKlxuICogLy8gRW5zdXJlIGBiYXRjaExvZ2AgaXMgaW52b2tlZCBvbmNlIGFmdGVyIDEgc2Vjb25kIG9mIGRlYm91bmNlZCBjYWxscy5cbiAqIHZhciBkZWJvdW5jZWQgPSBfLmRlYm91bmNlKGJhdGNoTG9nLCAyNTAsIHsgJ21heFdhaXQnOiAxMDAwIH0pO1xuICogdmFyIHNvdXJjZSA9IG5ldyBFdmVudFNvdXJjZSgnL3N0cmVhbScpO1xuICogalF1ZXJ5KHNvdXJjZSkub24oJ21lc3NhZ2UnLCBkZWJvdW5jZWQpO1xuICpcbiAqIC8vIENhbmNlbCB0aGUgdHJhaWxpbmcgZGVib3VuY2VkIGludm9jYXRpb24uXG4gKiBqUXVlcnkod2luZG93KS5vbigncG9wc3RhdGUnLCBkZWJvdW5jZWQuY2FuY2VsKTtcbiAqL1xuZnVuY3Rpb24gZGVib3VuY2UoZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICB2YXIgbGFzdEFyZ3MsXG4gICAgICBsYXN0VGhpcyxcbiAgICAgIG1heFdhaXQsXG4gICAgICByZXN1bHQsXG4gICAgICB0aW1lcklkLFxuICAgICAgbGFzdENhbGxUaW1lLFxuICAgICAgbGFzdEludm9rZVRpbWUgPSAwLFxuICAgICAgbGVhZGluZyA9IGZhbHNlLFxuICAgICAgbWF4aW5nID0gZmFsc2UsXG4gICAgICB0cmFpbGluZyA9IHRydWU7XG5cbiAgaWYgKHR5cGVvZiBmdW5jICE9ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKEZVTkNfRVJST1JfVEVYVCk7XG4gIH1cbiAgd2FpdCA9IHRvTnVtYmVyKHdhaXQpIHx8IDA7XG4gIGlmIChpc09iamVjdChvcHRpb25zKSkge1xuICAgIGxlYWRpbmcgPSAhIW9wdGlvbnMubGVhZGluZztcbiAgICBtYXhpbmcgPSAnbWF4V2FpdCcgaW4gb3B0aW9ucztcbiAgICBtYXhXYWl0ID0gbWF4aW5nID8gbmF0aXZlTWF4KHRvTnVtYmVyKG9wdGlvbnMubWF4V2FpdCkgfHwgMCwgd2FpdCkgOiBtYXhXYWl0O1xuICAgIHRyYWlsaW5nID0gJ3RyYWlsaW5nJyBpbiBvcHRpb25zID8gISFvcHRpb25zLnRyYWlsaW5nIDogdHJhaWxpbmc7XG4gIH1cblxuICBmdW5jdGlvbiBpbnZva2VGdW5jKHRpbWUpIHtcbiAgICB2YXIgYXJncyA9IGxhc3RBcmdzLFxuICAgICAgICB0aGlzQXJnID0gbGFzdFRoaXM7XG5cbiAgICBsYXN0QXJncyA9IGxhc3RUaGlzID0gdW5kZWZpbmVkO1xuICAgIGxhc3RJbnZva2VUaW1lID0gdGltZTtcbiAgICByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBsZWFkaW5nRWRnZSh0aW1lKSB7XG4gICAgLy8gUmVzZXQgYW55IGBtYXhXYWl0YCB0aW1lci5cbiAgICBsYXN0SW52b2tlVGltZSA9IHRpbWU7XG4gICAgLy8gU3RhcnQgdGhlIHRpbWVyIGZvciB0aGUgdHJhaWxpbmcgZWRnZS5cbiAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHdhaXQpO1xuICAgIC8vIEludm9rZSB0aGUgbGVhZGluZyBlZGdlLlxuICAgIHJldHVybiBsZWFkaW5nID8gaW52b2tlRnVuYyh0aW1lKSA6IHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbWFpbmluZ1dhaXQodGltZSkge1xuICAgIHZhciB0aW1lU2luY2VMYXN0Q2FsbCA9IHRpbWUgLSBsYXN0Q2FsbFRpbWUsXG4gICAgICAgIHRpbWVTaW5jZUxhc3RJbnZva2UgPSB0aW1lIC0gbGFzdEludm9rZVRpbWUsXG4gICAgICAgIHJlc3VsdCA9IHdhaXQgLSB0aW1lU2luY2VMYXN0Q2FsbDtcblxuICAgIHJldHVybiBtYXhpbmcgPyBuYXRpdmVNaW4ocmVzdWx0LCBtYXhXYWl0IC0gdGltZVNpbmNlTGFzdEludm9rZSkgOiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBzaG91bGRJbnZva2UodGltZSkge1xuICAgIHZhciB0aW1lU2luY2VMYXN0Q2FsbCA9IHRpbWUgLSBsYXN0Q2FsbFRpbWUsXG4gICAgICAgIHRpbWVTaW5jZUxhc3RJbnZva2UgPSB0aW1lIC0gbGFzdEludm9rZVRpbWU7XG5cbiAgICAvLyBFaXRoZXIgdGhpcyBpcyB0aGUgZmlyc3QgY2FsbCwgYWN0aXZpdHkgaGFzIHN0b3BwZWQgYW5kIHdlJ3JlIGF0IHRoZVxuICAgIC8vIHRyYWlsaW5nIGVkZ2UsIHRoZSBzeXN0ZW0gdGltZSBoYXMgZ29uZSBiYWNrd2FyZHMgYW5kIHdlJ3JlIHRyZWF0aW5nXG4gICAgLy8gaXQgYXMgdGhlIHRyYWlsaW5nIGVkZ2UsIG9yIHdlJ3ZlIGhpdCB0aGUgYG1heFdhaXRgIGxpbWl0LlxuICAgIHJldHVybiAobGFzdENhbGxUaW1lID09PSB1bmRlZmluZWQgfHwgKHRpbWVTaW5jZUxhc3RDYWxsID49IHdhaXQpIHx8XG4gICAgICAodGltZVNpbmNlTGFzdENhbGwgPCAwKSB8fCAobWF4aW5nICYmIHRpbWVTaW5jZUxhc3RJbnZva2UgPj0gbWF4V2FpdCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gdGltZXJFeHBpcmVkKCkge1xuICAgIHZhciB0aW1lID0gbm93KCk7XG4gICAgaWYgKHNob3VsZEludm9rZSh0aW1lKSkge1xuICAgICAgcmV0dXJuIHRyYWlsaW5nRWRnZSh0aW1lKTtcbiAgICB9XG4gICAgLy8gUmVzdGFydCB0aGUgdGltZXIuXG4gICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCByZW1haW5pbmdXYWl0KHRpbWUpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRyYWlsaW5nRWRnZSh0aW1lKSB7XG4gICAgdGltZXJJZCA9IHVuZGVmaW5lZDtcblxuICAgIC8vIE9ubHkgaW52b2tlIGlmIHdlIGhhdmUgYGxhc3RBcmdzYCB3aGljaCBtZWFucyBgZnVuY2AgaGFzIGJlZW5cbiAgICAvLyBkZWJvdW5jZWQgYXQgbGVhc3Qgb25jZS5cbiAgICBpZiAodHJhaWxpbmcgJiYgbGFzdEFyZ3MpIHtcbiAgICAgIHJldHVybiBpbnZva2VGdW5jKHRpbWUpO1xuICAgIH1cbiAgICBsYXN0QXJncyA9IGxhc3RUaGlzID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBjYW5jZWwoKSB7XG4gICAgaWYgKHRpbWVySWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVySWQpO1xuICAgIH1cbiAgICBsYXN0SW52b2tlVGltZSA9IDA7XG4gICAgbGFzdEFyZ3MgPSBsYXN0Q2FsbFRpbWUgPSBsYXN0VGhpcyA9IHRpbWVySWQgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBmdW5jdGlvbiBmbHVzaCgpIHtcbiAgICByZXR1cm4gdGltZXJJZCA9PT0gdW5kZWZpbmVkID8gcmVzdWx0IDogdHJhaWxpbmdFZGdlKG5vdygpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlYm91bmNlZCgpIHtcbiAgICB2YXIgdGltZSA9IG5vdygpLFxuICAgICAgICBpc0ludm9raW5nID0gc2hvdWxkSW52b2tlKHRpbWUpO1xuXG4gICAgbGFzdEFyZ3MgPSBhcmd1bWVudHM7XG4gICAgbGFzdFRoaXMgPSB0aGlzO1xuICAgIGxhc3RDYWxsVGltZSA9IHRpbWU7XG5cbiAgICBpZiAoaXNJbnZva2luZykge1xuICAgICAgaWYgKHRpbWVySWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gbGVhZGluZ0VkZ2UobGFzdENhbGxUaW1lKTtcbiAgICAgIH1cbiAgICAgIGlmIChtYXhpbmcpIHtcbiAgICAgICAgLy8gSGFuZGxlIGludm9jYXRpb25zIGluIGEgdGlnaHQgbG9vcC5cbiAgICAgICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCB3YWl0KTtcbiAgICAgICAgcmV0dXJuIGludm9rZUZ1bmMobGFzdENhbGxUaW1lKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRpbWVySWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCB3YWl0KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICBkZWJvdW5jZWQuY2FuY2VsID0gY2FuY2VsO1xuICBkZWJvdW5jZWQuZmx1c2ggPSBmbHVzaDtcbiAgcmV0dXJuIGRlYm91bmNlZDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgdGhyb3R0bGVkIGZ1bmN0aW9uIHRoYXQgb25seSBpbnZva2VzIGBmdW5jYCBhdCBtb3N0IG9uY2UgcGVyXG4gKiBldmVyeSBgd2FpdGAgbWlsbGlzZWNvbmRzLiBUaGUgdGhyb3R0bGVkIGZ1bmN0aW9uIGNvbWVzIHdpdGggYSBgY2FuY2VsYFxuICogbWV0aG9kIHRvIGNhbmNlbCBkZWxheWVkIGBmdW5jYCBpbnZvY2F0aW9ucyBhbmQgYSBgZmx1c2hgIG1ldGhvZCB0b1xuICogaW1tZWRpYXRlbHkgaW52b2tlIHRoZW0uIFByb3ZpZGUgYG9wdGlvbnNgIHRvIGluZGljYXRlIHdoZXRoZXIgYGZ1bmNgXG4gKiBzaG91bGQgYmUgaW52b2tlZCBvbiB0aGUgbGVhZGluZyBhbmQvb3IgdHJhaWxpbmcgZWRnZSBvZiB0aGUgYHdhaXRgXG4gKiB0aW1lb3V0LiBUaGUgYGZ1bmNgIGlzIGludm9rZWQgd2l0aCB0aGUgbGFzdCBhcmd1bWVudHMgcHJvdmlkZWQgdG8gdGhlXG4gKiB0aHJvdHRsZWQgZnVuY3Rpb24uIFN1YnNlcXVlbnQgY2FsbHMgdG8gdGhlIHRocm90dGxlZCBmdW5jdGlvbiByZXR1cm4gdGhlXG4gKiByZXN1bHQgb2YgdGhlIGxhc3QgYGZ1bmNgIGludm9jYXRpb24uXG4gKlxuICogKipOb3RlOioqIElmIGBsZWFkaW5nYCBhbmQgYHRyYWlsaW5nYCBvcHRpb25zIGFyZSBgdHJ1ZWAsIGBmdW5jYCBpc1xuICogaW52b2tlZCBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dCBvbmx5IGlmIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb25cbiAqIGlzIGludm9rZWQgbW9yZSB0aGFuIG9uY2UgZHVyaW5nIHRoZSBgd2FpdGAgdGltZW91dC5cbiAqXG4gKiBJZiBgd2FpdGAgaXMgYDBgIGFuZCBgbGVhZGluZ2AgaXMgYGZhbHNlYCwgYGZ1bmNgIGludm9jYXRpb24gaXMgZGVmZXJyZWRcbiAqIHVudGlsIHRvIHRoZSBuZXh0IHRpY2ssIHNpbWlsYXIgdG8gYHNldFRpbWVvdXRgIHdpdGggYSB0aW1lb3V0IG9mIGAwYC5cbiAqXG4gKiBTZWUgW0RhdmlkIENvcmJhY2hvJ3MgYXJ0aWNsZV0oaHR0cHM6Ly9jc3MtdHJpY2tzLmNvbS9kZWJvdW5jaW5nLXRocm90dGxpbmctZXhwbGFpbmVkLWV4YW1wbGVzLylcbiAqIGZvciBkZXRhaWxzIG92ZXIgdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gYF8udGhyb3R0bGVgIGFuZCBgXy5kZWJvdW5jZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byB0aHJvdHRsZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbd2FpdD0wXSBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byB0aHJvdHRsZSBpbnZvY2F0aW9ucyB0by5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gVGhlIG9wdGlvbnMgb2JqZWN0LlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5sZWFkaW5nPXRydWVdXG4gKiAgU3BlY2lmeSBpbnZva2luZyBvbiB0aGUgbGVhZGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy50cmFpbGluZz10cnVlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyB0aHJvdHRsZWQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIEF2b2lkIGV4Y2Vzc2l2ZWx5IHVwZGF0aW5nIHRoZSBwb3NpdGlvbiB3aGlsZSBzY3JvbGxpbmcuXG4gKiBqUXVlcnkod2luZG93KS5vbignc2Nyb2xsJywgXy50aHJvdHRsZSh1cGRhdGVQb3NpdGlvbiwgMTAwKSk7XG4gKlxuICogLy8gSW52b2tlIGByZW5ld1Rva2VuYCB3aGVuIHRoZSBjbGljayBldmVudCBpcyBmaXJlZCwgYnV0IG5vdCBtb3JlIHRoYW4gb25jZSBldmVyeSA1IG1pbnV0ZXMuXG4gKiB2YXIgdGhyb3R0bGVkID0gXy50aHJvdHRsZShyZW5ld1Rva2VuLCAzMDAwMDAsIHsgJ3RyYWlsaW5nJzogZmFsc2UgfSk7XG4gKiBqUXVlcnkoZWxlbWVudCkub24oJ2NsaWNrJywgdGhyb3R0bGVkKTtcbiAqXG4gKiAvLyBDYW5jZWwgdGhlIHRyYWlsaW5nIHRocm90dGxlZCBpbnZvY2F0aW9uLlxuICogalF1ZXJ5KHdpbmRvdykub24oJ3BvcHN0YXRlJywgdGhyb3R0bGVkLmNhbmNlbCk7XG4gKi9cbmZ1bmN0aW9uIHRocm90dGxlKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgdmFyIGxlYWRpbmcgPSB0cnVlLFxuICAgICAgdHJhaWxpbmcgPSB0cnVlO1xuXG4gIGlmICh0eXBlb2YgZnVuYyAhPSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihGVU5DX0VSUk9SX1RFWFQpO1xuICB9XG4gIGlmIChpc09iamVjdChvcHRpb25zKSkge1xuICAgIGxlYWRpbmcgPSAnbGVhZGluZycgaW4gb3B0aW9ucyA/ICEhb3B0aW9ucy5sZWFkaW5nIDogbGVhZGluZztcbiAgICB0cmFpbGluZyA9ICd0cmFpbGluZycgaW4gb3B0aW9ucyA/ICEhb3B0aW9ucy50cmFpbGluZyA6IHRyYWlsaW5nO1xuICB9XG4gIHJldHVybiBkZWJvdW5jZShmdW5jLCB3YWl0LCB7XG4gICAgJ2xlYWRpbmcnOiBsZWFkaW5nLFxuICAgICdtYXhXYWl0Jzogd2FpdCxcbiAgICAndHJhaWxpbmcnOiB0cmFpbGluZ1xuICB9KTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyB0aGVcbiAqIFtsYW5ndWFnZSB0eXBlXShodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtZWNtYXNjcmlwdC1sYW5ndWFnZS10eXBlcylcbiAqIG9mIGBPYmplY3RgLiAoZS5nLiBhcnJheXMsIGZ1bmN0aW9ucywgb2JqZWN0cywgcmVnZXhlcywgYG5ldyBOdW1iZXIoMClgLCBhbmQgYG5ldyBTdHJpbmcoJycpYClcbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdCh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoXy5ub29wKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIHJldHVybiAhIXZhbHVlICYmICh0eXBlID09ICdvYmplY3QnIHx8IHR5cGUgPT0gJ2Z1bmN0aW9uJyk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UuIEEgdmFsdWUgaXMgb2JqZWN0LWxpa2UgaWYgaXQncyBub3QgYG51bGxgXG4gKiBhbmQgaGFzIGEgYHR5cGVvZmAgcmVzdWx0IG9mIFwib2JqZWN0XCIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdExpa2Uoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc09iamVjdExpa2UobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcbiAgcmV0dXJuICEhdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgU3ltYm9sYCBwcmltaXRpdmUgb3Igb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgc3ltYm9sLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNTeW1ib2woU3ltYm9sLml0ZXJhdG9yKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzU3ltYm9sKCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3ltYm9sKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N5bWJvbCcgfHxcbiAgICAoaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBvYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKSA9PSBzeW1ib2xUYWcpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBudW1iZXIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHByb2Nlc3MuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBudW1iZXIuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udG9OdW1iZXIoMy4yKTtcbiAqIC8vID0+IDMuMlxuICpcbiAqIF8udG9OdW1iZXIoTnVtYmVyLk1JTl9WQUxVRSk7XG4gKiAvLyA9PiA1ZS0zMjRcbiAqXG4gKiBfLnRvTnVtYmVyKEluZmluaXR5KTtcbiAqIC8vID0+IEluZmluaXR5XG4gKlxuICogXy50b051bWJlcignMy4yJyk7XG4gKiAvLyA9PiAzLjJcbiAqL1xuZnVuY3Rpb24gdG9OdW1iZXIodmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJykge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBpZiAoaXNTeW1ib2wodmFsdWUpKSB7XG4gICAgcmV0dXJuIE5BTjtcbiAgfVxuICBpZiAoaXNPYmplY3QodmFsdWUpKSB7XG4gICAgdmFyIG90aGVyID0gdHlwZW9mIHZhbHVlLnZhbHVlT2YgPT0gJ2Z1bmN0aW9uJyA/IHZhbHVlLnZhbHVlT2YoKSA6IHZhbHVlO1xuICAgIHZhbHVlID0gaXNPYmplY3Qob3RoZXIpID8gKG90aGVyICsgJycpIDogb3RoZXI7XG4gIH1cbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gMCA/IHZhbHVlIDogK3ZhbHVlO1xuICB9XG4gIHZhbHVlID0gdmFsdWUucmVwbGFjZShyZVRyaW0sICcnKTtcbiAgdmFyIGlzQmluYXJ5ID0gcmVJc0JpbmFyeS50ZXN0KHZhbHVlKTtcbiAgcmV0dXJuIChpc0JpbmFyeSB8fCByZUlzT2N0YWwudGVzdCh2YWx1ZSkpXG4gICAgPyBmcmVlUGFyc2VJbnQodmFsdWUuc2xpY2UoMiksIGlzQmluYXJ5ID8gMiA6IDgpXG4gICAgOiAocmVJc0JhZEhleC50ZXN0KHZhbHVlKSA/IE5BTiA6ICt2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGhyb3R0bGU7XG4iLCJ2YXIgd2lsZGNhcmQgPSByZXF1aXJlKCd3aWxkY2FyZCcpO1xudmFyIHJlTWltZVBhcnRTcGxpdCA9IC9bXFwvXFwrXFwuXS87XG5cbi8qKlxuICAjIG1pbWUtbWF0Y2hcblxuICBBIHNpbXBsZSBmdW5jdGlvbiB0byBjaGVja2VyIHdoZXRoZXIgYSB0YXJnZXQgbWltZSB0eXBlIG1hdGNoZXMgYSBtaW1lLXR5cGVcbiAgcGF0dGVybiAoZS5nLiBpbWFnZS9qcGVnIG1hdGNoZXMgaW1hZ2UvanBlZyBPUiBpbWFnZS8qKS5cblxuICAjIyBFeGFtcGxlIFVzYWdlXG5cbiAgPDw8IGV4YW1wbGUuanNcblxuKiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRhcmdldCwgcGF0dGVybikge1xuICBmdW5jdGlvbiB0ZXN0KHBhdHRlcm4pIHtcbiAgICB2YXIgcmVzdWx0ID0gd2lsZGNhcmQocGF0dGVybiwgdGFyZ2V0LCByZU1pbWVQYXJ0U3BsaXQpO1xuXG4gICAgLy8gZW5zdXJlIHRoYXQgd2UgaGF2ZSBhIHZhbGlkIG1pbWUgdHlwZSAoc2hvdWxkIGhhdmUgdHdvIHBhcnRzKVxuICAgIHJldHVybiByZXN1bHQgJiYgcmVzdWx0Lmxlbmd0aCA+PSAyO1xuICB9XG5cbiAgcmV0dXJuIHBhdHRlcm4gPyB0ZXN0KHBhdHRlcm4uc3BsaXQoJzsnKVswXSkgOiB0ZXN0O1xufTtcbiIsIi8qKlxuKiBDcmVhdGUgYW4gZXZlbnQgZW1pdHRlciB3aXRoIG5hbWVzcGFjZXNcbiogQG5hbWUgY3JlYXRlTmFtZXNwYWNlRW1pdHRlclxuKiBAZXhhbXBsZVxuKiB2YXIgZW1pdHRlciA9IHJlcXVpcmUoJy4vaW5kZXgnKSgpXG4qXG4qIGVtaXR0ZXIub24oJyonLCBmdW5jdGlvbiAoKSB7XG4qICAgY29uc29sZS5sb2coJ2FsbCBldmVudHMgZW1pdHRlZCcsIHRoaXMuZXZlbnQpXG4qIH0pXG4qXG4qIGVtaXR0ZXIub24oJ2V4YW1wbGUnLCBmdW5jdGlvbiAoKSB7XG4qICAgY29uc29sZS5sb2coJ2V4YW1wbGUgZXZlbnQgZW1pdHRlZCcpXG4qIH0pXG4qL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVOYW1lc3BhY2VFbWl0dGVyICgpIHtcbiAgdmFyIGVtaXR0ZXIgPSB7fVxuICB2YXIgX2ZucyA9IGVtaXR0ZXIuX2ZucyA9IHt9XG5cbiAgLyoqXG4gICogRW1pdCBhbiBldmVudC4gT3B0aW9uYWxseSBuYW1lc3BhY2UgdGhlIGV2ZW50LiBIYW5kbGVycyBhcmUgZmlyZWQgaW4gdGhlIG9yZGVyIGluIHdoaWNoIHRoZXkgd2VyZSBhZGRlZCB3aXRoIGV4YWN0IG1hdGNoZXMgdGFraW5nIHByZWNlZGVuY2UuIFNlcGFyYXRlIHRoZSBuYW1lc3BhY2UgYW5kIGV2ZW50IHdpdGggYSBgOmBcbiAgKiBAbmFtZSBlbWl0XG4gICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IOKAkyB0aGUgbmFtZSBvZiB0aGUgZXZlbnQsIHdpdGggb3B0aW9uYWwgbmFtZXNwYWNlXG4gICogQHBhcmFtIHsuLi4qfSBkYXRhIOKAkyB1cCB0byA2IGFyZ3VtZW50cyB0aGF0IGFyZSBwYXNzZWQgdG8gdGhlIGV2ZW50IGxpc3RlbmVyXG4gICogQGV4YW1wbGVcbiAgKiBlbWl0dGVyLmVtaXQoJ2V4YW1wbGUnKVxuICAqIGVtaXR0ZXIuZW1pdCgnZGVtbzp0ZXN0JylcbiAgKiBlbWl0dGVyLmVtaXQoJ2RhdGEnLCB7IGV4YW1wbGU6IHRydWV9LCAnYSBzdHJpbmcnLCAxKVxuICAqL1xuICBlbWl0dGVyLmVtaXQgPSBmdW5jdGlvbiBlbWl0IChldmVudCwgYXJnMSwgYXJnMiwgYXJnMywgYXJnNCwgYXJnNSwgYXJnNikge1xuICAgIHZhciB0b0VtaXQgPSBnZXRMaXN0ZW5lcnMoZXZlbnQpXG5cbiAgICBpZiAodG9FbWl0Lmxlbmd0aCkge1xuICAgICAgZW1pdEFsbChldmVudCwgdG9FbWl0LCBbYXJnMSwgYXJnMiwgYXJnMywgYXJnNCwgYXJnNSwgYXJnNl0pXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICogQ3JlYXRlIGVuIGV2ZW50IGxpc3RlbmVyLlxuICAqIEBuYW1lIG9uXG4gICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAgKiBAZXhhbXBsZVxuICAqIGVtaXR0ZXIub24oJ2V4YW1wbGUnLCBmdW5jdGlvbiAoKSB7fSlcbiAgKiBlbWl0dGVyLm9uKCdkZW1vJywgZnVuY3Rpb24gKCkge30pXG4gICovXG4gIGVtaXR0ZXIub24gPSBmdW5jdGlvbiBvbiAoZXZlbnQsIGZuKSB7XG4gICAgaWYgKCFfZm5zW2V2ZW50XSkge1xuICAgICAgX2Zuc1tldmVudF0gPSBbXVxuICAgIH1cblxuICAgIF9mbnNbZXZlbnRdLnB1c2goZm4pXG4gIH1cblxuICAvKipcbiAgKiBDcmVhdGUgZW4gZXZlbnQgbGlzdGVuZXIgdGhhdCBmaXJlcyBvbmNlLlxuICAqIEBuYW1lIG9uY2VcbiAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAqIEBleGFtcGxlXG4gICogZW1pdHRlci5vbmNlKCdleGFtcGxlJywgZnVuY3Rpb24gKCkge30pXG4gICogZW1pdHRlci5vbmNlKCdkZW1vJywgZnVuY3Rpb24gKCkge30pXG4gICovXG4gIGVtaXR0ZXIub25jZSA9IGZ1bmN0aW9uIG9uY2UgKGV2ZW50LCBmbikge1xuICAgIGZ1bmN0aW9uIG9uZSAoKSB7XG4gICAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgICBlbWl0dGVyLm9mZihldmVudCwgb25lKVxuICAgIH1cbiAgICB0aGlzLm9uKGV2ZW50LCBvbmUpXG4gIH1cblxuICAvKipcbiAgKiBTdG9wIGxpc3RlbmluZyB0byBhbiBldmVudC4gU3RvcCBhbGwgbGlzdGVuZXJzIG9uIGFuIGV2ZW50IGJ5IG9ubHkgcGFzc2luZyB0aGUgZXZlbnQgbmFtZS4gU3RvcCBhIHNpbmdsZSBsaXN0ZW5lciBieSBwYXNzaW5nIHRoYXQgZXZlbnQgaGFuZGxlciBhcyBhIGNhbGxiYWNrLlxuICAqIFlvdSBtdXN0IGJlIGV4cGxpY2l0IGFib3V0IHdoYXQgd2lsbCBiZSB1bnN1YnNjcmliZWQ6IGBlbWl0dGVyLm9mZignZGVtbycpYCB3aWxsIHVuc3Vic2NyaWJlIGFuIGBlbWl0dGVyLm9uKCdkZW1vJylgIGxpc3RlbmVyLFxuICAqIGBlbWl0dGVyLm9mZignZGVtbzpleGFtcGxlJylgIHdpbGwgdW5zdWJzY3JpYmUgYW4gYGVtaXR0ZXIub24oJ2RlbW86ZXhhbXBsZScpYCBsaXN0ZW5lclxuICAqIEBuYW1lIG9mZlxuICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbl0g4oCTIHRoZSBzcGVjaWZpYyBoYW5kbGVyXG4gICogQGV4YW1wbGVcbiAgKiBlbWl0dGVyLm9mZignZXhhbXBsZScpXG4gICogZW1pdHRlci5vZmYoJ2RlbW8nLCBmdW5jdGlvbiAoKSB7fSlcbiAgKi9cbiAgZW1pdHRlci5vZmYgPSBmdW5jdGlvbiBvZmYgKGV2ZW50LCBmbikge1xuICAgIHZhciBrZWVwID0gW11cblxuICAgIGlmIChldmVudCAmJiBmbikge1xuICAgICAgdmFyIGZucyA9IHRoaXMuX2Zuc1tldmVudF1cbiAgICAgIHZhciBpID0gMFxuICAgICAgdmFyIGwgPSBmbnMgPyBmbnMubGVuZ3RoIDogMFxuXG4gICAgICBmb3IgKGk7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaWYgKGZuc1tpXSAhPT0gZm4pIHtcbiAgICAgICAgICBrZWVwLnB1c2goZm5zW2ldKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAga2VlcC5sZW5ndGggPyB0aGlzLl9mbnNbZXZlbnRdID0ga2VlcCA6IGRlbGV0ZSB0aGlzLl9mbnNbZXZlbnRdXG4gIH1cblxuICBmdW5jdGlvbiBnZXRMaXN0ZW5lcnMgKGUpIHtcbiAgICB2YXIgb3V0ID0gX2Zuc1tlXSA/IF9mbnNbZV0gOiBbXVxuICAgIHZhciBpZHggPSBlLmluZGV4T2YoJzonKVxuICAgIHZhciBhcmdzID0gKGlkeCA9PT0gLTEpID8gW2VdIDogW2Uuc3Vic3RyaW5nKDAsIGlkeCksIGUuc3Vic3RyaW5nKGlkeCArIDEpXVxuXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhfZm5zKVxuICAgIHZhciBpID0gMFxuICAgIHZhciBsID0ga2V5cy5sZW5ndGhcblxuICAgIGZvciAoaTsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIGtleSA9IGtleXNbaV1cbiAgICAgIGlmIChrZXkgPT09ICcqJykge1xuICAgICAgICBvdXQgPSBvdXQuY29uY2F0KF9mbnNba2V5XSlcbiAgICAgIH1cblxuICAgICAgaWYgKGFyZ3MubGVuZ3RoID09PSAyICYmIGFyZ3NbMF0gPT09IGtleSkge1xuICAgICAgICBvdXQgPSBvdXQuY29uY2F0KF9mbnNba2V5XSlcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb3V0XG4gIH1cblxuICBmdW5jdGlvbiBlbWl0QWxsIChlLCBmbnMsIGFyZ3MpIHtcbiAgICB2YXIgaSA9IDBcbiAgICB2YXIgbCA9IGZucy5sZW5ndGhcblxuICAgIGZvciAoaTsgaSA8IGw7IGkrKykge1xuICAgICAgaWYgKCFmbnNbaV0pIGJyZWFrXG4gICAgICBmbnNbaV0uZXZlbnQgPSBlXG4gICAgICBmbnNbaV0uYXBwbHkoZm5zW2ldLCBhcmdzKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBlbWl0dGVyXG59XG4iLCIhZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGZ1bmN0aW9uIGgobm9kZU5hbWUsIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgdmFyIGxhc3RTaW1wbGUsIGNoaWxkLCBzaW1wbGUsIGksIGNoaWxkcmVuID0gRU1QVFlfQ0hJTERSRU47XG4gICAgICAgIGZvciAoaSA9IGFyZ3VtZW50cy5sZW5ndGg7IGktLSA+IDI7ICkgc3RhY2sucHVzaChhcmd1bWVudHNbaV0pO1xuICAgICAgICBpZiAoYXR0cmlidXRlcyAmJiBudWxsICE9IGF0dHJpYnV0ZXMuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgIGlmICghc3RhY2subGVuZ3RoKSBzdGFjay5wdXNoKGF0dHJpYnV0ZXMuY2hpbGRyZW4pO1xuICAgICAgICAgICAgZGVsZXRlIGF0dHJpYnV0ZXMuY2hpbGRyZW47XG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKHN0YWNrLmxlbmd0aCkgaWYgKChjaGlsZCA9IHN0YWNrLnBvcCgpKSAmJiB2b2lkIDAgIT09IGNoaWxkLnBvcCkgZm9yIChpID0gY2hpbGQubGVuZ3RoOyBpLS07ICkgc3RhY2sucHVzaChjaGlsZFtpXSk7IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCdib29sZWFuJyA9PSB0eXBlb2YgY2hpbGQpIGNoaWxkID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChzaW1wbGUgPSAnZnVuY3Rpb24nICE9IHR5cGVvZiBub2RlTmFtZSkgaWYgKG51bGwgPT0gY2hpbGQpIGNoaWxkID0gJyc7IGVsc2UgaWYgKCdudW1iZXInID09IHR5cGVvZiBjaGlsZCkgY2hpbGQgPSBTdHJpbmcoY2hpbGQpOyBlbHNlIGlmICgnc3RyaW5nJyAhPSB0eXBlb2YgY2hpbGQpIHNpbXBsZSA9ICExO1xuICAgICAgICAgICAgaWYgKHNpbXBsZSAmJiBsYXN0U2ltcGxlKSBjaGlsZHJlbltjaGlsZHJlbi5sZW5ndGggLSAxXSArPSBjaGlsZDsgZWxzZSBpZiAoY2hpbGRyZW4gPT09IEVNUFRZX0NISUxEUkVOKSBjaGlsZHJlbiA9IFsgY2hpbGQgXTsgZWxzZSBjaGlsZHJlbi5wdXNoKGNoaWxkKTtcbiAgICAgICAgICAgIGxhc3RTaW1wbGUgPSBzaW1wbGU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHAgPSBuZXcgVk5vZGUoKTtcbiAgICAgICAgcC5ub2RlTmFtZSA9IG5vZGVOYW1lO1xuICAgICAgICBwLmNoaWxkcmVuID0gY2hpbGRyZW47XG4gICAgICAgIHAuYXR0cmlidXRlcyA9IG51bGwgPT0gYXR0cmlidXRlcyA/IHZvaWQgMCA6IGF0dHJpYnV0ZXM7XG4gICAgICAgIHAua2V5ID0gbnVsbCA9PSBhdHRyaWJ1dGVzID8gdm9pZCAwIDogYXR0cmlidXRlcy5rZXk7XG4gICAgICAgIGlmICh2b2lkIDAgIT09IG9wdGlvbnMudm5vZGUpIG9wdGlvbnMudm5vZGUocCk7XG4gICAgICAgIHJldHVybiBwO1xuICAgIH1cbiAgICBmdW5jdGlvbiBleHRlbmQob2JqLCBwcm9wcykge1xuICAgICAgICBmb3IgKHZhciBpIGluIHByb3BzKSBvYmpbaV0gPSBwcm9wc1tpXTtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG4gICAgZnVuY3Rpb24gYXBwbHlSZWYocmVmLCB2YWx1ZSkge1xuICAgICAgICBpZiAobnVsbCAhPSByZWYpIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiByZWYpIHJlZih2YWx1ZSk7IGVsc2UgcmVmLmN1cnJlbnQgPSB2YWx1ZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY2xvbmVFbGVtZW50KHZub2RlLCBwcm9wcykge1xuICAgICAgICByZXR1cm4gaCh2bm9kZS5ub2RlTmFtZSwgZXh0ZW5kKGV4dGVuZCh7fSwgdm5vZGUuYXR0cmlidXRlcyksIHByb3BzKSwgYXJndW1lbnRzLmxlbmd0aCA+IDIgPyBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMikgOiB2bm9kZS5jaGlsZHJlbik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGVucXVldWVSZW5kZXIoY29tcG9uZW50KSB7XG4gICAgICAgIGlmICghY29tcG9uZW50Ll9fZCAmJiAoY29tcG9uZW50Ll9fZCA9ICEwKSAmJiAxID09IGl0ZW1zLnB1c2goY29tcG9uZW50KSkgKG9wdGlvbnMuZGVib3VuY2VSZW5kZXJpbmcgfHwgZGVmZXIpKHJlcmVuZGVyKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcmVyZW5kZXIoKSB7XG4gICAgICAgIHZhciBwO1xuICAgICAgICB3aGlsZSAocCA9IGl0ZW1zLnBvcCgpKSBpZiAocC5fX2QpIHJlbmRlckNvbXBvbmVudChwKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaXNTYW1lTm9kZVR5cGUobm9kZSwgdm5vZGUsIGh5ZHJhdGluZykge1xuICAgICAgICBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIHZub2RlIHx8ICdudW1iZXInID09IHR5cGVvZiB2bm9kZSkgcmV0dXJuIHZvaWQgMCAhPT0gbm9kZS5zcGxpdFRleHQ7XG4gICAgICAgIGlmICgnc3RyaW5nJyA9PSB0eXBlb2Ygdm5vZGUubm9kZU5hbWUpIHJldHVybiAhbm9kZS5fY29tcG9uZW50Q29uc3RydWN0b3IgJiYgaXNOYW1lZE5vZGUobm9kZSwgdm5vZGUubm9kZU5hbWUpOyBlbHNlIHJldHVybiBoeWRyYXRpbmcgfHwgbm9kZS5fY29tcG9uZW50Q29uc3RydWN0b3IgPT09IHZub2RlLm5vZGVOYW1lO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc05hbWVkTm9kZShub2RlLCBub2RlTmFtZSkge1xuICAgICAgICByZXR1cm4gbm9kZS5fX24gPT09IG5vZGVOYW1lIHx8IG5vZGUubm9kZU5hbWUudG9Mb3dlckNhc2UoKSA9PT0gbm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZ2V0Tm9kZVByb3BzKHZub2RlKSB7XG4gICAgICAgIHZhciBwcm9wcyA9IGV4dGVuZCh7fSwgdm5vZGUuYXR0cmlidXRlcyk7XG4gICAgICAgIHByb3BzLmNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW47XG4gICAgICAgIHZhciBkZWZhdWx0UHJvcHMgPSB2bm9kZS5ub2RlTmFtZS5kZWZhdWx0UHJvcHM7XG4gICAgICAgIGlmICh2b2lkIDAgIT09IGRlZmF1bHRQcm9wcykgZm9yICh2YXIgaSBpbiBkZWZhdWx0UHJvcHMpIGlmICh2b2lkIDAgPT09IHByb3BzW2ldKSBwcm9wc1tpXSA9IGRlZmF1bHRQcm9wc1tpXTtcbiAgICAgICAgcmV0dXJuIHByb3BzO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjcmVhdGVOb2RlKG5vZGVOYW1lLCBpc1N2Zykge1xuICAgICAgICB2YXIgbm9kZSA9IGlzU3ZnID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsIG5vZGVOYW1lKSA6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobm9kZU5hbWUpO1xuICAgICAgICBub2RlLl9fbiA9IG5vZGVOYW1lO1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcmVtb3ZlTm9kZShub2RlKSB7XG4gICAgICAgIHZhciBwYXJlbnROb2RlID0gbm9kZS5wYXJlbnROb2RlO1xuICAgICAgICBpZiAocGFyZW50Tm9kZSkgcGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gc2V0QWNjZXNzb3Iobm9kZSwgbmFtZSwgb2xkLCB2YWx1ZSwgaXNTdmcpIHtcbiAgICAgICAgaWYgKCdjbGFzc05hbWUnID09PSBuYW1lKSBuYW1lID0gJ2NsYXNzJztcbiAgICAgICAgaWYgKCdrZXknID09PSBuYW1lKSA7IGVsc2UgaWYgKCdyZWYnID09PSBuYW1lKSB7XG4gICAgICAgICAgICBhcHBseVJlZihvbGQsIG51bGwpO1xuICAgICAgICAgICAgYXBwbHlSZWYodmFsdWUsIG5vZGUpO1xuICAgICAgICB9IGVsc2UgaWYgKCdjbGFzcycgPT09IG5hbWUgJiYgIWlzU3ZnKSBub2RlLmNsYXNzTmFtZSA9IHZhbHVlIHx8ICcnOyBlbHNlIGlmICgnc3R5bGUnID09PSBuYW1lKSB7XG4gICAgICAgICAgICBpZiAoIXZhbHVlIHx8ICdzdHJpbmcnID09IHR5cGVvZiB2YWx1ZSB8fCAnc3RyaW5nJyA9PSB0eXBlb2Ygb2xkKSBub2RlLnN0eWxlLmNzc1RleHQgPSB2YWx1ZSB8fCAnJztcbiAgICAgICAgICAgIGlmICh2YWx1ZSAmJiAnb2JqZWN0JyA9PSB0eXBlb2YgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoJ3N0cmluZycgIT0gdHlwZW9mIG9sZCkgZm9yICh2YXIgaSBpbiBvbGQpIGlmICghKGkgaW4gdmFsdWUpKSBub2RlLnN0eWxlW2ldID0gJyc7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiB2YWx1ZSkgbm9kZS5zdHlsZVtpXSA9ICdudW1iZXInID09IHR5cGVvZiB2YWx1ZVtpXSAmJiAhMSA9PT0gSVNfTk9OX0RJTUVOU0lPTkFMLnRlc3QoaSkgPyB2YWx1ZVtpXSArICdweCcgOiB2YWx1ZVtpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICgnZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUwnID09PSBuYW1lKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUpIG5vZGUuaW5uZXJIVE1MID0gdmFsdWUuX19odG1sIHx8ICcnO1xuICAgICAgICB9IGVsc2UgaWYgKCdvJyA9PSBuYW1lWzBdICYmICduJyA9PSBuYW1lWzFdKSB7XG4gICAgICAgICAgICB2YXIgdXNlQ2FwdHVyZSA9IG5hbWUgIT09IChuYW1lID0gbmFtZS5yZXBsYWNlKC9DYXB0dXJlJC8sICcnKSk7XG4gICAgICAgICAgICBuYW1lID0gbmFtZS50b0xvd2VyQ2FzZSgpLnN1YnN0cmluZygyKTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICghb2xkKSBub2RlLmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgZXZlbnRQcm94eSwgdXNlQ2FwdHVyZSk7XG4gICAgICAgICAgICB9IGVsc2Ugbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIGV2ZW50UHJveHksIHVzZUNhcHR1cmUpO1xuICAgICAgICAgICAgKG5vZGUuX19sIHx8IChub2RlLl9fbCA9IHt9KSlbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIGlmICgnbGlzdCcgIT09IG5hbWUgJiYgJ3R5cGUnICE9PSBuYW1lICYmICFpc1N2ZyAmJiBuYW1lIGluIG5vZGUpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbm9kZVtuYW1lXSA9IG51bGwgPT0gdmFsdWUgPyAnJyA6IHZhbHVlO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgICAgIGlmICgobnVsbCA9PSB2YWx1ZSB8fCAhMSA9PT0gdmFsdWUpICYmICdzcGVsbGNoZWNrJyAhPSBuYW1lKSBub2RlLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBucyA9IGlzU3ZnICYmIG5hbWUgIT09IChuYW1lID0gbmFtZS5yZXBsYWNlKC9eeGxpbms6Py8sICcnKSk7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2YWx1ZSB8fCAhMSA9PT0gdmFsdWUpIGlmIChucykgbm9kZS5yZW1vdmVBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsIG5hbWUudG9Mb3dlckNhc2UoKSk7IGVsc2Ugbm9kZS5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7IGVsc2UgaWYgKCdmdW5jdGlvbicgIT0gdHlwZW9mIHZhbHVlKSBpZiAobnMpIG5vZGUuc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCBuYW1lLnRvTG93ZXJDYXNlKCksIHZhbHVlKTsgZWxzZSBub2RlLnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gZXZlbnRQcm94eShlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fbFtlLnR5cGVdKG9wdGlvbnMuZXZlbnQgJiYgb3B0aW9ucy5ldmVudChlKSB8fCBlKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZmx1c2hNb3VudHMoKSB7XG4gICAgICAgIHZhciBjO1xuICAgICAgICB3aGlsZSAoYyA9IG1vdW50cy5zaGlmdCgpKSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5hZnRlck1vdW50KSBvcHRpb25zLmFmdGVyTW91bnQoYyk7XG4gICAgICAgICAgICBpZiAoYy5jb21wb25lbnREaWRNb3VudCkgYy5jb21wb25lbnREaWRNb3VudCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRpZmYoZG9tLCB2bm9kZSwgY29udGV4dCwgbW91bnRBbGwsIHBhcmVudCwgY29tcG9uZW50Um9vdCkge1xuICAgICAgICBpZiAoIWRpZmZMZXZlbCsrKSB7XG4gICAgICAgICAgICBpc1N2Z01vZGUgPSBudWxsICE9IHBhcmVudCAmJiB2b2lkIDAgIT09IHBhcmVudC5vd25lclNWR0VsZW1lbnQ7XG4gICAgICAgICAgICBoeWRyYXRpbmcgPSBudWxsICE9IGRvbSAmJiAhKCdfX3ByZWFjdGF0dHJfJyBpbiBkb20pO1xuICAgICAgICB9XG4gICAgICAgIHZhciByZXQgPSBpZGlmZihkb20sIHZub2RlLCBjb250ZXh0LCBtb3VudEFsbCwgY29tcG9uZW50Um9vdCk7XG4gICAgICAgIGlmIChwYXJlbnQgJiYgcmV0LnBhcmVudE5vZGUgIT09IHBhcmVudCkgcGFyZW50LmFwcGVuZENoaWxkKHJldCk7XG4gICAgICAgIGlmICghLS1kaWZmTGV2ZWwpIHtcbiAgICAgICAgICAgIGh5ZHJhdGluZyA9ICExO1xuICAgICAgICAgICAgaWYgKCFjb21wb25lbnRSb290KSBmbHVzaE1vdW50cygpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlkaWZmKGRvbSwgdm5vZGUsIGNvbnRleHQsIG1vdW50QWxsLCBjb21wb25lbnRSb290KSB7XG4gICAgICAgIHZhciBvdXQgPSBkb20sIHByZXZTdmdNb2RlID0gaXNTdmdNb2RlO1xuICAgICAgICBpZiAobnVsbCA9PSB2bm9kZSB8fCAnYm9vbGVhbicgPT0gdHlwZW9mIHZub2RlKSB2bm9kZSA9ICcnO1xuICAgICAgICBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIHZub2RlIHx8ICdudW1iZXInID09IHR5cGVvZiB2bm9kZSkge1xuICAgICAgICAgICAgaWYgKGRvbSAmJiB2b2lkIDAgIT09IGRvbS5zcGxpdFRleHQgJiYgZG9tLnBhcmVudE5vZGUgJiYgKCFkb20uX2NvbXBvbmVudCB8fCBjb21wb25lbnRSb290KSkge1xuICAgICAgICAgICAgICAgIGlmIChkb20ubm9kZVZhbHVlICE9IHZub2RlKSBkb20ubm9kZVZhbHVlID0gdm5vZGU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG91dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHZub2RlKTtcbiAgICAgICAgICAgICAgICBpZiAoZG9tKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkb20ucGFyZW50Tm9kZSkgZG9tLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG91dCwgZG9tKTtcbiAgICAgICAgICAgICAgICAgICAgcmVjb2xsZWN0Tm9kZVRyZWUoZG9tLCAhMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3V0Ll9fcHJlYWN0YXR0cl8gPSAhMDtcbiAgICAgICAgICAgIHJldHVybiBvdXQ7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHZub2RlTmFtZSA9IHZub2RlLm5vZGVOYW1lO1xuICAgICAgICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2Ygdm5vZGVOYW1lKSByZXR1cm4gYnVpbGRDb21wb25lbnRGcm9tVk5vZGUoZG9tLCB2bm9kZSwgY29udGV4dCwgbW91bnRBbGwpO1xuICAgICAgICBpc1N2Z01vZGUgPSAnc3ZnJyA9PT0gdm5vZGVOYW1lID8gITAgOiAnZm9yZWlnbk9iamVjdCcgPT09IHZub2RlTmFtZSA/ICExIDogaXNTdmdNb2RlO1xuICAgICAgICB2bm9kZU5hbWUgPSBTdHJpbmcodm5vZGVOYW1lKTtcbiAgICAgICAgaWYgKCFkb20gfHwgIWlzTmFtZWROb2RlKGRvbSwgdm5vZGVOYW1lKSkge1xuICAgICAgICAgICAgb3V0ID0gY3JlYXRlTm9kZSh2bm9kZU5hbWUsIGlzU3ZnTW9kZSk7XG4gICAgICAgICAgICBpZiAoZG9tKSB7XG4gICAgICAgICAgICAgICAgd2hpbGUgKGRvbS5maXJzdENoaWxkKSBvdXQuYXBwZW5kQ2hpbGQoZG9tLmZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgICAgIGlmIChkb20ucGFyZW50Tm9kZSkgZG9tLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG91dCwgZG9tKTtcbiAgICAgICAgICAgICAgICByZWNvbGxlY3ROb2RlVHJlZShkb20sICEwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgZmMgPSBvdXQuZmlyc3RDaGlsZCwgcHJvcHMgPSBvdXQuX19wcmVhY3RhdHRyXywgdmNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW47XG4gICAgICAgIGlmIChudWxsID09IHByb3BzKSB7XG4gICAgICAgICAgICBwcm9wcyA9IG91dC5fX3ByZWFjdGF0dHJfID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBhID0gb3V0LmF0dHJpYnV0ZXMsIGkgPSBhLmxlbmd0aDsgaS0tOyApIHByb3BzW2FbaV0ubmFtZV0gPSBhW2ldLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaHlkcmF0aW5nICYmIHZjaGlsZHJlbiAmJiAxID09PSB2Y2hpbGRyZW4ubGVuZ3RoICYmICdzdHJpbmcnID09IHR5cGVvZiB2Y2hpbGRyZW5bMF0gJiYgbnVsbCAhPSBmYyAmJiB2b2lkIDAgIT09IGZjLnNwbGl0VGV4dCAmJiBudWxsID09IGZjLm5leHRTaWJsaW5nKSB7XG4gICAgICAgICAgICBpZiAoZmMubm9kZVZhbHVlICE9IHZjaGlsZHJlblswXSkgZmMubm9kZVZhbHVlID0gdmNoaWxkcmVuWzBdO1xuICAgICAgICB9IGVsc2UgaWYgKHZjaGlsZHJlbiAmJiB2Y2hpbGRyZW4ubGVuZ3RoIHx8IG51bGwgIT0gZmMpIGlubmVyRGlmZk5vZGUob3V0LCB2Y2hpbGRyZW4sIGNvbnRleHQsIG1vdW50QWxsLCBoeWRyYXRpbmcgfHwgbnVsbCAhPSBwcm9wcy5kYW5nZXJvdXNseVNldElubmVySFRNTCk7XG4gICAgICAgIGRpZmZBdHRyaWJ1dGVzKG91dCwgdm5vZGUuYXR0cmlidXRlcywgcHJvcHMpO1xuICAgICAgICBpc1N2Z01vZGUgPSBwcmV2U3ZnTW9kZTtcbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG4gICAgZnVuY3Rpb24gaW5uZXJEaWZmTm9kZShkb20sIHZjaGlsZHJlbiwgY29udGV4dCwgbW91bnRBbGwsIGlzSHlkcmF0aW5nKSB7XG4gICAgICAgIHZhciBqLCBjLCBmLCB2Y2hpbGQsIGNoaWxkLCBvcmlnaW5hbENoaWxkcmVuID0gZG9tLmNoaWxkTm9kZXMsIGNoaWxkcmVuID0gW10sIGtleWVkID0ge30sIGtleWVkTGVuID0gMCwgbWluID0gMCwgbGVuID0gb3JpZ2luYWxDaGlsZHJlbi5sZW5ndGgsIGNoaWxkcmVuTGVuID0gMCwgdmxlbiA9IHZjaGlsZHJlbiA/IHZjaGlsZHJlbi5sZW5ndGggOiAwO1xuICAgICAgICBpZiAoMCAhPT0gbGVuKSBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgX2NoaWxkID0gb3JpZ2luYWxDaGlsZHJlbltpXSwgcHJvcHMgPSBfY2hpbGQuX19wcmVhY3RhdHRyXywga2V5ID0gdmxlbiAmJiBwcm9wcyA/IF9jaGlsZC5fY29tcG9uZW50ID8gX2NoaWxkLl9jb21wb25lbnQuX19rIDogcHJvcHMua2V5IDogbnVsbDtcbiAgICAgICAgICAgIGlmIChudWxsICE9IGtleSkge1xuICAgICAgICAgICAgICAgIGtleWVkTGVuKys7XG4gICAgICAgICAgICAgICAga2V5ZWRba2V5XSA9IF9jaGlsZDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvcHMgfHwgKHZvaWQgMCAhPT0gX2NoaWxkLnNwbGl0VGV4dCA/IGlzSHlkcmF0aW5nID8gX2NoaWxkLm5vZGVWYWx1ZS50cmltKCkgOiAhMCA6IGlzSHlkcmF0aW5nKSkgY2hpbGRyZW5bY2hpbGRyZW5MZW4rK10gPSBfY2hpbGQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKDAgIT09IHZsZW4pIGZvciAodmFyIGkgPSAwOyBpIDwgdmxlbjsgaSsrKSB7XG4gICAgICAgICAgICB2Y2hpbGQgPSB2Y2hpbGRyZW5baV07XG4gICAgICAgICAgICBjaGlsZCA9IG51bGw7XG4gICAgICAgICAgICB2YXIga2V5ID0gdmNoaWxkLmtleTtcbiAgICAgICAgICAgIGlmIChudWxsICE9IGtleSkge1xuICAgICAgICAgICAgICAgIGlmIChrZXllZExlbiAmJiB2b2lkIDAgIT09IGtleWVkW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQgPSBrZXllZFtrZXldO1xuICAgICAgICAgICAgICAgICAgICBrZXllZFtrZXldID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgICAgICBrZXllZExlbi0tO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAobWluIDwgY2hpbGRyZW5MZW4pIGZvciAoaiA9IG1pbjsgaiA8IGNoaWxkcmVuTGVuOyBqKyspIGlmICh2b2lkIDAgIT09IGNoaWxkcmVuW2pdICYmIGlzU2FtZU5vZGVUeXBlKGMgPSBjaGlsZHJlbltqXSwgdmNoaWxkLCBpc0h5ZHJhdGluZykpIHtcbiAgICAgICAgICAgICAgICBjaGlsZCA9IGM7XG4gICAgICAgICAgICAgICAgY2hpbGRyZW5bal0gPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgaWYgKGogPT09IGNoaWxkcmVuTGVuIC0gMSkgY2hpbGRyZW5MZW4tLTtcbiAgICAgICAgICAgICAgICBpZiAoaiA9PT0gbWluKSBtaW4rKztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNoaWxkID0gaWRpZmYoY2hpbGQsIHZjaGlsZCwgY29udGV4dCwgbW91bnRBbGwpO1xuICAgICAgICAgICAgZiA9IG9yaWdpbmFsQ2hpbGRyZW5baV07XG4gICAgICAgICAgICBpZiAoY2hpbGQgJiYgY2hpbGQgIT09IGRvbSAmJiBjaGlsZCAhPT0gZikgaWYgKG51bGwgPT0gZikgZG9tLmFwcGVuZENoaWxkKGNoaWxkKTsgZWxzZSBpZiAoY2hpbGQgPT09IGYubmV4dFNpYmxpbmcpIHJlbW92ZU5vZGUoZik7IGVsc2UgZG9tLmluc2VydEJlZm9yZShjaGlsZCwgZik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGtleWVkTGVuKSBmb3IgKHZhciBpIGluIGtleWVkKSBpZiAodm9pZCAwICE9PSBrZXllZFtpXSkgcmVjb2xsZWN0Tm9kZVRyZWUoa2V5ZWRbaV0sICExKTtcbiAgICAgICAgd2hpbGUgKG1pbiA8PSBjaGlsZHJlbkxlbikgaWYgKHZvaWQgMCAhPT0gKGNoaWxkID0gY2hpbGRyZW5bY2hpbGRyZW5MZW4tLV0pKSByZWNvbGxlY3ROb2RlVHJlZShjaGlsZCwgITEpO1xuICAgIH1cbiAgICBmdW5jdGlvbiByZWNvbGxlY3ROb2RlVHJlZShub2RlLCB1bm1vdW50T25seSkge1xuICAgICAgICB2YXIgY29tcG9uZW50ID0gbm9kZS5fY29tcG9uZW50O1xuICAgICAgICBpZiAoY29tcG9uZW50KSB1bm1vdW50Q29tcG9uZW50KGNvbXBvbmVudCk7IGVsc2Uge1xuICAgICAgICAgICAgaWYgKG51bGwgIT0gbm9kZS5fX3ByZWFjdGF0dHJfKSBhcHBseVJlZihub2RlLl9fcHJlYWN0YXR0cl8ucmVmLCBudWxsKTtcbiAgICAgICAgICAgIGlmICghMSA9PT0gdW5tb3VudE9ubHkgfHwgbnVsbCA9PSBub2RlLl9fcHJlYWN0YXR0cl8pIHJlbW92ZU5vZGUobm9kZSk7XG4gICAgICAgICAgICByZW1vdmVDaGlsZHJlbihub2RlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiByZW1vdmVDaGlsZHJlbihub2RlKSB7XG4gICAgICAgIG5vZGUgPSBub2RlLmxhc3RDaGlsZDtcbiAgICAgICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgICAgIHZhciBuZXh0ID0gbm9kZS5wcmV2aW91c1NpYmxpbmc7XG4gICAgICAgICAgICByZWNvbGxlY3ROb2RlVHJlZShub2RlLCAhMCk7XG4gICAgICAgICAgICBub2RlID0gbmV4dDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBkaWZmQXR0cmlidXRlcyhkb20sIGF0dHJzLCBvbGQpIHtcbiAgICAgICAgdmFyIG5hbWU7XG4gICAgICAgIGZvciAobmFtZSBpbiBvbGQpIGlmICgoIWF0dHJzIHx8IG51bGwgPT0gYXR0cnNbbmFtZV0pICYmIG51bGwgIT0gb2xkW25hbWVdKSBzZXRBY2Nlc3Nvcihkb20sIG5hbWUsIG9sZFtuYW1lXSwgb2xkW25hbWVdID0gdm9pZCAwLCBpc1N2Z01vZGUpO1xuICAgICAgICBmb3IgKG5hbWUgaW4gYXR0cnMpIGlmICghKCdjaGlsZHJlbicgPT09IG5hbWUgfHwgJ2lubmVySFRNTCcgPT09IG5hbWUgfHwgbmFtZSBpbiBvbGQgJiYgYXR0cnNbbmFtZV0gPT09ICgndmFsdWUnID09PSBuYW1lIHx8ICdjaGVja2VkJyA9PT0gbmFtZSA/IGRvbVtuYW1lXSA6IG9sZFtuYW1lXSkpKSBzZXRBY2Nlc3Nvcihkb20sIG5hbWUsIG9sZFtuYW1lXSwgb2xkW25hbWVdID0gYXR0cnNbbmFtZV0sIGlzU3ZnTW9kZSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNyZWF0ZUNvbXBvbmVudChDdG9yLCBwcm9wcywgY29udGV4dCkge1xuICAgICAgICB2YXIgaW5zdCwgaSA9IHJlY3ljbGVyQ29tcG9uZW50cy5sZW5ndGg7XG4gICAgICAgIGlmIChDdG9yLnByb3RvdHlwZSAmJiBDdG9yLnByb3RvdHlwZS5yZW5kZXIpIHtcbiAgICAgICAgICAgIGluc3QgPSBuZXcgQ3Rvcihwcm9wcywgY29udGV4dCk7XG4gICAgICAgICAgICBDb21wb25lbnQuY2FsbChpbnN0LCBwcm9wcywgY29udGV4dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbnN0ID0gbmV3IENvbXBvbmVudChwcm9wcywgY29udGV4dCk7XG4gICAgICAgICAgICBpbnN0LmNvbnN0cnVjdG9yID0gQ3RvcjtcbiAgICAgICAgICAgIGluc3QucmVuZGVyID0gZG9SZW5kZXI7XG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKGktLSkgaWYgKHJlY3ljbGVyQ29tcG9uZW50c1tpXS5jb25zdHJ1Y3RvciA9PT0gQ3Rvcikge1xuICAgICAgICAgICAgaW5zdC5fX2IgPSByZWN5Y2xlckNvbXBvbmVudHNbaV0uX19iO1xuICAgICAgICAgICAgcmVjeWNsZXJDb21wb25lbnRzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIHJldHVybiBpbnN0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnN0O1xuICAgIH1cbiAgICBmdW5jdGlvbiBkb1JlbmRlcihwcm9wcywgc3RhdGUsIGNvbnRleHQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IocHJvcHMsIGNvbnRleHQpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzZXRDb21wb25lbnRQcm9wcyhjb21wb25lbnQsIHByb3BzLCByZW5kZXJNb2RlLCBjb250ZXh0LCBtb3VudEFsbCkge1xuICAgICAgICBpZiAoIWNvbXBvbmVudC5fX3gpIHtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fX3ggPSAhMDtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fX3IgPSBwcm9wcy5yZWY7XG4gICAgICAgICAgICBjb21wb25lbnQuX19rID0gcHJvcHMua2V5O1xuICAgICAgICAgICAgZGVsZXRlIHByb3BzLnJlZjtcbiAgICAgICAgICAgIGRlbGV0ZSBwcm9wcy5rZXk7XG4gICAgICAgICAgICBpZiAodm9pZCAwID09PSBjb21wb25lbnQuY29uc3RydWN0b3IuZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzKSBpZiAoIWNvbXBvbmVudC5iYXNlIHx8IG1vdW50QWxsKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5jb21wb25lbnRXaWxsTW91bnQpIGNvbXBvbmVudC5jb21wb25lbnRXaWxsTW91bnQoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY29tcG9uZW50LmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMpIGNvbXBvbmVudC5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgICAgIGlmIChjb250ZXh0ICYmIGNvbnRleHQgIT09IGNvbXBvbmVudC5jb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjb21wb25lbnQuX19jKSBjb21wb25lbnQuX19jID0gY29tcG9uZW50LmNvbnRleHQ7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LmNvbnRleHQgPSBjb250ZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFjb21wb25lbnQuX19wKSBjb21wb25lbnQuX19wID0gY29tcG9uZW50LnByb3BzO1xuICAgICAgICAgICAgY29tcG9uZW50LnByb3BzID0gcHJvcHM7XG4gICAgICAgICAgICBjb21wb25lbnQuX194ID0gITE7XG4gICAgICAgICAgICBpZiAoMCAhPT0gcmVuZGVyTW9kZSkgaWYgKDEgPT09IHJlbmRlck1vZGUgfHwgITEgIT09IG9wdGlvbnMuc3luY0NvbXBvbmVudFVwZGF0ZXMgfHwgIWNvbXBvbmVudC5iYXNlKSByZW5kZXJDb21wb25lbnQoY29tcG9uZW50LCAxLCBtb3VudEFsbCk7IGVsc2UgZW5xdWV1ZVJlbmRlcihjb21wb25lbnQpO1xuICAgICAgICAgICAgYXBwbHlSZWYoY29tcG9uZW50Ll9fciwgY29tcG9uZW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiByZW5kZXJDb21wb25lbnQoY29tcG9uZW50LCByZW5kZXJNb2RlLCBtb3VudEFsbCwgaXNDaGlsZCkge1xuICAgICAgICBpZiAoIWNvbXBvbmVudC5fX3gpIHtcbiAgICAgICAgICAgIHZhciByZW5kZXJlZCwgaW5zdCwgY2Jhc2UsIHByb3BzID0gY29tcG9uZW50LnByb3BzLCBzdGF0ZSA9IGNvbXBvbmVudC5zdGF0ZSwgY29udGV4dCA9IGNvbXBvbmVudC5jb250ZXh0LCBwcmV2aW91c1Byb3BzID0gY29tcG9uZW50Ll9fcCB8fCBwcm9wcywgcHJldmlvdXNTdGF0ZSA9IGNvbXBvbmVudC5fX3MgfHwgc3RhdGUsIHByZXZpb3VzQ29udGV4dCA9IGNvbXBvbmVudC5fX2MgfHwgY29udGV4dCwgaXNVcGRhdGUgPSBjb21wb25lbnQuYmFzZSwgbmV4dEJhc2UgPSBjb21wb25lbnQuX19iLCBpbml0aWFsQmFzZSA9IGlzVXBkYXRlIHx8IG5leHRCYXNlLCBpbml0aWFsQ2hpbGRDb21wb25lbnQgPSBjb21wb25lbnQuX2NvbXBvbmVudCwgc2tpcCA9ICExLCBzbmFwc2hvdCA9IHByZXZpb3VzQ29udGV4dDtcbiAgICAgICAgICAgIGlmIChjb21wb25lbnQuY29uc3RydWN0b3IuZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzKSB7XG4gICAgICAgICAgICAgICAgc3RhdGUgPSBleHRlbmQoZXh0ZW5kKHt9LCBzdGF0ZSksIGNvbXBvbmVudC5jb25zdHJ1Y3Rvci5nZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMocHJvcHMsIHN0YXRlKSk7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnN0YXRlID0gc3RhdGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNVcGRhdGUpIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQucHJvcHMgPSBwcmV2aW91c1Byb3BzO1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5zdGF0ZSA9IHByZXZpb3VzU3RhdGU7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LmNvbnRleHQgPSBwcmV2aW91c0NvbnRleHQ7XG4gICAgICAgICAgICAgICAgaWYgKDIgIT09IHJlbmRlck1vZGUgJiYgY29tcG9uZW50LnNob3VsZENvbXBvbmVudFVwZGF0ZSAmJiAhMSA9PT0gY29tcG9uZW50LnNob3VsZENvbXBvbmVudFVwZGF0ZShwcm9wcywgc3RhdGUsIGNvbnRleHQpKSBza2lwID0gITA7IGVsc2UgaWYgKGNvbXBvbmVudC5jb21wb25lbnRXaWxsVXBkYXRlKSBjb21wb25lbnQuY29tcG9uZW50V2lsbFVwZGF0ZShwcm9wcywgc3RhdGUsIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5wcm9wcyA9IHByb3BzO1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5zdGF0ZSA9IHN0YXRlO1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5jb250ZXh0ID0gY29udGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbXBvbmVudC5fX3AgPSBjb21wb25lbnQuX19zID0gY29tcG9uZW50Ll9fYyA9IGNvbXBvbmVudC5fX2IgPSBudWxsO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9fZCA9ICExO1xuICAgICAgICAgICAgaWYgKCFza2lwKSB7XG4gICAgICAgICAgICAgICAgcmVuZGVyZWQgPSBjb21wb25lbnQucmVuZGVyKHByb3BzLCBzdGF0ZSwgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5nZXRDaGlsZENvbnRleHQpIGNvbnRleHQgPSBleHRlbmQoZXh0ZW5kKHt9LCBjb250ZXh0KSwgY29tcG9uZW50LmdldENoaWxkQ29udGV4dCgpKTtcbiAgICAgICAgICAgICAgICBpZiAoaXNVcGRhdGUgJiYgY29tcG9uZW50LmdldFNuYXBzaG90QmVmb3JlVXBkYXRlKSBzbmFwc2hvdCA9IGNvbXBvbmVudC5nZXRTbmFwc2hvdEJlZm9yZVVwZGF0ZShwcmV2aW91c1Byb3BzLCBwcmV2aW91c1N0YXRlKTtcbiAgICAgICAgICAgICAgICB2YXIgdG9Vbm1vdW50LCBiYXNlLCBjaGlsZENvbXBvbmVudCA9IHJlbmRlcmVkICYmIHJlbmRlcmVkLm5vZGVOYW1lO1xuICAgICAgICAgICAgICAgIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBjaGlsZENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2hpbGRQcm9wcyA9IGdldE5vZGVQcm9wcyhyZW5kZXJlZCk7XG4gICAgICAgICAgICAgICAgICAgIGluc3QgPSBpbml0aWFsQ2hpbGRDb21wb25lbnQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnN0ICYmIGluc3QuY29uc3RydWN0b3IgPT09IGNoaWxkQ29tcG9uZW50ICYmIGNoaWxkUHJvcHMua2V5ID09IGluc3QuX19rKSBzZXRDb21wb25lbnRQcm9wcyhpbnN0LCBjaGlsZFByb3BzLCAxLCBjb250ZXh0LCAhMSk7IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9Vbm1vdW50ID0gaW5zdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5fY29tcG9uZW50ID0gaW5zdCA9IGNyZWF0ZUNvbXBvbmVudChjaGlsZENvbXBvbmVudCwgY2hpbGRQcm9wcywgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0Ll9fYiA9IGluc3QuX19iIHx8IG5leHRCYXNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdC5fX3UgPSBjb21wb25lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRDb21wb25lbnRQcm9wcyhpbnN0LCBjaGlsZFByb3BzLCAwLCBjb250ZXh0LCAhMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJDb21wb25lbnQoaW5zdCwgMSwgbW91bnRBbGwsICEwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBiYXNlID0gaW5zdC5iYXNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNiYXNlID0gaW5pdGlhbEJhc2U7XG4gICAgICAgICAgICAgICAgICAgIHRvVW5tb3VudCA9IGluaXRpYWxDaGlsZENvbXBvbmVudDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRvVW5tb3VudCkgY2Jhc2UgPSBjb21wb25lbnQuX2NvbXBvbmVudCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbml0aWFsQmFzZSB8fCAxID09PSByZW5kZXJNb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2Jhc2UpIGNiYXNlLl9jb21wb25lbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZSA9IGRpZmYoY2Jhc2UsIHJlbmRlcmVkLCBjb250ZXh0LCBtb3VudEFsbCB8fCAhaXNVcGRhdGUsIGluaXRpYWxCYXNlICYmIGluaXRpYWxCYXNlLnBhcmVudE5vZGUsICEwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaW5pdGlhbEJhc2UgJiYgYmFzZSAhPT0gaW5pdGlhbEJhc2UgJiYgaW5zdCAhPT0gaW5pdGlhbENoaWxkQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBiYXNlUGFyZW50ID0gaW5pdGlhbEJhc2UucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJhc2VQYXJlbnQgJiYgYmFzZSAhPT0gYmFzZVBhcmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZVBhcmVudC5yZXBsYWNlQ2hpbGQoYmFzZSwgaW5pdGlhbEJhc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0b1VubW91bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsQmFzZS5fY29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNvbGxlY3ROb2RlVHJlZShpbml0aWFsQmFzZSwgITEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0b1VubW91bnQpIHVubW91bnRDb21wb25lbnQodG9Vbm1vdW50KTtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuYmFzZSA9IGJhc2U7XG4gICAgICAgICAgICAgICAgaWYgKGJhc2UgJiYgIWlzQ2hpbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvbXBvbmVudFJlZiA9IGNvbXBvbmVudCwgdCA9IGNvbXBvbmVudDtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKHQgPSB0Ll9fdSkgKGNvbXBvbmVudFJlZiA9IHQpLmJhc2UgPSBiYXNlO1xuICAgICAgICAgICAgICAgICAgICBiYXNlLl9jb21wb25lbnQgPSBjb21wb25lbnRSZWY7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuX2NvbXBvbmVudENvbnN0cnVjdG9yID0gY29tcG9uZW50UmVmLmNvbnN0cnVjdG9yO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNVcGRhdGUgfHwgbW91bnRBbGwpIG1vdW50cy5wdXNoKGNvbXBvbmVudCk7IGVsc2UgaWYgKCFza2lwKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5jb21wb25lbnREaWRVcGRhdGUpIGNvbXBvbmVudC5jb21wb25lbnREaWRVcGRhdGUocHJldmlvdXNQcm9wcywgcHJldmlvdXNTdGF0ZSwgc25hcHNob3QpO1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmFmdGVyVXBkYXRlKSBvcHRpb25zLmFmdGVyVXBkYXRlKGNvbXBvbmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3aGlsZSAoY29tcG9uZW50Ll9faC5sZW5ndGgpIGNvbXBvbmVudC5fX2gucG9wKCkuY2FsbChjb21wb25lbnQpO1xuICAgICAgICAgICAgaWYgKCFkaWZmTGV2ZWwgJiYgIWlzQ2hpbGQpIGZsdXNoTW91bnRzKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gYnVpbGRDb21wb25lbnRGcm9tVk5vZGUoZG9tLCB2bm9kZSwgY29udGV4dCwgbW91bnRBbGwpIHtcbiAgICAgICAgdmFyIGMgPSBkb20gJiYgZG9tLl9jb21wb25lbnQsIG9yaWdpbmFsQ29tcG9uZW50ID0gYywgb2xkRG9tID0gZG9tLCBpc0RpcmVjdE93bmVyID0gYyAmJiBkb20uX2NvbXBvbmVudENvbnN0cnVjdG9yID09PSB2bm9kZS5ub2RlTmFtZSwgaXNPd25lciA9IGlzRGlyZWN0T3duZXIsIHByb3BzID0gZ2V0Tm9kZVByb3BzKHZub2RlKTtcbiAgICAgICAgd2hpbGUgKGMgJiYgIWlzT3duZXIgJiYgKGMgPSBjLl9fdSkpIGlzT3duZXIgPSBjLmNvbnN0cnVjdG9yID09PSB2bm9kZS5ub2RlTmFtZTtcbiAgICAgICAgaWYgKGMgJiYgaXNPd25lciAmJiAoIW1vdW50QWxsIHx8IGMuX2NvbXBvbmVudCkpIHtcbiAgICAgICAgICAgIHNldENvbXBvbmVudFByb3BzKGMsIHByb3BzLCAzLCBjb250ZXh0LCBtb3VudEFsbCk7XG4gICAgICAgICAgICBkb20gPSBjLmJhc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAob3JpZ2luYWxDb21wb25lbnQgJiYgIWlzRGlyZWN0T3duZXIpIHtcbiAgICAgICAgICAgICAgICB1bm1vdW50Q29tcG9uZW50KG9yaWdpbmFsQ29tcG9uZW50KTtcbiAgICAgICAgICAgICAgICBkb20gPSBvbGREb20gPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYyA9IGNyZWF0ZUNvbXBvbmVudCh2bm9kZS5ub2RlTmFtZSwgcHJvcHMsIGNvbnRleHQpO1xuICAgICAgICAgICAgaWYgKGRvbSAmJiAhYy5fX2IpIHtcbiAgICAgICAgICAgICAgICBjLl9fYiA9IGRvbTtcbiAgICAgICAgICAgICAgICBvbGREb20gPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2V0Q29tcG9uZW50UHJvcHMoYywgcHJvcHMsIDEsIGNvbnRleHQsIG1vdW50QWxsKTtcbiAgICAgICAgICAgIGRvbSA9IGMuYmFzZTtcbiAgICAgICAgICAgIGlmIChvbGREb20gJiYgZG9tICE9PSBvbGREb20pIHtcbiAgICAgICAgICAgICAgICBvbGREb20uX2NvbXBvbmVudCA9IG51bGw7XG4gICAgICAgICAgICAgICAgcmVjb2xsZWN0Tm9kZVRyZWUob2xkRG9tLCAhMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRvbTtcbiAgICB9XG4gICAgZnVuY3Rpb24gdW5tb3VudENvbXBvbmVudChjb21wb25lbnQpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuYmVmb3JlVW5tb3VudCkgb3B0aW9ucy5iZWZvcmVVbm1vdW50KGNvbXBvbmVudCk7XG4gICAgICAgIHZhciBiYXNlID0gY29tcG9uZW50LmJhc2U7XG4gICAgICAgIGNvbXBvbmVudC5fX3ggPSAhMDtcbiAgICAgICAgaWYgKGNvbXBvbmVudC5jb21wb25lbnRXaWxsVW5tb3VudCkgY29tcG9uZW50LmNvbXBvbmVudFdpbGxVbm1vdW50KCk7XG4gICAgICAgIGNvbXBvbmVudC5iYXNlID0gbnVsbDtcbiAgICAgICAgdmFyIGlubmVyID0gY29tcG9uZW50Ll9jb21wb25lbnQ7XG4gICAgICAgIGlmIChpbm5lcikgdW5tb3VudENvbXBvbmVudChpbm5lcik7IGVsc2UgaWYgKGJhc2UpIHtcbiAgICAgICAgICAgIGlmIChudWxsICE9IGJhc2UuX19wcmVhY3RhdHRyXykgYXBwbHlSZWYoYmFzZS5fX3ByZWFjdGF0dHJfLnJlZiwgbnVsbCk7XG4gICAgICAgICAgICBjb21wb25lbnQuX19iID0gYmFzZTtcbiAgICAgICAgICAgIHJlbW92ZU5vZGUoYmFzZSk7XG4gICAgICAgICAgICByZWN5Y2xlckNvbXBvbmVudHMucHVzaChjb21wb25lbnQpO1xuICAgICAgICAgICAgcmVtb3ZlQ2hpbGRyZW4oYmFzZSk7XG4gICAgICAgIH1cbiAgICAgICAgYXBwbHlSZWYoY29tcG9uZW50Ll9fciwgbnVsbCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIENvbXBvbmVudChwcm9wcywgY29udGV4dCkge1xuICAgICAgICB0aGlzLl9fZCA9ICEwO1xuICAgICAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICAgICAgICB0aGlzLnByb3BzID0gcHJvcHM7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB0aGlzLnN0YXRlIHx8IHt9O1xuICAgICAgICB0aGlzLl9faCA9IFtdO1xuICAgIH1cbiAgICBmdW5jdGlvbiByZW5kZXIodm5vZGUsIHBhcmVudCwgbWVyZ2UpIHtcbiAgICAgICAgcmV0dXJuIGRpZmYobWVyZ2UsIHZub2RlLCB7fSwgITEsIHBhcmVudCwgITEpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjcmVhdGVSZWYoKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgdmFyIFZOb2RlID0gZnVuY3Rpb24oKSB7fTtcbiAgICB2YXIgb3B0aW9ucyA9IHt9O1xuICAgIHZhciBzdGFjayA9IFtdO1xuICAgIHZhciBFTVBUWV9DSElMRFJFTiA9IFtdO1xuICAgIHZhciBkZWZlciA9ICdmdW5jdGlvbicgPT0gdHlwZW9mIFByb21pc2UgPyBQcm9taXNlLnJlc29sdmUoKS50aGVuLmJpbmQoUHJvbWlzZS5yZXNvbHZlKCkpIDogc2V0VGltZW91dDtcbiAgICB2YXIgSVNfTk9OX0RJTUVOU0lPTkFMID0gL2FjaXR8ZXgoPzpzfGd8bnxwfCQpfHJwaHxvd3N8bW5jfG50d3xpbmVbY2hdfHpvb3xeb3JkL2k7XG4gICAgdmFyIGl0ZW1zID0gW107XG4gICAgdmFyIG1vdW50cyA9IFtdO1xuICAgIHZhciBkaWZmTGV2ZWwgPSAwO1xuICAgIHZhciBpc1N2Z01vZGUgPSAhMTtcbiAgICB2YXIgaHlkcmF0aW5nID0gITE7XG4gICAgdmFyIHJlY3ljbGVyQ29tcG9uZW50cyA9IFtdO1xuICAgIGV4dGVuZChDb21wb25lbnQucHJvdG90eXBlLCB7XG4gICAgICAgIHNldFN0YXRlOiBmdW5jdGlvbihzdGF0ZSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5fX3MpIHRoaXMuX19zID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBleHRlbmQoZXh0ZW5kKHt9LCB0aGlzLnN0YXRlKSwgJ2Z1bmN0aW9uJyA9PSB0eXBlb2Ygc3RhdGUgPyBzdGF0ZSh0aGlzLnN0YXRlLCB0aGlzLnByb3BzKSA6IHN0YXRlKTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykgdGhpcy5fX2gucHVzaChjYWxsYmFjayk7XG4gICAgICAgICAgICBlbnF1ZXVlUmVuZGVyKHRoaXMpO1xuICAgICAgICB9LFxuICAgICAgICBmb3JjZVVwZGF0ZTogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykgdGhpcy5fX2gucHVzaChjYWxsYmFjayk7XG4gICAgICAgICAgICByZW5kZXJDb21wb25lbnQodGhpcywgMik7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7fVxuICAgIH0pO1xuICAgIHZhciBwcmVhY3QgPSB7XG4gICAgICAgIGg6IGgsXG4gICAgICAgIGNyZWF0ZUVsZW1lbnQ6IGgsXG4gICAgICAgIGNsb25lRWxlbWVudDogY2xvbmVFbGVtZW50LFxuICAgICAgICBjcmVhdGVSZWY6IGNyZWF0ZVJlZixcbiAgICAgICAgQ29tcG9uZW50OiBDb21wb25lbnQsXG4gICAgICAgIHJlbmRlcjogcmVuZGVyLFxuICAgICAgICByZXJlbmRlcjogcmVyZW5kZXIsXG4gICAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICB9O1xuICAgIGlmICgndW5kZWZpbmVkJyAhPSB0eXBlb2YgbW9kdWxlKSBtb2R1bGUuZXhwb3J0cyA9IHByZWFjdDsgZWxzZSBzZWxmLnByZWFjdCA9IHByZWFjdDtcbn0oKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXByZWFjdC5qcy5tYXAiLCJtb2R1bGUuZXhwb3J0cyA9IHByZXR0aWVyQnl0ZXNcblxuZnVuY3Rpb24gcHJldHRpZXJCeXRlcyAobnVtKSB7XG4gIGlmICh0eXBlb2YgbnVtICE9PSAnbnVtYmVyJyB8fCBpc05hTihudW0pKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYSBudW1iZXIsIGdvdCAnICsgdHlwZW9mIG51bSlcbiAgfVxuXG4gIHZhciBuZWcgPSBudW0gPCAwXG4gIHZhciB1bml0cyA9IFsnQicsICdLQicsICdNQicsICdHQicsICdUQicsICdQQicsICdFQicsICdaQicsICdZQiddXG5cbiAgaWYgKG5lZykge1xuICAgIG51bSA9IC1udW1cbiAgfVxuXG4gIGlmIChudW0gPCAxKSB7XG4gICAgcmV0dXJuIChuZWcgPyAnLScgOiAnJykgKyBudW0gKyAnIEInXG4gIH1cblxuICB2YXIgZXhwb25lbnQgPSBNYXRoLm1pbihNYXRoLmZsb29yKE1hdGgubG9nKG51bSkgLyBNYXRoLmxvZygxMDAwKSksIHVuaXRzLmxlbmd0aCAtIDEpXG4gIG51bSA9IE51bWJlcihudW0gLyBNYXRoLnBvdygxMDAwLCBleHBvbmVudCkpXG4gIHZhciB1bml0ID0gdW5pdHNbZXhwb25lbnRdXG5cbiAgaWYgKG51bSA+PSAxMCB8fCBudW0gJSAxID09PSAwKSB7XG4gICAgLy8gRG8gbm90IHNob3cgZGVjaW1hbHMgd2hlbiB0aGUgbnVtYmVyIGlzIHR3by1kaWdpdCwgb3IgaWYgdGhlIG51bWJlciBoYXMgbm9cbiAgICAvLyBkZWNpbWFsIGNvbXBvbmVudC5cbiAgICByZXR1cm4gKG5lZyA/ICctJyA6ICcnKSArIG51bS50b0ZpeGVkKDApICsgJyAnICsgdW5pdFxuICB9IGVsc2Uge1xuICAgIHJldHVybiAobmVnID8gJy0nIDogJycpICsgbnVtLnRvRml4ZWQoMSkgKyAnICcgKyB1bml0XG4gIH1cbn1cbiIsIihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IGZhY3RvcnkoZXhwb3J0cykgOlxuICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoWydleHBvcnRzJ10sIGZhY3RvcnkpIDpcbiAgKGZhY3RvcnkoKGdsb2JhbC5XSEFUV0dGZXRjaCA9IHt9KSkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKGV4cG9ydHMpIHsgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBzdXBwb3J0ID0ge1xuICAgIHNlYXJjaFBhcmFtczogJ1VSTFNlYXJjaFBhcmFtcycgaW4gc2VsZixcbiAgICBpdGVyYWJsZTogJ1N5bWJvbCcgaW4gc2VsZiAmJiAnaXRlcmF0b3InIGluIFN5bWJvbCxcbiAgICBibG9iOlxuICAgICAgJ0ZpbGVSZWFkZXInIGluIHNlbGYgJiZcbiAgICAgICdCbG9iJyBpbiBzZWxmICYmXG4gICAgICAoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbmV3IEJsb2IoKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH0pKCksXG4gICAgZm9ybURhdGE6ICdGb3JtRGF0YScgaW4gc2VsZixcbiAgICBhcnJheUJ1ZmZlcjogJ0FycmF5QnVmZmVyJyBpbiBzZWxmXG4gIH07XG5cbiAgZnVuY3Rpb24gaXNEYXRhVmlldyhvYmopIHtcbiAgICByZXR1cm4gb2JqICYmIERhdGFWaWV3LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKG9iailcbiAgfVxuXG4gIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyKSB7XG4gICAgdmFyIHZpZXdDbGFzc2VzID0gW1xuICAgICAgJ1tvYmplY3QgSW50OEFycmF5XScsXG4gICAgICAnW29iamVjdCBVaW50OEFycmF5XScsXG4gICAgICAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgSW50MTZBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgVWludDE2QXJyYXldJyxcbiAgICAgICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICAgICdbb2JqZWN0IFVpbnQzMkFycmF5XScsXG4gICAgICAnW29iamVjdCBGbG9hdDMyQXJyYXldJyxcbiAgICAgICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nXG4gICAgXTtcblxuICAgIHZhciBpc0FycmF5QnVmZmVyVmlldyA9XG4gICAgICBBcnJheUJ1ZmZlci5pc1ZpZXcgfHxcbiAgICAgIGZ1bmN0aW9uKG9iaikge1xuICAgICAgICByZXR1cm4gb2JqICYmIHZpZXdDbGFzc2VzLmluZGV4T2YoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikpID4gLTFcbiAgICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVOYW1lKG5hbWUpIHtcbiAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICBuYW1lID0gU3RyaW5nKG5hbWUpO1xuICAgIH1cbiAgICBpZiAoL1teYS16MC05XFwtIyQlJicqKy5eX2B8fl0vaS50ZXN0KG5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGNoYXJhY3RlciBpbiBoZWFkZXIgZmllbGQgbmFtZScpXG4gICAgfVxuICAgIHJldHVybiBuYW1lLnRvTG93ZXJDYXNlKClcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZVZhbHVlKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHZhbHVlID0gU3RyaW5nKHZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cblxuICAvLyBCdWlsZCBhIGRlc3RydWN0aXZlIGl0ZXJhdG9yIGZvciB0aGUgdmFsdWUgbGlzdFxuICBmdW5jdGlvbiBpdGVyYXRvckZvcihpdGVtcykge1xuICAgIHZhciBpdGVyYXRvciA9IHtcbiAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSBpdGVtcy5zaGlmdCgpO1xuICAgICAgICByZXR1cm4ge2RvbmU6IHZhbHVlID09PSB1bmRlZmluZWQsIHZhbHVlOiB2YWx1ZX1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKHN1cHBvcnQuaXRlcmFibGUpIHtcbiAgICAgIGl0ZXJhdG9yW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yXG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBpdGVyYXRvclxuICB9XG5cbiAgZnVuY3Rpb24gSGVhZGVycyhoZWFkZXJzKSB7XG4gICAgdGhpcy5tYXAgPSB7fTtcblxuICAgIGlmIChoZWFkZXJzIGluc3RhbmNlb2YgSGVhZGVycykge1xuICAgICAgaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kKG5hbWUsIHZhbHVlKTtcbiAgICAgIH0sIHRoaXMpO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShoZWFkZXJzKSkge1xuICAgICAgaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKGhlYWRlcikge1xuICAgICAgICB0aGlzLmFwcGVuZChoZWFkZXJbMF0sIGhlYWRlclsxXSk7XG4gICAgICB9LCB0aGlzKTtcbiAgICB9IGVsc2UgaWYgKGhlYWRlcnMpIHtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGhlYWRlcnMpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCBoZWFkZXJzW25hbWVdKTtcbiAgICAgIH0sIHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmFwcGVuZCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgbmFtZSA9IG5vcm1hbGl6ZU5hbWUobmFtZSk7XG4gICAgdmFsdWUgPSBub3JtYWxpemVWYWx1ZSh2YWx1ZSk7XG4gICAgdmFyIG9sZFZhbHVlID0gdGhpcy5tYXBbbmFtZV07XG4gICAgdGhpcy5tYXBbbmFtZV0gPSBvbGRWYWx1ZSA/IG9sZFZhbHVlICsgJywgJyArIHZhbHVlIDogdmFsdWU7XG4gIH07XG5cbiAgSGVhZGVycy5wcm90b3R5cGVbJ2RlbGV0ZSddID0gZnVuY3Rpb24obmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXTtcbiAgfTtcblxuICBIZWFkZXJzLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgbmFtZSA9IG5vcm1hbGl6ZU5hbWUobmFtZSk7XG4gICAgcmV0dXJuIHRoaXMuaGFzKG5hbWUpID8gdGhpcy5tYXBbbmFtZV0gOiBudWxsXG4gIH07XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLm1hcC5oYXNPd25Qcm9wZXJ0eShub3JtYWxpemVOYW1lKG5hbWUpKVxuICB9O1xuXG4gIEhlYWRlcnMucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV0gPSBub3JtYWxpemVWYWx1ZSh2YWx1ZSk7XG4gIH07XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzLm1hcCkge1xuICAgICAgaWYgKHRoaXMubWFwLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgdGhpcy5tYXBbbmFtZV0sIG5hbWUsIHRoaXMpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBIZWFkZXJzLnByb3RvdHlwZS5rZXlzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW107XG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICBpdGVtcy5wdXNoKG5hbWUpO1xuICAgIH0pO1xuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfTtcblxuICBIZWFkZXJzLnByb3RvdHlwZS52YWx1ZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXTtcbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGl0ZW1zLnB1c2godmFsdWUpO1xuICAgIH0pO1xuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfTtcblxuICBIZWFkZXJzLnByb3RvdHlwZS5lbnRyaWVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW107XG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICBpdGVtcy5wdXNoKFtuYW1lLCB2YWx1ZV0pO1xuICAgIH0pO1xuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfTtcblxuICBpZiAoc3VwcG9ydC5pdGVyYWJsZSkge1xuICAgIEhlYWRlcnMucHJvdG90eXBlW1N5bWJvbC5pdGVyYXRvcl0gPSBIZWFkZXJzLnByb3RvdHlwZS5lbnRyaWVzO1xuICB9XG5cbiAgZnVuY3Rpb24gY29uc3VtZWQoYm9keSkge1xuICAgIGlmIChib2R5LmJvZHlVc2VkKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJykpXG4gICAgfVxuICAgIGJvZHkuYm9keVVzZWQgPSB0cnVlO1xuICB9XG5cbiAgZnVuY3Rpb24gZmlsZVJlYWRlclJlYWR5KHJlYWRlcikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzb2x2ZShyZWFkZXIucmVzdWx0KTtcbiAgICAgIH07XG4gICAgICByZWFkZXIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QocmVhZGVyLmVycm9yKTtcbiAgICAgIH07XG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRCbG9iQXNBcnJheUJ1ZmZlcihibG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgdmFyIHByb21pc2UgPSBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKTtcbiAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoYmxvYik7XG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRCbG9iQXNUZXh0KGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICB2YXIgcHJvbWlzZSA9IGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpO1xuICAgIHJlYWRlci5yZWFkQXNUZXh0KGJsb2IpO1xuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQXJyYXlCdWZmZXJBc1RleHQoYnVmKSB7XG4gICAgdmFyIHZpZXcgPSBuZXcgVWludDhBcnJheShidWYpO1xuICAgIHZhciBjaGFycyA9IG5ldyBBcnJheSh2aWV3Lmxlbmd0aCk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZpZXcubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNoYXJzW2ldID0gU3RyaW5nLmZyb21DaGFyQ29kZSh2aWV3W2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIGNoYXJzLmpvaW4oJycpXG4gIH1cblxuICBmdW5jdGlvbiBidWZmZXJDbG9uZShidWYpIHtcbiAgICBpZiAoYnVmLnNsaWNlKSB7XG4gICAgICByZXR1cm4gYnVmLnNsaWNlKDApXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmLmJ5dGVMZW5ndGgpO1xuICAgICAgdmlldy5zZXQobmV3IFVpbnQ4QXJyYXkoYnVmKSk7XG4gICAgICByZXR1cm4gdmlldy5idWZmZXJcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBCb2R5KCkge1xuICAgIHRoaXMuYm9keVVzZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuX2luaXRCb2R5ID0gZnVuY3Rpb24oYm9keSkge1xuICAgICAgdGhpcy5fYm9keUluaXQgPSBib2R5O1xuICAgICAgaWYgKCFib2R5KSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gJyc7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHk7XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYmxvYiAmJiBCbG9iLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlCbG9iID0gYm9keTtcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5mb3JtRGF0YSAmJiBGb3JtRGF0YS5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5Rm9ybURhdGEgPSBib2R5O1xuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LnNlYXJjaFBhcmFtcyAmJiBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5LnRvU3RyaW5nKCk7XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIgJiYgc3VwcG9ydC5ibG9iICYmIGlzRGF0YVZpZXcoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUFycmF5QnVmZmVyID0gYnVmZmVyQ2xvbmUoYm9keS5idWZmZXIpO1xuICAgICAgICAvLyBJRSAxMC0xMSBjYW4ndCBoYW5kbGUgYSBEYXRhVmlldyBib2R5LlxuICAgICAgICB0aGlzLl9ib2R5SW5pdCA9IG5ldyBCbG9iKFt0aGlzLl9ib2R5QXJyYXlCdWZmZXJdKTtcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlciAmJiAoQXJyYXlCdWZmZXIucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkgfHwgaXNBcnJheUJ1ZmZlclZpZXcoYm9keSkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlBcnJheUJ1ZmZlciA9IGJ1ZmZlckNsb25lKGJvZHkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5ID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGJvZHkpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCAndGV4dC9wbGFpbjtjaGFyc2V0PVVURi04Jyk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUJsb2IgJiYgdGhpcy5fYm9keUJsb2IudHlwZSkge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsIHRoaXMuX2JvZHlCbG9iLnR5cGUpO1xuICAgICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuc2VhcmNoUGFyYW1zICYmIFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7Y2hhcnNldD1VVEYtOCcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmIChzdXBwb3J0LmJsb2IpIHtcbiAgICAgIHRoaXMuYmxvYiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKTtcbiAgICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlCbG9iKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEJsb2IoW3RoaXMuX2JvZHlBcnJheUJ1ZmZlcl0pKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyBibG9iJylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBCbG9iKFt0aGlzLl9ib2R5VGV4dF0pKVxuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICB0aGlzLmFycmF5QnVmZmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpIHtcbiAgICAgICAgICByZXR1cm4gY29uc3VtZWQodGhpcykgfHwgUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcilcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5ibG9iKCkudGhlbihyZWFkQmxvYkFzQXJyYXlCdWZmZXIpXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgdGhpcy50ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKTtcbiAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgIHJldHVybiByZWFkQmxvYkFzVGV4dCh0aGlzLl9ib2R5QmxvYilcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUFycmF5QnVmZmVyKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVhZEFycmF5QnVmZmVyQXNUZXh0KHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikpXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgdGV4dCcpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlUZXh0KVxuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAoc3VwcG9ydC5mb3JtRGF0YSkge1xuICAgICAgdGhpcy5mb3JtRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihkZWNvZGUpXG4gICAgICB9O1xuICAgIH1cblxuICAgIHRoaXMuanNvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oSlNPTi5wYXJzZSlcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8vIEhUVFAgbWV0aG9kcyB3aG9zZSBjYXBpdGFsaXphdGlvbiBzaG91bGQgYmUgbm9ybWFsaXplZFxuICB2YXIgbWV0aG9kcyA9IFsnREVMRVRFJywgJ0dFVCcsICdIRUFEJywgJ09QVElPTlMnLCAnUE9TVCcsICdQVVQnXTtcblxuICBmdW5jdGlvbiBub3JtYWxpemVNZXRob2QobWV0aG9kKSB7XG4gICAgdmFyIHVwY2FzZWQgPSBtZXRob2QudG9VcHBlckNhc2UoKTtcbiAgICByZXR1cm4gbWV0aG9kcy5pbmRleE9mKHVwY2FzZWQpID4gLTEgPyB1cGNhc2VkIDogbWV0aG9kXG4gIH1cblxuICBmdW5jdGlvbiBSZXF1ZXN0KGlucHV0LCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdmFyIGJvZHkgPSBvcHRpb25zLmJvZHk7XG5cbiAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBSZXF1ZXN0KSB7XG4gICAgICBpZiAoaW5wdXQuYm9keVVzZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJylcbiAgICAgIH1cbiAgICAgIHRoaXMudXJsID0gaW5wdXQudXJsO1xuICAgICAgdGhpcy5jcmVkZW50aWFscyA9IGlucHV0LmNyZWRlbnRpYWxzO1xuICAgICAgaWYgKCFvcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMoaW5wdXQuaGVhZGVycyk7XG4gICAgICB9XG4gICAgICB0aGlzLm1ldGhvZCA9IGlucHV0Lm1ldGhvZDtcbiAgICAgIHRoaXMubW9kZSA9IGlucHV0Lm1vZGU7XG4gICAgICB0aGlzLnNpZ25hbCA9IGlucHV0LnNpZ25hbDtcbiAgICAgIGlmICghYm9keSAmJiBpbnB1dC5fYm9keUluaXQgIT0gbnVsbCkge1xuICAgICAgICBib2R5ID0gaW5wdXQuX2JvZHlJbml0O1xuICAgICAgICBpbnB1dC5ib2R5VXNlZCA9IHRydWU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudXJsID0gU3RyaW5nKGlucHV0KTtcbiAgICB9XG5cbiAgICB0aGlzLmNyZWRlbnRpYWxzID0gb3B0aW9ucy5jcmVkZW50aWFscyB8fCB0aGlzLmNyZWRlbnRpYWxzIHx8ICdzYW1lLW9yaWdpbic7XG4gICAgaWYgKG9wdGlvbnMuaGVhZGVycyB8fCAhdGhpcy5oZWFkZXJzKSB7XG4gICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpO1xuICAgIH1cbiAgICB0aGlzLm1ldGhvZCA9IG5vcm1hbGl6ZU1ldGhvZChvcHRpb25zLm1ldGhvZCB8fCB0aGlzLm1ldGhvZCB8fCAnR0VUJyk7XG4gICAgdGhpcy5tb2RlID0gb3B0aW9ucy5tb2RlIHx8IHRoaXMubW9kZSB8fCBudWxsO1xuICAgIHRoaXMuc2lnbmFsID0gb3B0aW9ucy5zaWduYWwgfHwgdGhpcy5zaWduYWw7XG4gICAgdGhpcy5yZWZlcnJlciA9IG51bGw7XG5cbiAgICBpZiAoKHRoaXMubWV0aG9kID09PSAnR0VUJyB8fCB0aGlzLm1ldGhvZCA9PT0gJ0hFQUQnKSAmJiBib2R5KSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdCb2R5IG5vdCBhbGxvd2VkIGZvciBHRVQgb3IgSEVBRCByZXF1ZXN0cycpXG4gICAgfVxuICAgIHRoaXMuX2luaXRCb2R5KGJvZHkpO1xuICB9XG5cbiAgUmVxdWVzdC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QodGhpcywge2JvZHk6IHRoaXMuX2JvZHlJbml0fSlcbiAgfTtcblxuICBmdW5jdGlvbiBkZWNvZGUoYm9keSkge1xuICAgIHZhciBmb3JtID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgYm9keVxuICAgICAgLnRyaW0oKVxuICAgICAgLnNwbGl0KCcmJylcbiAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICAgIGlmIChieXRlcykge1xuICAgICAgICAgIHZhciBzcGxpdCA9IGJ5dGVzLnNwbGl0KCc9Jyk7XG4gICAgICAgICAgdmFyIG5hbWUgPSBzcGxpdC5zaGlmdCgpLnJlcGxhY2UoL1xcKy9nLCAnICcpO1xuICAgICAgICAgIHZhciB2YWx1ZSA9IHNwbGl0LmpvaW4oJz0nKS5yZXBsYWNlKC9cXCsvZywgJyAnKTtcbiAgICAgICAgICBmb3JtLmFwcGVuZChkZWNvZGVVUklDb21wb25lbnQobmFtZSksIGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICByZXR1cm4gZm9ybVxuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VIZWFkZXJzKHJhd0hlYWRlcnMpIHtcbiAgICB2YXIgaGVhZGVycyA9IG5ldyBIZWFkZXJzKCk7XG4gICAgLy8gUmVwbGFjZSBpbnN0YW5jZXMgb2YgXFxyXFxuIGFuZCBcXG4gZm9sbG93ZWQgYnkgYXQgbGVhc3Qgb25lIHNwYWNlIG9yIGhvcml6b250YWwgdGFiIHdpdGggYSBzcGFjZVxuICAgIC8vIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmM3MjMwI3NlY3Rpb24tMy4yXG4gICAgdmFyIHByZVByb2Nlc3NlZEhlYWRlcnMgPSByYXdIZWFkZXJzLnJlcGxhY2UoL1xccj9cXG5bXFx0IF0rL2csICcgJyk7XG4gICAgcHJlUHJvY2Vzc2VkSGVhZGVycy5zcGxpdCgvXFxyP1xcbi8pLmZvckVhY2goZnVuY3Rpb24obGluZSkge1xuICAgICAgdmFyIHBhcnRzID0gbGluZS5zcGxpdCgnOicpO1xuICAgICAgdmFyIGtleSA9IHBhcnRzLnNoaWZ0KCkudHJpbSgpO1xuICAgICAgaWYgKGtleSkge1xuICAgICAgICB2YXIgdmFsdWUgPSBwYXJ0cy5qb2luKCc6JykudHJpbSgpO1xuICAgICAgICBoZWFkZXJzLmFwcGVuZChrZXksIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gaGVhZGVyc1xuICB9XG5cbiAgQm9keS5jYWxsKFJlcXVlc3QucHJvdG90eXBlKTtcblxuICBmdW5jdGlvbiBSZXNwb25zZShib2R5SW5pdCwgb3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IHt9O1xuICAgIH1cblxuICAgIHRoaXMudHlwZSA9ICdkZWZhdWx0JztcbiAgICB0aGlzLnN0YXR1cyA9IG9wdGlvbnMuc3RhdHVzID09PSB1bmRlZmluZWQgPyAyMDAgOiBvcHRpb25zLnN0YXR1cztcbiAgICB0aGlzLm9rID0gdGhpcy5zdGF0dXMgPj0gMjAwICYmIHRoaXMuc3RhdHVzIDwgMzAwO1xuICAgIHRoaXMuc3RhdHVzVGV4dCA9ICdzdGF0dXNUZXh0JyBpbiBvcHRpb25zID8gb3B0aW9ucy5zdGF0dXNUZXh0IDogJ09LJztcbiAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpO1xuICAgIHRoaXMudXJsID0gb3B0aW9ucy51cmwgfHwgJyc7XG4gICAgdGhpcy5faW5pdEJvZHkoYm9keUluaXQpO1xuICB9XG5cbiAgQm9keS5jYWxsKFJlc3BvbnNlLnByb3RvdHlwZSk7XG5cbiAgUmVzcG9uc2UucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZSh0aGlzLl9ib2R5SW5pdCwge1xuICAgICAgc3RhdHVzOiB0aGlzLnN0YXR1cyxcbiAgICAgIHN0YXR1c1RleHQ6IHRoaXMuc3RhdHVzVGV4dCxcbiAgICAgIGhlYWRlcnM6IG5ldyBIZWFkZXJzKHRoaXMuaGVhZGVycyksXG4gICAgICB1cmw6IHRoaXMudXJsXG4gICAgfSlcbiAgfTtcblxuICBSZXNwb25zZS5lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXNwb25zZSA9IG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiAwLCBzdGF0dXNUZXh0OiAnJ30pO1xuICAgIHJlc3BvbnNlLnR5cGUgPSAnZXJyb3InO1xuICAgIHJldHVybiByZXNwb25zZVxuICB9O1xuXG4gIHZhciByZWRpcmVjdFN0YXR1c2VzID0gWzMwMSwgMzAyLCAzMDMsIDMwNywgMzA4XTtcblxuICBSZXNwb25zZS5yZWRpcmVjdCA9IGZ1bmN0aW9uKHVybCwgc3RhdHVzKSB7XG4gICAgaWYgKHJlZGlyZWN0U3RhdHVzZXMuaW5kZXhPZihzdGF0dXMpID09PSAtMSkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0ludmFsaWQgc3RhdHVzIGNvZGUnKVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgUmVzcG9uc2UobnVsbCwge3N0YXR1czogc3RhdHVzLCBoZWFkZXJzOiB7bG9jYXRpb246IHVybH19KVxuICB9O1xuXG4gIGV4cG9ydHMuRE9NRXhjZXB0aW9uID0gc2VsZi5ET01FeGNlcHRpb247XG4gIHRyeSB7XG4gICAgbmV3IGV4cG9ydHMuRE9NRXhjZXB0aW9uKCk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGV4cG9ydHMuRE9NRXhjZXB0aW9uID0gZnVuY3Rpb24obWVzc2FnZSwgbmFtZSkge1xuICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICB2YXIgZXJyb3IgPSBFcnJvcihtZXNzYWdlKTtcbiAgICAgIHRoaXMuc3RhY2sgPSBlcnJvci5zdGFjaztcbiAgICB9O1xuICAgIGV4cG9ydHMuRE9NRXhjZXB0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRXJyb3IucHJvdG90eXBlKTtcbiAgICBleHBvcnRzLkRPTUV4Y2VwdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBleHBvcnRzLkRPTUV4Y2VwdGlvbjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZldGNoKGlucHV0LCBpbml0KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgUmVxdWVzdChpbnB1dCwgaW5pdCk7XG5cbiAgICAgIGlmIChyZXF1ZXN0LnNpZ25hbCAmJiByZXF1ZXN0LnNpZ25hbC5hYm9ydGVkKSB7XG4gICAgICAgIHJldHVybiByZWplY3QobmV3IGV4cG9ydHMuRE9NRXhjZXB0aW9uKCdBYm9ydGVkJywgJ0Fib3J0RXJyb3InKSlcbiAgICAgIH1cblxuICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICBmdW5jdGlvbiBhYm9ydFhocigpIHtcbiAgICAgICAgeGhyLmFib3J0KCk7XG4gICAgICB9XG5cbiAgICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICAgICAgc3RhdHVzOiB4aHIuc3RhdHVzLFxuICAgICAgICAgIHN0YXR1c1RleHQ6IHhoci5zdGF0dXNUZXh0LFxuICAgICAgICAgIGhlYWRlcnM6IHBhcnNlSGVhZGVycyh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkgfHwgJycpXG4gICAgICAgIH07XG4gICAgICAgIG9wdGlvbnMudXJsID0gJ3Jlc3BvbnNlVVJMJyBpbiB4aHIgPyB4aHIucmVzcG9uc2VVUkwgOiBvcHRpb25zLmhlYWRlcnMuZ2V0KCdYLVJlcXVlc3QtVVJMJyk7XG4gICAgICAgIHZhciBib2R5ID0gJ3Jlc3BvbnNlJyBpbiB4aHIgPyB4aHIucmVzcG9uc2UgOiB4aHIucmVzcG9uc2VUZXh0O1xuICAgICAgICByZXNvbHZlKG5ldyBSZXNwb25zZShib2R5LCBvcHRpb25zKSk7XG4gICAgICB9O1xuXG4gICAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKTtcbiAgICAgIH07XG5cbiAgICAgIHhoci5vbnRpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSk7XG4gICAgICB9O1xuXG4gICAgICB4aHIub25hYm9ydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IGV4cG9ydHMuRE9NRXhjZXB0aW9uKCdBYm9ydGVkJywgJ0Fib3J0RXJyb3InKSk7XG4gICAgICB9O1xuXG4gICAgICB4aHIub3BlbihyZXF1ZXN0Lm1ldGhvZCwgcmVxdWVzdC51cmwsIHRydWUpO1xuXG4gICAgICBpZiAocmVxdWVzdC5jcmVkZW50aWFscyA9PT0gJ2luY2x1ZGUnKSB7XG4gICAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChyZXF1ZXN0LmNyZWRlbnRpYWxzID09PSAnb21pdCcpIHtcbiAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpZiAoJ3Jlc3BvbnNlVHlwZScgaW4geGhyICYmIHN1cHBvcnQuYmxvYikge1xuICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2Jsb2InO1xuICAgICAgfVxuXG4gICAgICByZXF1ZXN0LmhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZSk7XG4gICAgICB9KTtcblxuICAgICAgaWYgKHJlcXVlc3Quc2lnbmFsKSB7XG4gICAgICAgIHJlcXVlc3Quc2lnbmFsLmFkZEV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgYWJvcnRYaHIpO1xuXG4gICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAvLyBET05FIChzdWNjZXNzIG9yIGZhaWx1cmUpXG4gICAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgICByZXF1ZXN0LnNpZ25hbC5yZW1vdmVFdmVudExpc3RlbmVyKCdhYm9ydCcsIGFib3J0WGhyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHhoci5zZW5kKHR5cGVvZiByZXF1ZXN0Ll9ib2R5SW5pdCA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogcmVxdWVzdC5fYm9keUluaXQpO1xuICAgIH0pXG4gIH1cblxuICBmZXRjaC5wb2x5ZmlsbCA9IHRydWU7XG5cbiAgaWYgKCFzZWxmLmZldGNoKSB7XG4gICAgc2VsZi5mZXRjaCA9IGZldGNoO1xuICAgIHNlbGYuSGVhZGVycyA9IEhlYWRlcnM7XG4gICAgc2VsZi5SZXF1ZXN0ID0gUmVxdWVzdDtcbiAgICBzZWxmLlJlc3BvbnNlID0gUmVzcG9uc2U7XG4gIH1cblxuICBleHBvcnRzLkhlYWRlcnMgPSBIZWFkZXJzO1xuICBleHBvcnRzLlJlcXVlc3QgPSBSZXF1ZXN0O1xuICBleHBvcnRzLlJlc3BvbnNlID0gUmVzcG9uc2U7XG4gIGV4cG9ydHMuZmV0Y2ggPSBmZXRjaDtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuXG59KSkpO1xuIiwiLyoganNoaW50IG5vZGU6IHRydWUgKi9cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gICMgd2lsZGNhcmRcblxuICBWZXJ5IHNpbXBsZSB3aWxkY2FyZCBtYXRjaGluZywgd2hpY2ggaXMgZGVzaWduZWQgdG8gcHJvdmlkZSB0aGUgc2FtZVxuICBmdW5jdGlvbmFsaXR5IHRoYXQgaXMgZm91bmQgaW4gdGhlXG4gIFtldmVdKGh0dHBzOi8vZ2l0aHViLmNvbS9hZG9iZS13ZWJwbGF0Zm9ybS9ldmUpIGV2ZW50aW5nIGxpYnJhcnkuXG5cbiAgIyMgVXNhZ2VcblxuICBJdCB3b3JrcyB3aXRoIHN0cmluZ3M6XG5cbiAgPDw8IGV4YW1wbGVzL3N0cmluZ3MuanNcblxuICBBcnJheXM6XG5cbiAgPDw8IGV4YW1wbGVzL2FycmF5cy5qc1xuXG4gIE9iamVjdHMgKG1hdGNoaW5nIGFnYWluc3Qga2V5cyk6XG5cbiAgPDw8IGV4YW1wbGVzL29iamVjdHMuanNcblxuICBXaGlsZSB0aGUgbGlicmFyeSB3b3JrcyBpbiBOb2RlLCBpZiB5b3UgYXJlIGFyZSBsb29raW5nIGZvciBmaWxlLWJhc2VkXG4gIHdpbGRjYXJkIG1hdGNoaW5nIHRoZW4geW91IHNob3VsZCBoYXZlIGEgbG9vayBhdDpcblxuICA8aHR0cHM6Ly9naXRodWIuY29tL2lzYWFjcy9ub2RlLWdsb2I+XG4qKi9cblxuZnVuY3Rpb24gV2lsZGNhcmRNYXRjaGVyKHRleHQsIHNlcGFyYXRvcikge1xuICB0aGlzLnRleHQgPSB0ZXh0ID0gdGV4dCB8fCAnJztcbiAgdGhpcy5oYXNXaWxkID0gfnRleHQuaW5kZXhPZignKicpO1xuICB0aGlzLnNlcGFyYXRvciA9IHNlcGFyYXRvcjtcbiAgdGhpcy5wYXJ0cyA9IHRleHQuc3BsaXQoc2VwYXJhdG9yKTtcbn1cblxuV2lsZGNhcmRNYXRjaGVyLnByb3RvdHlwZS5tYXRjaCA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gIHZhciBtYXRjaGVzID0gdHJ1ZTtcbiAgdmFyIHBhcnRzID0gdGhpcy5wYXJ0cztcbiAgdmFyIGlpO1xuICB2YXIgcGFydHNDb3VudCA9IHBhcnRzLmxlbmd0aDtcbiAgdmFyIHRlc3RQYXJ0cztcblxuICBpZiAodHlwZW9mIGlucHV0ID09ICdzdHJpbmcnIHx8IGlucHV0IGluc3RhbmNlb2YgU3RyaW5nKSB7XG4gICAgaWYgKCF0aGlzLmhhc1dpbGQgJiYgdGhpcy50ZXh0ICE9IGlucHV0KSB7XG4gICAgICBtYXRjaGVzID0gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRlc3RQYXJ0cyA9IChpbnB1dCB8fCAnJykuc3BsaXQodGhpcy5zZXBhcmF0b3IpO1xuICAgICAgZm9yIChpaSA9IDA7IG1hdGNoZXMgJiYgaWkgPCBwYXJ0c0NvdW50OyBpaSsrKSB7XG4gICAgICAgIGlmIChwYXJ0c1tpaV0gPT09ICcqJykgIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfSBlbHNlIGlmIChpaSA8IHRlc3RQYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgICBtYXRjaGVzID0gcGFydHNbaWldID09PSB0ZXN0UGFydHNbaWldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1hdGNoZXMgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBJZiBtYXRjaGVzLCB0aGVuIHJldHVybiB0aGUgY29tcG9uZW50IHBhcnRzXG4gICAgICBtYXRjaGVzID0gbWF0Y2hlcyAmJiB0ZXN0UGFydHM7XG4gICAgfVxuICB9XG4gIGVsc2UgaWYgKHR5cGVvZiBpbnB1dC5zcGxpY2UgPT0gJ2Z1bmN0aW9uJykge1xuICAgIG1hdGNoZXMgPSBbXTtcblxuICAgIGZvciAoaWkgPSBpbnB1dC5sZW5ndGg7IGlpLS07ICkge1xuICAgICAgaWYgKHRoaXMubWF0Y2goaW5wdXRbaWldKSkge1xuICAgICAgICBtYXRjaGVzW21hdGNoZXMubGVuZ3RoXSA9IGlucHV0W2lpXTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZWxzZSBpZiAodHlwZW9mIGlucHV0ID09ICdvYmplY3QnKSB7XG4gICAgbWF0Y2hlcyA9IHt9O1xuXG4gICAgZm9yICh2YXIga2V5IGluIGlucHV0KSB7XG4gICAgICBpZiAodGhpcy5tYXRjaChrZXkpKSB7XG4gICAgICAgIG1hdGNoZXNba2V5XSA9IGlucHV0W2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG1hdGNoZXM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRleHQsIHRlc3QsIHNlcGFyYXRvcikge1xuICB2YXIgbWF0Y2hlciA9IG5ldyBXaWxkY2FyZE1hdGNoZXIodGV4dCwgc2VwYXJhdG9yIHx8IC9bXFwvXFwuXS8pO1xuICBpZiAodHlwZW9mIHRlc3QgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gbWF0Y2hlci5tYXRjaCh0ZXN0KTtcbiAgfVxuXG4gIHJldHVybiBtYXRjaGVyO1xufTtcbiIsIid1c2Ugc3RyaWN0J1xuXG5jbGFzcyBBdXRoRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICBzdXBlcignQXV0aG9yaXphdGlvbiByZXF1aXJlZCcpXG4gICAgdGhpcy5uYW1lID0gJ0F1dGhFcnJvcidcbiAgICB0aGlzLmlzQXV0aEVycm9yID0gdHJ1ZVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQXV0aEVycm9yXG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgUmVxdWVzdENsaWVudCA9IHJlcXVpcmUoJy4vUmVxdWVzdENsaWVudCcpXG5jb25zdCB0b2tlblN0b3JhZ2UgPSByZXF1aXJlKCcuL3Rva2VuU3RvcmFnZScpXG5cbmNvbnN0IF9nZXROYW1lID0gKGlkKSA9PiB7XG4gIHJldHVybiBpZC5zcGxpdCgnLScpLm1hcCgocykgPT4gcy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHMuc2xpY2UoMSkpLmpvaW4oJyAnKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFByb3ZpZGVyIGV4dGVuZHMgUmVxdWVzdENsaWVudCB7XG4gIGNvbnN0cnVjdG9yICh1cHB5LCBvcHRzKSB7XG4gICAgc3VwZXIodXBweSwgb3B0cylcbiAgICB0aGlzLnByb3ZpZGVyID0gb3B0cy5wcm92aWRlclxuICAgIHRoaXMuaWQgPSB0aGlzLnByb3ZpZGVyXG4gICAgdGhpcy5hdXRoUHJvdmlkZXIgPSBvcHRzLmF1dGhQcm92aWRlciB8fCB0aGlzLnByb3ZpZGVyXG4gICAgdGhpcy5uYW1lID0gdGhpcy5vcHRzLm5hbWUgfHwgX2dldE5hbWUodGhpcy5pZClcbiAgICB0aGlzLnBsdWdpbklkID0gdGhpcy5vcHRzLnBsdWdpbklkXG4gICAgdGhpcy50b2tlbktleSA9IGBjb21wYW5pb24tJHt0aGlzLnBsdWdpbklkfS1hdXRoLXRva2VuYFxuICB9XG5cbiAgaGVhZGVycyAoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHN1cGVyLmhlYWRlcnMoKS50aGVuKChoZWFkZXJzKSA9PiB7XG4gICAgICAgIHRoaXMuZ2V0QXV0aFRva2VuKCkudGhlbigodG9rZW4pID0+IHtcbiAgICAgICAgICByZXNvbHZlKE9iamVjdC5hc3NpZ24oe30sIGhlYWRlcnMsIHsgJ3VwcHktYXV0aC10b2tlbic6IHRva2VuIH0pKVxuICAgICAgICB9KVxuICAgICAgfSkuY2F0Y2gocmVqZWN0KVxuICAgIH0pXG4gIH1cblxuICBvblJlY2VpdmVSZXNwb25zZSAocmVzcG9uc2UpIHtcbiAgICByZXNwb25zZSA9IHN1cGVyLm9uUmVjZWl2ZVJlc3BvbnNlKHJlc3BvbnNlKVxuICAgIGNvbnN0IGF1dGhlbnRpY2F0ZWQgPSByZXNwb25zZS5zdGF0dXMgIT09IDQwMVxuICAgIHRoaXMudXBweS5nZXRQbHVnaW4odGhpcy5wbHVnaW5JZCkuc2V0UGx1Z2luU3RhdGUoeyBhdXRoZW50aWNhdGVkIH0pXG4gICAgcmV0dXJuIHJlc3BvbnNlXG4gIH1cblxuICAvLyBAdG9kbyhpLm9sYXJld2FqdSkgY29uc2lkZXIgd2hldGhlciBvciBub3QgdGhpcyBtZXRob2Qgc2hvdWxkIGJlIGV4cG9zZWRcbiAgc2V0QXV0aFRva2VuICh0b2tlbikge1xuICAgIHJldHVybiB0aGlzLnVwcHkuZ2V0UGx1Z2luKHRoaXMucGx1Z2luSWQpLnN0b3JhZ2Uuc2V0SXRlbSh0aGlzLnRva2VuS2V5LCB0b2tlbilcbiAgfVxuXG4gIGdldEF1dGhUb2tlbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMudXBweS5nZXRQbHVnaW4odGhpcy5wbHVnaW5JZCkuc3RvcmFnZS5nZXRJdGVtKHRoaXMudG9rZW5LZXkpXG4gIH1cblxuICBhdXRoVXJsICgpIHtcbiAgICByZXR1cm4gYCR7dGhpcy5ob3N0bmFtZX0vJHt0aGlzLmlkfS9jb25uZWN0YFxuICB9XG5cbiAgZmlsZVVybCAoaWQpIHtcbiAgICByZXR1cm4gYCR7dGhpcy5ob3N0bmFtZX0vJHt0aGlzLmlkfS9nZXQvJHtpZH1gXG4gIH1cblxuICBsaXN0IChkaXJlY3RvcnkpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoYCR7dGhpcy5pZH0vbGlzdC8ke2RpcmVjdG9yeSB8fCAnJ31gKVxuICB9XG5cbiAgbG9nb3V0IChyZWRpcmVjdCA9IGxvY2F0aW9uLmhyZWYpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5nZXQoYCR7dGhpcy5pZH0vbG9nb3V0P3JlZGlyZWN0PSR7cmVkaXJlY3R9YClcbiAgICAgICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgIHRoaXMudXBweS5nZXRQbHVnaW4odGhpcy5wbHVnaW5JZCkuc3RvcmFnZS5yZW1vdmVJdGVtKHRoaXMudG9rZW5LZXkpXG4gICAgICAgICAgICAudGhlbigoKSA9PiByZXNvbHZlKHJlcykpXG4gICAgICAgICAgICAuY2F0Y2gocmVqZWN0KVxuICAgICAgICB9KS5jYXRjaChyZWplY3QpXG4gICAgfSlcbiAgfVxuXG4gIHN0YXRpYyBpbml0UGx1Z2luIChwbHVnaW4sIG9wdHMsIGRlZmF1bHRPcHRzKSB7XG4gICAgcGx1Z2luLnR5cGUgPSAnYWNxdWlyZXInXG4gICAgcGx1Z2luLmZpbGVzID0gW11cbiAgICBpZiAoZGVmYXVsdE9wdHMpIHtcbiAgICAgIHBsdWdpbi5vcHRzID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdE9wdHMsIG9wdHMpXG4gICAgfVxuXG4gICAgaWYgKG9wdHMuc2VydmVyUGF0dGVybikge1xuICAgICAgY29uc3QgcGF0dGVybiA9IG9wdHMuc2VydmVyUGF0dGVyblxuICAgICAgLy8gdmFsaWRhdGUgc2VydmVyUGF0dGVybiBwYXJhbVxuICAgICAgaWYgKHR5cGVvZiBwYXR0ZXJuICE9PSAnc3RyaW5nJyAmJiAhQXJyYXkuaXNBcnJheShwYXR0ZXJuKSAmJiAhKHBhdHRlcm4gaW5zdGFuY2VvZiBSZWdFeHApKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYCR7cGx1Z2luLmlkfTogdGhlIG9wdGlvbiBcInNlcnZlclBhdHRlcm5cIiBtdXN0IGJlIG9uZSBvZiBzdHJpbmcsIEFycmF5LCBSZWdFeHBgKVxuICAgICAgfVxuICAgICAgcGx1Z2luLm9wdHMuc2VydmVyUGF0dGVybiA9IHBhdHRlcm5cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZG9lcyBub3Qgc3RhcnQgd2l0aCBodHRwczovL1xuICAgICAgaWYgKC9eKD8haHR0cHM/OlxcL1xcLykuKiQvaS50ZXN0KG9wdHMuc2VydmVyVXJsKSkge1xuICAgICAgICBwbHVnaW4ub3B0cy5zZXJ2ZXJQYXR0ZXJuID0gYGh0dHBzOi8vJHtvcHRzLnNlcnZlclVybC5yZXBsYWNlKC9eXFwvXFwvLywgJycpfWBcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBsdWdpbi5vcHRzLnNlcnZlclBhdHRlcm4gPSBvcHRzLnNlcnZlclVybFxuICAgICAgfVxuICAgIH1cblxuICAgIHBsdWdpbi5zdG9yYWdlID0gcGx1Z2luLm9wdHMuc3RvcmFnZSB8fCB0b2tlblN0b3JhZ2VcbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IEF1dGhFcnJvciA9IHJlcXVpcmUoJy4vQXV0aEVycm9yJylcblxuLy8gUmVtb3ZlIHRoZSB0cmFpbGluZyBzbGFzaCBzbyB3ZSBjYW4gYWx3YXlzIHNhZmVseSBhcHBlbmQgL3h5ei5cbmZ1bmN0aW9uIHN0cmlwU2xhc2ggKHVybCkge1xuICByZXR1cm4gdXJsLnJlcGxhY2UoL1xcLyQvLCAnJylcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBSZXF1ZXN0Q2xpZW50IHtcbiAgY29uc3RydWN0b3IgKHVwcHksIG9wdHMpIHtcbiAgICB0aGlzLnVwcHkgPSB1cHB5XG4gICAgdGhpcy5vcHRzID0gb3B0c1xuICAgIHRoaXMub25SZWNlaXZlUmVzcG9uc2UgPSB0aGlzLm9uUmVjZWl2ZVJlc3BvbnNlLmJpbmQodGhpcylcbiAgfVxuXG4gIGdldCBob3N0bmFtZSAoKSB7XG4gICAgY29uc3QgeyBjb21wYW5pb24gfSA9IHRoaXMudXBweS5nZXRTdGF0ZSgpXG4gICAgY29uc3QgaG9zdCA9IHRoaXMub3B0cy5zZXJ2ZXJVcmxcbiAgICByZXR1cm4gc3RyaXBTbGFzaChjb21wYW5pb24gJiYgY29tcGFuaW9uW2hvc3RdID8gY29tcGFuaW9uW2hvc3RdIDogaG9zdClcbiAgfVxuXG4gIGdldCBkZWZhdWx0SGVhZGVycyAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgfVxuICB9XG5cbiAgaGVhZGVycyAoKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShPYmplY3QuYXNzaWduKHt9LCB0aGlzLmRlZmF1bHRIZWFkZXJzLCB0aGlzLm9wdHMuc2VydmVySGVhZGVycyB8fCB7fSkpXG4gIH1cblxuICBfZ2V0UG9zdFJlc3BvbnNlRnVuYyAoc2tpcCkge1xuICAgIHJldHVybiAocmVzcG9uc2UpID0+IHtcbiAgICAgIGlmICghc2tpcCkge1xuICAgICAgICByZXR1cm4gdGhpcy5vblJlY2VpdmVSZXNwb25zZShyZXNwb25zZSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3BvbnNlXG4gICAgfVxuICB9XG5cbiAgb25SZWNlaXZlUmVzcG9uc2UgKHJlc3BvbnNlKSB7XG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLnVwcHkuZ2V0U3RhdGUoKVxuICAgIGNvbnN0IGNvbXBhbmlvbiA9IHN0YXRlLmNvbXBhbmlvbiB8fCB7fVxuICAgIGNvbnN0IGhvc3QgPSB0aGlzLm9wdHMuc2VydmVyVXJsXG4gICAgY29uc3QgaGVhZGVycyA9IHJlc3BvbnNlLmhlYWRlcnNcbiAgICAvLyBTdG9yZSB0aGUgc2VsZi1pZGVudGlmaWVkIGRvbWFpbiBuYW1lIGZvciB0aGUgQ29tcGFuaW9uIGluc3RhbmNlIHdlIGp1c3QgaGl0LlxuICAgIGlmIChoZWFkZXJzLmhhcygnaS1hbScpICYmIGhlYWRlcnMuZ2V0KCdpLWFtJykgIT09IGNvbXBhbmlvbltob3N0XSkge1xuICAgICAgdGhpcy51cHB5LnNldFN0YXRlKHtcbiAgICAgICAgY29tcGFuaW9uOiBPYmplY3QuYXNzaWduKHt9LCBjb21wYW5pb24sIHtcbiAgICAgICAgICBbaG9zdF06IGhlYWRlcnMuZ2V0KCdpLWFtJylcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfVxuICAgIHJldHVybiByZXNwb25zZVxuICB9XG5cbiAgX2dldFVybCAodXJsKSB7XG4gICAgaWYgKC9eKGh0dHBzPzp8KVxcL1xcLy8udGVzdCh1cmwpKSB7XG4gICAgICByZXR1cm4gdXJsXG4gICAgfVxuICAgIHJldHVybiBgJHt0aGlzLmhvc3RuYW1lfS8ke3VybH1gXG4gIH1cblxuICBfanNvbiAocmVzKSB7XG4gICAgaWYgKHJlcy5zdGF0dXMgPT09IDQwMSkge1xuICAgICAgdGhyb3cgbmV3IEF1dGhFcnJvcigpXG4gICAgfVxuXG4gICAgaWYgKHJlcy5zdGF0dXMgPCAyMDAgfHwgcmVzLnN0YXR1cyA+IDMwMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgcmVxdWVzdCB0byAke3Jlcy51cmx9LiAke3Jlcy5zdGF0dXNUZXh0fWApXG4gICAgfVxuICAgIHJldHVybiByZXMuanNvbigpXG4gIH1cblxuICBnZXQgKHBhdGgsIHNraXBQb3N0UmVzcG9uc2UpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5oZWFkZXJzKCkudGhlbigoaGVhZGVycykgPT4ge1xuICAgICAgICBmZXRjaCh0aGlzLl9nZXRVcmwocGF0aCksIHtcbiAgICAgICAgICBtZXRob2Q6ICdnZXQnLFxuICAgICAgICAgIGhlYWRlcnM6IGhlYWRlcnMsXG4gICAgICAgICAgY3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbidcbiAgICAgICAgfSlcbiAgICAgICAgICAudGhlbih0aGlzLl9nZXRQb3N0UmVzcG9uc2VGdW5jKHNraXBQb3N0UmVzcG9uc2UpKVxuICAgICAgICAgIC50aGVuKChyZXMpID0+IHRoaXMuX2pzb24ocmVzKS50aGVuKHJlc29sdmUpKVxuICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBlcnIgPSBlcnIuaXNBdXRoRXJyb3IgPyBlcnIgOiBuZXcgRXJyb3IoYENvdWxkIG5vdCBnZXQgJHt0aGlzLl9nZXRVcmwocGF0aCl9LiAke2Vycn1gKVxuICAgICAgICAgICAgcmVqZWN0KGVycilcbiAgICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgcG9zdCAocGF0aCwgZGF0YSwgc2tpcFBvc3RSZXNwb25zZSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLmhlYWRlcnMoKS50aGVuKChoZWFkZXJzKSA9PiB7XG4gICAgICAgIGZldGNoKHRoaXMuX2dldFVybChwYXRoKSwge1xuICAgICAgICAgIG1ldGhvZDogJ3Bvc3QnLFxuICAgICAgICAgIGhlYWRlcnM6IGhlYWRlcnMsXG4gICAgICAgICAgY3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbicsXG4gICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoZGF0YSlcbiAgICAgICAgfSlcbiAgICAgICAgICAudGhlbih0aGlzLl9nZXRQb3N0UmVzcG9uc2VGdW5jKHNraXBQb3N0UmVzcG9uc2UpKVxuICAgICAgICAgIC50aGVuKChyZXMpID0+IHRoaXMuX2pzb24ocmVzKS50aGVuKHJlc29sdmUpKVxuICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBlcnIgPSBlcnIuaXNBdXRoRXJyb3IgPyBlcnIgOiBuZXcgRXJyb3IoYENvdWxkIG5vdCBwb3N0ICR7dGhpcy5fZ2V0VXJsKHBhdGgpfS4gJHtlcnJ9YClcbiAgICAgICAgICAgIHJlamVjdChlcnIpXG4gICAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIGRlbGV0ZSAocGF0aCwgZGF0YSwgc2tpcFBvc3RSZXNwb25zZSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLmhlYWRlcnMoKS50aGVuKChoZWFkZXJzKSA9PiB7XG4gICAgICAgIGZldGNoKGAke3RoaXMuaG9zdG5hbWV9LyR7cGF0aH1gLCB7XG4gICAgICAgICAgbWV0aG9kOiAnZGVsZXRlJyxcbiAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzLFxuICAgICAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nLFxuICAgICAgICAgIGJvZHk6IGRhdGEgPyBKU09OLnN0cmluZ2lmeShkYXRhKSA6IG51bGxcbiAgICAgICAgfSlcbiAgICAgICAgICAudGhlbih0aGlzLl9nZXRQb3N0UmVzcG9uc2VGdW5jKHNraXBQb3N0UmVzcG9uc2UpKVxuICAgICAgICAgIC50aGVuKChyZXMpID0+IHRoaXMuX2pzb24ocmVzKS50aGVuKHJlc29sdmUpKVxuICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBlcnIgPSBlcnIuaXNBdXRoRXJyb3IgPyBlcnIgOiBuZXcgRXJyb3IoYENvdWxkIG5vdCBkZWxldGUgJHt0aGlzLl9nZXRVcmwocGF0aCl9LiAke2Vycn1gKVxuICAgICAgICAgICAgcmVqZWN0KGVycilcbiAgICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuICB9XG59XG4iLCJjb25zdCBlZSA9IHJlcXVpcmUoJ25hbWVzcGFjZS1lbWl0dGVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBVcHB5U29ja2V0IHtcbiAgY29uc3RydWN0b3IgKG9wdHMpIHtcbiAgICB0aGlzLnF1ZXVlZCA9IFtdXG4gICAgdGhpcy5pc09wZW4gPSBmYWxzZVxuICAgIHRoaXMuc29ja2V0ID0gbmV3IFdlYlNvY2tldChvcHRzLnRhcmdldClcbiAgICB0aGlzLmVtaXR0ZXIgPSBlZSgpXG5cbiAgICB0aGlzLnNvY2tldC5vbm9wZW4gPSAoZSkgPT4ge1xuICAgICAgdGhpcy5pc09wZW4gPSB0cnVlXG5cbiAgICAgIHdoaWxlICh0aGlzLnF1ZXVlZC5sZW5ndGggPiAwICYmIHRoaXMuaXNPcGVuKSB7XG4gICAgICAgIGNvbnN0IGZpcnN0ID0gdGhpcy5xdWV1ZWRbMF1cbiAgICAgICAgdGhpcy5zZW5kKGZpcnN0LmFjdGlvbiwgZmlyc3QucGF5bG9hZClcbiAgICAgICAgdGhpcy5xdWV1ZWQgPSB0aGlzLnF1ZXVlZC5zbGljZSgxKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuc29ja2V0Lm9uY2xvc2UgPSAoZSkgPT4ge1xuICAgICAgdGhpcy5pc09wZW4gPSBmYWxzZVxuICAgIH1cblxuICAgIHRoaXMuX2hhbmRsZU1lc3NhZ2UgPSB0aGlzLl9oYW5kbGVNZXNzYWdlLmJpbmQodGhpcylcblxuICAgIHRoaXMuc29ja2V0Lm9ubWVzc2FnZSA9IHRoaXMuX2hhbmRsZU1lc3NhZ2VcblxuICAgIHRoaXMuY2xvc2UgPSB0aGlzLmNsb3NlLmJpbmQodGhpcylcbiAgICB0aGlzLmVtaXQgPSB0aGlzLmVtaXQuYmluZCh0aGlzKVxuICAgIHRoaXMub24gPSB0aGlzLm9uLmJpbmQodGhpcylcbiAgICB0aGlzLm9uY2UgPSB0aGlzLm9uY2UuYmluZCh0aGlzKVxuICAgIHRoaXMuc2VuZCA9IHRoaXMuc2VuZC5iaW5kKHRoaXMpXG4gIH1cblxuICBjbG9zZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc29ja2V0LmNsb3NlKClcbiAgfVxuXG4gIHNlbmQgKGFjdGlvbiwgcGF5bG9hZCkge1xuICAgIC8vIGF0dGFjaCB1dWlkXG5cbiAgICBpZiAoIXRoaXMuaXNPcGVuKSB7XG4gICAgICB0aGlzLnF1ZXVlZC5wdXNoKHthY3Rpb24sIHBheWxvYWR9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy5zb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICBhY3Rpb24sXG4gICAgICBwYXlsb2FkXG4gICAgfSkpXG4gIH1cblxuICBvbiAoYWN0aW9uLCBoYW5kbGVyKSB7XG4gICAgdGhpcy5lbWl0dGVyLm9uKGFjdGlvbiwgaGFuZGxlcilcbiAgfVxuXG4gIGVtaXQgKGFjdGlvbiwgcGF5bG9hZCkge1xuICAgIHRoaXMuZW1pdHRlci5lbWl0KGFjdGlvbiwgcGF5bG9hZClcbiAgfVxuXG4gIG9uY2UgKGFjdGlvbiwgaGFuZGxlcikge1xuICAgIHRoaXMuZW1pdHRlci5vbmNlKGFjdGlvbiwgaGFuZGxlcilcbiAgfVxuXG4gIF9oYW5kbGVNZXNzYWdlIChlKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBKU09OLnBhcnNlKGUuZGF0YSlcbiAgICAgIHRoaXMuZW1pdChtZXNzYWdlLmFjdGlvbiwgbWVzc2FnZS5wYXlsb2FkKVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5sb2coZXJyKVxuICAgIH1cbiAgfVxufVxuIiwiJ3VzZS1zdHJpY3QnXG4vKipcbiAqIE1hbmFnZXMgY29tbXVuaWNhdGlvbnMgd2l0aCBDb21wYW5pb25cbiAqL1xuXG5jb25zdCBSZXF1ZXN0Q2xpZW50ID0gcmVxdWlyZSgnLi9SZXF1ZXN0Q2xpZW50JylcbmNvbnN0IFByb3ZpZGVyID0gcmVxdWlyZSgnLi9Qcm92aWRlcicpXG5jb25zdCBTb2NrZXQgPSByZXF1aXJlKCcuL1NvY2tldCcpXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBSZXF1ZXN0Q2xpZW50LFxuICBQcm92aWRlcixcbiAgU29ja2V0XG59XG4iLCIndXNlIHN0cmljdCdcbi8qKlxuICogVGhpcyBtb2R1bGUgc2VydmVzIGFzIGFuIEFzeW5jIHdyYXBwZXIgZm9yIExvY2FsU3RvcmFnZVxuICovXG5tb2R1bGUuZXhwb3J0cy5zZXRJdGVtID0gKGtleSwgdmFsdWUpID0+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCB2YWx1ZSlcbiAgICByZXNvbHZlKClcbiAgfSlcbn1cblxubW9kdWxlLmV4cG9ydHMuZ2V0SXRlbSA9IChrZXkpID0+IHtcbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpKVxufVxuXG5tb2R1bGUuZXhwb3J0cy5yZW1vdmVJdGVtID0gKGtleSkgPT4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShrZXkpXG4gICAgcmVzb2x2ZSgpXG4gIH0pXG59XG4iLCJjb25zdCBwcmVhY3QgPSByZXF1aXJlKCdwcmVhY3QnKVxuY29uc3QgZmluZERPTUVsZW1lbnQgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvZmluZERPTUVsZW1lbnQnKVxuXG4vKipcbiAqIERlZmVyIGEgZnJlcXVlbnQgY2FsbCB0byB0aGUgbWljcm90YXNrIHF1ZXVlLlxuICovXG5mdW5jdGlvbiBkZWJvdW5jZSAoZm4pIHtcbiAgbGV0IGNhbGxpbmcgPSBudWxsXG4gIGxldCBsYXRlc3RBcmdzID0gbnVsbFxuICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICBsYXRlc3RBcmdzID0gYXJnc1xuICAgIGlmICghY2FsbGluZykge1xuICAgICAgY2FsbGluZyA9IFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICBjYWxsaW5nID0gbnVsbFxuICAgICAgICAvLyBBdCB0aGlzIHBvaW50IGBhcmdzYCBtYXkgYmUgZGlmZmVyZW50IGZyb20gdGhlIG1vc3RcbiAgICAgICAgLy8gcmVjZW50IHN0YXRlLCBpZiBtdWx0aXBsZSBjYWxscyBoYXBwZW5lZCBzaW5jZSB0aGlzIHRhc2tcbiAgICAgICAgLy8gd2FzIHF1ZXVlZC4gU28gd2UgdXNlIHRoZSBgbGF0ZXN0QXJnc2AsIHdoaWNoIGRlZmluaXRlbHlcbiAgICAgICAgLy8gaXMgdGhlIG1vc3QgcmVjZW50IGNhbGwuXG4gICAgICAgIHJldHVybiBmbiguLi5sYXRlc3RBcmdzKVxuICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuIGNhbGxpbmdcbiAgfVxufVxuXG4vKipcbiAqIEJvaWxlcnBsYXRlIHRoYXQgYWxsIFBsdWdpbnMgc2hhcmUgLSBhbmQgc2hvdWxkIG5vdCBiZSB1c2VkXG4gKiBkaXJlY3RseS4gSXQgYWxzbyBzaG93cyB3aGljaCBtZXRob2RzIGZpbmFsIHBsdWdpbnMgc2hvdWxkIGltcGxlbWVudC9vdmVycmlkZSxcbiAqIHRoaXMgZGVjaWRpbmcgb24gc3RydWN0dXJlLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBtYWluIFVwcHkgY29yZSBvYmplY3RcbiAqIEBwYXJhbSB7b2JqZWN0fSBvYmplY3Qgd2l0aCBwbHVnaW4gb3B0aW9uc1xuICogQHJldHVybiB7YXJyYXkgfCBzdHJpbmd9IGZpbGVzIG9yIHN1Y2Nlc3MvZmFpbCBtZXNzYWdlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUGx1Z2luIHtcbiAgY29uc3RydWN0b3IgKHVwcHksIG9wdHMpIHtcbiAgICB0aGlzLnVwcHkgPSB1cHB5XG4gICAgdGhpcy5vcHRzID0gb3B0cyB8fCB7fVxuXG4gICAgdGhpcy51cGRhdGUgPSB0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpXG4gICAgdGhpcy5tb3VudCA9IHRoaXMubW91bnQuYmluZCh0aGlzKVxuICAgIHRoaXMuaW5zdGFsbCA9IHRoaXMuaW5zdGFsbC5iaW5kKHRoaXMpXG4gICAgdGhpcy51bmluc3RhbGwgPSB0aGlzLnVuaW5zdGFsbC5iaW5kKHRoaXMpXG4gIH1cblxuICBnZXRQbHVnaW5TdGF0ZSAoKSB7XG4gICAgY29uc3QgeyBwbHVnaW5zIH0gPSB0aGlzLnVwcHkuZ2V0U3RhdGUoKVxuICAgIHJldHVybiBwbHVnaW5zW3RoaXMuaWRdIHx8IHt9XG4gIH1cblxuICBzZXRQbHVnaW5TdGF0ZSAodXBkYXRlKSB7XG4gICAgY29uc3QgeyBwbHVnaW5zIH0gPSB0aGlzLnVwcHkuZ2V0U3RhdGUoKVxuXG4gICAgdGhpcy51cHB5LnNldFN0YXRlKHtcbiAgICAgIHBsdWdpbnM6IHtcbiAgICAgICAgLi4ucGx1Z2lucyxcbiAgICAgICAgW3RoaXMuaWRdOiB7XG4gICAgICAgICAgLi4ucGx1Z2luc1t0aGlzLmlkXSxcbiAgICAgICAgICAuLi51cGRhdGVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICB1cGRhdGUgKHN0YXRlKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmVsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3VwZGF0ZVVJKSB7XG4gICAgICB0aGlzLl91cGRhdGVVSShzdGF0ZSlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgKiBDYWxsZWQgd2hlbiBwbHVnaW4gaXMgbW91bnRlZCwgd2hldGhlciBpbiBET00gb3IgaW50byBhbm90aGVyIHBsdWdpbi5cbiAgKiBOZWVkZWQgYmVjYXVzZSBzb21ldGltZXMgcGx1Z2lucyBhcmUgbW91bnRlZCBzZXBhcmF0ZWx5L2FmdGVyIGBpbnN0YWxsYCxcbiAgKiBzbyB0aGlzLmVsIGFuZCB0aGlzLnBhcmVudCBtaWdodCBub3QgYmUgYXZhaWxhYmxlIGluIGBpbnN0YWxsYC5cbiAgKiBUaGlzIGlzIHRoZSBjYXNlIHdpdGggQHVwcHkvcmVhY3QgcGx1Z2lucywgZm9yIGV4YW1wbGUuXG4gICovXG4gIG9uTW91bnQgKCkge1xuXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgc3VwcGxpZWQgYHRhcmdldGAgaXMgYSBET00gZWxlbWVudCBvciBhbiBgb2JqZWN0YC5cbiAgICogSWYgaXTigJlzIGFuIG9iamVjdCDigJQgdGFyZ2V0IGlzIGEgcGx1Z2luLCBhbmQgd2Ugc2VhcmNoIGBwbHVnaW5zYFxuICAgKiBmb3IgYSBwbHVnaW4gd2l0aCBzYW1lIG5hbWUgYW5kIHJldHVybiBpdHMgdGFyZ2V0LlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IHRhcmdldFxuICAgKlxuICAgKi9cbiAgbW91bnQgKHRhcmdldCwgcGx1Z2luKSB7XG4gICAgY29uc3QgY2FsbGVyUGx1Z2luTmFtZSA9IHBsdWdpbi5pZFxuXG4gICAgY29uc3QgdGFyZ2V0RWxlbWVudCA9IGZpbmRET01FbGVtZW50KHRhcmdldClcblxuICAgIGlmICh0YXJnZXRFbGVtZW50KSB7XG4gICAgICB0aGlzLmlzVGFyZ2V0RE9NRWwgPSB0cnVlXG5cbiAgICAgIC8vIEFQSSBmb3IgcGx1Z2lucyB0aGF0IHJlcXVpcmUgYSBzeW5jaHJvbm91cyByZXJlbmRlci5cbiAgICAgIHRoaXMucmVyZW5kZXIgPSAoc3RhdGUpID0+IHtcbiAgICAgICAgLy8gcGx1Z2luIGNvdWxkIGJlIHJlbW92ZWQsIGJ1dCB0aGlzLnJlcmVuZGVyIGlzIGRlYm91bmNlZCBiZWxvdyxcbiAgICAgICAgLy8gc28gaXQgY291bGQgc3RpbGwgYmUgY2FsbGVkIGV2ZW4gYWZ0ZXIgdXBweS5yZW1vdmVQbHVnaW4gb3IgdXBweS5jbG9zZVxuICAgICAgICAvLyBoZW5jZSB0aGUgY2hlY2tcbiAgICAgICAgaWYgKCF0aGlzLnVwcHkuZ2V0UGx1Z2luKHRoaXMuaWQpKSByZXR1cm5cbiAgICAgICAgdGhpcy5lbCA9IHByZWFjdC5yZW5kZXIodGhpcy5yZW5kZXIoc3RhdGUpLCB0YXJnZXRFbGVtZW50LCB0aGlzLmVsKVxuICAgICAgfVxuICAgICAgdGhpcy5fdXBkYXRlVUkgPSBkZWJvdW5jZSh0aGlzLnJlcmVuZGVyKVxuXG4gICAgICB0aGlzLnVwcHkubG9nKGBJbnN0YWxsaW5nICR7Y2FsbGVyUGx1Z2luTmFtZX0gdG8gYSBET00gZWxlbWVudGApXG5cbiAgICAgIC8vIGNsZWFyIGV2ZXJ5dGhpbmcgaW5zaWRlIHRoZSB0YXJnZXQgY29udGFpbmVyXG4gICAgICBpZiAodGhpcy5vcHRzLnJlcGxhY2VUYXJnZXRDb250ZW50KSB7XG4gICAgICAgIHRhcmdldEVsZW1lbnQuaW5uZXJIVE1MID0gJydcbiAgICAgIH1cblxuICAgICAgdGhpcy5lbCA9IHByZWFjdC5yZW5kZXIodGhpcy5yZW5kZXIodGhpcy51cHB5LmdldFN0YXRlKCkpLCB0YXJnZXRFbGVtZW50KVxuXG4gICAgICB0aGlzLm9uTW91bnQoKVxuICAgICAgcmV0dXJuIHRoaXMuZWxcbiAgICB9XG5cbiAgICBsZXQgdGFyZ2V0UGx1Z2luXG4gICAgaWYgKHR5cGVvZiB0YXJnZXQgPT09ICdvYmplY3QnICYmIHRhcmdldCBpbnN0YW5jZW9mIFBsdWdpbikge1xuICAgICAgLy8gVGFyZ2V0aW5nIGEgcGx1Z2luICppbnN0YW5jZSpcbiAgICAgIHRhcmdldFBsdWdpbiA9IHRhcmdldFxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRhcmdldCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy8gVGFyZ2V0aW5nIGEgcGx1Z2luIHR5cGVcbiAgICAgIGNvbnN0IFRhcmdldCA9IHRhcmdldFxuICAgICAgLy8gRmluZCB0aGUgdGFyZ2V0IHBsdWdpbiBpbnN0YW5jZS5cbiAgICAgIHRoaXMudXBweS5pdGVyYXRlUGx1Z2lucygocGx1Z2luKSA9PiB7XG4gICAgICAgIGlmIChwbHVnaW4gaW5zdGFuY2VvZiBUYXJnZXQpIHtcbiAgICAgICAgICB0YXJnZXRQbHVnaW4gPSBwbHVnaW5cbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBpZiAodGFyZ2V0UGx1Z2luKSB7XG4gICAgICB0aGlzLnVwcHkubG9nKGBJbnN0YWxsaW5nICR7Y2FsbGVyUGx1Z2luTmFtZX0gdG8gJHt0YXJnZXRQbHVnaW4uaWR9YClcbiAgICAgIHRoaXMucGFyZW50ID0gdGFyZ2V0UGx1Z2luXG4gICAgICB0aGlzLmVsID0gdGFyZ2V0UGx1Z2luLmFkZFRhcmdldChwbHVnaW4pXG5cbiAgICAgIHRoaXMub25Nb3VudCgpXG4gICAgICByZXR1cm4gdGhpcy5lbFxuICAgIH1cblxuICAgIHRoaXMudXBweS5sb2coYE5vdCBpbnN0YWxsaW5nICR7Y2FsbGVyUGx1Z2luTmFtZX1gKVxuICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB0YXJnZXQgb3B0aW9uIGdpdmVuIHRvICR7Y2FsbGVyUGx1Z2luTmFtZX0uIFBsZWFzZSBtYWtlIHN1cmUgdGhhdCB0aGUgZWxlbWVudCBcbiAgICAgIGV4aXN0cyBvbiB0aGUgcGFnZSwgb3IgdGhhdCB0aGUgcGx1Z2luIHlvdSBhcmUgdGFyZ2V0aW5nIGhhcyBiZWVuIGluc3RhbGxlZC4gQ2hlY2sgdGhhdCB0aGUgPHNjcmlwdD4gdGFnIGluaXRpYWxpemluZyBVcHB5IFxuICAgICAgY29tZXMgYXQgdGhlIGJvdHRvbSBvZiB0aGUgcGFnZSwgYmVmb3JlIHRoZSBjbG9zaW5nIDwvYm9keT4gdGFnIChzZWUgaHR0cHM6Ly9naXRodWIuY29tL3RyYW5zbG9hZGl0L3VwcHkvaXNzdWVzLzEwNDIpLmApXG4gIH1cblxuICByZW5kZXIgKHN0YXRlKSB7XG4gICAgdGhyb3cgKG5ldyBFcnJvcignRXh0ZW5kIHRoZSByZW5kZXIgbWV0aG9kIHRvIGFkZCB5b3VyIHBsdWdpbiB0byBhIERPTSBlbGVtZW50JykpXG4gIH1cblxuICBhZGRUYXJnZXQgKHBsdWdpbikge1xuICAgIHRocm93IChuZXcgRXJyb3IoJ0V4dGVuZCB0aGUgYWRkVGFyZ2V0IG1ldGhvZCB0byBhZGQgeW91ciBwbHVnaW4gdG8gYW5vdGhlciBwbHVnaW5cXCdzIHRhcmdldCcpKVxuICB9XG5cbiAgdW5tb3VudCAoKSB7XG4gICAgaWYgKHRoaXMuaXNUYXJnZXRET01FbCAmJiB0aGlzLmVsICYmIHRoaXMuZWwucGFyZW50Tm9kZSkge1xuICAgICAgdGhpcy5lbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuZWwpXG4gICAgfVxuICB9XG5cbiAgaW5zdGFsbCAoKSB7XG5cbiAgfVxuXG4gIHVuaW5zdGFsbCAoKSB7XG4gICAgdGhpcy51bm1vdW50KClcbiAgfVxufVxuIiwiY29uc3QgVHJhbnNsYXRvciA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9UcmFuc2xhdG9yJylcbmNvbnN0IGVlID0gcmVxdWlyZSgnbmFtZXNwYWNlLWVtaXR0ZXInKVxuY29uc3QgY3VpZCA9IHJlcXVpcmUoJ2N1aWQnKVxuLy8gY29uc3QgdGhyb3R0bGUgPSByZXF1aXJlKCdsb2Rhc2gudGhyb3R0bGUnKVxuY29uc3QgcHJldHR5Qnl0ZXMgPSByZXF1aXJlKCdwcmV0dGllci1ieXRlcycpXG5jb25zdCBtYXRjaCA9IHJlcXVpcmUoJ21pbWUtbWF0Y2gnKVxuY29uc3QgRGVmYXVsdFN0b3JlID0gcmVxdWlyZSgnQHVwcHkvc3RvcmUtZGVmYXVsdCcpXG5jb25zdCBnZXRGaWxlVHlwZSA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9nZXRGaWxlVHlwZScpXG5jb25zdCBnZXRGaWxlTmFtZUFuZEV4dGVuc2lvbiA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9nZXRGaWxlTmFtZUFuZEV4dGVuc2lvbicpXG5jb25zdCBnZW5lcmF0ZUZpbGVJRCA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9nZW5lcmF0ZUZpbGVJRCcpXG5jb25zdCBnZXRUaW1lU3RhbXAgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvZ2V0VGltZVN0YW1wJylcbmNvbnN0IHN1cHBvcnRzVXBsb2FkUHJvZ3Jlc3MgPSByZXF1aXJlKCcuL3N1cHBvcnRzVXBsb2FkUHJvZ3Jlc3MnKVxuY29uc3QgUGx1Z2luID0gcmVxdWlyZSgnLi9QbHVnaW4nKSAvLyBFeHBvcnRlZCBmcm9tIGhlcmUuXG5cbi8qKlxuICogVXBweSBDb3JlIG1vZHVsZS5cbiAqIE1hbmFnZXMgcGx1Z2lucywgc3RhdGUgdXBkYXRlcywgYWN0cyBhcyBhbiBldmVudCBidXMsXG4gKiBhZGRzL3JlbW92ZXMgZmlsZXMgYW5kIG1ldGFkYXRhLlxuICovXG5jbGFzcyBVcHB5IHtcbiAgLyoqXG4gICogSW5zdGFudGlhdGUgVXBweVxuICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRzIOKAlCBVcHB5IG9wdGlvbnNcbiAgKi9cbiAgY29uc3RydWN0b3IgKG9wdHMpIHtcbiAgICBjb25zdCBkZWZhdWx0TG9jYWxlID0ge1xuICAgICAgc3RyaW5nczoge1xuICAgICAgICB5b3VDYW5Pbmx5VXBsb2FkWDoge1xuICAgICAgICAgIDA6ICdZb3UgY2FuIG9ubHkgdXBsb2FkICV7c21hcnRfY291bnR9IGZpbGUnLFxuICAgICAgICAgIDE6ICdZb3UgY2FuIG9ubHkgdXBsb2FkICV7c21hcnRfY291bnR9IGZpbGVzJ1xuICAgICAgICB9LFxuICAgICAgICB5b3VIYXZlVG9BdExlYXN0U2VsZWN0WDoge1xuICAgICAgICAgIDA6ICdZb3UgaGF2ZSB0byBzZWxlY3QgYXQgbGVhc3QgJXtzbWFydF9jb3VudH0gZmlsZScsXG4gICAgICAgICAgMTogJ1lvdSBoYXZlIHRvIHNlbGVjdCBhdCBsZWFzdCAle3NtYXJ0X2NvdW50fSBmaWxlcydcbiAgICAgICAgfSxcbiAgICAgICAgZXhjZWVkc1NpemU6ICdUaGlzIGZpbGUgZXhjZWVkcyBtYXhpbXVtIGFsbG93ZWQgc2l6ZSBvZicsXG4gICAgICAgIHlvdUNhbk9ubHlVcGxvYWRGaWxlVHlwZXM6ICdZb3UgY2FuIG9ubHkgdXBsb2FkOiAle3R5cGVzfScsXG4gICAgICAgIGNvbXBhbmlvbkVycm9yOiAnQ29ubmVjdGlvbiB3aXRoIENvbXBhbmlvbiBmYWlsZWQnLFxuICAgICAgICBjb21wYW5pb25BdXRoRXJyb3I6ICdBdXRob3JpemF0aW9uIHJlcXVpcmVkJyxcbiAgICAgICAgZmFpbGVkVG9VcGxvYWQ6ICdGYWlsZWQgdG8gdXBsb2FkICV7ZmlsZX0nLFxuICAgICAgICBub0ludGVybmV0Q29ubmVjdGlvbjogJ05vIEludGVybmV0IGNvbm5lY3Rpb24nLFxuICAgICAgICBjb25uZWN0ZWRUb0ludGVybmV0OiAnQ29ubmVjdGVkIHRvIHRoZSBJbnRlcm5ldCcsXG4gICAgICAgIC8vIFN0cmluZ3MgZm9yIHJlbW90ZSBwcm92aWRlcnNcbiAgICAgICAgbm9GaWxlc0ZvdW5kOiAnWW91IGhhdmUgbm8gZmlsZXMgb3IgZm9sZGVycyBoZXJlJyxcbiAgICAgICAgc2VsZWN0WEZpbGVzOiB7XG4gICAgICAgICAgMDogJ1NlbGVjdCAle3NtYXJ0X2NvdW50fSBmaWxlJyxcbiAgICAgICAgICAxOiAnU2VsZWN0ICV7c21hcnRfY291bnR9IGZpbGVzJ1xuICAgICAgICB9LFxuICAgICAgICBjYW5jZWw6ICdDYW5jZWwnLFxuICAgICAgICBsb2dPdXQ6ICdMb2cgb3V0JyxcbiAgICAgICAgZmlsdGVyOiAnRmlsdGVyJyxcbiAgICAgICAgcmVzZXRGaWx0ZXI6ICdSZXNldCBmaWx0ZXInXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICAgIGNvbnN0IGRlZmF1bHRPcHRpb25zID0ge1xuICAgICAgaWQ6ICd1cHB5JyxcbiAgICAgIGF1dG9Qcm9jZWVkOiBmYWxzZSxcbiAgICAgIGFsbG93TXVsdGlwbGVVcGxvYWRzOiB0cnVlLFxuICAgICAgZGVidWc6IGZhbHNlLFxuICAgICAgcmVzdHJpY3Rpb25zOiB7XG4gICAgICAgIG1heEZpbGVTaXplOiBudWxsLFxuICAgICAgICBtYXhOdW1iZXJPZkZpbGVzOiBudWxsLFxuICAgICAgICBtaW5OdW1iZXJPZkZpbGVzOiBudWxsLFxuICAgICAgICBhbGxvd2VkRmlsZVR5cGVzOiBudWxsXG4gICAgICB9LFxuICAgICAgbWV0YToge30sXG4gICAgICBvbkJlZm9yZUZpbGVBZGRlZDogKGN1cnJlbnRGaWxlLCBmaWxlcykgPT4gY3VycmVudEZpbGUsXG4gICAgICBvbkJlZm9yZVVwbG9hZDogKGZpbGVzKSA9PiBmaWxlcyxcbiAgICAgIGxvY2FsZTogZGVmYXVsdExvY2FsZSxcbiAgICAgIHN0b3JlOiBEZWZhdWx0U3RvcmUoKVxuICAgIH1cblxuICAgIC8vIE1lcmdlIGRlZmF1bHQgb3B0aW9ucyB3aXRoIHRoZSBvbmVzIHNldCBieSB1c2VyXG4gICAgdGhpcy5vcHRzID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdE9wdGlvbnMsIG9wdHMpXG4gICAgdGhpcy5vcHRzLnJlc3RyaWN0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRPcHRpb25zLnJlc3RyaWN0aW9ucywgdGhpcy5vcHRzLnJlc3RyaWN0aW9ucylcblxuICAgIC8vIGkxOG5cbiAgICB0aGlzLnRyYW5zbGF0b3IgPSBuZXcgVHJhbnNsYXRvcihbIGRlZmF1bHRMb2NhbGUsIHRoaXMub3B0cy5sb2NhbGUgXSlcbiAgICB0aGlzLmxvY2FsZSA9IHRoaXMudHJhbnNsYXRvci5sb2NhbGVcbiAgICB0aGlzLmkxOG4gPSB0aGlzLnRyYW5zbGF0b3IudHJhbnNsYXRlLmJpbmQodGhpcy50cmFuc2xhdG9yKVxuXG4gICAgLy8gQ29udGFpbmVyIGZvciBkaWZmZXJlbnQgdHlwZXMgb2YgcGx1Z2luc1xuICAgIHRoaXMucGx1Z2lucyA9IHt9XG5cbiAgICB0aGlzLmdldFN0YXRlID0gdGhpcy5nZXRTdGF0ZS5iaW5kKHRoaXMpXG4gICAgdGhpcy5nZXRQbHVnaW4gPSB0aGlzLmdldFBsdWdpbi5iaW5kKHRoaXMpXG4gICAgdGhpcy5zZXRGaWxlTWV0YSA9IHRoaXMuc2V0RmlsZU1ldGEuYmluZCh0aGlzKVxuICAgIHRoaXMuc2V0RmlsZVN0YXRlID0gdGhpcy5zZXRGaWxlU3RhdGUuYmluZCh0aGlzKVxuICAgIHRoaXMubG9nID0gdGhpcy5sb2cuYmluZCh0aGlzKVxuICAgIHRoaXMuaW5mbyA9IHRoaXMuaW5mby5iaW5kKHRoaXMpXG4gICAgdGhpcy5oaWRlSW5mbyA9IHRoaXMuaGlkZUluZm8uYmluZCh0aGlzKVxuICAgIHRoaXMuYWRkRmlsZSA9IHRoaXMuYWRkRmlsZS5iaW5kKHRoaXMpXG4gICAgdGhpcy5yZW1vdmVGaWxlID0gdGhpcy5yZW1vdmVGaWxlLmJpbmQodGhpcylcbiAgICB0aGlzLnBhdXNlUmVzdW1lID0gdGhpcy5wYXVzZVJlc3VtZS5iaW5kKHRoaXMpXG4gICAgdGhpcy5fY2FsY3VsYXRlUHJvZ3Jlc3MgPSB0aGlzLl9jYWxjdWxhdGVQcm9ncmVzcy5iaW5kKHRoaXMpXG4gICAgdGhpcy51cGRhdGVPbmxpbmVTdGF0dXMgPSB0aGlzLnVwZGF0ZU9ubGluZVN0YXR1cy5iaW5kKHRoaXMpXG4gICAgdGhpcy5yZXNldFByb2dyZXNzID0gdGhpcy5yZXNldFByb2dyZXNzLmJpbmQodGhpcylcblxuICAgIHRoaXMucGF1c2VBbGwgPSB0aGlzLnBhdXNlQWxsLmJpbmQodGhpcylcbiAgICB0aGlzLnJlc3VtZUFsbCA9IHRoaXMucmVzdW1lQWxsLmJpbmQodGhpcylcbiAgICB0aGlzLnJldHJ5QWxsID0gdGhpcy5yZXRyeUFsbC5iaW5kKHRoaXMpXG4gICAgdGhpcy5jYW5jZWxBbGwgPSB0aGlzLmNhbmNlbEFsbC5iaW5kKHRoaXMpXG4gICAgdGhpcy5yZXRyeVVwbG9hZCA9IHRoaXMucmV0cnlVcGxvYWQuYmluZCh0aGlzKVxuICAgIHRoaXMudXBsb2FkID0gdGhpcy51cGxvYWQuYmluZCh0aGlzKVxuXG4gICAgdGhpcy5lbWl0dGVyID0gZWUoKVxuICAgIHRoaXMub24gPSB0aGlzLm9uLmJpbmQodGhpcylcbiAgICB0aGlzLm9mZiA9IHRoaXMub2ZmLmJpbmQodGhpcylcbiAgICB0aGlzLm9uY2UgPSB0aGlzLmVtaXR0ZXIub25jZS5iaW5kKHRoaXMuZW1pdHRlcilcbiAgICB0aGlzLmVtaXQgPSB0aGlzLmVtaXR0ZXIuZW1pdC5iaW5kKHRoaXMuZW1pdHRlcilcblxuICAgIHRoaXMucHJlUHJvY2Vzc29ycyA9IFtdXG4gICAgdGhpcy51cGxvYWRlcnMgPSBbXVxuICAgIHRoaXMucG9zdFByb2Nlc3NvcnMgPSBbXVxuXG4gICAgdGhpcy5zdG9yZSA9IHRoaXMub3B0cy5zdG9yZVxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgcGx1Z2luczoge30sXG4gICAgICBmaWxlczoge30sXG4gICAgICBjdXJyZW50VXBsb2Fkczoge30sXG4gICAgICBhbGxvd05ld1VwbG9hZDogdHJ1ZSxcbiAgICAgIGNhcGFiaWxpdGllczoge1xuICAgICAgICB1cGxvYWRQcm9ncmVzczogc3VwcG9ydHNVcGxvYWRQcm9ncmVzcygpLFxuICAgICAgICByZXN1bWFibGVVcGxvYWRzOiBmYWxzZVxuICAgICAgfSxcbiAgICAgIHRvdGFsUHJvZ3Jlc3M6IDAsXG4gICAgICBtZXRhOiB7IC4uLnRoaXMub3B0cy5tZXRhIH0sXG4gICAgICBpbmZvOiB7XG4gICAgICAgIGlzSGlkZGVuOiB0cnVlLFxuICAgICAgICB0eXBlOiAnaW5mbycsXG4gICAgICAgIG1lc3NhZ2U6ICcnXG4gICAgICB9XG4gICAgfSlcblxuICAgIHRoaXMuX3N0b3JlVW5zdWJzY3JpYmUgPSB0aGlzLnN0b3JlLnN1YnNjcmliZSgocHJldlN0YXRlLCBuZXh0U3RhdGUsIHBhdGNoKSA9PiB7XG4gICAgICB0aGlzLmVtaXQoJ3N0YXRlLXVwZGF0ZScsIHByZXZTdGF0ZSwgbmV4dFN0YXRlLCBwYXRjaClcbiAgICAgIHRoaXMudXBkYXRlQWxsKG5leHRTdGF0ZSlcbiAgICB9KVxuXG4gICAgLy8gZm9yIGRlYnVnZ2luZyBhbmQgdGVzdGluZ1xuICAgIC8vIHRoaXMudXBkYXRlTnVtID0gMFxuICAgIGlmICh0aGlzLm9wdHMuZGVidWcgJiYgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHdpbmRvd1sndXBweUxvZyddID0gJydcbiAgICAgIHdpbmRvd1t0aGlzLm9wdHMuaWRdID0gdGhpc1xuICAgIH1cblxuICAgIHRoaXMuX2FkZExpc3RlbmVycygpXG4gIH1cblxuICBvbiAoZXZlbnQsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5lbWl0dGVyLm9uKGV2ZW50LCBjYWxsYmFjaylcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgb2ZmIChldmVudCwgY2FsbGJhY2spIHtcbiAgICB0aGlzLmVtaXR0ZXIub2ZmKGV2ZW50LCBjYWxsYmFjaylcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIEl0ZXJhdGUgb24gYWxsIHBsdWdpbnMgYW5kIHJ1biBgdXBkYXRlYCBvbiB0aGVtLlxuICAgKiBDYWxsZWQgZWFjaCB0aW1lIHN0YXRlIGNoYW5nZXMuXG4gICAqXG4gICAqL1xuICB1cGRhdGVBbGwgKHN0YXRlKSB7XG4gICAgdGhpcy5pdGVyYXRlUGx1Z2lucyhwbHVnaW4gPT4ge1xuICAgICAgcGx1Z2luLnVwZGF0ZShzdGF0ZSlcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgc3RhdGUgd2l0aCBhIHBhdGNoXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBwYXRjaCB7Zm9vOiAnYmFyJ31cbiAgICovXG4gIHNldFN0YXRlIChwYXRjaCkge1xuICAgIHRoaXMuc3RvcmUuc2V0U3RhdGUocGF0Y2gpXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBjdXJyZW50IHN0YXRlLlxuICAgKiBAcmV0dXJuIHtvYmplY3R9XG4gICAqL1xuICBnZXRTdGF0ZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmUuZ2V0U3RhdGUoKVxuICB9XG5cbiAgLyoqXG4gICogQmFjayBjb21wYXQgZm9yIHdoZW4gdXBweS5zdGF0ZSBpcyB1c2VkIGluc3RlYWQgb2YgdXBweS5nZXRTdGF0ZSgpLlxuICAqL1xuICBnZXQgc3RhdGUgKCkge1xuICAgIHJldHVybiB0aGlzLmdldFN0YXRlKClcbiAgfVxuXG4gIC8qKlxuICAqIFNob3J0aGFuZCB0byBzZXQgc3RhdGUgZm9yIGEgc3BlY2lmaWMgZmlsZS5cbiAgKi9cbiAgc2V0RmlsZVN0YXRlIChmaWxlSUQsIHN0YXRlKSB7XG4gICAgaWYgKCF0aGlzLmdldFN0YXRlKCkuZmlsZXNbZmlsZUlEXSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW7igJl0IHNldCBzdGF0ZSBmb3IgJHtmaWxlSUR9ICh0aGUgZmlsZSBjb3VsZCBoYXZlIGJlZW4gcmVtb3ZlZClgKVxuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmlsZXM6IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U3RhdGUoKS5maWxlcywge1xuICAgICAgICBbZmlsZUlEXTogT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTdGF0ZSgpLmZpbGVzW2ZpbGVJRF0sIHN0YXRlKVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgcmVzZXRQcm9ncmVzcyAoKSB7XG4gICAgY29uc3QgZGVmYXVsdFByb2dyZXNzID0ge1xuICAgICAgcGVyY2VudGFnZTogMCxcbiAgICAgIGJ5dGVzVXBsb2FkZWQ6IDAsXG4gICAgICB1cGxvYWRDb21wbGV0ZTogZmFsc2UsXG4gICAgICB1cGxvYWRTdGFydGVkOiBmYWxzZVxuICAgIH1cbiAgICBjb25zdCBmaWxlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U3RhdGUoKS5maWxlcylcbiAgICBjb25zdCB1cGRhdGVkRmlsZXMgPSB7fVxuICAgIE9iamVjdC5rZXlzKGZpbGVzKS5mb3JFYWNoKGZpbGVJRCA9PiB7XG4gICAgICBjb25zdCB1cGRhdGVkRmlsZSA9IE9iamVjdC5hc3NpZ24oe30sIGZpbGVzW2ZpbGVJRF0pXG4gICAgICB1cGRhdGVkRmlsZS5wcm9ncmVzcyA9IE9iamVjdC5hc3NpZ24oe30sIHVwZGF0ZWRGaWxlLnByb2dyZXNzLCBkZWZhdWx0UHJvZ3Jlc3MpXG4gICAgICB1cGRhdGVkRmlsZXNbZmlsZUlEXSA9IHVwZGF0ZWRGaWxlXG4gICAgfSlcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmlsZXM6IHVwZGF0ZWRGaWxlcyxcbiAgICAgIHRvdGFsUHJvZ3Jlc3M6IDBcbiAgICB9KVxuXG4gICAgLy8gVE9ETyBEb2N1bWVudCBvbiB0aGUgd2Vic2l0ZVxuICAgIHRoaXMuZW1pdCgncmVzZXQtcHJvZ3Jlc3MnKVxuICB9XG5cbiAgYWRkUHJlUHJvY2Vzc29yIChmbikge1xuICAgIHRoaXMucHJlUHJvY2Vzc29ycy5wdXNoKGZuKVxuICB9XG5cbiAgcmVtb3ZlUHJlUHJvY2Vzc29yIChmbikge1xuICAgIGNvbnN0IGkgPSB0aGlzLnByZVByb2Nlc3NvcnMuaW5kZXhPZihmbilcbiAgICBpZiAoaSAhPT0gLTEpIHtcbiAgICAgIHRoaXMucHJlUHJvY2Vzc29ycy5zcGxpY2UoaSwgMSlcbiAgICB9XG4gIH1cblxuICBhZGRQb3N0UHJvY2Vzc29yIChmbikge1xuICAgIHRoaXMucG9zdFByb2Nlc3NvcnMucHVzaChmbilcbiAgfVxuXG4gIHJlbW92ZVBvc3RQcm9jZXNzb3IgKGZuKSB7XG4gICAgY29uc3QgaSA9IHRoaXMucG9zdFByb2Nlc3NvcnMuaW5kZXhPZihmbilcbiAgICBpZiAoaSAhPT0gLTEpIHtcbiAgICAgIHRoaXMucG9zdFByb2Nlc3NvcnMuc3BsaWNlKGksIDEpXG4gICAgfVxuICB9XG5cbiAgYWRkVXBsb2FkZXIgKGZuKSB7XG4gICAgdGhpcy51cGxvYWRlcnMucHVzaChmbilcbiAgfVxuXG4gIHJlbW92ZVVwbG9hZGVyIChmbikge1xuICAgIGNvbnN0IGkgPSB0aGlzLnVwbG9hZGVycy5pbmRleE9mKGZuKVxuICAgIGlmIChpICE9PSAtMSkge1xuICAgICAgdGhpcy51cGxvYWRlcnMuc3BsaWNlKGksIDEpXG4gICAgfVxuICB9XG5cbiAgc2V0TWV0YSAoZGF0YSkge1xuICAgIGNvbnN0IHVwZGF0ZWRNZXRhID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTdGF0ZSgpLm1ldGEsIGRhdGEpXG4gICAgY29uc3QgdXBkYXRlZEZpbGVzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTdGF0ZSgpLmZpbGVzKVxuXG4gICAgT2JqZWN0LmtleXModXBkYXRlZEZpbGVzKS5mb3JFYWNoKChmaWxlSUQpID0+IHtcbiAgICAgIHVwZGF0ZWRGaWxlc1tmaWxlSURdID0gT2JqZWN0LmFzc2lnbih7fSwgdXBkYXRlZEZpbGVzW2ZpbGVJRF0sIHtcbiAgICAgICAgbWV0YTogT2JqZWN0LmFzc2lnbih7fSwgdXBkYXRlZEZpbGVzW2ZpbGVJRF0ubWV0YSwgZGF0YSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIHRoaXMubG9nKCdBZGRpbmcgbWV0YWRhdGE6JylcbiAgICB0aGlzLmxvZyhkYXRhKVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBtZXRhOiB1cGRhdGVkTWV0YSxcbiAgICAgIGZpbGVzOiB1cGRhdGVkRmlsZXNcbiAgICB9KVxuICB9XG5cbiAgc2V0RmlsZU1ldGEgKGZpbGVJRCwgZGF0YSkge1xuICAgIGNvbnN0IHVwZGF0ZWRGaWxlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U3RhdGUoKS5maWxlcylcbiAgICBpZiAoIXVwZGF0ZWRGaWxlc1tmaWxlSURdKSB7XG4gICAgICB0aGlzLmxvZygnV2FzIHRyeWluZyB0byBzZXQgbWV0YWRhdGEgZm9yIGEgZmlsZSB0aGF04oCZcyBub3Qgd2l0aCB1cyBhbnltb3JlOiAnLCBmaWxlSUQpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3QgbmV3TWV0YSA9IE9iamVjdC5hc3NpZ24oe30sIHVwZGF0ZWRGaWxlc1tmaWxlSURdLm1ldGEsIGRhdGEpXG4gICAgdXBkYXRlZEZpbGVzW2ZpbGVJRF0gPSBPYmplY3QuYXNzaWduKHt9LCB1cGRhdGVkRmlsZXNbZmlsZUlEXSwge1xuICAgICAgbWV0YTogbmV3TWV0YVxuICAgIH0pXG4gICAgdGhpcy5zZXRTdGF0ZSh7ZmlsZXM6IHVwZGF0ZWRGaWxlc30pXG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgZmlsZSBvYmplY3QuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlSUQgVGhlIElEIG9mIHRoZSBmaWxlIG9iamVjdCB0byByZXR1cm4uXG4gICAqL1xuICBnZXRGaWxlIChmaWxlSUQpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRTdGF0ZSgpLmZpbGVzW2ZpbGVJRF1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIGZpbGVzIGluIGFuIGFycmF5LlxuICAgKi9cbiAgZ2V0RmlsZXMgKCkge1xuICAgIGNvbnN0IHsgZmlsZXMgfSA9IHRoaXMuZ2V0U3RhdGUoKVxuICAgIHJldHVybiBPYmplY3Qua2V5cyhmaWxlcykubWFwKChmaWxlSUQpID0+IGZpbGVzW2ZpbGVJRF0pXG4gIH1cblxuICAvKipcbiAgKiBDaGVjayBpZiBtaW5OdW1iZXJPZkZpbGVzIHJlc3RyaWN0aW9uIGlzIHJlYWNoZWQgYmVmb3JlIHVwbG9hZGluZy5cbiAgKlxuICAqIEBwcml2YXRlXG4gICovXG4gIF9jaGVja01pbk51bWJlck9mRmlsZXMgKGZpbGVzKSB7XG4gICAgY29uc3Qge21pbk51bWJlck9mRmlsZXN9ID0gdGhpcy5vcHRzLnJlc3RyaWN0aW9uc1xuICAgIGlmIChPYmplY3Qua2V5cyhmaWxlcykubGVuZ3RoIDwgbWluTnVtYmVyT2ZGaWxlcykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGAke3RoaXMuaTE4bigneW91SGF2ZVRvQXRMZWFzdFNlbGVjdFgnLCB7IHNtYXJ0X2NvdW50OiBtaW5OdW1iZXJPZkZpbGVzIH0pfWApXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICogQ2hlY2sgaWYgZmlsZSBwYXNzZXMgYSBzZXQgb2YgcmVzdHJpY3Rpb25zIHNldCBpbiBvcHRpb25zOiBtYXhGaWxlU2l6ZSxcbiAgKiBtYXhOdW1iZXJPZkZpbGVzIGFuZCBhbGxvd2VkRmlsZVR5cGVzLlxuICAqXG4gICogQHBhcmFtIHtvYmplY3R9IGZpbGUgb2JqZWN0IHRvIGNoZWNrXG4gICogQHByaXZhdGVcbiAgKi9cbiAgX2NoZWNrUmVzdHJpY3Rpb25zIChmaWxlKSB7XG4gICAgY29uc3Qge21heEZpbGVTaXplLCBtYXhOdW1iZXJPZkZpbGVzLCBhbGxvd2VkRmlsZVR5cGVzfSA9IHRoaXMub3B0cy5yZXN0cmljdGlvbnNcblxuICAgIGlmIChtYXhOdW1iZXJPZkZpbGVzKSB7XG4gICAgICBpZiAoT2JqZWN0LmtleXModGhpcy5nZXRTdGF0ZSgpLmZpbGVzKS5sZW5ndGggKyAxID4gbWF4TnVtYmVyT2ZGaWxlcykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7dGhpcy5pMThuKCd5b3VDYW5Pbmx5VXBsb2FkWCcsIHsgc21hcnRfY291bnQ6IG1heE51bWJlck9mRmlsZXMgfSl9YClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoYWxsb3dlZEZpbGVUeXBlcykge1xuICAgICAgY29uc3QgaXNDb3JyZWN0RmlsZVR5cGUgPSBhbGxvd2VkRmlsZVR5cGVzLnNvbWUoKHR5cGUpID0+IHtcbiAgICAgICAgLy8gaWYgKCFmaWxlLnR5cGUpIHJldHVybiBmYWxzZVxuXG4gICAgICAgIC8vIGlzIHRoaXMgaXMgYSBtaW1lLXR5cGVcbiAgICAgICAgaWYgKHR5cGUuaW5kZXhPZignLycpID4gLTEpIHtcbiAgICAgICAgICBpZiAoIWZpbGUudHlwZSkgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgcmV0dXJuIG1hdGNoKGZpbGUudHlwZSwgdHlwZSlcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG90aGVyd2lzZSB0aGlzIGlzIGxpa2VseSBhbiBleHRlbnNpb25cbiAgICAgICAgaWYgKHR5cGVbMF0gPT09ICcuJykge1xuICAgICAgICAgIHJldHVybiBmaWxlLmV4dGVuc2lvbi50b0xvd2VyQ2FzZSgpID09PSB0eXBlLnN1YnN0cigxKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9KVxuXG4gICAgICBpZiAoIWlzQ29ycmVjdEZpbGVUeXBlKSB7XG4gICAgICAgIGNvbnN0IGFsbG93ZWRGaWxlVHlwZXNTdHJpbmcgPSBhbGxvd2VkRmlsZVR5cGVzLmpvaW4oJywgJylcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHRoaXMuaTE4bigneW91Q2FuT25seVVwbG9hZEZpbGVUeXBlcycsIHsgdHlwZXM6IGFsbG93ZWRGaWxlVHlwZXNTdHJpbmcgfSkpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG1heEZpbGVTaXplKSB7XG4gICAgICBpZiAoZmlsZS5kYXRhLnNpemUgPiBtYXhGaWxlU2l6ZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7dGhpcy5pMThuKCdleGNlZWRzU2l6ZScpfSAke3ByZXR0eUJ5dGVzKG1heEZpbGVTaXplKX1gKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAqIEFkZCBhIG5ldyBmaWxlIHRvIGBzdGF0ZS5maWxlc2AuIFRoaXMgd2lsbCBydW4gYG9uQmVmb3JlRmlsZUFkZGVkYCxcbiAgKiB0cnkgdG8gZ3Vlc3MgZmlsZSB0eXBlIGluIGEgY2xldmVyIHdheSwgY2hlY2sgZmlsZSBhZ2FpbnN0IHJlc3RyaWN0aW9ucyxcbiAgKiBhbmQgc3RhcnQgYW4gdXBsb2FkIGlmIGBhdXRvUHJvY2VlZCA9PT0gdHJ1ZWAuXG4gICpcbiAgKiBAcGFyYW0ge29iamVjdH0gZmlsZSBvYmplY3QgdG8gYWRkXG4gICovXG4gIGFkZEZpbGUgKGZpbGUpIHtcbiAgICBjb25zdCB7IGZpbGVzLCBhbGxvd05ld1VwbG9hZCB9ID0gdGhpcy5nZXRTdGF0ZSgpXG5cbiAgICBjb25zdCBvbkVycm9yID0gKG1zZykgPT4ge1xuICAgICAgY29uc3QgZXJyID0gdHlwZW9mIG1zZyA9PT0gJ29iamVjdCcgPyBtc2cgOiBuZXcgRXJyb3IobXNnKVxuICAgICAgdGhpcy5sb2coZXJyLm1lc3NhZ2UpXG4gICAgICB0aGlzLmluZm8oZXJyLm1lc3NhZ2UsICdlcnJvcicsIDUwMDApXG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG5cbiAgICBpZiAoYWxsb3dOZXdVcGxvYWQgPT09IGZhbHNlKSB7XG4gICAgICBvbkVycm9yKG5ldyBFcnJvcignQ2Fubm90IGFkZCBuZXcgZmlsZXM6IGFscmVhZHkgdXBsb2FkaW5nLicpKVxuICAgIH1cblxuICAgIGNvbnN0IG9uQmVmb3JlRmlsZUFkZGVkUmVzdWx0ID0gdGhpcy5vcHRzLm9uQmVmb3JlRmlsZUFkZGVkKGZpbGUsIGZpbGVzKVxuXG4gICAgaWYgKG9uQmVmb3JlRmlsZUFkZGVkUmVzdWx0ID09PSBmYWxzZSkge1xuICAgICAgdGhpcy5sb2coJ05vdCBhZGRpbmcgZmlsZSBiZWNhdXNlIG9uQmVmb3JlRmlsZUFkZGVkIHJldHVybmVkIGZhbHNlJylcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmICh0eXBlb2Ygb25CZWZvcmVGaWxlQWRkZWRSZXN1bHQgPT09ICdvYmplY3QnICYmIG9uQmVmb3JlRmlsZUFkZGVkUmVzdWx0KSB7XG4gICAgICAvLyB3YXJuaW5nIGFmdGVyIHRoZSBjaGFuZ2UgaW4gMC4yNFxuICAgICAgaWYgKG9uQmVmb3JlRmlsZUFkZGVkUmVzdWx0LnRoZW4pIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb25CZWZvcmVGaWxlQWRkZWQoKSByZXR1cm5lZCBhIFByb21pc2UsIGJ1dCB0aGlzIGlzIG5vIGxvbmdlciBzdXBwb3J0ZWQuIEl0IG11c3QgYmUgc3luY2hyb25vdXMuJylcbiAgICAgIH1cbiAgICAgIGZpbGUgPSBvbkJlZm9yZUZpbGVBZGRlZFJlc3VsdFxuICAgIH1cblxuICAgIGNvbnN0IGZpbGVUeXBlID0gZ2V0RmlsZVR5cGUoZmlsZSlcbiAgICBsZXQgZmlsZU5hbWVcbiAgICBpZiAoZmlsZS5uYW1lKSB7XG4gICAgICBmaWxlTmFtZSA9IGZpbGUubmFtZVxuICAgIH0gZWxzZSBpZiAoZmlsZVR5cGUuc3BsaXQoJy8nKVswXSA9PT0gJ2ltYWdlJykge1xuICAgICAgZmlsZU5hbWUgPSBmaWxlVHlwZS5zcGxpdCgnLycpWzBdICsgJy4nICsgZmlsZVR5cGUuc3BsaXQoJy8nKVsxXVxuICAgIH0gZWxzZSB7XG4gICAgICBmaWxlTmFtZSA9ICdub25hbWUnXG4gICAgfVxuICAgIGNvbnN0IGZpbGVFeHRlbnNpb24gPSBnZXRGaWxlTmFtZUFuZEV4dGVuc2lvbihmaWxlTmFtZSkuZXh0ZW5zaW9uXG4gICAgY29uc3QgaXNSZW1vdGUgPSBmaWxlLmlzUmVtb3RlIHx8IGZhbHNlXG5cbiAgICBjb25zdCBmaWxlSUQgPSBnZW5lcmF0ZUZpbGVJRChmaWxlKVxuXG4gICAgY29uc3QgbWV0YSA9IGZpbGUubWV0YSB8fCB7fVxuICAgIG1ldGEubmFtZSA9IGZpbGVOYW1lXG4gICAgbWV0YS50eXBlID0gZmlsZVR5cGVcblxuICAgIGNvbnN0IG5ld0ZpbGUgPSB7XG4gICAgICBzb3VyY2U6IGZpbGUuc291cmNlIHx8ICcnLFxuICAgICAgaWQ6IGZpbGVJRCxcbiAgICAgIG5hbWU6IGZpbGVOYW1lLFxuICAgICAgZXh0ZW5zaW9uOiBmaWxlRXh0ZW5zaW9uIHx8ICcnLFxuICAgICAgbWV0YTogT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTdGF0ZSgpLm1ldGEsIG1ldGEpLFxuICAgICAgdHlwZTogZmlsZVR5cGUsXG4gICAgICBkYXRhOiBmaWxlLmRhdGEsXG4gICAgICBwcm9ncmVzczoge1xuICAgICAgICBwZXJjZW50YWdlOiAwLFxuICAgICAgICBieXRlc1VwbG9hZGVkOiAwLFxuICAgICAgICBieXRlc1RvdGFsOiBmaWxlLmRhdGEuc2l6ZSB8fCAwLFxuICAgICAgICB1cGxvYWRDb21wbGV0ZTogZmFsc2UsXG4gICAgICAgIHVwbG9hZFN0YXJ0ZWQ6IGZhbHNlXG4gICAgICB9LFxuICAgICAgc2l6ZTogZmlsZS5kYXRhLnNpemUgfHwgMCxcbiAgICAgIGlzUmVtb3RlOiBpc1JlbW90ZSxcbiAgICAgIHJlbW90ZTogZmlsZS5yZW1vdGUgfHwgJycsXG4gICAgICBwcmV2aWV3OiBmaWxlLnByZXZpZXdcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgdGhpcy5fY2hlY2tSZXN0cmljdGlvbnMobmV3RmlsZSlcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIG9uRXJyb3IoZXJyKVxuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmlsZXM6IE9iamVjdC5hc3NpZ24oe30sIGZpbGVzLCB7XG4gICAgICAgIFtmaWxlSURdOiBuZXdGaWxlXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICB0aGlzLmVtaXQoJ2ZpbGUtYWRkZWQnLCBuZXdGaWxlKVxuICAgIHRoaXMubG9nKGBBZGRlZCBmaWxlOiAke2ZpbGVOYW1lfSwgJHtmaWxlSUR9LCBtaW1lIHR5cGU6ICR7ZmlsZVR5cGV9YClcblxuICAgIGlmICh0aGlzLm9wdHMuYXV0b1Byb2NlZWQgJiYgIXRoaXMuc2NoZWR1bGVkQXV0b1Byb2NlZWQpIHtcbiAgICAgIHRoaXMuc2NoZWR1bGVkQXV0b1Byb2NlZWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5zY2hlZHVsZWRBdXRvUHJvY2VlZCA9IG51bGxcbiAgICAgICAgdGhpcy51cGxvYWQoKS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihlcnIuc3RhY2sgfHwgZXJyLm1lc3NhZ2UgfHwgZXJyKVxuICAgICAgICB9KVxuICAgICAgfSwgNClcbiAgICB9XG4gIH1cblxuICByZW1vdmVGaWxlIChmaWxlSUQpIHtcbiAgICBjb25zdCB7IGZpbGVzLCBjdXJyZW50VXBsb2FkcyB9ID0gdGhpcy5nZXRTdGF0ZSgpXG4gICAgY29uc3QgdXBkYXRlZEZpbGVzID0gT2JqZWN0LmFzc2lnbih7fSwgZmlsZXMpXG4gICAgY29uc3QgcmVtb3ZlZEZpbGUgPSB1cGRhdGVkRmlsZXNbZmlsZUlEXVxuICAgIGRlbGV0ZSB1cGRhdGVkRmlsZXNbZmlsZUlEXVxuXG4gICAgLy8gUmVtb3ZlIHRoaXMgZmlsZSBmcm9tIGl0cyBgY3VycmVudFVwbG9hZGAuXG4gICAgY29uc3QgdXBkYXRlZFVwbG9hZHMgPSBPYmplY3QuYXNzaWduKHt9LCBjdXJyZW50VXBsb2FkcylcbiAgICBjb25zdCByZW1vdmVVcGxvYWRzID0gW11cbiAgICBPYmplY3Qua2V5cyh1cGRhdGVkVXBsb2FkcykuZm9yRWFjaCgodXBsb2FkSUQpID0+IHtcbiAgICAgIGNvbnN0IG5ld0ZpbGVJRHMgPSBjdXJyZW50VXBsb2Fkc1t1cGxvYWRJRF0uZmlsZUlEcy5maWx0ZXIoKHVwbG9hZEZpbGVJRCkgPT4gdXBsb2FkRmlsZUlEICE9PSBmaWxlSUQpXG4gICAgICAvLyBSZW1vdmUgdGhlIHVwbG9hZCBpZiBubyBmaWxlcyBhcmUgYXNzb2NpYXRlZCB3aXRoIGl0IGFueW1vcmUuXG4gICAgICBpZiAobmV3RmlsZUlEcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmVtb3ZlVXBsb2Fkcy5wdXNoKHVwbG9hZElEKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgdXBkYXRlZFVwbG9hZHNbdXBsb2FkSURdID0gT2JqZWN0LmFzc2lnbih7fSwgY3VycmVudFVwbG9hZHNbdXBsb2FkSURdLCB7XG4gICAgICAgIGZpbGVJRHM6IG5ld0ZpbGVJRHNcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgY3VycmVudFVwbG9hZHM6IHVwZGF0ZWRVcGxvYWRzLFxuICAgICAgZmlsZXM6IHVwZGF0ZWRGaWxlc1xuICAgIH0pXG5cbiAgICByZW1vdmVVcGxvYWRzLmZvckVhY2goKHVwbG9hZElEKSA9PiB7XG4gICAgICB0aGlzLl9yZW1vdmVVcGxvYWQodXBsb2FkSUQpXG4gICAgfSlcblxuICAgIHRoaXMuX2NhbGN1bGF0ZVRvdGFsUHJvZ3Jlc3MoKVxuICAgIHRoaXMuZW1pdCgnZmlsZS1yZW1vdmVkJywgcmVtb3ZlZEZpbGUpXG4gICAgdGhpcy5sb2coYEZpbGUgcmVtb3ZlZDogJHtyZW1vdmVkRmlsZS5pZH1gKVxuICB9XG5cbiAgcGF1c2VSZXN1bWUgKGZpbGVJRCkge1xuICAgIGlmICghdGhpcy5nZXRTdGF0ZSgpLmNhcGFiaWxpdGllcy5yZXN1bWFibGVVcGxvYWRzIHx8XG4gICAgICAgICB0aGlzLmdldEZpbGUoZmlsZUlEKS51cGxvYWRDb21wbGV0ZSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3Qgd2FzUGF1c2VkID0gdGhpcy5nZXRGaWxlKGZpbGVJRCkuaXNQYXVzZWQgfHwgZmFsc2VcbiAgICBjb25zdCBpc1BhdXNlZCA9ICF3YXNQYXVzZWRcblxuICAgIHRoaXMuc2V0RmlsZVN0YXRlKGZpbGVJRCwge1xuICAgICAgaXNQYXVzZWQ6IGlzUGF1c2VkXG4gICAgfSlcblxuICAgIHRoaXMuZW1pdCgndXBsb2FkLXBhdXNlJywgZmlsZUlELCBpc1BhdXNlZClcblxuICAgIHJldHVybiBpc1BhdXNlZFxuICB9XG5cbiAgcGF1c2VBbGwgKCkge1xuICAgIGNvbnN0IHVwZGF0ZWRGaWxlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U3RhdGUoKS5maWxlcylcbiAgICBjb25zdCBpblByb2dyZXNzVXBkYXRlZEZpbGVzID0gT2JqZWN0LmtleXModXBkYXRlZEZpbGVzKS5maWx0ZXIoKGZpbGUpID0+IHtcbiAgICAgIHJldHVybiAhdXBkYXRlZEZpbGVzW2ZpbGVdLnByb2dyZXNzLnVwbG9hZENvbXBsZXRlICYmXG4gICAgICAgICAgICAgdXBkYXRlZEZpbGVzW2ZpbGVdLnByb2dyZXNzLnVwbG9hZFN0YXJ0ZWRcbiAgICB9KVxuXG4gICAgaW5Qcm9ncmVzc1VwZGF0ZWRGaWxlcy5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICBjb25zdCB1cGRhdGVkRmlsZSA9IE9iamVjdC5hc3NpZ24oe30sIHVwZGF0ZWRGaWxlc1tmaWxlXSwge1xuICAgICAgICBpc1BhdXNlZDogdHJ1ZVxuICAgICAgfSlcbiAgICAgIHVwZGF0ZWRGaWxlc1tmaWxlXSA9IHVwZGF0ZWRGaWxlXG4gICAgfSlcbiAgICB0aGlzLnNldFN0YXRlKHtmaWxlczogdXBkYXRlZEZpbGVzfSlcblxuICAgIHRoaXMuZW1pdCgncGF1c2UtYWxsJylcbiAgfVxuXG4gIHJlc3VtZUFsbCAoKSB7XG4gICAgY29uc3QgdXBkYXRlZEZpbGVzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTdGF0ZSgpLmZpbGVzKVxuICAgIGNvbnN0IGluUHJvZ3Jlc3NVcGRhdGVkRmlsZXMgPSBPYmplY3Qua2V5cyh1cGRhdGVkRmlsZXMpLmZpbHRlcigoZmlsZSkgPT4ge1xuICAgICAgcmV0dXJuICF1cGRhdGVkRmlsZXNbZmlsZV0ucHJvZ3Jlc3MudXBsb2FkQ29tcGxldGUgJiZcbiAgICAgICAgICAgICB1cGRhdGVkRmlsZXNbZmlsZV0ucHJvZ3Jlc3MudXBsb2FkU3RhcnRlZFxuICAgIH0pXG5cbiAgICBpblByb2dyZXNzVXBkYXRlZEZpbGVzLmZvckVhY2goKGZpbGUpID0+IHtcbiAgICAgIGNvbnN0IHVwZGF0ZWRGaWxlID0gT2JqZWN0LmFzc2lnbih7fSwgdXBkYXRlZEZpbGVzW2ZpbGVdLCB7XG4gICAgICAgIGlzUGF1c2VkOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IG51bGxcbiAgICAgIH0pXG4gICAgICB1cGRhdGVkRmlsZXNbZmlsZV0gPSB1cGRhdGVkRmlsZVxuICAgIH0pXG4gICAgdGhpcy5zZXRTdGF0ZSh7ZmlsZXM6IHVwZGF0ZWRGaWxlc30pXG5cbiAgICB0aGlzLmVtaXQoJ3Jlc3VtZS1hbGwnKVxuICB9XG5cbiAgcmV0cnlBbGwgKCkge1xuICAgIGNvbnN0IHVwZGF0ZWRGaWxlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U3RhdGUoKS5maWxlcylcbiAgICBjb25zdCBmaWxlc1RvUmV0cnkgPSBPYmplY3Qua2V5cyh1cGRhdGVkRmlsZXMpLmZpbHRlcihmaWxlID0+IHtcbiAgICAgIHJldHVybiB1cGRhdGVkRmlsZXNbZmlsZV0uZXJyb3JcbiAgICB9KVxuXG4gICAgZmlsZXNUb1JldHJ5LmZvckVhY2goKGZpbGUpID0+IHtcbiAgICAgIGNvbnN0IHVwZGF0ZWRGaWxlID0gT2JqZWN0LmFzc2lnbih7fSwgdXBkYXRlZEZpbGVzW2ZpbGVdLCB7XG4gICAgICAgIGlzUGF1c2VkOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IG51bGxcbiAgICAgIH0pXG4gICAgICB1cGRhdGVkRmlsZXNbZmlsZV0gPSB1cGRhdGVkRmlsZVxuICAgIH0pXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBmaWxlczogdXBkYXRlZEZpbGVzLFxuICAgICAgZXJyb3I6IG51bGxcbiAgICB9KVxuXG4gICAgdGhpcy5lbWl0KCdyZXRyeS1hbGwnLCBmaWxlc1RvUmV0cnkpXG5cbiAgICBjb25zdCB1cGxvYWRJRCA9IHRoaXMuX2NyZWF0ZVVwbG9hZChmaWxlc1RvUmV0cnkpXG4gICAgcmV0dXJuIHRoaXMuX3J1blVwbG9hZCh1cGxvYWRJRClcbiAgfVxuXG4gIGNhbmNlbEFsbCAoKSB7XG4gICAgdGhpcy5lbWl0KCdjYW5jZWwtYWxsJylcblxuICAgIGNvbnN0IGZpbGVzID0gT2JqZWN0LmtleXModGhpcy5nZXRTdGF0ZSgpLmZpbGVzKVxuICAgIGZpbGVzLmZvckVhY2goKGZpbGVJRCkgPT4ge1xuICAgICAgdGhpcy5yZW1vdmVGaWxlKGZpbGVJRClcbiAgICB9KVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBhbGxvd05ld1VwbG9hZDogdHJ1ZSxcbiAgICAgIHRvdGFsUHJvZ3Jlc3M6IDAsXG4gICAgICBlcnJvcjogbnVsbFxuICAgIH0pXG4gIH1cblxuICByZXRyeVVwbG9hZCAoZmlsZUlEKSB7XG4gICAgY29uc3QgdXBkYXRlZEZpbGVzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTdGF0ZSgpLmZpbGVzKVxuICAgIGNvbnN0IHVwZGF0ZWRGaWxlID0gT2JqZWN0LmFzc2lnbih7fSwgdXBkYXRlZEZpbGVzW2ZpbGVJRF0sXG4gICAgICB7IGVycm9yOiBudWxsLCBpc1BhdXNlZDogZmFsc2UgfVxuICAgIClcbiAgICB1cGRhdGVkRmlsZXNbZmlsZUlEXSA9IHVwZGF0ZWRGaWxlXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBmaWxlczogdXBkYXRlZEZpbGVzXG4gICAgfSlcblxuICAgIHRoaXMuZW1pdCgndXBsb2FkLXJldHJ5JywgZmlsZUlEKVxuXG4gICAgY29uc3QgdXBsb2FkSUQgPSB0aGlzLl9jcmVhdGVVcGxvYWQoWyBmaWxlSUQgXSlcbiAgICByZXR1cm4gdGhpcy5fcnVuVXBsb2FkKHVwbG9hZElEKVxuICB9XG5cbiAgcmVzZXQgKCkge1xuICAgIHRoaXMuY2FuY2VsQWxsKClcbiAgfVxuXG4gIF9jYWxjdWxhdGVQcm9ncmVzcyAoZmlsZSwgZGF0YSkge1xuICAgIGlmICghdGhpcy5nZXRGaWxlKGZpbGUuaWQpKSB7XG4gICAgICB0aGlzLmxvZyhgTm90IHNldHRpbmcgcHJvZ3Jlc3MgZm9yIGEgZmlsZSB0aGF0IGhhcyBiZWVuIHJlbW92ZWQ6ICR7ZmlsZS5pZH1gKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy5zZXRGaWxlU3RhdGUoZmlsZS5pZCwge1xuICAgICAgcHJvZ3Jlc3M6IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0RmlsZShmaWxlLmlkKS5wcm9ncmVzcywge1xuICAgICAgICBieXRlc1VwbG9hZGVkOiBkYXRhLmJ5dGVzVXBsb2FkZWQsXG4gICAgICAgIGJ5dGVzVG90YWw6IGRhdGEuYnl0ZXNUb3RhbCxcbiAgICAgICAgcGVyY2VudGFnZTogTWF0aC5mbG9vcigoZGF0YS5ieXRlc1VwbG9hZGVkIC8gZGF0YS5ieXRlc1RvdGFsICogMTAwKS50b0ZpeGVkKDIpKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgdGhpcy5fY2FsY3VsYXRlVG90YWxQcm9ncmVzcygpXG4gIH1cblxuICBfY2FsY3VsYXRlVG90YWxQcm9ncmVzcyAoKSB7XG4gICAgLy8gY2FsY3VsYXRlIHRvdGFsIHByb2dyZXNzLCB1c2luZyB0aGUgbnVtYmVyIG9mIGZpbGVzIGN1cnJlbnRseSB1cGxvYWRpbmcsXG4gICAgLy8gbXVsdGlwbGllZCBieSAxMDAgYW5kIHRoZSBzdW1tIG9mIGluZGl2aWR1YWwgcHJvZ3Jlc3Mgb2YgZWFjaCBmaWxlXG4gICAgY29uc3QgZmlsZXMgPSB0aGlzLmdldEZpbGVzKClcblxuICAgIGNvbnN0IGluUHJvZ3Jlc3MgPSBmaWxlcy5maWx0ZXIoKGZpbGUpID0+IHtcbiAgICAgIHJldHVybiBmaWxlLnByb2dyZXNzLnVwbG9hZFN0YXJ0ZWRcbiAgICB9KVxuXG4gICAgaWYgKGluUHJvZ3Jlc3MubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLmVtaXQoJ3Byb2dyZXNzJywgMClcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyB0b3RhbFByb2dyZXNzOiAwIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBzaXplZEZpbGVzID0gaW5Qcm9ncmVzcy5maWx0ZXIoKGZpbGUpID0+IGZpbGUucHJvZ3Jlc3MuYnl0ZXNUb3RhbCAhPSBudWxsKVxuICAgIGNvbnN0IHVuc2l6ZWRGaWxlcyA9IGluUHJvZ3Jlc3MuZmlsdGVyKChmaWxlKSA9PiBmaWxlLnByb2dyZXNzLmJ5dGVzVG90YWwgPT0gbnVsbClcblxuICAgIGlmIChzaXplZEZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc3QgcHJvZ3Jlc3NNYXggPSBpblByb2dyZXNzLmxlbmd0aFxuICAgICAgY29uc3QgY3VycmVudFByb2dyZXNzID0gdW5zaXplZEZpbGVzLnJlZHVjZSgoYWNjLCBmaWxlKSA9PiB7XG4gICAgICAgIHJldHVybiBhY2MgKyBmaWxlLnByb2dyZXNzLnBlcmNlbnRhZ2VcbiAgICAgIH0sIDApXG4gICAgICBjb25zdCB0b3RhbFByb2dyZXNzID0gTWF0aC5yb3VuZChjdXJyZW50UHJvZ3Jlc3MgLyBwcm9ncmVzc01heCAqIDEwMClcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyB0b3RhbFByb2dyZXNzIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBsZXQgdG90YWxTaXplID0gc2l6ZWRGaWxlcy5yZWR1Y2UoKGFjYywgZmlsZSkgPT4ge1xuICAgICAgcmV0dXJuIGFjYyArIGZpbGUucHJvZ3Jlc3MuYnl0ZXNUb3RhbFxuICAgIH0sIDApXG4gICAgY29uc3QgYXZlcmFnZVNpemUgPSB0b3RhbFNpemUgLyBzaXplZEZpbGVzLmxlbmd0aFxuICAgIHRvdGFsU2l6ZSArPSBhdmVyYWdlU2l6ZSAqIHVuc2l6ZWRGaWxlcy5sZW5ndGhcblxuICAgIGxldCB1cGxvYWRlZFNpemUgPSAwXG4gICAgc2l6ZWRGaWxlcy5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICB1cGxvYWRlZFNpemUgKz0gZmlsZS5wcm9ncmVzcy5ieXRlc1VwbG9hZGVkXG4gICAgfSlcbiAgICB1bnNpemVkRmlsZXMuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgdXBsb2FkZWRTaXplICs9IGF2ZXJhZ2VTaXplICogKGZpbGUucHJvZ3Jlc3MucGVyY2VudGFnZSB8fCAwKVxuICAgIH0pXG5cbiAgICBjb25zdCB0b3RhbFByb2dyZXNzID0gdG90YWxTaXplID09PSAwXG4gICAgICA/IDBcbiAgICAgIDogTWF0aC5yb3VuZCh1cGxvYWRlZFNpemUgLyB0b3RhbFNpemUgKiAxMDApXG5cbiAgICB0aGlzLnNldFN0YXRlKHsgdG90YWxQcm9ncmVzcyB9KVxuICAgIHRoaXMuZW1pdCgncHJvZ3Jlc3MnLCB0b3RhbFByb2dyZXNzKVxuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBsaXN0ZW5lcnMgZm9yIGFsbCBnbG9iYWwgYWN0aW9ucywgbGlrZTpcbiAgICogYGVycm9yYCwgYGZpbGUtcmVtb3ZlZGAsIGB1cGxvYWQtcHJvZ3Jlc3NgXG4gICAqL1xuICBfYWRkTGlzdGVuZXJzICgpIHtcbiAgICB0aGlzLm9uKCdlcnJvcicsIChlcnJvcikgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVycm9yOiBlcnJvci5tZXNzYWdlIH0pXG4gICAgfSlcblxuICAgIHRoaXMub24oJ3VwbG9hZC1lcnJvcicsIChmaWxlLCBlcnJvciwgcmVzcG9uc2UpID0+IHtcbiAgICAgIHRoaXMuc2V0RmlsZVN0YXRlKGZpbGUuaWQsIHtcbiAgICAgICAgZXJyb3I6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgIHJlc3BvbnNlXG4gICAgICB9KVxuXG4gICAgICB0aGlzLnNldFN0YXRlKHsgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSlcblxuICAgICAgbGV0IG1lc3NhZ2UgPSB0aGlzLmkxOG4oJ2ZhaWxlZFRvVXBsb2FkJywgeyBmaWxlOiBmaWxlLm5hbWUgfSlcbiAgICAgIGlmICh0eXBlb2YgZXJyb3IgPT09ICdvYmplY3QnICYmIGVycm9yLm1lc3NhZ2UpIHtcbiAgICAgICAgbWVzc2FnZSA9IHsgbWVzc2FnZTogbWVzc2FnZSwgZGV0YWlsczogZXJyb3IubWVzc2FnZSB9XG4gICAgICB9XG4gICAgICB0aGlzLmluZm8obWVzc2FnZSwgJ2Vycm9yJywgNTAwMClcbiAgICB9KVxuXG4gICAgdGhpcy5vbigndXBsb2FkJywgKCkgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVycm9yOiBudWxsIH0pXG4gICAgfSlcblxuICAgIHRoaXMub24oJ3VwbG9hZC1zdGFydGVkJywgKGZpbGUsIHVwbG9hZCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLmdldEZpbGUoZmlsZS5pZCkpIHtcbiAgICAgICAgdGhpcy5sb2coYE5vdCBzZXR0aW5nIHByb2dyZXNzIGZvciBhIGZpbGUgdGhhdCBoYXMgYmVlbiByZW1vdmVkOiAke2ZpbGUuaWR9YClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICB0aGlzLnNldEZpbGVTdGF0ZShmaWxlLmlkLCB7XG4gICAgICAgIHByb2dyZXNzOiB7XG4gICAgICAgICAgdXBsb2FkU3RhcnRlZDogRGF0ZS5ub3coKSxcbiAgICAgICAgICB1cGxvYWRDb21wbGV0ZTogZmFsc2UsXG4gICAgICAgICAgcGVyY2VudGFnZTogMCxcbiAgICAgICAgICBieXRlc1VwbG9hZGVkOiAwLFxuICAgICAgICAgIGJ5dGVzVG90YWw6IGZpbGUuc2l6ZVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0pXG5cbiAgICAvLyB1cGxvYWQgcHJvZ3Jlc3MgZXZlbnRzIGNhbiBvY2N1ciBmcmVxdWVudGx5LCBlc3BlY2lhbGx5IHdoZW4geW91IGhhdmUgYSBnb29kXG4gICAgLy8gY29ubmVjdGlvbiB0byB0aGUgcmVtb3RlIHNlcnZlci4gVGhlcmVmb3JlLCB3ZSBhcmUgdGhyb3R0ZWxpbmcgdGhlbSB0b1xuICAgIC8vIHByZXZlbnQgYWNjZXNzaXZlIGZ1bmN0aW9uIGNhbGxzLlxuICAgIC8vIHNlZSBhbHNvOiBodHRwczovL2dpdGh1Yi5jb20vdHVzL3R1cy1qcy1jbGllbnQvY29tbWl0Lzk5NDBmMjdiMjM2MWZkN2UxMGJhNThiMDliNjBkODI0MjIxODNiYmJcbiAgICAvLyBjb25zdCBfdGhyb3R0bGVkQ2FsY3VsYXRlUHJvZ3Jlc3MgPSB0aHJvdHRsZSh0aGlzLl9jYWxjdWxhdGVQcm9ncmVzcywgMTAwLCB7IGxlYWRpbmc6IHRydWUsIHRyYWlsaW5nOiB0cnVlIH0pXG5cbiAgICB0aGlzLm9uKCd1cGxvYWQtcHJvZ3Jlc3MnLCB0aGlzLl9jYWxjdWxhdGVQcm9ncmVzcylcblxuICAgIHRoaXMub24oJ3VwbG9hZC1zdWNjZXNzJywgKGZpbGUsIHVwbG9hZFJlc3ApID0+IHtcbiAgICAgIGNvbnN0IGN1cnJlbnRQcm9ncmVzcyA9IHRoaXMuZ2V0RmlsZShmaWxlLmlkKS5wcm9ncmVzc1xuICAgICAgdGhpcy5zZXRGaWxlU3RhdGUoZmlsZS5pZCwge1xuICAgICAgICBwcm9ncmVzczogT2JqZWN0LmFzc2lnbih7fSwgY3VycmVudFByb2dyZXNzLCB7XG4gICAgICAgICAgdXBsb2FkQ29tcGxldGU6IHRydWUsXG4gICAgICAgICAgcGVyY2VudGFnZTogMTAwLFxuICAgICAgICAgIGJ5dGVzVXBsb2FkZWQ6IGN1cnJlbnRQcm9ncmVzcy5ieXRlc1RvdGFsXG4gICAgICAgIH0pLFxuICAgICAgICByZXNwb25zZTogdXBsb2FkUmVzcCxcbiAgICAgICAgdXBsb2FkVVJMOiB1cGxvYWRSZXNwLnVwbG9hZFVSTCxcbiAgICAgICAgaXNQYXVzZWQ6IGZhbHNlXG4gICAgICB9KVxuXG4gICAgICB0aGlzLl9jYWxjdWxhdGVUb3RhbFByb2dyZXNzKClcbiAgICB9KVxuXG4gICAgdGhpcy5vbigncHJlcHJvY2Vzcy1wcm9ncmVzcycsIChmaWxlLCBwcm9ncmVzcykgPT4ge1xuICAgICAgaWYgKCF0aGlzLmdldEZpbGUoZmlsZS5pZCkpIHtcbiAgICAgICAgdGhpcy5sb2coYE5vdCBzZXR0aW5nIHByb2dyZXNzIGZvciBhIGZpbGUgdGhhdCBoYXMgYmVlbiByZW1vdmVkOiAke2ZpbGUuaWR9YClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICB0aGlzLnNldEZpbGVTdGF0ZShmaWxlLmlkLCB7XG4gICAgICAgIHByb2dyZXNzOiBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmdldEZpbGUoZmlsZS5pZCkucHJvZ3Jlc3MsIHtcbiAgICAgICAgICBwcmVwcm9jZXNzOiBwcm9ncmVzc1xuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgdGhpcy5vbigncHJlcHJvY2Vzcy1jb21wbGV0ZScsIChmaWxlKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuZ2V0RmlsZShmaWxlLmlkKSkge1xuICAgICAgICB0aGlzLmxvZyhgTm90IHNldHRpbmcgcHJvZ3Jlc3MgZm9yIGEgZmlsZSB0aGF0IGhhcyBiZWVuIHJlbW92ZWQ6ICR7ZmlsZS5pZH1gKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGNvbnN0IGZpbGVzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTdGF0ZSgpLmZpbGVzKVxuICAgICAgZmlsZXNbZmlsZS5pZF0gPSBPYmplY3QuYXNzaWduKHt9LCBmaWxlc1tmaWxlLmlkXSwge1xuICAgICAgICBwcm9ncmVzczogT2JqZWN0LmFzc2lnbih7fSwgZmlsZXNbZmlsZS5pZF0ucHJvZ3Jlc3MpXG4gICAgICB9KVxuICAgICAgZGVsZXRlIGZpbGVzW2ZpbGUuaWRdLnByb2dyZXNzLnByZXByb2Nlc3NcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGZpbGVzOiBmaWxlcyB9KVxuICAgIH0pXG5cbiAgICB0aGlzLm9uKCdwb3N0cHJvY2Vzcy1wcm9ncmVzcycsIChmaWxlLCBwcm9ncmVzcykgPT4ge1xuICAgICAgaWYgKCF0aGlzLmdldEZpbGUoZmlsZS5pZCkpIHtcbiAgICAgICAgdGhpcy5sb2coYE5vdCBzZXR0aW5nIHByb2dyZXNzIGZvciBhIGZpbGUgdGhhdCBoYXMgYmVlbiByZW1vdmVkOiAke2ZpbGUuaWR9YClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICB0aGlzLnNldEZpbGVTdGF0ZShmaWxlLmlkLCB7XG4gICAgICAgIHByb2dyZXNzOiBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmdldFN0YXRlKCkuZmlsZXNbZmlsZS5pZF0ucHJvZ3Jlc3MsIHtcbiAgICAgICAgICBwb3N0cHJvY2VzczogcHJvZ3Jlc3NcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIHRoaXMub24oJ3Bvc3Rwcm9jZXNzLWNvbXBsZXRlJywgKGZpbGUpID0+IHtcbiAgICAgIGlmICghdGhpcy5nZXRGaWxlKGZpbGUuaWQpKSB7XG4gICAgICAgIHRoaXMubG9nKGBOb3Qgc2V0dGluZyBwcm9ncmVzcyBmb3IgYSBmaWxlIHRoYXQgaGFzIGJlZW4gcmVtb3ZlZDogJHtmaWxlLmlkfWApXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgY29uc3QgZmlsZXMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmdldFN0YXRlKCkuZmlsZXMpXG4gICAgICBmaWxlc1tmaWxlLmlkXSA9IE9iamVjdC5hc3NpZ24oe30sIGZpbGVzW2ZpbGUuaWRdLCB7XG4gICAgICAgIHByb2dyZXNzOiBPYmplY3QuYXNzaWduKHt9LCBmaWxlc1tmaWxlLmlkXS5wcm9ncmVzcylcbiAgICAgIH0pXG4gICAgICBkZWxldGUgZmlsZXNbZmlsZS5pZF0ucHJvZ3Jlc3MucG9zdHByb2Nlc3NcbiAgICAgIC8vIFRPRE8gc2hvdWxkIHdlIHNldCBzb21lIGtpbmQgb2YgYGZ1bGx5Q29tcGxldGVgIHByb3BlcnR5IG9uIHRoZSBmaWxlIG9iamVjdFxuICAgICAgLy8gc28gaXQncyBlYXNpZXIgdG8gc2VlIHRoYXQgdGhlIGZpbGUgaXMgdXBsb2Fk4oCmZnVsbHkgY29tcGxldGXigKZyYXRoZXIgdGhhblxuICAgICAgLy8gd2hhdCB3ZSBoYXZlIHRvIGRvIG5vdyAoYHVwbG9hZENvbXBsZXRlICYmICFwb3N0cHJvY2Vzc2ApXG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBmaWxlczogZmlsZXMgfSlcbiAgICB9KVxuXG4gICAgdGhpcy5vbigncmVzdG9yZWQnLCAoKSA9PiB7XG4gICAgICAvLyBGaWxlcyBtYXkgaGF2ZSBjaGFuZ2VkLS1lbnN1cmUgcHJvZ3Jlc3MgaXMgc3RpbGwgYWNjdXJhdGUuXG4gICAgICB0aGlzLl9jYWxjdWxhdGVUb3RhbFByb2dyZXNzKClcbiAgICB9KVxuXG4gICAgLy8gc2hvdyBpbmZvcm1lciBpZiBvZmZsaW5lXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignb25saW5lJywgKCkgPT4gdGhpcy51cGRhdGVPbmxpbmVTdGF0dXMoKSlcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdvZmZsaW5lJywgKCkgPT4gdGhpcy51cGRhdGVPbmxpbmVTdGF0dXMoKSlcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy51cGRhdGVPbmxpbmVTdGF0dXMoKSwgMzAwMClcbiAgICB9XG4gIH1cblxuICB1cGRhdGVPbmxpbmVTdGF0dXMgKCkge1xuICAgIGNvbnN0IG9ubGluZSA9XG4gICAgICB0eXBlb2Ygd2luZG93Lm5hdmlnYXRvci5vbkxpbmUgIT09ICd1bmRlZmluZWQnXG4gICAgICAgID8gd2luZG93Lm5hdmlnYXRvci5vbkxpbmVcbiAgICAgICAgOiB0cnVlXG4gICAgaWYgKCFvbmxpbmUpIHtcbiAgICAgIHRoaXMuZW1pdCgnaXMtb2ZmbGluZScpXG4gICAgICB0aGlzLmluZm8odGhpcy5pMThuKCdub0ludGVybmV0Q29ubmVjdGlvbicpLCAnZXJyb3InLCAwKVxuICAgICAgdGhpcy53YXNPZmZsaW5lID0gdHJ1ZVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmVtaXQoJ2lzLW9ubGluZScpXG4gICAgICBpZiAodGhpcy53YXNPZmZsaW5lKSB7XG4gICAgICAgIHRoaXMuZW1pdCgnYmFjay1vbmxpbmUnKVxuICAgICAgICB0aGlzLmluZm8odGhpcy5pMThuKCdjb25uZWN0ZWRUb0ludGVybmV0JyksICdzdWNjZXNzJywgMzAwMClcbiAgICAgICAgdGhpcy53YXNPZmZsaW5lID0gZmFsc2VcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRJRCAoKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0cy5pZFxuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIHBsdWdpbiB3aXRoIENvcmUuXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBQbHVnaW4gb2JqZWN0XG4gICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0c10gb2JqZWN0IHdpdGggb3B0aW9ucyB0byBiZSBwYXNzZWQgdG8gUGx1Z2luXG4gICAqIEByZXR1cm4ge09iamVjdH0gc2VsZiBmb3IgY2hhaW5pbmdcbiAgICovXG4gIHVzZSAoUGx1Z2luLCBvcHRzKSB7XG4gICAgaWYgKHR5cGVvZiBQbHVnaW4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGxldCBtc2cgPSBgRXhwZWN0ZWQgYSBwbHVnaW4gY2xhc3MsIGJ1dCBnb3QgJHtQbHVnaW4gPT09IG51bGwgPyAnbnVsbCcgOiB0eXBlb2YgUGx1Z2lufS5gICtcbiAgICAgICAgJyBQbGVhc2UgdmVyaWZ5IHRoYXQgdGhlIHBsdWdpbiB3YXMgaW1wb3J0ZWQgYW5kIHNwZWxsZWQgY29ycmVjdGx5LidcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IobXNnKVxuICAgIH1cblxuICAgIC8vIEluc3RhbnRpYXRlXG4gICAgY29uc3QgcGx1Z2luID0gbmV3IFBsdWdpbih0aGlzLCBvcHRzKVxuICAgIGNvbnN0IHBsdWdpbklkID0gcGx1Z2luLmlkXG4gICAgdGhpcy5wbHVnaW5zW3BsdWdpbi50eXBlXSA9IHRoaXMucGx1Z2luc1twbHVnaW4udHlwZV0gfHwgW11cblxuICAgIGlmICghcGx1Z2luSWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignWW91ciBwbHVnaW4gbXVzdCBoYXZlIGFuIGlkJylcbiAgICB9XG5cbiAgICBpZiAoIXBsdWdpbi50eXBlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdXIgcGx1Z2luIG11c3QgaGF2ZSBhIHR5cGUnKVxuICAgIH1cblxuICAgIGxldCBleGlzdHNQbHVnaW5BbHJlYWR5ID0gdGhpcy5nZXRQbHVnaW4ocGx1Z2luSWQpXG4gICAgaWYgKGV4aXN0c1BsdWdpbkFscmVhZHkpIHtcbiAgICAgIGxldCBtc2cgPSBgQWxyZWFkeSBmb3VuZCBhIHBsdWdpbiBuYW1lZCAnJHtleGlzdHNQbHVnaW5BbHJlYWR5LmlkfScuIGAgK1xuICAgICAgICBgVHJpZWQgdG8gdXNlOiAnJHtwbHVnaW5JZH0nLlxcbmAgK1xuICAgICAgICBgVXBweSBwbHVnaW5zIG11c3QgaGF2ZSB1bmlxdWUgJ2lkJyBvcHRpb25zLiBTZWUgaHR0cHM6Ly91cHB5LmlvL2RvY3MvcGx1Z2lucy8jaWQuYFxuICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZylcbiAgICB9XG5cbiAgICB0aGlzLnBsdWdpbnNbcGx1Z2luLnR5cGVdLnB1c2gocGx1Z2luKVxuICAgIHBsdWdpbi5pbnN0YWxsKClcblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogRmluZCBvbmUgUGx1Z2luIGJ5IG5hbWUuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpZCBwbHVnaW4gaWRcbiAgICogQHJldHVybiB7b2JqZWN0IHwgYm9vbGVhbn1cbiAgICovXG4gIGdldFBsdWdpbiAoaWQpIHtcbiAgICBsZXQgZm91bmRQbHVnaW4gPSBudWxsXG4gICAgdGhpcy5pdGVyYXRlUGx1Z2lucygocGx1Z2luKSA9PiB7XG4gICAgICBpZiAocGx1Z2luLmlkID09PSBpZCkge1xuICAgICAgICBmb3VuZFBsdWdpbiA9IHBsdWdpblxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBmb3VuZFBsdWdpblxuICB9XG5cbiAgLyoqXG4gICAqIEl0ZXJhdGUgdGhyb3VnaCBhbGwgYHVzZWBkIHBsdWdpbnMuXG4gICAqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IG1ldGhvZCB0aGF0IHdpbGwgYmUgcnVuIG9uIGVhY2ggcGx1Z2luXG4gICAqL1xuICBpdGVyYXRlUGx1Z2lucyAobWV0aG9kKSB7XG4gICAgT2JqZWN0LmtleXModGhpcy5wbHVnaW5zKS5mb3JFYWNoKHBsdWdpblR5cGUgPT4ge1xuICAgICAgdGhpcy5wbHVnaW5zW3BsdWdpblR5cGVdLmZvckVhY2gobWV0aG9kKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogVW5pbnN0YWxsIGFuZCByZW1vdmUgYSBwbHVnaW4uXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBpbnN0YW5jZSBUaGUgcGx1Z2luIGluc3RhbmNlIHRvIHJlbW92ZS5cbiAgICovXG4gIHJlbW92ZVBsdWdpbiAoaW5zdGFuY2UpIHtcbiAgICB0aGlzLmxvZyhgUmVtb3ZpbmcgcGx1Z2luICR7aW5zdGFuY2UuaWR9YClcbiAgICB0aGlzLmVtaXQoJ3BsdWdpbi1yZW1vdmUnLCBpbnN0YW5jZSlcblxuICAgIGlmIChpbnN0YW5jZS51bmluc3RhbGwpIHtcbiAgICAgIGluc3RhbmNlLnVuaW5zdGFsbCgpXG4gICAgfVxuXG4gICAgY29uc3QgbGlzdCA9IHRoaXMucGx1Z2luc1tpbnN0YW5jZS50eXBlXS5zbGljZSgpXG4gICAgY29uc3QgaW5kZXggPSBsaXN0LmluZGV4T2YoaW5zdGFuY2UpXG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgbGlzdC5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICB0aGlzLnBsdWdpbnNbaW5zdGFuY2UudHlwZV0gPSBsaXN0XG4gICAgfVxuXG4gICAgY29uc3QgdXBkYXRlZFN0YXRlID0gdGhpcy5nZXRTdGF0ZSgpXG4gICAgZGVsZXRlIHVwZGF0ZWRTdGF0ZS5wbHVnaW5zW2luc3RhbmNlLmlkXVxuICAgIHRoaXMuc2V0U3RhdGUodXBkYXRlZFN0YXRlKVxuICB9XG5cbiAgLyoqXG4gICAqIFVuaW5zdGFsbCBhbGwgcGx1Z2lucyBhbmQgY2xvc2UgZG93biB0aGlzIFVwcHkgaW5zdGFuY2UuXG4gICAqL1xuICBjbG9zZSAoKSB7XG4gICAgdGhpcy5sb2coYENsb3NpbmcgVXBweSBpbnN0YW5jZSAke3RoaXMub3B0cy5pZH06IHJlbW92aW5nIGFsbCBmaWxlcyBhbmQgdW5pbnN0YWxsaW5nIHBsdWdpbnNgKVxuXG4gICAgdGhpcy5yZXNldCgpXG5cbiAgICB0aGlzLl9zdG9yZVVuc3Vic2NyaWJlKClcblxuICAgIHRoaXMuaXRlcmF0ZVBsdWdpbnMoKHBsdWdpbikgPT4ge1xuICAgICAgdGhpcy5yZW1vdmVQbHVnaW4ocGx1Z2luKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgKiBTZXQgaW5mbyBtZXNzYWdlIGluIGBzdGF0ZS5pbmZvYCwgc28gdGhhdCBVSSBwbHVnaW5zIGxpa2UgYEluZm9ybWVyYFxuICAqIGNhbiBkaXNwbGF5IHRoZSBtZXNzYWdlLlxuICAqXG4gICogQHBhcmFtIHtzdHJpbmcgfCBvYmplY3R9IG1lc3NhZ2UgTWVzc2FnZSB0byBiZSBkaXNwbGF5ZWQgYnkgdGhlIGluZm9ybWVyXG4gICogQHBhcmFtIHtzdHJpbmd9IFt0eXBlXVxuICAqIEBwYXJhbSB7bnVtYmVyfSBbZHVyYXRpb25dXG4gICovXG5cbiAgaW5mbyAobWVzc2FnZSwgdHlwZSA9ICdpbmZvJywgZHVyYXRpb24gPSAzMDAwKSB7XG4gICAgY29uc3QgaXNDb21wbGV4TWVzc2FnZSA9IHR5cGVvZiBtZXNzYWdlID09PSAnb2JqZWN0J1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBpbmZvOiB7XG4gICAgICAgIGlzSGlkZGVuOiBmYWxzZSxcbiAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgbWVzc2FnZTogaXNDb21wbGV4TWVzc2FnZSA/IG1lc3NhZ2UubWVzc2FnZSA6IG1lc3NhZ2UsXG4gICAgICAgIGRldGFpbHM6IGlzQ29tcGxleE1lc3NhZ2UgPyBtZXNzYWdlLmRldGFpbHMgOiBudWxsXG4gICAgICB9XG4gICAgfSlcblxuICAgIHRoaXMuZW1pdCgnaW5mby12aXNpYmxlJylcblxuICAgIGNsZWFyVGltZW91dCh0aGlzLmluZm9UaW1lb3V0SUQpXG4gICAgaWYgKGR1cmF0aW9uID09PSAwKSB7XG4gICAgICB0aGlzLmluZm9UaW1lb3V0SUQgPSB1bmRlZmluZWRcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIGhpZGUgdGhlIGluZm9ybWVyIGFmdGVyIGBkdXJhdGlvbmAgbWlsbGlzZWNvbmRzXG4gICAgdGhpcy5pbmZvVGltZW91dElEID0gc2V0VGltZW91dCh0aGlzLmhpZGVJbmZvLCBkdXJhdGlvbilcbiAgfVxuXG4gIGhpZGVJbmZvICgpIHtcbiAgICBjb25zdCBuZXdJbmZvID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTdGF0ZSgpLmluZm8sIHtcbiAgICAgIGlzSGlkZGVuOiB0cnVlXG4gICAgfSlcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGluZm86IG5ld0luZm9cbiAgICB9KVxuICAgIHRoaXMuZW1pdCgnaW5mby1oaWRkZW4nKVxuICB9XG5cbiAgLyoqXG4gICAqIExvZ3Mgc3R1ZmYgdG8gY29uc29sZSwgb25seSBpZiBgZGVidWdgIGlzIHNldCB0byB0cnVlLiBTaWxlbnQgaW4gcHJvZHVjdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBtc2cgdG8gbG9nXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBbdHlwZV0gb3B0aW9uYWwgYGVycm9yYCBvciBgd2FybmluZ2BcbiAgICovXG4gIGxvZyAobXNnLCB0eXBlKSB7XG4gICAgaWYgKCF0aGlzLm9wdHMuZGVidWcpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGxldCBtZXNzYWdlID0gYFtVcHB5XSBbJHtnZXRUaW1lU3RhbXAoKX1dICR7bXNnfWBcblxuICAgIHdpbmRvd1sndXBweUxvZyddID0gd2luZG93Wyd1cHB5TG9nJ10gKyAnXFxuJyArICdERUJVRyBMT0c6ICcgKyBtc2dcblxuICAgIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgICBjb25zb2xlLmVycm9yKG1lc3NhZ2UpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAodHlwZSA9PT0gJ3dhcm5pbmcnKSB7XG4gICAgICBjb25zb2xlLndhcm4obWVzc2FnZSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmIChtc2cgPT09IGAke21zZ31gKSB7XG4gICAgICBjb25zb2xlLmxvZyhtZXNzYWdlKVxuICAgIH0gZWxzZSB7XG4gICAgICBtZXNzYWdlID0gYFtVcHB5XSBbJHtnZXRUaW1lU3RhbXAoKX1dYFxuICAgICAgY29uc29sZS5sb2cobWVzc2FnZSlcbiAgICAgIGNvbnNvbGUuZGlyKG1zZylcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogT2Jzb2xldGUsIGV2ZW50IGxpc3RlbmVycyBhcmUgbm93IGFkZGVkIGluIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICovXG4gIHJ1biAoKSB7XG4gICAgdGhpcy5sb2coJ0NhbGxpbmcgcnVuKCkgaXMgbm8gbG9uZ2VyIG5lY2Vzc2FyeS4nLCAnd2FybmluZycpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXN0b3JlIGFuIHVwbG9hZCBieSBpdHMgSUQuXG4gICAqL1xuICByZXN0b3JlICh1cGxvYWRJRCkge1xuICAgIHRoaXMubG9nKGBDb3JlOiBhdHRlbXB0aW5nIHRvIHJlc3RvcmUgdXBsb2FkIFwiJHt1cGxvYWRJRH1cImApXG5cbiAgICBpZiAoIXRoaXMuZ2V0U3RhdGUoKS5jdXJyZW50VXBsb2Fkc1t1cGxvYWRJRF0pIHtcbiAgICAgIHRoaXMuX3JlbW92ZVVwbG9hZCh1cGxvYWRJRClcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ05vbmV4aXN0ZW50IHVwbG9hZCcpKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9ydW5VcGxvYWQodXBsb2FkSUQpXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGFuIHVwbG9hZCBmb3IgYSBidW5jaCBvZiBmaWxlcy5cbiAgICpcbiAgICogQHBhcmFtIHtBcnJheTxzdHJpbmc+fSBmaWxlSURzIEZpbGUgSURzIHRvIGluY2x1ZGUgaW4gdGhpcyB1cGxvYWQuXG4gICAqIEByZXR1cm4ge3N0cmluZ30gSUQgb2YgdGhpcyB1cGxvYWQuXG4gICAqL1xuICBfY3JlYXRlVXBsb2FkIChmaWxlSURzKSB7XG4gICAgY29uc3QgeyBhbGxvd05ld1VwbG9hZCwgY3VycmVudFVwbG9hZHMgfSA9IHRoaXMuZ2V0U3RhdGUoKVxuICAgIGlmICghYWxsb3dOZXdVcGxvYWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGNyZWF0ZSBhIG5ldyB1cGxvYWQ6IGFscmVhZHkgdXBsb2FkaW5nLicpXG4gICAgfVxuXG4gICAgY29uc3QgdXBsb2FkSUQgPSBjdWlkKClcblxuICAgIHRoaXMuZW1pdCgndXBsb2FkJywge1xuICAgICAgaWQ6IHVwbG9hZElELFxuICAgICAgZmlsZUlEczogZmlsZUlEc1xuICAgIH0pXG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGFsbG93TmV3VXBsb2FkOiB0aGlzLm9wdHMuYWxsb3dNdWx0aXBsZVVwbG9hZHMgIT09IGZhbHNlLFxuXG4gICAgICBjdXJyZW50VXBsb2Fkczoge1xuICAgICAgICAuLi5jdXJyZW50VXBsb2FkcyxcbiAgICAgICAgW3VwbG9hZElEXToge1xuICAgICAgICAgIGZpbGVJRHM6IGZpbGVJRHMsXG4gICAgICAgICAgc3RlcDogMCxcbiAgICAgICAgICByZXN1bHQ6IHt9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIHVwbG9hZElEXG4gIH1cblxuICBfZ2V0VXBsb2FkICh1cGxvYWRJRCkge1xuICAgIGNvbnN0IHsgY3VycmVudFVwbG9hZHMgfSA9IHRoaXMuZ2V0U3RhdGUoKVxuXG4gICAgcmV0dXJuIGN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBkYXRhIHRvIGFuIHVwbG9hZCdzIHJlc3VsdCBvYmplY3QuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cGxvYWRJRCBUaGUgSUQgb2YgdGhlIHVwbG9hZC5cbiAgICogQHBhcmFtIHtvYmplY3R9IGRhdGEgRGF0YSBwcm9wZXJ0aWVzIHRvIGFkZCB0byB0aGUgcmVzdWx0IG9iamVjdC5cbiAgICovXG4gIGFkZFJlc3VsdERhdGEgKHVwbG9hZElELCBkYXRhKSB7XG4gICAgaWYgKCF0aGlzLl9nZXRVcGxvYWQodXBsb2FkSUQpKSB7XG4gICAgICB0aGlzLmxvZyhgTm90IHNldHRpbmcgcmVzdWx0IGZvciBhbiB1cGxvYWQgdGhhdCBoYXMgYmVlbiByZW1vdmVkOiAke3VwbG9hZElEfWApXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3QgY3VycmVudFVwbG9hZHMgPSB0aGlzLmdldFN0YXRlKCkuY3VycmVudFVwbG9hZHNcbiAgICBjb25zdCBjdXJyZW50VXBsb2FkID0gT2JqZWN0LmFzc2lnbih7fSwgY3VycmVudFVwbG9hZHNbdXBsb2FkSURdLCB7XG4gICAgICByZXN1bHQ6IE9iamVjdC5hc3NpZ24oe30sIGN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXS5yZXN1bHQsIGRhdGEpXG4gICAgfSlcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGN1cnJlbnRVcGxvYWRzOiBPYmplY3QuYXNzaWduKHt9LCBjdXJyZW50VXBsb2Fkcywge1xuICAgICAgICBbdXBsb2FkSURdOiBjdXJyZW50VXBsb2FkXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFuIHVwbG9hZCwgZWcuIGlmIGl0IGhhcyBiZWVuIGNhbmNlbGVkIG9yIGNvbXBsZXRlZC5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVwbG9hZElEIFRoZSBJRCBvZiB0aGUgdXBsb2FkLlxuICAgKi9cbiAgX3JlbW92ZVVwbG9hZCAodXBsb2FkSUQpIHtcbiAgICBjb25zdCBjdXJyZW50VXBsb2FkcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U3RhdGUoKS5jdXJyZW50VXBsb2FkcylcbiAgICBkZWxldGUgY3VycmVudFVwbG9hZHNbdXBsb2FkSURdXG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGN1cnJlbnRVcGxvYWRzOiBjdXJyZW50VXBsb2Fkc1xuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogUnVuIGFuIHVwbG9hZC4gVGhpcyBwaWNrcyB1cCB3aGVyZSBpdCBsZWZ0IG9mZiBpbiBjYXNlIHRoZSB1cGxvYWQgaXMgYmVpbmcgcmVzdG9yZWQuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfcnVuVXBsb2FkICh1cGxvYWRJRCkge1xuICAgIGNvbnN0IHVwbG9hZERhdGEgPSB0aGlzLmdldFN0YXRlKCkuY3VycmVudFVwbG9hZHNbdXBsb2FkSURdXG4gICAgY29uc3QgcmVzdG9yZVN0ZXAgPSB1cGxvYWREYXRhLnN0ZXBcblxuICAgIGNvbnN0IHN0ZXBzID0gW1xuICAgICAgLi4udGhpcy5wcmVQcm9jZXNzb3JzLFxuICAgICAgLi4udGhpcy51cGxvYWRlcnMsXG4gICAgICAuLi50aGlzLnBvc3RQcm9jZXNzb3JzXG4gICAgXVxuICAgIGxldCBsYXN0U3RlcCA9IFByb21pc2UucmVzb2x2ZSgpXG4gICAgc3RlcHMuZm9yRWFjaCgoZm4sIHN0ZXApID0+IHtcbiAgICAgIC8vIFNraXAgdGhpcyBzdGVwIGlmIHdlIGFyZSByZXN0b3JpbmcgYW5kIGhhdmUgYWxyZWFkeSBjb21wbGV0ZWQgdGhpcyBzdGVwIGJlZm9yZS5cbiAgICAgIGlmIChzdGVwIDwgcmVzdG9yZVN0ZXApIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGxhc3RTdGVwID0gbGFzdFN0ZXAudGhlbigoKSA9PiB7XG4gICAgICAgIGNvbnN0IHsgY3VycmVudFVwbG9hZHMgfSA9IHRoaXMuZ2V0U3RhdGUoKVxuICAgICAgICBjb25zdCBjdXJyZW50VXBsb2FkID0gT2JqZWN0LmFzc2lnbih7fSwgY3VycmVudFVwbG9hZHNbdXBsb2FkSURdLCB7XG4gICAgICAgICAgc3RlcDogc3RlcFxuICAgICAgICB9KVxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBjdXJyZW50VXBsb2FkczogT2JqZWN0LmFzc2lnbih7fSwgY3VycmVudFVwbG9hZHMsIHtcbiAgICAgICAgICAgIFt1cGxvYWRJRF06IGN1cnJlbnRVcGxvYWRcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIC8vIFRPRE8gZ2l2ZSB0aGlzIHRoZSBgY3VycmVudFVwbG9hZGAgb2JqZWN0IGFzIGl0cyBvbmx5IHBhcmFtZXRlciBtYXliZT9cbiAgICAgICAgLy8gT3RoZXJ3aXNlIHdoZW4gbW9yZSBtZXRhZGF0YSBtYXkgYmUgYWRkZWQgdG8gdGhlIHVwbG9hZCB0aGlzIHdvdWxkIGtlZXAgZ2V0dGluZyBtb3JlIHBhcmFtZXRlcnNcbiAgICAgICAgcmV0dXJuIGZuKGN1cnJlbnRVcGxvYWQuZmlsZUlEcywgdXBsb2FkSUQpXG4gICAgICB9KS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIC8vIE5vdCByZXR1cm5pbmcgdGhlIGBjYXRjaGBlZCBwcm9taXNlLCBiZWNhdXNlIHdlIHN0aWxsIHdhbnQgdG8gcmV0dXJuIGEgcmVqZWN0ZWRcbiAgICAvLyBwcm9taXNlIGZyb20gdGhpcyBtZXRob2QgaWYgdGhlIHVwbG9hZCBmYWlsZWQuXG4gICAgbGFzdFN0ZXAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgdGhpcy5lbWl0KCdlcnJvcicsIGVyciwgdXBsb2FkSUQpXG4gICAgICB0aGlzLl9yZW1vdmVVcGxvYWQodXBsb2FkSUQpXG4gICAgfSlcblxuICAgIHJldHVybiBsYXN0U3RlcC50aGVuKCgpID0+IHtcbiAgICAgIC8vIFNldCByZXN1bHQgZGF0YS5cbiAgICAgIGNvbnN0IHsgY3VycmVudFVwbG9hZHMgfSA9IHRoaXMuZ2V0U3RhdGUoKVxuICAgICAgY29uc3QgY3VycmVudFVwbG9hZCA9IGN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXVxuICAgICAgaWYgKCFjdXJyZW50VXBsb2FkKSB7XG4gICAgICAgIHRoaXMubG9nKGBOb3Qgc2V0dGluZyByZXN1bHQgZm9yIGFuIHVwbG9hZCB0aGF0IGhhcyBiZWVuIHJlbW92ZWQ6ICR7dXBsb2FkSUR9YClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGZpbGVzID0gY3VycmVudFVwbG9hZC5maWxlSURzXG4gICAgICAgIC5tYXAoKGZpbGVJRCkgPT4gdGhpcy5nZXRGaWxlKGZpbGVJRCkpXG4gICAgICBjb25zdCBzdWNjZXNzZnVsID0gZmlsZXMuZmlsdGVyKChmaWxlKSA9PiAhZmlsZS5lcnJvcilcbiAgICAgIGNvbnN0IGZhaWxlZCA9IGZpbGVzLmZpbHRlcigoZmlsZSkgPT4gZmlsZS5lcnJvcilcbiAgICAgIHRoaXMuYWRkUmVzdWx0RGF0YSh1cGxvYWRJRCwgeyBzdWNjZXNzZnVsLCBmYWlsZWQsIHVwbG9hZElEIH0pXG4gICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAvLyBFbWl0IGNvbXBsZXRpb24gZXZlbnRzLlxuICAgICAgLy8gVGhpcyBpcyBpbiBhIHNlcGFyYXRlIGZ1bmN0aW9uIHNvIHRoYXQgdGhlIGBjdXJyZW50VXBsb2Fkc2AgdmFyaWFibGVcbiAgICAgIC8vIGFsd2F5cyByZWZlcnMgdG8gdGhlIGxhdGVzdCBzdGF0ZS4gSW4gdGhlIGhhbmRsZXIgcmlnaHQgYWJvdmUgaXQgcmVmZXJzXG4gICAgICAvLyB0byBhbiBvdXRkYXRlZCBvYmplY3Qgd2l0aG91dCB0aGUgYC5yZXN1bHRgIHByb3BlcnR5LlxuICAgICAgY29uc3QgeyBjdXJyZW50VXBsb2FkcyB9ID0gdGhpcy5nZXRTdGF0ZSgpXG4gICAgICBpZiAoIWN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXSkge1xuICAgICAgICB0aGlzLmxvZyhgTm90IHNldHRpbmcgcmVzdWx0IGZvciBhbiB1cGxvYWQgdGhhdCBoYXMgYmVlbiBjYW5jZWxlZDogJHt1cGxvYWRJRH1gKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGNvbnN0IGN1cnJlbnRVcGxvYWQgPSBjdXJyZW50VXBsb2Fkc1t1cGxvYWRJRF1cbiAgICAgIGNvbnN0IHJlc3VsdCA9IGN1cnJlbnRVcGxvYWQucmVzdWx0XG4gICAgICB0aGlzLmVtaXQoJ2NvbXBsZXRlJywgcmVzdWx0KVxuXG4gICAgICB0aGlzLl9yZW1vdmVVcGxvYWQodXBsb2FkSUQpXG5cbiAgICAgIHJldHVybiByZXN1bHRcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IGFuIHVwbG9hZCBmb3IgYWxsIHRoZSBmaWxlcyB0aGF0IGFyZSBub3QgY3VycmVudGx5IGJlaW5nIHVwbG9hZGVkLlxuICAgKlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfVxuICAgKi9cbiAgdXBsb2FkICgpIHtcbiAgICBpZiAoIXRoaXMucGx1Z2lucy51cGxvYWRlcikge1xuICAgICAgdGhpcy5sb2coJ05vIHVwbG9hZGVyIHR5cGUgcGx1Z2lucyBhcmUgdXNlZCcsICd3YXJuaW5nJylcbiAgICB9XG5cbiAgICBsZXQgZmlsZXMgPSB0aGlzLmdldFN0YXRlKCkuZmlsZXNcbiAgICBjb25zdCBvbkJlZm9yZVVwbG9hZFJlc3VsdCA9IHRoaXMub3B0cy5vbkJlZm9yZVVwbG9hZChmaWxlcylcblxuICAgIGlmIChvbkJlZm9yZVVwbG9hZFJlc3VsdCA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ05vdCBzdGFydGluZyB0aGUgdXBsb2FkIGJlY2F1c2Ugb25CZWZvcmVVcGxvYWQgcmV0dXJuZWQgZmFsc2UnKSlcbiAgICB9XG5cbiAgICBpZiAob25CZWZvcmVVcGxvYWRSZXN1bHQgJiYgdHlwZW9mIG9uQmVmb3JlVXBsb2FkUmVzdWx0ID09PSAnb2JqZWN0Jykge1xuICAgICAgLy8gd2FybmluZyBhZnRlciB0aGUgY2hhbmdlIGluIDAuMjRcbiAgICAgIGlmIChvbkJlZm9yZVVwbG9hZFJlc3VsdC50aGVuKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29uQmVmb3JlVXBsb2FkKCkgcmV0dXJuZWQgYSBQcm9taXNlLCBidXQgdGhpcyBpcyBubyBsb25nZXIgc3VwcG9ydGVkLiBJdCBtdXN0IGJlIHN5bmNocm9ub3VzLicpXG4gICAgICB9XG5cbiAgICAgIGZpbGVzID0gb25CZWZvcmVVcGxvYWRSZXN1bHRcbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgIC50aGVuKCgpID0+IHRoaXMuX2NoZWNrTWluTnVtYmVyT2ZGaWxlcyhmaWxlcykpXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIGNvbnN0IHsgY3VycmVudFVwbG9hZHMgfSA9IHRoaXMuZ2V0U3RhdGUoKVxuICAgICAgICAvLyBnZXQgYSBsaXN0IG9mIGZpbGVzIHRoYXQgYXJlIGN1cnJlbnRseSBhc3NpZ25lZCB0byB1cGxvYWRzXG4gICAgICAgIGNvbnN0IGN1cnJlbnRseVVwbG9hZGluZ0ZpbGVzID0gT2JqZWN0LmtleXMoY3VycmVudFVwbG9hZHMpLnJlZHVjZSgocHJldiwgY3VycikgPT4gcHJldi5jb25jYXQoY3VycmVudFVwbG9hZHNbY3Vycl0uZmlsZUlEcyksIFtdKVxuXG4gICAgICAgIGNvbnN0IHdhaXRpbmdGaWxlSURzID0gW11cbiAgICAgICAgT2JqZWN0LmtleXMoZmlsZXMpLmZvckVhY2goKGZpbGVJRCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGZpbGUgPSB0aGlzLmdldEZpbGUoZmlsZUlEKVxuICAgICAgICAgIC8vIGlmIHRoZSBmaWxlIGhhc24ndCBzdGFydGVkIHVwbG9hZGluZyBhbmQgaGFzbid0IGFscmVhZHkgYmVlbiBhc3NpZ25lZCB0byBhbiB1cGxvYWQuLlxuICAgICAgICAgIGlmICgoIWZpbGUucHJvZ3Jlc3MudXBsb2FkU3RhcnRlZCkgJiYgKGN1cnJlbnRseVVwbG9hZGluZ0ZpbGVzLmluZGV4T2YoZmlsZUlEKSA9PT0gLTEpKSB7XG4gICAgICAgICAgICB3YWl0aW5nRmlsZUlEcy5wdXNoKGZpbGUuaWQpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIGNvbnN0IHVwbG9hZElEID0gdGhpcy5fY3JlYXRlVXBsb2FkKHdhaXRpbmdGaWxlSURzKVxuICAgICAgICByZXR1cm4gdGhpcy5fcnVuVXBsb2FkKHVwbG9hZElEKVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSB0eXBlb2YgZXJyID09PSAnb2JqZWN0JyA/IGVyci5tZXNzYWdlIDogZXJyXG4gICAgICAgIGNvbnN0IGRldGFpbHMgPSB0eXBlb2YgZXJyID09PSAnb2JqZWN0JyA/IGVyci5kZXRhaWxzIDogbnVsbFxuICAgICAgICB0aGlzLmxvZyhgJHttZXNzYWdlfSAke2RldGFpbHN9YClcbiAgICAgICAgdGhpcy5pbmZvKHsgbWVzc2FnZTogbWVzc2FnZSwgZGV0YWlsczogZGV0YWlscyB9LCAnZXJyb3InLCA0MDAwKVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QodHlwZW9mIGVyciA9PT0gJ29iamVjdCcgPyBlcnIgOiBuZXcgRXJyb3IoZXJyKSlcbiAgICAgIH0pXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob3B0cykge1xuICByZXR1cm4gbmV3IFVwcHkob3B0cylcbn1cblxuLy8gRXhwb3NlIGNsYXNzIGNvbnN0cnVjdG9yLlxubW9kdWxlLmV4cG9ydHMuVXBweSA9IFVwcHlcbm1vZHVsZS5leHBvcnRzLlBsdWdpbiA9IFBsdWdpblxuIiwiLy8gRWRnZSAxNS54IGRvZXMgbm90IGZpcmUgJ3Byb2dyZXNzJyBldmVudHMgb24gdXBsb2Fkcy5cbi8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdHJhbnNsb2FkaXQvdXBweS9pc3N1ZXMvOTQ1XG4vLyBBbmQgaHR0cHM6Ly9kZXZlbG9wZXIubWljcm9zb2Z0LmNvbS9lbi11cy9taWNyb3NvZnQtZWRnZS9wbGF0Zm9ybS9pc3N1ZXMvMTIyMjQ1MTAvXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHN1cHBvcnRzVXBsb2FkUHJvZ3Jlc3MgKHVzZXJBZ2VudCkge1xuICAvLyBBbGxvdyBwYXNzaW5nIGluIHVzZXJBZ2VudCBmb3IgdGVzdHNcbiAgaWYgKHVzZXJBZ2VudCA9PSBudWxsKSB7XG4gICAgdXNlckFnZW50ID0gdHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgPyBuYXZpZ2F0b3IudXNlckFnZW50IDogbnVsbFxuICB9XG4gIC8vIEFzc3VtZSBpdCB3b3JrcyBiZWNhdXNlIGJhc2ljYWxseSBldmVyeXRoaW5nIHN1cHBvcnRzIHByb2dyZXNzIGV2ZW50cy5cbiAgaWYgKCF1c2VyQWdlbnQpIHJldHVybiB0cnVlXG5cbiAgY29uc3QgbSA9IC9FZGdlXFwvKFxcZCtcXC5cXGQrKS8uZXhlYyh1c2VyQWdlbnQpXG4gIGlmICghbSkgcmV0dXJuIHRydWVcblxuICBjb25zdCBlZGdlVmVyc2lvbiA9IG1bMV1cbiAgbGV0IFttYWpvciwgbWlub3JdID0gZWRnZVZlcnNpb24uc3BsaXQoJy4nKVxuICBtYWpvciA9IHBhcnNlSW50KG1ham9yLCAxMClcbiAgbWlub3IgPSBwYXJzZUludChtaW5vciwgMTApXG5cbiAgLy8gV29ya2VkIGJlZm9yZTpcbiAgLy8gRWRnZSA0MC4xNTA2My4wLjBcbiAgLy8gTWljcm9zb2Z0IEVkZ2VIVE1MIDE1LjE1MDYzXG4gIGlmIChtYWpvciA8IDE1IHx8IChtYWpvciA9PT0gMTUgJiYgbWlub3IgPCAxNTA2MykpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgLy8gRml4ZWQgaW46XG4gIC8vIE1pY3Jvc29mdCBFZGdlSFRNTCAxOC4xODIxOFxuICBpZiAobWFqb3IgPiAxOCB8fCAobWFqb3IgPT09IDE4ICYmIG1pbm9yID49IDE4MjE4KSkge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICAvLyBvdGhlciB2ZXJzaW9ucyBkb24ndCB3b3JrLlxuICByZXR1cm4gZmFsc2Vcbn1cbiIsImNvbnN0IHsgUGx1Z2luIH0gPSByZXF1aXJlKCdAdXBweS9jb3JlJylcbmNvbnN0IHRvQXJyYXkgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvdG9BcnJheScpXG5jb25zdCBUcmFuc2xhdG9yID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL1RyYW5zbGF0b3InKVxuY29uc3QgeyBoIH0gPSByZXF1aXJlKCdwcmVhY3QnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEZpbGVJbnB1dCBleHRlbmRzIFBsdWdpbiB7XG4gIGNvbnN0cnVjdG9yICh1cHB5LCBvcHRzKSB7XG4gICAgc3VwZXIodXBweSwgb3B0cylcbiAgICB0aGlzLmlkID0gdGhpcy5vcHRzLmlkIHx8ICdGaWxlSW5wdXQnXG4gICAgdGhpcy50aXRsZSA9ICdGaWxlIElucHV0J1xuICAgIHRoaXMudHlwZSA9ICdhY3F1aXJlcidcblxuICAgIGNvbnN0IGRlZmF1bHRMb2NhbGUgPSB7XG4gICAgICBzdHJpbmdzOiB7XG4gICAgICAgIGNob29zZUZpbGVzOiAnQ2hvb3NlIGZpbGVzJ1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIERlZmF1bHQgb3B0aW9uc1xuICAgIGNvbnN0IGRlZmF1bHRPcHRpb25zID0ge1xuICAgICAgdGFyZ2V0OiBudWxsLFxuICAgICAgcHJldHR5OiB0cnVlLFxuICAgICAgaW5wdXROYW1lOiAnZmlsZXNbXScsXG4gICAgICBsb2NhbGU6IGRlZmF1bHRMb2NhbGVcbiAgICB9XG5cbiAgICAvLyBNZXJnZSBkZWZhdWx0IG9wdGlvbnMgd2l0aCB0aGUgb25lcyBzZXQgYnkgdXNlclxuICAgIHRoaXMub3B0cyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRPcHRpb25zLCBvcHRzKVxuXG4gICAgLy8gaTE4blxuICAgIHRoaXMudHJhbnNsYXRvciA9IG5ldyBUcmFuc2xhdG9yKFsgZGVmYXVsdExvY2FsZSwgdGhpcy51cHB5LmxvY2FsZSwgdGhpcy5vcHRzLmxvY2FsZSBdKVxuICAgIHRoaXMuaTE4biA9IHRoaXMudHJhbnNsYXRvci50cmFuc2xhdGUuYmluZCh0aGlzLnRyYW5zbGF0b3IpXG4gICAgdGhpcy5pMThuQXJyYXkgPSB0aGlzLnRyYW5zbGF0b3IudHJhbnNsYXRlQXJyYXkuYmluZCh0aGlzLnRyYW5zbGF0b3IpXG5cbiAgICB0aGlzLnJlbmRlciA9IHRoaXMucmVuZGVyLmJpbmQodGhpcylcbiAgICB0aGlzLmhhbmRsZUlucHV0Q2hhbmdlID0gdGhpcy5oYW5kbGVJbnB1dENoYW5nZS5iaW5kKHRoaXMpXG4gICAgdGhpcy5oYW5kbGVDbGljayA9IHRoaXMuaGFuZGxlQ2xpY2suYmluZCh0aGlzKVxuICB9XG5cbiAgaGFuZGxlSW5wdXRDaGFuZ2UgKGV2KSB7XG4gICAgdGhpcy51cHB5LmxvZygnW0ZpbGVJbnB1dF0gU29tZXRoaW5nIHNlbGVjdGVkIHRocm91Z2ggaW5wdXQuLi4nKVxuXG4gICAgY29uc3QgZmlsZXMgPSB0b0FycmF5KGV2LnRhcmdldC5maWxlcylcblxuICAgIGZpbGVzLmZvckVhY2goKGZpbGUpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMudXBweS5hZGRGaWxlKHtcbiAgICAgICAgICBzb3VyY2U6IHRoaXMuaWQsXG4gICAgICAgICAgbmFtZTogZmlsZS5uYW1lLFxuICAgICAgICAgIHR5cGU6IGZpbGUudHlwZSxcbiAgICAgICAgICBkYXRhOiBmaWxlXG4gICAgICAgIH0pXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgLy8gTm90aGluZywgcmVzdHJpY3Rpb24gZXJyb3JzIGhhbmRsZWQgaW4gQ29yZVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBoYW5kbGVDbGljayAoZXYpIHtcbiAgICB0aGlzLmlucHV0LmNsaWNrKClcbiAgfVxuXG4gIHJlbmRlciAoc3RhdGUpIHtcbiAgICAvKiBodHRwOi8vdHltcGFudXMubmV0L2NvZHJvcHMvMjAxNS8wOS8xNS9zdHlsaW5nLWN1c3RvbWl6aW5nLWZpbGUtaW5wdXRzLXNtYXJ0LXdheS8gKi9cbiAgICBjb25zdCBoaWRkZW5JbnB1dFN0eWxlID0ge1xuICAgICAgd2lkdGg6ICcwLjFweCcsXG4gICAgICBoZWlnaHQ6ICcwLjFweCcsXG4gICAgICBvcGFjaXR5OiAwLFxuICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICB6SW5kZXg6IC0xXG4gICAgfVxuXG4gICAgY29uc3QgcmVzdHJpY3Rpb25zID0gdGhpcy51cHB5Lm9wdHMucmVzdHJpY3Rpb25zXG4gICAgY29uc3QgYWNjZXB0ID0gcmVzdHJpY3Rpb25zLmFsbG93ZWRGaWxlVHlwZXMgPyByZXN0cmljdGlvbnMuYWxsb3dlZEZpbGVUeXBlcy5qb2luKCcsJykgOiBudWxsXG5cbiAgICAvLyBlbXB0eSB2YWx1ZT1cIlwiIG9uIGZpbGUgaW5wdXQsIHNvIHRoYXQgdGhlIGlucHV0IGlzIGNsZWFyZWQgYWZ0ZXIgYSBmaWxlIGlzIHNlbGVjdGVkLFxuICAgIC8vIGJlY2F1c2UgVXBweSB3aWxsIGJlIGhhbmRsaW5nIHRoZSB1cGxvYWQgYW5kIHNvIHdlIGNhbiBzZWxlY3Qgc2FtZSBmaWxlXG4gICAgLy8gYWZ0ZXIgcmVtb3Zpbmcg4oCUIG90aGVyd2lzZSBicm93c2VyIHRoaW5rcyBpdOKAmXMgYWxyZWFkeSBzZWxlY3RlZFxuICAgIHJldHVybiA8ZGl2IGNsYXNzPVwidXBweS1Sb290IHVwcHktRmlsZUlucHV0LWNvbnRhaW5lclwiPlxuICAgICAgPGlucHV0IGNsYXNzPVwidXBweS1GaWxlSW5wdXQtaW5wdXRcIlxuICAgICAgICBzdHlsZT17dGhpcy5vcHRzLnByZXR0eSAmJiBoaWRkZW5JbnB1dFN0eWxlfVxuICAgICAgICB0eXBlPVwiZmlsZVwiXG4gICAgICAgIG5hbWU9e3RoaXMub3B0cy5pbnB1dE5hbWV9XG4gICAgICAgIG9uY2hhbmdlPXt0aGlzLmhhbmRsZUlucHV0Q2hhbmdlfVxuICAgICAgICBtdWx0aXBsZT17cmVzdHJpY3Rpb25zLm1heE51bWJlck9mRmlsZXMgIT09IDF9XG4gICAgICAgIGFjY2VwdD17YWNjZXB0fVxuICAgICAgICByZWY9eyhpbnB1dCkgPT4geyB0aGlzLmlucHV0ID0gaW5wdXQgfX1cbiAgICAgICAgdmFsdWU9XCJcIiAvPlxuICAgICAge3RoaXMub3B0cy5wcmV0dHkgJiZcbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cInVwcHktRmlsZUlucHV0LWJ0blwiIHR5cGU9XCJidXR0b25cIiBvbmNsaWNrPXt0aGlzLmhhbmRsZUNsaWNrfT5cbiAgICAgICAgICB7dGhpcy5pMThuKCdjaG9vc2VGaWxlcycpfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgIH1cbiAgICA8L2Rpdj5cbiAgfVxuXG4gIGluc3RhbGwgKCkge1xuICAgIGNvbnN0IHRhcmdldCA9IHRoaXMub3B0cy50YXJnZXRcbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICB0aGlzLm1vdW50KHRhcmdldCwgdGhpcylcbiAgICB9XG4gIH1cblxuICB1bmluc3RhbGwgKCkge1xuICAgIHRoaXMudW5tb3VudCgpXG4gIH1cbn1cbiIsImNvbnN0IHsgUGx1Z2luIH0gPSByZXF1aXJlKCdAdXBweS9jb3JlJylcbmNvbnN0IHsgaCB9ID0gcmVxdWlyZSgncHJlYWN0JylcblxuLyoqXG4gKiBQcm9ncmVzcyBiYXJcbiAqXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUHJvZ3Jlc3NCYXIgZXh0ZW5kcyBQbHVnaW4ge1xuICBjb25zdHJ1Y3RvciAodXBweSwgb3B0cykge1xuICAgIHN1cGVyKHVwcHksIG9wdHMpXG4gICAgdGhpcy5pZCA9IHRoaXMub3B0cy5pZCB8fCAnUHJvZ3Jlc3NCYXInXG4gICAgdGhpcy50aXRsZSA9ICdQcm9ncmVzcyBCYXInXG4gICAgdGhpcy50eXBlID0gJ3Byb2dyZXNzaW5kaWNhdG9yJ1xuXG4gICAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICAgIGNvbnN0IGRlZmF1bHRPcHRpb25zID0ge1xuICAgICAgdGFyZ2V0OiAnYm9keScsXG4gICAgICByZXBsYWNlVGFyZ2V0Q29udGVudDogZmFsc2UsXG4gICAgICBmaXhlZDogZmFsc2UsXG4gICAgICBoaWRlQWZ0ZXJGaW5pc2g6IHRydWVcbiAgICB9XG5cbiAgICAvLyBtZXJnZSBkZWZhdWx0IG9wdGlvbnMgd2l0aCB0aGUgb25lcyBzZXQgYnkgdXNlclxuICAgIHRoaXMub3B0cyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRPcHRpb25zLCBvcHRzKVxuXG4gICAgdGhpcy5yZW5kZXIgPSB0aGlzLnJlbmRlci5iaW5kKHRoaXMpXG4gIH1cblxuICByZW5kZXIgKHN0YXRlKSB7XG4gICAgY29uc3QgcHJvZ3Jlc3MgPSBzdGF0ZS50b3RhbFByb2dyZXNzIHx8IDBcbiAgICBjb25zdCBpc0hpZGRlbiA9IHByb2dyZXNzID09PSAxMDAgJiYgdGhpcy5vcHRzLmhpZGVBZnRlckZpbmlzaFxuICAgIHJldHVybiA8ZGl2IGNsYXNzPVwidXBweSB1cHB5LVByb2dyZXNzQmFyXCIgc3R5bGU9e3sgcG9zaXRpb246IHRoaXMub3B0cy5maXhlZCA/ICdmaXhlZCcgOiAnaW5pdGlhbCcgfX0gYXJpYS1oaWRkZW49e2lzSGlkZGVufT5cbiAgICAgIDxkaXYgY2xhc3M9XCJ1cHB5LVByb2dyZXNzQmFyLWlubmVyXCIgc3R5bGU9e3sgd2lkdGg6IHByb2dyZXNzICsgJyUnIH19IC8+XG4gICAgICA8ZGl2IGNsYXNzPVwidXBweS1Qcm9ncmVzc0Jhci1wZXJjZW50YWdlXCI+e3Byb2dyZXNzfTwvZGl2PlxuICAgIDwvZGl2PlxuICB9XG5cbiAgaW5zdGFsbCAoKSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gdGhpcy5vcHRzLnRhcmdldFxuICAgIGlmICh0YXJnZXQpIHtcbiAgICAgIHRoaXMubW91bnQodGFyZ2V0LCB0aGlzKVxuICAgIH1cbiAgfVxuXG4gIHVuaW5zdGFsbCAoKSB7XG4gICAgdGhpcy51bm1vdW50KClcbiAgfVxufVxuIiwiLyoqXG4gKiBEZWZhdWx0IHN0b3JlIHRoYXQga2VlcHMgc3RhdGUgaW4gYSBzaW1wbGUgb2JqZWN0LlxuICovXG5jbGFzcyBEZWZhdWx0U3RvcmUge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgdGhpcy5zdGF0ZSA9IHt9XG4gICAgdGhpcy5jYWxsYmFja3MgPSBbXVxuICB9XG5cbiAgZ2V0U3RhdGUgKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlXG4gIH1cblxuICBzZXRTdGF0ZSAocGF0Y2gpIHtcbiAgICBjb25zdCBwcmV2U3RhdGUgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnN0YXRlKVxuICAgIGNvbnN0IG5leHRTdGF0ZSA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuc3RhdGUsIHBhdGNoKVxuXG4gICAgdGhpcy5zdGF0ZSA9IG5leHRTdGF0ZVxuICAgIHRoaXMuX3B1Ymxpc2gocHJldlN0YXRlLCBuZXh0U3RhdGUsIHBhdGNoKVxuICB9XG5cbiAgc3Vic2NyaWJlIChsaXN0ZW5lcikge1xuICAgIHRoaXMuY2FsbGJhY2tzLnB1c2gobGlzdGVuZXIpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIC8vIFJlbW92ZSB0aGUgbGlzdGVuZXIuXG4gICAgICB0aGlzLmNhbGxiYWNrcy5zcGxpY2UoXG4gICAgICAgIHRoaXMuY2FsbGJhY2tzLmluZGV4T2YobGlzdGVuZXIpLFxuICAgICAgICAxXG4gICAgICApXG4gICAgfVxuICB9XG5cbiAgX3B1Ymxpc2ggKC4uLmFyZ3MpIHtcbiAgICB0aGlzLmNhbGxiYWNrcy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgbGlzdGVuZXIoLi4uYXJncylcbiAgICB9KVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVmYXVsdFN0b3JlICgpIHtcbiAgcmV0dXJuIG5ldyBEZWZhdWx0U3RvcmUoKVxufVxuIiwiLyoqXG4gKiBUcmFuc2xhdGVzIHN0cmluZ3Mgd2l0aCBpbnRlcnBvbGF0aW9uICYgcGx1cmFsaXphdGlvbiBzdXBwb3J0LlxuICogRXh0ZW5zaWJsZSB3aXRoIGN1c3RvbSBkaWN0aW9uYXJpZXMgYW5kIHBsdXJhbGl6YXRpb24gZnVuY3Rpb25zLlxuICpcbiAqIEJvcnJvd3MgaGVhdmlseSBmcm9tIGFuZCBpbnNwaXJlZCBieSBQb2x5Z2xvdCBodHRwczovL2dpdGh1Yi5jb20vYWlyYm5iL3BvbHlnbG90LmpzLFxuICogYmFzaWNhbGx5IGEgc3RyaXBwZWQtZG93biB2ZXJzaW9uIG9mIGl0LiBEaWZmZXJlbmNlczogcGx1cmFsaXphdGlvbiBmdW5jdGlvbnMgYXJlIG5vdCBoYXJkY29kZWRcbiAqIGFuZCBjYW4gYmUgZWFzaWx5IGFkZGVkIGFtb25nIHdpdGggZGljdGlvbmFyaWVzLCBuZXN0ZWQgb2JqZWN0cyBhcmUgdXNlZCBmb3IgcGx1cmFsaXphdGlvblxuICogYXMgb3Bwb3NlZCB0byBgfHx8fGAgZGVsaW1ldGVyXG4gKlxuICogVXNhZ2UgZXhhbXBsZTogYHRyYW5zbGF0b3IudHJhbnNsYXRlKCdmaWxlc19jaG9zZW4nLCB7c21hcnRfY291bnQ6IDN9KWBcbiAqXG4gKiBAcGFyYW0ge29iamVjdHxBcnJheTxvYmplY3Q+fSBsb2NhbGUgTG9jYWxlIG9yIGxpc3Qgb2YgbG9jYWxlcy5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBUcmFuc2xhdG9yIHtcbiAgY29uc3RydWN0b3IgKGxvY2FsZXMpIHtcbiAgICB0aGlzLmxvY2FsZSA9IHtcbiAgICAgIHN0cmluZ3M6IHt9LFxuICAgICAgcGx1cmFsaXplOiBmdW5jdGlvbiAobikge1xuICAgICAgICBpZiAobiA9PT0gMSkge1xuICAgICAgICAgIHJldHVybiAwXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDFcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShsb2NhbGVzKSkge1xuICAgICAgbG9jYWxlcy5mb3JFYWNoKChsb2NhbGUpID0+IHRoaXMuX2FwcGx5KGxvY2FsZSkpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2FwcGx5KGxvY2FsZXMpXG4gICAgfVxuICB9XG5cbiAgX2FwcGx5IChsb2NhbGUpIHtcbiAgICBpZiAoIWxvY2FsZSB8fCAhbG9jYWxlLnN0cmluZ3MpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IHByZXZMb2NhbGUgPSB0aGlzLmxvY2FsZVxuICAgIHRoaXMubG9jYWxlID0gT2JqZWN0LmFzc2lnbih7fSwgcHJldkxvY2FsZSwge1xuICAgICAgc3RyaW5nczogT2JqZWN0LmFzc2lnbih7fSwgcHJldkxvY2FsZS5zdHJpbmdzLCBsb2NhbGUuc3RyaW5ncylcbiAgICB9KVxuICAgIHRoaXMubG9jYWxlLnBsdXJhbGl6ZSA9IGxvY2FsZS5wbHVyYWxpemUgfHwgcHJldkxvY2FsZS5wbHVyYWxpemVcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlcyBhIHN0cmluZyB3aXRoIHBsYWNlaG9sZGVyIHZhcmlhYmxlcyBsaWtlIGAle3NtYXJ0X2NvdW50fSBmaWxlIHNlbGVjdGVkYFxuICAgKiBhbmQgcmVwbGFjZXMgaXQgd2l0aCB2YWx1ZXMgZnJvbSBvcHRpb25zIGB7c21hcnRfY291bnQ6IDV9YFxuICAgKlxuICAgKiBAbGljZW5zZSBodHRwczovL2dpdGh1Yi5jb20vYWlyYm5iL3BvbHlnbG90LmpzL2Jsb2IvbWFzdGVyL0xJQ0VOU0VcbiAgICogdGFrZW4gZnJvbSBodHRwczovL2dpdGh1Yi5jb20vYWlyYm5iL3BvbHlnbG90LmpzL2Jsb2IvbWFzdGVyL2xpYi9wb2x5Z2xvdC5qcyNMMjk5XG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwaHJhc2UgdGhhdCBuZWVkcyBpbnRlcnBvbGF0aW9uLCB3aXRoIHBsYWNlaG9sZGVyc1xuICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyB3aXRoIHZhbHVlcyB0aGF0IHdpbGwgYmUgdXNlZCB0byByZXBsYWNlIHBsYWNlaG9sZGVyc1xuICAgKiBAcmV0dXJuIHtzdHJpbmd9IGludGVycG9sYXRlZFxuICAgKi9cbiAgaW50ZXJwb2xhdGUgKHBocmFzZSwgb3B0aW9ucykge1xuICAgIGNvbnN0IHsgc3BsaXQsIHJlcGxhY2UgfSA9IFN0cmluZy5wcm90b3R5cGVcbiAgICBjb25zdCBkb2xsYXJSZWdleCA9IC9cXCQvZ1xuICAgIGNvbnN0IGRvbGxhckJpbGxzWWFsbCA9ICckJCQkJ1xuICAgIGxldCBpbnRlcnBvbGF0ZWQgPSBbcGhyYXNlXVxuXG4gICAgZm9yIChsZXQgYXJnIGluIG9wdGlvbnMpIHtcbiAgICAgIGlmIChhcmcgIT09ICdfJyAmJiBvcHRpb25zLmhhc093blByb3BlcnR5KGFyZykpIHtcbiAgICAgICAgLy8gRW5zdXJlIHJlcGxhY2VtZW50IHZhbHVlIGlzIGVzY2FwZWQgdG8gcHJldmVudCBzcGVjaWFsICQtcHJlZml4ZWRcbiAgICAgICAgLy8gcmVnZXggcmVwbGFjZSB0b2tlbnMuIHRoZSBcIiQkJCRcIiBpcyBuZWVkZWQgYmVjYXVzZSBlYWNoIFwiJFwiIG5lZWRzIHRvXG4gICAgICAgIC8vIGJlIGVzY2FwZWQgd2l0aCBcIiRcIiBpdHNlbGYsIGFuZCB3ZSBuZWVkIHR3byBpbiB0aGUgcmVzdWx0aW5nIG91dHB1dC5cbiAgICAgICAgdmFyIHJlcGxhY2VtZW50ID0gb3B0aW9uc1thcmddXG4gICAgICAgIGlmICh0eXBlb2YgcmVwbGFjZW1lbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgcmVwbGFjZW1lbnQgPSByZXBsYWNlLmNhbGwob3B0aW9uc1thcmddLCBkb2xsYXJSZWdleCwgZG9sbGFyQmlsbHNZYWxsKVxuICAgICAgICB9XG4gICAgICAgIC8vIFdlIGNyZWF0ZSBhIG5ldyBgUmVnRXhwYCBlYWNoIHRpbWUgaW5zdGVhZCBvZiB1c2luZyBhIG1vcmUtZWZmaWNpZW50XG4gICAgICAgIC8vIHN0cmluZyByZXBsYWNlIHNvIHRoYXQgdGhlIHNhbWUgYXJndW1lbnQgY2FuIGJlIHJlcGxhY2VkIG11bHRpcGxlIHRpbWVzXG4gICAgICAgIC8vIGluIHRoZSBzYW1lIHBocmFzZS5cbiAgICAgICAgaW50ZXJwb2xhdGVkID0gaW5zZXJ0UmVwbGFjZW1lbnQoaW50ZXJwb2xhdGVkLCBuZXcgUmVnRXhwKCclXFxcXHsnICsgYXJnICsgJ1xcXFx9JywgJ2cnKSwgcmVwbGFjZW1lbnQpXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGludGVycG9sYXRlZFxuXG4gICAgZnVuY3Rpb24gaW5zZXJ0UmVwbGFjZW1lbnQgKHNvdXJjZSwgcngsIHJlcGxhY2VtZW50KSB7XG4gICAgICBjb25zdCBuZXdQYXJ0cyA9IFtdXG4gICAgICBzb3VyY2UuZm9yRWFjaCgoY2h1bmspID0+IHtcbiAgICAgICAgc3BsaXQuY2FsbChjaHVuaywgcngpLmZvckVhY2goKHJhdywgaSwgbGlzdCkgPT4ge1xuICAgICAgICAgIGlmIChyYXcgIT09ICcnKSB7XG4gICAgICAgICAgICBuZXdQYXJ0cy5wdXNoKHJhdylcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBJbnRlcmxhY2Ugd2l0aCB0aGUgYHJlcGxhY2VtZW50YCB2YWx1ZVxuICAgICAgICAgIGlmIChpIDwgbGlzdC5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBuZXdQYXJ0cy5wdXNoKHJlcGxhY2VtZW50KVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgICByZXR1cm4gbmV3UGFydHNcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUHVibGljIHRyYW5zbGF0ZSBtZXRob2RcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyB3aXRoIHZhbHVlcyB0aGF0IHdpbGwgYmUgdXNlZCBsYXRlciB0byByZXBsYWNlIHBsYWNlaG9sZGVycyBpbiBzdHJpbmdcbiAgICogQHJldHVybiB7c3RyaW5nfSB0cmFuc2xhdGVkIChhbmQgaW50ZXJwb2xhdGVkKVxuICAgKi9cbiAgdHJhbnNsYXRlIChrZXksIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy50cmFuc2xhdGVBcnJheShrZXksIG9wdGlvbnMpLmpvaW4oJycpXG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgdHJhbnNsYXRpb24gYW5kIHJldHVybiB0aGUgdHJhbnNsYXRlZCBhbmQgaW50ZXJwb2xhdGVkIHBhcnRzIGFzIGFuIGFycmF5LlxuICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIHdpdGggdmFsdWVzIHRoYXQgd2lsbCBiZSB1c2VkIHRvIHJlcGxhY2UgcGxhY2Vob2xkZXJzXG4gICAqIEByZXR1cm4ge0FycmF5fSBUaGUgdHJhbnNsYXRlZCBhbmQgaW50ZXJwb2xhdGVkIHBhcnRzLCBpbiBvcmRlci5cbiAgICovXG4gIHRyYW5zbGF0ZUFycmF5IChrZXksIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy5zbWFydF9jb3VudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHZhciBwbHVyYWwgPSB0aGlzLmxvY2FsZS5wbHVyYWxpemUob3B0aW9ucy5zbWFydF9jb3VudClcbiAgICAgIHJldHVybiB0aGlzLmludGVycG9sYXRlKHRoaXMubG9jYWxlLnN0cmluZ3Nba2V5XVtwbHVyYWxdLCBvcHRpb25zKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmludGVycG9sYXRlKHRoaXMubG9jYWxlLnN0cmluZ3Nba2V5XSwgb3B0aW9ucylcbiAgfVxufVxuIiwiY29uc3QgdGhyb3R0bGUgPSByZXF1aXJlKCdsb2Rhc2gudGhyb3R0bGUnKVxuXG5mdW5jdGlvbiBfZW1pdFNvY2tldFByb2dyZXNzICh1cGxvYWRlciwgcHJvZ3Jlc3NEYXRhLCBmaWxlKSB7XG4gIGNvbnN0IHsgcHJvZ3Jlc3MsIGJ5dGVzVXBsb2FkZWQsIGJ5dGVzVG90YWwgfSA9IHByb2dyZXNzRGF0YVxuICBpZiAocHJvZ3Jlc3MpIHtcbiAgICB1cGxvYWRlci51cHB5LmxvZyhgVXBsb2FkIHByb2dyZXNzOiAke3Byb2dyZXNzfWApXG4gICAgdXBsb2FkZXIudXBweS5lbWl0KCd1cGxvYWQtcHJvZ3Jlc3MnLCBmaWxlLCB7XG4gICAgICB1cGxvYWRlcixcbiAgICAgIGJ5dGVzVXBsb2FkZWQ6IGJ5dGVzVXBsb2FkZWQsXG4gICAgICBieXRlc1RvdGFsOiBieXRlc1RvdGFsXG4gICAgfSlcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRocm90dGxlKF9lbWl0U29ja2V0UHJvZ3Jlc3MsIDMwMCwge2xlYWRpbmc6IHRydWUsIHRyYWlsaW5nOiB0cnVlfSlcbiIsImNvbnN0IGlzRE9NRWxlbWVudCA9IHJlcXVpcmUoJy4vaXNET01FbGVtZW50JylcblxuLyoqXG4gKiBGaW5kIGEgRE9NIGVsZW1lbnQuXG4gKlxuICogQHBhcmFtIHtOb2RlfHN0cmluZ30gZWxlbWVudFxuICogQHJldHVybiB7Tm9kZXxudWxsfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGZpbmRET01FbGVtZW50IChlbGVtZW50LCBjb250ZXh0ID0gZG9jdW1lbnQpIHtcbiAgaWYgKHR5cGVvZiBlbGVtZW50ID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBjb250ZXh0LnF1ZXJ5U2VsZWN0b3IoZWxlbWVudClcbiAgfVxuXG4gIGlmICh0eXBlb2YgZWxlbWVudCA9PT0gJ29iamVjdCcgJiYgaXNET01FbGVtZW50KGVsZW1lbnQpKSB7XG4gICAgcmV0dXJuIGVsZW1lbnRcbiAgfVxufVxuIiwiLyoqXG4gKiBUYWtlcyBhIGZpbGUgb2JqZWN0IGFuZCB0dXJucyBpdCBpbnRvIGZpbGVJRCwgYnkgY29udmVydGluZyBmaWxlLm5hbWUgdG8gbG93ZXJjYXNlLFxuICogcmVtb3ZpbmcgZXh0cmEgY2hhcmFjdGVycyBhbmQgYWRkaW5nIHR5cGUsIHNpemUgYW5kIGxhc3RNb2RpZmllZFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBmaWxlXG4gKiBAcmV0dXJuIHtTdHJpbmd9IHRoZSBmaWxlSURcbiAqXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2VuZXJhdGVGaWxlSUQgKGZpbGUpIHtcbiAgLy8gZmlsdGVyIGlzIG5lZWRlZCB0byBub3Qgam9pbiBlbXB0eSB2YWx1ZXMgd2l0aCBgLWBcbiAgcmV0dXJuIFtcbiAgICAndXBweScsXG4gICAgZmlsZS5uYW1lID8gZmlsZS5uYW1lLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvW15BLVowLTldL2lnLCAnJykgOiAnJyxcbiAgICBmaWxlLnR5cGUsXG4gICAgZmlsZS5kYXRhLnNpemUsXG4gICAgZmlsZS5kYXRhLmxhc3RNb2RpZmllZFxuICBdLmZpbHRlcih2YWwgPT4gdmFsKS5qb2luKCctJylcbn1cbiIsIi8qKlxuKiBUYWtlcyBhIGZ1bGwgZmlsZW5hbWUgc3RyaW5nIGFuZCByZXR1cm5zIGFuIG9iamVjdCB7bmFtZSwgZXh0ZW5zaW9ufVxuKlxuKiBAcGFyYW0ge3N0cmluZ30gZnVsbEZpbGVOYW1lXG4qIEByZXR1cm4ge29iamVjdH0ge25hbWUsIGV4dGVuc2lvbn1cbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdldEZpbGVOYW1lQW5kRXh0ZW5zaW9uIChmdWxsRmlsZU5hbWUpIHtcbiAgdmFyIHJlID0gLyg/OlxcLihbXi5dKykpPyQvXG4gIHZhciBmaWxlRXh0ID0gcmUuZXhlYyhmdWxsRmlsZU5hbWUpWzFdXG4gIHZhciBmaWxlTmFtZSA9IGZ1bGxGaWxlTmFtZS5yZXBsYWNlKCcuJyArIGZpbGVFeHQsICcnKVxuICByZXR1cm4ge1xuICAgIG5hbWU6IGZpbGVOYW1lLFxuICAgIGV4dGVuc2lvbjogZmlsZUV4dFxuICB9XG59XG4iLCJjb25zdCBnZXRGaWxlTmFtZUFuZEV4dGVuc2lvbiA9IHJlcXVpcmUoJy4vZ2V0RmlsZU5hbWVBbmRFeHRlbnNpb24nKVxuY29uc3QgbWltZVR5cGVzID0gcmVxdWlyZSgnLi9taW1lVHlwZXMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdldEZpbGVUeXBlIChmaWxlKSB7XG4gIGxldCBmaWxlRXh0ZW5zaW9uID0gZmlsZS5uYW1lID8gZ2V0RmlsZU5hbWVBbmRFeHRlbnNpb24oZmlsZS5uYW1lKS5leHRlbnNpb24gOiBudWxsXG4gIGZpbGVFeHRlbnNpb24gPSBmaWxlRXh0ZW5zaW9uID8gZmlsZUV4dGVuc2lvbi50b0xvd2VyQ2FzZSgpIDogbnVsbFxuXG4gIGlmIChmaWxlLmlzUmVtb3RlKSB7XG4gICAgLy8gc29tZSByZW1vdGUgcHJvdmlkZXJzIGRvIG5vdCBzdXBwb3J0IGZpbGUgdHlwZXNcbiAgICByZXR1cm4gZmlsZS50eXBlID8gZmlsZS50eXBlIDogbWltZVR5cGVzW2ZpbGVFeHRlbnNpb25dXG4gIH1cblxuICAvLyBjaGVjayBpZiBtaW1lIHR5cGUgaXMgc2V0IGluIHRoZSBmaWxlIG9iamVjdFxuICBpZiAoZmlsZS50eXBlKSB7XG4gICAgcmV0dXJuIGZpbGUudHlwZVxuICB9XG5cbiAgLy8gc2VlIGlmIHdlIGNhbiBtYXAgZXh0ZW5zaW9uIHRvIGEgbWltZSB0eXBlXG4gIGlmIChmaWxlRXh0ZW5zaW9uICYmIG1pbWVUeXBlc1tmaWxlRXh0ZW5zaW9uXSkge1xuICAgIHJldHVybiBtaW1lVHlwZXNbZmlsZUV4dGVuc2lvbl1cbiAgfVxuXG4gIC8vIGlmIGFsbCBmYWlscywgZmFsbCBiYWNrIHRvIGEgZ2VuZXJpYyBieXRlIHN0cmVhbSB0eXBlXG4gIHJldHVybiAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJ1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRTb2NrZXRIb3N0ICh1cmwpIHtcbiAgLy8gZ2V0IHRoZSBob3N0IGRvbWFpblxuICB2YXIgcmVnZXggPSAvXig/Omh0dHBzPzpcXC9cXC98XFwvXFwvKT8oPzpbXkBcXG5dK0ApPyg/Ond3d1xcLik/KFteXFxuXSspL2lcbiAgdmFyIGhvc3QgPSByZWdleC5leGVjKHVybClbMV1cbiAgdmFyIHNvY2tldFByb3RvY29sID0gL15odHRwOlxcL1xcLy9pLnRlc3QodXJsKSA/ICd3cycgOiAnd3NzJ1xuXG4gIHJldHVybiBgJHtzb2NrZXRQcm90b2NvbH06Ly8ke2hvc3R9YFxufVxuIiwiLyoqXG4gKiBSZXR1cm5zIGEgdGltZXN0YW1wIGluIHRoZSBmb3JtYXQgb2YgYGhvdXJzOm1pbnV0ZXM6c2Vjb25kc2BcbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdldFRpbWVTdGFtcCAoKSB7XG4gIHZhciBkYXRlID0gbmV3IERhdGUoKVxuICB2YXIgaG91cnMgPSBwYWQoZGF0ZS5nZXRIb3VycygpLnRvU3RyaW5nKCkpXG4gIHZhciBtaW51dGVzID0gcGFkKGRhdGUuZ2V0TWludXRlcygpLnRvU3RyaW5nKCkpXG4gIHZhciBzZWNvbmRzID0gcGFkKGRhdGUuZ2V0U2Vjb25kcygpLnRvU3RyaW5nKCkpXG4gIHJldHVybiBob3VycyArICc6JyArIG1pbnV0ZXMgKyAnOicgKyBzZWNvbmRzXG59XG5cbi8qKlxuICogQWRkcyB6ZXJvIHRvIHN0cmluZ3Mgc2hvcnRlciB0aGFuIHR3byBjaGFyYWN0ZXJzXG4qL1xuZnVuY3Rpb24gcGFkIChzdHIpIHtcbiAgcmV0dXJuIHN0ci5sZW5ndGggIT09IDIgPyAwICsgc3RyIDogc3RyXG59XG4iLCIvKipcbiAqIENoZWNrIGlmIGFuIG9iamVjdCBpcyBhIERPTSBlbGVtZW50LiBEdWNrLXR5cGluZyBiYXNlZCBvbiBgbm9kZVR5cGVgLlxuICpcbiAqIEBwYXJhbSB7Kn0gb2JqXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNET01FbGVtZW50IChvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiBvYmoubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFXG59XG4iLCIvKipcbiAqIExpbWl0IHRoZSBhbW91bnQgb2Ygc2ltdWx0YW5lb3VzbHkgcGVuZGluZyBQcm9taXNlcy5cbiAqIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIHBhc3NlZCBhIGZ1bmN0aW9uIGBmbmAsXG4gKiB3aWxsIG1ha2Ugc3VyZSB0aGF0IGF0IG1vc3QgYGxpbWl0YCBjYWxscyB0byBgZm5gIGFyZSBwZW5kaW5nLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBsaW1pdFxuICogQHJldHVybiB7ZnVuY3Rpb24oKX1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBsaW1pdFByb21pc2VzIChsaW1pdCkge1xuICBsZXQgcGVuZGluZyA9IDBcbiAgY29uc3QgcXVldWUgPSBbXVxuICByZXR1cm4gKGZuKSA9PiB7XG4gICAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgICBjb25zdCBjYWxsID0gKCkgPT4ge1xuICAgICAgICBwZW5kaW5nKytcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IGZuKC4uLmFyZ3MpXG4gICAgICAgIHByb21pc2UudGhlbihvbmZpbmlzaCwgb25maW5pc2gpXG4gICAgICAgIHJldHVybiBwcm9taXNlXG4gICAgICB9XG5cbiAgICAgIGlmIChwZW5kaW5nID49IGxpbWl0KSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgcXVldWUucHVzaCgoKSA9PiB7XG4gICAgICAgICAgICBjYWxsKCkudGhlbihyZXNvbHZlLCByZWplY3QpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBjYWxsKClcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gb25maW5pc2ggKCkge1xuICAgIHBlbmRpbmctLVxuICAgIGNvbnN0IG5leHQgPSBxdWV1ZS5zaGlmdCgpXG4gICAgaWYgKG5leHQpIG5leHQoKVxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgJ21kJzogJ3RleHQvbWFya2Rvd24nLFxuICAnbWFya2Rvd24nOiAndGV4dC9tYXJrZG93bicsXG4gICdtcDQnOiAndmlkZW8vbXA0JyxcbiAgJ21wMyc6ICdhdWRpby9tcDMnLFxuICAnc3ZnJzogJ2ltYWdlL3N2Zyt4bWwnLFxuICAnanBnJzogJ2ltYWdlL2pwZWcnLFxuICAncG5nJzogJ2ltYWdlL3BuZycsXG4gICdnaWYnOiAnaW1hZ2UvZ2lmJyxcbiAgJ3lhbWwnOiAndGV4dC95YW1sJyxcbiAgJ3ltbCc6ICd0ZXh0L3lhbWwnLFxuICAnY3N2JzogJ3RleHQvY3N2JyxcbiAgJ2F2aSc6ICd2aWRlby94LW1zdmlkZW8nLFxuICAnbWtzJzogJ3ZpZGVvL3gtbWF0cm9za2EnLFxuICAnbWt2JzogJ3ZpZGVvL3gtbWF0cm9za2EnLFxuICAnbW92JzogJ3ZpZGVvL3F1aWNrdGltZScsXG4gICdkb2MnOiAnYXBwbGljYXRpb24vbXN3b3JkJyxcbiAgJ2RvY20nOiAnYXBwbGljYXRpb24vdm5kLm1zLXdvcmQuZG9jdW1lbnQubWFjcm9lbmFibGVkLjEyJyxcbiAgJ2RvY3gnOiAnYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LndvcmRwcm9jZXNzaW5nbWwuZG9jdW1lbnQnLFxuICAnZG90JzogJ2FwcGxpY2F0aW9uL21zd29yZCcsXG4gICdkb3RtJzogJ2FwcGxpY2F0aW9uL3ZuZC5tcy13b3JkLnRlbXBsYXRlLm1hY3JvZW5hYmxlZC4xMicsXG4gICdkb3R4JzogJ2FwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC53b3JkcHJvY2Vzc2luZ21sLnRlbXBsYXRlJyxcbiAgJ3hsYSc6ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwnLFxuICAneGxhbSc6ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwuYWRkaW4ubWFjcm9lbmFibGVkLjEyJyxcbiAgJ3hsYyc6ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwnLFxuICAneGxmJzogJ2FwcGxpY2F0aW9uL3gteGxpZmYreG1sJyxcbiAgJ3hsbSc6ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwnLFxuICAneGxzJzogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbCcsXG4gICd4bHNiJzogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbC5zaGVldC5iaW5hcnkubWFjcm9lbmFibGVkLjEyJyxcbiAgJ3hsc20nOiAnYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsLnNoZWV0Lm1hY3JvZW5hYmxlZC4xMicsXG4gICd4bHN4JzogJ2FwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5zcHJlYWRzaGVldG1sLnNoZWV0JyxcbiAgJ3hsdCc6ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwnLFxuICAneGx0bSc6ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwudGVtcGxhdGUubWFjcm9lbmFibGVkLjEyJyxcbiAgJ3hsdHgnOiAnYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnNwcmVhZHNoZWV0bWwudGVtcGxhdGUnLFxuICAneGx3JzogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbCdcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc2V0dGxlIChwcm9taXNlcykge1xuICBjb25zdCByZXNvbHV0aW9ucyA9IFtdXG4gIGNvbnN0IHJlamVjdGlvbnMgPSBbXVxuICBmdW5jdGlvbiByZXNvbHZlZCAodmFsdWUpIHtcbiAgICByZXNvbHV0aW9ucy5wdXNoKHZhbHVlKVxuICB9XG4gIGZ1bmN0aW9uIHJlamVjdGVkIChlcnJvcikge1xuICAgIHJlamVjdGlvbnMucHVzaChlcnJvcilcbiAgfVxuXG4gIGNvbnN0IHdhaXQgPSBQcm9taXNlLmFsbChcbiAgICBwcm9taXNlcy5tYXAoKHByb21pc2UpID0+IHByb21pc2UudGhlbihyZXNvbHZlZCwgcmVqZWN0ZWQpKVxuICApXG5cbiAgcmV0dXJuIHdhaXQudGhlbigoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3NmdWw6IHJlc29sdXRpb25zLFxuICAgICAgZmFpbGVkOiByZWplY3Rpb25zXG4gICAgfVxuICB9KVxufVxuIiwiLyoqXG4gKiBDb252ZXJ0cyBsaXN0IGludG8gYXJyYXlcbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRvQXJyYXkgKGxpc3QpIHtcbiAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGxpc3QgfHwgW10sIDApXG59XG4iLCJjb25zdCB7IFBsdWdpbiB9ID0gcmVxdWlyZSgnQHVwcHkvY29yZScpXG5jb25zdCBjdWlkID0gcmVxdWlyZSgnY3VpZCcpXG5jb25zdCBUcmFuc2xhdG9yID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL1RyYW5zbGF0b3InKVxuY29uc3QgeyBQcm92aWRlciwgUmVxdWVzdENsaWVudCwgU29ja2V0IH0gPSByZXF1aXJlKCdAdXBweS9jb21wYW5pb24tY2xpZW50JylcbmNvbnN0IGVtaXRTb2NrZXRQcm9ncmVzcyA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9lbWl0U29ja2V0UHJvZ3Jlc3MnKVxuY29uc3QgZ2V0U29ja2V0SG9zdCA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9nZXRTb2NrZXRIb3N0JylcbmNvbnN0IHNldHRsZSA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9zZXR0bGUnKVxuY29uc3QgbGltaXRQcm9taXNlcyA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9saW1pdFByb21pc2VzJylcblxuZnVuY3Rpb24gYnVpbGRSZXNwb25zZUVycm9yICh4aHIsIGVycm9yKSB7XG4gIC8vIE5vIGVycm9yIG1lc3NhZ2VcbiAgaWYgKCFlcnJvcikgZXJyb3IgPSBuZXcgRXJyb3IoJ1VwbG9hZCBlcnJvcicpXG4gIC8vIEdvdCBhbiBlcnJvciBtZXNzYWdlIHN0cmluZ1xuICBpZiAodHlwZW9mIGVycm9yID09PSAnc3RyaW5nJykgZXJyb3IgPSBuZXcgRXJyb3IoZXJyb3IpXG4gIC8vIEdvdCBzb21ldGhpbmcgZWxzZVxuICBpZiAoIShlcnJvciBpbnN0YW5jZW9mIEVycm9yKSkge1xuICAgIGVycm9yID0gT2JqZWN0LmFzc2lnbihuZXcgRXJyb3IoJ1VwbG9hZCBlcnJvcicpLCB7IGRhdGE6IGVycm9yIH0pXG4gIH1cblxuICBlcnJvci5yZXF1ZXN0ID0geGhyXG4gIHJldHVybiBlcnJvclxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFhIUlVwbG9hZCBleHRlbmRzIFBsdWdpbiB7XG4gIGNvbnN0cnVjdG9yICh1cHB5LCBvcHRzKSB7XG4gICAgc3VwZXIodXBweSwgb3B0cylcbiAgICB0aGlzLnR5cGUgPSAndXBsb2FkZXInXG4gICAgdGhpcy5pZCA9ICdYSFJVcGxvYWQnXG4gICAgdGhpcy50aXRsZSA9ICdYSFJVcGxvYWQnXG5cbiAgICBjb25zdCBkZWZhdWx0TG9jYWxlID0ge1xuICAgICAgc3RyaW5nczoge1xuICAgICAgICB0aW1lZE91dDogJ1VwbG9hZCBzdGFsbGVkIGZvciAle3NlY29uZHN9IHNlY29uZHMsIGFib3J0aW5nLidcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBEZWZhdWx0IG9wdGlvbnNcbiAgICBjb25zdCBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICAgIGZvcm1EYXRhOiB0cnVlLFxuICAgICAgZmllbGROYW1lOiAnZmlsZXNbXScsXG4gICAgICBtZXRob2Q6ICdwb3N0JyxcbiAgICAgIG1ldGFGaWVsZHM6IG51bGwsXG4gICAgICByZXNwb25zZVVybEZpZWxkTmFtZTogJ3VybCcsXG4gICAgICBidW5kbGU6IGZhbHNlLFxuICAgICAgaGVhZGVyczoge30sXG4gICAgICBsb2NhbGU6IGRlZmF1bHRMb2NhbGUsXG4gICAgICB0aW1lb3V0OiAzMCAqIDEwMDAsXG4gICAgICBsaW1pdDogMCxcbiAgICAgIHdpdGhDcmVkZW50aWFsczogZmFsc2UsXG4gICAgICByZXNwb25zZVR5cGU6ICcnLFxuICAgICAgLyoqXG4gICAgICAgKiBAdHlwZWRlZiByZXNwT2JqXG4gICAgICAgKiBAcHJvcGVydHkge3N0cmluZ30gcmVzcG9uc2VUZXh0XG4gICAgICAgKiBAcHJvcGVydHkge251bWJlcn0gc3RhdHVzXG4gICAgICAgKiBAcHJvcGVydHkge3N0cmluZ30gc3RhdHVzVGV4dFxuICAgICAgICogQHByb3BlcnR5IHtPYmplY3QuPHN0cmluZywgc3RyaW5nPn0gaGVhZGVyc1xuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSByZXNwb25zZVRleHQgdGhlIHJlc3BvbnNlIGJvZHkgc3RyaW5nXG4gICAgICAgKiBAcGFyYW0ge1hNTEh0dHBSZXF1ZXN0IHwgcmVzcE9ian0gcmVzcG9uc2UgdGhlIHJlc3BvbnNlIG9iamVjdCAoWEhSIG9yIHNpbWlsYXIpXG4gICAgICAgKi9cbiAgICAgIGdldFJlc3BvbnNlRGF0YSAocmVzcG9uc2VUZXh0LCByZXNwb25zZSkge1xuICAgICAgICBsZXQgcGFyc2VkUmVzcG9uc2UgPSB7fVxuICAgICAgICB0cnkge1xuICAgICAgICAgIHBhcnNlZFJlc3BvbnNlID0gSlNPTi5wYXJzZShyZXNwb25zZVRleHQpXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycilcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJzZWRSZXNwb25zZVxuICAgICAgfSxcbiAgICAgIC8qKlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSByZXNwb25zZVRleHQgdGhlIHJlc3BvbnNlIGJvZHkgc3RyaW5nXG4gICAgICAgKiBAcGFyYW0ge1hNTEh0dHBSZXF1ZXN0IHwgcmVzcE9ian0gcmVzcG9uc2UgdGhlIHJlc3BvbnNlIG9iamVjdCAoWEhSIG9yIHNpbWlsYXIpXG4gICAgICAgKi9cbiAgICAgIGdldFJlc3BvbnNlRXJyb3IgKHJlc3BvbnNlVGV4dCwgcmVzcG9uc2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBFcnJvcignVXBsb2FkIGVycm9yJylcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBNZXJnZSBkZWZhdWx0IG9wdGlvbnMgd2l0aCB0aGUgb25lcyBzZXQgYnkgdXNlclxuICAgIHRoaXMub3B0cyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRPcHRpb25zLCBvcHRzKVxuXG4gICAgLy8gaTE4blxuICAgIHRoaXMudHJhbnNsYXRvciA9IG5ldyBUcmFuc2xhdG9yKFsgZGVmYXVsdExvY2FsZSwgdGhpcy51cHB5LmxvY2FsZSwgdGhpcy5vcHRzLmxvY2FsZSBdKVxuICAgIHRoaXMuaTE4biA9IHRoaXMudHJhbnNsYXRvci50cmFuc2xhdGUuYmluZCh0aGlzLnRyYW5zbGF0b3IpXG4gICAgdGhpcy5pMThuQXJyYXkgPSB0aGlzLnRyYW5zbGF0b3IudHJhbnNsYXRlQXJyYXkuYmluZCh0aGlzLnRyYW5zbGF0b3IpXG5cbiAgICB0aGlzLmhhbmRsZVVwbG9hZCA9IHRoaXMuaGFuZGxlVXBsb2FkLmJpbmQodGhpcylcblxuICAgIC8vIFNpbXVsdGFuZW91cyB1cGxvYWQgbGltaXRpbmcgaXMgc2hhcmVkIGFjcm9zcyBhbGwgdXBsb2FkcyB3aXRoIHRoaXMgcGx1Z2luLlxuICAgIGlmICh0eXBlb2YgdGhpcy5vcHRzLmxpbWl0ID09PSAnbnVtYmVyJyAmJiB0aGlzLm9wdHMubGltaXQgIT09IDApIHtcbiAgICAgIHRoaXMubGltaXRVcGxvYWRzID0gbGltaXRQcm9taXNlcyh0aGlzLm9wdHMubGltaXQpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubGltaXRVcGxvYWRzID0gKGZuKSA9PiBmblxuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdHMuYnVuZGxlICYmICF0aGlzLm9wdHMuZm9ybURhdGEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignYG9wdHMuZm9ybURhdGFgIG11c3QgYmUgdHJ1ZSB3aGVuIGBvcHRzLmJ1bmRsZWAgaXMgZW5hYmxlZC4nKVxuICAgIH1cbiAgfVxuXG4gIGdldE9wdGlvbnMgKGZpbGUpIHtcbiAgICBjb25zdCBvdmVycmlkZXMgPSB0aGlzLnVwcHkuZ2V0U3RhdGUoKS54aHJVcGxvYWRcbiAgICBjb25zdCBvcHRzID0gT2JqZWN0LmFzc2lnbih7fSxcbiAgICAgIHRoaXMub3B0cyxcbiAgICAgIG92ZXJyaWRlcyB8fCB7fSxcbiAgICAgIGZpbGUueGhyVXBsb2FkIHx8IHt9XG4gICAgKVxuICAgIG9wdHMuaGVhZGVycyA9IHt9XG4gICAgT2JqZWN0LmFzc2lnbihvcHRzLmhlYWRlcnMsIHRoaXMub3B0cy5oZWFkZXJzKVxuICAgIGlmIChvdmVycmlkZXMpIHtcbiAgICAgIE9iamVjdC5hc3NpZ24ob3B0cy5oZWFkZXJzLCBvdmVycmlkZXMuaGVhZGVycylcbiAgICB9XG4gICAgaWYgKGZpbGUueGhyVXBsb2FkKSB7XG4gICAgICBPYmplY3QuYXNzaWduKG9wdHMuaGVhZGVycywgZmlsZS54aHJVcGxvYWQuaGVhZGVycylcbiAgICB9XG5cbiAgICByZXR1cm4gb3B0c1xuICB9XG5cbiAgLy8gSGVscGVyIHRvIGFib3J0IHVwbG9hZCByZXF1ZXN0cyBpZiB0aGVyZSBoYXMgbm90IGJlZW4gYW55IHByb2dyZXNzIGZvciBgdGltZW91dGAgbXMuXG4gIC8vIENyZWF0ZSBhbiBpbnN0YW5jZSB1c2luZyBgdGltZXIgPSBjcmVhdGVQcm9ncmVzc1RpbWVvdXQoMTAwMDAsIG9uVGltZW91dClgXG4gIC8vIENhbGwgYHRpbWVyLnByb2dyZXNzKClgIHRvIHNpZ25hbCB0aGF0IHRoZXJlIGhhcyBiZWVuIHByb2dyZXNzIG9mIGFueSBraW5kLlxuICAvLyBDYWxsIGB0aW1lci5kb25lKClgIHdoZW4gdGhlIHVwbG9hZCBoYXMgY29tcGxldGVkLlxuICBjcmVhdGVQcm9ncmVzc1RpbWVvdXQgKHRpbWVvdXQsIHRpbWVvdXRIYW5kbGVyKSB7XG4gICAgY29uc3QgdXBweSA9IHRoaXMudXBweVxuICAgIGNvbnN0IHNlbGYgPSB0aGlzXG4gICAgbGV0IGlzRG9uZSA9IGZhbHNlXG5cbiAgICBmdW5jdGlvbiBvblRpbWVkT3V0ICgpIHtcbiAgICAgIHVwcHkubG9nKGBbWEhSVXBsb2FkXSB0aW1lZCBvdXRgKVxuICAgICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3Ioc2VsZi5pMThuKCd0aW1lZE91dCcsIHsgc2Vjb25kczogTWF0aC5jZWlsKHRpbWVvdXQgLyAxMDAwKSB9KSlcbiAgICAgIHRpbWVvdXRIYW5kbGVyKGVycm9yKVxuICAgIH1cblxuICAgIGxldCBhbGl2ZVRpbWVyID0gbnVsbFxuICAgIGZ1bmN0aW9uIHByb2dyZXNzICgpIHtcbiAgICAgIC8vIFNvbWUgYnJvd3NlcnMgZmlyZSBhbm90aGVyIHByb2dyZXNzIGV2ZW50IHdoZW4gdGhlIHVwbG9hZCBpc1xuICAgICAgLy8gY2FuY2VsbGVkLCBzbyB3ZSBoYXZlIHRvIGlnbm9yZSBwcm9ncmVzcyBhZnRlciB0aGUgdGltZXIgd2FzXG4gICAgICAvLyB0b2xkIHRvIHN0b3AuXG4gICAgICBpZiAoaXNEb25lKSByZXR1cm5cblxuICAgICAgaWYgKHRpbWVvdXQgPiAwKSB7XG4gICAgICAgIGlmIChhbGl2ZVRpbWVyKSBjbGVhclRpbWVvdXQoYWxpdmVUaW1lcilcbiAgICAgICAgYWxpdmVUaW1lciA9IHNldFRpbWVvdXQob25UaW1lZE91dCwgdGltZW91dClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkb25lICgpIHtcbiAgICAgIHVwcHkubG9nKGBbWEhSVXBsb2FkXSB0aW1lciBkb25lYClcbiAgICAgIGlmIChhbGl2ZVRpbWVyKSB7XG4gICAgICAgIGNsZWFyVGltZW91dChhbGl2ZVRpbWVyKVxuICAgICAgICBhbGl2ZVRpbWVyID0gbnVsbFxuICAgICAgfVxuICAgICAgaXNEb25lID0gdHJ1ZVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBwcm9ncmVzcyxcbiAgICAgIGRvbmVcbiAgICB9XG4gIH1cblxuICBjcmVhdGVGb3JtRGF0YVVwbG9hZCAoZmlsZSwgb3B0cykge1xuICAgIGNvbnN0IGZvcm1Qb3N0ID0gbmV3IEZvcm1EYXRhKClcblxuICAgIGNvbnN0IG1ldGFGaWVsZHMgPSBBcnJheS5pc0FycmF5KG9wdHMubWV0YUZpZWxkcylcbiAgICAgID8gb3B0cy5tZXRhRmllbGRzXG4gICAgICAvLyBTZW5kIGFsb25nIGFsbCBmaWVsZHMgYnkgZGVmYXVsdC5cbiAgICAgIDogT2JqZWN0LmtleXMoZmlsZS5tZXRhKVxuICAgIG1ldGFGaWVsZHMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgZm9ybVBvc3QuYXBwZW5kKGl0ZW0sIGZpbGUubWV0YVtpdGVtXSlcbiAgICB9KVxuXG4gICAgaWYgKGZpbGUubmFtZSkge1xuICAgICAgZm9ybVBvc3QuYXBwZW5kKG9wdHMuZmllbGROYW1lLCBmaWxlLmRhdGEsIGZpbGUubmFtZSlcbiAgICB9IGVsc2Uge1xuICAgICAgZm9ybVBvc3QuYXBwZW5kKG9wdHMuZmllbGROYW1lLCBmaWxlLmRhdGEpXG4gICAgfVxuXG4gICAgcmV0dXJuIGZvcm1Qb3N0XG4gIH1cblxuICBjcmVhdGVCYXJlVXBsb2FkIChmaWxlLCBvcHRzKSB7XG4gICAgcmV0dXJuIGZpbGUuZGF0YVxuICB9XG5cbiAgdXBsb2FkIChmaWxlLCBjdXJyZW50LCB0b3RhbCkge1xuICAgIGNvbnN0IG9wdHMgPSB0aGlzLmdldE9wdGlvbnMoZmlsZSlcblxuICAgIHRoaXMudXBweS5sb2coYHVwbG9hZGluZyAke2N1cnJlbnR9IG9mICR7dG90YWx9YClcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgZGF0YSA9IG9wdHMuZm9ybURhdGFcbiAgICAgICAgPyB0aGlzLmNyZWF0ZUZvcm1EYXRhVXBsb2FkKGZpbGUsIG9wdHMpXG4gICAgICAgIDogdGhpcy5jcmVhdGVCYXJlVXBsb2FkKGZpbGUsIG9wdHMpXG5cbiAgICAgIGNvbnN0IHRpbWVyID0gdGhpcy5jcmVhdGVQcm9ncmVzc1RpbWVvdXQob3B0cy50aW1lb3V0LCAoZXJyb3IpID0+IHtcbiAgICAgICAgeGhyLmFib3J0KClcbiAgICAgICAgdGhpcy51cHB5LmVtaXQoJ3VwbG9hZC1lcnJvcicsIGZpbGUsIGVycm9yKVxuICAgICAgICByZWplY3QoZXJyb3IpXG4gICAgICB9KVxuXG4gICAgICBjb25zdCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXG4gICAgICBjb25zdCBpZCA9IGN1aWQoKVxuXG4gICAgICB4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWRzdGFydCcsIChldikgPT4ge1xuICAgICAgICB0aGlzLnVwcHkubG9nKGBbWEhSVXBsb2FkXSAke2lkfSBzdGFydGVkYClcbiAgICAgIH0pXG5cbiAgICAgIHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCAoZXYpID0+IHtcbiAgICAgICAgdGhpcy51cHB5LmxvZyhgW1hIUlVwbG9hZF0gJHtpZH0gcHJvZ3Jlc3M6ICR7ZXYubG9hZGVkfSAvICR7ZXYudG90YWx9YClcbiAgICAgICAgLy8gQmVnaW4gY2hlY2tpbmcgZm9yIHRpbWVvdXRzIHdoZW4gcHJvZ3Jlc3Mgc3RhcnRzLCBpbnN0ZWFkIG9mIGxvYWRpbmcsXG4gICAgICAgIC8vIHRvIGF2b2lkIHRpbWluZyBvdXQgcmVxdWVzdHMgb24gYnJvd3NlciBjb25jdXJyZW5jeSBxdWV1ZVxuICAgICAgICB0aW1lci5wcm9ncmVzcygpXG5cbiAgICAgICAgaWYgKGV2Lmxlbmd0aENvbXB1dGFibGUpIHtcbiAgICAgICAgICB0aGlzLnVwcHkuZW1pdCgndXBsb2FkLXByb2dyZXNzJywgZmlsZSwge1xuICAgICAgICAgICAgdXBsb2FkZXI6IHRoaXMsXG4gICAgICAgICAgICBieXRlc1VwbG9hZGVkOiBldi5sb2FkZWQsXG4gICAgICAgICAgICBieXRlc1RvdGFsOiBldi50b3RhbFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKGV2KSA9PiB7XG4gICAgICAgIHRoaXMudXBweS5sb2coYFtYSFJVcGxvYWRdICR7aWR9IGZpbmlzaGVkYClcbiAgICAgICAgdGltZXIuZG9uZSgpXG5cbiAgICAgICAgaWYgKGV2LnRhcmdldC5zdGF0dXMgPj0gMjAwICYmIGV2LnRhcmdldC5zdGF0dXMgPCAzMDApIHtcbiAgICAgICAgICBjb25zdCBib2R5ID0gb3B0cy5nZXRSZXNwb25zZURhdGEoeGhyLnJlc3BvbnNlVGV4dCwgeGhyKVxuICAgICAgICAgIGNvbnN0IHVwbG9hZFVSTCA9IGJvZHlbb3B0cy5yZXNwb25zZVVybEZpZWxkTmFtZV1cblxuICAgICAgICAgIGNvbnN0IHVwbG9hZFJlc3AgPSB7XG4gICAgICAgICAgICBzdGF0dXM6IGV2LnRhcmdldC5zdGF0dXMsXG4gICAgICAgICAgICBib2R5LFxuICAgICAgICAgICAgdXBsb2FkVVJMXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy51cHB5LmVtaXQoJ3VwbG9hZC1zdWNjZXNzJywgZmlsZSwgdXBsb2FkUmVzcClcblxuICAgICAgICAgIGlmICh1cGxvYWRVUkwpIHtcbiAgICAgICAgICAgIHRoaXMudXBweS5sb2coYERvd25sb2FkICR7ZmlsZS5uYW1lfSBmcm9tICR7ZmlsZS51cGxvYWRVUkx9YClcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZShmaWxlKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IGJvZHkgPSBvcHRzLmdldFJlc3BvbnNlRGF0YSh4aHIucmVzcG9uc2VUZXh0LCB4aHIpXG4gICAgICAgICAgY29uc3QgZXJyb3IgPSBidWlsZFJlc3BvbnNlRXJyb3IoeGhyLCBvcHRzLmdldFJlc3BvbnNlRXJyb3IoeGhyLnJlc3BvbnNlVGV4dCwgeGhyKSlcblxuICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0ge1xuICAgICAgICAgICAgc3RhdHVzOiBldi50YXJnZXQuc3RhdHVzLFxuICAgICAgICAgICAgYm9keVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMudXBweS5lbWl0KCd1cGxvYWQtZXJyb3InLCBmaWxlLCBlcnJvciwgcmVzcG9uc2UpXG4gICAgICAgICAgcmV0dXJuIHJlamVjdChlcnJvcilcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgKGV2KSA9PiB7XG4gICAgICAgIHRoaXMudXBweS5sb2coYFtYSFJVcGxvYWRdICR7aWR9IGVycm9yZWRgKVxuICAgICAgICB0aW1lci5kb25lKClcblxuICAgICAgICBjb25zdCBlcnJvciA9IGJ1aWxkUmVzcG9uc2VFcnJvcih4aHIsIG9wdHMuZ2V0UmVzcG9uc2VFcnJvcih4aHIucmVzcG9uc2VUZXh0LCB4aHIpKVxuICAgICAgICB0aGlzLnVwcHkuZW1pdCgndXBsb2FkLWVycm9yJywgZmlsZSwgZXJyb3IpXG4gICAgICAgIHJldHVybiByZWplY3QoZXJyb3IpXG4gICAgICB9KVxuXG4gICAgICB4aHIub3BlbihvcHRzLm1ldGhvZC50b1VwcGVyQ2FzZSgpLCBvcHRzLmVuZHBvaW50LCB0cnVlKVxuICAgICAgLy8gSUUxMCBkb2VzIG5vdCBhbGxvdyBzZXR0aW5nIGB3aXRoQ3JlZGVudGlhbHNgIGFuZCBgcmVzcG9uc2VUeXBlYFxuICAgICAgLy8gYmVmb3JlIGBvcGVuKClgIGlzIGNhbGxlZC5cbiAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSBvcHRzLndpdGhDcmVkZW50aWFsc1xuICAgICAgaWYgKG9wdHMucmVzcG9uc2VUeXBlICE9PSAnJykge1xuICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gb3B0cy5yZXNwb25zZVR5cGVcbiAgICAgIH1cblxuICAgICAgT2JqZWN0LmtleXMob3B0cy5oZWFkZXJzKS5mb3JFYWNoKChoZWFkZXIpID0+IHtcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoaGVhZGVyLCBvcHRzLmhlYWRlcnNbaGVhZGVyXSlcbiAgICAgIH0pXG5cbiAgICAgIHhoci5zZW5kKGRhdGEpXG5cbiAgICAgIHRoaXMudXBweS5vbignZmlsZS1yZW1vdmVkJywgKHJlbW92ZWRGaWxlKSA9PiB7XG4gICAgICAgIGlmIChyZW1vdmVkRmlsZS5pZCA9PT0gZmlsZS5pZCkge1xuICAgICAgICAgIHRpbWVyLmRvbmUoKVxuICAgICAgICAgIHhoci5hYm9ydCgpXG4gICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignRmlsZSByZW1vdmVkJykpXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIHRoaXMudXBweS5vbignY2FuY2VsLWFsbCcsICgpID0+IHtcbiAgICAgICAgdGltZXIuZG9uZSgpXG4gICAgICAgIHhoci5hYm9ydCgpXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1VwbG9hZCBjYW5jZWxsZWQnKSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIHVwbG9hZFJlbW90ZSAoZmlsZSwgY3VycmVudCwgdG90YWwpIHtcbiAgICBjb25zdCBvcHRzID0gdGhpcy5nZXRPcHRpb25zKGZpbGUpXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IGZpZWxkcyA9IHt9XG4gICAgICBjb25zdCBtZXRhRmllbGRzID0gQXJyYXkuaXNBcnJheShvcHRzLm1ldGFGaWVsZHMpXG4gICAgICAgID8gb3B0cy5tZXRhRmllbGRzXG4gICAgICAgIC8vIFNlbmQgYWxvbmcgYWxsIGZpZWxkcyBieSBkZWZhdWx0LlxuICAgICAgICA6IE9iamVjdC5rZXlzKGZpbGUubWV0YSlcblxuICAgICAgbWV0YUZpZWxkcy5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICAgIGZpZWxkc1tuYW1lXSA9IGZpbGUubWV0YVtuYW1lXVxuICAgICAgfSlcblxuICAgICAgY29uc3QgQ2xpZW50ID0gZmlsZS5yZW1vdGUucHJvdmlkZXJPcHRpb25zLnByb3ZpZGVyID8gUHJvdmlkZXIgOiBSZXF1ZXN0Q2xpZW50XG4gICAgICBjb25zdCBjbGllbnQgPSBuZXcgQ2xpZW50KHRoaXMudXBweSwgZmlsZS5yZW1vdGUucHJvdmlkZXJPcHRpb25zKVxuICAgICAgY2xpZW50LnBvc3QoXG4gICAgICAgIGZpbGUucmVtb3RlLnVybCxcbiAgICAgICAgT2JqZWN0LmFzc2lnbih7fSwgZmlsZS5yZW1vdGUuYm9keSwge1xuICAgICAgICAgIGVuZHBvaW50OiBvcHRzLmVuZHBvaW50LFxuICAgICAgICAgIHNpemU6IGZpbGUuZGF0YS5zaXplLFxuICAgICAgICAgIGZpZWxkbmFtZTogb3B0cy5maWVsZE5hbWUsXG4gICAgICAgICAgbWV0YWRhdGE6IGZpZWxkcyxcbiAgICAgICAgICBoZWFkZXJzOiBvcHRzLmhlYWRlcnNcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICAgIC50aGVuKChyZXMpID0+IHtcbiAgICAgICAgY29uc3QgdG9rZW4gPSByZXMudG9rZW5cbiAgICAgICAgY29uc3QgaG9zdCA9IGdldFNvY2tldEhvc3QoZmlsZS5yZW1vdGUuc2VydmVyVXJsKVxuICAgICAgICBjb25zdCBzb2NrZXQgPSBuZXcgU29ja2V0KHsgdGFyZ2V0OiBgJHtob3N0fS9hcGkvJHt0b2tlbn1gIH0pXG5cbiAgICAgICAgc29ja2V0Lm9uKCdwcm9ncmVzcycsIChwcm9ncmVzc0RhdGEpID0+IGVtaXRTb2NrZXRQcm9ncmVzcyh0aGlzLCBwcm9ncmVzc0RhdGEsIGZpbGUpKVxuXG4gICAgICAgIHNvY2tldC5vbignc3VjY2VzcycsIChkYXRhKSA9PiB7XG4gICAgICAgICAgY29uc3QgYm9keSA9IG9wdHMuZ2V0UmVzcG9uc2VEYXRhKGRhdGEucmVzcG9uc2UucmVzcG9uc2VUZXh0LCBkYXRhLnJlc3BvbnNlKVxuICAgICAgICAgIGNvbnN0IHVwbG9hZFVSTCA9IGJvZHlbb3B0cy5yZXNwb25zZVVybEZpZWxkTmFtZV1cblxuICAgICAgICAgIGNvbnN0IHVwbG9hZFJlc3AgPSB7XG4gICAgICAgICAgICBzdGF0dXM6IGRhdGEucmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgICAgICAgYm9keSxcbiAgICAgICAgICAgIHVwbG9hZFVSTFxuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMudXBweS5lbWl0KCd1cGxvYWQtc3VjY2VzcycsIGZpbGUsIHVwbG9hZFJlc3ApXG4gICAgICAgICAgc29ja2V0LmNsb3NlKClcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZSgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgc29ja2V0Lm9uKCdlcnJvcicsIChlcnJEYXRhKSA9PiB7XG4gICAgICAgICAgY29uc3QgcmVzcCA9IGVyckRhdGEucmVzcG9uc2VcbiAgICAgICAgICBjb25zdCBlcnJvciA9IHJlc3BcbiAgICAgICAgICAgID8gb3B0cy5nZXRSZXNwb25zZUVycm9yKHJlc3AucmVzcG9uc2VUZXh0LCByZXNwKVxuICAgICAgICAgICAgOiBPYmplY3QuYXNzaWduKG5ldyBFcnJvcihlcnJEYXRhLmVycm9yLm1lc3NhZ2UpLCB7IGNhdXNlOiBlcnJEYXRhLmVycm9yIH0pXG4gICAgICAgICAgdGhpcy51cHB5LmVtaXQoJ3VwbG9hZC1lcnJvcicsIGZpbGUsIGVycm9yKVxuICAgICAgICAgIHJlamVjdChlcnJvcilcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIHVwbG9hZEJ1bmRsZSAoZmlsZXMpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgZW5kcG9pbnQgPSB0aGlzLm9wdHMuZW5kcG9pbnRcbiAgICAgIGNvbnN0IG1ldGhvZCA9IHRoaXMub3B0cy5tZXRob2RcblxuICAgICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKVxuICAgICAgZmlsZXMuZm9yRWFjaCgoZmlsZSwgaSkgPT4ge1xuICAgICAgICBjb25zdCBvcHRzID0gdGhpcy5nZXRPcHRpb25zKGZpbGUpXG4gICAgICAgIGZvcm1EYXRhLmFwcGVuZChvcHRzLmZpZWxkTmFtZSwgZmlsZS5kYXRhKVxuICAgICAgfSlcblxuICAgICAgY29uc3QgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcblxuICAgICAgY29uc3QgdGltZXIgPSB0aGlzLmNyZWF0ZVByb2dyZXNzVGltZW91dCh0aGlzLm9wdHMudGltZW91dCwgKGVycm9yKSA9PiB7XG4gICAgICAgIHhoci5hYm9ydCgpXG4gICAgICAgIGVtaXRFcnJvcihlcnJvcilcbiAgICAgICAgcmVqZWN0KGVycm9yKVxuICAgICAgfSlcblxuICAgICAgY29uc3QgZW1pdEVycm9yID0gKGVycm9yKSA9PiB7XG4gICAgICAgIGZpbGVzLmZvckVhY2goKGZpbGUpID0+IHtcbiAgICAgICAgICB0aGlzLnVwcHkuZW1pdCgndXBsb2FkLWVycm9yJywgZmlsZSwgZXJyb3IpXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcignbG9hZHN0YXJ0JywgKGV2KSA9PiB7XG4gICAgICAgIHRoaXMudXBweS5sb2coJ1tYSFJVcGxvYWRdIHN0YXJ0ZWQgdXBsb2FkaW5nIGJ1bmRsZScpXG4gICAgICAgIHRpbWVyLnByb2dyZXNzKClcbiAgICAgIH0pXG5cbiAgICAgIHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCAoZXYpID0+IHtcbiAgICAgICAgdGltZXIucHJvZ3Jlc3MoKVxuXG4gICAgICAgIGlmICghZXYubGVuZ3RoQ29tcHV0YWJsZSkgcmV0dXJuXG5cbiAgICAgICAgZmlsZXMuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgICAgIHRoaXMudXBweS5lbWl0KCd1cGxvYWQtcHJvZ3Jlc3MnLCBmaWxlLCB7XG4gICAgICAgICAgICB1cGxvYWRlcjogdGhpcyxcbiAgICAgICAgICAgIGJ5dGVzVXBsb2FkZWQ6IGV2LmxvYWRlZCAvIGV2LnRvdGFsICogZmlsZS5zaXplLFxuICAgICAgICAgICAgYnl0ZXNUb3RhbDogZmlsZS5zaXplXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKGV2KSA9PiB7XG4gICAgICAgIHRpbWVyLmRvbmUoKVxuXG4gICAgICAgIGlmIChldi50YXJnZXQuc3RhdHVzID49IDIwMCAmJiBldi50YXJnZXQuc3RhdHVzIDwgMzAwKSB7XG4gICAgICAgICAgY29uc3QgYm9keSA9IHRoaXMub3B0cy5nZXRSZXNwb25zZURhdGEoeGhyLnJlc3BvbnNlVGV4dCwgeGhyKVxuICAgICAgICAgIGNvbnN0IHVwbG9hZFJlc3AgPSB7XG4gICAgICAgICAgICBzdGF0dXM6IGV2LnRhcmdldC5zdGF0dXMsXG4gICAgICAgICAgICBib2R5XG4gICAgICAgICAgfVxuICAgICAgICAgIGZpbGVzLmZvckVhY2goKGZpbGUpID0+IHtcbiAgICAgICAgICAgIHRoaXMudXBweS5lbWl0KCd1cGxvYWQtc3VjY2VzcycsIGZpbGUsIHVwbG9hZFJlc3ApXG4gICAgICAgICAgfSlcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZSgpXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBlcnJvciA9IHRoaXMub3B0cy5nZXRSZXNwb25zZUVycm9yKHhoci5yZXNwb25zZVRleHQsIHhocikgfHwgbmV3IEVycm9yKCdVcGxvYWQgZXJyb3InKVxuICAgICAgICBlcnJvci5yZXF1ZXN0ID0geGhyXG4gICAgICAgIGVtaXRFcnJvcihlcnJvcilcbiAgICAgICAgcmV0dXJuIHJlamVjdChlcnJvcilcbiAgICAgIH0pXG5cbiAgICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIChldikgPT4ge1xuICAgICAgICB0aW1lci5kb25lKClcblxuICAgICAgICBjb25zdCBlcnJvciA9IHRoaXMub3B0cy5nZXRSZXNwb25zZUVycm9yKHhoci5yZXNwb25zZVRleHQsIHhocikgfHwgbmV3IEVycm9yKCdVcGxvYWQgZXJyb3InKVxuICAgICAgICBlbWl0RXJyb3IoZXJyb3IpXG4gICAgICAgIHJldHVybiByZWplY3QoZXJyb3IpXG4gICAgICB9KVxuXG4gICAgICB0aGlzLnVwcHkub24oJ2NhbmNlbC1hbGwnLCAoKSA9PiB7XG4gICAgICAgIHRpbWVyLmRvbmUoKVxuICAgICAgICB4aHIuYWJvcnQoKVxuICAgICAgfSlcblxuICAgICAgeGhyLm9wZW4obWV0aG9kLnRvVXBwZXJDYXNlKCksIGVuZHBvaW50LCB0cnVlKVxuICAgICAgLy8gSUUxMCBkb2VzIG5vdCBhbGxvdyBzZXR0aW5nIGB3aXRoQ3JlZGVudGlhbHNgIGFuZCBgcmVzcG9uc2VUeXBlYFxuICAgICAgLy8gYmVmb3JlIGBvcGVuKClgIGlzIGNhbGxlZC5cbiAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0aGlzLm9wdHMud2l0aENyZWRlbnRpYWxzXG4gICAgICBpZiAodGhpcy5vcHRzLnJlc3BvbnNlVHlwZSAhPT0gJycpIHtcbiAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9IHRoaXMub3B0cy5yZXNwb25zZVR5cGVcbiAgICAgIH1cblxuICAgICAgT2JqZWN0LmtleXModGhpcy5vcHRzLmhlYWRlcnMpLmZvckVhY2goKGhlYWRlcikgPT4ge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihoZWFkZXIsIHRoaXMub3B0cy5oZWFkZXJzW2hlYWRlcl0pXG4gICAgICB9KVxuXG4gICAgICB4aHIuc2VuZChmb3JtRGF0YSlcblxuICAgICAgZmlsZXMuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgICB0aGlzLnVwcHkuZW1pdCgndXBsb2FkLXN0YXJ0ZWQnLCBmaWxlKVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgdXBsb2FkRmlsZXMgKGZpbGVzKSB7XG4gICAgY29uc3QgYWN0aW9ucyA9IGZpbGVzLm1hcCgoZmlsZSwgaSkgPT4ge1xuICAgICAgY29uc3QgY3VycmVudCA9IHBhcnNlSW50KGksIDEwKSArIDFcbiAgICAgIGNvbnN0IHRvdGFsID0gZmlsZXMubGVuZ3RoXG5cbiAgICAgIGlmIChmaWxlLmVycm9yKSB7XG4gICAgICAgIHJldHVybiAoKSA9PiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoZmlsZS5lcnJvcikpXG4gICAgICB9IGVsc2UgaWYgKGZpbGUuaXNSZW1vdGUpIHtcbiAgICAgICAgLy8gV2UgZW1pdCB1cGxvYWQtc3RhcnRlZCBoZXJlLCBzbyB0aGF0IGl0J3MgYWxzbyBlbWl0dGVkIGZvciBmaWxlc1xuICAgICAgICAvLyB0aGF0IGhhdmUgdG8gd2FpdCBkdWUgdG8gdGhlIGBsaW1pdGAgb3B0aW9uLlxuICAgICAgICB0aGlzLnVwcHkuZW1pdCgndXBsb2FkLXN0YXJ0ZWQnLCBmaWxlKVxuICAgICAgICByZXR1cm4gdGhpcy51cGxvYWRSZW1vdGUuYmluZCh0aGlzLCBmaWxlLCBjdXJyZW50LCB0b3RhbClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudXBweS5lbWl0KCd1cGxvYWQtc3RhcnRlZCcsIGZpbGUpXG4gICAgICAgIHJldHVybiB0aGlzLnVwbG9hZC5iaW5kKHRoaXMsIGZpbGUsIGN1cnJlbnQsIHRvdGFsKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBjb25zdCBwcm9taXNlcyA9IGFjdGlvbnMubWFwKChhY3Rpb24pID0+IHtcbiAgICAgIGNvbnN0IGxpbWl0ZWRBY3Rpb24gPSB0aGlzLmxpbWl0VXBsb2FkcyhhY3Rpb24pXG4gICAgICByZXR1cm4gbGltaXRlZEFjdGlvbigpXG4gICAgfSlcblxuICAgIHJldHVybiBzZXR0bGUocHJvbWlzZXMpXG4gIH1cblxuICBoYW5kbGVVcGxvYWQgKGZpbGVJRHMpIHtcbiAgICBpZiAoZmlsZUlEcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRoaXMudXBweS5sb2coJ1tYSFJVcGxvYWRdIE5vIGZpbGVzIHRvIHVwbG9hZCEnKVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgfVxuXG4gICAgdGhpcy51cHB5LmxvZygnW1hIUlVwbG9hZF0gVXBsb2FkaW5nLi4uJylcbiAgICBjb25zdCBmaWxlcyA9IGZpbGVJRHMubWFwKChmaWxlSUQpID0+IHRoaXMudXBweS5nZXRGaWxlKGZpbGVJRCkpXG5cbiAgICBpZiAodGhpcy5vcHRzLmJ1bmRsZSkge1xuICAgICAgcmV0dXJuIHRoaXMudXBsb2FkQnVuZGxlKGZpbGVzKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnVwbG9hZEZpbGVzKGZpbGVzKS50aGVuKCgpID0+IG51bGwpXG4gIH1cblxuICBpbnN0YWxsICgpIHtcbiAgICBpZiAodGhpcy5vcHRzLmJ1bmRsZSkge1xuICAgICAgdGhpcy51cHB5LnNldFN0YXRlKHtcbiAgICAgICAgY2FwYWJpbGl0aWVzOiBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnVwcHkuZ2V0U3RhdGUoKS5jYXBhYmlsaXRpZXMsIHtcbiAgICAgICAgICBidW5kbGVkOiB0cnVlXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH1cblxuICAgIHRoaXMudXBweS5hZGRVcGxvYWRlcih0aGlzLmhhbmRsZVVwbG9hZClcbiAgfVxuXG4gIHVuaW5zdGFsbCAoKSB7XG4gICAgaWYgKHRoaXMub3B0cy5idW5kbGUpIHtcbiAgICAgIHRoaXMudXBweS5zZXRTdGF0ZSh7XG4gICAgICAgIGNhcGFiaWxpdGllczogT2JqZWN0LmFzc2lnbih7fSwgdGhpcy51cHB5LmdldFN0YXRlKCkuY2FwYWJpbGl0aWVzLCB7XG4gICAgICAgICAgYnVuZGxlZDogdHJ1ZVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9XG5cbiAgICB0aGlzLnVwcHkucmVtb3ZlVXBsb2FkZXIodGhpcy5oYW5kbGVVcGxvYWQpXG4gIH1cbn1cbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJyZXF1aXJlKCdlczYtcHJvbWlzZS9hdXRvJylcbnJlcXVpcmUoJ3doYXR3Zy1mZXRjaCcpXG5jb25zdCBVcHB5ID0gcmVxdWlyZSgnQHVwcHkvY29yZScpXG5jb25zdCBGaWxlSW5wdXQgPSByZXF1aXJlKCdAdXBweS9maWxlLWlucHV0JylcbmNvbnN0IFhIUlVwbG9hZCA9IHJlcXVpcmUoJ0B1cHB5L3hoci11cGxvYWQnKVxuY29uc3QgUHJvZ3Jlc3NCYXIgPSByZXF1aXJlKCdAdXBweS9wcm9ncmVzcy1iYXInKVxuXG5jb25zdCB1cHB5ID0gbmV3IFVwcHkoeyBkZWJ1ZzogdHJ1ZSwgYXV0b1Byb2NlZWQ6IHRydWUgfSlcbnVwcHkudXNlKEZpbGVJbnB1dCwgeyB0YXJnZXQ6ICcuVXBweUZvcm0nLCByZXBsYWNlVGFyZ2V0Q29udGVudDogdHJ1ZSB9KVxudXBweS51c2UoWEhSVXBsb2FkLCB7XG4gIGVuZHBvaW50OiAnLy9hcGkyLnRyYW5zbG9hZGl0LmNvbScsXG4gIGZvcm1EYXRhOiB0cnVlLFxuICBmaWVsZE5hbWU6ICdmaWxlc1tdJ1xufSlcbnVwcHkudXNlKFByb2dyZXNzQmFyLCB7XG4gIHRhcmdldDogJ2JvZHknLFxuICBmaXhlZDogdHJ1ZSxcbiAgaGlkZUFmdGVyRmluaXNoOiBmYWxzZVxufSlcblxuY29uc29sZS5sb2coJ1VwcHkgd2l0aCBGb3JtdGFnIGFuZCBYSFJVcGxvYWQgaXMgbG9hZGVkJylcbiJdfQ==
