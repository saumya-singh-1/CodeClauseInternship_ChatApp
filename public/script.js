const socket = io();

function joinRoom() {
  const username = document.getElementById('username').value;
  const room = document.getElementById('room').value;

  if (!username || !room) {
    alert("Please enter both name and room");
    return;
  }

  document.getElementById('join').style.display = 'none';
  document.getElementById('chat').style.display = 'block';
  document.getElementById('room-name').innerText = room;

  socket.emit('join-room', room, username);

  socket.on('message', (msg) => {
    const msgBox = document.getElementById('messages');
    const div = document.createElement('div');
    div.textContent = msg;
    msgBox.appendChild(div);
    msgBox.scrollTop = msgBox.scrollHeight;
  });

  // Attach the sendMessage function to global scope
  window.sendMessage = () => {
    const input = document.getElementById('message-input');
    const message = input.value;
    if (message.trim() !== '') {
      socket.emit('send-message', message);
      input.value = '';
    }
  };
}
