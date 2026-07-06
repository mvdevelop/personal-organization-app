namespace PersonalOrganization.Web.Models;

public record AiChatRequest(string Message);

public record AiChatResponse(string Response, int TokensUsed);

public record AiBriefingResponse(string Briefing);

public record AiSuggestionsResponse(string Suggestions);

public record ChatMessage(string Role, string Content, string Timestamp);

public record AiHistoryResponse(ChatMessage[] Messages);
