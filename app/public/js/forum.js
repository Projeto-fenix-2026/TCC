function vote(e, btn, dir) {
  e.stopPropagation();
  const col = btn.closest('.vote-col');
  const upBtn   = col.querySelector('.vote-btn.up');
  const downBtn = col.querySelector('.vote-btn.down');
  const countEl = col.querySelector('.vote-count');
  let count = parseCount(countEl.textContent);

  if (dir === 'up') {
    if (upBtn.classList.contains('voted-up')) {
      upBtn.classList.remove('voted-up'); count--;
    } else {
      if (downBtn.classList.contains('voted-down')) { downBtn.classList.remove('voted-down'); count++; }
      upBtn.classList.add('voted-up'); count++;
    }
  } else {
    if (downBtn.classList.contains('voted-down')) {
      downBtn.classList.remove('voted-down'); count++;
    } else {
      if (upBtn.classList.contains('voted-up')) { upBtn.classList.remove('voted-up'); count--; }
      downBtn.classList.add('voted-down'); count--;
    }
  }
  countEl.textContent = formatCount(count);
}

function parseCount(s) {
  s = s.trim().replace(',', '.');
  if (s.includes('mil')) return Math.round(parseFloat(s) * 1000);
  return parseInt(s.replace(/\D/g, '')) || 0;
}

function formatCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.', ',') + ' mil';
  return n.toString();
}

document.querySelectorAll('.sort-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});
