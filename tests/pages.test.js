import test from 'node:test';
import assert from 'node:assert/strict';
import {dashboardPage} from '../src/js/pages/dashboard.js';
import {subjectsPage} from '../src/js/pages/subjects.js';
import {tasksPage} from '../src/js/pages/tasks.js';
import {plannerPage} from '../src/js/pages/planner.js';
import {examsPage} from '../src/js/pages/exams.js';
import {analyticsPage} from '../src/js/pages/analytics.js';
import {settingsPage} from '../src/js/pages/settings.js';
const d={subjects:[],tasks:[],exams:[],perSubject:[],week:[],weekDates:[],sessions:[],totalMinutes:0,total:0,done:0,overall:0,modules:[],topics:[],filter:'All',query:'',date:'2026-11-13',endDate:'2026-11-19'};
test('all primary page renderers produce their screens for a new user',()=>{
 assert.match(dashboardPage(d),/Good (morning|afternoon|evening)/);
 assert.match(subjectsPage(d),/Your subjects/);
 assert.match(tasksPage(d),/Tasks & assignments/);
 assert.match(plannerPage(d),/Study planner/);
 assert.match(examsPage(d),/Examination tracker/);
 assert.match(analyticsPage(d),/Academic analytics/);
 assert.match(settingsPage({theme:'light',weekStartsOn:1,dateFormat:'medium'}),/Backup & restore/);
});
