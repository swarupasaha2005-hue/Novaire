"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/base32.js/base32.js
var require_base32 = __commonJS({
  "node_modules/base32.js/base32.js"(exports2) {
    "use strict";
    var charmap = function(alphabet, mappings) {
      mappings || (mappings = {});
      alphabet.split("").forEach(function(c, i) {
        if (!(c in mappings)) mappings[c] = i;
      });
      return mappings;
    };
    var rfc4648 = {
      alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
      charmap: {
        0: 14,
        1: 8
      }
    };
    rfc4648.charmap = charmap(rfc4648.alphabet, rfc4648.charmap);
    var crockford = {
      alphabet: "0123456789ABCDEFGHJKMNPQRSTVWXYZ",
      charmap: {
        O: 0,
        I: 1,
        L: 1
      }
    };
    crockford.charmap = charmap(crockford.alphabet, crockford.charmap);
    var base32hex = {
      alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV",
      charmap: {}
    };
    base32hex.charmap = charmap(base32hex.alphabet, base32hex.charmap);
    function Decoder(options) {
      this.buf = [];
      this.shift = 8;
      this.carry = 0;
      if (options) {
        switch (options.type) {
          case "rfc4648":
            this.charmap = exports2.rfc4648.charmap;
            break;
          case "crockford":
            this.charmap = exports2.crockford.charmap;
            break;
          case "base32hex":
            this.charmap = exports2.base32hex.charmap;
            break;
          default:
            throw new Error("invalid type");
        }
        if (options.charmap) this.charmap = options.charmap;
      }
    }
    Decoder.prototype.charmap = rfc4648.charmap;
    Decoder.prototype.write = function(str) {
      var charmap2 = this.charmap;
      var buf = this.buf;
      var shift = this.shift;
      var carry = this.carry;
      str.toUpperCase().split("").forEach(function(char) {
        if (char == "=") return;
        var symbol = charmap2[char] & 255;
        shift -= 5;
        if (shift > 0) {
          carry |= symbol << shift;
        } else if (shift < 0) {
          buf.push(carry | symbol >> -shift);
          shift += 8;
          carry = symbol << shift & 255;
        } else {
          buf.push(carry | symbol);
          shift = 8;
          carry = 0;
        }
      });
      this.shift = shift;
      this.carry = carry;
      return this;
    };
    Decoder.prototype.finalize = function(str) {
      if (str) {
        this.write(str);
      }
      if (this.shift !== 8 && this.carry !== 0) {
        this.buf.push(this.carry);
        this.shift = 8;
        this.carry = 0;
      }
      return this.buf;
    };
    function Encoder(options) {
      this.buf = "";
      this.shift = 3;
      this.carry = 0;
      if (options) {
        switch (options.type) {
          case "rfc4648":
            this.alphabet = exports2.rfc4648.alphabet;
            break;
          case "crockford":
            this.alphabet = exports2.crockford.alphabet;
            break;
          case "base32hex":
            this.alphabet = exports2.base32hex.alphabet;
            break;
          default:
            throw new Error("invalid type");
        }
        if (options.alphabet) this.alphabet = options.alphabet;
        else if (options.lc) this.alphabet = this.alphabet.toLowerCase();
      }
    }
    Encoder.prototype.alphabet = rfc4648.alphabet;
    Encoder.prototype.write = function(buf) {
      var shift = this.shift;
      var carry = this.carry;
      var symbol;
      var byte;
      var i;
      for (i = 0; i < buf.length; i++) {
        byte = buf[i];
        symbol = carry | byte >> shift;
        this.buf += this.alphabet[symbol & 31];
        if (shift > 5) {
          shift -= 5;
          symbol = byte >> shift;
          this.buf += this.alphabet[symbol & 31];
        }
        shift = 5 - shift;
        carry = byte << shift;
        shift = 8 - shift;
      }
      this.shift = shift;
      this.carry = carry;
      return this;
    };
    Encoder.prototype.finalize = function(buf) {
      if (buf) {
        this.write(buf);
      }
      if (this.shift !== 3) {
        this.buf += this.alphabet[this.carry & 31];
        this.shift = 3;
        this.carry = 0;
      }
      return this.buf;
    };
    exports2.encode = function(buf, options) {
      return new Encoder(options).finalize(buf);
    };
    exports2.decode = function(str, options) {
      return new Decoder(options).finalize(str);
    };
    exports2.Decoder = Decoder;
    exports2.Encoder = Encoder;
    exports2.charmap = charmap;
    exports2.crockford = crockford;
    exports2.rfc4648 = rfc4648;
    exports2.base32hex = base32hex;
  }
});

// node_modules/base32.js/index.js
var require_base322 = __commonJS({
  "node_modules/base32.js/index.js"(exports2, module2) {
    "use strict";
    var base322 = require_base32();
    var finalizeDecode = base322.Decoder.prototype.finalize;
    base322.Decoder.prototype.finalize = function(buf) {
      var bytes = finalizeDecode.call(this, buf);
      return new Buffer(bytes);
    };
    module2.exports = base322;
  }
});

// node_modules/@stellar/stellar-sdk/lib/esm/utils.js
var Utils = class {
  /**
   * Verifies if the current date is within the transaction's timebounds
   *
   * @param transaction - The transaction whose timebounds will be validated.
   * @param gracePeriod - (optional) An additional window of time that should be considered valid on either end of the transaction's time range.
   *
   * @returns Returns true if the current time is within the transaction's [minTime, maxTime] range.
   *
   */
  static validateTimebounds(transaction, gracePeriod = 0) {
    if (!transaction.timeBounds) {
      return false;
    }
    const now = Math.floor(Date.now() / 1e3);
    const { minTime, maxTime } = transaction.timeBounds;
    return now >= Number.parseInt(minTime, 10) - gracePeriod && now <= Number.parseInt(maxTime, 10) + gracePeriod;
  }
  static sleep(ms) {
    return new Promise((resolve2) => setTimeout(resolve2, ms));
  }
};

// node_modules/feaxios/dist/index.mjs
async function prepareAxiosResponse(options, res) {
  const response = { config: options };
  response.status = res.status;
  response.statusText = res.statusText;
  response.headers = res.headers;
  if (options.responseType === "stream") {
    response.data = res.body;
    return response;
  }
  return res[options.responseType || "text"]().then((data) => {
    if (options.transformResponse) {
      Array.isArray(options.transformResponse) ? options.transformResponse.map(
        (fn) => data = fn.call(options, data, res?.headers, res?.status)
      ) : data = options.transformResponse(data, res?.headers, res?.status);
      response.data = data;
    } else {
      response.data = data;
      response.data = JSON.parse(data);
    }
  }).catch(Object).then(() => response);
}
async function handleFetch(options, fetchOptions) {
  let res = null;
  if ("any" in AbortSignal) {
    const signals = [];
    if (options.timeout) {
      signals.push(AbortSignal.timeout(options.timeout));
    }
    if (options.signal) {
      signals.push(options.signal);
    }
    if (signals.length > 0) {
      fetchOptions.signal = AbortSignal.any(signals);
    }
  } else {
    if (options.timeout) {
      fetchOptions.signal = AbortSignal.timeout(options.timeout);
    }
  }
  try {
    res = await fetch(options.url, fetchOptions);
    const ok = options.validateStatus ? options.validateStatus(res.status) : res.ok;
    if (!ok) {
      return Promise.reject(
        new AxiosError(
          `Request failed with status code ${res?.status}`,
          [AxiosError.ERR_BAD_REQUEST, AxiosError.ERR_BAD_RESPONSE][Math.floor(res?.status / 100) - 4],
          options,
          new Request(options.url, fetchOptions),
          await prepareAxiosResponse(options, res)
        )
      );
    }
    return await prepareAxiosResponse(options, res);
  } catch (error) {
    if (error.name === "AbortError" || error.name === "TimeoutError") {
      const isTimeoutError = error.name === "TimeoutError";
      return Promise.reject(
        isTimeoutError ? new AxiosError(
          options.timeoutErrorMessage || `timeout of ${options.timeout} ms exceeded`,
          AxiosError.ECONNABORTED,
          options,
          request
        ) : new CanceledError(null, options)
      );
    }
    return Promise.reject(
      new AxiosError(
        error.message,
        void 0,
        options,
        request,
        void 0
      )
    );
  }
}
function buildURL(options) {
  let url = options.url || "";
  if (options.baseURL && options.url) {
    url = options.url.replace(/^(?!.*\/\/)\/?/, `${options.baseURL}/`);
  }
  if (options.params && Object.keys(options.params).length > 0 && options.url) {
    url += (~options.url.indexOf("?") ? "&" : "?") + (options.paramsSerializer ? options.paramsSerializer(options.params) : new URLSearchParams(options.params));
  }
  return url;
}
function mergeAxiosOptions(input, defaults) {
  const merged = {
    ...defaults,
    ...input
  };
  if (defaults?.params && input?.params) {
    merged.params = {
      ...defaults?.params,
      ...input?.params
    };
  }
  if (defaults?.headers && input?.headers) {
    merged.headers = new Headers(defaults.headers || {});
    const headers = new Headers(input.headers || {});
    headers.forEach((value, key) => {
      merged.headers.set(key, value);
    });
  }
  return merged;
}
function mergeFetchOptions(input, defaults) {
  const merged = {
    ...defaults,
    ...input
  };
  if (defaults?.headers && input?.headers) {
    merged.headers = new Headers(defaults.headers || {});
    const headers = new Headers(input.headers || {});
    headers.forEach((value, key) => {
      merged.headers.set(key, value);
    });
  }
  return merged;
}
function defaultTransformer(data, headers) {
  const contentType = headers.get("content-type");
  if (!contentType) {
    if (typeof data === "string") {
      headers.set("content-type", "text/plain");
    } else if (data instanceof URLSearchParams) {
      headers.set("content-type", "application/x-www-form-urlencoded");
    } else if (data instanceof Blob || data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
      headers.set("content-type", "application/octet-stream");
    } else if (typeof data === "object" && typeof data.append !== "function" && typeof data.text !== "function") {
      data = JSON.stringify(data);
      headers.set("content-type", "application/json");
    }
  } else {
    if (contentType === "application/x-www-form-urlencoded" && !(data instanceof URLSearchParams)) {
      data = new URLSearchParams(data);
    } else if (contentType === "application/json" && typeof data === "object") {
      data = JSON.stringify(data);
    }
  }
  return data;
}
async function request(configOrUrl, config2, defaults, method, interceptors, data) {
  if (typeof configOrUrl === "string") {
    config2 = config2 || {};
    config2.url = configOrUrl;
  } else
    config2 = configOrUrl || {};
  const options = mergeAxiosOptions(config2, defaults || {});
  options.fetchOptions = options.fetchOptions || {};
  options.timeout = options.timeout || 0;
  options.headers = new Headers(options.headers || {});
  options.transformRequest = options.transformRequest ?? defaultTransformer;
  data = data || options.data;
  if (options.transformRequest && data) {
    Array.isArray(options.transformRequest) ? options.transformRequest.map(
      (fn) => data = fn.call(options, data, options.headers)
    ) : data = options.transformRequest(data, options.headers);
  }
  options.url = buildURL(options);
  options.method = method || options.method || "get";
  if (interceptors && interceptors.request.handlers.length > 0) {
    const chain = interceptors.request.handlers.filter(
      (interceptor) => !interceptor?.runWhen || typeof interceptor.runWhen === "function" && interceptor.runWhen(options)
    ).flatMap((interceptor) => [interceptor.fulfilled, interceptor.rejected]);
    let result = options;
    for (let i = 0, len = chain.length; i < len; i += 2) {
      const onFulfilled = chain[i];
      const onRejected = chain[i + 1];
      try {
        if (onFulfilled)
          result = onFulfilled(result);
      } catch (error) {
        if (onRejected)
          onRejected?.(error);
        break;
      }
    }
  }
  const init = mergeFetchOptions(
    {
      method: options.method?.toUpperCase(),
      body: data,
      headers: options.headers,
      credentials: options.withCredentials ? "include" : void 0,
      signal: options.signal
    },
    options.fetchOptions
  );
  let resp = handleFetch(options, init);
  if (interceptors && interceptors.response.handlers.length > 0) {
    const chain = interceptors.response.handlers.flatMap((interceptor) => [
      interceptor.fulfilled,
      interceptor.rejected
    ]);
    for (let i = 0, len = chain.length; i < len; i += 2) {
      resp = resp.then(chain[i], chain[i + 1]);
    }
  }
  return resp;
}
var AxiosInterceptorManager = class {
  handlers = [];
  constructor() {
    this.handlers = [];
  }
  use = (onFulfilled, onRejected, options) => {
    this.handlers.push({
      fulfilled: onFulfilled,
      rejected: onRejected,
      runWhen: options?.runWhen
    });
    return this.handlers.length - 1;
  };
  eject = (id) => {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  };
  clear = () => {
    this.handlers = [];
  };
};
function createAxiosInstance(defaults) {
  defaults = defaults || {};
  const interceptors = {
    request: new AxiosInterceptorManager(),
    response: new AxiosInterceptorManager()
  };
  const axios2 = (url, config2) => request(url, config2, defaults, void 0, interceptors);
  axios2.defaults = defaults;
  axios2.interceptors = interceptors;
  axios2.getUri = (config2) => {
    const merged = mergeAxiosOptions(config2 || {}, defaults);
    return buildURL(merged);
  };
  axios2.request = (config2) => request(config2, void 0, defaults, void 0, interceptors);
  ["get", "delete", "head", "options"].forEach((method) => {
    axios2[method] = (url, config2) => request(url, config2, defaults, method, interceptors);
  });
  ["post", "put", "patch"].forEach((method) => {
    axios2[method] = (url, data, config2) => request(url, config2, defaults, method, interceptors, data);
  });
  ["postForm", "putForm", "patchForm"].forEach((method) => {
    axios2[method] = (url, data, config2) => {
      config2 = config2 || {};
      config2.headers = new Headers(config2.headers || {});
      config2.headers.set("content-type", "application/x-www-form-urlencoded");
      return request(
        url,
        config2,
        defaults,
        method.replace("Form", ""),
        interceptors,
        data
      );
    };
  });
  return axios2;
}
var AxiosError = class extends Error {
  config;
  code;
  request;
  response;
  status;
  isAxiosError;
  constructor(message, code, config2, request2, response) {
    super(message);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error().stack;
    }
    this.name = "AxiosError";
    this.code = code;
    this.config = config2;
    this.request = request2;
    this.response = response;
    this.isAxiosError = true;
  }
  static ERR_BAD_OPTION_VALUE = "ERR_BAD_OPTION_VALUE";
  static ERR_BAD_OPTION = "ERR_BAD_OPTION";
  static ERR_NETWORK = "ERR_NETWORK";
  static ERR_BAD_RESPONSE = "ERR_BAD_RESPONSE";
  static ERR_BAD_REQUEST = "ERR_BAD_REQUEST";
  static ERR_INVALID_URL = "ERR_INVALID_URL";
  static ERR_CANCELED = "ERR_CANCELED";
  static ECONNABORTED = "ECONNABORTED";
  static ETIMEDOUT = "ETIMEDOUT";
};
var CanceledError = class extends AxiosError {
  constructor(message, config2, request2) {
    super(
      !message ? "canceled" : message,
      AxiosError.ERR_CANCELED,
      config2,
      request2
    );
    this.name = "CanceledError";
  }
};
var axios = createAxiosInstance();
axios.create = (defaults) => createAxiosInstance(defaults);
var src_default = axios;

// node_modules/@stellar/stellar-sdk/lib/esm/http-client/types.js
var CancelToken = class {
  promise;
  reason;
  throwIfRequested() {
    if (this.reason) {
      throw new Error(this.reason);
    }
  }
  constructor(executor) {
    let resolvePromise;
    this.promise = new Promise((resolve2) => {
      resolvePromise = resolve2;
    });
    executor((reason) => {
      this.reason = reason;
      resolvePromise();
    });
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/http-client/fetch-client.js
var CANCELED_MARKER = /* @__PURE__ */ Symbol.for("@stellar/stellar-sdk.canceled");
function makeCanceledError(reason) {
  const err2 = new Error(reason || "Request canceled");
  err2[CANCELED_MARKER] = true;
  return err2;
}
var InterceptorManager = class {
  handlers = [];
  use(fulfilled, rejected) {
    this.handlers.push({
      fulfilled,
      rejected
    });
    return this.handlers.length - 1;
  }
  eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }
  forEach(fn) {
    this.handlers.forEach((h2) => {
      if (h2 !== null) {
        fn(h2);
      }
    });
  }
};
function getFormConfig(config2) {
  const formConfig = config2 || {};
  formConfig.headers = new Headers(formConfig.headers || {});
  formConfig.headers.set("Content-Type", "application/x-www-form-urlencoded");
  return formConfig;
}
function mergeWithDefaults(defaults, config2) {
  if (!config2) return { ...defaults };
  const merged = { ...defaults, ...config2 };
  if (defaults?.headers !== void 0 || config2.headers !== void 0) {
    const headers = new Headers(defaults?.headers || {});
    new Headers(config2.headers || {}).forEach((v, k) => {
      headers.set(k, v);
    });
    merged.headers = headers;
  }
  if (defaults?.params !== void 0 || config2.params !== void 0) {
    merged.params = { ...defaults?.params || {}, ...config2.params || {} };
  }
  return merged;
}
function buildBoundedUrl(config2) {
  let url = config2.url || "";
  if (config2.baseURL && url && !/^https?:\/\//i.test(url)) {
    url = url.replace(/^\/?/, `${config2.baseURL.replace(/\/$/, "")}/`);
  }
  if (config2.params && Object.keys(config2.params).length > 0) {
    const qs = new URLSearchParams(
      config2.params
    ).toString();
    url += (url.includes("?") ? "&" : "?") + qs;
  }
  return url;
}
function encodeRequestBody(data, headers) {
  if (data === void 0 || data === null) return void 0;
  if (typeof data === "string") return data;
  if (data instanceof URLSearchParams) {
    if (!headers.has("content-type")) {
      headers.set("content-type", "application/x-www-form-urlencoded");
    }
    return data;
  }
  if (data instanceof Blob || data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
    if (!headers.has("content-type")) {
      headers.set("content-type", "application/octet-stream");
    }
    return data;
  }
  if (typeof FormData !== "undefined" && data instanceof FormData) {
    return data;
  }
  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  return JSON.stringify(data);
}
async function readBodyBounded(response, maxContentLength) {
  if (maxContentLength !== void 0) {
    const headerLen = response.headers.get("content-length");
    if (headerLen && Number(headerLen) > maxContentLength) {
      throw new Error(`maxContentLength size of ${maxContentLength} exceeded`);
    }
  }
  if (!response.body) return new Uint8Array(0);
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      total += value.byteLength;
      if (maxContentLength !== void 0 && total > maxContentLength) {
        await reader.cancel();
        throw new Error(
          `maxContentLength size of ${maxContentLength} exceeded`
        );
      }
      chunks.push(value);
    }
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.byteLength;
  }
  return out;
}
function createTimeoutSignal(ms) {
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(ms);
  }
  const controller = new AbortController();
  setTimeout(() => {
    const err2 = new Error("Timeout");
    err2.name = "TimeoutError";
    controller.abort(err2);
  }, ms);
  return controller.signal;
}
function composeSignals(signals) {
  if (signals.length === 0) return void 0;
  if (signals.length === 1) return signals[0];
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.any === "function") {
    return AbortSignal.any(signals);
  }
  const controller = new AbortController();
  for (const s of signals) {
    if (s.aborted) {
      controller.abort(s.reason);
      break;
    }
    s.addEventListener("abort", () => controller.abort(s.reason), {
      once: true
    });
  }
  return controller.signal;
}
function canInspectManualRedirects() {
  return typeof process !== "undefined" && !!process.versions && !!process.versions.node;
}
function applyRedirectSemantics(init, status) {
  if (status === 307 || status === 308) return init;
  const next = { ...init, method: "GET", body: void 0 };
  const headers = new Headers(init.headers || {});
  headers.delete("content-type");
  headers.delete("content-length");
  headers.delete("transfer-encoding");
  next.headers = headers;
  return next;
}
function stripCrossOriginAuth(init, fromUrl, toUrl) {
  let sameOrigin;
  try {
    sameOrigin = new URL(fromUrl).origin === new URL(toUrl).origin;
  } catch {
    sameOrigin = false;
  }
  if (sameOrigin) return init;
  const headers = new Headers(init.headers || {});
  headers.delete("authorization");
  headers.delete("proxy-authorization");
  headers.delete("cookie");
  return { ...init, headers };
}
function buildHttpError(response, config2, data) {
  const err2 = new Error(
    `Request failed with status code ${response.status}`
  );
  err2.response = {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    data,
    config: config2
  };
  return err2;
}
async function boundedFetchAdapter(config2) {
  const { maxRedirects, maxContentLength, timeout } = config2;
  const signals = [];
  if (timeout && timeout > 0) {
    signals.push(createTimeoutSignal(timeout));
  }
  const signal = composeSignals(signals);
  const managedRedirects = maxRedirects !== void 0;
  const canManage = canInspectManualRedirects();
  let redirect;
  if (!managedRedirects) {
    redirect = "follow";
  } else if (canManage) {
    redirect = "manual";
  } else if (maxRedirects === 0) {
    redirect = "error";
  } else {
    redirect = "follow";
  }
  const headers = new Headers(config2.headers || {});
  const body = encodeRequestBody(config2.data, headers);
  let currentInit = {
    ...config2.fetchOptions,
    method: (config2.method || "get").toUpperCase(),
    headers,
    body,
    redirect,
    ...signal ? { signal } : {}
  };
  let currentUrl = buildBoundedUrl(config2);
  let redirectsRemaining = maxRedirects ?? 0;
  let response;
  while (true) {
    try {
      response = await fetch(currentUrl, currentInit);
    } catch (err2) {
      if (err2?.name === "TimeoutError") {
        throw new Error(`timeout of ${config2.timeout}ms exceeded`);
      }
      throw err2;
    }
    const isManualRedirectResponse = redirect === "manual" && response.status >= 300 && response.status < 400;
    if (!isManualRedirectResponse) break;
    if (redirectsRemaining <= 0) {
      if (maxRedirects === 0) throw buildHttpError(response, config2);
      throw new Error("Maximum number of redirects exceeded");
    }
    const location = response.headers.get("location");
    if (!location) break;
    const nextUrl = new URL(location, currentUrl).toString();
    currentInit = applyRedirectSemantics(currentInit, response.status);
    currentInit = stripCrossOriginAuth(currentInit, currentUrl, nextUrl);
    currentUrl = nextUrl;
    redirectsRemaining -= 1;
  }
  if (!response.ok) {
    let errBody;
    try {
      const errBytes = await readBodyBounded(response, maxContentLength);
      const errText = new TextDecoder().decode(errBytes);
      try {
        errBody = JSON.parse(errText);
      } catch {
        errBody = errText;
      }
    } catch (readErr) {
      throw readErr;
    }
    throw buildHttpError(response, config2, errBody);
  }
  const bytes = await readBodyBounded(response, maxContentLength);
  const text = new TextDecoder().decode(bytes);
  let data = text;
  try {
    data = JSON.parse(text);
  } catch {
  }
  return {
    data,
    headers: response.headers,
    config: config2,
    status: response.status,
    statusText: response.statusText
  };
}
function createFetchClient(fetchConfig = {}) {
  const defaults = {
    ...fetchConfig,
    headers: fetchConfig.headers || {}
  };
  const axiosStatic = src_default.default ?? src_default;
  const instance = axiosStatic.create(defaults);
  const requestInterceptors = new InterceptorManager();
  const responseInterceptors = new InterceptorManager();
  const httpClient = {
    interceptors: {
      request: requestInterceptors,
      response: responseInterceptors
    },
    defaults: {
      ...defaults,
      adapter: (config2) => {
        if (config2.maxRedirects !== void 0 || config2.maxContentLength !== void 0) {
          return boundedFetchAdapter(config2);
        }
        return instance.request(config2);
      }
    },
    create(config2) {
      return createFetchClient({ ...this.defaults, ...config2 });
    },
    makeRequest(config2) {
      return new Promise((resolve2, reject) => {
        function processRequest(finalConfig, res, rej) {
          const adapter = finalConfig.adapter || this.defaults.adapter;
          if (!adapter) {
            throw new Error("No adapter available");
          }
          let responsePromise = adapter(finalConfig).then((axiosResponse) => {
            const httpClientResponse = {
              data: axiosResponse.data,
              headers: axiosResponse.headers,
              config: axiosResponse.config,
              status: axiosResponse.status,
              statusText: axiosResponse.statusText
            };
            return httpClientResponse;
          });
          if (responseInterceptors.handlers.length > 0) {
            const chain = responseInterceptors.handlers.filter(
              (interceptor) => interceptor !== null
            ).flatMap((interceptor) => [
              interceptor.fulfilled,
              interceptor.rejected
            ]);
            for (let i = 0, len = chain.length; i < len; i += 2) {
              responsePromise = responsePromise.then(
                (response) => {
                  const fulfilledInterceptor = chain[i];
                  if (typeof fulfilledInterceptor === "function") {
                    return fulfilledInterceptor(response);
                  }
                  return response;
                },
                (error) => {
                  const rejectedInterceptor = chain[i + 1];
                  if (typeof rejectedInterceptor === "function") {
                    return rejectedInterceptor(error);
                  }
                  throw error;
                }
              ).then((interceptedResponse) => interceptedResponse);
            }
          }
          responsePromise.then(res).catch(rej);
        }
        const abortController = new AbortController();
        config2.signal = abortController.signal;
        if (config2.cancelToken) {
          const { cancelToken } = config2;
          cancelToken.promise.then(() => {
            abortController.abort();
            reject(makeCanceledError(cancelToken.reason));
          });
        }
        const modifiedConfig = config2;
        if (requestInterceptors.handlers.length > 0) {
          const chain = requestInterceptors.handlers.filter(
            (interceptor) => interceptor !== null
          ).flatMap((interceptor) => [
            interceptor.fulfilled,
            interceptor.rejected
          ]);
          let configPromise = Promise.resolve(modifiedConfig);
          for (let i = 0, len = chain.length; i < len; i += 2) {
            configPromise = configPromise.then(
              chain[i],
              chain[i + 1]
            );
          }
          configPromise.then((resolvedConfig) => {
            processRequest.call(this, resolvedConfig, resolve2, reject);
          }).catch(reject);
          return;
        }
        processRequest.call(this, modifiedConfig, resolve2, reject);
      });
    },
    get(url, config2) {
      return this.makeRequest({
        ...mergeWithDefaults(this.defaults, config2),
        url,
        method: "get"
      });
    },
    delete(url, config2) {
      return this.makeRequest({
        ...mergeWithDefaults(this.defaults, config2),
        url,
        method: "delete"
      });
    },
    head(url, config2) {
      return this.makeRequest({
        ...mergeWithDefaults(this.defaults, config2),
        url,
        method: "head"
      });
    },
    options(url, config2) {
      return this.makeRequest({
        ...mergeWithDefaults(this.defaults, config2),
        url,
        method: "options"
      });
    },
    post(url, data, config2) {
      return this.makeRequest({
        ...mergeWithDefaults(this.defaults, config2),
        url,
        method: "post",
        data
      });
    },
    put(url, data, config2) {
      return this.makeRequest({
        ...mergeWithDefaults(this.defaults, config2),
        url,
        method: "put",
        data
      });
    },
    patch(url, data, config2) {
      return this.makeRequest({
        ...mergeWithDefaults(this.defaults, config2),
        url,
        method: "patch",
        data
      });
    },
    postForm(url, data, config2) {
      const formConfig = getFormConfig(config2);
      return this.makeRequest({
        ...mergeWithDefaults(this.defaults, formConfig),
        url,
        method: "post",
        data
      });
    },
    putForm(url, data, config2) {
      const formConfig = getFormConfig(config2);
      return this.makeRequest({
        ...mergeWithDefaults(this.defaults, formConfig),
        url,
        method: "put",
        data
      });
    },
    patchForm(url, data, config2) {
      const formConfig = getFormConfig(config2);
      return this.makeRequest({
        ...mergeWithDefaults(this.defaults, formConfig),
        url,
        method: "patch",
        data
      });
    },
    CancelToken,
    isCancel: (value) => value instanceof Error && value[CANCELED_MARKER] === true
  };
  return httpClient;
}
var fetchClient = createFetchClient();

// node_modules/@stellar/stellar-sdk/lib/esm/node_modules/.pnpm/@stellar_js-xdr@4.0.0/node_modules/@stellar/js-xdr/src/xdr-type.js
var import_buffer3 = require("buffer");

// node_modules/@stellar/stellar-sdk/lib/esm/node_modules/.pnpm/@stellar_js-xdr@4.0.0/node_modules/@stellar/js-xdr/src/serialization/xdr-reader.js
var import_buffer = require("buffer");

// node_modules/@stellar/stellar-sdk/lib/esm/node_modules/.pnpm/@stellar_js-xdr@4.0.0/node_modules/@stellar/js-xdr/src/errors.js
var XdrWriterError = class extends TypeError {
  constructor(message) {
    super(`XDR Write Error: ${message}`);
  }
};
var XdrReaderError = class extends TypeError {
  constructor(message) {
    super(`XDR Read Error: ${message}`);
  }
};
var XdrDefinitionError = class extends TypeError {
  constructor(message) {
    super(`XDR Type Definition Error: ${message}`);
  }
};
var XdrNotImplementedDefinitionError = class extends XdrDefinitionError {
  constructor() {
    super(
      `method not implemented, it should be overloaded in the descendant class.`
    );
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/node_modules/.pnpm/@stellar_js-xdr@4.0.0/node_modules/@stellar/js-xdr/src/serialization/xdr-reader.js
var XdrReader = class {
  /**
   * @constructor
   * @param {Buffer} source - Buffer containing serialized data
   */
  constructor(source) {
    if (!import_buffer.Buffer.isBuffer(source)) {
      if (source instanceof Array || Array.isArray(source) || ArrayBuffer.isView(source)) {
        source = import_buffer.Buffer.from(source);
      } else {
        throw new XdrReaderError(`source invalid: ${source}`);
      }
    }
    this._buffer = source;
    this._length = source.length;
    this._index = 0;
  }
  /**
   * @type {Buffer}
   * @private
   * @readonly
   */
  _buffer;
  /**
   * @type {Number}
   * @private
   * @readonly
   */
  _length;
  /**
   * @type {Number}
   * @private
   * @readonly
   */
  _index;
  /**
   * Check if the reader reached the end of the input buffer
   * @return {Boolean}
   */
  get eof() {
    return this._index === this._length;
  }
  /**
   * Advance reader position, check padding and overflow
   * @param {Number} size - Bytes to read
   * @return {Number} Position to read from
   * @private
   */
  advance(size) {
    const from = this._index;
    this._index += size;
    if (this._length < this._index)
      throw new XdrReaderError(
        "attempt to read outside the boundary of the buffer"
      );
    const padding = 4 - (size % 4 || 4);
    if (padding > 0) {
      for (let i = 0; i < padding; i++)
        if (this._buffer[this._index + i] !== 0)
          throw new XdrReaderError("invalid padding");
      this._index += padding;
    }
    return from;
  }
  /**
   * Reset reader position
   * @return {void}
   */
  rewind() {
    this._index = 0;
  }
  /**
   * Remaining unread bytes in the source buffer
   * @return {Number}
   */
  remainingBytes() {
    return this._length - this._index;
  }
  /**
   * Read byte array from the buffer
   * @param {Number} size - Bytes to read
   * @return {Buffer} - Sliced portion of the underlying buffer
   */
  read(size) {
    const from = this.advance(size);
    return this._buffer.subarray(from, from + size);
  }
  /**
   * Read i32 from buffer
   * @return {Number}
   */
  readInt32BE() {
    return this._buffer.readInt32BE(this.advance(4));
  }
  /**
   * Read u32 from buffer
   * @return {Number}
   */
  readUInt32BE() {
    return this._buffer.readUInt32BE(this.advance(4));
  }
  /**
   * Read i64 from buffer
   * @return {BigInt}
   */
  readBigInt64BE() {
    return this._buffer.readBigInt64BE(this.advance(8));
  }
  /**
   * Read u64 from buffer
   * @return {BigInt}
   */
  readBigUInt64BE() {
    return this._buffer.readBigUInt64BE(this.advance(8));
  }
  /**
   * Read float from buffer
   * @return {Number}
   */
  readFloatBE() {
    return this._buffer.readFloatBE(this.advance(4));
  }
  /**
   * Read double from buffer
   * @return {Number}
   */
  readDoubleBE() {
    return this._buffer.readDoubleBE(this.advance(8));
  }
  /**
   * Ensure that input buffer has been consumed in full, otherwise it's a type mismatch
   * @return {void}
   * @throws {XdrReaderError}
   */
  ensureInputConsumed() {
    if (this._index !== this._length)
      throw new XdrReaderError(
        `invalid XDR contract typecast - source buffer not entirely consumed`
      );
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/node_modules/.pnpm/@stellar_js-xdr@4.0.0/node_modules/@stellar/js-xdr/src/serialization/xdr-writer.js
var import_buffer2 = require("buffer");
var BUFFER_CHUNK = 8192;
var XdrWriter = class {
  /**
   * @param {Buffer|Number} [buffer] - Optional destination buffer
   */
  constructor(buffer) {
    if (typeof buffer === "number") {
      buffer = import_buffer2.Buffer.allocUnsafe(buffer);
    } else if (!(buffer instanceof import_buffer2.Buffer)) {
      buffer = import_buffer2.Buffer.allocUnsafe(BUFFER_CHUNK);
    }
    this._buffer = buffer;
    this._length = buffer.length;
  }
  /**
   * @type {Buffer}
   * @private
   * @readonly
   */
  _buffer;
  /**
   * @type {Number}
   * @private
   * @readonly
   */
  _length;
  /**
   * @type {Number}
   * @private
   * @readonly
   */
  _index = 0;
  /**
   * Advance writer position, write padding if needed, auto-resize the buffer
   * @param {Number} size - Bytes to write
   * @return {Number} Position to read from
   * @private
   */
  alloc(size) {
    const from = this._index;
    this._index += size;
    if (this._length < this._index) {
      this.resize(this._index);
    }
    return from;
  }
  /**
   * Increase size of the underlying buffer
   * @param {Number} minRequiredSize - Minimum required buffer size
   * @return {void}
   * @private
   */
  resize(minRequiredSize) {
    const newLength = Math.ceil(minRequiredSize / BUFFER_CHUNK) * BUFFER_CHUNK;
    const newBuffer = import_buffer2.Buffer.allocUnsafe(newLength);
    this._buffer.copy(newBuffer, 0, 0, this._length);
    this._buffer = newBuffer;
    this._length = newLength;
  }
  /**
   * Return XDR-serialized value
   * @return {Buffer}
   */
  finalize() {
    return this._buffer.subarray(0, this._index);
  }
  /**
   * Return XDR-serialized value as byte array
   * @return {Number[]}
   */
  toArray() {
    return [...this.finalize()];
  }
  /**
   * Write byte array from the buffer
   * @param {Buffer|String} value - Bytes/string to write
   * @param {Number} size - Size in bytes
   * @return {XdrReader} - XdrReader wrapper on top of a subarray
   */
  write(value, size) {
    if (typeof value === "string") {
      const offset = this.alloc(size);
      this._buffer.write(value, offset, "utf8");
    } else {
      if (!(value instanceof import_buffer2.Buffer)) {
        value = import_buffer2.Buffer.from(value);
      }
      const offset = this.alloc(size);
      value.copy(this._buffer, offset, 0, size);
    }
    const padding = 4 - (size % 4 || 4);
    if (padding > 0) {
      const offset = this.alloc(padding);
      this._buffer.fill(0, offset, this._index);
    }
  }
  /**
   * Write i32 from buffer
   * @param {Number} value - Value to serialize
   * @return {void}
   */
  writeInt32BE(value) {
    const offset = this.alloc(4);
    this._buffer.writeInt32BE(value, offset);
  }
  /**
   * Write u32 from buffer
   * @param {Number} value - Value to serialize
   * @return {void}
   */
  writeUInt32BE(value) {
    const offset = this.alloc(4);
    this._buffer.writeUInt32BE(value, offset);
  }
  /**
   * Write i64 from buffer
   * @param {BigInt} value - Value to serialize
   * @return {void}
   */
  writeBigInt64BE(value) {
    const offset = this.alloc(8);
    this._buffer.writeBigInt64BE(value, offset);
  }
  /**
   * Write u64 from buffer
   * @param {BigInt} value - Value to serialize
   * @return {void}
   */
  writeBigUInt64BE(value) {
    const offset = this.alloc(8);
    this._buffer.writeBigUInt64BE(value, offset);
  }
  /**
   * Write float from buffer
   * @param {Number} value - Value to serialize
   * @return {void}
   */
  writeFloatBE(value) {
    const offset = this.alloc(4);
    this._buffer.writeFloatBE(value, offset);
  }
  /**
   * Write double from buffer
   * @param {Number} value - Value to serialize
   * @return {void}
   */
  writeDoubleBE(value) {
    const offset = this.alloc(8);
    this._buffer.writeDoubleBE(value, offset);
  }
  static bufferChunkSize = BUFFER_CHUNK;
};

// node_modules/@stellar/stellar-sdk/lib/esm/node_modules/.pnpm/@stellar_js-xdr@4.0.0/node_modules/@stellar/js-xdr/src/xdr-type.js
var XdrType = class {
  /**
   * Encode value to XDR format
   * @param {XdrEncodingFormat} [format] - Encoding format (one of "raw", "hex", "base64")
   * @return {String|Buffer}
   */
  toXDR(format = "raw") {
    if (!this.write) return this.constructor.toXDR(this, format);
    const writer = new XdrWriter();
    this.write(this, writer);
    return encodeResult(writer.finalize(), format);
  }
  /**
   * Decode XDR-encoded value
   * @param {Buffer|String} input - XDR-encoded input data
   * @param {XdrEncodingFormat} [format] - Encoding format (one of "raw", "hex", "base64")
   * @return {this}
   */
  fromXDR(input, format = "raw") {
    if (!this.read) return this.constructor.fromXDR(input, format);
    const reader = new XdrReader(decodeInput(input, format));
    const result = this.read(reader);
    reader.ensureInputConsumed();
    return result;
  }
  /**
   * Check whether input contains a valid XDR-encoded value
   * @param {Buffer|String} input - XDR-encoded input data
   * @param {XdrEncodingFormat} [format] - Encoding format (one of "raw", "hex", "base64")
   * @return {Boolean}
   */
  validateXDR(input, format = "raw") {
    try {
      this.fromXDR(input, format);
      return true;
    } catch (e) {
      return false;
    }
  }
  /**
   * Encode value to XDR format
   * @param {this} value - Value to serialize
   * @param {XdrEncodingFormat} [format] - Encoding format (one of "raw", "hex", "base64")
   * @return {Buffer}
   */
  static toXDR(value, format = "raw") {
    const writer = new XdrWriter();
    this.write(value, writer);
    return encodeResult(writer.finalize(), format);
  }
  /**
   * Decode XDR-encoded value
   * @param {Buffer|String} input - XDR-encoded input data
   * @param {XdrEncodingFormat} [format] - Encoding format (one of "raw", "hex", "base64")
   * @return {this}
   */
  static fromXDR(input, format = "raw") {
    const reader = new XdrReader(decodeInput(input, format));
    const result = this.read(reader);
    reader.ensureInputConsumed();
    return result;
  }
  /**
   * Check whether input contains a valid XDR-encoded value
   * @param {Buffer|String} input - XDR-encoded input data
   * @param {XdrEncodingFormat} [format] - Encoding format (one of "raw", "hex", "base64")
   * @return {Boolean}
   */
  static validateXDR(input, format = "raw") {
    try {
      this.fromXDR(input, format);
      return true;
    } catch (e) {
      return false;
    }
  }
};
var XdrPrimitiveType = class extends XdrType {
  /**
   * Read value from the XDR-serialized input
   * @param {XdrReader} reader - XdrReader instance
   * @return {this}
   * @abstract
   */
  // eslint-disable-next-line no-unused-vars
  static read(reader) {
    throw new XdrNotImplementedDefinitionError();
  }
  /**
   * Write XDR value to the buffer
   * @param {this} value - Value to write
   * @param {XdrWriter} writer - XdrWriter instance
   * @return {void}
   * @abstract
   */
  // eslint-disable-next-line no-unused-vars
  static write(value, writer) {
    throw new XdrNotImplementedDefinitionError();
  }
  /**
   * Check whether XDR primitive value is valid
   * @param {this} value - Value to check
   * @return {Boolean}
   * @abstract
   */
  // eslint-disable-next-line no-unused-vars
  static isValid(value) {
    return false;
  }
};
var XdrCompositeType = class extends XdrType {
  // Every descendant should implement two methods: read(reader) and write(value, writer)
  /**
   * Check whether XDR primitive value is valid
   * @param {this} value - Value to check
   * @return {Boolean}
   * @abstract
   */
  // eslint-disable-next-line no-unused-vars
  isValid(value) {
    return false;
  }
};
var NestedXdrType = class _NestedXdrType extends XdrCompositeType {
  /**
   * @constructor
   * @param {number} maxDepth - Maximum allowed depth for nested structures (e.g. arrays of arrays), to prevent DoS via excessively deep nesting
   */
  constructor(maxDepth) {
    super();
    this._maxDepth = maxDepth ?? _NestedXdrType.DEFAULT_MAX_DEPTH;
  }
  /**
   * Check remaining depth budget and throw if exceeded
   * @param {number} remainingDepth - Remaining recursion budget
   * @returns {void}
   * @throws {XdrReaderError} If remaining depth budget is exhausted
   * @throws {TypeError} If remainingDepth is not a finite number
   * @protected
   */
  static checkDepth(remainingDepth) {
    if (remainingDepth === void 0) return;
    if (!Number.isFinite(remainingDepth)) {
      throw new TypeError(
        `remainingDepth (current remaining decoding depth budget) must be a finite number, got ${typeof remainingDepth}: ${remainingDepth}`
      );
    }
    if (remainingDepth < 0) {
      throw new XdrReaderError("exceeded max decoding depth");
    }
  }
};
NestedXdrType.DEFAULT_MAX_DEPTH = 200;
NestedXdrType._maxDepth = NestedXdrType.DEFAULT_MAX_DEPTH;
var InvalidXdrEncodingFormatError = class extends TypeError {
  constructor(format) {
    super(`Invalid format ${format}, must be one of "raw", "hex", "base64"`);
  }
};
function encodeResult(buffer, format) {
  switch (format) {
    case "raw":
      return buffer;
    case "hex":
      return buffer.toString("hex");
    case "base64":
      return buffer.toString("base64");
    default:
      throw new InvalidXdrEncodingFormatError(format);
  }
}
function decodeInput(input, format) {
  switch (format) {
    case "raw":
      return input;
    case "hex":
      return import_buffer3.Buffer.from(input, "hex");
    case "base64":
      return import_buffer3.Buffer.from(input, "base64");
    default:
      throw new InvalidXdrEncodingFormatError(format);
  }
}
function isSerializableIsh(value, subtype) {
  return value !== void 0 && value !== null && // prereqs, otherwise `getPrototypeOf` pops
  (value instanceof subtype || // quickest check
  // Do an initial constructor check (anywhere is fine so that children of
  // `subtype` still work), then
  hasConstructor(value, subtype) && // ensure it has read/write methods, then
  typeof value.constructor.read === "function" && typeof value.constructor.write === "function" && // ensure XdrType is in the prototype chain
  hasConstructor(value, "XdrType"));
}
function hasConstructor(instance, subtype) {
  do {
    const ctor = instance.constructor;
    if (ctor.name === subtype) {
      return true;
    }
  } while (instance = Object.getPrototypeOf(instance));
  return false;
}

// node_modules/@stellar/stellar-sdk/lib/esm/node_modules/.pnpm/@stellar_js-xdr@4.0.0/node_modules/@stellar/js-xdr/src/int.js
var MAX_VALUE = 2147483647;
var MIN_VALUE = -2147483648;
var Int = class extends XdrPrimitiveType {
  /**
   * @inheritDoc
   */
  static read(reader) {
    return reader.readInt32BE();
  }
  /**
   * @inheritDoc
   */
  static write(value, writer) {
    if (typeof value !== "number") throw new XdrWriterError("not a number");
    if ((value | 0) !== value) throw new XdrWriterError("invalid i32 value");
    writer.writeInt32BE(value);
  }
  /**
   * @inheritDoc
   */
  static isValid(value) {
    if (typeof value !== "number" || (value | 0) !== value) {
      return false;
    }
    return value >= MIN_VALUE && value <= MAX_VALUE;
  }
};
Int.MAX_VALUE = MAX_VALUE;
Int.MIN_VALUE = -MIN_VALUE;

// node_modules/@stellar/stellar-sdk/lib/esm/node_modules/.pnpm/@stellar_js-xdr@4.0.0/node_modules/@stellar/js-xdr/src/bigint-encoder.js
function encodeBigIntFromBits(parts, size, unsigned) {
  if (!(parts instanceof Array)) {
    parts = [parts];
  } else if (parts.length && parts[0] instanceof Array) {
    parts = parts[0];
  }
  const total = parts.length;
  const sliceSize = size / total;
  switch (sliceSize) {
    case 32:
    case 64:
    case 128:
    case 256:
      break;
    default:
      throw new RangeError(
        `expected slices to fit in 32/64/128/256 bits, got ${parts}`
      );
  }
  try {
    for (let i = 0; i < parts.length; i++) {
      if (typeof parts[i] !== "bigint") {
        parts[i] = BigInt(parts[i].valueOf());
      }
    }
  } catch (e) {
    throw new TypeError(`expected bigint-like values, got: ${parts} (${e})`);
  }
  if (parts.length === 1) {
    const value = parts[0];
    if (unsigned && value < 0n) {
      throw new RangeError(`expected a positive value, got: ${parts}`);
    }
    const [min2, max2] = calculateBigIntBoundaries(size, unsigned);
    if (value < min2 || value > max2) {
      throw new RangeError(
        `bigint value ${value} for ${formatIntName(
          size,
          unsigned
        )} out of range [${min2}, ${max2}]`
      );
    }
    return value;
  }
  let result = 0n;
  for (let i = 0; i < parts.length; i++) {
    assertSliceFits(parts[i], sliceSize);
    result |= BigInt.asUintN(sliceSize, parts[i]) << BigInt(i * sliceSize);
  }
  if (!unsigned) {
    result = BigInt.asIntN(size, result);
  }
  const [min, max] = calculateBigIntBoundaries(size, unsigned);
  if (result >= min && result <= max) {
    return result;
  }
  throw new RangeError(
    `bigint values [${parts}] for ${formatIntName(
      size,
      unsigned
    )} out of range [${min}, ${max}]: ${result}`
  );
}
function sliceBigInt(value, iSize, sliceSize) {
  if (typeof value !== "bigint") {
    throw new TypeError(`Expected bigint 'value', got ${typeof value}`);
  }
  const total = iSize / sliceSize;
  if (total === 1) {
    return [value];
  }
  if (sliceSize < 32 || sliceSize > 128 || total !== 2 && total !== 4 && total !== 8) {
    throw new TypeError(
      `invalid bigint (${value}) and slice size (${iSize} -> ${sliceSize}) combination`
    );
  }
  const shift = BigInt(sliceSize);
  const result = new Array(total);
  for (let i = 0; i < total; i++) {
    result[i] = BigInt.asIntN(sliceSize, value);
    value >>= shift;
  }
  return result;
}
function formatIntName(precision, unsigned) {
  return `${unsigned ? "u" : "i"}${precision}`;
}
function calculateBigIntBoundaries(size, unsigned) {
  if (unsigned) {
    return [0n, (1n << BigInt(size)) - 1n];
  }
  const boundary = 1n << BigInt(size - 1);
  return [0n - boundary, boundary - 1n];
}
function assertSliceFits(part, sliceSize) {
  const fitsSigned = BigInt.asIntN(sliceSize, part) === part;
  const fitsUnsigned = BigInt.asUintN(sliceSize, part) === part;
  if (!fitsSigned && !fitsUnsigned) {
    throw new RangeError(
      `slice value ${part} does not fit in ${sliceSize} bits`
    );
  }
}

// node_modules/@stellar/stellar-sdk/lib/esm/node_modules/.pnpm/@stellar_js-xdr@4.0.0/node_modules/@stellar/js-xdr/src/large-int.js
var LargeInt = class extends XdrPrimitiveType {
  /**
   * @param {Array<Number|BigInt|String>} parts - Slices to encode
   */
  constructor(args) {
    super();
    this._value = encodeBigIntFromBits(args, this.size, this.unsigned);
  }
  /**
   * Signed/unsigned representation
   * @type {Boolean}
   * @abstract
   */
  get unsigned() {
    throw new XdrNotImplementedDefinitionError();
  }
  /**
   * Size of the integer in bits
   * @type {Number}
   * @abstract
   */
  get size() {
    throw new XdrNotImplementedDefinitionError();
  }
  /**
   * Slice integer to parts with smaller bit size
   * @param {32|64|128} sliceSize - Size of each part in bits
   * @return {BigInt[]}
   */
  slice(sliceSize) {
    return sliceBigInt(this._value, this.size, sliceSize);
  }
  toString() {
    return this._value.toString();
  }
  toJSON() {
    return { _value: this._value.toString() };
  }
  toBigInt() {
    return BigInt(this._value);
  }
  /**
   * @inheritDoc
   */
  static read(reader) {
    const { size, unsigned } = this.prototype;
    if (size === 64) {
      return new this(
        unsigned ? reader.readBigUInt64BE() : reader.readBigInt64BE()
      );
    }
    return new this(
      ...Array.from(
        { length: size / 64 },
        () => reader.readBigUInt64BE()
      ).reverse()
    );
  }
  /**
   * @inheritDoc
   */
  static write(value, writer) {
    if (value instanceof this) {
      value = value._value;
    } else if (typeof value !== "bigint" || value > this.MAX_VALUE || value < this.MIN_VALUE)
      throw new XdrWriterError(`${value} is not a ${this.name}`);
    const { unsigned, size } = this.prototype;
    if (size === 64) {
      if (unsigned) {
        writer.writeBigUInt64BE(value);
      } else {
        writer.writeBigInt64BE(value);
      }
    } else {
      const uvalue = unsigned ? value : BigInt.asUintN(size, value);
      for (let i = size / 64 - 1; i >= 0; i--) {
        writer.writeBigUInt64BE(
          uvalue >> BigInt(i * 64) & 0xffffffffffffffffn
          // 2^64-1
        );
      }
    }
  }
  /**
   * @inheritDoc
   */
  static isValid(value) {
    if (value instanceof this) return true;
    if (typeof value === "bigint") {
      return value >= this.MIN_VALUE && value <= this.MAX_VALUE;
    }
    return false;
  }
  /**
   * Create instance from string
   * @param {String} string - Numeric representation
   * @return {LargeInt}
   */
  static fromString(string) {
    return new this(string);
  }
  static MAX_VALUE = 0n;
  static MIN_VALUE = 0n;
  /**
   * @internal
   * @return {void}
   */
  static defineIntBoundaries() {
    const [min, max] = calculateBigIntBoundaries(
      this.prototype.size,
      this.prototype.unsigned
    );
    this.MIN_VALUE = min;
    this.MAX_VALUE = max;
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/node_modules/.pnpm/@stellar_js-xdr@4.0.0/node_modules/@stellar/js-xdr/src/hyper.js
var Hyper = class extends LargeInt {
  /**
   * @param {Array<Number|BigInt|String>} parts - Slices to encode
   */
  constructor(...args) {
    super(args);
  }
  get low() {
    return Number(this._value & 0xffffffffn) << 0;
  }
  get high() {
    return Number(this._value >> 32n) >> 0;
  }
  get size() {
    return 64;
  }
  get unsigned() {
    return false;
  }
  /**
   * Create Hyper instance from two [high][low] i32 values
   * @param {Number} low - Low part of i64 number
   * @param {Number} high - High part of i64 number
   * @return {LargeInt}
   */
  static fromBits(low, high) {
    return new this(low, high);
  }
};
Hyper.defineIntBoundaries();

// node_modules/@stellar/stellar-sdk/lib/esm/node_modules/.pnpm/@stellar_js-xdr@4.0.0/node_modules/@stellar/js-xdr/src/unsigned-int.js
var MAX_VALUE2 = 4294967295;
var MIN_VALUE2 = 0;
var UnsignedInt = class extends XdrPrimitiveType {
  /**
   * @inheritDoc
   */
  static read(reader) {
    return reader.readUInt32BE();
  }
  /**
   * @inheritDoc
   */
  static write(value, writer) {
    if (typeof value !== "number" || !(value >= MIN_VALUE2 && value <= MAX_VALUE2) || value % 1 !== 0)
      throw new XdrWriterError("invalid u32 value");
    writer.writeUInt32BE(value);
  }
  /**
   * @inheritDoc
   */
  static isValid(value) {
    if (typeof value !== "number" || value % 1 !== 0) {
      return false;
    }
    return value >= MIN_VALUE2 && value <= MAX_VALUE2;
  }
};
UnsignedInt.MAX_VALUE = MAX_VALUE2;
UnsignedInt.MIN_VALUE = MIN_VALUE2;

// node_modules/@stellar/stellar-sdk/lib/esm/node_modules/.pnpm/@stellar_js-xdr@4.0.0/node_modules/@stellar/js-xdr/src/unsigned-hyper.js
var UnsignedHyper = class extends LargeInt {
  /**
   * @param {Array<Number|BigInt|String>} parts - Slices to encode
   */
  constructor(...args) {
    super(args);
  }
  get low() {
    return Number(this._value & 0xffffffffn) << 0;
  }
  get high() {
    return Number(this._value >> 32n) >> 0;
  }
  get size() {
    return 64;
  }
  get unsigned() {
    return true;
  }
  /**
   * Create UnsignedHyper instance from two [high][low] i32 values
   * @param {Number} low - Low part of u64 number
   * @param {Number} high - High part of u64 number
   * @return {UnsignedHyper}
   */
  static fromBits(low, high) {
    return new this(low, high);
  }
};
UnsignedHyper.defineIntBoundaries();

// node_modules/@stellar/stellar-sdk/lib/esm/node_modules/.pnpm/@stellar_js-xdr@4.0.0/node_modules/@stellar/js-xdr/src/float.js
var Float = class extends XdrPrimitiveType {
  /**
   * @inheritDoc
   */
  static read(reader) {
    return reader.readFloatBE();
  }
  /**
   * @inheritDoc
   */
  static write(value, writer) {
    if (typeof value !== "number") throw new XdrWriterError("not a number");
    writer.writeFloatBE(value);
  }
  /**
   * @inheritDoc
   */
  static isValid(value) {
    return typeof value === "number";
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/node_modules/.pnpm/@stellar_js-xdr@4.0.0/node_modules/@stellar/js-xdr/src/double.js
var Double = class extends XdrPrimitiveType {
  /**
   * @inheritDoc
   */
  static read(reader) {
    return reader.readDoubleBE();
  }
  /**
   * @inheritDoc
   */
  static write(value, writer) {
    if (typeof value !== "number") throw new XdrWriterError("not a number");
    writer.writeDoubleBE(value);
  }
  /**
   * @inheritDoc
   */
  static isValid(value) {
    return typeof value === "number";
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/node_modules/.pnpm/@stellar_js-xdr@4.0.0/node_modules/@stellar/js-xdr/src/quadruple.js
var Quadruple = class extends XdrPrimitiveType {
  static read() {
    throw new XdrDefinitionError("quadruple not supported");
  }
  static write() {
    throw new XdrDefinitionError("quadruple not supported");
  }
  static isValid() {
    return false;
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/node_modules/.pnpm/@stellar_js-xdr@4.0.0/node_modules/@stellar/js-xdr/src/bool.js
var Bool = class extends XdrPrimitiveType {
  /**
   * @inheritDoc
   */
  static read(reader) {
    const value = Int.read(reader);
    switch (value) {
      case 0:
        return false;
      case 1:
        return true;
      default:
        throw new XdrReaderError(`got ${value} when trying to read a bool`);
    }
  }
  /**
   * @inheritDoc
   */
  static write(value, writer) {
    const intVal = value ? 1 : 0;
    Int.write(intVal, writer);
  }
  /**
   * @inheritDoc
   */
  static isValid(value) {
    return typeof value === "boolean";
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/node_modules/.pnpm/@stellar_js-xdr@4.0.0/node_modules/@stellar/js-xdr/src/string.js
var import_buffer4 = require("buffer");
var String2 = class extends XdrCompositeType {
  constructor(maxLength = UnsignedInt.MAX_VALUE) {
    super();
    this._maxLength = maxLength;
  }
  /**
   * @inheritDoc
   */
  read(reader) {
    const size = UnsignedInt.read(reader);
    if (size > this._maxLength)
      throw new XdrReaderError(
        `saw ${size} length String, max allowed is ${this._maxLength}`
      );
    return reader.read(size);
  }
  readString(reader) {
    return this.read(reader).toString("utf8");
  }
  /**
   * @inheritDoc
   */
  write(value, writer) {
    const size = typeof value === "string" ? import_buffer4.Buffer.byteLength(value, "utf8") : value.length;
    if (size > this._maxLength)
      throw new XdrWriterError(
        `got ${value.length} bytes, max allowed is ${this._maxLength}`
      );
    UnsignedInt.write(size, writer);
    writer.write(value, size);
  }
  /**
   * @inheritDoc
   */
  isValid(value) {
    if (typeof value === "string") {
      return import_buffer4.Buffer.byteLength(value, "utf8") <= this._maxLength;
    }
    if (value instanceof Array || import_buffer4.Buffer.isBuffer(value)) {
      return value.length <= this._maxLength;
    }
    return false;
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/node_modules/.pnpm/@stellar_js-xdr@4.0.0/node_modules/@stellar/js-xdr/src/opaque.js
var import_buffer5 = require("buffer");
var Opaque = class extends XdrCompositeType {
  constructor(length) {
    super();
    this._length = length;
  }
  /**
   * @inheritDoc
   */
  read(reader) {
    return reader.read(this._length);
  }
  /**
   * @inheritDoc
   */
  write(value, writer) {
    const { length } = value;
    if (length !== this._length)
      throw new XdrWriterError(
        `got ${value.length} bytes, expected ${this._length}`
      );
    writer.write(value, length);
  }
  /**
   * @inheritDoc
   */
  isValid(value) {
    return import_buffer5.Buffer.isBuffer(value) && value.length === this._length;
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/node_modules/.pnpm/@stellar_js-xdr@4.0.0/node_modules/@stellar/js-xdr/src/var-opaque.js
var import_buffer6 = require("buffer");
var VarOpaque = class extends XdrCompositeType {
  constructor(maxLength = UnsignedInt.MAX_VALUE) {
    super();
    this._maxLength = maxLength;
  }
  /**
   * @inheritDoc
   */
  read(reader) {
    const size = UnsignedInt.read(reader);
    if (size > this._maxLength)
      throw new XdrReaderError(
        `saw ${size} length VarOpaque, max allowed is ${this._maxLength}`
      );
    return reader.read(size);
  }
  /**
   * @inheritDoc
   */
  write(value, writer) {
    const { length } = value;
    if (value.length > this._maxLength)
      throw new XdrWriterError(
        `got ${value.length} bytes, max allowed is ${this._maxLength}`
      );
    UnsignedInt.write(length, writer);
    writer.write(value, length);
  }
  /**
   * @inheritDoc
   */
  isValid(value) {
    return import_buffer6.Buffer.isBuffer(value) && value.length <= this._maxLength;
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/node_modules/.pnpm/@stellar_js-xdr@4.0.0/node_modules/@stellar/js-xdr/src/array.js
var Array2 = class extends NestedXdrType {
  constructor(childType, length, maxDepth = NestedXdrType.DEFAULT_MAX_DEPTH) {
    super(maxDepth);
    this._childType = childType;
    this._length = length;
  }
  /**
   * @inheritDoc
   */
  read(reader, remainingDepth = this._maxDepth) {
    if (this._length > reader.remainingBytes()) {
      throw new XdrReaderError(
        `Array length ${this._length} exceeds remaining ${reader.remainingBytes()} bytes`
      );
    }
    NestedXdrType.checkDepth(remainingDepth);
    const result = [];
    for (let i = 0; i < this._length; i++) {
      result.push(this._childType.read(reader, remainingDepth - 1));
    }
    return result;
  }
  /**
   * @inheritDoc
   */
  write(value, writer) {
    if (!global.Array.isArray(value))
      throw new XdrWriterError(`value is not array`);
    if (value.length !== this._length)
      throw new XdrWriterError(
        `got array of size ${value.length}, expected ${this._length}`
      );
    for (const child of value) {
      this._childType.write(child, writer);
    }
  }
  /**
   * @inheritDoc
   */
  isValid(value) {
    if (!(value instanceof global.Array) || value.length !== this._length) {
      return false;
    }
    for (const child of value) {
      if (!this._childType.isValid(child)) return false;
    }
    return true;
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/node_modules/.pnpm/@stellar_js-xdr@4.0.0/node_modules/@stellar/js-xdr/src/var-array.js
var VarArray = class extends NestedXdrType {
  constructor(childType, maxLength = UnsignedInt.MAX_VALUE, maxDepth = NestedXdrType.DEFAULT_MAX_DEPTH) {
    super(maxDepth);
    this._childType = childType;
    this._maxLength = maxLength;
  }
  /**
   * @inheritDoc
   */
  read(reader, remainingDepth = this._maxDepth) {
    NestedXdrType.checkDepth(remainingDepth);
    const length = UnsignedInt.read(reader);
    if (length > this._maxLength)
      throw new XdrReaderError(
        `saw ${length} length VarArray, max allowed is ${this._maxLength}`
      );
    if (length > reader.remainingBytes()) {
      throw new XdrReaderError(
        `VarArray length ${length} exceeds remaining ${reader.remainingBytes()} bytes`
      );
    }
    const result = [];
    for (let i = 0; i < length; i++) {
      result.push(this._childType.read(reader, remainingDepth - 1));
    }
    return result;
  }
  /**
   * @inheritDoc
   */
  write(value, writer) {
    if (!(value instanceof Array))
      throw new XdrWriterError(`value is not array`);
    if (value.length > this._maxLength)
      throw new XdrWriterError(
        `got array of size ${value.length}, max allowed is ${this._maxLength}`
      );
    UnsignedInt.write(value.length, writer);
    for (const child of value) {
      this._childType.write(child, writer);
    }
  }
  /**
   * @inheritDoc
   */
  isValid(value) {
    if (!(value instanceof Array) || value.length > this._maxLength) {
      return false;
    }
    for (const child of value) {
      if (!this._childType.isValid(child)) return false;
    }
    return true;
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/node_modules/.pnpm/@stellar_js-xdr@4.0.0/node_modules/@stellar/js-xdr/src/option.js
var Option = class extends NestedXdrType {
  constructor(childType, maxDepth = NestedXdrType.DEFAULT_MAX_DEPTH) {
    super(maxDepth);
    this._childType = childType;
  }
  /**
   * @inheritDoc
   */
  read(reader, remainingDepth = this._maxDepth) {
    NestedXdrType.checkDepth(remainingDepth);
    if (Bool.read(reader)) {
      return this._childType.read(reader, remainingDepth - 1);
    }
    return void 0;
  }
  /**
   * @inheritDoc
   */
  write(value, writer) {
    const isPresent = value !== null && value !== void 0;
    Bool.write(isPresent, writer);
    if (isPresent) {
      this._childType.write(value, writer);
    }
  }
  /**
   * @inheritDoc
   */
  isValid(value) {
    if (value === null || value === void 0) {
      return true;
    }
    return this._childType.isValid(value);
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/node_modules/.pnpm/@stellar_js-xdr@4.0.0/node_modules/@stellar/js-xdr/src/void.js
var Void = class extends XdrPrimitiveType {
  /* jshint unused: false */
  static read() {
    return void 0;
  }
  static write(value) {
    if (value !== void 0)
      throw new XdrWriterError("trying to write value to a void slot");
  }
  static isValid(value) {
    return value === void 0;
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/node_modules/.pnpm/@stellar_js-xdr@4.0.0/node_modules/@stellar/js-xdr/src/enum.js
var Enum = class _Enum extends XdrPrimitiveType {
  constructor(name, value) {
    super();
    this.name = name;
    this.value = value;
  }
  /**
   * @inheritDoc
   */
  static read(reader) {
    const intVal = Int.read(reader);
    const res = this._byValue[intVal];
    if (res === void 0)
      throw new XdrReaderError(
        `unknown ${this.enumName} member for value ${intVal}`
      );
    return res;
  }
  /**
   * @inheritDoc
   */
  static write(value, writer) {
    if (!this.isValid(value)) {
      throw new XdrWriterError(
        `${value} has enum name ${value?.enumName}, not ${this.enumName}: ${JSON.stringify(value)}`
      );
    }
    Int.write(value.value, writer);
  }
  /**
   * @inheritDoc
   */
  static isValid(value) {
    return value?.constructor?.enumName === this.enumName || isSerializableIsh(value, this);
  }
  static members() {
    return this._members;
  }
  static values() {
    return Object.values(this._members);
  }
  static fromName(name) {
    const result = this._members[name];
    if (!result)
      throw new TypeError(`${name} is not a member of ${this.enumName}`);
    return result;
  }
  static fromValue(value) {
    const result = this._byValue[value];
    if (result === void 0)
      throw new TypeError(
        `${value} is not a value of any member of ${this.enumName}`
      );
    return result;
  }
  static create(context, name, members) {
    const ChildEnum = class extends _Enum {
    };
    ChildEnum.enumName = name;
    context.results[name] = ChildEnum;
    ChildEnum._members = {};
    ChildEnum._byValue = {};
    for (const [key, value] of Object.entries(members)) {
      const inst = new ChildEnum(key, value);
      ChildEnum._members[key] = inst;
      ChildEnum._byValue[value] = inst;
      ChildEnum[key] = () => inst;
    }
    return ChildEnum;
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/node_modules/.pnpm/@stellar_js-xdr@4.0.0/node_modules/@stellar/js-xdr/src/reference.js
var Reference = class extends XdrPrimitiveType {
  /* jshint unused: false */
  resolve() {
    throw new XdrDefinitionError(
      '"resolve" method should be implemented in the descendant class'
    );
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/node_modules/.pnpm/@stellar_js-xdr@4.0.0/node_modules/@stellar/js-xdr/src/struct.js
var Struct = class _Struct extends NestedXdrType {
  constructor(attributes, maxDepth) {
    const resolvedMaxDepth = maxDepth ?? new.target?._maxDepth;
    super(resolvedMaxDepth);
    this._attributes = attributes || {};
  }
  /**
   * @inheritDoc
   */
  static read(reader, remainingDepth = this._maxDepth) {
    NestedXdrType.checkDepth(remainingDepth);
    const attributes = {};
    for (const [fieldName, type] of this._fields) {
      attributes[fieldName] = type.read(reader, remainingDepth - 1);
    }
    return new this(attributes, this._maxDepth);
  }
  /**
   * @inheritDoc
   */
  static write(value, writer) {
    if (!this.isValid(value)) {
      throw new XdrWriterError(
        `${value} has struct name ${value?.constructor?.structName}, not ${this.structName}: ${JSON.stringify(value)}`
      );
    }
    for (const [fieldName, type] of this._fields) {
      const attribute = value._attributes[fieldName];
      type.write(attribute, writer);
    }
  }
  /**
   * @inheritDoc
   */
  static isValid(value) {
    return value?.constructor?.structName === this.structName || isSerializableIsh(value, this);
  }
  static create(context, name, fields, maxDepth = NestedXdrType.DEFAULT_MAX_DEPTH) {
    const ChildStruct = class extends _Struct {
    };
    ChildStruct.structName = name;
    ChildStruct._maxDepth = maxDepth;
    context.results[name] = ChildStruct;
    const mappedFields = new Array(fields.length);
    for (let i = 0; i < fields.length; i++) {
      const fieldDescriptor = fields[i];
      const fieldName = fieldDescriptor[0];
      let field = fieldDescriptor[1];
      if (field instanceof Reference) {
        field = field.resolve(context);
      }
      mappedFields[i] = [fieldName, field];
      ChildStruct.prototype[fieldName] = createAccessorMethod(fieldName);
    }
    ChildStruct._fields = mappedFields;
    return ChildStruct;
  }
};
function createAccessorMethod(name) {
  return function readOrWriteAttribute(value) {
    if (value !== void 0) {
      this._attributes[name] = value;
    }
    return this._attributes[name];
  };
}

// node_modules/@stellar/stellar-sdk/lib/esm/node_modules/.pnpm/@stellar_js-xdr@4.0.0/node_modules/@stellar/js-xdr/src/union.js
var Union = class _Union extends NestedXdrType {
  constructor(aSwitch, value, maxDepth) {
    const resolvedMaxDepth = maxDepth ?? new.target?._maxDepth;
    super(resolvedMaxDepth);
    this.set(aSwitch, value);
  }
  set(aSwitch, value) {
    if (typeof aSwitch === "string") {
      aSwitch = this.constructor._switchOn.fromName(aSwitch);
    }
    this._switch = aSwitch;
    const arm = this.constructor.armForSwitch(this._switch);
    this._arm = arm;
    this._armType = arm === Void ? Void : this.constructor._arms[arm];
    this._value = value;
  }
  get(armName = this._arm) {
    if (this._arm !== Void && this._arm !== armName)
      throw new TypeError(`${armName} not set`);
    return this._value;
  }
  switch() {
    return this._switch;
  }
  arm() {
    return this._arm;
  }
  armType() {
    return this._armType;
  }
  value() {
    return this._value;
  }
  static armForSwitch(aSwitch) {
    const member = this._switches.get(aSwitch);
    if (member !== void 0) {
      return member;
    }
    if (this._defaultArm) {
      return this._defaultArm;
    }
    throw new TypeError(`Bad union switch: ${aSwitch}`);
  }
  static armTypeForArm(arm) {
    if (arm === Void) {
      return Void;
    }
    return this._arms[arm];
  }
  /**
   * @inheritDoc
   */
  static read(reader, remainingDepth = this._maxDepth) {
    NestedXdrType.checkDepth(remainingDepth);
    const aSwitch = this._switchOn.read(reader, remainingDepth - 1);
    const arm = this.armForSwitch(aSwitch);
    const armType = arm === Void ? Void : this._arms[arm];
    let value;
    if (armType !== void 0) {
      value = armType.read(reader, remainingDepth - 1);
    } else {
      value = arm.read(reader, remainingDepth - 1);
    }
    return new this(aSwitch, value, this._maxDepth);
  }
  /**
   * @inheritDoc
   */
  static write(value, writer) {
    if (!this.isValid(value)) {
      throw new XdrWriterError(
        `${value} has union name ${value?.unionName}, not ${this.unionName}: ${JSON.stringify(value)}`
      );
    }
    this._switchOn.write(value.switch(), writer);
    value.armType().write(value.value(), writer);
  }
  /**
   * @inheritDoc
   */
  static isValid(value) {
    return value?.constructor?.unionName === this.unionName || isSerializableIsh(value, this);
  }
  static create(context, name, config2, maxDepth = NestedXdrType.DEFAULT_MAX_DEPTH) {
    const ChildUnion = class extends _Union {
    };
    ChildUnion.unionName = name;
    ChildUnion._maxDepth = maxDepth;
    context.results[name] = ChildUnion;
    if (config2.switchOn instanceof Reference) {
      ChildUnion._switchOn = config2.switchOn.resolve(context);
    } else {
      ChildUnion._switchOn = config2.switchOn;
    }
    ChildUnion._switches = /* @__PURE__ */ new Map();
    ChildUnion._arms = {};
    let defaultArm = config2.defaultArm;
    if (defaultArm instanceof Reference) {
      defaultArm = defaultArm.resolve(context);
    }
    ChildUnion._defaultArm = defaultArm;
    for (const [aSwitch, armName] of config2.switches) {
      const key = typeof aSwitch === "string" ? ChildUnion._switchOn.fromName(aSwitch) : aSwitch;
      ChildUnion._switches.set(key, armName);
    }
    if (ChildUnion._switchOn.values !== void 0) {
      for (const aSwitch of ChildUnion._switchOn.values()) {
        ChildUnion[aSwitch.name] = function ctr(value) {
          return new ChildUnion(aSwitch, value);
        };
        ChildUnion.prototype[aSwitch.name] = function set(value) {
          return this.set(aSwitch, value);
        };
      }
    }
    if (config2.arms) {
      for (const [armsName, value] of Object.entries(config2.arms)) {
        ChildUnion._arms[armsName] = value instanceof Reference ? value.resolve(context) : value;
        if (value !== Void) {
          ChildUnion.prototype[armsName] = function get() {
            return this.get(armsName);
          };
        }
      }
    }
    return ChildUnion;
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/node_modules/.pnpm/@stellar_js-xdr@4.0.0/node_modules/@stellar/js-xdr/src/config.js
var SimpleReference = class extends Reference {
  constructor(name) {
    super();
    this.name = name;
  }
  resolve(context) {
    const defn = context.definitions[this.name];
    return defn.resolve(context);
  }
};
var ArrayReference = class extends Reference {
  constructor(childReference, length, variable = false) {
    super();
    this.childReference = childReference;
    this.length = length;
    this.variable = variable;
  }
  resolve(context) {
    let resolvedChild = this.childReference;
    let length = this.length;
    if (resolvedChild instanceof Reference) {
      resolvedChild = resolvedChild.resolve(context);
    }
    if (length instanceof Reference) {
      length = length.resolve(context);
    }
    if (this.variable) {
      return new VarArray(resolvedChild, length);
    }
    return new Array2(resolvedChild, length);
  }
};
var OptionReference = class extends Reference {
  constructor(childReference) {
    super();
    this.childReference = childReference;
    this.name = childReference.name;
  }
  resolve(context) {
    let resolvedChild = this.childReference;
    if (resolvedChild instanceof Reference) {
      resolvedChild = resolvedChild.resolve(context);
    }
    return new Option(resolvedChild);
  }
};
var SizedReference = class extends Reference {
  constructor(sizedType, length) {
    super();
    this.sizedType = sizedType;
    this.length = length;
  }
  resolve(context) {
    let length = this.length;
    if (length instanceof Reference) {
      length = length.resolve(context);
    }
    return new this.sizedType(length);
  }
};
var Definition = class {
  constructor(constructor, name, cfg) {
    this.constructor = constructor;
    this.name = name;
    this.config = cfg;
  }
  // resolve calls the constructor of this definition with the provided context
  // and this definitions config values.  The definitions constructor should
  // populate the final type on `context.results`, and may refer to other
  // definitions through `context.definitions`
  resolve(context) {
    if (this.name in context.results) {
      return context.results[this.name];
    }
    return this.constructor(context, this.name, this.config);
  }
};
function createTypedef(context, typeName, value) {
  if (value instanceof Reference) {
    value = value.resolve(context);
  }
  context.results[typeName] = value;
  return value;
}
function createConst(context, name, value) {
  context.results[name] = value;
  return value;
}
var TypeBuilder = class {
  constructor(destination) {
    this._destination = destination;
    this._definitions = {};
  }
  enum(name, members) {
    const result = new Definition(Enum.create, name, members);
    this.define(name, result);
  }
  struct(name, members) {
    const result = new Definition(Struct.create, name, members);
    this.define(name, result);
  }
  union(name, cfg) {
    const result = new Definition(Union.create, name, cfg);
    this.define(name, result);
  }
  typedef(name, cfg) {
    const result = new Definition(createTypedef, name, cfg);
    this.define(name, result);
  }
  const(name, cfg) {
    const result = new Definition(createConst, name, cfg);
    this.define(name, result);
  }
  void() {
    return Void;
  }
  bool() {
    return Bool;
  }
  int() {
    return Int;
  }
  hyper() {
    return Hyper;
  }
  uint() {
    return UnsignedInt;
  }
  uhyper() {
    return UnsignedHyper;
  }
  float() {
    return Float;
  }
  double() {
    return Double;
  }
  quadruple() {
    return Quadruple;
  }
  string(length) {
    return new SizedReference(String2, length);
  }
  opaque(length) {
    return new SizedReference(Opaque, length);
  }
  varOpaque(length) {
    return new SizedReference(VarOpaque, length);
  }
  array(childType, length) {
    return new ArrayReference(childType, length);
  }
  varArray(childType, maxLength) {
    return new ArrayReference(childType, maxLength, true);
  }
  option(childType) {
    return new OptionReference(childType);
  }
  define(name, definition) {
    if (this._destination[name] === void 0) {
      this._definitions[name] = definition;
    } else {
      throw new XdrDefinitionError(`${name} is already defined`);
    }
  }
  lookup(name) {
    return new SimpleReference(name);
  }
  resolve() {
    for (const defn of Object.values(this._definitions)) {
      defn.resolve({
        definitions: this._definitions,
        results: this._destination
      });
    }
  }
};
function config(fn, types2 = {}) {
  if (fn) {
    const builder = new TypeBuilder(types2);
    fn(builder);
    builder.resolve();
  }
  return types2;
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/generated/curr_generated.js
var types = config((xdr) => {
  const SCSYMBOL_LIMIT = 32;
  const SC_SPEC_DOC_LIMIT = 1024;
  xdr.typedef("Value", xdr.varOpaque());
  xdr.struct("ScpBallot", [
    ["counter", xdr.lookup("Uint32")],
    ["value", xdr.lookup("Value")]
  ]);
  xdr.enum("ScpStatementType", {
    scpStPrepare: 0,
    scpStConfirm: 1,
    scpStExternalize: 2,
    scpStNominate: 3
  });
  xdr.struct("ScpNomination", [
    ["quorumSetHash", xdr.lookup("Hash")],
    ["votes", xdr.varArray(xdr.lookup("Value"), 2147483647)],
    ["accepted", xdr.varArray(xdr.lookup("Value"), 2147483647)]
  ]);
  xdr.struct("ScpStatementPrepare", [
    ["quorumSetHash", xdr.lookup("Hash")],
    ["ballot", xdr.lookup("ScpBallot")],
    ["prepared", xdr.option(xdr.lookup("ScpBallot"))],
    ["preparedPrime", xdr.option(xdr.lookup("ScpBallot"))],
    ["nC", xdr.lookup("Uint32")],
    ["nH", xdr.lookup("Uint32")]
  ]);
  xdr.struct("ScpStatementConfirm", [
    ["ballot", xdr.lookup("ScpBallot")],
    ["nPrepared", xdr.lookup("Uint32")],
    ["nCommit", xdr.lookup("Uint32")],
    ["nH", xdr.lookup("Uint32")],
    ["quorumSetHash", xdr.lookup("Hash")]
  ]);
  xdr.struct("ScpStatementExternalize", [
    ["commit", xdr.lookup("ScpBallot")],
    ["nH", xdr.lookup("Uint32")],
    ["commitQuorumSetHash", xdr.lookup("Hash")]
  ]);
  xdr.union("ScpStatementPledges", {
    switchOn: xdr.lookup("ScpStatementType"),
    switchName: "type",
    switches: [
      ["scpStPrepare", "prepare"],
      ["scpStConfirm", "confirm"],
      ["scpStExternalize", "externalize"],
      ["scpStNominate", "nominate"]
    ],
    arms: {
      prepare: xdr.lookup("ScpStatementPrepare"),
      confirm: xdr.lookup("ScpStatementConfirm"),
      externalize: xdr.lookup("ScpStatementExternalize"),
      nominate: xdr.lookup("ScpNomination")
    }
  });
  xdr.struct("ScpStatement", [
    ["nodeId", xdr.lookup("NodeId")],
    ["slotIndex", xdr.lookup("Uint64")],
    ["pledges", xdr.lookup("ScpStatementPledges")]
  ]);
  xdr.struct("ScpEnvelope", [
    ["statement", xdr.lookup("ScpStatement")],
    ["signature", xdr.lookup("Signature")]
  ]);
  xdr.struct("ScpQuorumSet", [
    ["threshold", xdr.lookup("Uint32")],
    ["validators", xdr.varArray(xdr.lookup("NodeId"), 2147483647)],
    ["innerSets", xdr.varArray(xdr.lookup("ScpQuorumSet"), 2147483647)]
  ]);
  xdr.typedef("Thresholds", xdr.opaque(4));
  xdr.typedef("String32", xdr.string(32));
  xdr.typedef("String64", xdr.string(64));
  xdr.typedef("SequenceNumber", xdr.lookup("Int64"));
  xdr.typedef("DataValue", xdr.varOpaque(64));
  xdr.typedef("AssetCode4", xdr.opaque(4));
  xdr.typedef("AssetCode12", xdr.opaque(12));
  xdr.enum("AssetType", {
    assetTypeNative: 0,
    assetTypeCreditAlphanum4: 1,
    assetTypeCreditAlphanum12: 2,
    assetTypePoolShare: 3
  });
  xdr.union("AssetCode", {
    switchOn: xdr.lookup("AssetType"),
    switchName: "type",
    switches: [
      ["assetTypeCreditAlphanum4", "assetCode4"],
      ["assetTypeCreditAlphanum12", "assetCode12"]
    ],
    arms: {
      assetCode4: xdr.lookup("AssetCode4"),
      assetCode12: xdr.lookup("AssetCode12")
    }
  });
  xdr.struct("AlphaNum4", [
    ["assetCode", xdr.lookup("AssetCode4")],
    ["issuer", xdr.lookup("AccountId")]
  ]);
  xdr.struct("AlphaNum12", [
    ["assetCode", xdr.lookup("AssetCode12")],
    ["issuer", xdr.lookup("AccountId")]
  ]);
  xdr.union("Asset", {
    switchOn: xdr.lookup("AssetType"),
    switchName: "type",
    switches: [
      ["assetTypeNative", xdr.void()],
      ["assetTypeCreditAlphanum4", "alphaNum4"],
      ["assetTypeCreditAlphanum12", "alphaNum12"]
    ],
    arms: {
      alphaNum4: xdr.lookup("AlphaNum4"),
      alphaNum12: xdr.lookup("AlphaNum12")
    }
  });
  xdr.struct("Price", [
    ["n", xdr.lookup("Int32")],
    ["d", xdr.lookup("Int32")]
  ]);
  xdr.struct("Liabilities", [
    ["buying", xdr.lookup("Int64")],
    ["selling", xdr.lookup("Int64")]
  ]);
  xdr.enum("ThresholdIndices", {
    thresholdMasterWeight: 0,
    thresholdLow: 1,
    thresholdMed: 2,
    thresholdHigh: 3
  });
  xdr.enum("LedgerEntryType", {
    account: 0,
    trustline: 1,
    offer: 2,
    data: 3,
    claimableBalance: 4,
    liquidityPool: 5,
    contractData: 6,
    contractCode: 7,
    configSetting: 8,
    ttl: 9
  });
  xdr.struct("Signer", [
    ["key", xdr.lookup("SignerKey")],
    ["weight", xdr.lookup("Uint32")]
  ]);
  xdr.enum("AccountFlags", {
    authRequiredFlag: 1,
    authRevocableFlag: 2,
    authImmutableFlag: 4,
    authClawbackEnabledFlag: 8
  });
  xdr.const("MASK_ACCOUNT_FLAGS", 7);
  xdr.const("MASK_ACCOUNT_FLAGS_V17", 15);
  xdr.const("MAX_SIGNERS", 20);
  xdr.typedef("SponsorshipDescriptor", xdr.option(xdr.lookup("AccountId")));
  xdr.struct("AccountEntryExtensionV3", [
    ["ext", xdr.lookup("ExtensionPoint")],
    ["seqLedger", xdr.lookup("Uint32")],
    ["seqTime", xdr.lookup("TimePoint")]
  ]);
  xdr.union("AccountEntryExtensionV2Ext", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [
      [0, xdr.void()],
      [3, "v3"]
    ],
    arms: {
      v3: xdr.lookup("AccountEntryExtensionV3")
    }
  });
  xdr.struct("AccountEntryExtensionV2", [
    ["numSponsored", xdr.lookup("Uint32")],
    ["numSponsoring", xdr.lookup("Uint32")],
    [
      "signerSponsoringIDs",
      xdr.varArray(
        xdr.lookup("SponsorshipDescriptor"),
        xdr.lookup("MAX_SIGNERS")
      )
    ],
    ["ext", xdr.lookup("AccountEntryExtensionV2Ext")]
  ]);
  xdr.union("AccountEntryExtensionV1Ext", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [
      [0, xdr.void()],
      [2, "v2"]
    ],
    arms: {
      v2: xdr.lookup("AccountEntryExtensionV2")
    }
  });
  xdr.struct("AccountEntryExtensionV1", [
    ["liabilities", xdr.lookup("Liabilities")],
    ["ext", xdr.lookup("AccountEntryExtensionV1Ext")]
  ]);
  xdr.union("AccountEntryExt", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [
      [0, xdr.void()],
      [1, "v1"]
    ],
    arms: {
      v1: xdr.lookup("AccountEntryExtensionV1")
    }
  });
  xdr.struct("AccountEntry", [
    ["accountId", xdr.lookup("AccountId")],
    ["balance", xdr.lookup("Int64")],
    ["seqNum", xdr.lookup("SequenceNumber")],
    ["numSubEntries", xdr.lookup("Uint32")],
    ["inflationDest", xdr.option(xdr.lookup("AccountId"))],
    ["flags", xdr.lookup("Uint32")],
    ["homeDomain", xdr.lookup("String32")],
    ["thresholds", xdr.lookup("Thresholds")],
    ["signers", xdr.varArray(xdr.lookup("Signer"), xdr.lookup("MAX_SIGNERS"))],
    ["ext", xdr.lookup("AccountEntryExt")]
  ]);
  xdr.enum("TrustLineFlags", {
    authorizedFlag: 1,
    authorizedToMaintainLiabilitiesFlag: 2,
    trustlineClawbackEnabledFlag: 4
  });
  xdr.const("MASK_TRUSTLINE_FLAGS", 1);
  xdr.const("MASK_TRUSTLINE_FLAGS_V13", 3);
  xdr.const("MASK_TRUSTLINE_FLAGS_V17", 7);
  xdr.enum("LiquidityPoolType", {
    liquidityPoolConstantProduct: 0
  });
  xdr.union("TrustLineAsset", {
    switchOn: xdr.lookup("AssetType"),
    switchName: "type",
    switches: [
      ["assetTypeNative", xdr.void()],
      ["assetTypeCreditAlphanum4", "alphaNum4"],
      ["assetTypeCreditAlphanum12", "alphaNum12"],
      ["assetTypePoolShare", "liquidityPoolId"]
    ],
    arms: {
      alphaNum4: xdr.lookup("AlphaNum4"),
      alphaNum12: xdr.lookup("AlphaNum12"),
      liquidityPoolId: xdr.lookup("PoolId")
    }
  });
  xdr.union("TrustLineEntryExtensionV2Ext", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [[0, xdr.void()]],
    arms: {}
  });
  xdr.struct("TrustLineEntryExtensionV2", [
    ["liquidityPoolUseCount", xdr.lookup("Int32")],
    ["ext", xdr.lookup("TrustLineEntryExtensionV2Ext")]
  ]);
  xdr.union("TrustLineEntryV1Ext", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [
      [0, xdr.void()],
      [2, "v2"]
    ],
    arms: {
      v2: xdr.lookup("TrustLineEntryExtensionV2")
    }
  });
  xdr.struct("TrustLineEntryV1", [
    ["liabilities", xdr.lookup("Liabilities")],
    ["ext", xdr.lookup("TrustLineEntryV1Ext")]
  ]);
  xdr.union("TrustLineEntryExt", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [
      [0, xdr.void()],
      [1, "v1"]
    ],
    arms: {
      v1: xdr.lookup("TrustLineEntryV1")
    }
  });
  xdr.struct("TrustLineEntry", [
    ["accountId", xdr.lookup("AccountId")],
    ["asset", xdr.lookup("TrustLineAsset")],
    ["balance", xdr.lookup("Int64")],
    ["limit", xdr.lookup("Int64")],
    ["flags", xdr.lookup("Uint32")],
    ["ext", xdr.lookup("TrustLineEntryExt")]
  ]);
  xdr.enum("OfferEntryFlags", {
    passiveFlag: 1
  });
  xdr.const("MASK_OFFERENTRY_FLAGS", 1);
  xdr.union("OfferEntryExt", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [[0, xdr.void()]],
    arms: {}
  });
  xdr.struct("OfferEntry", [
    ["sellerId", xdr.lookup("AccountId")],
    ["offerId", xdr.lookup("Int64")],
    ["selling", xdr.lookup("Asset")],
    ["buying", xdr.lookup("Asset")],
    ["amount", xdr.lookup("Int64")],
    ["price", xdr.lookup("Price")],
    ["flags", xdr.lookup("Uint32")],
    ["ext", xdr.lookup("OfferEntryExt")]
  ]);
  xdr.union("DataEntryExt", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [[0, xdr.void()]],
    arms: {}
  });
  xdr.struct("DataEntry", [
    ["accountId", xdr.lookup("AccountId")],
    ["dataName", xdr.lookup("String64")],
    ["dataValue", xdr.lookup("DataValue")],
    ["ext", xdr.lookup("DataEntryExt")]
  ]);
  xdr.enum("ClaimPredicateType", {
    claimPredicateUnconditional: 0,
    claimPredicateAnd: 1,
    claimPredicateOr: 2,
    claimPredicateNot: 3,
    claimPredicateBeforeAbsoluteTime: 4,
    claimPredicateBeforeRelativeTime: 5
  });
  xdr.union("ClaimPredicate", {
    switchOn: xdr.lookup("ClaimPredicateType"),
    switchName: "type",
    switches: [
      ["claimPredicateUnconditional", xdr.void()],
      ["claimPredicateAnd", "andPredicates"],
      ["claimPredicateOr", "orPredicates"],
      ["claimPredicateNot", "notPredicate"],
      ["claimPredicateBeforeAbsoluteTime", "absBefore"],
      ["claimPredicateBeforeRelativeTime", "relBefore"]
    ],
    arms: {
      andPredicates: xdr.varArray(xdr.lookup("ClaimPredicate"), 2),
      orPredicates: xdr.varArray(xdr.lookup("ClaimPredicate"), 2),
      notPredicate: xdr.option(xdr.lookup("ClaimPredicate")),
      absBefore: xdr.lookup("Int64"),
      relBefore: xdr.lookup("Int64")
    }
  });
  xdr.enum("ClaimantType", {
    claimantTypeV0: 0
  });
  xdr.struct("ClaimantV0", [
    ["destination", xdr.lookup("AccountId")],
    ["predicate", xdr.lookup("ClaimPredicate")]
  ]);
  xdr.union("Claimant", {
    switchOn: xdr.lookup("ClaimantType"),
    switchName: "type",
    switches: [["claimantTypeV0", "v0"]],
    arms: {
      v0: xdr.lookup("ClaimantV0")
    }
  });
  xdr.enum("ClaimableBalanceFlags", {
    claimableBalanceClawbackEnabledFlag: 1
  });
  xdr.const("MASK_CLAIMABLE_BALANCE_FLAGS", 1);
  xdr.union("ClaimableBalanceEntryExtensionV1Ext", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [[0, xdr.void()]],
    arms: {}
  });
  xdr.struct("ClaimableBalanceEntryExtensionV1", [
    ["ext", xdr.lookup("ClaimableBalanceEntryExtensionV1Ext")],
    ["flags", xdr.lookup("Uint32")]
  ]);
  xdr.union("ClaimableBalanceEntryExt", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [
      [0, xdr.void()],
      [1, "v1"]
    ],
    arms: {
      v1: xdr.lookup("ClaimableBalanceEntryExtensionV1")
    }
  });
  xdr.struct("ClaimableBalanceEntry", [
    ["balanceId", xdr.lookup("ClaimableBalanceId")],
    ["claimants", xdr.varArray(xdr.lookup("Claimant"), 10)],
    ["asset", xdr.lookup("Asset")],
    ["amount", xdr.lookup("Int64")],
    ["ext", xdr.lookup("ClaimableBalanceEntryExt")]
  ]);
  xdr.struct("LiquidityPoolConstantProductParameters", [
    ["assetA", xdr.lookup("Asset")],
    ["assetB", xdr.lookup("Asset")],
    ["fee", xdr.lookup("Int32")]
  ]);
  xdr.struct("LiquidityPoolEntryConstantProduct", [
    ["params", xdr.lookup("LiquidityPoolConstantProductParameters")],
    ["reserveA", xdr.lookup("Int64")],
    ["reserveB", xdr.lookup("Int64")],
    ["totalPoolShares", xdr.lookup("Int64")],
    ["poolSharesTrustLineCount", xdr.lookup("Int64")]
  ]);
  xdr.union("LiquidityPoolEntryBody", {
    switchOn: xdr.lookup("LiquidityPoolType"),
    switchName: "type",
    switches: [["liquidityPoolConstantProduct", "constantProduct"]],
    arms: {
      constantProduct: xdr.lookup("LiquidityPoolEntryConstantProduct")
    }
  });
  xdr.struct("LiquidityPoolEntry", [
    ["liquidityPoolId", xdr.lookup("PoolId")],
    ["body", xdr.lookup("LiquidityPoolEntryBody")]
  ]);
  xdr.enum("ContractDataDurability", {
    temporary: 0,
    persistent: 1
  });
  xdr.struct("ContractDataEntry", [
    ["ext", xdr.lookup("ExtensionPoint")],
    ["contract", xdr.lookup("ScAddress")],
    ["key", xdr.lookup("ScVal")],
    ["durability", xdr.lookup("ContractDataDurability")],
    ["val", xdr.lookup("ScVal")]
  ]);
  xdr.struct("ContractCodeCostInputs", [
    ["ext", xdr.lookup("ExtensionPoint")],
    ["nInstructions", xdr.lookup("Uint32")],
    ["nFunctions", xdr.lookup("Uint32")],
    ["nGlobals", xdr.lookup("Uint32")],
    ["nTableEntries", xdr.lookup("Uint32")],
    ["nTypes", xdr.lookup("Uint32")],
    ["nDataSegments", xdr.lookup("Uint32")],
    ["nElemSegments", xdr.lookup("Uint32")],
    ["nImports", xdr.lookup("Uint32")],
    ["nExports", xdr.lookup("Uint32")],
    ["nDataSegmentBytes", xdr.lookup("Uint32")]
  ]);
  xdr.struct("ContractCodeEntryV1", [
    ["ext", xdr.lookup("ExtensionPoint")],
    ["costInputs", xdr.lookup("ContractCodeCostInputs")]
  ]);
  xdr.union("ContractCodeEntryExt", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [
      [0, xdr.void()],
      [1, "v1"]
    ],
    arms: {
      v1: xdr.lookup("ContractCodeEntryV1")
    }
  });
  xdr.struct("ContractCodeEntry", [
    ["ext", xdr.lookup("ContractCodeEntryExt")],
    ["hash", xdr.lookup("Hash")],
    ["code", xdr.varOpaque()]
  ]);
  xdr.struct("TtlEntry", [
    ["keyHash", xdr.lookup("Hash")],
    ["liveUntilLedgerSeq", xdr.lookup("Uint32")]
  ]);
  xdr.union("LedgerEntryExtensionV1Ext", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [[0, xdr.void()]],
    arms: {}
  });
  xdr.struct("LedgerEntryExtensionV1", [
    ["sponsoringId", xdr.lookup("SponsorshipDescriptor")],
    ["ext", xdr.lookup("LedgerEntryExtensionV1Ext")]
  ]);
  xdr.union("LedgerEntryData", {
    switchOn: xdr.lookup("LedgerEntryType"),
    switchName: "type",
    switches: [
      ["account", "account"],
      ["trustline", "trustLine"],
      ["offer", "offer"],
      ["data", "data"],
      ["claimableBalance", "claimableBalance"],
      ["liquidityPool", "liquidityPool"],
      ["contractData", "contractData"],
      ["contractCode", "contractCode"],
      ["configSetting", "configSetting"],
      ["ttl", "ttl"]
    ],
    arms: {
      account: xdr.lookup("AccountEntry"),
      trustLine: xdr.lookup("TrustLineEntry"),
      offer: xdr.lookup("OfferEntry"),
      data: xdr.lookup("DataEntry"),
      claimableBalance: xdr.lookup("ClaimableBalanceEntry"),
      liquidityPool: xdr.lookup("LiquidityPoolEntry"),
      contractData: xdr.lookup("ContractDataEntry"),
      contractCode: xdr.lookup("ContractCodeEntry"),
      configSetting: xdr.lookup("ConfigSettingEntry"),
      ttl: xdr.lookup("TtlEntry")
    }
  });
  xdr.union("LedgerEntryExt", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [
      [0, xdr.void()],
      [1, "v1"]
    ],
    arms: {
      v1: xdr.lookup("LedgerEntryExtensionV1")
    }
  });
  xdr.struct("LedgerEntry", [
    ["lastModifiedLedgerSeq", xdr.lookup("Uint32")],
    ["data", xdr.lookup("LedgerEntryData")],
    ["ext", xdr.lookup("LedgerEntryExt")]
  ]);
  xdr.struct("LedgerKeyAccount", [["accountId", xdr.lookup("AccountId")]]);
  xdr.struct("LedgerKeyTrustLine", [
    ["accountId", xdr.lookup("AccountId")],
    ["asset", xdr.lookup("TrustLineAsset")]
  ]);
  xdr.struct("LedgerKeyOffer", [
    ["sellerId", xdr.lookup("AccountId")],
    ["offerId", xdr.lookup("Int64")]
  ]);
  xdr.struct("LedgerKeyData", [
    ["accountId", xdr.lookup("AccountId")],
    ["dataName", xdr.lookup("String64")]
  ]);
  xdr.struct("LedgerKeyClaimableBalance", [
    ["balanceId", xdr.lookup("ClaimableBalanceId")]
  ]);
  xdr.struct("LedgerKeyLiquidityPool", [
    ["liquidityPoolId", xdr.lookup("PoolId")]
  ]);
  xdr.struct("LedgerKeyContractData", [
    ["contract", xdr.lookup("ScAddress")],
    ["key", xdr.lookup("ScVal")],
    ["durability", xdr.lookup("ContractDataDurability")]
  ]);
  xdr.struct("LedgerKeyContractCode", [["hash", xdr.lookup("Hash")]]);
  xdr.struct("LedgerKeyConfigSetting", [
    ["configSettingId", xdr.lookup("ConfigSettingId")]
  ]);
  xdr.struct("LedgerKeyTtl", [["keyHash", xdr.lookup("Hash")]]);
  xdr.union("LedgerKey", {
    switchOn: xdr.lookup("LedgerEntryType"),
    switchName: "type",
    switches: [
      ["account", "account"],
      ["trustline", "trustLine"],
      ["offer", "offer"],
      ["data", "data"],
      ["claimableBalance", "claimableBalance"],
      ["liquidityPool", "liquidityPool"],
      ["contractData", "contractData"],
      ["contractCode", "contractCode"],
      ["configSetting", "configSetting"],
      ["ttl", "ttl"]
    ],
    arms: {
      account: xdr.lookup("LedgerKeyAccount"),
      trustLine: xdr.lookup("LedgerKeyTrustLine"),
      offer: xdr.lookup("LedgerKeyOffer"),
      data: xdr.lookup("LedgerKeyData"),
      claimableBalance: xdr.lookup("LedgerKeyClaimableBalance"),
      liquidityPool: xdr.lookup("LedgerKeyLiquidityPool"),
      contractData: xdr.lookup("LedgerKeyContractData"),
      contractCode: xdr.lookup("LedgerKeyContractCode"),
      configSetting: xdr.lookup("LedgerKeyConfigSetting"),
      ttl: xdr.lookup("LedgerKeyTtl")
    }
  });
  xdr.enum("EnvelopeType", {
    envelopeTypeTxV0: 0,
    envelopeTypeScp: 1,
    envelopeTypeTx: 2,
    envelopeTypeAuth: 3,
    envelopeTypeScpvalue: 4,
    envelopeTypeTxFeeBump: 5,
    envelopeTypeOpId: 6,
    envelopeTypePoolRevokeOpId: 7,
    envelopeTypeContractId: 8,
    envelopeTypeSorobanAuthorization: 9,
    envelopeTypeSorobanAuthorizationWithAddress: 10
  });
  xdr.enum("BucketListType", {
    live: 0,
    hotArchive: 1
  });
  xdr.enum("BucketEntryType", {
    metaentry: -1,
    liveentry: 0,
    deadentry: 1,
    initentry: 2
  });
  xdr.enum("HotArchiveBucketEntryType", {
    hotArchiveMetaentry: -1,
    hotArchiveArchived: 0,
    hotArchiveLive: 1
  });
  xdr.union("BucketMetadataExt", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [
      [0, xdr.void()],
      [1, "bucketListType"]
    ],
    arms: {
      bucketListType: xdr.lookup("BucketListType")
    }
  });
  xdr.struct("BucketMetadata", [
    ["ledgerVersion", xdr.lookup("Uint32")],
    ["ext", xdr.lookup("BucketMetadataExt")]
  ]);
  xdr.union("BucketEntry", {
    switchOn: xdr.lookup("BucketEntryType"),
    switchName: "type",
    switches: [
      ["liveentry", "liveEntry"],
      ["initentry", "liveEntry"],
      ["deadentry", "deadEntry"],
      ["metaentry", "metaEntry"]
    ],
    arms: {
      liveEntry: xdr.lookup("LedgerEntry"),
      deadEntry: xdr.lookup("LedgerKey"),
      metaEntry: xdr.lookup("BucketMetadata")
    }
  });
  xdr.union("HotArchiveBucketEntry", {
    switchOn: xdr.lookup("HotArchiveBucketEntryType"),
    switchName: "type",
    switches: [
      ["hotArchiveArchived", "archivedEntry"],
      ["hotArchiveLive", "key"],
      ["hotArchiveMetaentry", "metaEntry"]
    ],
    arms: {
      archivedEntry: xdr.lookup("LedgerEntry"),
      key: xdr.lookup("LedgerKey"),
      metaEntry: xdr.lookup("BucketMetadata")
    }
  });
  xdr.typedef("UpgradeType", xdr.varOpaque(128));
  xdr.enum("StellarValueType", {
    stellarValueBasic: 0,
    stellarValueSigned: 1
  });
  xdr.struct("LedgerCloseValueSignature", [
    ["nodeId", xdr.lookup("NodeId")],
    ["signature", xdr.lookup("Signature")]
  ]);
  xdr.union("StellarValueExt", {
    switchOn: xdr.lookup("StellarValueType"),
    switchName: "v",
    switches: [
      ["stellarValueBasic", xdr.void()],
      ["stellarValueSigned", "lcValueSignature"]
    ],
    arms: {
      lcValueSignature: xdr.lookup("LedgerCloseValueSignature")
    }
  });
  xdr.struct("StellarValue", [
    ["txSetHash", xdr.lookup("Hash")],
    ["closeTime", xdr.lookup("TimePoint")],
    ["upgrades", xdr.varArray(xdr.lookup("UpgradeType"), 6)],
    ["ext", xdr.lookup("StellarValueExt")]
  ]);
  xdr.const("MASK_LEDGER_HEADER_FLAGS", 7);
  xdr.enum("LedgerHeaderFlags", {
    disableLiquidityPoolTradingFlag: 1,
    disableLiquidityPoolDepositFlag: 2,
    disableLiquidityPoolWithdrawalFlag: 4
  });
  xdr.union("LedgerHeaderExtensionV1Ext", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [[0, xdr.void()]],
    arms: {}
  });
  xdr.struct("LedgerHeaderExtensionV1", [
    ["flags", xdr.lookup("Uint32")],
    ["ext", xdr.lookup("LedgerHeaderExtensionV1Ext")]
  ]);
  xdr.union("LedgerHeaderExt", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [
      [0, xdr.void()],
      [1, "v1"]
    ],
    arms: {
      v1: xdr.lookup("LedgerHeaderExtensionV1")
    }
  });
  xdr.struct("LedgerHeader", [
    ["ledgerVersion", xdr.lookup("Uint32")],
    ["previousLedgerHash", xdr.lookup("Hash")],
    ["scpValue", xdr.lookup("StellarValue")],
    ["txSetResultHash", xdr.lookup("Hash")],
    ["bucketListHash", xdr.lookup("Hash")],
    ["ledgerSeq", xdr.lookup("Uint32")],
    ["totalCoins", xdr.lookup("Int64")],
    ["feePool", xdr.lookup("Int64")],
    ["inflationSeq", xdr.lookup("Uint32")],
    ["idPool", xdr.lookup("Uint64")],
    ["baseFee", xdr.lookup("Uint32")],
    ["baseReserve", xdr.lookup("Uint32")],
    ["maxTxSetSize", xdr.lookup("Uint32")],
    ["skipList", xdr.array(xdr.lookup("Hash"), 4)],
    ["ext", xdr.lookup("LedgerHeaderExt")]
  ]);
  xdr.enum("LedgerUpgradeType", {
    ledgerUpgradeVersion: 1,
    ledgerUpgradeBaseFee: 2,
    ledgerUpgradeMaxTxSetSize: 3,
    ledgerUpgradeBaseReserve: 4,
    ledgerUpgradeFlags: 5,
    ledgerUpgradeConfig: 6,
    ledgerUpgradeMaxSorobanTxSetSize: 7
  });
  xdr.struct("ConfigUpgradeSetKey", [
    ["contractId", xdr.lookup("ContractId")],
    ["contentHash", xdr.lookup("Hash")]
  ]);
  xdr.union("LedgerUpgrade", {
    switchOn: xdr.lookup("LedgerUpgradeType"),
    switchName: "type",
    switches: [
      ["ledgerUpgradeVersion", "newLedgerVersion"],
      ["ledgerUpgradeBaseFee", "newBaseFee"],
      ["ledgerUpgradeMaxTxSetSize", "newMaxTxSetSize"],
      ["ledgerUpgradeBaseReserve", "newBaseReserve"],
      ["ledgerUpgradeFlags", "newFlags"],
      ["ledgerUpgradeConfig", "newConfig"],
      ["ledgerUpgradeMaxSorobanTxSetSize", "newMaxSorobanTxSetSize"]
    ],
    arms: {
      newLedgerVersion: xdr.lookup("Uint32"),
      newBaseFee: xdr.lookup("Uint32"),
      newMaxTxSetSize: xdr.lookup("Uint32"),
      newBaseReserve: xdr.lookup("Uint32"),
      newFlags: xdr.lookup("Uint32"),
      newConfig: xdr.lookup("ConfigUpgradeSetKey"),
      newMaxSorobanTxSetSize: xdr.lookup("Uint32")
    }
  });
  xdr.struct("ConfigUpgradeSet", [
    [
      "updatedEntry",
      xdr.varArray(xdr.lookup("ConfigSettingEntry"), 2147483647)
    ]
  ]);
  xdr.enum("TxSetComponentType", {
    txsetCompTxsMaybeDiscountedFee: 0
  });
  xdr.typedef(
    "DependentTxCluster",
    xdr.varArray(xdr.lookup("TransactionEnvelope"), 2147483647)
  );
  xdr.typedef(
    "ParallelTxExecutionStage",
    xdr.varArray(xdr.lookup("DependentTxCluster"), 2147483647)
  );
  xdr.struct("ParallelTxsComponent", [
    ["baseFee", xdr.option(xdr.lookup("Int64"))],
    [
      "executionStages",
      xdr.varArray(xdr.lookup("ParallelTxExecutionStage"), 2147483647)
    ]
  ]);
  xdr.struct("TxSetComponentTxsMaybeDiscountedFee", [
    ["baseFee", xdr.option(xdr.lookup("Int64"))],
    ["txes", xdr.varArray(xdr.lookup("TransactionEnvelope"), 2147483647)]
  ]);
  xdr.union("TxSetComponent", {
    switchOn: xdr.lookup("TxSetComponentType"),
    switchName: "type",
    switches: [["txsetCompTxsMaybeDiscountedFee", "txsMaybeDiscountedFee"]],
    arms: {
      txsMaybeDiscountedFee: xdr.lookup("TxSetComponentTxsMaybeDiscountedFee")
    }
  });
  xdr.union("TransactionPhase", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [
      [0, "v0Components"],
      [1, "parallelTxsComponent"]
    ],
    arms: {
      v0Components: xdr.varArray(xdr.lookup("TxSetComponent"), 2147483647),
      parallelTxsComponent: xdr.lookup("ParallelTxsComponent")
    }
  });
  xdr.struct("TransactionSet", [
    ["previousLedgerHash", xdr.lookup("Hash")],
    ["txes", xdr.varArray(xdr.lookup("TransactionEnvelope"), 2147483647)]
  ]);
  xdr.struct("TransactionSetV1", [
    ["previousLedgerHash", xdr.lookup("Hash")],
    ["phases", xdr.varArray(xdr.lookup("TransactionPhase"), 2147483647)]
  ]);
  xdr.union("GeneralizedTransactionSet", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [[1, "v1TxSet"]],
    arms: {
      v1TxSet: xdr.lookup("TransactionSetV1")
    }
  });
  xdr.struct("TransactionResultPair", [
    ["transactionHash", xdr.lookup("Hash")],
    ["result", xdr.lookup("TransactionResult")]
  ]);
  xdr.struct("TransactionResultSet", [
    ["results", xdr.varArray(xdr.lookup("TransactionResultPair"), 2147483647)]
  ]);
  xdr.union("TransactionHistoryEntryExt", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [
      [0, xdr.void()],
      [1, "generalizedTxSet"]
    ],
    arms: {
      generalizedTxSet: xdr.lookup("GeneralizedTransactionSet")
    }
  });
  xdr.struct("TransactionHistoryEntry", [
    ["ledgerSeq", xdr.lookup("Uint32")],
    ["txSet", xdr.lookup("TransactionSet")],
    ["ext", xdr.lookup("TransactionHistoryEntryExt")]
  ]);
  xdr.union("TransactionHistoryResultEntryExt", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [[0, xdr.void()]],
    arms: {}
  });
  xdr.struct("TransactionHistoryResultEntry", [
    ["ledgerSeq", xdr.lookup("Uint32")],
    ["txResultSet", xdr.lookup("TransactionResultSet")],
    ["ext", xdr.lookup("TransactionHistoryResultEntryExt")]
  ]);
  xdr.union("LedgerHeaderHistoryEntryExt", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [[0, xdr.void()]],
    arms: {}
  });
  xdr.struct("LedgerHeaderHistoryEntry", [
    ["hash", xdr.lookup("Hash")],
    ["header", xdr.lookup("LedgerHeader")],
    ["ext", xdr.lookup("LedgerHeaderHistoryEntryExt")]
  ]);
  xdr.struct("LedgerScpMessages", [
    ["ledgerSeq", xdr.lookup("Uint32")],
    ["messages", xdr.varArray(xdr.lookup("ScpEnvelope"), 2147483647)]
  ]);
  xdr.struct("ScpHistoryEntryV0", [
    ["quorumSets", xdr.varArray(xdr.lookup("ScpQuorumSet"), 2147483647)],
    ["ledgerMessages", xdr.lookup("LedgerScpMessages")]
  ]);
  xdr.union("ScpHistoryEntry", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [[0, "v0"]],
    arms: {
      v0: xdr.lookup("ScpHistoryEntryV0")
    }
  });
  xdr.enum("LedgerEntryChangeType", {
    ledgerEntryCreated: 0,
    ledgerEntryUpdated: 1,
    ledgerEntryRemoved: 2,
    ledgerEntryState: 3,
    ledgerEntryRestored: 4
  });
  xdr.union("LedgerEntryChange", {
    switchOn: xdr.lookup("LedgerEntryChangeType"),
    switchName: "type",
    switches: [
      ["ledgerEntryCreated", "created"],
      ["ledgerEntryUpdated", "updated"],
      ["ledgerEntryRemoved", "removed"],
      ["ledgerEntryState", "state"],
      ["ledgerEntryRestored", "restored"]
    ],
    arms: {
      created: xdr.lookup("LedgerEntry"),
      updated: xdr.lookup("LedgerEntry"),
      removed: xdr.lookup("LedgerKey"),
      state: xdr.lookup("LedgerEntry"),
      restored: xdr.lookup("LedgerEntry")
    }
  });
  xdr.typedef(
    "LedgerEntryChanges",
    xdr.varArray(xdr.lookup("LedgerEntryChange"), 2147483647)
  );
  xdr.struct("OperationMeta", [["changes", xdr.lookup("LedgerEntryChanges")]]);
  xdr.struct("TransactionMetaV1", [
    ["txChanges", xdr.lookup("LedgerEntryChanges")],
    ["operations", xdr.varArray(xdr.lookup("OperationMeta"), 2147483647)]
  ]);
  xdr.struct("TransactionMetaV2", [
    ["txChangesBefore", xdr.lookup("LedgerEntryChanges")],
    ["operations", xdr.varArray(xdr.lookup("OperationMeta"), 2147483647)],
    ["txChangesAfter", xdr.lookup("LedgerEntryChanges")]
  ]);
  xdr.enum("ContractEventType", {
    system: 0,
    contract: 1,
    diagnostic: 2
  });
  xdr.struct("ContractEventV0", [
    ["topics", xdr.varArray(xdr.lookup("ScVal"), 2147483647)],
    ["data", xdr.lookup("ScVal")]
  ]);
  xdr.union("ContractEventBody", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [[0, "v0"]],
    arms: {
      v0: xdr.lookup("ContractEventV0")
    }
  });
  xdr.struct("ContractEvent", [
    ["ext", xdr.lookup("ExtensionPoint")],
    ["contractId", xdr.option(xdr.lookup("ContractId"))],
    ["type", xdr.lookup("ContractEventType")],
    ["body", xdr.lookup("ContractEventBody")]
  ]);
  xdr.struct("DiagnosticEvent", [
    ["inSuccessfulContractCall", xdr.bool()],
    ["event", xdr.lookup("ContractEvent")]
  ]);
  xdr.struct("SorobanTransactionMetaExtV1", [
    ["ext", xdr.lookup("ExtensionPoint")],
    ["totalNonRefundableResourceFeeCharged", xdr.lookup("Int64")],
    ["totalRefundableResourceFeeCharged", xdr.lookup("Int64")],
    ["rentFeeCharged", xdr.lookup("Int64")]
  ]);
  xdr.union("SorobanTransactionMetaExt", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [
      [0, xdr.void()],
      [1, "v1"]
    ],
    arms: {
      v1: xdr.lookup("SorobanTransactionMetaExtV1")
    }
  });
  xdr.struct("SorobanTransactionMeta", [
    ["ext", xdr.lookup("SorobanTransactionMetaExt")],
    ["events", xdr.varArray(xdr.lookup("ContractEvent"), 2147483647)],
    ["returnValue", xdr.lookup("ScVal")],
    [
      "diagnosticEvents",
      xdr.varArray(xdr.lookup("DiagnosticEvent"), 2147483647)
    ]
  ]);
  xdr.struct("TransactionMetaV3", [
    ["ext", xdr.lookup("ExtensionPoint")],
    ["txChangesBefore", xdr.lookup("LedgerEntryChanges")],
    ["operations", xdr.varArray(xdr.lookup("OperationMeta"), 2147483647)],
    ["txChangesAfter", xdr.lookup("LedgerEntryChanges")],
    ["sorobanMeta", xdr.option(xdr.lookup("SorobanTransactionMeta"))]
  ]);
  xdr.struct("OperationMetaV2", [
    ["ext", xdr.lookup("ExtensionPoint")],
    ["changes", xdr.lookup("LedgerEntryChanges")],
    ["events", xdr.varArray(xdr.lookup("ContractEvent"), 2147483647)]
  ]);
  xdr.struct("SorobanTransactionMetaV2", [
    ["ext", xdr.lookup("SorobanTransactionMetaExt")],
    ["returnValue", xdr.option(xdr.lookup("ScVal"))]
  ]);
  xdr.enum("TransactionEventStage", {
    transactionEventStageBeforeAllTxes: 0,
    transactionEventStageAfterTx: 1,
    transactionEventStageAfterAllTxes: 2
  });
  xdr.struct("TransactionEvent", [
    ["stage", xdr.lookup("TransactionEventStage")],
    ["event", xdr.lookup("ContractEvent")]
  ]);
  xdr.struct("TransactionMetaV4", [
    ["ext", xdr.lookup("ExtensionPoint")],
    ["txChangesBefore", xdr.lookup("LedgerEntryChanges")],
    ["operations", xdr.varArray(xdr.lookup("OperationMetaV2"), 2147483647)],
    ["txChangesAfter", xdr.lookup("LedgerEntryChanges")],
    ["sorobanMeta", xdr.option(xdr.lookup("SorobanTransactionMetaV2"))],
    ["events", xdr.varArray(xdr.lookup("TransactionEvent"), 2147483647)],
    [
      "diagnosticEvents",
      xdr.varArray(xdr.lookup("DiagnosticEvent"), 2147483647)
    ]
  ]);
  xdr.struct("InvokeHostFunctionSuccessPreImage", [
    ["returnValue", xdr.lookup("ScVal")],
    ["events", xdr.varArray(xdr.lookup("ContractEvent"), 2147483647)]
  ]);
  xdr.union("TransactionMeta", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [
      [0, "operations"],
      [1, "v1"],
      [2, "v2"],
      [3, "v3"],
      [4, "v4"]
    ],
    arms: {
      operations: xdr.varArray(xdr.lookup("OperationMeta"), 2147483647),
      v1: xdr.lookup("TransactionMetaV1"),
      v2: xdr.lookup("TransactionMetaV2"),
      v3: xdr.lookup("TransactionMetaV3"),
      v4: xdr.lookup("TransactionMetaV4")
    }
  });
  xdr.struct("TransactionResultMeta", [
    ["result", xdr.lookup("TransactionResultPair")],
    ["feeProcessing", xdr.lookup("LedgerEntryChanges")],
    ["txApplyProcessing", xdr.lookup("TransactionMeta")]
  ]);
  xdr.struct("TransactionResultMetaV1", [
    ["ext", xdr.lookup("ExtensionPoint")],
    ["result", xdr.lookup("TransactionResultPair")],
    ["feeProcessing", xdr.lookup("LedgerEntryChanges")],
    ["txApplyProcessing", xdr.lookup("TransactionMeta")],
    ["postTxApplyFeeProcessing", xdr.lookup("LedgerEntryChanges")]
  ]);
  xdr.struct("UpgradeEntryMeta", [
    ["upgrade", xdr.lookup("LedgerUpgrade")],
    ["changes", xdr.lookup("LedgerEntryChanges")]
  ]);
  xdr.struct("LedgerCloseMetaV0", [
    ["ledgerHeader", xdr.lookup("LedgerHeaderHistoryEntry")],
    ["txSet", xdr.lookup("TransactionSet")],
    [
      "txProcessing",
      xdr.varArray(xdr.lookup("TransactionResultMeta"), 2147483647)
    ],
    [
      "upgradesProcessing",
      xdr.varArray(xdr.lookup("UpgradeEntryMeta"), 2147483647)
    ],
    ["scpInfo", xdr.varArray(xdr.lookup("ScpHistoryEntry"), 2147483647)]
  ]);
  xdr.struct("LedgerCloseMetaExtV1", [
    ["ext", xdr.lookup("ExtensionPoint")],
    ["sorobanFeeWrite1Kb", xdr.lookup("Int64")]
  ]);
  xdr.union("LedgerCloseMetaExt", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [
      [0, xdr.void()],
      [1, "v1"]
    ],
    arms: {
      v1: xdr.lookup("LedgerCloseMetaExtV1")
    }
  });
  xdr.struct("LedgerCloseMetaV1", [
    ["ext", xdr.lookup("LedgerCloseMetaExt")],
    ["ledgerHeader", xdr.lookup("LedgerHeaderHistoryEntry")],
    ["txSet", xdr.lookup("GeneralizedTransactionSet")],
    [
      "txProcessing",
      xdr.varArray(xdr.lookup("TransactionResultMeta"), 2147483647)
    ],
    [
      "upgradesProcessing",
      xdr.varArray(xdr.lookup("UpgradeEntryMeta"), 2147483647)
    ],
    ["scpInfo", xdr.varArray(xdr.lookup("ScpHistoryEntry"), 2147483647)],
    ["totalByteSizeOfLiveSorobanState", xdr.lookup("Uint64")],
    ["evictedKeys", xdr.varArray(xdr.lookup("LedgerKey"), 2147483647)],
    ["unused", xdr.varArray(xdr.lookup("LedgerEntry"), 2147483647)]
  ]);
  xdr.struct("LedgerCloseMetaV2", [
    ["ext", xdr.lookup("LedgerCloseMetaExt")],
    ["ledgerHeader", xdr.lookup("LedgerHeaderHistoryEntry")],
    ["txSet", xdr.lookup("GeneralizedTransactionSet")],
    [
      "txProcessing",
      xdr.varArray(xdr.lookup("TransactionResultMetaV1"), 2147483647)
    ],
    [
      "upgradesProcessing",
      xdr.varArray(xdr.lookup("UpgradeEntryMeta"), 2147483647)
    ],
    ["scpInfo", xdr.varArray(xdr.lookup("ScpHistoryEntry"), 2147483647)],
    ["totalByteSizeOfLiveSorobanState", xdr.lookup("Uint64")],
    ["evictedKeys", xdr.varArray(xdr.lookup("LedgerKey"), 2147483647)]
  ]);
  xdr.union("LedgerCloseMeta", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [
      [0, "v0"],
      [1, "v1"],
      [2, "v2"]
    ],
    arms: {
      v0: xdr.lookup("LedgerCloseMetaV0"),
      v1: xdr.lookup("LedgerCloseMetaV1"),
      v2: xdr.lookup("LedgerCloseMetaV2")
    }
  });
  xdr.enum("ErrorCode", {
    errMisc: 0,
    errData: 1,
    errConf: 2,
    errAuth: 3,
    errLoad: 4
  });
  xdr.struct("Error", [
    ["code", xdr.lookup("ErrorCode")],
    ["msg", xdr.string(100)]
  ]);
  xdr.struct("SendMore", [["numMessages", xdr.lookup("Uint32")]]);
  xdr.struct("SendMoreExtended", [
    ["numMessages", xdr.lookup("Uint32")],
    ["numBytes", xdr.lookup("Uint32")]
  ]);
  xdr.struct("AuthCert", [
    ["pubkey", xdr.lookup("Curve25519Public")],
    ["expiration", xdr.lookup("Uint64")],
    ["sig", xdr.lookup("Signature")]
  ]);
  xdr.struct("Hello", [
    ["ledgerVersion", xdr.lookup("Uint32")],
    ["overlayVersion", xdr.lookup("Uint32")],
    ["overlayMinVersion", xdr.lookup("Uint32")],
    ["networkId", xdr.lookup("Hash")],
    ["versionStr", xdr.string(100)],
    ["listeningPort", xdr.int()],
    ["peerId", xdr.lookup("NodeId")],
    ["cert", xdr.lookup("AuthCert")],
    ["nonce", xdr.lookup("Uint256")]
  ]);
  xdr.const("AUTH_MSG_FLAG_FLOW_CONTROL_BYTES_REQUESTED", 200);
  xdr.struct("Auth", [["flags", xdr.int()]]);
  xdr.enum("IpAddrType", {
    iPv4: 0,
    iPv6: 1
  });
  xdr.union("PeerAddressIp", {
    switchOn: xdr.lookup("IpAddrType"),
    switchName: "type",
    switches: [
      ["iPv4", "ipv4"],
      ["iPv6", "ipv6"]
    ],
    arms: {
      ipv4: xdr.opaque(4),
      ipv6: xdr.opaque(16)
    }
  });
  xdr.struct("PeerAddress", [
    ["ip", xdr.lookup("PeerAddressIp")],
    ["port", xdr.lookup("Uint32")],
    ["numFailures", xdr.lookup("Uint32")]
  ]);
  xdr.enum("MessageType", {
    errorMsg: 0,
    auth: 2,
    dontHave: 3,
    peers: 5,
    getTxSet: 6,
    txSet: 7,
    generalizedTxSet: 17,
    transaction: 8,
    getScpQuorumset: 9,
    scpQuorumset: 10,
    scpMessage: 11,
    getScpState: 12,
    hello: 13,
    sendMore: 16,
    sendMoreExtended: 20,
    floodAdvert: 18,
    floodDemand: 19,
    timeSlicedSurveyRequest: 21,
    timeSlicedSurveyResponse: 22,
    timeSlicedSurveyStartCollecting: 23,
    timeSlicedSurveyStopCollecting: 24
  });
  xdr.struct("DontHave", [
    ["type", xdr.lookup("MessageType")],
    ["reqHash", xdr.lookup("Uint256")]
  ]);
  xdr.enum("SurveyMessageCommandType", {
    timeSlicedSurveyTopology: 1
  });
  xdr.enum("SurveyMessageResponseType", {
    surveyTopologyResponseV2: 2
  });
  xdr.struct("TimeSlicedSurveyStartCollectingMessage", [
    ["surveyorId", xdr.lookup("NodeId")],
    ["nonce", xdr.lookup("Uint32")],
    ["ledgerNum", xdr.lookup("Uint32")]
  ]);
  xdr.struct("SignedTimeSlicedSurveyStartCollectingMessage", [
    ["signature", xdr.lookup("Signature")],
    ["startCollecting", xdr.lookup("TimeSlicedSurveyStartCollectingMessage")]
  ]);
  xdr.struct("TimeSlicedSurveyStopCollectingMessage", [
    ["surveyorId", xdr.lookup("NodeId")],
    ["nonce", xdr.lookup("Uint32")],
    ["ledgerNum", xdr.lookup("Uint32")]
  ]);
  xdr.struct("SignedTimeSlicedSurveyStopCollectingMessage", [
    ["signature", xdr.lookup("Signature")],
    ["stopCollecting", xdr.lookup("TimeSlicedSurveyStopCollectingMessage")]
  ]);
  xdr.struct("SurveyRequestMessage", [
    ["surveyorPeerId", xdr.lookup("NodeId")],
    ["surveyedPeerId", xdr.lookup("NodeId")],
    ["ledgerNum", xdr.lookup("Uint32")],
    ["encryptionKey", xdr.lookup("Curve25519Public")],
    ["commandType", xdr.lookup("SurveyMessageCommandType")]
  ]);
  xdr.struct("TimeSlicedSurveyRequestMessage", [
    ["request", xdr.lookup("SurveyRequestMessage")],
    ["nonce", xdr.lookup("Uint32")],
    ["inboundPeersIndex", xdr.lookup("Uint32")],
    ["outboundPeersIndex", xdr.lookup("Uint32")]
  ]);
  xdr.struct("SignedTimeSlicedSurveyRequestMessage", [
    ["requestSignature", xdr.lookup("Signature")],
    ["request", xdr.lookup("TimeSlicedSurveyRequestMessage")]
  ]);
  xdr.typedef("EncryptedBody", xdr.varOpaque(64e3));
  xdr.struct("SurveyResponseMessage", [
    ["surveyorPeerId", xdr.lookup("NodeId")],
    ["surveyedPeerId", xdr.lookup("NodeId")],
    ["ledgerNum", xdr.lookup("Uint32")],
    ["commandType", xdr.lookup("SurveyMessageCommandType")],
    ["encryptedBody", xdr.lookup("EncryptedBody")]
  ]);
  xdr.struct("TimeSlicedSurveyResponseMessage", [
    ["response", xdr.lookup("SurveyResponseMessage")],
    ["nonce", xdr.lookup("Uint32")]
  ]);
  xdr.struct("SignedTimeSlicedSurveyResponseMessage", [
    ["responseSignature", xdr.lookup("Signature")],
    ["response", xdr.lookup("TimeSlicedSurveyResponseMessage")]
  ]);
  xdr.struct("PeerStats", [
    ["id", xdr.lookup("NodeId")],
    ["versionStr", xdr.string(100)],
    ["messagesRead", xdr.lookup("Uint64")],
    ["messagesWritten", xdr.lookup("Uint64")],
    ["bytesRead", xdr.lookup("Uint64")],
    ["bytesWritten", xdr.lookup("Uint64")],
    ["secondsConnected", xdr.lookup("Uint64")],
    ["uniqueFloodBytesRecv", xdr.lookup("Uint64")],
    ["duplicateFloodBytesRecv", xdr.lookup("Uint64")],
    ["uniqueFetchBytesRecv", xdr.lookup("Uint64")],
    ["duplicateFetchBytesRecv", xdr.lookup("Uint64")],
    ["uniqueFloodMessageRecv", xdr.lookup("Uint64")],
    ["duplicateFloodMessageRecv", xdr.lookup("Uint64")],
    ["uniqueFetchMessageRecv", xdr.lookup("Uint64")],
    ["duplicateFetchMessageRecv", xdr.lookup("Uint64")]
  ]);
  xdr.struct("TimeSlicedNodeData", [
    ["addedAuthenticatedPeers", xdr.lookup("Uint32")],
    ["droppedAuthenticatedPeers", xdr.lookup("Uint32")],
    ["totalInboundPeerCount", xdr.lookup("Uint32")],
    ["totalOutboundPeerCount", xdr.lookup("Uint32")],
    ["p75ScpFirstToSelfLatencyMs", xdr.lookup("Uint32")],
    ["p75ScpSelfToOtherLatencyMs", xdr.lookup("Uint32")],
    ["lostSyncCount", xdr.lookup("Uint32")],
    ["isValidator", xdr.bool()],
    ["maxInboundPeerCount", xdr.lookup("Uint32")],
    ["maxOutboundPeerCount", xdr.lookup("Uint32")]
  ]);
  xdr.struct("TimeSlicedPeerData", [
    ["peerStats", xdr.lookup("PeerStats")],
    ["averageLatencyMs", xdr.lookup("Uint32")]
  ]);
  xdr.typedef(
    "TimeSlicedPeerDataList",
    xdr.varArray(xdr.lookup("TimeSlicedPeerData"), 25)
  );
  xdr.struct("TopologyResponseBodyV2", [
    ["inboundPeers", xdr.lookup("TimeSlicedPeerDataList")],
    ["outboundPeers", xdr.lookup("TimeSlicedPeerDataList")],
    ["nodeData", xdr.lookup("TimeSlicedNodeData")]
  ]);
  xdr.union("SurveyResponseBody", {
    switchOn: xdr.lookup("SurveyMessageResponseType"),
    switchName: "type",
    switches: [["surveyTopologyResponseV2", "topologyResponseBodyV2"]],
    arms: {
      topologyResponseBodyV2: xdr.lookup("TopologyResponseBodyV2")
    }
  });
  xdr.const("TX_ADVERT_VECTOR_MAX_SIZE", 1e3);
  xdr.typedef(
    "TxAdvertVector",
    xdr.varArray(xdr.lookup("Hash"), xdr.lookup("TX_ADVERT_VECTOR_MAX_SIZE"))
  );
  xdr.struct("FloodAdvert", [["txHashes", xdr.lookup("TxAdvertVector")]]);
  xdr.const("TX_DEMAND_VECTOR_MAX_SIZE", 1e3);
  xdr.typedef(
    "TxDemandVector",
    xdr.varArray(xdr.lookup("Hash"), xdr.lookup("TX_DEMAND_VECTOR_MAX_SIZE"))
  );
  xdr.struct("FloodDemand", [["txHashes", xdr.lookup("TxDemandVector")]]);
  xdr.union("StellarMessage", {
    switchOn: xdr.lookup("MessageType"),
    switchName: "type",
    switches: [
      ["errorMsg", "error"],
      ["hello", "hello"],
      ["auth", "auth"],
      ["dontHave", "dontHave"],
      ["peers", "peers"],
      ["getTxSet", "txSetHash"],
      ["txSet", "txSet"],
      ["generalizedTxSet", "generalizedTxSet"],
      ["transaction", "transaction"],
      ["timeSlicedSurveyRequest", "signedTimeSlicedSurveyRequestMessage"],
      ["timeSlicedSurveyResponse", "signedTimeSlicedSurveyResponseMessage"],
      [
        "timeSlicedSurveyStartCollecting",
        "signedTimeSlicedSurveyStartCollectingMessage"
      ],
      [
        "timeSlicedSurveyStopCollecting",
        "signedTimeSlicedSurveyStopCollectingMessage"
      ],
      ["getScpQuorumset", "qSetHash"],
      ["scpQuorumset", "qSet"],
      ["scpMessage", "envelope"],
      ["getScpState", "getScpLedgerSeq"],
      ["sendMore", "sendMoreMessage"],
      ["sendMoreExtended", "sendMoreExtendedMessage"],
      ["floodAdvert", "floodAdvert"],
      ["floodDemand", "floodDemand"]
    ],
    arms: {
      error: xdr.lookup("Error"),
      hello: xdr.lookup("Hello"),
      auth: xdr.lookup("Auth"),
      dontHave: xdr.lookup("DontHave"),
      peers: xdr.varArray(xdr.lookup("PeerAddress"), 100),
      txSetHash: xdr.lookup("Uint256"),
      txSet: xdr.lookup("TransactionSet"),
      generalizedTxSet: xdr.lookup("GeneralizedTransactionSet"),
      transaction: xdr.lookup("TransactionEnvelope"),
      signedTimeSlicedSurveyRequestMessage: xdr.lookup(
        "SignedTimeSlicedSurveyRequestMessage"
      ),
      signedTimeSlicedSurveyResponseMessage: xdr.lookup(
        "SignedTimeSlicedSurveyResponseMessage"
      ),
      signedTimeSlicedSurveyStartCollectingMessage: xdr.lookup(
        "SignedTimeSlicedSurveyStartCollectingMessage"
      ),
      signedTimeSlicedSurveyStopCollectingMessage: xdr.lookup(
        "SignedTimeSlicedSurveyStopCollectingMessage"
      ),
      qSetHash: xdr.lookup("Uint256"),
      qSet: xdr.lookup("ScpQuorumSet"),
      envelope: xdr.lookup("ScpEnvelope"),
      getScpLedgerSeq: xdr.lookup("Uint32"),
      sendMoreMessage: xdr.lookup("SendMore"),
      sendMoreExtendedMessage: xdr.lookup("SendMoreExtended"),
      floodAdvert: xdr.lookup("FloodAdvert"),
      floodDemand: xdr.lookup("FloodDemand")
    }
  });
  xdr.struct("AuthenticatedMessageV0", [
    ["sequence", xdr.lookup("Uint64")],
    ["message", xdr.lookup("StellarMessage")],
    ["mac", xdr.lookup("HmacSha256Mac")]
  ]);
  xdr.union("AuthenticatedMessage", {
    switchOn: xdr.lookup("Uint32"),
    switchName: "v",
    switches: [[0, "v0"]],
    arms: {
      v0: xdr.lookup("AuthenticatedMessageV0")
    }
  });
  xdr.const("MAX_OPS_PER_TX", 100);
  xdr.union("LiquidityPoolParameters", {
    switchOn: xdr.lookup("LiquidityPoolType"),
    switchName: "type",
    switches: [["liquidityPoolConstantProduct", "constantProduct"]],
    arms: {
      constantProduct: xdr.lookup("LiquidityPoolConstantProductParameters")
    }
  });
  xdr.struct("MuxedAccountMed25519", [
    ["id", xdr.lookup("Uint64")],
    ["ed25519", xdr.lookup("Uint256")]
  ]);
  xdr.union("MuxedAccount", {
    switchOn: xdr.lookup("CryptoKeyType"),
    switchName: "type",
    switches: [
      ["keyTypeEd25519", "ed25519"],
      ["keyTypeMuxedEd25519", "med25519"]
    ],
    arms: {
      ed25519: xdr.lookup("Uint256"),
      med25519: xdr.lookup("MuxedAccountMed25519")
    }
  });
  xdr.struct("DecoratedSignature", [
    ["hint", xdr.lookup("SignatureHint")],
    ["signature", xdr.lookup("Signature")]
  ]);
  xdr.enum("OperationType", {
    createAccount: 0,
    payment: 1,
    pathPaymentStrictReceive: 2,
    manageSellOffer: 3,
    createPassiveSellOffer: 4,
    setOptions: 5,
    changeTrust: 6,
    allowTrust: 7,
    accountMerge: 8,
    inflation: 9,
    manageData: 10,
    bumpSequence: 11,
    manageBuyOffer: 12,
    pathPaymentStrictSend: 13,
    createClaimableBalance: 14,
    claimClaimableBalance: 15,
    beginSponsoringFutureReserves: 16,
    endSponsoringFutureReserves: 17,
    revokeSponsorship: 18,
    clawback: 19,
    clawbackClaimableBalance: 20,
    setTrustLineFlags: 21,
    liquidityPoolDeposit: 22,
    liquidityPoolWithdraw: 23,
    invokeHostFunction: 24,
    extendFootprintTtl: 25,
    restoreFootprint: 26
  });
  xdr.struct("CreateAccountOp", [
    ["destination", xdr.lookup("AccountId")],
    ["startingBalance", xdr.lookup("Int64")]
  ]);
  xdr.struct("PaymentOp", [
    ["destination", xdr.lookup("MuxedAccount")],
    ["asset", xdr.lookup("Asset")],
    ["amount", xdr.lookup("Int64")]
  ]);
  xdr.struct("PathPaymentStrictReceiveOp", [
    ["sendAsset", xdr.lookup("Asset")],
    ["sendMax", xdr.lookup("Int64")],
    ["destination", xdr.lookup("MuxedAccount")],
    ["destAsset", xdr.lookup("Asset")],
    ["destAmount", xdr.lookup("Int64")],
    ["path", xdr.varArray(xdr.lookup("Asset"), 5)]
  ]);
  xdr.struct("PathPaymentStrictSendOp", [
    ["sendAsset", xdr.lookup("Asset")],
    ["sendAmount", xdr.lookup("Int64")],
    ["destination", xdr.lookup("MuxedAccount")],
    ["destAsset", xdr.lookup("Asset")],
    ["destMin", xdr.lookup("Int64")],
    ["path", xdr.varArray(xdr.lookup("Asset"), 5)]
  ]);
  xdr.struct("ManageSellOfferOp", [
    ["selling", xdr.lookup("Asset")],
    ["buying", xdr.lookup("Asset")],
    ["amount", xdr.lookup("Int64")],
    ["price", xdr.lookup("Price")],
    ["offerId", xdr.lookup("Int64")]
  ]);
  xdr.struct("ManageBuyOfferOp", [
    ["selling", xdr.lookup("Asset")],
    ["buying", xdr.lookup("Asset")],
    ["buyAmount", xdr.lookup("Int64")],
    ["price", xdr.lookup("Price")],
    ["offerId", xdr.lookup("Int64")]
  ]);
  xdr.struct("CreatePassiveSellOfferOp", [
    ["selling", xdr.lookup("Asset")],
    ["buying", xdr.lookup("Asset")],
    ["amount", xdr.lookup("Int64")],
    ["price", xdr.lookup("Price")]
  ]);
  xdr.struct("SetOptionsOp", [
    ["inflationDest", xdr.option(xdr.lookup("AccountId"))],
    ["clearFlags", xdr.option(xdr.lookup("Uint32"))],
    ["setFlags", xdr.option(xdr.lookup("Uint32"))],
    ["masterWeight", xdr.option(xdr.lookup("Uint32"))],
    ["lowThreshold", xdr.option(xdr.lookup("Uint32"))],
    ["medThreshold", xdr.option(xdr.lookup("Uint32"))],
    ["highThreshold", xdr.option(xdr.lookup("Uint32"))],
    ["homeDomain", xdr.option(xdr.lookup("String32"))],
    ["signer", xdr.option(xdr.lookup("Signer"))]
  ]);
  xdr.union("ChangeTrustAsset", {
    switchOn: xdr.lookup("AssetType"),
    switchName: "type",
    switches: [
      ["assetTypeNative", xdr.void()],
      ["assetTypeCreditAlphanum4", "alphaNum4"],
      ["assetTypeCreditAlphanum12", "alphaNum12"],
      ["assetTypePoolShare", "liquidityPool"]
    ],
    arms: {
      alphaNum4: xdr.lookup("AlphaNum4"),
      alphaNum12: xdr.lookup("AlphaNum12"),
      liquidityPool: xdr.lookup("LiquidityPoolParameters")
    }
  });
  xdr.struct("ChangeTrustOp", [
    ["line", xdr.lookup("ChangeTrustAsset")],
    ["limit", xdr.lookup("Int64")]
  ]);
  xdr.struct("AllowTrustOp", [
    ["trustor", xdr.lookup("AccountId")],
    ["asset", xdr.lookup("AssetCode")],
    ["authorize", xdr.lookup("Uint32")]
  ]);
  xdr.struct("ManageDataOp", [
    ["dataName", xdr.lookup("String64")],
    ["dataValue", xdr.option(xdr.lookup("DataValue"))]
  ]);
  xdr.struct("BumpSequenceOp", [["bumpTo", xdr.lookup("SequenceNumber")]]);
  xdr.struct("CreateClaimableBalanceOp", [
    ["asset", xdr.lookup("Asset")],
    ["amount", xdr.lookup("Int64")],
    ["claimants", xdr.varArray(xdr.lookup("Claimant"), 10)]
  ]);
  xdr.struct("ClaimClaimableBalanceOp", [
    ["balanceId", xdr.lookup("ClaimableBalanceId")]
  ]);
  xdr.struct("BeginSponsoringFutureReservesOp", [
    ["sponsoredId", xdr.lookup("AccountId")]
  ]);
  xdr.enum("RevokeSponsorshipType", {
    revokeSponsorshipLedgerEntry: 0,
    revokeSponsorshipSigner: 1
  });
  xdr.struct("RevokeSponsorshipOpSigner", [
    ["accountId", xdr.lookup("AccountId")],
    ["signerKey", xdr.lookup("SignerKey")]
  ]);
  xdr.union("RevokeSponsorshipOp", {
    switchOn: xdr.lookup("RevokeSponsorshipType"),
    switchName: "type",
    switches: [
      ["revokeSponsorshipLedgerEntry", "ledgerKey"],
      ["revokeSponsorshipSigner", "signer"]
    ],
    arms: {
      ledgerKey: xdr.lookup("LedgerKey"),
      signer: xdr.lookup("RevokeSponsorshipOpSigner")
    }
  });
  xdr.struct("ClawbackOp", [
    ["asset", xdr.lookup("Asset")],
    ["from", xdr.lookup("MuxedAccount")],
    ["amount", xdr.lookup("Int64")]
  ]);
  xdr.struct("ClawbackClaimableBalanceOp", [
    ["balanceId", xdr.lookup("ClaimableBalanceId")]
  ]);
  xdr.struct("SetTrustLineFlagsOp", [
    ["trustor", xdr.lookup("AccountId")],
    ["asset", xdr.lookup("Asset")],
    ["clearFlags", xdr.lookup("Uint32")],
    ["setFlags", xdr.lookup("Uint32")]
  ]);
  xdr.const("LIQUIDITY_POOL_FEE_V18", 30);
  xdr.struct("LiquidityPoolDepositOp", [
    ["liquidityPoolId", xdr.lookup("PoolId")],
    ["maxAmountA", xdr.lookup("Int64")],
    ["maxAmountB", xdr.lookup("Int64")],
    ["minPrice", xdr.lookup("Price")],
    ["maxPrice", xdr.lookup("Price")]
  ]);
  xdr.struct("LiquidityPoolWithdrawOp", [
    ["liquidityPoolId", xdr.lookup("PoolId")],
    ["amount", xdr.lookup("Int64")],
    ["minAmountA", xdr.lookup("Int64")],
    ["minAmountB", xdr.lookup("Int64")]
  ]);
  xdr.enum("HostFunctionType", {
    hostFunctionTypeInvokeContract: 0,
    hostFunctionTypeCreateContract: 1,
    hostFunctionTypeUploadContractWasm: 2,
    hostFunctionTypeCreateContractV2: 3
  });
  xdr.enum("ContractIdPreimageType", {
    contractIdPreimageFromAddress: 0,
    contractIdPreimageFromAsset: 1
  });
  xdr.struct("ContractIdPreimageFromAddress", [
    ["address", xdr.lookup("ScAddress")],
    ["salt", xdr.lookup("Uint256")]
  ]);
  xdr.union("ContractIdPreimage", {
    switchOn: xdr.lookup("ContractIdPreimageType"),
    switchName: "type",
    switches: [
      ["contractIdPreimageFromAddress", "fromAddress"],
      ["contractIdPreimageFromAsset", "fromAsset"]
    ],
    arms: {
      fromAddress: xdr.lookup("ContractIdPreimageFromAddress"),
      fromAsset: xdr.lookup("Asset")
    }
  });
  xdr.struct("CreateContractArgs", [
    ["contractIdPreimage", xdr.lookup("ContractIdPreimage")],
    ["executable", xdr.lookup("ContractExecutable")]
  ]);
  xdr.struct("CreateContractArgsV2", [
    ["contractIdPreimage", xdr.lookup("ContractIdPreimage")],
    ["executable", xdr.lookup("ContractExecutable")],
    ["constructorArgs", xdr.varArray(xdr.lookup("ScVal"), 2147483647)]
  ]);
  xdr.struct("InvokeContractArgs", [
    ["contractAddress", xdr.lookup("ScAddress")],
    ["functionName", xdr.lookup("ScSymbol")],
    ["args", xdr.varArray(xdr.lookup("ScVal"), 2147483647)]
  ]);
  xdr.union("HostFunction", {
    switchOn: xdr.lookup("HostFunctionType"),
    switchName: "type",
    switches: [
      ["hostFunctionTypeInvokeContract", "invokeContract"],
      ["hostFunctionTypeCreateContract", "createContract"],
      ["hostFunctionTypeUploadContractWasm", "wasm"],
      ["hostFunctionTypeCreateContractV2", "createContractV2"]
    ],
    arms: {
      invokeContract: xdr.lookup("InvokeContractArgs"),
      createContract: xdr.lookup("CreateContractArgs"),
      wasm: xdr.varOpaque(),
      createContractV2: xdr.lookup("CreateContractArgsV2")
    }
  });
  xdr.enum("SorobanAuthorizedFunctionType", {
    sorobanAuthorizedFunctionTypeContractFn: 0,
    sorobanAuthorizedFunctionTypeCreateContractHostFn: 1,
    sorobanAuthorizedFunctionTypeCreateContractV2HostFn: 2
  });
  xdr.union("SorobanAuthorizedFunction", {
    switchOn: xdr.lookup("SorobanAuthorizedFunctionType"),
    switchName: "type",
    switches: [
      ["sorobanAuthorizedFunctionTypeContractFn", "contractFn"],
      [
        "sorobanAuthorizedFunctionTypeCreateContractHostFn",
        "createContractHostFn"
      ],
      [
        "sorobanAuthorizedFunctionTypeCreateContractV2HostFn",
        "createContractV2HostFn"
      ]
    ],
    arms: {
      contractFn: xdr.lookup("InvokeContractArgs"),
      createContractHostFn: xdr.lookup("CreateContractArgs"),
      createContractV2HostFn: xdr.lookup("CreateContractArgsV2")
    }
  });
  xdr.struct("SorobanAuthorizedInvocation", [
    ["function", xdr.lookup("SorobanAuthorizedFunction")],
    [
      "subInvocations",
      xdr.varArray(xdr.lookup("SorobanAuthorizedInvocation"), 2147483647)
    ]
  ]);
  xdr.struct("SorobanAddressCredentials", [
    ["address", xdr.lookup("ScAddress")],
    ["nonce", xdr.lookup("Int64")],
    ["signatureExpirationLedger", xdr.lookup("Uint32")],
    ["signature", xdr.lookup("ScVal")]
  ]);
  xdr.struct("SorobanDelegateSignature", [
    ["address", xdr.lookup("ScAddress")],
    ["signature", xdr.lookup("ScVal")],
    [
      "nestedDelegates",
      xdr.varArray(xdr.lookup("SorobanDelegateSignature"), 2147483647)
    ]
  ]);
  xdr.struct("SorobanAddressCredentialsWithDelegates", [
    ["addressCredentials", xdr.lookup("SorobanAddressCredentials")],
    [
      "delegates",
      xdr.varArray(xdr.lookup("SorobanDelegateSignature"), 2147483647)
    ]
  ]);
  xdr.enum("SorobanCredentialsType", {
    sorobanCredentialsSourceAccount: 0,
    sorobanCredentialsAddress: 1,
    sorobanCredentialsAddressV2: 2,
    sorobanCredentialsAddressWithDelegates: 3
  });
  xdr.union("SorobanCredentials", {
    switchOn: xdr.lookup("SorobanCredentialsType"),
    switchName: "type",
    switches: [
      ["sorobanCredentialsSourceAccount", xdr.void()],
      ["sorobanCredentialsAddress", "address"],
      ["sorobanCredentialsAddressV2", "addressV2"],
      ["sorobanCredentialsAddressWithDelegates", "addressWithDelegates"]
    ],
    arms: {
      address: xdr.lookup("SorobanAddressCredentials"),
      addressV2: xdr.lookup("SorobanAddressCredentials"),
      addressWithDelegates: xdr.lookup(
        "SorobanAddressCredentialsWithDelegates"
      )
    }
  });
  xdr.struct("SorobanAuthorizationEntry", [
    ["credentials", xdr.lookup("SorobanCredentials")],
    ["rootInvocation", xdr.lookup("SorobanAuthorizedInvocation")]
  ]);
  xdr.typedef(
    "SorobanAuthorizationEntries",
    xdr.varArray(xdr.lookup("SorobanAuthorizationEntry"), 2147483647)
  );
  xdr.struct("InvokeHostFunctionOp", [
    ["hostFunction", xdr.lookup("HostFunction")],
    ["auth", xdr.varArray(xdr.lookup("SorobanAuthorizationEntry"), 2147483647)]
  ]);
  xdr.struct("ExtendFootprintTtlOp", [
    ["ext", xdr.lookup("ExtensionPoint")],
    ["extendTo", xdr.lookup("Uint32")]
  ]);
  xdr.struct("RestoreFootprintOp", [["ext", xdr.lookup("ExtensionPoint")]]);
  xdr.union("OperationBody", {
    switchOn: xdr.lookup("OperationType"),
    switchName: "type",
    switches: [
      ["createAccount", "createAccountOp"],
      ["payment", "paymentOp"],
      ["pathPaymentStrictReceive", "pathPaymentStrictReceiveOp"],
      ["manageSellOffer", "manageSellOfferOp"],
      ["createPassiveSellOffer", "createPassiveSellOfferOp"],
      ["setOptions", "setOptionsOp"],
      ["changeTrust", "changeTrustOp"],
      ["allowTrust", "allowTrustOp"],
      ["accountMerge", "destination"],
      ["inflation", xdr.void()],
      ["manageData", "manageDataOp"],
      ["bumpSequence", "bumpSequenceOp"],
      ["manageBuyOffer", "manageBuyOfferOp"],
      ["pathPaymentStrictSend", "pathPaymentStrictSendOp"],
      ["createClaimableBalance", "createClaimableBalanceOp"],
      ["claimClaimableBalance", "claimClaimableBalanceOp"],
      ["beginSponsoringFutureReserves", "beginSponsoringFutureReservesOp"],
      ["endSponsoringFutureReserves", xdr.void()],
      ["revokeSponsorship", "revokeSponsorshipOp"],
      ["clawback", "clawbackOp"],
      ["clawbackClaimableBalance", "clawbackClaimableBalanceOp"],
      ["setTrustLineFlags", "setTrustLineFlagsOp"],
      ["liquidityPoolDeposit", "liquidityPoolDepositOp"],
      ["liquidityPoolWithdraw", "liquidityPoolWithdrawOp"],
      ["invokeHostFunction", "invokeHostFunctionOp"],
      ["extendFootprintTtl", "extendFootprintTtlOp"],
      ["restoreFootprint", "restoreFootprintOp"]
    ],
    arms: {
      createAccountOp: xdr.lookup("CreateAccountOp"),
      paymentOp: xdr.lookup("PaymentOp"),
      pathPaymentStrictReceiveOp: xdr.lookup("PathPaymentStrictReceiveOp"),
      manageSellOfferOp: xdr.lookup("ManageSellOfferOp"),
      createPassiveSellOfferOp: xdr.lookup("CreatePassiveSellOfferOp"),
      setOptionsOp: xdr.lookup("SetOptionsOp"),
      changeTrustOp: xdr.lookup("ChangeTrustOp"),
      allowTrustOp: xdr.lookup("AllowTrustOp"),
      destination: xdr.lookup("MuxedAccount"),
      manageDataOp: xdr.lookup("ManageDataOp"),
      bumpSequenceOp: xdr.lookup("BumpSequenceOp"),
      manageBuyOfferOp: xdr.lookup("ManageBuyOfferOp"),
      pathPaymentStrictSendOp: xdr.lookup("PathPaymentStrictSendOp"),
      createClaimableBalanceOp: xdr.lookup("CreateClaimableBalanceOp"),
      claimClaimableBalanceOp: xdr.lookup("ClaimClaimableBalanceOp"),
      beginSponsoringFutureReservesOp: xdr.lookup(
        "BeginSponsoringFutureReservesOp"
      ),
      revokeSponsorshipOp: xdr.lookup("RevokeSponsorshipOp"),
      clawbackOp: xdr.lookup("ClawbackOp"),
      clawbackClaimableBalanceOp: xdr.lookup("ClawbackClaimableBalanceOp"),
      setTrustLineFlagsOp: xdr.lookup("SetTrustLineFlagsOp"),
      liquidityPoolDepositOp: xdr.lookup("LiquidityPoolDepositOp"),
      liquidityPoolWithdrawOp: xdr.lookup("LiquidityPoolWithdrawOp"),
      invokeHostFunctionOp: xdr.lookup("InvokeHostFunctionOp"),
      extendFootprintTtlOp: xdr.lookup("ExtendFootprintTtlOp"),
      restoreFootprintOp: xdr.lookup("RestoreFootprintOp")
    }
  });
  xdr.struct("Operation", [
    ["sourceAccount", xdr.option(xdr.lookup("MuxedAccount"))],
    ["body", xdr.lookup("OperationBody")]
  ]);
  xdr.struct("HashIdPreimageOperationId", [
    ["sourceAccount", xdr.lookup("AccountId")],
    ["seqNum", xdr.lookup("SequenceNumber")],
    ["opNum", xdr.lookup("Uint32")]
  ]);
  xdr.struct("HashIdPreimageRevokeId", [
    ["sourceAccount", xdr.lookup("AccountId")],
    ["seqNum", xdr.lookup("SequenceNumber")],
    ["opNum", xdr.lookup("Uint32")],
    ["liquidityPoolId", xdr.lookup("PoolId")],
    ["asset", xdr.lookup("Asset")]
  ]);
  xdr.struct("HashIdPreimageContractId", [
    ["networkId", xdr.lookup("Hash")],
    ["contractIdPreimage", xdr.lookup("ContractIdPreimage")]
  ]);
  xdr.struct("HashIdPreimageSorobanAuthorization", [
    ["networkId", xdr.lookup("Hash")],
    ["nonce", xdr.lookup("Int64")],
    ["signatureExpirationLedger", xdr.lookup("Uint32")],
    ["invocation", xdr.lookup("SorobanAuthorizedInvocation")]
  ]);
  xdr.struct("HashIdPreimageSorobanAuthorizationWithAddress", [
    ["networkId", xdr.lookup("Hash")],
    ["nonce", xdr.lookup("Int64")],
    ["signatureExpirationLedger", xdr.lookup("Uint32")],
    ["address", xdr.lookup("ScAddress")],
    ["invocation", xdr.lookup("SorobanAuthorizedInvocation")]
  ]);
  xdr.union("HashIdPreimage", {
    switchOn: xdr.lookup("EnvelopeType"),
    switchName: "type",
    switches: [
      ["envelopeTypeOpId", "operationId"],
      ["envelopeTypePoolRevokeOpId", "revokeId"],
      ["envelopeTypeContractId", "contractId"],
      ["envelopeTypeSorobanAuthorization", "sorobanAuthorization"],
      [
        "envelopeTypeSorobanAuthorizationWithAddress",
        "sorobanAuthorizationWithAddress"
      ]
    ],
    arms: {
      operationId: xdr.lookup("HashIdPreimageOperationId"),
      revokeId: xdr.lookup("HashIdPreimageRevokeId"),
      contractId: xdr.lookup("HashIdPreimageContractId"),
      sorobanAuthorization: xdr.lookup("HashIdPreimageSorobanAuthorization"),
      sorobanAuthorizationWithAddress: xdr.lookup(
        "HashIdPreimageSorobanAuthorizationWithAddress"
      )
    }
  });
  xdr.enum("MemoType", {
    memoNone: 0,
    memoText: 1,
    memoId: 2,
    memoHash: 3,
    memoReturn: 4
  });
  xdr.union("Memo", {
    switchOn: xdr.lookup("MemoType"),
    switchName: "type",
    switches: [
      ["memoNone", xdr.void()],
      ["memoText", "text"],
      ["memoId", "id"],
      ["memoHash", "hash"],
      ["memoReturn", "retHash"]
    ],
    arms: {
      text: xdr.string(28),
      id: xdr.lookup("Uint64"),
      hash: xdr.lookup("Hash"),
      retHash: xdr.lookup("Hash")
    }
  });
  xdr.struct("TimeBounds", [
    ["minTime", xdr.lookup("TimePoint")],
    ["maxTime", xdr.lookup("TimePoint")]
  ]);
  xdr.struct("LedgerBounds", [
    ["minLedger", xdr.lookup("Uint32")],
    ["maxLedger", xdr.lookup("Uint32")]
  ]);
  xdr.struct("PreconditionsV2", [
    ["timeBounds", xdr.option(xdr.lookup("TimeBounds"))],
    ["ledgerBounds", xdr.option(xdr.lookup("LedgerBounds"))],
    ["minSeqNum", xdr.option(xdr.lookup("SequenceNumber"))],
    ["minSeqAge", xdr.lookup("Duration")],
    ["minSeqLedgerGap", xdr.lookup("Uint32")],
    ["extraSigners", xdr.varArray(xdr.lookup("SignerKey"), 2)]
  ]);
  xdr.enum("PreconditionType", {
    precondNone: 0,
    precondTime: 1,
    precondV2: 2
  });
  xdr.union("Preconditions", {
    switchOn: xdr.lookup("PreconditionType"),
    switchName: "type",
    switches: [
      ["precondNone", xdr.void()],
      ["precondTime", "timeBounds"],
      ["precondV2", "v2"]
    ],
    arms: {
      timeBounds: xdr.lookup("TimeBounds"),
      v2: xdr.lookup("PreconditionsV2")
    }
  });
  xdr.struct("LedgerFootprint", [
    ["readOnly", xdr.varArray(xdr.lookup("LedgerKey"), 2147483647)],
    ["readWrite", xdr.varArray(xdr.lookup("LedgerKey"), 2147483647)]
  ]);
  xdr.struct("SorobanResources", [
    ["footprint", xdr.lookup("LedgerFootprint")],
    ["instructions", xdr.lookup("Uint32")],
    ["diskReadBytes", xdr.lookup("Uint32")],
    ["writeBytes", xdr.lookup("Uint32")]
  ]);
  xdr.struct("SorobanResourcesExtV0", [
    ["archivedSorobanEntries", xdr.varArray(xdr.lookup("Uint32"), 2147483647)]
  ]);
  xdr.union("SorobanTransactionDataExt", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [
      [0, xdr.void()],
      [1, "resourceExt"]
    ],
    arms: {
      resourceExt: xdr.lookup("SorobanResourcesExtV0")
    }
  });
  xdr.struct("SorobanTransactionData", [
    ["ext", xdr.lookup("SorobanTransactionDataExt")],
    ["resources", xdr.lookup("SorobanResources")],
    ["resourceFee", xdr.lookup("Int64")]
  ]);
  xdr.union("TransactionV0Ext", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [[0, xdr.void()]],
    arms: {}
  });
  xdr.struct("TransactionV0", [
    ["sourceAccountEd25519", xdr.lookup("Uint256")],
    ["fee", xdr.lookup("Uint32")],
    ["seqNum", xdr.lookup("SequenceNumber")],
    ["timeBounds", xdr.option(xdr.lookup("TimeBounds"))],
    ["memo", xdr.lookup("Memo")],
    [
      "operations",
      xdr.varArray(xdr.lookup("Operation"), xdr.lookup("MAX_OPS_PER_TX"))
    ],
    ["ext", xdr.lookup("TransactionV0Ext")]
  ]);
  xdr.struct("TransactionV0Envelope", [
    ["tx", xdr.lookup("TransactionV0")],
    ["signatures", xdr.varArray(xdr.lookup("DecoratedSignature"), 20)]
  ]);
  xdr.union("TransactionExt", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [
      [0, xdr.void()],
      [1, "sorobanData"]
    ],
    arms: {
      sorobanData: xdr.lookup("SorobanTransactionData")
    }
  });
  xdr.struct("Transaction", [
    ["sourceAccount", xdr.lookup("MuxedAccount")],
    ["fee", xdr.lookup("Uint32")],
    ["seqNum", xdr.lookup("SequenceNumber")],
    ["cond", xdr.lookup("Preconditions")],
    ["memo", xdr.lookup("Memo")],
    [
      "operations",
      xdr.varArray(xdr.lookup("Operation"), xdr.lookup("MAX_OPS_PER_TX"))
    ],
    ["ext", xdr.lookup("TransactionExt")]
  ]);
  xdr.struct("TransactionV1Envelope", [
    ["tx", xdr.lookup("Transaction")],
    ["signatures", xdr.varArray(xdr.lookup("DecoratedSignature"), 20)]
  ]);
  xdr.union("FeeBumpTransactionInnerTx", {
    switchOn: xdr.lookup("EnvelopeType"),
    switchName: "type",
    switches: [["envelopeTypeTx", "v1"]],
    arms: {
      v1: xdr.lookup("TransactionV1Envelope")
    }
  });
  xdr.union("FeeBumpTransactionExt", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [[0, xdr.void()]],
    arms: {}
  });
  xdr.struct("FeeBumpTransaction", [
    ["feeSource", xdr.lookup("MuxedAccount")],
    ["fee", xdr.lookup("Int64")],
    ["innerTx", xdr.lookup("FeeBumpTransactionInnerTx")],
    ["ext", xdr.lookup("FeeBumpTransactionExt")]
  ]);
  xdr.struct("FeeBumpTransactionEnvelope", [
    ["tx", xdr.lookup("FeeBumpTransaction")],
    ["signatures", xdr.varArray(xdr.lookup("DecoratedSignature"), 20)]
  ]);
  xdr.union("TransactionEnvelope", {
    switchOn: xdr.lookup("EnvelopeType"),
    switchName: "type",
    switches: [
      ["envelopeTypeTxV0", "v0"],
      ["envelopeTypeTx", "v1"],
      ["envelopeTypeTxFeeBump", "feeBump"]
    ],
    arms: {
      v0: xdr.lookup("TransactionV0Envelope"),
      v1: xdr.lookup("TransactionV1Envelope"),
      feeBump: xdr.lookup("FeeBumpTransactionEnvelope")
    }
  });
  xdr.union("TransactionSignaturePayloadTaggedTransaction", {
    switchOn: xdr.lookup("EnvelopeType"),
    switchName: "type",
    switches: [
      ["envelopeTypeTx", "tx"],
      ["envelopeTypeTxFeeBump", "feeBump"]
    ],
    arms: {
      tx: xdr.lookup("Transaction"),
      feeBump: xdr.lookup("FeeBumpTransaction")
    }
  });
  xdr.struct("TransactionSignaturePayload", [
    ["networkId", xdr.lookup("Hash")],
    [
      "taggedTransaction",
      xdr.lookup("TransactionSignaturePayloadTaggedTransaction")
    ]
  ]);
  xdr.enum("ClaimAtomType", {
    claimAtomTypeV0: 0,
    claimAtomTypeOrderBook: 1,
    claimAtomTypeLiquidityPool: 2
  });
  xdr.struct("ClaimOfferAtomV0", [
    ["sellerEd25519", xdr.lookup("Uint256")],
    ["offerId", xdr.lookup("Int64")],
    ["assetSold", xdr.lookup("Asset")],
    ["amountSold", xdr.lookup("Int64")],
    ["assetBought", xdr.lookup("Asset")],
    ["amountBought", xdr.lookup("Int64")]
  ]);
  xdr.struct("ClaimOfferAtom", [
    ["sellerId", xdr.lookup("AccountId")],
    ["offerId", xdr.lookup("Int64")],
    ["assetSold", xdr.lookup("Asset")],
    ["amountSold", xdr.lookup("Int64")],
    ["assetBought", xdr.lookup("Asset")],
    ["amountBought", xdr.lookup("Int64")]
  ]);
  xdr.struct("ClaimLiquidityAtom", [
    ["liquidityPoolId", xdr.lookup("PoolId")],
    ["assetSold", xdr.lookup("Asset")],
    ["amountSold", xdr.lookup("Int64")],
    ["assetBought", xdr.lookup("Asset")],
    ["amountBought", xdr.lookup("Int64")]
  ]);
  xdr.union("ClaimAtom", {
    switchOn: xdr.lookup("ClaimAtomType"),
    switchName: "type",
    switches: [
      ["claimAtomTypeV0", "v0"],
      ["claimAtomTypeOrderBook", "orderBook"],
      ["claimAtomTypeLiquidityPool", "liquidityPool"]
    ],
    arms: {
      v0: xdr.lookup("ClaimOfferAtomV0"),
      orderBook: xdr.lookup("ClaimOfferAtom"),
      liquidityPool: xdr.lookup("ClaimLiquidityAtom")
    }
  });
  xdr.enum("CreateAccountResultCode", {
    createAccountSuccess: 0,
    createAccountMalformed: -1,
    createAccountUnderfunded: -2,
    createAccountLowReserve: -3,
    createAccountAlreadyExist: -4
  });
  xdr.union("CreateAccountResult", {
    switchOn: xdr.lookup("CreateAccountResultCode"),
    switchName: "code",
    switches: [
      ["createAccountSuccess", xdr.void()],
      ["createAccountMalformed", xdr.void()],
      ["createAccountUnderfunded", xdr.void()],
      ["createAccountLowReserve", xdr.void()],
      ["createAccountAlreadyExist", xdr.void()]
    ],
    arms: {}
  });
  xdr.enum("PaymentResultCode", {
    paymentSuccess: 0,
    paymentMalformed: -1,
    paymentUnderfunded: -2,
    paymentSrcNoTrust: -3,
    paymentSrcNotAuthorized: -4,
    paymentNoDestination: -5,
    paymentNoTrust: -6,
    paymentNotAuthorized: -7,
    paymentLineFull: -8,
    paymentNoIssuer: -9
  });
  xdr.union("PaymentResult", {
    switchOn: xdr.lookup("PaymentResultCode"),
    switchName: "code",
    switches: [
      ["paymentSuccess", xdr.void()],
      ["paymentMalformed", xdr.void()],
      ["paymentUnderfunded", xdr.void()],
      ["paymentSrcNoTrust", xdr.void()],
      ["paymentSrcNotAuthorized", xdr.void()],
      ["paymentNoDestination", xdr.void()],
      ["paymentNoTrust", xdr.void()],
      ["paymentNotAuthorized", xdr.void()],
      ["paymentLineFull", xdr.void()],
      ["paymentNoIssuer", xdr.void()]
    ],
    arms: {}
  });
  xdr.enum("PathPaymentStrictReceiveResultCode", {
    pathPaymentStrictReceiveSuccess: 0,
    pathPaymentStrictReceiveMalformed: -1,
    pathPaymentStrictReceiveUnderfunded: -2,
    pathPaymentStrictReceiveSrcNoTrust: -3,
    pathPaymentStrictReceiveSrcNotAuthorized: -4,
    pathPaymentStrictReceiveNoDestination: -5,
    pathPaymentStrictReceiveNoTrust: -6,
    pathPaymentStrictReceiveNotAuthorized: -7,
    pathPaymentStrictReceiveLineFull: -8,
    pathPaymentStrictReceiveNoIssuer: -9,
    pathPaymentStrictReceiveTooFewOffers: -10,
    pathPaymentStrictReceiveOfferCrossSelf: -11,
    pathPaymentStrictReceiveOverSendmax: -12
  });
  xdr.struct("SimplePaymentResult", [
    ["destination", xdr.lookup("AccountId")],
    ["asset", xdr.lookup("Asset")],
    ["amount", xdr.lookup("Int64")]
  ]);
  xdr.struct("PathPaymentStrictReceiveResultSuccess", [
    ["offers", xdr.varArray(xdr.lookup("ClaimAtom"), 2147483647)],
    ["last", xdr.lookup("SimplePaymentResult")]
  ]);
  xdr.union("PathPaymentStrictReceiveResult", {
    switchOn: xdr.lookup("PathPaymentStrictReceiveResultCode"),
    switchName: "code",
    switches: [
      ["pathPaymentStrictReceiveSuccess", "success"],
      ["pathPaymentStrictReceiveMalformed", xdr.void()],
      ["pathPaymentStrictReceiveUnderfunded", xdr.void()],
      ["pathPaymentStrictReceiveSrcNoTrust", xdr.void()],
      ["pathPaymentStrictReceiveSrcNotAuthorized", xdr.void()],
      ["pathPaymentStrictReceiveNoDestination", xdr.void()],
      ["pathPaymentStrictReceiveNoTrust", xdr.void()],
      ["pathPaymentStrictReceiveNotAuthorized", xdr.void()],
      ["pathPaymentStrictReceiveLineFull", xdr.void()],
      ["pathPaymentStrictReceiveNoIssuer", "noIssuer"],
      ["pathPaymentStrictReceiveTooFewOffers", xdr.void()],
      ["pathPaymentStrictReceiveOfferCrossSelf", xdr.void()],
      ["pathPaymentStrictReceiveOverSendmax", xdr.void()]
    ],
    arms: {
      success: xdr.lookup("PathPaymentStrictReceiveResultSuccess"),
      noIssuer: xdr.lookup("Asset")
    }
  });
  xdr.enum("PathPaymentStrictSendResultCode", {
    pathPaymentStrictSendSuccess: 0,
    pathPaymentStrictSendMalformed: -1,
    pathPaymentStrictSendUnderfunded: -2,
    pathPaymentStrictSendSrcNoTrust: -3,
    pathPaymentStrictSendSrcNotAuthorized: -4,
    pathPaymentStrictSendNoDestination: -5,
    pathPaymentStrictSendNoTrust: -6,
    pathPaymentStrictSendNotAuthorized: -7,
    pathPaymentStrictSendLineFull: -8,
    pathPaymentStrictSendNoIssuer: -9,
    pathPaymentStrictSendTooFewOffers: -10,
    pathPaymentStrictSendOfferCrossSelf: -11,
    pathPaymentStrictSendUnderDestmin: -12
  });
  xdr.struct("PathPaymentStrictSendResultSuccess", [
    ["offers", xdr.varArray(xdr.lookup("ClaimAtom"), 2147483647)],
    ["last", xdr.lookup("SimplePaymentResult")]
  ]);
  xdr.union("PathPaymentStrictSendResult", {
    switchOn: xdr.lookup("PathPaymentStrictSendResultCode"),
    switchName: "code",
    switches: [
      ["pathPaymentStrictSendSuccess", "success"],
      ["pathPaymentStrictSendMalformed", xdr.void()],
      ["pathPaymentStrictSendUnderfunded", xdr.void()],
      ["pathPaymentStrictSendSrcNoTrust", xdr.void()],
      ["pathPaymentStrictSendSrcNotAuthorized", xdr.void()],
      ["pathPaymentStrictSendNoDestination", xdr.void()],
      ["pathPaymentStrictSendNoTrust", xdr.void()],
      ["pathPaymentStrictSendNotAuthorized", xdr.void()],
      ["pathPaymentStrictSendLineFull", xdr.void()],
      ["pathPaymentStrictSendNoIssuer", "noIssuer"],
      ["pathPaymentStrictSendTooFewOffers", xdr.void()],
      ["pathPaymentStrictSendOfferCrossSelf", xdr.void()],
      ["pathPaymentStrictSendUnderDestmin", xdr.void()]
    ],
    arms: {
      success: xdr.lookup("PathPaymentStrictSendResultSuccess"),
      noIssuer: xdr.lookup("Asset")
    }
  });
  xdr.enum("ManageSellOfferResultCode", {
    manageSellOfferSuccess: 0,
    manageSellOfferMalformed: -1,
    manageSellOfferSellNoTrust: -2,
    manageSellOfferBuyNoTrust: -3,
    manageSellOfferSellNotAuthorized: -4,
    manageSellOfferBuyNotAuthorized: -5,
    manageSellOfferLineFull: -6,
    manageSellOfferUnderfunded: -7,
    manageSellOfferCrossSelf: -8,
    manageSellOfferSellNoIssuer: -9,
    manageSellOfferBuyNoIssuer: -10,
    manageSellOfferNotFound: -11,
    manageSellOfferLowReserve: -12
  });
  xdr.enum("ManageOfferEffect", {
    manageOfferCreated: 0,
    manageOfferUpdated: 1,
    manageOfferDeleted: 2
  });
  xdr.union("ManageOfferSuccessResultOffer", {
    switchOn: xdr.lookup("ManageOfferEffect"),
    switchName: "effect",
    switches: [
      ["manageOfferCreated", "offer"],
      ["manageOfferUpdated", "offer"],
      ["manageOfferDeleted", xdr.void()]
    ],
    arms: {
      offer: xdr.lookup("OfferEntry")
    }
  });
  xdr.struct("ManageOfferSuccessResult", [
    ["offersClaimed", xdr.varArray(xdr.lookup("ClaimAtom"), 2147483647)],
    ["offer", xdr.lookup("ManageOfferSuccessResultOffer")]
  ]);
  xdr.union("ManageSellOfferResult", {
    switchOn: xdr.lookup("ManageSellOfferResultCode"),
    switchName: "code",
    switches: [
      ["manageSellOfferSuccess", "success"],
      ["manageSellOfferMalformed", xdr.void()],
      ["manageSellOfferSellNoTrust", xdr.void()],
      ["manageSellOfferBuyNoTrust", xdr.void()],
      ["manageSellOfferSellNotAuthorized", xdr.void()],
      ["manageSellOfferBuyNotAuthorized", xdr.void()],
      ["manageSellOfferLineFull", xdr.void()],
      ["manageSellOfferUnderfunded", xdr.void()],
      ["manageSellOfferCrossSelf", xdr.void()],
      ["manageSellOfferSellNoIssuer", xdr.void()],
      ["manageSellOfferBuyNoIssuer", xdr.void()],
      ["manageSellOfferNotFound", xdr.void()],
      ["manageSellOfferLowReserve", xdr.void()]
    ],
    arms: {
      success: xdr.lookup("ManageOfferSuccessResult")
    }
  });
  xdr.enum("ManageBuyOfferResultCode", {
    manageBuyOfferSuccess: 0,
    manageBuyOfferMalformed: -1,
    manageBuyOfferSellNoTrust: -2,
    manageBuyOfferBuyNoTrust: -3,
    manageBuyOfferSellNotAuthorized: -4,
    manageBuyOfferBuyNotAuthorized: -5,
    manageBuyOfferLineFull: -6,
    manageBuyOfferUnderfunded: -7,
    manageBuyOfferCrossSelf: -8,
    manageBuyOfferSellNoIssuer: -9,
    manageBuyOfferBuyNoIssuer: -10,
    manageBuyOfferNotFound: -11,
    manageBuyOfferLowReserve: -12
  });
  xdr.union("ManageBuyOfferResult", {
    switchOn: xdr.lookup("ManageBuyOfferResultCode"),
    switchName: "code",
    switches: [
      ["manageBuyOfferSuccess", "success"],
      ["manageBuyOfferMalformed", xdr.void()],
      ["manageBuyOfferSellNoTrust", xdr.void()],
      ["manageBuyOfferBuyNoTrust", xdr.void()],
      ["manageBuyOfferSellNotAuthorized", xdr.void()],
      ["manageBuyOfferBuyNotAuthorized", xdr.void()],
      ["manageBuyOfferLineFull", xdr.void()],
      ["manageBuyOfferUnderfunded", xdr.void()],
      ["manageBuyOfferCrossSelf", xdr.void()],
      ["manageBuyOfferSellNoIssuer", xdr.void()],
      ["manageBuyOfferBuyNoIssuer", xdr.void()],
      ["manageBuyOfferNotFound", xdr.void()],
      ["manageBuyOfferLowReserve", xdr.void()]
    ],
    arms: {
      success: xdr.lookup("ManageOfferSuccessResult")
    }
  });
  xdr.enum("SetOptionsResultCode", {
    setOptionsSuccess: 0,
    setOptionsLowReserve: -1,
    setOptionsTooManySigners: -2,
    setOptionsBadFlags: -3,
    setOptionsInvalidInflation: -4,
    setOptionsCantChange: -5,
    setOptionsUnknownFlag: -6,
    setOptionsThresholdOutOfRange: -7,
    setOptionsBadSigner: -8,
    setOptionsInvalidHomeDomain: -9,
    setOptionsAuthRevocableRequired: -10
  });
  xdr.union("SetOptionsResult", {
    switchOn: xdr.lookup("SetOptionsResultCode"),
    switchName: "code",
    switches: [
      ["setOptionsSuccess", xdr.void()],
      ["setOptionsLowReserve", xdr.void()],
      ["setOptionsTooManySigners", xdr.void()],
      ["setOptionsBadFlags", xdr.void()],
      ["setOptionsInvalidInflation", xdr.void()],
      ["setOptionsCantChange", xdr.void()],
      ["setOptionsUnknownFlag", xdr.void()],
      ["setOptionsThresholdOutOfRange", xdr.void()],
      ["setOptionsBadSigner", xdr.void()],
      ["setOptionsInvalidHomeDomain", xdr.void()],
      ["setOptionsAuthRevocableRequired", xdr.void()]
    ],
    arms: {}
  });
  xdr.enum("ChangeTrustResultCode", {
    changeTrustSuccess: 0,
    changeTrustMalformed: -1,
    changeTrustNoIssuer: -2,
    changeTrustInvalidLimit: -3,
    changeTrustLowReserve: -4,
    changeTrustSelfNotAllowed: -5,
    changeTrustTrustLineMissing: -6,
    changeTrustCannotDelete: -7,
    changeTrustNotAuthMaintainLiabilities: -8
  });
  xdr.union("ChangeTrustResult", {
    switchOn: xdr.lookup("ChangeTrustResultCode"),
    switchName: "code",
    switches: [
      ["changeTrustSuccess", xdr.void()],
      ["changeTrustMalformed", xdr.void()],
      ["changeTrustNoIssuer", xdr.void()],
      ["changeTrustInvalidLimit", xdr.void()],
      ["changeTrustLowReserve", xdr.void()],
      ["changeTrustSelfNotAllowed", xdr.void()],
      ["changeTrustTrustLineMissing", xdr.void()],
      ["changeTrustCannotDelete", xdr.void()],
      ["changeTrustNotAuthMaintainLiabilities", xdr.void()]
    ],
    arms: {}
  });
  xdr.enum("AllowTrustResultCode", {
    allowTrustSuccess: 0,
    allowTrustMalformed: -1,
    allowTrustNoTrustLine: -2,
    allowTrustTrustNotRequired: -3,
    allowTrustCantRevoke: -4,
    allowTrustSelfNotAllowed: -5,
    allowTrustLowReserve: -6
  });
  xdr.union("AllowTrustResult", {
    switchOn: xdr.lookup("AllowTrustResultCode"),
    switchName: "code",
    switches: [
      ["allowTrustSuccess", xdr.void()],
      ["allowTrustMalformed", xdr.void()],
      ["allowTrustNoTrustLine", xdr.void()],
      ["allowTrustTrustNotRequired", xdr.void()],
      ["allowTrustCantRevoke", xdr.void()],
      ["allowTrustSelfNotAllowed", xdr.void()],
      ["allowTrustLowReserve", xdr.void()]
    ],
    arms: {}
  });
  xdr.enum("AccountMergeResultCode", {
    accountMergeSuccess: 0,
    accountMergeMalformed: -1,
    accountMergeNoAccount: -2,
    accountMergeImmutableSet: -3,
    accountMergeHasSubEntries: -4,
    accountMergeSeqnumTooFar: -5,
    accountMergeDestFull: -6,
    accountMergeIsSponsor: -7
  });
  xdr.union("AccountMergeResult", {
    switchOn: xdr.lookup("AccountMergeResultCode"),
    switchName: "code",
    switches: [
      ["accountMergeSuccess", "sourceAccountBalance"],
      ["accountMergeMalformed", xdr.void()],
      ["accountMergeNoAccount", xdr.void()],
      ["accountMergeImmutableSet", xdr.void()],
      ["accountMergeHasSubEntries", xdr.void()],
      ["accountMergeSeqnumTooFar", xdr.void()],
      ["accountMergeDestFull", xdr.void()],
      ["accountMergeIsSponsor", xdr.void()]
    ],
    arms: {
      sourceAccountBalance: xdr.lookup("Int64")
    }
  });
  xdr.enum("InflationResultCode", {
    inflationSuccess: 0,
    inflationNotTime: -1
  });
  xdr.struct("InflationPayout", [
    ["destination", xdr.lookup("AccountId")],
    ["amount", xdr.lookup("Int64")]
  ]);
  xdr.union("InflationResult", {
    switchOn: xdr.lookup("InflationResultCode"),
    switchName: "code",
    switches: [
      ["inflationSuccess", "payouts"],
      ["inflationNotTime", xdr.void()]
    ],
    arms: {
      payouts: xdr.varArray(xdr.lookup("InflationPayout"), 2147483647)
    }
  });
  xdr.enum("ManageDataResultCode", {
    manageDataSuccess: 0,
    manageDataNotSupportedYet: -1,
    manageDataNameNotFound: -2,
    manageDataLowReserve: -3,
    manageDataInvalidName: -4
  });
  xdr.union("ManageDataResult", {
    switchOn: xdr.lookup("ManageDataResultCode"),
    switchName: "code",
    switches: [
      ["manageDataSuccess", xdr.void()],
      ["manageDataNotSupportedYet", xdr.void()],
      ["manageDataNameNotFound", xdr.void()],
      ["manageDataLowReserve", xdr.void()],
      ["manageDataInvalidName", xdr.void()]
    ],
    arms: {}
  });
  xdr.enum("BumpSequenceResultCode", {
    bumpSequenceSuccess: 0,
    bumpSequenceBadSeq: -1
  });
  xdr.union("BumpSequenceResult", {
    switchOn: xdr.lookup("BumpSequenceResultCode"),
    switchName: "code",
    switches: [
      ["bumpSequenceSuccess", xdr.void()],
      ["bumpSequenceBadSeq", xdr.void()]
    ],
    arms: {}
  });
  xdr.enum("CreateClaimableBalanceResultCode", {
    createClaimableBalanceSuccess: 0,
    createClaimableBalanceMalformed: -1,
    createClaimableBalanceLowReserve: -2,
    createClaimableBalanceNoTrust: -3,
    createClaimableBalanceNotAuthorized: -4,
    createClaimableBalanceUnderfunded: -5
  });
  xdr.union("CreateClaimableBalanceResult", {
    switchOn: xdr.lookup("CreateClaimableBalanceResultCode"),
    switchName: "code",
    switches: [
      ["createClaimableBalanceSuccess", "balanceId"],
      ["createClaimableBalanceMalformed", xdr.void()],
      ["createClaimableBalanceLowReserve", xdr.void()],
      ["createClaimableBalanceNoTrust", xdr.void()],
      ["createClaimableBalanceNotAuthorized", xdr.void()],
      ["createClaimableBalanceUnderfunded", xdr.void()]
    ],
    arms: {
      balanceId: xdr.lookup("ClaimableBalanceId")
    }
  });
  xdr.enum("ClaimClaimableBalanceResultCode", {
    claimClaimableBalanceSuccess: 0,
    claimClaimableBalanceDoesNotExist: -1,
    claimClaimableBalanceCannotClaim: -2,
    claimClaimableBalanceLineFull: -3,
    claimClaimableBalanceNoTrust: -4,
    claimClaimableBalanceNotAuthorized: -5,
    claimClaimableBalanceTrustlineFrozen: -6
  });
  xdr.union("ClaimClaimableBalanceResult", {
    switchOn: xdr.lookup("ClaimClaimableBalanceResultCode"),
    switchName: "code",
    switches: [
      ["claimClaimableBalanceSuccess", xdr.void()],
      ["claimClaimableBalanceDoesNotExist", xdr.void()],
      ["claimClaimableBalanceCannotClaim", xdr.void()],
      ["claimClaimableBalanceLineFull", xdr.void()],
      ["claimClaimableBalanceNoTrust", xdr.void()],
      ["claimClaimableBalanceNotAuthorized", xdr.void()],
      ["claimClaimableBalanceTrustlineFrozen", xdr.void()]
    ],
    arms: {}
  });
  xdr.enum("BeginSponsoringFutureReservesResultCode", {
    beginSponsoringFutureReservesSuccess: 0,
    beginSponsoringFutureReservesMalformed: -1,
    beginSponsoringFutureReservesAlreadySponsored: -2,
    beginSponsoringFutureReservesRecursive: -3
  });
  xdr.union("BeginSponsoringFutureReservesResult", {
    switchOn: xdr.lookup("BeginSponsoringFutureReservesResultCode"),
    switchName: "code",
    switches: [
      ["beginSponsoringFutureReservesSuccess", xdr.void()],
      ["beginSponsoringFutureReservesMalformed", xdr.void()],
      ["beginSponsoringFutureReservesAlreadySponsored", xdr.void()],
      ["beginSponsoringFutureReservesRecursive", xdr.void()]
    ],
    arms: {}
  });
  xdr.enum("EndSponsoringFutureReservesResultCode", {
    endSponsoringFutureReservesSuccess: 0,
    endSponsoringFutureReservesNotSponsored: -1
  });
  xdr.union("EndSponsoringFutureReservesResult", {
    switchOn: xdr.lookup("EndSponsoringFutureReservesResultCode"),
    switchName: "code",
    switches: [
      ["endSponsoringFutureReservesSuccess", xdr.void()],
      ["endSponsoringFutureReservesNotSponsored", xdr.void()]
    ],
    arms: {}
  });
  xdr.enum("RevokeSponsorshipResultCode", {
    revokeSponsorshipSuccess: 0,
    revokeSponsorshipDoesNotExist: -1,
    revokeSponsorshipNotSponsor: -2,
    revokeSponsorshipLowReserve: -3,
    revokeSponsorshipOnlyTransferable: -4,
    revokeSponsorshipMalformed: -5
  });
  xdr.union("RevokeSponsorshipResult", {
    switchOn: xdr.lookup("RevokeSponsorshipResultCode"),
    switchName: "code",
    switches: [
      ["revokeSponsorshipSuccess", xdr.void()],
      ["revokeSponsorshipDoesNotExist", xdr.void()],
      ["revokeSponsorshipNotSponsor", xdr.void()],
      ["revokeSponsorshipLowReserve", xdr.void()],
      ["revokeSponsorshipOnlyTransferable", xdr.void()],
      ["revokeSponsorshipMalformed", xdr.void()]
    ],
    arms: {}
  });
  xdr.enum("ClawbackResultCode", {
    clawbackSuccess: 0,
    clawbackMalformed: -1,
    clawbackNotClawbackEnabled: -2,
    clawbackNoTrust: -3,
    clawbackUnderfunded: -4
  });
  xdr.union("ClawbackResult", {
    switchOn: xdr.lookup("ClawbackResultCode"),
    switchName: "code",
    switches: [
      ["clawbackSuccess", xdr.void()],
      ["clawbackMalformed", xdr.void()],
      ["clawbackNotClawbackEnabled", xdr.void()],
      ["clawbackNoTrust", xdr.void()],
      ["clawbackUnderfunded", xdr.void()]
    ],
    arms: {}
  });
  xdr.enum("ClawbackClaimableBalanceResultCode", {
    clawbackClaimableBalanceSuccess: 0,
    clawbackClaimableBalanceDoesNotExist: -1,
    clawbackClaimableBalanceNotIssuer: -2,
    clawbackClaimableBalanceNotClawbackEnabled: -3
  });
  xdr.union("ClawbackClaimableBalanceResult", {
    switchOn: xdr.lookup("ClawbackClaimableBalanceResultCode"),
    switchName: "code",
    switches: [
      ["clawbackClaimableBalanceSuccess", xdr.void()],
      ["clawbackClaimableBalanceDoesNotExist", xdr.void()],
      ["clawbackClaimableBalanceNotIssuer", xdr.void()],
      ["clawbackClaimableBalanceNotClawbackEnabled", xdr.void()]
    ],
    arms: {}
  });
  xdr.enum("SetTrustLineFlagsResultCode", {
    setTrustLineFlagsSuccess: 0,
    setTrustLineFlagsMalformed: -1,
    setTrustLineFlagsNoTrustLine: -2,
    setTrustLineFlagsCantRevoke: -3,
    setTrustLineFlagsInvalidState: -4,
    setTrustLineFlagsLowReserve: -5
  });
  xdr.union("SetTrustLineFlagsResult", {
    switchOn: xdr.lookup("SetTrustLineFlagsResultCode"),
    switchName: "code",
    switches: [
      ["setTrustLineFlagsSuccess", xdr.void()],
      ["setTrustLineFlagsMalformed", xdr.void()],
      ["setTrustLineFlagsNoTrustLine", xdr.void()],
      ["setTrustLineFlagsCantRevoke", xdr.void()],
      ["setTrustLineFlagsInvalidState", xdr.void()],
      ["setTrustLineFlagsLowReserve", xdr.void()]
    ],
    arms: {}
  });
  xdr.enum("LiquidityPoolDepositResultCode", {
    liquidityPoolDepositSuccess: 0,
    liquidityPoolDepositMalformed: -1,
    liquidityPoolDepositNoTrust: -2,
    liquidityPoolDepositNotAuthorized: -3,
    liquidityPoolDepositUnderfunded: -4,
    liquidityPoolDepositLineFull: -5,
    liquidityPoolDepositBadPrice: -6,
    liquidityPoolDepositPoolFull: -7,
    liquidityPoolDepositTrustlineFrozen: -8
  });
  xdr.union("LiquidityPoolDepositResult", {
    switchOn: xdr.lookup("LiquidityPoolDepositResultCode"),
    switchName: "code",
    switches: [
      ["liquidityPoolDepositSuccess", xdr.void()],
      ["liquidityPoolDepositMalformed", xdr.void()],
      ["liquidityPoolDepositNoTrust", xdr.void()],
      ["liquidityPoolDepositNotAuthorized", xdr.void()],
      ["liquidityPoolDepositUnderfunded", xdr.void()],
      ["liquidityPoolDepositLineFull", xdr.void()],
      ["liquidityPoolDepositBadPrice", xdr.void()],
      ["liquidityPoolDepositPoolFull", xdr.void()],
      ["liquidityPoolDepositTrustlineFrozen", xdr.void()]
    ],
    arms: {}
  });
  xdr.enum("LiquidityPoolWithdrawResultCode", {
    liquidityPoolWithdrawSuccess: 0,
    liquidityPoolWithdrawMalformed: -1,
    liquidityPoolWithdrawNoTrust: -2,
    liquidityPoolWithdrawUnderfunded: -3,
    liquidityPoolWithdrawLineFull: -4,
    liquidityPoolWithdrawUnderMinimum: -5,
    liquidityPoolWithdrawTrustlineFrozen: -6
  });
  xdr.union("LiquidityPoolWithdrawResult", {
    switchOn: xdr.lookup("LiquidityPoolWithdrawResultCode"),
    switchName: "code",
    switches: [
      ["liquidityPoolWithdrawSuccess", xdr.void()],
      ["liquidityPoolWithdrawMalformed", xdr.void()],
      ["liquidityPoolWithdrawNoTrust", xdr.void()],
      ["liquidityPoolWithdrawUnderfunded", xdr.void()],
      ["liquidityPoolWithdrawLineFull", xdr.void()],
      ["liquidityPoolWithdrawUnderMinimum", xdr.void()],
      ["liquidityPoolWithdrawTrustlineFrozen", xdr.void()]
    ],
    arms: {}
  });
  xdr.enum("InvokeHostFunctionResultCode", {
    invokeHostFunctionSuccess: 0,
    invokeHostFunctionMalformed: -1,
    invokeHostFunctionTrapped: -2,
    invokeHostFunctionResourceLimitExceeded: -3,
    invokeHostFunctionEntryArchived: -4,
    invokeHostFunctionInsufficientRefundableFee: -5
  });
  xdr.union("InvokeHostFunctionResult", {
    switchOn: xdr.lookup("InvokeHostFunctionResultCode"),
    switchName: "code",
    switches: [
      ["invokeHostFunctionSuccess", "success"],
      ["invokeHostFunctionMalformed", xdr.void()],
      ["invokeHostFunctionTrapped", xdr.void()],
      ["invokeHostFunctionResourceLimitExceeded", xdr.void()],
      ["invokeHostFunctionEntryArchived", xdr.void()],
      ["invokeHostFunctionInsufficientRefundableFee", xdr.void()]
    ],
    arms: {
      success: xdr.lookup("Hash")
    }
  });
  xdr.enum("ExtendFootprintTtlResultCode", {
    extendFootprintTtlSuccess: 0,
    extendFootprintTtlMalformed: -1,
    extendFootprintTtlResourceLimitExceeded: -2,
    extendFootprintTtlInsufficientRefundableFee: -3
  });
  xdr.union("ExtendFootprintTtlResult", {
    switchOn: xdr.lookup("ExtendFootprintTtlResultCode"),
    switchName: "code",
    switches: [
      ["extendFootprintTtlSuccess", xdr.void()],
      ["extendFootprintTtlMalformed", xdr.void()],
      ["extendFootprintTtlResourceLimitExceeded", xdr.void()],
      ["extendFootprintTtlInsufficientRefundableFee", xdr.void()]
    ],
    arms: {}
  });
  xdr.enum("RestoreFootprintResultCode", {
    restoreFootprintSuccess: 0,
    restoreFootprintMalformed: -1,
    restoreFootprintResourceLimitExceeded: -2,
    restoreFootprintInsufficientRefundableFee: -3
  });
  xdr.union("RestoreFootprintResult", {
    switchOn: xdr.lookup("RestoreFootprintResultCode"),
    switchName: "code",
    switches: [
      ["restoreFootprintSuccess", xdr.void()],
      ["restoreFootprintMalformed", xdr.void()],
      ["restoreFootprintResourceLimitExceeded", xdr.void()],
      ["restoreFootprintInsufficientRefundableFee", xdr.void()]
    ],
    arms: {}
  });
  xdr.enum("OperationResultCode", {
    opInner: 0,
    opBadAuth: -1,
    opNoAccount: -2,
    opNotSupported: -3,
    opTooManySubentries: -4,
    opExceededWorkLimit: -5,
    opTooManySponsoring: -6
  });
  xdr.union("OperationResultTr", {
    switchOn: xdr.lookup("OperationType"),
    switchName: "type",
    switches: [
      ["createAccount", "createAccountResult"],
      ["payment", "paymentResult"],
      ["pathPaymentStrictReceive", "pathPaymentStrictReceiveResult"],
      ["manageSellOffer", "manageSellOfferResult"],
      ["createPassiveSellOffer", "createPassiveSellOfferResult"],
      ["setOptions", "setOptionsResult"],
      ["changeTrust", "changeTrustResult"],
      ["allowTrust", "allowTrustResult"],
      ["accountMerge", "accountMergeResult"],
      ["inflation", "inflationResult"],
      ["manageData", "manageDataResult"],
      ["bumpSequence", "bumpSeqResult"],
      ["manageBuyOffer", "manageBuyOfferResult"],
      ["pathPaymentStrictSend", "pathPaymentStrictSendResult"],
      ["createClaimableBalance", "createClaimableBalanceResult"],
      ["claimClaimableBalance", "claimClaimableBalanceResult"],
      ["beginSponsoringFutureReserves", "beginSponsoringFutureReservesResult"],
      ["endSponsoringFutureReserves", "endSponsoringFutureReservesResult"],
      ["revokeSponsorship", "revokeSponsorshipResult"],
      ["clawback", "clawbackResult"],
      ["clawbackClaimableBalance", "clawbackClaimableBalanceResult"],
      ["setTrustLineFlags", "setTrustLineFlagsResult"],
      ["liquidityPoolDeposit", "liquidityPoolDepositResult"],
      ["liquidityPoolWithdraw", "liquidityPoolWithdrawResult"],
      ["invokeHostFunction", "invokeHostFunctionResult"],
      ["extendFootprintTtl", "extendFootprintTtlResult"],
      ["restoreFootprint", "restoreFootprintResult"]
    ],
    arms: {
      createAccountResult: xdr.lookup("CreateAccountResult"),
      paymentResult: xdr.lookup("PaymentResult"),
      pathPaymentStrictReceiveResult: xdr.lookup(
        "PathPaymentStrictReceiveResult"
      ),
      manageSellOfferResult: xdr.lookup("ManageSellOfferResult"),
      createPassiveSellOfferResult: xdr.lookup("ManageSellOfferResult"),
      setOptionsResult: xdr.lookup("SetOptionsResult"),
      changeTrustResult: xdr.lookup("ChangeTrustResult"),
      allowTrustResult: xdr.lookup("AllowTrustResult"),
      accountMergeResult: xdr.lookup("AccountMergeResult"),
      inflationResult: xdr.lookup("InflationResult"),
      manageDataResult: xdr.lookup("ManageDataResult"),
      bumpSeqResult: xdr.lookup("BumpSequenceResult"),
      manageBuyOfferResult: xdr.lookup("ManageBuyOfferResult"),
      pathPaymentStrictSendResult: xdr.lookup("PathPaymentStrictSendResult"),
      createClaimableBalanceResult: xdr.lookup("CreateClaimableBalanceResult"),
      claimClaimableBalanceResult: xdr.lookup("ClaimClaimableBalanceResult"),
      beginSponsoringFutureReservesResult: xdr.lookup(
        "BeginSponsoringFutureReservesResult"
      ),
      endSponsoringFutureReservesResult: xdr.lookup(
        "EndSponsoringFutureReservesResult"
      ),
      revokeSponsorshipResult: xdr.lookup("RevokeSponsorshipResult"),
      clawbackResult: xdr.lookup("ClawbackResult"),
      clawbackClaimableBalanceResult: xdr.lookup(
        "ClawbackClaimableBalanceResult"
      ),
      setTrustLineFlagsResult: xdr.lookup("SetTrustLineFlagsResult"),
      liquidityPoolDepositResult: xdr.lookup("LiquidityPoolDepositResult"),
      liquidityPoolWithdrawResult: xdr.lookup("LiquidityPoolWithdrawResult"),
      invokeHostFunctionResult: xdr.lookup("InvokeHostFunctionResult"),
      extendFootprintTtlResult: xdr.lookup("ExtendFootprintTtlResult"),
      restoreFootprintResult: xdr.lookup("RestoreFootprintResult")
    }
  });
  xdr.union("OperationResult", {
    switchOn: xdr.lookup("OperationResultCode"),
    switchName: "code",
    switches: [
      ["opInner", "tr"],
      ["opBadAuth", xdr.void()],
      ["opNoAccount", xdr.void()],
      ["opNotSupported", xdr.void()],
      ["opTooManySubentries", xdr.void()],
      ["opExceededWorkLimit", xdr.void()],
      ["opTooManySponsoring", xdr.void()]
    ],
    arms: {
      tr: xdr.lookup("OperationResultTr")
    }
  });
  xdr.enum("TransactionResultCode", {
    txFeeBumpInnerSuccess: 1,
    txSuccess: 0,
    txFailed: -1,
    txTooEarly: -2,
    txTooLate: -3,
    txMissingOperation: -4,
    txBadSeq: -5,
    txBadAuth: -6,
    txInsufficientBalance: -7,
    txNoAccount: -8,
    txInsufficientFee: -9,
    txBadAuthExtra: -10,
    txInternalError: -11,
    txNotSupported: -12,
    txFeeBumpInnerFailed: -13,
    txBadSponsorship: -14,
    txBadMinSeqAgeOrGap: -15,
    txMalformed: -16,
    txSorobanInvalid: -17,
    txFrozenKeyAccessed: -18
  });
  xdr.union("InnerTransactionResultResult", {
    switchOn: xdr.lookup("TransactionResultCode"),
    switchName: "code",
    switches: [
      ["txSuccess", "results"],
      ["txFailed", "results"],
      ["txTooEarly", xdr.void()],
      ["txTooLate", xdr.void()],
      ["txMissingOperation", xdr.void()],
      ["txBadSeq", xdr.void()],
      ["txBadAuth", xdr.void()],
      ["txInsufficientBalance", xdr.void()],
      ["txNoAccount", xdr.void()],
      ["txInsufficientFee", xdr.void()],
      ["txBadAuthExtra", xdr.void()],
      ["txInternalError", xdr.void()],
      ["txNotSupported", xdr.void()],
      ["txBadSponsorship", xdr.void()],
      ["txBadMinSeqAgeOrGap", xdr.void()],
      ["txMalformed", xdr.void()],
      ["txSorobanInvalid", xdr.void()],
      ["txFrozenKeyAccessed", xdr.void()]
    ],
    arms: {
      results: xdr.varArray(xdr.lookup("OperationResult"), 2147483647)
    }
  });
  xdr.union("InnerTransactionResultExt", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [[0, xdr.void()]],
    arms: {}
  });
  xdr.struct("InnerTransactionResult", [
    ["feeCharged", xdr.lookup("Int64")],
    ["result", xdr.lookup("InnerTransactionResultResult")],
    ["ext", xdr.lookup("InnerTransactionResultExt")]
  ]);
  xdr.struct("InnerTransactionResultPair", [
    ["transactionHash", xdr.lookup("Hash")],
    ["result", xdr.lookup("InnerTransactionResult")]
  ]);
  xdr.union("TransactionResultResult", {
    switchOn: xdr.lookup("TransactionResultCode"),
    switchName: "code",
    switches: [
      ["txFeeBumpInnerSuccess", "innerResultPair"],
      ["txFeeBumpInnerFailed", "innerResultPair"],
      ["txSuccess", "results"],
      ["txFailed", "results"],
      ["txTooEarly", xdr.void()],
      ["txTooLate", xdr.void()],
      ["txMissingOperation", xdr.void()],
      ["txBadSeq", xdr.void()],
      ["txBadAuth", xdr.void()],
      ["txInsufficientBalance", xdr.void()],
      ["txNoAccount", xdr.void()],
      ["txInsufficientFee", xdr.void()],
      ["txBadAuthExtra", xdr.void()],
      ["txInternalError", xdr.void()],
      ["txNotSupported", xdr.void()],
      ["txBadSponsorship", xdr.void()],
      ["txBadMinSeqAgeOrGap", xdr.void()],
      ["txMalformed", xdr.void()],
      ["txSorobanInvalid", xdr.void()],
      ["txFrozenKeyAccessed", xdr.void()]
    ],
    arms: {
      innerResultPair: xdr.lookup("InnerTransactionResultPair"),
      results: xdr.varArray(xdr.lookup("OperationResult"), 2147483647)
    }
  });
  xdr.union("TransactionResultExt", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [[0, xdr.void()]],
    arms: {}
  });
  xdr.struct("TransactionResult", [
    ["feeCharged", xdr.lookup("Int64")],
    ["result", xdr.lookup("TransactionResultResult")],
    ["ext", xdr.lookup("TransactionResultExt")]
  ]);
  xdr.typedef("Hash", xdr.opaque(32));
  xdr.typedef("Uint256", xdr.opaque(32));
  xdr.typedef("Uint32", xdr.uint());
  xdr.typedef("Int32", xdr.int());
  xdr.typedef("Uint64", xdr.uhyper());
  xdr.typedef("Int64", xdr.hyper());
  xdr.typedef("TimePoint", xdr.lookup("Uint64"));
  xdr.typedef("Duration", xdr.lookup("Uint64"));
  xdr.union("ExtensionPoint", {
    switchOn: xdr.int(),
    switchName: "v",
    switches: [[0, xdr.void()]],
    arms: {}
  });
  xdr.enum("CryptoKeyType", {
    keyTypeEd25519: 0,
    keyTypePreAuthTx: 1,
    keyTypeHashX: 2,
    keyTypeEd25519SignedPayload: 3,
    keyTypeMuxedEd25519: 256
  });
  xdr.enum("PublicKeyType", {
    publicKeyTypeEd25519: 0
  });
  xdr.enum("SignerKeyType", {
    signerKeyTypeEd25519: 0,
    signerKeyTypePreAuthTx: 1,
    signerKeyTypeHashX: 2,
    signerKeyTypeEd25519SignedPayload: 3
  });
  xdr.union("PublicKey", {
    switchOn: xdr.lookup("PublicKeyType"),
    switchName: "type",
    switches: [["publicKeyTypeEd25519", "ed25519"]],
    arms: {
      ed25519: xdr.lookup("Uint256")
    }
  });
  xdr.struct("SignerKeyEd25519SignedPayload", [
    ["ed25519", xdr.lookup("Uint256")],
    ["payload", xdr.varOpaque(64)]
  ]);
  xdr.union("SignerKey", {
    switchOn: xdr.lookup("SignerKeyType"),
    switchName: "type",
    switches: [
      ["signerKeyTypeEd25519", "ed25519"],
      ["signerKeyTypePreAuthTx", "preAuthTx"],
      ["signerKeyTypeHashX", "hashX"],
      ["signerKeyTypeEd25519SignedPayload", "ed25519SignedPayload"]
    ],
    arms: {
      ed25519: xdr.lookup("Uint256"),
      preAuthTx: xdr.lookup("Uint256"),
      hashX: xdr.lookup("Uint256"),
      ed25519SignedPayload: xdr.lookup("SignerKeyEd25519SignedPayload")
    }
  });
  xdr.typedef("Signature", xdr.varOpaque(64));
  xdr.typedef("SignatureHint", xdr.opaque(4));
  xdr.typedef("NodeId", xdr.lookup("PublicKey"));
  xdr.typedef("AccountId", xdr.lookup("PublicKey"));
  xdr.typedef("ContractId", xdr.lookup("Hash"));
  xdr.struct("Curve25519Secret", [["key", xdr.opaque(32)]]);
  xdr.struct("Curve25519Public", [["key", xdr.opaque(32)]]);
  xdr.struct("HmacSha256Key", [["key", xdr.opaque(32)]]);
  xdr.struct("HmacSha256Mac", [["mac", xdr.opaque(32)]]);
  xdr.struct("ShortHashSeed", [["seed", xdr.opaque(16)]]);
  xdr.enum("BinaryFuseFilterType", {
    binaryFuseFilter8Bit: 0,
    binaryFuseFilter16Bit: 1,
    binaryFuseFilter32Bit: 2
  });
  xdr.struct("SerializedBinaryFuseFilter", [
    ["type", xdr.lookup("BinaryFuseFilterType")],
    ["inputHashSeed", xdr.lookup("ShortHashSeed")],
    ["filterSeed", xdr.lookup("ShortHashSeed")],
    ["segmentLength", xdr.lookup("Uint32")],
    ["segementLengthMask", xdr.lookup("Uint32")],
    ["segmentCount", xdr.lookup("Uint32")],
    ["segmentCountLength", xdr.lookup("Uint32")],
    ["fingerprintLength", xdr.lookup("Uint32")],
    ["fingerprints", xdr.varOpaque()]
  ]);
  xdr.typedef("PoolId", xdr.lookup("Hash"));
  xdr.enum("ClaimableBalanceIdType", {
    claimableBalanceIdTypeV0: 0
  });
  xdr.union("ClaimableBalanceId", {
    switchOn: xdr.lookup("ClaimableBalanceIdType"),
    switchName: "type",
    switches: [["claimableBalanceIdTypeV0", "v0"]],
    arms: {
      v0: xdr.lookup("Hash")
    }
  });
  xdr.enum("ScValType", {
    scvBool: 0,
    scvVoid: 1,
    scvError: 2,
    scvU32: 3,
    scvI32: 4,
    scvU64: 5,
    scvI64: 6,
    scvTimepoint: 7,
    scvDuration: 8,
    scvU128: 9,
    scvI128: 10,
    scvU256: 11,
    scvI256: 12,
    scvBytes: 13,
    scvString: 14,
    scvSymbol: 15,
    scvVec: 16,
    scvMap: 17,
    scvAddress: 18,
    scvContractInstance: 19,
    scvLedgerKeyContractInstance: 20,
    scvLedgerKeyNonce: 21
  });
  xdr.enum("ScErrorType", {
    sceContract: 0,
    sceWasmVm: 1,
    sceContext: 2,
    sceStorage: 3,
    sceObject: 4,
    sceCrypto: 5,
    sceEvents: 6,
    sceBudget: 7,
    sceValue: 8,
    sceAuth: 9
  });
  xdr.enum("ScErrorCode", {
    scecArithDomain: 0,
    scecIndexBounds: 1,
    scecInvalidInput: 2,
    scecMissingValue: 3,
    scecExistingValue: 4,
    scecExceededLimit: 5,
    scecInvalidAction: 6,
    scecInternalError: 7,
    scecUnexpectedType: 8,
    scecUnexpectedSize: 9
  });
  xdr.union("ScError", {
    switchOn: xdr.lookup("ScErrorType"),
    switchName: "type",
    switches: [
      ["sceContract", "contractCode"],
      ["sceWasmVm", "code"],
      ["sceContext", "code"],
      ["sceStorage", "code"],
      ["sceObject", "code"],
      ["sceCrypto", "code"],
      ["sceEvents", "code"],
      ["sceBudget", "code"],
      ["sceValue", "code"],
      ["sceAuth", "code"]
    ],
    arms: {
      contractCode: xdr.lookup("Uint32"),
      code: xdr.lookup("ScErrorCode")
    }
  });
  xdr.struct("UInt128Parts", [
    ["hi", xdr.lookup("Uint64")],
    ["lo", xdr.lookup("Uint64")]
  ]);
  xdr.struct("Int128Parts", [
    ["hi", xdr.lookup("Int64")],
    ["lo", xdr.lookup("Uint64")]
  ]);
  xdr.struct("UInt256Parts", [
    ["hiHi", xdr.lookup("Uint64")],
    ["hiLo", xdr.lookup("Uint64")],
    ["loHi", xdr.lookup("Uint64")],
    ["loLo", xdr.lookup("Uint64")]
  ]);
  xdr.struct("Int256Parts", [
    ["hiHi", xdr.lookup("Int64")],
    ["hiLo", xdr.lookup("Uint64")],
    ["loHi", xdr.lookup("Uint64")],
    ["loLo", xdr.lookup("Uint64")]
  ]);
  xdr.enum("ContractExecutableType", {
    contractExecutableWasm: 0,
    contractExecutableStellarAsset: 1
  });
  xdr.union("ContractExecutable", {
    switchOn: xdr.lookup("ContractExecutableType"),
    switchName: "type",
    switches: [
      ["contractExecutableWasm", "wasmHash"],
      ["contractExecutableStellarAsset", xdr.void()]
    ],
    arms: {
      wasmHash: xdr.lookup("Hash")
    }
  });
  xdr.enum("ScAddressType", {
    scAddressTypeAccount: 0,
    scAddressTypeContract: 1,
    scAddressTypeMuxedAccount: 2,
    scAddressTypeClaimableBalance: 3,
    scAddressTypeLiquidityPool: 4
  });
  xdr.struct("MuxedEd25519Account", [
    ["id", xdr.lookup("Uint64")],
    ["ed25519", xdr.lookup("Uint256")]
  ]);
  xdr.union("ScAddress", {
    switchOn: xdr.lookup("ScAddressType"),
    switchName: "type",
    switches: [
      ["scAddressTypeAccount", "accountId"],
      ["scAddressTypeContract", "contractId"],
      ["scAddressTypeMuxedAccount", "muxedAccount"],
      ["scAddressTypeClaimableBalance", "claimableBalanceId"],
      ["scAddressTypeLiquidityPool", "liquidityPoolId"]
    ],
    arms: {
      accountId: xdr.lookup("AccountId"),
      contractId: xdr.lookup("ContractId"),
      muxedAccount: xdr.lookup("MuxedEd25519Account"),
      claimableBalanceId: xdr.lookup("ClaimableBalanceId"),
      liquidityPoolId: xdr.lookup("PoolId")
    }
  });
  xdr.const("SCSYMBOL_LIMIT", 32);
  xdr.typedef("ScVec", xdr.varArray(xdr.lookup("ScVal"), 2147483647));
  xdr.typedef("ScMap", xdr.varArray(xdr.lookup("ScMapEntry"), 2147483647));
  xdr.typedef("ScBytes", xdr.varOpaque());
  xdr.typedef("ScString", xdr.string());
  xdr.typedef("ScSymbol", xdr.string(SCSYMBOL_LIMIT));
  xdr.struct("ScNonceKey", [["nonce", xdr.lookup("Int64")]]);
  xdr.struct("ScContractInstance", [
    ["executable", xdr.lookup("ContractExecutable")],
    ["storage", xdr.option(xdr.lookup("ScMap"))]
  ]);
  xdr.union("ScVal", {
    switchOn: xdr.lookup("ScValType"),
    switchName: "type",
    switches: [
      ["scvBool", "b"],
      ["scvVoid", xdr.void()],
      ["scvError", "error"],
      ["scvU32", "u32"],
      ["scvI32", "i32"],
      ["scvU64", "u64"],
      ["scvI64", "i64"],
      ["scvTimepoint", "timepoint"],
      ["scvDuration", "duration"],
      ["scvU128", "u128"],
      ["scvI128", "i128"],
      ["scvU256", "u256"],
      ["scvI256", "i256"],
      ["scvBytes", "bytes"],
      ["scvString", "str"],
      ["scvSymbol", "sym"],
      ["scvVec", "vec"],
      ["scvMap", "map"],
      ["scvAddress", "address"],
      ["scvContractInstance", "instance"],
      ["scvLedgerKeyContractInstance", xdr.void()],
      ["scvLedgerKeyNonce", "nonceKey"]
    ],
    arms: {
      b: xdr.bool(),
      error: xdr.lookup("ScError"),
      u32: xdr.lookup("Uint32"),
      i32: xdr.lookup("Int32"),
      u64: xdr.lookup("Uint64"),
      i64: xdr.lookup("Int64"),
      timepoint: xdr.lookup("TimePoint"),
      duration: xdr.lookup("Duration"),
      u128: xdr.lookup("UInt128Parts"),
      i128: xdr.lookup("Int128Parts"),
      u256: xdr.lookup("UInt256Parts"),
      i256: xdr.lookup("Int256Parts"),
      bytes: xdr.lookup("ScBytes"),
      str: xdr.lookup("ScString"),
      sym: xdr.lookup("ScSymbol"),
      vec: xdr.option(xdr.lookup("ScVec")),
      map: xdr.option(xdr.lookup("ScMap")),
      address: xdr.lookup("ScAddress"),
      instance: xdr.lookup("ScContractInstance"),
      nonceKey: xdr.lookup("ScNonceKey")
    }
  });
  xdr.struct("ScMapEntry", [
    ["key", xdr.lookup("ScVal")],
    ["val", xdr.lookup("ScVal")]
  ]);
  xdr.enum("ScEnvMetaKind", {
    scEnvMetaKindInterfaceVersion: 0
  });
  xdr.struct("ScEnvMetaEntryInterfaceVersion", [
    ["protocol", xdr.lookup("Uint32")],
    ["preRelease", xdr.lookup("Uint32")]
  ]);
  xdr.union("ScEnvMetaEntry", {
    switchOn: xdr.lookup("ScEnvMetaKind"),
    switchName: "kind",
    switches: [["scEnvMetaKindInterfaceVersion", "interfaceVersion"]],
    arms: {
      interfaceVersion: xdr.lookup("ScEnvMetaEntryInterfaceVersion")
    }
  });
  xdr.struct("ScMetaV0", [
    ["key", xdr.string()],
    ["val", xdr.string()]
  ]);
  xdr.enum("ScMetaKind", {
    scMetaV0: 0
  });
  xdr.union("ScMetaEntry", {
    switchOn: xdr.lookup("ScMetaKind"),
    switchName: "kind",
    switches: [["scMetaV0", "v0"]],
    arms: {
      v0: xdr.lookup("ScMetaV0")
    }
  });
  xdr.const("SC_SPEC_DOC_LIMIT", 1024);
  xdr.enum("ScSpecType", {
    scSpecTypeVal: 0,
    scSpecTypeBool: 1,
    scSpecTypeVoid: 2,
    scSpecTypeError: 3,
    scSpecTypeU32: 4,
    scSpecTypeI32: 5,
    scSpecTypeU64: 6,
    scSpecTypeI64: 7,
    scSpecTypeTimepoint: 8,
    scSpecTypeDuration: 9,
    scSpecTypeU128: 10,
    scSpecTypeI128: 11,
    scSpecTypeU256: 12,
    scSpecTypeI256: 13,
    scSpecTypeBytes: 14,
    scSpecTypeString: 16,
    scSpecTypeSymbol: 17,
    scSpecTypeAddress: 19,
    scSpecTypeMuxedAddress: 20,
    scSpecTypeOption: 1e3,
    scSpecTypeResult: 1001,
    scSpecTypeVec: 1002,
    scSpecTypeMap: 1004,
    scSpecTypeTuple: 1005,
    scSpecTypeBytesN: 1006,
    scSpecTypeUdt: 2e3
  });
  xdr.struct("ScSpecTypeOption", [["valueType", xdr.lookup("ScSpecTypeDef")]]);
  xdr.struct("ScSpecTypeResult", [
    ["okType", xdr.lookup("ScSpecTypeDef")],
    ["errorType", xdr.lookup("ScSpecTypeDef")]
  ]);
  xdr.struct("ScSpecTypeVec", [["elementType", xdr.lookup("ScSpecTypeDef")]]);
  xdr.struct("ScSpecTypeMap", [
    ["keyType", xdr.lookup("ScSpecTypeDef")],
    ["valueType", xdr.lookup("ScSpecTypeDef")]
  ]);
  xdr.struct("ScSpecTypeTuple", [
    ["valueTypes", xdr.varArray(xdr.lookup("ScSpecTypeDef"), 12)]
  ]);
  xdr.struct("ScSpecTypeBytesN", [["n", xdr.lookup("Uint32")]]);
  xdr.struct("ScSpecTypeUdt", [["name", xdr.string(60)]]);
  xdr.union("ScSpecTypeDef", {
    switchOn: xdr.lookup("ScSpecType"),
    switchName: "type",
    switches: [
      ["scSpecTypeVal", xdr.void()],
      ["scSpecTypeBool", xdr.void()],
      ["scSpecTypeVoid", xdr.void()],
      ["scSpecTypeError", xdr.void()],
      ["scSpecTypeU32", xdr.void()],
      ["scSpecTypeI32", xdr.void()],
      ["scSpecTypeU64", xdr.void()],
      ["scSpecTypeI64", xdr.void()],
      ["scSpecTypeTimepoint", xdr.void()],
      ["scSpecTypeDuration", xdr.void()],
      ["scSpecTypeU128", xdr.void()],
      ["scSpecTypeI128", xdr.void()],
      ["scSpecTypeU256", xdr.void()],
      ["scSpecTypeI256", xdr.void()],
      ["scSpecTypeBytes", xdr.void()],
      ["scSpecTypeString", xdr.void()],
      ["scSpecTypeSymbol", xdr.void()],
      ["scSpecTypeAddress", xdr.void()],
      ["scSpecTypeMuxedAddress", xdr.void()],
      ["scSpecTypeOption", "option"],
      ["scSpecTypeResult", "result"],
      ["scSpecTypeVec", "vec"],
      ["scSpecTypeMap", "map"],
      ["scSpecTypeTuple", "tuple"],
      ["scSpecTypeBytesN", "bytesN"],
      ["scSpecTypeUdt", "udt"]
    ],
    arms: {
      option: xdr.lookup("ScSpecTypeOption"),
      result: xdr.lookup("ScSpecTypeResult"),
      vec: xdr.lookup("ScSpecTypeVec"),
      map: xdr.lookup("ScSpecTypeMap"),
      tuple: xdr.lookup("ScSpecTypeTuple"),
      bytesN: xdr.lookup("ScSpecTypeBytesN"),
      udt: xdr.lookup("ScSpecTypeUdt")
    }
  });
  xdr.struct("ScSpecUdtStructFieldV0", [
    ["doc", xdr.string(SC_SPEC_DOC_LIMIT)],
    ["name", xdr.string(30)],
    ["type", xdr.lookup("ScSpecTypeDef")]
  ]);
  xdr.struct("ScSpecUdtStructV0", [
    ["doc", xdr.string(SC_SPEC_DOC_LIMIT)],
    ["lib", xdr.string(80)],
    ["name", xdr.string(60)],
    ["fields", xdr.varArray(xdr.lookup("ScSpecUdtStructFieldV0"), 2147483647)]
  ]);
  xdr.struct("ScSpecUdtUnionCaseVoidV0", [
    ["doc", xdr.string(SC_SPEC_DOC_LIMIT)],
    ["name", xdr.string(60)]
  ]);
  xdr.struct("ScSpecUdtUnionCaseTupleV0", [
    ["doc", xdr.string(SC_SPEC_DOC_LIMIT)],
    ["name", xdr.string(60)],
    ["type", xdr.varArray(xdr.lookup("ScSpecTypeDef"), 2147483647)]
  ]);
  xdr.enum("ScSpecUdtUnionCaseV0Kind", {
    scSpecUdtUnionCaseVoidV0: 0,
    scSpecUdtUnionCaseTupleV0: 1
  });
  xdr.union("ScSpecUdtUnionCaseV0", {
    switchOn: xdr.lookup("ScSpecUdtUnionCaseV0Kind"),
    switchName: "kind",
    switches: [
      ["scSpecUdtUnionCaseVoidV0", "voidCase"],
      ["scSpecUdtUnionCaseTupleV0", "tupleCase"]
    ],
    arms: {
      voidCase: xdr.lookup("ScSpecUdtUnionCaseVoidV0"),
      tupleCase: xdr.lookup("ScSpecUdtUnionCaseTupleV0")
    }
  });
  xdr.struct("ScSpecUdtUnionV0", [
    ["doc", xdr.string(SC_SPEC_DOC_LIMIT)],
    ["lib", xdr.string(80)],
    ["name", xdr.string(60)],
    ["cases", xdr.varArray(xdr.lookup("ScSpecUdtUnionCaseV0"), 2147483647)]
  ]);
  xdr.struct("ScSpecUdtEnumCaseV0", [
    ["doc", xdr.string(SC_SPEC_DOC_LIMIT)],
    ["name", xdr.string(60)],
    ["value", xdr.lookup("Uint32")]
  ]);
  xdr.struct("ScSpecUdtEnumV0", [
    ["doc", xdr.string(SC_SPEC_DOC_LIMIT)],
    ["lib", xdr.string(80)],
    ["name", xdr.string(60)],
    ["cases", xdr.varArray(xdr.lookup("ScSpecUdtEnumCaseV0"), 2147483647)]
  ]);
  xdr.struct("ScSpecUdtErrorEnumCaseV0", [
    ["doc", xdr.string(SC_SPEC_DOC_LIMIT)],
    ["name", xdr.string(60)],
    ["value", xdr.lookup("Uint32")]
  ]);
  xdr.struct("ScSpecUdtErrorEnumV0", [
    ["doc", xdr.string(SC_SPEC_DOC_LIMIT)],
    ["lib", xdr.string(80)],
    ["name", xdr.string(60)],
    ["cases", xdr.varArray(xdr.lookup("ScSpecUdtErrorEnumCaseV0"), 2147483647)]
  ]);
  xdr.struct("ScSpecFunctionInputV0", [
    ["doc", xdr.string(SC_SPEC_DOC_LIMIT)],
    ["name", xdr.string(30)],
    ["type", xdr.lookup("ScSpecTypeDef")]
  ]);
  xdr.struct("ScSpecFunctionV0", [
    ["doc", xdr.string(SC_SPEC_DOC_LIMIT)],
    ["name", xdr.lookup("ScSymbol")],
    ["inputs", xdr.varArray(xdr.lookup("ScSpecFunctionInputV0"), 2147483647)],
    ["outputs", xdr.varArray(xdr.lookup("ScSpecTypeDef"), 1)]
  ]);
  xdr.enum("ScSpecEventParamLocationV0", {
    scSpecEventParamLocationData: 0,
    scSpecEventParamLocationTopicList: 1
  });
  xdr.struct("ScSpecEventParamV0", [
    ["doc", xdr.string(SC_SPEC_DOC_LIMIT)],
    ["name", xdr.string(30)],
    ["type", xdr.lookup("ScSpecTypeDef")],
    ["location", xdr.lookup("ScSpecEventParamLocationV0")]
  ]);
  xdr.enum("ScSpecEventDataFormat", {
    scSpecEventDataFormatSingleValue: 0,
    scSpecEventDataFormatVec: 1,
    scSpecEventDataFormatMap: 2
  });
  xdr.struct("ScSpecEventV0", [
    ["doc", xdr.string(SC_SPEC_DOC_LIMIT)],
    ["lib", xdr.string(80)],
    ["name", xdr.lookup("ScSymbol")],
    ["prefixTopics", xdr.varArray(xdr.lookup("ScSymbol"), 2)],
    ["params", xdr.varArray(xdr.lookup("ScSpecEventParamV0"), 2147483647)],
    ["dataFormat", xdr.lookup("ScSpecEventDataFormat")]
  ]);
  xdr.enum("ScSpecEntryKind", {
    scSpecEntryFunctionV0: 0,
    scSpecEntryUdtStructV0: 1,
    scSpecEntryUdtUnionV0: 2,
    scSpecEntryUdtEnumV0: 3,
    scSpecEntryUdtErrorEnumV0: 4,
    scSpecEntryEventV0: 5
  });
  xdr.union("ScSpecEntry", {
    switchOn: xdr.lookup("ScSpecEntryKind"),
    switchName: "kind",
    switches: [
      ["scSpecEntryFunctionV0", "functionV0"],
      ["scSpecEntryUdtStructV0", "udtStructV0"],
      ["scSpecEntryUdtUnionV0", "udtUnionV0"],
      ["scSpecEntryUdtEnumV0", "udtEnumV0"],
      ["scSpecEntryUdtErrorEnumV0", "udtErrorEnumV0"],
      ["scSpecEntryEventV0", "eventV0"]
    ],
    arms: {
      functionV0: xdr.lookup("ScSpecFunctionV0"),
      udtStructV0: xdr.lookup("ScSpecUdtStructV0"),
      udtUnionV0: xdr.lookup("ScSpecUdtUnionV0"),
      udtEnumV0: xdr.lookup("ScSpecUdtEnumV0"),
      udtErrorEnumV0: xdr.lookup("ScSpecUdtErrorEnumV0"),
      eventV0: xdr.lookup("ScSpecEventV0")
    }
  });
  xdr.typedef("EncodedLedgerKey", xdr.varOpaque());
  xdr.struct("ConfigSettingContractExecutionLanesV0", [
    ["ledgerMaxTxCount", xdr.lookup("Uint32")]
  ]);
  xdr.struct("ConfigSettingContractComputeV0", [
    ["ledgerMaxInstructions", xdr.lookup("Int64")],
    ["txMaxInstructions", xdr.lookup("Int64")],
    ["feeRatePerInstructionsIncrement", xdr.lookup("Int64")],
    ["txMemoryLimit", xdr.lookup("Uint32")]
  ]);
  xdr.struct("ConfigSettingContractParallelComputeV0", [
    ["ledgerMaxDependentTxClusters", xdr.lookup("Uint32")]
  ]);
  xdr.struct("ConfigSettingContractLedgerCostV0", [
    ["ledgerMaxDiskReadEntries", xdr.lookup("Uint32")],
    ["ledgerMaxDiskReadBytes", xdr.lookup("Uint32")],
    ["ledgerMaxWriteLedgerEntries", xdr.lookup("Uint32")],
    ["ledgerMaxWriteBytes", xdr.lookup("Uint32")],
    ["txMaxDiskReadEntries", xdr.lookup("Uint32")],
    ["txMaxDiskReadBytes", xdr.lookup("Uint32")],
    ["txMaxWriteLedgerEntries", xdr.lookup("Uint32")],
    ["txMaxWriteBytes", xdr.lookup("Uint32")],
    ["feeDiskReadLedgerEntry", xdr.lookup("Int64")],
    ["feeWriteLedgerEntry", xdr.lookup("Int64")],
    ["feeDiskRead1Kb", xdr.lookup("Int64")],
    ["sorobanStateTargetSizeBytes", xdr.lookup("Int64")],
    ["rentFee1KbSorobanStateSizeLow", xdr.lookup("Int64")],
    ["rentFee1KbSorobanStateSizeHigh", xdr.lookup("Int64")],
    ["sorobanStateRentFeeGrowthFactor", xdr.lookup("Uint32")]
  ]);
  xdr.struct("ConfigSettingContractLedgerCostExtV0", [
    ["txMaxFootprintEntries", xdr.lookup("Uint32")],
    ["feeWrite1Kb", xdr.lookup("Int64")]
  ]);
  xdr.struct("ConfigSettingContractHistoricalDataV0", [
    ["feeHistorical1Kb", xdr.lookup("Int64")]
  ]);
  xdr.struct("ConfigSettingContractEventsV0", [
    ["txMaxContractEventsSizeBytes", xdr.lookup("Uint32")],
    ["feeContractEvents1Kb", xdr.lookup("Int64")]
  ]);
  xdr.struct("ConfigSettingContractBandwidthV0", [
    ["ledgerMaxTxsSizeBytes", xdr.lookup("Uint32")],
    ["txMaxSizeBytes", xdr.lookup("Uint32")],
    ["feeTxSize1Kb", xdr.lookup("Int64")]
  ]);
  xdr.enum("ContractCostType", {
    wasmInsnExec: 0,
    memAlloc: 1,
    memCpy: 2,
    memCmp: 3,
    dispatchHostFunction: 4,
    visitObject: 5,
    valSer: 6,
    valDeser: 7,
    computeSha256Hash: 8,
    computeEd25519PubKey: 9,
    verifyEd25519Sig: 10,
    vmInstantiation: 11,
    vmCachedInstantiation: 12,
    invokeVmFunction: 13,
    computeKeccak256Hash: 14,
    decodeEcdsaCurve256Sig: 15,
    recoverEcdsaSecp256k1Key: 16,
    int256AddSub: 17,
    int256Mul: 18,
    int256Div: 19,
    int256Pow: 20,
    int256Shift: 21,
    chaCha20DrawBytes: 22,
    parseWasmInstructions: 23,
    parseWasmFunctions: 24,
    parseWasmGlobals: 25,
    parseWasmTableEntries: 26,
    parseWasmTypes: 27,
    parseWasmDataSegments: 28,
    parseWasmElemSegments: 29,
    parseWasmImports: 30,
    parseWasmExports: 31,
    parseWasmDataSegmentBytes: 32,
    instantiateWasmInstructions: 33,
    instantiateWasmFunctions: 34,
    instantiateWasmGlobals: 35,
    instantiateWasmTableEntries: 36,
    instantiateWasmTypes: 37,
    instantiateWasmDataSegments: 38,
    instantiateWasmElemSegments: 39,
    instantiateWasmImports: 40,
    instantiateWasmExports: 41,
    instantiateWasmDataSegmentBytes: 42,
    sec1DecodePointUncompressed: 43,
    verifyEcdsaSecp256r1Sig: 44,
    bls12381EncodeFp: 45,
    bls12381DecodeFp: 46,
    bls12381G1CheckPointOnCurve: 47,
    bls12381G1CheckPointInSubgroup: 48,
    bls12381G2CheckPointOnCurve: 49,
    bls12381G2CheckPointInSubgroup: 50,
    bls12381G1ProjectiveToAffine: 51,
    bls12381G2ProjectiveToAffine: 52,
    bls12381G1Add: 53,
    bls12381G1Mul: 54,
    bls12381G1Msm: 55,
    bls12381MapFpToG1: 56,
    bls12381HashToG1: 57,
    bls12381G2Add: 58,
    bls12381G2Mul: 59,
    bls12381G2Msm: 60,
    bls12381MapFp2ToG2: 61,
    bls12381HashToG2: 62,
    bls12381Pairing: 63,
    bls12381FrFromU256: 64,
    bls12381FrToU256: 65,
    bls12381FrAddSub: 66,
    bls12381FrMul: 67,
    bls12381FrPow: 68,
    bls12381FrInv: 69,
    bn254EncodeFp: 70,
    bn254DecodeFp: 71,
    bn254G1CheckPointOnCurve: 72,
    bn254G2CheckPointOnCurve: 73,
    bn254G2CheckPointInSubgroup: 74,
    bn254G1ProjectiveToAffine: 75,
    bn254G1Add: 76,
    bn254G1Mul: 77,
    bn254Pairing: 78,
    bn254FrFromU256: 79,
    bn254FrToU256: 80,
    bn254FrAddSub: 81,
    bn254FrMul: 82,
    bn254FrPow: 83,
    bn254FrInv: 84,
    bn254G1Msm: 85
  });
  xdr.struct("ContractCostParamEntry", [
    ["ext", xdr.lookup("ExtensionPoint")],
    ["constTerm", xdr.lookup("Int64")],
    ["linearTerm", xdr.lookup("Int64")]
  ]);
  xdr.struct("StateArchivalSettings", [
    ["maxEntryTtl", xdr.lookup("Uint32")],
    ["minTemporaryTtl", xdr.lookup("Uint32")],
    ["minPersistentTtl", xdr.lookup("Uint32")],
    ["persistentRentRateDenominator", xdr.lookup("Int64")],
    ["tempRentRateDenominator", xdr.lookup("Int64")],
    ["maxEntriesToArchive", xdr.lookup("Uint32")],
    ["liveSorobanStateSizeWindowSampleSize", xdr.lookup("Uint32")],
    ["liveSorobanStateSizeWindowSamplePeriod", xdr.lookup("Uint32")],
    ["evictionScanSize", xdr.lookup("Uint32")],
    ["startingEvictionScanLevel", xdr.lookup("Uint32")]
  ]);
  xdr.struct("EvictionIterator", [
    ["bucketListLevel", xdr.lookup("Uint32")],
    ["isCurrBucket", xdr.bool()],
    ["bucketFileOffset", xdr.lookup("Uint64")]
  ]);
  xdr.struct("ConfigSettingScpTiming", [
    ["ledgerTargetCloseTimeMilliseconds", xdr.lookup("Uint32")],
    ["nominationTimeoutInitialMilliseconds", xdr.lookup("Uint32")],
    ["nominationTimeoutIncrementMilliseconds", xdr.lookup("Uint32")],
    ["ballotTimeoutInitialMilliseconds", xdr.lookup("Uint32")],
    ["ballotTimeoutIncrementMilliseconds", xdr.lookup("Uint32")]
  ]);
  xdr.struct("FrozenLedgerKeys", [
    ["keys", xdr.varArray(xdr.lookup("EncodedLedgerKey"), 2147483647)]
  ]);
  xdr.struct("FrozenLedgerKeysDelta", [
    ["keysToFreeze", xdr.varArray(xdr.lookup("EncodedLedgerKey"), 2147483647)],
    [
      "keysToUnfreeze",
      xdr.varArray(xdr.lookup("EncodedLedgerKey"), 2147483647)
    ]
  ]);
  xdr.struct("FreezeBypassTxes", [
    ["txHashes", xdr.varArray(xdr.lookup("Hash"), 2147483647)]
  ]);
  xdr.struct("FreezeBypassTxsDelta", [
    ["addTxes", xdr.varArray(xdr.lookup("Hash"), 2147483647)],
    ["removeTxes", xdr.varArray(xdr.lookup("Hash"), 2147483647)]
  ]);
  xdr.const("CONTRACT_COST_COUNT_LIMIT", 1024);
  xdr.typedef(
    "ContractCostParams",
    xdr.varArray(
      xdr.lookup("ContractCostParamEntry"),
      xdr.lookup("CONTRACT_COST_COUNT_LIMIT")
    )
  );
  xdr.enum("ConfigSettingId", {
    configSettingContractMaxSizeBytes: 0,
    configSettingContractComputeV0: 1,
    configSettingContractLedgerCostV0: 2,
    configSettingContractHistoricalDataV0: 3,
    configSettingContractEventsV0: 4,
    configSettingContractBandwidthV0: 5,
    configSettingContractCostParamsCpuInstructions: 6,
    configSettingContractCostParamsMemoryBytes: 7,
    configSettingContractDataKeySizeBytes: 8,
    configSettingContractDataEntrySizeBytes: 9,
    configSettingStateArchival: 10,
    configSettingContractExecutionLanes: 11,
    configSettingLiveSorobanStateSizeWindow: 12,
    configSettingEvictionIterator: 13,
    configSettingContractParallelComputeV0: 14,
    configSettingContractLedgerCostExtV0: 15,
    configSettingScpTiming: 16,
    configSettingFrozenLedgerKeys: 17,
    configSettingFrozenLedgerKeysDelta: 18,
    configSettingFreezeBypassTxes: 19,
    configSettingFreezeBypassTxsDelta: 20
  });
  xdr.union("ConfigSettingEntry", {
    switchOn: xdr.lookup("ConfigSettingId"),
    switchName: "configSettingId",
    switches: [
      ["configSettingContractMaxSizeBytes", "contractMaxSizeBytes"],
      ["configSettingContractComputeV0", "contractCompute"],
      ["configSettingContractLedgerCostV0", "contractLedgerCost"],
      ["configSettingContractHistoricalDataV0", "contractHistoricalData"],
      ["configSettingContractEventsV0", "contractEvents"],
      ["configSettingContractBandwidthV0", "contractBandwidth"],
      [
        "configSettingContractCostParamsCpuInstructions",
        "contractCostParamsCpuInsns"
      ],
      [
        "configSettingContractCostParamsMemoryBytes",
        "contractCostParamsMemBytes"
      ],
      ["configSettingContractDataKeySizeBytes", "contractDataKeySizeBytes"],
      ["configSettingContractDataEntrySizeBytes", "contractDataEntrySizeBytes"],
      ["configSettingStateArchival", "stateArchivalSettings"],
      ["configSettingContractExecutionLanes", "contractExecutionLanes"],
      ["configSettingLiveSorobanStateSizeWindow", "liveSorobanStateSizeWindow"],
      ["configSettingEvictionIterator", "evictionIterator"],
      ["configSettingContractParallelComputeV0", "contractParallelCompute"],
      ["configSettingContractLedgerCostExtV0", "contractLedgerCostExt"],
      ["configSettingScpTiming", "contractScpTiming"],
      ["configSettingFrozenLedgerKeys", "frozenLedgerKeys"],
      ["configSettingFrozenLedgerKeysDelta", "frozenLedgerKeysDelta"],
      ["configSettingFreezeBypassTxes", "freezeBypassTxes"],
      ["configSettingFreezeBypassTxsDelta", "freezeBypassTxsDelta"]
    ],
    arms: {
      contractMaxSizeBytes: xdr.lookup("Uint32"),
      contractCompute: xdr.lookup("ConfigSettingContractComputeV0"),
      contractLedgerCost: xdr.lookup("ConfigSettingContractLedgerCostV0"),
      contractHistoricalData: xdr.lookup(
        "ConfigSettingContractHistoricalDataV0"
      ),
      contractEvents: xdr.lookup("ConfigSettingContractEventsV0"),
      contractBandwidth: xdr.lookup("ConfigSettingContractBandwidthV0"),
      contractCostParamsCpuInsns: xdr.lookup("ContractCostParams"),
      contractCostParamsMemBytes: xdr.lookup("ContractCostParams"),
      contractDataKeySizeBytes: xdr.lookup("Uint32"),
      contractDataEntrySizeBytes: xdr.lookup("Uint32"),
      stateArchivalSettings: xdr.lookup("StateArchivalSettings"),
      contractExecutionLanes: xdr.lookup(
        "ConfigSettingContractExecutionLanesV0"
      ),
      liveSorobanStateSizeWindow: xdr.varArray(
        xdr.lookup("Uint64"),
        2147483647
      ),
      evictionIterator: xdr.lookup("EvictionIterator"),
      contractParallelCompute: xdr.lookup(
        "ConfigSettingContractParallelComputeV0"
      ),
      contractLedgerCostExt: xdr.lookup("ConfigSettingContractLedgerCostExtV0"),
      contractScpTiming: xdr.lookup("ConfigSettingScpTiming"),
      frozenLedgerKeys: xdr.lookup("FrozenLedgerKeys"),
      frozenLedgerKeysDelta: xdr.lookup("FrozenLedgerKeysDelta"),
      freezeBypassTxes: xdr.lookup("FreezeBypassTxes"),
      freezeBypassTxsDelta: xdr.lookup("FreezeBypassTxsDelta")
    }
  });
  xdr.struct("LedgerCloseMetaBatch", [
    ["startSequence", xdr.lookup("Uint32")],
    ["endSequence", xdr.lookup("Uint32")],
    [
      "ledgerCloseMeta",
      xdr.varArray(xdr.lookup("LedgerCloseMeta"), 2147483647)
    ]
  ]);
});

// node_modules/@noble/hashes/utils.js
function isBytes(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in a && a.BYTES_PER_ELEMENT === 1;
}
function abytes(value, length, title = "") {
  const bytes = isBytes(value);
  const len = value?.length;
  const needsLen = length !== void 0;
  if (!bytes || needsLen && len !== length) {
    const prefix = title && `"${title}" `;
    const ofLen = needsLen ? ` of length ${length}` : "";
    const got = bytes ? `length=${len}` : `type=${typeof value}`;
    const message = prefix + "expected Uint8Array" + ofLen + ", got " + got;
    if (!bytes)
      throw new TypeError(message);
    throw new RangeError(message);
  }
  return value;
}
function aexists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function aoutput(out, instance) {
  abytes(out, void 0, "digestInto() output");
  const min = instance.outputLen;
  if (out.length < min) {
    throw new RangeError('"digestInto() output" expected to be of length >=' + min);
  }
}
function clean(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
function createView(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr(word, shift) {
  return word << 32 - shift | word >>> shift;
}
function createHasher(hashCons, info = {}) {
  const hashC = (msg, opts) => hashCons(opts).update(msg).digest();
  const tmp = hashCons(void 0);
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.canXOF = tmp.canXOF;
  hashC.create = (opts) => hashCons(opts);
  Object.assign(hashC, info);
  return Object.freeze(hashC);
}
var oidNist = (suffix) => ({
  // Current NIST hashAlgs suffixes used here fit in one DER subidentifier octet.
  // Larger suffix values would need base-128 OID encoding and a different length byte.
  oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, suffix])
});

// node_modules/@noble/hashes/_md.js
function Chi(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj(a, b, c) {
  return a & b ^ a & c ^ b & c;
}
var HashMD = class {
  blockLen;
  outputLen;
  canXOF = false;
  padOffset;
  isLE;
  // For partial updates less than block size
  buffer;
  view;
  finished = false;
  length = 0;
  pos = 0;
  destroyed = false;
  constructor(blockLen, outputLen, padOffset, isLE) {
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.padOffset = padOffset;
    this.isLE = isLE;
    this.buffer = new Uint8Array(blockLen);
    this.view = createView(this.buffer);
  }
  update(data) {
    aexists(this);
    abytes(data);
    const { view, buffer, blockLen } = this;
    const len = data.length;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView = createView(data);
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        continue;
      }
      buffer.set(data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(view, 0);
        this.pos = 0;
      }
    }
    this.length += data.length;
    this.roundClean();
    return this;
  }
  digestInto(out) {
    aexists(this);
    aoutput(out, this);
    this.finished = true;
    const { buffer, view, blockLen, isLE } = this;
    let { pos } = this;
    buffer[pos++] = 128;
    clean(this.buffer.subarray(pos));
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0);
      pos = 0;
    }
    for (let i = pos; i < blockLen; i++)
      buffer[i] = 0;
    view.setBigUint64(blockLen - 8, BigInt(this.length * 8), isLE);
    this.process(view, 0);
    const oview = createView(out);
    const len = this.outputLen;
    if (len % 4)
      throw new Error("_sha2: outputLen must be aligned to 32bit");
    const outLen = len / 4;
    const state = this.get();
    if (outLen > state.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let i = 0; i < outLen; i++)
      oview.setUint32(4 * i, state[i], isLE);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneInto(to) {
    to ||= new this.constructor();
    to.set(...this.get());
    const { blockLen, buffer, length, finished, destroyed, pos } = this;
    to.destroyed = destroyed;
    to.finished = finished;
    to.length = length;
    to.pos = pos;
    if (length % blockLen)
      to.buffer.set(buffer);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
};
var SHA256_IV = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);
var SHA512_IV = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  4089235720,
  3144134277,
  2227873595,
  1013904242,
  4271175723,
  2773480762,
  1595750129,
  1359893119,
  2917565137,
  2600822924,
  725511199,
  528734635,
  4215389547,
  1541459225,
  327033209
]);

// node_modules/@noble/hashes/_u64.js
var U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
var _32n = /* @__PURE__ */ BigInt(32);
function fromBig(n, le = false) {
  if (le)
    return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
  return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
}
function split(lst, le = false) {
  const len = lst.length;
  let Ah = new Uint32Array(len);
  let Al = new Uint32Array(len);
  for (let i = 0; i < len; i++) {
    const { h: h2, l } = fromBig(lst[i], le);
    [Ah[i], Al[i]] = [h2, l];
  }
  return [Ah, Al];
}
var shrSH = (h2, _l, s) => h2 >>> s;
var shrSL = (h2, l, s) => h2 << 32 - s | l >>> s;
var rotrSH = (h2, l, s) => h2 >>> s | l << 32 - s;
var rotrSL = (h2, l, s) => h2 << 32 - s | l >>> s;
var rotrBH = (h2, l, s) => h2 << 64 - s | l >>> s - 32;
var rotrBL = (h2, l, s) => h2 >>> s - 32 | l << 64 - s;
function add(Ah, Al, Bh, Bl) {
  const l = (Al >>> 0) + (Bl >>> 0);
  return { h: Ah + Bh + (l / 2 ** 32 | 0) | 0, l: l | 0 };
}
var add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
var add3H = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
var add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
var add4H = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
var add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
var add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;

// node_modules/@noble/hashes/sha2.js
var SHA256_K = /* @__PURE__ */ Uint32Array.from([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var SHA256_W = /* @__PURE__ */ new Uint32Array(64);
var SHA2_32B = class extends HashMD {
  constructor(outputLen) {
    super(64, outputLen, 8, false);
  }
  get() {
    const { A, B, C: C2, D, E, F, G: G2, H } = this;
    return [A, B, C2, D, E, F, G2, H];
  }
  // prettier-ignore
  set(A, B, C2, D, E, F, G2, H) {
    this.A = A | 0;
    this.B = B | 0;
    this.C = C2 | 0;
    this.D = D | 0;
    this.E = E | 0;
    this.F = F | 0;
    this.G = G2 | 0;
    this.H = H | 0;
  }
  process(view, offset) {
    for (let i = 0; i < 16; i++, offset += 4)
      SHA256_W[i] = view.getUint32(offset, false);
    for (let i = 16; i < 64; i++) {
      const W15 = SHA256_W[i - 15];
      const W2 = SHA256_W[i - 2];
      const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
      const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
      SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
    }
    let { A, B, C: C2, D, E, F, G: G2, H } = this;
    for (let i = 0; i < 64; i++) {
      const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
      const T1 = H + sigma1 + Chi(E, F, G2) + SHA256_K[i] + SHA256_W[i] | 0;
      const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
      const T2 = sigma0 + Maj(A, B, C2) | 0;
      H = G2;
      G2 = F;
      F = E;
      E = D + T1 | 0;
      D = C2;
      C2 = B;
      B = A;
      A = T1 + T2 | 0;
    }
    A = A + this.A | 0;
    B = B + this.B | 0;
    C2 = C2 + this.C | 0;
    D = D + this.D | 0;
    E = E + this.E | 0;
    F = F + this.F | 0;
    G2 = G2 + this.G | 0;
    H = H + this.H | 0;
    this.set(A, B, C2, D, E, F, G2, H);
  }
  roundClean() {
    clean(SHA256_W);
  }
  destroy() {
    this.destroyed = true;
    this.set(0, 0, 0, 0, 0, 0, 0, 0);
    clean(this.buffer);
  }
};
var _SHA256 = class extends SHA2_32B {
  // We cannot use array here since array allows indexing by variable
  // which means optimizer/compiler cannot use registers.
  A = SHA256_IV[0] | 0;
  B = SHA256_IV[1] | 0;
  C = SHA256_IV[2] | 0;
  D = SHA256_IV[3] | 0;
  E = SHA256_IV[4] | 0;
  F = SHA256_IV[5] | 0;
  G = SHA256_IV[6] | 0;
  H = SHA256_IV[7] | 0;
  constructor() {
    super(32);
  }
};
var K512 = /* @__PURE__ */ (() => split([
  "0x428a2f98d728ae22",
  "0x7137449123ef65cd",
  "0xb5c0fbcfec4d3b2f",
  "0xe9b5dba58189dbbc",
  "0x3956c25bf348b538",
  "0x59f111f1b605d019",
  "0x923f82a4af194f9b",
  "0xab1c5ed5da6d8118",
  "0xd807aa98a3030242",
  "0x12835b0145706fbe",
  "0x243185be4ee4b28c",
  "0x550c7dc3d5ffb4e2",
  "0x72be5d74f27b896f",
  "0x80deb1fe3b1696b1",
  "0x9bdc06a725c71235",
  "0xc19bf174cf692694",
  "0xe49b69c19ef14ad2",
  "0xefbe4786384f25e3",
  "0x0fc19dc68b8cd5b5",
  "0x240ca1cc77ac9c65",
  "0x2de92c6f592b0275",
  "0x4a7484aa6ea6e483",
  "0x5cb0a9dcbd41fbd4",
  "0x76f988da831153b5",
  "0x983e5152ee66dfab",
  "0xa831c66d2db43210",
  "0xb00327c898fb213f",
  "0xbf597fc7beef0ee4",
  "0xc6e00bf33da88fc2",
  "0xd5a79147930aa725",
  "0x06ca6351e003826f",
  "0x142929670a0e6e70",
  "0x27b70a8546d22ffc",
  "0x2e1b21385c26c926",
  "0x4d2c6dfc5ac42aed",
  "0x53380d139d95b3df",
  "0x650a73548baf63de",
  "0x766a0abb3c77b2a8",
  "0x81c2c92e47edaee6",
  "0x92722c851482353b",
  "0xa2bfe8a14cf10364",
  "0xa81a664bbc423001",
  "0xc24b8b70d0f89791",
  "0xc76c51a30654be30",
  "0xd192e819d6ef5218",
  "0xd69906245565a910",
  "0xf40e35855771202a",
  "0x106aa07032bbd1b8",
  "0x19a4c116b8d2d0c8",
  "0x1e376c085141ab53",
  "0x2748774cdf8eeb99",
  "0x34b0bcb5e19b48a8",
  "0x391c0cb3c5c95a63",
  "0x4ed8aa4ae3418acb",
  "0x5b9cca4f7763e373",
  "0x682e6ff3d6b2b8a3",
  "0x748f82ee5defb2fc",
  "0x78a5636f43172f60",
  "0x84c87814a1f0ab72",
  "0x8cc702081a6439ec",
  "0x90befffa23631e28",
  "0xa4506cebde82bde9",
  "0xbef9a3f7b2c67915",
  "0xc67178f2e372532b",
  "0xca273eceea26619c",
  "0xd186b8c721c0c207",
  "0xeada7dd6cde0eb1e",
  "0xf57d4f7fee6ed178",
  "0x06f067aa72176fba",
  "0x0a637dc5a2c898a6",
  "0x113f9804bef90dae",
  "0x1b710b35131c471b",
  "0x28db77f523047d84",
  "0x32caab7b40c72493",
  "0x3c9ebe0a15c9bebc",
  "0x431d67c49c100d4c",
  "0x4cc5d4becb3e42b6",
  "0x597f299cfc657e2a",
  "0x5fcb6fab3ad6faec",
  "0x6c44198c4a475817"
].map((n) => BigInt(n))))();
var SHA512_Kh = /* @__PURE__ */ (() => K512[0])();
var SHA512_Kl = /* @__PURE__ */ (() => K512[1])();
var SHA512_W_H = /* @__PURE__ */ new Uint32Array(80);
var SHA512_W_L = /* @__PURE__ */ new Uint32Array(80);
var SHA2_64B = class extends HashMD {
  constructor(outputLen) {
    super(128, outputLen, 16, false);
  }
  // prettier-ignore
  get() {
    const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
    return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
  }
  // prettier-ignore
  set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
    this.Ah = Ah | 0;
    this.Al = Al | 0;
    this.Bh = Bh | 0;
    this.Bl = Bl | 0;
    this.Ch = Ch | 0;
    this.Cl = Cl | 0;
    this.Dh = Dh | 0;
    this.Dl = Dl | 0;
    this.Eh = Eh | 0;
    this.El = El | 0;
    this.Fh = Fh | 0;
    this.Fl = Fl | 0;
    this.Gh = Gh | 0;
    this.Gl = Gl | 0;
    this.Hh = Hh | 0;
    this.Hl = Hl | 0;
  }
  process(view, offset) {
    for (let i = 0; i < 16; i++, offset += 4) {
      SHA512_W_H[i] = view.getUint32(offset);
      SHA512_W_L[i] = view.getUint32(offset += 4);
    }
    for (let i = 16; i < 80; i++) {
      const W15h = SHA512_W_H[i - 15] | 0;
      const W15l = SHA512_W_L[i - 15] | 0;
      const s0h = rotrSH(W15h, W15l, 1) ^ rotrSH(W15h, W15l, 8) ^ shrSH(W15h, W15l, 7);
      const s0l = rotrSL(W15h, W15l, 1) ^ rotrSL(W15h, W15l, 8) ^ shrSL(W15h, W15l, 7);
      const W2h = SHA512_W_H[i - 2] | 0;
      const W2l = SHA512_W_L[i - 2] | 0;
      const s1h = rotrSH(W2h, W2l, 19) ^ rotrBH(W2h, W2l, 61) ^ shrSH(W2h, W2l, 6);
      const s1l = rotrSL(W2h, W2l, 19) ^ rotrBL(W2h, W2l, 61) ^ shrSL(W2h, W2l, 6);
      const SUMl = add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
      const SUMh = add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
      SHA512_W_H[i] = SUMh | 0;
      SHA512_W_L[i] = SUMl | 0;
    }
    let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
    for (let i = 0; i < 80; i++) {
      const sigma1h = rotrSH(Eh, El, 14) ^ rotrSH(Eh, El, 18) ^ rotrBH(Eh, El, 41);
      const sigma1l = rotrSL(Eh, El, 14) ^ rotrSL(Eh, El, 18) ^ rotrBL(Eh, El, 41);
      const CHIh = Eh & Fh ^ ~Eh & Gh;
      const CHIl = El & Fl ^ ~El & Gl;
      const T1ll = add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
      const T1h = add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
      const T1l = T1ll | 0;
      const sigma0h = rotrSH(Ah, Al, 28) ^ rotrBH(Ah, Al, 34) ^ rotrBH(Ah, Al, 39);
      const sigma0l = rotrSL(Ah, Al, 28) ^ rotrBL(Ah, Al, 34) ^ rotrBL(Ah, Al, 39);
      const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
      const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
      Hh = Gh | 0;
      Hl = Gl | 0;
      Gh = Fh | 0;
      Gl = Fl | 0;
      Fh = Eh | 0;
      Fl = El | 0;
      ({ h: Eh, l: El } = add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
      Dh = Ch | 0;
      Dl = Cl | 0;
      Ch = Bh | 0;
      Cl = Bl | 0;
      Bh = Ah | 0;
      Bl = Al | 0;
      const All = add3L(T1l, sigma0l, MAJl);
      Ah = add3H(All, T1h, sigma0h, MAJh);
      Al = All | 0;
    }
    ({ h: Ah, l: Al } = add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
    ({ h: Bh, l: Bl } = add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
    ({ h: Ch, l: Cl } = add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
    ({ h: Dh, l: Dl } = add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
    ({ h: Eh, l: El } = add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
    ({ h: Fh, l: Fl } = add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
    ({ h: Gh, l: Gl } = add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
    ({ h: Hh, l: Hl } = add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
    this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
  }
  roundClean() {
    clean(SHA512_W_H, SHA512_W_L);
  }
  destroy() {
    this.destroyed = true;
    clean(this.buffer);
    this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
};
var _SHA512 = class extends SHA2_64B {
  Ah = SHA512_IV[0] | 0;
  Al = SHA512_IV[1] | 0;
  Bh = SHA512_IV[2] | 0;
  Bl = SHA512_IV[3] | 0;
  Ch = SHA512_IV[4] | 0;
  Cl = SHA512_IV[5] | 0;
  Dh = SHA512_IV[6] | 0;
  Dl = SHA512_IV[7] | 0;
  Eh = SHA512_IV[8] | 0;
  El = SHA512_IV[9] | 0;
  Fh = SHA512_IV[10] | 0;
  Fl = SHA512_IV[11] | 0;
  Gh = SHA512_IV[12] | 0;
  Gl = SHA512_IV[13] | 0;
  Hh = SHA512_IV[14] | 0;
  Hl = SHA512_IV[15] | 0;
  constructor() {
    super(64);
  }
};
var sha256 = /* @__PURE__ */ createHasher(
  () => new _SHA256(),
  /* @__PURE__ */ oidNist(1)
);
var sha512 = /* @__PURE__ */ createHasher(
  () => new _SHA512(),
  /* @__PURE__ */ oidNist(3)
);

// node_modules/@stellar/stellar-sdk/lib/esm/base/signing.js
var import_buffer7 = require("buffer");

// node_modules/@noble/ed25519/index.js
var ed25519_CURVE = Object.freeze({
  p: 0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffedn,
  n: 0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3edn,
  h: 8n,
  a: 0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffecn,
  d: 0x52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3n,
  Gx: 0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51an,
  Gy: 0x6666666666666666666666666666666666666666666666666666666666666658n
});
var { p: P, n: N, Gx, Gy, a: _a, d: _d, h } = ed25519_CURVE;
var L = 32;
var captureTrace = (...args) => {
  if ("captureStackTrace" in Error && typeof Error.captureStackTrace === "function") {
    Error.captureStackTrace(...args);
  }
};
var err = (message = "") => {
  const e = new Error(message);
  captureTrace(e, err);
  throw e;
};
var isBig = (n) => typeof n === "bigint";
var isStr = (s) => typeof s === "string";
var isBytes2 = (a) => a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in a && a.BYTES_PER_ELEMENT === 1;
var abytes2 = (value, length, title = "") => {
  const bytes = isBytes2(value);
  const len = value?.length;
  const needsLen = length !== void 0;
  if (!bytes || needsLen && len !== length) {
    const prefix = title && `"${title}" `;
    const ofLen = needsLen ? ` of length ${length}` : "";
    const got = bytes ? `length=${len}` : `type=${typeof value}`;
    const msg = prefix + "expected Uint8Array" + ofLen + ", got " + got;
    throw bytes ? new RangeError(msg) : new TypeError(msg);
  }
  return value;
};
var u8n = (len) => new Uint8Array(len);
var u8fr = (buf) => Uint8Array.from(buf);
var padh = (n, pad) => n.toString(16).padStart(pad, "0");
var bytesToHex = (b) => Array.from(abytes2(b)).map((e) => padh(e, 2)).join("");
var C = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
var _ch = (ch) => {
  if (ch >= C._0 && ch <= C._9)
    return ch - C._0;
  if (ch >= C.A && ch <= C.F)
    return ch - (C.A - 10);
  if (ch >= C.a && ch <= C.f)
    return ch - (C.a - 10);
  return;
};
var hexToBytes = (hex) => {
  const e = "hex invalid";
  if (!isStr(hex))
    return err(e);
  const hl = hex.length;
  const al = hl / 2;
  if (hl % 2)
    return err(e);
  const array = u8n(al);
  for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
    const n1 = _ch(hex.charCodeAt(hi));
    const n2 = _ch(hex.charCodeAt(hi + 1));
    if (n1 === void 0 || n2 === void 0)
      return err(e);
    array[ai] = n1 * 16 + n2;
  }
  return array;
};
var cr = () => globalThis?.crypto;
var subtle = () => cr()?.subtle ?? err("crypto.subtle must be defined, consider polyfill");
var concatBytes = (...arrs) => {
  let len = 0;
  for (const a of arrs)
    len += abytes2(a).length;
  const r = u8n(len);
  let pad = 0;
  arrs.forEach((a) => {
    r.set(a, pad);
    pad += a.length;
  });
  return r;
};
var randomBytes = (len = L) => {
  const c = cr();
  return c.getRandomValues(u8n(len));
};
var big = BigInt;
var assertRange = (n, min, max, msg = "bad number: out of range") => {
  if (!isBig(n))
    throw new TypeError(msg);
  if (min <= n && n < max)
    return n;
  throw new RangeError(msg);
};
var M = (a, b = P) => {
  const r = a % b;
  return r >= 0n ? r : b + r;
};
var P_MASK = (1n << 255n) - 1n;
var modP = (num) => {
  if (num < 0n)
    err("negative coordinate");
  let r = (num >> 255n) * 19n + (num & P_MASK);
  r = (r >> 255n) * 19n + (r & P_MASK);
  return r % P;
};
var modN = (a) => M(a, N);
var invert = (num, md) => {
  if (num === 0n || md <= 0n)
    err("no inverse n=" + num + " mod=" + md);
  let a = M(num, md), b = md, x = 0n, y = 1n, u = 1n, v = 0n;
  while (a !== 0n) {
    const q = b / a, r = b % a;
    const m = x - u * q, n = y - v * q;
    b = a, a = r, x = u, y = v, u = m, v = n;
  }
  return b === 1n ? M(x, md) : err("no inverse");
};
var callHash = (name) => {
  const fn = hashes[name];
  if (typeof fn !== "function")
    err("hashes." + name + " not set");
  return fn;
};
var checkDigest = (value) => abytes2(value, 64, "digest");
var apoint = (p) => p instanceof Point ? p : err("Point expected");
var B256 = 2n ** 256n;
var Point = class _Point {
  static BASE;
  static ZERO;
  X;
  Y;
  Z;
  T;
  // Constructor only bounds-checks and freezes XYZT coordinates; it does not prove the point is
  // on-curve or that T matches X*Y/Z.
  constructor(X, Y, Z, T) {
    const max = B256;
    this.X = assertRange(X, 0n, max);
    this.Y = assertRange(Y, 0n, max);
    this.Z = assertRange(Z, 1n, max);
    this.T = assertRange(T, 0n, max);
    Object.freeze(this);
  }
  static CURVE() {
    return ed25519_CURVE;
  }
  static fromAffine(p) {
    return new _Point(p.x, p.y, 1n, modP(p.x * p.y));
  }
  /** RFC8032 5.1.3: Bytes to Point. */
  static fromBytes(hex, zip215 = false) {
    const d = _d;
    const normed = u8fr(abytes2(hex, L));
    const lastByte = hex[31];
    normed[31] = lastByte & ~128;
    const y = bytesToNumberLE(normed);
    const max = zip215 ? B256 : P;
    assertRange(y, 0n, max);
    const y2 = modP(y * y);
    const u = M(y2 - 1n);
    const v = modP(d * y2 + 1n);
    let { isValid: isValid2, value: x } = uvRatio(u, v);
    if (!isValid2)
      err("bad point: y not sqrt");
    const isXOdd = (x & 1n) === 1n;
    const isLastByteOdd = (lastByte & 128) !== 0;
    if (!zip215 && x === 0n && isLastByteOdd)
      err("bad point: x==0, isLastByteOdd");
    if (isLastByteOdd !== isXOdd)
      x = M(-x);
    return new _Point(x, y, 1n, modP(x * y));
  }
  static fromHex(hex, zip215) {
    return _Point.fromBytes(hexToBytes(hex), zip215);
  }
  get x() {
    return this.toAffine().x;
  }
  get y() {
    return this.toAffine().y;
  }
  /** Checks if the point is valid and on-curve. */
  assertValidity() {
    const a = _a;
    const d = _d;
    const p = this;
    if (p.is0())
      return err("bad point: ZERO");
    const { X, Y, Z, T } = p;
    const X2 = modP(X * X);
    const Y2 = modP(Y * Y);
    const Z2 = modP(Z * Z);
    const Z4 = modP(Z2 * Z2);
    const aX2 = modP(X2 * a);
    const left = modP(Z2 * (aX2 + Y2));
    const right = M(Z4 + modP(d * modP(X2 * Y2)));
    if (left !== right)
      return err("bad point: equation left != right (1)");
    const XY = modP(X * Y);
    const ZT = modP(Z * T);
    if (XY !== ZT)
      return err("bad point: equation left != right (2)");
    return this;
  }
  /** Equality check: compare points P&Q. */
  equals(other) {
    const { X: X1, Y: Y1, Z: Z1 } = this;
    const { X: X2, Y: Y2, Z: Z2 } = apoint(other);
    const X1Z2 = modP(X1 * Z2);
    const X2Z1 = modP(X2 * Z1);
    const Y1Z2 = modP(Y1 * Z2);
    const Y2Z1 = modP(Y2 * Z1);
    return X1Z2 === X2Z1 && Y1Z2 === Y2Z1;
  }
  is0() {
    return this.equals(I);
  }
  /** Flip point over y coordinate. */
  negate() {
    return new _Point(M(-this.X), this.Y, this.Z, M(-this.T));
  }
  /** Point doubling. Complete formula. Cost: `4M + 4S + 1*a + 6add + 1*2`. */
  double() {
    const { X: X1, Y: Y1, Z: Z1 } = this;
    const a = _a;
    const A = modP(X1 * X1);
    const B = modP(Y1 * Y1);
    const C2 = modP(2n * Z1 * Z1);
    const D = modP(a * A);
    const x1y1 = M(X1 + Y1);
    const E = M(modP(x1y1 * x1y1) - A - B);
    const G2 = M(D + B);
    const F = M(G2 - C2);
    const H = M(D - B);
    const X3 = modP(E * F);
    const Y3 = modP(G2 * H);
    const T3 = modP(E * H);
    const Z3 = modP(F * G2);
    return new _Point(X3, Y3, Z3, T3);
  }
  /** Point addition. Complete formula. Cost: `8M + 1*k + 8add + 1*2`. */
  add(other) {
    const { X: X1, Y: Y1, Z: Z1, T: T1 } = this;
    const { X: X2, Y: Y2, Z: Z2, T: T2 } = apoint(other);
    const a = _a;
    const d = _d;
    const A = modP(X1 * X2);
    const B = modP(Y1 * Y2);
    const C2 = modP(modP(T1 * d) * T2);
    const D = modP(Z1 * Z2);
    const E = M(modP(M(X1 + Y1) * M(X2 + Y2)) - A - B);
    const F = M(D - C2);
    const G2 = M(D + C2);
    const H = M(B - modP(a * A));
    const X3 = modP(E * F);
    const Y3 = modP(G2 * H);
    const T3 = modP(E * H);
    const Z3 = modP(F * G2);
    return new _Point(X3, Y3, Z3, T3);
  }
  subtract(other) {
    return this.add(apoint(other).negate());
  }
  /**
   * Point-by-scalar multiplication. Safe mode requires `1 <= n < CURVE.n`.
   * Unsafe mode additionally permits `n = 0` and returns the identity point for that case.
   * Uses {@link wNAF} for base point.
   * Uses fake point to mitigate side-channel leakage.
   * @param n - scalar by which point is multiplied
   * @param safe - safe mode guards against timing attacks; unsafe mode is faster
   */
  multiply(n, safe = true) {
    if (!safe && n === 0n)
      return I;
    assertRange(n, 1n, N);
    if (!safe && this.is0())
      return I;
    if (n === 1n)
      return this;
    if (this.equals(G))
      return wNAF(n).p;
    let p = I;
    let f = G;
    for (let d = this; n > 0n; d = d.double(), n >>= 1n) {
      if (n & 1n)
        p = p.add(d);
      else if (safe)
        f = f.add(d);
    }
    return p;
  }
  multiplyUnsafe(scalar) {
    return this.multiply(scalar, false);
  }
  /** Convert point to 2d xy affine point. (X, Y, Z) ∋ (x=X/Z, y=Y/Z) */
  toAffine() {
    const { X, Y, Z } = this;
    if (this.equals(I))
      return { x: 0n, y: 1n };
    const iz = invert(Z, P);
    if (modP(Z * iz) !== 1n)
      err("invalid inverse");
    const x = modP(X * iz);
    const y = modP(Y * iz);
    return { x, y };
  }
  toBytes() {
    const { x, y } = this.toAffine();
    const b = numTo32bLE(y);
    b[31] |= x & 1n ? 128 : 0;
    return b;
  }
  toHex() {
    return bytesToHex(this.toBytes());
  }
  clearCofactor() {
    return this.multiply(big(h), false);
  }
  isSmallOrder() {
    return this.clearCofactor().is0();
  }
  isTorsionFree() {
    let p = this.multiply(N / 2n, false).double();
    if (N % 2n)
      p = p.add(this);
    return p.is0();
  }
};
var G = new Point(Gx, Gy, 1n, M(Gx * Gy));
var I = new Point(0n, 1n, 1n, 0n);
Point.BASE = G;
Point.ZERO = I;
var numTo32bLE = (num) => hexToBytes(padh(assertRange(num, 0n, B256), 64)).reverse();
var bytesToNumberLE = (b) => big("0x" + bytesToHex(u8fr(abytes2(b)).reverse()));
var pow2 = (x, power) => {
  let r = x;
  while (power-- > 0n) {
    r = modP(r * r);
  }
  return r;
};
var pow_2_252_3 = (x) => {
  const x2 = modP(x * x);
  const b2 = modP(x2 * x);
  const b4 = modP(pow2(b2, 2n) * b2);
  const b5 = modP(pow2(b4, 1n) * x);
  const b10 = modP(pow2(b5, 5n) * b5);
  const b20 = modP(pow2(b10, 10n) * b10);
  const b40 = modP(pow2(b20, 20n) * b20);
  const b80 = modP(pow2(b40, 40n) * b40);
  const b160 = modP(pow2(b80, 80n) * b80);
  const b240 = modP(pow2(b160, 80n) * b80);
  const b250 = modP(pow2(b240, 10n) * b10);
  const pow_p_5_8 = modP(pow2(b250, 2n) * x);
  return { pow_p_5_8, b2 };
};
var RM1 = 0x2b8324804fc1df0b2b4d00993dfbd7a72f431806ad2fe478c4ee1b274a0ea0b0n;
var uvRatio = (u, v) => {
  const v3 = modP(v * modP(v * v));
  const v7 = modP(modP(v3 * v3) * v);
  const pow = pow_2_252_3(modP(u * v7)).pow_p_5_8;
  let x = modP(u * modP(v3 * pow));
  const vx2 = modP(v * modP(x * x));
  const root1 = x;
  const root2 = modP(x * RM1);
  const useRoot1 = vx2 === u;
  const useRoot2 = vx2 === M(-u);
  const noRoot = vx2 === M(-u * RM1);
  if (useRoot1)
    x = root1;
  if (useRoot2 || noRoot)
    x = root2;
  if ((M(x) & 1n) === 1n)
    x = M(-x);
  return { isValid: useRoot1 || useRoot2, value: x };
};
var modL_LE = (hash2) => modN(bytesToNumberLE(hash2));
var sha512a = (...m) => Promise.resolve(callHash("sha512Async")(concatBytes(...m))).then(checkDigest);
var sha512s = (...m) => checkDigest(callHash("sha512")(concatBytes(...m)));
var hash2extK = (hashed) => {
  const copy = u8fr(hashed);
  const head = copy.slice(0, 32);
  head[0] &= 248;
  head[31] &= 127;
  head[31] |= 64;
  const prefix = copy.slice(32, 64);
  const scalar = modL_LE(head);
  const point = G.multiply(scalar);
  const pointBytes = point.toBytes();
  return { head, prefix, scalar, point, pointBytes };
};
var getExtendedPublicKeyAsync = (secretKey) => sha512a(abytes2(secretKey, L)).then(hash2extK);
var getExtendedPublicKey = (secretKey) => hash2extK(sha512s(abytes2(secretKey, L)));
var getPublicKey = (priv) => getExtendedPublicKey(priv).pointBytes;
var hashFinishS = (res) => res.finish(sha512s(res.hashable));
var _sign = (e, rBytes, msg) => {
  const { pointBytes: P2, scalar: s } = e;
  const r = modL_LE(rBytes);
  const R = G.multiply(r).toBytes();
  const hashable = concatBytes(R, P2, msg);
  const finish = (hashed) => {
    const S = modN(r + modL_LE(hashed) * s);
    return abytes2(concatBytes(R, numTo32bLE(S)), 64);
  };
  return { hashable, finish };
};
var sign = (message, secretKey) => {
  const m = abytes2(message);
  const e = getExtendedPublicKey(secretKey);
  const rBytes = sha512s(e.prefix, m);
  return hashFinishS(_sign(e, rBytes, m));
};
var defaultVerifyOpts = { zip215: true };
var _verify = (sig, msg, publicKey, options = defaultVerifyOpts) => {
  sig = abytes2(sig, 64);
  msg = abytes2(msg);
  publicKey = abytes2(publicKey, L);
  const { zip215 = true } = options;
  const r = sig.subarray(0, L);
  const s = bytesToNumberLE(sig.subarray(L, L * 2));
  let A, R, SB;
  let hashable = Uint8Array.of();
  let finished = false;
  try {
    A = Point.fromBytes(publicKey, zip215);
    R = Point.fromBytes(r, zip215);
    SB = G.multiply(s, false);
    hashable = concatBytes(r, publicKey, msg);
    finished = true;
  } catch (error) {
  }
  const finish = (hashed) => {
    if (!finished)
      return false;
    if (!zip215 && A.isSmallOrder())
      return false;
    const k = modL_LE(hashed);
    const RkA = R.add(A.multiply(k, false));
    return RkA.subtract(SB).clearCofactor().is0();
  };
  return { hashable, finish };
};
var verify = (signature, message, publicKey, opts = defaultVerifyOpts) => hashFinishS(_verify(signature, message, publicKey, opts));
var hashes = {
  sha512Async: async (message) => {
    const s = subtle();
    const m = concatBytes(message);
    return u8n(await s.digest("SHA-512", m.buffer));
  },
  sha512: void 0
};
var randomSecretKey = (seed) => {
  seed = seed === void 0 ? randomBytes(L) : seed;
  return abytes2(seed, L);
};
var utils = /* @__PURE__ */ Object.freeze({
  getExtendedPublicKeyAsync,
  getExtendedPublicKey,
  randomSecretKey
});
var W = 8;
var scalarBits = 256;
var pwindows = Math.ceil(scalarBits / W) + 1;
var pwindowSize = 2 ** (W - 1);
var precompute = () => {
  const points = [];
  let p = G;
  let b = p;
  for (let w = 0; w < pwindows; w++) {
    b = p;
    points.push(b);
    for (let i = 1; i < pwindowSize; i++) {
      b = b.add(p);
      points.push(b);
    }
    p = b.double();
  }
  return points;
};
var Gpows = void 0;
var ctneg = (cnd, p) => {
  const n = p.negate();
  return cnd ? n : p;
};
var wNAF = (n) => {
  const comp = Gpows || (Gpows = precompute());
  let p = I;
  let f = G;
  const pow_2_w = 2 ** W;
  const maxNum = pow_2_w;
  const mask = big(pow_2_w - 1);
  const shiftBy = big(W);
  for (let w = 0; w < pwindows; w++) {
    let wbits = Number(n & mask);
    n >>= shiftBy;
    if (wbits > pwindowSize) {
      wbits -= maxNum;
      n += 1n;
    }
    const off = w * pwindowSize;
    const offF = off;
    const offP = off + Math.abs(wbits) - 1;
    const isEven = w % 2 !== 0;
    const isNeg = wbits < 0;
    if (wbits === 0) {
      f = f.add(ctneg(isEven, comp[offF]));
    } else {
      p = p.add(ctneg(isNeg, comp[offP]));
    }
  }
  if (n !== 0n)
    err("invalid wnaf");
  return { p, f };
};

// node_modules/@stellar/stellar-sdk/lib/esm/base/signing.js
hashes.sha512 = sha512;
function generate(secretKey) {
  return import_buffer7.Buffer.from(getPublicKey(secretKey));
}
function sign2(data, rawSecret) {
  return import_buffer7.Buffer.from(sign(import_buffer7.Buffer.from(data), rawSecret));
}
function verify2(data, signature, rawPublicKey) {
  return verify(
    import_buffer7.Buffer.from(signature),
    import_buffer7.Buffer.from(data),
    import_buffer7.Buffer.from(rawPublicKey),
    {
      zip215: false
    }
  );
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/keypair.js
var import_buffer10 = require("buffer");

// node_modules/@stellar/stellar-sdk/lib/esm/base/strkey.js
var import_buffer8 = require("buffer");
var import_base32 = __toESM(require_base322(), 1);

// node_modules/@stellar/stellar-sdk/lib/esm/base/util/checksum.js
function verifyChecksum(expected, actual) {
  if (expected.length !== actual.length) {
    return false;
  }
  if (expected.length === 0) {
    return true;
  }
  for (let i = 0; i < expected.length; i += 1) {
    if (expected[i] !== actual[i]) {
      return false;
    }
  }
  return true;
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/strkey.js
var versionBytes = {
  ed25519PublicKey: 6 << 3,
  // G (when encoded in base32)
  ed25519SecretSeed: 18 << 3,
  // S
  med25519PublicKey: 12 << 3,
  // M
  preAuthTx: 19 << 3,
  // T
  sha256Hash: 23 << 3,
  // X
  signedPayload: 15 << 3,
  // P
  contract: 2 << 3,
  // C
  liquidityPool: 11 << 3,
  // L
  claimableBalance: 1 << 3
  // B
};
var strkeyTypes = {
  G: "ed25519PublicKey",
  S: "ed25519SecretSeed",
  M: "med25519PublicKey",
  T: "preAuthTx",
  X: "sha256Hash",
  P: "signedPayload",
  C: "contract",
  L: "liquidityPool",
  B: "claimableBalance"
};
function hasVersionByteName(versionByteName) {
  return Object.prototype.hasOwnProperty.call(versionBytes, versionByteName);
}
var StrKey = class {
  static types = strkeyTypes;
  /**
   * Encodes `data` to strkey ed25519 public key.
   *
   * @param data - raw data to encode
   */
  static encodeEd25519PublicKey(data) {
    return encodeCheck("ed25519PublicKey", data);
  }
  /**
   * Decodes strkey ed25519 public key to raw data.
   *
   * If the parameter is a muxed account key ("M..."), this will only encode it
   * as a basic Ed25519 key (as if in "G..." format).
   *
   * @param data - "G..." (or "M...") key representation to decode
   */
  static decodeEd25519PublicKey(data) {
    return decodeCheck("ed25519PublicKey", data);
  }
  /**
   * Returns true if the given Stellar public key is a valid ed25519 public key.
   *
   * @param publicKey - public key to check
   */
  static isValidEd25519PublicKey(publicKey) {
    return isValid("ed25519PublicKey", publicKey);
  }
  /**
   * Encodes data to strkey ed25519 seed.
   *
   * @param data - data to encode
   */
  static encodeEd25519SecretSeed(data) {
    return encodeCheck("ed25519SecretSeed", data);
  }
  /**
   * Decodes strkey ed25519 seed to raw data.
   *
   * @param address - data to decode
   */
  static decodeEd25519SecretSeed(address) {
    return decodeCheck("ed25519SecretSeed", address);
  }
  /**
   * Returns true if the given Stellar secret key is a valid ed25519 secret seed.
   *
   * @param seed - seed to check
   */
  static isValidEd25519SecretSeed(seed) {
    return isValid("ed25519SecretSeed", seed);
  }
  /**
   * Encodes data to strkey med25519 public key.
   *
   * @param data - data to encode
   */
  static encodeMed25519PublicKey(data) {
    return encodeCheck("med25519PublicKey", data);
  }
  /**
   * Decodes strkey med25519 public key to raw data.
   *
   * @param address - data to decode
   */
  static decodeMed25519PublicKey(address) {
    return decodeCheck("med25519PublicKey", address);
  }
  /**
   * Returns true if the given Stellar public key is a valid med25519 public key.
   *
   * @param publicKey - public key to check
   */
  static isValidMed25519PublicKey(publicKey) {
    return isValid("med25519PublicKey", publicKey);
  }
  /**
   * Encodes data to strkey preAuthTx.
   *
   * @param data - data to encode
   */
  static encodePreAuthTx(data) {
    return encodeCheck("preAuthTx", data);
  }
  /**
   * Decodes strkey PreAuthTx to raw data.
   *
   * @param address - data to decode
   */
  static decodePreAuthTx(address) {
    return decodeCheck("preAuthTx", address);
  }
  /**
   * Encodes data to strkey sha256 hash.
   *
   * @param data - data to encode
   */
  static encodeSha256Hash(data) {
    return encodeCheck("sha256Hash", data);
  }
  /**
   * Decodes strkey sha256 hash to raw data.
   *
   * @param address - data to decode
   */
  static decodeSha256Hash(address) {
    return decodeCheck("sha256Hash", address);
  }
  /**
   * Encodes raw data to strkey signed payload (P...).
   *
   * @param data - data to encode
   */
  static encodeSignedPayload(data) {
    return encodeCheck("signedPayload", data);
  }
  /**
   * Decodes strkey signed payload (P...) to raw data.
   *
   * @param address - address to decode
   */
  static decodeSignedPayload(address) {
    return decodeCheck("signedPayload", address);
  }
  /**
   * Checks validity of alleged signed payload (P...) strkey address.
   *
   * @param address - signer key to check
   */
  static isValidSignedPayload(address) {
    return isValid("signedPayload", address);
  }
  /**
   * Encodes raw data to strkey contract (C...).
   *
   * @param data - data to encode
   */
  static encodeContract(data) {
    return encodeCheck("contract", data);
  }
  /**
   * Decodes strkey contract (C...) to raw data.
   *
   * @param address - address to decode
   */
  static decodeContract(address) {
    return decodeCheck("contract", address);
  }
  /**
   * Checks validity of alleged contract (C...) strkey address.
   *
   * @param address - signer key to check
   */
  static isValidContract(address) {
    return isValid("contract", address);
  }
  /**
   * Encodes raw data to strkey claimable balance (B...).
   *
   * @param data - data to encode
   */
  static encodeClaimableBalance(data) {
    return encodeCheck("claimableBalance", data);
  }
  /**
   * Decodes strkey claimable balance (B...) to raw data.
   *
   * @param address - balance to decode
   */
  static decodeClaimableBalance(address) {
    return decodeCheck("claimableBalance", address);
  }
  /**
   * Checks validity of alleged claimable balance (B...) strkey address.
   *
   * @param address - balance to check
   */
  static isValidClaimableBalance(address) {
    return isValid("claimableBalance", address);
  }
  /**
   * Encodes raw data to strkey liquidity pool (L...).
   *
   * @param data - data to encode
   */
  static encodeLiquidityPool(data) {
    return encodeCheck("liquidityPool", data);
  }
  /**
   * Decodes strkey liquidity pool (L...) to raw data.
   *
   * @param address - address to decode
   */
  static decodeLiquidityPool(address) {
    return decodeCheck("liquidityPool", address);
  }
  /**
   * Checks validity of alleged liquidity pool (L...) strkey address.
   *
   * @param address - pool to check
   */
  static isValidLiquidityPool(address) {
    return isValid("liquidityPool", address);
  }
  /**
   * Returns the strkey type based on the prefix of the given strkey address,
   * or undefined if the prefix is invalid.
   *
   * @param address - the strkey address to check
   */
  static getVersionByteForPrefix(address) {
    if (address.length < 1) {
      return void 0;
    }
    const prefix = address[0];
    return strkeyTypes[prefix];
  }
};
function isValid(versionByteName, encoded) {
  if (typeof encoded !== "string") {
    return false;
  }
  switch (versionByteName) {
    case "ed25519PublicKey":
    // falls through
    case "ed25519SecretSeed":
    // falls through
    case "preAuthTx":
    // falls through
    case "sha256Hash":
    // falls through
    case "contract":
    // falls through
    case "liquidityPool":
      if (encoded.length !== 56) {
        return false;
      }
      break;
    case "claimableBalance":
      if (encoded.length !== 58) {
        return false;
      }
      break;
    case "med25519PublicKey":
      if (encoded.length !== 69) {
        return false;
      }
      break;
    case "signedPayload":
      if (encoded.length < 56 || encoded.length > 165) {
        return false;
      }
      break;
    default:
      return false;
  }
  let decoded;
  try {
    decoded = decodeCheck(versionByteName, encoded);
  } catch {
    return false;
  }
  switch (versionByteName) {
    case "ed25519PublicKey":
    // falls through
    case "ed25519SecretSeed":
    // falls through
    case "preAuthTx":
    // falls through
    case "sha256Hash":
    // falls through
    case "contract":
    case "liquidityPool":
      return decoded.length === 32;
    case "claimableBalance":
      return decoded.length === 32 + 1;
    // +1 byte for discriminant
    case "med25519PublicKey":
      return decoded.length === 40;
    // +8 bytes for the ID
    case "signedPayload":
      return (
        // 32 for the signer, +4 for the payload size, then either +4 for the
        // min or +64 for the max payload
        decoded.length >= 32 + 4 + 4 && decoded.length <= 32 + 4 + 64
      );
    default:
      return false;
  }
}
function decodeCheck(versionByteName, encoded) {
  if (typeof encoded !== "string") {
    throw new TypeError("encoded argument must be of type String");
  }
  const decoded = import_base32.default.decode(encoded);
  const versionByte = decoded[0];
  const payload = decoded.slice(0, -2);
  const data = payload.slice(1);
  const checksum = decoded.slice(-2);
  if (encoded !== import_base32.default.encode(decoded)) {
    throw new Error("invalid encoded string");
  }
  if (!hasVersionByteName(versionByteName)) {
    throw new Error(
      `${versionByteName} is not a valid version byte name. Expected one of ${Object.keys(versionBytes).join(", ")}`
    );
  }
  const expectedVersion = versionBytes[versionByteName];
  if (versionByte !== expectedVersion) {
    throw new Error(
      `invalid version byte. expected ${expectedVersion}, got ${versionByte}`
    );
  }
  const expectedChecksum = calculateChecksum(payload);
  if (!verifyChecksum(expectedChecksum, checksum)) {
    throw new Error(`invalid checksum`);
  }
  return import_buffer8.Buffer.from(data);
}
function encodeCheck(versionByteName, data) {
  if (data === null || data === void 0) {
    throw new Error("cannot encode null data");
  }
  if (!hasVersionByteName(versionByteName)) {
    throw new Error(
      `${versionByteName} is not a valid version byte name. Expected one of ${Object.keys(versionBytes).join(", ")}`
    );
  }
  const versionByte = versionBytes[versionByteName];
  data = import_buffer8.Buffer.from(data);
  const versionBuffer = import_buffer8.Buffer.from([versionByte]);
  const payload = import_buffer8.Buffer.concat([versionBuffer, data]);
  const checksum = import_buffer8.Buffer.from(calculateChecksum(payload));
  const unencoded = import_buffer8.Buffer.concat([payload, checksum]);
  return import_base32.default.encode(unencoded);
}
function calculateChecksum(payload) {
  const crcTable = [
    0,
    4129,
    8258,
    12387,
    16516,
    20645,
    24774,
    28903,
    33032,
    37161,
    41290,
    45419,
    49548,
    53677,
    57806,
    61935,
    4657,
    528,
    12915,
    8786,
    21173,
    17044,
    29431,
    25302,
    37689,
    33560,
    45947,
    41818,
    54205,
    50076,
    62463,
    58334,
    9314,
    13379,
    1056,
    5121,
    25830,
    29895,
    17572,
    21637,
    42346,
    46411,
    34088,
    38153,
    58862,
    62927,
    50604,
    54669,
    13907,
    9842,
    5649,
    1584,
    30423,
    26358,
    22165,
    18100,
    46939,
    42874,
    38681,
    34616,
    63455,
    59390,
    55197,
    51132,
    18628,
    22757,
    26758,
    30887,
    2112,
    6241,
    10242,
    14371,
    51660,
    55789,
    59790,
    63919,
    35144,
    39273,
    43274,
    47403,
    23285,
    19156,
    31415,
    27286,
    6769,
    2640,
    14899,
    10770,
    56317,
    52188,
    64447,
    60318,
    39801,
    35672,
    47931,
    43802,
    27814,
    31879,
    19684,
    23749,
    11298,
    15363,
    3168,
    7233,
    60846,
    64911,
    52716,
    56781,
    44330,
    48395,
    36200,
    40265,
    32407,
    28342,
    24277,
    20212,
    15891,
    11826,
    7761,
    3696,
    65439,
    61374,
    57309,
    53244,
    48923,
    44858,
    40793,
    36728,
    37256,
    33193,
    45514,
    41451,
    53516,
    49453,
    61774,
    57711,
    4224,
    161,
    12482,
    8419,
    20484,
    16421,
    28742,
    24679,
    33721,
    37784,
    41979,
    46042,
    49981,
    54044,
    58239,
    62302,
    689,
    4752,
    8947,
    13010,
    16949,
    21012,
    25207,
    29270,
    46570,
    42443,
    38312,
    34185,
    62830,
    58703,
    54572,
    50445,
    13538,
    9411,
    5280,
    1153,
    29798,
    25671,
    21540,
    17413,
    42971,
    47098,
    34713,
    38840,
    59231,
    63358,
    50973,
    55100,
    9939,
    14066,
    1681,
    5808,
    26199,
    30326,
    17941,
    22068,
    55628,
    51565,
    63758,
    59695,
    39368,
    35305,
    47498,
    43435,
    22596,
    18533,
    30726,
    26663,
    6336,
    2273,
    14466,
    10403,
    52093,
    56156,
    60223,
    64286,
    35833,
    39896,
    43963,
    48026,
    19061,
    23124,
    27191,
    31254,
    2801,
    6864,
    10931,
    14994,
    64814,
    60687,
    56684,
    52557,
    48554,
    44427,
    40424,
    36297,
    31782,
    27655,
    23652,
    19525,
    15522,
    11395,
    7392,
    3265,
    61215,
    65342,
    53085,
    57212,
    44955,
    49082,
    36825,
    40952,
    28183,
    32310,
    20053,
    24180,
    11923,
    16050,
    3793,
    7920
  ];
  let crc16 = 0;
  for (let i = 0; i < payload.length; i += 1) {
    const byte = payload[i];
    if (byte === void 0) {
      continue;
    }
    const lookupIndex = crc16 >> 8 ^ byte;
    crc16 = crc16 << 8 ^ (crcTable[lookupIndex] ?? 0);
    crc16 &= 65535;
  }
  const checksum = new Uint8Array(2);
  checksum[0] = crc16 & 255;
  checksum[1] = crc16 >> 8 & 255;
  return checksum;
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/hashing.js
var import_buffer9 = require("buffer");
function hash(data) {
  const bytes = typeof data === "string" ? import_buffer9.Buffer.from(data, "utf8") : data;
  return import_buffer9.Buffer.from(sha256(bytes));
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/keypair.js
hashes.sha512 = sha512;
var Keypair = class {
  type;
  _publicKey;
  _secretSeed;
  _secretKey;
  /**
   * @param keys - at least one of keys must be provided.
   *   - `type`: public-key signature system name (currently only `ed25519` keys are supported)
   *   - `publicKey`: raw public key
   *   - `secretKey`: raw secret key (32-byte secret seed in ed25519)
   */
  constructor(keys) {
    if (keys.type !== "ed25519") {
      throw new Error("Invalid keys type");
    }
    this.type = keys.type;
    if ("secretKey" in keys) {
      keys.secretKey = import_buffer10.Buffer.from(keys.secretKey);
      if (keys.secretKey.length !== 32) {
        throw new Error("secretKey length is invalid");
      }
      this._secretSeed = keys.secretKey;
      this._publicKey = generate(keys.secretKey);
      this._secretKey = keys.secretKey;
      if (keys.publicKey && !this._publicKey.equals(import_buffer10.Buffer.from(keys.publicKey))) {
        throw new Error("secretKey does not match publicKey");
      }
    } else if ("publicKey" in keys) {
      this._publicKey = import_buffer10.Buffer.from(keys.publicKey);
      if (this._publicKey.length !== 32) {
        throw new Error("publicKey length is invalid");
      }
    } else {
      throw new Error(
        "At least one of publicKey or secretKey must be provided"
      );
    }
  }
  /**
   * Creates a new `Keypair` instance from secret. This can either be secret key or secret seed depending
   * on underlying public-key signature system. Currently `Keypair` only supports ed25519.
   * @param secret - secret key (ex. `SDAK....`)
   */
  static fromSecret(secret) {
    const rawSecret = StrKey.decodeEd25519SecretSeed(secret);
    return this.fromRawEd25519Seed(rawSecret);
  }
  /**
   * Creates a new `Keypair` object from ed25519 secret key seed raw bytes.
   *
   * @param rawSeed - raw 32-byte ed25519 secret key seed
   */
  static fromRawEd25519Seed(rawSeed) {
    return new this({ type: "ed25519", secretKey: rawSeed });
  }
  /**
   * Returns `Keypair` object representing network master key.
   * @param networkPassphrase - passphrase of the target stellar network (e.g. "Public Global Stellar Network ; September 2015")
   */
  static master(networkPassphrase) {
    if (!networkPassphrase) {
      throw new Error(
        "No network selected. Please pass a network argument, e.g. `Keypair.master(Networks.PUBLIC)`."
      );
    }
    return this.fromRawEd25519Seed(hash(networkPassphrase));
  }
  /**
   * Creates a new `Keypair` object from public key.
   * @param publicKey - public key (ex. `GB3KJPLFUYN5VL6R3GU3EGCGVCKFDSD7BEDX42HWG5BWFKB3KQGJJRMA`)
   */
  static fromPublicKey(publicKey) {
    const publicKeyBuffer = StrKey.decodeEd25519PublicKey(publicKey);
    if (publicKeyBuffer.length !== 32) {
      throw new Error("Invalid Stellar public key");
    }
    return new this({ type: "ed25519", publicKey: publicKeyBuffer });
  }
  /**
   * Create a random `Keypair` object.
   */
  static random() {
    const secretKey = utils.randomSecretKey();
    return this.fromRawEd25519Seed(import_buffer10.Buffer.from(secretKey));
  }
  /** Returns this public key as an xdr.AccountId. */
  xdrAccountId() {
    return types.PublicKey.publicKeyTypeEd25519(this._publicKey);
  }
  /** Returns this public key as an xdr.PublicKey. */
  xdrPublicKey() {
    return types.PublicKey.publicKeyTypeEd25519(this._publicKey);
  }
  /**
   * Creates a {@link xdr.MuxedAccount} object from the public key.
   *
   * You will get a different type of muxed account depending on whether or not
   * you pass an ID.
   *
   * @param id - (optional) stringified integer indicating the underlying muxed
   *     ID of the new account object
   */
  xdrMuxedAccount(id) {
    if (typeof id !== "undefined") {
      if (typeof id !== "string") {
        throw new TypeError(`expected string for ID, got ${typeof id}`);
      }
      return types.MuxedAccount.keyTypeMuxedEd25519(
        new types.MuxedAccountMed25519({
          id: types.Uint64.fromString(id),
          ed25519: this._publicKey
        })
      );
    }
    return types.MuxedAccount.keyTypeEd25519(this._publicKey);
  }
  /**
   * Returns raw public key bytes
   */
  rawPublicKey() {
    return this._publicKey;
  }
  /**
   * Returns the signature hint for this keypair.
   * The hint is the last 4 bytes of the account ID XDR representation.
   */
  signatureHint() {
    const a = this.xdrAccountId().toXDR();
    return a.subarray(a.length - 4);
  }
  /**
   * Returns public key associated with this `Keypair` object.
   */
  publicKey() {
    return StrKey.encodeEd25519PublicKey(this._publicKey);
  }
  /**
   * Returns secret key associated with this `Keypair` object.
   *
   * The secret key is encoded in Stellar format (e.g., `SDAK....`).
   *
   * @throws if no secret key is available
   */
  secret() {
    if (!this._secretSeed) {
      throw new Error("no secret key available");
    }
    if (this.type === "ed25519") {
      return StrKey.encodeEd25519SecretSeed(this._secretSeed);
    }
    throw new Error("Invalid Keypair type");
  }
  /**
   * Returns raw secret key bytes.
   *
   * @throws if no secret seed is available
   */
  rawSecretKey() {
    if (!this._secretSeed) {
      throw new Error("no secret seed available");
    }
    return this._secretSeed;
  }
  /**
   * Returns `true` if this `Keypair` object contains secret key and can sign.
   */
  canSign() {
    return !!this._secretKey;
  }
  /**
   * Signs data.
   *
   * @param data - data to sign
   * @throws if no secret key is available
   */
  sign(data) {
    if (!this._secretKey) {
      throw new Error("cannot sign: no secret key available");
    }
    return sign2(data, this._secretKey);
  }
  /**
   * Verifies if `signature` for `data` is valid.
   *
   * @param data - signed data
   * @param signature - signature to verify
   */
  verify(data, signature) {
    try {
      return verify2(data, signature, this._publicKey);
    } catch {
      return false;
    }
  }
  /**
   * Returns the decorated signature (hint+sig) for arbitrary data.
   *
   * The returned structure can be added directly to a transaction envelope.
   *
   * @param data - arbitrary data to sign
   *
   * @see TransactionBase.addDecoratedSignature
   */
  signDecorated(data) {
    const signature = this.sign(data);
    const hint = this.signatureHint();
    return new types.DecoratedSignature({ hint, signature });
  }
  /**
   * Returns the raw decorated signature (hint+sig) for a signed payload signer.
   *
   *  The hint is defined as the last 4 bytes of the signer key XORed with last
   *  4 bytes of the payload (zero-left-padded if necessary).
   *
   * @param data - data to both sign and treat as the payload
   *
   * @see https://github.com/stellar/stellar-protocol/blob/master/core/cap-0040.md#signature-hint
   * @see TransactionBase.addDecoratedSignature
   */
  signPayloadDecorated(data) {
    const dataBuffer = import_buffer10.Buffer.isBuffer(data) ? data : import_buffer10.Buffer.from(data);
    const signature = this.sign(dataBuffer);
    const keyHint = this.signatureHint();
    let hint = import_buffer10.Buffer.from(dataBuffer.subarray(-4));
    if (hint.length < 4) {
      hint = import_buffer10.Buffer.concat([hint, import_buffer10.Buffer.alloc(4 - hint.length, 0)]);
    }
    for (let i = 0; i < hint.length; i++) {
      hint[i] = hint[i] ^ keyHint[i];
    }
    return new types.DecoratedSignature({
      hint,
      signature
    });
  }
};

// node_modules/bignumber.js/dist/bignumber.mjs
var BigNumber = clone();
var isNumeric = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
var mathceil = Math.ceil;
var mathfloor = Math.floor;
var bignumberError = "[BigNumber Error] ";
var BASE = 1e14;
var LOG_BASE = 14;
var MAX_SAFE_INTEGER = 9007199254740991;
var POWS_TEN = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13];
var SQRT_BASE = 1e7;
var MAX = 1e9;
function clone(configObject) {
  var div, convertBase, basePrefix = /^(-?)0([xbo])(?=[^.])/i, isInfinityOrNaN = /^-?(Infinity|NaN)$/, whitespaceOrPlus = /^\s*\+(?!-)|^\s+|\s+$/g, P2 = BigNumber3.prototype = { constructor: BigNumber3, toString: null, valueOf: null }, ONE2 = new BigNumber3(1), DECIMAL_PLACES = 20, ROUNDING_MODE = 4, TO_EXP_NEG = -7, TO_EXP_POS = 21, MIN_EXP = -1e7, MAX_EXP = 1e7, CRYPTO = false, STRICT = true, MODULO_MODE = 1, POW_PRECISION = 0, FORMAT = {
    prefix: "",
    negativeSign: "-",
    positiveSign: "",
    groupSeparator: ",",
    groupSize: 3,
    secondaryGroupSize: 0,
    decimalSeparator: ".",
    fractionGroupSeparator: "",
    fractionGroupSize: 0,
    suffix: ""
  }, ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";
  function BigNumber3(v, b) {
    var e, i, str, t, x = this;
    if (!(x instanceof BigNumber3)) return new BigNumber3(v, b);
    t = typeof v;
    if (b == null) {
      if (isBigNumber(v)) {
        x.s = v.s;
        if (!v.c || v.e > MAX_EXP) {
          x.c = x.e = null;
        } else if (v.e < MIN_EXP) {
          x.c = [x.e = 0];
        } else {
          x.e = v.e;
          x.c = v.c.slice();
        }
        return;
      }
      if (t == "number") {
        if (v * 0 != 0) {
          x.s = isNaN(v) ? null : v < 0 ? -1 : 1;
          x.c = x.e = null;
          return;
        }
        x.s = 1 / v < 0 ? (v = -v, -1) : 1;
        if (v === ~~v) {
          for (e = 0, i = v; i >= 10; i /= 10, e++) ;
          if (e > MAX_EXP) {
            x.c = x.e = null;
          } else {
            x.e = e;
            x.c = [v];
          }
          return;
        }
        return parseValidString(x, String(v));
      }
      if (t == "bigint") {
        x.s = v < 0 ? (v = -v, -1) : 1;
        return parseValidString(x, String(v));
      }
      if (t == "string") {
        str = v;
      } else {
        if (STRICT) {
          throw Error(bignumberError + "BigNumber, string, number, or BigInt expected: " + v);
        }
        str = String(v);
      }
      if (isNumeric.test(str)) {
        x.s = str.charCodeAt(0) == 45 ? (str = str.slice(1), -1) : 1;
        return parseValidString(x, str);
      }
      str = str.replace(whitespaceOrPlus, "");
      if (isInfinityOrNaN.test(str)) {
        x.s = isNaN(str) ? null : str < 0 ? -1 : 1;
        x.c = x.e = null;
        return;
      }
      str = str.replace(basePrefix, function(m, p1, p2) {
        b = (p2 = p2.toLowerCase()) == "x" ? 16 : p2 == "b" ? 2 : 8;
        return p1;
      });
      if (b) {
        return parseBaseString(x, str, b, v);
      }
      str = str.replace(/(\d)_(?=\d)/g, "$1");
      if (isNumeric.test(str)) {
        x.s = str.charCodeAt(0) == 45 ? (str = str.slice(1), -1) : 1;
        return parseValidString(x, str);
      }
      if (STRICT) {
        throw Error(bignumberError + "Not a number: " + v);
      }
      x.s = x.c = x.e = null;
    } else {
      if (t != "string") {
        if (STRICT) {
          throw Error(bignumberError + "String expected: " + v);
        }
        v = String(v);
      }
      intCheck(b, 2, ALPHABET.length, "Base");
      parseBaseString(x, v.replace(whitespaceOrPlus, ""), b, v);
    }
  }
  BigNumber3.clone = clone;
  BigNumber3.ROUND_UP = 0;
  BigNumber3.ROUND_DOWN = 1;
  BigNumber3.ROUND_CEIL = 2;
  BigNumber3.ROUND_FLOOR = 3;
  BigNumber3.ROUND_HALF_UP = 4;
  BigNumber3.ROUND_HALF_DOWN = 5;
  BigNumber3.ROUND_HALF_EVEN = 6;
  BigNumber3.ROUND_HALF_CEIL = 7;
  BigNumber3.ROUND_HALF_FLOOR = 8;
  BigNumber3.EUCLID = 9;
  BigNumber3.config = BigNumber3.set = function(obj) {
    var p, v;
    if (obj != null) {
      if (typeof obj == "object") {
        if (obj.hasOwnProperty(p = "DECIMAL_PLACES")) {
          DECIMAL_PLACES = intCheck(obj[p], 0, MAX, p);
        }
        if (obj.hasOwnProperty(p = "ROUNDING_MODE")) {
          ROUNDING_MODE = intCheck(obj[p], 0, 8, p);
        }
        if (obj.hasOwnProperty(p = "EXPONENTIAL_AT")) {
          v = obj[p];
          if (isArray(v)) {
            intCheck(v[0], -MAX, 0, p);
            intCheck(v[1], 0, MAX, p);
            TO_EXP_NEG = v[0];
            TO_EXP_POS = v[1];
          } else {
            TO_EXP_NEG = -(TO_EXP_POS = intCheck(v, -MAX, MAX, p) < 0 ? -v : v);
          }
        }
        if (obj.hasOwnProperty(p = "RANGE")) {
          v = obj[p];
          if (v) {
            if (isArray(v)) {
              intCheck(v[0], -MAX, -1, p);
              intCheck(v[1], 1, MAX, p);
              MIN_EXP = v[0];
              MAX_EXP = v[1];
            } else {
              MIN_EXP = -(MAX_EXP = intCheck(v, -MAX, MAX, p) < 0 ? -v : v);
            }
          } else {
            throw Error(bignumberError + p + " cannot be zero: " + v);
          }
        }
        if (obj.hasOwnProperty(p = "CRYPTO")) {
          v = obj[p];
          if (v === !!v) {
            if (v) {
              if (typeof crypto != "undefined" && crypto && (crypto.getRandomValues || crypto.randomBytes)) {
                CRYPTO = v;
              } else {
                CRYPTO = !v;
                throw Error(bignumberError + "crypto unavailable");
              }
            } else {
              CRYPTO = v;
            }
          } else {
            throw Error(bignumberError + p + " not true or false: " + v);
          }
        }
        if (obj.hasOwnProperty(p = "STRICT")) {
          v = obj[p];
          if (v === !!v) {
            STRICT = v;
          } else {
            throw Error(bignumberError + p + " not true or false: " + v);
          }
        }
        if (obj.hasOwnProperty(p = "MODULO_MODE")) {
          MODULO_MODE = intCheck(obj[p], 0, 9, p);
        }
        if (obj.hasOwnProperty(p = "POW_PRECISION")) {
          POW_PRECISION = intCheck(obj[p], 0, MAX, p);
        }
        if (obj.hasOwnProperty(p = "FORMAT")) {
          v = obj[p];
          if (typeof v == "object") {
            for (p in v) {
              if (v.hasOwnProperty(p) && FORMAT.hasOwnProperty(p)) {
                FORMAT[p] = v[p];
              }
            }
          } else {
            throw Error(bignumberError + p + " not an object: " + v);
          }
        }
        if (obj.hasOwnProperty(p = "ALPHABET")) {
          v = obj[p];
          if (typeof v == "string" && !/^.?$|[+\-.\s]|(.).*\1/.test(v)) {
            ALPHABET = v;
          } else {
            throw Error(bignumberError + p + " invalid: " + v);
          }
        }
      } else {
        throw Error(bignumberError + "Object expected: " + obj);
      }
    }
    return {
      DECIMAL_PLACES,
      ROUNDING_MODE,
      EXPONENTIAL_AT: [TO_EXP_NEG, TO_EXP_POS],
      RANGE: [MIN_EXP, MAX_EXP],
      CRYPTO,
      STRICT,
      MODULO_MODE,
      POW_PRECISION,
      FORMAT,
      ALPHABET
    };
  };
  BigNumber3.fromFormat = function(str, options) {
    if (typeof str !== "string") {
      throw Error(bignumberError + "Not a string: " + str);
    }
    if (options == null) {
      options = FORMAT;
    } else if (typeof options != "object") {
      throw Error(bignumberError + "Argument not an object: " + options);
    } else {
      options = resolveFormatOptions(options);
    }
    var i, isNeg, integerPart, fractionPart, negativeSign = options.negativeSign || "-", positiveSign = options.positiveSign || "", prefix = options.prefix || "", suffix = options.suffix || "", groupSeparator = options.groupSeparator || "", decimalSeparator = options.decimalSeparator || ".", fractionGroupSeparator = options.fractionGroupSeparator || "";
    if (prefix && str.indexOf(prefix) === 0) str = str.slice(prefix.length);
    if (suffix && str.lastIndexOf(suffix) === str.length - suffix.length) {
      str = str.slice(0, -suffix.length);
    }
    if (negativeSign && str.indexOf(negativeSign) === 0) {
      str = str.slice(negativeSign.length);
      isNeg = true;
    } else if (positiveSign && str.indexOf(positiveSign) === 0) {
      str = str.slice(positiveSign.length);
    }
    i = str.indexOf(decimalSeparator);
    if (i < 0) {
      if (groupSeparator) {
        while (str.indexOf(groupSeparator) > -1) {
          str = str.replace(groupSeparator, "");
        }
      }
    } else {
      integerPart = str.slice(0, i);
      fractionPart = str.slice(i + decimalSeparator.length);
      if (groupSeparator) {
        while (integerPart.indexOf(groupSeparator) > -1) {
          integerPart = integerPart.replace(groupSeparator, "");
        }
      }
      if (fractionGroupSeparator) {
        while (fractionPart.indexOf(fractionGroupSeparator) > -1) {
          fractionPart = fractionPart.replace(fractionGroupSeparator, "");
        }
      }
      str = integerPart + "." + fractionPart;
    }
    return new BigNumber3(isNeg ? "-" + str : str);
  };
  BigNumber3.isBigNumber = function(v) {
    if (!isBigNumber(v)) return false;
    var i, n, c = v.c, e = v.e, s = v.s;
    if (!isArray(c)) {
      return c === null && e === null && (s === null || s === 1 || s === -1);
    }
    if (s !== 1 && s !== -1 || e < -MAX || e > MAX || e !== mathfloor(e)) {
      return false;
    }
    if (c[0] === 0) {
      return e === 0 && c.length === 1;
    }
    i = (e + 1) % LOG_BASE;
    if (i < 1) i += LOG_BASE;
    if (String(c[0]).length !== i) {
      return false;
    }
    for (i = 0; i < c.length; i++) {
      n = c[i];
      if (n < 0 || n >= BASE || n !== mathfloor(n)) return false;
    }
    return n !== 0;
  };
  BigNumber3.maximum = BigNumber3.max = function() {
    return maxOrMin(arguments, -1);
  };
  BigNumber3.minimum = BigNumber3.min = function() {
    return maxOrMin(arguments, 1);
  };
  BigNumber3.random = (function() {
    var pow2_53 = 9007199254740992;
    var random53bitInt = Math.random() * pow2_53 & 2097151 ? function() {
      return mathfloor(Math.random() * pow2_53);
    } : function() {
      return (Math.random() * 1073741824 | 0) * 8388608 + (Math.random() * 8388608 | 0);
    };
    return function(dp) {
      var a, b, e, k, v, i = 0, c = [], rand = new BigNumber3(ONE2);
      dp = dp == null ? DECIMAL_PLACES : intCheck(dp, 0, MAX);
      k = mathceil(dp / LOG_BASE);
      if (CRYPTO) {
        if (crypto.getRandomValues) {
          a = crypto.getRandomValues(new Uint32Array(k *= 2));
          for (; i < k; ) {
            v = a[i] * 131072 + (a[i + 1] >>> 11);
            if (v >= 9e15) {
              b = crypto.getRandomValues(new Uint32Array(2));
              a[i] = b[0];
              a[i + 1] = b[1];
            } else {
              c.push(v % 1e14);
              i += 2;
            }
          }
          i = k / 2;
        } else if (crypto.randomBytes) {
          a = crypto.randomBytes(k *= 7);
          for (; i < k; ) {
            v = (a[i] & 31) * 281474976710656 + a[i + 1] * 1099511627776 + a[i + 2] * 4294967296 + a[i + 3] * 16777216 + (a[i + 4] << 16) + (a[i + 5] << 8) + a[i + 6];
            if (v >= 9e15) {
              crypto.randomBytes(7).copy(a, i);
            } else {
              c.push(v % 1e14);
              i += 7;
            }
          }
          i = k / 7;
        } else {
          CRYPTO = false;
          throw Error(bignumberError + "crypto unavailable");
        }
      }
      if (!CRYPTO) {
        for (; i < k; ) {
          v = random53bitInt();
          if (v < 9e15) c[i++] = v % 1e14;
        }
      }
      k = c[--i];
      dp %= LOG_BASE;
      if (k && dp) {
        v = POWS_TEN[LOG_BASE - dp];
        c[i] = mathfloor(k / v) * v;
      }
      for (; c[i] === 0; c.pop(), i--) ;
      if (i < 0) {
        c = [e = 0];
      } else {
        for (e = -1; c[0] === 0; c.splice(0, 1), e -= LOG_BASE) ;
        for (i = 1, v = c[0]; v >= 10; v /= 10, i++) ;
        if (i < LOG_BASE) e -= LOG_BASE - i;
      }
      rand.e = e;
      rand.c = c;
      return rand;
    };
  })();
  BigNumber3.sum = function() {
    var i = 0, sum = new BigNumber3(0);
    for (; i < arguments.length; ) sum = sum.plus(arguments[i++]);
    return sum;
  };
  function parseValidString(x, str) {
    var e, i, len;
    if ((e = str.indexOf(".")) > -1) str = str.replace(".", "");
    if ((i = str.search(/e/i)) > 0) {
      if (e < 0) e = i;
      e += +str.slice(i + 1);
      str = str.substring(0, i);
    } else if (e < 0) {
      e = str.length;
    }
    for (i = 0; str.charCodeAt(i) === 48; i++) ;
    for (len = str.length; str.charCodeAt(--len) === 48; ) ;
    if (str = str.slice(i, ++len)) {
      len -= i;
      e = e - i - 1;
      if (e > MAX_EXP) {
        x.c = x.e = null;
      } else if (e < MIN_EXP) {
        x.c = [x.e = 0];
      } else {
        x.e = e;
        x.c = [];
        i = (e + 1) % LOG_BASE;
        if (e < 0) i += LOG_BASE;
        if (i < len) {
          if (i) x.c.push(+str.slice(0, i));
          for (len -= LOG_BASE; i < len; ) {
            x.c.push(+str.slice(i, i += LOG_BASE));
          }
          i = LOG_BASE - (str = str.slice(i)).length;
        } else {
          i -= len;
        }
        for (; i--; str += "0") ;
        x.c.push(+str);
      }
    } else {
      x.c = [x.e = 0];
    }
  }
  function parseBaseString(x, str, b, v) {
    var c, len, alphabet = ALPHABET.slice(0, b), i = 0, clean2 = "", hasDot = false, prevIsNumeral = false, caseChanged = false;
    x.s = str.charCodeAt(0) === 45 ? (str = str.slice(1), -1) : 1;
    for (len = str.length; i < len; i++) {
      c = str.charAt(i);
      if (alphabet.indexOf(c) >= 0) {
        clean2 += c;
        prevIsNumeral = true;
        continue;
      }
      if (c == "_") {
        if (prevIsNumeral && i + 1 < len) {
          prevIsNumeral = false;
          continue;
        }
      } else if (c == ".") {
        if (i == 0 || !hasDot && prevIsNumeral) {
          if (i + 1 == len) break;
          if (i == 0) clean2 = "0";
          clean2 += c;
          hasDot = true;
          prevIsNumeral = false;
          continue;
        }
      } else if (!caseChanged) {
        if (str == str.toUpperCase() && alphabet == alphabet.toLowerCase() && (str = str.toLowerCase()) || str == str.toLowerCase() && alphabet == alphabet.toUpperCase() && (str = str.toUpperCase())) {
          i = -1;
          clean2 = "";
          caseChanged = true;
          hasDot = prevIsNumeral = false;
          continue;
        }
      }
      if (STRICT) {
        throw Error(bignumberError + "Not a base " + b + " number: " + v);
      }
      x.s = x.c = x.e = null;
      return;
    }
    parseValidString(x, convertBase(clean2, b, 10, x.s));
  }
  convertBase = /* @__PURE__ */ (function() {
    var decimal = "0123456789";
    function toBaseOut(str, baseIn, baseOut, alphabet) {
      var j, arr = [0], arrL, i = 0, len = str.length;
      for (; i < len; ) {
        for (arrL = arr.length; arrL--; arr[arrL] *= baseIn) ;
        arr[0] += alphabet.indexOf(str.charAt(i++));
        for (j = 0; j < arr.length; j++) {
          if (arr[j] > baseOut - 1) {
            if (arr[j + 1] == null) arr[j + 1] = 0;
            arr[j + 1] += arr[j] / baseOut | 0;
            arr[j] %= baseOut;
          }
        }
      }
      return arr.reverse();
    }
    return function(str, baseIn, baseOut, sign3, callerIsToString) {
      var alphabet, d, e, k, r, x, xc, y, i = str.indexOf("."), dp = DECIMAL_PLACES, rm = ROUNDING_MODE;
      if (i >= 0) {
        k = POW_PRECISION;
        POW_PRECISION = 0;
        str = str.replace(".", "");
        y = new BigNumber3(baseIn);
        x = y.pow(str.length - i);
        POW_PRECISION = k;
        y.c = toBaseOut(
          toFixedPoint(coeffToString(x.c), x.e, "0"),
          10,
          baseOut,
          decimal
        );
        y.e = y.c.length;
      }
      xc = toBaseOut(str, baseIn, baseOut, callerIsToString ? (alphabet = ALPHABET, decimal) : (alphabet = decimal, ALPHABET));
      e = k = xc.length;
      for (; xc[--k] == 0; xc.pop()) ;
      if (!xc[0]) return alphabet.charAt(0);
      if (i < 0) {
        --e;
      } else {
        x.c = xc;
        x.e = e;
        x.s = sign3;
        x = div(x, y, dp, rm, baseOut);
        xc = x.c;
        r = x.r;
        e = x.e;
      }
      d = e + dp + 1;
      i = xc[d];
      k = baseOut / 2;
      r = r || d < 0 || xc[d + 1] != null;
      r = rm < 4 ? (i != null || r) && (rm == 0 || rm == (x.s < 0 ? 3 : 2)) : i > k || i == k && (rm == 4 || r || rm == 6 && xc[d - 1] & 1 || rm == (x.s < 0 ? 8 : 7));
      if (d < 1 || !xc[0]) {
        str = r ? toFixedPoint(alphabet.charAt(1), -dp, alphabet.charAt(0)) : alphabet.charAt(0);
      } else {
        if (d < xc.length) xc.length = d;
        if (r) {
          for (--baseOut; ++xc[--d] > baseOut; ) {
            xc[d] = 0;
            if (!d) {
              ++e;
              xc = [1].concat(xc);
            }
          }
        }
        for (k = xc.length; !xc[--k]; ) ;
        for (i = 0, str = ""; i <= k; str += alphabet.charAt(xc[i++])) ;
        str = toFixedPoint(str, e, alphabet.charAt(0));
      }
      return str;
    };
  })();
  div = /* @__PURE__ */ (function() {
    function multiply(x, k, base) {
      var m, temp, xlo, xhi, carry = 0, i = x.length, klo = k % SQRT_BASE, khi = k / SQRT_BASE | 0;
      for (x = x.slice(); i--; ) {
        xlo = x[i] % SQRT_BASE;
        xhi = x[i] / SQRT_BASE | 0;
        m = khi * xlo + xhi * klo;
        temp = klo * xlo + m % SQRT_BASE * SQRT_BASE + carry;
        carry = (temp / base | 0) + (m / SQRT_BASE | 0) + khi * xhi;
        x[i] = temp % base;
      }
      if (carry) x = [carry].concat(x);
      return x;
    }
    function compare2(a, b, aL, bL) {
      var i, cmp;
      if (aL != bL) {
        cmp = aL > bL ? 1 : -1;
      } else {
        for (i = cmp = 0; i < aL; i++) {
          if (a[i] != b[i]) {
            cmp = a[i] > b[i] ? 1 : -1;
            break;
          }
        }
      }
      return cmp;
    }
    function subtract(a, b, aL, base) {
      var i = 0;
      for (; aL--; ) {
        a[aL] -= i;
        i = a[aL] < b[aL] ? 1 : 0;
        a[aL] = i * base + a[aL] - b[aL];
      }
      for (; !a[0] && a.length > 1; a.splice(0, 1)) ;
    }
    return function(x, y, dp, rm, base) {
      var cmp, e, i, more, n, prod, prodL, q, qc, rem, remL, rem0, xi, xL, yc0, yL, yz, s = x.s == y.s ? 1 : -1, xc = x.c, yc = y.c;
      if (!xc || !xc[0] || !yc || !yc[0]) {
        return new BigNumber3(
          // Return NaN if either NaN, or both Infinity or 0.
          !x.s || !y.s || (xc ? yc && xc[0] == yc[0] : !yc) ? NaN : (
            // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
            xc && xc[0] == 0 || !yc ? s * 0 : s / 0
          )
        );
      }
      q = new BigNumber3(s);
      qc = q.c = [];
      e = x.e - y.e;
      s = dp + e + 1;
      if (!base) {
        base = BASE;
        e = bitFloor(x.e / LOG_BASE) - bitFloor(y.e / LOG_BASE);
        s = s / LOG_BASE | 0;
      }
      for (i = 0; yc[i] == (xc[i] || 0); i++) ;
      if (yc[i] > (xc[i] || 0)) e--;
      if (s < 0) {
        qc.push(1);
        more = true;
      } else {
        xL = xc.length;
        yL = yc.length;
        i = 0;
        s += 2;
        n = mathfloor(base / (yc[0] + 1));
        if (n > 1) {
          yc = multiply(yc, n, base);
          xc = multiply(xc, n, base);
          yL = yc.length;
          xL = xc.length;
        }
        xi = yL;
        rem = xc.slice(0, yL);
        remL = rem.length;
        for (; remL < yL; rem[remL++] = 0) ;
        yz = yc.slice();
        yz = [0].concat(yz);
        yc0 = yc[0];
        if (yc[1] >= base / 2) yc0++;
        do {
          n = 0;
          cmp = compare2(yc, rem, yL, remL);
          if (cmp < 0) {
            rem0 = rem[0];
            if (yL != remL) rem0 = rem0 * base + (rem[1] || 0);
            n = mathfloor(rem0 / yc0);
            if (n > 1) {
              if (n >= base) n = base - 1;
              prod = multiply(yc, n, base);
              prodL = prod.length;
              remL = rem.length;
              while (compare2(prod, rem, prodL, remL) == 1) {
                n--;
                subtract(prod, yL < prodL ? yz : yc, prodL, base);
                prodL = prod.length;
                cmp = 1;
              }
            } else {
              if (n == 0) {
                cmp = n = 1;
              }
              prod = yc.slice();
              prodL = prod.length;
            }
            if (prodL < remL) prod = [0].concat(prod);
            subtract(rem, prod, remL, base);
            remL = rem.length;
            if (cmp == -1) {
              while (compare2(yc, rem, yL, remL) < 1) {
                n++;
                subtract(rem, yL < remL ? yz : yc, remL, base);
                remL = rem.length;
              }
            }
          } else if (cmp === 0) {
            n++;
            rem = [0];
          }
          qc[i++] = n;
          if (rem[0]) {
            rem[remL++] = xc[xi] || 0;
          } else {
            rem = [xc[xi]];
            remL = 1;
          }
        } while ((xi++ < xL || rem[0] != null) && s--);
        more = rem[0] != null;
        if (!qc[0]) qc.splice(0, 1);
      }
      if (base == BASE) {
        for (i = 1, s = qc[0]; s >= 10; s /= 10, i++) ;
        round(q, dp + (q.e = i + e * LOG_BASE - 1) + 1, rm, more);
      } else {
        q.e = e;
        q.r = +more;
      }
      return q;
    };
  })();
  function format(n, i, rm, id) {
    var c0, e, ne, len, str;
    rm = rm == null ? ROUNDING_MODE : intCheck(rm, 0, 8);
    if (!n.c) return n.toString();
    c0 = n.c[0];
    ne = n.e;
    if (i == null) {
      str = coeffToString(n.c);
      str = id == 1 || id == 2 && (ne <= TO_EXP_NEG || ne >= TO_EXP_POS) ? toExponential(str, ne) : toFixedPoint(str, ne, "0");
    } else {
      n = round(new BigNumber3(n), i, rm);
      e = n.e;
      str = coeffToString(n.c);
      len = str.length;
      if (id == 1 || id == 2 && (i <= e || e <= TO_EXP_NEG)) {
        for (; len < i; str += "0", len++) ;
        str = toExponential(str, e);
      } else {
        i -= ne + (id === 2 && e > ne);
        str = toFixedPoint(str, e, "0");
        if (e + 1 > len) {
          if (--i > 0) for (str += "."; i--; str += "0") ;
        } else {
          i += e - len;
          if (i > 0) {
            if (e + 1 == len) str += ".";
            for (; i--; str += "0") ;
          }
        }
      }
    }
    return n.s < 0 && c0 ? "-" + str : str;
  }
  function isBigNumber(v) {
    return v instanceof BigNumber3 || !!v && v._isBigNumber === true;
  }
  function maxOrMin(args, n) {
    var k, y, i = 1, x = new BigNumber3(args[0]);
    for (; i < args.length; i++) {
      y = new BigNumber3(args[i]);
      if (!y.s || (k = compare(x, y)) === n || k === 0 && x.s === n) {
        x = y;
      }
    }
    return x;
  }
  function normalise(n, c, e) {
    var i = 1, j = c.length;
    for (; !c[--j]; c.pop()) ;
    for (j = c[0]; j >= 10; j /= 10, i++) ;
    if ((e = i + e * LOG_BASE - 1) > MAX_EXP) {
      n.c = n.e = null;
    } else if (e < MIN_EXP) {
      n.c = [n.e = 0];
    } else {
      n.e = e;
      n.c = c;
    }
    return n;
  }
  function resolveFormatOptions(options) {
    var key, resolved = {};
    for (key in FORMAT) {
      if (FORMAT.hasOwnProperty(key)) {
        resolved[key] = options.hasOwnProperty(key) ? options[key] : FORMAT[key];
      }
    }
    return resolved;
  }
  function round(x, sd, rm, r) {
    var d, i, j, k, n, ni, rd, xc = x.c, pows10 = POWS_TEN;
    if (xc) {
      out: {
        for (d = 1, k = xc[0]; k >= 10; k /= 10, d++) ;
        i = sd - d;
        if (i < 0) {
          i += LOG_BASE;
          j = sd;
          n = xc[ni = 0];
          rd = mathfloor(n / pows10[d - j - 1] % 10);
        } else {
          ni = mathceil((i + 1) / LOG_BASE);
          if (ni >= xc.length) {
            if (r) {
              for (; xc.length <= ni; xc.push(0)) ;
              n = rd = 0;
              d = 1;
              i %= LOG_BASE;
              j = i - LOG_BASE + 1;
            } else {
              break out;
            }
          } else {
            n = k = xc[ni];
            for (d = 1; k >= 10; k /= 10, d++) ;
            i %= LOG_BASE;
            j = i - LOG_BASE + d;
            rd = j < 0 ? 0 : mathfloor(n / pows10[d - j - 1] % 10);
          }
        }
        r = r || sd < 0 || // Are there any non-zero digits after the rounding digit?
        // The expression  n % pows10[d - j - 1]  returns all digits of n to the right
        // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
        xc[ni + 1] != null || (j < 0 ? n : n % pows10[d - j - 1]);
        r = rm < 4 ? (rd || r) && (rm == 0 || rm == (x.s < 0 ? 3 : 2)) : rd > 5 || rd == 5 && (rm == 4 || r || rm == 6 && // Check whether the digit to the left of the rounding digit is odd.
        (i > 0 ? j > 0 ? n / pows10[d - j] : 0 : xc[ni - 1]) % 10 & 1 || rm == (x.s < 0 ? 8 : 7));
        if (sd < 1 || !xc[0]) {
          xc.length = 0;
          if (r) {
            sd -= x.e + 1;
            xc[0] = pows10[(LOG_BASE - sd % LOG_BASE) % LOG_BASE];
            x.e = -sd || 0;
          } else {
            xc[0] = x.e = 0;
          }
          return x;
        }
        if (i == 0) {
          xc.length = ni;
          k = 1;
          ni--;
        } else {
          xc.length = ni + 1;
          k = pows10[LOG_BASE - i];
          xc[ni] = j > 0 ? mathfloor(n / pows10[d - j] % pows10[j]) * k : 0;
        }
        if (r) {
          for (; ; ) {
            if (ni == 0) {
              for (i = 1, j = xc[0]; j >= 10; j /= 10, i++) ;
              j = xc[0] += k;
              for (k = 1; j >= 10; j /= 10, k++) ;
              if (i != k) {
                x.e++;
                if (xc[0] == BASE) xc[0] = 1;
              }
              break;
            } else {
              xc[ni] += k;
              if (xc[ni] != BASE) break;
              xc[ni--] = 0;
              k = 1;
            }
          }
        }
        for (i = xc.length; xc[--i] === 0; xc.pop()) ;
      }
      if (x.e > MAX_EXP) {
        x.c = x.e = null;
      } else if (x.e < MIN_EXP) {
        x.c = [x.e = 0];
      }
    }
    return x;
  }
  function valueOf(n) {
    var str, e = n.e;
    if (e === null) return n.toString();
    str = coeffToString(n.c);
    str = e <= TO_EXP_NEG || e >= TO_EXP_POS ? toExponential(str, e) : toFixedPoint(str, e, "0");
    return n.s < 0 ? "-" + str : str;
  }
  P2.absoluteValue = P2.abs = function() {
    var x = new BigNumber3(this);
    if (x.s < 0) x.s = 1;
    return x;
  };
  P2.comparedTo = function(y, b) {
    return compare(this, new BigNumber3(y, b));
  };
  P2.decimalPlaces = P2.dp = function(dp, rm) {
    var c, n, v, x = this;
    if (dp != null) {
      return round(
        new BigNumber3(x),
        intCheck(dp, -MAX, MAX) + x.e + 1,
        rm == null ? ROUNDING_MODE : intCheck(rm, 0, 8)
      );
    }
    if (!(c = x.c)) return null;
    n = ((v = c.length - 1) - bitFloor(this.e / LOG_BASE)) * LOG_BASE;
    if (v = c[v]) for (; v % 10 == 0; v /= 10, n--) ;
    if (n < 0) n = 0;
    return n;
  };
  P2.dividedBy = P2.div = function(y, b) {
    return div(this, new BigNumber3(y, b), DECIMAL_PLACES, ROUNDING_MODE);
  };
  P2.dividedToIntegerBy = P2.idiv = function(y, b) {
    return div(this, new BigNumber3(y, b), 0, 1);
  };
  P2.exponentiatedBy = P2.pow = function(n, m) {
    var half, isModExp, i, k, more, nIsBig, nIsNeg, nIsOdd, y, x = this;
    n = new BigNumber3(n);
    if (n.c && !n.isInteger()) {
      throw Error(bignumberError + "Exponent not an integer: " + valueOf(n));
    }
    if (m != null) m = new BigNumber3(m);
    nIsBig = n.e > 14;
    if (!x.c || !x.c[0] || x.c[0] == 1 && !x.e && x.c.length == 1 || !n.c || !n.c[0]) {
      y = new BigNumber3(Math.pow(+valueOf(x), nIsBig ? n.s * (2 - isOdd(n)) : +valueOf(n)));
      return m ? y.mod(m) : y;
    }
    nIsNeg = n.s < 0;
    if (m) {
      if (m.c ? !m.c[0] : !m.s) return new BigNumber3(NaN);
      isModExp = !nIsNeg && x.isInteger() && m.isInteger();
      if (isModExp) x = x.mod(m);
    } else if (n.e > 9 && (x.e > 0 || x.e < -1 || (x.e == 0 ? x.c[0] > 1 || nIsBig && x.c[1] >= 24e7 : x.c[0] < 8e13 || nIsBig && x.c[0] <= 9999975e7))) {
      k = x.s < 0 && isOdd(n) ? -0 : 0;
      if (x.e > -1) k = 1 / k;
      return new BigNumber3(nIsNeg ? 1 / k : k);
    } else if (POW_PRECISION) {
      k = mathceil(POW_PRECISION / LOG_BASE + 2);
    }
    if (nIsBig) {
      half = new BigNumber3(0.5);
      if (nIsNeg) n.s = 1;
      nIsOdd = isOdd(n);
    } else {
      i = Math.abs(+valueOf(n));
      nIsOdd = i % 2;
    }
    y = new BigNumber3(ONE2);
    for (; ; ) {
      if (nIsOdd) {
        y = y.times(x);
        if (!y.c) break;
        if (k) {
          if (y.c.length > k) y.c.length = k;
        } else if (isModExp) {
          y = y.mod(m);
        }
      }
      if (i) {
        i = mathfloor(i / 2);
        if (i === 0) break;
        nIsOdd = i % 2;
      } else {
        n = n.times(half);
        round(n, n.e + 1, 1);
        if (n.e > 14) {
          nIsOdd = isOdd(n);
        } else {
          i = +valueOf(n);
          if (i === 0) break;
          nIsOdd = i % 2;
        }
      }
      x = x.times(x);
      if (k) {
        if (x.c && x.c.length > k) x.c.length = k;
      } else if (isModExp) {
        x = x.mod(m);
      }
    }
    if (isModExp) return y;
    if (nIsNeg) y = ONE2.div(y);
    return m ? y.mod(m) : k ? round(y, POW_PRECISION, ROUNDING_MODE, more) : y;
  };
  P2.integerValue = function(rm) {
    var n = new BigNumber3(this);
    return round(n, n.e + 1, rm == null ? ROUNDING_MODE : intCheck(rm, 0, 8));
  };
  P2.isEqualTo = P2.eq = function(y, b) {
    return compare(this, new BigNumber3(y, b)) === 0;
  };
  P2.isFinite = function() {
    return !!this.c;
  };
  P2.isGreaterThan = P2.gt = function(y, b) {
    return compare(this, new BigNumber3(y, b)) > 0;
  };
  P2.isGreaterThanOrEqualTo = P2.gte = function(y, b) {
    return (b = compare(this, new BigNumber3(y, b))) === 1 || b === 0;
  };
  P2.isInteger = function() {
    return !!this.c && bitFloor(this.e / LOG_BASE) > this.c.length - 2;
  };
  P2.isLessThan = P2.lt = function(y, b) {
    return compare(this, new BigNumber3(y, b)) < 0;
  };
  P2.isLessThanOrEqualTo = P2.lte = function(y, b) {
    return (b = compare(this, new BigNumber3(y, b))) === -1 || b === 0;
  };
  P2.isNaN = function() {
    return !this.s;
  };
  P2.isNegative = function() {
    return this.s < 0;
  };
  P2.isPositive = function() {
    return this.s > 0;
  };
  P2.isZero = function() {
    return !!this.c && this.c[0] == 0;
  };
  P2.minus = function(y, b) {
    var i, j, t, xLTy, x = this, a = x.s;
    y = new BigNumber3(y, b);
    b = y.s;
    if (!a || !b) return new BigNumber3(NaN);
    if (a != b) {
      y.s = -b;
      return x.plus(y);
    }
    var xe = x.e / LOG_BASE, ye = y.e / LOG_BASE, xc = x.c, yc = y.c;
    if (!xe || !ye) {
      if (!xc || !yc) return xc ? (y.s = -b, y) : new BigNumber3(yc ? x : NaN);
      if (!xc[0] || !yc[0]) {
        return yc[0] ? (y.s = -b, y) : new BigNumber3(xc[0] ? x : (
          // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
          ROUNDING_MODE == 3 ? -0 : 0
        ));
      }
    }
    xe = bitFloor(xe);
    ye = bitFloor(ye);
    xc = xc.slice();
    if (a = xe - ye) {
      if (xLTy = a < 0) {
        a = -a;
        t = xc;
      } else {
        ye = xe;
        t = yc;
      }
      t.reverse();
      for (b = a; b--; t.push(0)) ;
      t.reverse();
    } else {
      j = (xLTy = (a = xc.length) < (b = yc.length)) ? a : b;
      for (a = b = 0; b < j; b++) {
        if (xc[b] != yc[b]) {
          xLTy = xc[b] < yc[b];
          break;
        }
      }
    }
    if (xLTy) {
      t = xc;
      xc = yc;
      yc = t;
      y.s = -y.s;
    }
    b = (j = yc.length) - (i = xc.length);
    if (b > 0) for (; b--; xc[i++] = 0) ;
    b = BASE - 1;
    for (; j > a; ) {
      if (xc[--j] < yc[j]) {
        for (i = j; i && !xc[--i]; xc[i] = b) ;
        --xc[i];
        xc[j] += BASE;
      }
      xc[j] -= yc[j];
    }
    for (; xc[0] == 0; xc.splice(0, 1), --ye) ;
    if (!xc[0]) {
      y.s = ROUNDING_MODE == 3 ? -1 : 1;
      y.c = [y.e = 0];
      return y;
    }
    return normalise(y, xc, ye);
  };
  P2.modulo = P2.mod = function(y, b) {
    var q, s, x = this;
    y = new BigNumber3(y, b);
    if (!x.c || !y.s || y.c && !y.c[0]) {
      return new BigNumber3(NaN);
    } else if (!y.c || x.c && !x.c[0]) {
      return new BigNumber3(x);
    }
    if (MODULO_MODE == 9) {
      s = y.s;
      y.s = 1;
      q = div(x, y, 0, 3);
      y.s = s;
      q.s *= s;
    } else {
      q = div(x, y, 0, MODULO_MODE);
    }
    y = x.minus(q.times(y));
    if (!y.c[0] && MODULO_MODE == 1) y.s = x.s;
    return y;
  };
  P2.multipliedBy = P2.times = function(y, b) {
    var c, e, i, j, k, m, xcL, xlo, xhi, ycL, ylo, yhi, zc, base, sqrtBase, x = this, xc = x.c, yc = (y = new BigNumber3(y, b)).c;
    if (!xc || !yc || !xc[0] || !yc[0]) {
      if (!x.s || !y.s || xc && !xc[0] && !yc || yc && !yc[0] && !xc) {
        y.c = y.e = y.s = null;
      } else {
        y.s *= x.s;
        if (!xc || !yc) {
          y.c = y.e = null;
        } else {
          y.c = [0];
          y.e = 0;
        }
      }
      return y;
    }
    e = bitFloor(x.e / LOG_BASE) + bitFloor(y.e / LOG_BASE);
    y.s *= x.s;
    xcL = xc.length;
    ycL = yc.length;
    if (xcL < ycL) {
      zc = xc;
      xc = yc;
      yc = zc;
      i = xcL;
      xcL = ycL;
      ycL = i;
    }
    for (i = xcL + ycL, zc = []; i--; zc.push(0)) ;
    base = BASE;
    sqrtBase = SQRT_BASE;
    for (i = ycL; --i >= 0; ) {
      c = 0;
      ylo = yc[i] % sqrtBase;
      yhi = yc[i] / sqrtBase | 0;
      for (k = xcL, j = i + k; j > i; ) {
        xlo = xc[--k] % sqrtBase;
        xhi = xc[k] / sqrtBase | 0;
        m = yhi * xlo + xhi * ylo;
        xlo = ylo * xlo + m % sqrtBase * sqrtBase + zc[j] + c;
        c = (xlo / base | 0) + (m / sqrtBase | 0) + yhi * xhi;
        zc[j--] = xlo % base;
      }
      zc[j] = c;
    }
    if (c) {
      ++e;
    } else {
      zc.splice(0, 1);
    }
    return normalise(y, zc, e);
  };
  P2.negated = function() {
    var x = new BigNumber3(this);
    x.s = -x.s || null;
    return x;
  };
  P2.plus = function(y, b) {
    var t, x = this, a = x.s;
    y = new BigNumber3(y, b);
    b = y.s;
    if (!a || !b) return new BigNumber3(NaN);
    if (a != b) {
      y.s = -b;
      return x.minus(y);
    }
    var xe = x.e / LOG_BASE, ye = y.e / LOG_BASE, xc = x.c, yc = y.c;
    if (!xe || !ye) {
      if (!xc || !yc) return new BigNumber3(a / 0);
      if (!xc[0] || !yc[0]) return yc[0] ? y : new BigNumber3(xc[0] ? x : a * 0);
    }
    xe = bitFloor(xe);
    ye = bitFloor(ye);
    xc = xc.slice();
    if (a = xe - ye) {
      if (a > 0) {
        ye = xe;
        t = yc;
      } else {
        a = -a;
        t = xc;
      }
      t.reverse();
      for (; a--; t.push(0)) ;
      t.reverse();
    }
    a = xc.length;
    b = yc.length;
    if (a - b < 0) {
      t = yc;
      yc = xc;
      xc = t;
      b = a;
    }
    for (a = 0; b; ) {
      a = (xc[--b] = xc[b] + yc[b] + a) / BASE | 0;
      xc[b] = BASE === xc[b] ? 0 : xc[b] % BASE;
    }
    if (a) {
      xc = [a].concat(xc);
      ++ye;
    }
    return normalise(y, xc, ye);
  };
  P2.precision = P2.sd = function(sd, rm) {
    var c, n, v, x = this;
    if (sd != null && sd !== !!sd) {
      return round(
        new BigNumber3(x),
        intCheck(sd, 1, MAX),
        rm == null ? ROUNDING_MODE : intCheck(rm, 0, 8)
      );
    }
    if (!(c = x.c)) return null;
    v = c.length - 1;
    n = v * LOG_BASE + 1;
    if (v = c[v]) {
      for (; v % 10 == 0; v /= 10, n--) ;
      for (v = c[0]; v >= 10; v /= 10, n++) ;
    }
    if (sd && x.e + 1 > n) n = x.e + 1;
    return n;
  };
  P2.shiftedBy = function(k) {
    return this.times("1e" + intCheck(k, -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER));
  };
  P2.squareRoot = P2.sqrt = function() {
    var m, n, r, rep, t, x = this, c = x.c, s = x.s, e = x.e, dp = DECIMAL_PLACES + 4, half = new BigNumber3("0.5");
    if (s !== 1 || !c || !c[0]) {
      return new BigNumber3(!s || s < 0 && (!c || c[0]) ? NaN : c ? x : 1 / 0);
    }
    s = Math.sqrt(+valueOf(x));
    if (s == 0 || s == 1 / 0) {
      n = coeffToString(c);
      if ((n.length + e) % 2 == 0) n += "0";
      s = Math.sqrt(+n);
      e = bitFloor((e + 1) / 2) - (e < 0 || e % 2);
      if (s == 1 / 0) {
        n = "5e" + e;
      } else {
        n = s.toExponential();
        n = n.slice(0, n.indexOf("e") + 1) + e;
      }
      r = new BigNumber3(n);
    } else {
      r = new BigNumber3(s + "");
    }
    if (r.c[0]) {
      e = r.e;
      s = e + dp;
      if (s < 3) s = 0;
      for (; ; ) {
        t = r;
        r = half.times(t.plus(div(x, t, dp, 1)));
        if (coeffToString(t.c).slice(0, s) === (n = coeffToString(r.c)).slice(0, s)) {
          if (r.e < e) --s;
          n = n.slice(s - 3, s + 1);
          if (n == "9999" || !rep && n == "4999") {
            if (!rep) {
              round(t, t.e + DECIMAL_PLACES + 2, 0);
              if (t.times(t).eq(x)) {
                r = t;
                break;
              }
            }
            dp += 4;
            s += 4;
            rep = 1;
          } else {
            if (!+n || !+n.slice(1) && n.charAt(0) == "5") {
              round(r, r.e + DECIMAL_PLACES + 2, 1);
              m = !r.times(r).eq(x);
            }
            break;
          }
        }
      }
    }
    return round(r, r.e + DECIMAL_PLACES + 1, ROUNDING_MODE, m);
  };
  if (typeof BigInt == "function") {
    P2.toBigInt = function(rm) {
      var x = this;
      if (!x.c) return null;
      return BigInt(format(x, x.e + 1, rm));
    };
  }
  P2.toExponential = function(dp, rm) {
    return format(this, dp == null ? dp : intCheck(dp, 0, MAX) + 1, rm, 1);
  };
  P2.toFixed = function(dp, rm) {
    return format(this, dp == null ? dp : intCheck(dp, -MAX, MAX) + this.e + 1, rm);
  };
  P2.toFormat = function(dp, rm, options) {
    var isNeg, min, max, str, x = this;
    if (options == null) {
      options = FORMAT;
      if (dp != null) {
        if (rm != null) {
          if (typeof rm == "object") {
            options = resolveFormatOptions(rm);
            rm = null;
          }
        } else if (typeof dp == "object" && !isArray(dp)) {
          options = resolveFormatOptions(dp);
          dp = rm = null;
        }
      }
    } else if (typeof options != "object") {
      throw Error(bignumberError + "Argument not an object: " + options);
    } else {
      options = resolveFormatOptions(options);
    }
    if (dp != null) {
      if (isArray(dp) && dp.length <= 2) {
        min = dp[0];
        max = dp[1];
        dp = x.dp();
        if (max != null && dp > intCheck(max, 0, MAX)) dp = max;
        if (min != null && intCheck(min, 0, MAX) !== 0) {
          if (max != null && min > max) {
            throw Error(bignumberError + "Minimum must not exceed maximum");
          }
          if (dp < min) dp = min;
        }
      } else {
        intCheck(dp, -MAX, MAX);
      }
    }
    str = x.toFixed(dp, rm);
    isNeg = str.charCodeAt(0) === 45;
    if (isNeg) str = str.slice(1);
    if (x.c) {
      var i, arr = str.split("."), g1 = +options.groupSize, g2 = +options.secondaryGroupSize, groupSeparator = options.groupSeparator || "", intPart = arr[0], fractionPart = arr[1], len = intPart.length;
      if (g2) {
        i = g1;
        g1 = g2;
        g2 = i;
        len -= i;
      }
      if (g1 > 0 && len > 0) {
        i = len % g1 || g1;
        str = intPart.substr(0, i);
        for (; i < len; i += g1) {
          str += groupSeparator + intPart.substr(i, g1);
        }
        if (g2 > 0) str += groupSeparator + intPart.slice(i);
      } else {
        str = intPart;
      }
      if (fractionPart) {
        i = +options.fractionGroupSize;
        if (i) {
          fractionPart = fractionPart.replace(
            new RegExp("\\d{" + i + "}\\B", "g"),
            "$&" + (options.fractionGroupSeparator || "")
          );
        }
        str += (options.decimalSeparator || "") + fractionPart;
      }
    }
    return (options.prefix || "") + (isNeg ? options.negativeSign || "" : x.s > 0 ? options.positiveSign || "" : "") + str + (options.suffix || "");
  };
  P2.toFraction = function(md) {
    var d, d0, d1, d2, e, exp, n, n0, n1, q, r, s, x = this, xc = x.c;
    if (md != null) {
      n = new BigNumber3(md);
      if (!n.isInteger() && (n.c || n.s !== 1) || n.lt(ONE2)) {
        throw Error(bignumberError + "Argument " + (n.isInteger() ? "out of range: " : "not an integer: ") + valueOf(n));
      }
    }
    if (!xc) {
      return [new BigNumber3(x.s || 0), new BigNumber3(0)];
    }
    d = new BigNumber3(ONE2);
    n1 = d0 = new BigNumber3(ONE2);
    d1 = n0 = new BigNumber3(ONE2);
    s = coeffToString(xc);
    e = d.e = s.length - x.e - 1;
    d.c[0] = POWS_TEN[(exp = e % LOG_BASE) < 0 ? LOG_BASE + exp : exp];
    md = !md || n.comparedTo(d) > 0 ? e > 0 ? d : n1 : n;
    exp = MAX_EXP;
    MAX_EXP = 1 / 0;
    n = new BigNumber3(s);
    n0.c[0] = 0;
    for (; ; ) {
      q = div(n, d, 0, 1);
      d2 = d0.plus(q.times(d1));
      if (d2.comparedTo(md) == 1) break;
      d0 = d1;
      d1 = d2;
      n1 = n0.plus(q.times(d2 = n1));
      n0 = d2;
      d = n.minus(q.times(d2 = d));
      n = d2;
    }
    d2 = div(md.minus(d0), d1, 0, 1);
    n0 = n0.plus(d2.times(n1));
    d0 = d0.plus(d2.times(d1));
    n0.s = n1.s = x.s;
    e = e * 2;
    r = div(n1, d1, e, ROUNDING_MODE).minus(x).abs().comparedTo(
      div(n0, d0, e, ROUNDING_MODE).minus(x).abs()
    ) < 1 ? [n1, d1] : [n0, d0];
    MAX_EXP = exp;
    return r;
  };
  P2.toNumber = function() {
    return +valueOf(this);
  };
  P2.toObject = function() {
    var x = this;
    return {
      c: x.c ? x.c.slice() : null,
      e: x.e,
      s: x.s
    };
  };
  P2.toPrecision = function(sd, rm) {
    return format(this, sd == null ? sd : intCheck(sd, 1, MAX), rm, 2);
  };
  P2.toString = function(b) {
    var str, n = this, s = n.s, e = n.e;
    if (e === null) {
      if (s) {
        str = "Infinity";
        if (s < 0) str = "-" + str;
      } else {
        str = "NaN";
      }
    } else {
      if (b == null) {
        str = e <= TO_EXP_NEG || e >= TO_EXP_POS ? toExponential(coeffToString(n.c), e) : toFixedPoint(coeffToString(n.c), e, "0");
      } else {
        intCheck(b, 2, ALPHABET.length, "Base");
        str = convertBase(toFixedPoint(coeffToString(n.c), e, "0"), 10, b, s, true);
      }
      if (s < 0 && n.c[0]) str = "-" + str;
    }
    return str;
  };
  P2.valueOf = P2.toJSON = function() {
    return valueOf(this);
  };
  P2._isBigNumber = true;
  if (configObject != null) BigNumber3.set(configObject);
  return BigNumber3;
}
function bitFloor(n) {
  var i = n | 0;
  return n > 0 || n === i ? i : i - 1;
}
function coeffToString(a) {
  var s, z, i = 1, j = a.length, r = a[0] + "";
  for (; i < j; ) {
    s = a[i++] + "";
    z = LOG_BASE - s.length;
    for (; z--; s = "0" + s) ;
    r += s;
  }
  for (j = r.length; r.charCodeAt(--j) === 48; ) ;
  return r.slice(0, j + 1 || 1);
}
function compare(x, y) {
  var a, b, xc = x.c, yc = y.c, i = x.s, j = y.s, k = x.e, l = y.e;
  if (!i || !j) return null;
  a = xc && !xc[0];
  b = yc && !yc[0];
  if (a || b) return a ? b ? 0 : -j : i;
  if (i != j) return i;
  a = i < 0;
  b = k == l;
  if (!xc || !yc) return b ? 0 : !xc ^ a ? 1 : -1;
  if (!b) return k > l ^ a ? 1 : -1;
  j = (k = xc.length) < (l = yc.length) ? k : l;
  for (i = 0; i < j; i++) if (xc[i] != yc[i]) return xc[i] > yc[i] ^ a ? 1 : -1;
  return k == l ? 0 : k > l ^ a ? 1 : -1;
}
function intCheck(n, min, max, name) {
  if (n < min || n > max || n !== mathfloor(n)) {
    throw Error(bignumberError + (name || "Argument") + (typeof n == "number" ? n < min || n > max ? " out of range: " : " not an integer: " : " not a primitive number: ") + String(n));
  }
  return n;
}
function isArray(obj) {
  return {}.toString.call(obj) == "[object Array]";
}
function isOdd(n) {
  var k = n.c.length - 1;
  return bitFloor(n.e / LOG_BASE) == k && n.c[k] % 2 != 0;
}
function toExponential(str, e) {
  return (str.length > 1 ? str.charAt(0) + "." + str.slice(1) : str) + (e < 0 ? "e" : "e+") + e;
}
function toFixedPoint(str, e, z) {
  var len, zs;
  if (e < 0) {
    for (zs = z + "."; ++e; zs += z) ;
    str = zs + str;
  } else {
    len = str.length;
    if (++e > len) {
      for (zs = z, e -= len; --e; zs += z) ;
      str += zs;
    } else if (e < len) {
      str = str.slice(0, e) + "." + str.slice(e);
    }
  }
  return str;
}
var bignumber_default = BigNumber;

// node_modules/@stellar/stellar-sdk/lib/esm/base/util/bignumber.js
var BigNumber2 = bignumber_default.clone({ STRICT: true });

// node_modules/@stellar/stellar-sdk/lib/esm/base/util/continued_fraction.js
var MAX_INT = (1 << 31 >>> 0) - 1;
var MAX_INT_BN = new BigNumber2(MAX_INT);
function best_r(rawNumber) {
  let number = new BigNumber2(rawNumber);
  let a;
  let f;
  const fractions = [
    [new BigNumber2(0), new BigNumber2(1)],
    [new BigNumber2(1), new BigNumber2(0)]
  ];
  let i = 2;
  while (true) {
    if (number.gt(MAX_INT)) {
      break;
    }
    a = number.integerValue(BigNumber2.ROUND_FLOOR);
    f = number.minus(a);
    const prev1 = fractions[i - 1];
    const prev2 = fractions[i - 2];
    if (!prev1 || !prev2) {
      throw new Error(
        `Continued fraction approximation failed: missing fraction elements at indices ${i - 1} and/or ${i - 2}`
      );
    }
    const h2 = a.times(prev1[0]).plus(prev2[0]);
    const k = a.times(prev1[1]).plus(prev2[1]);
    if (h2.gt(MAX_INT) || k.gt(MAX_INT)) {
      break;
    }
    fractions.push([h2, k]);
    if (f.eq(0)) {
      break;
    }
    number = new BigNumber2(1).div(f);
    i += 1;
  }
  const lastFraction = fractions[fractions.length - 1];
  if (!lastFraction) {
    throw new Error(
      "Missing last fraction element in continued fraction approximation"
    );
  }
  const [n, d] = lastFraction;
  if (n.isZero() || d.isZero()) {
    const input = new BigNumber2(rawNumber);
    if (input.isZero()) {
      throw new Error("Couldn't find approximation");
    }
    const prev1 = fractions[fractions.length - 1];
    const prev2 = fractions[fractions.length - 2];
    if (prev1 && prev2) {
      let aMax = MAX_INT_BN;
      if (prev1[0].gt(0)) {
        aMax = BigNumber2.min(
          aMax,
          MAX_INT_BN.minus(prev2[0]).div(prev1[0]).integerValue(BigNumber2.ROUND_FLOOR)
        );
      }
      if (prev1[1].gt(0)) {
        aMax = BigNumber2.min(
          aMax,
          MAX_INT_BN.minus(prev2[1]).div(prev1[1]).integerValue(BigNumber2.ROUND_FLOOR)
        );
      }
      if (aMax.gte(1)) {
        const hn = aMax.times(prev1[0]).plus(prev2[0]);
        const kn = aMax.times(prev1[1]).plus(prev2[1]);
        if (!hn.isZero() && !kn.isZero()) {
          return [hn.toNumber(), kn.toNumber()];
        }
      }
    }
    throw new Error("Couldn't find approximation");
  }
  return [n.toNumber(), d.toNumber()];
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/account.js
var Account = class {
  _accountId;
  sequence;
  /**
   * @param accountId - ID of the account (ex.
   *     `GB3KJPLFUYN5VL6R3GU3EGCGVCKFDSD7BEDX42HWG5BWFKB3KQGJJRMA`). If you
   *     provide a muxed account address, this will throw; use {@link
   *     MuxedAccount} instead.
   * @param sequence - current sequence number of the account
   */
  constructor(accountId, sequence) {
    if (StrKey.isValidMed25519PublicKey(accountId)) {
      throw new Error("accountId is an M-address; use MuxedAccount instead");
    }
    if (!StrKey.isValidEd25519PublicKey(accountId)) {
      throw new Error("accountId is invalid");
    }
    if (!(typeof sequence === "string")) {
      throw new Error("sequence must be of type string");
    }
    let parsed;
    try {
      parsed = new BigNumber2(sequence);
    } catch {
      throw new Error("sequence is not a valid number");
    }
    if (parsed.isNaN()) {
      throw new Error("sequence is not a valid number");
    }
    this._accountId = accountId;
    this.sequence = parsed;
  }
  /**
   * Returns Stellar account ID, ex.
   * `GB3KJPLFUYN5VL6R3GU3EGCGVCKFDSD7BEDX42HWG5BWFKB3KQGJJRMA`.
   */
  accountId() {
    return this._accountId;
  }
  /**
   * Returns sequence number for the account as a string
   */
  sequenceNumber() {
    return this.sequence.toString();
  }
  /**
   * Increments sequence number in this object by one.
   */
  incrementSequenceNumber() {
    this.sequence = this.sequence.plus(1);
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/base/util/decode_encode_muxed_account.js
var import_buffer11 = require("buffer");
function decodeAddressToMuxedAccount(address) {
  if (StrKey.isValidMed25519PublicKey(address)) {
    return _decodeAddressFullyToMuxedAccount(address);
  }
  return types.MuxedAccount.keyTypeEd25519(
    StrKey.decodeEd25519PublicKey(address)
  );
}
function encodeMuxedAccountToAddress(muxedAccount) {
  if (muxedAccount.switch().value === types.CryptoKeyType.keyTypeMuxedEd25519().value) {
    return _encodeMuxedAccountFullyToAddress(muxedAccount);
  }
  return StrKey.encodeEd25519PublicKey(muxedAccount.ed25519());
}
function encodeMuxedAccount(address, id) {
  if (!StrKey.isValidEd25519PublicKey(address)) {
    throw new Error("address should be a Stellar account ID (G...)");
  }
  if (typeof id !== "string") {
    throw new Error("id should be a string representing a number (uint64)");
  }
  return types.MuxedAccount.keyTypeMuxedEd25519(
    new types.MuxedAccountMed25519({
      id: types.Uint64.fromString(id),
      ed25519: StrKey.decodeEd25519PublicKey(address)
    })
  );
}
function extractBaseAddress(address) {
  if (StrKey.isValidEd25519PublicKey(address)) {
    return address;
  }
  if (!StrKey.isValidMed25519PublicKey(address)) {
    throw new TypeError(`expected muxed account (M...), got ${address}`);
  }
  const muxedAccount = decodeAddressToMuxedAccount(address);
  return StrKey.encodeEd25519PublicKey(muxedAccount.med25519().ed25519());
}
function _decodeAddressFullyToMuxedAccount(address) {
  const rawBytes = StrKey.decodeMed25519PublicKey(address);
  return types.MuxedAccount.keyTypeMuxedEd25519(
    new types.MuxedAccountMed25519({
      id: types.Uint64.fromXDR(rawBytes.subarray(-8)),
      ed25519: rawBytes.subarray(0, -8)
    })
  );
}
function _encodeMuxedAccountFullyToAddress(muxedAccount) {
  if (muxedAccount.switch() === types.CryptoKeyType.keyTypeEd25519()) {
    return encodeMuxedAccountToAddress(muxedAccount);
  }
  const muxed = muxedAccount.med25519();
  return StrKey.encodeMed25519PublicKey(
    import_buffer11.Buffer.concat([muxed.ed25519(), muxed.id().toXDR("raw")])
  );
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/muxed_account.js
var MAX_UINT64 = BigInt("18446744073709551615");
function validateUint64Id(id) {
  let value;
  try {
    value = BigInt(id);
  } catch {
    throw new Error(`id is not a valid uint64 string: ${id}`);
  }
  if (value < BigInt(0) || value > MAX_UINT64) {
    throw new Error(
      `id value out of range for uint64 [0, ${MAX_UINT64}]: ${id}`
    );
  }
}
var MuxedAccount = class _MuxedAccount {
  account;
  _muxedXdr;
  _mAddress;
  _id;
  /**
   * @param baseAccount - the {@link Account} instance representing the
   *     underlying G... address
   * @param id - a stringified uint64 value that represents the ID of the
   *     muxed account
   */
  constructor(baseAccount, id) {
    const accountId = baseAccount.accountId();
    if (!StrKey.isValidEd25519PublicKey(accountId)) {
      throw new Error("accountId is invalid");
    }
    validateUint64Id(id);
    this.account = baseAccount;
    this._muxedXdr = encodeMuxedAccount(accountId, id);
    this._mAddress = encodeMuxedAccountToAddress(this._muxedXdr);
    this._id = id;
  }
  /**
   * Parses an M-address into a MuxedAccount object.
   *
   * @param  mAddress    - an M-address to transform
   * @param  sequenceNum - the sequence number of the underlying {@link
   *     Account}, to use for the underlying base account {@link
   *     MuxedAccount.baseAccount}. If you're using the SDK, you can use
   *     `server.loadAccount` to fetch this if you don't know it.
   */
  static fromAddress(mAddress, sequenceNum) {
    const muxedAccount = decodeAddressToMuxedAccount(mAddress);
    const gAddress = extractBaseAddress(mAddress);
    const id = muxedAccount.med25519().id().toString();
    return new _MuxedAccount(new Account(gAddress, sequenceNum), id);
  }
  /**
   * Returns the underlying account object shared among all muxed
   * accounts with this Stellar address.
   */
  baseAccount() {
    return this.account;
  }
  /**
   * Returns the M-address representing this account's (G-address, ID).
   */
  accountId() {
    return this._mAddress;
  }
  /**
   * Returns the uint64 ID of this muxed account as a string.
   */
  id() {
    return this._id;
  }
  /**
   * Updates the muxed account's ID, regenerating the M-address accordingly.
   *
   * @param id - a stringified uint64 value to set as the new muxed account ID
   */
  setId(id) {
    if (typeof id !== "string") {
      throw new Error("id should be a string representing a number (uint64)");
    }
    validateUint64Id(id);
    this._muxedXdr.med25519().id(types.Uint64.fromString(id));
    this._mAddress = encodeMuxedAccountToAddress(this._muxedXdr);
    this._id = id;
    return this;
  }
  /**
   * Returns the stringified sequence number for the underlying account.
   */
  sequenceNumber() {
    return this.account.sequenceNumber();
  }
  /**
   * Increments the underlying account's sequence number by one.
   */
  incrementSequenceNumber() {
    this.account.incrementSequenceNumber();
  }
  /**
   * Returns the XDR object representing this muxed account's
   * G-address and uint64 ID.
   */
  toXDRObject() {
    return this._muxedXdr;
  }
  /**
   * Checks whether two muxed accounts are equal by comparing their M-addresses.
   *
   * @param otherMuxedAccount - the MuxedAccount to compare against
   */
  equals(otherMuxedAccount) {
    return this.accountId() === otherMuxedAccount.accountId();
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/base/transaction.js
var import_buffer24 = require("buffer");

// node_modules/@stellar/stellar-sdk/lib/esm/base/asset.js
var import_buffer12 = require("buffer");

// node_modules/@stellar/stellar-sdk/lib/esm/base/util/util.js
var trimEnd = (input, char) => {
  const isNumber = typeof input === "number";
  let str = String(input);
  while (str.endsWith(char)) {
    str = str.slice(0, -1);
  }
  return isNumber ? Number(str) : str;
};

// node_modules/@stellar/stellar-sdk/lib/esm/base/asset.js
var AssetType = {
  native: "native",
  credit4: "credit_alphanum4",
  credit12: "credit_alphanum12",
  liquidityPoolShares: "liquidity_pool_shares"
};
function asciiCompare(a, b) {
  return import_buffer12.Buffer.compare(import_buffer12.Buffer.from(a, "ascii"), import_buffer12.Buffer.from(b, "ascii"));
}
var Asset = class _Asset {
  /** The asset code. */
  code;
  /** The account ID of the issuer. Undefined for the native asset. */
  issuer;
  /**
   * @param code - The asset code.
   * @param issuer - The account ID of the issuer.
   */
  constructor(code, issuer) {
    if (!/^[a-zA-Z0-9]{1,12}$/.test(code)) {
      throw new Error(
        "Asset code is invalid (maximum alphanumeric, 12 characters at max)"
      );
    }
    if (String(code).toLowerCase() !== "xlm" && !issuer) {
      throw new Error("Issuer cannot be null");
    }
    if (issuer && !StrKey.isValidEd25519PublicKey(issuer)) {
      throw new Error("Issuer is invalid");
    }
    if (String(code).toLowerCase() === "xlm") {
      this.code = "XLM";
    } else {
      this.code = code;
    }
    this.issuer = issuer;
  }
  /**
   * Returns an asset object for the native asset.
   */
  static native() {
    return new _Asset("XLM");
  }
  /**
   * Returns an asset object from its XDR object representation.
   * @param assetXdr - The asset xdr object.
   */
  static fromOperation(assetXdr) {
    let anum;
    let code;
    let issuer;
    switch (assetXdr.switch()) {
      case types.AssetType.assetTypeNative():
        return this.native();
      case types.AssetType.assetTypeCreditAlphanum4():
        anum = assetXdr.alphaNum4();
        issuer = StrKey.encodeEd25519PublicKey(anum.issuer().ed25519());
        code = trimEnd(anum.assetCode().toString(), "\0");
        return new this(code, issuer);
      case types.AssetType.assetTypeCreditAlphanum12():
        anum = assetXdr.alphaNum12();
        issuer = StrKey.encodeEd25519PublicKey(anum.issuer().ed25519());
        code = trimEnd(anum.assetCode().toString(), "\0");
        return new this(code, issuer);
      default:
        throw new Error(`Invalid asset type: ${assetXdr.switch().name}`);
    }
  }
  /**
   * Returns the xdr.Asset object for this asset.
   */
  toXDRObject() {
    return this._toXDRObject(types.Asset);
  }
  /**
   * Returns the xdr.ChangeTrustAsset object for this asset.
   */
  toChangeTrustXDRObject() {
    return this._toXDRObject(types.ChangeTrustAsset);
  }
  /**
   * Returns the xdr.TrustLineAsset object for this asset.
   */
  toTrustLineXDRObject() {
    return this._toXDRObject(types.TrustLineAsset);
  }
  /**
   * Returns the would-be contract ID (`C...` format) for this asset on a given
   * network.
   *
   * @param networkPassphrase - indicates which network the contract
   *    ID should refer to, since every network will have a unique ID for the
   *    same contract (see {@link Networks} for options)
   *
   * **Warning:** This makes no guarantee that this contract actually *exists*.
   */
  contractId(networkPassphrase) {
    const networkId = hash(import_buffer12.Buffer.from(networkPassphrase));
    const preimage = types.HashIdPreimage.envelopeTypeContractId(
      new types.HashIdPreimageContractId({
        networkId,
        contractIdPreimage: types.ContractIdPreimage.contractIdPreimageFromAsset(
          this.toXDRObject()
        )
      })
    );
    return StrKey.encodeContract(hash(preimage.toXDR()));
  }
  /**
   * Returns the xdr object for this asset.
   * @param xdrAsset - The xdr asset constructor.
   */
  _toXDRObject(xdrAsset) {
    if (this.isNative()) {
      return xdrAsset.assetTypeNative();
    }
    if (!this.issuer) {
      throw new Error("Issuer cannot be null for non-native asset");
    }
    let xdrType;
    let xdrTypeString;
    if (this.code.length <= 4) {
      xdrType = types.AlphaNum4;
      xdrTypeString = "assetTypeCreditAlphanum4";
    } else {
      xdrType = types.AlphaNum12;
      xdrTypeString = "assetTypeCreditAlphanum12";
    }
    const padLength = this.code.length <= 4 ? 4 : 12;
    const paddedCode = this.code.padEnd(padLength, "\0");
    const assetType = new xdrType({
      assetCode: paddedCode,
      issuer: Keypair.fromPublicKey(this.issuer).xdrAccountId()
    });
    return new xdrAsset(xdrTypeString, assetType);
  }
  /**
   * Returns the asset code
   */
  getCode() {
    return String(this.code);
  }
  /**
   * Returns the asset issuer
   */
  getIssuer() {
    if (this.issuer === void 0) {
      return void 0;
    }
    return String(this.issuer);
  }
  /**
   * @see [Assets concept](https://developers.stellar.org/docs/glossary/assets/)
   * Returns the asset type. Can be one of following types:
   *
   *  - `native`,
   *  - `credit_alphanum4`,
   *  - `credit_alphanum12`
   * @throws Throws `Error` if asset type is unsupported.
   */
  getAssetType() {
    switch (this.getRawAssetType().value) {
      case types.AssetType.assetTypeNative().value:
        return AssetType.native;
      case types.AssetType.assetTypeCreditAlphanum4().value:
        return AssetType.credit4;
      case types.AssetType.assetTypeCreditAlphanum12().value:
        return AssetType.credit12;
      default:
        throw new Error(
          "Supported asset types are: native, credit_alphanum4, credit_alphanum12"
        );
    }
  }
  /**
   * Returns the raw XDR representation of the asset type
   */
  getRawAssetType() {
    if (this.isNative()) {
      return types.AssetType.assetTypeNative();
    }
    if (this.code.length <= 4) {
      return types.AssetType.assetTypeCreditAlphanum4();
    }
    return types.AssetType.assetTypeCreditAlphanum12();
  }
  /**
   * Returns true if this asset object is the native asset.
   */
  isNative() {
    return !this.issuer;
  }
  /**
   * Returns true if this asset equals the given asset.
   *
   * @param asset - Asset to compare
   */
  equals(asset) {
    return this.code === asset.getCode() && this.issuer === asset.getIssuer();
  }
  /**
   * Returns a string representation of this asset.
   *
   * Native assets return `"native"`. Non-native assets return `"code:issuer"`.
   */
  toString() {
    if (this.isNative()) {
      return "native";
    }
    return `${this.getCode()}:${this.getIssuer()}`;
  }
  /**
   * Compares two assets according to the criteria:
   *
   *  1. First compare the type (`native < alphanum4 < alphanum12`).
   *  2. If the types are equal, compare the assets codes.
   *  3. If the asset codes are equal, compare the issuers.
   *
   * @param assetA - the first asset
   * @param assetB - the second asset
   */
  static compare(assetA, assetB) {
    if (!assetA || !(assetA instanceof _Asset)) {
      throw new Error("assetA is invalid");
    }
    if (!assetB || !(assetB instanceof _Asset)) {
      throw new Error("assetB is invalid");
    }
    if (assetA.equals(assetB)) {
      return 0;
    }
    const xdrAtype = assetA.getRawAssetType().value;
    const xdrBtype = assetB.getRawAssetType().value;
    if (xdrAtype !== xdrBtype) {
      return xdrAtype < xdrBtype ? -1 : 1;
    }
    const result = asciiCompare(assetA.getCode(), assetB.getCode());
    if (result !== 0) {
      return result;
    }
    const issuerA = assetA.getIssuer();
    const issuerB = assetB.getIssuer();
    if (issuerA === void 0 || issuerB === void 0) {
      throw new Error("Issuer is undefined for non-native asset");
    }
    return asciiCompare(issuerA, issuerB);
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/base/get_liquidity_pool_id.js
var LiquidityPoolFeeV18 = 30;
function getLiquidityPoolId(liquidityPoolType, liquidityPoolParameters) {
  if (liquidityPoolType !== "constant_product") {
    throw new Error("liquidityPoolType is invalid");
  }
  const { assetA, assetB, fee } = liquidityPoolParameters ?? {};
  if (!assetA || !(assetA instanceof Asset)) {
    throw new Error("assetA is invalid");
  }
  if (!assetB || !(assetB instanceof Asset)) {
    throw new Error("assetB is invalid");
  }
  if (!fee || fee !== LiquidityPoolFeeV18) {
    throw new Error("fee is invalid");
  }
  if (Asset.compare(assetA, assetB) !== -1) {
    throw new Error("Assets are not in lexicographic order");
  }
  const payload = types.LiquidityPoolParameters.liquidityPoolConstantProduct(
    new types.LiquidityPoolConstantProductParameters({
      assetA: assetA.toXDRObject(),
      assetB: assetB.toXDRObject(),
      fee
    })
  ).toXDR();
  return hash(payload);
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/liquidity_pool_asset.js
var LiquidityPoolAsset = class {
  assetA;
  assetB;
  fee;
  /**
   * @param assetA - The first asset in the Pool, it must respect the rule `assetA < assetB`. See {@link Asset.compare} for more details on how assets are sorted.
   * @param assetB - The second asset in the Pool, it must respect the rule `assetA < assetB`. See {@link Asset.compare} for more details on how assets are sorted.
   * @param fee - The liquidity pool fee. For now the only fee supported is `30`.
   */
  constructor(assetA, assetB, fee) {
    if (!assetA || !(assetA instanceof Asset)) {
      throw new Error("assetA is invalid");
    }
    if (!assetB || !(assetB instanceof Asset)) {
      throw new Error("assetB is invalid");
    }
    if (Asset.compare(assetA, assetB) !== -1) {
      throw new Error("Assets are not in lexicographic order");
    }
    if (!fee || fee !== LiquidityPoolFeeV18) {
      throw new Error("fee is invalid");
    }
    this.assetA = assetA;
    this.assetB = assetB;
    this.fee = fee;
  }
  /**
   * Returns a liquidity pool asset object from its XDR ChangeTrustAsset object
   * representation.
   *
   * @param ctAssetXdr - The asset XDR object.
   */
  static fromOperation(ctAssetXdr) {
    const assetType = ctAssetXdr.switch();
    if (assetType === types.AssetType.assetTypePoolShare()) {
      const liquidityPoolParameters = ctAssetXdr.liquidityPool().constantProduct();
      return new this(
        Asset.fromOperation(liquidityPoolParameters.assetA()),
        Asset.fromOperation(liquidityPoolParameters.assetB()),
        liquidityPoolParameters.fee()
      );
    }
    throw new Error(`Invalid asset type: ${assetType.name}`);
  }
  /**
   * Returns the `xdr.ChangeTrustAsset` object for this liquidity pool asset.
   *
   * Note: To convert from an {@link Asset | `Asset`} to `xdr.ChangeTrustAsset`
   * please refer to the
   * {@link Asset.toChangeTrustXDRObject | `Asset.toChangeTrustXDRObject`} method.
   */
  toXDRObject() {
    const lpConstantProductParamsXdr = new types.LiquidityPoolConstantProductParameters({
      assetA: this.assetA.toXDRObject(),
      assetB: this.assetB.toXDRObject(),
      fee: this.fee
    });
    const lpParamsXdr = types.LiquidityPoolParameters.liquidityPoolConstantProduct(
      lpConstantProductParamsXdr
    );
    return types.ChangeTrustAsset.assetTypePoolShare(lpParamsXdr);
  }
  /**
   * Returns liquidity pool parameters.
   */
  getLiquidityPoolParameters() {
    return {
      ...this,
      assetA: this.assetA,
      assetB: this.assetB,
      fee: this.fee
    };
  }
  /**
   * Returns the asset type, always `"liquidity_pool_shares"`.
   *
   * @see [Assets concept](https://developers.stellar.org/docs/glossary/assets/)
   */
  getAssetType() {
    return "liquidity_pool_shares";
  }
  /**
   * Returns true if this liquidity pool asset equals the given one.
   *
   * @param other - the LiquidityPoolAsset to compare
   */
  equals(other) {
    return this.assetA.equals(other.assetA) && this.assetB.equals(other.assetB) && this.fee === other.fee;
  }
  /** Returns a string representation in `liquidity_pool:<hex pool id>` format. */
  toString() {
    const poolId = getLiquidityPoolId(
      "constant_product",
      this.getLiquidityPoolParameters()
    ).toString("hex");
    return `liquidity_pool:${poolId}`;
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/base/claimant.js
var Claimant = class {
  _destination;
  _predicate;
  /**
   * @param destination - The destination account ID.
   * @param predicate - The claim predicate.
   */
  constructor(destination, predicate) {
    if (!StrKey.isValidEd25519PublicKey(destination)) {
      throw new Error("Destination is invalid");
    }
    this._destination = destination;
    if (!predicate) {
      this._predicate = types.ClaimPredicate.claimPredicateUnconditional();
    } else if (predicate instanceof types.ClaimPredicate) {
      this._predicate = predicate;
    } else {
      throw new Error("Predicate should be an xdr.ClaimPredicate");
    }
  }
  /**
   * Returns an unconditional claim predicate
   */
  static predicateUnconditional() {
    return types.ClaimPredicate.claimPredicateUnconditional();
  }
  /**
   * Returns an `and` claim predicate
   * @param left - an xdr.ClaimPredicate
   * @param right - an xdr.ClaimPredicate
   */
  static predicateAnd(left, right) {
    if (!(left instanceof types.ClaimPredicate)) {
      throw new Error("left Predicate should be an xdr.ClaimPredicate");
    }
    if (!(right instanceof types.ClaimPredicate)) {
      throw new Error("right Predicate should be an xdr.ClaimPredicate");
    }
    return types.ClaimPredicate.claimPredicateAnd([left, right]);
  }
  /**
   * Returns an `or` claim predicate
   * @param left - an xdr.ClaimPredicate
   * @param right - an xdr.ClaimPredicate
   */
  static predicateOr(left, right) {
    if (!(left instanceof types.ClaimPredicate)) {
      throw new Error("left Predicate should be an xdr.ClaimPredicate");
    }
    if (!(right instanceof types.ClaimPredicate)) {
      throw new Error("right Predicate should be an xdr.ClaimPredicate");
    }
    return types.ClaimPredicate.claimPredicateOr([left, right]);
  }
  /**
   * Returns a `not` claim predicate
   * @param predicate - an xdr.ClaimPredicate
   */
  static predicateNot(predicate) {
    if (!(predicate instanceof types.ClaimPredicate)) {
      throw new Error("Predicate should be an xdr.ClaimPredicate");
    }
    return types.ClaimPredicate.claimPredicateNot(predicate);
  }
  /**
   * Returns a `BeforeAbsoluteTime` claim predicate
   *
   * This predicate will be fulfilled if the closing time of the ledger that
   * includes the CreateClaimableBalance operation is less than this (absolute)
   * Unix timestamp (expressed in seconds).
   *
   * @param absBefore - Unix epoch (in seconds) as a string
   */
  static predicateBeforeAbsoluteTime(absBefore) {
    return types.ClaimPredicate.claimPredicateBeforeAbsoluteTime(
      types.Int64.fromString(absBefore)
    );
  }
  /**
   * Returns a `BeforeRelativeTime` claim predicate
   *
   * This predicate will be fulfilled if the closing time of the ledger that
   * includes the CreateClaimableBalance operation plus this relative time delta
   * (in seconds) is less than the current time.
   *
   * @param seconds - seconds since closeTime of the ledger in which the ClaimableBalanceEntry was created (as string)
   */
  static predicateBeforeRelativeTime(seconds) {
    return types.ClaimPredicate.claimPredicateBeforeRelativeTime(
      types.Int64.fromString(seconds)
    );
  }
  /**
   * Returns a claimant object from its XDR object representation.
   * @param claimantXdr - The claimant xdr object.
   */
  static fromXDR(claimantXdr) {
    let value;
    switch (claimantXdr.switch()) {
      case types.ClaimantType.claimantTypeV0():
        value = claimantXdr.v0();
        return new this(
          StrKey.encodeEd25519PublicKey(value.destination().ed25519()),
          value.predicate()
        );
      default:
        throw new Error(`Invalid claimant type: ${claimantXdr.switch().name}`);
    }
  }
  /**
   * Returns the xdr object for this claimant.
   */
  toXDRObject() {
    const claimant = new types.ClaimantV0({
      destination: Keypair.fromPublicKey(this._destination).xdrAccountId(),
      predicate: this._predicate
    });
    return types.Claimant.claimantTypeV0(claimant);
  }
  /**
   * The destination account ID.
   */
  get destination() {
    return this._destination;
  }
  set destination(_value) {
    throw new Error("Claimant is immutable");
  }
  /**
   * The claim predicate.
   */
  get predicate() {
    return this._predicate;
  }
  set predicate(_value) {
    throw new Error("Claimant is immutable");
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/base/liquidity_pool_id.js
var import_buffer13 = require("buffer");
var LiquidityPoolId = class _LiquidityPoolId {
  liquidityPoolId;
  /**
   * @param liquidityPoolId - The ID of the liquidity pool in string 'hex'.
   */
  constructor(liquidityPoolId) {
    if (!liquidityPoolId) {
      throw new Error("liquidityPoolId cannot be empty");
    }
    if (!/^[a-f0-9]{64}$/.test(liquidityPoolId)) {
      throw new Error("Liquidity pool ID is not a valid hash");
    }
    this.liquidityPoolId = liquidityPoolId;
  }
  /**
   * Returns a liquidity pool ID object from its xdr.TrustLineAsset representation.
   * @param tlAssetXdr - The asset XDR object.
   */
  static fromOperation(tlAssetXdr) {
    const assetType = tlAssetXdr.switch();
    if (assetType === types.AssetType.assetTypePoolShare()) {
      const liquidityPoolId = tlAssetXdr.liquidityPoolId().toString("hex");
      return new _LiquidityPoolId(liquidityPoolId);
    }
    throw new Error(`Invalid asset type: ${assetType.name}`);
  }
  /**
   * Returns the `xdr.TrustLineAsset` object for this liquidity pool ID.
   *
   * Note: To convert from {@link Asset | `Asset`} to `xdr.TrustLineAsset` please
   * refer to the
   * {@link Asset.toTrustLineXDRObject | `Asset.toTrustLineXDRObject`} method.
   */
  toXDRObject() {
    const xdrPoolId = import_buffer13.Buffer.from(
      this.liquidityPoolId,
      "hex"
    );
    return types.TrustLineAsset.assetTypePoolShare(xdrPoolId);
  }
  /**
   * Returns the liquidity pool ID as a hex string.
   */
  getLiquidityPoolId() {
    return String(this.liquidityPoolId);
  }
  /**
   * Returns the asset type, always `"liquidity_pool_shares"`.
   *
   * @see [Assets concept](https://developers.stellar.org/docs/glossary/assets/)
   */
  getAssetType() {
    return "liquidity_pool_shares";
  }
  /**
   * Returns true if this liquidity pool ID equals the given one.
   *
   * @param asset - LiquidityPoolId to compare.
   */
  equals(asset) {
    return this.liquidityPoolId === asset.getLiquidityPoolId();
  }
  /**
   * Returns a string representation of this liquidity pool ID.
   */
  toString() {
    return `liquidity_pool:${this.liquidityPoolId}`;
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/base/util/operations.js
var ONE = 1e7;
var MAX_INT64 = "9223372036854775807";
function setSourceAccount(opAttributes, opts) {
  if (opts.source) {
    try {
      opAttributes.sourceAccount = decodeAddressToMuxedAccount(opts.source);
    } catch {
      throw new Error("Source address is invalid");
    }
  }
}
function checkUnsignedIntValue(name, value, isValidFunction = null) {
  if (typeof value === "undefined") {
    return void 0;
  }
  const numValue = typeof value === "string" ? value.trim() === "" ? NaN : Number(value) : value;
  if (typeof numValue !== "number" || !Number.isFinite(numValue) || numValue % 1 !== 0) {
    throw new Error(`${name} value is invalid`);
  }
  if (numValue < 0) {
    throw new Error(`${name} value must be unsigned`);
  }
  if (!isValidFunction || isValidFunction(numValue, name)) {
    return numValue;
  }
  throw new Error(`${name} value is invalid`);
}
function toXDRAmount(value) {
  const amount = new BigNumber2(value).times(ONE);
  return types.Int64.fromString(amount.toString());
}
function fromXDRAmount(value) {
  return new BigNumber2(value.toString()).div(ONE).toFixed(7);
}
function fromXDRPrice(price) {
  const n = new BigNumber2(price.n());
  return n.div(new BigNumber2(price.d())).toString();
}
function toXDRPrice(price) {
  let xdrObject;
  if (typeof price === "object" && "n" in price && "d" in price) {
    xdrObject = new types.Price(price);
  } else {
    const priceBN = new BigNumber2(price);
    if (!priceBN.gt(0) || !priceBN.isFinite()) {
      throw new Error("price must be positive");
    }
    const approx = best_r(price);
    xdrObject = new types.Price({
      n: parseInt(String(approx[0]), 10),
      d: parseInt(String(approx[1]), 10)
    });
  }
  if (xdrObject.n() < 0 || xdrObject.d() <= 0) {
    throw new Error("price must be positive");
  }
  return xdrObject;
}
function isValidAmount(value, allowZero = false) {
  if (typeof value !== "string") {
    return false;
  }
  let amount;
  try {
    amount = new BigNumber2(value);
  } catch {
    return false;
  }
  if (
    // == 0
    !allowZero && amount.isZero() || // < 0
    amount.isNegative() || // > Max value
    amount.times(ONE).gt(new BigNumber2(MAX_INT64).toString()) || // Decimal places (max 7)
    (amount.decimalPlaces() ?? 0) > 7 || // NaN or Infinity
    amount.isNaN() || !amount.isFinite()
  ) {
    return false;
  }
  return true;
}
function constructAmountRequirementsError(arg) {
  return `${arg} argument must be of type String, represent a positive number and have at most 7 digits after the decimal`;
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/operations/manage_sell_offer.js
function manageSellOffer(opts) {
  const selling = opts.selling.toXDRObject();
  const buying = opts.buying.toXDRObject();
  if (!isValidAmount(opts.amount, true)) {
    throw new TypeError(constructAmountRequirementsError("amount"));
  }
  const amount = toXDRAmount(opts.amount);
  if (opts.price === void 0) {
    throw new TypeError("price argument is required");
  }
  const price = toXDRPrice(opts.price);
  const offerIdStr = opts.offerId !== void 0 ? opts.offerId.toString() : "0";
  const offerId = types.Int64.fromString(offerIdStr);
  const manageSellOfferOp = new types.ManageSellOfferOp({
    selling,
    buying,
    amount,
    price,
    offerId
  });
  const opAttributes = {
    sourceAccount: null,
    body: types.OperationBody.manageSellOffer(manageSellOfferOp)
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(opAttributes);
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/operations/create_passive_sell_offer.js
function createPassiveSellOffer(opts) {
  const selling = opts.selling.toXDRObject();
  const buying = opts.buying.toXDRObject();
  if (!isValidAmount(opts.amount)) {
    throw new TypeError(constructAmountRequirementsError("amount"));
  }
  const amount = toXDRAmount(opts.amount);
  if (opts.price === void 0) {
    throw new TypeError("price argument is required");
  }
  const price = toXDRPrice(opts.price);
  const createPassiveSellOfferOp = new types.CreatePassiveSellOfferOp({
    selling,
    buying,
    amount,
    price
  });
  const opAttributes = {
    sourceAccount: null,
    body: types.OperationBody.createPassiveSellOffer(createPassiveSellOfferOp)
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(opAttributes);
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/operations/account_merge.js
function accountMerge(opts) {
  let body;
  try {
    body = types.OperationBody.accountMerge(
      decodeAddressToMuxedAccount(opts.destination)
    );
  } catch {
    throw new Error("destination is invalid");
  }
  const opAttributes = {
    sourceAccount: null,
    body
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(opAttributes);
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/operations/allow_trust.js
var import_buffer14 = require("buffer");
function allowTrust(opts) {
  if (!StrKey.isValidEd25519PublicKey(opts.trustor)) {
    throw new Error("trustor is invalid");
  }
  const trustor = Keypair.fromPublicKey(opts.trustor).xdrAccountId();
  let asset;
  if (opts.assetCode.length <= 4) {
    const code = import_buffer14.Buffer.from(opts.assetCode.padEnd(4, "\0"));
    asset = types.AssetCode.assetTypeCreditAlphanum4(code);
  } else if (opts.assetCode.length <= 12) {
    const code = import_buffer14.Buffer.from(opts.assetCode.padEnd(12, "\0"));
    asset = types.AssetCode.assetTypeCreditAlphanum12(code);
  } else {
    throw new Error("Asset code must be 12 characters at max.");
  }
  let authorize;
  if (typeof opts.authorize === "boolean") {
    if (opts.authorize) {
      authorize = types.TrustLineFlags.authorizedFlag().value;
    } else {
      authorize = 0;
    }
  } else if (opts.authorize == null) {
    throw new Error("authorize is required");
  } else {
    authorize = opts.authorize;
  }
  const allowTrustOp = new types.AllowTrustOp({
    trustor,
    asset,
    authorize
  });
  const opAttributes = {
    sourceAccount: null,
    body: types.OperationBody.allowTrust(allowTrustOp)
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(opAttributes);
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/operations/bump_sequence.js
function bumpSequence(opts) {
  if (typeof opts.bumpTo !== "string") {
    throw new Error("bumpTo must be a string");
  }
  try {
    new BigNumber2(opts.bumpTo);
  } catch {
    throw new Error("bumpTo must be a stringified number");
  }
  const bumpTo = types.Int64.fromString(opts.bumpTo);
  const bumpSequenceOp = new types.BumpSequenceOp({ bumpTo });
  const opAttributes = {
    sourceAccount: null,
    body: types.OperationBody.bumpSequence(bumpSequenceOp)
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(opAttributes);
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/operations/change_trust.js
var MAX_INT642 = "9223372036854775807";
function changeTrust(opts) {
  const asset = opts.asset ?? opts.line;
  let line;
  if (asset instanceof Asset) {
    line = asset.toChangeTrustXDRObject();
  } else if (asset instanceof LiquidityPoolAsset) {
    line = asset.toXDRObject();
  } else {
    throw new TypeError("asset must be Asset or LiquidityPoolAsset");
  }
  if (opts.limit !== void 0 && !isValidAmount(opts.limit, true)) {
    throw new TypeError(constructAmountRequirementsError("limit"));
  }
  const limit = opts.limit ? toXDRAmount(opts.limit) : types.Int64.fromString(MAX_INT642);
  const changeTrustOp = new types.ChangeTrustOp({ line, limit });
  const opAttributes = {
    sourceAccount: null,
    body: types.OperationBody.changeTrust(changeTrustOp)
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(opAttributes);
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/operations/create_account.js
function createAccount(opts) {
  if (!StrKey.isValidEd25519PublicKey(opts.destination)) {
    throw new Error("destination is invalid");
  }
  if (!isValidAmount(opts.startingBalance, true)) {
    throw new TypeError(constructAmountRequirementsError("startingBalance"));
  }
  const createAccountOp = new types.CreateAccountOp({
    destination: Keypair.fromPublicKey(opts.destination).xdrAccountId(),
    startingBalance: toXDRAmount(opts.startingBalance)
  });
  const opAttributes = {
    sourceAccount: null,
    body: types.OperationBody.createAccount(createAccountOp)
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(opAttributes);
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/operations/create_claimable_balance.js
function createClaimableBalance(opts) {
  if (!(opts.asset instanceof Asset)) {
    throw new Error(
      "must provide an asset for create claimable balance operation"
    );
  }
  if (!isValidAmount(opts.amount)) {
    throw new TypeError(constructAmountRequirementsError("amount"));
  }
  if (!Array.isArray(opts.claimants) || opts.claimants.length === 0) {
    throw new Error("must provide at least one claimant");
  }
  const asset = opts.asset.toXDRObject();
  const amount = toXDRAmount(opts.amount);
  const claimants = opts.claimants.map((c) => c.toXDRObject());
  const createClaimableBalanceOp = new types.CreateClaimableBalanceOp({
    asset,
    amount,
    claimants
  });
  const opAttributes = {
    sourceAccount: null,
    body: types.OperationBody.createClaimableBalance(createClaimableBalanceOp)
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(opAttributes);
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/operations/claim_claimable_balance.js
function claimClaimableBalance(opts = {}) {
  validateClaimableBalanceId(opts.balanceId);
  const balanceId = types.ClaimableBalanceId.fromXDR(
    opts.balanceId,
    "hex"
  );
  const claimClaimableBalanceOp = new types.ClaimClaimableBalanceOp({
    balanceId
  });
  const opAttributes = {
    sourceAccount: null,
    body: types.OperationBody.claimClaimableBalance(claimClaimableBalanceOp)
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(opAttributes);
}
function validateClaimableBalanceId(balanceId) {
  if (typeof balanceId !== "string" || balanceId.length !== 8 + 64) {
    throw new Error("must provide a valid claimable balance id");
  }
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/operations/clawback_claimable_balance.js
function clawbackClaimableBalance(opts = {}) {
  validateClaimableBalanceId(opts.balanceId);
  const balanceId = types.ClaimableBalanceId.fromXDR(
    opts.balanceId,
    "hex"
  );
  const opAttributes = {
    sourceAccount: null,
    body: types.OperationBody.clawbackClaimableBalance(
      new types.ClawbackClaimableBalanceOp({ balanceId })
    )
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(opAttributes);
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/operations/inflation.js
function inflation(opts = {}) {
  const opAttributes = {
    sourceAccount: null,
    body: types.OperationBody.inflation()
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(opAttributes);
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/operations/manage_data.js
var import_buffer15 = require("buffer");
function manageData(opts) {
  if (!(typeof opts.name === "string" && opts.name.length <= 64)) {
    throw new Error("name must be a string, up to 64 characters");
  }
  if (typeof opts.value !== "string" && !import_buffer15.Buffer.isBuffer(opts.value) && opts.value !== null && opts.value !== void 0) {
    throw new Error("value must be a string, Buffer or null");
  }
  let dataValue;
  if (typeof opts.value === "string") {
    dataValue = import_buffer15.Buffer.from(opts.value);
  } else {
    dataValue = opts.value ?? null;
  }
  if (dataValue !== null && dataValue.length > 64) {
    throw new Error("value cannot be longer that 64 bytes");
  }
  const manageDataOp = new types.ManageDataOp({
    dataName: opts.name,
    dataValue
  });
  const opAttributes = {
    sourceAccount: null,
    body: types.OperationBody.manageData(manageDataOp)
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(
    opAttributes
  );
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/operations/manage_buy_offer.js
function manageBuyOffer(opts) {
  const selling = opts.selling.toXDRObject();
  const buying = opts.buying.toXDRObject();
  if (!isValidAmount(opts.buyAmount, true)) {
    throw new TypeError(constructAmountRequirementsError("buyAmount"));
  }
  const buyAmount = toXDRAmount(opts.buyAmount);
  if (opts.price === void 0) {
    throw new TypeError("price argument is required");
  }
  const price = toXDRPrice(opts.price);
  const offerIdStr = opts.offerId !== void 0 ? opts.offerId.toString() : "0";
  const offerId = types.Int64.fromString(offerIdStr);
  const manageBuyOfferOp = new types.ManageBuyOfferOp({
    selling,
    buying,
    buyAmount,
    price,
    offerId
  });
  const opAttributes = {
    sourceAccount: null,
    body: types.OperationBody.manageBuyOffer(manageBuyOfferOp)
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(opAttributes);
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/operations/path_payment_strict_receive.js
function pathPaymentStrictReceive(opts) {
  if (!opts.sendAsset) {
    throw new Error("Must specify a send asset");
  }
  if (!isValidAmount(opts.sendMax)) {
    throw new TypeError(constructAmountRequirementsError("sendMax"));
  }
  if (!opts.destAsset) {
    throw new Error("Must provide a destAsset for a payment operation");
  }
  if (!isValidAmount(opts.destAmount)) {
    throw new TypeError(constructAmountRequirementsError("destAmount"));
  }
  let destination;
  try {
    destination = decodeAddressToMuxedAccount(opts.destination);
  } catch {
    throw new Error("destination is invalid");
  }
  const path2 = opts.path ? opts.path : [];
  const paymentOp = new types.PathPaymentStrictReceiveOp({
    sendAsset: opts.sendAsset.toXDRObject(),
    sendMax: toXDRAmount(opts.sendMax),
    destination,
    destAsset: opts.destAsset.toXDRObject(),
    destAmount: toXDRAmount(opts.destAmount),
    path: path2.map((x) => x.toXDRObject())
  });
  const opAttributes = {
    sourceAccount: null,
    body: types.OperationBody.pathPaymentStrictReceive(paymentOp)
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(opAttributes);
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/operations/path_payment_strict_send.js
function pathPaymentStrictSend(opts) {
  if (!opts.sendAsset) {
    throw new Error("Must specify a send asset");
  }
  if (!isValidAmount(opts.sendAmount)) {
    throw new TypeError(constructAmountRequirementsError("sendAmount"));
  }
  if (!opts.destAsset) {
    throw new Error("Must provide a destAsset for a payment operation");
  }
  if (!isValidAmount(opts.destMin)) {
    throw new TypeError(constructAmountRequirementsError("destMin"));
  }
  const sendAsset = opts.sendAsset.toXDRObject();
  const sendAmount = toXDRAmount(opts.sendAmount);
  let destination;
  try {
    destination = decodeAddressToMuxedAccount(opts.destination);
  } catch {
    throw new Error("destination is invalid");
  }
  const destAsset = opts.destAsset.toXDRObject();
  const destMin = toXDRAmount(opts.destMin);
  const path2 = (opts.path ?? []).map((x) => x.toXDRObject());
  const payment2 = new types.PathPaymentStrictSendOp({
    sendAsset,
    sendAmount,
    destination,
    destAsset,
    destMin,
    path: path2
  });
  const opAttributes = {
    sourceAccount: null,
    body: types.OperationBody.pathPaymentStrictSend(payment2)
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(opAttributes);
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/operations/payment.js
function payment(opts) {
  if (!opts.asset) {
    throw new Error("Must provide an asset for a payment operation");
  }
  if (!isValidAmount(opts.amount)) {
    throw new TypeError(constructAmountRequirementsError("amount"));
  }
  let destination;
  try {
    destination = decodeAddressToMuxedAccount(opts.destination);
  } catch {
    throw new Error("destination is invalid");
  }
  const paymentOp = new types.PaymentOp({
    destination,
    asset: opts.asset.toXDRObject(),
    amount: toXDRAmount(opts.amount)
  });
  const opAttributes = {
    sourceAccount: null,
    body: types.OperationBody.payment(paymentOp)
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(opAttributes);
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/operations/set_options.js
var import_buffer16 = require("buffer");
function weightCheckFunction(value, name) {
  if (value >= 0 && value <= 255) {
    return true;
  }
  throw new Error(`${name} value must be between 0 and 255`);
}
function setOptions(opts) {
  let inflationDest = null;
  if (opts.inflationDest) {
    if (!StrKey.isValidEd25519PublicKey(opts.inflationDest)) {
      throw new Error("inflationDest is invalid");
    }
    inflationDest = Keypair.fromPublicKey(opts.inflationDest).xdrAccountId();
  }
  const clearFlags = checkUnsignedIntValue("clearFlags", opts.clearFlags) ?? null;
  const setFlags = checkUnsignedIntValue("setFlags", opts.setFlags) ?? null;
  const masterWeight = checkUnsignedIntValue(
    "masterWeight",
    opts.masterWeight,
    weightCheckFunction
  ) ?? null;
  const lowThreshold = checkUnsignedIntValue(
    "lowThreshold",
    opts.lowThreshold,
    weightCheckFunction
  ) ?? null;
  const medThreshold = checkUnsignedIntValue(
    "medThreshold",
    opts.medThreshold,
    weightCheckFunction
  ) ?? null;
  const highThreshold = checkUnsignedIntValue(
    "highThreshold",
    opts.highThreshold,
    weightCheckFunction
  ) ?? null;
  if (opts.homeDomain !== void 0 && typeof opts.homeDomain !== "string") {
    throw new TypeError("homeDomain argument must be of type String");
  }
  const homeDomain = opts.homeDomain;
  let signer = null;
  if (opts.signer) {
    const weight = checkUnsignedIntValue(
      "signer.weight",
      opts.signer.weight,
      weightCheckFunction
    );
    let key;
    let setValues = 0;
    if (opts.signer.ed25519PublicKey) {
      if (!StrKey.isValidEd25519PublicKey(opts.signer.ed25519PublicKey)) {
        throw new Error("signer.ed25519PublicKey is invalid.");
      }
      const rawKey = StrKey.decodeEd25519PublicKey(
        opts.signer.ed25519PublicKey
      );
      key = types.SignerKey.signerKeyTypeEd25519(rawKey);
      setValues += 1;
    }
    if (opts.signer.preAuthTx) {
      let preAuthTx;
      if (typeof opts.signer.preAuthTx === "string") {
        preAuthTx = import_buffer16.Buffer.from(opts.signer.preAuthTx, "hex");
      } else {
        preAuthTx = opts.signer.preAuthTx;
      }
      if (!(import_buffer16.Buffer.isBuffer(preAuthTx) && preAuthTx.length === 32)) {
        throw new Error("signer.preAuthTx must be 32 bytes Buffer.");
      }
      key = types.SignerKey.signerKeyTypePreAuthTx(preAuthTx);
      setValues += 1;
    }
    if (opts.signer.sha256Hash) {
      let sha256Hash;
      if (typeof opts.signer.sha256Hash === "string") {
        sha256Hash = import_buffer16.Buffer.from(opts.signer.sha256Hash, "hex");
      } else {
        sha256Hash = opts.signer.sha256Hash;
      }
      if (!(import_buffer16.Buffer.isBuffer(sha256Hash) && sha256Hash.length === 32)) {
        throw new Error("signer.sha256Hash must be 32 bytes Buffer.");
      }
      key = types.SignerKey.signerKeyTypeHashX(sha256Hash);
      setValues += 1;
    }
    if (opts.signer.ed25519SignedPayload) {
      if (!StrKey.isValidSignedPayload(opts.signer.ed25519SignedPayload)) {
        throw new Error("signer.ed25519SignedPayload is invalid.");
      }
      const rawKey = StrKey.decodeSignedPayload(
        opts.signer.ed25519SignedPayload
      );
      const signedPayloadXdr = types.SignerKeyEd25519SignedPayload.fromXDR(rawKey);
      key = types.SignerKey.signerKeyTypeEd25519SignedPayload(signedPayloadXdr);
      setValues += 1;
    }
    if (setValues !== 1) {
      throw new Error(
        "Signer object must contain exactly one of signer.ed25519PublicKey, signer.sha256Hash, signer.preAuthTx, or signer.ed25519SignedPayload."
      );
    }
    if (weight === void 0) {
      throw new Error("signer weight is required.");
    }
    if (key === void 0) {
      throw new Error("signer key is required.");
    }
    signer = new types.Signer({ key, weight });
  }
  const setOptionsOp = new types.SetOptionsOp({
    inflationDest,
    clearFlags,
    setFlags,
    masterWeight,
    lowThreshold,
    medThreshold,
    highThreshold,
    homeDomain,
    signer
  });
  const opAttributes = {
    sourceAccount: null,
    body: types.OperationBody.setOptions(setOptionsOp)
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(opAttributes);
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/operations/begin_sponsoring_future_reserves.js
function beginSponsoringFutureReserves(opts) {
  if (!StrKey.isValidEd25519PublicKey(opts.sponsoredId)) {
    throw new Error("sponsoredId is invalid");
  }
  const op = new types.BeginSponsoringFutureReservesOp({
    sponsoredId: Keypair.fromPublicKey(opts.sponsoredId).xdrAccountId()
  });
  const opAttributes = {
    sourceAccount: null,
    body: types.OperationBody.beginSponsoringFutureReserves(op)
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(opAttributes);
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/operations/end_sponsoring_future_reserves.js
function endSponsoringFutureReserves(opts = {}) {
  const opAttributes = {
    sourceAccount: null,
    body: types.OperationBody.endSponsoringFutureReserves()
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(opAttributes);
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/operations/revoke_sponsorship.js
var import_buffer17 = require("buffer");
function revokeAccountSponsorship(opts = {}) {
  if (!StrKey.isValidEd25519PublicKey(opts.account)) {
    throw new Error("account is invalid");
  }
  const ledgerKey = types.LedgerKey.account(
    new types.LedgerKeyAccount({
      accountId: Keypair.fromPublicKey(opts.account).xdrAccountId()
    })
  );
  const op = types.RevokeSponsorshipOp.revokeSponsorshipLedgerEntry(ledgerKey);
  const opAttributes = {
    sourceAccount: null,
    body: types.OperationBody.revokeSponsorship(op)
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(opAttributes);
}
function revokeTrustlineSponsorship(opts = {}) {
  if (!StrKey.isValidEd25519PublicKey(opts.account)) {
    throw new Error("account is invalid");
  }
  let asset;
  if (opts.asset instanceof Asset) {
    asset = opts.asset.toTrustLineXDRObject();
  } else if (opts.asset instanceof LiquidityPoolId) {
    asset = opts.asset.toXDRObject();
  } else {
    throw new TypeError("asset must be an Asset or LiquidityPoolId");
  }
  const ledgerKey = types.LedgerKey.trustline(
    new types.LedgerKeyTrustLine({
      accountId: Keypair.fromPublicKey(opts.account).xdrAccountId(),
      asset
    })
  );
  const op = types.RevokeSponsorshipOp.revokeSponsorshipLedgerEntry(ledgerKey);
  const opAttributes = {
    sourceAccount: null,
    body: types.OperationBody.revokeSponsorship(op)
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(opAttributes);
}
function revokeOfferSponsorship(opts = {}) {
  if (!StrKey.isValidEd25519PublicKey(opts.seller)) {
    throw new Error("seller is invalid");
  }
  if (typeof opts.offerId !== "string") {
    throw new Error("offerId is invalid");
  }
  const ledgerKey = types.LedgerKey.offer(
    new types.LedgerKeyOffer({
      sellerId: Keypair.fromPublicKey(opts.seller).xdrAccountId(),
      offerId: types.Int64.fromString(opts.offerId)
    })
  );
  const op = types.RevokeSponsorshipOp.revokeSponsorshipLedgerEntry(ledgerKey);
  const opAttributes = {
    sourceAccount: null,
    body: types.OperationBody.revokeSponsorship(op)
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(opAttributes);
}
function revokeDataSponsorship(opts = {}) {
  if (!StrKey.isValidEd25519PublicKey(opts.account)) {
    throw new Error("account is invalid");
  }
  if (typeof opts.name !== "string" || opts.name.length > 64) {
    throw new Error("name must be a string, up to 64 characters");
  }
  const ledgerKey = types.LedgerKey.data(
    new types.LedgerKeyData({
      accountId: Keypair.fromPublicKey(opts.account).xdrAccountId(),
      dataName: opts.name
    })
  );
  const op = types.RevokeSponsorshipOp.revokeSponsorshipLedgerEntry(ledgerKey);
  const opAttributes = {
    sourceAccount: null,
    body: types.OperationBody.revokeSponsorship(op)
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(opAttributes);
}
function revokeClaimableBalanceSponsorship(opts = {}) {
  if (typeof opts.balanceId !== "string") {
    throw new Error("balanceId is invalid");
  }
  const ledgerKey = types.LedgerKey.claimableBalance(
    new types.LedgerKeyClaimableBalance({
      balanceId: types.ClaimableBalanceId.fromXDR(opts.balanceId, "hex")
    })
  );
  const op = types.RevokeSponsorshipOp.revokeSponsorshipLedgerEntry(ledgerKey);
  const opAttributes = {
    sourceAccount: null,
    body: types.OperationBody.revokeSponsorship(op)
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(opAttributes);
}
function revokeLiquidityPoolSponsorship(opts = {}) {
  if (typeof opts.liquidityPoolId !== "string") {
    throw new Error("liquidityPoolId is invalid");
  }
  const ledgerKey = types.LedgerKey.liquidityPool(
    new types.LedgerKeyLiquidityPool({
      liquidityPoolId: import_buffer17.Buffer.from(
        opts.liquidityPoolId,
        "hex"
      )
    })
  );
  const op = types.RevokeSponsorshipOp.revokeSponsorshipLedgerEntry(ledgerKey);
  const opAttributes = {
    sourceAccount: null,
    body: types.OperationBody.revokeSponsorship(op)
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(opAttributes);
}
function revokeSignerSponsorship(opts = {}) {
  if (!StrKey.isValidEd25519PublicKey(opts.account)) {
    throw new Error("account is invalid");
  }
  let key;
  if (opts.signer.ed25519PublicKey) {
    if (!StrKey.isValidEd25519PublicKey(opts.signer.ed25519PublicKey)) {
      throw new Error("signer.ed25519PublicKey is invalid.");
    }
    const rawKey = StrKey.decodeEd25519PublicKey(opts.signer.ed25519PublicKey);
    key = types.SignerKey.signerKeyTypeEd25519(rawKey);
  } else if (opts.signer.preAuthTx) {
    let buffer;
    if (typeof opts.signer.preAuthTx === "string") {
      buffer = import_buffer17.Buffer.from(opts.signer.preAuthTx, "hex");
    } else {
      buffer = opts.signer.preAuthTx;
    }
    if (!(import_buffer17.Buffer.isBuffer(buffer) && buffer.length === 32)) {
      throw new Error("signer.preAuthTx must be 32 bytes Buffer.");
    }
    key = types.SignerKey.signerKeyTypePreAuthTx(buffer);
  } else if (opts.signer.sha256Hash) {
    let buffer;
    if (typeof opts.signer.sha256Hash === "string") {
      buffer = import_buffer17.Buffer.from(opts.signer.sha256Hash, "hex");
    } else {
      buffer = opts.signer.sha256Hash;
    }
    if (!(import_buffer17.Buffer.isBuffer(buffer) && buffer.length === 32)) {
      throw new Error("signer.sha256Hash must be 32 bytes Buffer.");
    }
    key = types.SignerKey.signerKeyTypeHashX(buffer);
  } else if (opts.signer.ed25519SignedPayload) {
    if (!StrKey.isValidSignedPayload(opts.signer.ed25519SignedPayload)) {
      throw new Error("signer.ed25519SignedPayload is invalid.");
    }
    const rawPayload = StrKey.decodeSignedPayload(
      opts.signer.ed25519SignedPayload
    );
    const signedPayloadXdr = types.SignerKeyEd25519SignedPayload.fromXDR(rawPayload);
    key = types.SignerKey.signerKeyTypeEd25519SignedPayload(signedPayloadXdr);
  } else {
    throw new Error("signer is invalid");
  }
  const signer = new types.RevokeSponsorshipOpSigner({
    accountId: Keypair.fromPublicKey(opts.account).xdrAccountId(),
    signerKey: key
  });
  const op = types.RevokeSponsorshipOp.revokeSponsorshipSigner(signer);
  const opAttributes = {
    sourceAccount: null,
    body: types.OperationBody.revokeSponsorship(op)
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(opAttributes);
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/operations/clawback.js
function clawback(opts) {
  if (!isValidAmount(opts.amount)) {
    throw new TypeError(constructAmountRequirementsError("amount"));
  }
  let from;
  try {
    from = decodeAddressToMuxedAccount(opts.from);
  } catch {
    throw new Error("from address is invalid");
  }
  const clawbackOp = new types.ClawbackOp({
    amount: toXDRAmount(opts.amount),
    asset: opts.asset.toXDRObject(),
    from
  });
  const opAttributes = {
    sourceAccount: null,
    body: types.OperationBody.clawback(clawbackOp)
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(opAttributes);
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/operations/set_trustline_flags.js
function setTrustLineFlags(opts) {
  if (typeof opts.flags !== "object" || Object.keys(opts.flags).length === 0) {
    throw new Error("opts.flags must be a map of boolean flags to modify");
  }
  const mapping = {
    authorized: types.TrustLineFlags.authorizedFlag(),
    authorizedToMaintainLiabilities: types.TrustLineFlags.authorizedToMaintainLiabilitiesFlag(),
    clawbackEnabled: types.TrustLineFlags.trustlineClawbackEnabledFlag()
  };
  let clearFlag = 0;
  let setFlag = 0;
  Object.keys(opts.flags).forEach((flagName) => {
    if (!Object.prototype.hasOwnProperty.call(mapping, flagName)) {
      throw new Error(`unsupported flag name specified: ${flagName}`);
    }
    const flagValue = opts.flags[flagName];
    const bit = mapping[flagName];
    if (!bit) {
      throw new Error(`Invalid flag name: ${flagName}`);
    }
    if (typeof flagValue !== "boolean" && typeof flagValue !== "undefined") {
      throw new TypeError(
        `opts.flags.${flagName} must be a boolean (got ${typeof flagValue})`
      );
    }
    if (flagValue === true) {
      setFlag |= bit.value;
    } else if (flagValue === false) {
      clearFlag |= bit.value;
    }
  });
  const trustor = Keypair.fromPublicKey(opts.trustor).xdrAccountId();
  const asset = opts.asset.toXDRObject();
  const opAttributes = {
    sourceAccount: null,
    body: types.OperationBody.setTrustLineFlags(
      new types.SetTrustLineFlagsOp({
        trustor,
        asset,
        clearFlags: clearFlag,
        setFlags: setFlag
      })
    )
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(opAttributes);
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/operations/liquidity_pool_deposit.js
var import_buffer18 = require("buffer");
function liquidityPoolDeposit(opts = {}) {
  const { liquidityPoolId, maxAmountA, maxAmountB, minPrice, maxPrice } = opts;
  if (!liquidityPoolId) {
    throw new TypeError("liquidityPoolId argument is required");
  }
  const liquidityPoolIdXdr = import_buffer18.Buffer.from(
    liquidityPoolId,
    "hex"
  );
  if (!isValidAmount(maxAmountA, true)) {
    throw new TypeError(constructAmountRequirementsError("maxAmountA"));
  }
  const maxAmountAXdr = toXDRAmount(maxAmountA);
  if (!isValidAmount(maxAmountB, true)) {
    throw new TypeError(constructAmountRequirementsError("maxAmountB"));
  }
  const maxAmountBXdr = toXDRAmount(maxAmountB);
  if (minPrice === void 0) {
    throw new TypeError("minPrice argument is required");
  }
  const minPriceXdr = toXDRPrice(minPrice);
  if (maxPrice === void 0) {
    throw new TypeError("maxPrice argument is required");
  }
  const maxPriceXdr = toXDRPrice(maxPrice);
  const liquidityPoolDepositOp = new types.LiquidityPoolDepositOp({
    liquidityPoolId: liquidityPoolIdXdr,
    maxAmountA: maxAmountAXdr,
    maxAmountB: maxAmountBXdr,
    minPrice: minPriceXdr,
    maxPrice: maxPriceXdr
  });
  const opAttributes = {
    sourceAccount: null,
    body: types.OperationBody.liquidityPoolDeposit(liquidityPoolDepositOp)
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(opAttributes);
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/operations/liquidity_pool_withdraw.js
var import_buffer19 = require("buffer");
function liquidityPoolWithdraw(opts = {}) {
  if (!opts.liquidityPoolId) {
    throw new TypeError("liquidityPoolId argument is required");
  }
  const liquidityPoolId = import_buffer19.Buffer.from(
    opts.liquidityPoolId,
    "hex"
  );
  if (!isValidAmount(opts.amount)) {
    throw new TypeError(constructAmountRequirementsError("amount"));
  }
  const amount = toXDRAmount(opts.amount);
  if (!isValidAmount(opts.minAmountA, true)) {
    throw new TypeError(constructAmountRequirementsError("minAmountA"));
  }
  const minAmountA = toXDRAmount(opts.minAmountA);
  if (!isValidAmount(opts.minAmountB, true)) {
    throw new TypeError(constructAmountRequirementsError("minAmountB"));
  }
  const minAmountB = toXDRAmount(opts.minAmountB);
  const liquidityPoolWithdrawOp = new types.LiquidityPoolWithdrawOp({
    liquidityPoolId,
    amount,
    minAmountA,
    minAmountB
  });
  const opAttributes = {
    sourceAccount: null,
    body: types.OperationBody.liquidityPoolWithdraw(liquidityPoolWithdrawOp)
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(opAttributes);
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/operations/invoke_host_function.js
var import_buffer21 = require("buffer");

// node_modules/@stellar/stellar-sdk/lib/esm/base/address.js
var import_buffer20 = require("buffer");
var Address = class _Address {
  _type;
  _key;
  /**
   * @param address - a {@link StrKey} of the address value
   */
  constructor(address) {
    if (StrKey.isValidEd25519PublicKey(address)) {
      this._type = "account";
      this._key = StrKey.decodeEd25519PublicKey(address);
    } else if (StrKey.isValidContract(address)) {
      this._type = "contract";
      this._key = StrKey.decodeContract(address);
    } else if (StrKey.isValidMed25519PublicKey(address)) {
      this._type = "muxedAccount";
      this._key = StrKey.decodeMed25519PublicKey(address);
    } else if (StrKey.isValidClaimableBalance(address)) {
      this._type = "claimableBalance";
      this._key = StrKey.decodeClaimableBalance(address);
    } else if (StrKey.isValidLiquidityPool(address)) {
      this._type = "liquidityPool";
      this._key = StrKey.decodeLiquidityPool(address);
    } else {
      throw new Error(`Unsupported address type: ${address}`);
    }
  }
  /**
   * Parses a string and returns an Address object.
   *
   * @param address - The address to parse. ex. `GB3KJPLFUYN5VL6R3GU3EGCGVCKFDSD7BEDX42HWG5BWFKB3KQGJJRMA`
   */
  static fromString(address) {
    return new _Address(address);
  }
  /**
   * Creates a new account Address object from a buffer of raw bytes.
   *
   * @param buffer - The bytes of an address to parse.
   */
  static account(buffer) {
    return new _Address(StrKey.encodeEd25519PublicKey(buffer));
  }
  /**
   * Creates a new contract Address object from a buffer of raw bytes.
   *
   * @param buffer - The bytes of an address to parse.
   */
  static contract(buffer) {
    return new _Address(StrKey.encodeContract(buffer));
  }
  /**
   * Creates a new claimable balance Address object from a buffer of raw bytes.
   *
   * @param buffer - The bytes of a claimable balance ID to parse.
   */
  static claimableBalance(buffer) {
    return new _Address(StrKey.encodeClaimableBalance(buffer));
  }
  /**
   * Creates a new liquidity pool Address object from a buffer of raw bytes.
   *
   * @param buffer - The bytes of an LP ID to parse.
   */
  static liquidityPool(buffer) {
    return new _Address(StrKey.encodeLiquidityPool(buffer));
  }
  /**
   * Creates a new muxed account Address object from a buffer of raw bytes.
   *
   * @param buffer - The bytes of an address to parse.
   */
  static muxedAccount(buffer) {
    return new _Address(StrKey.encodeMed25519PublicKey(buffer));
  }
  /**
   * Convert this from an xdr.ScVal type.
   *
   * @param scVal - The xdr.ScVal type to parse
   */
  static fromScVal(scVal) {
    return _Address.fromScAddress(scVal.address());
  }
  /**
   * Convert this from an xdr.ScAddress type
   *
   * @param scAddress - The xdr.ScAddress type to parse
   */
  static fromScAddress(scAddress) {
    switch (scAddress.switch().value) {
      case types.ScAddressType.scAddressTypeAccount().value:
        return _Address.account(scAddress.accountId().ed25519());
      case types.ScAddressType.scAddressTypeContract().value:
        return _Address.contract(scAddress.contractId());
      case types.ScAddressType.scAddressTypeMuxedAccount().value: {
        const raw = import_buffer20.Buffer.concat([
          scAddress.muxedAccount().ed25519(),
          scAddress.muxedAccount().id().toXDR("raw")
        ]);
        return _Address.muxedAccount(raw);
      }
      case types.ScAddressType.scAddressTypeClaimableBalance().value: {
        const cbi = scAddress.claimableBalanceId();
        return _Address.claimableBalance(
          import_buffer20.Buffer.concat([import_buffer20.Buffer.from([cbi.switch().value]), cbi.v0()])
        );
      }
      case types.ScAddressType.scAddressTypeLiquidityPool().value:
        return _Address.liquidityPool(
          scAddress.liquidityPoolId()
        );
      default:
        throw new Error(`Unsupported address type: ${scAddress.switch().name}`);
    }
  }
  /**
   * Serialize an address to string.
   */
  toString() {
    switch (this._type) {
      case "account":
        return StrKey.encodeEd25519PublicKey(this._key);
      case "contract":
        return StrKey.encodeContract(this._key);
      case "claimableBalance":
        return StrKey.encodeClaimableBalance(this._key);
      case "liquidityPool":
        return StrKey.encodeLiquidityPool(this._key);
      case "muxedAccount":
        return StrKey.encodeMed25519PublicKey(this._key);
      default:
        throw new Error("Unsupported address type");
    }
  }
  /**
   * Convert this Address to an xdr.ScVal type.
   */
  toScVal() {
    return types.ScVal.scvAddress(this.toScAddress());
  }
  /**
   * Convert this Address to an xdr.ScAddress type.
   */
  toScAddress() {
    switch (this._type) {
      case "account":
        return types.ScAddress.scAddressTypeAccount(
          types.PublicKey.publicKeyTypeEd25519(this._key)
        );
      case "contract":
        return types.ScAddress.scAddressTypeContract(
          this._key
        );
      case "liquidityPool":
        return types.ScAddress.scAddressTypeLiquidityPool(
          this._key
        );
      case "claimableBalance":
        return types.ScAddress.scAddressTypeClaimableBalance(
          types.ClaimableBalanceId.claimableBalanceIdTypeV0(
            this._key.subarray(1)
          )
        );
      case "muxedAccount":
        return types.ScAddress.scAddressTypeMuxedAccount(
          new types.MuxedEd25519Account({
            ed25519: this._key.subarray(0, 32),
            id: types.Uint64.fromXDR(this._key.subarray(32, 40), "raw")
          })
        );
      default:
        throw new Error("Unsupported address type");
    }
  }
  /**
   * Return the raw public key bytes for this address.
   */
  toBuffer() {
    return this._key;
  }
  /**
   * Return the type of this address.
   */
  get type() {
    return this._type;
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/base/operations/invoke_host_function.js
function invokeHostFunction(opts) {
  if (!opts.func) {
    throw new TypeError(
      `host function invocation ('func') required (got ${JSON.stringify(opts)})`
    );
  }
  if (opts.func.switch().value === types.HostFunctionType.hostFunctionTypeInvokeContract().value) {
    opts.func.invokeContract().args().forEach((arg) => {
      let scv;
      try {
        scv = Address.fromScVal(arg);
      } catch {
        return;
      }
      switch (scv.type) {
        case "claimableBalance":
        case "liquidityPool":
          throw new TypeError(
            `claimable balances and liquidity pools cannot be arguments to invokeHostFunction`
          );
      }
    });
  }
  const invokeHostFunctionOp = new types.InvokeHostFunctionOp({
    hostFunction: opts.func,
    auth: opts.auth || []
  });
  const opAttributes = {
    sourceAccount: null,
    body: types.OperationBody.invokeHostFunction(invokeHostFunctionOp)
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(opAttributes);
}
function invokeContractFunction(opts) {
  const c = new Address(opts.contract);
  if (c.type !== "contract") {
    throw new TypeError(
      `expected contract strkey instance, got ${c.toString()}`
    );
  }
  return invokeHostFunction({
    func: types.HostFunction.hostFunctionTypeInvokeContract(
      new types.InvokeContractArgs({
        contractAddress: c.toScAddress(),
        functionName: opts.function,
        args: opts.args
      })
    ),
    ...opts.source !== void 0 && { source: opts.source },
    ...opts.auth !== void 0 && { auth: opts.auth }
  });
}
function createCustomContract(opts) {
  const salt = import_buffer21.Buffer.from(opts.salt || getSalty());
  if (!opts.wasmHash || opts.wasmHash.length !== 32) {
    throw new TypeError(
      `expected hash(contract WASM) in 'opts.wasmHash', got ${String(opts.wasmHash)}`
    );
  }
  if (salt.length !== 32) {
    throw new TypeError(
      `expected 32-byte salt in 'opts.salt', got ${String(opts.salt)}`
    );
  }
  return invokeHostFunction({
    func: types.HostFunction.hostFunctionTypeCreateContractV2(
      new types.CreateContractArgsV2({
        executable: types.ContractExecutable.contractExecutableWasm(
          import_buffer21.Buffer.from(opts.wasmHash)
        ),
        contractIdPreimage: types.ContractIdPreimage.contractIdPreimageFromAddress(
          new types.ContractIdPreimageFromAddress({
            address: opts.address.toScAddress(),
            salt
          })
        ),
        constructorArgs: opts.constructorArgs ?? []
      })
    ),
    ...opts.source !== void 0 && { source: opts.source },
    ...opts.auth !== void 0 && { auth: opts.auth }
  });
}
function createStellarAssetContract(opts) {
  let asset = opts.asset;
  if (typeof asset === "string") {
    const parts = asset.split(":");
    const code = parts[0];
    if (code === void 0) {
      throw new TypeError(
        `expected Asset in 'opts.asset', got ${String(opts.asset)}`
      );
    }
    asset = new Asset(code, parts[1]);
  }
  if (!(asset instanceof Asset)) {
    throw new TypeError(
      `expected Asset in 'opts.asset', got ${String(opts.asset)}`
    );
  }
  return invokeHostFunction({
    func: types.HostFunction.hostFunctionTypeCreateContract(
      new types.CreateContractArgs({
        executable: types.ContractExecutable.contractExecutableStellarAsset(),
        contractIdPreimage: types.ContractIdPreimage.contractIdPreimageFromAsset(
          asset.toXDRObject()
        )
      })
    ),
    auth: opts.auth || [],
    ...opts.source !== void 0 && { source: opts.source }
  });
}
function uploadContractWasm(opts) {
  return invokeHostFunction({
    func: types.HostFunction.hostFunctionTypeUploadContractWasm(
      import_buffer21.Buffer.from(opts.wasm)
      // coalesce so we can drop `Buffer` someday
    ),
    auth: opts.auth || [],
    ...opts.source !== void 0 && { source: opts.source }
  });
}
function getSalty() {
  return Keypair.random().xdrPublicKey().value();
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/operations/extend_footprint_ttl.js
function extendFootprintTtl(opts) {
  if ((opts.extendTo ?? -1) <= 0) {
    throw new RangeError("extendTo has to be positive");
  }
  const extendFootprintOp = new types.ExtendFootprintTtlOp({
    ext: new types.ExtensionPoint(0),
    extendTo: opts.extendTo
  });
  const opAttributes = {
    sourceAccount: null,
    body: types.OperationBody.extendFootprintTtl(extendFootprintOp)
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(opAttributes);
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/operations/restore_footprint.js
function restoreFootprint(opts = {}) {
  const op = new types.RestoreFootprintOp({
    ext: new types.ExtensionPoint(0)
  });
  const opAttributes = {
    sourceAccount: null,
    body: types.OperationBody.restoreFootprint(op)
  };
  setSourceAccount(opAttributes, opts);
  return new types.Operation(opAttributes);
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/operation.js
var AuthRequiredFlag = 1 << 0;
var AuthRevocableFlag = 1 << 1;
var AuthImmutableFlag = 1 << 2;
var AuthClawbackEnabledFlag = 1 << 3;
var Operation = class {
  /**
   * Deconstructs the raw XDR operation object into the structured object that
   * was used to create the operation (i.e. the `opts` parameter to most ops).
   *
   * @param operation - An XDR Operation.
   */
  static fromXDRObject(operation) {
    const result = {};
    const sourceAccount = operation.sourceAccount();
    if (sourceAccount) {
      result.source = encodeMuxedAccountToAddress(sourceAccount);
    }
    const attrs = operation.body().value();
    const operationName = operation.body().switch().name;
    switch (operationName) {
      case "createAccount": {
        result.type = "createAccount";
        result.destination = accountIdtoAddress(attrs.destination());
        result.startingBalance = fromXDRAmount(attrs.startingBalance());
        break;
      }
      case "payment": {
        result.type = "payment";
        result.destination = encodeMuxedAccountToAddress(attrs.destination());
        result.asset = Asset.fromOperation(attrs.asset());
        result.amount = fromXDRAmount(attrs.amount());
        break;
      }
      case "pathPaymentStrictReceive": {
        result.type = "pathPaymentStrictReceive";
        result.sendAsset = Asset.fromOperation(attrs.sendAsset());
        result.sendMax = fromXDRAmount(attrs.sendMax());
        result.destination = encodeMuxedAccountToAddress(attrs.destination());
        result.destAsset = Asset.fromOperation(attrs.destAsset());
        result.destAmount = fromXDRAmount(attrs.destAmount());
        result.path = [];
        const path2 = attrs.path();
        Object.keys(path2).forEach((pathKey) => {
          result.path.push(Asset.fromOperation(path2[pathKey]));
        });
        break;
      }
      case "pathPaymentStrictSend": {
        result.type = "pathPaymentStrictSend";
        result.sendAsset = Asset.fromOperation(attrs.sendAsset());
        result.sendAmount = fromXDRAmount(attrs.sendAmount());
        result.destination = encodeMuxedAccountToAddress(attrs.destination());
        result.destAsset = Asset.fromOperation(attrs.destAsset());
        result.destMin = fromXDRAmount(attrs.destMin());
        result.path = [];
        const path2 = attrs.path();
        Object.keys(path2).forEach((pathKey) => {
          result.path.push(Asset.fromOperation(path2[pathKey]));
        });
        break;
      }
      case "changeTrust": {
        result.type = "changeTrust";
        switch (attrs.line().switch()) {
          case types.AssetType.assetTypePoolShare():
            result.line = LiquidityPoolAsset.fromOperation(attrs.line());
            break;
          default:
            result.line = Asset.fromOperation(attrs.line());
            break;
        }
        result.limit = fromXDRAmount(attrs.limit());
        break;
      }
      case "allowTrust": {
        result.type = "allowTrust";
        result.trustor = accountIdtoAddress(attrs.trustor());
        result.assetCode = attrs.asset().value().toString();
        result.assetCode = trimEnd(result.assetCode, "\0");
        result.authorize = attrs.authorize();
        break;
      }
      case "setOptions": {
        result.type = "setOptions";
        if (attrs.inflationDest()) {
          result.inflationDest = accountIdtoAddress(attrs.inflationDest());
        }
        result.clearFlags = attrs.clearFlags();
        result.setFlags = attrs.setFlags();
        result.masterWeight = attrs.masterWeight();
        result.lowThreshold = attrs.lowThreshold();
        result.medThreshold = attrs.medThreshold();
        result.highThreshold = attrs.highThreshold();
        result.homeDomain = attrs.homeDomain() !== void 0 ? attrs.homeDomain().toString("ascii") : void 0;
        if (attrs.signer()) {
          const signer = {};
          const arm = attrs.signer().key().arm();
          if (arm === "ed25519") {
            signer.ed25519PublicKey = accountIdtoAddress(attrs.signer().key());
          } else if (arm === "preAuthTx") {
            signer.preAuthTx = attrs.signer().key().preAuthTx();
          } else if (arm === "hashX") {
            signer.sha256Hash = attrs.signer().key().hashX();
          } else if (arm === "ed25519SignedPayload") {
            const signedPayload = attrs.signer().key().ed25519SignedPayload();
            signer.ed25519SignedPayload = StrKey.encodeSignedPayload(
              signedPayload.toXDR()
            );
          }
          signer.weight = attrs.signer().weight();
          result.signer = signer;
        }
        break;
      }
      // the next case intentionally falls through!
      case "manageOffer":
      case "manageSellOffer": {
        result.type = "manageSellOffer";
        result.selling = Asset.fromOperation(attrs.selling());
        result.buying = Asset.fromOperation(attrs.buying());
        result.amount = fromXDRAmount(attrs.amount());
        result.price = fromXDRPrice(attrs.price());
        result.offerId = attrs.offerId().toString();
        break;
      }
      case "manageBuyOffer": {
        result.type = "manageBuyOffer";
        result.selling = Asset.fromOperation(attrs.selling());
        result.buying = Asset.fromOperation(attrs.buying());
        result.buyAmount = fromXDRAmount(attrs.buyAmount());
        result.price = fromXDRPrice(attrs.price());
        result.offerId = attrs.offerId().toString();
        break;
      }
      // the next case intentionally falls through!
      case "createPassiveOffer":
      case "createPassiveSellOffer": {
        result.type = "createPassiveSellOffer";
        result.selling = Asset.fromOperation(attrs.selling());
        result.buying = Asset.fromOperation(attrs.buying());
        result.amount = fromXDRAmount(attrs.amount());
        result.price = fromXDRPrice(attrs.price());
        break;
      }
      case "accountMerge": {
        result.type = "accountMerge";
        result.destination = encodeMuxedAccountToAddress(attrs);
        break;
      }
      case "manageData": {
        result.type = "manageData";
        result.name = attrs.dataName().toString("ascii");
        result.value = attrs.dataValue();
        break;
      }
      case "inflation": {
        result.type = "inflation";
        break;
      }
      case "bumpSequence": {
        result.type = "bumpSequence";
        result.bumpTo = attrs.bumpTo().toString();
        break;
      }
      case "createClaimableBalance": {
        result.type = "createClaimableBalance";
        result.asset = Asset.fromOperation(attrs.asset());
        result.amount = fromXDRAmount(attrs.amount());
        result.claimants = [];
        attrs.claimants().forEach((claimant) => {
          result.claimants.push(Claimant.fromXDR(claimant));
        });
        break;
      }
      case "claimClaimableBalance": {
        result.type = "claimClaimableBalance";
        result.balanceId = attrs.toXDR("hex");
        break;
      }
      case "beginSponsoringFutureReserves": {
        result.type = "beginSponsoringFutureReserves";
        result.sponsoredId = accountIdtoAddress(attrs.sponsoredId());
        break;
      }
      case "endSponsoringFutureReserves": {
        result.type = "endSponsoringFutureReserves";
        break;
      }
      case "revokeSponsorship": {
        extractRevokeSponshipDetails(attrs, result);
        break;
      }
      case "clawback": {
        result.type = "clawback";
        result.amount = fromXDRAmount(attrs.amount());
        result.from = encodeMuxedAccountToAddress(attrs.from());
        result.asset = Asset.fromOperation(attrs.asset());
        break;
      }
      case "clawbackClaimableBalance": {
        result.type = "clawbackClaimableBalance";
        result.balanceId = attrs.toXDR("hex");
        break;
      }
      case "setTrustLineFlags": {
        result.type = "setTrustLineFlags";
        result.asset = Asset.fromOperation(attrs.asset());
        result.trustor = accountIdtoAddress(attrs.trustor());
        const clears = attrs.clearFlags();
        const sets = attrs.setFlags();
        const mapping = {
          authorized: types.TrustLineFlags.authorizedFlag(),
          authorizedToMaintainLiabilities: types.TrustLineFlags.authorizedToMaintainLiabilitiesFlag(),
          clawbackEnabled: types.TrustLineFlags.trustlineClawbackEnabledFlag()
        };
        const getFlagValue = (key) => {
          const bit = mapping[key]?.value ?? 0;
          if (sets & bit) {
            return true;
          }
          if (clears & bit) {
            return false;
          }
          return void 0;
        };
        const flags = {};
        Object.keys(mapping).forEach((flagName) => {
          flags[flagName] = getFlagValue(flagName);
        });
        result.flags = flags;
        break;
      }
      case "liquidityPoolDeposit": {
        result.type = "liquidityPoolDeposit";
        result.liquidityPoolId = attrs.liquidityPoolId().toString("hex");
        result.maxAmountA = fromXDRAmount(attrs.maxAmountA());
        result.maxAmountB = fromXDRAmount(attrs.maxAmountB());
        result.minPrice = fromXDRPrice(attrs.minPrice());
        result.maxPrice = fromXDRPrice(attrs.maxPrice());
        break;
      }
      case "liquidityPoolWithdraw": {
        result.type = "liquidityPoolWithdraw";
        result.liquidityPoolId = attrs.liquidityPoolId().toString("hex");
        result.amount = fromXDRAmount(attrs.amount());
        result.minAmountA = fromXDRAmount(attrs.minAmountA());
        result.minAmountB = fromXDRAmount(attrs.minAmountB());
        break;
      }
      case "invokeHostFunction": {
        result.type = "invokeHostFunction";
        result.func = attrs.hostFunction();
        result.auth = attrs.auth() ?? [];
        break;
      }
      case "extendFootprintTtl": {
        result.type = "extendFootprintTtl";
        result.extendTo = attrs.extendTo();
        break;
      }
      case "restoreFootprint": {
        result.type = "restoreFootprint";
        break;
      }
      default: {
        throw new Error(`Unknown operation: ${operationName}`);
      }
    }
    return result;
  }
  // Attach all imported operations as static methods on the Operation class
  static accountMerge = accountMerge;
  static allowTrust = allowTrust;
  static bumpSequence = bumpSequence;
  static changeTrust = changeTrust;
  static createAccount = createAccount;
  static createClaimableBalance = createClaimableBalance;
  static claimClaimableBalance = claimClaimableBalance;
  static clawbackClaimableBalance = clawbackClaimableBalance;
  static createPassiveSellOffer = createPassiveSellOffer;
  static inflation = inflation;
  static manageData = manageData;
  static manageSellOffer = manageSellOffer;
  static manageBuyOffer = manageBuyOffer;
  static pathPaymentStrictReceive = pathPaymentStrictReceive;
  static pathPaymentStrictSend = pathPaymentStrictSend;
  static payment = payment;
  static setOptions = setOptions;
  static beginSponsoringFutureReserves = beginSponsoringFutureReserves;
  static endSponsoringFutureReserves = endSponsoringFutureReserves;
  static revokeAccountSponsorship = revokeAccountSponsorship;
  static revokeTrustlineSponsorship = revokeTrustlineSponsorship;
  static revokeOfferSponsorship = revokeOfferSponsorship;
  static revokeDataSponsorship = revokeDataSponsorship;
  static revokeClaimableBalanceSponsorship = revokeClaimableBalanceSponsorship;
  static revokeLiquidityPoolSponsorship = revokeLiquidityPoolSponsorship;
  static revokeSignerSponsorship = revokeSignerSponsorship;
  static clawback = clawback;
  static setTrustLineFlags = setTrustLineFlags;
  static liquidityPoolDeposit = liquidityPoolDeposit;
  static liquidityPoolWithdraw = liquidityPoolWithdraw;
  static invokeHostFunction = invokeHostFunction;
  static extendFootprintTtl = extendFootprintTtl;
  static restoreFootprint = restoreFootprint;
  // These are not `xdr.Operation`s directly, but proxies for common
  // versions of `Operation.invokeHostFunction`
  static createStellarAssetContract = createStellarAssetContract;
  static invokeContractFunction = invokeContractFunction;
  static createCustomContract = createCustomContract;
  static uploadContractWasm = uploadContractWasm;
};
function extractRevokeSponshipDetails(attrs, result) {
  switch (attrs.switch().name) {
    case "revokeSponsorshipLedgerEntry": {
      const ledgerKey = attrs.ledgerKey();
      switch (ledgerKey.switch().name) {
        case types.LedgerEntryType.account().name: {
          result.type = "revokeAccountSponsorship";
          result.account = accountIdtoAddress(ledgerKey.account().accountId());
          break;
        }
        case types.LedgerEntryType.trustline().name: {
          result.type = "revokeTrustlineSponsorship";
          result.account = accountIdtoAddress(
            ledgerKey.trustLine().accountId()
          );
          const xdrAsset = ledgerKey.trustLine().asset();
          switch (xdrAsset.switch()) {
            case types.AssetType.assetTypePoolShare():
              result.asset = LiquidityPoolId.fromOperation(xdrAsset);
              break;
            default:
              result.asset = Asset.fromOperation(xdrAsset);
              break;
          }
          break;
        }
        case types.LedgerEntryType.offer().name: {
          result.type = "revokeOfferSponsorship";
          result.seller = accountIdtoAddress(ledgerKey.offer().sellerId());
          result.offerId = ledgerKey.offer().offerId().toString();
          break;
        }
        case types.LedgerEntryType.data().name: {
          result.type = "revokeDataSponsorship";
          result.account = accountIdtoAddress(ledgerKey.data().accountId());
          result.name = ledgerKey.data().dataName().toString("ascii");
          break;
        }
        case types.LedgerEntryType.claimableBalance().name: {
          result.type = "revokeClaimableBalanceSponsorship";
          result.balanceId = ledgerKey.claimableBalance().balanceId().toXDR("hex");
          break;
        }
        case types.LedgerEntryType.liquidityPool().name: {
          result.type = "revokeLiquidityPoolSponsorship";
          result.liquidityPoolId = ledgerKey.liquidityPool().liquidityPoolId().toString("hex");
          break;
        }
        default: {
          throw new Error(`Unknown ledgerKey: ${attrs.switch().name}`);
        }
      }
      break;
    }
    case "revokeSponsorshipSigner": {
      result.type = "revokeSignerSponsorship";
      result.account = accountIdtoAddress(attrs.signer().accountId());
      result.signer = convertXDRSignerKeyToObject(attrs.signer().signerKey());
      break;
    }
    default: {
      throw new Error(`Unknown revokeSponsorship: ${attrs.switch().name}`);
    }
  }
}
function convertXDRSignerKeyToObject(signerKey) {
  const attrs = {};
  switch (signerKey.switch().name) {
    case types.SignerKeyType.signerKeyTypeEd25519().name: {
      attrs.ed25519PublicKey = StrKey.encodeEd25519PublicKey(
        signerKey.ed25519()
      );
      break;
    }
    case types.SignerKeyType.signerKeyTypePreAuthTx().name: {
      attrs.preAuthTx = signerKey.preAuthTx().toString("hex");
      break;
    }
    case types.SignerKeyType.signerKeyTypeHashX().name: {
      attrs.sha256Hash = signerKey.hashX().toString("hex");
      break;
    }
    case types.SignerKeyType.signerKeyTypeEd25519SignedPayload().name: {
      const signedPayload = signerKey.ed25519SignedPayload();
      attrs.ed25519SignedPayload = StrKey.encodeSignedPayload(
        signedPayload.toXDR()
      );
      break;
    }
    default: {
      throw new Error(`Unknown signerKey: ${signerKey.switch().name}`);
    }
  }
  return attrs;
}
function accountIdtoAddress(accountId) {
  return StrKey.encodeEd25519PublicKey(accountId.ed25519());
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/memo.js
var import_buffer22 = require("buffer");
var MemoNone = "none";
var MemoID = "id";
var MemoText = "text";
var MemoHash = "hash";
var MemoReturn = "return";
var Memo = class _Memo {
  _type;
  _value;
  /**
   * @param type - `MemoNone`, `MemoID`, `MemoText`, `MemoHash` or `MemoReturn`
   * @param value - `string` for `MemoID`, `MemoText`, buffer or hex string for `MemoHash` or `MemoReturn`
   */
  constructor(type, value = null) {
    this._type = type;
    this._value = value;
    switch (this._type) {
      case MemoNone:
        break;
      case MemoID:
        _Memo._validateIdValue(value);
        break;
      case MemoText:
        _Memo._validateTextValue(value);
        break;
      case MemoHash:
      case MemoReturn:
        _Memo._validateHashValue(value);
        if (typeof value === "string") {
          this._value = import_buffer22.Buffer.from(value, "hex");
        }
        break;
      default:
        throw new Error("Invalid memo type");
    }
  }
  /**
   * Contains memo type: `MemoNone`, `MemoID`, `MemoText`, `MemoHash` or `MemoReturn`
   */
  get type() {
    return this._type;
  }
  set type(_type) {
    throw new Error("Memo is immutable");
  }
  /**
   * Contains memo value:
   * * `null` for `MemoNone`,
   * * `string` for `MemoID`,
   * * `Buffer` for `MemoText` after decoding using `fromXDRObject`, original value otherwise,
   * * `Buffer` for `MemoHash`, `MemoReturn`.
   */
  get value() {
    switch (this._type) {
      case MemoNone:
        return null;
      case MemoID:
      case MemoText:
        return this._value;
      case MemoHash:
      case MemoReturn:
        return import_buffer22.Buffer.from(this._value);
      default:
        throw new Error("Invalid memo type");
    }
  }
  set value(_value) {
    throw new Error("Memo is immutable");
  }
  static _validateIdValue(value) {
    const error = new Error(`Expects a uint64 as a string. Got ${value}`);
    if (typeof value !== "string") {
      throw error;
    }
    if (!/^[0-9]+$/.test(value)) {
      throw error;
    }
    let number;
    try {
      number = new BigNumber2(value);
    } catch {
      throw error;
    }
    if (!number.isFinite()) {
      throw error;
    }
    if (number.isNaN()) {
      throw error;
    }
    if (number.isNegative()) {
      throw error;
    }
    if (!number.isInteger()) {
      throw error;
    }
    if (number.isGreaterThan("18446744073709551615")) {
      throw error;
    }
  }
  static _validateTextValue(value) {
    if (typeof value === "string") {
      if (import_buffer22.Buffer.byteLength(value, "utf8") > 28) {
        throw new Error("Expects string, array or buffer, max 28 bytes");
      }
    } else if (import_buffer22.Buffer.isBuffer(value)) {
      if (value.length > 28) {
        throw new Error("Expects string, array or buffer, max 28 bytes");
      }
    } else {
      if (!types.Memo.armTypeForArm("text").isValid(value)) {
        throw new Error("Expects string, array or buffer, max 28 bytes");
      }
    }
  }
  static _validateHashValue(value) {
    const error = new Error(
      `Expects a 32 byte hash value or hex encoded string. Got ${String(value)}`
    );
    if (value === null || typeof value === "undefined") {
      throw error;
    }
    let valueBuffer;
    if (typeof value === "string") {
      if (!/^[0-9A-Fa-f]{64}$/g.test(value)) {
        throw error;
      }
      valueBuffer = import_buffer22.Buffer.from(value, "hex");
    } else if (import_buffer22.Buffer.isBuffer(value)) {
      valueBuffer = import_buffer22.Buffer.from(value);
    } else {
      throw error;
    }
    if (!valueBuffer.length || valueBuffer.length !== 32) {
      throw error;
    }
  }
  /**
   * Returns an empty memo (`MemoNone`).
   */
  static none() {
    return new _Memo(MemoNone);
  }
  /**
   * Creates and returns a `MemoText` memo.
   *
   * @param text - memo text
   */
  static text(text) {
    return new _Memo(MemoText, text);
  }
  /**
   * Creates and returns a `MemoID` memo.
   *
   * @param id - 64-bit number represented as a string
   */
  static id(id) {
    return new _Memo(MemoID, id);
  }
  /**
   * Creates and returns a `MemoHash` memo.
   *
   * @param hash - 32 byte hash or hex encoded string
   */
  static hash(hash2) {
    return new _Memo(MemoHash, hash2);
  }
  /**
   * Creates and returns a `MemoReturn` memo.
   *
   * @param hash - 32 byte hash or hex encoded string
   */
  static return(hash2) {
    return new _Memo(MemoReturn, hash2);
  }
  /**
   * Returns XDR memo object.
   */
  toXDRObject() {
    switch (this._type) {
      case MemoNone:
        return types.Memo.memoNone();
      case MemoID:
        return types.Memo.memoId(
          types.Uint64.fromString(
            UnsignedHyper.fromString(this._value).toString()
          )
        );
      case MemoText:
        return types.Memo.memoText(this._value);
      case MemoHash:
        return types.Memo.memoHash(this._value);
      case MemoReturn:
        return types.Memo.memoReturn(this._value);
      default:
        throw new Error("Invalid memo type");
    }
  }
  /**
   * Returns {@link Memo} from XDR memo object.
   *
   * @param object - XDR memo object
   */
  static fromXDRObject(object) {
    switch (object.switch()) {
      case types.MemoType.memoId():
        return _Memo.id(object.id().toString());
      case types.MemoType.memoText():
        return _Memo.text(object.value());
      case types.MemoType.memoHash():
        return _Memo.hash(object.hash());
      case types.MemoType.memoReturn():
        return _Memo.return(object.retHash());
    }
    if (typeof object.value() === "undefined") {
      return _Memo.none();
    }
    throw new Error("Unknown type");
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/base/transaction_base.js
var import_buffer23 = require("buffer");
var TransactionBase = class {
  _tx;
  _signatures;
  _fee;
  _networkPassphrase;
  constructor(tx, signatures, fee, networkPassphrase) {
    if (typeof networkPassphrase !== "string") {
      throw new Error(
        `Invalid passphrase provided to Transaction: expected a string but got a ${typeof networkPassphrase}`
      );
    }
    this._networkPassphrase = networkPassphrase;
    this._tx = tx;
    this._signatures = signatures;
    this._fee = fee;
  }
  /** The list of signatures for this transaction. */
  get signatures() {
    return this._signatures;
  }
  set signatures(_value) {
    throw new Error("Transaction is immutable");
  }
  /**
   * The underlying XDR transaction object.
   *
   * Returns a defensive copy so that external mutations cannot alter the
   * transaction that will be signed or serialized.
   *
   * @throws if the internal transaction is not a recognized XDR type
   */
  get tx() {
    const buf = this._tx.toXDR();
    if (this._tx instanceof types.Transaction) {
      return types.Transaction.fromXDR(buf);
    }
    if (this._tx instanceof types.TransactionV0) {
      return types.TransactionV0.fromXDR(buf);
    }
    if (this._tx instanceof types.FeeBumpTransaction) {
      return types.FeeBumpTransaction.fromXDR(buf);
    }
    throw new Error("Unknown transaction type");
  }
  set tx(_value) {
    throw new Error("Transaction is immutable");
  }
  /** The total fee for this transaction, in stroops. */
  get fee() {
    return this._fee;
  }
  set fee(_value) {
    throw new Error("Transaction is immutable");
  }
  /** The network passphrase for this transaction. */
  get networkPassphrase() {
    return this._networkPassphrase;
  }
  set networkPassphrase(_networkPassphrase) {
    throw new Error("Transaction is immutable");
  }
  /**
   * Signs the transaction with the given {@link Keypair}.
   * @param keypairs - Keypairs of signers
   */
  sign(...keypairs) {
    const txHash = this.hash();
    keypairs.forEach((kp) => {
      const sig = kp.signDecorated(txHash);
      this.signatures.push(sig);
    });
  }
  /**
   * Signs a transaction with the given {@link Keypair}. Useful if someone sends
   * you a transaction XDR for you to sign and return (see
   * `{@link Transaction.addSignature | addSignature}` for more information).
   *
   * When you get a transaction XDR to sign....
   * - Instantiate a `Transaction` object with the XDR
   * - Use {@link Keypair} to generate a keypair object for your Stellar seed.
   * - Run `getKeypairSignature` with that keypair
   * - Send back the signature along with your publicKey (not your secret seed!)
   *
   * Example:
   * ```javascript
   * // `transactionXDR` is a string from the person generating the transaction
   * const transaction = new Transaction(transactionXDR, networkPassphrase);
   * const keypair = Keypair.fromSecret(myStellarSeed);
   * return transaction.getKeypairSignature(keypair);
   * ```
   *
   * Returns the base64-encoded signature string for the given keypair.
   *
   * @param keypair - Keypair of signer
   */
  getKeypairSignature(keypair) {
    return keypair.sign(this.hash()).toString("base64");
  }
  /**
   * Add a signature to the transaction. Useful when a party wants to pre-sign
   * a transaction but doesn't want to give access to their secret keys.
   * This will also verify whether the signature is valid.
   *
   * Here's how you would use this feature to solicit multiple signatures.
   * - Use `TransactionBuilder` to build a new transaction.
   * - Make sure to set a long enough timeout on that transaction to give your
   * signers enough time to sign!
   * - Once you build the transaction, use `transaction.toXDR()` to get the
   * base64-encoded XDR string.
   * - _Warning!_ Once you've built this transaction, don't submit any other
   * transactions onto your account! Doing so will invalidate this pre-compiled
   * transaction!
   * - Send this XDR string to your other parties. They can use the instructions
   * for `{@link Transaction.getKeypairSignature | getKeypairSignature}` to sign the transaction.
   * - They should send you back their `publicKey` and the `signature` string
   * from `{@link Transaction.getKeypairSignature | getKeypairSignature}`, both of which you pass to
   * this function.
   *
   * @param publicKey - the public key of the signer
   * @param signature - the base64 value of the signature XDR
   */
  addSignature(publicKey = "", signature = "") {
    if (!signature || typeof signature !== "string") {
      throw new Error("Invalid signature");
    }
    if (!publicKey || typeof publicKey !== "string") {
      throw new Error("Invalid publicKey");
    }
    let keypair;
    let hint;
    const signatureBuffer = import_buffer23.Buffer.from(signature, "base64");
    try {
      keypair = Keypair.fromPublicKey(publicKey);
      hint = keypair.signatureHint();
    } catch {
      throw new Error("Invalid publicKey");
    }
    if (!keypair.verify(this.hash(), signatureBuffer)) {
      throw new Error("Invalid signature");
    }
    this.signatures.push(
      new types.DecoratedSignature({
        hint,
        signature: signatureBuffer
      })
    );
  }
  /**
   * Add a decorated signature directly to the transaction envelope.
   *
   * @param signature - raw signature to add
   *
   * @see Keypair.signDecorated
   * @see Keypair.signPayloadDecorated
   */
  addDecoratedSignature(signature) {
    this.signatures.push(signature);
  }
  /**
   * Add `hashX` signer preimage as signature.
   * @param preimage - preimage of hash used as signer
   */
  signHashX(preimage) {
    if (typeof preimage === "string") {
      preimage = import_buffer23.Buffer.from(preimage, "hex");
    }
    if (preimage.length > 64) {
      throw new Error("preimage cannot be longer than 64 bytes");
    }
    const signature = preimage;
    const hashX = hash(preimage);
    const hint = hashX.subarray(hashX.length - 4);
    this.signatures.push(new types.DecoratedSignature({ hint, signature }));
  }
  /**
   * Returns a hash for this transaction, suitable for signing.
   */
  hash() {
    return hash(this.signatureBase());
  }
  /** Returns the signature base for this transaction, to be overridden by subclasses. */
  signatureBase() {
    throw new Error("Implement in subclass");
  }
  /** Returns the XDR transaction envelope, to be overridden by subclasses. */
  toEnvelope() {
    throw new Error("Implement in subclass");
  }
  /**
   * Returns the transaction envelope as a base64-encoded XDR string.
   */
  toXDR() {
    return this.toEnvelope().toXDR().toString("base64");
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/base/transaction.js
var Transaction = class extends TransactionBase {
  _envelopeType;
  _source = "";
  _memo;
  _sequence;
  _operations;
  _timeBounds;
  _ledgerBounds;
  _minAccountSequence;
  _minAccountSequenceAge;
  _minAccountSequenceLedgerGap;
  _extraSigners;
  /**
   * @param envelope - transaction envelope object or base64 encoded string
   * @param networkPassphrase - passphrase of the target stellar network
   *     (e.g. "Public Global Stellar Network ; September 2015")
   */
  constructor(envelope, networkPassphrase) {
    if (typeof envelope === "string") {
      const buffer = import_buffer24.Buffer.from(envelope, "base64");
      envelope = types.TransactionEnvelope.fromXDR(buffer);
    }
    const envelopeType = envelope.switch();
    if (!(envelopeType === types.EnvelopeType.envelopeTypeTxV0() || envelopeType === types.EnvelopeType.envelopeTypeTx())) {
      throw new Error(
        `Invalid TransactionEnvelope: expected an envelopeTypeTxV0 or envelopeTypeTx but received an ${envelopeType.name}.`
      );
    }
    const txEnvelope = envelope.value();
    const tx = txEnvelope.tx();
    const fee = tx.fee().toString();
    const signatures = (txEnvelope.signatures() || []).slice();
    super(tx, signatures, fee, networkPassphrase);
    this._envelopeType = envelopeType;
    this._memo = tx.memo();
    this._sequence = tx.seqNum().toString();
    switch (this._envelopeType) {
      case types.EnvelopeType.envelopeTypeTxV0():
        this._source = StrKey.encodeEd25519PublicKey(
          tx.sourceAccountEd25519()
        );
        break;
      default:
        this._source = encodeMuxedAccountToAddress(
          tx.sourceAccount()
        );
        break;
    }
    let cond = null;
    let timeBounds = null;
    switch (this._envelopeType) {
      case types.EnvelopeType.envelopeTypeTxV0():
        timeBounds = tx.timeBounds();
        break;
      case types.EnvelopeType.envelopeTypeTx():
        switch (tx.cond().switch()) {
          case types.PreconditionType.precondTime():
            timeBounds = tx.cond().timeBounds();
            break;
          case types.PreconditionType.precondV2():
            cond = tx.cond().v2();
            timeBounds = cond.timeBounds();
            break;
        }
        break;
    }
    if (timeBounds) {
      this._timeBounds = {
        minTime: timeBounds.minTime().toString(),
        maxTime: timeBounds.maxTime().toString()
      };
    }
    if (cond) {
      const ledgerBounds = cond.ledgerBounds();
      if (ledgerBounds) {
        this._ledgerBounds = {
          minLedger: ledgerBounds.minLedger(),
          maxLedger: ledgerBounds.maxLedger()
        };
      }
      const minSeq = cond.minSeqNum();
      if (minSeq) {
        this._minAccountSequence = minSeq.toString();
      }
      this._minAccountSequenceAge = cond.minSeqAge().toBigInt();
      this._minAccountSequenceLedgerGap = cond.minSeqLedgerGap();
      this._extraSigners = cond.extraSigners();
    }
    const operations = tx.operations() || [];
    this._operations = operations.map((op) => Operation.fromXDRObject(op));
  }
  /**
   * The time bounds for this transaction, with `minTime` and `maxTime` as
   * 64-bit unix timestamps (strings).
   */
  get timeBounds() {
    return this._timeBounds;
  }
  set timeBounds(_value) {
    throw new Error("Transaction is immutable");
  }
  /**
   * The ledger bounds for this transaction, with `minLedger` (uint32) and
   * `maxLedger` (uint32, or 0 for no upper bound).
   */
  get ledgerBounds() {
    return this._ledgerBounds;
  }
  set ledgerBounds(_value) {
    throw new Error("Transaction is immutable");
  }
  /** The minimum account sequence (64-bit, as a string). */
  get minAccountSequence() {
    return this._minAccountSequence;
  }
  set minAccountSequence(_value) {
    throw new Error("Transaction is immutable");
  }
  /** The minimum account sequence age (64-bit number of seconds). */
  get minAccountSequenceAge() {
    return this._minAccountSequenceAge;
  }
  set minAccountSequenceAge(_value) {
    throw new Error("Transaction is immutable");
  }
  /** The minimum account sequence ledger gap (32-bit number of ledgers). */
  get minAccountSequenceLedgerGap() {
    return this._minAccountSequenceLedgerGap;
  }
  set minAccountSequenceLedgerGap(_value) {
    throw new Error("Transaction is immutable");
  }
  /**
   * Array of extra signers as XDR objects; use {@link SignerKey.encodeSignerKey}
   * to convert to StrKey strings.
   */
  get extraSigners() {
    return this._extraSigners;
  }
  set extraSigners(_value) {
    throw new Error("Transaction is immutable");
  }
  /** The sequence number for this transaction. */
  get sequence() {
    return this._sequence;
  }
  set sequence(_value) {
    throw new Error("Transaction is immutable");
  }
  /** The source account for this transaction. */
  get source() {
    return this._source;
  }
  set source(_value) {
    throw new Error("Transaction is immutable");
  }
  /** The list of operations in this transaction. */
  get operations() {
    return this._operations;
  }
  set operations(_value) {
    throw new Error("Transaction is immutable");
  }
  /** The memo attached to this transaction. */
  get memo() {
    return Memo.fromXDRObject(this._memo);
  }
  set memo(_value) {
    throw new Error("Transaction is immutable");
  }
  /**
   * Returns the "signature base" of this transaction, which is the value
   * that, when hashed, should be signed to create a signature that
   * validators on the Stellar Network will accept.
   *
   * It is composed of a 4 prefix bytes followed by the xdr-encoded form
   * of this transaction.
   */
  signatureBase() {
    let tx = this.tx;
    if (this._envelopeType === types.EnvelopeType.envelopeTypeTxV0()) {
      tx = types.Transaction.fromXDR(
        import_buffer24.Buffer.concat([
          // TransactionV0 is a transaction with the AccountID discriminant
          // stripped off, we need to put it back to build a valid transaction
          // which we can use to build a TransactionSignaturePayloadTaggedTransaction
          import_buffer24.Buffer.alloc(4),
          // AccountID discriminant: publicKeyTypeEd25519 = 0
          tx.toXDR()
        ])
      );
    }
    const taggedTransaction = types.TransactionSignaturePayloadTaggedTransaction.envelopeTypeTx(
      tx
    );
    const txSignature = new types.TransactionSignaturePayload({
      networkId: types.Hash.fromXDR(hash(this.networkPassphrase)),
      taggedTransaction
    });
    return txSignature.toXDR();
  }
  /**
   * To envelope returns a xdr.TransactionEnvelope which can be submitted to the network.
   */
  toEnvelope() {
    const rawTx = this.tx.toXDR();
    const signatures = this.signatures.slice();
    let envelope;
    switch (this._envelopeType) {
      case types.EnvelopeType.envelopeTypeTxV0():
        envelope = types.TransactionEnvelope.envelopeTypeTxV0(
          new types.TransactionV0Envelope({
            tx: types.TransactionV0.fromXDR(rawTx),
            // make a copy of tx
            signatures
          })
        );
        break;
      case types.EnvelopeType.envelopeTypeTx():
        envelope = types.TransactionEnvelope.envelopeTypeTx(
          new types.TransactionV1Envelope({
            tx: types.Transaction.fromXDR(rawTx),
            // make a copy of tx
            signatures
          })
        );
        break;
      default:
        throw new Error(
          `Invalid TransactionEnvelope: expected an envelopeTypeTxV0 or envelopeTypeTx but received an ${this._envelopeType.name}.`
        );
    }
    return envelope;
  }
  /**
   * Calculate the claimable balance ID for an operation within the transaction.
   *
   * @param opIndex - the index of the CreateClaimableBalance op
   *
   * @throws for invalid `opIndex` value, if op at `opIndex` is not
   *    `CreateClaimableBalance`, or for general XDR un/marshalling failures
   *
   * @see https://github.com/stellar/go/blob/d712346e61e288d450b0c08038c158f8848cc3e4/txnbuild/transaction.go#L392-L435
   *
   */
  getClaimableBalanceId(opIndex) {
    if (!Number.isInteger(opIndex) || opIndex < 0 || opIndex >= this.operations.length) {
      throw new RangeError("invalid operation index");
    }
    const op = this.operations[opIndex];
    if (op === void 0) {
      throw new RangeError("invalid operation index");
    }
    try {
      Operation.createClaimableBalance(
        op
      );
    } catch (err2) {
      throw new TypeError(
        `expected createClaimableBalance, got ${op.type}: ${String(err2)}`
      );
    }
    const account = StrKey.decodeEd25519PublicKey(
      extractBaseAddress(this.source)
    );
    const operationId = types.HashIdPreimage.envelopeTypeOpId(
      new types.HashIdPreimageOperationId({
        sourceAccount: types.PublicKey.publicKeyTypeEd25519(account),
        seqNum: types.Int64.fromString(this.sequence),
        opNum: opIndex
      })
    );
    const opIdHash = hash(operationId.toXDR("raw"));
    const balanceId = types.ClaimableBalanceId.claimableBalanceIdTypeV0(opIdHash);
    return balanceId.toXDR("hex");
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/base/fee_bump_transaction.js
var import_buffer25 = require("buffer");
var FeeBumpTransaction = class extends TransactionBase {
  _feeSource;
  _innerTransaction;
  /**
   * @param envelope - transaction envelope object or base64 encoded string.
   * @param networkPassphrase - passphrase of the target Stellar network
   *     (e.g. "Public Global Stellar Network ; September 2015").
   */
  constructor(envelope, networkPassphrase) {
    if (typeof envelope === "string") {
      const buffer = import_buffer25.Buffer.from(envelope, "base64");
      envelope = types.TransactionEnvelope.fromXDR(buffer);
    }
    const envelopeType = envelope.switch();
    if (envelopeType !== types.EnvelopeType.envelopeTypeTxFeeBump()) {
      throw new Error(
        `Invalid TransactionEnvelope: expected an envelopeTypeTxFeeBump but received an ${envelopeType.name}.`
      );
    }
    const txEnvelope = envelope.value();
    const tx = txEnvelope.tx();
    const fee = tx.fee().toString();
    const signatures = (txEnvelope.signatures() || []).slice();
    super(tx, signatures, fee, networkPassphrase);
    const innerTxEnvelope = types.TransactionEnvelope.envelopeTypeTx(
      tx.innerTx().v1()
    );
    this._feeSource = encodeMuxedAccountToAddress(this.tx.feeSource());
    this._innerTransaction = new Transaction(
      innerTxEnvelope,
      networkPassphrase
    );
  }
  /**
   * The inner transaction that this fee bump wraps.
   */
  get innerTransaction() {
    return this._innerTransaction;
  }
  /**
   * The operations from the inner transaction.
   */
  get operations() {
    return this._innerTransaction.operations;
  }
  /**
   * The account paying the fee for this transaction.
   */
  get feeSource() {
    return this._feeSource;
  }
  /**
   * Returns the "signature base" of this transaction, which is the value
   * that, when hashed, should be signed to create a signature that
   * validators on the Stellar Network will accept.
   *
   * It is composed of a 4 prefix bytes followed by the xdr-encoded form
   * of this transaction.
   */
  signatureBase() {
    const taggedTransaction = types.TransactionSignaturePayloadTaggedTransaction.envelopeTypeTxFeeBump(
      this.tx
    );
    const txSignature = new types.TransactionSignaturePayload({
      networkId: types.Hash.fromXDR(hash(this.networkPassphrase)),
      taggedTransaction
    });
    return txSignature.toXDR();
  }
  /**
   * To envelope returns a xdr.TransactionEnvelope which can be submitted to the network.
   */
  toEnvelope() {
    const envelope = new types.FeeBumpTransactionEnvelope({
      tx: types.FeeBumpTransaction.fromXDR(this.tx.toXDR()),
      // make a copy of the tx
      signatures: this.signatures.slice()
      // make a copy of the signatures
    });
    return types.TransactionEnvelope.envelopeTypeTxFeeBump(envelope);
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/base/sorobandata_builder.js
var import_buffer26 = require("buffer");
var SorobanDataBuilder = class _SorobanDataBuilder {
  _data;
  /**
   * @param sorobanData - either a base64-encoded string that represents an
   *      {@link xdr.SorobanTransactionData} instance or an XDR instance itself
   *      (it will be copied); if omitted or "falsy" (e.g. an empty string), it
   *      starts with an empty instance
   */
  constructor(sorobanData) {
    let data;
    if (!sorobanData) {
      data = new types.SorobanTransactionData({
        resources: new types.SorobanResources({
          footprint: new types.LedgerFootprint({ readOnly: [], readWrite: [] }),
          instructions: 0,
          diskReadBytes: 0,
          writeBytes: 0
        }),
        ext: new types.SorobanTransactionDataExt(0),
        resourceFee: new types.Int64(0)
      });
    } else if (typeof sorobanData === "string" || ArrayBuffer.isView(sorobanData)) {
      data = _SorobanDataBuilder.fromXDR(sorobanData);
    } else {
      data = _SorobanDataBuilder.fromXDR(sorobanData.toXDR());
    }
    this._data = data;
  }
  /**
   * Decodes and builds a {@link xdr.SorobanTransactionData} instance.
   *
   * @param data - raw input to decode
   */
  static fromXDR(data) {
    if (typeof data === "string") {
      return types.SorobanTransactionData.fromXDR(data, "base64");
    } else {
      return types.SorobanTransactionData.fromXDR(import_buffer26.Buffer.from(data), "raw");
    }
  }
  /**
   * Sets the resource fee portion of the Soroban data.
   *
   * @param fee - the resource fee to set (int64)
   */
  setResourceFee(fee) {
    this._data.resourceFee(new types.Int64(fee));
    return this;
  }
  /**
   * Sets up the resource metrics.
   *
   * You should almost NEVER need this, as its often generated / provided to you
   * by transaction simulation/preflight from a Soroban RPC server.
   *
   * @param cpuInstrs - number of CPU instructions
   * @param diskReadBytes - number of bytes being read from disk
   * @param writeBytes - number of bytes being written to disk/memory
   */
  setResources(cpuInstrs, diskReadBytes, writeBytes) {
    this._data.resources().instructions(cpuInstrs);
    this._data.resources().diskReadBytes(diskReadBytes);
    this._data.resources().writeBytes(writeBytes);
    return this;
  }
  /**
   * Appends the given ledger keys to the existing storage access footprint.
   *
   * @param readOnly - read-only keys to add
   * @param readWrite - read-write keys to add
   */
  appendFootprint(readOnly, readWrite) {
    return this.setFootprint(
      this.getReadOnly().concat(readOnly),
      this.getReadWrite().concat(readWrite)
    );
  }
  /**
   * Sets the storage access footprint to be a certain set of ledger keys.
   *
   * You can also set each field explicitly via
   * {@link SorobanDataBuilder.setReadOnly} and
   * {@link SorobanDataBuilder.setReadWrite} or add to the existing footprint
   * via {@link SorobanDataBuilder.appendFootprint}.
   *
   * Passing `null|undefined` to either parameter will IGNORE the existing
   * values. If you want to clear them, pass `[]`, instead.
   *
   * @param readOnly - the set of ledger keys to set in the read-only portion of the transaction's `sorobanData`, or `null | undefined` to keep the existing keys
   * @param readWrite - the set of ledger keys to set in the read-write portion of the transaction's `sorobanData`, or `null | undefined` to keep the existing keys
   */
  setFootprint(readOnly, readWrite) {
    if (readOnly !== null) {
      this.setReadOnly(readOnly);
    }
    if (readWrite !== null) {
      this.setReadWrite(readWrite);
    }
    return this;
  }
  /**
   * Sets the read-only keys in the access footprint.
   *
   * @param readOnly - read-only keys in the access footprint
   */
  setReadOnly(readOnly) {
    this._data.resources().footprint().readOnly(readOnly ?? []);
    return this;
  }
  /**
   * Sets the read-write keys in the access footprint.
   *
   * @param readWrite - read-write keys in the access footprint
   */
  setReadWrite(readWrite) {
    this._data.resources().footprint().readWrite(readWrite ?? []);
    return this;
  }
  /**
   * Returns a copy of the final data structure.
   */
  build() {
    return types.SorobanTransactionData.fromXDR(this._data.toXDR());
  }
  //
  // getters follow
  //
  /** Returns the read-only storage access pattern. */
  getReadOnly() {
    return this.getFootprint().readOnly();
  }
  /** Returns the read-write storage access pattern. */
  getReadWrite() {
    return this.getFootprint().readWrite();
  }
  /** Returns the storage access pattern. */
  getFootprint() {
    return this._data.resources().footprint();
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/base/signerkey.js
var SignerKey = class {
  /**
   * Decodes a StrKey address into an xdr.SignerKey instance.
   *
   * Only ED25519 public keys (G...), pre-auth transactions (T...), hashes
   * (H...), and signed payloads (P...) can be signer keys.
   *
   * @param address - a StrKey-encoded signer address
   */
  static decodeAddress(address) {
    const vb = StrKey.getVersionByteForPrefix(address);
    if (vb === void 0) {
      throw new Error(`invalid signer key type (${vb})`);
    }
    const raw = decodeCheck(vb, address);
    switch (vb) {
      case "signedPayload":
        return types.SignerKey.signerKeyTypeEd25519SignedPayload(
          new types.SignerKeyEd25519SignedPayload({
            ed25519: raw.subarray(0, 32),
            payload: raw.subarray(36, 36 + raw.readUInt32BE(32))
          })
        );
      case "ed25519PublicKey":
        return types.SignerKey.signerKeyTypeEd25519(raw);
      case "preAuthTx":
        return types.SignerKey.signerKeyTypePreAuthTx(raw);
      case "sha256Hash":
        return types.SignerKey.signerKeyTypeHashX(raw);
      default:
        throw new Error(`invalid signer key type (${vb})`);
    }
  }
  /**
   * Encodes a signer key into its StrKey equivalent.
   *
   * @param signerKey - the signer
   */
  static encodeSignerKey(signerKey) {
    let strkeyType;
    let raw;
    switch (signerKey.switch()) {
      case types.SignerKeyType.signerKeyTypeEd25519():
        strkeyType = "ed25519PublicKey";
        raw = signerKey.value();
        break;
      case types.SignerKeyType.signerKeyTypePreAuthTx():
        strkeyType = "preAuthTx";
        raw = signerKey.value();
        break;
      case types.SignerKeyType.signerKeyTypeHashX():
        strkeyType = "sha256Hash";
        raw = signerKey.value();
        break;
      case types.SignerKeyType.signerKeyTypeEd25519SignedPayload():
        strkeyType = "signedPayload";
        raw = signerKey.ed25519SignedPayload().toXDR("raw");
        break;
      default:
        throw new Error(`invalid SignerKey (type: ${signerKey.switch().name})`);
    }
    return encodeCheck(strkeyType, raw);
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/base/scval.js
var import_buffer27 = require("buffer");

// node_modules/@stellar/stellar-sdk/lib/esm/base/contract.js
var Contract = class {
  _id;
  /**
   * @param contractId - ID of the contract (ex.
   *     `CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE`).
   */
  constructor(contractId) {
    try {
      this._id = StrKey.decodeContract(contractId);
    } catch {
      throw new Error(`Invalid contract ID: ${contractId}`);
    }
  }
  /**
   * Returns Stellar contract ID as a strkey, ex.
   * `CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE`.
   */
  contractId() {
    return StrKey.encodeContract(this._id);
  }
  /** Returns the ID as a strkey (C...). */
  toString() {
    return this.contractId();
  }
  /** Returns the wrapped address of this contract. */
  address() {
    return Address.contract(this._id);
  }
  /**
   * Returns an operation that will invoke this contract call.
   *
   * @param method - name of the method to call
   * @param params - arguments to pass to the method, as an array of xdr.ScVal
   *
   * @see Operation.invokeHostFunction
   * @see Operation.invokeContractFunction
   * @see Operation.createCustomContract
   * @see Operation.createStellarAssetContract
   * @see Operation.uploadContractWasm
   */
  call(method, ...params) {
    return Operation.invokeContractFunction({
      contract: this.address().toString(),
      function: method,
      args: params
    });
  }
  /**
   * Returns the read-only footprint entries necessary for any invocations to
   * this contract, for convenience when manually adding it to your
   * transaction's overall footprint or doing bump/restore operations.
   */
  getFootprint() {
    return types.LedgerKey.contractData(
      new types.LedgerKeyContractData({
        contract: this.address().toScAddress(),
        key: types.ScVal.scvLedgerKeyContractInstance(),
        durability: types.ContractDataDurability.persistent()
      })
    );
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/base/numbers/uint128.js
var Uint128 = class extends LargeInt {
  /**
   * Construct an unsigned 128-bit integer that can be XDR-encoded.
   *
   * @param args - one or more slices to encode
   *     in big-endian format (i.e. earlier elements are higher bits)
   */
  constructor(...args) {
    super(args);
  }
  get unsigned() {
    return true;
  }
  get size() {
    return 128;
  }
};
Uint128.defineIntBoundaries();

// node_modules/@stellar/stellar-sdk/lib/esm/base/numbers/uint256.js
var Uint256 = class extends LargeInt {
  /**
   * Construct an unsigned 256-bit integer that can be XDR-encoded.
   *
   * @param args - one or more slices to encode
   *     in big-endian format (i.e. earlier elements are higher bits)
   */
  constructor(...args) {
    super(args);
  }
  get unsigned() {
    return true;
  }
  get size() {
    return 256;
  }
};
Uint256.defineIntBoundaries();

// node_modules/@stellar/stellar-sdk/lib/esm/base/numbers/int128.js
var Int128 = class extends LargeInt {
  /**
   * Construct a signed 128-bit integer that can be XDR-encoded.
   *
   * @param  args - one or more slices to encode
   *     in big-endian format (i.e. earlier elements are higher bits)
   */
  constructor(...args) {
    super(args);
  }
  get unsigned() {
    return false;
  }
  get size() {
    return 128;
  }
};
Int128.defineIntBoundaries();

// node_modules/@stellar/stellar-sdk/lib/esm/base/numbers/int256.js
var Int256 = class extends LargeInt {
  /**
   * Construct a signed 256-bit integer that can be XDR-encoded.
   *
   * @param args - one or more slices to encode
   *     in big-endian format (i.e. earlier elements are higher bits)
   */
  constructor(...args) {
    super(args);
  }
  get unsigned() {
    return false;
  }
  get size() {
    return 256;
  }
};
Int256.defineIntBoundaries();

// node_modules/@stellar/stellar-sdk/lib/esm/base/numbers/xdr_large_int.js
var XdrLargeInt = class {
  int;
  type;
  /**
   * @param type - specifies a data type to use to represent the integer, one
   *    of: 'i64', 'u64', 'i128', 'u128', 'i256', 'u256', 'timepoint', and 'duration'
   *    (see {@link XdrLargeInt.isType})
   * @param values - a list of integer-like values interpreted in big-endian order
   */
  constructor(type, values) {
    if (!(values instanceof Array)) {
      values = [values];
    }
    const normalizedValues = values.map((i) => {
      if (typeof i === "bigint") {
        return i;
      }
      if (typeof i === "object" && i !== null && "toBigInt" in i && typeof i.toBigInt === "function") {
        return i.toBigInt();
      }
      return BigInt(i);
    });
    switch (type) {
      case "i64":
        this.int = new Hyper(normalizedValues);
        break;
      case "i128":
        this.int = new Int128(...normalizedValues);
        break;
      case "i256":
        this.int = new Int256(...normalizedValues);
        break;
      case "u64":
      case "timepoint":
      case "duration":
        this.int = new UnsignedHyper(normalizedValues);
        break;
      case "u128":
        this.int = new Uint128(...normalizedValues);
        break;
      case "u256":
        this.int = new Uint256(...normalizedValues);
        break;
      default:
        throw TypeError(`invalid type: ${type}`);
    }
    this.type = type;
  }
  /**
   * Converts to a native JS number.
   *
   * @throws if the value can't fit into a Number
   */
  toNumber() {
    const bi = this.int.toBigInt();
    if (bi > Number.MAX_SAFE_INTEGER || bi < Number.MIN_SAFE_INTEGER) {
      throw RangeError(
        `value ${bi} not in range for Number [${Number.MAX_SAFE_INTEGER}, ${Number.MIN_SAFE_INTEGER}]`
      );
    }
    return Number(bi);
  }
  /** Converts to a native BigInt. */
  toBigInt() {
    return this.int.toBigInt();
  }
  /**
   * The integer encoded with `ScValType = I64`.
   *
   * @throws if the value cannot fit in 64 bits
   */
  toI64() {
    this._sizeCheck(64);
    const v = this.toBigInt();
    if (BigInt.asIntN(64, v) !== v) {
      throw RangeError(`value too large for i64: ${v}`);
    }
    return types.ScVal.scvI64(new types.Int64(v));
  }
  /** The integer encoded with `ScValType = U64` */
  toU64() {
    this._sizeCheck(64);
    return types.ScVal.scvU64(
      new types.Uint64(BigInt.asUintN(64, this.toBigInt()))
      // reiterpret as unsigned
    );
  }
  /** The integer encoded with `ScValType = Timepoint` */
  toTimepoint() {
    this._sizeCheck(64);
    return types.ScVal.scvTimepoint(
      new types.Uint64(BigInt.asUintN(64, this.toBigInt()))
      // reiterpret as unsigned
    );
  }
  /** The integer encoded with `ScValType = Duration` */
  toDuration() {
    this._sizeCheck(64);
    return types.ScVal.scvDuration(
      new types.Uint64(BigInt.asUintN(64, this.toBigInt()))
      // reiterpret as unsigned
    );
  }
  /**
   * The integer encoded with `ScValType = I128`.
   *
   * @throws if the value cannot fit in 128 bits
   */
  toI128() {
    this._sizeCheck(128);
    const v = this.int.toBigInt();
    if (BigInt.asIntN(128, v) !== v) {
      throw RangeError(`value too large for i128: ${v}`);
    }
    const hi64 = BigInt.asIntN(64, v >> 64n);
    const lo64 = BigInt.asUintN(64, v);
    return types.ScVal.scvI128(
      new types.Int128Parts({
        hi: new types.Int64(hi64),
        lo: new types.Uint64(lo64)
      })
    );
  }
  /**
   * The integer encoded with `ScValType = U128`.
   *
   * @throws if the value cannot fit in 128 bits
   */
  toU128() {
    this._sizeCheck(128);
    const v = this.int.toBigInt();
    return types.ScVal.scvU128(
      new types.UInt128Parts({
        hi: new types.Uint64(BigInt.asUintN(64, v >> 64n)),
        lo: new types.Uint64(BigInt.asUintN(64, v))
      })
    );
  }
  /**
   * The integer encoded with `ScValType = I256`
   *
   * @throws if the value cannot fit in a signed 256-bit integer
   */
  toI256() {
    const v = this.int.toBigInt();
    if (BigInt.asIntN(256, v) !== v) {
      throw RangeError(`value too large for i256: ${v}`);
    }
    const hiHi64 = BigInt.asIntN(64, v >> 192n);
    const hiLo64 = BigInt.asUintN(64, v >> 128n);
    const loHi64 = BigInt.asUintN(64, v >> 64n);
    const loLo64 = BigInt.asUintN(64, v);
    return types.ScVal.scvI256(
      new types.Int256Parts({
        hiHi: new types.Int64(hiHi64),
        hiLo: new types.Uint64(hiLo64),
        loHi: new types.Uint64(loHi64),
        loLo: new types.Uint64(loLo64)
      })
    );
  }
  /**
   * The integer encoded with `ScValType = U256`
   *
   * Note: No size check needed - U256 is the largest unsigned type.
   */
  toU256() {
    const v = this.int.toBigInt();
    const hiHi64 = BigInt.asUintN(64, v >> 192n);
    const hiLo64 = BigInt.asUintN(64, v >> 128n);
    const loHi64 = BigInt.asUintN(64, v >> 64n);
    const loLo64 = BigInt.asUintN(64, v);
    return types.ScVal.scvU256(
      new types.UInt256Parts({
        hiHi: new types.Uint64(hiHi64),
        hiLo: new types.Uint64(hiLo64),
        loHi: new types.Uint64(loHi64),
        loLo: new types.Uint64(loLo64)
      })
    );
  }
  /** The smallest interpretation of the stored value */
  toScVal() {
    switch (this.type) {
      case "i64":
        return this.toI64();
      case "i128":
        return this.toI128();
      case "i256":
        return this.toI256();
      case "u64":
        return this.toU64();
      case "u128":
        return this.toU128();
      case "u256":
        return this.toU256();
      case "timepoint":
        return this.toTimepoint();
      case "duration":
        return this.toDuration();
      default:
        throw TypeError(`invalid type: ${this.type}`);
    }
  }
  /** Returns the primitive value of this integer. */
  valueOf() {
    return this.int.valueOf();
  }
  /** Returns the string representation of this integer. */
  toString() {
    return this.int.toString();
  }
  /** Returns a JSON-friendly representation with `value` and `type` fields. */
  toJSON() {
    return {
      value: this.toBigInt().toString(),
      type: this.type
    };
  }
  _sizeCheck(bits) {
    if (this.int.size > bits) {
      throw RangeError(`value too large for ${bits} bits (${this.type})`);
    }
  }
  /** Returns true if the given string is a valid XDR large integer type name. */
  static isType(type) {
    switch (type) {
      case "i64":
      case "i128":
      case "i256":
      case "u64":
      case "u128":
      case "u256":
      case "timepoint":
      case "duration":
        return true;
      default:
        return false;
    }
  }
  /**
   * Convert the raw `ScValType` string (e.g. 'scvI128', generated by the XDR)
   * to a type description for {@link XdrLargeInt} construction (e.g. 'i128')
   *
   * @param scvType - the `xdr.ScValType` as a string
   * @returns the corresponding {@link ScIntType} if it's an integer type, or
   *    `undefined` if it's not an integer type
   */
  static getType(scvType) {
    const type = scvType.slice(3).toLowerCase();
    if (this.isType(type)) {
      return type;
    }
    return void 0;
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/base/numbers/index.js
function scValToBigInt(scv) {
  const switchName = scv.switch().name;
  const scIntType = XdrLargeInt.getType(switchName);
  const value = scv.value();
  if (value === null) {
    throw TypeError(`unexpected null value for ${switchName}`);
  }
  switch (switchName) {
    case "scvU32":
    case "scvI32":
      return BigInt(value);
    case "scvU64":
    case "scvI64":
    case "scvTimepoint":
    case "scvDuration":
      if (scIntType === void 0) {
        throw TypeError(`invalid integer type for ${switchName}`);
      }
      return new XdrLargeInt(
        scIntType,
        value
      ).toBigInt();
    case "scvU128":
    case "scvI128": {
      if (scIntType === void 0) {
        throw TypeError(`invalid integer type for ${switchName}`);
      }
      const int128Value = value;
      return new XdrLargeInt(scIntType, [
        int128Value.lo(),
        int128Value.hi()
      ]).toBigInt();
    }
    case "scvU256":
    case "scvI256": {
      if (scIntType === void 0) {
        throw TypeError(`invalid integer type for ${switchName}`);
      }
      const int256Value = value;
      return new XdrLargeInt(scIntType, [
        int256Value.loLo(),
        int256Value.loHi(),
        int256Value.hiLo(),
        int256Value.hiHi()
      ]).toBigInt();
    }
    default:
      throw TypeError(`expected integer type, got ${switchName}`);
  }
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/numbers/sc_int.js
var ScInt = class extends XdrLargeInt {
  /**
   * @param value - a single, integer-like value which will
   *    be interpreted in the smallest appropriate XDR type supported by Stellar
   *    (64, 128, or 256 bit integer values). signed values are supported, though
   *    they are sanity-checked against `opts.type`. if you need 32-bit values,
   *    you can construct them directly without needing this wrapper, e.g.
   *    `xdr.ScVal.scvU32(1234)`.
   * @param opts - an optional object controlling optional parameters
   *   - `type`: specify a type ('i64', 'u64', 'i128', 'u128', 'i256',
   *    or 'u256') to override the default type selection. If not specified, the
   *    smallest type that fits the value is used.
   */
  constructor(value, opts) {
    const bigValue = BigInt(value);
    const signed = bigValue < 0n;
    let type = opts?.type ?? "";
    if (type.startsWith("u") && signed) {
      throw TypeError(`specified type ${opts?.type} yet negative (${value})`);
    }
    if (type === "") {
      type = signed ? "i" : "u";
      const bitlen = nearestBigIntSize(bigValue);
      switch (bitlen) {
        case 64:
        case 128:
        case 256:
          type += bitlen.toString();
          break;
        default:
          throw RangeError(
            `expected 64/128/256 bits for input (${value}), got ${bitlen}`
          );
      }
    }
    super(type, bigValue);
  }
};
function nearestBigIntSize(bigI) {
  if (bigI < 0n) {
    const abs = -bigI;
    const bitlen2 = (abs - 1n).toString(2).length + 1;
    return [64, 128, 256].find((len) => bitlen2 <= len) ?? bitlen2;
  }
  const bitlen = bigI.toString(2).length;
  return [64, 128, 256].find((len) => bitlen <= len) ?? bitlen;
}

// node_modules/@stellar/stellar-sdk/lib/esm/base/scval.js
function nativeToScVal(val, opts = {}) {
  switch (typeof val) {
    case "object": {
      if (val === null) {
        return types.ScVal.scvVoid();
      }
      if (val instanceof types.ScVal) {
        return val;
      }
      if (val instanceof Address) {
        return val.toScVal();
      }
      if (val instanceof Keypair) {
        return nativeToScVal(val.publicKey(), { type: "address" });
      }
      if (val instanceof Contract) {
        return val.address().toScVal();
      }
      if (val instanceof Uint8Array || import_buffer27.Buffer.isBuffer(val)) {
        const copy = import_buffer27.Buffer.from(val);
        switch (opts?.type ?? "bytes") {
          case "bytes":
            return types.ScVal.scvBytes(copy);
          case "symbol":
            return types.ScVal.scvSymbol(copy);
          case "string":
            return types.ScVal.scvString(copy);
          default:
            throw new TypeError(
              `invalid type (${JSON.stringify(opts.type)}) specified for bytes-like value`
            );
        }
      }
      if (Array.isArray(val)) {
        return types.ScVal.scvVec(
          val.map((v, idx) => {
            if (Array.isArray(opts.type)) {
              return nativeToScVal(
                v,
                // only include a `{ type: ... }` if it's present (safer than
                // `{type: undefined}`)
                {
                  ...opts.type.length > idx && {
                    type: opts.type[idx]
                  }
                }
              );
            }
            return nativeToScVal(v, opts);
          })
        );
      }
      if (Object.getPrototypeOf(val) !== Object.prototype) {
        throw new TypeError(
          `cannot interpret ${val.constructor?.name} value as ScVal (${JSON.stringify(val)})`
        );
      }
      const mapTypeSpec = opts?.type ?? {};
      return types.ScVal.scvMap(
        Object.entries(val).sort(([key1], [key2]) => key1 < key2 ? -1 : key1 > key2 ? 1 : 0).map(([k, v]) => {
          const [keyType, valType] = Object.hasOwn(mapTypeSpec, k) ? mapTypeSpec[k] ?? [null, null] : [null, null];
          const keyOpts = keyType ? { type: keyType } : {};
          const valOpts = valType ? { type: valType } : {};
          return new types.ScMapEntry({
            key: nativeToScVal(k, keyOpts),
            val: nativeToScVal(v, valOpts)
          });
        })
      );
    }
    case "number":
    case "bigint": {
      const bigintVal = BigInt(val);
      switch (opts?.type) {
        case "u32":
          if (bigintVal < BigInt(types.Uint32.MIN_VALUE) || bigintVal > BigInt(types.Uint32.MAX_VALUE)) {
            throw new TypeError(`invalid value (${val}) for type u32`);
          }
          return types.ScVal.scvU32(Number(val));
        case "i32":
          if (bigintVal < -BigInt(types.Int32.MIN_VALUE) || bigintVal > BigInt(types.Int32.MAX_VALUE)) {
            throw new TypeError(`invalid value (${val}) for type i32`);
          }
          return types.ScVal.scvI32(Number(val));
      }
      return new ScInt(val, { type: opts?.type }).toScVal();
    }
    case "string": {
      const optType = opts?.type ?? "string";
      switch (optType) {
        case "string":
          return types.ScVal.scvString(val);
        case "symbol":
          return types.ScVal.scvSymbol(val);
        case "address":
          return new Address(val).toScVal();
        case "u32": {
          const bigintVal = BigInt(val);
          if (bigintVal < BigInt(types.Uint32.MIN_VALUE) || bigintVal > BigInt(types.Uint32.MAX_VALUE)) {
            throw new TypeError(`invalid value (${val}) for type u32`);
          }
          return types.ScVal.scvU32(Number(bigintVal));
        }
        case "i32": {
          const bigintVal = BigInt(val);
          if (bigintVal < -BigInt(types.Int32.MIN_VALUE) || bigintVal > BigInt(types.Int32.MAX_VALUE)) {
            throw new TypeError(`invalid value (${val}) for type i32`);
          }
          return types.ScVal.scvI32(Number(bigintVal));
        }
        default:
          if (XdrLargeInt.isType(optType)) {
            return new XdrLargeInt(optType, val).toScVal();
          }
          throw new TypeError(
            `invalid type (${JSON.stringify(opts.type)}) specified for string value`
          );
      }
    }
    case "boolean":
      return types.ScVal.scvBool(val);
    case "undefined":
      return types.ScVal.scvVoid();
    case "function":
      return nativeToScVal(val());
    default:
      throw new TypeError(
        `failed to convert typeof ${typeof val} (${JSON.stringify(val)})`
      );
  }
}
function scValToNative(scv) {
  switch (scv.switch().value) {
    case types.ScValType.scvVoid().value:
      return null;
    // these can be converted to bigints directly
    case types.ScValType.scvU64().value:
    case types.ScValType.scvI64().value:
      return scv.value().toBigInt();
    // these can be parsed by internal abstractions note that this can also
    // handle the above two cases, but it's not as efficient (another
    // type-check, parsing, etc.)
    case types.ScValType.scvU128().value:
    case types.ScValType.scvI128().value:
    case types.ScValType.scvU256().value:
    case types.ScValType.scvI256().value:
      return scValToBigInt(scv);
    case types.ScValType.scvVec().value:
      return (scv.vec() ?? []).map(scValToNative);
    case types.ScValType.scvAddress().value:
      return Address.fromScVal(scv).toString();
    case types.ScValType.scvMap().value:
      return Object.fromEntries(
        (scv.map() ?? []).map((entry) => [
          scValToNative(entry.key()),
          scValToNative(entry.val())
        ])
      );
    // these return the primitive type directly
    case types.ScValType.scvBool().value:
    case types.ScValType.scvU32().value:
    case types.ScValType.scvI32().value:
    case types.ScValType.scvBytes().value:
      return scv.value();
    // Symbols are limited to [a-zA-Z0-9_]+, so we can safely make ascii strings
    //
    // Strings, however, are "presented" as strings and we treat them as such
    // (in other words, string = bytes with a hint that it's text). If the user
    // encoded non-printable bytes in their string value, that's on them.
    //
    // Note that we assume a utf8 encoding (ascii-compatible). For other
    // encodings, you should probably use bytes anyway. If it cannot be decoded,
    // the raw bytes are returned.
    case types.ScValType.scvSymbol().value: {
      const v = scv.sym();
      if (import_buffer27.Buffer.isBuffer(v) || ArrayBuffer.isView(v) && typeof v !== "string") {
        try {
          return new TextDecoder().decode(v);
        } catch {
          return new Uint8Array(v.buffer);
        }
      }
      return v;
    }
    case types.ScValType.scvString().value: {
      const v = scv.str();
      if (import_buffer27.Buffer.isBuffer(v) || ArrayBuffer.isView(v) && typeof v !== "string") {
        try {
          return new TextDecoder().decode(v);
        } catch {
          return new Uint8Array(v.buffer);
        }
      }
      return v;
    }
    // these can be converted to bigint
    case types.ScValType.scvTimepoint().value:
    case types.ScValType.scvDuration().value:
      return scv.value().toBigInt();
    case types.ScValType.scvError().value:
      switch (scv.error().switch().value) {
        // Distinguish errors from the user contract.
        case types.ScErrorType.sceContract().value:
          return { type: "contract", code: scv.error().contractCode() };
        default: {
          const err2 = scv.error();
          return {
            type: "system",
            code: err2.code().value,
            value: err2.code().name
          };
        }
      }
    // in the fallthrough case, just return the underlying value directly
    default:
      return scv.value();
  }
}
function scvSortedMap(items) {
  const sorted = Array.from(items).sort((a, b) => {
    const nativeA = scValToNative(a.key());
    const nativeB = scValToNative(b.key());
    switch (typeof nativeA) {
      case "number":
      case "bigint":
        if (nativeA === nativeB) return 0;
        return nativeA < nativeB ? -1 : 1;
      default: {
        const strA = nativeA.toString();
        const strB = nativeB.toString();
        return strA < strB ? -1 : strA > strB ? 1 : 0;
      }
    }
  });
  return types.ScVal.scvMap(sorted);
}
types.scvSortedMap = scvSortedMap;

// node_modules/@stellar/stellar-sdk/lib/esm/base/transaction_builder.js
var HYPER_MAX_VALUE = Hyper.MAX_VALUE;
var UINT32_MAX = 4294967295;
var BASE_FEE = "100";
var TransactionBuilder = class _TransactionBuilder {
  source;
  operations;
  baseFee;
  timebounds;
  ledgerbounds;
  minAccountSequence;
  minAccountSequenceAge;
  minAccountSequenceLedgerGap;
  extraSigners;
  memo;
  networkPassphrase;
  sorobanData;
  /**
   * @param sourceAccount - source account for this transaction
   * @param opts - options object (see {@link TransactionBuilderOptions})
   */
  constructor(sourceAccount, opts = {}) {
    if (!sourceAccount) {
      throw new Error("must specify source account for the transaction");
    }
    if (opts.fee === void 0) {
      throw new Error("must specify fee for the transaction (in stroops)");
    }
    this.source = sourceAccount;
    this.operations = [];
    this.baseFee = opts.fee;
    if (opts.timebounds) {
      const minTime = toEpochSeconds(opts.timebounds.minTime);
      const maxTime = toEpochSeconds(opts.timebounds.maxTime);
      if (minTime !== void 0 && minTime < 0) {
        throw new Error("min_time cannot be negative");
      }
      if (maxTime !== void 0 && maxTime < 0) {
        throw new Error("max_time cannot be negative");
      }
      if (minTime !== void 0 && maxTime !== void 0 && maxTime > 0 && minTime > maxTime) {
        throw new Error("min_time cannot be greater than max_time");
      }
      this.timebounds = { ...opts.timebounds };
    } else {
      this.timebounds = null;
    }
    if (opts.ledgerbounds) {
      const minLedger = opts.ledgerbounds.minLedger;
      const maxLedger = opts.ledgerbounds.maxLedger;
      if (minLedger !== void 0 && minLedger < 0) {
        throw new Error("min_ledger cannot be negative");
      }
      if (maxLedger !== void 0 && maxLedger < 0) {
        throw new Error("max_ledger cannot be negative");
      }
      if (minLedger !== void 0 && maxLedger !== void 0 && maxLedger > 0 && minLedger > maxLedger) {
        throw new Error("min_ledger cannot be greater than max_ledger");
      }
      this.ledgerbounds = { ...opts.ledgerbounds };
    } else {
      this.ledgerbounds = null;
    }
    this.minAccountSequence = opts.minAccountSequence || null;
    this.minAccountSequenceAge = opts.minAccountSequenceAge !== void 0 ? opts.minAccountSequenceAge : null;
    this.minAccountSequenceLedgerGap = opts.minAccountSequenceLedgerGap !== void 0 ? opts.minAccountSequenceLedgerGap : null;
    this.extraSigners = opts.extraSigners ? [...opts.extraSigners] : null;
    this.memo = opts.memo || Memo.none();
    this.networkPassphrase = opts.networkPassphrase || null;
    this.sorobanData = opts.sorobanData ? new SorobanDataBuilder(opts.sorobanData).build() : null;
  }
  /**
   * Creates a builder instance using an existing {@link Transaction} as a
   * template, ignoring any existing envelope signatures.
   *
   * Note that the sequence number WILL be cloned, so EITHER this transaction or
   * the one it was cloned from will be valid. This is useful in situations
   * where you are constructing a transaction in pieces and need to make
   * adjustments as you go (for example, when filling out Soroban resource
   * information).
   *
   * @param tx - a "template" transaction to clone exactly
   * @param opts - additional options to override the clone, e.g.
   *    `{fee: '1000'}` will override the existing base fee derived from `tx`
   *    (see the {@link TransactionBuilder} constructor for detailed options)
   *
   * **Warning:** This does not clone the transaction's
   * {@link xdr.SorobanTransactionData} (if applicable), use
   * {@link SorobanDataBuilder} and {@link TransactionBuilder.setSorobanData}
   * as needed, instead.
   *
   * TODO: This cannot clone {@link FeeBumpTransaction}s, yet.
   */
  static cloneFrom(tx, opts = {}) {
    if (!(tx instanceof Transaction)) {
      throw new TypeError(`expected a 'Transaction', got: ${String(tx)}`);
    }
    const sequenceNum = (BigInt(tx.sequence) - 1n).toString();
    let source;
    if (StrKey.isValidMed25519PublicKey(tx.source)) {
      source = MuxedAccount.fromAddress(tx.source, sequenceNum);
    } else if (StrKey.isValidEd25519PublicKey(tx.source)) {
      source = new Account(tx.source, sequenceNum);
    } else {
      throw new TypeError(`unsupported tx source account: ${tx.source}`);
    }
    if (tx.operations.length === 0) {
      throw new Error(
        "cannot clone a transaction with no operations: per-operation base fee cannot be determined"
      );
    }
    let sorobanData;
    const envelope = tx.toEnvelope();
    if (envelope.switch() === types.EnvelopeType.envelopeTypeTx()) {
      sorobanData = envelope.v1().tx().ext().value() ?? void 0;
    }
    let totalFee = parseInt(tx.fee, 10);
    if (sorobanData) {
      const resourceFee = Number(sorobanData.resourceFee().toBigInt());
      if (totalFee - resourceFee > 0) {
        totalFee -= resourceFee;
      }
    }
    const unscaledFee = Math.floor(totalFee / tx.operations.length);
    const builderOpts = {
      fee: (unscaledFee || BASE_FEE).toString(),
      memo: tx.memo,
      networkPassphrase: tx.networkPassphrase
    };
    if (tx.timeBounds) {
      builderOpts.timebounds = tx.timeBounds;
    }
    if (tx.ledgerBounds) {
      builderOpts.ledgerbounds = tx.ledgerBounds;
    }
    if (tx.minAccountSequence) {
      builderOpts.minAccountSequence = tx.minAccountSequence;
    }
    if (tx.minAccountSequenceAge !== void 0) {
      builderOpts.minAccountSequenceAge = tx.minAccountSequenceAge;
    }
    if (tx.minAccountSequenceLedgerGap !== void 0) {
      builderOpts.minAccountSequenceLedgerGap = tx.minAccountSequenceLedgerGap;
    }
    if (tx.extraSigners) {
      builderOpts.extraSigners = tx.extraSigners.map(
        (s) => SignerKey.encodeSignerKey(s)
      );
    }
    Object.assign(builderOpts, opts);
    const builder = new _TransactionBuilder(source, builderOpts);
    tx.tx.operations().forEach((op) => builder.addOperation(op));
    return builder;
  }
  /**
   * Adds an operation to the transaction.
   *
   * @param operation - The xdr operation object, use {@link
   *     Operation} static methods.
   */
  addOperation(operation) {
    this.operations.push(operation);
    return this;
  }
  /**
   * Adds an operation to the transaction at a specific index.
   *
   * @param operation - The xdr operation object to add, use {@link Operation} static methods.
   * @param index - The index at which to insert the operation.
   */
  addOperationAt(operation, index) {
    this.operations.splice(index, 0, operation);
    return this;
  }
  /**
   * Removes the operations from the builder (useful when cloning).
   */
  clearOperations() {
    this.operations = [];
    return this;
  }
  /**
   * Removes the operation at the specified index from the transaction.
   *
   * @param index - The index of the operation to remove.
   */
  clearOperationAt(index) {
    this.operations.splice(index, 1);
    return this;
  }
  /**
   * Adds a memo to the transaction.
   * @param memo - {@link Memo} object
   */
  addMemo(memo) {
    this.memo = memo;
    return this;
  }
  /**
   * Sets a timeout precondition on the transaction.
   *
   *  Because of the distributed nature of the Stellar network it is possible
   *  that the status of your transaction will be determined after a long time
   *  if the network is highly congested. If you want to be sure to receive the
   *  status of the transaction within a given period you should set the
   *  time bounds with `maxTime` on the transaction (this is what `setTimeout`
   *  does internally; if there's `minTime` set but no `maxTime` it will be
   *  added).
   *
   *  A call to `TransactionBuilder.setTimeout` is **required** if Transaction
   *  does not have `max_time` set. If you don't want to set timeout, use
   *  {@link TimeoutInfinite}. In general you should set
   *  {@link TimeoutInfinite} only in smart contracts.
   *
   *  Please note that Horizon may still return <code>504 Gateway Timeout</code>
   *  error, even for short timeouts. In such case you need to resubmit the same
   *  transaction again without making any changes to receive a status. This
   *  method is using the machine system time (UTC), make sure it is set
   *  correctly.
   *
   * @param timeoutSeconds - Number of seconds the transaction is good.
   *     Can't be negative. If the value is {@link TimeoutInfinite}, the
   *     transaction is good indefinitely.
   *
   * @see {@link TimeoutInfinite}
   * @see https://developers.stellar.org/docs/tutorials/handling-errors/
   */
  setTimeout(timeoutSeconds) {
    if (this.timebounds !== null && Number(this.timebounds.maxTime) > 0) {
      throw new Error(
        "TimeBounds.max_time has been already set - setting timeout would overwrite it."
      );
    }
    if (timeoutSeconds < 0) {
      throw new Error("timeout cannot be negative");
    }
    if (timeoutSeconds > 0) {
      const timeoutTimestamp = Math.floor(Date.now() / 1e3) + timeoutSeconds;
      if (this.timebounds === null) {
        this.timebounds = { minTime: 0, maxTime: timeoutTimestamp };
      } else {
        this.timebounds = {
          minTime: this.timebounds.minTime ?? 0,
          maxTime: timeoutTimestamp
        };
      }
    } else {
      this.timebounds = {
        minTime: 0,
        maxTime: 0
      };
    }
    return this;
  }
  /**
   * If you want to prepare a transaction which will become valid at some point
   * in the future, or be invalid after some time, you can set a timebounds
   * precondition. Internally this will set the `minTime`, and `maxTime`
   * preconditions. Conflicts with `setTimeout`, so use one or the other.
   *
   * @param minEpochOrDate - Either a JS Date object, or a number
   *     of UNIX epoch seconds. The transaction is valid after this timestamp.
   *     Can't be negative. If the value is `0`, the transaction is valid
   *     immediately.
   * @param maxEpochOrDate - Either a JS Date object, or a number
   *     of UNIX epoch seconds. The transaction is valid until this timestamp.
   *     Can't be negative. If the value is `0`, the transaction is valid
   *     indefinitely.
   */
  setTimebounds(minEpochOrDate, maxEpochOrDate) {
    if (typeof minEpochOrDate === "number") {
      minEpochOrDate = new Date(minEpochOrDate * 1e3);
    }
    if (typeof maxEpochOrDate === "number") {
      maxEpochOrDate = new Date(maxEpochOrDate * 1e3);
    }
    if (this.timebounds !== null) {
      throw new Error(
        "TimeBounds has been already set - setting timebounds would overwrite it."
      );
    }
    const minTime = Math.floor(minEpochOrDate.valueOf() / 1e3);
    const maxTime = Math.floor(maxEpochOrDate.valueOf() / 1e3);
    if (minTime < 0) {
      throw new Error("min_time cannot be negative");
    }
    if (maxTime < 0) {
      throw new Error("max_time cannot be negative");
    }
    if (maxTime > 0 && minTime > maxTime) {
      throw new Error("min_time cannot be greater than max_time");
    }
    this.timebounds = { minTime, maxTime };
    return this;
  }
  /**
   * If you want to prepare a transaction which will only be valid within some
   * range of ledgers, you can set a ledgerbounds precondition.
   * Internally this will set the `minLedger` and `maxLedger` preconditions.
   *
   * @param minLedger - The minimum ledger this transaction is valid at
   *     or after. Cannot be negative. If the value is `0` (the default), the
   *     transaction is valid immediately.
   *
   * @param maxLedger - The maximum ledger this transaction is valid
   *     before. Cannot be negative. If the value is `0`, the transaction is
   *     valid indefinitely.
   */
  setLedgerbounds(minLedger, maxLedger) {
    if (this.ledgerbounds !== null) {
      throw new Error(
        "LedgerBounds has been already set - setting ledgerbounds would overwrite it."
      );
    }
    if (minLedger < 0) {
      throw new Error("min_ledger cannot be negative");
    }
    if (maxLedger < 0) {
      throw new Error("max_ledger cannot be negative");
    }
    if (maxLedger > 0 && minLedger > maxLedger) {
      throw new Error("min_ledger cannot be greater than max_ledger");
    }
    this.ledgerbounds = { minLedger, maxLedger };
    return this;
  }
  /**
   * If you want to prepare a transaction which will be valid only while the
   * account sequence number is
   *
   *     `minAccountSequence <= sourceAccountSequence < tx.seqNum`
   *
   * Note that after execution the account's sequence number is always raised to
   * `tx.seqNum`. Internally this will set the `minAccountSequence`
   * precondition.
   *
   * @param minAccountSequence - The minimum source account sequence
   *     number this transaction is valid for. If the value is `0` (the
   *     default), the transaction is valid when `sourceAccount`'s sequence
   *     number `== tx.seqNum - 1`.
   */
  setMinAccountSequence(minAccountSequence) {
    if (this.minAccountSequence !== null) {
      throw new Error(
        "min_account_sequence has been already set - setting min_account_sequence would overwrite it."
      );
    }
    this.minAccountSequence = minAccountSequence;
    return this;
  }
  /**
   * For the transaction to be valid, the current ledger time must be at least
   * `minAccountSequenceAge` greater than sourceAccount's `sequenceTime`.
   * Internally this will set the `minAccountSequenceAge` precondition.
   *
   * @param durationInSeconds - The minimum amount of time between
   *     source account sequence time and the ledger time when this transaction
   *     will become valid. If the value is `0`, the transaction is unrestricted
   *     by the account sequence age. Cannot be negative.
   */
  setMinAccountSequenceAge(durationInSeconds) {
    if (typeof durationInSeconds !== "bigint") {
      throw new Error("min_account_sequence_age must be a bigint");
    }
    if (this.minAccountSequenceAge !== null) {
      throw new Error(
        "min_account_sequence_age has been already set - setting min_account_sequence_age would overwrite it."
      );
    }
    if (durationInSeconds < 0) {
      throw new Error("min_account_sequence_age cannot be negative");
    }
    this.minAccountSequenceAge = durationInSeconds;
    return this;
  }
  /**
   * For the transaction to be valid, the current ledger number must be at least
   * `minAccountSequenceLedgerGap` greater than sourceAccount's ledger sequence.
   * Internally this will set the `minAccountSequenceLedgerGap` precondition.
   *
   * @param gap - The minimum number of ledgers between source account
   *     sequence and the ledger number when this transaction will become valid.
   *     If the value is `0`, the transaction is unrestricted by the account
   *     sequence ledger. Cannot be negative.
   */
  setMinAccountSequenceLedgerGap(gap) {
    if (this.minAccountSequenceLedgerGap !== null) {
      throw new Error(
        "min_account_sequence_ledger_gap has been already set - setting min_account_sequence_ledger_gap would overwrite it."
      );
    }
    if (gap < 0) {
      throw new Error("min_account_sequence_ledger_gap cannot be negative");
    }
    this.minAccountSequenceLedgerGap = gap;
    return this;
  }
  /**
   * For the transaction to be valid, there must be a signature corresponding to
   * every Signer in this array, even if the signature is not otherwise required
   * by the sourceAccount or operations. Internally this will set the
   * `extraSigners` precondition.
   *
   * @param extraSigners - required extra signers (as {@link StrKey}s)
   */
  setExtraSigners(extraSigners) {
    if (!Array.isArray(extraSigners)) {
      throw new Error("extra_signers must be an array of strings.");
    }
    if (this.extraSigners !== null) {
      throw new Error(
        "extra_signers has been already set - setting extra_signers would overwrite it."
      );
    }
    if (extraSigners.length > 2) {
      throw new Error("extra_signers cannot be longer than 2 elements.");
    }
    this.extraSigners = [...extraSigners];
    return this;
  }
  /**
   * Set network passphrase for the Transaction that will be built.
   *
   * @param networkPassphrase - passphrase of the target Stellar
   *     network (e.g. "Public Global Stellar Network ; September 2015").
   */
  setNetworkPassphrase(networkPassphrase) {
    this.networkPassphrase = networkPassphrase;
    return this;
  }
  /**
   * Sets the transaction's internal Soroban transaction data (resources,
   * footprint, etc.).
   *
   * For non-contract(non-Soroban) transactions, this setting has no effect. In
   * the case of Soroban transactions, this is either an instance of
   * {@link xdr.SorobanTransactionData} or a base64-encoded string of said
   * structure. This is usually obtained from the simulation response based on a
   * transaction with a Soroban operation (e.g.
   * {@link Operation.invokeHostFunction}, providing necessary resource
   * and storage footprint estimations for contract invocation.
   *
   * @param sorobanData - the {@link xdr.SorobanTransactionData} as a raw xdr
   *    object or a base64 string to be decoded
   *
   * @see {@link SorobanDataBuilder}
   */
  setSorobanData(sorobanData) {
    this.sorobanData = new SorobanDataBuilder(sorobanData).build();
    return this;
  }
  /**
   * Creates and adds an invoke host function operation for transferring SAC tokens.
   * This method removes the need for simulation by handling the creation of the
   * appropriate authorization entries and ledger footprint for the transfer operation.
   *
   * @param destination - the address of the recipient of the SAC transfer (should be a valid Stellar address or contract ID)
   * @param asset - the SAC asset to be transferred
   * @param amount - the amount of tokens to be transferred in 7 decimals. IE 1 token with 7 decimals of precision would be represented as "1_0000000"
   * @param sorobanFees - optional Soroban fees for the transaction to override the default fees used
   */
  addSacTransferOperation(destination, asset, amount, sorobanFees) {
    if (BigInt(amount) <= 0n) {
      throw new Error("Amount must be a positive integer");
    } else if (BigInt(amount) > HYPER_MAX_VALUE) {
      throw new Error("Amount exceeds maximum value for i64");
    }
    if (sorobanFees) {
      const { instructions, readBytes, writeBytes, resourceFee } = sorobanFees;
      const U32_MAX = 4294967295;
      if (instructions <= 0 || instructions > U32_MAX) {
        throw new Error(
          `instructions must be greater than 0 and at most ${U32_MAX}`
        );
      }
      if (readBytes <= 0 || readBytes > U32_MAX) {
        throw new Error(
          `readBytes must be greater than 0 and at most ${U32_MAX}`
        );
      }
      if (writeBytes <= 0 || writeBytes > U32_MAX) {
        throw new Error(
          `writeBytes must be greater than 0 and at most ${U32_MAX}`
        );
      }
      if (resourceFee <= 0n || resourceFee > HYPER_MAX_VALUE) {
        throw new Error(
          "resourceFee must be greater than 0 and at most i64 max"
        );
      }
    }
    const isDestinationContract = StrKey.isValidContract(destination);
    if (!isDestinationContract) {
      if (!StrKey.isValidEd25519PublicKey(destination) && !StrKey.isValidMed25519PublicKey(destination)) {
        throw new Error(
          "Invalid destination address. Must be a valid Stellar address or contract ID."
        );
      }
    }
    const destinationBaseAddress = isDestinationContract ? destination : extractBaseAddress(destination);
    if (destinationBaseAddress === extractBaseAddress(this.source.accountId())) {
      throw new Error("Destination cannot be the same as the source account.");
    }
    if (this.networkPassphrase === null) {
      throw new Error(
        "networkPassphrase must be set to add a SAC transfer operation"
      );
    }
    const contractId = asset.contractId(this.networkPassphrase);
    const functionName = "transfer";
    const source = this.source.accountId();
    const sourceBaseAddress = extractBaseAddress(source);
    const args = [
      nativeToScVal(source, { type: "address" }),
      nativeToScVal(destination, { type: "address" }),
      nativeToScVal(amount, { type: "i128" })
    ];
    const isAssetNative = asset.isNative();
    const auths = new types.SorobanAuthorizationEntry({
      credentials: types.SorobanCredentials.sorobanCredentialsSourceAccount(),
      rootInvocation: new types.SorobanAuthorizedInvocation({
        function: types.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
          new types.InvokeContractArgs({
            contractAddress: Address.fromString(contractId).toScAddress(),
            functionName,
            args
          })
        ),
        subInvocations: []
      })
    });
    const footprint = new types.LedgerFootprint({
      readOnly: [
        types.LedgerKey.contractData(
          new types.LedgerKeyContractData({
            contract: Address.fromString(contractId).toScAddress(),
            key: types.ScVal.scvLedgerKeyContractInstance(),
            durability: types.ContractDataDurability.persistent()
          })
        )
      ],
      readWrite: []
    });
    if (isDestinationContract) {
      footprint.readWrite().push(
        types.LedgerKey.contractData(
          new types.LedgerKeyContractData({
            contract: Address.fromString(contractId).toScAddress(),
            key: types.ScVal.scvVec([
              nativeToScVal("Balance", { type: "symbol" }),
              nativeToScVal(destination, { type: "address" })
            ]),
            durability: types.ContractDataDurability.persistent()
          })
        )
      );
      if (!isAssetNative) {
        const assetIssuer = asset.getIssuer();
        if (!assetIssuer) {
          throw new Error("Asset issuer must be set for non-native assets.");
        }
        footprint.readOnly().push(
          types.LedgerKey.account(
            new types.LedgerKeyAccount({
              accountId: Keypair.fromPublicKey(assetIssuer).xdrPublicKey()
            })
          )
        );
      }
    } else if (isAssetNative) {
      footprint.readWrite().push(
        types.LedgerKey.account(
          new types.LedgerKeyAccount({
            accountId: Keypair.fromPublicKey(
              destinationBaseAddress
            ).xdrPublicKey()
          })
        )
      );
    } else if (asset.getIssuer() !== destinationBaseAddress) {
      footprint.readWrite().push(
        types.LedgerKey.trustline(
          new types.LedgerKeyTrustLine({
            accountId: Keypair.fromPublicKey(
              destinationBaseAddress
            ).xdrPublicKey(),
            asset: asset.toTrustLineXDRObject()
          })
        )
      );
    }
    if (asset.isNative()) {
      footprint.readWrite().push(
        types.LedgerKey.account(
          new types.LedgerKeyAccount({
            accountId: Keypair.fromPublicKey(sourceBaseAddress).xdrPublicKey()
          })
        )
      );
    } else if (asset.getIssuer() !== sourceBaseAddress) {
      footprint.readWrite().push(
        types.LedgerKey.trustline(
          new types.LedgerKeyTrustLine({
            accountId: Keypair.fromPublicKey(sourceBaseAddress).xdrPublicKey(),
            asset: asset.toTrustLineXDRObject()
          })
        )
      );
    }
    const defaultPaymentFees = {
      instructions: 4e5,
      readBytes: 1e3,
      writeBytes: 1e3,
      resourceFee: BigInt(5e6)
    };
    const sorobanData = new types.SorobanTransactionData({
      resources: new types.SorobanResources({
        footprint,
        instructions: sorobanFees ? sorobanFees.instructions : defaultPaymentFees.instructions,
        diskReadBytes: sorobanFees ? sorobanFees.readBytes : defaultPaymentFees.readBytes,
        writeBytes: sorobanFees ? sorobanFees.writeBytes : defaultPaymentFees.writeBytes
      }),
      ext: new types.SorobanTransactionDataExt(0),
      resourceFee: new types.Int64(
        sorobanFees ? sorobanFees.resourceFee : defaultPaymentFees.resourceFee
      )
    });
    const operation = Operation.invokeContractFunction({
      contract: contractId,
      function: functionName,
      args,
      auth: [auths]
    });
    this.setSorobanData(sorobanData);
    return this.addOperation(operation);
  }
  /**
   * Builds the transaction and increments the source account's sequence
   * number by 1.
   */
  build() {
    const sequenceNumber = new BigNumber2(this.source.sequenceNumber()).plus(1);
    const fee = new BigNumber2(this.baseFee).times(this.operations.length).toNumber();
    if (fee > UINT32_MAX) {
      throw new Error(
        `Total fee (baseFee * operations) exceeds the maximum uint32 value (${UINT32_MAX}). Got ${fee} from baseFee=${this.baseFee} and ${this.operations.length} operation(s).`
      );
    }
    const attrs = {
      fee,
      seqNum: types.Int64.fromString(sequenceNumber.toString()),
      memo: this.memo ? this.memo.toXDRObject() : null
    };
    if (this.timebounds === null || typeof this.timebounds.minTime === "undefined" || typeof this.timebounds.maxTime === "undefined") {
      throw new Error(
        "TimeBounds has to be set or you must call setTimeout(TimeoutInfinite)."
      );
    }
    if (isValidDate(this.timebounds.minTime)) {
      this.timebounds.minTime = Math.floor(
        this.timebounds.minTime.getTime() / 1e3
      );
    }
    if (isValidDate(this.timebounds.maxTime)) {
      this.timebounds.maxTime = Math.floor(
        this.timebounds.maxTime.getTime() / 1e3
      );
    }
    const minTime = types.Uint64.fromString(this.timebounds.minTime.toString());
    const maxTime = types.Uint64.fromString(this.timebounds.maxTime.toString());
    const timeBounds = new types.TimeBounds({ minTime, maxTime });
    if (this.hasV2Preconditions()) {
      let ledgerBounds = null;
      if (this.ledgerbounds !== null) {
        ledgerBounds = new types.LedgerBounds({
          minLedger: this.ledgerbounds.minLedger ?? 0,
          maxLedger: this.ledgerbounds.maxLedger ?? 0
        });
      }
      const minSeqNum = this.minAccountSequence ? types.Int64.fromString(this.minAccountSequence) : null;
      const minSeqAge = types.Uint64.fromString(
        this.minAccountSequenceAge !== null ? this.minAccountSequenceAge.toString() : "0"
      );
      const minSeqLedgerGap = this.minAccountSequenceLedgerGap || 0;
      const extraSigners = this.extraSigners !== null ? this.extraSigners.map((s) => SignerKey.decodeAddress(s)) : [];
      attrs.cond = types.Preconditions.precondV2(
        new types.PreconditionsV2({
          timeBounds,
          ledgerBounds,
          minSeqNum,
          minSeqAge,
          minSeqLedgerGap,
          extraSigners
        })
      );
    } else {
      attrs.cond = types.Preconditions.precondTime(timeBounds);
    }
    attrs.sourceAccount = decodeAddressToMuxedAccount(this.source.accountId());
    if (this.sorobanData) {
      attrs.ext = new types.TransactionExt(1, this.sorobanData);
      attrs.fee = new BigNumber2(attrs.fee).plus(this.sorobanData.resourceFee().toString()).toNumber();
      if (attrs.fee > UINT32_MAX) {
        throw new Error(
          `Total fee (baseFee * operations + resourceFee) exceeds the maximum uint32 value (${UINT32_MAX}). Got ${attrs.fee}.`
        );
      }
    } else {
      attrs.ext = new types.TransactionExt(0);
    }
    const xtx = new types.Transaction(
      attrs
    );
    xtx.operations(this.operations);
    const txEnvelope = types.TransactionEnvelope.envelopeTypeTx(
      new types.TransactionV1Envelope({ tx: xtx, signatures: [] })
    );
    if (this.networkPassphrase === null) {
      throw new Error("networkPassphrase must be set to build a transaction");
    }
    const tx = new Transaction(txEnvelope, this.networkPassphrase);
    this.source.incrementSequenceNumber();
    return tx;
  }
  /**
   * Checks whether any v2 preconditions have been set on this builder.
   */
  hasV2Preconditions() {
    return this.ledgerbounds !== null || this.minAccountSequence !== null || this.minAccountSequenceAge !== null || this.minAccountSequenceLedgerGap !== null || this.extraSigners !== null && this.extraSigners.length > 0;
  }
  /**
   * Builds a {@link FeeBumpTransaction}, enabling you to resubmit an existing
   * transaction with a higher fee.
   *
   * @param feeSource - account paying for the transaction,
   *     in the form of either a Keypair (only the public key is used) or
   *     an account ID (in G... or M... form, but refer to `withMuxing`)
   * @param baseFee - max fee willing to pay per operation
   *     in inner transaction (**in stroops**)
   * @param innerTx - {@link Transaction} to be bumped by
   *     the fee bump transaction
   * @param networkPassphrase - passphrase of the target
   *     Stellar network (e.g. "Public Global Stellar Network ; September 2015",
   *     see {@link Networks})
   *
   * TODO: Alongside the next major version bump, this type signature can be
   *       changed to be less awkward: accept a MuxedAccount as the `feeSource`
   *       rather than a keypair or string.
   *
   * Your fee-bump amount should be `>= 10x` the original fee.
   * @see  https://developers.stellar.org/docs/glossary/fee-bumps/#replace-by-fee
   */
  static buildFeeBumpTransaction(feeSource, baseFee, innerTx, networkPassphrase) {
    const innerOps = innerTx.operations.length;
    const minBaseFee = new BigNumber2(BASE_FEE);
    let resourceFee = new BigNumber2(0);
    const env = innerTx.toEnvelope();
    switch (env.switch().value) {
      case types.EnvelopeType.envelopeTypeTx().value: {
        const sorobanData = env.v1().tx().ext().value();
        resourceFee = new BigNumber2(sorobanData?.resourceFee().toString() ?? 0);
        break;
      }
    }
    const innerInclusionFee = new BigNumber2(innerTx.fee).minus(resourceFee).div(innerOps);
    const base = new BigNumber2(baseFee);
    if (base.lt(innerInclusionFee)) {
      throw new Error(
        `Invalid baseFee, it should be at least ${innerInclusionFee.toString()} stroops.`
      );
    }
    if (base.lt(minBaseFee)) {
      throw new Error(
        `Invalid baseFee, it should be at least ${minBaseFee.toString()} stroops.`
      );
    }
    let innerTxEnvelope = innerTx.toEnvelope();
    if (innerTxEnvelope.switch() === types.EnvelopeType.envelopeTypeTxV0()) {
      const v0Tx = innerTxEnvelope.v0().tx();
      const v0TimeBounds = v0Tx.timeBounds();
      if (v0TimeBounds === null) {
        throw new Error("Inner transaction must have time bounds");
      }
      const v1Tx = new types.Transaction({
        sourceAccount: types.MuxedAccount.keyTypeEd25519(
          v0Tx.sourceAccountEd25519()
        ),
        fee: v0Tx.fee(),
        seqNum: v0Tx.seqNum(),
        cond: types.Preconditions.precondTime(v0TimeBounds),
        memo: v0Tx.memo(),
        operations: v0Tx.operations(),
        ext: new types.TransactionExt(0)
      });
      innerTxEnvelope = types.TransactionEnvelope.envelopeTypeTx(
        new types.TransactionV1Envelope({
          tx: v1Tx,
          signatures: innerTxEnvelope.v0().signatures()
        })
      );
    }
    let feeSourceAccount;
    if (typeof feeSource === "string") {
      feeSourceAccount = decodeAddressToMuxedAccount(feeSource);
    } else {
      feeSourceAccount = feeSource.xdrMuxedAccount();
    }
    const tx = new types.FeeBumpTransaction({
      feeSource: feeSourceAccount,
      fee: types.Int64.fromString(
        base.times(innerOps + 1).plus(resourceFee).toString()
      ),
      innerTx: types.FeeBumpTransactionInnerTx.envelopeTypeTx(
        innerTxEnvelope.v1()
      ),
      ext: new types.FeeBumpTransactionExt(0)
    });
    const feeBumpTxEnvelope = new types.FeeBumpTransactionEnvelope({
      tx,
      signatures: []
    });
    const envelope = types.TransactionEnvelope.envelopeTypeTxFeeBump(feeBumpTxEnvelope);
    return new FeeBumpTransaction(envelope, networkPassphrase);
  }
  /**
   * Build a {@link Transaction} or {@link FeeBumpTransaction} from an
   * xdr.TransactionEnvelope.
   *
   * @param envelope - The transaction envelope
   *     object or base64 encoded string.
   * @param networkPassphrase - The network passphrase of the target
   *     Stellar network (e.g. "Public Global Stellar Network ; September
   *     2015"), see {@link Networks}.
   */
  static fromXDR(envelope, networkPassphrase) {
    if (typeof envelope === "string") {
      envelope = types.TransactionEnvelope.fromXDR(envelope, "base64");
    }
    if (envelope.switch() === types.EnvelopeType.envelopeTypeTxFeeBump()) {
      return new FeeBumpTransaction(envelope, networkPassphrase);
    }
    return new Transaction(envelope, networkPassphrase);
  }
};
function isValidDate(d) {
  return d instanceof Date && !Number.isNaN(d.getTime());
}
function toEpochSeconds(value) {
  if (value === void 0) {
    return void 0;
  }
  const num = value instanceof Date ? Math.floor(value.getTime() / 1e3) : Number(value);
  if (!Number.isFinite(num) || num % 1 !== 0) {
    throw new Error("timebounds value must be a finite integer or Date");
  }
  return num;
}

// node_modules/@stellar/stellar-sdk/lib/esm/rpc/index.js
var rpc_exports = {};
__export(rpc_exports, {
  Api: () => Api,
  BasicSleepStrategy: () => BasicSleepStrategy,
  Durability: () => Durability,
  LinearSleepStrategy: () => LinearSleepStrategy,
  Server: () => RpcServer,
  assembleTransaction: () => assembleTransaction,
  parseRawEvents: () => parseRawEvents,
  parseRawSimulation: () => parseRawSimulation
});

// node_modules/@stellar/stellar-sdk/lib/esm/rpc/api.js
var Api;
((Api2) => {
  ((GetTransactionStatus2) => {
    GetTransactionStatus2["SUCCESS"] = "SUCCESS";
    GetTransactionStatus2["NOT_FOUND"] = "NOT_FOUND";
    GetTransactionStatus2["FAILED"] = "FAILED";
  })(Api2.GetTransactionStatus || (Api2.GetTransactionStatus = {}));
  function isSimulationError(sim) {
    return "error" in sim;
  }
  Api2.isSimulationError = isSimulationError;
  function isSimulationSuccess(sim) {
    return "transactionData" in sim;
  }
  Api2.isSimulationSuccess = isSimulationSuccess;
  function isSimulationRestore(sim) {
    return isSimulationSuccess(sim) && "restorePreamble" in sim && !!sim.restorePreamble.transactionData;
  }
  Api2.isSimulationRestore = isSimulationRestore;
  function isSimulationRaw(sim) {
    return !sim._parsed;
  }
  Api2.isSimulationRaw = isSimulationRaw;
})(Api || (Api = {}));

// node_modules/@stellar/stellar-sdk/lib/esm/rpc/server.js
var import_buffer28 = require("buffer");

// node_modules/@stellar/stellar-sdk/lib/esm/rpc/axios.js
var version = "16.0.1";
function createHttpClient(headers) {
  return createFetchClient({
    headers: {
      ...headers,
      "X-Client-Name": "js-stellar-sdk",
      "X-Client-Version": version
    }
  });
}

// node_modules/@stellar/stellar-sdk/lib/esm/rpc/jsonrpc.js
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
async function postObject(client, url, method, param = null) {
  const response = await client.post(url, {
    jsonrpc: "2.0",
    // TODO: Generate a unique request id
    id: 1,
    method,
    params: param
  });
  if (hasOwnProperty(response.data, "error")) {
    throw response.data.error;
  } else {
    return response.data?.result;
  }
}

// node_modules/@stellar/stellar-sdk/lib/esm/rpc/transaction.js
var import_base323 = __toESM(require_base322(), 1);

// node_modules/@stellar/stellar-sdk/lib/esm/rpc/parsers.js
var import_base322 = __toESM(require_base322(), 1);
function parseRawSendTransaction(raw) {
  const { errorResultXdr, diagnosticEventsXdr } = raw;
  delete raw.errorResultXdr;
  delete raw.diagnosticEventsXdr;
  if (errorResultXdr) {
    return {
      ...raw,
      ...diagnosticEventsXdr !== void 0 && diagnosticEventsXdr.length > 0 && {
        diagnosticEvents: diagnosticEventsXdr.map(
          (evt) => types.DiagnosticEvent.fromXDR(evt, "base64")
        )
      },
      errorResult: types.TransactionResult.fromXDR(errorResultXdr, "base64")
    };
  }
  return { ...raw };
}
function parseTransactionInfo(raw) {
  const meta = types.TransactionMeta.fromXDR(raw.resultMetaXdr, "base64");
  const info = {
    ledger: raw.ledger,
    createdAt: raw.createdAt,
    applicationOrder: raw.applicationOrder,
    feeBump: raw.feeBump,
    envelopeXdr: types.TransactionEnvelope.fromXDR(raw.envelopeXdr, "base64"),
    resultXdr: types.TransactionResult.fromXDR(raw.resultXdr, "base64"),
    resultMetaXdr: meta,
    events: {
      contractEventsXdr: (raw.events?.contractEventsXdr ?? []).map(
        (lst) => lst.map((e) => types.ContractEvent.fromXDR(e, "base64"))
      ),
      transactionEventsXdr: (raw.events?.transactionEventsXdr ?? []).map(
        (e) => types.TransactionEvent.fromXDR(e, "base64")
      )
    }
  };
  switch (meta.switch()) {
    case 3:
    case 4: {
      const metaV = meta.value();
      if (metaV.sorobanMeta() !== null) {
        info.returnValue = metaV.sorobanMeta()?.returnValue() ?? void 0;
      }
    }
  }
  if (raw.diagnosticEventsXdr) {
    info.diagnosticEventsXdr = raw.diagnosticEventsXdr.map(
      (e) => types.DiagnosticEvent.fromXDR(e, "base64")
    );
  }
  return info;
}
function parseRawTransactions(r) {
  return {
    status: r.status,
    txHash: r.txHash,
    ...parseTransactionInfo(r)
  };
}
function parseRawEvents(raw) {
  return {
    latestLedger: raw.latestLedger,
    oldestLedger: raw.oldestLedger,
    latestLedgerCloseTime: raw.latestLedgerCloseTime,
    oldestLedgerCloseTime: raw.oldestLedgerCloseTime,
    cursor: raw.cursor,
    events: (raw.events ?? []).map((evt) => {
      const clone2 = { ...evt };
      delete clone2.contractId;
      return {
        ...clone2,
        ...evt.contractId !== "" && {
          contractId: new Contract(evt.contractId)
        },
        topic: (evt.topic ?? []).map(
          (topic) => types.ScVal.fromXDR(topic, "base64")
        ),
        value: types.ScVal.fromXDR(evt.value, "base64")
      };
    })
  };
}
function parseRawLedgerEntries(raw) {
  return {
    latestLedger: raw.latestLedger,
    entries: (raw.entries ?? []).map((rawEntry) => {
      if (!rawEntry.key || !rawEntry.xdr) {
        throw new TypeError(
          `invalid ledger entry: ${JSON.stringify(rawEntry)}`
        );
      }
      return {
        lastModifiedLedgerSeq: rawEntry.lastModifiedLedgerSeq,
        key: types.LedgerKey.fromXDR(rawEntry.key, "base64"),
        val: types.LedgerEntryData.fromXDR(rawEntry.xdr, "base64"),
        ...rawEntry.liveUntilLedgerSeq !== void 0 && {
          liveUntilLedgerSeq: rawEntry.liveUntilLedgerSeq
        }
      };
    })
  };
}
function parseSuccessful(sim, partial) {
  const success = {
    ...partial,
    transactionData: new SorobanDataBuilder(sim.transactionData),
    minResourceFee: sim.minResourceFee,
    // coalesce 0-or-1-element results[] list into a single result struct
    // with decoded fields if present
    ...(sim.results?.length ?? 0) > 0 && {
      result: sim.results.map((row) => ({
        auth: (row.auth ?? []).map(
          (entry) => types.SorobanAuthorizationEntry.fromXDR(entry, "base64")
        ),
        // if return value is missing ("falsy") we coalesce to void
        retval: row.xdr ? types.ScVal.fromXDR(row.xdr, "base64") : types.ScVal.scvVoid()
      }))[0]
    },
    ...(sim.stateChanges?.length ?? 0) > 0 && {
      stateChanges: sim.stateChanges?.map((entryChange) => ({
        type: entryChange.type,
        key: types.LedgerKey.fromXDR(entryChange.key, "base64"),
        before: entryChange.before ? types.LedgerEntry.fromXDR(entryChange.before, "base64") : null,
        after: entryChange.after ? types.LedgerEntry.fromXDR(entryChange.after, "base64") : null
      }))
    }
  };
  if (!sim.restorePreamble || sim.restorePreamble.transactionData === "") {
    return success;
  }
  return {
    ...success,
    restorePreamble: {
      minResourceFee: sim.restorePreamble.minResourceFee,
      transactionData: new SorobanDataBuilder(
        sim.restorePreamble.transactionData
      )
    }
  };
}
function parseRawSimulation(sim) {
  const looksRaw = Api.isSimulationRaw(sim);
  if (!looksRaw) {
    return sim;
  }
  const base = {
    _parsed: true,
    id: sim.id,
    latestLedger: sim.latestLedger,
    events: sim.events?.map((evt) => types.DiagnosticEvent.fromXDR(evt, "base64")) ?? []
  };
  if (typeof sim.error === "string") {
    return {
      ...base,
      error: sim.error
    };
  }
  return parseSuccessful(sim, base);
}
function parseRawLedger(raw) {
  if (!raw.metadataXdr || !raw.headerXdr) {
    let missingFields;
    if (!raw.metadataXdr && !raw.headerXdr) {
      missingFields = "metadataXdr and headerXdr";
    } else if (!raw.metadataXdr) {
      missingFields = "metadataXdr";
    } else {
      missingFields = "headerXdr";
    }
    throw new TypeError(`invalid ledger missing fields: ${missingFields}`);
  }
  const metadataXdr = types.LedgerCloseMeta.fromXDR(raw.metadataXdr, "base64");
  const headerXdr = types.LedgerHeaderHistoryEntry.fromXDR(
    raw.headerXdr,
    "base64"
  );
  return {
    hash: raw.hash,
    sequence: raw.sequence,
    ledgerCloseTime: raw.ledgerCloseTime,
    metadataXdr,
    headerXdr
  };
}
function parseRawLatestLedger(raw) {
  const headerXdr = types.LedgerHeader.fromXDR(raw.headerXdr, "base64");
  const metadataXdr = types.LedgerCloseMeta.fromXDR(raw.metadataXdr, "base64");
  let missingFields;
  if (!raw.metadataXdr && !raw.headerXdr) {
    missingFields = "metadataXdr and headerXdr";
  } else if (!raw.metadataXdr) {
    missingFields = "metadataXdr";
  } else if (!raw.headerXdr) {
    missingFields = "headerXdr";
  }
  if (missingFields) {
    throw new TypeError(
      `invalid getLatestLedger response missing fields: ${missingFields}`
    );
  }
  return {
    id: raw.id,
    sequence: raw.sequence,
    protocolVersion: raw.protocolVersion,
    closeTime: raw.closeTime,
    headerXdr,
    metadataXdr
  };
}

// node_modules/@stellar/stellar-sdk/lib/esm/rpc/transaction.js
function isSorobanTransaction(tx) {
  if (tx.operations.length !== 1) {
    return false;
  }
  switch (tx.operations[0].type) {
    case "invokeHostFunction":
    case "extendFootprintTtl":
    case "restoreFootprint":
      return true;
    default:
      return false;
  }
}
function assembleTransaction(raw, simulation) {
  if ("innerTransaction" in raw) {
    return assembleTransaction(raw.innerTransaction, simulation);
  }
  if (!isSorobanTransaction(raw)) {
    throw new TypeError(
      "unsupported transaction: must contain exactly one invokeHostFunction, extendFootprintTtl, or restoreFootprint operation"
    );
  }
  const success = parseRawSimulation(simulation);
  if (!Api.isSimulationSuccess(success)) {
    throw new Error(`simulation incorrect: ${JSON.stringify(success)}`);
  }
  let classicFeeNum;
  try {
    classicFeeNum = BigInt(raw.fee);
  } catch {
    classicFeeNum = BigInt(0);
  }
  const rawSorobanData = raw.toEnvelope().v1().tx().ext().value();
  if (rawSorobanData) {
    if (classicFeeNum - rawSorobanData.resourceFee().toBigInt() > BigInt(0)) {
      classicFeeNum -= rawSorobanData.resourceFee().toBigInt();
    }
  }
  const txnBuilder = TransactionBuilder.cloneFrom(raw, {
    // automatically update the tx fee that will be set on the resulting tx to
    // the sum of 'classic' fee provided from incoming tx.fee and minResourceFee
    // provided by simulation.
    //
    // 'classic' tx fees are measured as the product of tx.fee * 'number of
    // operations', In soroban contract tx, there can only be single operation
    // in the tx, so can make simplification of total classic fees for the
    // soroban transaction will be equal to incoming tx.fee + minResourceFee.
    fee: classicFeeNum.toString(),
    // apply the pre-built Soroban Tx Data from simulation onto the Tx
    sorobanData: success.transactionData.build(),
    networkPassphrase: raw.networkPassphrase
  });
  if (raw.operations[0].type === "invokeHostFunction") {
    txnBuilder.clearOperations();
    const invokeOp = raw.operations[0];
    const existingAuth = invokeOp.auth ?? [];
    txnBuilder.addOperation(
      Operation.invokeHostFunction({
        source: invokeOp.source,
        func: invokeOp.func,
        // if auth entries are already present, we consider this "advanced
        // usage" and disregard ALL auth entries from the simulation
        //
        // the intuition is "if auth exists, this tx has probably been
        // simulated before"
        auth: existingAuth.length > 0 ? existingAuth : success.result.auth
      })
    );
  }
  return txnBuilder;
}

// node_modules/@stellar/stellar-sdk/lib/esm/rpc/server.js
var Durability = /* @__PURE__ */ ((Durability2) => {
  Durability2["Temporary"] = "temporary";
  Durability2["Persistent"] = "persistent";
  return Durability2;
})(Durability || {});
var DEFAULT_GET_TRANSACTION_TIMEOUT = 30;
var BasicSleepStrategy = (_iter) => 1e3;
var LinearSleepStrategy = (iter) => 1e3 * iter;
function findCreatedAccountSequenceInTransactionMeta(meta) {
  let operations = [];
  switch (meta.switch()) {
    case 0:
      operations = meta.operations();
      break;
    case 1:
    case 2:
    case 3:
    case 4:
      operations = meta.value().operations();
      break;
    default:
      throw new Error("Unexpected transaction meta switch value");
  }
  const sequenceNumber = operations.flatMap((op) => op.changes()).find(
    (c) => c.switch() === types.LedgerEntryChangeType.ledgerEntryCreated() && c.created().data().switch() === types.LedgerEntryType.account()
  )?.created()?.data()?.account()?.seqNum()?.toString();
  if (sequenceNumber) {
    return sequenceNumber;
  }
  throw new Error("No account created in transaction");
}
var RpcServer = class {
  serverURL;
  /**
   * HTTP client instance for making requests to Horizon.
   * Exposes interceptors, defaults, and other configuration options.
   *
   * @example
   * ```ts
   * // Add authentication header
   * server.httpClient.defaults.headers['Authorization'] = 'Bearer token';
   *
   * // Add request interceptor
   * server.httpClient.interceptors.request.use((config) => {
   *   console.log('Request:', config.url);
   *   return config;
   * });
   * ```
   */
  httpClient;
  constructor(serverURL, opts = {}) {
    this.serverURL = new URL(serverURL);
    this.httpClient = createHttpClient(opts.headers);
    if (this.serverURL.protocol !== "https:" && !opts.allowHttp) {
      throw new Error(
        "Cannot connect to insecure Soroban RPC server if `allowHttp` isn't set"
      );
    }
  }
  /**
   * Fetch a minimal set of current info about a Stellar account.
   *
   * Needed to get the current sequence number for the account so you can build
   * a successful transaction with {@link TransactionBuilder}.
   *
   * @param address - The public address of the account to load.
   * @returns A promise which resolves to the {@link Account}
   * object with a populated sequence number
   *
   * @see {@link https://developers.stellar.org/docs/data/rpc/api-reference/methods/getLedgerEntries | getLedgerEntries docs}
   *
   * @example
   * ```ts
   * const accountId = "GBZC6Y2Y7Q3ZQ2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4";
   * server.getAccount(accountId).then((account) => {
   *   console.log("sequence:", account.sequence);
   * });
   * ```
   */
  async getAccount(address) {
    const entry = await this.getAccountEntry(address);
    return new Account(address, entry.seqNum().toString());
  }
  /**
   * Fetch the full account entry for a Stellar account.
   *
   * @param address - The public address of the account to load.
   * @returns Resolves to the full on-chain account
   *    entry
   *
   * @see
   * {@link https://developers.stellar.org/docs/data/rpc/api-reference/methods/getLedgerEntries | getLedgerEntries docs}
   *
   * @example
   * ```ts
   * const accountId = "GBZC6Y2Y7Q3ZQ2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4";
   * server.getAccountEntry(accountId).then((account) => {
   *   console.log("sequence:", account.balance().toString());
   * });
   * ```
   */
  async getAccountEntry(address) {
    const ledgerKey = types.LedgerKey.account(
      new types.LedgerKeyAccount({
        accountId: Keypair.fromPublicKey(address).xdrPublicKey()
      })
    );
    try {
      const resp = await this.getLedgerEntry(ledgerKey);
      return resp.val.account();
    } catch {
      throw new Error(`Account not found: ${address}`);
    }
  }
  /**
   * Fetch the full trustline entry for a Stellar account.
   *
   * @param account - The public address of the account whose trustline it is
   * @param asset - The trustline's asset
   * @returns Resolves to the full on-chain trustline
   *    entry
   *
   * @see
   * {@link https://developers.stellar.org/docs/data/rpc/api-reference/methods/getLedgerEntries | getLedgerEntries docs}
   *
   * @deprecated Use {@link getAssetBalance}, instead
   * @example
   * ```ts
   * const accountId = "GBZC6Y2Y7Q3ZQ2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4";
   * const asset = new Asset(
   *  "USDC",
   *  "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
   * );
   * server.getTrustline(accountId, asset).then((entry) => {
   *   console.log(`{asset.toString()} balance for ${accountId}:", entry.balance().toString());
   * });
   * ```
   */
  async getTrustline(account, asset) {
    const trustlineLedgerKey = types.LedgerKey.trustline(
      new types.LedgerKeyTrustLine({
        accountId: Keypair.fromPublicKey(account).xdrAccountId(),
        asset: asset.toTrustLineXDRObject()
      })
    );
    try {
      const entry = await this.getLedgerEntry(trustlineLedgerKey);
      return entry.val.trustLine();
    } catch {
      throw new Error(
        `Trustline for ${asset.getCode()}:${asset.getIssuer()} not found for ${account}`
      );
    }
  }
  /**
   * Fetch the full claimable balance entry for a Stellar account.
   *
   * @param id - The strkey (`B...`) or hex (`00000000abcde...`) (both
   *    IDs with and without the 000... version prefix are accepted) of the
   *    claimable balance to load
   * @returns Resolves to the full on-chain
   *    claimable balance entry
   *
   * @see
   * {@link https://developers.stellar.org/docs/data/rpc/api-reference/methods/getLedgerEntries | getLedgerEntries docs}
   *
   * @example
   * ```ts
   * const id = "00000000178826fbfe339e1f5c53417c6fedfe2c05e8bec14303143ec46b38981b09c3f9";
   * server.getClaimableBalance(id).then((entry) => {
   *   console.log(`Claimable balance {id.substr(0, 12)} has:`);
   *   console.log(`  asset:  ${Asset.fromXDRObject(entry.asset()).toString()}`;
   *   console.log(`  amount: ${entry.amount().toString()}`;
   * });
   * ```
   */
  async getClaimableBalance(id) {
    let balanceId;
    if (StrKey.isValidClaimableBalance(id)) {
      const buffer = StrKey.decodeClaimableBalance(id);
      const v = import_buffer28.Buffer.concat([
        import_buffer28.Buffer.from("\0\0\0"),
        buffer.subarray(0, 1)
      ]);
      balanceId = types.ClaimableBalanceId.fromXDR(
        import_buffer28.Buffer.concat([v, buffer.subarray(1)])
      );
    } else if (id.match(/[a-f0-9]{72}/i)) {
      balanceId = types.ClaimableBalanceId.fromXDR(id, "hex");
    } else if (id.match(/[a-f0-9]{64}/i)) {
      balanceId = types.ClaimableBalanceId.fromXDR(id.padStart(72, "0"), "hex");
    } else {
      throw new TypeError(`expected 72-char hex ID or strkey, not ${id}`);
    }
    const trustlineLedgerKey = types.LedgerKey.claimableBalance(
      new types.LedgerKeyClaimableBalance({ balanceId })
    );
    try {
      const entry = await this.getLedgerEntry(trustlineLedgerKey);
      return entry.val.claimableBalance();
    } catch {
      throw new Error(`Claimable balance ${id} not found`);
    }
  }
  /**
   * Fetch the balance of an asset held by an account or contract.
   *
   * The `address` argument may be provided as a string (as a {@link StrKey}),
   * {@link Address}, or {@link Contract}.
   *
   * @param address - The account or contract whose
   *    balance should be fetched.
   * @param asset - The asset whose balance you want to inspect.
   * @param networkPassphrase - (optional) optionally, when requesting the
   *    balance of a contract, the network passphrase to which this token
   *    applies. If omitted and necessary, a request about network information
   *    will be made (see {@link getNetwork}), since contract IDs for assets are
   *    specific to a network. You can refer to {@link Networks} for a list of
   *    built-in passphrases, e.g., `Networks.TESTNET`.
   * @returns Resolves with balance entry details
   *    when available.
   *
   * @throws If the supplied `address` is not a valid account or
   *    contract strkey.
   *
   * @example
   * ```ts
   * const usdc = new Asset(
   *   "USDC",
   *   "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
   * );
   * const balance = await server.getAssetBalance("GD...", usdc);
   * console.log(balance.balanceEntry?.amount);
   * ```
   */
  async getAssetBalance(address, asset, networkPassphrase) {
    let addr = address;
    if (typeof address === "string") {
      addr = address;
    } else if (address instanceof Address) {
      addr = address.toString();
    } else if (address instanceof Contract) {
      addr = address.toString();
    } else {
      throw new TypeError(`invalid address: ${address}`);
    }
    if (StrKey.isValidEd25519PublicKey(addr)) {
      const [tl, ll] = await Promise.all([
        this.getTrustline(addr, asset),
        this.getLatestLedger()
      ]);
      return {
        latestLedger: ll.sequence,
        balanceEntry: {
          amount: tl.balance().toString(),
          // Extract actual flags from the coalesced value.
          authorized: Boolean(tl.flags() & 1),
          // AUTHORIZED_FLAG
          clawback: Boolean(tl.flags() & 4),
          // TRUSTLINE_CLAWBACK_ENABLED_FLAG
          authorizedToMaintainLiabilities: Boolean(tl.flags() & 2),
          // AUTHORIZED_TO_MAINTAIN_LIABILITIES_FLAG
          revocable: Boolean(tl.flags() & 2)
          // AUTHORIZED_TO_MAINTAIN_LIABILITIES_FLAG (deprecated, will be removed in a future major release)
        }
      };
    } else if (StrKey.isValidContract(addr)) {
      return this.getSACBalance(addr, asset, networkPassphrase);
    }
    throw new Error(`invalid address: ${address}`);
  }
  /**
   * General node health check.
   *
   * @returns A promise which resolves to the
   * {@link Api.GetHealthResponse} object with the status of the
   * server (e.g. "healthy").
   *
   * @see {@link https://developers.stellar.org/docs/data/rpc/api-reference/methods/getHealth | getLedgerEntries docs}
   *
   * @example
   * ```ts
   * server.getHealth().then((health) => {
   *   console.log("status:", health.status);
   * });
   * ```
   */
  async getHealth() {
    return postObject(
      this.httpClient,
      this.serverURL.toString(),
      "getHealth"
    );
  }
  /**
   * Reads the current value of contract data ledger entries directly.
   *
   * Allows you to directly inspect the current state of a contract. This is a
   * backup way to access your contract data which may not be available via
   * events or {@link rpc.Server.simulateTransaction}.
   *
   * @param contract - The contract ID containing the
   *    data to load as a strkey (`C...` form), a {@link Contract}, or an
   *    {@link Address} instance
   * @param key - The key of the contract data to load
   * @param durability - (optional) The "durability
   *    keyspace" that this ledger key belongs to, which is either 'temporary'
   *    or 'persistent' (the default), see {@link rpc.Durability}.
   * @returns The current data value
   *
   * **Warning:** If the data entry in question is a 'temporary' entry, it's
   * entirely possible that it has expired out of existence.
   *
   * @see {@link https://developers.stellar.org/docs/data/rpc/api-reference/methods/getLedgerEntries | getLedgerEntries docs}
   *
   * @example
   * ```ts
   * const contractId = "CCJZ5DGASBWQXR5MPFCJXMBI333XE5U3FSJTNQU7RIKE3P5GN2K2WYD5";
   * const key = xdr.ScVal.scvSymbol("counter");
   * server.getContractData(contractId, key, Durability.Temporary).then(data => {
   *   console.log("value:", data.val);
   *   console.log("liveUntilLedgerSeq:", data.liveUntilLedgerSeq);
   *   console.log("lastModified:", data.lastModifiedLedgerSeq);
   *   console.log("latestLedger:", data.latestLedger);
   * });
   * ```
   */
  async getContractData(contract, key, durability = "persistent") {
    let scAddress;
    if (typeof contract === "string") {
      scAddress = new Contract(contract).address().toScAddress();
    } else if (contract instanceof Address) {
      scAddress = contract.toScAddress();
    } else if (contract instanceof Contract) {
      scAddress = contract.address().toScAddress();
    } else {
      throw new TypeError(`unknown contract type: ${contract}`);
    }
    let xdrDurability;
    switch (durability) {
      case "temporary":
        xdrDurability = types.ContractDataDurability.temporary();
        break;
      case "persistent":
        xdrDurability = types.ContractDataDurability.persistent();
        break;
      default:
        throw new TypeError(`invalid durability: ${durability}`);
    }
    const contractKey = types.LedgerKey.contractData(
      new types.LedgerKeyContractData({
        key,
        contract: scAddress,
        durability: xdrDurability
      })
    );
    try {
      return await this.getLedgerEntry(contractKey);
    } catch {
      throw {
        code: 404,
        message: `Contract data not found for ${Address.fromScAddress(
          scAddress
        ).toString()} with key ${key.toXDR("base64")} and durability: ${durability}`
      };
    }
  }
  /**
   * Retrieves the WASM bytecode for a given contract.
   *
   * This method allows you to fetch the WASM bytecode associated with a contract
   * deployed on the Soroban network. The WASM bytecode represents the executable
   * code of the contract.
   *
   * @param contractId - The contract ID containing the WASM bytecode to retrieve
   * @returns A Buffer containing the WASM bytecode
   * @throws If the contract or its associated WASM bytecode cannot be
   * found on the network.
   *
   * @example
   * ```ts
   * const contractId = "CCJZ5DGASBWQXR5MPFCJXMBI333XE5U3FSJTNQU7RIKE3P5GN2K2WYD5";
   * server.getContractWasmByContractId(contractId).then(wasmBuffer => {
   *   console.log("WASM bytecode length:", wasmBuffer.length);
   *   // ... do something with the WASM bytecode ...
   * }).catch(err => {
   *   console.error("Error fetching WASM bytecode:", err);
   * });
   * ```
   */
  async getContractWasmByContractId(contractId) {
    const contractLedgerKey = new Contract(contractId).getFootprint();
    const response = await this.getLedgerEntries(contractLedgerKey);
    if (!response.entries.length || !response.entries[0]?.val) {
      return Promise.reject({
        code: 404,
        message: `Could not obtain contract hash from server`
      });
    }
    const wasmHash = response.entries[0].val.contractData().val().instance().executable().wasmHash();
    return this.getContractWasmByHash(wasmHash);
  }
  /**
   * Retrieves the WASM bytecode for a given contract hash.
   *
   * This method allows you to fetch the WASM bytecode associated with a contract
   * deployed on the Soroban network using the contract's WASM hash. The WASM bytecode
   * represents the executable code of the contract.
   *
   * @param wasmHash - The WASM hash of the contract
   * @returns A Buffer containing the WASM bytecode
   * @throws If the contract or its associated WASM bytecode cannot be
   * found on the network.
   *
   * @example
   * ```ts
   * const wasmHash = Buffer.from("...");
   * server.getContractWasmByHash(wasmHash).then(wasmBuffer => {
   *   console.log("WASM bytecode length:", wasmBuffer.length);
   *   // ... do something with the WASM bytecode ...
   * }).catch(err => {
   *   console.error("Error fetching WASM bytecode:", err);
   * });
   * ```
   */
  async getContractWasmByHash(wasmHash, format = void 0) {
    const wasmHashBuffer = typeof wasmHash === "string" ? import_buffer28.Buffer.from(wasmHash, format) : wasmHash;
    const ledgerKeyWasmHash = types.LedgerKey.contractCode(
      new types.LedgerKeyContractCode({
        hash: wasmHashBuffer
      })
    );
    const responseWasm = await this.getLedgerEntries(ledgerKeyWasmHash);
    if (!responseWasm.entries.length || !responseWasm.entries[0]?.val) {
      return Promise.reject({
        code: 404,
        message: "Could not obtain contract wasm from server"
      });
    }
    const wasmBuffer = responseWasm.entries[0].val.contractCode().code();
    return wasmBuffer;
  }
  /**
   * Reads the current value of arbitrary ledger entries directly.
   *
   * Allows you to directly inspect the current state of contracts, contract's
   * code, accounts, or any other ledger entries.
   *
   * To fetch a contract's WASM byte-code, built the appropriate
   * {@link xdr.LedgerKeyContractCode} ledger entry key (or see
   * {@link Contract.getFootprint}).
   *
   * @param keys - One or more ledger entry keys to load
   * @returns The current on-chain
   * values for the given ledger keys
   *
   * @see {@link https://developers.stellar.org/docs/data/rpc/api-reference/methods/getLedgerEntries | getLedgerEntries docs}
   * @see RpcServer._getLedgerEntries
   * @example
   * ```ts
   * const contractId = "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM";
   * const key = xdr.LedgerKey.contractData(new xdr.LedgerKeyContractData({
   *   contractId: StrKey.decodeContract(contractId),
   *   key: xdr.ScVal.scvSymbol("counter"),
   * }));
   *
   * server.getLedgerEntries([key]).then(response => {
   *   const ledgerData = response.entries[0];
   *   console.log("key:", ledgerData.key);
   *   console.log("value:", ledgerData.val);
   *   console.log("liveUntilLedgerSeq:", ledgerData.liveUntilLedgerSeq);
   *   console.log("lastModified:", ledgerData.lastModifiedLedgerSeq);
   *   console.log("latestLedger:", response.latestLedger);
   * });
   * ```
   */
  getLedgerEntries(...keys) {
    return this._getLedgerEntries(...keys).then(parseRawLedgerEntries);
  }
  _getLedgerEntries(...keys) {
    return postObject(
      this.httpClient,
      this.serverURL.toString(),
      "getLedgerEntries",
      {
        keys: keys.map((k) => k.toXDR("base64"))
      }
    );
  }
  async getLedgerEntry(key) {
    const results = await this._getLedgerEntries(key).then(
      parseRawLedgerEntries
    );
    if (results.entries.length !== 1) {
      throw new Error(`failed to find an entry for key ${key.toXDR("base64")}`);
    }
    return results.entries[0];
  }
  /**
   * Poll for a particular transaction with certain parameters.
   *
   * After submitting a transaction, clients can use this to poll for
   * transaction completion and return a definitive state of success or failure.
   *
   * @param hash - the transaction you're polling for
   * @param opts - (optional) polling options
   *   - `attempts` (optional): (optional) the number of attempts to make
   *    before returning the last-seen status. By default or on invalid inputs,
   *    try 5 times.
   *   - `sleepStrategy` (optional): (optional) the amount of time
   *    to wait for between each attempt. By default, sleep for 1 second between
   *    each attempt.
   *
   * @returns the response after a "found"
   *    response (which may be success or failure) or the last response obtained
   *    after polling the maximum number of specified attempts.
   *
   * @example
   * ```ts
   * const h = "c4515e3bdc0897f21cc5dbec8c82cf0a936d4741cb74a8e158eb51b9fb00411a";
   * const txStatus = await server.pollTransaction(h, {
   *    attempts: 100, // I'm a maniac
   *    sleepStrategy: rpc.LinearSleepStrategy
   * }); // this will take 5,050 seconds to complete
   * ```
   */
  async pollTransaction(hash2, opts) {
    const maxAttempts = (opts?.attempts ?? 0) < 1 ? DEFAULT_GET_TRANSACTION_TIMEOUT : opts?.attempts ?? DEFAULT_GET_TRANSACTION_TIMEOUT;
    let foundInfo;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      foundInfo = await this.getTransaction(hash2);
      if (foundInfo.status !== Api.GetTransactionStatus.NOT_FOUND) {
        return foundInfo;
      }
      await Utils.sleep((opts?.sleepStrategy ?? BasicSleepStrategy)(attempt));
    }
    return foundInfo;
  }
  /**
   * Fetch the details of a submitted transaction.
   *
   * After submitting a transaction, clients should poll this to tell when the
   * transaction has completed.
   *
   * @param hash - Hex-encoded hash of the transaction to check
   * @returns The status, result, and
   *    other details about the transaction
   *
   * @see
   * {@link https://developers.stellar.org/docs/data/rpc/api-reference/methods/getTransaction | getTransaction docs}
   *
   * @example
   * ```ts
   * const transactionHash = "c4515e3bdc0897f21cc5dbec8c82cf0a936d4741cb74a8e158eb51b9fb00411a";
   * server.getTransaction(transactionHash).then((tx) => {
   *   console.log("status:", tx.status);
   *   console.log("envelopeXdr:", tx.envelopeXdr);
   *   console.log("resultMetaXdr:", tx.resultMetaXdr);
   *   console.log("resultXdr:", tx.resultXdr);
   * });
   * ```
   */
  async getTransaction(hash2) {
    return this._getTransaction(hash2).then((raw) => {
      const foundInfo = {};
      if (raw.status !== Api.GetTransactionStatus.NOT_FOUND) {
        Object.assign(foundInfo, parseTransactionInfo(raw));
      }
      const result = {
        status: raw.status,
        txHash: hash2,
        latestLedger: raw.latestLedger,
        latestLedgerCloseTime: raw.latestLedgerCloseTime,
        oldestLedger: raw.oldestLedger,
        oldestLedgerCloseTime: raw.oldestLedgerCloseTime,
        ...foundInfo
      };
      return result;
    });
  }
  async _getTransaction(hash2) {
    return postObject(
      this.httpClient,
      this.serverURL.toString(),
      "getTransaction",
      {
        hash: hash2
      }
    );
  }
  /**
   * Fetch transactions starting from a given start ledger or a cursor. The end ledger is the latest ledger
   * in that RPC instance.
   *
   * @param request - The request parameters.
   * @returns - A promise that resolves to the transactions response.
   *
   * @see https://developers.stellar.org/docs/data/rpc/api-reference/methods/getTransactions
   * @example
   * ```ts
   * server.getTransactions({
   *   startLedger: 10000,
   *   limit: 10,
   * }).then((response) => {
   *   console.log("Transactions:", response.transactions);
   *   console.log("Latest Ledger:", response.latestLedger);
   *   console.log("Cursor:", response.cursor);
   * });
   * ```
   */
  async getTransactions(request2) {
    return this._getTransactions(request2).then(
      (raw) => {
        const result = {
          transactions: (raw.transactions || []).map(parseRawTransactions),
          latestLedger: raw.latestLedger,
          latestLedgerCloseTimestamp: raw.latestLedgerCloseTimestamp,
          oldestLedger: raw.oldestLedger,
          oldestLedgerCloseTimestamp: raw.oldestLedgerCloseTimestamp,
          cursor: raw.cursor
        };
        return result;
      }
    );
  }
  async _getTransactions(request2) {
    return postObject(
      this.httpClient,
      this.serverURL.toString(),
      "getTransactions",
      request2
    );
  }
  /**
   * Fetch all events that match a given set of filters.
   *
   * The given filters (see {@link Api.EventFilter}
   * for detailed fields) are combined only in a logical OR fashion, and all of
   * the fields in each filter are optional.
   *
   * To page through events, use the `pagingToken` field on the relevant
   * {@link Api.EventResponse} object to set the `cursor` parameter.
   *
   * @param request - Event filters {@link Api.GetEventsRequest},
   * @returns A paginatable set of the events
   * matching the given event filters
   *
   * @see {@link https://developers.stellar.org/docs/data/rpc/api-reference/methods/getEvents | getEvents docs}
   *
   * @example
   * ```ts
   *
   * server.getEvents({
   *    startLedger: 1000,
   *    endLedger: 2000,
   *    filters: [
   *     {
   *      type: "contract",
   *      contractIds: [ "deadb33f..." ],
   *      topics: [[ "AAAABQAAAAh0cmFuc2Zlcg==", "AAAAAQB6Mcc=", "*" ]]
   *     }, {
   *      type: "system",
   *      contractIds: [ "...c4f3b4b3..." ],
   *      topics: [[ "*" ], [ "*", "AAAAAQB6Mcc=" ]]
   *     }, {
   *      contractIds: [ "...c4f3b4b3..." ],
   *      topics: [[ "AAAABQAAAAh0cmFuc2Zlcg==" ]]
   *     }, {
   *      type: "diagnostic",
   *      topics: [[ "AAAAAQB6Mcc=" ]]
   *     }
   *    ],
   *    limit: 10,
   * });
   * ```
   */
  async getEvents(request2) {
    return this._getEvents(request2).then(parseRawEvents);
  }
  async _getEvents(request2) {
    return postObject(
      this.httpClient,
      this.serverURL.toString(),
      "getEvents",
      {
        filters: request2.filters ?? [],
        pagination: {
          ...request2.cursor && { cursor: request2.cursor },
          // add if defined
          ...request2.limit && { limit: request2.limit }
        },
        ...request2.startLedger && {
          startLedger: request2.startLedger
        },
        ...request2.endLedger && {
          endLedger: request2.endLedger
        }
      }
    );
  }
  /**
   * Fetch metadata about the network this Soroban RPC server is connected to.
   *
   * @returns Metadata about the current
   * network this RPC server is connected to
   *
   * @see {@link https://developers.stellar.org/docs/data/rpc/api-reference/methods/getNetwork | getNetwork docs}
   *
   * @example
   * ```ts
   * server.getNetwork().then((network) => {
   *   console.log("friendbotUrl:", network.friendbotUrl);
   *   console.log("passphrase:", network.passphrase);
   *   console.log("protocolVersion:", network.protocolVersion);
   * });
   * ```
   */
  async getNetwork() {
    return postObject(
      this.httpClient,
      this.serverURL.toString(),
      "getNetwork"
    );
  }
  /**
   * Fetch the latest ledger meta info from network which this Soroban RPC
   * server is connected to.
   *
   * @returns metadata about the
   *    latest ledger on the network that this RPC server is connected to
   *
   * @see {@link https://developers.stellar.org/docs/data/rpc/api-reference/methods/getLatestLedger | getLatestLedger docs}
   *
   * @example
   * ```ts
   * server.getLatestLedger().then((response) => {
   *   console.log("hash:", response.id);
   *   console.log("sequence:", response.sequence);
   *   console.log("protocolVersion:", response.protocolVersion);
   * });
   * ```
   */
  async getLatestLedger() {
    return this._getLatestLedger().then(parseRawLatestLedger);
  }
  async _getLatestLedger() {
    return postObject(
      this.httpClient,
      this.serverURL.toString(),
      "getLatestLedger"
    );
  }
  /**
   * Submit a trial contract invocation to get back return values, expected
   * ledger footprint, expected authorizations, and expected costs.
   *
   * @param tx - the transaction to simulate,
   *    which should include exactly one operation (one of
   *    {@link xdr.InvokeHostFunctionOp}, {@link xdr.ExtendFootprintTtlOp}, or
   *    {@link xdr.RestoreFootprintOp}). Any provided footprint or auth
   *    information will be ignored.
   * @param addlResources - (optional) any additional resources
   *    to add to the simulation-provided ones, for example if you know you will
   *    need extra CPU instructions
   * @param authMode - (optional) optionally, specify the type of
   *    auth mode to use for simulation: `enforce` for enforcement mode,
   *    `record` for recording mode, or `record_allow_nonroot` for recording
   *    mode that allows non-root authorization
   *
   * @returns An object with the
   *    cost, footprint, result/auth requirements (if applicable), and error of
   *    the transaction
   *
   * @see
   * {@link https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/operations-and-transactions | transaction docs}
   * @see
   * {@link https://developers.stellar.org/docs/data/rpc/api-reference/methods/simulateTransaction | simulateTransaction docs}
   * @see
   * {@link https://developers.stellar.org/docs/learn/fundamentals/contract-development/contract-interactions/transaction-simulation#authorization | authorization modes}
   * @see module:rpc.Server#prepareTransaction
   * @see module:rpc.assembleTransaction
   *
   * @example
   * ```ts
   * const contractId = 'CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE';
   * const contract = new StellarSdk.Contract(contractId);
   *
   * // Right now, this is just the default fee for this example.
   * const fee = StellarSdk.BASE_FEE;
   * const transaction = new StellarSdk.TransactionBuilder(account, { fee })
   *   // Uncomment the following line to build transactions for the live network. Be
   *   // sure to also change the horizon hostname.
   *   //.setNetworkPassphrase(StellarSdk.Networks.PUBLIC)
   *   .setNetworkPassphrase(StellarSdk.Networks.FUTURENET)
   *   .setTimeout(30) // valid for the next 30s
   *   // Add an operation to call increment() on the contract
   *   .addOperation(contract.call("increment"))
   *   .build();
   *
   * server.simulateTransaction(transaction).then((sim) => {
   *   console.log("cost:", sim.cost);
   *   console.log("result:", sim.result);
   *   console.log("error:", sim.error);
   *   console.log("latestLedger:", sim.latestLedger);
   * });
   * ```
   */
  async simulateTransaction(tx, addlResources, authMode) {
    return this._simulateTransaction(tx, addlResources, authMode).then(
      parseRawSimulation
    );
  }
  async _simulateTransaction(transaction, addlResources, authMode) {
    return postObject(
      this.httpClient,
      this.serverURL.toString(),
      "simulateTransaction",
      {
        transaction: transaction.toXDR(),
        authMode,
        ...addlResources !== void 0 && {
          resourceConfig: {
            instructionLeeway: addlResources.cpuInstructions
          }
        }
      }
    );
  }
  /**
   * Submit a trial contract invocation, first run a simulation of the contract
   * invocation as defined on the incoming transaction, and apply the results to
   * a new copy of the transaction which is then returned. Setting the ledger
   * footprint and authorization, so the resulting transaction is ready for
   * signing & sending.
   *
   * The returned transaction will also have an updated fee that is the sum of
   * fee set on incoming transaction with the contract resource fees estimated
   * from simulation. It is advisable to check the fee on returned transaction
   * and validate or take appropriate measures for interaction with user to
   * confirm it is acceptable.
   *
   * You can call the {@link rpc.Server.simulateTransaction} method
   * directly first if you want to inspect estimated fees for a given
   * transaction in detail first, then re-assemble it manually or via
   * {@link rpc.assembleTransaction}.
   *
   * @param tx - the transaction to
   *    prepare. It should include exactly one operation, which must be one of
   *    {@link xdr.InvokeHostFunctionOp}, {@link xdr.ExtendFootprintTtlOp},
   *    or {@link xdr.RestoreFootprintOp}.
   *
   *    Any provided footprint will be overwritten. However, if your operation
   *    has existing auth entries, they will be preferred over ALL auth entries
   *    from the simulation. In other words, if you include auth entries, you
   *    don't care about the auth returned from the simulation. Other fields
   *    (footprint, etc.) will be filled as normal.
   * @returns A copy of the
   *    transaction with the expected authorizations (in the case of
   *    invocation), resources, and ledger footprints added. The transaction fee
   *    will also automatically be padded with the contract's minimum resource
   *    fees discovered from the simulation.
   * @throws    *    If simulation fails
   *
   * @see module:rpc.assembleTransaction
   * @see {@link https://developers.stellar.org/docs/data/rpc/api-reference/methods/simulateTransaction | simulateTransaction docs}
   *
   * @example
   * ```ts
   * const contractId = 'CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE';
   * const contract = new StellarSdk.Contract(contractId);
   *
   * // Right now, this is just the default fee for this example.
   * const fee = StellarSdk.BASE_FEE;
   * const transaction = new StellarSdk.TransactionBuilder(account, { fee })
   *   // Uncomment the following line to build transactions for the live network. Be
   *   // sure to also change the horizon hostname.
   *   //.setNetworkPassphrase(StellarSdk.Networks.PUBLIC)
   *   .setNetworkPassphrase(StellarSdk.Networks.FUTURENET)
   *   .setTimeout(30) // valid for the next 30s
   *   // Add an operation to call increment() on the contract
   *   .addOperation(contract.call("increment"))
   *   .build();
   *
   * const preparedTransaction = await server.prepareTransaction(transaction);
   *
   * // Sign this transaction with the secret key
   * // NOTE: signing is transaction is network specific. Test network transactions
   * // won't work in the public network. To switch networks, use the Network object
   * // as explained above (look for StellarSdk.Network).
   * const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecretKey);
   * preparedTransaction.sign(sourceKeypair);
   *
   * server.sendTransaction(transaction).then(result => {
   *   console.log("hash:", result.hash);
   *   console.log("status:", result.status);
   *   console.log("errorResultXdr:", result.errorResultXdr);
   * });
   * ```
   */
  async prepareTransaction(tx) {
    const simResponse = await this.simulateTransaction(tx);
    if (Api.isSimulationError(simResponse)) {
      throw new Error(simResponse.error);
    }
    return assembleTransaction(tx, simResponse).build();
  }
  /**
   * Submit a real transaction to the Stellar network.
   *
   * Unlike Horizon, RPC does not wait for transaction completion. It
   * simply validates the transaction and enqueues it. Clients should call
   * {@link rpc.Server.getTransaction} to learn about transaction
   * success/failure.
   *
   * @param transaction - to submit
   * @returns the
   *    transaction id, status, and any error if available
   *
   * @see {@link https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/operations-and-transactions | transaction docs}
   * @see {@link https://developers.stellar.org/docs/data/rpc/api-reference/methods/sendTransaction | sendTransaction docs}
   *
   * @example
   * ```ts
   * const contractId = 'CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE';
   * const contract = new StellarSdk.Contract(contractId);
   *
   * // Right now, this is just the default fee for this example.
   * const fee = StellarSdk.BASE_FEE;
   * const transaction = new StellarSdk.TransactionBuilder(account, { fee })
   *   // Uncomment the following line to build transactions for the live network. Be
   *   // sure to also change the horizon hostname.
   *   //.setNetworkPassphrase(StellarSdk.Networks.PUBLIC)
   *   .setNetworkPassphrase(StellarSdk.Networks.FUTURENET)
   *   .setTimeout(30) // valid for the next 30s
   *   // Add an operation to call increment() on the contract
   *   .addOperation(contract.call("increment"))
   *   .build();
   *
   * // Sign this transaction with the secret key
   * // NOTE: signing is transaction is network specific. Test network transactions
   * // won't work in the public network. To switch networks, use the Network object
   * // as explained above (look for StellarSdk.Network).
   * const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecretKey);
   * transaction.sign(sourceKeypair);
   *
   * server.sendTransaction(transaction).then((result) => {
   *   console.log("hash:", result.hash);
   *   console.log("status:", result.status);
   *   console.log("errorResultXdr:", result.errorResultXdr);
   * });
   * ```
   */
  async sendTransaction(transaction) {
    return this._sendTransaction(transaction).then(parseRawSendTransaction);
  }
  async _sendTransaction(transaction) {
    return postObject(
      this.httpClient,
      this.serverURL.toString(),
      "sendTransaction",
      {
        transaction: transaction.toXDR()
      }
    );
  }
  /**
   * Fund a new account using the network's Friendbot faucet, if any.
   *
   * @param address - The address or account instance that we
   *    want to create and fund with Friendbot
   * @param friendbotUrl - (optional) Optionally, an explicit address for
   *    friendbot (by default: this calls the Soroban RPC
   *    {@link rpc.Server.getNetwork | getNetwork} method to try to
   *    discover this network's Friendbot url).
   * @returns An {@link Account} object for the created
   *    account, or the existing account if it's already funded with the
   *    populated sequence number (note that the account will not be "topped
   *    off" if it already exists)
   * @throws If Friendbot is not configured on this network or request failure
   *
   * @see {@link https://developers.stellar.org/docs/learn/fundamentals/networks#friendbot | Friendbot docs}
   * @see {@link Friendbot.Api.Response}
   *
   * @deprecated Use {@link Server.fundAddress} instead, which supports both
   *    account (G...) and contract (C...) addresses.
   *
   * @example
   * ```ts
   * server
   *    .requestAirdrop("GBZC6Y2Y7Q3ZQ2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4")
   *    .then((accountCreated) => {
   *      console.log("accountCreated:", accountCreated);
   *    }).catch((error) => {
   *      console.error("error:", error);
   *    });
   * ```
   */
  async requestAirdrop(address, friendbotUrl) {
    const account = typeof address === "string" ? address : address.accountId();
    friendbotUrl = friendbotUrl || (await this.getNetwork()).friendbotUrl;
    if (!friendbotUrl) {
      throw new Error("No friendbot URL configured for current network");
    }
    try {
      const response = await this.httpClient.post(
        `${friendbotUrl}?addr=${encodeURIComponent(account)}`
      );
      let meta;
      if (!response.data.result_meta_xdr) {
        const txMeta = await this.getTransaction(response.data.hash);
        if (txMeta.status !== Api.GetTransactionStatus.SUCCESS) {
          throw new Error(`Funding account ${address} failed`);
        }
        meta = txMeta.resultMetaXdr;
      } else {
        meta = types.TransactionMeta.fromXDR(
          response.data.result_meta_xdr,
          "base64"
        );
      }
      const sequence = findCreatedAccountSequenceInTransactionMeta(meta);
      return new Account(account, sequence);
    } catch (error) {
      if (error.response?.status === 400) {
        if (error.response.data?.detail?.includes("createAccountAlreadyExist")) {
          return this.getAccount(account);
        }
      }
      throw error;
    }
  }
  /**
   * Fund an address using the network's Friendbot faucet, if any.
   *
   * This method supports both account (G...) and contract (C...) addresses.
   *
   * @param address - The address to fund. Can be either a Stellar
   *    account (G...) or contract (C...) address.
   * @param friendbotUrl - (optional) Optionally, an explicit Friendbot URL
   *    (by default: this calls the Stellar RPC
   *    {@link rpc.Server.getNetwork | getNetwork} method to try to
   *    discover this network's Friendbot url).
   * @returns The transaction
   *    response from the Friendbot funding transaction.
   * @throws If Friendbot is not configured on this network or the
   *    funding transaction fails.
   *
   * @see {@link https://developers.stellar.org/docs/learn/fundamentals/networks#friendbot | Friendbot docs}
   *
   * @example
   * ```ts
   * // Funding an account (G... address)
   * const tx = await server.fundAddress("GBZC6Y2Y7...");
   * console.log("Funded! Hash:", tx.txHash);
   * // If you need the Account object:
   * const account = await server.getAccount("GBZC6Y2Y7...");
   * ```
   *
   * @example
   * ```ts
   * // Funding a contract (C... address)
   * const tx = await server.fundAddress("CBZC6Y2Y7...");
   * console.log("Contract funded! Hash:", tx.txHash);
   * ```
   */
  async fundAddress(address, friendbotUrl) {
    if (!StrKey.isValidEd25519PublicKey(address) && !StrKey.isValidContract(address)) {
      throw new Error(
        `Invalid address: ${address}. Expected a Stellar account (G...) or contract (C...) address.`
      );
    }
    friendbotUrl = friendbotUrl || (await this.getNetwork()).friendbotUrl;
    if (!friendbotUrl) {
      throw new Error("No friendbot URL configured for current network");
    }
    try {
      const response = await this.httpClient.post(
        `${friendbotUrl}?addr=${encodeURIComponent(address)}`
      );
      const txResponse = await this.getTransaction(response.data.hash);
      if (txResponse.status !== Api.GetTransactionStatus.SUCCESS) {
        throw new Error(
          `Funding address ${address} failed: transaction status ${txResponse.status}`
        );
      }
      return txResponse;
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.detail ?? "Bad Request");
      }
      throw error;
    }
  }
  /**
   * Provides an analysis of the recent fee stats for regular and smart
   * contract operations.
   *
   * @returns the fee stats
   * @see https://developers.stellar.org/docs/data/rpc/api-reference/methods/getFeeStats
   */
  async getFeeStats() {
    return postObject(
      this.httpClient,
      this.serverURL.toString(),
      "getFeeStats"
    );
  }
  /**
   * Provides information about the current version details of the Soroban RPC and captive-core
   *
   * @returns the version info
   * @see https://developers.stellar.org/docs/data/rpc/api-reference/methods/getVersionInfo
   */
  async getVersionInfo() {
    return postObject(
      this.httpClient,
      this.serverURL.toString(),
      "getVersionInfo"
    );
  }
  /**
   * Returns a contract's balance of a particular SAC asset, if any.
   *
   * This is a convenience wrapper around {@link Server.getLedgerEntries}.
   *
   * @param address - the contract (string `C...`) whose balance of
   *    `sac` you want to know
   * @param sac - the built-in SAC token (e.g. `USDC:GABC...`) that
   *    you are querying from the given `contract`.
   * @param networkPassphrase - (optional) optionally, the network passphrase to
   *    which this token applies. If omitted, a request about network
   *    information will be made (see {@link getNetwork}), since contract IDs
   *    for assets are specific to a network. You can refer to {@link Networks}
   *    for a list of built-in passphrases, e.g., `Networks.TESTNET`.
   *
   * @returns , which will contain the balance
   *    entry details if and only if the request returned a valid balance ledger
   *    entry. If it doesn't, the `balanceEntry` field will not exist.
   *
   * @throws If `address` is not a valid contract ID (C...).
   *
   * @see getLedgerEntries
   * @see https://developers.stellar.org/docs/tokens/stellar-asset-contract
   *
   * @deprecated Use {@link getAssetBalance}, instead
   * @example
   * ```ts
   * // assume `address` is some contract or account with an XLM balance
   * // assume server is an instantiated `Server` instance.
   * const entry = (await server.getSACBalance(
   *   new Address(address),
   *   Asset.native(),
   *   Networks.PUBLIC
   * ));
   *
   * // assumes BigInt support:
   * console.log(
   *   entry.balanceEntry ?
   *   BigInt(entry.balanceEntry.amount) :
   *   "Address has no XLM");
   * ```
   */
  async getSACBalance(address, sac, networkPassphrase) {
    const addressString = address instanceof Address ? address.toString() : address;
    if (!StrKey.isValidContract(addressString)) {
      throw new TypeError(`expected contract ID, got ${addressString}`);
    }
    const passphrase = networkPassphrase ?? await this.getNetwork().then((n) => n.passphrase);
    const sacId = sac.contractId(passphrase);
    const key = nativeToScVal(["Balance", addressString], {
      type: ["symbol", "address"]
    });
    const ledgerKey = types.LedgerKey.contractData(
      new types.LedgerKeyContractData({
        contract: new Address(sacId).toScAddress(),
        durability: types.ContractDataDurability.persistent(),
        key
      })
    );
    const response = await this.getLedgerEntries(ledgerKey);
    if (response.entries.length === 0) {
      return { latestLedger: response.latestLedger };
    }
    const { lastModifiedLedgerSeq, liveUntilLedgerSeq, val } = response.entries[0];
    if (val.switch().value !== types.LedgerEntryType.contractData().value) {
      return { latestLedger: response.latestLedger };
    }
    const entry = scValToNative(val.contractData().val());
    return {
      latestLedger: response.latestLedger,
      balanceEntry: {
        liveUntilLedgerSeq,
        lastModifiedLedgerSeq,
        amount: entry.amount.toString(),
        authorized: entry.authorized,
        clawback: entry.clawback
      }
    };
  }
  /**
   * Fetch a detailed list of ledgers starting from a specified point.
   *
   * Returns ledger data with support for pagination as long as the requested
   * pages fall within the history retention of the RPC provider.
   *
   * @param request - The request parameters for fetching ledgers. {@link Api.GetLedgersRequest}
   * @returns A promise that resolves to the
   *    ledgers response containing an array of ledger data and pagination info. {@link Api.GetLedgersResponse}
   *
   * @throws If startLedger is less than the oldest ledger stored in this
   *    node, or greater than the latest ledger seen by this node.
   *
   * @see {@link https://developers.stellar.org/docs/data/rpc/api-reference/methods/getLedgers | getLedgers docs}
   *
   * @example
   * ```ts
   * // Fetch ledgers starting from a specific sequence number
   * server.getLedgers({
   *   startLedger: 36233,
   *   pagination: {
   *     limit: 10
   *   }
   * }).then((response) => {
   *   console.log("Ledgers:", response.ledgers);
   *   console.log("Latest Ledger:", response.latestLedger);
   *   console.log("Cursor:", response.cursor);
   * });
   * ```
   *
   * @example
   * ```ts
   * // Paginate through ledgers using cursor
   * const firstPage = await server.getLedgers({
   *   startLedger: 36233,
   *   pagination: {
   *     limit: 5
   *   }
   * });
   *
   * const nextPage = await server.getLedgers({
   *   pagination: {
   *     cursor: firstPage.cursor,
   *     limit: 5
   *   }
   * });
   * ```
   */
  async getLedgers(request2) {
    return this._getLedgers(request2).then((raw) => {
      const result = {
        ledgers: (raw.ledgers || []).map(parseRawLedger),
        latestLedger: raw.latestLedger,
        latestLedgerCloseTime: raw.latestLedgerCloseTime,
        oldestLedger: raw.oldestLedger,
        oldestLedgerCloseTime: raw.oldestLedgerCloseTime,
        cursor: raw.cursor
      };
      return result;
    });
  }
  async _getLedgers(request2) {
    return postObject(
      this.httpClient,
      this.serverURL.toString(),
      "getLedgers",
      request2
    );
  }
};

// node_modules/@stellar/stellar-sdk/lib/esm/base/network.js
var Networks = /* @__PURE__ */ ((Networks2) => {
  Networks2["PUBLIC"] = "Public Global Stellar Network ; September 2015";
  Networks2["TESTNET"] = "Test SDF Network ; September 2015";
  Networks2["FUTURENET"] = "Test SDF Future Network ; October 2022";
  Networks2["SANDBOX"] = "Local Sandbox Stellar Network ; September 2022";
  Networks2["STANDALONE"] = "Standalone Network ; February 2017";
  return Networks2;
})(Networks || {});

// deploy_xlm_epoch.ts
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var import_child_process = require("child_process");
var RPC_URL = process.env.RPC_URL || "https://soroban-testnet.stellar.org";
var NETWORK_PASSPHRASE = process.env.NETWORK_PASSPHRASE || Networks.TESTNET;
var DEPLOYMENTS_FILE = path.resolve(__dirname, "deployments.testnet.json");
var XLM_NATIVE_SAC = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
var deployments = {};
if (fs.existsSync(DEPLOYMENTS_FILE)) {
  deployments = JSON.parse(fs.readFileSync(DEPLOYMENTS_FILE, "utf-8"));
} else {
  throw new Error("deployments.testnet.json not found! Must have initial deployment and WASM hashes.");
}
function saveDeployments() {
  fs.writeFileSync(DEPLOYMENTS_FILE, JSON.stringify(deployments, null, 2));
}
function runCmd(cmd, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Executing: ${cmd}`);
      const result = (0, import_child_process.execSync)(cmd, { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] }).trim();
      return result;
    } catch (e) {
      const stderr = e.stderr ? e.stderr.toString() : "";
      console.warn(`Command failed: ${e.message}
Stderr: ${stderr}`);
      if (i === retries - 1) throw e;
      const sleepTime = Math.pow(2, i) * 2e3;
      console.log(`Sleeping for ${sleepTime}ms...`);
      (0, import_child_process.execSync)(`sleep ${sleepTime / 1e3}`);
    }
  }
  return "";
}
function runCmdNoFail(cmd) {
  try {
    return (0, import_child_process.execSync)(cmd, { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch (e) {
    return e.stderr ? e.stderr.toString() : e.message;
  }
}
async function deployXlmEpoch() {
  const KEYS_FILE = path.resolve(__dirname, "testnet_keys.json");
  if (!fs.existsSync(KEYS_FILE)) {
    throw new Error("testnet_keys.json not found!");
  }
  const keys = JSON.parse(fs.readFileSync(KEYS_FILE, "utf-8"));
  const admin = Keypair.fromSecret(keys.admin_secret);
  console.log(`Using Admin: ${admin.publicKey()}`);
  const server = new rpc_exports.Server(RPC_URL, { allowHttp: true });
  if (!deployments["factory"]) {
    throw new Error("Factory contract not found in deployments!");
  }
  console.log(`Setting underlying token to Native XLM SAC: ${XLM_NATIVE_SAC}`);
  deployments["underlying_token"] = XLM_NATIVE_SAC;
  saveDeployments();
  const contractsToDeploy = [
    "sy_wrapper",
    "vault",
    "tokenizer",
    "pt_token",
    "yt_token",
    "marketplace",
    "intent_engine",
    "rollover"
  ];
  console.log("Deploying new instances for XLM epoch...");
  for (const name of contractsToDeploy) {
    const wasmId = deployments[`${name}_wasm`];
    if (!wasmId) {
      throw new Error(`WASM hash not found for ${name}`);
    }
    console.log(`Deploying ${name} from wasm hash ${wasmId}...`);
    const contractId = runCmd(`stellar contract deploy --wasm-hash ${wasmId} --source ${admin.secret()} --rpc-url ${RPC_URL} --network-passphrase "${NETWORK_PASSPHRASE}"`);
    deployments[name] = contractId;
    saveDeployments();
    console.log(`${name} deployed -> ${contractId}`);
  }
  console.log("Invoking Factory.deploy_epoch()...");
  const ledger = await server.getLatestLedger();
  const maturity_ledger = ledger.sequence + 5e4;
  const grace_period_ledgers = 1e3;
  const keeper = admin.publicKey();
  const paramsJson = JSON.stringify({
    maturity_ledger,
    underlying_token: deployments.underlying_token,
    sy_wrapper: deployments.sy_wrapper,
    vault: deployments.vault,
    pt_token: deployments.pt_token,
    yt_token: deployments.yt_token,
    tokenizer: deployments.tokenizer,
    marketplace: deployments.marketplace,
    intent_engine: deployments.intent_engine,
    rollover_engine: deployments.rollover,
    keeper,
    grace_period_ledgers
  });
  const invokeArgs = [
    `--id ${deployments.factory}`,
    `--source ${admin.secret()}`,
    `--rpc-url ${RPC_URL}`,
    `--network-passphrase "${NETWORK_PASSPHRASE}"`,
    `--`,
    `deploy_epoch`,
    `--params '${paramsJson}'`
  ].join(" ");
  const out = runCmdNoFail(`stellar contract invoke ${invokeArgs}`);
  if (out.includes("AlreadyInitialized")) {
    console.log("Epoch already deployed.");
  } else if (!out.includes("error") && out.trim() !== "") {
    console.log(`Epoch Deployed! Epoch ID: ${out.trim()}`);
  } else {
    console.warn(`Epoch deploy failed: ${out}`);
  }
  console.log("Generating TypeScript Bindings for new XLM Epoch...");
  for (const name of contractsToDeploy) {
    runCmd(`stellar contract bindings typescript --id ${deployments[name]} --network testnet --output-dir ../packages/bindings/${name} --overwrite`);
  }
  runCmd(`stellar contract bindings typescript --id ${deployments.factory} --network testnet --output-dir ../packages/bindings/factory --overwrite`);
  console.log("XLM Epoch Deployment and Wiring Complete!");
}
deployXlmEpoch().catch((err2) => {
  console.error("XLM Deployment script failed:", err2);
  process.exit(1);
});
/*! Bundled license information:

@noble/ed25519/index.js:
  (*! noble-ed25519 - MIT License (c) 2019 Paul Miller (paulmillr.com) *)
*/
