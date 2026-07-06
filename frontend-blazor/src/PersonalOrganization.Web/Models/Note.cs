namespace PersonalOrganization.Web.Models;

public record Note(
    string Id,
    string Title,
    string Content,
    string Color,
    string UserId,
    string CreatedAt,
    string UpdatedAt
);

public record CreateNoteInput(string Title, string? Content = null, string? Color = null);
public record UpdateNoteInput(string? Title = null, string? Content = null, string? Color = null);
