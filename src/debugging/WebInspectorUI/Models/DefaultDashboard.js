var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2013, 2014 Apple Inc. All rights reserved.
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
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

WebInspector.DefaultDashboard = (function (_WebInspector$Object) {
    function DefaultDashboard() {
        _classCallCheck(this, DefaultDashboard);

        _get(Object.getPrototypeOf(DefaultDashboard.prototype), "constructor", this).call(this);

        this._waitingForFirstMainResourceToStartTrackingSize = true;

        // Necessary events required to track load of resources.
        WebInspector.Frame.addEventListener(WebInspector.Frame.Event.ResourceWasAdded, this._resourceWasAdded, this);
        WebInspector.frameResourceManager.addEventListener(WebInspector.FrameResourceManager.Event.FrameWasAdded, this._frameWasAdded, this);

        // Necessary events required to track console messages.
        var logManager = WebInspector.logManager;
        logManager.addEventListener(WebInspector.LogManager.Event.Cleared, this._consoleWasCleared, this);
        logManager.addEventListener(WebInspector.LogManager.Event.ActiveLogCleared, this._consoleWasCleared, this);
        logManager.addEventListener(WebInspector.LogManager.Event.MessageAdded, this._consoleMessageAdded, this);
        logManager.addEventListener(WebInspector.LogManager.Event.PreviousMessageRepeatCountUpdated, this._consoleMessageWasRepeated, this);

        this._resourcesCount = 0;
        this._logs = 0;
        this._errors = 0;
        this._issues = 0;
    }

    _inherits(DefaultDashboard, _WebInspector$Object);

    _createClass(DefaultDashboard, [{
        key: "_dataDidChange",

        // Private

        value: function _dataDidChange() {
            this.dispatchEventToListeners(WebInspector.DefaultDashboard.Event.DataDidChange);
        }
    }, {
        key: "_resourceWasAdded",
        value: function _resourceWasAdded(event) {
            ++this.resourcesCount;
        }
    }, {
        key: "_frameWasAdded",
        value: function _frameWasAdded(event) {
            ++this.resourcesCount;
        }
    }, {
        key: "_resourceSizeDidChange",
        value: function _resourceSizeDidChange(event) {
            this.resourcesSize += event.target.size - event.data.previousSize;
        }
    }, {
        key: "_consoleMessageAdded",
        value: function _consoleMessageAdded(event) {
            var message = event.data.message;
            this._lastConsoleMessageType = message.level;
            this._incrementConsoleMessageType(message.level, message.repeatCount);
        }
    }, {
        key: "_consoleMessageWasRepeated",
        value: function _consoleMessageWasRepeated(event) {
            this._incrementConsoleMessageType(this._lastConsoleMessageType, 1);
        }
    }, {
        key: "_incrementConsoleMessageType",
        value: function _incrementConsoleMessageType(type, increment) {
            switch (type) {
                case WebInspector.ConsoleMessage.MessageLevel.Log:
                    this.logs += increment;
                    break;
                case WebInspector.ConsoleMessage.MessageLevel.Warning:
                    this.issues += increment;
                    break;
                case WebInspector.ConsoleMessage.MessageLevel.Error:
                    this.errors += increment;
                    break;
            }
        }
    }, {
        key: "_consoleWasCleared",
        value: function _consoleWasCleared(event) {
            this._logs = 0;
            this._issues = 0;
            this._errors = 0;
            this._dataDidChange();
        }
    }, {
        key: "resourcesCount",

        // Public

        get: function () {
            return this._resourcesCount;
        },
        set: function (value) {
            this._resourcesCount = value;
            this._dataDidChange();
        }
    }, {
        key: "logs",
        get: function () {
            return this._logs;
        },
        set: function (value) {
            this._logs = value;
            this._dataDidChange();
        }
    }, {
        key: "errors",
        get: function () {
            return this._errors;
        },
        set: function (value) {
            this._errors = value;
            this._dataDidChange();
        }
    }, {
        key: "issues",
        get: function () {
            return this._issues;
        },
        set: function (value) {
            this._issues = value;
            this._dataDidChange();
        }
    }]);

    return DefaultDashboard;
})(WebInspector.Object);

WebInspector.DefaultDashboard.Event = {
    DataDidChange: "default-dashboard-data-did-change"
};