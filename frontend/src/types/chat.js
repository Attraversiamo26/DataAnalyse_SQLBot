// 对话消息类型
export var MessageType;
(function (MessageType) {
    MessageType["USER"] = "user";
    MessageType["SYSTEM"] = "system";
})(MessageType || (MessageType = {}));
// 分析类型
export var AnalysisType;
(function (AnalysisType) {
    AnalysisType["CHAT"] = "chat";
    AnalysisType["ANALYSIS"] = "analysis";
    AnalysisType["REPORT"] = "report";
})(AnalysisType || (AnalysisType = {}));
