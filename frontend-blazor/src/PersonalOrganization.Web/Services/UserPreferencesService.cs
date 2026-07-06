namespace PersonalOrganization.Web.Services;

public class UserPreferencesService
{
    private const string ThemeKey = "orgapp_theme";
    private const string SidebarKey = "orgapp_sidebar";

    public bool IsDarkMode { get; private set; }
    public bool SidebarCollapsed { get; private set; }

    public event Action? OnChange;

    public UserPreferencesService()
    {
        IsDarkMode = LoadPreference(ThemeKey) == "dark";
        SidebarCollapsed = LoadPreference(SidebarKey) == "true";
    }

    public void ToggleTheme()
    {
        IsDarkMode = !IsDarkMode;
        SavePreference(ThemeKey, IsDarkMode ? "dark" : "light");
        NotifyChanged();
    }

    public void ToggleSidebar()
    {
        SidebarCollapsed = !SidebarCollapsed;
        SavePreference(SidebarKey, SidebarCollapsed ? "true" : "false");
        NotifyChanged();
    }

    private void NotifyChanged() => OnChange?.Invoke();

    private static string? LoadPreference(string key)
    {
        try
        {
            // In Blazor WASM, we use localStorage via JS interop.
            // For now, we use a simple in-memory fallback.
            // We'll wire up JS interop later.
            return null;
        }
        catch { return null; }
    }

    private static void SavePreference(string key, string value)
    {
        try { /* Will use JS interop later */ }
        catch { /* ignore */ }
    }
}
