//
//  ObjCConstructorBase.h
//  NativeScript
//
//  Created by Yavor Georgiev on 17.07.14.
//  Copyright (c) 2014 г. Telerik. All rights reserved.
//

#ifndef __NativeScript__ObjCConstructorBase__
#define __NativeScript__ObjCConstructorBase__

#include <functional>
#include "FFIType.h"

namespace NativeScript {
class ObjCConstructorCall;

class ObjCConstructorBase : public JSC::InternalFunction {
public:
    typedef JSC::InternalFunction Base;

    DECLARE_INFO;

    Class klass() const {
        return this->_klass;
    }

    const WTF::Vector<ObjCConstructorCall*> generateInitializers(JSC::VM& vm, GlobalObject* globalObject, Class target) {
        return this->_initializersGenerator(vm, globalObject, target);
    }

    JSC::Structure* instancesStructure() const {
        return this->_instancesStructure.get();
    }

    const FFITypeMethodTable& ffiTypeMethodTable() {
        return this->_ffiTypeMethodTable;
    }

    static WTF::String className(const JSObject* object);

    const WTF::Vector<JSC::WriteBarrier<ObjCConstructorCall>>& initializers(JSC::VM&, GlobalObject*);

protected:
    ObjCConstructorBase(JSC::VM& vm, JSC::Structure* structure)
        : Base(vm, structure) {
    }

    static void destroy(JSC::JSCell* cell) {
        JSC::jsCast<ObjCConstructorBase*>(cell)->~ObjCConstructorBase();
    }

    void finishCreation(JSC::VM&, JSC::JSGlobalObject*, JSC::JSObject* prototype, Class);

    static void visitChildren(JSC::JSCell*, JSC::SlotVisitor&);

    static bool getOwnPropertySlot(JSC::JSObject*, JSC::ExecState*, JSC::PropertyName, JSC::PropertySlot&);

    static JSC::ConstructType getConstructData(JSC::JSCell*, JSC::ConstructData&);

    static JSC::CallType getCallData(JSC::JSCell*, JSC::CallData&);

    std::function<const WTF::Vector<ObjCConstructorCall*>(JSC::VM&, GlobalObject*, Class)> _initializersGenerator;

private:
    static JSC::JSValue read(JSC::ExecState*, void const*, JSC::JSCell*);

    static void write(JSC::ExecState*, const JSC::JSValue&, void*, JSC::JSCell*);

    static bool canConvert(JSC::ExecState*, const JSC::JSValue&, JSC::JSCell*);

    static const char* encode(JSC::JSCell*);

    Class _klass;

    JSC::WriteBarrier<JSC::JSObject> _prototype;

    WTF::Vector<JSC::WriteBarrier<ObjCConstructorCall>> _initializers;

    JSC::WriteBarrier<JSC::Structure> _instancesStructure;

    FFITypeMethodTable _ffiTypeMethodTable;
};
}

#endif /* defined(__NativeScript__ObjCConstructorBase__) */
