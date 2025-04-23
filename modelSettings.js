// modelSettings.js
const modelSettings = {
  claude: {
    fields: [
      { name: 'top_p', type: 'number', default: null, step: 0.1, min: 0, max: 1 },
      { name: 'top_k', type: 'number', default: 20, step: 1, min: 0 },
      { name: 'max_tokens_to_sample', type: 'number', default: 1024, step: 1, min: 1 },
      { name: 'temperature', type: 'number', default: 1, step: 0.1, min: 0, max: 1 },
      {
        name: 'model',
        type: 'select',
        default: 'claude-3-5-sonnet-20240620',
        options: ['claude-3-opus-20240229',
'claude-3-sonnet-20240229', 'claude-3-5-sonnet-20240620', 'claude-3-5-sonnet-latest', 'claude-3-5-sonnet-20241022',
'claude-3-haiku-20240307', 'claude-3-5-haiku-latest', 'claude-3-5-haiku-20241022','claude-2', 'claude-2.1', 'claude-2.0'],
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
        options: [ 'o1', 'o1-mini', 'o1-preview', 'o3-mini', 'gpt-4.5-preview', 'gpt-4o', 'gpt-4o-2024-11-20', 'gpt-4o-2024-08-06', 'gpt-4o-2024-05-13', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4-turbo-preview', 'gpt-4-1106-preview', 'gpt-4', 'gpt-4-0314', 'gpt-3.5-turbo-0125', 'gpt-3.5-turbo-1106', 'gpt-3.5-turbo-instruct'],
      },
    ],
  },
  cohere: {
    fields: [
      { name: 'temperature', type: 'number', default: 0.75, step: 0.1, min: 0, max: 1 },
      { name: 'max_tokens', type: 'number', default: 250, step: 1, min: 1 },
      { 
        name: 'model', 
        type: 'select',
        default: 'command-r-plus',
        options: ['command-r-plus'],
      },
    ],
  },
};

export default modelSettings;
