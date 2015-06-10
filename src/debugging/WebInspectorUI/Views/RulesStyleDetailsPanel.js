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

WebInspector.RulesStyleDetailsPanel = (function (_WebInspector$StyleDetailsPanel) {
    function RulesStyleDetailsPanel() {
        _classCallCheck(this, RulesStyleDetailsPanel);

        _get(Object.getPrototypeOf(RulesStyleDetailsPanel.prototype), "constructor", this).call(this, "rules", "rules", WebInspector.UIString("Rules"));

        this._sections = [];
    }

    _inherits(RulesStyleDetailsPanel, _WebInspector$StyleDetailsPanel);

    _createClass(RulesStyleDetailsPanel, [{
        key: "refresh",

        // Public

        value: function refresh(significantChange) {
            // We only need to do a rebuild on significant changes. Other changes are handled
            // by the sections and text editors themselves.
            if (!significantChange) return;

            var newSections = [];
            var newDOMFragment = document.createDocumentFragment();

            var previousMediaList = [];
            var previousSection = null;
            var previousFocusedSection = null;

            function mediaListsEqual(a, b) {
                a = a || [];
                b = b || [];

                if (a.length !== b.length) return false;

                for (var i = 0; i < a.length; ++i) {
                    var aMedia = a[i];
                    var bMedia = b[i];

                    if (aMedia.type !== bMedia.type) return false;

                    if (aMedia.text !== bMedia.text) return false;

                    if (!aMedia.sourceCodeLocation && bMedia.sourceCodeLocation) return false;

                    if (aMedia.sourceCodeLocation && !aMedia.sourceCodeLocation.isEqual(bMedia.sourceCodeLocation)) return false;
                }

                return true;
            }

            function filteredMediaList(mediaList) {
                if (!mediaList) return [];

                // Exclude the basic "screen" query since it's very common and just clutters things.
                return mediaList.filter(function (media) {
                    return media.text !== "screen";
                });
            }

            function uniqueOrderedStyles(orderedStyles) {
                var uniqueStyles = [];

                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = orderedStyles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var style = _step.value;

                        var rule = style.ownerRule;
                        if (!rule) {
                            uniqueStyles.push(style);
                            continue;
                        }

                        var found = false;
                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = uniqueStyles[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var existingStyle = _step2.value;

                                if (rule.isEqualTo(existingStyle.ownerRule)) {
                                    found = true;
                                    break;
                                }
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

                        if (!found) uniqueStyles.push(style);
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

                return uniqueStyles;
            }

            function appendStyleSection(style) {
                var section = style.__rulesSection;
                if (section && section.focused && !previousFocusedSection) previousFocusedSection = section;

                if (!section) {
                    section = new WebInspector.CSSStyleDeclarationSection(style);
                    style.__rulesSection = section;
                } else section.refresh();

                if (this._focusNextNewInspectorRule && style.ownerRule && style.ownerRule.type === WebInspector.CSSRule.Type.Inspector) {
                    previousFocusedSection = section;
                    delete this._focusNextNewInspectorRule;
                }

                // Reset lastInGroup in case the order/grouping changed.
                section.lastInGroup = false;

                newDOMFragment.appendChild(section.element);
                newSections.push(section);

                previousSection = section;
            }

            function addNewRuleButton() {
                if (previousSection) previousSection.lastInGroup = true;

                if (!this.nodeStyles.node.isInShadowTree()) {
                    var newRuleButton = document.createElement("div");
                    newRuleButton.className = "new-rule";
                    newRuleButton.addEventListener("click", this._newRuleClicked.bind(this));

                    newRuleButton.appendChild(document.createElement("img"));
                    newRuleButton.appendChild(document.createTextNode(WebInspector.UIString("New Rule")));

                    newDOMFragment.appendChild(newRuleButton);
                }

                addedNewRuleButton = true;
            }

            var pseudoElements = this.nodeStyles.pseudoElements;
            for (var pseudoIdentifier in pseudoElements) {
                var pseudoElement = pseudoElements[pseudoIdentifier];
                var orderedStyles = uniqueOrderedStyles(pseudoElement.orderedStyles);
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = orderedStyles[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var style = _step3.value;

                        appendStyleSection.call(this, style);
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

                if (previousSection) previousSection.lastInGroup = true;
            }

            var addedNewRuleButton = false;

            var orderedStyles = uniqueOrderedStyles(this.nodeStyles.orderedStyles);
            for (var i = 0; i < orderedStyles.length; ++i) {
                var style = orderedStyles[i];

                if (style.type === WebInspector.CSSStyleDeclaration.Type.Rule && !addedNewRuleButton) addNewRuleButton.call(this);

                if (previousSection && previousSection.style.node !== style.node) {
                    previousSection.lastInGroup = true;

                    var prefixElement = document.createElement("strong");
                    prefixElement.textContent = WebInspector.UIString("Inherited From: ");

                    var inheritedLabel = document.createElement("div");
                    inheritedLabel.className = "label";
                    inheritedLabel.appendChild(prefixElement);
                    inheritedLabel.appendChild(WebInspector.linkifyNodeReference(style.node));
                    newDOMFragment.appendChild(inheritedLabel);
                }

                // Only include the media list if it is different from the previous media list shown.
                var currentMediaList = filteredMediaList(style.ownerRule && style.ownerRule.mediaList);
                if (!mediaListsEqual(previousMediaList, currentMediaList)) {
                    previousMediaList = currentMediaList;

                    // Break the section group even if the media list is empty. That way the user knows
                    // the previous displayed media list does not apply to the next section.
                    if (previousSection) previousSection.lastInGroup = true;

                    for (var j = 0; j < currentMediaList.length; ++j) {
                        var media = currentMediaList[j];

                        var prefixElement = document.createElement("strong");
                        prefixElement.textContent = WebInspector.UIString("Media: ");

                        var mediaLabel = document.createElement("div");
                        mediaLabel.className = "label";
                        mediaLabel.appendChild(prefixElement);
                        mediaLabel.appendChild(document.createTextNode(media.text));

                        if (media.sourceCodeLocation) {
                            mediaLabel.appendChild(document.createTextNode(" — "));
                            mediaLabel.appendChild(WebInspector.createSourceCodeLocationLink(media.sourceCodeLocation, true));
                        }

                        newDOMFragment.appendChild(mediaLabel);
                    }
                }

                appendStyleSection.call(this, style);
            }

            if (!addedNewRuleButton) addNewRuleButton.call(this);

            if (previousSection) previousSection.lastInGroup = true;

            this.element.removeChildren();
            this.element.appendChild(newDOMFragment);

            this._sections = newSections;

            for (var i = 0; i < this._sections.length; ++i) this._sections[i].updateLayout();

            if (previousFocusedSection) previousFocusedSection.focus();
        }
    }, {
        key: "shown",

        // Protected

        value: function shown() {
            WebInspector.StyleDetailsPanel.prototype.shown.call(this);

            // Associate the style and section objects so they can be reused.
            // Also update the layout in case we changed widths while hidden.
            for (var i = 0; i < this._sections.length; ++i) {
                var section = this._sections[i];
                section.style.__rulesSection = section;
                section.updateLayout();
            }
        }
    }, {
        key: "hidden",
        value: function hidden() {
            WebInspector.StyleDetailsPanel.prototype.hidden.call(this);

            // Disconnect the style and section objects so they have a chance
            // to release their objects when this panel is not visible.
            for (var i = 0; i < this._sections.length; ++i) delete this._sections[i].style.__rulesSection;
        }
    }, {
        key: "widthDidChange",
        value: function widthDidChange() {
            for (var i = 0; i < this._sections.length; ++i) this._sections[i].updateLayout();
        }
    }, {
        key: "_newRuleClicked",

        // Private

        value: function _newRuleClicked(event) {
            this._focusNextNewInspectorRule = true;
            this.nodeStyles.addEmptyRule();
        }
    }]);

    return RulesStyleDetailsPanel;
})(WebInspector.StyleDetailsPanel);