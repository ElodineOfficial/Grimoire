const models = {
claude: {
  endpoint: 'YOUR PROXY URL HERE',
  apiKeyField: 'x-api-key',
  apiKeyPrefix: '',
  messageField: 'prompt',
  requestBody: {
    model: 'claude-v1',
    max_tokens_to_sample: 1024,
    stop_sequences: ['\n\nHuman:', '\n\nAssistant:'],
  },
  headers: {
    'anthropic-version': '2023-06-01',
  },
      contextLimits: {
	  'claude-v1': 100000, 
	  'claude-2.1': 100000, 
	  'claude-2.0': 200000, 
	  'claude-instant-1.2': 200000, 
	  'claude-3-opus-20240229': 200000, 
	  'claude-3-sonnet-20240229': 200000, 
	  'claude-3-haiku-20240307': 200000,
    },
  extractResponseContent: (data) => {
    if (data) {
      if (data.completion) {
        return data.completion;
      } else if (data.content && data.content.length > 0) {
        const textContent = data.content.find(item => item.type === 'text');
        if (textContent) {
          return textContent.text;
        }
      }
    }
    return null;
  },
  formatConversationHistory: (conversationHistory, characterName, initialMessage) => {
    let formattedHistory = '';

    // Start with the initial message if present
    if (initialMessage) {
      formattedHistory += `\n\nAssistant: ${initialMessage}\n\nHuman: ${
        conversationHistory[0]?.content || "Hello! I'm excited to start our conversation."
      }`;
    } else {
      formattedHistory += `\n\nHuman: ${
        conversationHistory[0]?.content || "Hello! I'm excited to start our conversation."
      }`;
    }

    // Append the rest of the conversation history
    formattedHistory += conversationHistory.slice(1).map((message) => {
      return message.role === 'user' ? `\n\nHuman: ${message.content}` : `\n\nAssistant: ${message.content}`;
    }).join('');

    // Ensure to prompt for the next assistant's message if the last message was from the user
    const lastMessage = conversationHistory[conversationHistory.length - 1];
    if (lastMessage && lastMessage.role !== 'assistant') {
      formattedHistory += '\n\nAssistant:';
    }

    return formattedHistory;
  },
},
  gpt: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    apiKeyField: 'Authorization',
    apiKeyPrefix: 'Bearer ',
    messageField: 'messages',
    requestBody: {
      model: 'gpt-3.5-turbo',
    },
	    contextLimits: {
      'gpt-3.5-turbo': 16000,
	  'gpt-3.5-turbo-0125': 16000, 
	  'gpt-3.5-turbo': 16000, 
	  'gpt-3.5-turbo-1106': 16000, 
	  'gpt-3.5-turbo-16k': 16000, 
	  'gpt-3.5-turbo-0613': 4000, 
      'gpt-3.5-turbo-16k-0613': 16000,
      'gpt-4': 8000,
	  'gpt-4o': 128000,
	  'gpt-4-turbo': 128000,
	  'gpt-4-turbo-2024-04-09': 128000,
      'gpt-4-turbo-preview': 128000,
	  'gpt-4-0125-preview': 128000, 
	  'gpt-4-1106-preview': 128000, 
	  'gpt-4-0613': 8000,
	    },
    extractResponseContent: (data) => {
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      }
      return null;
    },
    formatConversationHistory: (conversationHistory,) => {
      return [
        { role: 'system', content: `I am ready to begin whenever you are. Please offer instructions as you see fit.` },
        ...conversationHistory,
      ];
    },
  },
 cohere: {
    endpoint: 'https://api.cohere.ai/v1/chat',
    apiKeyField: 'Authorization',
    apiKeyPrefix: 'Bearer ',
    messageField: 'message',
    requestBody: {
      model: 'command-r-plus',
      max_tokens: 250,
      temperature: 0.7,
    },
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
	  contextLimits: {
      'command-r-plus': 128000,
	  },
    extractResponseContent: (data) => {
      if (data.generations && data.generations.length > 0) {
        return data.generations[0].text;
      }
      return null;
    },
formatConversationHistory: (conversationHistory) => {
  const cleanMessage = (message) => {
    return message.replace(/^\d+\n\n/, '').replace(/\n\n\d+$/, '').replace(/\n/g, ' ').trim();
  };

  const formattedHistory = conversationHistory
    .map((message) => {
      const cleanedMessage = cleanMessage(message.content);
      if (cleanedMessage !== '') {
        return {
          role: message.role === 'user' ? 'USER' : 'CHATBOT',
          message: cleanedMessage,
        };
      }
      return null;
    })
    .filter((message) => message !== null);

  return {
    chat_history: formattedHistory,
    message: cleanMessage(conversationHistory[conversationHistory.length - 1].content),
    connectors: [{ id: 'web-search' }],
  };
}}
};

export default models;
