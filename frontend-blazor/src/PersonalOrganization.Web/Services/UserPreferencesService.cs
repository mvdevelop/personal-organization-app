using Microsoft.JSInterop;

namespace PersonalOrganization.Web.Services;

/// <summary>
/// Manages user preferences (theme, sidebar) with localStorage persistence.
/// Dark mode is the default theme for the Smart Agenda visual identity.
/// </summary>
public class UserPreferencesService
{
    private const string ThemeKey = "orgapp_theme";
    private const string SidebarKey = "orgapp_sidebar";

    private readonly StorageService _storage;

    public bool IsDarkMode { get; private set; } = true;
    public bool SidebarCollapsed { get; private set; }

    public event Action? OnChange;

    public UserPreferencesService(StorageService storage)
    {
        _storage = storage;
    }

    public async Task InitializeAsync()
    {
        try
        {
            var theme = await _storage.GetLocalAsync(ThemeKey);
            // No stored preference yet: keep dark mode as the default.
            IsDarkMode = theme is null || theme == "dark";

            var sidebar = await _storage.GetLocalAsync(SidebarKey);
            SidebarCollapsed = sidebar == "true";
        }
        catch
        {
            // Use defaults
        }

        NotifyChanged();
    }

    public async Task ToggleThemeAsync() => await SetThemeAsync(!IsDarkMode);

    public async Task SetThemeAsync(bool dark)
    {
        IsDarkMode = dark;
        await _storage.SetLocalAsync(ThemeKey, dark ? "dark" : "light");
        NotifyChanged();
    }

    public async Task ToggleSidebarAsync() => await SetSidebarAsync(!SidebarCollapsed);

    public async Task SetSidebarAsync(bool collapsed)
    {
        SidebarCollapsed = collapsed;
        await _storage.SetLocalAsync(SidebarKey, collapsed ? "true" : "false");
        NotifyChanged();
    }

    private void NotifyChanged() => OnChange?.Invoke();
}
