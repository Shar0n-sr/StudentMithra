import {subjectRepository} from '../data/repositories/subjectRepository.js';
import {taskRepository} from '../data/repositories/taskRepository.js';
import {examRepository} from '../data/repositories/examRepository.js';
import {studyRepository} from '../data/repositories/studyRepository.js';
import {moduleRepository,topicRepository} from '../data/repositories/academicRepository.js';
import {getSettings} from '../data/repositories/settingsRepository.js';
import {currentWeekDates} from '../utils/dateUtils.js';
export async function getAnalytics(){const [subjects,modules,topics,tasks,exams,sessions,settings]=await Promise.all([subjectRepository.all(),moduleRepository.all(),topicRepository.all(),taskRepository.all(),examRepository.all(),studyRepository.all(),getSettings()]);const done=topics.filter(t=>t.completed).length;const total=topics.length;const dates=currentWeekDates(settings.weekStartsOn);const week=dates.map(date=>({date,minutes:sessions.filter(s=>s.date===date).reduce((a,s)=>a+Number(s.durationMinutes||0),0)}));const perSubject=subjects.map(s=>{const ms=modules.filter(m=>m.subjectId===s.id);const ts=topics.filter(t=>ms.some(m=>m.id===t.moduleId));return {...s,total:ts.length,done:ts.filter(t=>t.completed).length,progress:ts.length?Math.round(ts.filter(t=>t.completed).length/ts.length*100):0};});return {subjects,modules,topics,tasks,exams,sessions,done,total,overall:total?Math.round(done/total*100):0,week,weekDates:dates,weekStartsOn:settings.weekStartsOn,perSubject,totalMinutes:sessions.reduce((a,s)=>a+Number(s.durationMinutes||0),0)};}
