# 📚 Literary Conversations

Chat with famous characters from classic literature, powered by Claude AI!

## Features

- 🎭 **8 Literary Characters** including Sherlock Holmes, Elizabeth Bennet, Hermione Granger, and more
- 💬 **Real-time Conversations** powered by Claude's API
- 🎨 **Beautiful UI** with Tailwind CSS
- 📱 **Responsive Design** works on all devices
- 🔄 **Conversation History** maintained throughout each chat

## Characters Available

1. 🔍 **Sherlock Holmes** - The brilliant detective
2. 👗 **Elizabeth Bennet** - Witty heroine from Pride and Prejudice
3. 🎩 **Holden Caulfield** - Cynical teen from The Catcher in the Rye
4. 📚 **Hermione Granger** - Brilliant witch from Harry Potter
5. ⚖️ **Atticus Finch** - Moral lawyer from To Kill a Mockingbird
6. 🥂 **Jay Gatsby** - Mysterious millionaire from The Great Gatsby
7. 🕯️ **Jane Eyre** - Independent governess from Jane Eyre
8. 🧛 **Count Dracula** - Aristocratic vampire from Dracula

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Claude API** - AI conversations

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

## Project Structure

```
book-character-chat/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── CharacterCard.jsx
│   │   ├── CharacterSelection.jsx
│   │   ├── ChatInterface.jsx
│   │   └── Message.jsx
│   ├── data/           # Data files
│   │   └── characters.js
│   ├── utils/          # Utility functions
│   │   └── api.js
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## How It Works

1. **Character Selection**: Choose from 8 literary characters
2. **AI-Powered Chat**: Each character has a unique personality prompt
3. **Conversation**: Claude API maintains the conversation history and stays in character
4. **Immersive Experience**: Characters reference their books, stories, and speak authentically

## Customization

### Adding New Characters

Edit `src/data/characters.js` and add a new character object:

```javascript
{
  id: 9,
  name: "Character Name",
  book: "Book Title",
  author: "Author Name",
  personality: "Character description and speaking style...",
  avatar: "🎭",
  greeting: "Character's greeting message"
}
```

## API Information

This app uses the Anthropic Claude API. The API calls are made directly from the browser without requiring an API key (handled on the backend in the Claude.ai environment).

## License

MIT

## Acknowledgments

- Character personalities inspired by the original literary works
- Powered by Anthropic's Claude AI
- Icons by Lucide React
