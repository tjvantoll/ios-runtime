var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2015 Apple Inc. All rights reserved.
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

WebInspector.TabBarItem = (function (_WebInspector$Object) {
    function TabBarItem(image, title, pinned, representedObject) {
        _classCallCheck(this, TabBarItem);

        _get(Object.getPrototypeOf(TabBarItem.prototype), "constructor", this).call(this);

        this._parentTabBar = null;

        this._element = document.createElement("div");
        this._element.classList.add(WebInspector.TabBarItem.StyleClassName);
        if (pinned) this._element.classList.add("pinned");
        this._element[WebInspector.TabBarItem.ElementReferenceSymbol] = this;

        if (!pinned) {
            this._closeButtonElement = document.createElement("div");
            this._closeButtonElement.classList.add(WebInspector.TabBarItem.CloseButtonStyleClassName);
            this._closeButtonElement.title = WebInspector.UIString("Click to close this tab");
            this._element.appendChild(this._closeButtonElement);

            var flexSpaceElement = document.createElement("div");
            flexSpaceElement.classList.add("flex-space");
            this._element.appendChild(flexSpaceElement);
        }

        this._iconElement = document.createElement("img");
        this._iconElement.classList.add("icon");
        this._element.appendChild(this._iconElement);

        if (!pinned) {
            var flexSpaceElement = document.createElement("div");
            flexSpaceElement.classList.add("flex-space");
            this._element.appendChild(flexSpaceElement);
        }

        this.title = title;
        this.image = image;
        this.representedObject = representedObject;
    }

    _inherits(TabBarItem, _WebInspector$Object);

    _createClass(TabBarItem, [{
        key: "element",

        // Public

        get: function () {
            return this._element;
        }
    }, {
        key: "representedObject",
        get: function () {
            return this._representedObject;
        },
        set: function (representedObject) {
            this._representedObject = representedObject || null;
        }
    }, {
        key: "parentTabBar",
        get: function () {
            return this._parentTabBar;
        },
        set: function (tabBar) {
            this._parentTabBar = tabBar || null;
        }
    }, {
        key: "selected",
        get: function () {
            return this._element.classList.contains("selected");
        },
        set: function (selected) {
            this._element.classList.toggle("selected", selected);
        }
    }, {
        key: "disabled",
        get: function () {
            return this._element.classList.contains("disabled");
        },
        set: function (disabled) {
            this._element.classList.toggle("disabled", disabled);
        }
    }, {
        key: "hideCloseButton",
        get: function () {
            return this._element.classList.contains("hide-close-button");
        },
        set: function (hide) {
            this._element.classList.toggle("hide-close-button", hide);
        }
    }, {
        key: "pinned",
        get: function () {
            return this._element.classList.contains("pinned");
        }
    }, {
        key: "image",
        get: function () {
            return this._iconElement.src;
        },
        set: function (url) {
            this._iconElement.src = url || "";
        }
    }, {
        key: "title",
        get: function () {
            return this._element.title || "";
        },
        set: function (title) {
            if (title && !this.pinned) {
                this._titleElement = document.createElement("span");
                this._titleElement.classList.add("title");

                this._titleContentElement = document.createElement("span");
                this._titleContentElement.classList.add("content");
                this._titleElement.appendChild(this._titleContentElement);

                this._titleContentElement.textContent = title;

                this._element.insertBefore(this._titleElement, this._element.lastChild);
            } else {
                if (this._titleElement) this._titleElement.remove();

                this._titleContentElement = null;
                this._titleElement = null;
            }

            this._element.title = title || "";
        }
    }]);

    return TabBarItem;
})(WebInspector.Object);

WebInspector.TabBarItem.StyleClassName = "item";
WebInspector.TabBarItem.CloseButtonStyleClassName = "close";
WebInspector.TabBarItem.ElementReferenceSymbol = Symbol("tab-bar-item");