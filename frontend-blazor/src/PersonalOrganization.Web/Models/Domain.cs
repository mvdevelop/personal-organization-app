namespace PersonalOrganization.Web.Models;

public record Domain(
    string Id,
    string Name,
    string Slug,
    string Icon,
    string Color,
    bool Predefined,
    int Order
);
