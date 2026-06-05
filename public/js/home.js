document.getElementById('joinForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const room = document.getElementById('room').value.trim();

  if (!username || !room) {
    alert('ユーザー名とルーム名を入力してください');
    return;
  }

  // Store user info in session storage
  sessionStorage.setItem('username', username);
  sessionStorage.setItem('room', room);

  // Redirect to chat page
  window.location.href = '/chat';
});
