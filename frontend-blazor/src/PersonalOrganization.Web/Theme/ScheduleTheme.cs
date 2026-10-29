using MudBlazor;

namespace PersonalOrganization.Web.Theme;

/// <summary>
/// Single source of truth for the Smart Agenda visual identity.
/// Both the authenticated shell and the auth screens consume the same palette,
/// so light/dark switches stay consistent across the whole application.
/// </summary>
public static class ScheduleTheme
{
    public const string DefaultTheme = "dark";

    public static MudTheme Create() => new()
    {
        PaletteLight = new PaletteLight
        {
            Primary = "#5B5CD6",
            PrimaryContrastText = "#FFFFFF",
            Secondary = "#C06A8E",
            Info = "#3F6FC4",
            Success = "#2E8F6E",
            Warning = "#A9741F",
            Error = "#B8484B",
            Surface = "#FFFFFF",
            Background = "#F6F7FB",
            AppbarBackground = "#FFFFFF",
            DrawerBackground = "#FBFBFD",
            DrawerText = "#1B1E26",
            DrawerIcon = "#5B6274",
            Divider = "#E4E7EF",
            DividerLight = "#EDEFF5",
            TableLines = "#E4E7EF",
            LinesDefault = "#E4E7EF",
            LinesInputs = "#CFD4E0",
            TextPrimary = "#1B1E26",
            TextSecondary = "#5B6274",
            TextDisabled = "#8D93A1",
            ActionDefault = "#5B6274",
            ActionDisabled = "#B9BEC9",
            Dark = "#1B1E26",
            HoverOpacity = 0.06,
        },
        PaletteDark = new PaletteDark
        {
            Primary = "#7778F6",
            PrimaryContrastText = "#0E1015",
            Secondary = "#E989AD",
            Info = "#75A8F7",
            Success = "#45C49A",
            Warning = "#F0B35B",
            Error = "#E36D6D",
            Surface = "#1C2029",
            Background = "#111318",
            AppbarBackground = "#171A21",
            DrawerBackground = "#14161C",
            DrawerText = "#F1F3F9",
            DrawerIcon = "#A0A7B7",
            Divider = "#2B303D",
            DividerLight = "#242935",
            TableLines = "#2B303D",
            LinesDefault = "#2B303D",
            LinesInputs = "#3A4150",
            TextPrimary = "#F1F3F9",
            TextSecondary = "#A0A7B7",
            TextDisabled = "#747D90",
            ActionDefault = "#A0A7B7",
            ActionDisabled = "#5A6172",
            Dark = "#111318",
            HoverOpacity = 0.08,
        },
        Typography = new Typography
        {
            Default = new Default
            {
                FontFamily = new[] { "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif" },
                FontSize = "0.875rem",
                FontWeight = 400,
                LineHeight = 1.55,
                LetterSpacing = "normal",
            },
            H1 = new H1 { FontWeight = 700, LetterSpacing = "-0.035em" },
            H2 = new H2 { FontWeight = 700, LetterSpacing = "-0.035em" },
            H3 = new H3 { FontWeight = 700, LetterSpacing = "-0.03em" },
            H4 = new H4 { FontWeight = 700, LetterSpacing = "-0.03em" },
            H5 = new H5 { FontWeight = 700, LetterSpacing = "-0.02em" },
            H6 = new H6 { FontWeight = 600, LetterSpacing = "-0.02em" },
            Subtitle1 = new Subtitle1 { FontWeight = 600 },
            Subtitle2 = new Subtitle2 { FontWeight = 600 },
            Button = new Button { FontWeight = 600, LetterSpacing = "normal", TextTransform = "none" },
        },
        LayoutProperties = new LayoutProperties
        {
            DefaultBorderRadius = "14px",
        },
    };
}
