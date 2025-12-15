function toggleMode() {
  const body = document.body;
  body.classList.toggle('dark-mode');
  body.classList.toggle('light-mode');
  
  const mode = body.classList.contains('dark-mode') ? 'dark' : 'light';
  setModeCookie(mode);
}

function setModeCookie(mode) {
  const expirationDays = 7;
  const expiration = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000);
  document.cookie = `mode=${mode}; expires=${expiration.toUTCString()}`;
}

function getModeCookie() {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith('mode=')) {
      return cookie.substring('mode='.length, cookie.length);
    }
  }
  return null;
}

const savedMode = getModeCookie();
if (savedMode) {
  const body = document.body;
  body.classList.add(savedMode === 'dark' ? 'dark-mode' : 'light-mode');
}

const modeToggle = document.getElementById('mode-toggle');
modeToggle.addEventListener('click', toggleMode);