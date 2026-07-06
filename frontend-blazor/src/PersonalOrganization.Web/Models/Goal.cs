namespace PersonalOrganization.Web.Models;

public record Milestone(string Title, bool Completed, string? Date);

public record Goal(
    string Id,
    string Title,
    string Description,
    string Type,
    double? TargetValue,
    double CurrentValue,
    string? Deadline,
    string? DomainId,
    string Status,
    Milestone[] Milestones,
    string UserId,
    string CreatedAt,
    string UpdatedAt
);
