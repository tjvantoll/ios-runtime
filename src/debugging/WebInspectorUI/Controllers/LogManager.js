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

WebInspector.LogManager = (function (_WebInspector$Object) {
    function LogManager() {
        _classCallCheck(this, LogManager);

        _get(Object.getPrototypeOf(LogManager.prototype), "constructor", this).call(this);

        WebInspector.Frame.addEventListener(WebInspector.Frame.Event.MainResourceDidChange, this._mainResourceDidChange, this);
    }

    _inherits(LogManager, _WebInspector$Object);

    _createClass(LogManager, [{
        key: "messageWasAdded",

        // Public

        value: function messageWasAdded(source, level, text, type, url, line, column, repeatCount, parameters, stackTrace, requestId) {
            // Called from WebInspector.ConsoleObserver.

            // FIXME: Get a request from request ID.

            if (parameters) parameters = parameters.map(function (x) {
                return WebInspector.RemoteObject.fromPayload(x);
            });

            var message = new WebInspector.ConsoleMessage(source, level, text, type, url, line, column, repeatCount, parameters, stackTrace, null);
            this.dispatchEventToListeners(WebInspector.LogManager.Event.MessageAdded, { message: message });
        }
    }, {
        key: "messagesCleared",
        value: function messagesCleared() {
            // Called from WebInspector.ConsoleObserver.

            WebInspector.ConsoleCommandResultMessage.clearMaximumSavedResultIndex();

            // We don't want to clear messages on reloads. We can't determine that easily right now.
            // FIXME: <rdar://problem/13767079> Console.messagesCleared should include a reason
            this._shouldClearMessages = true;
            setTimeout((function () {
                if (this._shouldClearMessages) this.dispatchEventToListeners(WebInspector.LogManager.Event.ActiveLogCleared);
                delete this._shouldClearMessages;
            }).bind(this), 0);
        }
    }, {
        key: "messageRepeatCountUpdated",
        value: function messageRepeatCountUpdated(count) {
            // Called from WebInspector.ConsoleObserver.

            this.dispatchEventToListeners(WebInspector.LogManager.Event.PreviousMessageRepeatCountUpdated, { count: count });
        }
    }, {
        key: "requestClearMessages",
        value: function requestClearMessages() {
            ConsoleAgent.clearMessages();
        }
    }, {
        key: "_mainResourceDidChange",

        // Private

        value: function _mainResourceDidChange(event) {
            console.assert(event.target instanceof WebInspector.Frame);

            if (!event.target.isMainFrame()) return;

            var oldMainResource = event.data.oldMainResource;
            var newMainResource = event.target.mainResource;
            if (oldMainResource.url !== newMainResource.url) this.dispatchEventToListeners(WebInspector.LogManager.Event.Cleared);else this.dispatchEventToListeners(WebInspector.LogManager.Event.SessionStarted);

            WebInspector.ConsoleCommandResultMessage.clearMaximumSavedResultIndex();

            delete this._shouldClearMessages;
        }
    }]);

    return LogManager;
})(WebInspector.Object);

WebInspector.LogManager.Event = {
    SessionStarted: "log-manager-session-was-started",
    Cleared: "log-manager-cleared",
    MessageAdded: "log-manager-message-added",
    ActiveLogCleared: "log-manager-current-log-cleared",
    PreviousMessageRepeatCountUpdated: "log-manager-previous-message-repeat-count-updated"
};