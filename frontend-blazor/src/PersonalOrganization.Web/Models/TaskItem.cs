namespace PersonalOrganization.Web.Models;

public record TaskItem(
    string Id,
    string Title,
    string Description,
    bool Completed,
    string Priority,
    string? DueDate,
    string UserId,
    string CreatedAt,
    string UpdatedAt
);

public record CreateTaskInput(
    string Title,
    string? Description = null,
    string? Priority = null,
    string? DueDate = null
);

public record UpdateTaskInput(
    string? Title = null,
    string? Description = null,
    bool? Completed = null,
    string? Priority = null,
    string? DueDate = null
);
