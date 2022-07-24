(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ImageViewerUtil = factory());
})(this, (function () { 'use strict';

    function registerEvent(dom, name, fn) {
      if (dom.attachEvent) {
        dom.attachEvent('on' + name, fn);
      } else {
        dom.addEventListener(name, fn, false);
      }
    }

    function unregisterEvent(dom, name, fn) {
      if (dom.detachEvent) {
        dom.detachEvent('on' + name, fn);
      } else {
        dom.removeEventListener(name, fn, false);
      }
    }

    function loadImagePromise(url) {
      return new Promise(function (resolve, reject) {
        var image = new Image();

        image.onload = function () {
          resolve(image);
        };

        image.onerror = reject;
        image.src = url;
      });
    }

    function parseNumber(n, l) {
      if (l === void 0) {
        l = 1;
      }

      var a = parseFloat("".concat(n));
      a = isNaN(a) ? 0 : a;
      var b = a.toFixed(l);
      return parseFloat(b);
    }

    function isFunction(fn) {
      return typeof fn === 'function';
    }

    var styleUtil = {
      updateTransform: function updateTransform(dom, opt) {
        if (!dom || !(dom === null || dom === void 0 ? void 0 : dom.style) || !opt) {
          return;
        }

        var transfromInfo = dom.style.transform || '';
        var transfromList = transfromInfo.split(' ');

        var _loop_1 = function _loop_1(key) {
          var value = opt[key];

          if (typeof value !== 'number') {
            return "continue";
          }

          var index = transfromList.findIndex(function (v) {
            return v.indexOf(key) > -1;
          });

          if (index > -1) {
            transfromList.splice(index, 1);
          }

          var str = '';

          switch (key) {
            case 'scale':
              str = "scale(".concat((opt.scale, opt.scale), ")");
              break;

            case 'translateX':
              str = "translateX(".concat(opt.translateX, "px)");
              break;

            case 'translateY':
              str = "translateY(".concat(opt.translateY, "px)");
              break;

            case 'rotateZ':
              str = "rotateZ(".concat(opt.rotateZ, "deg)");
          }

          if (key) {
            transfromList.push(str);
          }
        };

        for (var key in opt) {
          _loop_1(key);
        }

        dom.style.transform = transfromList.join(' ');
      },
      parseImageDragMoveLimitSize: function parseImageDragMoveLimitSize(imageNode, scale) {
        var clientWidth = imageNode.clientWidth,
            clientHeight = imageNode.clientHeight;
        var offsetLeft = imageNode.offsetLeft,
            offsetTop = imageNode.offsetTop;
        var width = scale * clientWidth + offsetLeft;
        var height = scale * clientHeight + offsetTop;
        var w = scale > 1 ? parseNumber((width - clientWidth) / 2 / scale, 2) : 0;
        var h = scale > 1 ? parseNumber((height - clientHeight) / 2 / scale, 2) : 0;
        var minLeft = -w;
        var maxLeft = w;
        var minTop = -h;
        var maxTop = h;
        return {
          minLeft: minLeft,
          maxLeft: maxLeft,
          minTop: minTop,
          maxTop: maxTop
        };
      }
    };
    var logUtil = {
      log: function log() {
        var args = [];

        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }

        return console.log.apply(console, args);
      },
      warn: function warn() {
        var args = [];

        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }

        return console.warn.apply(console, args);
      },
      info: function info() {
        var args = [];

        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }

        return console.info.apply(console, args);
      },
      error: function error() {
        var args = [];

        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }

        return console.error.apply(console, args);
      }
    };

    var ImageViewerUtil =
    /** @class */
    function () {
      function ImageViewerUtil(params) {
        var _this = this;

        this.imageEventX = 0; // 开始拖动图片时，鼠标的位置x

        this.imageEventY = 0; // 开始拖动图片时，鼠标的位置y

        this.canDragImage = 0; // 鼠标是在图片上，是否可以拖动

        this.canMoveImage = 0; // 鼠标是在图片上按下，是否可以移动

        this.config = {
          isDebug: false,
          imageStyle: {
            scale: {
              defaultValue: 1,
              value: 1,
              per: 0.15,
              min: 0.1,
              max: 20
            },
            rotate: {
              defaultValue: 0,
              value: 0,
              per: 90,
              min: 0,
              max: 360
            },
            translate: {
              x: 0,
              y: 0,
              prevX: 0,
              prevY: 0 // 上一次鼠标弹起后的y

            }
          },
          timeout: 0,
          onLoadStart: null,
          onLoad: null,
          onLoadError: null,
          onStyleChange: null
        };

        this.onDocumentMousewheel = function (e) {
          _this.handleImageMousewheel(e);
        };

        this.onDocumentMouseDown = function (e) {
          _this.handleImageMouseDown(e);
        };

        this.onDocumentMouseMove = function (e) {
          _this.handleImageMouseMove(e);
        };

        this.onDocumentMouseUp = function (e) {
          _this.handleImageMouseUp(e);
        };

        this.onImageMouseOver = function (e) {
          _this.handleImageMouseOver(e);
        };

        this.onImageMouseLeave = function (e) {
          _this.handleImageMouseLeave(e);
        };

        this.updateDOMNode(params);
        this.updateImageCallback(params);
        this.bindEvent();
      }

      ImageViewerUtil.prototype.log = function (type) {
        var args = [];

        for (var _i = 1; _i < arguments.length; _i++) {
          args[_i - 1] = arguments[_i];
        }

        if (!this.config.isDebug) {
          return;
        }

        switch (type) {
          case 1:
            logUtil.log.apply(logUtil, args);
            break;

          case 2:
            logUtil.error.apply(logUtil, args);
            break;

          default:
            logUtil.log.apply(logUtil, args);
            break;
        }
      };

      ImageViewerUtil.prototype.bindEvent = function () {
        var _this = this;

        window.onresize = function (e) {
          _this.handleImageWindowResize(e);
        };

        registerEvent(document, 'mousewheel', this.onDocumentMousewheel);
        registerEvent(document, 'mousedown', this.onDocumentMouseDown);
        registerEvent(document, 'mousemove', this.onDocumentMouseMove);
        registerEvent(document, 'mouseup', this.onDocumentMouseUp);
        registerEvent(this.imageNode, 'mouseover', this.onImageMouseOver);
        registerEvent(this.imageNode, 'mouseleave', this.onImageMouseLeave);
      };

      ImageViewerUtil.prototype.unbindEvent = function () {
        unregisterEvent(document, 'mousewheel', this.onDocumentMousewheel);
        unregisterEvent(document, 'mousedown', this.onDocumentMouseDown);
        unregisterEvent(document, 'mousemove', this.onDocumentMouseMove);
        unregisterEvent(document, 'mouseup', this.onDocumentMouseUp);
        unregisterEvent(this.imageNode, 'mouseover', this.onImageMouseOver);
        unregisterEvent(this.imageNode, 'mouseleave', this.onImageMouseLeave);
      };

      ImageViewerUtil.prototype.handleImageWindowResize = function (e) {
        this.updateImagePrevTransform({
          x: 0,
          y: 0
        });
      };

      ImageViewerUtil.prototype.handleImageMousewheel = function (e) {
        if (e.wheelDelta >= 1) {
          // 放大
          this.large();
        } else {
          // 缩小
          this.small();
        }
      };

      ImageViewerUtil.prototype.handleImageMouseOver = function (e) {
        this.canDragImage = 1;
      };

      ImageViewerUtil.prototype.handleImageMouseLeave = function (e) {
        e.preventDefault();
        this.canDragImage = 0;
      };

      ImageViewerUtil.prototype.handleImageMouseDown = function (e) {
        if (this.canDragImage) {
          this.canMoveImage = 1;
          var event = window.event;
          this.imageEventX = event.x;
          this.imageEventY = event.y;
          var imageStyleConfig = this.getImageStyleConfig();
          var translate = imageStyleConfig.translate;
          this.updateImagePrevTransform({
            x: translate.x,
            y: translate.y
          });
        }
      };

      ImageViewerUtil.prototype.handleImageMouseMove = function (e) {
        e.preventDefault();

        if (this.canMoveImage) {
          var event = window.event;
          var eventX = event.x;
          var eventY = event.y;
          var imageStyleConfig = this.getImageStyleConfig();
          var translate = imageStyleConfig.translate;
          var oldTranslateX = translate.x,
              oldTranslateY = translate.y,
              prevX = translate.prevX,
              prevY = translate.prevY;
          var scale = imageStyleConfig.scale.value;
          var imageNode = this.imageNode;
          var moveLimitSize = styleUtil.parseImageDragMoveLimitSize(imageNode, scale);
          var minLeft = moveLimitSize.minLeft,
              maxLeft = moveLimitSize.maxLeft,
              minTop = moveLimitSize.minTop,
              maxTop = moveLimitSize.maxTop;
          var translateX = prevX + eventX - this.imageEventX;
          var translateY = prevY + eventY - this.imageEventY;
          this.log(1, "ImageViewerUtil image move data=".concat(JSON.stringify(moveLimitSize)));

          if (translateX <= 0 && translateX < minLeft || translateX >= 0 && translateX > maxLeft) {
            translateX = oldTranslateX;
          }

          if (translateY <= 0 && translateY < minTop || translateY >= 0 && translateY > maxTop) {
            translateY = oldTranslateY;
          }

          var opts = {
            translateX: translateX,
            translateY: translateY
          };
          this.updateTranslate(opts);
          this.updateImageTransform(opts);
        }
      };

      ImageViewerUtil.prototype.handleImageMouseUp = function (e) {
        this.canMoveImage = 0;
      };

      ImageViewerUtil.prototype.updateDOMNode = function (params) {
        var imageContainerNode = params.imageContainerNode,
            imageNode = params.imageNode;
        this.imageContainerNode = imageContainerNode;
        this.imageNode = imageNode;
      };

      ImageViewerUtil.prototype.updateImageCallback = function (params) {
        var onLoadStart = params.onLoadStart,
            onLoad = params.onLoad,
            onLoadError = params.onLoadError,
            onStyleChange = params.onStyleChange;
        this.config.onLoadStart = onLoadStart;
        this.config.onLoad = onLoad;
        this.config.onLoadError = onLoadError;
        this.config.onStyleChange = onStyleChange;
      };

      ImageViewerUtil.prototype.updateImageTransform = function (opts) {
        isFunction(this.config.onStyleChange) && this.config.onStyleChange(opts);
        styleUtil.updateTransform(this.imageNode, opts);
      };

      ImageViewerUtil.prototype.updateImagePrevTransform = function (_a) {
        var x = _a.x,
            y = _a.y;
        var imageStyleConfig = this.getImageStyleConfig();
        var translate = imageStyleConfig.translate;
        translate.prevX = x;
        translate.prevY = y;
      };

      ImageViewerUtil.prototype.getImageStyleConfig = function () {
        return this.config.imageStyle;
      };

      ImageViewerUtil.prototype.large = function () {
        var imageStyleConfig = this.getImageStyleConfig();
        var _a = imageStyleConfig.scale,
            scalePer = _a.per,
            maxScale = _a.max,
            value = _a.value;
        var scale = parseNumber(value + scalePer);
        scale = scale > maxScale ? maxScale : scale;
        this.updateImagePrevTransform({
          x: 0,
          y: 0
        });
        this.updateScale(scale);
        this.updateImageTransform({
          scale: scale
        });
      };

      ImageViewerUtil.prototype.small = function () {
        var imageStyleConfig = this.getImageStyleConfig();
        var _a = imageStyleConfig.scale,
            scalePer = _a.per,
            minScale = _a.min,
            value = _a.value;
        var scale = parseNumber(value - scalePer);
        scale = scale < minScale ? minScale : scale;
        this.updateImagePrevTransform({
          x: 0,
          y: 0
        });
        var translateX;
        var translateY;

        if (scale < 1) {
          translateX = 0;
          translateY = 0;
        }

        this.updateScale(scale);
        this.updateImageTransform({
          scale: scale,
          translateX: translateX,
          translateY: translateY
        });
      };

      ImageViewerUtil.prototype.updateScale = function (scale) {
        var imageStyleConfig = this.getImageStyleConfig();
        imageStyleConfig.scale.value = scale;
        this.log(1, "ImageViewerUtil image scale=".concat(scale));
      };

      ImageViewerUtil.prototype.updateRotate = function (rotate) {
        var imageStyleConfig = this.getImageStyleConfig();
        imageStyleConfig.rotate.value = rotate;
        this.log(1, "ImageViewerUtil image rotate=".concat(rotate));
      };

      ImageViewerUtil.prototype.updateTranslate = function (opts) {
        var translateX = opts.translateX,
            translateY = opts.translateY;
        var imageStyleConfig = this.getImageStyleConfig();
        imageStyleConfig.translate.x = translateX;
        imageStyleConfig.translate.y = translateY;
        this.log(1, "ImageViewerUtil image translate=".concat(JSON.stringify(opts)));
      };

      ImageViewerUtil.prototype.reset = function () {
        var imageStyleConfig = this.getImageStyleConfig();
        var scale = imageStyleConfig.scale.defaultValue;
        this.updateScale(scale);
        var rotate = imageStyleConfig.rotate.defaultValue;
        this.updateRotate(rotate);
        this.updateImageTransform({
          scale: scale,
          translateX: 0,
          translateY: 0
        });
      };

      ImageViewerUtil.prototype.rotate = function () {
        var _a = this.config.imageStyle.rotate,
            rotatePer = _a.per,
            minRotate = _a.min,
            maxRotate = _a.max,
            value = _a.value;
        var rotate = value + rotatePer;

        if (rotate >= maxRotate) {
          rotate = minRotate;
        }

        this.updateRotate(rotate);
        this.updateImageTransform({
          rotateZ: rotate
        });
      };

      ImageViewerUtil.prototype.onLoadImage = function (url) {
        var _this = this;

        var onLoadStart = this.config.onLoadStart;
        isFunction(onLoadStart) && onLoadStart(url);
        loadImagePromise(url).then(function (image) {
          var _a = _this.config,
              onLoad = _a.onLoad,
              _b = _a.timeout,
              timeout = _b === void 0 ? 0 : _b;

          var fn = function fn() {
            isFunction(onLoad) && onLoad(image);

            _this.updateImageUrl(url);

            _this.updateImage(image);
          };

          if (typeof timeout === 'number') {
            setTimeout(fn, timeout);
          } else {
            fn();
          }
        })["catch"](function (err) {
          var onLoadError = _this.config.onLoadError;
          isFunction(onLoadError) && onLoadError(err);
        });
      };

      ImageViewerUtil.prototype.updateImageUrl = function (url) {
        this.imageNode.setAttribute('src', url);
      };

      ImageViewerUtil.prototype.updateImage = function (image) {
        this.image = image;
      };

      ImageViewerUtil.prototype.updateTimeout = function (timeout) {
        this.config.timeout = timeout;
        this.log(1, "ImageViewerUtil image timeout=".concat(timeout));
      };

      ImageViewerUtil.prototype.updateDebug = function (debug) {
        this.config.isDebug = debug;
        this.log(1, "ImageViewerUtil image debug=".concat(debug));
      };

      ImageViewerUtil.prototype.update = function (_a) {
        var url = _a.url;
        this.reset();
        this.onLoadImage(url);
      };

      ImageViewerUtil.prototype.setDebug = function (debug) {
        if (debug === void 0) {
          debug = false;
        }

        this.updateDebug(debug);
      };

      ImageViewerUtil.prototype.setTimeout = function (timeout) {
        if (timeout === void 0) {
          timeout = 0;
        }

        this.updateTimeout(timeout);
      };

      ImageViewerUtil.prototype.setLarge = function () {
        // 放大
        this.large();
      };

      ImageViewerUtil.prototype.setSmall = function () {
        // 缩小
        this.small();
      };

      ImageViewerUtil.prototype.setReset = function () {
        // 重置
        this.reset();
      };

      ImageViewerUtil.prototype.setRotate = function () {
        // 旋转
        this.rotate();
      };

      ImageViewerUtil.prototype.destory = function () {
        this.imageContainerNode = null;
        this.imageNode = null;
        this.unbindEvent();
      };

      return ImageViewerUtil;
    }();

    return ImageViewerUtil;

}));