import './style.css';
import { setupChat } from './chatSetup.js';

// Create the chat UI dynamically
document.querySelector('#chat').innerHTML = `
  <div class="container mx-auto px-4 py-6 max-w-lg">
    <!-- Chat Box -->
    <div class="chat-wrapper bg-white/20 backdrop-blur-lg rounded-lg shadow-lg p-6 border border-white/30">
      <!-- Header -->
      <header class="text-center mb-4">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-500 to-medical-blue text-transparent bg-clip-text">Healthcare Assistant</h1>
        <p class="text-gray-300">How can I assist you today?</p>
      </header>

      <!-- Chat Messages -->
      <div class="chat-container rounded-lg p-4 mb-3 overflow-y-auto" id="chatContainer">
        <div class="bot-message message">
          👋 Hello! I'm your healthcare assistant. How can I help you today?
        </div>
      </div>

      <!-- Input Field & Button (Now inside the chat container) -->
      <div class="flex items-center gap-3 p-3 bg-white/30 rounded-lg backdrop-blur-md">
        <input 
          type="text" 
          id="userInput"
          class="flex-1 border border-gray-300 rounded-lg px-4 py-2 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type your message here..."
        >
        <button 
          id="sendButton"
          class="bg-gradient-to-r from-blue-500 to-medical-blue text-white px-5 py-2 rounded-lg hover:scale-105 transition-all"
        >
          ➤
        </button>
      </div>
    </div>
  </div>
`;

// Initialize the chat system
setupChat(
  document.querySelector('#chatContainer'),
  document.querySelector('#userInput'),
  document.querySelector('#sendButton')
);
