var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * Copyright (C) 2013 Apple Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. AND ITS CONTRIBUTORS ``AS IS''
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL APPLE INC. OR ITS CONTRIBUTORS
 * BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
 * THE POSSIBILITY OF SUCH DAMAGE.
 */

WebInspector.Point = (function () {
    function Point(x, y) {
        _classCallCheck(this, Point);

        this.x = x || 0;
        this.y = y || 0;
    }

    _createClass(Point, [{
        key: "toString",

        // Public

        value: function toString() {
            return "WebInspector.Point[" + this.x + "," + this.y + "]";
        }
    }, {
        key: "copy",
        value: function copy() {
            return new WebInspector.Point(this.x, this.y);
        }
    }, {
        key: "equals",
        value: function equals(anotherPoint) {
            return this.x === anotherPoint.x && this.y === anotherPoint.y;
        }
    }], [{
        key: "fromEvent",

        // Static

        value: function fromEvent(event) {
            return new WebInspector.Point(event.pageX, event.pageY);
        }
    }, {
        key: "fromEventInElement",
        value: function fromEventInElement(event, element) {
            var wkPoint = window.webkitConvertPointFromPageToNode(element, new WebKitPoint(event.pageX, event.pageY));
            return new WebInspector.Point(wkPoint.x, wkPoint.y);
        }
    }]);

    return Point;
})();

WebInspector.Size = (function () {
    function Size(width, height) {
        _classCallCheck(this, Size);

        this.width = width || 0;
        this.height = height || 0;
    }

    _createClass(Size, [{
        key: "toString",

        // Public

        value: function toString() {
            return "WebInspector.Size[" + this.width + "," + this.height + "]";
        }
    }, {
        key: "copy",
        value: function copy() {
            return new WebInspector.Size(this.width, this.height);
        }
    }, {
        key: "equals",
        value: function equals(anotherSize) {
            return this.width === anotherSize.width && this.height === anotherSize.height;
        }
    }]);

    return Size;
})();

WebInspector.Size.ZERO_SIZE = new WebInspector.Size(0, 0);

WebInspector.Rect = (function () {
    function Rect(x, y, width, height) {
        _classCallCheck(this, Rect);

        this.origin = new WebInspector.Point(x || 0, y || 0);
        this.size = new WebInspector.Size(width || 0, height || 0);
    }

    _createClass(Rect, [{
        key: "toString",

        // Public

        value: function toString() {
            return "WebInspector.Rect[" + [this.origin.x, this.origin.y, this.size.width, this.size.height].join(", ") + "]";
        }
    }, {
        key: "copy",
        value: function copy() {
            return new WebInspector.Rect(this.origin.x, this.origin.y, this.size.width, this.size.height);
        }
    }, {
        key: "equals",
        value: function equals(anotherRect) {
            return this.origin.equals(anotherRect.origin) && this.size.equals(anotherRect.size);
        }
    }, {
        key: "inset",
        value: function inset(insets) {
            return new WebInspector.Rect(this.origin.x + insets.left, this.origin.y + insets.top, this.size.width - insets.left - insets.right, this.size.height - insets.top - insets.bottom);
        }
    }, {
        key: "pad",
        value: function pad(padding) {
            return new WebInspector.Rect(this.origin.x - padding, this.origin.y - padding, this.size.width + padding * 2, this.size.height + padding * 2);
        }
    }, {
        key: "minX",
        value: function minX() {
            return this.origin.x;
        }
    }, {
        key: "minY",
        value: function minY() {
            return this.origin.y;
        }
    }, {
        key: "midX",
        value: function midX() {
            return this.origin.x + this.size.width / 2;
        }
    }, {
        key: "midY",
        value: function midY() {
            return this.origin.y + this.size.height / 2;
        }
    }, {
        key: "maxX",
        value: function maxX() {
            return this.origin.x + this.size.width;
        }
    }, {
        key: "maxY",
        value: function maxY() {
            return this.origin.y + this.size.height;
        }
    }, {
        key: "intersectionWithRect",
        value: function intersectionWithRect(rect) {
            var x1 = Math.max(this.minX(), rect.minX());
            var x2 = Math.min(this.maxX(), rect.maxX());
            if (x1 > x2) return WebInspector.Rect.ZERO_RECT;
            var intersection = new WebInspector.Rect();
            intersection.origin.x = x1;
            intersection.size.width = x2 - x1;
            var y1 = Math.max(this.minY(), rect.minY());
            var y2 = Math.min(this.maxY(), rect.maxY());
            if (y1 > y2) return WebInspector.Rect.ZERO_RECT;
            intersection.origin.y = y1;
            intersection.size.height = y2 - y1;
            return intersection;
        }
    }, {
        key: "unionWithRect",
        value: function unionWithRect(rect) {
            var x = Math.min(this.minX(), rect.minX());
            var y = Math.min(this.minY(), rect.minY());
            var width = Math.max(this.maxX(), rect.maxX()) - x;
            var height = Math.max(this.maxY(), rect.maxY()) - y;
            return new WebInspector.Rect(x, y, width, height);
        }
    }, {
        key: "round",
        value: function round() {
            return new WebInspector.Rect(Math.floor(this.origin.x), Math.floor(this.origin.y), Math.ceil(this.size.width), Math.ceil(this.size.height));
        }
    }], [{
        key: "rectFromClientRect",

        // Static

        value: function rectFromClientRect(clientRect) {
            return new WebInspector.Rect(clientRect.left, clientRect.top, clientRect.width, clientRect.height);
        }
    }, {
        key: "unionOfRects",
        value: function unionOfRects(rects) {
            var union = rects[0];
            for (var i = 1; i < rects.length; ++i) union = union.unionWithRect(rects[i]);
            return union;
        }
    }]);

    return Rect;
})();

WebInspector.Rect.ZERO_RECT = new WebInspector.Rect(0, 0, 0, 0);

WebInspector.EdgeInsets = (function () {
    function EdgeInsets(top, right, bottom, left) {
        _classCallCheck(this, EdgeInsets);

        console.assert(arguments.length === 1 || arguments.length === 4);

        if (arguments.length === 1) {
            this.top = top;
            this.right = top;
            this.bottom = top;
            this.left = top;
        } else if (arguments.length === 4) {
            this.top = top;
            this.right = right;
            this.bottom = bottom;
            this.left = left;
        }
    }

    _createClass(EdgeInsets, [{
        key: "equals",

        // Public

        value: function equals(anotherInset) {
            return this.top === anotherInset.top && this.right === anotherInset.right && this.bottom === anotherInset.bottom && this.left === anotherInset.left;
        }
    }, {
        key: "copy",
        value: function copy() {
            return new WebInspector.EdgeInsets(this.top, this.right, this.bottom, this.left);
        }
    }]);

    return EdgeInsets;
})();

WebInspector.RectEdge = {
    MIN_X: 0,
    MIN_Y: 1,
    MAX_X: 2,
    MAX_Y: 3
};

WebInspector.Quad = (function () {
    function Quad(quad) {
        _classCallCheck(this, Quad);

        this.points = [new WebInspector.Point(quad[0], quad[1]), // top left
        new WebInspector.Point(quad[2], quad[3]), // top right
        new WebInspector.Point(quad[4], quad[5]), // bottom right
        new WebInspector.Point(quad[6], quad[7]) // bottom left
        ];

        this.width = Math.round(Math.sqrt(Math.pow(quad[0] - quad[2], 2) + Math.pow(quad[1] - quad[3], 2)));
        this.height = Math.round(Math.sqrt(Math.pow(quad[0] - quad[6], 2) + Math.pow(quad[1] - quad[7], 2)));
    }

    _createClass(Quad, [{
        key: "toProtocol",

        // Public

        value: function toProtocol() {
            return [this.points[0].x, this.points[0].y, this.points[1].x, this.points[1].y, this.points[2].x, this.points[2].y, this.points[3].x, this.points[3].y];
        }
    }]);

    return Quad;
})();

WebInspector.Polygon = (function () {
    function Polygon(points) {
        _classCallCheck(this, Polygon);

        this.points = points;
    }

    _createClass(Polygon, [{
        key: "bounds",

        // Public

        value: function bounds() {
            var minX = Number.MAX_VALUE;
            var minY = Number.MAX_VALUE;
            var maxX = -Number.MAX_VALUE;
            var maxY = -Number.MAX_VALUE;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.points[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var point = _step.value;

                    minX = Math.min(minX, point.x);
                    maxX = Math.max(maxX, point.x);
                    minY = Math.min(minY, point.y);
                    maxY = Math.max(maxY, point.y);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator["return"]) {
                        _iterator["return"]();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return new WebInspector.Rect(minX, minY, maxX - minX, maxY - minY);
        }
    }]);

    return Polygon;
})();