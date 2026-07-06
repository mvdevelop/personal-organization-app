namespace PersonalOrganization.Web.Models;

public record GamificationStats(
    int Level,
    int CurrentXp,
    int NextLevelXp,
    int Progress,
    int TotalXp,
    AchievementItem[] UnlockedAchievements,
    GamificationCounters Counters
);

public record AchievementItem(
    string Slug,
    string Title,
    string Description,
    string Icon,
    string Category,
    int XpReward,
    bool Unlocked,
    string? UnlockedAt
);

public record GamificationCounters(
    int TasksCreated,
    int TasksCompleted,
    int HabitsCreated,
    int GoalsCreated,
    int GoalsCompleted,
    int StudySessions,
    int StudyMinutes,
    int NotesCreated
);
