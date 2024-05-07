const models = {
claude: {
  endpoint: 'YOUR PROXY URL',
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
  // Add more models here
};

export default models;