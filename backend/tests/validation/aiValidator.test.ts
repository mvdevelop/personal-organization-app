import { aiConnectionTestSchema, aiProviderInputSchema } from '../../src/validators/aiValidator';

describe('AI validators', () => {
  it('accepts a provider with a new API key', () => {
    expect(aiProviderInputSchema.parse({
      type: 'openai',
      apiKey: 'secret-key',
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 1024,
    })).toMatchObject({ type: 'openai', apiKey: 'secret-key' });
  });

  it('accepts provider updates without an API key', () => {
    expect(aiProviderInputSchema.parse({
      type: 'openai',
      model: 'gpt-4o-mini',
      isEnabled: false,
    })).toEqual({
      type: 'openai',
      model: 'gpt-4o-mini',
      isEnabled: false,
    });
  });

  it('rejects invalid provider settings', () => {
    expect(() => aiProviderInputSchema.parse({
      type: 'openai',
      temperature: 3,
    })).toThrow();
  });

  it('requires an API key when testing a connection', () => {
    expect(() => aiConnectionTestSchema.parse({ type: 'openai' })).toThrow();
  });

  it('accepts the OpenRouter provider model namespace', () => {
    expect(aiProviderInputSchema.parse({
      type: 'openrouter',
      model: 'openai/gpt-4o-mini',
    }).model).toBe('openai/gpt-4o-mini');
  });
});
