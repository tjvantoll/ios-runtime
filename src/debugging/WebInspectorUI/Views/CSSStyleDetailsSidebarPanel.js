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

WebInspector.CSSStyleDetailsSidebarPanel = (function (_WebInspector$DOMDetailsSidebarPanel) {
    function CSSStyleDetailsSidebarPanel() {
        _classCallCheck(this, CSSStyleDetailsSidebarPanel);

        _get(Object.getPrototypeOf(CSSStyleDetailsSidebarPanel.prototype), "constructor", this).call(this, "css-style", WebInspector.UIString("Styles"), WebInspector.UIString("Style"));

        this._selectedPanel = null;

        this._navigationBar = new WebInspector.NavigationBar(null, null, "tablist");
        this._navigationBar.addEventListener(WebInspector.NavigationBar.Event.NavigationItemSelected, this._navigationItemSelected, this);
        this.element.insertBefore(this._navigationBar.element, this.contentElement);

        this._forcedPseudoClassCheckboxes = {};

        if (WebInspector.cssStyleManager.canForcePseudoClasses()) {
            this._forcedPseudoClassContainer = document.createElement("div");
            this._forcedPseudoClassContainer.className = WebInspector.CSSStyleDetailsSidebarPanel.PseudoClassesElementStyleClassName;

            var groupElement = null;

            WebInspector.CSSStyleManager.ForceablePseudoClasses.forEach(function (pseudoClass) {
                // We don't localize the label since it is a CSS pseudo-class from the CSS standard.
                var label = pseudoClass.capitalize();

                var labelElement = document.createElement("label");

                var checkboxElement = document.createElement("input");
                checkboxElement.addEventListener("change", this._forcedPseudoClassCheckboxChanged.bind(this, pseudoClass));
                checkboxElement.type = "checkbox";

                this._forcedPseudoClassCheckboxes[pseudoClass] = checkboxElement;

                labelElement.appendChild(checkboxElement);
                labelElement.appendChild(document.createTextNode(label));

                if (!groupElement || groupElement.children.length === 2) {
                    groupElement = document.createElement("div");
                    groupElement.className = WebInspector.CSSStyleDetailsSidebarPanel.PseudoClassesGroupElementStyleClassName;
                    this._forcedPseudoClassContainer.appendChild(groupElement);
                }

                groupElement.appendChild(labelElement);
            }, this);

            this.contentElement.appendChild(this._forcedPseudoClassContainer);
        }

        this._computedStyleDetailsPanel = new WebInspector.ComputedStyleDetailsPanel();
        this._rulesStyleDetailsPanel = new WebInspector.RulesStyleDetailsPanel();
        this._metricsStyleDetailsPanel = new WebInspector.MetricsStyleDetailsPanel();

        this._panels = [this._computedStyleDetailsPanel, this._rulesStyleDetailsPanel, this._metricsStyleDetailsPanel];

        this._navigationBar.addNavigationItem(this._computedStyleDetailsPanel.navigationItem);
        this._navigationBar.addNavigationItem(this._rulesStyleDetailsPanel.navigationItem);
        this._navigationBar.addNavigationItem(this._metricsStyleDetailsPanel.navigationItem);

        this._lastSelectedSectionSetting = new WebInspector.Setting("last-selected-style-details-panel", this._rulesStyleDetailsPanel.navigationItem.identifier);

        // This will cause the selected panel to be set in _navigationItemSelected.
        this._navigationBar.selectedNavigationItem = this._lastSelectedSectionSetting.value;
    }

    _inherits(CSSStyleDetailsSidebarPanel, _WebInspector$DOMDetailsSidebarPanel);

    _createClass(CSSStyleDetailsSidebarPanel, [{
        key: "supportsDOMNode",

        // Public

        value: function supportsDOMNode(nodeToInspect) {
            return nodeToInspect.nodeType() === Node.ELEMENT_NODE;
        }
    }, {
        key: "refresh",
        value: function refresh() {
            var domNode = this.domNode;
            if (!domNode) return;

            this.contentElement.scrollTop = this._initialScrollOffset;

            for (var i = 0; i < this._panels.length; ++i) {
                delete this._panels[i].element._savedScrollTop;
                this._panels[i].markAsNeedsRefresh(domNode);
            }

            this._updatePseudoClassCheckboxes();
        }
    }, {
        key: "visibilityDidChange",
        value: function visibilityDidChange() {
            WebInspector.SidebarPanel.prototype.visibilityDidChange.call(this);

            if (!this._selectedPanel) return;

            if (!this.visible) {
                this._selectedPanel.hidden();
                return;
            }

            this._navigationBar.updateLayout();

            this._updateNoForcedPseudoClassesScrollOffset();

            this._selectedPanel.shown();
            this._selectedPanel.markAsNeedsRefresh(this.domNode);
        }
    }, {
        key: "widthDidChange",
        value: function widthDidChange() {
            this._updateNoForcedPseudoClassesScrollOffset();

            if (this._selectedPanel) this._selectedPanel.widthDidChange();
        }
    }, {
        key: "addEventListeners",

        // Protected

        value: function addEventListeners() {
            this.domNode.addEventListener(WebInspector.DOMNode.Event.EnabledPseudoClassesChanged, this._updatePseudoClassCheckboxes, this);
        }
    }, {
        key: "removeEventListeners",
        value: function removeEventListeners() {
            this.domNode.removeEventListener(null, null, this);
        }
    }, {
        key: "_updateNoForcedPseudoClassesScrollOffset",
        value: function _updateNoForcedPseudoClassesScrollOffset() {
            if (this._forcedPseudoClassContainer) WebInspector.CSSStyleDetailsSidebarPanel.NoForcedPseudoClassesScrollOffset = this._forcedPseudoClassContainer.offsetHeight;
        }
    }, {
        key: "_navigationItemSelected",
        value: function _navigationItemSelected(event) {
            console.assert(event.target.selectedNavigationItem);
            if (!event.target.selectedNavigationItem) return;

            var selectedNavigationItem = event.target.selectedNavigationItem;

            var selectedPanel = null;
            for (var i = 0; i < this._panels.length; ++i) {
                if (this._panels[i].navigationItem !== selectedNavigationItem) continue;
                selectedPanel = this._panels[i];
                break;
            }

            console.assert(selectedPanel);

            if (this._selectedPanel) {
                this._selectedPanel.hidden();
                this._selectedPanel.element._savedScrollTop = this.contentElement.scrollTop;
                this._selectedPanel.element.remove();
            }

            this._selectedPanel = selectedPanel;

            if (this._selectedPanel) {
                this.contentElement.appendChild(this._selectedPanel.element);

                if (typeof this._selectedPanel.element._savedScrollTop === "number") this.contentElement.scrollTop = this._selectedPanel.element._savedScrollTop;else this.contentElement.scrollTop = this._initialScrollOffset;

                this._selectedPanel.shown();
            }

            this._lastSelectedSectionSetting.value = selectedNavigationItem.identifier;
        }
    }, {
        key: "_forcedPseudoClassCheckboxChanged",
        value: function _forcedPseudoClassCheckboxChanged(pseudoClass, event) {
            if (!this.domNode) return;

            this.domNode.setPseudoClassEnabled(pseudoClass, event.target.checked);
        }
    }, {
        key: "_updatePseudoClassCheckboxes",
        value: function _updatePseudoClassCheckboxes() {
            if (!this.domNode) return;

            var enabledPseudoClasses = this.domNode.enabledPseudoClasses;

            for (var pseudoClass in this._forcedPseudoClassCheckboxes) {
                var checkboxElement = this._forcedPseudoClassCheckboxes[pseudoClass];
                checkboxElement.checked = enabledPseudoClasses.includes(pseudoClass);
            }
        }
    }, {
        key: "_initialScrollOffset",

        // Private

        get: function () {
            if (!WebInspector.cssStyleManager.canForcePseudoClasses()) return 0;
            return this.domNode && this.domNode.enabledPseudoClasses.length ? 0 : WebInspector.CSSStyleDetailsSidebarPanel.NoForcedPseudoClassesScrollOffset;
        }
    }]);

    return CSSStyleDetailsSidebarPanel;
})(WebInspector.DOMDetailsSidebarPanel);

WebInspector.CSSStyleDetailsSidebarPanel.PseudoClassesElementStyleClassName = "pseudo-classes";
WebInspector.CSSStyleDetailsSidebarPanel.PseudoClassesGroupElementStyleClassName = "group";
WebInspector.CSSStyleDetailsSidebarPanel.NoForcedPseudoClassesScrollOffset = 38; // Default height of the forced pseudo classes container. Updated in widthDidChange.