/*
 * Copyright (C) 2014 Apple Inc. All rights reserved.
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
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

#include "config.h"
#include "GlobalObjectDebuggerAgent.h"

#include "ConsoleMessage.h"
#include "InjectedScriptManager.h"
#include "InspectorConsoleAgent.h"
#include "JSGlobalObject.h"
#include "ScriptArguments.h"
#include "ScriptCallStack.h"
#include "ScriptCallStackFactory.h"

using namespace JSC;

namespace Inspector {
    
    GlobalObjectDebuggerAgent::GlobalObjectDebuggerAgent(InjectedScriptManager* injectedScriptManager, JSC::JSGlobalObject& globalObject, InspectorConsoleAgent* consoleAgent)
    : InspectorDebuggerAgent(injectedScriptManager)
    , m_scriptDebugServer(globalObject)
    , m_consoleAgent(consoleAgent)
    {
        m_globalObject = jsCast<NativeScript::GlobalObject*>(&globalObject);
    }
    
    void GlobalObjectDebuggerAgent::enable(ErrorString& errorString) {
        InspectorDebuggerAgent::enable(errorString);
        
        for(auto sourceProvider: *m_globalObject->sourceProviders()) {
            m_globalObject->debugger()->sourceParsed(m_globalObject->globalExec(), sourceProvider.value, -1, WTF::emptyString());
        }
    }
    
    void GlobalObjectDebuggerAgent::startListeningScriptDebugServer()
    {
        scriptDebugServer().addListener(this);
    }
    
    void GlobalObjectDebuggerAgent::stopListeningScriptDebugServer(bool isBeingDestroyed)
    {
        scriptDebugServer().removeListener(this, isBeingDestroyed);
    }
    
    InjectedScript GlobalObjectDebuggerAgent::injectedScriptForEval(ErrorString& error, const int* executionContextId)
    {
        if (executionContextId) {
            error = ASCIILiteral("Execution context id is not supported for JSContext inspection as there is only one execution context.");
            return InjectedScript();
        }
        
        ExecState* exec = m_scriptDebugServer.globalObject().globalExec();
        return injectedScriptManager()->injectedScriptFor(exec);
    }
    
    void GlobalObjectDebuggerAgent::breakpointActionLog(JSC::ExecState* exec, const String& message)
    {
        m_consoleAgent->addMessageToConsole(std::make_unique<ConsoleMessage>(MessageSource::JS, MessageType::Log, MessageLevel::Log, message, createScriptCallStack(exec, ScriptCallStack::maxCallStackSizeToCapture), 0));
    }
    
} // namespace Inspector
