'use strict';

var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/utils/promises.ts
var proResolver = () => {
  let resolver, rejecter, resolved = false, started = false;
  const pro = new Promise((_resolve, _reject) => {
    resolver = _resolve;
    rejecter = _reject;
  });
  const resolve = (value) => {
    if (!resolved) {
      resolver(value);
      resolved = true;
    } else {
      console.trace("resolve called twice");
    }
  };
  const reject = (value) => {
    if (!resolved) {
      resolved = true;
      rejecter(value);
    } else {
      console.error("reject called twice");
    }
  };
  const start = () => started = true;
  const isStarted = () => started;
  return { pro, resolve, reject, start, isStarted };
};

// src/engine/worker/async_thread.ts
var ThreadWorker = class {
  constructor() {
    self.onmessage = (e) => this._onMessage(e.data);
    self.addEventListener("error", (e) => {
      console.log("worker error", e);
    });
    this.onCreate();
  }
  onCreate() {
  }
  _onMessage(e) {
    const { id, data } = e;
    this.onRequest(id, data);
  }
  // abstract
  onRequest(id, payload) {
  }
  _sendResponse(id, data, opts = {}) {
    const defaults = {
      transferables: [],
      error: void 0
    };
    const actual = Object.assign({}, defaults, opts);
    const error = actual.error;
    self.postMessage({
      id,
      result: { data, error }
      // @ts-ignore
    }, actual.transferables.length > 0 ? actual.transferables : void 0);
  }
  postEvent(eventName, payload) {
    self.postMessage({
      eventName,
      payload
    });
  }
  sendResponse(id, payload = void 0, transferables = []) {
    this._sendResponse(id, payload, { transferables });
  }
  sendError(id, error) {
    console.trace(error);
    console.error(`[worker] sendError(): id: ${id}, error: ${error.message}`);
    this._sendResponse(id, void 0, { error });
  }
};

// src/utils/gzip.ts
var compress = async (blob) => {
  if (typeof CompressionStream === "undefined") {
    import('zlib').then(
      async ({ gzipSync }) => {
        console.log(`Node environment, using gunzipSync`);
        const bytes = await blob.bytes();
        return gzipSync(bytes);
      }
    ).catch((e) => {
      console.error(e);
      throw new Error(`CompressionStream is not defined - and node zlib is not defined`);
    });
  }
  const stream = blob.stream();
  const compressedStream = stream.pipeThrough(
    new CompressionStream("gzip")
  );
  const ok = new Response(compressedStream);
  return new Uint8Array(await ok.arrayBuffer());
};
var isGzip = (buf) => {
  if (!buf || buf.byteLength < 3) {
    return false;
  }
  return buf[0] === 31 && buf[1] === 139 && buf[2] === 8;
};
var decompress = async (compressedBytes) => {
  if (!isGzip(compressedBytes)) {
    console.warn(`not a compressed file - ignoring decompression`);
    return compressedBytes;
  }
  if (typeof DecompressionStream === "undefined") {
    import('zlib').then(
      ({ gunzipSync }) => {
        console.log(`Node environment, using gunzipSync`);
        return gunzipSync(compressedBytes);
      }
    ).catch((e) => {
      console.error(e);
      throw new Error(`CompressionStream is not defined - and node zlib is not defined`);
    });
  }
  const stream = new Blob([compressedBytes]).stream();
  const decompressedStream = stream.pipeThrough(
    new DecompressionStream("gzip")
  );
  const ok = new Response(decompressedStream);
  const buff = await ok.arrayBuffer();
  return new Uint8Array(buff);
};

// src/engine/idb/common.ts
var version = 8;
var dbName = `datapond_storage`;
var dbDeferred = proResolver();
var patchStoreName = `patches`;
var jsonStoreName = `json_files`;
var pdfStoreName = `pdf_files`;
var previewStoreName = `preview_files`;
var pdfPagesStoreName = `pdf_pages_images`;
var pdfDataStoreName = `pdf_data`;
var keyValStoreName = `key_value`;
var activityStoreName = `activity`;
var getFileStoreName = (mime) => {
  switch (mime) {
    case "application/json" /* JSON */:
      return jsonStoreName;
    case "application/pdf" /* PDF */:
      return pdfStoreName;
    case "image/*" /* IMAGE */:
      return previewStoreName;
    default:
      throw new Error(`unknown mime type ${mime}`);
  }
};
var Db = () => {
  if (dbDeferred.isStarted()) {
    return dbDeferred.pro;
  }
  dbDeferred.start();
  const request = indexedDB.open(dbName, version);
  request.onupgradeneeded = function(event) {
    const db = request.result;
    if (!db.objectStoreNames.contains(jsonStoreName)) {
      db.createObjectStore(jsonStoreName, { keyPath: "id" });
      db.createObjectStore(pdfStoreName, { keyPath: "id" });
      db.createObjectStore(previewStoreName, { keyPath: "id" });
      db.createObjectStore(patchStoreName, { autoIncrement: true });
      db.createObjectStore(keyValStoreName, { keyPath: "key" });
      db.createObjectStore(pdfDataStoreName, { keyPath: "fileId" });
      const pdfStore = db.createObjectStore(pdfPagesStoreName, { keyPath: ["fileId", "page"] });
      pdfStore.createIndex("fileId", "fileId", { unique: false });
      db.createObjectStore(activityStoreName, { autoIncrement: true });
    } else {
      const txn1 = event.target.transaction;
      txn1.objectStore(patchStoreName).clear();
      const txn2 = event.target.transaction;
      txn2.objectStore(keyValStoreName).clear();
      const txn3 = event.target.transaction;
      txn3.objectStore(activityStoreName).clear();
      console.log("DB UPGRADED - removed all patches");
    }
  };
  request.onerror = function(event) {
    dbDeferred.reject(event);
  };
  request.onsuccess = function(event) {
    dbDeferred.resolve(event.target.result);
  };
  return dbDeferred.pro;
};

// src/engine/idb/file_storage.ts
var getAllPdfDone = () => {
  const deferred = proResolver();
  Db().then((db) => {
    const tx = db.transaction(pdfStoreName, "readonly");
    tx.objectStore(pdfStoreName).getAllKeys().onsuccess = function(event) {
      deferred.resolve(event.target.result || []);
    };
    tx.oncomplete = function(event) {
    };
    tx.onerror = function(event) {
      console.error("worker: error", event.target);
      deferred.reject(event.target);
    };
  });
  return deferred.pro;
};
var getAllPreviewDone = () => {
  const deferred = proResolver();
  Db().then((db) => {
    const tx = db.transaction(previewStoreName, "readonly");
    tx.objectStore(previewStoreName).getAllKeys().onsuccess = function(event) {
      deferred.resolve(event.target.result || []);
    };
    tx.oncomplete = function(event) {
    };
    tx.onerror = function(event) {
      console.error("worker: error", event.target);
      deferred.reject(event.target);
    };
  });
  return deferred.pro;
};
var getAllDone = () => {
  const deferred = proResolver();
  Promise.all([getAllPdfDone(), getAllPreviewDone()]).then((results) => {
    const [pdf, preview] = results;
    deferred.resolve({ pdf, preview });
  }).catch(deferred.reject);
  return deferred.pro;
};
var hasFile = (id, mime) => {
  const deferred = proResolver();
  Db().then((db) => {
    try {
      const storeName = getFileStoreName(mime);
      const tx = db.transaction(storeName, "readonly");
      const req = tx.objectStore(storeName).openCursor(id);
      req.onsuccess = function(e) {
        const cursor = e.target.result;
        if (cursor) {
          deferred.resolve(true);
        } else {
          deferred.resolve(false);
        }
      };
      req.onerror = function(e) {
        console.error("worker: error", e.target);
        deferred.reject(e.target);
      };
    } catch (e) {
      console.error(e);
      debugger;
    }
  }).catch((e) => {
    console.error(`[indexdb error:] hasFile(): ${e.message}`);
    deferred.reject(e);
  });
  return deferred.pro;
};
var loadFile = (id, mime) => {
  const deferred = proResolver();
  Db().then((db) => {
    const storeName = getFileStoreName(mime);
    const tx = db.transaction(storeName, "readonly");
    let result = void 0;
    tx.objectStore(storeName).get(id).addEventListener("success", function(event) {
      result = event.target.result;
    });
    tx.oncomplete = function() {
      if (result) {
        decompress(result.content).then((data) => {
          result.content = data;
          deferred.resolve(result);
        }).catch((err) => {
          console.error(`error decompressing stream`, err);
          deferred.resolve(result);
        });
      }
    };
    tx.onerror = function(event) {
      console.error("worker: error", event.target);
      deferred.reject(event.target);
    };
  }).catch(deferred.reject);
  return deferred.pro;
};
var storeFile = async (record) => {
  const deferred = proResolver();
  if (!isGzip(record.content)) {
    console.log(`File ${record.id} - ${record.mime} is not compressed - compressing it before storing it`, record);
    record.content = await compress(new Blob([record.content]));
  }
  const db = await Db();
  const storeName = getFileStoreName(record.mime);
  const has = await hasFile(record.id, record.mime);
  const tx = db.transaction(storeName, "readwrite");
  if (has) {
    tx.objectStore(storeName).put(record).onsuccess = function() {
    };
  } else {
    tx.objectStore(storeName).add(record).onsuccess = function() {
    };
  }
  tx.oncomplete = function() {
    deferred.resolve(true);
  };
  tx.onerror = function(event) {
    console.error("worker: error", event.target);
    deferred.reject(event.target);
  };
  return deferred.pro;
};

// src/engine/patchSanitizer.ts
var PatchSanitizer = class {
  constructor() {
    __publicField(this, "_patches");
    this._patches = {};
  }
  add(patch) {
    const { id, objectName } = patch;
    if (typeof this._patches[objectName] === "undefined") {
      this._patches[objectName] = {};
    }
    if (typeof this._patches[objectName][id] === "undefined") {
      this._patches[objectName][id] = {
        relations: [],
        i18n: {},
        props: {},
        native: {}
      };
    }
    if (patch.type === 3 /* i18n */) {
      if (patch.op == 0 /* replace */) {
        this._patches[objectName][id].i18n[patch.name] = patch.value;
      } else {
        console.warn(`i18n patch ${patch.op} not supported`);
      }
    } else if (patch.type === 4 /* native */) {
      if (patch.op == 0 /* replace */ || patch.op == 1 /* add */) {
        this._patches[objectName][id].native[patch.name] = patch.value;
      } else {
        console.warn(`native patch ${patch.op} not supported`);
      }
    } else if (patch.type === 2 /* prop */) {
      if (patch.op == 0 /* replace */) {
        this._patches[objectName][id].props[patch.name] = patch.value;
      } else {
        console.warn(`prop patch ${patch.op} not supported`);
      }
    } else {
      if (patch.op != 0 /* replace */) {
        this._patches[objectName][id].relations.push(patch);
      } else {
        console.warn(`replace not supported for ${patch.type} path: ${JSON.stringify(patch)}`);
      }
    }
  }
  clear() {
    this._patches = {};
  }
  get data() {
    const patches = this._patches;
    return patches;
  }
};

// ../../node_modules/@vue/shared/dist/shared.esm-bundler.js
// @__NO_SIDE_EFFECTS__
function makeMap(str) {
  const map2 = /* @__PURE__ */ Object.create(null);
  for (const key of str.split(",")) map2[key] = 1;
  return (val) => val in map2;
}
var EMPTY_OBJ = Object.freeze({}) ;
var extend = Object.assign;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var hasOwn = (val, key) => hasOwnProperty.call(val, key);
var isArray = Array.isArray;
var isMap = (val) => toTypeString(val) === "[object Map]";
var isFunction = (val) => typeof val === "function";
var isString = (val) => typeof val === "string";
var isSymbol = (val) => typeof val === "symbol";
var isObject = (val) => val !== null && typeof val === "object";
var objectToString = Object.prototype.toString;
var toTypeString = (value) => objectToString.call(value);
var toRawType = (value) => {
  return toTypeString(value).slice(8, -1);
};
var isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
var cacheStringFunction = (fn) => {
  const cache = /* @__PURE__ */ Object.create(null);
  return (str) => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  };
};
var capitalize = cacheStringFunction((str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
});
var hasChanged = (value, oldValue) => !Object.is(value, oldValue);
var _globalThis;
var getGlobalThis = () => {
  return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
};

// ../../node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js
function warn(msg, ...args) {
  console.warn(`[Vue warn] ${msg}`, ...args);
}
var activeSub;
var batchDepth = 0;
var batchedSub;
function startBatch() {
  batchDepth++;
}
function endBatch() {
  if (--batchDepth > 0) {
    return;
  }
  let error;
  while (batchedSub) {
    let e = batchedSub;
    batchedSub = void 0;
    while (e) {
      const next = e.next;
      e.next = void 0;
      e.flags &= -9;
      if (e.flags & 1) {
        try {
          e.trigger();
        } catch (err) {
          if (!error) error = err;
        }
      }
      e = next;
    }
  }
  if (error) throw error;
}
var shouldTrack = true;
var trackStack = [];
function pauseTracking() {
  trackStack.push(shouldTrack);
  shouldTrack = false;
}
function resetTracking() {
  const last = trackStack.pop();
  shouldTrack = last === void 0 ? true : last;
}
var Dep = class {
  constructor(computed3) {
    this.computed = computed3;
    this.version = 0;
    this.activeLink = void 0;
    this.subs = void 0;
    this.map = void 0;
    this.key = void 0;
    this.sc = 0;
    {
      this.subsHead = void 0;
    }
  }
  track(debugInfo) {
    {
      return;
    }
  }
  trigger(debugInfo) {
    this.version++;
    this.notify(debugInfo);
  }
  notify(debugInfo) {
    startBatch();
    try {
      {
        for (let head = this.subsHead; head; head = head.nextSub) {
          if (head.sub.onTrigger && !(head.sub.flags & 8)) {
            head.sub.onTrigger(
              extend(
                {
                  effect: head.sub
                },
                debugInfo
              )
            );
          }
        }
      }
      for (let link = this.subs; link; link = link.prevSub) {
        if (link.sub.notify()) {
          link.sub.dep.notify();
        }
      }
    } finally {
      endBatch();
    }
  }
};
var targetMap = /* @__PURE__ */ new WeakMap();
var ITERATE_KEY = Symbol(
  "Object iterate" 
);
var MAP_KEY_ITERATE_KEY = Symbol(
  "Map keys iterate" 
);
var ARRAY_ITERATE_KEY = Symbol(
  "Array iterate" 
);
function track(target, type, key) {
  if (shouldTrack && activeSub) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = new Dep());
      dep.map = depsMap;
      dep.key = key;
    }
    {
      dep.track({
        target,
        type,
        key
      });
    }
  }
}
function trigger(target, type, key, newValue, oldValue, oldTarget) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  const run = (dep) => {
    if (dep) {
      {
        dep.trigger({
          target,
          type,
          key,
          newValue,
          oldValue,
          oldTarget
        });
      }
    }
  };
  startBatch();
  if (type === "clear") {
    depsMap.forEach(run);
  } else {
    const targetIsArray = isArray(target);
    const isArrayIndex = targetIsArray && isIntegerKey(key);
    if (targetIsArray && key === "length") {
      const newLength = Number(newValue);
      depsMap.forEach((dep, key2) => {
        if (key2 === "length" || key2 === ARRAY_ITERATE_KEY || !isSymbol(key2) && key2 >= newLength) {
          run(dep);
        }
      });
    } else {
      if (key !== void 0 || depsMap.has(void 0)) {
        run(depsMap.get(key));
      }
      if (isArrayIndex) {
        run(depsMap.get(ARRAY_ITERATE_KEY));
      }
      switch (type) {
        case "add":
          if (!targetIsArray) {
            run(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              run(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          } else if (isArrayIndex) {
            run(depsMap.get("length"));
          }
          break;
        case "delete":
          if (!targetIsArray) {
            run(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              run(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          }
          break;
        case "set":
          if (isMap(target)) {
            run(depsMap.get(ITERATE_KEY));
          }
          break;
      }
    }
  }
  endBatch();
}
function reactiveReadArray(array) {
  const raw = toRaw(array);
  if (raw === array) return raw;
  track(raw, "iterate", ARRAY_ITERATE_KEY);
  return isShallow(array) ? raw : raw.map(toReactive);
}
function shallowReadArray(arr) {
  track(arr = toRaw(arr), "iterate", ARRAY_ITERATE_KEY);
  return arr;
}
var arrayInstrumentations = {
  __proto__: null,
  [Symbol.iterator]() {
    return iterator(this, Symbol.iterator, toReactive);
  },
  concat(...args) {
    return reactiveReadArray(this).concat(
      ...args.map((x) => isArray(x) ? reactiveReadArray(x) : x)
    );
  },
  entries() {
    return iterator(this, "entries", (value) => {
      value[1] = toReactive(value[1]);
      return value;
    });
  },
  every(fn, thisArg) {
    return apply(this, "every", fn, thisArg, void 0, arguments);
  },
  filter(fn, thisArg) {
    return apply(this, "filter", fn, thisArg, (v) => v.map(toReactive), arguments);
  },
  find(fn, thisArg) {
    return apply(this, "find", fn, thisArg, toReactive, arguments);
  },
  findIndex(fn, thisArg) {
    return apply(this, "findIndex", fn, thisArg, void 0, arguments);
  },
  findLast(fn, thisArg) {
    return apply(this, "findLast", fn, thisArg, toReactive, arguments);
  },
  findLastIndex(fn, thisArg) {
    return apply(this, "findLastIndex", fn, thisArg, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(fn, thisArg) {
    return apply(this, "forEach", fn, thisArg, void 0, arguments);
  },
  includes(...args) {
    return searchProxy(this, "includes", args);
  },
  indexOf(...args) {
    return searchProxy(this, "indexOf", args);
  },
  join(separator) {
    return reactiveReadArray(this).join(separator);
  },
  // keys() iterator only reads `length`, no optimisation required
  lastIndexOf(...args) {
    return searchProxy(this, "lastIndexOf", args);
  },
  map(fn, thisArg) {
    return apply(this, "map", fn, thisArg, void 0, arguments);
  },
  pop() {
    return noTracking(this, "pop");
  },
  push(...args) {
    return noTracking(this, "push", args);
  },
  reduce(fn, ...args) {
    return reduce(this, "reduce", fn, args);
  },
  reduceRight(fn, ...args) {
    return reduce(this, "reduceRight", fn, args);
  },
  shift() {
    return noTracking(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(fn, thisArg) {
    return apply(this, "some", fn, thisArg, void 0, arguments);
  },
  splice(...args) {
    return noTracking(this, "splice", args);
  },
  toReversed() {
    return reactiveReadArray(this).toReversed();
  },
  toSorted(comparer) {
    return reactiveReadArray(this).toSorted(comparer);
  },
  toSpliced(...args) {
    return reactiveReadArray(this).toSpliced(...args);
  },
  unshift(...args) {
    return noTracking(this, "unshift", args);
  },
  values() {
    return iterator(this, "values", toReactive);
  }
};
function iterator(self2, method, wrapValue) {
  const arr = shallowReadArray(self2);
  const iter = arr[method]();
  if (arr !== self2 && !isShallow(self2)) {
    iter._next = iter.next;
    iter.next = () => {
      const result = iter._next();
      if (result.value) {
        result.value = wrapValue(result.value);
      }
      return result;
    };
  }
  return iter;
}
var arrayProto = Array.prototype;
function apply(self2, method, fn, thisArg, wrappedRetFn, args) {
  const arr = shallowReadArray(self2);
  const needsWrap = arr !== self2 && !isShallow(self2);
  const methodFn = arr[method];
  if (methodFn !== arrayProto[method]) {
    const result2 = methodFn.apply(self2, args);
    return needsWrap ? toReactive(result2) : result2;
  }
  let wrappedFn = fn;
  if (arr !== self2) {
    if (needsWrap) {
      wrappedFn = function(item, index) {
        return fn.call(this, toReactive(item), index, self2);
      };
    } else if (fn.length > 2) {
      wrappedFn = function(item, index) {
        return fn.call(this, item, index, self2);
      };
    }
  }
  const result = methodFn.call(arr, wrappedFn, thisArg);
  return needsWrap && wrappedRetFn ? wrappedRetFn(result) : result;
}
function reduce(self2, method, fn, args) {
  const arr = shallowReadArray(self2);
  let wrappedFn = fn;
  if (arr !== self2) {
    if (!isShallow(self2)) {
      wrappedFn = function(acc, item, index) {
        return fn.call(this, acc, toReactive(item), index, self2);
      };
    } else if (fn.length > 3) {
      wrappedFn = function(acc, item, index) {
        return fn.call(this, acc, item, index, self2);
      };
    }
  }
  return arr[method](wrappedFn, ...args);
}
function searchProxy(self2, method, args) {
  const arr = toRaw(self2);
  track(arr, "iterate", ARRAY_ITERATE_KEY);
  const res = arr[method](...args);
  if ((res === -1 || res === false) && isProxy(args[0])) {
    args[0] = toRaw(args[0]);
    return arr[method](...args);
  }
  return res;
}
function noTracking(self2, method, args = []) {
  pauseTracking();
  startBatch();
  const res = toRaw(self2)[method].apply(self2, args);
  endBatch();
  resetTracking();
  return res;
}
var isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
var builtInSymbols = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol)
);
function hasOwnProperty2(key) {
  if (!isSymbol(key)) key = String(key);
  const obj = toRaw(this);
  track(obj, "has", key);
  return obj.hasOwnProperty(key);
}
var BaseReactiveHandler = class {
  constructor(_isReadonly = false, _isShallow = false) {
    this._isReadonly = _isReadonly;
    this._isShallow = _isShallow;
  }
  get(target, key, receiver) {
    if (key === "__v_skip") return target["__v_skip"];
    const isReadonly2 = this._isReadonly, isShallow2 = this._isShallow;
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_isShallow") {
      return isShallow2;
    } else if (key === "__v_raw") {
      if (receiver === (isReadonly2 ? isShallow2 ? shallowReadonlyMap : readonlyMap : isShallow2 ? shallowReactiveMap : reactiveMap).get(target) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)) {
        return target;
      }
      return;
    }
    const targetIsArray = isArray(target);
    if (!isReadonly2) {
      let fn;
      if (targetIsArray && (fn = arrayInstrumentations[key])) {
        return fn;
      }
      if (key === "hasOwnProperty") {
        return hasOwnProperty2;
      }
    }
    const res = Reflect.get(
      target,
      key,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      isRef(target) ? target : receiver
    );
    if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
      return res;
    }
    if (!isReadonly2) {
      track(target, "get", key);
    }
    if (isShallow2) {
      return res;
    }
    if (isRef(res)) {
      return targetIsArray && isIntegerKey(key) ? res : res.value;
    }
    if (isObject(res)) {
      return isReadonly2 ? readonly(res) : reactive(res);
    }
    return res;
  }
};
var MutableReactiveHandler = class extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(false, isShallow2);
  }
  set(target, key, value, receiver) {
    let oldValue = target[key];
    if (!this._isShallow) {
      const isOldValueReadonly = isReadonly(oldValue);
      if (!isShallow(value) && !isReadonly(value)) {
        oldValue = toRaw(oldValue);
        value = toRaw(value);
      }
      if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
        if (isOldValueReadonly) {
          return false;
        } else {
          oldValue.value = value;
          return true;
        }
      }
    }
    const hadKey = isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);
    const result = Reflect.set(
      target,
      key,
      value,
      isRef(target) ? target : receiver
    );
    if (target === toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, "add", key, value);
      } else if (hasChanged(value, oldValue)) {
        trigger(target, "set", key, value, oldValue);
      }
    }
    return result;
  }
  deleteProperty(target, key) {
    const hadKey = hasOwn(target, key);
    const oldValue = target[key];
    const result = Reflect.deleteProperty(target, key);
    if (result && hadKey) {
      trigger(target, "delete", key, void 0, oldValue);
    }
    return result;
  }
  has(target, key) {
    const result = Reflect.has(target, key);
    if (!isSymbol(key) || !builtInSymbols.has(key)) {
      track(target, "has", key);
    }
    return result;
  }
  ownKeys(target) {
    track(
      target,
      "iterate",
      isArray(target) ? "length" : ITERATE_KEY
    );
    return Reflect.ownKeys(target);
  }
};
var ReadonlyReactiveHandler = class extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(true, isShallow2);
  }
  set(target, key) {
    {
      warn(
        `Set operation on key "${String(key)}" failed: target is readonly.`,
        target
      );
    }
    return true;
  }
  deleteProperty(target, key) {
    {
      warn(
        `Delete operation on key "${String(key)}" failed: target is readonly.`,
        target
      );
    }
    return true;
  }
};
var mutableHandlers = /* @__PURE__ */ new MutableReactiveHandler();
var readonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler();
var toShallow = (value) => value;
var getProto = (v) => Reflect.getPrototypeOf(v);
function createIterableMethod(method, isReadonly2, isShallow2) {
  return function(...args) {
    const target = this["__v_raw"];
    const rawTarget = toRaw(target);
    const targetIsMap = isMap(rawTarget);
    const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
    const isKeyOnly = method === "keys" && targetIsMap;
    const innerIterator = target[method](...args);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(
      rawTarget,
      "iterate",
      isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY
    );
    return {
      // iterator protocol
      next() {
        const { value, done } = innerIterator.next();
        return done ? { value, done } : {
          value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
          done
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function createReadonlyMethod(type) {
  return function(...args) {
    {
      const key = args[0] ? `on key "${args[0]}" ` : ``;
      warn(
        `${capitalize(type)} operation ${key}failed: target is readonly.`,
        toRaw(this)
      );
    }
    return type === "delete" ? false : type === "clear" ? void 0 : this;
  };
}
function createInstrumentations(readonly2, shallow) {
  const instrumentations = {
    get(key) {
      const target = this["__v_raw"];
      const rawTarget = toRaw(target);
      const rawKey = toRaw(key);
      if (!readonly2) {
        if (hasChanged(key, rawKey)) {
          track(rawTarget, "get", key);
        }
        track(rawTarget, "get", rawKey);
      }
      const { has } = getProto(rawTarget);
      const wrap = shallow ? toShallow : readonly2 ? toReadonly : toReactive;
      if (has.call(rawTarget, key)) {
        return wrap(target.get(key));
      } else if (has.call(rawTarget, rawKey)) {
        return wrap(target.get(rawKey));
      } else if (target !== rawTarget) {
        target.get(key);
      }
    },
    get size() {
      const target = this["__v_raw"];
      !readonly2 && track(toRaw(target), "iterate", ITERATE_KEY);
      return Reflect.get(target, "size", target);
    },
    has(key) {
      const target = this["__v_raw"];
      const rawTarget = toRaw(target);
      const rawKey = toRaw(key);
      if (!readonly2) {
        if (hasChanged(key, rawKey)) {
          track(rawTarget, "has", key);
        }
        track(rawTarget, "has", rawKey);
      }
      return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
    },
    forEach(callback, thisArg) {
      const observed = this;
      const target = observed["__v_raw"];
      const rawTarget = toRaw(target);
      const wrap = shallow ? toShallow : readonly2 ? toReadonly : toReactive;
      !readonly2 && track(rawTarget, "iterate", ITERATE_KEY);
      return target.forEach((value, key) => {
        return callback.call(thisArg, wrap(value), wrap(key), observed);
      });
    }
  };
  extend(
    instrumentations,
    readonly2 ? {
      add: createReadonlyMethod("add"),
      set: createReadonlyMethod("set"),
      delete: createReadonlyMethod("delete"),
      clear: createReadonlyMethod("clear")
    } : {
      add(value) {
        if (!shallow && !isShallow(value) && !isReadonly(value)) {
          value = toRaw(value);
        }
        const target = toRaw(this);
        const proto = getProto(target);
        const hadKey = proto.has.call(target, value);
        if (!hadKey) {
          target.add(value);
          trigger(target, "add", value, value);
        }
        return this;
      },
      set(key, value) {
        if (!shallow && !isShallow(value) && !isReadonly(value)) {
          value = toRaw(value);
        }
        const target = toRaw(this);
        const { has, get } = getProto(target);
        let hadKey = has.call(target, key);
        if (!hadKey) {
          key = toRaw(key);
          hadKey = has.call(target, key);
        } else {
          checkIdentityKeys(target, has, key);
        }
        const oldValue = get.call(target, key);
        target.set(key, value);
        if (!hadKey) {
          trigger(target, "add", key, value);
        } else if (hasChanged(value, oldValue)) {
          trigger(target, "set", key, value, oldValue);
        }
        return this;
      },
      delete(key) {
        const target = toRaw(this);
        const { has, get } = getProto(target);
        let hadKey = has.call(target, key);
        if (!hadKey) {
          key = toRaw(key);
          hadKey = has.call(target, key);
        } else {
          checkIdentityKeys(target, has, key);
        }
        const oldValue = get ? get.call(target, key) : void 0;
        const result = target.delete(key);
        if (hadKey) {
          trigger(target, "delete", key, void 0, oldValue);
        }
        return result;
      },
      clear() {
        const target = toRaw(this);
        const hadItems = target.size !== 0;
        const oldTarget = isMap(target) ? new Map(target) : new Set(target) ;
        const result = target.clear();
        if (hadItems) {
          trigger(
            target,
            "clear",
            void 0,
            void 0,
            oldTarget
          );
        }
        return result;
      }
    }
  );
  const iteratorMethods = [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ];
  iteratorMethods.forEach((method) => {
    instrumentations[method] = createIterableMethod(method, readonly2, shallow);
  });
  return instrumentations;
}
function createInstrumentationGetter(isReadonly2, shallow) {
  const instrumentations = createInstrumentations(isReadonly2, shallow);
  return (target, key, receiver) => {
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_raw") {
      return target;
    }
    return Reflect.get(
      hasOwn(instrumentations, key) && key in target ? instrumentations : target,
      key,
      receiver
    );
  };
}
var mutableCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, false)
};
var readonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, false)
};
function checkIdentityKeys(target, has, key) {
  const rawKey = toRaw(key);
  if (rawKey !== key && has.call(target, rawKey)) {
    const type = toRawType(target);
    warn(
      `Reactive ${type} contains both the raw and reactive versions of the same object${type === `Map` ? ` as keys` : ``}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`
    );
  }
}
var reactiveMap = /* @__PURE__ */ new WeakMap();
var shallowReactiveMap = /* @__PURE__ */ new WeakMap();
var readonlyMap = /* @__PURE__ */ new WeakMap();
var shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
function targetTypeMap(rawType) {
  switch (rawType) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
function getTargetType(value) {
  return value["__v_skip"] || !Object.isExtensible(value) ? 0 : targetTypeMap(toRawType(value));
}
function reactive(target) {
  if (isReadonly(target)) {
    return target;
  }
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap
  );
}
function readonly(target) {
  return createReactiveObject(
    target,
    true,
    readonlyHandlers,
    readonlyCollectionHandlers,
    readonlyMap
  );
}
function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
  if (!isObject(target)) {
    {
      warn(
        `value cannot be made ${isReadonly2 ? "readonly" : "reactive"}: ${String(
          target
        )}`
      );
    }
    return target;
  }
  if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) {
    return target;
  }
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const targetType = getTargetType(target);
  if (targetType === 0) {
    return target;
  }
  const proxy = new Proxy(
    target,
    targetType === 2 ? collectionHandlers : baseHandlers
  );
  proxyMap.set(target, proxy);
  return proxy;
}
function isReactive(value) {
  if (isReadonly(value)) {
    return isReactive(value["__v_raw"]);
  }
  return !!(value && value["__v_isReactive"]);
}
function isReadonly(value) {
  return !!(value && value["__v_isReadonly"]);
}
function isShallow(value) {
  return !!(value && value["__v_isShallow"]);
}
function isProxy(value) {
  return value ? !!value["__v_raw"] : false;
}
function toRaw(observed) {
  const raw = observed && observed["__v_raw"];
  return raw ? toRaw(raw) : observed;
}
var toReactive = (value) => isObject(value) ? reactive(value) : value;
var toReadonly = (value) => isObject(value) ? readonly(value) : value;
function isRef(r) {
  return r ? r["__v_isRef"] === true : false;
}
function unref(ref2) {
  return isRef(ref2) ? ref2.value : ref2;
}
function toValue(source) {
  return isFunction(source) ? source() : unref(source);
}

// ../../node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js
var stack = [];
function pushWarningContext(vnode) {
  stack.push(vnode);
}
function popWarningContext() {
  stack.pop();
}
var isWarning = false;
function warn$1(msg, ...args) {
  if (isWarning) return;
  isWarning = true;
  pauseTracking();
  const instance = stack.length ? stack[stack.length - 1].component : null;
  const appWarnHandler = instance && instance.appContext.config.warnHandler;
  const trace = getComponentTrace();
  if (appWarnHandler) {
    callWithErrorHandling(
      appWarnHandler,
      instance,
      11,
      [
        // eslint-disable-next-line no-restricted-syntax
        msg + args.map((a) => {
          var _a, _b;
          return (_b = (_a = a.toString) == null ? void 0 : _a.call(a)) != null ? _b : JSON.stringify(a);
        }).join(""),
        instance && instance.proxy,
        trace.map(
          ({ vnode }) => `at <${formatComponentName(instance, vnode.type)}>`
        ).join("\n"),
        trace
      ]
    );
  } else {
    const warnArgs = [`[Vue warn]: ${msg}`, ...args];
    if (trace.length && // avoid spamming console during tests
    true) {
      warnArgs.push(`
`, ...formatTrace(trace));
    }
    console.warn(...warnArgs);
  }
  resetTracking();
  isWarning = false;
}
function getComponentTrace() {
  let currentVNode = stack[stack.length - 1];
  if (!currentVNode) {
    return [];
  }
  const normalizedStack = [];
  while (currentVNode) {
    const last = normalizedStack[0];
    if (last && last.vnode === currentVNode) {
      last.recurseCount++;
    } else {
      normalizedStack.push({
        vnode: currentVNode,
        recurseCount: 0
      });
    }
    const parentInstance = currentVNode.component && currentVNode.component.parent;
    currentVNode = parentInstance && parentInstance.vnode;
  }
  return normalizedStack;
}
function formatTrace(trace) {
  const logs = [];
  trace.forEach((entry, i) => {
    logs.push(...i === 0 ? [] : [`
`], ...formatTraceEntry(entry));
  });
  return logs;
}
function formatTraceEntry({ vnode, recurseCount }) {
  const postfix = recurseCount > 0 ? `... (${recurseCount} recursive calls)` : ``;
  const isRoot = vnode.component ? vnode.component.parent == null : false;
  const open = ` at <${formatComponentName(
    vnode.component,
    vnode.type,
    isRoot
  )}`;
  const close = `>` + postfix;
  return vnode.props ? [open, ...formatProps(vnode.props), close] : [open + close];
}
function formatProps(props) {
  const res = [];
  const keys = Object.keys(props);
  keys.slice(0, 3).forEach((key) => {
    res.push(...formatProp(key, props[key]));
  });
  if (keys.length > 3) {
    res.push(` ...`);
  }
  return res;
}
function formatProp(key, value, raw) {
  if (isString(value)) {
    value = JSON.stringify(value);
    return raw ? value : [`${key}=${value}`];
  } else if (typeof value === "number" || typeof value === "boolean" || value == null) {
    return raw ? value : [`${key}=${value}`];
  } else if (isRef(value)) {
    value = formatProp(key, toRaw(value.value), true);
    return raw ? value : [`${key}=Ref<`, value, `>`];
  } else if (isFunction(value)) {
    return [`${key}=fn${value.name ? `<${value.name}>` : ``}`];
  } else {
    value = toRaw(value);
    return raw ? value : [`${key}=`, value];
  }
}
var ErrorTypeStrings$1 = {
  ["sp"]: "serverPrefetch hook",
  ["bc"]: "beforeCreate hook",
  ["c"]: "created hook",
  ["bm"]: "beforeMount hook",
  ["m"]: "mounted hook",
  ["bu"]: "beforeUpdate hook",
  ["u"]: "updated",
  ["bum"]: "beforeUnmount hook",
  ["um"]: "unmounted hook",
  ["a"]: "activated hook",
  ["da"]: "deactivated hook",
  ["ec"]: "errorCaptured hook",
  ["rtc"]: "renderTracked hook",
  ["rtg"]: "renderTriggered hook",
  [0]: "setup function",
  [1]: "render function",
  [2]: "watcher getter",
  [3]: "watcher callback",
  [4]: "watcher cleanup function",
  [5]: "native event handler",
  [6]: "component event handler",
  [7]: "vnode hook",
  [8]: "directive hook",
  [9]: "transition hook",
  [10]: "app errorHandler",
  [11]: "app warnHandler",
  [12]: "ref function",
  [13]: "async component loader",
  [14]: "scheduler flush",
  [15]: "component update",
  [16]: "app unmount cleanup function"
};
function callWithErrorHandling(fn, instance, type, args) {
  try {
    return args ? fn(...args) : fn();
  } catch (err) {
    handleError(err, instance, type);
  }
}
function handleError(err, instance, type, throwInDev = true) {
  const contextVNode = instance ? instance.vnode : null;
  const { errorHandler, throwUnhandledErrorInProduction } = instance && instance.appContext.config || EMPTY_OBJ;
  if (instance) {
    let cur = instance.parent;
    const exposedInstance = instance.proxy;
    const errorInfo = ErrorTypeStrings$1[type] ;
    while (cur) {
      const errorCapturedHooks = cur.ec;
      if (errorCapturedHooks) {
        for (let i = 0; i < errorCapturedHooks.length; i++) {
          if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) {
            return;
          }
        }
      }
      cur = cur.parent;
    }
    if (errorHandler) {
      pauseTracking();
      callWithErrorHandling(errorHandler, null, 10, [
        err,
        exposedInstance,
        errorInfo
      ]);
      resetTracking();
      return;
    }
  }
  logError(err, type, contextVNode, throwInDev, throwUnhandledErrorInProduction);
}
function logError(err, type, contextVNode, throwInDev = true, throwInProd = false) {
  {
    const info = ErrorTypeStrings$1[type];
    if (contextVNode) {
      pushWarningContext(contextVNode);
    }
    warn$1(`Unhandled error${info ? ` during execution of ${info}` : ``}`);
    if (contextVNode) {
      popWarningContext();
    }
    if (throwInDev) {
      throw err;
    } else {
      console.error(err);
    }
  }
}
var queue = [];
var flushIndex = -1;
var pendingPostFlushCbs = [];
var activePostFlushCbs = null;
var postFlushIndex = 0;
var resolvedPromise = /* @__PURE__ */ Promise.resolve();
var currentFlushPromise = null;
var RECURSION_LIMIT = 100;
function findInsertionIndex(id) {
  let start = flushIndex + 1;
  let end = queue.length;
  while (start < end) {
    const middle = start + end >>> 1;
    const middleJob = queue[middle];
    const middleJobId = getId(middleJob);
    if (middleJobId < id || middleJobId === id && middleJob.flags & 2) {
      start = middle + 1;
    } else {
      end = middle;
    }
  }
  return start;
}
function queueJob(job) {
  if (!(job.flags & 1)) {
    const jobId = getId(job);
    const lastJob = queue[queue.length - 1];
    if (!lastJob || // fast path when the job id is larger than the tail
    !(job.flags & 2) && jobId >= getId(lastJob)) {
      queue.push(job);
    } else {
      queue.splice(findInsertionIndex(jobId), 0, job);
    }
    job.flags |= 1;
    queueFlush();
  }
}
function queueFlush() {
  if (!currentFlushPromise) {
    currentFlushPromise = resolvedPromise.then(flushJobs);
  }
}
function queuePostFlushCb(cb) {
  if (!isArray(cb)) {
    if (activePostFlushCbs && cb.id === -1) {
      activePostFlushCbs.splice(postFlushIndex + 1, 0, cb);
    } else if (!(cb.flags & 1)) {
      pendingPostFlushCbs.push(cb);
      cb.flags |= 1;
    }
  } else {
    pendingPostFlushCbs.push(...cb);
  }
  queueFlush();
}
function flushPostFlushCbs(seen) {
  if (pendingPostFlushCbs.length) {
    const deduped = [...new Set(pendingPostFlushCbs)].sort(
      (a, b) => getId(a) - getId(b)
    );
    pendingPostFlushCbs.length = 0;
    if (activePostFlushCbs) {
      activePostFlushCbs.push(...deduped);
      return;
    }
    activePostFlushCbs = deduped;
    {
      seen = seen || /* @__PURE__ */ new Map();
    }
    for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
      const cb = activePostFlushCbs[postFlushIndex];
      if (checkRecursiveUpdates(seen, cb)) {
        continue;
      }
      if (cb.flags & 4) {
        cb.flags &= -2;
      }
      if (!(cb.flags & 8)) cb();
      cb.flags &= -2;
    }
    activePostFlushCbs = null;
    postFlushIndex = 0;
  }
}
var getId = (job) => job.id == null ? job.flags & 2 ? -1 : Infinity : job.id;
function flushJobs(seen) {
  {
    seen = seen || /* @__PURE__ */ new Map();
  }
  const check = (job) => checkRecursiveUpdates(seen, job) ;
  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex];
      if (job && !(job.flags & 8)) {
        if (check(job)) {
          continue;
        }
        if (job.flags & 4) {
          job.flags &= -2;
        }
        callWithErrorHandling(
          job,
          job.i,
          job.i ? 15 : 14
        );
        if (!(job.flags & 4)) {
          job.flags &= -2;
        }
      }
    }
  } finally {
    for (; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex];
      if (job) {
        job.flags &= -2;
      }
    }
    flushIndex = -1;
    queue.length = 0;
    flushPostFlushCbs(seen);
    currentFlushPromise = null;
    if (queue.length || pendingPostFlushCbs.length) {
      flushJobs(seen);
    }
  }
}
function checkRecursiveUpdates(seen, fn) {
  const count = seen.get(fn) || 0;
  if (count > RECURSION_LIMIT) {
    const instance = fn.i;
    const componentName = instance && getComponentName(instance.type);
    handleError(
      `Maximum recursive updates exceeded${componentName ? ` in component <${componentName}>` : ``}. This means you have a reactive effect that is mutating its own dependencies and thus recursively triggering itself. Possible sources include component template, render function, updated hook or watcher source function.`,
      null,
      10
    );
    return true;
  }
  seen.set(fn, count + 1);
  return false;
}
var hmrDirtyComponents = /* @__PURE__ */ new Map();
{
  getGlobalThis().__VUE_HMR_RUNTIME__ = {
    createRecord: tryWrap(createRecord),
    rerender: tryWrap(rerender),
    reload: tryWrap(reload)
  };
}
var map = /* @__PURE__ */ new Map();
function createRecord(id, initialDef) {
  if (map.has(id)) {
    return false;
  }
  map.set(id, {
    initialDef: normalizeClassComponent(initialDef),
    instances: /* @__PURE__ */ new Set()
  });
  return true;
}
function normalizeClassComponent(component) {
  return isClassComponent(component) ? component.__vccOpts : component;
}
function rerender(id, newRender) {
  const record = map.get(id);
  if (!record) {
    return;
  }
  record.initialDef.render = newRender;
  [...record.instances].forEach((instance) => {
    if (newRender) {
      instance.render = newRender;
      normalizeClassComponent(instance.type).render = newRender;
    }
    instance.renderCache = [];
    instance.update();
  });
}
function reload(id, newComp) {
  const record = map.get(id);
  if (!record) return;
  newComp = normalizeClassComponent(newComp);
  updateComponentDef(record.initialDef, newComp);
  const instances = [...record.instances];
  for (let i = 0; i < instances.length; i++) {
    const instance = instances[i];
    const oldComp = normalizeClassComponent(instance.type);
    let dirtyInstances = hmrDirtyComponents.get(oldComp);
    if (!dirtyInstances) {
      if (oldComp !== record.initialDef) {
        updateComponentDef(oldComp, newComp);
      }
      hmrDirtyComponents.set(oldComp, dirtyInstances = /* @__PURE__ */ new Set());
    }
    dirtyInstances.add(instance);
    instance.appContext.propsCache.delete(instance.type);
    instance.appContext.emitsCache.delete(instance.type);
    instance.appContext.optionsCache.delete(instance.type);
    if (instance.ceReload) {
      dirtyInstances.add(instance);
      instance.ceReload(newComp.styles);
      dirtyInstances.delete(instance);
    } else if (instance.parent) {
      queueJob(() => {
        instance.parent.update();
        dirtyInstances.delete(instance);
      });
    } else if (instance.appContext.reload) {
      instance.appContext.reload();
    } else if (typeof window !== "undefined") {
      window.location.reload();
    } else {
      console.warn(
        "[HMR] Root or manually mounted instance modified. Full reload required."
      );
    }
    if (instance.root.ce && instance !== instance.root) {
      instance.root.ce._removeChildStyle(oldComp);
    }
  }
  queuePostFlushCb(() => {
    hmrDirtyComponents.clear();
  });
}
function updateComponentDef(oldComp, newComp) {
  extend(oldComp, newComp);
  for (const key in oldComp) {
    if (key !== "__file" && !(key in newComp)) {
      delete oldComp[key];
    }
  }
}
function tryWrap(fn) {
  return (id, arg) => {
    try {
      return fn(id, arg);
    } catch (e) {
      console.error(e);
      console.warn(
        `[HMR] Something went wrong during Vue component hot-reload. Full reload required.`
      );
    }
  };
}
getGlobalThis().requestIdleCallback || ((cb) => setTimeout(cb, 1));
getGlobalThis().cancelIdleCallback || ((id) => clearTimeout(id));
{
  const g = getGlobalThis();
  const registerGlobalSetter = (key, setter) => {
    let setters;
    if (!(setters = g[key])) setters = g[key] = [];
    setters.push(setter);
    return (v) => {
      if (setters.length > 1) setters.forEach((set) => set(v));
      else setters[0](v);
    };
  };
  registerGlobalSetter(
    `__VUE_INSTANCE_SETTERS__`,
    (v) => v
  );
  registerGlobalSetter(
    `__VUE_SSR_SETTERS__`,
    (v) => v
  );
}
var classifyRE = /(?:^|[-_])(\w)/g;
var classify = (str) => str.replace(classifyRE, (c) => c.toUpperCase()).replace(/[-_]/g, "");
function getComponentName(Component, includeInferred = true) {
  return isFunction(Component) ? Component.displayName || Component.name : Component.name || includeInferred && Component.__name;
}
function formatComponentName(instance, Component, isRoot = false) {
  let name = getComponentName(Component);
  if (!name && Component.__file) {
    const match = Component.__file.match(/([^/\\]+)\.\w+$/);
    if (match) {
      name = match[1];
    }
  }
  if (!name && instance && instance.parent) {
    const inferFromRegistry = (registry) => {
      for (const key in registry) {
        if (registry[key] === Component) {
          return key;
        }
      }
    };
    name = inferFromRegistry(
      instance.components || instance.parent.type.components
    ) || inferFromRegistry(instance.appContext.components);
  }
  return name ? classify(name) : isRoot ? `App` : `Anonymous`;
}
function isClassComponent(value) {
  return isFunction(value) && "__vccOpts" in value;
}
function initCustomFormatter() {
  if (typeof window === "undefined") {
    return;
  }
  const vueStyle = { style: "color:#3ba776" };
  const numberStyle = { style: "color:#1677ff" };
  const stringStyle = { style: "color:#f5222d" };
  const keywordStyle = { style: "color:#eb2f96" };
  const formatter = {
    __vue_custom_formatter: true,
    header(obj) {
      if (!isObject(obj)) {
        return null;
      }
      if (obj.__isVue) {
        return ["div", vueStyle, `VueInstance`];
      } else if (isRef(obj)) {
        return [
          "div",
          {},
          ["span", vueStyle, genRefFlag(obj)],
          "<",
          // avoid debugger accessing value affecting behavior
          formatValue("_value" in obj ? obj._value : obj),
          `>`
        ];
      } else if (isReactive(obj)) {
        return [
          "div",
          {},
          ["span", vueStyle, isShallow(obj) ? "ShallowReactive" : "Reactive"],
          "<",
          formatValue(obj),
          `>${isReadonly(obj) ? ` (readonly)` : ``}`
        ];
      } else if (isReadonly(obj)) {
        return [
          "div",
          {},
          ["span", vueStyle, isShallow(obj) ? "ShallowReadonly" : "Readonly"],
          "<",
          formatValue(obj),
          ">"
        ];
      }
      return null;
    },
    hasBody(obj) {
      return obj && obj.__isVue;
    },
    body(obj) {
      if (obj && obj.__isVue) {
        return [
          "div",
          {},
          ...formatInstance(obj.$)
        ];
      }
    }
  };
  function formatInstance(instance) {
    const blocks = [];
    if (instance.type.props && instance.props) {
      blocks.push(createInstanceBlock("props", toRaw(instance.props)));
    }
    if (instance.setupState !== EMPTY_OBJ) {
      blocks.push(createInstanceBlock("setup", instance.setupState));
    }
    if (instance.data !== EMPTY_OBJ) {
      blocks.push(createInstanceBlock("data", toRaw(instance.data)));
    }
    const computed3 = extractKeys(instance, "computed");
    if (computed3) {
      blocks.push(createInstanceBlock("computed", computed3));
    }
    const injected = extractKeys(instance, "inject");
    if (injected) {
      blocks.push(createInstanceBlock("injected", injected));
    }
    blocks.push([
      "div",
      {},
      [
        "span",
        {
          style: keywordStyle.style + ";opacity:0.66"
        },
        "$ (internal): "
      ],
      ["object", { object: instance }]
    ]);
    return blocks;
  }
  function createInstanceBlock(type, target) {
    target = extend({}, target);
    if (!Object.keys(target).length) {
      return ["span", {}];
    }
    return [
      "div",
      { style: "line-height:1.25em;margin-bottom:0.6em" },
      [
        "div",
        {
          style: "color:#476582"
        },
        type
      ],
      [
        "div",
        {
          style: "padding-left:1.25em"
        },
        ...Object.keys(target).map((key) => {
          return [
            "div",
            {},
            ["span", keywordStyle, key + ": "],
            formatValue(target[key], false)
          ];
        })
      ]
    ];
  }
  function formatValue(v, asRaw = true) {
    if (typeof v === "number") {
      return ["span", numberStyle, v];
    } else if (typeof v === "string") {
      return ["span", stringStyle, JSON.stringify(v)];
    } else if (typeof v === "boolean") {
      return ["span", keywordStyle, v];
    } else if (isObject(v)) {
      return ["object", { object: asRaw ? toRaw(v) : v }];
    } else {
      return ["span", stringStyle, String(v)];
    }
  }
  function extractKeys(instance, type) {
    const Comp = instance.type;
    if (isFunction(Comp)) {
      return;
    }
    const extracted = {};
    for (const key in instance.ctx) {
      if (isKeyOfType(Comp, key, type)) {
        extracted[key] = instance.ctx[key];
      }
    }
    return extracted;
  }
  function isKeyOfType(Comp, key, type) {
    const opts = Comp[type];
    if (isArray(opts) && opts.includes(key) || isObject(opts) && key in opts) {
      return true;
    }
    if (Comp.extends && isKeyOfType(Comp.extends, key, type)) {
      return true;
    }
    if (Comp.mixins && Comp.mixins.some((m) => isKeyOfType(m, key, type))) {
      return true;
    }
  }
  function genRefFlag(v) {
    if (isShallow(v)) {
      return `ShallowRef`;
    }
    if (v.effect) {
      return `ComputedRef`;
    }
    return `Ref`;
  }
  if (window.devtoolsFormatters) {
    window.devtoolsFormatters.push(formatter);
  } else {
    window.devtoolsFormatters = [formatter];
  }
}

// ../../node_modules/vue/dist/vue.runtime.esm-bundler.js
function initDev() {
  {
    initCustomFormatter();
  }
}
{
  initDev();
}
var noop = () => {
};
function createFilterWrapper(filter, fn) {
  function wrapper(...args) {
    return new Promise((resolve, reject) => {
      Promise.resolve(filter(() => fn.apply(this, args), { fn, thisArg: this, args })).then(resolve).catch(reject);
    });
  }
  return wrapper;
}
function debounceFilter(ms, options = {}) {
  let timer;
  let maxTimer;
  let lastRejector = noop;
  const _clearTimeout = (timer2) => {
    clearTimeout(timer2);
    lastRejector();
    lastRejector = noop;
  };
  let lastInvoker;
  const filter = (invoke) => {
    const duration = toValue(ms);
    const maxDuration = toValue(options.maxWait);
    if (timer)
      _clearTimeout(timer);
    if (duration <= 0 || maxDuration !== void 0 && maxDuration <= 0) {
      if (maxTimer) {
        _clearTimeout(maxTimer);
        maxTimer = null;
      }
      return Promise.resolve(invoke());
    }
    return new Promise((resolve, reject) => {
      lastRejector = options.rejectOnCancel ? reject : resolve;
      lastInvoker = invoke;
      if (maxDuration && !maxTimer) {
        maxTimer = setTimeout(() => {
          if (timer)
            _clearTimeout(timer);
          maxTimer = null;
          resolve(lastInvoker());
        }, maxDuration);
      }
      timer = setTimeout(() => {
        if (maxTimer)
          _clearTimeout(maxTimer);
        maxTimer = null;
        resolve(invoke());
      }, duration);
    });
  };
  return filter;
}
function useDebounceFn(fn, ms = 200, options = {}) {
  return createFilterWrapper(
    debounceFilter(ms, options),
    fn
  );
}

// src/custom_types/map.ts
var MapObj = class {
  constructor(map2) {
    __publicField(this, "map", {});
    this.map = {};
    map2.forEach(([key, value]) => {
      this.map[key] = value;
    });
  }
  has(key) {
    return typeof this.map[key] !== "undefined";
  }
  get(key) {
    return this.map[key];
  }
  entries() {
    return this.keys().map((k) => [k, this.map[k]]);
  }
  keys() {
    return Object.keys(this.map);
  }
  values() {
    return Object.values(this.map);
  }
  set(key, value) {
    this.map[key] = value;
  }
  remove(key) {
    delete this.map[key];
  }
  toJSON() {
    return this.values();
  }
};

// src/custom_types/set.ts
var StringSet = class {
  constructor(set) {
    __publicField(this, "_set", []);
    __publicField(this, "_index", {});
    this._set = set;
    this._index = {};
    for (let i = 0; i < this._set.length; i++) {
      this._index[this._set[i]] = i;
    }
  }
  size() {
    return this._set.length;
  }
  has(uid) {
    return this._index[uid] !== void 0;
  }
  allIds() {
    return [...this._set];
  }
  add(a) {
    if (!this.has(a)) {
      this._set.push(a);
      this._index[a] = this._set.length - 1;
    }
  }
  remove(a) {
    const index = this._index[a];
    this._set.splice(index, 1);
    this._index = this._set.reduce((acc, val, index2) => {
      acc[val] = index2;
      return acc;
    }, {});
  }
  toJSON() {
    return this._set;
  }
};
var NumberSet = class {
  constructor(set) {
    __publicField(this, "_set", []);
    __publicField(this, "_index", {});
    this._set = set;
    this._index = {};
    for (let i = 0; i < this._set.length; i++) {
      this._index[this._set[i] + ""] = i;
    }
  }
  size() {
    return this._set.length;
  }
  has(uid) {
    return this._index[uid + ""] !== void 0;
  }
  allIds() {
    return [...this._set];
  }
  add(a) {
    if (!this.has(a)) {
      this._set.push(a);
      this._index[a + ""] = this._set.length - 1;
    }
  }
  remove(a) {
    const index = this._index[a + ""];
    this._set.splice(index, 1);
    this._index = this._set.reduce((acc, val, index2) => {
      acc[val + ""] = index2;
      return acc;
    }, {});
  }
  toJSON() {
    return this._set;
  }
};

// src/engine/lang.ts
var lang = "en" /* English */;

// src/custom_types/I18n.ts
var defaultEmptyString = "---\\o/---";
var I18n = class extends MapObj {
  get text() {
    return this.has(lang) ? this.get(lang) : defaultEmptyString;
  }
  set text(newValue) {
    this.set(lang, newValue);
  }
  getLang(lang2) {
    return this.has(lang2) ? this.get(lang2) : defaultEmptyString;
  }
  setLang(text, lang2) {
    this.set(lang2, text);
  }
};

// src/engine/orm.ts
var Orm = class {
  constructor(json, lang2) {
    __publicField(this, "_id");
    __publicField(this, "_dSafe", true);
    __publicField(this, "_deleted", false);
    __publicField(this, "_has", new MapObj([]));
    __publicField(this, "_in", new MapObj([]));
    __publicField(this, "_props", new MapObj([]));
    __publicField(this, "nameI18n", new I18n([]));
    __publicField(this, "descriptionI18n", new I18n([]));
    __publicField(this, "_schema");
    this._id = json[0];
    this._deleted = json[1];
    this._dSafe = json[2];
    const schema = this.constructor._schema;
    this._has = new MapObj([]);
    if (schema._has && schema._has.length > 0) {
      schema._has.forEach(({ name, type }, index) => {
        this._has.set(name, new NumberSet(json[3][index]));
      });
    }
    this._in = new MapObj([]);
    if (schema._in && schema._in.length > 0) {
      schema._in.forEach(({ name, type }, index) => {
        this._in.set(name, new NumberSet(json[4][index]));
      });
    }
    this._props = new MapObj([]);
    if (schema.props && schema.props.length > 0) {
      schema.props.forEach(({ name, type }, index) => {
        this._props.set(name, json[5][index]);
      });
    }
    this.nameI18n = new I18n([[lang2, json[6]]]);
    this.descriptionI18n = new I18n([[lang2, json[7]]]);
  }
  static createNewRequest(id) {
    const initial = [
      id,
      false,
      false,
      [],
      [],
      [],
      "",
      ""
    ];
    const schema = this._schema;
    if (schema._has && schema._has.length > 0) {
      schema._has.forEach(() => {
        initial[3].push([]);
      });
    }
    if (schema._in && schema._in.length > 0) {
      schema._in.forEach(() => {
        initial[4].push([]);
      });
    }
    if (schema.props && schema.props.length > 0) {
      schema.props.forEach(() => {
        initial[5].push([]);
      });
    }
    return initial;
  }
  toJSON() {
    return [
      this._id,
      this._deleted,
      this._dSafe,
      this._has.toJSON(),
      this._in.toJSON(),
      this._props.toJSON(),
      this.nameI18n.text,
      this.descriptionI18n.text
    ];
  }
  get id() {
    return this._id;
  }
  get safe() {
    return this._dSafe;
  }
  set safe(value) {
    this._dSafe = value;
  }
  get deleted() {
    return this._deleted;
  }
  set deleted(value) {
    this._deleted = value;
  }
  patch(patch) {
    Object.keys(patch.i18n).forEach((key) => {
      if (key === "name") {
        this.nameI18n.text = patch.i18n[key];
      } else if (key === "description") {
        this.descriptionI18n.text = patch.i18n[key];
      } else {
        console.error(`${key} is not a valid i18n field`);
      }
    });
    Object.keys(patch.native).forEach((key) => {
      if (key === "deleted") {
        this.deleted = patch.native[key];
      } else if (key === "safe") {
        this.safe = patch.native[key];
      } else if (key === "new") ; else {
        console.error(`${key} is not a valid native field`);
      }
    });
    Object.keys(patch.props).forEach((key) => {
      this.setProp(key, patch.props[key]);
    });
    patch.relations.forEach((rel) => {
      switch (rel.type) {
        case 0 /* has */:
          if (rel.op === 1 /* add */) {
            this._has.get(rel.name).add(rel.value);
          } else if (rel.op === 2 /* delete */) {
            this._has.get(rel.name).remove(rel.value);
          } else {
            console.error(`unsupported op for has relation: ${rel.op}`);
          }
          break;
        case 1 /* in */:
          if (rel.op === 1 /* add */) {
            this._in.get(rel.name).add(rel.value);
          } else if (rel.op === 2 /* delete */) {
            this._in.get(rel.name).remove(rel.value);
          } else {
            console.error(`unsupported op for has relation: ${rel.op}`);
          }
          break;
        default:
          console.error(`unsupported relation type for relation: ${rel.type}`);
      }
    });
  }
  setNameWithLang(name, lang2) {
    this.nameI18n.setLang(name, lang2);
  }
  nameWithLang(lang2) {
    return this.nameI18n.getLang(lang2);
  }
  descriptionWithLang(lang2) {
    return this.descriptionI18n.getLang(lang2);
  }
  setDescriptionWithLang(name, lang2) {
    this.descriptionI18n.setLang(name, lang2);
  }
  getProp(propName) {
    if (!this._props.has(propName)) {
      debugger;
      throw new Error(`unknown prop ${propName}`);
    }
    return this._props.get(propName);
  }
  setProp(propName, value) {
    this._props.set(propName, value);
  }
  get description() {
    return this.descriptionI18n.text;
  }
  set description(newName) {
    this.descriptionI18n.text = newName;
  }
};
__publicField(Orm, "_schema", null);

// src/engine/memoryDb.ts
var memory = /* @__PURE__ */ new Map();
var reactiveWrapper = reactive;
var getRecord = (objectName, id) => {
  if (!memory.has(objectName)) {
    memory.set(objectName, /* @__PURE__ */ new Map());
  }
  if (!memory.get(objectName).has(id)) {
    throw new Error(`cannot find ${objectName} with id ${id}`);
  }
  return memory.get(objectName).get(id);
};
var addRecord = (objectName, obj) => {
  if (!memory.has(objectName)) {
    memory.set(objectName, /* @__PURE__ */ new Map());
  }
  memory.get(objectName).set(obj.id, reactiveWrapper(obj));
};

// src/engine/the-d/index.ts
var DSafeIndex = /* @__PURE__ */ new Map();
var DSafeCheck = (element, type) => {
  if (element.deleted || !element.safe) {
    if (!DSafeIndex.has(type)) {
      DSafeIndex.set(type, /* @__PURE__ */ new Set());
    }
    DSafeIndex.get(type).add(element.id);
  } else {
    if (DSafeIndex.has(type)) {
      if (DSafeIndex.get(type).has(element.id)) {
        DSafeIndex.get(type).delete(element.id);
      }
    }
  }
};

// src/generated/Activity.ts
var NewActivityWithId = (id) => {
  const tmpRecord = new Activity(Activity.createNewRequest(id));
  addRecord("Activity", tmpRecord);
  return getRecord("Activity", tmpRecord.id);
};
var Activity = class extends Orm {
  constructor(json) {
    super(json, lang);
    addRecord("Activity", this);
  }
  set deleted(value) {
    super.deleted = value;
    DSafeCheck(this, "Activity");
    PatchInstance.addPatch("Activity", this._id, {
      op: 0 /* replace */,
      type: 4 /* native */,
      value,
      name: "deleted"
    });
  }
  set safe(value) {
    super.safe = value;
    DSafeCheck(this, "Activity");
    PatchInstance.addPatch("Activity", this._id, {
      op: 0 /* replace */,
      type: 4 /* native */,
      value,
      name: "safe"
    });
  }
  get objectId() {
    return this.getProp("objectId");
  }
  set objectId(value) {
    this.setProp("objectId", value);
    PatchInstance.addPatch("Activity", this._id, {
      op: 0 /* replace */,
      type: 2 /* prop */,
      value,
      name: "objectId"
    });
  }
  get action() {
    return this.getProp("action");
  }
  set action(value) {
    this.setProp("action", value);
    PatchInstance.addPatch("Activity", this._id, {
      op: 0 /* replace */,
      type: 2 /* prop */,
      value,
      name: "action"
    });
  }
  get ts() {
    return this.getProp("ts");
  }
  set ts(value) {
    this.setProp("ts", value);
    PatchInstance.addPatch("Activity", this._id, {
      op: 0 /* replace */,
      type: 2 /* prop */,
      value,
      name: "ts"
    });
  }
  static Load(id) {
    return getRecord("Activity", id);
  }
  get deleted() {
    return super.deleted;
  }
  get safe() {
    return super.safe;
  }
  get name() {
    return this.nameI18n.text;
  }
  set name(value) {
    this.nameI18n.text = value;
    PatchInstance.addPatch("Activity", this._id, {
      op: 0 /* replace */,
      type: 3 /* i18n */,
      value,
      name: "name"
    });
  }
  setNameWithLang(value, lang2) {
    super.setNameWithLang(value, lang2);
    PatchInstance.addPatch("Activity", this._id, {
      op: 0 /* replace */,
      type: 3 /* i18n */,
      value,
      name: "name_" + lang2
    });
  }
  get description() {
    return this.descriptionI18n.text;
  }
  set description(value) {
    this.descriptionI18n.text = value;
    PatchInstance.addPatch("Activity", this._id, {
      op: 0 /* replace */,
      type: 3 /* i18n */,
      value,
      name: "description"
    });
  }
  setDescriptionWithLang(value, lang2) {
    super.setDescriptionWithLang(value, lang2);
    PatchInstance.addPatch("Activity", this._id, {
      op: 0 /* replace */,
      type: 3 /* i18n */,
      value,
      name: "description_" + lang2
    });
  }
};
__publicField(Activity, "type", "Activity");
__publicField(Activity, "_schema", {
  "name": "Activity",
  "props": [
    {
      "name": "objectId",
      "type": "number"
    },
    {
      "name": "action",
      "type": "ActivityAction"
    },
    {
      "name": "ts",
      "type": "number"
    }
  ]
});

// src/generated/Tag.ts
var NewTagWithId = (id) => {
  const tmpRecord = new Tag(Tag.createNewRequest(id));
  addRecord("Tag", tmpRecord);
  return getRecord("Tag", tmpRecord.id);
};
var _Tag = class _Tag extends Orm {
  constructor(json) {
    super(json, lang);
    addRecord("Tag", this);
  }
  set deleted(value) {
    super.deleted = value;
    DSafeCheck(this, "Tag");
    PatchInstance.addPatch("Tag", this._id, {
      op: 0 /* replace */,
      type: 4 /* native */,
      value,
      name: "deleted"
    });
  }
  set safe(value) {
    super.safe = value;
    DSafeCheck(this, "Tag");
    PatchInstance.addPatch("Tag", this._id, {
      op: 0 /* replace */,
      type: 4 /* native */,
      value,
      name: "safe"
    });
  }
  get coverImage() {
    return this.getProp("coverImage");
  }
  set coverImage(value) {
    this.setProp("coverImage", value);
    PatchInstance.addPatch("Tag", this._id, {
      op: 0 /* replace */,
      type: 2 /* prop */,
      value,
      name: "coverImage"
    });
  }
  static Load(id) {
    return getRecord("Tag", id);
  }
  get deleted() {
    return super.deleted;
  }
  get safe() {
    return super.safe;
  }
  get name() {
    return this.nameI18n.text;
  }
  set name(value) {
    this.nameI18n.text = value;
    PatchInstance.addPatch("Tag", this._id, {
      op: 0 /* replace */,
      type: 3 /* i18n */,
      value,
      name: "name"
    });
  }
  setNameWithLang(value, lang2) {
    super.setNameWithLang(value, lang2);
    PatchInstance.addPatch("Tag", this._id, {
      op: 0 /* replace */,
      type: 3 /* i18n */,
      value,
      name: "name_" + lang2
    });
  }
  get description() {
    return this.descriptionI18n.text;
  }
  set description(value) {
    this.descriptionI18n.text = value;
    PatchInstance.addPatch("Tag", this._id, {
      op: 0 /* replace */,
      type: 3 /* i18n */,
      value,
      name: "description"
    });
  }
  setDescriptionWithLang(value, lang2) {
    super.setDescriptionWithLang(value, lang2);
    PatchInstance.addPatch("Tag", this._id, {
      op: 0 /* replace */,
      type: 3 /* i18n */,
      value,
      name: "description_" + lang2
    });
  }
  get tagsIds() {
    return this._has.get("tags").allIds();
  }
  get tags() {
    return this.tagsIds.map((id) => _Tag.Load(id));
  }
  addTag(id, propagate = true) {
    if (!this.hasTag(id)) {
      this._has.get("tags").add(id);
      PatchInstance.addPatch("Tag", this._id, {
        op: 1 /* add */,
        type: 0 /* has */,
        value: id,
        name: "tags"
      });
      if (propagate) {
        const record = getRecord("Tag", id);
        record.addIntoTag(this._id, false);
      }
    }
  }
  hasTag(id) {
    return this._has.get("tags").has(id);
  }
  removeTag(id, propagate = true) {
    if (this.hasTag(id)) {
      this._has.get("tags").remove(id);
      PatchInstance.addPatch("Tag", this._id, {
        op: 2 /* delete */,
        type: 0 /* has */,
        value: id,
        name: "tags"
      });
      if (propagate) {
        const record = getRecord("Tag", id);
        record.removeFromTag(this._id, false);
      }
    }
  }
  get booksIds() {
    return this._has.get("books").allIds();
  }
  get books() {
    return this.booksIds.map((id) => Book.Load(id));
  }
  addBook(id, propagate = true) {
    if (!this.hasBook(id)) {
      this._has.get("books").add(id);
      PatchInstance.addPatch("Tag", this._id, {
        op: 1 /* add */,
        type: 0 /* has */,
        value: id,
        name: "books"
      });
      if (propagate) {
        const record = getRecord("Book", id);
        record.addIntoTag(this._id, false);
      }
    }
  }
  hasBook(id) {
    return this._has.get("books").has(id);
  }
  removeBook(id, propagate = true) {
    if (this.hasBook(id)) {
      this._has.get("books").remove(id);
      PatchInstance.addPatch("Tag", this._id, {
        op: 2 /* delete */,
        type: 0 /* has */,
        value: id,
        name: "books"
      });
      if (propagate) {
        const record = getRecord("Book", id);
        record.removeFromTag(this._id, false);
      }
    }
  }
  get inTagsIds() {
    return this._in.get("tags").allIds();
  }
  get inTags() {
    return this.inTagsIds.map((id) => _Tag.Load(id));
  }
  addIntoTag(id, propagate = true) {
    if (!this.isInTag(id)) {
      this._in.get("tags").add(id);
      PatchInstance.addPatch("Tag", this._id, {
        op: 1 /* add */,
        type: 1 /* in */,
        value: id,
        name: "tags"
      });
      if (propagate) {
        const record = getRecord("Tag", id);
        record.addTag(this._id, false);
      }
    }
  }
  isInTag(id) {
    return this._in.get("tags").has(id);
  }
  removeFromTag(id, propagate = true) {
    if (this.isInTag(id)) {
      this._in.get("tags").remove(id);
      PatchInstance.addPatch("Tag", this._id, {
        op: 2 /* delete */,
        type: 1 /* in */,
        value: id,
        name: "tags"
      });
      if (propagate) {
        const record = getRecord("Tag", id);
        record.removeTag(this._id, false);
      }
    }
  }
};
__publicField(_Tag, "type", "Tag");
__publicField(_Tag, "_schema", {
  "name": "Tag",
  "_in": [
    {
      "name": "tags",
      "type": "Tag",
      "inverted": "tags"
    }
  ],
  "_has": [
    {
      "name": "tags",
      "type": "Tag",
      "inverted": "tags"
    },
    {
      "name": "books",
      "type": "Book",
      "inverted": "tags"
    }
  ],
  "props": [
    {
      "name": "coverImage",
      "type": "string"
    }
  ]
});
var Tag = _Tag;

// src/generated/Book.ts
var NewBookWithId = (id) => {
  const tmpRecord = new Book(Book.createNewRequest(id));
  addRecord("Book", tmpRecord);
  return getRecord("Book", tmpRecord.id);
};
var Book = class extends Orm {
  constructor(json) {
    super(json, lang);
    addRecord("Book", this);
  }
  set deleted(value) {
    super.deleted = value;
    DSafeCheck(this, "Book");
    PatchInstance.addPatch("Book", this._id, {
      op: 0 /* replace */,
      type: 4 /* native */,
      value,
      name: "deleted"
    });
  }
  set safe(value) {
    super.safe = value;
    DSafeCheck(this, "Book");
    PatchInstance.addPatch("Book", this._id, {
      op: 0 /* replace */,
      type: 4 /* native */,
      value,
      name: "safe"
    });
  }
  get coverImage() {
    return this.getProp("coverImage");
  }
  set coverImage(value) {
    this.setProp("coverImage", value);
    PatchInstance.addPatch("Book", this._id, {
      op: 0 /* replace */,
      type: 2 /* prop */,
      value,
      name: "coverImage"
    });
  }
  get pdf() {
    return this.getProp("pdf");
  }
  set pdf(value) {
    this.setProp("pdf", value);
    PatchInstance.addPatch("Book", this._id, {
      op: 0 /* replace */,
      type: 2 /* prop */,
      value,
      name: "pdf"
    });
  }
  get nbPages() {
    return this.getProp("nbPages");
  }
  set nbPages(value) {
    this.setProp("nbPages", value);
    PatchInstance.addPatch("Book", this._id, {
      op: 0 /* replace */,
      type: 2 /* prop */,
      value,
      name: "nbPages"
    });
  }
  get size() {
    return this.getProp("size");
  }
  set size(value) {
    this.setProp("size", value);
    PatchInstance.addPatch("Book", this._id, {
      op: 0 /* replace */,
      type: 2 /* prop */,
      value,
      name: "size"
    });
  }
  static Load(id) {
    return getRecord("Book", id);
  }
  get deleted() {
    return super.deleted;
  }
  get safe() {
    return super.safe;
  }
  get name() {
    return this.nameI18n.text;
  }
  set name(value) {
    this.nameI18n.text = value;
    PatchInstance.addPatch("Book", this._id, {
      op: 0 /* replace */,
      type: 3 /* i18n */,
      value,
      name: "name"
    });
  }
  setNameWithLang(value, lang2) {
    super.setNameWithLang(value, lang2);
    PatchInstance.addPatch("Book", this._id, {
      op: 0 /* replace */,
      type: 3 /* i18n */,
      value,
      name: "name_" + lang2
    });
  }
  get description() {
    return this.descriptionI18n.text;
  }
  set description(value) {
    this.descriptionI18n.text = value;
    PatchInstance.addPatch("Book", this._id, {
      op: 0 /* replace */,
      type: 3 /* i18n */,
      value,
      name: "description"
    });
  }
  setDescriptionWithLang(value, lang2) {
    super.setDescriptionWithLang(value, lang2);
    PatchInstance.addPatch("Book", this._id, {
      op: 0 /* replace */,
      type: 3 /* i18n */,
      value,
      name: "description_" + lang2
    });
  }
  get inTagsIds() {
    return this._in.get("tags").allIds();
  }
  get inTags() {
    return this.inTagsIds.map((id) => Tag.Load(id));
  }
  addIntoTag(id, propagate = true) {
    if (!this.isInTag(id)) {
      this._in.get("tags").add(id);
      PatchInstance.addPatch("Book", this._id, {
        op: 1 /* add */,
        type: 1 /* in */,
        value: id,
        name: "tags"
      });
      if (propagate) {
        const record = getRecord("Tag", id);
        record.addBook(this._id, false);
      }
    }
  }
  isInTag(id) {
    return this._in.get("tags").has(id);
  }
  removeFromTag(id, propagate = true) {
    if (this.isInTag(id)) {
      this._in.get("tags").remove(id);
      PatchInstance.addPatch("Book", this._id, {
        op: 2 /* delete */,
        type: 1 /* in */,
        value: id,
        name: "tags"
      });
      if (propagate) {
        const record = getRecord("Tag", id);
        record.removeBook(this._id, false);
      }
    }
  }
};
__publicField(Book, "type", "Book");
__publicField(Book, "_schema", {
  "name": "Book",
  "_in": [
    {
      "name": "tags",
      "type": "Tag",
      "inverted": "books"
    }
  ],
  "props": [
    {
      "name": "coverImage",
      "type": "string"
    },
    {
      "name": "pdf",
      "type": "string"
    },
    {
      "name": "nbPages",
      "type": "number"
    },
    {
      "name": "size",
      "type": "number"
    }
  ]
});

// src/generated/Vote.ts
var NewVoteWithId = (id) => {
  const tmpRecord = new Vote(Vote.createNewRequest(id));
  addRecord("Vote", tmpRecord);
  return getRecord("Vote", tmpRecord.id);
};
var Vote = class extends Orm {
  constructor(json) {
    super(json, lang);
    addRecord("Vote", this);
  }
  set deleted(value) {
    super.deleted = value;
    DSafeCheck(this, "Vote");
    PatchInstance.addPatch("Vote", this._id, {
      op: 0 /* replace */,
      type: 4 /* native */,
      value,
      name: "deleted"
    });
  }
  set safe(value) {
    super.safe = value;
    DSafeCheck(this, "Vote");
    PatchInstance.addPatch("Vote", this._id, {
      op: 0 /* replace */,
      type: 4 /* native */,
      value,
      name: "safe"
    });
  }
  get ts() {
    return this.getProp("ts");
  }
  set ts(value) {
    this.setProp("ts", value);
    PatchInstance.addPatch("Vote", this._id, {
      op: 0 /* replace */,
      type: 2 /* prop */,
      value,
      name: "ts"
    });
  }
  get action() {
    return this.getProp("action");
  }
  set action(value) {
    this.setProp("action", value);
    PatchInstance.addPatch("Vote", this._id, {
      op: 0 /* replace */,
      type: 2 /* prop */,
      value,
      name: "action"
    });
  }
  get link1() {
    return this.getProp("link1");
  }
  set link1(value) {
    this.setProp("link1", value);
    PatchInstance.addPatch("Vote", this._id, {
      op: 0 /* replace */,
      type: 2 /* prop */,
      value,
      name: "link1"
    });
  }
  get link2() {
    return this.getProp("link2");
  }
  set link2(value) {
    this.setProp("link2", value);
    PatchInstance.addPatch("Vote", this._id, {
      op: 0 /* replace */,
      type: 2 /* prop */,
      value,
      name: "link2"
    });
  }
  get link3() {
    return this.getProp("link3");
  }
  set link3(value) {
    this.setProp("link3", value);
    PatchInstance.addPatch("Vote", this._id, {
      op: 0 /* replace */,
      type: 2 /* prop */,
      value,
      name: "link3"
    });
  }
  get confirmed() {
    return this.getProp("confirmed");
  }
  set confirmed(value) {
    this.setProp("confirmed", value);
    PatchInstance.addPatch("Vote", this._id, {
      op: 0 /* replace */,
      type: 2 /* prop */,
      value,
      name: "confirmed"
    });
  }
  static Load(id) {
    return getRecord("Vote", id);
  }
  get deleted() {
    return super.deleted;
  }
  get safe() {
    return super.safe;
  }
  get name() {
    return this.nameI18n.text;
  }
  set name(value) {
    this.nameI18n.text = value;
    PatchInstance.addPatch("Vote", this._id, {
      op: 0 /* replace */,
      type: 3 /* i18n */,
      value,
      name: "name"
    });
  }
  setNameWithLang(value, lang2) {
    super.setNameWithLang(value, lang2);
    PatchInstance.addPatch("Vote", this._id, {
      op: 0 /* replace */,
      type: 3 /* i18n */,
      value,
      name: "name_" + lang2
    });
  }
  get description() {
    return this.descriptionI18n.text;
  }
  set description(value) {
    this.descriptionI18n.text = value;
    PatchInstance.addPatch("Vote", this._id, {
      op: 0 /* replace */,
      type: 3 /* i18n */,
      value,
      name: "description"
    });
  }
  setDescriptionWithLang(value, lang2) {
    super.setDescriptionWithLang(value, lang2);
    PatchInstance.addPatch("Vote", this._id, {
      op: 0 /* replace */,
      type: 3 /* i18n */,
      value,
      name: "description_" + lang2
    });
  }
};
__publicField(Vote, "type", "Vote");
__publicField(Vote, "_schema", {
  "name": "Vote",
  "props": [
    {
      "name": "ts",
      "type": "number"
    },
    {
      "name": "action",
      "type": "VoteAction"
    },
    {
      "name": "link1",
      "type": "number"
    },
    {
      "name": "link2",
      "type": "number"
    },
    {
      "name": "link3",
      "type": "number"
    },
    {
      "name": "confirmed",
      "type": "boolean"
    }
  ]
});

// src/generated/index.ts
var newWithId = () => ({
  "Activity": NewActivityWithId,
  "Book": NewBookWithId,
  "Tag": NewTagWithId,
  "Vote": NewVoteWithId
});

// src/engine/patcher.ts
var ObjectPatch2Patches = (objectName, id, objectPatch) => {
  const result = [];
  objectPatch.relations.forEach((rel) => {
    const { name, type, op, value } = rel;
    result.push({
      name,
      type,
      objectName,
      id,
      op,
      value
    });
  });
  Object.keys(objectPatch.i18n).forEach((key) => {
    result.push({
      name: key,
      type: 3 /* i18n */,
      objectName,
      id,
      op: 0 /* replace */,
      value: objectPatch.i18n[key]
    });
  });
  Object.keys(objectPatch.props).forEach((key) => {
    result.push({
      name: key,
      type: 2 /* prop */,
      objectName,
      id,
      op: 0 /* replace */,
      value: objectPatch.props[key]
    });
  });
  Object.keys(objectPatch.native).forEach((key) => {
    result.push({
      name: key,
      type: 4 /* native */,
      objectName,
      id,
      op: 0 /* replace */,
      value: objectPatch.native[key]
    });
  });
  return result;
};
var Patches = class extends PatchSanitizer {
  constructor() {
    super();
    /**
     * using broadcast channels between tabs, we want to make sure we dont loop broadcast,
     * @protected
     */
    __publicField(this, "locked", false);
    __publicField(this, "thread");
    __publicField(this, "_debouncedSync", useDebounceFn(this.sync, 500));
    console.log("new PatchInstance constructor()");
  }
  initThread(thread) {
    console.log("InitPatchInstance with thread", thread);
    this.thread = thread;
  }
  lock() {
    this.locked = true;
  }
  unlock() {
    this.locked = false;
  }
  /*
      Initially called when the worker loads
   */
  processCollection(collection) {
    this.lock();
    Object.keys(collection).forEach((objectName) => {
      Object.keys(collection[objectName]).forEach((id) => {
        const _id = parseInt(id, 10);
        if (collection[objectName][id].native.new) {
          if (newWithId()[objectName]) {
            const obj = newWithId()[objectName](_id);
            obj.patch(collection[objectName][id]);
          } else {
            console.error(`cannot find constructor for ${objectName}`);
          }
        } else {
          const obj = getRecord(objectName, _id);
          obj.patch(collection[objectName][id]);
        }
      });
    });
    this.unlock();
  }
  addPatch(name, id, patchOperation) {
    if (this.locked) {
      return;
    }
    const patch = __spreadValues({
      objectName: name,
      id
    }, patchOperation);
    this.add(patch);
    this._debouncedSync();
  }
  isLocked() {
    return this.locked;
  }
  async sync() {
    const data = this._patches;
    this.clear();
    if (Object.keys(data).length === 0) {
      return true;
    }
    if (!this.locked) {
      if (typeof this.thread === "undefined") {
        console.error(`thread not initialized in Patches`);
        return null;
      }
      const result = await this.thread.sendRequest({
        cmd: "savePatches" /* SavePatches */,
        payload: data
      });
      return result;
    }
    return;
  }
};
var PatchInstance = new Patches();

// src/engine/idb/patch_storage.ts
var bulkAddPatches = (collection) => {
  const deferred = proResolver();
  let error = false;
  Db().then((db) => {
    if (Object.keys(collection).length === 0) return deferred.resolve(true);
    const tx = db.transaction(patchStoreName, "readwrite");
    Object.keys(collection).forEach((objectName) => {
      Object.keys(collection[objectName]).forEach((id) => {
        const patches = ObjectPatch2Patches(objectName, parseInt(id, 10), collection[objectName][id]);
        patches.forEach((patch) => {
          if (!error) {
            const add = tx.objectStore(patchStoreName).add(patch);
            add.onerror = function(event) {
              error = true;
              console.error(`error inserting ${patch}`, event.target);
              deferred.reject(new Error(`error inserting ${patch}`));
            };
            add.onsuccess = (evt) => {
              console.log(`success added `);
            };
          }
        });
      });
    });
    tx.oncomplete = function() {
      deferred.resolve(true);
    };
    tx.onerror = function(event) {
      deferred.reject(event.target);
    };
  }).catch((e) => {
    console.error(`[indexdb error:] hasFile(): ${e.message}`);
    deferred.reject(e);
  });
  return deferred.pro;
};
var getAllPatches = () => {
  const deferred = proResolver();
  Db().then(async (db) => {
    const tx = db.transaction(patchStoreName, "readonly");
    tx.objectStore(patchStoreName).getAll().onsuccess = (event) => {
      if (event.target.result) {
        if (event.target.result) {
          deferred.resolve(processAllPatches(event.target.result));
        } else {
          deferred.resolve({});
        }
      } else {
        deferred.resolve({});
      }
    };
    tx.oncomplete = function(event) {
    };
    tx.onerror = function(event) {
      console.log("worker: error loading all patches", event.target);
      deferred.reject(event.target);
    };
  }).catch(deferred.reject);
  return deferred.pro;
};
var processAllPatches = (patches = []) => {
  const sanitizer = new PatchSanitizer();
  patches.forEach((p) => {
    sanitizer.add(p);
  });
  return sanitizer.data;
};

// src/engine/worker/downloader.ts
var downloadStatus = {
  progress: {},
  done: {}};
var getArData = async (id) => {
  let resp;
  try {
    const url = `https://arweave.net/${id}`;
    resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`Bad http status code`, {
        cause: { status: resp.status, statusText: resp.statusText }
      });
    }
    return new Uint8Array(await resp.arrayBuffer());
  } catch (error) {
    console.error(error);
    console.error(`Error while downloading data for ${id}`);
    throw error;
  }
};
var download = async (id) => {
  if (id.startsWith("http")) {
    return fetch(id).then(async (res) => {
      return new Uint8Array(await res.arrayBuffer());
    });
  } else {
    return getArData(id);
  }
};

// src/utils/dates.ts
var DateUtils = {
  now: () => Math.floor(Date.now() / 1e3),
  toNumber: (d) => Math.floor(d.getTime() / 1e3),
  fromNumber: (i) => new Date(i * 1e3)
};

// src/utils/binary.ts
var uint8ArrToText = (arr) => new TextDecoder().decode(arr);

// src/engine/worker/utils.ts
var compressIfNot = async (data) => {
  if (isGzip(data)) {
    const inflated = await decompress(data);
    return [inflated, data];
  } else {
    const compressed = await compress(new Blob([data]));
    return [data, compressed];
  }
};
var DownloadAndStore = async (url, mime) => {
  const original = await download(url);
  const [inflated, deflated] = await compressIfNot(original);
  await storeFile({
    id: url,
    content: deflated,
    mime,
    sizeKb: Math.ceil(inflated.byteLength / 1024),
    creationTime: DateUtils.now(),
    local: false
  });
  return inflated;
};
var easyGet = async (url, mime) => {
  if (!await hasFile(url, mime)) {
    return DownloadAndStore(url, mime);
  } else {
    const blob = (await loadFile(url, mime)).content;
    return await decompress(blob);
  }
};

// src/engine/worker/initialLoad.ts
var initialLoad = async (catalogUrl, selectedLang) => {
  const catalogBlob = await easyGet(catalogUrl, "application/json" /* JSON */);
  const catalog = JSON.parse(uint8ArrToText(catalogBlob));
  const content = catalog[selectedLang];
  const allTopicsBlob = await easyGet(content[3], "application/json" /* JSON */);
  const allTopicsRecord = JSON.parse(uint8ArrToText(allTopicsBlob));
  const allBooksBlob = await easyGet(content[4], "application/json" /* JSON */);
  const bookList = JSON.parse(uint8ArrToText(allBooksBlob));
  const { preview, pdf } = await getAllDone();
  preview.forEach((elem) => downloadStatus.done[elem] = true);
  pdf.forEach((elem) => downloadStatus.done[elem] = true);
  const patches = await getAllPatches();
  return { topicsJson: allTopicsRecord, booksJson: bookList, preview, pdf, patches, topLevels: content[2] };
};

// src/custom_types/fifo.ts
var Fifo = class extends StringSet {
  constructor(set) {
    super(set);
  }
  prioritize(id) {
    this.remove(id);
    this.add(id);
  }
  pop(nb) {
    if (this._set.length <= nb) {
      const result2 = [...this._set];
      this._set = [];
      this._index = {};
      return result2;
    }
    const result = [];
    for (let i = 0; i < nb; i++) {
      result.push(this._set.pop());
    }
    return result;
  }
  // shift(nb:number): Array<string> {
  //     if (this._set.length<=nb) {
  //         const result =  [...this._set]
  //         this._set = []
  //         this._index = {}
  //         return result as Array<string>;
  //     }
  //
  //     const result: Array<string> = [];
  //     for (let i=0; i<nb; i++) {
  //         result.push(this._set.shift() as string)
  //     }
  //     return result;
  // }
};

// src/utils/donwloadManager.ts
var ConcurrentProcessor = class {
  constructor(config) {
    this.config = config;
    __publicField(this, "queue", new Fifo([]));
    // Queue for pending items
    __publicField(this, "activeProcessors", 0);
    // Track currently running processors
    __publicField(this, "isRunning", true);
    __publicField(this, "cbs", {});
  }
  /** Adds a new item to the processing queue */
  add(item, cb = null) {
    this.queue.add(item);
    if (typeof this.cbs[item] === "undefined") {
      this.cbs[item] = [];
    }
    if (cb) {
      this.cbs[item].push(cb);
    }
    this.processNext();
  }
  stop() {
    this.isRunning = false;
  }
  start() {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    for (let i = 0; i < this.config.concurrency; i++) {
      this.processNext();
    }
  }
  /** Start the processor loop */
  async processNext() {
    if (this.activeProcessors >= this.config.concurrency || this.queue.size() === 0 || !this.isRunning) {
      return;
    }
    const item = this.queue.pop(1)[0];
    this.activeProcessors++;
    try {
      this.config.onStart(item);
      const data = await this.config.processor(item);
      await storeFile({
        sizeKb: Math.ceil(data.byteLength / 1024),
        mime: this.config.mime,
        id: item,
        content: data,
        local: false,
        creationTime: Date.now()
      });
      this.config.onDone(item);
    } catch (error) {
      this.config.onError(item, error);
      console.error(`Error processing item ${item}:`, error);
    } finally {
      this.activeProcessors--;
      this.processNext();
    }
  }
};

// src/engine/worker/bin/db.ts
var newConfig = (concurrency, mime, thread) => {
  return {
    mime,
    onError: (url, e) => {
      console.error(`error downloading url`, url, e);
      thread.postEvent("downloadError" /* DownloadError */, { url, error: e });
    },
    concurrency,
    onDone: (url) => {
      downloadStatus.done[url] = true;
      delete downloadStatus.progress[url];
      thread.postEvent("downloadFinished" /* DownloadFinished */, { fileId: url, mime });
    },
    onStart: (url) => {
      downloadStatus.progress[url] = true;
      thread.postEvent("downloadStarted" /* DownloadStarted */, url);
    },
    processor: (url) => {
      return download(url);
    }
  };
};
var DbWorker = class extends ThreadWorker {
  constructor() {
    super();
    __publicField(this, "imageDownloader");
    __publicField(this, "pdfDownloader");
    getAllDone().then(({ pdf, preview }) => {
      pdf.forEach((url) => downloadStatus.done[url] = true);
      preview.forEach((url) => downloadStatus.done[url] = true);
      console.log(`[worker] constructor - ready`);
      this.postEvent("workerready" /* WorkerReady */, true);
    }).catch((e) => {
      console.error(`[worker] constructor - getAllDone: error: ${e.message}`);
      this.postEvent("workerLoadingError" /* WorkerLoadingError */, e);
    });
    this.imageDownloader = new ConcurrentProcessor(newConfig(3, "image/*" /* IMAGE */, this));
    this.pdfDownloader = new ConcurrentProcessor(newConfig(2, "application/pdf" /* PDF */, this));
  }
  async getFile(id, url, mime) {
    const present = downloadStatus.done[url] === true || await hasFile(url, mime);
    if (present) {
      downloadStatus.done[url] = true;
      this.postEvent("downloadFinished" /* DownloadFinished */, { fileId: url, mime });
      const fileData = await loadFile(url, mime);
      this.sendResponse(id, fileData);
    } else {
      const cb = (data) => {
        this.sendResponse(id, data);
      };
      switch (mime) {
        case "application/pdf" /* PDF */:
          this.pdfDownloader.add(url, cb);
          break;
        case "image/*" /* IMAGE */:
          this.imageDownloader.add(url, cb);
          break;
        default:
          console.error(`unknown MIME TYPE ${mime}`);
          throw new Error(`unknown mime type ${mime}`);
      }
    }
  }
  onRequest(id, data) {
    const error = (e) => {
      console.error(`[worker] caught error: ${e.message}`);
      this.sendError(id, e);
    };
    const { cmd, payload } = data;
    switch (cmd) {
      /**
       * makes sure all initial JSON is downloaded, then send that back to the browser
       */
      case "init" /* Init */:
        const { catalogUrl, selectedLang } = payload;
        initialLoad(catalogUrl, selectedLang).then((data2) => {
          this.sendResponse(id, data2);
        }).catch(error);
        break;
      case "downloadCovers" /* DownloadCovers */:
        const coverIds = payload;
        coverIds.forEach((elem) => {
          if (typeof downloadStatus.done[elem] === "undefined") {
            this.imageDownloader.add(elem);
          }
        });
        this.imageDownloader.start();
        this.sendResponse(id, true);
        break;
      case "StoreLocalFile" /* StoreLocalFile */:
        const fileRecord = payload;
        this.postEvent("downloadStarted" /* DownloadStarted */, fileRecord.fileId);
        storeFile(fileRecord).then((data2) => {
          this.postEvent("downloadFinished" /* DownloadFinished */, { fileId: fileRecord.fileId, mime: fileRecord.mime });
          this.sendResponse(id, data2);
        }).catch(error);
        break;
      case "getFile" /* GetFile */:
        const { url, mime } = payload;
        this.getFile(id, url, mime).catch(error);
        break;
      /**
       * gets called automatically everytime a change is made in the frontend
       */
      case "savePatches" /* SavePatches */:
        const patches = payload;
        bulkAddPatches(patches).then((data2) => {
          this.sendResponse(id, data2);
        }).catch(error);
        break;
      default:
        console.error(`[worker] unknown action: ${cmd}`);
    }
  }
};
var LaunchDbWorker = async () => {
  await Db();
  new DbWorker();
  return true;
};

// src/engine/worker/bin/index.ts
LaunchDbWorker();
