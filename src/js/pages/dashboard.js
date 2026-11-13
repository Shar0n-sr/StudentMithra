import { progressBar } from '../components/progressBar.js';
import { emptyState } from '../components/emptyState.js';
import { formatDate, daysUntil, minutesLabel, todayISO } from '../utils/dateUtils.js';
import { esc } from '../utils/html.js';

export function dashboardPage(d) {
  const { subjects, tasks, exams, perSubject, week, totalMinutes } = d;
  const pending = tasks.filter(t => t.status !== 'Completed');
  const today = tasks.filter(t => t.dueDate === todayISO() && t.status !== 'Completed');
  const upcoming = exams.filter(e => daysUntil(e.examDate) >= 0).sort((a,b) => a.examDate.localeCompare(b.examDate)).slice(0,4);
  const greeting = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening';
  const taskRows = today.slice(0,5).map(t => `
    <div class="list-row"><div class="row-main"><div class="row-title">${esc(t.title)}</div><div class="row-sub">${esc(t.priority)} priority · ${esc(t.status)}</div></div>
    <input class="task-check" type="checkbox" data-action="complete-task" data-id="${esc(t.id)}" aria-label="Complete task"></div>`).join('');
  const examRows = upcoming.map(e => {
    const days = daysUntil(e.examDate);
    return `<div class="list-row"><div class="row-main"><div class="row-title">${esc(e.title)}</div><div class="row-sub">${formatDate(e.examDate)} · ${days === 0 ? 'Today' : `${days} days left`}</div></div><span class="badge ${days <= 7 ? 'warning' : ''}">${days}d</span></div>`;
  }).join('');
  const subjectRows = perSubject.slice(0,6).map(s => `
    <div class="list-row" style="display:block"><div class="progress-meta"><span><i class="subject-dot" style="background:${esc(s.color || '#4267D5')}"></i>${esc(s.name)}</span><b>${s.progress}%</b></div>${progressBar(s.progress)}</div>`).join('');
  const weekBars = week.map(w => {
    const max = Math.max(1, ...week.map(x => x.minutes));
    const height = Math.max(3, w.minutes / max * 100);
    const label = new Date(`${w.date}T00:00:00`).toLocaleDateString(undefined,{weekday:'short'}).slice(0,2);
    return `<div class="chart-bar-wrap"><span class="chart-value">${w.minutes ? `${Math.round(w.minutes/60*10)/10}h` : ''}</span><div class="chart-bar" style="height:${height}%"></div><span class="chart-day">${label}</span></div>`;
  }).join('');
  return `
  <div class="page-heading"><div><h2>Good ${greeting} 👋</h2><p>Here's your academic overview for today.</p></div><button class="btn btn-primary" data-action="quick-add">＋ Add task</button></div>
  <div class="grid stats-grid">
    <div class="card stat-card"><div><div class="stat-label">Subjects</div><div class="stat-value">${subjects.length}</div><div class="stat-note">Your active subjects</div></div><div class="stat-icon">▤</div></div>
    <div class="card stat-card"><div><div class="stat-label">Pending tasks</div><div class="stat-value">${pending.length}</div><div class="stat-note">${today.length} due today</div></div><div class="stat-icon">☑</div></div>
    <div class="card stat-card"><div><div class="stat-label">Topics completed</div><div class="stat-value">${d.done}<span class="muted" style="font-size:14px"> / ${d.total}</span></div><div class="stat-note">${d.overall}% syllabus progress</div></div><div class="stat-icon">◉</div></div>
    <div class="card stat-card"><div><div class="stat-label">Study time</div><div class="stat-value">${minutesLabel(totalMinutes)}</div><div class="stat-note">Total recorded sessions</div></div><div class="stat-icon">◷</div></div>
  </div>
  <div class="grid two-col section">
    <section class="card"><div class="section-heading"><h3>Today's tasks</h3><a href="#/tasks">View all →</a></div>${today.length ? `<div class="list">${taskRows}</div>` : emptyState('☀️',"You're clear for today",'No tasks are due today. Add a task or use this time to study.','<button class="btn btn-primary" data-action="quick-add">Add a task</button>')}</section>
    <section class="card"><div class="section-heading"><h3>Upcoming exams</h3><a href="#/exams">View all →</a></div>${upcoming.length ? `<div class="list">${examRows}</div>` : emptyState('📅','No upcoming exams','Add an examination to start your countdown.','<button class="btn" data-route="exams">Add exam</button>')}</section>
  </div>
  <div class="grid two-col section">
    <section class="card"><div class="section-heading"><h3>Subject progress</h3><a href="#/subjects">Manage subjects →</a></div>${perSubject.length ? `<div class="list">${subjectRows}</div>` : emptyState('📚','Your subjects will appear here','Create a subject and add syllabus topics to track your progress.','<button class="btn btn-primary" data-route="subjects">Add subject</button>')}</section>
    <section class="card"><div class="section-heading"><h3>This week</h3><span class="muted small">Study minutes</span></div><div class="chart-bars">${weekBars}</div><p class="muted small" style="margin-top:12px">Record a study session in the planner to build your weekly summary.</p></section>
  </div>`;
}
