using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Components.WebAssembly.Http;
using PersonalOrganization.Web.Models;

namespace PersonalOrganization.Web.Services;

public class ApiClientError : Exception
{
    public int StatusCode { get; }
    public object? Details { get; }

    public ApiClientError(int statusCode, string message, object? details = null)
        : base(message)
    {
        StatusCode = statusCode;
        Details = details;
    }
}

public class ApiClient
{
    private readonly HttpClient _http;
    private readonly StorageService _storage;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    private const string TokenKey = "auth_token";

    public ApiClient(HttpClient http, StorageService storage)
    {
        _http = http;
        _storage = storage;
    }

    public void SetToken(string? token)
    {
        if (token != null)
        {
            _http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }
        else
        {
            _http.DefaultRequestHeaders.Authorization = null;
        }
    }

    public bool HasToken()
    {
        return _http.DefaultRequestHeaders.Authorization?.Parameter != null;
    }

    /// <summary>
    /// Restore token from sessionStorage (called on app startup).
    /// Returns true if a token was found and set.
    /// </summary>
    public async Task<bool> TryRestoreTokenAsync()
    {
        try
        {
            var token = await _storage.GetSessionAsync(TokenKey);
            if (!string.IsNullOrEmpty(token))
            {
                SetToken(token);
                return true;
            }
        }
        catch { /* JS interop not ready yet */ }
        return false;
    }

    /// <summary>
    /// Persist token to sessionStorage and set on HttpClient.
    /// </summary>
    public async Task SaveTokenAsync(string token)
    {
        SetToken(token);
        await _storage.SetSessionAsync(TokenKey, token);
    }

    /// <summary>
    /// Remove token from sessionStorage and clear from HttpClient.
    /// </summary>
    public async Task ClearTokenAsync()
    {
        SetToken(null);
        await _storage.RemoveSessionAsync(TokenKey);
    }

    public async Task<T> GetAsync<T>(string endpoint, CancellationToken ct = default)
    {
        return await RequestAsync<T>(HttpMethod.Get, endpoint, null, ct);
    }

    public async Task<T> PostAsync<T>(string endpoint, object? data = null, CancellationToken ct = default)
    {
        return await RequestAsync<T>(HttpMethod.Post, endpoint, data, ct);
    }

    public async Task<T> PutAsync<T>(string endpoint, object? data = null, CancellationToken ct = default)
    {
        return await RequestAsync<T>(HttpMethod.Put, endpoint, data, ct);
    }

    public async Task<T> PatchAsync<T>(string endpoint, object? data = null, CancellationToken ct = default)
    {
        return await RequestAsync<T>(HttpMethod.Patch, endpoint, data, ct);
    }

    public async Task DeleteAsync(string endpoint, CancellationToken ct = default)
    {
        var response = await _http.DeleteAsync(endpoint, ct);
        if (!response.IsSuccessStatusCode)
            await ThrowOnError(response);
    }

    private async Task<T> RequestAsync<T>(HttpMethod method, string endpoint, object? data, CancellationToken ct)
    {
        var request = new HttpRequestMessage(method, endpoint);

        // Send credentials (httpOnly cookie) for cross-origin requests
        request.SetBrowserRequestCredentials(BrowserRequestCredentials.Include);

        if (data != null)
        {
            request.Content = JsonContent.Create(data, options: JsonOptions);
        }

        var response = await _http.SendAsync(request, ct);
        if (!response.IsSuccessStatusCode)
            await ThrowOnError(response);

        if (response.StatusCode == System.Net.HttpStatusCode.NoContent)
            return default!;

        var result = await response.Content.ReadFromJsonAsync<T>(JsonOptions, ct);
        return result ?? throw new ApiClientError(0, "Resposta vazia do servidor");
    }

    private static async Task ThrowOnError(HttpResponseMessage response)
    {
        try
        {
            var body = await response.Content.ReadFromJsonAsync<ApiError>(JsonOptions);
            throw new ApiClientError(
                (int)response.StatusCode,
                body?.Error ?? $"HTTP {(int)response.StatusCode}",
                body?.Details
            );
        }
        catch (ApiClientError) { throw; }
        catch
        {
            throw new ApiClientError((int)response.StatusCode, "Erro inesperado do servidor");
        }
    }
}
