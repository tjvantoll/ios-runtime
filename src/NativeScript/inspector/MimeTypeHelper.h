
#ifndef NativeScript_MimeTypeHelper_h
#define NativeScript_MimeTypeHelper_h

#import <MobileCoreServices/MobileCoreServices.h>

namespace NativeScript {

static WTF::String mimeTypeByExtension(WTF::String extension) {
    // UTI for iOS doesn't recognize css extensions and returns a dynamic UTI without a Mime Type
    if(WTF::equal(extension, "css")) {
        return  WTF::ASCIILiteral("text/css");
    }
    
    RetainPtr<CFStringRef> cfExtension = extension.createCFString();

    CFStringRef UTI = UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension, cfExtension.get(), NULL);
    CFStringRef MIMEType = UTTypeCopyPreferredTagWithClass (UTI, kUTTagClassMIMEType);
    
    WTF::String mimeType = WTF::String(MIMEType);
    CFRelease(MIMEType);
    CFRelease(UTI);
    
    return  mimeType;
}
}

#endif
