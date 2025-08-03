// Global variables
const socket = io();
let currentUser = '';
let currentRoom = '';
let typingTimer = null;
let isTyping = false;
let isDarkMode = localStorage.getItem('darkMode') === 'true';

// DOM elements
const joinSection = document.getElementById('join');
const chatSection = document.getElementById('chat');
const joinForm = document.getElementById('join-form');
const messageForm = document.getElementById('message-form');
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const charCounter = document.getElementById('char-counter');
const sendBtn = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing-indicator');
const userCountElement = document.getElementById('user-count');
const leaveRoomBtn = document.getElementById('leave-room');
const themeToggle = document.getElementById('theme-toggle');
const sidebar = document.getElementById('sidebar');
const toggleSidebarBtn = document.getElementById('toggle-sidebar');
const closeSidebarBtn = document.getElementById('close-sidebar');
const usersList = document.getElementById('users-list');
const emojiBtn = document.getElementById('emoji-btn');
const emojiModal = document.getElementById('emoji-modal');
const closeEmojiBtn = document.getElementById('close-emoji');
const emojiGrid = document.getElementById('emoji-grid');
const fileBtn = document.getElementById('file-btn');
const fileInput = document.getElementById('file-input');
const fileModal = document.getElementById('file-modal');
const closeFileBtn = document.getElementById('close-file');
const filePreview = document.getElementById('file-preview');

// Initialize theme
if (isDarkMode) {
  document.documentElement.setAttribute('data-theme', 'dark');
  themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

// Event listeners
joinForm.addEventListener('submit', handleJoinRoom);
messageForm.addEventListener('submit', handleSendMessage);
messageInput.addEventListener('input', handleTyping);
leaveRoomBtn.addEventListener('click', handleLeaveRoom);
themeToggle.addEventListener('click', toggleTheme);
toggleSidebarBtn.addEventListener('click', toggleSidebar);
closeSidebarBtn.addEventListener('click', closeSidebar);
emojiBtn.addEventListener('click', openEmojiModal);
closeEmojiBtn.addEventListener('click', closeEmojiModal);
fileBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
closeFileBtn.addEventListener('click', closeFileModal);

// Test form submission
console.log('Event listeners attached:', {
  joinForm: !!joinForm,
  messageForm: !!messageForm,
  leaveRoomBtn: !!leaveRoomBtn
});

// Room suggestion tags
document.querySelectorAll('.tag').forEach(tag => {
  tag.addEventListener('click', () => {
    document.getElementById('room').value = tag.dataset.room;
  });
});

// Theme toggle
function toggleTheme() {
  isDarkMode = !isDarkMode;
  localStorage.setItem('darkMode', isDarkMode);
  
  if (isDarkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    document.documentElement.removeAttribute('data-theme');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  }
}

// Sidebar functions
function toggleSidebar() {
  sidebar.classList.toggle('open');
}

function closeSidebar() {
  sidebar.classList.remove('open');
}

// Emoji functions
function openEmojiModal() {
  emojiModal.style.display = 'block';
  populateEmojis();
}

function closeEmojiModal() {
  emojiModal.style.display = 'none';
}

function populateEmojis() {
  const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '💩', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'];
  
  emojiGrid.innerHTML = '';
  emojis.forEach(emoji => {
    const emojiItem = document.createElement('div');
    emojiItem.className = 'emoji-item';
    emojiItem.textContent = emoji;
    emojiItem.addEventListener('click', () => {
      insertEmoji(emoji);
      closeEmojiModal();
    });
    emojiGrid.appendChild(emojiItem);
  });
}

function insertEmoji(emoji) {
  const start = messageInput.selectionStart;
  const end = messageInput.selectionEnd;
  const text = messageInput.value;
  messageInput.value = text.substring(0, start) + emoji + text.substring(end);
  messageInput.selectionStart = messageInput.selectionEnd = start + emoji.length;
  messageInput.focus();
}

// File functions
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    showNotification('File too large (max 5MB)', 'error');
    return;
  }

  showFilePreview(file);
}

function showFilePreview(file) {
  fileModal.style.display = 'block';
  
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      filePreview.innerHTML = `
        <img src="${e.target.result}" alt="File preview">
        <p>${file.name}</p>
        <button onclick="sendFile('${file.name}')" class="send-file-btn">Send File</button>
      `;
    };
    reader.readAsDataURL(file);
  } else {
    filePreview.innerHTML = `
      <div class="file-info">
        <i class="fas fa-file"></i>
        <p>${file.name}</p>
        <p>Size: ${(file.size / 1024).toFixed(1)} KB</p>
      </div>
      <button onclick="sendFile('${file.name}')" class="send-file-btn">Send File</button>
    `;
  }
}

function closeFileModal() {
  fileModal.style.display = 'none';
  fileInput.value = '';
}

function sendFile(fileName) {
  // In a real app, you'd upload the file to a server
  // For now, we'll just send a message about the file
  const message = `📎 ${fileName}`;
  socket.emit('send-message', message);
  closeFileModal();
  showNotification('File message sent!', 'success');
}

// Join room handler
function handleJoinRoom(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value.trim();
  const room = document.getElementById('room').value.trim();

  console.log('Attempting to join room:', { username, room });

  if (!username || !room) {
    showNotification('Please enter both name and room', 'error');
    return;
  }

  if (username.length < 2) {
    showNotification('Username must be at least 2 characters', 'error');
    return;
  }

  currentUser = username;
  currentRoom = room;

  // Show loading state
  const joinBtn = document.querySelector('.join-btn');
  const originalText = joinBtn.innerHTML;
  joinBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Joining...';
  joinBtn.disabled = true;

  console.log('Emitting join-room event:', room, username);
  // Join the room
  socket.emit('join-room', room, username);
  
  // Set timeout to reset button if no response
  setTimeout(() => {
    if (joinBtn.disabled && joinBtn.innerHTML.includes('Joining...')) {
      resetJoinButton();
      showNotification('Connection timeout. Please try again.', 'error');
    }
  }, 10000); // 10 second timeout
}

// Send message handler
function handleSendMessage(e) {
  e.preventDefault();
  
  const message = messageInput.value.trim();
  if (!message) return;

  // Prevent rapid clicking
  if (sendBtn.disabled) return;
  
  // Show loading state
  sendBtn.disabled = true;
  sendBtn.classList.add('loading');
  sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  sendBtn.title = 'Sending...';

  // Clear typing indicator
  socket.emit('stop-typing');
  isTyping = false;
  hideTypingIndicator();

  // Send message
  socket.emit('send-message', message);
  messageInput.value = '';
  messageInput.style.height = 'auto';
  
  // Reset character counter
  updateCharCounter();
  
  // Don't add message to UI immediately - wait for server confirmation
  // This prevents duplicate messages
  
  // Re-enable send button after a short delay
  setTimeout(() => {
    sendBtn.disabled = false;
    sendBtn.classList.remove('loading');
    sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
    sendBtn.title = 'Send message';
  }, 500);
}

// Typing handler
function handleTyping() {
  if (!isTyping) {
    isTyping = true;
    socket.emit('typing');
  }

  // Clear existing timer
  clearTimeout(typingTimer);
  
  // Set new timer
  typingTimer = setTimeout(() => {
    isTyping = false;
    socket.emit('stop-typing');
  }, 1000);

  // Auto-resize textarea
  autoResizeTextarea();
  
  // Update character counter
  updateCharCounter();
}

// Auto-resize textarea function
function autoResizeTextarea() {
  messageInput.style.height = 'auto';
  const newHeight = Math.min(messageInput.scrollHeight, 120);
  messageInput.style.height = newHeight + 'px';
}

// Update character counter
function updateCharCounter() {
  const currentLength = messageInput.value.length;
  const maxLength = 1000;
  const remaining = maxLength - currentLength;
  
  charCounter.textContent = `${currentLength}/${maxLength}`;
  
  // Update counter color based on remaining characters
  charCounter.classList.remove('warning', 'danger');
  
  if (remaining <= 100 && remaining > 50) {
    charCounter.classList.add('warning');
  } else if (remaining <= 50) {
    charCounter.classList.add('danger');
  }
  
  // Disable send button if message is empty or too long
  if (currentLength === 0 || currentLength > maxLength) {
    sendBtn.disabled = true;
    sendBtn.style.opacity = '0.5';
  } else {
    sendBtn.disabled = false;
    sendBtn.style.opacity = '1';
  }
}

// Leave room handler
function handleLeaveRoom() {
  if (confirm('Are you sure you want to leave this room?')) {
    socket.emit('leave-room');
    showJoinSection();
  }
}

// Socket event listeners
socket.on('connect', () => {
  console.log('Connected to server');
  // Reset join button if it was stuck in loading state
  const joinBtn = document.querySelector('.join-btn');
  if (joinBtn.disabled && joinBtn.innerHTML.includes('Joining...')) {
    resetJoinButton();
  }
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
  // Reset join button when disconnected
  resetJoinButton();
  showNotification('Connection lost. Please refresh the page.', 'error');
});

socket.on('user-joined', (username) => {
  console.log('User joined:', username);
  addSystemMessage(`${username} joined the room`);
  updateUserCount();
  updateUsersList();
});

socket.on('user-left', (username) => {
  console.log('User left:', username);
  addSystemMessage(`${username} left the room`);
  updateUserCount();
  updateUsersList();
});

socket.on('message', (data) => {
  console.log('Received message:', data);
  const { message, username, timestamp } = data;
  
  // Add message to UI - this will be the only time a message is added
  // For the sender, it will be marked as 'sent', for others as 'received'
  addMessageToUI(message, username, username === currentUser ? 'sent' : 'received', timestamp);
  
  // Show success feedback for sender
  if (username === currentUser) {
    showSendSuccess();
  }
});

socket.on('typing', (username) => {
  if (username !== currentUser) {
    showTypingIndicator(username);
  }
});

socket.on('stop-typing', (username) => {
  if (username !== currentUser) {
    hideTypingIndicator();
  }
});

socket.on('room-joined', (data) => {
  console.log('Room joined successfully:', data);
  showChatSection();
  updateUserCount(data.userCount);
  showNotification(`Successfully joined room: ${currentRoom}`, 'success');
  
  // Load message history
  if (data.messages && data.messages.length > 0) {
    data.messages.forEach(msg => {
      addMessageToUI(msg.message, msg.username, msg.username === currentUser ? 'sent' : 'received', msg.timestamp);
    });
  }
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
  showNotification(error, 'error');
  // Reset join button
  resetJoinButton();
});

socket.on('user-count-update', (count) => {
  updateUserCount(count);
});

// Reset join button state
function resetJoinButton() {
  const joinBtn = document.querySelector('.join-btn');
  joinBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Join Room';
  joinBtn.disabled = false;
}

// UI functions
function showJoinSection() {
  joinSection.style.display = 'block';
  chatSection.style.display = 'none';
  currentUser = '';
  currentRoom = '';
  
  // Reset form
  joinForm.reset();
  
  // Reset join button state
  resetJoinButton();
  
  // Clear messages
  messagesContainer.innerHTML = '';
  
  // Close sidebar
  closeSidebar();
}

function showChatSection() {
  joinSection.style.display = 'none';
  chatSection.style.display = 'flex';
  document.getElementById('room-name').textContent = currentRoom;
  
  // Focus on message input
  messageInput.focus();
}

function addMessageToUI(message, username, type, timestamp = new Date()) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  
  const time = new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  messageDiv.innerHTML = `
    <div class="message-header">
      <span class="username">${username}</span>
      <span class="timestamp">${time}</span>
    </div>
    <div class="message-content">${escapeHtml(message)}</div>
  `;
  
  messagesContainer.appendChild(messageDiv);
  scrollToBottom();
}

function addSystemMessage(message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message system-message';
  messageDiv.textContent = message;
  
  messagesContainer.appendChild(messageDiv);
  scrollToBottom();
}

function showTypingIndicator(username) {
  typingIndicator.style.display = 'flex';
  typingIndicator.querySelector('.typing-text').textContent = `${username} is typing...`;
}

function hideTypingIndicator() {
  typingIndicator.style.display = 'none';
}

function updateUserCount(count) {
  if (count !== undefined) {
    userCountElement.textContent = `${count} user${count !== 1 ? 's' : ''} online`;
  }
}

function updateUsersList() {
  // In a real app, you'd get the actual user list from the server
  // For now, we'll simulate it
  const mockUsers = ['Alice', 'Bob', 'Charlie', currentUser].filter(Boolean);
  usersList.innerHTML = '';
  
  mockUsers.forEach(user => {
    const userItem = document.createElement('div');
    userItem.className = 'user-item';
    userItem.innerHTML = `
      <div class="user-avatar">${user.charAt(0).toUpperCase()}</div>
      <div class="user-name">${user}</div>
    `;
    usersList.appendChild(userItem);
  });
}

function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;
  
  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#17a2b8'};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    max-width: 300px;
    animation: slideInRight 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Show send success feedback
function showSendSuccess() {
  sendBtn.classList.add('success');
  setTimeout(() => {
    sendBtn.classList.remove('success');
  }, 600);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl+Enter to send message
  if (e.ctrlKey && e.key === 'Enter' && document.activeElement === messageInput) {
    handleSendMessage(e);
  }
  
  // Escape to leave room
  if (e.key === 'Escape' && chatSection.style.display === 'flex') {
    handleLeaveRoom();
  }
  
  // Escape to close modals
  if (e.key === 'Escape') {
    closeEmojiModal();
    closeFileModal();
  }
  
  // Tab to focus next element
  if (e.key === 'Tab' && document.activeElement === messageInput) {
    // Allow normal tab behavior
    return;
  }
});

// Paste handling for images
messageInput.addEventListener('paste', (e) => {
  const items = e.clipboardData.items;
  
  for (let item of items) {
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile();
      if (file && file.size <= 5 * 1024 * 1024) { // 5MB limit
        showFilePreview(file);
        e.preventDefault();
        break;
      }
    }
  }
});

// Click outside to close modals
window.addEventListener('click', (e) => {
  if (e.target === emojiModal) {
    closeEmojiModal();
  }
  if (e.target === fileModal) {
    closeFileModal();
  }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Focus on username input
  document.getElementById('username').focus();
  
  // Add smooth scrolling to messages container
  messagesContainer.style.scrollBehavior = 'smooth';
  
  // Test Socket.IO connection
  console.log('Socket.IO connection state:', socket.connected);
  
  // Add keyframe animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Test form submission
  console.log('Form elements found:', {
    joinForm: !!joinForm,
    username: !!document.getElementById('username'),
    room: !!document.getElementById('room'),
    joinBtn: !!document.querySelector('.join-btn')
  });
});
