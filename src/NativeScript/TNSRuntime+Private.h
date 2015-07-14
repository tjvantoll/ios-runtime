//
//  TNSRuntime+Private.h
//  NativeScript
//
//  Created by Yavor Georgiev on 01.08.14.
//  Copyright (c) 2014 г. Telerik. All rights reserved.
//

#import "TNSRuntime.h"

@interface TNSRuntime () {
@package
    WTF::RefPtr<JSC::VM> _vm;
    JSC::Strong<NativeScript::GlobalObject> _globalObject;
    NSString* _applicationPath;
}

@end
