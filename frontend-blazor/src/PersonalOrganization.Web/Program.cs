using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using MudBlazor.Services;
using PersonalOrganization.Web.Services;

var builder = WebAssemblyHostBuilder.CreateDefault(args);

builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

// MudBlazor
builder.Services.AddMudServices();

// API client — aponta para o backend
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

await builder.Build().RunAsync();
