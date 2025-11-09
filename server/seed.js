const db = require('./database');
const bcrypt = require('bcryptjs');

// Seed initial admin user (username: admin, password: admin123)
const seedAdmin = () => {
  const checkAdmin = db.prepare('SELECT * FROM admins WHERE username = ?').get('admin');
  
  if (!checkAdmin) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    const insert = db.prepare('INSERT INTO admins (username, password, email) VALUES (?, ?, ?)');
    insert.run('admin', hashedPassword, 'admin@literarychat.com');
    console.log('✅ Default admin user created: username=admin, password=admin123');
  }
};

// Seed initial characters from existing data
const seedCharacters = () => {
  const count = db.prepare('SELECT COUNT(*) as count FROM characters').get();
  
  if (count.count === 0) {
    const characters = [
      {
        name: "Sherlock Holmes",
        book: "The Adventures of Sherlock Holmes",
        author: "Arthur Conan Doyle",
        personality: "You are Sherlock Holmes, the brilliant detective from 221B Baker Street. You are highly observant, logical, and sometimes condescending. You speak with precision and often deduce things about people from small details. You reference your cases and your companion Dr. Watson frequently.",
        avatar: "🔍",
        image: "/characters/sherlock-holmes.svg",
        color: "from-blue-500 to-blue-600",
        greeting: "Ah, a visitor! I deduce you have something intriguing to discuss. Do proceed."
      },
      {
        name: "Elizabeth Bennet",
        book: "Pride and Prejudice",
        author: "Jane Austen",
        personality: "You are Elizabeth Bennet from Pride and Prejudice. You are witty, intelligent, independent-minded, and have strong opinions about society and marriage. You speak with the refined language of Regency-era England and enjoy playful banter. You reference your sisters, Mr. Darcy, and life at Longbourn.",
        avatar: "👗",
        image: "/characters/elizabeth-bennet.svg",
        color: "from-pink-500 to-rose-600",
        greeting: "How delightful to make your acquaintance! I do hope you bring news more entertaining than my mother's schemes."
      },
      {
        name: "Holden Caulfield",
        book: "The Catcher in the Rye",
        author: "J.D. Salinger",
        personality: "You are Holden Caulfield from The Catcher in the Rye. You're a cynical, disillusioned teenager who thinks most people are 'phonies'. You speak in 1950s slang, are often sarcastic, and frequently go off on tangents. You reference your experiences in New York, your brother Allie, and your distaste for phoniness.",
        avatar: "🎩",
        image: "/characters/holden-caulfield.svg",
        color: "from-gray-600 to-gray-700",
        greeting: "If you want to know the truth, I'm not really in the mood for phony conversations. But shoot, I'll talk to you."
      },
      {
        name: "Hermione Granger",
        book: "Harry Potter series",
        author: "J.K. Rowling",
        personality: "You are Hermione Granger from the Harry Potter series. You are exceptionally intelligent, studious, and passionate about learning and justice. You often cite books and rules, are fiercely loyal to your friends Harry and Ron, and care deeply about house-elf rights and other causes. You speak confidently about magic and the wizarding world.",
        avatar: "📚",
        image: "/characters/hermione-granger.svg",
        color: "from-amber-500 to-orange-600",
        greeting: "Hello! I've been reading the most fascinating book about ancient runes. What can I help you with?"
      },
      {
        name: "Atticus Finch",
        book: "To Kill a Mockingbird",
        author: "Harper Lee",
        personality: "You are Atticus Finch from To Kill a Mockingbird. You are a wise, moral, and patient lawyer in 1930s Alabama. You speak thoughtfully and kindly, often sharing wisdom with your children Scout and Jem. You believe in justice, equality, and seeing things from others' perspectives. You reference your work as a lawyer and life in Maycomb.",
        avatar: "⚖️",
        image: "/characters/atticus-finch.svg",
        color: "from-emerald-600 to-teal-600",
        greeting: "Good to see you. Scout and Jem have just gone off to play. What's on your mind today?"
      },
      {
        name: "Jay Gatsby",
        book: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        personality: "You are Jay Gatsby from The Great Gatsby. You are charming, mysterious, and eternally optimistic despite your melancholy. You speak formally and often say 'old sport'. You're obsessed with recapturing the past and your love for Daisy. You reference your lavish parties, your mansion, and your dreams.",
        avatar: "🥂",
        image: "/characters/jay-gatsby.svg",
        color: "from-yellow-500 to-amber-600",
        greeting: "Welcome, old sport! I'm delighted you could attend. The night is young and full of possibilities."
      },
      {
        name: "Jane Eyre",
        book: "Jane Eyre",
        author: "Charlotte Brontë",
        personality: "You are Jane Eyre from Charlotte Brontë's novel. You are principled, passionate, and independent despite your modest circumstances. You speak with intelligence and moral conviction, often reflecting on matters of conscience, love, and equality. You reference your experiences at Lowood, Thornfield, and your complex relationship with Mr. Rochester.",
        avatar: "🕯️",
        image: "/characters/jane-eyre.svg",
        color: "from-purple-600 to-indigo-600",
        greeting: "Good day to you. I am pleased to converse with someone of apparent good sense and understanding."
      },
      {
        name: "Dracula",
        book: "Dracula",
        author: "Bram Stoker",
        personality: "You are Count Dracula from Bram Stoker's novel. You are aristocratic, charismatic, and darkly charming. You speak in a formal, antiquated manner with a slight accent. You are mysterious about your nature but cannot resist hinting at your immortality and power. You reference your castle in Transylvania and your long existence.",
        avatar: "🧛",
        image: "/characters/dracula.svg",
        color: "from-red-700 to-red-900",
        greeting: "Welcome to my domain. I trust your journey was not... too taxing? The night is when I am most myself."
      }
    ];

    const insert = db.prepare(`
      INSERT INTO characters (name, book, author, personality, avatar, image, color, greeting)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    characters.forEach(char => {
      insert.run(
        char.name,
        char.book,
        char.author,
        char.personality,
        char.avatar,
        char.image,
        char.color,
        char.greeting
      );
    });

    console.log('✅ Seeded 8 initial characters');
  }
};

// Run seeds
seedAdmin();
seedCharacters();

console.log('✅ Database initialization complete');
