namespace PersonalOrganization.Web.Models;

public record Subject(
    string Id,
    string Name,
    string Category,
    string Color,
    int Workload,
    string UserId,
    string CreatedAt,
    string UpdatedAt
);

public record StudySession(
    string Id,
    string SubjectId,
    string UserId,
    int Duration,
    string Content,
    string Technique,
    string Date,
    string CreatedAt,
    string UpdatedAt
);

public record CreateSessionInput(
    string SubjectId,
    int Duration,
    string? Technique,
    string? Date
);
