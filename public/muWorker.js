'use strict';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
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

// src/engine/idb/book_data_storage.ts
var hasBookData = (fileId) => {
  const deferred = proResolver();
  Db().then((db) => {
    try {
      const tx = db.transaction(pdfDataStoreName, "readonly");
      const req = tx.objectStore(pdfDataStoreName).openCursor(fileId);
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
var loadBookData = (fileId) => {
  const deferred = proResolver();
  Db().then((db) => {
    const tx = db.transaction(pdfDataStoreName, "readonly");
    let result = void 0;
    tx.objectStore(pdfDataStoreName).get(fileId).addEventListener("success", function(event) {
      result = event.target.result;
    });
    tx.oncomplete = function() {
      deferred.resolve(result);
    };
    tx.onerror = function(event) {
      deferred.reject(event.target);
    };
  }).catch(deferred.reject);
  return deferred.pro;
};
var storeBookData = (record) => {
  const deferred = proResolver();
  Db().then(async (db) => {
    const has = await hasBookData(record.fileId);
    const tx = db.transaction(pdfDataStoreName, "readwrite");
    if (has) {
      tx.objectStore(pdfDataStoreName).put(record);
    } else {
      tx.objectStore(pdfDataStoreName).add(record);
    }
    tx.oncomplete = function() {
      deferred.resolve(true);
    };
    tx.onerror = function(event) {
      console.error("worker: error", event.target);
      deferred.reject(event.target);
    };
  }).catch(deferred.reject);
  return deferred.pro;
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

// src/engine/idb/book_storage.ts
var hasBookPage = (fileId, pageNumber) => {
  const deferred = proResolver();
  Db().then((db) => {
    try {
      const tx = db.transaction(pdfPagesStoreName, "readonly");
      const req = tx.objectStore(pdfPagesStoreName).openCursor([fileId, pageNumber]);
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
var loadPage = (fileId, page) => {
  const deferred = proResolver();
  Db().then((db) => {
    const tx = db.transaction(pdfPagesStoreName, "readonly");
    let result = void 0;
    tx.objectStore(pdfPagesStoreName).get([fileId, page]).addEventListener("success", function(event) {
      if (event.target.result) {
        result = event.target.result;
        decompress(result.content).then((data) => {
          result.content = data;
          deferred.resolve(result);
          console.log(`[worker] - page loaded`, result);
        }).catch((err) => {
          console.error(`error decompressing stream`, err);
          deferred.resolve(result);
        });
      }
    });
    tx.oncomplete = function() {
    };
    tx.onerror = function(event) {
      deferred.reject(event.target);
    };
  }).catch(deferred.reject);
  return deferred.pro;
};
var storePage = (record) => {
  const deferred = proResolver();
  Db().then(async (db) => {
    const has = await hasBookPage(record.fileId, record.page);
    const tx = db.transaction(pdfPagesStoreName, "readwrite");
    if (has) {
      tx.objectStore(pdfPagesStoreName).put(record);
    } else {
      tx.objectStore(pdfPagesStoreName).add(record);
    }
    tx.oncomplete = function() {
      deferred.resolve(true);
    };
    tx.onerror = function(event) {
      console.error("worker: error", event.target);
      deferred.reject(event.target);
    };
  }).catch(deferred.reject);
  return deferred.pro;
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

// src/engine/idb/file_storage.ts
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

// src/engine/worker/downloader.ts
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

// src/utils/muManagerIS.ts
globalThis.__filename = "./lib/mupdf-wasm.js";
importScripts("./lib/mupdf-wasm.js");
importScripts("./lib/mupdf.js");
var MuManagerIS = class {
  constructor(concurrency, thread) {
    this.concurrency = concurrency;
    this.thread = thread;
    __publicField(this, "queue", new Fifo([]));
    // Queue for pending items
    __publicField(this, "activeProcessors", 0);
    // Track currently running processors
    __publicField(this, "isRunning", true);
    __publicField(this, "pendingRequests", /* @__PURE__ */ new Map());
  }
  async getBookData(fileId, content) {
    try {
      const has = await hasBookData(fileId);
      if (has) {
        return await loadBookData(fileId);
      }
      const doc = mupdf.Document.openDocument(content, "application/pdf");
      const nbPages = doc.countPages();
      const author = doc.getMetaData("info:Author");
      const title = doc.getMetaData("info:Title");
      const bookData = {
        parsed: false,
        author,
        title,
        fileId,
        dimensions: []
      };
      for (let i = 0; i < nbPages; i++) {
        bookData.dimensions.push(null);
      }
      await storeBookData(bookData);
      this.thread.postEvent("muPdfData" /* MuPdfData */, bookData);
      if (typeof doc.destroy !== "undefined") {
        doc.destroy();
      }
      return bookData;
    } catch (e) {
      console.error(`error getBookData book ${fileId}`, e);
      throw e;
    }
  }
  async processBook(fileId, from, to) {
    if (["http://localhost:3000/pdf/0.pdf", "http://localhost:3000/pdf/1.pdf"].includes(fileId)) {
      const data = await download(fileId);
      await storeFile({
        id: fileId,
        mime: "application/pdf" /* PDF */,
        content: data,
        sizeKb: data.byteLength,
        local: false,
        creationTime: DateUtils.now()
      });
    }
    try {
      const pdf = await loadFile(fileId, "application/pdf" /* PDF */);
      const bookData = await this.getBookData(fileId, pdf.content);
      const nbPages = bookData.dimensions.length;
      const scale = 2;
      if (parseInt(String(to), 10) === 0) {
        to = nbPages - 1;
      }
      if (to > nbPages) {
        to = nbPages;
      }
      if (from > to) {
        throw new Error(`page from>to ${from} > ${to}`);
      }
      for (let i = from; i <= to; i++) {
        if (bookData.dimensions[i] === null) {
          console.log(`processing book page ${i} for ${fileId}`);
          try {
            const doc = mupdf.Document.openDocument(pdf.content, "application/pdf");
            const page = await doc.loadPage(i);
            const rect = page.getBounds();
            bookData.dimensions[i] = {
              width: Math.abs(rect[2] - rect[0]),
              height: Math.abs(rect[3] - rect[1])
            };
            const pix = page.toPixmap(mupdf.Matrix.scale(scale, scale), mupdf.ColorSpace.DeviceRGB, false);
            const buff = pix.asPNG();
            pix.destroy();
            page.destroy();
            doc.destroy();
            const compressed = await compress(new Blob([buff]));
            await storePage({
              fileId,
              page: i,
              content: compressed
            });
            bookData.parsed = bookData.dimensions.reduce((acc, val) => acc && val !== null, true);
            await storeBookData(bookData);
            this.thread.postEvent("muPdfData" /* MuPdfData */, bookData);
          } catch (e) {
            console.error(`error processing page ${i}`, e);
            this.thread.postEvent("muPageError" /* MuPageError */, { e, fileId, page: i });
          }
        }
      }
    } catch (e) {
      console.error(`error processing book ${fileId}`, e);
    }
    return true;
  }
  /** Adds a new item to the processing queue */
  add(request) {
    const pro = proResolver();
    const item = this.request2Item(request);
    if (!this.pendingRequests.has(item)) {
      this.pendingRequests.set(item, pro);
    } else {
      return this.pendingRequests.get(item).pro;
    }
    this.queue.add(item);
    this.processNext();
    return this.pendingRequests.get(item).pro;
  }
  stop() {
    this.isRunning = false;
  }
  start() {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    for (let i = 0; i < this.concurrency; i++) {
      this.processNext();
    }
  }
  request2Item(request) {
    return `${request.fileId}__${request.from}__${request.to}`;
  }
  item2Request(item) {
    const parts = item.split("__");
    return {
      fileId: parts[0],
      from: parseInt(parts[1], 10),
      to: parseInt(parts[2], 10)
    };
  }
  /** Start the processor loop */
  async processNext() {
    if (this.activeProcessors >= this.concurrency) {
      console.warn(`max concurrency ..waiting`);
      return;
    }
    if (this.queue.size() === 0 || !this.isRunning) {
      console.info(`mupdf queue empty - all done`);
      return;
    }
    const item = this.queue.pop(1)[0];
    if (!this.pendingRequests.has(item)) {
      console.error(`logic error - item is not in pending requests`, item);
      this.processNext();
      return;
    }
    if (this.pendingRequests.get(item).isStarted()) {
      this.processNext();
    } else {
      const request = this.item2Request(item);
      this.activeProcessors++;
      try {
        this.pendingRequests.get(item).start();
        await this.processBook(request.fileId, request.from, request.to);
        this.pendingRequests.get(item).resolve(true);
      } catch (error) {
        console.error(`Error processing item ${item}:`, error);
        this.pendingRequests.get(item).reject(error);
      } finally {
        this.activeProcessors--;
        this.processNext();
      }
    }
  }
};

// src/engine/worker/mu/muWorker.ts
var MuWorker = class extends ThreadWorker {
  constructor() {
    super();
    __publicField(this, "muProcessor");
    this.muProcessor = new MuManagerIS(2, this);
    this.postEvent("workerready" /* WorkerReady */, true);
  }
  onRequest(id, data) {
    const { cmd, payload } = data;
    console.log(`[mu-worker]  - received request: ${id} - ${cmd}`, payload);
    switch (cmd) {
      case "processPDF" /* ProcessPDF */: {
        const { fileId } = payload;
        this.muProcessor.add({ fileId, from: 0, to: 0 }).then(() => {
          this.sendResponse(id, true);
        }).catch((e) => {
          this.sendError(id, e);
        });
        break;
      }
      case "processPages" /* ProcessPages */: {
        const { fileId, from, to } = payload;
        this.muProcessor.add({ fileId, from, to }).then(() => {
          this.sendResponse(id, true);
        }).catch((e) => {
          this.sendError(id, e);
        });
        break;
      }
      case "getPage" /* GetPage */: {
        const { fileId, page } = payload;
        loadPage(fileId, page).then((data2) => {
          this.sendResponse(id, data2);
        }).catch((e) => {
          this.sendError(id, e);
        });
        break;
      }
      case "getPdfStatus" /* GetPdfStatus */: {
        const { fileId } = payload;
        loadBookData(fileId).then((data2) => {
          this.sendResponse(id, data2);
        }).catch((err) => {
          this.sendError(id, err);
        });
        break;
      }
      default:
        console.error(`[mu worker] unknown command: ${cmd}`);
        this.sendError(id, new Error(`unknown command ${cmd}`));
    }
  }
};
var LaunchMuWorker = async () => {
  await Db();
  new MuWorker();
  return true;
};

// src/engine/worker/mu/index.ts
LaunchMuWorker();
