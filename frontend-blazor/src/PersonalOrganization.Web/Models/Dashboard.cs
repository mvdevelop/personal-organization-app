namespace PersonalOrganization.Web.Models;

public record DashboardData(
    DashboardTasks Tasks,
    DashboardHabits Habits,
    DashboardGoals Goals,
    DashboardStudies Studies,
    DashboardNotes Notes
);

public record DashboardTasks(
    int Total,
    int Pending,
    int Completed,
    int Today,
    int Overdue,
    DashboardRecentTask[] Recent
);

public record DashboardRecentTask(
    string Id,
    string Title,
    bool Completed,
    string Priority,
    string? DueDate
);

public record DashboardHabits(
    int Total,
    int TodayCheckIns,
    int BestStreak,
    DashboardStreak[] Streaks
);

public record DashboardStreak(string Title, int Streak, string Color);

public record DashboardGoals(
    int Active,
    int Completed,
    DashboardRecentGoal[] Recent
);

public record DashboardRecentGoal(
    string Id,
    string Title,
    string Type,
    double? TargetValue,
    double CurrentValue,
    string? Deadline
);

public record DashboardStudies(
    int Subjects,
    int WeekSessions,
    int WeekStudyHours
);

public record DashboardNotes(
    int Total,
    DashboardRecentNote[] Recent
);

public record DashboardRecentNote(string Id, string Title, string UpdatedAt);
