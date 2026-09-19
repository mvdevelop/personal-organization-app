import { createTaskSchema, updateTaskSchema } from '../../src/validators/taskValidator';

describe('Task Validators', () => {
  describe('createTaskSchema', () => {
    it('should accept valid task data', () => {
      const data = {
        title: 'My Task',
        description: 'Do something',
        priority: 'high' as const,
        dueDate: '2025-12-31',
      };
      const result = createTaskSchema.parse(data);
      expect(result.title).toBe('My Task');
      expect(result.priority).toBe('high');
    });

    it('should apply defaults for optional fields', () => {
      const result = createTaskSchema.parse({ title: 'Task without optional' });
      expect(result.description).toBe('');
      expect(result.priority).toBe('medium');
      expect(result.dueDate).toBeNull();
    });

    it('should reject missing title', () => {
      expect(() => {
        createTaskSchema.parse({ description: 'no title' });
      }).toThrow();
    });

    it('should reject title longer than 200 characters', () => {
      expect(() => {
        createTaskSchema.parse({ title: 'a'.repeat(201) });
      }).toThrow();
    });

    it('should reject invalid priority', () => {
      expect(() => {
        createTaskSchema.parse({ title: 'Test', priority: 'urgent' });
      }).toThrow();
    });
  });

  describe('updateTaskSchema', () => {
    it('should accept partial update', () => {
      const result = updateTaskSchema.parse({ title: 'Updated Title' });
      expect(result.title).toBe('Updated Title');
      expect(result.priority).toBeUndefined();
    });

    it('should accept all fields', () => {
      const result = updateTaskSchema.parse({
        title: 'New Title',
        description: 'New Desc',
        completed: true,
        priority: 'low',
        dueDate: '2025-06-15',
      });
      expect(result.completed).toBe(true);
      expect(result.priority).toBe('low');
    });

    it('should allow empty object (all optional)', () => {
      const result = updateTaskSchema.parse({});
      expect(result).toEqual({});
    });
  });
});
