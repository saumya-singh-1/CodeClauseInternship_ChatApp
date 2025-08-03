# Modern Chat App 🚀

A beautiful, feature-rich real-time chat application built with Node.js, Express, and Socket.IO.

## ✨ Features

### 🎨 **Enhanced UI/UX**
- **Dark Mode Support** - Toggle between light and dark themes
- **Modern Design** - Clean, responsive interface with smooth animations
- **Auto-resizing Message Input** - Textarea that grows with content
- **Smooth Animations** - Beautiful transitions and micro-interactions
- **Responsive Design** - Works perfectly on desktop and mobile

### 💬 **Chat Features**
- **Real-time Messaging** - Instant message delivery with Socket.IO
- **Room-based Chat** - Join different chat rooms
- **Message History** - View recent messages when joining a room
- **Typing Indicators** - See when others are typing
- **User Presence** - Know who's online in your room
- **System Messages** - Automatic notifications for joins/leaves

### 😊 **Emoji Support**
- **Emoji Picker** - Click to insert emojis into messages
- **Rich Emoji Library** - 100+ popular emojis
- **Quick Access** - Easy-to-use emoji modal

### 📁 **File Sharing**
- **File Upload** - Share images, documents, and text files
- **File Preview** - Preview images before sending
- **Size Validation** - 5MB file size limit
- **Supported Formats** - Images, PDFs, docs, and text files

### 👥 **User Management**
- **User Sidebar** - See who's online in your room
- **User Avatars** - Visual user identification
- **User Count** - Real-time user count updates
- **Username Validation** - Prevent duplicate usernames

### 🎯 **User Experience**
- **Room Suggestions** - Quick access to popular rooms
- **Keyboard Shortcuts** - Ctrl+Enter to send, Escape to leave
- **Notifications** - Success/error notifications
- **Loading States** - Visual feedback during operations
- **Error Handling** - Comprehensive error messages

## 🚀 Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chat-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Production Deployment

1. **Install production dependencies**
   ```bash
   npm install --production
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Real-time Communication**: Socket.IO
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Styling**: CSS Variables, Flexbox, Grid
- **Icons**: Font Awesome
- **Development**: Nodemon (auto-restart)

## 📁 Project Structure

```
chat-app/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── README.md             # Project documentation
├── public/               # Static files
│   ├── index.html        # Main HTML file
│   ├── style.css         # Styles with dark mode
│   └── script.js         # Client-side JavaScript
└── background01.jpg      # Background image
```

## 🎨 Customization

### Themes
The app uses CSS variables for easy theming. Modify the `:root` variables in `style.css`:

```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --background-color: #ffffff;
  /* ... more variables */
}
```

### Adding New Features
- **New Emojis**: Add to the `emojis` array in `script.js`
- **File Types**: Modify the `accept` attribute in the file input
- **Room Suggestions**: Update the room tags in `index.html`

## 🔧 API Endpoints

- `GET /api/rooms` - Get list of active rooms
- `GET /api/room/:roomName/messages` - Get room message history

## 🚀 Performance Features

- **Message Pagination** - Only loads recent messages
- **Memory Management** - Automatic cleanup of empty rooms
- **Optimistic Updates** - Immediate UI feedback
- **Efficient Re-renders** - Minimal DOM manipulation

## 🔒 Security Features

- **Input Validation** - Server-side message validation
- **XSS Prevention** - HTML escaping for user content
- **File Size Limits** - Prevents large file uploads
- **Username Validation** - Prevents duplicate usernames

## 🎯 Future Enhancements

- [ ] **Database Integration** - Persistent message storage
- [ ] **User Authentication** - Login/signup system
- [ ] **Private Messages** - Direct messaging
- [ ] **Voice Messages** - Audio recording
- [ ] **Video Calls** - WebRTC integration
- [ ] **Message Reactions** - Like/react to messages
- [ ] **Message Search** - Search through chat history
- [ ] **Push Notifications** - Browser notifications
- [ ] **Message Encryption** - End-to-end encryption
- [ ] **File Storage** - Cloud storage integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Socket.IO for real-time communication
- Font Awesome for beautiful icons
- CSS Grid and Flexbox for modern layouts
- The open-source community for inspiration

---

**Made with ❤️ for the modern web** 