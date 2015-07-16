#ifndef __NativeScript__InspectorTimelineAgent__
#define __NativeScript__InspectorTimelineAgent__

#include <JavaScriptCore/InspectorAgentBase.h>
#include <JavaScriptCore/Inspector/InspectorBackendDispatchers.h>
#include <JavaScriptCore/Inspector/InspectorFrontendDispatchers.h>

namespace Inspector {
enum class TimelineRecordType {
    EventDispatch,
    ScheduleStyleRecalculation,
    RecalculateStyles,
    InvalidateLayout,
    Layout,
    Paint,
    RenderingFrame,
    ScrollLayer,

    ParseHTML,

    TimerInstall,
    TimerRemove,
    TimerFire,

    EvaluateScript,

    MarkLoad,
    MarkDOMContent,

    TimeStamp,
    Time,
    TimeEnd,

    XHRReadyStateChange,
    XHRLoad,

    FunctionCall,
    ProbeSample,
    ConsoleProfile,

    RequestAnimationFrame,
    CancelAnimationFrame,
    FireAnimationFrame,

    WebSocketCreate,
    WebSocketSendHandshakeRequest,
    WebSocketReceiveHandshakeResponse,
    WebSocketDestroy
};

class InspectorTimelineAgent final
    : public InspectorAgentBase,
      public TimelineBackendDispatcherHandler {
    WTF_MAKE_NONCOPYABLE(InspectorTimelineAgent);
    WTF_MAKE_FAST_ALLOCATED;

public:
    InspectorTimelineAgent(JSC::JSGlobalObject&);

    virtual void didCreateFrontendAndBackend(FrontendChannel*, BackendDispatcher*) override;
    virtual void willDestroyFrontendAndBackend(DisconnectReason) override;

    virtual void start(ErrorString&, const int* in_maxCallStackDepth) override;
    virtual void stop(ErrorString&) override;

private:
    struct TimelineRecordEntry {
        TimelineRecordEntry()
            : type(TimelineRecordType::EventDispatch) {}
        TimelineRecordEntry(PassRefPtr<Inspector::InspectorObject> record, PassRefPtr<Inspector::InspectorObject> data, PassRefPtr<Inspector::InspectorArray> children, TimelineRecordType type)
            : record(record)
            , data(data)
            , children(children)
            , type(type) {
        }

        RefPtr<Inspector::InspectorObject> record;
        RefPtr<Inspector::InspectorObject> data;
        RefPtr<Inspector::InspectorArray> children;
        TimelineRecordType type;
    };

    void sendEvent(RefPtr<Inspector::InspectorObject>&&);

    TimelineRecordEntry createRecordEntry(RefPtr<Inspector::InspectorObject>&& data, TimelineRecordType, bool captureCallStack);

    void didCompleteRecordEntry(const TimelineRecordEntry&);

    void addRecordToTimeline(RefPtr<Inspector::InspectorObject>&&, TimelineRecordType);

    double timestamp();
    std::unique_ptr<TimelineFrontendDispatcher> m_frontendDispatcher;
    RefPtr<TimelineBackendDispatcher> m_backendDispatcher;

    NativeScript::GlobalObject* m_globalObject;
    TimelineRecordEntry m_consoleRecordEntry;
    int m_maxCallStackDepth;
    bool m_enabled;
};
}
#endif /* defined(__NativeScript__InspectorTimelineAgent__) */
