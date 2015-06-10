/*
 * Copyright (C) 2013 Apple Inc. All rights reserved.
 * Copyright (C) 2015 University of Washington.
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

WebInspector.TimelineRecordingContentView = function (recording, extraArguments) {
    console.assert(extraArguments);
    console.assert(extraArguments.timelineSidebarPanel instanceof WebInspector.TimelineSidebarPanel);

    WebInspector.ContentView.call(this, recording);

    this._recording = recording;
    this._timelineSidebarPanel = extraArguments.timelineSidebarPanel;

    this.element.classList.add(WebInspector.TimelineRecordingContentView.StyleClassName);

    this._linearTimelineOverview = new WebInspector.LinearTimelineOverview(this._recording);
    this._linearTimelineOverview.addEventListener(WebInspector.TimelineOverview.Event.TimeRangeSelectionChanged, this._timeRangeSelectionChanged, this);

    this._renderingFrameTimelineOverview = new WebInspector.RenderingFrameTimelineOverview(this._recording);
    this._renderingFrameTimelineOverview.addEventListener(WebInspector.TimelineOverview.Event.TimeRangeSelectionChanged, this._timeRangeSelectionChanged, this);

    this._currentTimelineOverview = this._linearTimelineOverview;
    this.element.appendChild(this._currentTimelineOverview.element);

    this._contentViewContainer = new WebInspector.ContentViewContainer();
    this._contentViewContainer.addEventListener(WebInspector.ContentViewContainer.Event.CurrentContentViewDidChange, this._currentContentViewDidChange, this);
    this.element.appendChild(this._contentViewContainer.element);

    this._clearTimelineNavigationItem = new WebInspector.ButtonNavigationItem("clear-timeline", WebInspector.UIString("Clear Timeline"), "Images/NavigationItemTrash.svg", 15, 15);
    this._clearTimelineNavigationItem.addEventListener(WebInspector.ButtonNavigationItem.Event.Clicked, this._clearTimeline, this);

    this._overviewTimelineView = new WebInspector.OverviewTimelineView(recording, { timelineSidebarPanel: this._timelineSidebarPanel });
    this._overviewTimelineView.secondsPerPixel = this._linearTimelineOverview.secondsPerPixel;

    this._timelineViewMap = new Map();
    this._pathComponentMap = new Map();

    this._updating = false;
    this._currentTime = NaN;
    this._lastUpdateTimestamp = NaN;
    this._startTimeNeedsReset = true;
    this._renderingFrameTimeline = null;

    this._recording.addEventListener(WebInspector.TimelineRecording.Event.TimelineAdded, this._timelineAdded, this);
    this._recording.addEventListener(WebInspector.TimelineRecording.Event.TimelineRemoved, this._timelineRemoved, this);
    this._recording.addEventListener(WebInspector.TimelineRecording.Event.Reset, this._recordingReset, this);
    this._recording.addEventListener(WebInspector.TimelineRecording.Event.Unloaded, this._recordingUnloaded, this);

    WebInspector.timelineManager.addEventListener(WebInspector.TimelineManager.Event.CapturingStarted, this._capturingStarted, this);
    WebInspector.timelineManager.addEventListener(WebInspector.TimelineManager.Event.CapturingStopped, this._capturingStopped, this);

    WebInspector.debuggerManager.addEventListener(WebInspector.DebuggerManager.Event.Paused, this._debuggerPaused, this);
    WebInspector.debuggerManager.addEventListener(WebInspector.DebuggerManager.Event.Resumed, this._debuggerResumed, this);

    WebInspector.ContentView.addEventListener(WebInspector.ContentView.Event.SelectionPathComponentsDidChange, this._contentViewSelectionPathComponentDidChange, this);
    WebInspector.ContentView.addEventListener(WebInspector.ContentView.Event.SupplementalRepresentedObjectsDidChange, this._contentViewSupplementalRepresentedObjectsDidChange, this);

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = this._recording.timelines.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var timeline = _step.value;

            this._timelineAdded(timeline);
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

    this.showOverviewTimelineView();
};

WebInspector.TimelineRecordingContentView.StyleClassName = "timeline-recording";

WebInspector.TimelineRecordingContentView.SelectedTimelineTypeCookieKey = "timeline-recording-content-view-selected-timeline-type";
WebInspector.TimelineRecordingContentView.OverviewTimelineViewCookieValue = "timeline-recording-content-view-overview-timeline-view";

WebInspector.TimelineRecordingContentView.prototype = Object.defineProperties({
    constructor: WebInspector.TimelineRecordingContentView,
    __proto__: WebInspector.ContentView.prototype,

    // Public

    showOverviewTimelineView: function showOverviewTimelineView() {
        this._contentViewContainer.showContentView(this._overviewTimelineView);
    },

    showTimelineViewForTimeline: function showTimelineViewForTimeline(timeline) {
        console.assert(timeline instanceof WebInspector.Timeline, timeline);
        console.assert(this._timelineViewMap.has(timeline), timeline);
        if (!this._timelineViewMap.has(timeline)) return;

        this._contentViewContainer.showContentView(this._timelineViewMap.get(timeline));
    },

    shown: function shown() {
        this._currentTimelineOverview.shown();
        this._contentViewContainer.shown();
        this._clearTimelineNavigationItem.enabled = this._recording.isWritable();

        this._currentContentViewDidChange();

        if (!this._updating && WebInspector.timelineManager.activeRecording === this._recording && WebInspector.timelineManager.isCapturing()) this._startUpdatingCurrentTime();
    },

    hidden: function hidden() {
        this._currentTimelineOverview.hidden();
        this._contentViewContainer.hidden();

        if (this._updating) this._stopUpdatingCurrentTime();
    },

    closed: function closed() {
        this._contentViewContainer.closeAllContentViews();

        this._recording.removeEventListener(null, null, this);

        WebInspector.timelineManager.removeEventListener(null, null, this);
        WebInspector.debuggerManager.removeEventListener(null, null, this);
        WebInspector.ContentView.removeEventListener(null, null, this);
    },

    canGoBack: function canGoBack() {
        return this._contentViewContainer.canGoBack();
    },

    canGoForward: function canGoForward() {
        return this._contentViewContainer.canGoForward();
    },

    goBack: function goBack() {
        this._contentViewContainer.goBack();
    },

    goForward: function goForward() {
        this._contentViewContainer.goForward();
    },

    updateLayout: function updateLayout() {
        this._currentTimelineOverview.updateLayoutForResize();

        var currentContentView = this._contentViewContainer.currentContentView;
        if (currentContentView) currentContentView.updateLayout();
    },

    saveToCookie: function saveToCookie(cookie) {
        cookie.type = WebInspector.ContentViewCookieType.Timelines;

        var currentContentView = this._contentViewContainer.currentContentView;
        if (!currentContentView || currentContentView === this._overviewTimelineView) cookie[WebInspector.TimelineRecordingContentView.SelectedTimelineTypeCookieKey] = WebInspector.TimelineRecordingContentView.OverviewTimelineViewCookieValue;else if (currentContentView.representedObject instanceof WebInspector.Timeline) cookie[WebInspector.TimelineRecordingContentView.SelectedTimelineTypeCookieKey] = this.currentTimelineView.representedObject.type;
    },

    restoreFromCookie: function restoreFromCookie(cookie) {
        var timelineType = cookie[WebInspector.TimelineRecordingContentView.SelectedTimelineTypeCookieKey];
        if (timelineType === WebInspector.TimelineRecordingContentView.OverviewTimelineViewCookieValue) this.showOverviewTimelineView();else this.showTimelineViewForTimeline(this.representedObject.timelines.get(timelineType));
    },

    filterDidChange: function filterDidChange() {
        if (!this.currentTimelineView) return;

        this.currentTimelineView.filterDidChange();
    },

    matchTreeElementAgainstCustomFilters: function matchTreeElementAgainstCustomFilters(treeElement) {
        if (this.currentTimelineView && !this.currentTimelineView.matchTreeElementAgainstCustomFilters(treeElement)) return false;

        var startTime = this._currentTimelineOverview.selectionStartTime;
        var endTime = startTime + this._currentTimelineOverview.selectionDuration;
        var currentTime = this._currentTime || this._recording.startTime;

        if (this._timelineSidebarPanel.viewMode === WebInspector.TimelineSidebarPanel.ViewMode.RenderingFrames) {
            console.assert(this._renderingFrameTimeline);

            if (this._renderingFrameTimeline && this._renderingFrameTimeline.records.length) {
                var records = this._renderingFrameTimeline.records;
                var startIndex = Math.floor(startTime);
                if (startIndex >= records.length) return false;

                var endIndex = Math.min(Math.floor(endTime), records.length - 1);
                console.assert(startIndex <= endIndex, startIndex);

                startTime = records[startIndex].startTime;
                endTime = records[endIndex].endTime;
            }
        }

        function checkTimeBounds(itemStartTime, itemEndTime) {
            itemStartTime = itemStartTime || currentTime;
            itemEndTime = itemEndTime || currentTime;

            return startTime <= itemEndTime && itemStartTime <= endTime;
        }

        if (treeElement instanceof WebInspector.ResourceTreeElement) {
            var resource = treeElement.resource;
            return checkTimeBounds(resource.requestSentTimestamp, resource.finishedOrFailedTimestamp);
        }

        if (treeElement instanceof WebInspector.SourceCodeTimelineTreeElement) {
            var sourceCodeTimeline = treeElement.sourceCodeTimeline;

            // Do a quick check of the timeline bounds before we check each record.
            if (!checkTimeBounds(sourceCodeTimeline.startTime, sourceCodeTimeline.endTime)) return false;

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = sourceCodeTimeline.records[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var record = _step2.value;

                    if (checkTimeBounds(record.startTime, record.endTime)) return true;
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

            return false;
        }

        if (treeElement instanceof WebInspector.ProfileNodeTreeElement) {
            var profileNode = treeElement.profileNode;
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = profileNode.calls[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var call = _step3.value;

                    if (checkTimeBounds(call.startTime, call.endTime)) return true;
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

            return false;
        }

        if (treeElement instanceof WebInspector.TimelineRecordTreeElement) {
            var record = treeElement.record;
            return checkTimeBounds(record.startTime, record.endTime);
        }

        console.error("Unknown TreeElement, can't filter by time.");
        return true;
    },

    // Private

    _currentContentViewDidChange: function _currentContentViewDidChange(event) {
        var newTimelineOverview = this._linearTimelineOverview;
        var timelineView = this.currentTimelineView;
        if (timelineView) {
            this._timelineSidebarPanel.contentTreeOutline = timelineView.navigationSidebarTreeOutline;
            this._timelineSidebarPanel.contentTreeOutlineLabel = timelineView.navigationSidebarTreeOutlineLabel;

            if (timelineView.representedObject.type === WebInspector.TimelineRecord.Type.RenderingFrame) newTimelineOverview = this._renderingFrameTimelineOverview;

            timelineView.startTime = newTimelineOverview.selectionStartTime;
            timelineView.endTime = newTimelineOverview.selectionStartTime + newTimelineOverview.selectionDuration;
            timelineView.currentTime = this._currentTime;
        }

        if (newTimelineOverview !== this._currentTimelineOverview) {
            this._currentTimelineOverview.hidden();

            this.element.insertBefore(newTimelineOverview.element, this._currentTimelineOverview.element);
            this.element.removeChild(this._currentTimelineOverview.element);

            this._currentTimelineOverview = newTimelineOverview;
            this._currentTimelineOverview.shown();

            this._updateTimelineOverviewHeight();
        }

        this.dispatchEventToListeners(WebInspector.ContentView.Event.SelectionPathComponentsDidChange);
        this.dispatchEventToListeners(WebInspector.ContentView.Event.NavigationItemsDidChange);
    },

    _pathComponentSelected: function _pathComponentSelected(event) {
        this._timelineSidebarPanel.showTimelineViewForTimeline(event.data.pathComponent.representedObject);
    },

    _contentViewSelectionPathComponentDidChange: function _contentViewSelectionPathComponentDidChange(event) {
        if (event.target !== this._contentViewContainer.currentContentView) return;
        this.dispatchEventToListeners(WebInspector.ContentView.Event.SelectionPathComponentsDidChange);
    },

    _contentViewSupplementalRepresentedObjectsDidChange: function _contentViewSupplementalRepresentedObjectsDidChange(event) {
        if (event.target !== this._contentViewContainer.currentContentView) return;
        this.dispatchEventToListeners(WebInspector.ContentView.Event.SupplementalRepresentedObjectsDidChange);
    },

    _update: function _update(timestamp) {
        if (this._waitingToResetCurrentTime) {
            requestAnimationFrame(this._updateCallback);
            return;
        }

        var startTime = this._recording.startTime;
        var currentTime = this._currentTime || startTime;
        var endTime = this._recording.endTime;
        var timespanSinceLastUpdate = (timestamp - this._lastUpdateTimestamp) / 1000 || 0;

        currentTime += timespanSinceLastUpdate;

        this._updateTimes(startTime, currentTime, endTime);

        // Only stop updating if the current time is greater than the end time.
        if (!this._updating && currentTime >= endTime) {
            this._lastUpdateTimestamp = NaN;
            return;
        }

        this._lastUpdateTimestamp = timestamp;

        requestAnimationFrame(this._updateCallback);
    },

    _updateTimes: function _updateTimes(startTime, currentTime, endTime) {
        if (this._startTimeNeedsReset && !isNaN(startTime)) {
            var selectionOffset = this._linearTimelineOverview.selectionStartTime - this._linearTimelineOverview.startTime;

            this._linearTimelineOverview.startTime = startTime;
            this._linearTimelineOverview.selectionStartTime = startTime + selectionOffset;

            this._overviewTimelineView.zeroTime = startTime;
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = this._timelineViewMap.values()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var timelineView = _step4.value;

                    timelineView.zeroTime = startTime;
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

            delete this._startTimeNeedsReset;
        }

        this._linearTimelineOverview.endTime = Math.max(endTime, currentTime);

        this._currentTime = currentTime;
        this._linearTimelineOverview.currentTime = currentTime;
        if (this.currentTimelineView) this.currentTimelineView.currentTime = currentTime;

        if (this._renderingFrameTimeline) {
            var currentFrameNumber = 0;
            if (this._renderingFrameTimeline.records.length) currentFrameNumber = this._renderingFrameTimeline.records.lastValue.frameNumber;

            this._renderingFrameTimelineOverview.currentTime = this._renderingFrameTimelineOverview.endTime = currentFrameNumber;
        }

        this._timelineSidebarPanel.updateFilter();

        // Force a layout now since we are already in an animation frame and don't need to delay it until the next.
        this._currentTimelineOverview.updateLayoutIfNeeded();
        if (this.currentTimelineView) this.currentTimelineView.updateLayoutIfNeeded();
    },

    _startUpdatingCurrentTime: function _startUpdatingCurrentTime() {
        console.assert(!this._updating);
        if (this._updating) return;

        if (!isNaN(this._currentTime)) {
            // We have a current time already, so we likely need to jump into the future to a better current time.
            // This happens when you stop and later restart recording.
            console.assert(!this._waitingToResetCurrentTime);
            this._waitingToResetCurrentTime = true;
            this._recording.addEventListener(WebInspector.TimelineRecording.Event.TimesUpdated, this._recordingTimesUpdated, this);
        }

        this._updating = true;

        if (!this._updateCallback) this._updateCallback = this._update.bind(this);

        requestAnimationFrame(this._updateCallback);
    },

    _stopUpdatingCurrentTime: function _stopUpdatingCurrentTime() {
        console.assert(this._updating);
        this._updating = false;

        if (this._waitingToResetCurrentTime) {
            // Did not get any event while waiting for the current time, but we should stop waiting.
            this._recording.removeEventListener(WebInspector.TimelineRecording.Event.TimesUpdated, this._recordingTimesUpdated, this);
            this._waitingToResetCurrentTime = false;
        }
    },

    _capturingStarted: function _capturingStarted(event) {
        this._startUpdatingCurrentTime();
    },

    _capturingStopped: function _capturingStopped(event) {
        if (this._updating) this._stopUpdatingCurrentTime();
    },

    _debuggerPaused: function _debuggerPaused(event) {
        if (WebInspector.replayManager.sessionState === WebInspector.ReplayManager.SessionState.Replaying) return;

        this._stopUpdatingCurrentTime();
    },

    _debuggerResumed: function _debuggerResumed(event) {
        if (WebInspector.replayManager.sessionState === WebInspector.ReplayManager.SessionState.Replaying) return;

        this._startUpdatingCurrentTime();
    },

    _recordingTimesUpdated: function _recordingTimesUpdated(event) {
        if (!this._waitingToResetCurrentTime) return;

        // Make the current time be the start time of the last added record. This is the best way
        // currently to jump to the right period of time after recording starts.
        // FIXME: If no activity is happening we can sit for a while until a record is added.
        // We might want to have the backend send a "start" record to get current time moving.

        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
            for (var _iterator5 = this._recording.timelines.values()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                var timeline = _step5.value;

                // The rendering frame timeline doesn't use a time axis.
                if (timeline.type === WebInspector.TimelineRecord.Type.RenderingFrame) continue;

                var lastRecord = timeline.records.lastValue;
                if (!lastRecord) continue;
                this._currentTime = Math.max(this._currentTime, lastRecord.startTime);
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

        this._recording.removeEventListener(WebInspector.TimelineRecording.Event.TimesUpdated, this._recordingTimesUpdated, this);
        this._waitingToResetCurrentTime = false;
    },

    _clearTimeline: function _clearTimeline(event) {
        this._recording.reset();
    },

    _updateTimelineOverviewHeight: function _updateTimelineOverviewHeight() {
        var timelineHeight = 36;
        var renderingFramesTimelineHeight = 108;
        var rulerHeight = 29;

        var overviewHeight;

        if (this.currentTimelineView && this.currentTimelineView.representedObject.type === WebInspector.TimelineRecord.Type.RenderingFrame) overviewHeight = renderingFramesTimelineHeight;else {
            var timelineCount = this._timelineViewMap.size;
            if (this._renderingFrameTimeline) timelineCount--;

            overviewHeight = timelineCount * timelineHeight;
        }

        var styleValue = rulerHeight + overviewHeight + "px";
        this._currentTimelineOverview.element.style.height = styleValue;
        this._contentViewContainer.element.style.top = styleValue;
    },

    _timelineAdded: function _timelineAdded(timelineOrEvent) {
        var timeline = timelineOrEvent;
        if (!(timeline instanceof WebInspector.Timeline)) timeline = timelineOrEvent.data.timeline;

        console.assert(timeline instanceof WebInspector.Timeline, timeline);
        console.assert(!this._timelineViewMap.has(timeline), timeline);

        this._timelineViewMap.set(timeline, new WebInspector.ContentView(timeline, { timelineSidebarPanel: this._timelineSidebarPanel }));
        if (timeline.type === WebInspector.TimelineRecord.Type.RenderingFrame) this._renderingFrameTimeline = timeline;

        var pathComponent = new WebInspector.HierarchicalPathComponent(timeline.displayName, timeline.iconClassName, timeline);
        pathComponent.addEventListener(WebInspector.HierarchicalPathComponent.Event.SiblingWasSelected, this._pathComponentSelected, this);
        this._pathComponentMap.set(timeline, pathComponent);

        this._timelineCountChanged();
    },

    _timelineRemoved: function _timelineRemoved(event) {
        var timeline = event.data.timeline;
        console.assert(timeline instanceof WebInspector.Timeline, timeline);
        console.assert(this._timelineViewMap.has(timeline), timeline);

        var timelineView = this._timelineViewMap.take(timeline);
        if (this.currentTimelineView === timelineView) this.showOverviewTimelineView();
        if (timeline.type === WebInspector.TimelineRecord.Type.RenderingFrame) this._renderingFrameTimeline = null;

        this._pathComponentMap["delete"](timeline);

        this._timelineCountChanged();
    },

    _timelineCountChanged: function _timelineCountChanged() {
        var previousPathComponent = null;
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
            for (var _iterator6 = this._pathComponentMap.values()[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                var pathComponent = _step6.value;

                if (previousPathComponent) {
                    previousPathComponent.nextSibling = pathComponent;
                    pathComponent.previousSibling = previousPathComponent;
                }

                previousPathComponent = pathComponent;
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

        this._updateTimelineOverviewHeight();
    },

    _recordingReset: function _recordingReset(event) {
        this._currentTime = NaN;

        if (!this._updating) {
            // Force the time ruler and views to reset to 0.
            this._startTimeNeedsReset = true;
            this._updateTimes(0, 0, 0);
        }

        this._lastUpdateTimestamp = NaN;
        this._startTimeNeedsReset = true;

        this._recording.removeEventListener(WebInspector.TimelineRecording.Event.TimesUpdated, this._recordingTimesUpdated, this);
        this._waitingToResetCurrentTime = false;

        this._linearTimelineOverview.reset();
        this._renderingFrameTimelineOverview.reset();
        this._overviewTimelineView.reset();
        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
            for (var _iterator7 = this._timelineViewMap.values()[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                var timelineView = _step7.value;

                timelineView.reset();
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
    },

    _recordingUnloaded: function _recordingUnloaded(event) {
        console.assert(!this._updating);

        WebInspector.timelineManager.removeEventListener(WebInspector.TimelineManager.Event.CapturingStarted, this._capturingStarted, this);
        WebInspector.timelineManager.removeEventListener(WebInspector.TimelineManager.Event.CapturingStopped, this._capturingStopped, this);
    },

    _timeRangeSelectionChanged: function _timeRangeSelectionChanged(event) {
        if (this.currentTimelineView) {
            this.currentTimelineView.startTime = this._currentTimelineOverview.selectionStartTime;
            this.currentTimelineView.endTime = this._currentTimelineOverview.selectionStartTime + this._currentTimelineOverview.selectionDuration;

            if (this.currentTimelineView.representedObject.type === WebInspector.TimelineRecord.Type.RenderingFrame) this._updateFrameSelection();
        }

        // Delay until the next frame to stay in sync with the current timeline view's time-based layout changes.
        requestAnimationFrame((function () {
            var selectedTreeElement = this.currentTimelineView && this.currentTimelineView.navigationSidebarTreeOutline ? this.currentTimelineView.navigationSidebarTreeOutline.selectedTreeElement : null;
            var selectionWasHidden = selectedTreeElement && selectedTreeElement.hidden;

            this._timelineSidebarPanel.updateFilter();

            if (selectedTreeElement && selectedTreeElement.hidden !== selectionWasHidden) this.dispatchEventToListeners(WebInspector.ContentView.Event.SelectionPathComponentsDidChange);
        }).bind(this));
    },

    _updateFrameSelection: function _updateFrameSelection() {
        console.assert(this._renderingFrameTimeline);
        if (!this._renderingFrameTimeline) return;

        var startIndex = this._renderingFrameTimelineOverview.selectionStartTime;
        var endIndex = startIndex + this._renderingFrameTimelineOverview.selectionDuration;
        this._timelineSidebarPanel.updateFrameSelection(startIndex, endIndex);
    }
}, {
    supportsSplitContentBrowser: {
        get: function () {
            // The layout of the overview and split content browser don't work well.
            return false;
        },
        configurable: true,
        enumerable: true
    },
    selectionPathComponents: {
        get: function () {
            if (!this._contentViewContainer.currentContentView) return [];

            var pathComponents = this._contentViewContainer.currentContentView.selectionPathComponents || [];
            var representedObject = this._contentViewContainer.currentContentView.representedObject;
            if (representedObject instanceof WebInspector.Timeline) pathComponents.unshift(this._pathComponentMap.get(representedObject));
            return pathComponents;
        },
        configurable: true,
        enumerable: true
    },
    supplementalRepresentedObjects: {
        get: function () {
            if (!this._contentViewContainer.currentContentView) return [];
            return this._contentViewContainer.currentContentView.supplementalRepresentedObjects;
        },
        configurable: true,
        enumerable: true
    },
    navigationItems: {
        get: function () {
            return [this._clearTimelineNavigationItem];
        },
        configurable: true,
        enumerable: true
    },
    handleCopyEvent: {
        get: function () {
            var currentContentView = this._contentViewContainer.currentContentView;
            return currentContentView && typeof currentContentView.handleCopyEvent === "function" ? currentContentView.handleCopyEvent.bind(currentContentView) : null;
        },
        configurable: true,
        enumerable: true
    },
    supportsSave: {
        get: function () {
            var currentContentView = this._contentViewContainer.currentContentView;
            return currentContentView && currentContentView.supportsSave;
        },
        configurable: true,
        enumerable: true
    },
    saveData: {
        get: function () {
            var currentContentView = this._contentViewContainer.currentContentView;
            return currentContentView && currentContentView.saveData || null;
        },
        configurable: true,
        enumerable: true
    },
    currentTimelineView: {
        get: function () {
            var contentView = this._contentViewContainer.currentContentView;
            return contentView instanceof WebInspector.TimelineView ? contentView : null;
        },
        configurable: true,
        enumerable: true
    }
});