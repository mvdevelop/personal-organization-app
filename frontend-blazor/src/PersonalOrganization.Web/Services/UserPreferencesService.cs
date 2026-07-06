using Microsoft.AspNetCore.Components;

namespace PersonalOrganization.Web.Services;

/// <summary>
/// Manages user preferences (theme, sidebar) with localStorage persistence.
/// </summary>
public class UserPreferencesService
{
    private const string ThemeKey = "orgapp_theme";
    private const string SidebarKey = "orgapp_sidebar";

    private readonly StorageService _storage;
    private bool _initialized;

    public bool IsDarkMode { get; private set; }
    public bool SidebarCollapsed { get; private set; }

    public event Action? OnChange;

    public UserPreferencesService(StorageService storage)
    {
        _storage = storage;
        // Default values until initialized
        IsDarkMode = false;
        SidebarCollapsed = false;
    }

    public async Task InitializeAsync()
    {
        try
        {
            var theme = await _storage.GetLocalAsync(ThemeKey);
            IsDarkMode = theme == "dark";

            var sidebar = await _storage.GetLocalAsync(SidebarKey);
            SidebarCollapsed = sidebar == "true";
        }
        catch
        {
            // Use defaults
        }

        _initialized = true;
        NotifyChanged();
    }

    public async Task ToggleThemeAsync()
    {
        IsDarkMode = !IsDarkMode;
        await _storage.SetLocalAsync(ThemeKey, IsDarkMode ? "dark" : "light");
        NotifyChanged();
    }

    public async Task ToggleSidebarAsync()
    {
        SidebarCollapsed = !SidebarCollapsed;
        await _storage.SetLocalAsync(SidebarKey, SidebarCollapsed ? "true" : "false");
        NotifyChanged();
    }

    private void NotifyChanged() => OnChange?.Invoke();
}
