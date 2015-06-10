var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * Copyright (C) 2013 Apple Inc. All rights reserved.
 * Copyright (C) 2013 Samsung Electronics. All rights reserved.
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

WebInspector.DOMStorageObserver = (function () {
    function DOMStorageObserver() {
        _classCallCheck(this, DOMStorageObserver);
    }

    _createClass(DOMStorageObserver, [{
        key: "addDOMStorage",

        // Events defined by the "DOMStorage" domain.

        // COMPATIBILITY (iOS 6): This event no longer exists. It is still needed and called on iOS 6.
        value: function addDOMStorage(storage) {
            WebInspector.storageManager.domStorageWasAdded(storage.id, storage.host, storage.isLocalStorage);
        }
    }, {
        key: "updateDOMStorage",

        // COMPATIBILITY (iOS 6): This event was split into the granular events below.
        value: function updateDOMStorage(storageId) {
            WebInspector.storageManager.domStorageWasUpdated(storageId);
        }
    }, {
        key: "domStorageItemsCleared",
        value: function domStorageItemsCleared(storageId) {
            WebInspector.storageManager.itemsCleared(storageId);
        }
    }, {
        key: "domStorageItemRemoved",
        value: function domStorageItemRemoved(storageId, key) {
            WebInspector.storageManager.itemRemoved(storageId, key);
        }
    }, {
        key: "domStorageItemAdded",
        value: function domStorageItemAdded(storageId, key, value) {
            WebInspector.storageManager.itemAdded(storageId, key, value);
        }
    }, {
        key: "domStorageItemUpdated",
        value: function domStorageItemUpdated(storageId, key, oldValue, value) {
            WebInspector.storageManager.itemUpdated(storageId, key, oldValue, value);
        }
    }]);

    return DOMStorageObserver;
})();