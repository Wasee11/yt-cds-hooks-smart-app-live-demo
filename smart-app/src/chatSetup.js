import axios from 'axios';

export function setupChat(chatContainer, inputElement, sendButton) {
  const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/retrieve-chat'; // Replace with your actual webhook URL

  // Create the input box and send button inside the chat container
  const inputContainer = document.createElement('div');
  inputContainer.className = 'input-container flex items-center gap-2 p-2 mt-2 rounded-lg';

  // Move the existing input inside the chat container
  inputElement.classList.add('flex-1', 'border', 'border-gray-300', 'rounded-lg', 'px-4', 'py-2', 'focus:outline-none', 'focus:border-medical-blue');
  inputContainer.appendChild(inputElement);

  // Move the existing button inside the chat container
  sendButton.classList.add('bg-medical-blue', 'text-white', 'px-6', 'py-2', 'rounded-lg', 'hover:bg-opacity-90', 'transition-colors');
  inputContainer.appendChild(sendButton);

  // Append input and button inside the chat container
  chatContainer.appendChild(inputContainer);

  // Function to add messages to the chat container
  function addMessage(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'} opacity-0 transition-opacity duration-300 ease-in-out`;
    messageDiv.textContent = message;
    chatContainer.insertBefore(messageDiv, inputContainer);
    setTimeout(() => messageDiv.classList.remove('opacity-0'), 100); // Fade-in effect
    chatContainer.scrollTop = chatContainer.scrollHeight; // Auto-scroll to the latest message
  }

  // Function to send a message to the n8n webhook and handle its response
  async function sendMessage(message) {
    try {
      addMessage(message, true); // Show user message
      inputElement.value = ''; // Clear the input field

      const response = await axios.post(N8N_WEBHOOK_URL, { message });

      if (response.data && response.data.response) {
        addMessage(response.data.response);
      } else {
        addMessage('⚠️ Error: No response received.', false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('⚠️ Connection error. Please try again later.', false);
    }
  }

  function handleSend() {
    const message = inputElement.value.trim();
    if (message) {
      sendMessage(message);
    }
  }

  // Attach event listeners for sending messages
  sendButton.addEventListener('click', handleSend);
  
  inputElement.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  });

  // Autofocus input field on page load
  inputElement.focus();
}
