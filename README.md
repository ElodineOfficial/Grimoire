# Grimoire: Alpha 1.3

Grimoire is a privacy-focused, free, and open-source front end designed specifically for roleplayers. No downloads required! No data collection ever! Grimoire provides a sleek and intuitive interface for engaging in conversations with AI-powered characters using Claude, GPT, and Cohere / Command R Plus.


![banner](https://ttalesinteractive.com/grimoire/grimoireBan3.png)


<p align="center">Local and private front end. Scaling AI chatbot tool Similar to OpenC and ST.</p>

<p align="center"><b>⟶ <a href="https://ttalesinteractive.com/grimoire/alpha.html">Try the Alpha here!</a> ⟵</b></p>

<p align="center"><a href="https://discord.gg/Tr8vvRUuCv">Join us on Discord</a></p>

## Current Features

### User Interface
- Intuitive navigation between landing page, current chat, and settings
- Collapsible left sidebar for optimal screen space utilization
- Responsive design for seamless experience on mobile and desktop devices
- Entirely customizable through an appearance tab

### Character Management
- Create new characters with detailed information (name, instructions, reminders, initial messages, avatar)
- Pre-made starter characters for quick setup
- Edit, share, and delete characters from the character cards

### Chat Functionality
- Initiate chat threads with selected characters
- Dynamic responses generated using Claude, GPT, and Cohere models
- Secure storage of chat history in the database
- Edit, delete, and reroll messages within the chat

### Thread Management
- Dedicated thread for each character
- Effortless switching between threads
- Delete threads with a single click

### Settings and Customization
- Enter API keys for Claude, GPT, and Cohere models
- Modify username and upload custom avatar
- Fine-tune model settings for personalized conversations

### Data Management
- Secure storage using Dexie database
- Purge feature for easy data reset

### Sharing and Importing
- Generate shareable links for characters
- Import characters from shared links

## Upcoming Features

### Memory Management
- Implement a memory management system to handle short-term and long-term context
- Utilize summarization techniques to condense conversation history
- Provide user control and customization over memory management process

### Image Generation
- Integrate image generation capabilities to enhance visual communication

### Expanded Model Support
- Incorporate additional models such as NAI, Scale, Gemini, Grok, and more

### Text-to-Speech (TTS)
- Enable immersive audio experience with TTS integration

### Prompt-based Features
- Introduce prompt-based features for roleplaying and gamification scenarios

### Cost Tracking
- Implement cost tracking functionality to monitor API usage

### Thread Labels
- Introduce thread labels for enhanced organization and categorization

### Extended Memory System
- Develop an extended/infinite memory system for seamless conversation continuity

### Visual Enhancements
- Continuously improve the user interface with visual overhauls and refinements

### Import/Export Functionality
- Enable import and export of character cards and chat logs for easy sharing and backup

## Changelog

### [1.3] - 2024-05-21
#### Added
- Added appearance tab
- Supports editing of all visual fields of the site
- Added import function for site appearance
- Added export function for site appearance
- Added ability to reset the site appearance

### [1.2] - 2024-05-20
#### Added
- News panel
- Prior patch notes added to news panel
- Upcoming patch notes added to news panel
- Cohere connection bug fixed
- Autoscroll function fixed

### [1.1] - 2024-05-20
#### Added
- Support for Cohere
- Context limits for each model
- Fixed a bug where the error popup wouldn't close
- Added better error handling so users can see exactly why their request might be rejected
- Fixed a bug where users couldn't edit their initial message

#### Fixed
- Minor bug fixes and performance improvements

#### Changed
- Updated README with Changelog section

## Installation and Setup
1. Clone the repository
2. Install the required dependencies (which in this case just means you've routed the file URL's in the index and app.js)
3. Configure the necessary API keys and settings
4. Run the application

## Contributing
We welcome contributions from the community! If you'd like to contribute to Grimoire, please follow these steps:
Optional: Poke us on discord!
1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Make your changes and commit them: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

## License
Grimoire is released under this [License](https://github.com/ElodineOfficial/Grimoire/blob/main/LICENSE). Please note that while Grimoire is free and open-source for the community to enjoy and contribute to, it is not available for commercial use.

## Contact
If you have any questions, suggestions, or feedback, please feel free to reach out to Elodine on [Grimoire/TTI Discord Server](https://discord.gg/Tr8vvRUuCv).

Happy chatting!
