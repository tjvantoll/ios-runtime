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

WebInspector.TimelineOverview = function (identifier, timelineRecording, minimumDurationPerPixel, maximumDurationPerPixel, defaultSettingsValues) {
    // FIXME: Convert this to a WebInspector.Object subclass, and call super().
    // WebInspector.Object.call(this);

    this._recording = timelineRecording;
    this._recording.addEventListener(WebInspector.TimelineRecording.Event.TimelineAdded, this._timelineAdded, this);
    this._recording.addEventListener(WebInspector.TimelineRecording.Event.TimelineRemoved, this._timelineRemoved, this);

    this._element = document.createElement("div");
    this._element.className = WebInspector.TimelineOverview.StyleClassName;
    this._element.addEventListener("wheel", this._handleWheelEvent.bind(this));

    this._graphsContainerElement = document.createElement("div");
    this._graphsContainerElement.className = WebInspector.TimelineOverview.GraphsContainerStyleClassName;
    this._element.appendChild(this._graphsContainerElement);

    this._timelineOverviewGraphsMap = new Map();

    this._timelineRuler = new WebInspector.TimelineRuler();
    this._timelineRuler.allowsClippedLabels = true;
    this._timelineRuler.allowsTimeRangeSelection = true;
    this._timelineRuler.addEventListener(WebInspector.TimelineRuler.Event.TimeRangeSelectionChanged, this._timeRangeSelectionChanged, this);
    this._element.appendChild(this._timelineRuler.element);

    this._currentTimeMarker = new WebInspector.TimelineMarker(0, WebInspector.TimelineMarker.Type.CurrentTime);
    this._timelineRuler.addMarker(this._currentTimeMarker);

    this._scrollContainerElement = document.createElement("div");
    this._scrollContainerElement.className = WebInspector.TimelineOverview.ScrollContainerStyleClassName;
    this._scrollContainerElement.addEventListener("scroll", this._handleScrollEvent.bind(this));
    this._element.appendChild(this._scrollContainerElement);

    this._scrollWidthSizer = document.createElement("div");
    this._scrollWidthSizer.className = WebInspector.TimelineOverview.ScrollWidthSizerStyleClassName;
    this._scrollContainerElement.appendChild(this._scrollWidthSizer);

    this._defaultSettingsValues = defaultSettingsValues;
    this._durationPerPixelSetting = new WebInspector.Setting(identifier + "-timeline-overview-duration-per-pixel", this._defaultSettingsValues.durationPerPixel);
    this._selectionStartValueSetting = new WebInspector.Setting(identifier + "-timeline-overview-selection-start-value", this._defaultSettingsValues.selectionStartValue);
    this._selectionDurationSetting = new WebInspector.Setting(identifier + "-timeline-overview-selection-duration", this._defaultSettingsValues.selectionDuration);

    this._startTime = 0;
    this._currentTime = 0;
    this._revealCurrentTime = false;
    this._endTime = 0;
    this._minimumDurationPerPixel = minimumDurationPerPixel;
    this._maximumDurationPerPixel = maximumDurationPerPixel;
    this._durationPerPixel = Math.min(this._maximumDurationPerPixel, Math.max(this._minimumDurationPerPixel, this._durationPerPixelSetting.value));
    this._scrollStartTime = 0;
    this._cachedScrollContainerWidth = NaN;

    this.selectionStartTime = this._selectionStartValueSetting.value;
    this.selectionDuration = this._selectionDurationSetting.value;

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

    if (!WebInspector.timelineManager.isCapturingPageReload()) this._resetSelection();
};

WebInspector.TimelineOverview.StyleClassName = "timeline-overview";
WebInspector.TimelineOverview.GraphsContainerStyleClassName = "graphs-container";
WebInspector.TimelineOverview.ScrollContainerStyleClassName = "scroll-container";
WebInspector.TimelineOverview.ScrollWidthSizerStyleClassName = "scroll-width-sizer";
WebInspector.TimelineOverview.ScrollDeltaDenominator = 500;

WebInspector.TimelineOverview.Event = {
    TimeRangeSelectionChanged: "timeline-overview-time-range-selection-changed"
};

WebInspector.TimelineOverview.prototype = Object.defineProperties({
    constructor: WebInspector.TimelineOverview,
    __proto__: WebInspector.Object.prototype,

    shown: function shown() {
        this._visible = true;

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = this._timelineOverviewGraphsMap.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var timelineOverviewGraph = _step2.value;

                timelineOverviewGraph.shown();
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

        this.updateLayout();
    },

    hidden: function hidden() {
        this._visible = false;

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = this._timelineOverviewGraphsMap.values()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var timelineOverviewGraph = _step3.value;

                timelineOverviewGraph.hidden();
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
    },

    reset: function reset() {
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
            for (var _iterator4 = this._timelineOverviewGraphsMap.values()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var timelineOverviewGraph = _step4.value;

                timelineOverviewGraph.reset();
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

        this._resetSelection();
    },

    addMarker: function addMarker(marker) {
        this._timelineRuler.addMarker(marker);
    },

    revealMarker: function revealMarker(marker) {
        this.scrollStartTime = marker.time - this.visibleDuration / 2;
    },

    updateLayoutForResize: function updateLayoutForResize() {
        this._cachedScrollContainerWidth = NaN;
        this.updateLayout();
    },

    updateLayout: function updateLayout() {
        if (this._scheduledLayoutUpdateIdentifier) {
            cancelAnimationFrame(this._scheduledLayoutUpdateIdentifier);
            delete this._scheduledLayoutUpdateIdentifier;
        }

        // Calculate the required width based on the duration and seconds per pixel.
        var duration = this._endTime - this._startTime;
        var newWidth = Math.ceil(duration / this._durationPerPixel);

        // Update all relevant elements to the new required width.
        this._updateElementWidth(this._scrollWidthSizer, newWidth);

        this._currentTimeMarker.time = this._currentTime;

        if (this._revealCurrentTime) {
            this.revealMarker(this._currentTimeMarker);
            this._revealCurrentTime = false;
        }

        var visibleDuration = this.visibleDuration;

        // Clamp the scroll start time to match what the scroll bar would allow.
        var scrollStartTime = Math.min(this._scrollStartTime, this._endTime - visibleDuration);
        scrollStartTime = Math.max(this._startTime, scrollStartTime);

        this._timelineRuler.zeroTime = this._startTime;
        this._timelineRuler.startTime = scrollStartTime;
        this._timelineRuler.secondsPerPixel = this._durationPerPixel;

        if (!this._dontUpdateScrollLeft) {
            this._ignoreNextScrollEvent = true;
            this._scrollContainerElement.scrollLeft = Math.ceil((scrollStartTime - this._startTime) / this._durationPerPixel);
        }

        this._timelineRuler.updateLayout();

        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
            for (var _iterator5 = this._timelineOverviewGraphsMap.values()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                var timelineOverviewGraph = _step5.value;

                timelineOverviewGraph.zeroTime = this._startTime;
                timelineOverviewGraph.startTime = scrollStartTime;
                timelineOverviewGraph.currentTime = this._currentTime;
                timelineOverviewGraph.endTime = scrollStartTime + visibleDuration;
                timelineOverviewGraph.updateLayout();
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
    },

    updateLayoutIfNeeded: function updateLayoutIfNeeded() {
        if (this._scheduledLayoutUpdateIdentifier) {
            this.updateLayout();
            return;
        }

        this._timelineRuler.updateLayoutIfNeeded();

        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
            for (var _iterator6 = this._timelineOverviewGraphsMap.values()[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                var timelineOverviewGraph = _step6.value;

                timelineOverviewGraph.updateLayoutIfNeeded();
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
    },

    canShowTimeline: function canShowTimeline(timeline) {
        // Implemented by subclasses.
        console.error("Needs to be implemented by a subclass.");
    },

    // Private

    _updateElementWidth: function _updateElementWidth(element, newWidth) {
        var currentWidth = parseInt(element.style.width);
        if (currentWidth !== newWidth) element.style.width = newWidth + "px";
    },

    _needsLayout: function _needsLayout() {
        if (!this._visible) return;

        if (this._scheduledLayoutUpdateIdentifier) return;

        this._scheduledLayoutUpdateIdentifier = requestAnimationFrame(this.updateLayout.bind(this));
    },

    _handleScrollEvent: function _handleScrollEvent(event) {
        if (this._ignoreNextScrollEvent) {
            delete this._ignoreNextScrollEvent;
            return;
        }

        this._dontUpdateScrollLeft = true;

        var scrollOffset = this._scrollContainerElement.scrollLeft;
        this.scrollStartTime = this._startTime + scrollOffset * this._durationPerPixel;

        // Force layout so we can update with the scroll position synchronously.
        this.updateLayoutIfNeeded();

        delete this._dontUpdateScrollLeft;
    },

    _handleWheelEvent: function _handleWheelEvent(event) {
        // Ignore cloned events that come our way, we already handled the original.
        if (event.__cloned) return;

        // Require twice the vertical delta to overcome horizontal scrolling. This prevents most
        // cases of inadvertent zooming for slightly diagonal scrolls.
        if (Math.abs(event.deltaX) >= Math.abs(event.deltaY) * 0.5) {
            // Clone the event to dispatch it on the scroll container. Mark it as cloned so we don't get into a loop.
            var newWheelEvent = new event.constructor(event.type, event);
            newWheelEvent.__cloned = true;

            this._scrollContainerElement.dispatchEvent(newWheelEvent);
            return;
        }

        // Remember the mouse position in time.
        var mouseOffset = event.pageX - this._element.totalOffsetLeft;
        var mousePositionTime = this._scrollStartTime + mouseOffset * this._durationPerPixel;
        var deviceDirection = event.webkitDirectionInvertedFromDevice ? 1 : -1;

        this.secondsPerPixel += event.deltaY * (this._durationPerPixel / WebInspector.TimelineOverview.ScrollDeltaDenominator) * deviceDirection;

        // Center the zoom around the mouse based on the remembered mouse position time.
        this.scrollStartTime = mousePositionTime - mouseOffset * this._durationPerPixel;

        event.preventDefault();
        event.stopPropagation();
    },

    _timelineAdded: function _timelineAdded(timelineOrEvent) {
        var timeline = timelineOrEvent;
        if (!(timeline instanceof WebInspector.Timeline)) timeline = timelineOrEvent.data.timeline;

        console.assert(timeline instanceof WebInspector.Timeline, timeline);
        console.assert(!this._timelineOverviewGraphsMap.has(timeline), timeline);
        if (!this.canShowTimeline(timeline)) return;

        var overviewGraph = new WebInspector.TimelineOverviewGraph(timeline);
        overviewGraph.timelineOverview = this;
        this._timelineOverviewGraphsMap.set(timeline, overviewGraph);
        this._graphsContainerElement.appendChild(overviewGraph.element);
    },

    _timelineRemoved: function _timelineRemoved(event) {
        var timeline = event.data.timeline;
        console.assert(timeline instanceof WebInspector.Timeline, timeline);
        if (!this.canShowTimeline(timeline)) return;

        console.assert(this._timelineOverviewGraphsMap.has(timeline), timeline);

        var overviewGraph = this._timelineOverviewGraphsMap.take(timeline);
        overviewGraph.timelineOverview = null;
        this._graphsContainerElement.removeChild(overviewGraph.element);
    },

    _timeRangeSelectionChanged: function _timeRangeSelectionChanged(event) {
        this._selectionStartValueSetting.value = this.selectionStartTime - this._startTime;
        this._selectionDurationSetting.value = this.selectionDuration;

        this.dispatchEventToListeners(WebInspector.TimelineOverview.Event.TimeRangeSelectionChanged);
    },

    _resetSelection: function _resetSelection() {
        this.secondsPerPixel = this._defaultSettingsValues.durationPerPixel;
        this.selectionStartTime = this._defaultSettingsValues.selectionStartValue;
        this.selectionDuration = this._defaultSettingsValues.selectionDuration;
    }
}, {
    element: { // Public

        get: function () {
            return this._element;
        },
        configurable: true,
        enumerable: true
    },
    startTime: {
        get: function () {
            return this._startTime;
        },
        set: function (x) {
            if (this._startTime === x) return;

            this._startTime = x || 0;

            this._needsLayout();
        },
        configurable: true,
        enumerable: true
    },
    currentTime: {
        get: function () {
            return this._currentTime;
        },
        set: function (x) {
            if (this._currentTime === x) return;

            this._currentTime = x || 0;
            this._revealCurrentTime = true;

            this._needsLayout();
        },
        configurable: true,
        enumerable: true
    },
    secondsPerPixel: {
        get: function () {
            return this._durationPerPixel;
        },
        set: function (x) {
            x = Math.min(this._maximumDurationPerPixel, Math.max(this._minimumDurationPerPixel, x));

            if (this._durationPerPixel === x) return;

            this._durationPerPixel = x;
            this._durationPerPixelSetting.value = x;

            this._needsLayout();
        },
        configurable: true,
        enumerable: true
    },
    endTime: {
        get: function () {
            return this._endTime;
        },
        set: function (x) {
            if (this._endTime === x) return;

            this._endTime = x || 0;

            this._needsLayout();
        },
        configurable: true,
        enumerable: true
    },
    scrollStartTime: {
        get: function () {
            return this._scrollStartTime;
        },
        set: function (x) {
            if (this._scrollStartTime === x) return;

            this._scrollStartTime = x || 0;

            this._needsLayout();
        },
        configurable: true,
        enumerable: true
    },
    visibleDuration: {
        get: function () {
            if (isNaN(this._cachedScrollContainerWidth)) {
                this._cachedScrollContainerWidth = this._scrollContainerElement.offsetWidth;
                if (!this._cachedScrollContainerWidth) this._cachedScrollContainerWidth = NaN;
            }

            return this._cachedScrollContainerWidth * this._durationPerPixel;
        },
        configurable: true,
        enumerable: true
    },
    selectionStartTime: {
        get: function () {
            return this._timelineRuler.selectionStartTime;
        },
        set: function (x) {
            x = x || 0;

            var selectionDuration = this.selectionDuration;
            this._timelineRuler.selectionStartTime = x;
            this._timelineRuler.selectionEndTime = x + selectionDuration;
        },
        configurable: true,
        enumerable: true
    },
    selectionDuration: {
        get: function () {
            return this._timelineRuler.selectionEndTime - this._timelineRuler.selectionStartTime;
        },
        set: function (x) {
            x = Math.max(WebInspector.TimelineRuler.MinimumSelectionTimeRange, x);

            this._timelineRuler.selectionEndTime = this._timelineRuler.selectionStartTime + x;
        },
        configurable: true,
        enumerable: true
    },
    visible: {
        get: function () {
            return this._visible;
        },
        configurable: true,
        enumerable: true
    },
    timelineRuler: { // Protected

        get: function () {
            return this._timelineRuler;
        },
        configurable: true,
        enumerable: true
    }
});