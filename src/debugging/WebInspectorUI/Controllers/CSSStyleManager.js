var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

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

WebInspector.CSSStyleManager = (function (_WebInspector$Object) {
    function CSSStyleManager() {
        _classCallCheck(this, CSSStyleManager);

        _get(Object.getPrototypeOf(CSSStyleManager.prototype), "constructor", this).call(this);

        if (window.CSSAgent) CSSAgent.enable();

        WebInspector.Frame.addEventListener(WebInspector.Frame.Event.MainResourceDidChange, this._mainResourceDidChange, this);
        WebInspector.Frame.addEventListener(WebInspector.Frame.Event.ResourceWasAdded, this._resourceAdded, this);
        WebInspector.Resource.addEventListener(WebInspector.SourceCode.Event.ContentDidChange, this._resourceContentDidChange, this);
        WebInspector.Resource.addEventListener(WebInspector.Resource.Event.TypeDidChange, this._resourceTypeDidChange, this);

        WebInspector.DOMNode.addEventListener(WebInspector.DOMNode.Event.AttributeModified, this._nodeAttributesDidChange, this);
        WebInspector.DOMNode.addEventListener(WebInspector.DOMNode.Event.AttributeRemoved, this._nodeAttributesDidChange, this);
        WebInspector.DOMNode.addEventListener(WebInspector.DOMNode.Event.EnabledPseudoClassesChanged, this._nodePseudoClassesDidChange, this);

        this._colorFormatSetting = new WebInspector.Setting("default-color-format", WebInspector.Color.Format.Original);

        this._styleSheetIdentifierMap = {};
        this._styleSheetFrameURLMap = {};
        this._nodeStylesMap = {};
    }

    _inherits(CSSStyleManager, _WebInspector$Object);

    _createClass(CSSStyleManager, [{
        key: "canForcePseudoClasses",
        value: function canForcePseudoClasses() {
            return window.CSSAgent && !!CSSAgent.forcePseudoState;
        }
    }, {
        key: "propertyNameHasOtherVendorPrefix",
        value: function propertyNameHasOtherVendorPrefix(name) {
            if (!name || name.length < 4 || name.charAt(0) !== "-") return false;

            var match = name.match(/^(?:-moz-|-ms-|-o-|-epub-)/);
            if (!match) return false;

            return true;
        }
    }, {
        key: "propertyValueHasOtherVendorKeyword",
        value: function propertyValueHasOtherVendorKeyword(value) {
            var match = value.match(/(?:-moz-|-ms-|-o-|-epub-)[-\w]+/);
            if (!match) return false;

            return true;
        }
    }, {
        key: "canonicalNameForPropertyName",
        value: function canonicalNameForPropertyName(name) {
            if (!name || name.length < 8 || name.charAt(0) !== "-") return name;

            var match = name.match(/^(?:-webkit-|-khtml-|-apple-)(.+)/);
            if (!match) return name;

            return match[1];
        }
    }, {
        key: "styleSheetForIdentifier",
        value: function styleSheetForIdentifier(id) {
            if (id in this._styleSheetIdentifierMap) return this._styleSheetIdentifierMap[id];

            var styleSheet = new WebInspector.CSSStyleSheet(id);
            this._styleSheetIdentifierMap[id] = styleSheet;
            return styleSheet;
        }
    }, {
        key: "stylesForNode",
        value: function stylesForNode(node) {
            if (node.id in this._nodeStylesMap) return this._nodeStylesMap[node.id];

            var styles = new WebInspector.DOMNodeStyles(node);
            this._nodeStylesMap[node.id] = styles;
            return styles;
        }
    }, {
        key: "mediaQueryResultChanged",

        // Protected

        value: function mediaQueryResultChanged() {
            // Called from WebInspector.CSSObserver.

            for (var key in this._nodeStylesMap) this._nodeStylesMap[key].mediaQueryResultDidChange();
        }
    }, {
        key: "styleSheetChanged",
        value: function styleSheetChanged(styleSheetIdentifier) {
            // Called from WebInspector.CSSObserver.
            var styleSheet = this.styleSheetForIdentifier(styleSheetIdentifier);
            console.assert(styleSheet);

            // Do not observe inline styles
            if (styleSheet.isInlineStyle()) return;

            styleSheet.noteContentDidChange();
            this._updateResourceContent(styleSheet);
        }
    }, {
        key: "_nodePseudoClassesDidChange",

        // Private

        value: function _nodePseudoClassesDidChange(event) {
            var node = event.target;

            for (var key in this._nodeStylesMap) {
                var nodeStyles = this._nodeStylesMap[key];
                if (nodeStyles.node !== node && !nodeStyles.node.isDescendant(node)) continue;
                nodeStyles.pseudoClassesDidChange(node);
            }
        }
    }, {
        key: "_nodeAttributesDidChange",
        value: function _nodeAttributesDidChange(event) {
            var node = event.target;

            for (var key in this._nodeStylesMap) {
                var nodeStyles = this._nodeStylesMap[key];
                if (nodeStyles.node !== node && !nodeStyles.node.isDescendant(node)) continue;
                nodeStyles.attributeDidChange(node, event.data.name);
            }
        }
    }, {
        key: "_mainResourceDidChange",
        value: function _mainResourceDidChange(event) {
            console.assert(event.target instanceof WebInspector.Frame);

            if (!event.target.isMainFrame()) return;

            // Clear our maps when the main frame navigates.

            this._styleSheetIdentifierMap = {};
            this._styleSheetFrameURLMap = {};
            this._nodeStylesMap = {};
        }
    }, {
        key: "_resourceAdded",
        value: function _resourceAdded(event) {
            console.assert(event.target instanceof WebInspector.Frame);

            var resource = event.data.resource;
            console.assert(resource);

            if (resource.type !== WebInspector.Resource.Type.Stylesheet) return;

            this._clearStyleSheetsForResource(resource);
        }
    }, {
        key: "_resourceTypeDidChange",
        value: function _resourceTypeDidChange(event) {
            console.assert(event.target instanceof WebInspector.Resource);

            var resource = event.target;
            if (resource.type !== WebInspector.Resource.Type.Stylesheet) return;

            this._clearStyleSheetsForResource(resource);
        }
    }, {
        key: "_clearStyleSheetsForResource",
        value: function _clearStyleSheetsForResource(resource) {
            // Clear known stylesheets for this URL and frame. This will cause the stylesheets to
            // be updated next time _fetchInfoForAllStyleSheets is called.
            // COMPATIBILITY (iOS 6): The frame's id was not available for the key, so delete just the url too.
            delete this._styleSheetFrameURLMap[this._frameURLMapKey(resource.parentFrame, resource.url)];
            delete this._styleSheetFrameURLMap[resource.url];
        }
    }, {
        key: "_frameURLMapKey",
        value: function _frameURLMapKey(frame, url) {
            return (frame ? frame.id + ":" : "") + url;
        }
    }, {
        key: "_lookupStyleSheetForResource",
        value: function _lookupStyleSheetForResource(resource, callback) {
            this._lookupStyleSheet(resource.parentFrame, resource.url, callback);
        }
    }, {
        key: "_lookupStyleSheet",
        value: function _lookupStyleSheet(frame, url, callback) {
            console.assert(frame instanceof WebInspector.Frame);

            function syleSheetsFetched() {
                callback(this._styleSheetFrameURLMap[key] || this._styleSheetFrameURLMap[url] || null);
            }

            var key = this._frameURLMapKey(frame, url);

            // COMPATIBILITY (iOS 6): The frame's id was not available for the key, so check for just the url too.
            if (key in this._styleSheetFrameURLMap || url in this._styleSheetFrameURLMap) callback(this._styleSheetFrameURLMap[key] || this._styleSheetFrameURLMap[url] || null);else this._fetchInfoForAllStyleSheets(syleSheetsFetched.bind(this));
        }
    }, {
        key: "_fetchInfoForAllStyleSheets",
        value: function _fetchInfoForAllStyleSheets(callback) {
            console.assert(typeof callback === "function");

            function processStyleSheets(error, styleSheets) {
                this._styleSheetFrameURLMap = {};

                if (error) {
                    callback();
                    return;
                }

                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = styleSheets[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var styleSheetInfo = _step.value;

                        // COMPATIBILITY (iOS 6): The info did not have 'frameId', so make parentFrame null in that case.
                        var parentFrame = "frameId" in styleSheetInfo ? WebInspector.frameResourceManager.frameForIdentifier(styleSheetInfo.frameId) : null;

                        var styleSheet = this.styleSheetForIdentifier(styleSheetInfo.styleSheetId);
                        styleSheet.updateInfo(styleSheetInfo.sourceURL, parentFrame);

                        var key = this._frameURLMapKey(parentFrame, styleSheetInfo.sourceURL);
                        this._styleSheetFrameURLMap[key] = styleSheet;
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

                callback();
            }

            CSSAgent.getAllStyleSheets(processStyleSheets.bind(this));
        }
    }, {
        key: "_resourceContentDidChange",
        value: function _resourceContentDidChange(event) {
            var resource = event.target;
            if (resource === this._ignoreResourceContentDidChangeEventForResource) return;

            // Ignore if it isn't a CSS stylesheet.
            if (resource.type !== WebInspector.Resource.Type.Stylesheet || resource.syntheticMIMEType !== "text/css") return;

            function applyStyleSheetChanges() {
                function styleSheetFound(styleSheet) {
                    delete resource.__pendingChangeTimeout;

                    console.assert(styleSheet);
                    if (!styleSheet) return;

                    // To prevent updating a TextEditor's content while the user is typing in it we want to
                    // ignore the next _updateResourceContent call.
                    resource.__ignoreNextUpdateResourceContent = true;

                    WebInspector.branchManager.currentBranch.revisionForRepresentedObject(styleSheet).content = resource.content;
                }

                this._lookupStyleSheetForResource(resource, styleSheetFound.bind(this));
            }

            if (resource.__pendingChangeTimeout) clearTimeout(resource.__pendingChangeTimeout);
            resource.__pendingChangeTimeout = setTimeout(applyStyleSheetChanges.bind(this), 500);
        }
    }, {
        key: "_updateResourceContent",
        value: function _updateResourceContent(styleSheet) {
            console.assert(styleSheet);

            function fetchedStyleSheetContent(parameters) {
                var styleSheet = parameters.sourceCode;
                var content = parameters.content;

                delete styleSheet.__pendingChangeTimeout;

                console.assert(styleSheet.url);
                if (!styleSheet.url) return;

                var resource = null;

                // COMPATIBILITY (iOS 6): The stylesheet did not always have a frame, so fallback to looking
                // for the resource in all frames.
                if (styleSheet.parentFrame) resource = styleSheet.parentFrame.resourceForURL(styleSheet.url);else resource = WebInspector.frameResourceManager.resourceForURL(styleSheet.url);

                if (!resource) return;

                // Only try to update stylesheet resources. Other resources, like documents, can contain
                // multiple stylesheets and we don't have the source ranges to update those.
                if (resource.type !== WebInspector.Resource.Type.Stylesheet) return;

                if (resource.__ignoreNextUpdateResourceContent) {
                    delete resource.__ignoreNextUpdateResourceContent;
                    return;
                }

                this._ignoreResourceContentDidChangeEventForResource = resource;
                WebInspector.branchManager.currentBranch.revisionForRepresentedObject(resource).content = content;
                delete this._ignoreResourceContentDidChangeEventForResource;
            }

            function styleSheetReady() {
                styleSheet.requestContent().then(fetchedStyleSheetContent.bind(this));
            }

            function applyStyleSheetChanges() {
                if (styleSheet.url) styleSheetReady.call(this);else this._fetchInfoForAllStyleSheets(styleSheetReady.bind(this));
            }

            if (styleSheet.__pendingChangeTimeout) clearTimeout(styleSheet.__pendingChangeTimeout);
            styleSheet.__pendingChangeTimeout = setTimeout(applyStyleSheetChanges.bind(this), 500);
        }
    }, {
        key: "preferredColorFormat",

        // Public

        get: function () {
            return this._colorFormatSetting.value;
        }
    }]);

    return CSSStyleManager;
})(WebInspector.Object);

WebInspector.CSSStyleManager.ForceablePseudoClasses = ["active", "focus", "hover", "visited"];