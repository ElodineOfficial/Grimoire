// modelSettings.js
const modelSettings = {
  claude: {
    fields: [
      { name: 'top_p', type: 'number', default: null, step: 0.1, min: 0, max: 1 },
      { name: 'top_k', type: 'number', default: null, step: 1, min: 0 },
      { name: 'max_tokens_to_sample', type: 'number', default: 1024, step: 1, min: 1 },
      { name: 'temperature', type: 'number', default: 1, step: 0.1, min: 0, max: 1 },
      {
        name: 'model',
        type: 'select',
        default: 'claude-v1',
        options: ['claude-v1', 'claude-2.1', 'claude-2.0', 'claude-instant-1.2', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
      },
    ],
  },
  gpt: {
    fields: [
      { name: 'temperature', type: 'number', default: .8, step: 0.1, min: 0, max: 1 },
      { name: 'presence_penalty', type: 'number', default: 1.6, step: 0.1, min: -2, max: 2 },
      { name: 'max_tokens', type: 'number', default: 1024, step: 1, min: 1 },
      { name: 'frequency_penalty', type: 'number', default: 1.8, step: 0.1, min: -2, max: 2 },
	  {
        name: 'model',
        type: 'select',
        default: 'gpt-3.5-turbo',
        options: ['gpt-4', 'gpt-4-turbo', 'gpt-4-turbo-2024-04-09', 'gpt-4-turbo-preview', 'gpt-4-0125-preview', 'gpt-4-1106-preview', 'gpt-4-0613', 'gpt-3.5-turbo-0125', 'gpt-3.5-turbo', 'gpt-3.5-turbo-1106', 'gpt-3.5-turbo-16k', 'gpt-3.5-turbo-0613', 'gpt-3.5-turbo-16k-0613'],
      },
    ],
  },
};

export default modelSettings;