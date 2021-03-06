//
//  ObjCFastEnumerationIteratorPrototype.mm
//  NativeScript
//
//  Created by Yavor Georgiev on 14.07.15.
//
//

#include "ObjCFastEnumerationIteratorPrototype.h"
#include "ObjCFastEnumerationIterator.h"
#include <JavaScriptCore/IteratorOperations.h>

namespace NativeScript {
using namespace JSC;

const ClassInfo ObjCFastEnumerationIteratorPrototype::s_info = { "NSFastEnumeration Iterator", &Base::s_info, 0, CREATE_METHOD_TABLE(ObjCFastEnumerationIteratorPrototype) };

EncodedJSValue JSC_HOST_CALL FastEnumerationIteratorPrototypeFuncNext(ExecState*);

void ObjCFastEnumerationIteratorPrototype::finishCreation(VM& vm, JSGlobalObject* globalObject) {
    Base::finishCreation(vm);
    vm.prototypeMap.addPrototype(this);

    JSC_NATIVE_FUNCTION(vm.propertyNames->next, FastEnumerationIteratorPrototypeFuncNext, DontEnum, 0);
}

EncodedJSValue JSC_HOST_CALL FastEnumerationIteratorPrototypeFuncNext(ExecState* execState) {
    auto iterator = jsDynamicCast<ObjCFastEnumerationIterator*>(execState->thisValue());
    if (!iterator)
        return JSValue::encode(throwTypeError(execState, ASCIILiteral("Cannot call NSFastEnumerationIterator.next() on a non-NSFastEnumerationIterator object")));

    JSValue result;
    if (iterator->next(execState, result)) {
        return JSValue::encode(createIteratorResultObject(execState, result, false));
    }

    if (execState->hadException()) {
        return JSValue::encode(jsUndefined());
    }

    return JSValue::encode(createIteratorResultObject(execState, jsUndefined(), true));
}
}