#include "CachedResource.h"
#include "MimeTypeHelper.h"

namespace Inspector {
WTF::HashMap<WTF::String, Inspector::Protocol::Page::ResourceType> CachedResource::m_mimeTypeMap = {
    { "text/xml", Inspector::Protocol::Page::ResourceType::Document },
    { "text/plain", Inspector::Protocol::Page::ResourceType::Document },
    { "application/xhtml+xml", Inspector::Protocol::Page::ResourceType::Document },
    { "text/css", Inspector::Protocol::Page::ResourceType::Stylesheet },
    { "text/javascript", Inspector::Protocol::Page::ResourceType::Script },
    { "text/ecmascript", Inspector::Protocol::Page::ResourceType::Script },
    { "application/javascript", Inspector::Protocol::Page::ResourceType::Script },
    { "application/ecmascript", Inspector::Protocol::Page::ResourceType::Script },
    { "application/x-javascript", Inspector::Protocol::Page::ResourceType::Script },
    { "application/json", Inspector::Protocol::Page::ResourceType::Script },
    { "application/x-json", Inspector::Protocol::Page::ResourceType::Script },
    { "text/x-javascript", Inspector::Protocol::Page::ResourceType::Script },
    { "text/x-json", Inspector::Protocol::Page::ResourceType::Script },
    { "text/typescript", Inspector::Protocol::Page::ResourceType::Script },
};

CachedResource::CachedResource() {}

CachedResource::CachedResource(WTF::String url) {
    m_url = url;

    NSString* cachedResourcePath = (NSString*)url;
    NSURL* cachedResourceUrl = [NSURL URLWithString:cachedResourcePath];

    m_mimeType = WTF::String(NativeScript::mimeTypeByExtension([cachedResourceUrl pathExtension]));
    Inspector::Protocol::Page::ResourceType resourceType = Inspector::Protocol::Page::ResourceType::Other;
    if (!m_mimeType.isEmpty()) {
        resourceType = resourceTypeByMimeType(m_mimeType);
    }

    m_type = resourceType;
}

void CachedResource::content(WTF::String* out_content, ErrorString& out_error) {
    NSString* cachedResourcePath = (NSString*)m_url;
    NSURL* cachedResourceUrl = [NSURL URLWithString:cachedResourcePath];

    bool out_base64Encoded = !hasTextContent();
    if (m_content.isEmpty()) {
        if (out_base64Encoded) {
            NSData* data = [[NSFileManager defaultManager] contentsAtPath:[cachedResourceUrl path]];
            if (data == nil) {
                out_error = WTF::ASCIILiteral("An error occurred");

                return;
            } else {
                NSString* base64Encoded = [data base64EncodedStringWithOptions:0];
                m_content = WTF::String(base64Encoded);
            }
        } else {
            NSError* error;
            NSString* content = [NSString stringWithContentsOfURL:cachedResourceUrl encoding:NSUTF8StringEncoding error:&error];
            if (content == nil) {
                out_error = [error localizedDescription];

                return;
            } else {
                m_content = WTF::String(content);
            }
        }
    }

    *out_content = m_content;
}

bool CachedResource::hasTextContent() {
    return m_type == Inspector::Protocol::Page::ResourceType::Document || m_type == Inspector::Protocol::Page::ResourceType::Stylesheet || m_type == Inspector::Protocol::Page::ResourceType::Script || m_type == Inspector::Protocol::Page::ResourceType::XHR;
}

Inspector::Protocol::Page::ResourceType CachedResource::resourceTypeByMimeType(WTF::String mimeType) {
    WTF::HashMap<WTF::String, Protocol::Page::ResourceType>::const_iterator iterator = m_mimeTypeMap.find(mimeType);
    if (iterator != m_mimeTypeMap.end()) {
        return iterator->value;
    }

    if (mimeType.startsWith("image/")) {
        return Inspector::Protocol::Page::ResourceType::Image;
    }

    if (mimeType.startsWith("font/")) {
        return Inspector::Protocol::Page::ResourceType::Font;
    }

    return Inspector::Protocol::Page::ResourceType::Other;
}
}