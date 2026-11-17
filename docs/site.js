'use strict';
const filterButtons = [...document.querySelectorAll('[data-filter]')];
const cards = [...document.querySelectorAll('.project-card')];
const filterStatus = document.getElementById('filter-status');
for (const button of filterButtons) {
  button.addEventListener('click', () => {
    const wanted = button.dataset.filter;
    let count = 0;
    for (const other of filterButtons) {
      const active = other === button;
      other.classList.toggle('active', active);
      other.setAttribute('aria-pressed', String(active));
    }
    for (const card of cards) {
      const visible = wanted === 'all' || card.dataset.tags.split(' ').includes(wanted);
      card.hidden = !visible;
      if (visible) count++;
    }
    filterStatus.textContent = `${count} projects shown for ${wanted}`;
  });
}
const form = document.getElementById('terminal-form');
const input = document.getElementById('terminal-input');
const output = document.getElementById('terminal-output');
const commands = {
  help: 'Available: about, skills, projects, play, github, clear, help',
  about: 'Software engineering intern · CS master\'s student · naturally curious.',
  skills: 'Swift · Kotlin · TypeScript · Python · ML evaluation · retrieval · agents',
  projects: 'Chronicle RAG Lab | Meridian ML Reliability | Advanced ML Systems | Applied ML Experiments',
  play: 'Launching Signal Defender…',
  github: 'Opening github.com/Laibaali0…',
};
function addLine(cls, text) {
  const line = document.createElement('p');
  line.className = `terminal-line ${cls}`;
  line.textContent = text;
  output.appendChild(line);
}
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const command = input.value.trim().toLowerCase();
  input.value = '';
  if (!command) return;
  if (command === 'clear') { output.replaceChildren(); return; }
  addLine('terminal-command', `visitor@github:~$ ${command}`);
  addLine('terminal-reply', commands[command] || `Unknown command '${command}'. Type help.`);
  if (command === 'play') setTimeout(() => { location.href = './arcade/'; }, 450);
  if (command === 'github') window.open('https://github.com/Laibaali0', '_blank', 'noopener,noreferrer');
  input.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
});
document.getElementById('year').textContent = String(new Date().getFullYear());
