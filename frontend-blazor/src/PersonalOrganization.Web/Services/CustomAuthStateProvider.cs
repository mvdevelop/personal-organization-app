using Microsoft.AspNetCore.Components.Authorization;
using System.Security.Claims;
using System.Text.Json;
using PersonalOrganization.Web.Models;

namespace PersonalOrganization.Web.Services;

public class CustomAuthStateProvider : AuthenticationStateProvider
{
    private readonly ApiClient _api;
    private UserDto? _currentUser;

    public CustomAuthStateProvider(ApiClient api)
    {
        _api = api;
    }

    public override async Task<AuthenticationState> GetAuthenticationStateAsync()
    {
        if (_currentUser != null)
        {
            return CreateState(_currentUser);
        }

        // Try restoring session from server
        try
        {
            var user = await _api.GetAsync<UserDto>("/api/auth/me");
            _currentUser = user;
            return CreateState(user);
        }
        catch
        {
            return new AuthenticationState(new ClaimsPrincipal(new ClaimsIdentity()));
        }
    }

    public async Task SignIn(string email, string password)
    {
        var response = await _api.PostAsync<AuthResponse>("/api/auth/login", new { email, password });
        _api.SetToken(response.Token);
        _currentUser = response.User;
        NotifyAuthenticationStateChanged(Task.FromResult(CreateState(response.User)));
    }

    public async Task SignUp(string name, string email, string password)
    {
        var response = await _api.PostAsync<AuthResponse>("/api/auth/register", new { name, email, password });
        _api.SetToken(response.Token);
        _currentUser = response.User;
        NotifyAuthenticationStateChanged(Task.FromResult(CreateState(response.User)));
    }

    public async Task SignOut()
    {
        try
        {
            await _api.PostAsync<object>("/api/auth/logout");
        }
        catch { /* ignore */ }

        _api.SetToken(null);
        _currentUser = null;
        NotifyAuthenticationStateChanged(
            Task.FromResult(new AuthenticationState(new ClaimsPrincipal(new ClaimsIdentity())))
        );
    }

    public UserDto? GetCurrentUser() => _currentUser;

    private static AuthenticationState CreateState(UserDto user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Email, user.Email),
        };
        var identity = new ClaimsIdentity(claims, "jwt");
        return new AuthenticationState(new ClaimsPrincipal(identity));
    }
}
