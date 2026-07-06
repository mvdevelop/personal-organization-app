using Microsoft.JSInterop;

namespace PersonalOrganization.Web.Services;

/// <summary>
/// Wraps JS interop for browser storage (sessionStorage and localStorage).
/// In Blazor WASM, IJSRuntime is fully available after the first render.
/// </summary>
public class StorageService
{
    private readonly IJSRuntime _js;

    public StorageService(IJSRuntime js)
    {
        _js = js;
    }

    // ===== SessionStorage =====

    public async ValueTask<string?> GetSessionAsync(string key)
    {
        try
        {
            return await _js.InvokeAsync<string>("sessionStorage.getItem", key);
        }
        catch
        {
            return null;
        }
    }

    public async ValueTask SetSessionAsync(string key, string value)
    {
        try
        {
            await _js.InvokeVoidAsync("sessionStorage.setItem", key, value);
        }
        catch { /* ignore */ }
    }

    public async ValueTask RemoveSessionAsync(string key)
    {
        try
        {
            await _js.InvokeVoidAsync("sessionStorage.removeItem", key);
        }
        catch { /* ignore */ }
    }

    // ===== LocalStorage =====

    public async ValueTask<string?> GetLocalAsync(string key)
    {
        try
        {
            return await _js.InvokeAsync<string>("localStorage.getItem", key);
        }
        catch
        {
            return null;
        }
    }

    public async ValueTask SetLocalAsync(string key, string value)
    {
        try
        {
            await _js.InvokeVoidAsync("localStorage.setItem", key, value);
        }
        catch { /* ignore */ }
    }

    public async ValueTask RemoveLocalAsync(string key)
    {
        try
        {
            await _js.InvokeVoidAsync("localStorage.removeItem", key);
        }
        catch { /* ignore */ }
    }
}
