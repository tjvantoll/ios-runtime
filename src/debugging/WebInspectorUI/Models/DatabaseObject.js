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

WebInspector.DatabaseObject = (function (_WebInspector$Object) {
    function DatabaseObject(id, host, name, version) {
        _classCallCheck(this, DatabaseObject);

        _get(Object.getPrototypeOf(DatabaseObject.prototype), "constructor", this).call(this);

        this._id = id;
        this._host = host ? host : WebInspector.UIString("Local File");
        this._name = name;
        this._version = version;
    }

    _inherits(DatabaseObject, _WebInspector$Object);

    _createClass(DatabaseObject, [{
        key: "saveIdentityToCookie",
        value: function saveIdentityToCookie(cookie) {
            cookie[WebInspector.DatabaseObject.HostCookieKey] = this.host;
            cookie[WebInspector.DatabaseObject.NameCookieKey] = this.name;
        }
    }, {
        key: "getTableNames",
        value: function getTableNames(callback) {
            function sortingCallback(error, names) {
                if (!error) callback(names.sort());
            }

            DatabaseAgent.getDatabaseTableNames(this._id, sortingCallback);
        }
    }, {
        key: "executeSQL",
        value: function executeSQL(query, successCallback, errorCallback) {
            function queryCallback(columnNames, values, sqlError) {
                if (sqlError) {
                    var message;

                    switch (sqlError.code) {
                        case SQLException.VERSION_ERR:
                            message = WebInspector.UIString("Database no longer has expected version.");
                            break;
                        case SQLException.TOO_LARGE_ERR:
                            message = WebInspector.UIString("Data returned from the database is too large.");
                            break;
                        default:
                            message = WebInspector.UIString("An unexpected error occurred.");
                            break;
                    }

                    errorCallback(message);
                    return;
                }

                successCallback(columnNames, values);
            }

            function callback(error, result) {
                if (error) {
                    errorCallback(WebInspector.UIString("An unexpected error occurred."));
                    return;
                }

                // COMPATIBILITY (iOS 6): Newer versions of DatabaseAgent.executeSQL can delay before
                // sending the results. The version on iOS 6 instead returned a transactionId that
                // would be used later in the sqlTransactionSucceeded or sqlTransactionFailed events.
                if ("transactionId" in result) {
                    if (!result.success) {
                        errorCallback(WebInspector.UIString("An unexpected error occurred."));
                        return;
                    }

                    WebInspector.DatabaseObserver._callbacks[result.transactionId] = queryCallback;
                    return;
                }

                queryCallback(result.columnNames, result.values, result.sqlError);
            }

            // COMPATIBILITY (iOS 6): Since the parameters of the DatabaseAgent.executeSQL callback differ
            // we need the result object to lookup parameters by name.
            callback.expectsResultObject = true;

            DatabaseAgent.executeSQL(this._id, query, callback);
        }
    }, {
        key: "id",

        // Public

        get: function () {
            return this._id;
        }
    }, {
        key: "host",
        get: function () {
            return this._host;
        }
    }, {
        key: "name",
        get: function () {
            return this._name;
        }
    }, {
        key: "version",
        get: function () {
            return this._version;
        }
    }]);

    return DatabaseObject;
})(WebInspector.Object);

WebInspector.DatabaseObject.TypeIdentifier = "database";
WebInspector.DatabaseObject.HostCookieKey = "database-object-host";
WebInspector.DatabaseObject.NameCookieKey = "database-object-name";