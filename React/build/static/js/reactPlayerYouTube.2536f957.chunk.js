(window.webpackJsonp=window.webpackJsonp||[]).push([[2],{253:function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var n=function(e){if(e&&e.__esModule)return e;if(null===e||"object"!==u(e)&&"function"!==typeof e)return{default:e};var t=i();if(t&&t.has(e))return t.get(e);var r={},n=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var a=n?Object.getOwnPropertyDescriptor(e,o):null;a&&(a.get||a.set)?Object.defineProperty(r,o,a):r[o]=e[o]}r.default=e,t&&t.set(e,r);return r}(r(0)),o=r(79),a=r(121);function i(){if("function"!==typeof WeakMap)return null;var e=new WeakMap;return i=function(){return e},e}function u(e){return(u="function"===typeof Symbol&&"symbol"===typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"===typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function l(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,n)}return r}function c(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?l(Object(r),!0).forEach(function(t){h(e,t,r[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):l(Object(r)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))})}return e}function s(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function f(e,t){return(f=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function y(e){return function(){var t,r=d(e);if(function(){if("undefined"===typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"===typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],function(){})),!0}catch(e){return!1}}()){var n=d(this).constructor;t=Reflect.construct(r,arguments,n)}else t=r.apply(this,arguments);return function(e,t){if(t&&("object"===u(t)||"function"===typeof t))return t;return p(e)}(this,t)}}function p(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function d(e){return(d=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function h(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function b(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){if("undefined"===typeof Symbol||!(Symbol.iterator in Object(e)))return;var r=[],n=!0,o=!1,a=void 0;try{for(var i,u=e[Symbol.iterator]();!(n=(i=u.next()).done)&&(r.push(i.value),!t||r.length!==t);n=!0);}catch(l){o=!0,a=l}finally{try{n||null==u.return||u.return()}finally{if(o)throw a}}return r}(e,t)||function(e,t){if(!e)return;if("string"===typeof e)return v(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);"Object"===r&&e.constructor&&(r=e.constructor.name);if("Map"===r||"Set"===r)return Array.from(r);if("Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return v(e,t)}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function v(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}var m="YT",P=/list=([a-zA-Z0-9_-]+)/,g=/user\/([a-zA-Z0-9_-]+)\/?/,w=/youtube-nocookie\.com/;function O(e){return P.test(e)?{listType:"playlist",list:b(e.match(P),2)[1]}:g.test(e)?{listType:"user_uploads",list:b(e.match(g),2)[1]}:{}}var j=function(e){!function(e,t){if("function"!==typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&f(e,t)}(l,n.Component);var t,r,i,u=y(l);function l(){var e;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,l);for(var t=arguments.length,r=new Array(t),n=0;n<t;n++)r[n]=arguments[n];return h(p(e=u.call.apply(u,[this].concat(r))),"callPlayer",o.callPlayer),h(p(e),"onStateChange",function(t){var r=t.data,n=e.props,o=n.onPlay,a=n.onPause,i=n.onBuffer,u=n.onBufferEnd,l=n.onEnded,c=n.onReady,s=n.loop,f=n.config,y=f.playerVars,p=f.onUnstarted,d=window[m].PlayerState,h=d.UNSTARTED,b=d.PLAYING,v=d.PAUSED,P=d.BUFFERING,g=d.ENDED,w=d.CUED;if(r===h&&p(),r===b&&(o(),u()),r===v&&a(),r===P&&i(),r===g){var O=!!e.callPlayer("getPlaylist");s&&!O&&(y.start?e.seekTo(y.start):e.play()),l()}r===w&&c()}),h(p(e),"mute",function(){e.callPlayer("mute")}),h(p(e),"unmute",function(){e.callPlayer("unMute")}),h(p(e),"ref",function(t){e.container=t}),e}return t=l,(r=[{key:"componentDidMount",value:function(){this.props.onMount&&this.props.onMount(this)}},{key:"load",value:function(e,t){var r=this,n=this.props,i=n.playing,u=n.muted,l=n.playsinline,s=n.controls,f=n.loop,y=n.config,p=n.onError,d=y.playerVars,h=y.embedOptions,b=e&&e.match(a.MATCH_URL_YOUTUBE)[1];if(t)return P.test(e)||g.test(e)?void this.player.loadPlaylist(O(e)):void this.player.cueVideoById({videoId:b,startSeconds:(0,o.parseStartTime)(e)||d.start,endSeconds:(0,o.parseEndTime)(e)||d.end});(0,o.getSDK)("https://www.youtube.com/iframe_api",m,"onYouTubeIframeAPIReady",function(e){return e.loaded}).then(function(t){r.container&&(r.player=new t.Player(r.container,c({width:"100%",height:"100%",videoId:b,playerVars:c({autoplay:i?1:0,mute:u?1:0,controls:s?1:0,start:(0,o.parseStartTime)(e),end:(0,o.parseEndTime)(e),origin:window.location.origin,playsinline:l},O(e),{},d),events:{onReady:function(){f&&r.player.setLoop(!0),r.props.onReady()},onStateChange:r.onStateChange,onError:function(e){return p(e.data)}},host:w.test(e)?"https://www.youtube-nocookie.com":void 0},h)))},p)}},{key:"play",value:function(){this.callPlayer("playVideo")}},{key:"pause",value:function(){this.callPlayer("pauseVideo")}},{key:"stop",value:function(){document.body.contains(this.callPlayer("getIframe"))&&this.callPlayer("stopVideo")}},{key:"seekTo",value:function(e){this.callPlayer("seekTo",e),this.props.playing||this.pause()}},{key:"setVolume",value:function(e){this.callPlayer("setVolume",100*e)}},{key:"setPlaybackRate",value:function(e){this.callPlayer("setPlaybackRate",e)}},{key:"setLoop",value:function(e){this.callPlayer("setLoop",e)}},{key:"getDuration",value:function(){return this.callPlayer("getDuration")}},{key:"getCurrentTime",value:function(){return this.callPlayer("getCurrentTime")}},{key:"getSecondsLoaded",value:function(){return this.callPlayer("getVideoLoadedFraction")*this.getDuration()}},{key:"render",value:function(){var e={width:"100%",height:"100%",display:this.props.display};return n.default.createElement("div",{style:e},n.default.createElement("div",{ref:this.ref}))}}])&&s(t.prototype,r),i&&s(t,i),l}();t.default=j,h(j,"displayName","YouTube")}}]);
//# sourceMappingURL=reactPlayerYouTube.2536f957.chunk.js.map