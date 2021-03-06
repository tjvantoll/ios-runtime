//
//  main.m
//  __PROJECT_NAME__
//
//

#include <Foundation/Foundation.h>
#include <JavaScriptCore/JavaScriptCore.h>
#include <NativeScript.h>

#ifndef NDEBUG
#include "TNSDebugging.h"
#endif

TNSRuntime* runtime = nil;

int main(int argc, char* argv[]) {
    @autoreleasepool {
        NSString* applicationPath = [[NSBundle mainBundle] bundlePath];

        NSString* libraryPath = [NSSearchPathForDirectoriesInDomains(NSLibraryDirectory, NSUserDomainMask, YES) firstObject];
        NSString* liveSyncPath = [NSString pathWithComponents:@[ libraryPath, @"Application Support", @"LiveSync" ]];
        NSString* appFolderPath = [NSString pathWithComponents:@[ liveSyncPath, @"app" ]];

        NSArray* appContents = [[NSFileManager defaultManager] contentsOfDirectoryAtPath:appFolderPath error:nil];
        if (appContents.count > 0) {
            applicationPath = liveSyncPath;
        }

        runtime = [[TNSRuntime alloc] initWithApplicationPath:applicationPath];

#ifndef NDEBUG
        [TNSRuntimeInspector setLogsToSystemConsole:YES];
        TNSEnableRemoteInspector(argc, argv);
#endif

        [runtime executeModule:@"./"];

        return 0;
    }
}