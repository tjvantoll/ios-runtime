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

WebInspector.RenderingFrameTimelineRecord = (function (_WebInspector$TimelineRecord) {
    function RenderingFrameTimelineRecord(startTime, endTime, children) {
        _classCallCheck(this, RenderingFrameTimelineRecord);

        _get(Object.getPrototypeOf(RenderingFrameTimelineRecord.prototype), "constructor", this).call(this, WebInspector.TimelineRecord.Type.RenderingFrame, startTime, endTime);

        this._children = children || [];
        this._durationByRecordType = new Map();
        this._durationRemainder = NaN;
        this._frameIndex = WebInspector.RenderingFrameTimelineRecord._nextFrameIndex++;
    }

    _inherits(RenderingFrameTimelineRecord, _WebInspector$TimelineRecord);

    _createClass(RenderingFrameTimelineRecord, [{
        key: "durationForRecords",
        value: function durationForRecords(recordType) {
            if (this._durationByRecordType.has(recordType)) return this._durationByRecordType.get(recordType);

            var duration = this._children.reduce(function (previousValue, currentValue) {
                if (currentValue.type !== recordType) return previousValue;

                var currentDuration = currentValue.duration;
                if (currentValue.usesActiveStartTime) currentDuration -= currentValue.inactiveDuration;
                return previousValue + currentDuration;
            }, 0);

            // Time spent in layout events which were synchronously triggered from JavaScript must be deducted from the
            // rendering frame's script duration, to prevent the time from being counted twice.
            if (recordType === WebInspector.TimelineRecord.Type.Script) {
                duration -= this._children.reduce(function (previousValue, currentValue) {
                    if (currentValue.type === WebInspector.TimelineRecord.Type.Layout && (currentValue.sourceCodeLocation || currentValue.callFrames)) return previousValue + currentValue.duration;
                    return previousValue;
                }, 0);
            }

            this._durationByRecordType.set(recordType, duration);
            return duration;
        }
    }, {
        key: "frameIndex",

        // Public

        get: function () {
            return this._frameIndex;
        }
    }, {
        key: "frameNumber",
        get: function () {
            return this._frameIndex + 1;
        }
    }, {
        key: "children",
        get: function () {
            return this._children.slice();
        }
    }, {
        key: "durationRemainder",
        get: function () {
            if (!isNaN(this._durationRemainder)) return this._durationRemainder;

            this._durationRemainder = this.duration;
            for (var recordType in WebInspector.TimelineRecord.Type) this._durationRemainder -= this.durationForRecords(WebInspector.TimelineRecord.Type[recordType]);

            return this._durationRemainder;
        }
    }], [{
        key: "resetFrameIndex",

        // Static

        value: function resetFrameIndex() {
            WebInspector.RenderingFrameTimelineRecord._nextFrameIndex = 0;
        }
    }]);

    return RenderingFrameTimelineRecord;
})(WebInspector.TimelineRecord);

WebInspector.RenderingFrameTimelineRecord.TypeIdentifier = "rendering-frame-timeline-record";

WebInspector.RenderingFrameTimelineRecord._nextFrameIndex = 0;