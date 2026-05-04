/* ============================================================
   HTB TO-DO — SCRIPT.JS
   Clean modular architecture — zero dependencies
   ============================================================ */

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* ─── Sound FX (Web Audio API — tiny beeps) ─── */
const SFX = (() => {
  let ctx;
  const ac = () => { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); return ctx; };
  const beep = (f = 800, d = 0.08, v = 0.1) => {
    try {
      const c = ac(), o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.frequency.value = f; o.type = 'square';
      g.gain.setValueAtTime(v, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + d);
      o.start(); o.stop(c.currentTime + d);
    } catch {}
  };
  return {
    add:      () => beep(1200, 0.06, 0.08),
    done:     () => { beep(800, 0.05); setTimeout(() => beep(1200, 0.1), 70); },
    del:      () => beep(300, 0.12, 0.08),
    click:    () => beep(600, 0.03, 0.05),
    timerEnd: () => { for (let i = 0; i < 3; i++) setTimeout(() => beep(1000 + i * 200, 0.15, 0.12), i * 200); },
  };
})();

/* ─── SVG Icons (inline — no external deps) ─── */
const Icons = {
  edit:   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z"/></svg>',
  trash:  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd"/></svg>',
  list:   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 4.75A.75.75 0 016.75 4h10.5a.75.75 0 010 1.5H6.75A.75.75 0 016 4.75zm-3 0A.75.75 0 013.75 4h.5a.75.75 0 010 1.5h-.5A.75.75 0 013 4.75zm3 5A.75.75 0 016.75 9h10.5a.75.75 0 010 1.5H6.75A.75.75 0 016 9.75zm-3 0A.75.75 0 013.75 9h.5a.75.75 0 010 1.5h-.5A.75.75 0 013 9.75zm3 5a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zm-3 0a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5a.75.75 0 01-.75-.75z" clip-rule="evenodd"/></svg>',
  x:      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/></svg>',
  cal:    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clip-rule="evenodd"/></svg>',
  clock:  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5H10.75V5z" clip-rule="evenodd"/></svg>',
  check:  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/></svg>',
  moon:   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.455 2.004a.75.75 0 01.26.77 7 7 0 009.958 7.967.75.75 0 011.067.853A8.5 8.5 0 116.647 1.921a.75.75 0 01.808.083z" clip-rule="evenodd"/></svg>',
};

/* ─── Store ─── */
const Store = {
  KEY: 'htb_todo_v2',
  load() { try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } catch { return []; } },
  save(t) { localStorage.setItem(this.KEY, JSON.stringify(t)); }
};

/* ─── State ─── */
const State = {
  tasks: Store.load(),
  filter: 'all',
  pFilter: 'all',
  search: '',
  sort: 'date-desc',
  editId: null,

  persist() { Store.save(this.tasks); },

  add(d) {
    this.tasks.unshift({
      id: uid(), title: d.title.trim(), description: (d.description || '').trim(),
      category: d.category || 'general', priority: d.priority || 'medium',
      dueDate: d.dueDate || '', completed: false, createdAt: new Date().toISOString(),
      subtasks: [], timeSpent: 0
    });
    this.persist();
  },

  update(id, d) { const t = this.tasks.find(x => x.id === id); if (t) Object.assign(t, d); this.persist(); },
  remove(id)    { this.tasks = this.tasks.filter(x => x.id !== id); this.persist(); },
  toggle(id)    { const t = this.tasks.find(x => x.id === id); if (t) t.completed = !t.completed; this.persist(); return t; },

  addSub(tid, title) { const t = this.tasks.find(x => x.id === tid); if (t) t.subtasks.push({ id: uid(), title: title.trim(), completed: false }); this.persist(); },
  toggleSub(tid, sid) { const t = this.tasks.find(x => x.id === tid); if (!t) return; const s = t.subtasks.find(x => x.id === sid); if (s) s.completed = !s.completed; this.persist(); },
  removeSub(tid, sid) { const t = this.tasks.find(x => x.id === tid); if (t) t.subtasks = t.subtasks.filter(x => x.id !== sid); this.persist(); },

  filtered() {
    let list = [...this.tasks];
    if (this.search) { const q = this.search.toLowerCase(); list = list.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)); }
    if (this.filter === 'pending') list = list.filter(t => !t.completed);
    if (this.filter === 'completed') list = list.filter(t => t.completed);
    if (this.pFilter !== 'all') list = list.filter(t => t.priority === this.pFilter);

    const pOrd = { high: 0, medium: 1, low: 2 };
    switch (this.sort) {
      case 'date-asc':  list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
      case 'date-desc': list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      case 'priority':  list.sort((a, b) => pOrd[a.priority] - pOrd[b.priority]); break;
      case 'status':    list.sort((a, b) => a.completed - b.completed); break;
      case 'due':       list.sort((a, b) => { if (!a.dueDate) return 1; if (!b.dueDate) return -1; return new Date(a.dueDate) - new Date(b.dueDate); }); break;
    }
    return list;
  },

  stats() {
    const total = this.tasks.length, done = this.tasks.filter(t => t.completed).length;
    return { total, done, pending: total - done };
  },

  reorder(fromId, toId) {
    const fi = this.tasks.findIndex(t => t.id === fromId);
    const ti = this.tasks.findIndex(t => t.id === toId);
    if (fi < 0 || ti < 0) return;
    const [item] = this.tasks.splice(fi, 1);
    this.tasks.splice(ti, 0, item);
    this.persist();
  }
};

/* ─── Toast ─── */
const Toast = {
  el: null,
  init() { this.el = $('#toastContainer'); },
  show(msg, type = 'success') {
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    this.el.appendChild(t);
    setTimeout(() => { t.classList.add('toast-exit'); setTimeout(() => t.remove(), 300); }, 2500);
  }
};

/* ─── Timer ─── */
const Timer = {
  total: 25 * 60, remaining: 25 * 60, running: false, iv: null, taskId: null,
  startTime: 0, baseRemaining: 0,

  init() {
    this.timeEl = $('#timerTime');
    this.labelEl = $('#timerLabel');
    this.ringEl = $('#timerRing');
    this.toggleBtn = $('#timerActionBtn');
    this.card = $('#timerCard');
    this.render();

    $$('.preset-pill').forEach(b => b.addEventListener('click', () => {
      if (b.id === 'customTimerBtn') {
        $('#customTimerBox').classList.toggle('hidden');
        return;
      }
      $$('.preset-pill').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      $('#customTimerBox').classList.add('hidden');
      this.set(b.dataset.mode, +b.dataset.minutes);
      SFX.click();
    }));

    $('#applyCustomTimer').addEventListener('click', () => {
      const mins = +$('#customMinutes').value;
      if (mins > 0) {
        $$('.preset-pill').forEach(x => x.classList.remove('active'));
        $('#customTimerBtn').classList.add('active');
        this.set('custom', mins);
        $('#customTimerBox').classList.add('hidden');
        SFX.click();
      }
    });

    this.toggleBtn.addEventListener('click', () => this.toggle());
    $('#timerReset').addEventListener('click', () => { this.reset(); SFX.click(); });
    
    // Custom Dropdown logic
    const dDrop = $('#timerTaskDropdown');
    const dTrig = $('#timerTaskTrigger');
    const dMenu = $('#timerTaskMenu');
    if (dTrig) {
      dTrig.addEventListener('click', (e) => { e.stopPropagation(); dDrop.classList.toggle('active'); });
      dMenu.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        if (!li) return;
        this.taskId = li.dataset.value || null;
        $('#timerTaskLabel').textContent = li.textContent;
        $$('li', dMenu).forEach(x => x.classList.remove('active'));
        li.classList.add('active');
        dDrop.classList.remove('active');
      });
      document.addEventListener('click', (e) => {
        if (!e.target.closest('#timerTaskDropdown')) dDrop.classList.remove('active');
      });
    }
  },

  set(mode, mins) {
    this.total = mins * 60; 
    this.remaining = this.total; 
    this.pause();
    this.labelEl.textContent = mode === 'pomodoro' ? 'Focus Session' : mode === 'short' ? 'Short Break' : mode === 'long' ? 'Long Break' : `${mins} min Session`;
    this.render();
  },

  toggle() {
    if (this.running) this.pause();
    else this.start();
    SFX.click();
  },

  start() {
    if (this.running) return;
    this.running = true;
    this.startTime = Date.now();
    this.baseRemaining = this.remaining;
    
    this.card.classList.add('running');
    this.toggleBtn.innerHTML = '❚❚ Pause';
    
    this.iv = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      this.remaining = Math.max(0, this.baseRemaining - elapsed);
      
      if (this.remaining <= 0) {
        this.remaining = 0; 
        this.complete();
      }
      this.render();
    }, 200); // Higher frequency for smoother UI, but math stays accurate
  },

  pause() {
    this.running = false;
    this.card.classList.remove('running');
    this.toggleBtn.innerHTML = '▶ Start Focus';
    if (this.iv) { clearInterval(this.iv); this.iv = null; }
    document.title = 'OPH_TASKD — Mission Dashboard';
  },

  reset() {
    this.pause();
    this.remaining = this.total;
    this.render();
  },

  complete() {
    this.pause();
    SFX.timerEnd();
    Toast.show('⏰ Mission Time Completed!');
    if (this.taskId) {
      const t = State.tasks.find(x => x.id === this.taskId);
      if (t) {
        t.timeSpent += this.total;
        State.persist();
        UI.render();
      }
    }
  },

  render() {
    const m = Math.floor(this.remaining / 60);
    const s = this.remaining % 60;
    const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    this.timeEl.textContent = timeStr;

    // Ring progress
    const pct = this.remaining / this.total;
    const offset = 283 * (1 - pct);
    this.ringEl.style.strokeDashoffset = offset;

    // Tab title
    if (this.running) {
      document.title = `[${timeStr}] OPH_TASKD`;
    }
  },

  updateOptions() {
    const menu = $('#timerTaskMenu');
    const curLabel = $('#timerTaskLabel');
    if (!menu) return;

    menu.innerHTML = '<li data-value="" class="' + (!this.taskId ? 'active' : '') + '">— none —</li>';
    let labelText = '— none —';
    
    State.tasks.filter(t => !t.completed).forEach(t => {
      const isActive = t.id === this.taskId;
      if (isActive) labelText = t.title;
      menu.innerHTML += `<li data-value="${t.id}" class="${isActive ? 'active' : ''}">${esc(t.title)}</li>`;
    });
    curLabel.textContent = labelText;
  }
};

/* ─── Helpers ─── */
function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function fmtSec(s) { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return h > 0 ? `${h}h ${m}m` : `${m}m`; }

/* ─── UI ─── */
const UI = {
  expandedTasks: new Set(),
  init() {
    this.list = $('#taskList');
    this.addCard = $('#addTaskToggle').closest('.collapsible-card');
    this.timerCard = $('#timerCard');

    // Toggle add-task
    $('#addTaskToggle').addEventListener('click', () => {
      this.addCard.classList.toggle('collapsed');
      SFX.click();
    });

    // Toggle timer
    $('#timerToggle').addEventListener('click', () => {
      this.timerCard.classList.toggle('collapsed');
      SFX.click();
    });

    // Add task
    $('#addTaskForm').addEventListener('submit', e => {
      e.preventDefault();
      const title = $('#taskTitle').value.trim();
      if (!title) { Toast.show('Title is required', 'error'); return; }
      State.add({
        title, description: $('#taskDesc').value, category: $('#taskCategory').value,
        priority: $('#taskPriority').value, dueDate: $('#taskDue').value
      });
      $('#addTaskForm').reset();
      SFX.add();
      Toast.show('Task added');
      this.render();
    });

    // Search
    $('#searchInput').addEventListener('input', e => { State.search = e.target.value; this.render(); });

    // Custom Sort Dropdown
    const sortDrop = $('#sortDropdown'), sortTrig = $('#sortTrigger'), sortMenu = $('#sortMenu'), sortLabel = $('#sortCurrentLabel');
    
    sortTrig.addEventListener('click', (e) => {
      e.stopPropagation();
      sortDrop.classList.toggle('active');
      SFX.click();
    });

    $$('li', sortMenu).forEach(li => li.addEventListener('click', () => {
      State.sort = li.dataset.value;
      $$('li', sortMenu).forEach(x => x.classList.remove('active'));
      li.classList.add('active');
      sortLabel.textContent = li.textContent;
      sortDrop.classList.remove('active');
      SFX.click();
      this.render();
    }));

    window.addEventListener('click', () => sortDrop.classList.remove('active'));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') sortDrop.classList.remove('active'); });

    // Filters (status)
    $$('[data-filter]').forEach(b => b.addEventListener('click', () => {
      State.filter = b.dataset.filter;
      $$('[data-filter]').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      SFX.click(); this.render();
    }));

    // Filters (priority)
    $$('[data-pf]').forEach(b => b.addEventListener('click', () => {
      State.pFilter = b.dataset.pf;
      $$('[data-pf]').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      SFX.click(); this.render();
    }));

    // Theme
    $('#themeToggle').addEventListener('click', () => {
      document.body.classList.toggle('light-mode');
      const light = document.body.classList.contains('light-mode');
      localStorage.setItem('htb_theme', light ? 'light' : 'dark');
      $('#themeToggle').innerHTML = light ? Icons.moon : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zm0 13a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zm-8-5a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 012 10zm13 0a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 0115 10zM4.343 4.343a.75.75 0 011.06 0l1.061 1.06a.75.75 0 11-1.06 1.061l-1.061-1.06a.75.75 0 010-1.061zm9.193 9.193a.75.75 0 011.06 0l1.061 1.06a.75.75 0 01-1.06 1.061l-1.06-1.06a.75.75 0 010-1.061zM4.343 15.657a.75.75 0 010-1.06l1.06-1.061a.75.75 0 111.061 1.06l-1.06 1.061a.75.75 0 01-1.061 0zm9.193-9.193a.75.75 0 010-1.06l1.06-1.061a.75.75 0 111.061 1.06l-1.06 1.06a.75.75 0 01-1.061 0zM10 7a3 3 0 100 6 3 3 0 000-6z"/></svg>';
      Toast.show(light ? 'Light mode' : 'Dark mode');
    });

    if (localStorage.getItem('htb_theme') === 'light') {
      document.body.classList.add('light-mode');
      $('#themeToggle').innerHTML = Icons.moon;
    }

    // Shortcuts
    $('#shortcutsBtn').addEventListener('click', () => { $('.shortcuts-panel').classList.toggle('active'); });

    // Keyboard
    document.addEventListener('keydown', e => {
      const inp = ['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName);
      if (e.key === 'n' && !inp) { e.preventDefault(); this.addCard.classList.remove('collapsed'); $('#taskTitle').focus(); }
      if (e.key === '/' && !inp) { e.preventDefault(); $('#searchInput').focus(); }
      if (e.key === '?' && !inp) { e.preventDefault(); $('.shortcuts-panel').classList.toggle('active'); }
      if (e.key === 'Escape') { this.closeModals(); $('.shortcuts-panel').classList.remove('active'); }
      if (e.key === 'Enter' && e.ctrlKey && inp) { e.preventDefault(); $('#addTaskBtn')?.click(); }
    });

    // Modals
    $('#confirmCancel').addEventListener('click', () => this.closeModals());
    $('#editCancel').addEventListener('click', () => this.closeModals());
    $('#editForm').addEventListener('submit', e => {
      e.preventDefault();
      if (!State.editId) return;
      State.update(State.editId, {
        title: $('#editTitle').value.trim(), description: $('#editDesc').value.trim(),
        category: $('#editCategory').value, priority: $('#editPriority').value, dueDate: $('#editDue').value
      });
      State.editId = null;
      this.closeModals();
      SFX.add();
      Toast.show('Task updated');
      this.render();
    });

    // Typing effect
    this.typeTitle();

    this.render();
  },

  typeTitle() {
    const el = $('#typingTitle');
    const text = el.dataset.text || './load_missions';
    el.textContent = '';
    let i = 0;
    const step = () => {
      if (i < text.length) { el.textContent += text[i++]; setTimeout(step, 60 + Math.random() * 50); }
    };
    setTimeout(step, 400);
  },

  render() {
    const tasks = State.filtered();
    const st = State.stats();

    // Badges
    $('#countAll').textContent = st.total;
    $('#countPending').textContent = st.pending;
    $('#countDone').textContent = st.done;

    Timer.updateOptions();

    if (tasks.length === 0) {
      const m = { all: ['📋','No missions yet','Add a task to get started.'], pending: ['✅','All clear','No pending tasks — nice work!'], completed: ['🎯','Nothing completed','Finish some tasks to see them here.'] };
      const [ico, t, d] = m[State.filter] || m.all;
      this.list.innerHTML = `<div class="empty-state"><div class="empty-glyph">${ico}</div><h3>${t}</h3><p>${d}</p></div>`;
      return;
    }

    this.list.innerHTML = tasks.map(t => this.card(t)).join('');
    this.bindTasks();
    this.dragDrop();
  },

  card(t) {
    const due = t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
    const overdue = t.dueDate && !t.completed && new Date(t.dueDate) < new Date();
    const sd = t.subtasks.filter(s => s.completed).length, st = t.subtasks.length;
    const time = t.timeSpent > 0 ? fmtSec(t.timeSpent) : '';

    return `
    <div class="task-card ${t.completed ? 'completed' : ''}" data-id="${t.id}" data-priority="${t.priority}" draggable="true">
      <div class="task-row">
        <input type="checkbox" class="task-check" ${t.completed ? 'checked' : ''} data-act="toggle" data-id="${t.id}" aria-label="Complete">
        <div class="task-body">
          <div class="task-name">${esc(t.title)}</div>
          ${t.description ? `<div class="task-desc">${esc(t.description)}</div>` : ''}
          <div class="task-tags">
            <span class="tag tag-cat">${esc(t.category)}</span>
            <span class="tag tag-${t.priority}">${t.priority}</span>
            ${due ? `<span class="tag tag-due ${overdue ? 'overdue' : ''}">${Icons.cal} ${due}</span>` : ''}
            ${st > 0 ? `<span class="tag tag-due">${Icons.check} ${sd}/${st}</span>` : ''}
            ${time ? `<span class="tag tag-time">${Icons.clock} ${time}</span>` : ''}
          </div>
        </div>
        <div class="task-actions">
          <button class="action-btn" data-act="edit" data-id="${t.id}" title="Edit">${Icons.edit}</button>
          <button class="action-btn" data-act="subs" data-id="${t.id}" title="Sub-tasks">${Icons.list}</button>
          <button class="action-btn del" data-act="del" data-id="${t.id}" title="Delete">${Icons.trash}</button>
        </div>
      </div>
      <div class="subtask-area ${this.expandedTasks.has(t.id) ? 'open' : ''}" id="subs-${t.id}">
        <div class="subtask-head">
          <span>Sub-tasks</span>
          <span class="subtask-progress">${sd}/${st}</span>
        </div>
        <ul class="subtask-list">
          ${t.subtasks.map(s => `
            <li class="subtask-item ${s.completed ? 'done' : ''}">
              <input type="checkbox" ${s.completed ? 'checked' : ''} data-act="tsub" data-tid="${t.id}" data-sid="${s.id}">
              <span>${esc(s.title)}</span>
              <button class="remove-sub" data-act="rsub" data-tid="${t.id}" data-sid="${s.id}">${Icons.x}</button>
            </li>`).join('')}
        </ul>
        <div class="subtask-add">
          <input type="text" placeholder="Add sub-task…" data-sub-in="${t.id}">
          <button data-act="asub" data-id="${t.id}">+</button>
        </div>
      </div>
    </div>`;
  },

  bindTasks() {
    // Toggle complete
    $$('[data-act="toggle"]').forEach(el => el.addEventListener('change', () => {
      const t = State.toggle(el.dataset.id);
      SFX.done();
      Toast.show(t?.completed ? 'Completed!' : 'Re-opened');
      this.render();
    }));

    // Delete
    $$('[data-act="del"]').forEach(el => el.addEventListener('click', () => this.confirmDel(el.dataset.id)));

    // Edit
    $$('[data-act="edit"]').forEach(el => el.addEventListener('click', () => this.openEdit(el.dataset.id)));

    // Toggle subtask visibility
    $$('[data-act="subs"]').forEach(el => el.addEventListener('click', () => {
      const id = el.dataset.id;
      const area = $(`#subs-${id}`);
      area.classList.toggle('open');
      if (area.classList.contains('open')) this.expandedTasks.add(id);
      else this.expandedTasks.delete(id);
      SFX.click();
    }));

    // Toggle sub checkbox
    $$('[data-act="tsub"]').forEach(el => el.addEventListener('change', () => {
      State.toggleSub(el.dataset.tid, el.dataset.sid); SFX.click(); this.render();
    }));

    // Remove sub
    $$('[data-act="rsub"]').forEach(el => el.addEventListener('click', () => {
      State.removeSub(el.dataset.tid, el.dataset.sid); this.render();
    }));

    // Add sub
    $$('[data-act="asub"]').forEach(el => el.addEventListener('click', () => {
      const inp = $(`[data-sub-in="${el.dataset.id}"]`);
      if (!inp.value.trim()) return;
      State.addSub(el.dataset.id, inp.value);
      this.expandedTasks.add(el.dataset.id);
      SFX.add(); this.render();
    }));

    // Enter in sub input
    $$('[data-sub-in]').forEach(inp => inp.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      const id = inp.dataset.subIn;
      if (!inp.value.trim()) return;
      State.addSub(id, inp.value);
      this.expandedTasks.add(id);
      SFX.add(); this.render();
    }));
  },

  confirmDel(id) {
    const t = State.tasks.find(x => x.id === id);
    if (!t) return;
    $('#confirmTaskName').textContent = t.title;
    $('#confirmModal').classList.add('active');
    $('#confirmDelete').onclick = () => {
      State.remove(id); SFX.del(); Toast.show('Deleted', 'warning');
      this.closeModals(); this.render();
    };
  },

  openEdit(id) {
    const t = State.tasks.find(x => x.id === id);
    if (!t) return;
    State.editId = id;
    $('#editTitle').value = t.title;
    $('#editDesc').value = t.description;
    $('#editCategory').value = t.category;
    $('#editPriority').value = t.priority;
    $('#editDue').value = t.dueDate;
    $('#editModal').classList.add('active');
  },

  closeModals() {
    $$('.modal-bg').forEach(m => m.classList.remove('active'));
    State.editId = null;
  },

  dragDrop() {
    let srcId = null;
    $$('.task-card[draggable]').forEach(c => {
      c.addEventListener('dragstart', e => { srcId = c.dataset.id; c.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
      c.addEventListener('dragend', () => { c.classList.remove('dragging'); $$('.task-card').forEach(x => x.classList.remove('drag-over')); });
      c.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; c.classList.add('drag-over'); });
      c.addEventListener('dragleave', () => c.classList.remove('drag-over'));
      c.addEventListener('drop', e => {
        e.preventDefault(); c.classList.remove('drag-over');
        if (srcId && srcId !== c.dataset.id) { State.reorder(srcId, c.dataset.id); this.render(); Toast.show('Reordered'); }
      });
    });
  }
};

/* ─── Boot ─── */
document.addEventListener('DOMContentLoaded', () => {
  Toast.init();
  Timer.init();
  UI.init();
});
