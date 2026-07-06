using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using MudBlazor;
using MudBlazor.Services;
using PersonalOrganization.Web.Services;

var builder = WebAssemblyHostBuilder.CreateDefault(args);

builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

// MudBlazor
builder.Services.AddMudServices(config =>
{
    config.SnackbarConfiguration.PositionClass = Defaults.Classes.Position.TopRight;
    config.SnackbarConfiguration.PreventDuplicates = true;
    config.SnackbarConfiguration.NewestOnTop = true;
    config.SnackbarConfiguration.ShowCloseIcon = true;
    config.SnackbarConfiguration.VisibleStateDuration = 3000;
    config.SnackbarConfiguration.HideTransitionDuration = 300;
    config.SnackbarConfiguration.ShowTransitionDuration = 300;
});

// Storage (JS interop for sessionStorage + localStorage)
builder.Services.AddSingleton<StorageService>();

// API client — aponta para o backend remoto
builder.Services.AddScoped(sp =>
{
    var httpClient = new HttpClient
    {
        BaseAddress = new Uri("https://personal-organization-backend.vercel.app")
    };
    return httpClient;
});
builder.Services.AddScoped<ApiClient>();

// Auth
builder.Services.AddScoped<CustomAuthStateProvider>();
builder.Services.AddScoped<Microsoft.AspNetCore.Components.Authorization.AuthenticationStateProvider>(
    sp => sp.GetRequiredService<CustomAuthStateProvider>()
);
builder.Services.AddAuthorizationCore();

// Preferences
builder.Services.AddSingleton<UserPreferencesService>();

var host = builder.Build();

// Initialize async services
var prefs = host.Services.GetRequiredService<UserPreferencesService>();
await prefs.InitializeAsync();

await host.RunAsync();
