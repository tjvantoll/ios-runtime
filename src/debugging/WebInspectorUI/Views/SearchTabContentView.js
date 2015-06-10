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

WebInspector.SearchTabContentView = function (identifier) {
    var tabBarItem = new WebInspector.TabBarItem("Images/SearchResults.svg", WebInspector.UIString("Search"));
    var detailsSidebarPanels = [WebInspector.resourceDetailsSidebarPanel, WebInspector.probeDetailsSidebarPanel, WebInspector.domNodeDetailsSidebarPanel, WebInspector.cssStyleDetailsSidebarPanel];

    if (WebInspector.layerTreeDetailsSidebarPanel) detailsSidebarPanels.push(WebInspector.layerTreeDetailsSidebarPanel);

    WebInspector.ContentBrowserTabContentView.call(this, identifier || "search", "search", tabBarItem, WebInspector.SearchSidebarPanel, detailsSidebarPanels);
};

WebInspector.SearchTabContentView.prototype = Object.defineProperties({
    constructor: WebInspector.SearchTabContentView,
    __proto__: WebInspector.ContentBrowserTabContentView.prototype,

    shown: function shown() {
        WebInspector.ContentBrowserTabContentView.prototype.shown.call(this);

        // Perform on a delay because the field might not be visible yet.
        setTimeout(this.focusSearchField.bind(this));
    },

    canShowRepresentedObject: function canShowRepresentedObject(representedObject) {
        return representedObject instanceof WebInspector.Resource || representedObject instanceof WebInspector.Script || representedObject instanceof WebInspector.DOMTree;
    },

    focusSearchField: function focusSearchField() {
        this.navigationSidebarPanel.focusSearchField();
    },

    performSearch: function performSearch(searchQuery) {
        this.navigationSidebarPanel.performSearch(searchQuery);
    }
}, {
    type: { // Public

        get: function () {
            return WebInspector.SearchTabContentView.Type;
        },
        configurable: true,
        enumerable: true
    }
});

WebInspector.SearchTabContentView.Type = "search";