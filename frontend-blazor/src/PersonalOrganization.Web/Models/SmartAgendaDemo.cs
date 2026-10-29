namespace PersonalOrganization.Web.Models;

/// <summary>
/// Illustrative dataset used to validate the Smart Agenda visual language when the
/// account has no data yet. Every value is local demo content and is surfaced in the
/// UI as "Demonstração" — it never claims to be real or connected to any external API.
/// </summary>
public static class SmartAgendaDemo
{
    public record DemoTask(string Id, string Title, string Category, string TagKind, string Due, bool Completed);

    public record DemoHabit(string Id, string Title, string Description, string Color, int Streak, bool CheckedToday);

    public record DemoGoal(string Title, string Icon, double Percent);

    public record DemoNote(string Title, string Date, string Category, string Excerpt);

    public record DemoAchievement(string Label, string Icon);

    public record WeatherInfo(string Temperature, string Condition, string Location, string FeelsLike, string Humidity);

    public static readonly WeatherInfo Weather = new(
        "14 °C",
        "Nevoeiro",
        "Teresópolis, Rio de Janeiro, Brasil",
        "14 °C",
        "98%");

    public static List<DemoTask> Tasks() => new()
    {
        new("demo-1", "Organizar entregas da semana", "Trabalho", "work", "6 de jun.", false),
        new("demo-2", "Revisar conteúdo da graduação", "Estudos", "study", "6 de jun.", false),
        new("demo-3", "Planejar próximas leituras", "Estudos", "study", "4 de jul.", false),
    };

    public static List<DemoHabit> Habits() => new()
    {
        new("demo-h1", "Leitura Graduação", "Seu hábito de aprendizado", "#7778F6", 0, false),
        new("demo-h2", "Leitura Livre", "Um tempo para você", "#45C49A", 0, false),
    };

    public static List<DemoGoal> Goals() => new()
    {
        new("Upgrade Notebooks", "Laptop", 0),
        new("Guitarra Ibanez / Jackson", "Music", 0),
        new("Upgrade PC", "Monitor", 0),
        new("Desenvolvimento pessoal", "Sparkles", 0),
    };

    public static DemoNote Note() => new(
        "Organização",
        "11 de jul.",
        "Nota pessoal",
        "Capture ideias importantes e encontre tudo em um só lugar.");
}
