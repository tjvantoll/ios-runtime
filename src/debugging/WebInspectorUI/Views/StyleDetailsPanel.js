var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2013, 2015 Apple Inc. All rights reserved.
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

WebInspector.StyleDetailsPanel = (function (_WebInspector$Object) {
    function StyleDetailsPanel(className, identifier, label) {
        _classCallCheck(this, StyleDetailsPanel);

        _get(Object.getPrototypeOf(StyleDetailsPanel.prototype), "constructor", this).call(this);

        this._element = document.createElement("div");
        this._element.className = className;

        // Add this offset-sections class name so the sticky headers don't overlap the navigation bar.
        this.element.classList.add("offset-sections");

        this._navigationItem = new WebInspector.RadioButtonNavigationItem(identifier, label);

        this._nodeStyles = null;
        this._visible = false;
    }

    _inherits(StyleDetailsPanel, _WebInspector$Object);

    _createClass(StyleDetailsPanel, [{
        key: "shown",
        value: function shown() {
            if (this._visible) return;

            this._visible = true;

            this._refreshNodeStyles();
        }
    }, {
        key: "hidden",
        value: function hidden() {
            this._visible = false;
        }
    }, {
        key: "widthDidChange",
        value: function widthDidChange() {}
    }, {
        key: "markAsNeedsRefresh",
        value: function markAsNeedsRefresh(domNode) {
            console.assert(domNode);
            if (!domNode) return;

            if (!this._nodeStyles || this._nodeStyles.node !== domNode) {
                if (this._nodeStyles) {
                    this._nodeStyles.removeEventListener(WebInspector.DOMNodeStyles.Event.Refreshed, this._nodeStylesRefreshed, this);
                    this._nodeStyles.removeEventListener(WebInspector.DOMNodeStyles.Event.NeedsRefresh, this._nodeStylesNeedsRefreshed, this);
                }

                this._nodeStyles = WebInspector.cssStyleManager.stylesForNode(domNode);

                console.assert(this._nodeStyles);
                if (!this._nodeStyles) return;

                this._nodeStyles.addEventListener(WebInspector.DOMNodeStyles.Event.Refreshed, this._nodeStylesRefreshed, this);
                this._nodeStyles.addEventListener(WebInspector.DOMNodeStyles.Event.NeedsRefresh, this._nodeStylesNeedsRefreshed, this);

                this._forceSignificantChange = true;
            }

            if (this._visible) this._refreshNodeStyles();
        }
    }, {
        key: "refresh",
        value: function refresh(significantChange) {}
    }, {
        key: "_refreshNodeStyles",
        value: function _refreshNodeStyles() {
            if (!this._nodeStyles) return;
            this._nodeStyles.refresh();
        }
    }, {
        key: "_refreshPreservingScrollPosition",
        value: function _refreshPreservingScrollPosition(significantChange) {
            significantChange = this._forceSignificantChange || significantChange || false;
            delete this._forceSignificantChange;

            var previousScrollTop = this._initialScrollOffset;

            // Only remember the scroll position if the previous node is the same as this one.
            if (this.element.parentNode && this._previousRefreshNodeIdentifier === this._nodeStyles.node.id) previousScrollTop = this.element.parentNode.scrollTop;

            this.refresh(significantChange);

            this._previousRefreshNodeIdentifier = this._nodeStyles.node.id;

            if (this.element.parentNode) this.element.parentNode.scrollTop = previousScrollTop;
        }
    }, {
        key: "_nodeStylesRefreshed",
        value: function _nodeStylesRefreshed(event) {
            if (this._visible) this._refreshPreservingScrollPosition(event.data.significantChange);
        }
    }, {
        key: "_nodeStylesNeedsRefreshed",
        value: function _nodeStylesNeedsRefreshed(event) {
            if (this._visible) this._refreshNodeStyles();
        }
    }, {
        key: "element",

        // Public

        get: function () {
            return this._element;
        }
    }, {
        key: "navigationItem",
        get: function () {
            return this._navigationItem;
        }
    }, {
        key: "nodeStyles",
        get: function () {
            return this._nodeStyles;
        }
    }, {
        key: "_initialScrollOffset",

        // Private

        get: function () {
            if (!WebInspector.cssStyleManager.canForcePseudoClasses()) return 0;
            return this.nodeStyles.node.enabledPseudoClasses.length ? 0 : WebInspector.CSSStyleDetailsSidebarPanel.NoForcedPseudoClassesScrollOffset;
        }
    }]);

    return StyleDetailsPanel;
})(WebInspector.Object);

// Implemented by subclasses.

// Implemented by subclasses.