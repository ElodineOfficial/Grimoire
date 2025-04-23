// Get DOM elements
const landingBtn = document.getElementById("landingBtn");
const currentChatBtn = document.getElementById("threadsBtn");
const settingsBtn = document.getElementById("settingsBtn");
const userSettings = document.getElementById("userSettings");
const settingsModal = document.getElementById("settingsModal");
const apiKeyForm = document.getElementById("apiKeyForm");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const chatMessages = document.getElementById("chatMessages");
const createCharacterBtn = document.getElementById("createCharacterBtn");
const characterModal = document.getElementById("characterModal");
const characterForm = document.getElementById("characterForm");
const modelSettingsBtn = document.getElementById('modelSettingsBtn');
const modelSettingsModal = document.getElementById('modelSettingsModal');
const modelSettingsForm = document.getElementById('modelSettingsForm');
// Toggle left column visibility
const toggleSidebar = document.getElementById('toggleSidebar');
const leftColumn = document.querySelector('.left-column');
const expandSidebar = document.getElementById('expandSidebar');
const purgeDataBtn = document.getElementById('purgeDataBtn');
const middleColumn = document.querySelector('.middle-column');  // Add this line to your script


import {
  $,
  $$,
  delay,
  showEl,
  hideEl,
  prompt2,
  sanitizeHtml,
  textToSpeech,
} from "./utils.js";

import models from "./models.js";
import modelSettings from './modelSettings.js';
import { renderMarkdown } from './markdown.js';
import starterCharacters from './starterCharacters.js';

let db = new Dexie("GrimDBAlpha");
db.version(95).stores({
  characters:
    "++id,name,systemMessage,modelVersion,preset,temp,preamble,initialMessages,avatarUrl,creationTime,additionalParameters,cfg_uc,max_length,lastMessageTime,sceneBackground",
  threads: "++id,name,characterId,creationTime,lastMessageTime,conversationHistory",
  messages: "++id,threadId,message,characterId,creationTime",
  misc: "key,value",
  settings: "++id,claudeKey,gptKey", // Make sure this line is correctly defined
  modelSettings: "++id,name,settings",
  presets: '++id, name, modelName, settings',
});
window.db = db;

// Set up MutationObserver to monitor changes in the #chatMessages container
const chatMessagesObserver = new MutationObserver((mutations) => {
  console.log("MutationObserver triggered"); // Log when observer is triggered

  mutations.forEach((mutation) => {
    console.log("Mutation type:", mutation.type); // Log mutation type
    if (mutation.type === 'childList' || mutation.type === 'subtree') {
      const chatMessagesContainer = document.getElementById('chatMessages');

      // Scroll to the bottom of the container
      chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;

      console.log("Scrolled to bottom:", chatMessagesContainer.scrollTop, chatMessagesContainer.scrollHeight); // Log scroll action
    }
  });
});

// Start observing the #chatMessages container
const chatMessagesContainer = document.getElementById('chatMessages');
if (chatMessagesContainer) {
  console.log("#chatMessages element found, starting observer"); // Log if the element is found
  chatMessagesObserver.observe(chatMessagesContainer, {
    childList: true,
    subtree: true,
  });
} else {
  console.error("#chatMessages element not found, observer not started"); // Log if the element is not found
}

// Event listeners
landingBtn.addEventListener("click", showLandingPage);
settingsBtn.addEventListener("click", showUserSettings);

// Update the event listener for the "Current Chat" button
currentChatBtn.addEventListener("click", showCurrentChat);

toggleSidebar.addEventListener('click', () => {
  leftColumn.classList.add('collapsed');
  middleColumn.style.width = '100%';  // Adjust to use full width when left column is collapsed
});

expandSidebar.addEventListener('click', () => {
  leftColumn.classList.remove('collapsed');
  middleColumn.style.width = 'calc(100% - 300px)';  // Reset width when left column is expanded
});


function closeEditCharacterModal() {
  document.getElementById('editCharacterModal').style.display = 'none';
}

function showLandingPage() {
    document.getElementById("landingPage").style.display = "grid";
    document.getElementById("currentChat").style.display = "none";
	  displayCharacters(); // Call displayCharacters here
	  displayStarterCharacters();
}

function showCurrentChat() {
  let currentThreadId = getCurrentThreadId();

  console.log("Current Thread ID on showCurrentChat:", currentThreadId);

  // Hide the landing page and character cards
  document.getElementById("landingPage").style.display = "none";

  // Show the current chat
  document.getElementById("currentChat").style.display = "flex";

  if (currentThreadId === null) {
    db.misc
      .get("lastUsedThreadId")
      .then((lastUsedThreadId) => {
        if (lastUsedThreadId) {
          currentThreadId = lastUsedThreadId.value;
          console.log("Last used thread ID retrieved:", currentThreadId);
          setCurrentThreadId(currentThreadId);
          displayMessagesForThread(currentThreadId);
        } else {
          chatMessages.innerHTML =
            "No thread selected. Please select a thread from the thread list.";
        }
      })
      .catch((error) => {
        console.error("Error retrieving last used thread ID:", error);
      });
  } else {
    displayMessagesForThread(currentThreadId);
  }
}


function setCurrentThreadId(threadId) {
  currentThreadId = threadId;
}

// Call displayThreads after the database is opened successfully
db.open()
  .then(() => {
    console.log("Database opened successfully");
    console.log(
      "Available tables:",
      db.tables.map((table) => table.name)
    );

    // Load model settings from the database
    console.log("Loading model settings");
    loadModelSettings()
      .then(() => {
        console.log("Model settings loaded successfully");
        // Retrieve the last used thread ID from the misc table
        db.misc
          .get("lastUsedThreadId")
          .then((lastUsedThreadId) => {
            console.log("Retrieving last used thread ID");
            if (lastUsedThreadId) {
              setCurrentThreadId(lastUsedThreadId.value); // Set the current thread ID
              console.log("Last used thread ID retrieved:", currentThreadId);
            } else {
              console.log("No last used thread ID found");
            }
            displayMessages(currentThreadId);
            // Remove the displayCharacters() call from here
            displayThreads();
          })
          .catch((error) => {
            console.error("Error retrieving last used thread ID:", error);
          });
      })
      .catch((error) => {
        console.error("Error loading model settings:", error);
      });
  })
  .catch((e) => {
    console.error("Failed to open database: " + e.message);
  })
  .finally(() => {
    showLandingPage(); // Call showLandingPage here
  });
  
function showUserSettings() {
  document.getElementById("landingPage").style.display = "none";
  document.getElementById("currentChat").style.display = "none";
  showSettingsModal(); // Show the settings modal instead of the user settings div

  // Load and display the user avatar
  db.settings
    .get(1)
    .then((settings) => {
      if (settings && settings.avatar) {
        updateAvatarDisplay(settings.avatar);
      } else {
        updateAvatarDisplay("default-character-avatar.png"); // Fall back to the default avatar
      }
    })
    .catch((error) => {
      console.error("Error retrieving user settings:", error);
      updateAvatarDisplay("default-character-avatar.png"); // Fall back to the default avatar
    });
}

// Function to display threads
function displayThreads() {
  const threadList = document.getElementById("threadList");
  console.log("Thread List element:", threadList);

  if (threadList) {
    threadList.innerHTML = "";

    db.threads
      .toArray()
      .then((threads) => {
        console.log("Threads array:", threads);

        threads.forEach((thread) => {
          const threadElement = document.createElement("div");
          threadElement.classList.add("thread");
          if (thread.id === currentThreadId) {
            threadElement.classList.add("active");
          }

          db.characters
            .get(thread.characterId)
            .then((character) => {
              const characterName = character ? character.name : "Unknown Character";
              const characterAvatar = character ? character.avatar : "default-character-avatar.png";

              const avatarElement = document.createElement("img");
              avatarElement.classList.add("thread-avatar");
              avatarElement.src = characterAvatar;
              avatarElement.alt = `${characterName} avatar`;
              threadElement.appendChild(avatarElement);

              const threadInfoElement = document.createElement("div");
              threadInfoElement.classList.add("thread-info");

              const characterNameElement = document.createElement("div");
              characterNameElement.classList.add("character-name");
              characterNameElement.textContent = characterName;

              const threadActionsElement = document.createElement("div");
              threadActionsElement.classList.add("thread-actions");

              const editCharacterButton = document.createElement("button");
              editCharacterButton.classList.add("edit-character-btn");
              editCharacterButton.textContent = "Edit";
              editCharacterButton.addEventListener("click", (event) => {
                event.stopPropagation(); // Prevent the thread click event from triggering
                showEditCharacterModal(thread.characterId);
              });
              threadActionsElement.appendChild(editCharacterButton);

              characterNameElement.appendChild(threadActionsElement);

              threadInfoElement.appendChild(characterNameElement);

              const threadIdElement = document.createElement("div");
              threadIdElement.classList.add("thread-id");
              threadIdElement.textContent = `Thread #${thread.id}`;

              const deleteThreadButton = document.createElement("button");
              deleteThreadButton.classList.add("delete-thread-btn");
              deleteThreadButton.textContent = "Delete";
              deleteThreadButton.addEventListener("click", (event) => {
                event.stopPropagation(); // Prevent the thread click event from triggering
                deleteThread(thread.id);
              });
              threadIdElement.appendChild(deleteThreadButton);

              threadInfoElement.appendChild(threadIdElement);

              threadElement.appendChild(threadInfoElement);

              threadElement.onclick = () => {
                currentThreadId = thread.id;
                db.misc
                  .put({ key: "lastUsedThreadId", value: thread.id })
                  .then(() => {
                    console.log("Last used thread ID saved:", thread.id);
                    setCurrentThreadId(currentThreadId);
                    showCurrentChat();
                    displayThreads();
                  })
                  .catch((error) => {
                    console.error("Error saving last used thread ID:", error);
                  });
              };

              threadList.appendChild(threadElement);
            })
            .catch((error) => {
              console.error("Error retrieving character:", error);
            });
        });
      })
      .catch((error) => {
        console.error("Error retrieving threads:", error);
      });
  } else {
    console.error("Thread List element not found.");
  }
}

function showSettingsModal() {
  settingsModal.style.display = "block";

  // Add event listener to the close button
  const closeButton = settingsModal.querySelector('.close');
  closeButton.addEventListener('click', hideSettingsModal);

  // Load and display the user avatar
  db.settings
    .get(1)
    .then((settings) => {
      if (settings && settings.avatar) {
        updateAvatarDisplay(settings.avatar);
      } else {
        updateAvatarDisplay("default-character-avatar.png"); // Fall back to the default avatar
      }
    })
    .catch((error) => {
      console.error("Error retrieving user settings:", error);
      updateAvatarDisplay("default-character-avatar.png"); // Fall back to the default avatar
    });
}

// Function to hide the settings modal
function hideSettingsModal() {
  settingsModal.style.display = "none";
}

// Event listener for the settings button
settingsBtn.addEventListener("click", showSettingsModal);

// Event listener for the API key form submission
document.addEventListener("DOMContentLoaded", function () {
  apiKeyForm.addEventListener("submit", saveApiKeys);
});

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const characterData = urlParams.get('character');

  if (characterData) {
    try {
      const parsedCharacterData = JSON.parse(decodeURIComponent(characterData));
      importCharacter(parsedCharacterData);
    } catch (error) {
      console.error('Error parsing character data:', error);
    }
  }
});

let conversationHistory = [];

console.log("Script loaded and initializing event listeners");
function saveApiKeys(event) {
  event.preventDefault();
  const claudeKey = document.getElementById("claudeKey").value;
  const gptKey = document.getElementById("gptKey").value;
  const cohereKey = document.getElementById("cohereKey").value;
  const userName = document.getElementById("userName").value;

  console.log(
    "Values retrieved - Claude Key:",
    claudeKey,
    "GPT Key:",
    gptKey,
    "User Name:",
    userName
  ); // Log the values

  // Handle avatar upload
  const fileInput = document.getElementById("avatarInput");
  const file = fileInput.files[0];
  let avatarData = null;

  if (file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      avatarData = reader.result;
      saveSettings(claudeKey, gptKey, userName, avatarData);
    };
    reader.onerror = function (error) {
      console.error("Error reading file:", error);
      saveSettings(claudeKey, gptKey, userName, null);
    };
  } else {
    saveSettings(claudeKey, gptKey, cohereKey, userName, null);
  }
}
function saveSettings(claudeKey, gptKey, cohereKey, userName, avatarData) {
  const id = 1;
  const settings = { id, claudeKey, gptKey, cohereKey, userName };

  if (avatarData) {
    settings.avatar = avatarData;
  }

  db.settings
    .put(settings)
    .then(() => {
      console.log("Settings saved successfully");
      hideSettingsModal();
      updateAvatarDisplay(avatarData || "default-avatar.png");
    })
    .catch((error) => {
      console.error("Error saving settings:", error);
    });
}

function appendMessage(content, type, senderName, senderAvatar) {
  const messageElement = document.createElement("div");
  messageElement.classList.add(type === "user" ? "user-message" : "ai-message");

  const avatarElement = document.createElement("img");
  avatarElement.classList.add("message-avatar");
  avatarElement.src = senderAvatar;
  avatarElement.alt = type === "user" ? "user avatar" : "character avatar";
  messageElement.appendChild(avatarElement);

  const messageContentWrapper = document.createElement("div");
  messageContentWrapper.classList.add("message-content-wrapper");

  const messageHeader = document.createElement("div");
  messageHeader.classList.add("message-header");

  const senderNameElement = document.createElement("strong");
  senderNameElement.textContent = senderName;
  messageHeader.appendChild(senderNameElement);

  const actionButtons = document.createElement("div");
  actionButtons.classList.add("message-action-buttons");

  const editButton = document.createElement("button");
  editButton.classList.add("edit-message-btn");
  editButton.textContent = "Edit";
  actionButtons.appendChild(editButton);

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-message-btn");
  deleteButton.textContent = "Delete";
  actionButtons.appendChild(deleteButton);

  if (type === "ai") {
    const rerollButton = document.createElement("button");
    rerollButton.classList.add("reroll-message-btn");
    rerollButton.textContent = "Reroll";
    actionButtons.appendChild(rerollButton);
  }

  messageHeader.appendChild(actionButtons);

  const messageContent = document.createElement("div");
  messageContent.classList.add("message-content");
  messageContent.innerHTML = renderMarkdown(content);

  messageContentWrapper.appendChild(messageHeader);
  messageContentWrapper.appendChild(messageContent);

  messageElement.appendChild(messageContentWrapper);

  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to send a message
function sendMessage() {
  const content = messageInput.value.trim();
  const selectedModel = modelSelect.value;
  const threadId = getCurrentThreadId(); // Get the current thread ID

  if (content !== "") {
    const timestamp = new Date().toISOString();
    db.settings
      .get(1)
      .then((settings) => {
        const userAvatar = settings?.avatar || "default-avatar.png";
        db.messages
          .add({ content, timestamp, model: selectedModel, threadId, type: "user" })
          .then(() => {
            console.log("Message sent successfully");
            messageInput.value = "";
            appendMessage(content, "user", "User", userAvatar);
            sendMessageToAPI(selectedModel, content);
          })
          .catch((error) => {
            console.error("Error sending message:", error);
          });
      })
      .catch((error) => {
        console.error("Error retrieving user settings:", error);
      });
  }
}


// Event listener for the send button
sendBtn.addEventListener("click", sendMessage);

// Function to automatically adjust the height of the textarea
function adjustTextareaHeight() {
  const textarea = document.querySelector("#messageInput");
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}


// Utility function to calculate word count
function getWordCount(text) {
  return text.trim().split(/\s+/).length;
}

// Function to trim conversation history based on context limit
function trimConversationHistory(conversationHistory, contextLimit) {
  let totalWords = 0;
  let trimmedHistory = [];

  for (let i = conversationHistory.length - 1; i >= 0; i--) {
    const message = conversationHistory[i];
    const wordCount = getWordCount(message.content);
    if (totalWords + wordCount > contextLimit) {
      break;
    }
    trimmedHistory.unshift(message);
    totalWords += wordCount;
  }

  return trimmedHistory;
}

// Function to send a message to the API. Updated to accept optional threadId and isReroll flag.
function sendMessageToAPI(model, content, threadId = getCurrentThreadId(), isReroll = false) {
  db.settings
    .get(1)
    .then(function (settings) {
      const apiKey = settings[model + "Key"];
      console.log("Using " + model.toUpperCase() + " API Key:", apiKey);

      if (!apiKey) {
        console.error("API key not found for model:", model);
        showErrorModal("API key not found. Please make sure you have entered a valid API key for the selected model in the settings.");
        return;
      }

      db.threads
        .get(threadId)
        .then(function (thread) {
          if (thread && thread.characterId) {
            // Retrieve the conversation history from the thread, or initialize it as an empty array
            const conversationHistory = thread.conversationHistory || [];

            db.characters
              .get(thread.characterId)
              .then(function (character) {
                if (character) {
                  const characterId = character.id;
                  const characterInstruction = character.instruction;
                  const characterReminder = character.reminder;
                  const characterInitialMessage = character.initialMessage;
                  const characterName = character.name;
                  const characterAvatar = character.avatar || "default-character-avatar.png";

                  Promise.all([
                    replacePlaceholders(characterInstruction, characterId),
                    replacePlaceholders(characterReminder, characterId),
                    replacePlaceholders(characterInitialMessage, characterId),
                  ])
                    .then(function ([instruction, reminder, initialMessage]) {
                      // Seed conversation history with the initial message if it's empty.
                      if (conversationHistory.length === 0) {
                        conversationHistory.push({
                          role: "assistant",
                          content: initialMessage,
                        });
                      }

                      if (isReroll) {
                        // On a reroll, remove only the last assistant message.
                        if (
                          conversationHistory.length > 0 &&
                          conversationHistory[conversationHistory.length - 1].role === "assistant"
                        ) {
                          conversationHistory.pop();
                        }
                        // Do not add a new user message; use the existing one.
                      } else {
                        // Normal flow: add the new user message.
                        conversationHistory.push({
                          role: "user",
                          content: instruction + "\n\n" + content + "\n\n" + reminder,
                        });
                      }

                      console.log("Conversation history:", conversationHistory);

                      const selectedModel = models[model];
                      if (selectedModel) {
                        const endpoint = selectedModel.endpoint;
                        const apiKeyField = selectedModel.apiKeyField;

                        // Retrieve the context limit based on the model
                        const contextLimit = selectedModel.contextLimits[selectedModel.requestBody.model];
                        // Trim the conversation history to fit within the context limit
                        const trimmedHistory = trimConversationHistory(conversationHistory, contextLimit);

                        const conversationHistoryFormatted = selectedModel.formatConversationHistory(trimmedHistory, character.name);

                        // Create a copy of the requestBody using transformRequestBody if available
                        let requestBody;
                        if (model === "gpt" && typeof selectedModel.transformRequestBody === "function") {
                          requestBody = selectedModel.transformRequestBody();
                        } else {
                          requestBody = JSON.parse(JSON.stringify(selectedModel.requestBody));
                        }

                        // Set the messageField in the requestBody based on the model
                        if (model === "claude") {
                          requestBody["prompt"] = conversationHistoryFormatted;
                        } else if (model === "gpt") {
                          requestBody["messages"] = conversationHistoryFormatted;
                        } else if (model === "cohere") {
                          requestBody["message"] = conversationHistoryFormatted.message;
                          requestBody["chat_history"] = conversationHistoryFormatted.chat_history;
                          requestBody["connectors"] = conversationHistoryFormatted.connectors;
                        }

                        console.log("Request Details for " + model.toUpperCase() + ":");
                        console.log("Endpoint:", endpoint);
                        console.log("API Key Field:", apiKeyField);
                        console.log("API Key:", selectedModel.apiKeyPrefix + apiKey);
                        console.log("Request Body:", requestBody);

                        const timeout = setTimeout(function () {
                          console.error("API request timed out after 60 seconds.");
                          showErrorModal("We had an error retrieving your message. Please check your API key and funding. If this issue persists, send this error report to Eli on Discord.");
                        }, 60000);

                        console.log("Complete Request Details for " + model.toUpperCase() + ":", {
                          endpoint: endpoint,
                          apiKey: selectedModel.apiKeyPrefix + apiKey,
                          requestBody: requestBody,
                        });

                        fetch(endpoint, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            [apiKeyField]: selectedModel.apiKeyPrefix + apiKey,
                          },
                          body: JSON.stringify(requestBody),
                        })
                          .then(function (response) {
                            clearTimeout(timeout);
                            if (!response.ok) {
                              throw new Error(response.statusText);
                            }
                            return response.json();
                          })
                          .then(function (data) {
                            console.log(model.toUpperCase() + " API response:", data);

                            if (data.type === "error") {
                              console.error("Error response from " + model.toUpperCase() + " API:", data);
                              showErrorModal("We had an error retrieving your message. Please check your API key and funding. If this issue persists, send this error report to Eli on Discord.");
                            } else {
                              const responseContent = model === "cohere" ? data.text : selectedModel.extractResponseContent(data);
                              if (responseContent) {
                                const timestamp = new Date().toISOString();
                                conversationHistory.push({
                                  role: "assistant",
                                  content: responseContent,
                                });
                                console.log("Updated conversation history:", conversationHistory);

                                db.threads
                                  .update(threadId, { conversationHistory: conversationHistory })
                                  .then(function () {
                                    db.messages
                                      .add({
                                        content: responseContent,
                                        timestamp: timestamp,
                                        model: model,
                                        threadId: threadId,
                                        type: "ai",
                                      })
                                      .then(function () {
                                        appendMessage(responseContent, "ai", characterName, characterAvatar);
                                      });
                                  });
                              }
                            }
                          })
                          .catch(function (error) {
                            console.error("Error sending message to " + model.toUpperCase() + " API:", error);
                            showErrorModal("We had an error retrieving your message. Please check your API key and funding. If this issue persists, send this error report to Eli on Discord.");
                          });
                      } else {
                        console.error("Unsupported model:", model);
                      }
                    })
                    .catch(function (error) {
                      console.error("Error replacing placeholders:", error);
                    });
                } else {
                  console.error("Character not found for the current thread ID:", threadId);
                }
              })
              .catch(function (error) {
                console.error("Failed to retrieve character:", error);
              });
          } else {
            console.error("Thread not found or character ID not set for thread ID:", threadId);
          }
        })
        .catch(function (error) {
          console.error("Failed to retrieve thread:", error);
        });
    })
    .catch(function (error) {
      console.error("Failed to retrieve API keys:", error);
      if (error.message.includes("Cannot read properties of undefined")) {
        showErrorModal("API key not found. Please make sure you have entered a valid API key for the selected model in the settings.");
      }
    });
  // Note: Removed any call to smoothScrollToBottom as per previous comments.
}




document.addEventListener('DOMContentLoaded', () => {
    // Close button functionality for error modal
    const errorModalCloseBtn = document.querySelector('#errorModal .close');
    if (errorModalCloseBtn) {
        errorModalCloseBtn.addEventListener('click', hideErrorModal);
    }
});

// Capture the latest console error
let latestConsoleError = '';

(function() {
  const originalError = console.error;
  console.error = function(...args) {
    latestConsoleError = args.map(arg => {
      if (arg instanceof Error) {
        return arg.message + "\n" + arg.stack;
      } else if (typeof arg === 'object') {
        // If it's an object (like the one returned from the GPT API), try to include its details.
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return arg.toString();
        }
      }
      return arg;
    }).join(' ');
    originalError.apply(console, args);
  };
})();


// Function to show the error modal with error message and latest console error
function showErrorModal(errorMessage) {
  const errorModal = document.getElementById("errorModal");
  const errorMessageElement = document.getElementById("errorMessage");
  const errorLogsElement = document.getElementById("errorLogs");

  // Display the error message
  errorMessageElement.textContent = errorMessage;

  // Display the latest console error
  errorLogsElement.textContent = latestConsoleError;

  errorModal.style.display = "block";
}

// Function to hide the error modal
function hideErrorModal() {
  const errorModal = document.getElementById("errorModal");
  errorModal.style.display = "none";
}

// Function to copy error logs to clipboard
function copyErrorLogs() {
  const errorMessageElement = document.getElementById("errorMessage").textContent;
  const errorLogsElement = document.getElementById("errorLogs").textContent;
  const combinedMessage = `${errorMessageElement}\n\nConsole Logs:\n${errorLogsElement}`;
  
  const tempTextArea = document.createElement("textarea");
  tempTextArea.value = combinedMessage;
  document.body.appendChild(tempTextArea);
  tempTextArea.select();
  document.execCommand("copy");
  document.body.removeChild(tempTextArea);

  alert("Error details copied to clipboard!");
}

// Attach the function to the window object to make it globally accessible
window.hideErrorModal = hideErrorModal;
window.copyErrorLogs = copyErrorLogs;




// Attach the function to the window object to make it globally accessible
window.hideErrorModal = hideErrorModal;

// Function to show the model settings modal
function showModelSettings() {
  const selectedModel = modelSelect.value;
  const settings = modelSettings[selectedModel];

  // Populate the preset dropdown
  const presetSelect = document.getElementById('presetSelect');
  presetSelect.innerHTML = '<option value="">Select a preset</option>';

  db.presets
    .where('modelName')
    .equals(selectedModel)
    .each((preset) => {
      const option = document.createElement('option');
      option.value = preset.id;
      option.textContent = preset.name;
      presetSelect.appendChild(option);
    })
    .catch((error) => {
      console.error('Error retrieving presets:', error);
    });

  // Clear the form
  modelSettingsForm.innerHTML = "";

  // Generate input fields based on the model settings
  settings.fields.forEach((field) => {
    const label = document.createElement('label');
    label.textContent = field.name;

    let input;
    if (field.type === 'select') {
      input = document.createElement('select');
      field.options.forEach((option) => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        input.appendChild(optionElement);
      });
    } else {
      input = document.createElement('input');
      input.type = field.type;
      input.step = field.step;
      input.min = field.min;
      input.max = field.max;
    }

    input.name = field.name;
    const value = models[selectedModel].requestBody[field.name];
    input.value = value !== null ? value : field.default; // Use default value if value is null
    input.readOnly = field.readonly;

    modelSettingsForm.appendChild(label);
    modelSettingsForm.appendChild(input);
  });

  // Add the save button
  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.className = "btn";
  saveButton.textContent = "Save";
  modelSettingsForm.appendChild(saveButton);

  // Add event listener to the close button
  const closeButton = modelSettingsModal.querySelector('.close');
  closeButton.addEventListener('click', hideModelSettings);

  // Show the modal
  modelSettingsModal.style.display = "block";
}





// Function to hide the model settings modal
function hideModelSettings() {
  modelSettingsModal.style.display = 'none';
}

const presetSelect = document.getElementById('presetSelect');
presetSelect.addEventListener('change', (event) => {
  const presetId = event.target.value;
  if (presetId) {
    db.presets
      .get(Number(presetId))
      .then((preset) => {
        if (preset) {
          // Load the preset settings into the form
          Object.entries(preset.settings).forEach(([key, value]) => {
            const input = modelSettingsForm.elements[key];
            if (input) {
              input.value = value;
            }
          });
        }
      })
      .catch((error) => {
        console.error('Error loading preset:', error);
      });
  }
});

const savePresetBtn = document.getElementById('savePresetBtn');
savePresetBtn.addEventListener('click', () => {
  const presetName = prompt('Enter a name for the preset:');
  if (presetName) {
    const selectedModel = modelSelect.value;
    const formData = new FormData(modelSettingsForm);
    const settings = Object.fromEntries(formData.entries());

    db.presets
      .add({
        name: presetName,
        modelName: selectedModel,
        settings: settings,
      })
      .then(() => {
        console.log('Preset saved successfully');
        showModelSettings(); // Refresh the preset dropdown
      })
      .catch((error) => {
        console.error('Error saving preset:', error);
      });
  }
});

// Event listener for the model settings form submission
modelSettingsForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(modelSettingsForm);
  const settings = Object.fromEntries(formData.entries());
  console.log('Model settings:', settings);

  // Update the models object with the new settings
  const selectedModel = modelSelect.value;
  updateModelSettings(selectedModel, settings);

  hideModelSettings();
});

// Event listener for the model settings button
modelSettingsBtn.addEventListener('click', showModelSettings);

async function loadModelSettings() {
  console.log("Starting to load model settings from the database...");
  for (const modelName of Object.keys(models)) {
    console.log(`Checking database for settings of ${modelName}`);
    try {
      const savedSettings = await db.modelSettings.get({ name: modelName });
      console.log(`Retrieved settings for ${modelName} from the database:`, savedSettings);

      if (savedSettings && savedSettings.settings) {
        console.log(`Applying saved settings for ${modelName}`);
        models[modelName].requestBody = { ...applyDefaultSettings(modelName), ...savedSettings.settings };
        console.log(`Settings for ${modelName} after merging:`, models[modelName].requestBody);
      } else {
        console.log(`No saved settings found for ${modelName}, applying default settings`);
        models[modelName].requestBody = applyDefaultSettings(modelName);
      }
    } catch (error) {
      console.error(`Error loading settings for ${modelName}:`, error);
    }
  }
}

function applyDefaultSettings(modelName) {
  const modelConfig = modelSettings[modelName];
  const defaults = modelConfig.fields.reduce((acc, field) => {
    acc[field.name] = field.default;
    return acc;
  }, {});
  console.log(`Default settings for ${modelName}:`, defaults);
  return defaults;
}


function updateModelSettings(modelName, settings) {
  const model = models[modelName];
  if (model) {
    const parsedSettings = {};
    const fieldSettings = modelSettings[modelName].fields;

    // Parse and update the settings based on their type defined in modelSettings
    for (const [key, value] of Object.entries(settings)) {
      const field = fieldSettings.find(field => field.name === key);
      if (field && value !== null && value !== 'NaN') {
        parsedSettings[key] = field.type === 'number' ? parseFloat(value) : value;
      }
    }

    // Update only the specific fields in the model's requestBody
    Object.assign(model.requestBody, parsedSettings);
    console.log(`Updated ${modelName} model settings in requestBody:`, model.requestBody);

    // Save the parsed settings to the database, excluding null and NaN values
    db.modelSettings
      .get({ name: modelName })
      .then(savedSettings => {
        if (savedSettings) {
          // Update the existing settings
          savedSettings.settings = parsedSettings;
          return db.modelSettings.put(savedSettings);
        } else {
          // Create a new entry in the database
          const newSettings = { name: modelName, settings: parsedSettings };
          return db.modelSettings.add(newSettings);
        }
      })
      .then(() => {
        console.log(`Saved ${modelName} model settings to the database, excluding null and NaN values.`);
      })
      .catch(error => {
        console.error(`Error saving ${modelName} model settings to the database:`, error);
      });
  } else {
    console.error(`Model not found: ${modelName}`);
  }
}

// Function to get the current thread ID
function getCurrentThreadId() {
  return currentThreadId || 0; // Return 0 as a default value if currentThreadId is null or undefined
}

// Function to display messages
function displayMessages(threadId) {
  if (!threadId) {
    console.log("No threadId provided. Retrieving the current thread ID.");
    threadId = getCurrentThreadId();
  }

  if (threadId) {
    console.log("Displaying messages for threadId:", threadId);
    displayMessagesForThread(threadId);
  } else {
    console.log("No valid threadId found.");
    chatMessages.innerHTML = "";
  }
}

function displayMessagesForThread(threadId) {
  db.settings
    .get(1)
    .then((settings) => {
      const userName = settings?.userName || "User";
      const userAvatar = settings?.avatar || "default-avatar.png";

      db.threads
        .get(threadId)
        .then((thread) => {
          if (thread && thread.characterId) {
            db.characters
              .get(thread.characterId)
              .then((character) => {
                if (character) {
                  const characterName = character.name;
                  const characterInitialMessage = character.initialMessage;
                  const characterAvatar = character.avatar || "default-character-avatar.png";

                  replacePlaceholders(characterInitialMessage, character.id)
                    .then((translatedInitialMessage) => {
                      // Store the current scroll position
                      const previousScrollTop = chatMessages.scrollTop;
                      const previousScrollHeight = chatMessages.scrollHeight;

                      // Clear the chat messages container
                      chatMessages.innerHTML = "";

                      const initialMessageElement = document.createElement("div");
                      initialMessageElement.classList.add("ai-message");
                      initialMessageElement.dataset.messageId = "initial";

                      const avatarElement = document.createElement("img");
                      avatarElement.classList.add("message-avatar");
                      avatarElement.src = characterAvatar;
                      avatarElement.alt = "character avatar";
                      initialMessageElement.appendChild(avatarElement);

                      const messageContentWrapper = document.createElement("div");
                      messageContentWrapper.classList.add("message-content-wrapper");

                      const messageHeader = document.createElement("div");
                      messageHeader.classList.add("message-header");

                      const senderName = document.createElement("strong");
                      senderName.textContent = characterName;
                      messageHeader.appendChild(senderName);

                      const actionButtons = document.createElement("div");
                      actionButtons.classList.add("message-action-buttons");

                      const editButton = document.createElement("button");
                      editButton.classList.add("edit-message-btn");
                      editButton.textContent = "Edit";
                      editButton.addEventListener("click", (event) => {
                        event.stopPropagation();
                        showEditMessageModal("initial");
                      });
                      actionButtons.appendChild(editButton);

                      messageHeader.appendChild(actionButtons);

                      const messageContent = document.createElement("div");
                      messageContent.classList.add("message-content");
                      messageContent.innerHTML = renderMarkdown(translatedInitialMessage);

                      messageContentWrapper.appendChild(messageHeader);
                      messageContentWrapper.appendChild(messageContent);

                      initialMessageElement.appendChild(messageContentWrapper);

                      chatMessages.appendChild(initialMessageElement);

                      db.messages
                        .where("threadId")
                        .equals(threadId)
                        .toArray()
                        .then((messages) => {
                          messages.forEach((message) => {
                            const messageElement = document.createElement("div");
                            messageElement.classList.add(message.type === "user" ? "user-message" : "ai-message");
                            messageElement.dataset.messageId = message.id;

                            const avatarElement = document.createElement("img");
                            avatarElement.classList.add("message-avatar");
                            avatarElement.src = message.type === "user" ? userAvatar : characterAvatar;
                            avatarElement.alt = message.type === "user" ? "user avatar" : "character avatar";
                            messageElement.appendChild(avatarElement);

                            const messageContentWrapper = document.createElement("div");
                            messageContentWrapper.classList.add("message-content-wrapper");

                            const messageHeader = document.createElement("div");
                            messageHeader.classList.add("message-header");

                            const senderName = document.createElement("strong");
                            senderName.textContent = message.type === "user" ? userName : characterName;
                            messageHeader.appendChild(senderName);

                            const actionButtons = document.createElement("div");
                            actionButtons.classList.add("message-action-buttons");

                            const editButton = document.createElement("button");
                            editButton.classList.add("edit-message-btn");
                            editButton.textContent = "Edit";
                            actionButtons.appendChild(editButton);

                            const deleteButton = document.createElement("button");
                            deleteButton.classList.add("delete-message-btn");
                            deleteButton.textContent = "Delete";
                            actionButtons.appendChild(deleteButton);

                            if (message.type === "ai") {
                              const rerollButton = document.createElement("button");
                              rerollButton.classList.add("reroll-message-btn");
                              rerollButton.textContent = "Reroll";
                              rerollButton.dataset.messageId = message.id;
                              actionButtons.appendChild(rerollButton);
                            }

                            messageHeader.appendChild(actionButtons);

                            const messageContent = document.createElement("div");
                            messageContent.classList.add("message-content");
                            messageContent.innerHTML = renderMarkdown(message.content);

                            messageContentWrapper.appendChild(messageHeader);
                            messageContentWrapper.appendChild(messageContent);

                            messageElement.appendChild(messageContentWrapper);

                            chatMessages.appendChild(messageElement);
                          });

                          // Restore the scroll position after updating the contents
                          if (previousScrollHeight > 0) {
                            const newScrollHeight = chatMessages.scrollHeight;
                            const newScrollTop = previousScrollTop + (newScrollHeight - previousScrollHeight);
                            chatMessages.scrollTop = newScrollTop;
                          } else {
                            chatMessages.scrollTop = chatMessages.scrollHeight;
                          }
                        })
                        .catch((error) => {
                          console.error("Error retrieving messages for threadId:", threadId, error);
                        });
                    })
                    .catch((error) => {
                      console.error("Error replacing placeholders in initial message:", error);
                    });
                } else {
                  console.error("Character not found for the current thread ID:", threadId);
                }
              })
              .catch((error) => {
                console.error("Failed to retrieve character:", error);
              });
          } else {
            console.error("Thread not found or character ID not set for the current thread ID:", threadId);
          }
        })
        .catch((error) => {
          console.error("Failed to retrieve thread:", error);
        });
    })
    .catch((error) => {
      console.error("Error retrieving user settings:", error);
    });
}


// In the chatMessages click event listener
chatMessages.addEventListener("click", (event) => {
  if (event.target.classList.contains("edit-message-btn")) {
    const messageId = event.target.closest(".user-message, .ai-message").dataset.messageId;
    showEditMessageModal(messageId);
  } else if (event.target.classList.contains("delete-message-btn")) {
    const messageId = event.target.closest(".user-message, .ai-message").dataset.messageId;
    deleteMessage(messageId);
  }
  // Remove the call to smoothScrollToBottom
 //  smoothScrollToBottom();
});


function showEditMessageModal(messageId) {
  const editMessageModal = document.getElementById('editMessageModal');
  const editMessageForm = document.getElementById('editMessageForm');
  const editMessageId = document.getElementById('editMessageId');
  const editMessageContent = document.getElementById('editMessageContent');

  // Check if messageId is "initial"
  if (messageId === "initial") {
    // Retrieve the initial message content from the character's initialMessage field
    db.threads
      .get(getCurrentThreadId())
      .then((thread) => {
        if (thread && thread.characterId) {
          db.characters
            .get(thread.characterId)
            .then((character) => {
              if (character) {
                editMessageId.value = "initial";
                editMessageContent.value = character.initialMessage;
                editMessageModal.style.display = 'block';
              }
            });
        }
      });
  } else {
    // Handle editing regular messages
    db.messages.get(Number(messageId))
      .then((message) => {
        if (message) {
          editMessageId.value = message.id;
          editMessageContent.value = message.content;
          editMessageModal.style.display = 'block';
        } else {
          console.warn('Message not found with ID:', messageId);
          // You can choose to display an error message to the user or handle it silently
        }
      })
      .catch((error) => {
        console.error('Error retrieving message:', error);
        // You can choose to display an error message to the user or handle it silently
      });
  }

  editMessageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const messageId = editMessageId.value;
    const messageContent = editMessageContent.value;
    updateMessage(messageId, messageContent);
  });

  // Add event listener to the close button
  const closeButton = editMessageModal.querySelector('.close');
  closeButton.addEventListener('click', hideEditMessageModal);
}

// Function to hide the edit message modal
function hideEditMessageModal() {
  const editMessageModal = document.getElementById('editMessageModal');
  editMessageModal.style.display = 'none';
}

function updateMessage(messageId, messageContent) {
  if (messageId === "initial") {
    // Update the character's initialMessage field in the database
    db.threads
      .get(getCurrentThreadId())
      .then((thread) => {
        if (thread && thread.characterId) {
          db.characters
            .get(thread.characterId)
            .then((character) => {
              if (character) {
                character.initialMessage = messageContent;
                return db.characters.put(character);
              }
            })
            .then(() => {
              document.getElementById('editMessageModal').style.display = 'none';
              displayMessagesForThread(getCurrentThreadId());
            });
        }
      });
  } else {
    // Handle updating regular messages
    db.messages.get(Number(messageId))
      .then((message) => {
        message.content = messageContent;
        return db.messages.put(message);
      })
      .then(() => {
        document.getElementById('editMessageModal').style.display = 'none';
        displayMessages(getCurrentThreadId());
      })
      .catch((error) => {
        console.error('Error updating message:', error);
      });
  }
}

function editMessage(messageId) {
  const messageContent = document.querySelector(`[data-message-id="${messageId}"] .message-content`);
  const originalContent = messageContent.textContent;

  messageContent.contentEditable = true;
  messageContent.focus();

  messageContent.addEventListener('blur', () => {
    const newContent = messageContent.textContent;
    if (newContent !== originalContent) {
      db.messages.get(Number(messageId))
        .then((message) => {
          message.content = newContent;
          return db.messages.put(message);
        })
        .then(() => {
          displayMessages(getCurrentThreadId());
        })
        .catch((error) => {
          console.error("Error updating message:", error);
        });
    }
    messageContent.contentEditable = false;
  });
}

function deleteMessage(messageId) {
  if (confirm("Are you sure you want to delete this message?")) {
    db.messages.delete(Number(messageId))
      .then(() => {
        displayMessages(getCurrentThreadId());
      })
      .catch((error) => {
        console.error("Error deleting message:", error);
      });
  }
}

function displayCharacters() {
  const characterCardsContainer = document.getElementById("characterCardsContainer");

  // Clear the existing character cards
  characterCardsContainer.innerHTML = "";

  // Append the "Create Character" button
  appendCreateCharacterButton(characterCardsContainer);

  // Create a new container for the character cards
  const characterCardsWrapper = document.createElement("div");
  characterCardsWrapper.classList.add("character-cards-wrapper");
  characterCardsContainer.appendChild(characterCardsWrapper);

  db.characters.toArray().then(characters => {
    characters.forEach(character => {
      const characterCard = document.createElement("div");
      characterCard.classList.add("character-card");

      const characterAvatar = document.createElement("img");
      characterAvatar.src = character.avatar;
      characterAvatar.alt = `${character.name} avatar`;
      characterAvatar.classList.add("character-avatar");
      characterCard.appendChild(characterAvatar);

      // Add click event listener to the avatar image only within the character card
      characterAvatar.addEventListener("click", (event) => {
        event.stopPropagation();
        initiateNewChatThread(character.id);
      });

      const characterInfo = document.createElement("div");
      characterInfo.classList.add("character-info");
      characterCard.appendChild(characterInfo);

      const characterName = document.createElement("h3");
      characterName.textContent = character.name;
      characterName.classList.add("character-name");
      characterInfo.appendChild(characterName);

      // Add click event listener to the character name (if desired)
      characterName.addEventListener("click", () => {
        initiateNewChatThread(character.id);
      });

      const actionButtons = document.createElement("div");
      actionButtons.classList.add("action-buttons");
      characterInfo.appendChild(actionButtons);

      const editButton = document.createElement("button");
      editButton.classList.add("edit-character-btn");
      editButton.textContent = "Edit";
      editButton.addEventListener("click", (event) => {
        event.stopPropagation();
        showEditCharacterModal(character.id);
      });
      actionButtons.appendChild(editButton);

      const shareButton = document.createElement("button");
      shareButton.classList.add("share-character-btn");
      shareButton.textContent = "Share";
      shareButton.addEventListener("click", (event) => {
        event.stopPropagation();
        shareCharacter(character.id);
      });
      actionButtons.appendChild(shareButton);

      const deleteButton = document.createElement("button");
      deleteButton.classList.add("delete-character-btn");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", (event) => {
        event.stopPropagation();
        deleteCharacter(character.id);
      });
      actionButtons.appendChild(deleteButton);

      characterCardsWrapper.appendChild(characterCard);
    });
  }).catch(error => {
    console.error("Error retrieving characters:", error);
  });
}




// Function to append a "Create Character" button to the landing page
function appendCreateCharacterButton(landingPage) {
  const createCharacterBtn = document.createElement("button");
  createCharacterBtn.id = "createCharacterBtn";
  createCharacterBtn.classList.add("btn");
  createCharacterBtn.textContent = "Create Character";
  createCharacterBtn.addEventListener("click", showCharacterModal);
  landingPage.appendChild(createCharacterBtn);
}

// Function to show the character modal
function showCharacterModal() {
  characterModal.style.display = "block";

  // Add event listener to the close button
  const closeButton = characterModal.querySelector('.close');
  closeButton.addEventListener('click', hideCharacterModal);
}

function closeCharacterModal() {
  document.getElementById('characterModal').style.display = 'none';
}

// Function to hide the character modal
function hideCharacterModal() {
  characterModal.style.display = "none";
}

// Event listener for the character form submission
characterForm.addEventListener("submit", createCharacter);


document.addEventListener('DOMContentLoaded', function() {
  const closeButton = document.querySelector('#editCharacterModal .close');
  closeButton.addEventListener('click', closeEditCharacterModal);
});

document.addEventListener('DOMContentLoaded', function() {
  const closeButton = document.querySelector('#characterModal .close');
  closeButton.addEventListener('click', closeCharacterModal);
});

function shareCharacter(characterId) {
  db.characters.get(Number(characterId))
    .then((character) => {
      const characterData = {
        name: character.name,
        instruction: character.instruction,
        reminder: character.reminder,
        initialMessage: character.initialMessage,
      };

      const encodedData = encodeURIComponent(JSON.stringify(characterData));
      const shareableLink = `${window.location.origin}/grimoire/alpha.html?character=${encodedData}`;

      copyToClipboard(shareableLink);
      alert("Character link copied to clipboard!");
    })
    .catch((error) => {
      console.error('Error retrieving character:', error);
    });
}

function shareStarterCharacter(character) {
  const characterData = {
    name: character.name,
    instruction: character.instruction,
    reminder: character.reminder,
    initialMessage: character.initialMessage,
    avatar: character.avatar
  };

  const encodedData = encodeURIComponent(JSON.stringify(characterData));
  const shareableLink = `${window.location.origin}/beta/claude/index.html?character=${encodedData}`;
  copyToClipboard(shareableLink);
  alert("Starter character link copied to clipboard!");
}

function copyToClipboard(text) {
  const tempInput = document.createElement('input');
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);
}

function showEditCharacterModal(characterId) {
  db.characters.get(Number(characterId))
    .then((character) => {
      document.getElementById('editCharacterId').value = character.id;
      document.getElementById('editCharacterName').value = character.name;
      document.getElementById('editCharacterAvatarPreview').src = character.avatar;
      document.getElementById('editCharacterInstruction').value = character.instruction;
      document.getElementById('editCharacterReminder').value = character.reminder;
      document.getElementById('editCharacterInitialMessage').value = character.initialMessage;
      document.getElementById('editCharacterModal').style.display = 'block';
    })
    .catch((error) => {
      console.error('Error retrieving character:', error);
    });
}


function deleteCharacter(characterId) {
  if (confirm('Are you sure you want to delete this character?')) {
    db.characters.delete(Number(characterId))
      .then(() => {
        displayCharacters();
      })
      .catch((error) => {
        console.error('Error deleting character:', error);
      });
  }
}


document.getElementById('editCharacterForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const characterId = document.getElementById('editCharacterId').value;
  const characterName = document.getElementById('editCharacterName').value;
  const characterInstruction = document.getElementById('editCharacterInstruction').value;
  const characterReminder = document.getElementById('editCharacterReminder').value;
  const characterInitialMessage = document.getElementById('editCharacterInitialMessage').value;
  
  // Handle character avatar update
  const avatarInput = document.getElementById('editCharacterAvatar');
  const file = avatarInput.files[0];
  let avatarData = null;

  if (file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function() {
      avatarData = reader.result;
      updateCharacter(characterId, characterName, characterInstruction, characterReminder, characterInitialMessage, avatarData);
    };
  } else {
    updateCharacter(characterId, characterName, characterInstruction, characterReminder, characterInitialMessage);
  }
});

function updateCharacter(characterId, characterName, characterInstruction, characterReminder, characterInitialMessage, avatarData) {
  db.characters.get(Number(characterId))
    .then((character) => {
      character.name = characterName;
      character.instruction = characterInstruction;
      character.reminder = characterReminder;
      character.initialMessage = characterInitialMessage;
      if (avatarData) {
        character.avatar = avatarData;
      }
      return db.characters.put(character);
    })
    .then(() => {
      document.getElementById('editCharacterModal').style.display = 'none';
      displayCharacters();
    })
    .catch((error) => {
      console.error('Error updating character:', error);
    });
}

async function addThread(name, characterId) {
  const threadObj = {
    name,
    characterId,
    creationTime: Date.now(),
    lastMessageTime: Date.now(),
    conversationHistory: [], // Initialize an empty conversation history array
  };
  const id = await db.threads.add(threadObj);
  return { ...threadObj, id };
}

// Event listener for the character form submission
characterForm.addEventListener("submit", createCharacter);

// Function to preview the selected character avatar
function previewCharacterAvatar(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function () {
    const avatarPreview = document.getElementById("characterAvatarPreview");
    avatarPreview.src = reader.result;
  };
  if (file) {
    reader.readAsDataURL(file);
  }
}

// Event listener for the character avatar input change
document
  .getElementById("characterAvatar")
  .addEventListener("change", previewCharacterAvatar);

// Function to create a character
async function createCharacter(event) {
  event.preventDefault();
  const characterName = document.getElementById("characterName").value;
  const characterInstruction = document.getElementById(
    "characterInstruction"
  ).value;
  const characterReminder = document.getElementById("characterReminder").value;
  const characterInitialMessage = document.getElementById(
    "characterInitialMessage"
  ).value;

  // Handle character avatar upload
  const avatarInput = document.getElementById("characterAvatar");
  const file = avatarInput.files[0];
  let avatarData = null;

  if (file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      avatarData = reader.result;
      saveCharacter(
        characterName,
        characterInstruction,
        characterReminder,
        characterInitialMessage,
        avatarData
      );
    };
    reader.onerror = function (error) {
      console.error("Error reading file:", error);
      saveCharacter(
        characterName,
        characterInstruction,
        characterReminder,
        characterInitialMessage,
        null
      );
    };
  } else {
    saveCharacter(
      characterName,
      characterInstruction,
      characterReminder,
      characterInitialMessage,
      null
    );
  }
}

async function saveCharacter(
  characterName,
  characterInstruction,
  characterReminder,
  characterInitialMessage,
  avatarData
) {
  try {
    const characterId = await generateUniqueId("characters");
    const threadObj = await addThread(
      "Default Thread for " + characterName,
      characterId
    );

    const newCharacter = {
      id: characterId,
      name: characterName,
      instruction: characterInstruction,
      reminder: characterReminder,
      initialMessage: characterInitialMessage,
      threadId: threadObj.id,
      avatar: avatarData || "default-character-avatar.png",
    };

    await db.characters.add(newCharacter);
    await db.threads.update(threadObj.id, { characterId: characterId });
    console.log("Character and thread created successfully:", newCharacter);
    hideCharacterModal();
    displayCharacters();
  } catch (error) {
    console.error("Error creating character and thread:", error);
  }
}

async function initiateNewChatThread(characterId) {
  try {
    const threadObj = await addThread(
      "Default Thread for Character " + characterId,
      characterId
    );
    currentThreadId = threadObj.id;
    console.log("Initiating new chat thread with ID:", currentThreadId);
    showCurrentChat(); // Remove the argument
    displayThreads();
  } catch (error) {
    console.error("Error creating new thread:", error);
  }
}

// Function to generate a unique ID
async function generateUniqueId(storeName) {
  let isUnique = false;
  let randomId;

  while (!isUnique) {
    randomId = Math.floor(Math.random() * 1000000); // Generates a random number between 0 and 999999
    const idExists = await db[storeName].get(randomId);
    if (!idExists) {
      isUnique = true;
    }
  }

  return randomId;
}

let currentThreadId = null;

db.settings
  .get(1)
  .then((settings) => {
    if (settings && settings.claudeKey) {
      console.log("Using Claude API Key:", settings.claudeKey);
    } else {
      console.log("No Claude API Key provided.");
    }

    if (settings && settings.gptKey) {
      console.log("Using GPT API Key:", settings.gptKey);
    } else {
      console.log("No GPT API Key provided.");
    }
  })
  .catch((error) => {
    console.error("Failed to retrieve API keys:", error);
  });

document.addEventListener("DOMContentLoaded", () => {
  const uploadBtn = document.getElementById("uploadBtn");
  if (uploadBtn) {
    uploadBtn.addEventListener("click", uploadAvatar);
    console.log("Upload button event listener attached."); // Ensure this logs in the console
  } else {
    console.log("Upload button not found."); // Check if there's an issue with button selection
  }
});

// Function to upload avatar
function uploadAvatar() {
  const fileInput = document.getElementById("avatarInput");
  const file = fileInput.files[0];
  if (file) {
    // Read the file as a Blob
    const reader = new FileReader();
    reader.readAsDataURL(file); // Alternatively, use readAsArrayBuffer for more direct Blob handling
    reader.onload = function () {
      const imgData = reader.result;
      // Use 'put' instead of 'update' to ensure the record is created if it doesn't exist
      db.settings
        .put({ id: 1, avatar: imgData })
        .then(() => {
          console.log(
            "Avatar updated or created successfully in the database."
          );
          updateAvatarDisplay(imgData); // Update the avatar display after uploading
        })
        .catch((error) => {
          console.error("Error updating or creating avatar in Dexie:", error);
        });
    };
    reader.onerror = function (error) {
      console.error("Error reading file:", error);
    };
  } else {
    console.log("No file selected.");
  }
}

// Function to update avatar display
function updateAvatarDisplay(imgData) {
  const userAvatar = document.getElementById("userAvatar");
  if (userAvatar) {
    userAvatar.src = imgData;
    console.log("Avatar display updated.");
  } else {
    console.log("Avatar element not found.");
  }
} 

chatMessages.addEventListener("click", (event) => {

  if (event.target.classList.contains("reroll-message-btn")) {
    const messageId = event.target.dataset.messageId;
    rerollMessage(messageId);
  }
});

function rerollMessage(messageId) {
  const validMessageId = Number(messageId);
  if (isNaN(validMessageId)) {
    console.error("Invalid message ID provided:", messageId);
    return;
  }
  
  db.messages.get(validMessageId)
    .then((message) => {
      if (message && message.type === "ai") {
        const threadId = message.threadId;
        const model = message.model;
        db.threads.get(threadId)
          .then((thread) => {
            if (thread && thread.conversationHistory) {
              const history = thread.conversationHistory;
              // Always assume a hidden message exists at index 0.
              // Then the user message for the assistant response is at history.length - 3.
              if (history.length >= 3) {
                const originalUserMessage = history[history.length - 3].content;
                sendMessageToAPI(model, originalUserMessage, threadId, true);
              } else {
                console.error("Conversation history too short for reroll.");
              }
            }
          })
          .catch((error) => console.error("Error retrieving thread:", error));
      }
    })
    .catch((error) => {
      console.error("Error retrieving message:", error);
    });
}




toggleSidebar.addEventListener('click', () => {
  leftColumn.classList.add('collapsed');
});

expandSidebar.addEventListener('click', () => {
  leftColumn.classList.remove('collapsed');
});


// Function to purge all data from the database
function purgeAllData() {
  if (confirm('Are you sure you want to purge all data? This action cannot be undone.')) {
    db.delete()
      .then(() => {
        console.log('All data purged from the database.');
        // Recreate the database tables
        db.version(1).stores({
          characters: "++id,name,systemMessage,modelVersion,preset,temp,preamble,initialMessages,avatarUrl,creationTime,additionalParameters,cfg_uc,max_length,lastMessageTime,sceneBackground",
          threads: "++id,name,characterId,creationTime,lastMessageTime,conversationHistory",
          messages: "++id,threadId,message,characterId,creationTime",
          misc: "key,value",
          settings: "++id,claudeKey,gptKey",
          modelSettings: "++id,name,settings",
          presets: '++id, name, modelName, settings',
        });
        // Refresh the page
        window.location.reload();
      })
      .catch((error) => {
        console.error('Error purging data from the database:', error);
      });
  }
}

// Event listener for the purge data button
purgeDataBtn.addEventListener('click', purgeAllData);

// Event listener for the purge data button
purgeDataBtn.addEventListener('click', purgeAllData);

function deleteThread(threadId) {
  if (confirm("Are you sure you want to delete this thread?")) {
    db.threads
      .delete(threadId)
      .then(() => {
        console.log("Thread deleted successfully:", threadId);
        displayThreads();
        if (threadId === currentThreadId) {
          currentThreadId = null;
          showLandingPage();
        }
      })
      .catch((error) => {
        console.error("Error deleting thread:", error);
      });
  }
}

function importCharacter(characterData) {
  const { name, instruction, reminder, initialMessage, avatar } = characterData;

  // Check if a character with the same name, instruction, reminder, and initial message already exists
  db.characters
    .where("name")
    .equals(name)
    .and((character) => {
      return (
        character.instruction === instruction &&
        character.reminder === reminder &&
        character.initialMessage === initialMessage
      );
    })
    .first()
    .then((existingCharacter) => {
      if (existingCharacter) {
        alert("This character already exists. Redirecting to the main page...");
        // Redirect to the main page
        window.location.href = "https://ttalesinteractive.com/grimoire/alpha.html";
      } else {
        // If the character doesn't exist, import it as usual
        saveCharacter(name, instruction, reminder, initialMessage, avatar)
          .then(() => {
            displayCharacters();
            alert("Character imported successfully!");
            // Redirect to the main page after successful import
            window.location.href = "https://ttalesinteractive.com/grimoire/alpha.html";
          })
          .catch((error) => {
            console.error('Error importing character:', error);
          });
      }
    })
    .catch((error) => {
      console.error('Error checking existing character:', error);
    });
}

function displayStarterCharacters() {
  const exampleCharactersContainer = document.getElementById("exampleCharactersContainer");

  // Clear the existing starter characters
  exampleCharactersContainer.innerHTML = "";

  starterCharacters.forEach(character => {
    const characterCard = document.createElement("div");
    characterCard.classList.add("character-card");

    const characterAvatar = document.createElement("img");
    characterAvatar.src = character.avatar;
    characterAvatar.alt = `${character.name} avatar`;
    characterAvatar.classList.add("character-avatar");
    characterCard.appendChild(characterAvatar);

    const characterInfo = document.createElement("div");
    characterInfo.classList.add("character-info");
    characterCard.appendChild(characterInfo);

    const characterName = document.createElement("h3");
    characterName.textContent = character.name;
    characterName.classList.add("character-name");
    characterInfo.appendChild(characterName);

    // Add click event listener to the character card
    characterCard.addEventListener("click", () => {
      // Redirect to the shared link when the character card is clicked
      window.location.href = character.link;
    });

    exampleCharactersContainer.appendChild(characterCard);
  });
}

function replacePlaceholders(text, characterId) {
  return new Promise((resolve, reject) => {
    db.settings
      .get(1)
      .then((settings) => {
        const userName = settings?.userName || "Anon";
        text = text.replace(/\{\{user\}\}/g, userName);

        if (characterId) {
          db.characters
            .get(characterId)
            .then((character) => {
              if (character) {
                const characterName = character.name;
                text = text.replace(/\{\{char\}\}/g, characterName);
              }
              resolve(text);
            })
            .catch((error) => {
              console.error("Error retrieving character:", error);
              reject(error);
            });
        } else {
          resolve(text);
        }
      })
      .catch((error) => {
        console.error("Error retrieving user settings:", error);
        reject(error);
      });
  });
}
