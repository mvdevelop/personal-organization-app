/**
 * Utilities for sanitizing and validating user context to prevent prompt injection.
 */

/**
 * Sanitize user-provided text to prevent prompt injection.
 * Remove control characters, limit length, and escape special sequences.
 */
export function sanitizeContextValue(value: unknown, maxLength = 500): string {
  if (typeof value !== 'string') {
    return '';
  }

  // Remove control characters and newlines that could be injection vectors
  let sanitized = value
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control chars
    .replace(/\n\n+/g, '\n') // Collapse multiple newlines
    .trim()
    .slice(0, maxLength);

  return sanitized;
}

/**
 * Build a safe context string that cannot be easily manipulated for prompt injection.
 * Separate system data (safe) from user data (sanitized).
 */
export function buildSafeContext(data: {
  userName: string
  date: string
  taskCount: number
  habitCount: number
  goalCount: number
  recentTasks: Array<{ title: string; priority: string }>
  recentHabits: Array<{ title: string }>
  recentGoals: Array<{ title: string }>
}): string {
  // Only include metadata, not direct task/goal content
  const context = `
## User Context
- User: ${sanitizeContextValue(data.userName, 100)}
- Date: ${data.date}
- Active Tasks: ${data.taskCount}
- Habits: ${data.habitCount}
- Goals: ${data.goalCount}
- Recent Task Count: ${data.recentTasks.length}
- Recent Habit Count: ${data.recentHabits.length}
- Recent Goal Count: ${data.recentGoals.length}
`.trim();

  return context;
}

/**
 * Validate that a proposed action doesn't contain suspicious data.
 * This is a defense-in-depth check beyond Zod validation.
 */
export function validateActionData(
  action: Record<string, unknown>,
): { valid: boolean; reason?: string } {
  const values = Object.values(action);

  for (const value of values) {
    if (typeof value === 'string') {
      // Check for command injection patterns
      if (
        value.includes('${') ||
        value.includes('$(') ||
        value.includes('`') ||
        value.includes('\x00')
      ) {
        return { valid: false, reason: 'Action contains suspicious patterns' };
      }

      // Limit string length
      if (value.length > 10000) {
        return { valid: false, reason: 'Action field too long' };
      }
    } else if (typeof value === 'object' && value !== null) {
      // Recursively validate nested objects
      const nestedValidation = validateActionData(value as Record<string, unknown>);
      if (!nestedValidation.valid) {
        return nestedValidation;
      }
    }
  }

  return { valid: true };
}
