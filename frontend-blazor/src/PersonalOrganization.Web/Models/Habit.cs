namespace PersonalOrganization.Web.Models;

public record Habit(
    string Id,
    string Title,
    string Description,
    string Frequency,
    int[] DaysOfWeek,
    string? DomainId,
    string Color,
    string? ReminderTime,
    string UserId,
    string CreatedAt,
    string UpdatedAt
);

public record HabitLog(
    string Id,
    string HabitId,
    string UserId,
    string Date,
    bool Completed,
    string Note
);

public record HabitStreak(
    string HabitId,
    string Title,
    int Streak
);

public record CreateHabitLogInput(string HabitId, string Date, bool? Completed = null);
