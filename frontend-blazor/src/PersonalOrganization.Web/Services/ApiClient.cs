using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
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
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    // Token storage: sessionStorage-like (survives F5, cleared on tab close)
    private const string TokenKey = "auth_token";

    public ApiClient(HttpClient http)
    {
        _http = http;
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
