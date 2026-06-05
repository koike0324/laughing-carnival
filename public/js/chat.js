const socket = io();

let currentUsername = '';
let currentRoom = '';
let typingTimeout;

// Get user info from session storage
const username = sessionStorage.getItem('username');
const room = sessionStorage.getItem('room');

if (!username || !room) {
  window.location.href = '/';
} else {
  currentUsername = username;
  currentRoom = room;
  document.getElementById('roomTitle').textContent = `${room} ルーム`;
}

// Join the room
socket.emit('join', { username: currentUsername, room: currentRoom });

// Listen for online count
socket.on('onlineCount', (count) => {
  document.getElementById('onlineCount').textContent = count;
});

// Listen for messages
socket.on('receiveMessage', (data) => {
  addMessage(data.message, data.username, data.timestamp, false);
});

// Listen for user joined
socket.on('userJoined', (data) => {
  addSystemMessage(data.message, data.timestamp);
});

// Listen for user left
socket.on('userLeft', (data) => {
  addSystemMessage(data.message, data.timestamp);
});

// Listen for typing
socket.on('userTyping', (data) => {
  showTypingIndicator(data.username);
});

// Listen for stop typing
socket.on('userStopTyping', () => {
  hideTypingIndicator();
});

function sendMessage() {
  const input = document.getElementById('input');
  const message = input.value.trim();

  if (message === '') return;

  // Emit message to server
  socket.emit('sendMessage', { message });

  // Add message to own chat
  addMessage(message, 'You', new Date().toLocaleTimeString('ja-JP'), true);

  // Clear input
  input.value = '';
  input.focus();

  // Emit stop typing
  socket.emit('stopTyping');
}

function addMessage(message, username, timestamp, isOwn) {
  const messagesDiv = document.getElementById('messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isOwn ? 'right' : 'left'}`;

  const wrapper = document.createElement('div');
  wrapper.className = 'message-wrapper';

  if (!isOwn) {
    const usernameSpan = document.createElement('div');
    usernameSpan.className = 'message-username';
    usernameSpan.textContent = username;
    wrapper.appendChild(usernameSpan);
  }

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = message;
  wrapper.appendChild(bubble);

  const timeSpan = document.createElement('div');
  timeSpan.className = 'message-time';
  timeSpan.textContent = timestamp;
  wrapper.appendChild(timeSpan);

  messageDiv.appendChild(wrapper);
  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function addSystemMessage(message, timestamp) {
  const messagesDiv = document.getElementById('messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message system';

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = message;
  bubble.style.fontSize = '0.85em';

  messageDiv.appendChild(bubble);
  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function showTypingIndicator(username) {
  const indicator = document.getElementById('typingIndicator');
  const typingUser = document.getElementById('typingUser');
  typingUser.textContent = username;
  indicator.style.display = 'flex';

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    hideTypingIndicator();
  }, 3000);
}

function hideTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  indicator.style.display = 'none';
}

// Input event listeners
const input = document.getElementById('input');

input.addEventListener('input', () => {
  socket.emit('typing');
});

input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessage();
  }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  sessionStorage.removeItem('username');
  sessionStorage.removeItem('room');
});
