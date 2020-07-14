import { websocket_transport } from './snippets/libp2p-wasm-ext-70c268b265aa8c56/src/websockets.js';

let wasm;

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let WASM_VECTOR_LEN = 0;

let cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1 };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) wasm.__wbindgen_export_2.get(dtor)(a, state.b);
            else state.a = a;
        }
    };
    real.original = state;
    return real;
}
function __wbg_adapter_24(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h313d1d43044a597b(arg0, arg1);
}

function __wbg_adapter_27(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h2da1313579f6012f(arg0, arg1);
}

function __wbg_adapter_30(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__he89103dd1482972e(arg0, arg1, addHeapObject(arg2));
}

let stack_pointer = 32;

function addBorrowedObject(obj) {
    if (stack_pointer == 1) throw new Error('out of js stack');
    heap[--stack_pointer] = obj;
    return stack_pointer;
}
function __wbg_adapter_33(arg0, arg1, arg2) {
    try {
        wasm._dyn_core__ops__function__FnMut___A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hca2c79b9bde34ba2(arg0, arg1, addBorrowedObject(arg2));
    } finally {
        heap[stack_pointer++] = undefined;
    }
}

function __wbg_adapter_36(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h44997e42a2a65230(arg0, arg1);
}

/**
* Starts the client.
* @param {string} chain_spec
* @param {string} log_level
* @returns {any}
*/
export function start_client(chain_spec, log_level) {
    var ptr0 = passStringToWasm0(chain_spec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    var ptr1 = passStringToWasm0(log_level, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    var ret = wasm.start_client(ptr0, len0, ptr1, len1);
    return takeObject(ret);
}

function handleError(e) {
    wasm.__wbindgen_exn_store(addHeapObject(e));
}

function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachegetUint32Memory0 = null;
function getUint32Memory0() {
    if (cachegetUint32Memory0 === null || cachegetUint32Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachegetUint32Memory0;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4);
    const mem = getUint32Memory0();
    for (let i = 0; i < array.length; i++) {
        mem[ptr / 4 + i] = addHeapObject(array[i]);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}
function __wbg_adapter_184(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures__invoke2_mut__h48eace5a5a1d1747(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

/**
* A running client.
*/
export class Client {

    static __wrap(ptr) {
        const obj = Object.create(Client.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_client_free(ptr);
    }
    /**
    * Allows starting an RPC request. Returns a `Promise` containing the result of that request.
    * @param {string} rpc
    * @returns {Promise<any>}
    */
    rpcSend(rpc) {
        var ptr0 = passStringToWasm0(rpc, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.client_rpcSend(this.ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * Subscribes to an RPC pubsub endpoint.
    * @param {string} rpc
    * @param {Function} callback
    */
    rpcSubscribe(rpc, callback) {
        var ptr0 = passStringToWasm0(rpc, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.client_rpcSubscribe(this.ptr, ptr0, len0, addHeapObject(callback));
    }
}

async function load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {

        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {

        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

async function init(input) {
    if (typeof input === 'undefined') {
        input = import.meta.url.replace(/\.js$/, '_bg.wasm');
    }
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
        const obj = takeObject(arg0).original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        var ret = false;
        return ret;
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        var ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_client_new = function(arg0) {
        var ret = Client.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_cb_forget = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbg_new_59cb74e423758ede = function() {
        var ret = new Error();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_558ba5917b466edd = function(arg0, arg1) {
        var ret = getObject(arg1).stack;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_error_4bb6c2a97407129a = function(arg0, arg1) {
        try {
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(arg0, arg1);
        }
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        var ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_listenon_29b270c00f11bb1d = function(arg0, arg1, arg2) {
        try {
            var ret = getObject(arg0).listen_on(getStringFromWasm0(arg1, arg2));
            return addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_dial_ce540d0025a8c26c = function(arg0, arg1, arg2) {
        try {
            var ret = getObject(arg0).dial(getStringFromWasm0(arg1, arg2));
            return addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_read_91c0d30ec3d52352 = function(arg0) {
        var ret = getObject(arg0).read;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_close_78c9b15ff92a3e07 = function(arg0) {
        getObject(arg0).close();
    };
    imports.wbg.__wbg_newaddrs_6532534ae49e2942 = function(arg0, arg1) {
        var ret = getObject(arg1).new_addrs;
        var ptr0 = isLikeNone(ret) ? 0 : passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_newconnections_26d3027da3bc3d34 = function(arg0, arg1) {
        var ret = getObject(arg1).new_connections;
        var ptr0 = isLikeNone(ret) ? 0 : passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_localaddr_2c3bc298a97f0d31 = function(arg0, arg1) {
        var ret = getObject(arg1).local_addr;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_observedaddr_3bb9aac327c718a8 = function(arg0, arg1) {
        var ret = getObject(arg1).observed_addr;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_connection_fc27a4cc12bbb95c = function(arg0) {
        var ret = getObject(arg0).connection;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_expiredaddrs_6df40054e2545c02 = function(arg0, arg1) {
        var ret = getObject(arg1).expired_addrs;
        var ptr0 = isLikeNone(ret) ? 0 : passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbindgen_is_null = function(arg0) {
        var ret = getObject(arg0) === null;
        return ret;
    };
    imports.wbg.__wbg_write_c737a4dd2daa456c = function(arg0, arg1, arg2) {
        try {
            var ret = getObject(arg0).write(getArrayU8FromWasm0(arg1, arg2));
            return addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_shutdown_737963eaf38872f4 = function(arg0) {
        try {
            getObject(arg0).shutdown();
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_websockettransport_16675675a626eccf = function() {
        var ret = websocket_transport();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_Window_f826a1dec163bacb = function(arg0) {
        var ret = getObject(arg0).Window;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        var ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbg_WorkerGlobalScope_967d186155183d38 = function(arg0) {
        var ret = getObject(arg0).WorkerGlobalScope;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_Window_a633dbe0900c728a = function(arg0) {
        var ret = getObject(arg0) instanceof Window;
        return ret;
    };
    imports.wbg.__wbg_performance_cc98652048194dbe = function(arg0) {
        var ret = getObject(arg0).performance;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_indexedDB_786fa5cffcec3d70 = function(arg0) {
        try {
            var ret = getObject(arg0).indexedDB;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_clearTimeout_0a1052783da2e81d = function(arg0, arg1) {
        getObject(arg0).clearTimeout(arg1);
    };
    imports.wbg.__wbg_setTimeout_8a3a29e4f2326809 = function(arg0, arg1, arg2) {
        try {
            var ret = getObject(arg0).setTimeout(getObject(arg1), arg2);
            return ret;
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_debug_7020dcb48edf105b = function(arg0) {
        console.debug(getObject(arg0));
    };
    imports.wbg.__wbg_error_b23efba5bfb5cec5 = function(arg0) {
        console.error(getObject(arg0));
    };
    imports.wbg.__wbg_info_8ce99578d0b91a35 = function(arg0) {
        console.info(getObject(arg0));
    };
    imports.wbg.__wbg_log_c180b836187d3c94 = function(arg0) {
        console.log(getObject(arg0));
    };
    imports.wbg.__wbg_warn_942f927afebcc748 = function(arg0) {
        console.warn(getObject(arg0));
    };
    imports.wbg.__wbg_target_7c8691623acab2b6 = function(arg0) {
        var ret = getObject(arg0).target;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_value_ab7e0864921a0249 = function(arg0) {
        try {
            var ret = getObject(arg0).value;
            return addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_key_98f9c3510a871aab = function(arg0) {
        try {
            var ret = getObject(arg0).key;
            return addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_continue_c5d6858486a49ae0 = function(arg0) {
        try {
            getObject(arg0).continue();
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_oncomplete_a472af4d68085f4e = function(arg0, arg1) {
        getObject(arg0).oncomplete = getObject(arg1);
    };
    imports.wbg.__wbg_onerror_18d4baa796b3c83c = function(arg0, arg1) {
        getObject(arg0).onerror = getObject(arg1);
    };
    imports.wbg.__wbg_objectStore_30c5fb22a544cdc0 = function(arg0, arg1, arg2) {
        try {
            var ret = getObject(arg0).objectStore(getStringFromWasm0(arg1, arg2));
            return addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_length_96a4ad170ac120a3 = function(arg0) {
        var ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_clearTimeout_ef9b4e7064304f19 = function(arg0, arg1) {
        getObject(arg0).clearTimeout(arg1);
    };
    imports.wbg.__wbg_setTimeout_1bb7442307efefb2 = function(arg0, arg1, arg2) {
        try {
            var ret = getObject(arg0).setTimeout(getObject(arg1), arg2);
            return ret;
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_delete_32516d6d2da36e5b = function(arg0, arg1) {
        try {
            var ret = getObject(arg0).delete(getObject(arg1));
            return addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_openCursor_03070b344806930c = function(arg0) {
        try {
            var ret = getObject(arg0).openCursor();
            return addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_put_f3607afa489e09e5 = function(arg0, arg1, arg2) {
        try {
            var ret = getObject(arg0).put(getObject(arg1), getObject(arg2));
            return addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_instanceof_IdbDatabase_56eba0d2b056531a = function(arg0) {
        var ret = getObject(arg0) instanceof IDBDatabase;
        return ret;
    };
    imports.wbg.__wbg_version_e37fbc7822b8af91 = function(arg0) {
        var ret = getObject(arg0).version;
        return ret;
    };
    imports.wbg.__wbg_objectStoreNames_68bc3ddee96dca07 = function(arg0) {
        var ret = getObject(arg0).objectStoreNames;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_close_bc5d600e55105ed4 = function(arg0) {
        getObject(arg0).close();
    };
    imports.wbg.__wbg_createObjectStore_7c0df7de88384a54 = function(arg0, arg1, arg2) {
        try {
            var ret = getObject(arg0).createObjectStore(getStringFromWasm0(arg1, arg2));
            return addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_transaction_b00142afde019410 = function(arg0, arg1, arg2) {
        try {
            var ret = getObject(arg0).transaction(getStringFromWasm0(arg1, arg2));
            return addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_transaction_961e4f1085d36649 = function(arg0, arg1, arg2) {
        try {
            var ret = getObject(arg0).transaction(getObject(arg1), takeObject(arg2));
            return addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_open_11fae9bba90577c8 = function(arg0, arg1, arg2, arg3) {
        try {
            var ret = getObject(arg0).open(getStringFromWasm0(arg1, arg2), arg3 >>> 0);
            return addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_open_6998f972d161aa98 = function(arg0, arg1, arg2) {
        try {
            var ret = getObject(arg0).open(getStringFromWasm0(arg1, arg2));
            return addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_onupgradeneeded_d8d555253ef9abd3 = function(arg0, arg1) {
        getObject(arg0).onupgradeneeded = getObject(arg1);
    };
    imports.wbg.__wbg_now_ce4a6a89baf241c9 = function(arg0) {
        var ret = getObject(arg0).now();
        return ret;
    };
    imports.wbg.__wbg_instanceof_IdbRequest_06f62bd63408aafb = function(arg0) {
        var ret = getObject(arg0) instanceof IDBRequest;
        return ret;
    };
    imports.wbg.__wbg_result_f673e649c3ed4aa6 = function(arg0) {
        try {
            var ret = getObject(arg0).result;
            return addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_onsuccess_63414f423ba8e36c = function(arg0, arg1) {
        getObject(arg0).onsuccess = getObject(arg1);
    };
    imports.wbg.__wbg_next_c08bf57a239475c3 = function(arg0) {
        try {
            var ret = getObject(arg0).next();
            return addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_done_e784c64062606540 = function(arg0) {
        var ret = getObject(arg0).done;
        return ret;
    };
    imports.wbg.__wbg_value_11f53ed6202a1367 = function(arg0) {
        var ret = getObject(arg0).value;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_call_804d3ad7e8acd4d5 = function(arg0, arg1) {
        try {
            var ret = getObject(arg0).call(getObject(arg1));
            return addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_new_ec28d6ba821801cb = function() {
        var ret = new Array();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_push_ffaa2df7422d3b4c = function(arg0, arg1) {
        var ret = getObject(arg0).push(getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_byteLength_23cbcb86d9831911 = function(arg0) {
        var ret = getObject(arg0).byteLength;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Error_38fe748d6a3e7f96 = function(arg0) {
        var ret = getObject(arg0) instanceof Error;
        return ret;
    };
    imports.wbg.__wbg_message_2867dbc381d4281d = function(arg0) {
        var ret = getObject(arg0).message;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_name_0a313043456d3ac9 = function(arg0) {
        var ret = getObject(arg0).name;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newnoargs_ebdc90c3d1e4e55d = function(arg0, arg1) {
        var ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_call_1ad0eb4a7ab279eb = function(arg0, arg1, arg2) {
        try {
            var ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
            return addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_getTime_2101de8de4528431 = function(arg0) {
        var ret = getObject(arg0).getTime();
        return ret;
    };
    imports.wbg.__wbg_getTimezoneOffset_63759850d5e93deb = function(arg0) {
        var ret = getObject(arg0).getTimezoneOffset();
        return ret;
    };
    imports.wbg.__wbg_new0_1d54bbc12959ee65 = function() {
        var ret = new Date();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_now_baf1a029473d526d = function() {
        var ret = Date.now();
        return ret;
    };
    imports.wbg.__wbg_instanceof_Object_eff62166ff6be605 = function(arg0) {
        var ret = getObject(arg0) instanceof Object;
        return ret;
    };
    imports.wbg.__wbg_toString_2a876371b7e4d365 = function(arg0) {
        var ret = getObject(arg0).toString();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_1bf1b0dbcaa9ee96 = function(arg0, arg1) {
        try {
            var state0 = {a: arg0, b: arg1};
            var cb0 = (arg0, arg1) => {
                const a = state0.a;
                state0.a = 0;
                try {
                    return __wbg_adapter_184(a, state0.b, arg0, arg1);
                } finally {
                    state0.a = a;
                }
            };
            var ret = new Promise(cb0);
            return addHeapObject(ret);
        } finally {
            state0.a = state0.b = 0;
        }
    };
    imports.wbg.__wbg_resolve_3e5970e9c931a3c2 = function(arg0) {
        var ret = Promise.resolve(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_d797310661d9e275 = function(arg0, arg1) {
        var ret = getObject(arg0).then(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_e37e0b9ef0995585 = function(arg0, arg1, arg2) {
        var ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_globalThis_48a5e9494e623f26 = function() {
        try {
            var ret = globalThis.globalThis;
            return addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_self_25067cb019cade42 = function() {
        try {
            var ret = self.self;
            return addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_window_9e80200b35aa30f8 = function() {
        try {
            var ret = window.window;
            return addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_global_7583a634265a91fc = function() {
        try {
            var ret = global.global;
            return addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_buffer_f897a8d316863411 = function(arg0) {
        var ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_284676320876299d = function(arg0, arg1, arg2) {
        var ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_length_b7dc6aed3ca09be1 = function(arg0) {
        var ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_new_da17c07b1fbb4a8b = function(arg0) {
        var ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_4a8545284001c06f = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_byteLength_5f1abb9d0f73f112 = function(arg0) {
        var ret = getObject(arg0).byteLength;
        return ret;
    };
    imports.wbg.__wbg_self_1b7a39e3a92c949c = function() {
        try {
            var ret = self.self;
            return addHeapObject(ret);
        } catch (e) {
            handleError(e)
        }
    };
    imports.wbg.__wbg_require_604837428532a733 = function(arg0, arg1) {
        var ret = require(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_crypto_968f1772287e2df0 = function(arg0) {
        var ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getRandomValues_a3d34b4fee3c2869 = function(arg0) {
        var ret = getObject(arg0).getRandomValues;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getRandomValues_f5e14ab7ac8e995d = function(arg0, arg1, arg2) {
        getObject(arg0).getRandomValues(getArrayU8FromWasm0(arg1, arg2));
    };
    imports.wbg.__wbg_randomFillSync_d5bd2d655fdf256a = function(arg0, arg1, arg2) {
        getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
    };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        var ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        var ret = debugString(getObject(arg1));
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_memory = function() {
        var ret = wasm.memory;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper17381 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 6634, __wbg_adapter_27);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper9259 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 2994, __wbg_adapter_33);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper16720 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 6338, __wbg_adapter_30);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper9260 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 2994, __wbg_adapter_36);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper17661 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 6749, __wbg_adapter_24);
        return addHeapObject(ret);
    };

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    const { instance, module } = await load(await input, imports);

    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;

    return wasm;
}

export default init;

