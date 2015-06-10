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

WebInspector.RenderingFrameTimelineView = function (timeline, extraArguments) {
    WebInspector.TimelineView.call(this, timeline, extraArguments);

    console.assert(WebInspector.TimelineRecord.Type.RenderingFrame);

    this.navigationSidebarTreeOutline.element.classList.add("rendering-frame");

    var columns = { location: {}, startTime: {}, layoutTime: {}, scriptTime: {}, otherTime: {}, totalTime: {} };

    columns.location.title = WebInspector.UIString("Location");

    columns.startTime.title = WebInspector.UIString("Start Time");
    columns.startTime.width = "15%";
    columns.startTime.aligned = "right";

    columns.layoutTime.title = WebInspector.UIString("Layout");
    columns.layoutTime.width = "15%";
    columns.layoutTime.aligned = "right";

    columns.scriptTime.title = WebInspector.UIString("Script");
    columns.scriptTime.width = "15%";
    columns.scriptTime.aligned = "right";

    columns.otherTime.title = WebInspector.UIString("Other");
    columns.otherTime.width = "15%";
    columns.otherTime.aligned = "right";

    columns.totalTime.title = WebInspector.UIString("Total Time");
    columns.totalTime.width = "15%";
    columns.totalTime.aligned = "right";

    for (var column in columns) columns[column].sortable = true;

    this._dataGrid = new WebInspector.TimelineDataGrid(this.navigationSidebarTreeOutline, columns, this);
    this._dataGrid.addEventListener(WebInspector.DataGrid.Event.SelectedNodeChanged, this._dataGridNodeSelected, this);
    this._dataGrid.sortColumnIdentifier = "startTime";
    this._dataGrid.sortOrder = WebInspector.DataGrid.SortOrder.Ascending;

    this.element.classList.add("rendering-frame");
    this.element.appendChild(this._dataGrid.element);

    timeline.addEventListener(WebInspector.Timeline.Event.RecordAdded, this._renderingFrameTimelineRecordAdded, this);

    this._pendingRecords = [];
};

WebInspector.RenderingFrameTimelineView.prototype = Object.defineProperties({
    constructor: WebInspector.RenderingFrameTimelineView,
    __proto__: WebInspector.TimelineView.prototype,

    shown: function shown() {
        WebInspector.ContentView.prototype.shown.call(this);

        this._dataGrid.shown();
    },

    hidden: function hidden() {
        this._dataGrid.hidden();

        WebInspector.ContentView.prototype.hidden.call(this);
    },

    closed: function closed() {
        console.assert(this.representedObject instanceof WebInspector.Timeline);
        this.representedObject.removeEventListener(null, null, this);

        this._dataGrid.closed();
    },

    updateLayout: function updateLayout() {
        WebInspector.TimelineView.prototype.updateLayout.call(this);

        this._dataGrid.updateLayout();

        this._processPendingRecords();
    },

    filterDidChange: function filterDidChange() {
        WebInspector.TimelineView.prototype.filterDidChange.call(this);
    },

    matchTreeElementAgainstCustomFilters: function matchTreeElementAgainstCustomFilters(treeElement) {
        return this._dataGrid.treeElementMatchesActiveScopeFilters(treeElement);
    },

    reset: function reset() {
        WebInspector.TimelineView.prototype.reset.call(this);

        this._dataGrid.reset();
    },

    // Protected

    canShowContentViewForTreeElement: function canShowContentViewForTreeElement(treeElement) {
        if (treeElement instanceof WebInspector.ProfileNodeTreeElement) return !!treeElement.profileNode.sourceCodeLocation;
        return WebInspector.TimelineView.prototype.canShowContentViewForTreeElement(treeElement);
    },

    showContentViewForTreeElement: function showContentViewForTreeElement(treeElement) {
        if (treeElement instanceof WebInspector.ProfileNodeTreeElement) {
            if (treeElement.profileNode.sourceCodeLocation) WebInspector.showOriginalOrFormattedSourceCodeLocation(treeElement.profileNode.sourceCodeLocation);
            return;
        }

        WebInspector.TimelineView.prototype.showContentViewForTreeElement.call(this, treeElement);
    },

    treeElementSelected: function treeElementSelected(treeElement, selectedByUser) {
        if (this._dataGrid.shouldIgnoreSelectionEvent()) return;

        WebInspector.TimelineView.prototype.treeElementSelected.call(this, treeElement, selectedByUser);
    },

    treeElementPathComponentSelected: function treeElementPathComponentSelected(event) {
        var dataGridNode = this._dataGrid.dataGridNodeForTreeElement(event.data.pathComponent.generalTreeElement);
        if (!dataGridNode) return;
        dataGridNode.revealAndSelect();
    },

    dataGridNodeForTreeElement: function dataGridNodeForTreeElement(treeElement) {
        if (treeElement instanceof WebInspector.ProfileNodeTreeElement) return new WebInspector.ProfileNodeDataGridNode(treeElement.profileNode, this.zeroTime, this.startTime, this.endTime);
        return null;
    },

    // Private

    _processPendingRecords: function _processPendingRecords() {
        if (!this._pendingRecords.length) return;

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = this._pendingRecords[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var renderingFrameTimelineRecord = _step.value;

                console.assert(renderingFrameTimelineRecord instanceof WebInspector.RenderingFrameTimelineRecord);

                var treeElement = new WebInspector.TimelineRecordTreeElement(renderingFrameTimelineRecord);
                var dataGridNode = new WebInspector.RenderingFrameTimelineDataGridNode(renderingFrameTimelineRecord, this.zeroTime);

                this._dataGrid.addRowInSortOrder(treeElement, dataGridNode);

                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = renderingFrameTimelineRecord.children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var childRecord = _step2.value;

                        if (childRecord.type === WebInspector.TimelineRecord.Type.Layout) {
                            var layoutTreeElement = new WebInspector.TimelineRecordTreeElement(childRecord, WebInspector.SourceCodeLocation.NameStyle.Short);
                            var layoutDataGridNode = new WebInspector.LayoutTimelineDataGridNode(childRecord, this.zeroTime);

                            this._dataGrid.addRowInSortOrder(layoutTreeElement, layoutDataGridNode, treeElement);
                        } else if (childRecord.type === WebInspector.TimelineRecord.Type.Script) {
                            if (childRecord.profile) {
                                // FIXME: Support using the bottom-up tree once it is implemented.
                                rootNodes = childRecord.profile.topDownRootNodes;
                            }

                            var zeroTime = this.zeroTime;
                            var scriptTreeElement = new WebInspector.TimelineRecordTreeElement(childRecord, WebInspector.SourceCodeLocation.NameStyle.Short, rootNodes.length);
                            var scriptDataGridNode = new WebInspector.ScriptTimelineDataGridNode(childRecord, zeroTime);

                            this._dataGrid.addRowInSortOrder(scriptTreeElement, scriptDataGridNode, treeElement);

                            var startTime = this.startTime;
                            var endTime = this.endTime;

                            var _iteratorNormalCompletion3 = true;
                            var _didIteratorError3 = false;
                            var _iteratorError3 = undefined;

                            try {
                                for (var _iterator3 = rootNodes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                    var profileNode = _step3.value;

                                    var profileNodeTreeElement = new WebInspector.ProfileNodeTreeElement(profileNode, this);
                                    var profileNodeDataGridNode = new WebInspector.ProfileNodeDataGridNode(profileNode, zeroTime, startTime, endTime);
                                    this._dataGrid.addRowInSortOrder(profileNodeTreeElement, profileNodeDataGridNode, scriptTreeElement);
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

        this._pendingRecords = [];
    },

    _renderingFrameTimelineRecordAdded: function _renderingFrameTimelineRecordAdded(event) {
        var renderingFrameTimelineRecord = event.data.record;
        console.assert(renderingFrameTimelineRecord instanceof WebInspector.RenderingFrameTimelineRecord);

        this._pendingRecords.push(renderingFrameTimelineRecord);

        this.needsLayout();
    },

    _dataGridNodeSelected: function _dataGridNodeSelected(event) {
        this.dispatchEventToListeners(WebInspector.ContentView.Event.SelectionPathComponentsDidChange);
    }
}, {
    navigationSidebarTreeOutlineLabel: { // Public

        get: function () {
            return WebInspector.UIString("Records");
        },
        configurable: true,
        enumerable: true
    },
    selectionPathComponents: {
        get: function () {
            var dataGridNode = this._dataGrid.selectedNode;
            if (!dataGridNode) return null;

            var pathComponents = [];

            while (dataGridNode && !dataGridNode.root) {
                var treeElement = this._dataGrid.treeElementForDataGridNode(dataGridNode);
                console.assert(treeElement);
                if (!treeElement) break;

                if (treeElement.hidden) return null;

                var pathComponent = new WebInspector.GeneralTreeElementPathComponent(treeElement);
                pathComponent.addEventListener(WebInspector.HierarchicalPathComponent.Event.SiblingWasSelected, this.treeElementPathComponentSelected, this);
                pathComponents.unshift(pathComponent);
                dataGridNode = dataGridNode.parent;
            }

            return pathComponents;
        },
        configurable: true,
        enumerable: true
    }
});