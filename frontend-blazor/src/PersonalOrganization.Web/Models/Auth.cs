namespace PersonalOrganization.Web.Models;

public record LoginRequest(string Email, string Password);
public record RegisterRequest(string Name, string Email, string Password);
public record AuthResponse(UserDto User, string Token);
public record UserDto(string Id, string Name, string Email);

public record ApiError(string? Error, object? Details);
