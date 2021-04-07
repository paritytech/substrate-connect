!function(){var t="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:{};function r(t,r,e){Object.defineProperty(t,r,{get:e,enumerable:!0})}var e=t.parcelRequire315c,n={},o={};function i(){if(i._executed)return;i._executed=!0;var n,o,f={},u=f={};function s(){throw new Error("setTimeout has not been defined")}function a(){throw new Error("clearTimeout has not been defined")}function h(t){if(n===setTimeout)return setTimeout(t,0);if((n===s||!n)&&setTimeout)return n=setTimeout,setTimeout(t,0);try{return n(t,0)}catch(r){try{return n.call(null,t,0)}catch(r){return n.call(this,t,0)}}}!function(){try{n="function"==typeof setTimeout?setTimeout:s}catch(t){n=s}try{o="function"==typeof clearTimeout?clearTimeout:a}catch(t){o=a}}();var c,p=[],l=!1,y=-1;function g(){l&&c&&(l=!1,c.length?p=c.concat(p):y=-1,p.length&&w())}function w(){if(!l){var t=h(g);l=!0;for(var r=p.length;r;){for(c=p,p=[];++y<r;)c&&c[y].run();y=-1,r=p.length}c=null,l=!1,function(t){if(o===clearTimeout)return clearTimeout(t);if((o===a||!o)&&clearTimeout)return o=clearTimeout,clearTimeout(t);try{o(t)}catch(r){try{return o.call(null,t)}catch(r){return o.call(this,t)}}}(t)}}function d(t,r){this.fun=t,this.array=r}function v(){}u.nextTick=function(t){var r=new Array(arguments.length-1);if(arguments.length>1)for(var e=1;e<arguments.length;e++)r[e-1]=arguments[e];p.push(new d(t,r)),1!==p.length||l||h(w)},d.prototype.run=function(){this.fun.apply(null,this.array)},u.title="browser",u.browser=!0,u.env={},u.argv=[],u.version="",u.versions={},u.on=v,u.addListener=v,u.once=v,u.off=v,u.removeListener=v,u.removeAllListeners=v,u.emit=v,u.prependListener=v,u.prependOnceListener=v,u.listeners=function(t){return[]},u.binding=function(t){throw new Error("process.binding is not supported")},u.cwd=function(){return"/"},u.chdir=function(t){throw new Error("process.chdir is not supported")},u.umask=function(){return 0};var m={},b={},E=function(t){var r=S(t),e=r[0],n=r[1];return 3*(e+n)/4-n};b.byteLength=E;var A=function(t){var r,e,n=S(t),o=n[0],i=n[1],f=new L(function(t,r,e){return 3*(r+e)/4-e}(0,o,i)),u=0,s=i>0?o-4:o;for(e=0;e<s;e+=4)r=T[t.charCodeAt(e)]<<18|T[t.charCodeAt(e+1)]<<12|T[t.charCodeAt(e+2)]<<6|T[t.charCodeAt(e+3)],f[u++]=r>>16&255,f[u++]=r>>8&255,f[u++]=255&r;2===i&&(r=T[t.charCodeAt(e)]<<2|T[t.charCodeAt(e+1)]>>4,f[u++]=255&r);1===i&&(r=T[t.charCodeAt(e)]<<10|T[t.charCodeAt(e+1)]<<4|T[t.charCodeAt(e+2)]>>2,f[u++]=r>>8&255,f[u++]=255&r);return f};b.toByteArray=A;var B=function(t){for(var r,e=t.length,n=e%3,o=[],i=16383,f=0,u=e-n;f<u;f+=i)o.push(C(t,f,f+i>u?u:f+i));1===n?(r=t[e-1],o.push(U[r>>2]+U[r<<4&63]+"==")):2===n&&(r=(t[e-2]<<8)+t[e-1],o.push(U[r>>10]+U[r>>4&63]+U[r<<2&63]+"="));return o.join("")};b.fromByteArray=B;for(var U=[],T=[],L="undefined"!=typeof Uint8Array?Uint8Array:Array,O="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",I=0,R=O.length;I<R;++I)U[I]=O[I],T[O.charCodeAt(I)]=I;function S(t){var r=t.length;if(r%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var e=t.indexOf("=");return-1===e&&(e=r),[e,e===r?0:4-e%4]}function C(t,r,e){for(var n,o,i=[],f=r;f<e;f+=3)n=(t[f]<<16&16711680)+(t[f+1]<<8&65280)+(255&t[f+2]),i.push(U[(o=n)>>18&63]+U[o>>12&63]+U[o>>6&63]+U[63&o]);return i.join("")}T["-".charCodeAt(0)]=62,T["_".charCodeAt(0)]=63;var M=function(t,r,e,n,o){var i,f,u=8*o-n-1,s=(1<<u)-1,a=s>>1,h=-7,c=e?o-1:0,p=e?-1:1,l=t[r+c];for(c+=p,i=l&(1<<-h)-1,l>>=-h,h+=u;h>0;i=256*i+t[r+c],c+=p,h-=8);for(f=i&(1<<-h)-1,i>>=-h,h+=n;h>0;f=256*f+t[r+c],c+=p,h-=8);if(0===i)i=1-a;else{if(i===s)return f?NaN:1/0*(l?-1:1);f+=Math.pow(2,n),i-=a}return(l?-1:1)*f*Math.pow(2,i-n)},x=function(t,r,e,n,o,i){var f,u,s,a=8*i-o-1,h=(1<<a)-1,c=h>>1,p=23===o?Math.pow(2,-24)-Math.pow(2,-77):0,l=n?0:i-1,y=n?1:-1,g=r<0||0===r&&1/r<0?1:0;for(r=Math.abs(r),isNaN(r)||r===1/0?(u=isNaN(r)?1:0,f=h):(f=Math.floor(Math.log(r)/Math.LN2),r*(s=Math.pow(2,-f))<1&&(f--,s*=2),(r+=f+c>=1?p/s:p*Math.pow(2,1-c))*s>=2&&(f++,s/=2),f+c>=h?(u=0,f=h):f+c>=1?(u=(r*s-1)*Math.pow(2,o),f+=c):(u=r*Math.pow(2,c-1)*Math.pow(2,o),f=0));o>=8;t[e+l]=255&u,l+=y,u/=256,o-=8);for(f=f<<o|u,a+=o;a>0;t[e+l]=255&f,l+=y,f/=256,a-=8);t[e+l-y]|=128*g},k="function"==typeof Symbol&&"function"==typeof Symbol.for?Symbol.for("nodejs.util.inspect.custom"):null,P=F;m.Buffer=P;var j=function(t){+t!=t&&(t=0);return F.alloc(+t)};m.SlowBuffer=j;m.INSPECT_MAX_BYTES=50;var N=2147483647;function _(t){if(t>N)throw new RangeError('The value "'+t+'" is invalid for option "size"');var r=new Uint8Array(t);return Object.setPrototypeOf(r,F.prototype),r}function F(t,r,e){if("number"==typeof t){if("string"==typeof r)throw new TypeError('The "string" argument must be of type string. Received type number');return D(t)}return q(t,r,e)}function q(t,r,e){if("string"==typeof t)return function(t,r){"string"==typeof r&&""!==r||(r="utf8");if(!F.isEncoding(r))throw new TypeError("Unknown encoding: "+r);var e=0|Y(t,r),n=_(e),o=n.write(t,r);o!==e&&(n=n.slice(0,o));return n}(t,r);if(ArrayBuffer.isView(t))return function(t){if(vt(t,Uint8Array)){var r=new Uint8Array(t);return J(r.buffer,r.byteOffset,r.byteLength)}return W(t)}(t);if(null==t)throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof t);if(vt(t,ArrayBuffer)||t&&vt(t.buffer,ArrayBuffer))return J(t,r,e);if("undefined"!=typeof SharedArrayBuffer&&(vt(t,SharedArrayBuffer)||t&&vt(t.buffer,SharedArrayBuffer)))return J(t,r,e);if("number"==typeof t)throw new TypeError('The "value" argument must not be of type number. Received type number');var n=t.valueOf&&t.valueOf();if(null!=n&&n!==t)return F.from(n,r,e);var o=function(t){if(F.isBuffer(t)){var r=0|V(t.length),e=_(r);return 0===e.length||t.copy(e,0,0,r),e}if(void 0!==t.length)return"number"!=typeof t.length||mt(t.length)?_(0):W(t);if("Buffer"===t.type&&Array.isArray(t.data))return W(t.data)}(t);if(o)return o;if("undefined"!=typeof Symbol&&null!=Symbol.toPrimitive&&"function"==typeof t[Symbol.toPrimitive])return F.from(t[Symbol.toPrimitive]("string"),r,e);throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof t)}function z(t){if("number"!=typeof t)throw new TypeError('"size" argument must be of type number');if(t<0)throw new RangeError('The value "'+t+'" is invalid for option "size"')}function D(t){return z(t),_(t<0?0:0|V(t))}function W(t){for(var r=t.length<0?0:0|V(t.length),e=_(r),n=0;n<r;n+=1)e[n]=255&t[n];return e}function J(t,r,e){if(r<0||t.byteLength<r)throw new RangeError('"offset" is outside of buffer bounds');if(t.byteLength<r+(e||0))throw new RangeError('"length" is outside of buffer bounds');var n;return n=void 0===r&&void 0===e?new Uint8Array(t):void 0===e?new Uint8Array(t,r):new Uint8Array(t,r,e),Object.setPrototypeOf(n,F.prototype),n}function V(t){if(t>=N)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+N.toString(16)+" bytes");return 0|t}function Y(t,r){if(F.isBuffer(t))return t.length;if(ArrayBuffer.isView(t)||vt(t,ArrayBuffer))return t.byteLength;if("string"!=typeof t)throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type '+typeof t);var e=t.length,n=arguments.length>2&&!0===arguments[2];if(!n&&0===e)return 0;for(var o=!1;;)switch(r){case"ascii":case"latin1":case"binary":return e;case"utf8":case"utf-8":return gt(t).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return 2*e;case"hex":return e>>>1;case"base64":return wt(t).length;default:if(o)return n?-1:gt(t).length;r=(""+r).toLowerCase(),o=!0}}function G(t,r,e){var n=!1;if((void 0===r||r<0)&&(r=0),r>this.length)return"";if((void 0===e||e>this.length)&&(e=this.length),e<=0)return"";if((e>>>=0)<=(r>>>=0))return"";for(t||(t="utf8");;)switch(t){case"hex":return ut(this,r,e);case"utf8":case"utf-8":return nt(this,r,e);case"ascii":return it(this,r,e);case"latin1":case"binary":return ft(this,r,e);case"base64":return et(this,r,e);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return st(this,r,e);default:if(n)throw new TypeError("Unknown encoding: "+t);t=(t+"").toLowerCase(),n=!0}}function Q(t,r,e){var n=t[r];t[r]=t[e],t[e]=n}function X(t,r,e,n,o){if(0===t.length)return-1;if("string"==typeof e?(n=e,e=0):e>2147483647?e=2147483647:e<-2147483648&&(e=-2147483648),mt(e=+e)&&(e=o?0:t.length-1),e<0&&(e=t.length+e),e>=t.length){if(o)return-1;e=t.length-1}else if(e<0){if(!o)return-1;e=0}if("string"==typeof r&&(r=F.from(r,n)),F.isBuffer(r))return 0===r.length?-1:Z(t,r,e,n,o);if("number"==typeof r)return r&=255,"function"==typeof Uint8Array.prototype.indexOf?o?Uint8Array.prototype.indexOf.call(t,r,e):Uint8Array.prototype.lastIndexOf.call(t,r,e):Z(t,[r],e,n,o);throw new TypeError("val must be string, number or Buffer")}function Z(t,r,e,n,o){var i,f=1,u=t.length,s=r.length;if(void 0!==n&&("ucs2"===(n=String(n).toLowerCase())||"ucs-2"===n||"utf16le"===n||"utf-16le"===n)){if(t.length<2||r.length<2)return-1;f=2,u/=2,s/=2,e/=2}function a(t,r){return 1===f?t[r]:t.readUInt16BE(r*f)}if(o){var h=-1;for(i=e;i<u;i++)if(a(t,i)===a(r,-1===h?0:i-h)){if(-1===h&&(h=i),i-h+1===s)return h*f}else-1!==h&&(i-=i-h),h=-1}else for(e+s>u&&(e=u-s),i=e;i>=0;i--){for(var c=!0,p=0;p<s;p++)if(a(t,i+p)!==a(r,p)){c=!1;break}if(c)return i}return-1}function H(t,r,e,n){e=Number(e)||0;var o=t.length-e;n?(n=Number(n))>o&&(n=o):n=o;var i=r.length;n>i/2&&(n=i/2);for(var f=0;f<n;++f){var u=parseInt(r.substr(2*f,2),16);if(mt(u))return f;t[e+f]=u}return f}function K(t,r,e,n){return dt(gt(r,t.length-e),t,e,n)}function $(t,r,e,n){return dt(function(t){for(var r=[],e=0;e<t.length;++e)r.push(255&t.charCodeAt(e));return r}(r),t,e,n)}function tt(t,r,e,n){return dt(wt(r),t,e,n)}function rt(t,r,e,n){return dt(function(t,r){for(var e,n,o,i=[],f=0;f<t.length&&!((r-=2)<0);++f)n=(e=t.charCodeAt(f))>>8,o=e%256,i.push(o),i.push(n);return i}(r,t.length-e),t,e,n)}function et(t,r,e){return 0===r&&e===t.length?B(t):B(t.slice(r,e))}function nt(t,r,e){e=Math.min(t.length,e);for(var n=[],o=r;o<e;){var i,f,u,s,a=t[o],h=null,c=a>239?4:a>223?3:a>191?2:1;if(o+c<=e)switch(c){case 1:a<128&&(h=a);break;case 2:128==(192&(i=t[o+1]))&&(s=(31&a)<<6|63&i)>127&&(h=s);break;case 3:i=t[o+1],f=t[o+2],128==(192&i)&&128==(192&f)&&(s=(15&a)<<12|(63&i)<<6|63&f)>2047&&(s<55296||s>57343)&&(h=s);break;case 4:i=t[o+1],f=t[o+2],u=t[o+3],128==(192&i)&&128==(192&f)&&128==(192&u)&&(s=(15&a)<<18|(63&i)<<12|(63&f)<<6|63&u)>65535&&s<1114112&&(h=s)}null===h?(h=65533,c=1):h>65535&&(h-=65536,n.push(h>>>10&1023|55296),h=56320|1023&h),n.push(h),o+=c}return function(t){var r=t.length;if(r<=ot)return String.fromCharCode.apply(String,t);var e="",n=0;for(;n<r;)e+=String.fromCharCode.apply(String,t.slice(n,n+=ot));return e}(n)}m.kMaxLength=2147483647,F.TYPED_ARRAY_SUPPORT=function(){try{var t=new Uint8Array(1),r={foo:function(){return 42}};return Object.setPrototypeOf(r,Uint8Array.prototype),Object.setPrototypeOf(t,r),42===t.foo()}catch(t){return!1}}(),F.TYPED_ARRAY_SUPPORT||"undefined"==typeof console||"function"!=typeof console.error||console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."),Object.defineProperty(F.prototype,"parent",{enumerable:!0,get:function(){if(F.isBuffer(this))return this.buffer}}),Object.defineProperty(F.prototype,"offset",{enumerable:!0,get:function(){if(F.isBuffer(this))return this.byteOffset}}),F.poolSize=8192,F.from=function(t,r,e){return q(t,r,e)},Object.setPrototypeOf(F.prototype,Uint8Array.prototype),Object.setPrototypeOf(F,Uint8Array),F.alloc=function(t,r,e){return function(t,r,e){return z(t),t<=0?_(t):void 0!==r?"string"==typeof e?_(t).fill(r,e):_(t).fill(r):_(t)}(t,r,e)},F.allocUnsafe=function(t){return D(t)},F.allocUnsafeSlow=function(t){return D(t)},F.isBuffer=function(t){return null!=t&&!0===t._isBuffer&&t!==F.prototype},F.compare=function(t,r){if(vt(t,Uint8Array)&&(t=F.from(t,t.offset,t.byteLength)),vt(r,Uint8Array)&&(r=F.from(r,r.offset,r.byteLength)),!F.isBuffer(t)||!F.isBuffer(r))throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');if(t===r)return 0;for(var e=t.length,n=r.length,o=0,i=Math.min(e,n);o<i;++o)if(t[o]!==r[o]){e=t[o],n=r[o];break}return e<n?-1:n<e?1:0},F.isEncoding=function(t){switch(String(t).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},F.concat=function(t,r){if(!Array.isArray(t))throw new TypeError('"list" argument must be an Array of Buffers');if(0===t.length)return F.alloc(0);var e;if(void 0===r)for(r=0,e=0;e<t.length;++e)r+=t[e].length;var n=F.allocUnsafe(r),o=0;for(e=0;e<t.length;++e){var i=t[e];if(vt(i,Uint8Array))o+i.length>n.length?F.from(i).copy(n,o):Uint8Array.prototype.set.call(n,i,o);else{if(!F.isBuffer(i))throw new TypeError('"list" argument must be an Array of Buffers');i.copy(n,o)}o+=i.length}return n},F.byteLength=Y,F.prototype._isBuffer=!0,F.prototype.swap16=function(){var t=this.length;if(t%2!=0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(var r=0;r<t;r+=2)Q(this,r,r+1);return this},F.prototype.swap32=function(){var t=this.length;if(t%4!=0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(var r=0;r<t;r+=4)Q(this,r,r+3),Q(this,r+1,r+2);return this},F.prototype.swap64=function(){var t=this.length;if(t%8!=0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(var r=0;r<t;r+=8)Q(this,r,r+7),Q(this,r+1,r+6),Q(this,r+2,r+5),Q(this,r+3,r+4);return this},F.prototype.toString=function(){var t=this.length;return 0===t?"":0===arguments.length?nt(this,0,t):G.apply(this,arguments)},F.prototype.toLocaleString=F.prototype.toString,F.prototype.equals=function(t){if(!F.isBuffer(t))throw new TypeError("Argument must be a Buffer");return this===t||0===F.compare(this,t)},F.prototype.inspect=function(){var t="";return t=this.toString("hex",0,50).replace(/(.{2})/g,"$1 ").trim(),this.length>50&&(t+=" ... "),"<Buffer "+t+">"},k&&(F.prototype[k]=F.prototype.inspect),F.prototype.compare=function(t,r,e,n,o){if(vt(t,Uint8Array)&&(t=F.from(t,t.offset,t.byteLength)),!F.isBuffer(t))throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type '+typeof t);if(void 0===r&&(r=0),void 0===e&&(e=t?t.length:0),void 0===n&&(n=0),void 0===o&&(o=this.length),r<0||e>t.length||n<0||o>this.length)throw new RangeError("out of range index");if(n>=o&&r>=e)return 0;if(n>=o)return-1;if(r>=e)return 1;if(this===t)return 0;for(var i=(o>>>=0)-(n>>>=0),f=(e>>>=0)-(r>>>=0),u=Math.min(i,f),s=this.slice(n,o),a=t.slice(r,e),h=0;h<u;++h)if(s[h]!==a[h]){i=s[h],f=a[h];break}return i<f?-1:f<i?1:0},F.prototype.includes=function(t,r,e){return-1!==this.indexOf(t,r,e)},F.prototype.indexOf=function(t,r,e){return X(this,t,r,e,!0)},F.prototype.lastIndexOf=function(t,r,e){return X(this,t,r,e,!1)},F.prototype.write=function(t,r,e,n){if(void 0===r)n="utf8",e=this.length,r=0;else if(void 0===e&&"string"==typeof r)n=r,e=this.length,r=0;else{if(!isFinite(r))throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");r>>>=0,isFinite(e)?(e>>>=0,void 0===n&&(n="utf8")):(n=e,e=void 0)}var o=this.length-r;if((void 0===e||e>o)&&(e=o),t.length>0&&(e<0||r<0)||r>this.length)throw new RangeError("Attempt to write outside buffer bounds");n||(n="utf8");for(var i=!1;;)switch(n){case"hex":return H(this,t,r,e);case"utf8":case"utf-8":return K(this,t,r,e);case"ascii":case"latin1":case"binary":return $(this,t,r,e);case"base64":return tt(this,t,r,e);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return rt(this,t,r,e);default:if(i)throw new TypeError("Unknown encoding: "+n);n=(""+n).toLowerCase(),i=!0}},F.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};var ot=4096;function it(t,r,e){var n="";e=Math.min(t.length,e);for(var o=r;o<e;++o)n+=String.fromCharCode(127&t[o]);return n}function ft(t,r,e){var n="";e=Math.min(t.length,e);for(var o=r;o<e;++o)n+=String.fromCharCode(t[o]);return n}function ut(t,r,e){var n=t.length;(!r||r<0)&&(r=0),(!e||e<0||e>n)&&(e=n);for(var o="",i=r;i<e;++i)o+=Et[t[i]];return o}function st(t,r,e){for(var n=t.slice(r,e),o="",i=0;i<n.length-1;i+=2)o+=String.fromCharCode(n[i]+256*n[i+1]);return o}function at(t,r,e){if(t%1!=0||t<0)throw new RangeError("offset is not uint");if(t+r>e)throw new RangeError("Trying to access beyond buffer length")}function ht(t,r,e,n,o,i){if(!F.isBuffer(t))throw new TypeError('"buffer" argument must be a Buffer instance');if(r>o||r<i)throw new RangeError('"value" argument is out of bounds');if(e+n>t.length)throw new RangeError("Index out of range")}function ct(t,r,e,n,o,i){if(e+n>t.length)throw new RangeError("Index out of range");if(e<0)throw new RangeError("Index out of range")}function pt(t,r,e,n,o){return r=+r,e>>>=0,o||ct(t,0,e,4),x(t,r,e,n,23,4),e+4}function lt(t,r,e,n,o){return r=+r,e>>>=0,o||ct(t,0,e,8),x(t,r,e,n,52,8),e+8}F.prototype.slice=function(t,r){var e=this.length;(t=~~t)<0?(t+=e)<0&&(t=0):t>e&&(t=e),(r=void 0===r?e:~~r)<0?(r+=e)<0&&(r=0):r>e&&(r=e),r<t&&(r=t);var n=this.subarray(t,r);return Object.setPrototypeOf(n,F.prototype),n},F.prototype.readUintLE=F.prototype.readUIntLE=function(t,r,e){t>>>=0,r>>>=0,e||at(t,r,this.length);for(var n=this[t],o=1,i=0;++i<r&&(o*=256);)n+=this[t+i]*o;return n},F.prototype.readUintBE=F.prototype.readUIntBE=function(t,r,e){t>>>=0,r>>>=0,e||at(t,r,this.length);for(var n=this[t+--r],o=1;r>0&&(o*=256);)n+=this[t+--r]*o;return n},F.prototype.readUint8=F.prototype.readUInt8=function(t,r){return t>>>=0,r||at(t,1,this.length),this[t]},F.prototype.readUint16LE=F.prototype.readUInt16LE=function(t,r){return t>>>=0,r||at(t,2,this.length),this[t]|this[t+1]<<8},F.prototype.readUint16BE=F.prototype.readUInt16BE=function(t,r){return t>>>=0,r||at(t,2,this.length),this[t]<<8|this[t+1]},F.prototype.readUint32LE=F.prototype.readUInt32LE=function(t,r){return t>>>=0,r||at(t,4,this.length),(this[t]|this[t+1]<<8|this[t+2]<<16)+16777216*this[t+3]},F.prototype.readUint32BE=F.prototype.readUInt32BE=function(t,r){return t>>>=0,r||at(t,4,this.length),16777216*this[t]+(this[t+1]<<16|this[t+2]<<8|this[t+3])},F.prototype.readIntLE=function(t,r,e){t>>>=0,r>>>=0,e||at(t,r,this.length);for(var n=this[t],o=1,i=0;++i<r&&(o*=256);)n+=this[t+i]*o;return n>=(o*=128)&&(n-=Math.pow(2,8*r)),n},F.prototype.readIntBE=function(t,r,e){t>>>=0,r>>>=0,e||at(t,r,this.length);for(var n=r,o=1,i=this[t+--n];n>0&&(o*=256);)i+=this[t+--n]*o;return i>=(o*=128)&&(i-=Math.pow(2,8*r)),i},F.prototype.readInt8=function(t,r){return t>>>=0,r||at(t,1,this.length),128&this[t]?-1*(255-this[t]+1):this[t]},F.prototype.readInt16LE=function(t,r){t>>>=0,r||at(t,2,this.length);var e=this[t]|this[t+1]<<8;return 32768&e?4294901760|e:e},F.prototype.readInt16BE=function(t,r){t>>>=0,r||at(t,2,this.length);var e=this[t+1]|this[t]<<8;return 32768&e?4294901760|e:e},F.prototype.readInt32LE=function(t,r){return t>>>=0,r||at(t,4,this.length),this[t]|this[t+1]<<8|this[t+2]<<16|this[t+3]<<24},F.prototype.readInt32BE=function(t,r){return t>>>=0,r||at(t,4,this.length),this[t]<<24|this[t+1]<<16|this[t+2]<<8|this[t+3]},F.prototype.readFloatLE=function(t,r){return t>>>=0,r||at(t,4,this.length),M(this,t,!0,23,4)},F.prototype.readFloatBE=function(t,r){return t>>>=0,r||at(t,4,this.length),M(this,t,!1,23,4)},F.prototype.readDoubleLE=function(t,r){return t>>>=0,r||at(t,8,this.length),M(this,t,!0,52,8)},F.prototype.readDoubleBE=function(t,r){return t>>>=0,r||at(t,8,this.length),M(this,t,!1,52,8)},F.prototype.writeUintLE=F.prototype.writeUIntLE=function(t,r,e,n){(t=+t,r>>>=0,e>>>=0,n)||ht(this,t,r,e,Math.pow(2,8*e)-1,0);var o=1,i=0;for(this[r]=255&t;++i<e&&(o*=256);)this[r+i]=t/o&255;return r+e},F.prototype.writeUintBE=F.prototype.writeUIntBE=function(t,r,e,n){(t=+t,r>>>=0,e>>>=0,n)||ht(this,t,r,e,Math.pow(2,8*e)-1,0);var o=e-1,i=1;for(this[r+o]=255&t;--o>=0&&(i*=256);)this[r+o]=t/i&255;return r+e},F.prototype.writeUint8=F.prototype.writeUInt8=function(t,r,e){return t=+t,r>>>=0,e||ht(this,t,r,1,255,0),this[r]=255&t,r+1},F.prototype.writeUint16LE=F.prototype.writeUInt16LE=function(t,r,e){return t=+t,r>>>=0,e||ht(this,t,r,2,65535,0),this[r]=255&t,this[r+1]=t>>>8,r+2},F.prototype.writeUint16BE=F.prototype.writeUInt16BE=function(t,r,e){return t=+t,r>>>=0,e||ht(this,t,r,2,65535,0),this[r]=t>>>8,this[r+1]=255&t,r+2},F.prototype.writeUint32LE=F.prototype.writeUInt32LE=function(t,r,e){return t=+t,r>>>=0,e||ht(this,t,r,4,4294967295,0),this[r+3]=t>>>24,this[r+2]=t>>>16,this[r+1]=t>>>8,this[r]=255&t,r+4},F.prototype.writeUint32BE=F.prototype.writeUInt32BE=function(t,r,e){return t=+t,r>>>=0,e||ht(this,t,r,4,4294967295,0),this[r]=t>>>24,this[r+1]=t>>>16,this[r+2]=t>>>8,this[r+3]=255&t,r+4},F.prototype.writeIntLE=function(t,r,e,n){if(t=+t,r>>>=0,!n){var o=Math.pow(2,8*e-1);ht(this,t,r,e,o-1,-o)}var i=0,f=1,u=0;for(this[r]=255&t;++i<e&&(f*=256);)t<0&&0===u&&0!==this[r+i-1]&&(u=1),this[r+i]=(t/f>>0)-u&255;return r+e},F.prototype.writeIntBE=function(t,r,e,n){if(t=+t,r>>>=0,!n){var o=Math.pow(2,8*e-1);ht(this,t,r,e,o-1,-o)}var i=e-1,f=1,u=0;for(this[r+i]=255&t;--i>=0&&(f*=256);)t<0&&0===u&&0!==this[r+i+1]&&(u=1),this[r+i]=(t/f>>0)-u&255;return r+e},F.prototype.writeInt8=function(t,r,e){return t=+t,r>>>=0,e||ht(this,t,r,1,127,-128),t<0&&(t=255+t+1),this[r]=255&t,r+1},F.prototype.writeInt16LE=function(t,r,e){return t=+t,r>>>=0,e||ht(this,t,r,2,32767,-32768),this[r]=255&t,this[r+1]=t>>>8,r+2},F.prototype.writeInt16BE=function(t,r,e){return t=+t,r>>>=0,e||ht(this,t,r,2,32767,-32768),this[r]=t>>>8,this[r+1]=255&t,r+2},F.prototype.writeInt32LE=function(t,r,e){return t=+t,r>>>=0,e||ht(this,t,r,4,2147483647,-2147483648),this[r]=255&t,this[r+1]=t>>>8,this[r+2]=t>>>16,this[r+3]=t>>>24,r+4},F.prototype.writeInt32BE=function(t,r,e){return t=+t,r>>>=0,e||ht(this,t,r,4,2147483647,-2147483648),t<0&&(t=4294967295+t+1),this[r]=t>>>24,this[r+1]=t>>>16,this[r+2]=t>>>8,this[r+3]=255&t,r+4},F.prototype.writeFloatLE=function(t,r,e){return pt(this,t,r,!0,e)},F.prototype.writeFloatBE=function(t,r,e){return pt(this,t,r,!1,e)},F.prototype.writeDoubleLE=function(t,r,e){return lt(this,t,r,!0,e)},F.prototype.writeDoubleBE=function(t,r,e){return lt(this,t,r,!1,e)},F.prototype.copy=function(t,r,e,n){if(!F.isBuffer(t))throw new TypeError("argument should be a Buffer");if(e||(e=0),n||0===n||(n=this.length),r>=t.length&&(r=t.length),r||(r=0),n>0&&n<e&&(n=e),n===e)return 0;if(0===t.length||0===this.length)return 0;if(r<0)throw new RangeError("targetStart out of bounds");if(e<0||e>=this.length)throw new RangeError("Index out of range");if(n<0)throw new RangeError("sourceEnd out of bounds");n>this.length&&(n=this.length),t.length-r<n-e&&(n=t.length-r+e);var o=n-e;return this===t&&"function"==typeof Uint8Array.prototype.copyWithin?this.copyWithin(r,e,n):Uint8Array.prototype.set.call(t,this.subarray(e,n),r),o},F.prototype.fill=function(t,r,e,n){if("string"==typeof t){if("string"==typeof r?(n=r,r=0,e=this.length):"string"==typeof e&&(n=e,e=this.length),void 0!==n&&"string"!=typeof n)throw new TypeError("encoding must be a string");if("string"==typeof n&&!F.isEncoding(n))throw new TypeError("Unknown encoding: "+n);if(1===t.length){var o=t.charCodeAt(0);("utf8"===n&&o<128||"latin1"===n)&&(t=o)}}else"number"==typeof t?t&=255:"boolean"==typeof t&&(t=Number(t));if(r<0||this.length<r||this.length<e)throw new RangeError("Out of range index");if(e<=r)return this;var i;if(r>>>=0,e=void 0===e?this.length:e>>>0,t||(t=0),"number"==typeof t)for(i=r;i<e;++i)this[i]=t;else{var f=F.isBuffer(t)?t:F.from(t,n),u=f.length;if(0===u)throw new TypeError('The value "'+t+'" is invalid for argument "value"');for(i=0;i<e-r;++i)this[i+r]=f[i%u]}return this};var yt=/[^+/0-9A-Za-z-_]/g;function gt(t,r){var e;r=r||1/0;for(var n=t.length,o=null,i=[],f=0;f<n;++f){if((e=t.charCodeAt(f))>55295&&e<57344){if(!o){if(e>56319){(r-=3)>-1&&i.push(239,191,189);continue}if(f+1===n){(r-=3)>-1&&i.push(239,191,189);continue}o=e;continue}if(e<56320){(r-=3)>-1&&i.push(239,191,189),o=e;continue}e=65536+(o-55296<<10|e-56320)}else o&&(r-=3)>-1&&i.push(239,191,189);if(o=null,e<128){if((r-=1)<0)break;i.push(e)}else if(e<2048){if((r-=2)<0)break;i.push(e>>6|192,63&e|128)}else if(e<65536){if((r-=3)<0)break;i.push(e>>12|224,e>>6&63|128,63&e|128)}else{if(!(e<1114112))throw new Error("Invalid code point");if((r-=4)<0)break;i.push(e>>18|240,e>>12&63|128,e>>6&63|128,63&e|128)}}return i}function wt(t){return A(function(t){if((t=(t=t.split("=")[0]).trim().replace(yt,"")).length<2)return"";for(;t.length%4!=0;)t+="=";return t}(t))}function dt(t,r,e,n){for(var o=0;o<n&&!(o+e>=r.length||o>=t.length);++o)r[o+e]=t[o];return o}function vt(t,r){return t instanceof r||null!=t&&null!=t.constructor&&null!=t.constructor.name&&t.constructor.name===r.name}function mt(t){return t!=t}var bt,Et=function(){for(var t="0123456789abcdef",r=new Array(256),e=0;e<16;++e)for(var n=16*e,o=0;o<16;++o)r[n+o]=t[e]+t[o];return r}(),At={},Bt=m,Ut=Bt.Buffer;function Tt(t,r){for(var e in t)r[e]=t[e]}function Lt(t,r,e){return Ut(t,r,e)}Ut.from&&Ut.alloc&&Ut.allocUnsafe&&Ut.allocUnsafeSlow?At=Bt:(Tt(Bt,At),bt=Lt,At.Buffer=bt),Lt.prototype=Object.create(Ut.prototype),Tt(Ut,Lt),Lt.from=function(t,r,e){if("number"==typeof t)throw new TypeError("Argument must not be a number");return Ut(t,r,e)},Lt.alloc=function(t,r,e){if("number"!=typeof t)throw new TypeError("Argument must be a number");var n=Ut(t);return void 0!==r?"string"==typeof e?n.fill(r,e):n.fill(r):n.fill(0),n},Lt.allocUnsafe=function(t){if("number"!=typeof t)throw new TypeError("Argument must be a number");return Ut(t)},Lt.allocUnsafeSlow=function(t){if("number"!=typeof t)throw new TypeError("Argument must be a number");return Bt.SlowBuffer(t)};var Ot={},It=65536,Rt=4294967295;var St=At.Buffer,Ct=t.crypto||t.msCrypto;Ot=Ct&&Ct.getRandomValues?function(t,r){if(t>Rt)throw new RangeError("requested too many random bytes");var e=St.allocUnsafe(t);if(t>0)if(t>It)for(var n=0;n<t;n+=It)Ct.getRandomValues(e.slice(n,n+It));else Ct.getRandomValues(e);if("function"==typeof r)return f.nextTick((function(){r(null,e)}));return e}:function(){throw new Error("Secure random number generation is not supported by this browser.\nUse Chrome, Firefox or Internet Explorer 11")};var Mt={};r(Mt,"net",(function(){return null}));const xt="undefined"!=typeof window?window.Worker:null;r(Mt,"Worker",(function(){return xt}));const kt=(t,r)=>{t.onmessage=t=>r(t.data)};r(Mt,"workerOnMessage",(function(){return kt}));const Pt=t=>self.postMessage(t);r(Mt,"postMessage",(function(){return Pt}));const jt=t=>{self.onmessage=r=>t(r.data)};r(Mt,"setOnMessage",(function(){return jt})),e.register("7lbf0",(function(){return f})),e.register("14GFO",(function(){return m})),e.register("44BMJ",(function(){return b})),e.register("6aUge",(function(){return At})),e.register("3pfpW",(function(){return Ot})),e.register("7xQJT",(function(){return Mt}))}null==e&&((e=function(t){if(t in o){let r=o[t];delete o[t],r()}if(t in n)return n[t];if("undefined"!=typeof module&&"function"==typeof module.require)return module.require(t);var r=new Error("Cannot find module '"+t+"'");throw r.code="MODULE_NOT_FOUND",r}).register=function(t,r){n[t]=r},e.registerBundle=function(t,r){o[t]=r,n[t]={}},t.parcelRequire315c=e);for(var f=["7lbf0","14GFO","44BMJ","6aUge","3pfpW","7xQJT"],u=0;u<f.length;u++)parcelRequire315c.registerBundle(f[u],i)}();
//# sourceMappingURL=index.5993cd18.js.map
