var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2014-2015 Apple Inc. All rights reserved.
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

WebInspector.TypePropertiesSection = function (types, title, subtitle) {
    this.emptyPlaceholder = WebInspector.UIString("No Properties");
    this.types = types;
    this._typeSet = WebInspector.TypeSet.fromPayload(this.types);

    WebInspector.PropertiesSection.call(this, title, subtitle);
};

WebInspector.TypePropertiesSection.prototype = {
    constructor: WebInspector.TypePropertiesSection,
    __proto__: WebInspector.PropertiesSection.prototype,

    onpopulate: function onpopulate() {
        this.propertiesTreeOutline.removeChildren();

        var primitiveTypeNames = this._typeSet.primitiveTypeNames;
        var structures = this.types.structures;
        var properties = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = structures[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var struct = _step.value;

                properties.push({
                    name: struct.constructorName,
                    structure: struct
                });
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

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = primitiveTypeNames[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var primitiveName = _step2.value;

                properties.push({
                    name: primitiveName,
                    structure: null
                });
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                    _iterator2["return"]();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }

        properties.sort(WebInspector.TypePropertiesSection.PropertyComparator);

        if (this.types.isTruncated) properties.push({ name: "…", structure: null });

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = properties[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var property = _step3.value;

                this.propertiesTreeOutline.appendChild(new WebInspector.TypePropertyTreeElement(property));
            }
        } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
                    _iterator3["return"]();
                }
            } finally {
                if (_didIteratorError3) {
                    throw _iteratorError3;
                }
            }
        }

        if (!this.propertiesTreeOutline.children.length) {
            var title = document.createElement("div");
            title.className = "info";
            title.textContent = this.emptyPlaceholder;
            var infoElement = new WebInspector.TreeElement(title, null, false);
            this.propertiesTreeOutline.appendChild(infoElement);
        }

        this.dispatchEventToListeners(WebInspector.Section.Event.VisibleContentDidChange);

        if (properties.length === 1) this.propertiesTreeOutline.children[0].expandRecursively();
    }
};

// This is mostly identical to ObjectTreeView.compareProperties.
// But this checks for equality because we can have two objects named the same thing.
WebInspector.TypePropertiesSection.PropertyComparator = function (propertyA, propertyB) {
    var a = propertyA.name;
    var b = propertyB.name;
    if (a.indexOf("__proto__") !== -1) return 1;
    if (b.indexOf("__proto__") !== -1) return -1;
    if (a === b) return 0;

    var diff = 0;
    var chunk = /^\d+|^\D+/;
    var chunka, chunkb, anum, bnum;
    while (diff === 0) {
        if (!a && b) return -1;
        if (!b && a) return 1;
        chunka = a.match(chunk)[0];
        chunkb = b.match(chunk)[0];
        anum = !isNaN(chunka);
        bnum = !isNaN(chunkb);
        if (anum && !bnum) return -1;
        if (bnum && !anum) return 1;
        if (anum && bnum) {
            diff = chunka - chunkb;
            if (diff === 0 && chunka.length !== chunkb.length) {
                if (! +chunka && ! +chunkb) // chunks are strings of all 0s (special case)
                    return chunka.length - chunkb.length;else return chunkb.length - chunka.length;
            }
        } else if (chunka !== chunkb) return chunka < chunkb ? -1 : 1;
        a = a.substring(chunka.length);
        b = b.substring(chunkb.length);
    }

    return diff;
};

WebInspector.TypePropertyTreeElement = (function (_WebInspector$TreeElement) {
    function TypePropertyTreeElement(property) {
        _classCallCheck(this, TypePropertyTreeElement);

        var titleElement = document.createElement("span");
        _get(Object.getPrototypeOf(TypePropertyTreeElement.prototype), "constructor", this).call(this, titleElement, null, false);

        this.property = property;

        titleElement.className = "name";
        titleElement.textContent = this.property.name;

        this.toggleOnClick = true;
        this.hasChildren = !!this.property.structure;
    }

    _inherits(TypePropertyTreeElement, _WebInspector$TreeElement);

    _createClass(TypePropertyTreeElement, [{
        key: "onpopulate",
        value: function onpopulate() {
            this.removeChildren();

            var properties = [];
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = this.property.structure.fields[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var fieldName = _step4.value;

                    properties.push({
                        name: fieldName,
                        structure: null
                    });
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
                        _iterator4["return"]();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            properties.sort(WebInspector.TypePropertiesSection.PropertyComparator);

            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = properties[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var property = _step5.value;

                    this.appendChild(new WebInspector.TypePropertyTreeElement(property));
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5["return"]) {
                        _iterator5["return"]();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            properties = [];
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = this.property.structure.optionalFields[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var fieldName = _step6.value;

                    properties.push({
                        name: fieldName + "?",
                        structure: null
                    });
                }
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6["return"]) {
                        _iterator6["return"]();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
                    }
                }
            }

            properties.sort(WebInspector.TypePropertiesSection.PropertyComparator);

            if (this.property.structure.isImprecise) properties.push({ name: "…", structure: null });

            if (this.property.structure.prototypeStructure) {
                properties.push({
                    name: this.property.structure.prototypeStructure.constructorName + " (" + WebInspector.UIString("Prototype") + ")",
                    structure: this.property.structure.prototypeStructure
                });
            }

            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = properties[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var property = _step7.value;

                    this.appendChild(new WebInspector.TypePropertyTreeElement(property));
                }
            } catch (err) {
                _didIteratorError7 = true;
                _iteratorError7 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion7 && _iterator7["return"]) {
                        _iterator7["return"]();
                    }
                } finally {
                    if (_didIteratorError7) {
                        throw _iteratorError7;
                    }
                }
            }
        }
    }]);

    return TypePropertyTreeElement;
})(WebInspector.TreeElement);