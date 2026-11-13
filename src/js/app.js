import {APP_VERSION,NAV,STORES} from './config/constants.js';
import {subjectRepository} from './data/repositories/subjectRepository.js';
import {taskRepository} from './data/repositories/taskRepository.js';
import {examRepository} from './data/repositories/examRepository.js';
import {studyRepository} from './data/repositories/studyRepository.js';
import {moduleRepository,topicRepository,deleteSubjectCascade,deleteModuleCascade} from './data/repositories/academicRepository.js';
import {getSettings,saveSettings} from './data/repositories/settingsRepository.js';
import {getAnalytics} from './services/analyticsService.js';
import {downloadBackup,restoreBackup} from './services/backupService.js';
import {createId} from './utils/idGenerator.js';
import {required,validDate,positiveNumber,oneOf} from './utils/validators.js';
import {todayISO} from './utils/dateUtils.js';
import {esc,option} from './utils/html.js';
import {toast,openModal,closeModal,confirmAction} from './components/notifications.js';
import {renderSidebar} from './components/sidebar.js';import {renderBottomNav} from './components/bottomNav.js';import {renderHeader} from './components/header.js';
import {dashboardPage} from './pages/dashboard.js';import {subjectsPage} from './pages/subjects.js';import {subjectDetailsPage} from './pages/subjectDetails.js';import {tasksPage} from './pages/tasks.js';import {plannerPage} from './pages/planner.js';import {examsPage} from './pages/exams.js';import {analyticsPage} from './pages/analytics.js';import {settingsPage} from './pages/settings.js';
import {currentRoute,navigate,initRouter} from './router.js';
let state={query:'',filter:'All',plannerStart:todayISO(),plannerEnd:null};
const $=s=>document.querySelector(s);
const subjectOptions=(subjects,selected,allowEmpty=true)=>`${allowEmpty?'<option value="">No subject selected</option>':''}${subjects.map(s=>option(s.id,s.name,selected)).join('')}`;
function formShell(title,body,submit='Save'){return `<h2 class="modal-title">${title}</h2><form data-form="record">${body}<div class="form-actions"><button type="button" class="btn" data-action="close-modal">Cancel</button><button class="btn btn-primary" type="submit">${submit}</button></div></form>`;}
function field(label,name,value='',type='text',extra=''){return `<div class="field"><label for="f-${name}">${label}</label><input id="f-${name}" name="${name}" type="${type}" value="${esc(value)}" ${extra}></div>`;}
function selectField(label,name,items,value){return `<div class="field"><label for="f-${name}">${label}</label><select id="f-${name}" name="${name}">${items.map(([v,l])=>option(v,l,value)).join('')}</select></div>`;}
function textareaField(label,name,value=''){return `<div class="field"><label for="f-${name}">${label}</label><textarea id="f-${name}" name="${name}">${esc(value)}</textarea></div>`;}
async function openForm(type,id=null,extra={}){
 const [subjects,settings]=await Promise.all([subjectRepository.all(),getSettings()]);let record=null;
 const repos={subject:subjectRepository,task:taskRepository,exam:examRepository,session:studyRepository,module:moduleRepository,topic:topicRepository};
 if(id&&repos[type])record=await repos[type].get?.(id) || (type==='module'? (await moduleRepository.all()).find(x=>x.id===id):type==='topic'?(await topicRepository.all()).find(x=>x.id===id):null);
 let html='',title='';
 if(type==='subject'){title=record?'Edit subject':'Add subject';html=formShell(title,field('Subject name','name',record?.name||'','text','required')+field('Subject code (optional)','code',record?.code||'')+`<div class="field"><label for="f-color">Subject colour</label><input id="f-color" name="color" type="color" value="${esc(record?.color||'#4267D5')}"></div>`);}
 if(type==='module'){title=record?'Edit module':'Add module';html=formShell(title,field('Module title','title',record?.title||'','text','required')+`<input type="hidden" name="subjectId" value="${esc(record?.subjectId||extra.subjectId||'')}">`);}
 if(type==='topic'){title=record?'Edit topic':'Add topic';html=formShell(title,field('Topic name','title',record?.title||'','text','required')+`<input type="hidden" name="moduleId" value="${esc(record?.moduleId||extra.moduleId||'')}">`);}
 if(type==='task'){title=record?'Edit task':'Add task';html=formShell(title,field('Task title','title',record?.title||'','text','required')+textareaField('Description','description',record?.description||'')+selectField('Subject','subjectId',[['','No subject'],...subjects.map(s=>[s.id,s.name])],record?.subjectId||'')+`<div class="field-row">${field('Due date','dueDate',record?.dueDate||todayISO(),'date','required')}${selectField('Priority','priority',[['Low','Low'],['Medium','Medium'],['High','High']],record?.priority||'Medium')}</div>`+selectField('Status','status',[['Pending','Pending'],['In Progress','In Progress'],['Completed','Completed']],record?.status||'Pending'));}
 if(type==='exam'){title=record?'Edit examination':'Add examination';html=formShell(title,field('Examination title','title',record?.title||'','text','required')+selectField('Subject','subjectId',subjects.map(s=>[s.id,s.name]),record?.subjectId||'')+`<div class="field-row">${field('Exam date','examDate',record?.examDate||todayISO(),'date','required')}${field('Exam time','examTime',record?.examTime||'','time')}</div>`+textareaField('Notes','notes',record?.notes||''));}
 if(type==='session'){title=record?'Edit study session':'Record study session';html=formShell(title,selectField('Subject','subjectId',[['','Independent study'],...subjects.map(s=>[s.id,s.name])],record?.subjectId||'')+`<div class="field-row">${field('Study date','date',record?.date||todayISO(),'date','required')}${field('Duration (minutes)','durationMinutes',record?.durationMinutes||'60','number','min="1" required')}</div><div class="field-row">${field('Start time (optional)','startTime',record?.startTime||'','time')}${field('End time (optional)','endTime',record?.endTime||'','time')}</div>`+textareaField('Notes (optional)','notes',record?.notes||''));}
 if(!html)return;
 openModal(html);const form=$('#dialog-content form');form.dataset.type=type;form.dataset.id=id||'';
}
async function saveForm(form){const type=form.dataset.type,id=form.dataset.id||null,data=Object.fromEntries(new FormData(form));const now=new Date().toISOString();let row;
 if(type==='subject'){const name=required(data.name,'Subject name');const all=await subjectRepository.all();if(all.some(x=>x.id!==id&&x.name.toLocaleLowerCase()===name.toLocaleLowerCase()))throw new Error('A subject with this name already exists.');row={id:id||createId(),name,code:data.code.trim(),color:/^#[0-9a-f]{6}$/i.test(data.color)?data.color:'#4267D5',createdAt:id?(await subjectRepository.get(id)).createdAt:now,updatedAt:now};await subjectRepository.save(row);}
 if(type==='module'){const subjectId=required(data.subjectId,'Subject'),title=required(data.title,'Module title'),all=await moduleRepository.all();if(all.some(x=>x.id!==id&&x.subjectId===subjectId&&x.title.toLocaleLowerCase()===title.toLocaleLowerCase()))throw new Error('This module already exists in the selected subject.');const old=all.find(x=>x.id===id);row={id:id||createId(),subjectId,title,position:old?.position??Date.now(),createdAt:old?.createdAt||now};await moduleRepository.save(row);}
 if(type==='topic'){const moduleId=required(data.moduleId,'Module'),title=required(data.title,'Topic name'),all=await topicRepository.all();if(all.some(x=>x.id!==id&&x.moduleId===moduleId&&x.title.toLocaleLowerCase()===title.toLocaleLowerCase()))throw new Error('This topic already exists in the selected module.');const old=all.find(x=>x.id===id);row={id:id||createId(),moduleId,title,completed:old?.completed||false,completedAt:old?.completedAt||null};await topicRepository.save(row);}
 if(type==='task'){row={id:id||createId(),title:required(data.title,'Task title'),description:data.description.trim(),subjectId:data.subjectId||null,dueDate:validDate(data.dueDate,'Due date'),priority:oneOf(data.priority,['Low','Medium','High'],'Priority'),status:oneOf(data.status,['Pending','In Progress','Completed'],'Status'),createdAt:id?(await taskRepository.get(id)).createdAt:now,updatedAt:now};await taskRepository.save(row);}
 if(type==='exam'){row={id:id||createId(),title:required(data.title,'Examination title'),subjectId:required(data.subjectId,'Subject'),examDate:validDate(data.examDate,'Exam date'),examTime:data.examTime,notes:data.notes.trim()};await examRepository.save(row);}
 if(type==='session'){row={id:id||createId(),subjectId:data.subjectId||null,date:validDate(data.date,'Study date'),durationMinutes:positiveNumber(data.durationMinutes,'Study duration'),startTime:data.startTime,endTime:data.endTime,notes:data.notes.trim(),createdAt:id?(await studyRepository.get(id)).createdAt:now};await studyRepository.save(row);}
 closeModal();toast(id?'Changes saved':'Added successfully');await render();
}
async function render(){const {route,id}=currentRoute();try{const [d,preferences]=await Promise.all([getAnalytics(),getSettings()]);document.documentElement.dataset.dateFormat=preferences.dateFormat||'medium';renderSidebar(route==='subjectDetails'?'subjects':route);renderBottomNav(route==='subjectDetails'?'subjects':route);renderHeader(route,navigator.onLine);const main=$('#main-content');
 if(route==='dashboard')main.innerHTML=dashboardPage(d);
 else if(route==='subjects')main.innerHTML=subjectsPage({...d,query:state.query});
 else if(route==='subjectDetails'){const subject=d.subjects.find(s=>s.id===id);if(!subject){navigate('subjects');return;}const modules=d.modules.filter(m=>m.subjectId===id);const topics=d.topics.filter(t=>modules.some(m=>m.id===t.moduleId));main.innerHTML=subjectDetailsPage({subject,modules,topics,progress:topics.length?Math.round(topics.filter(t=>t.completed).length/topics.length*100):0});}
 else if(route==='tasks')main.innerHTML=tasksPage({...d,query:state.query,filter:state.filter});
 else if(route==='planner'){const start=state.plannerStart||todayISO(),end=state.plannerEnd||(()=>{const x=new Date(`${start}T00:00:00`);x.setDate(x.getDate()+6);return x.toISOString().slice(0,10)})();main.innerHTML=plannerPage({...d,date:start,endDate:end});}
 else if(route==='exams')main.innerHTML=examsPage(d);
 else if(route==='analytics')main.innerHTML=analyticsPage(d);
 else if(route==='settings'){const settings=await getSettings();main.innerHTML=settingsPage(settings);document.body.classList.toggle('dark',settings.theme==='dark');}
 else{navigate('dashboard');return;}
 }catch(error){console.error(error);$('#main-content').innerHTML=`<div class="card"><h2>We couldn't load this page</h2><p class="muted">${esc(error.message)}</p><button class="btn" data-action="retry">Try again</button></div>`;toast(error.message,'error');}}
function goDetails(id){navigate(`subjectDetails/${id}`);}
async function deleteBy(type,id){if(!confirmAction('Delete this item? This action cannot be undone.'))return;
 if(type==='subject')await deleteSubjectCascade(id);if(type==='module')await deleteModuleCascade(id);if(type==='topic')await topicRepository.remove(id);if(type==='task')await taskRepository.remove(id);if(type==='exam')await examRepository.remove(id);if(type==='session')await studyRepository.remove(id);toast('Deleted');await render();}
async function handleAction(action,el){const id=el.dataset.id;
 if(action==='quick-add'||action==='add-task')return openForm('task');
 if(action==='add-subject')return openForm('subject');if(action==='edit-subject')return openForm('subject',id);if(action==='delete-subject')return deleteBy('subject',id);if(action==='open-subject')return goDetails(id);
 if(action==='add-module')return openForm('module',null,{subjectId:el.dataset.subject});if(action==='edit-module')return openForm('module',id);if(action==='delete-module')return deleteBy('module',id);
 if(action==='add-topic')return openForm('topic',null,{moduleId:id});if(action==='edit-topic')return openForm('topic',id);if(action==='delete-topic')return deleteBy('topic',id);
 if(action==='edit-task')return openForm('task',id);if(action==='delete-task')return deleteBy('task',id);
 if(action==='add-exam')return openForm('exam');if(action==='edit-exam')return openForm('exam',id);if(action==='delete-exam')return deleteBy('exam',id);
 if(action==='add-session')return openForm('session');if(action==='edit-session')return openForm('session',id);if(action==='delete-session')return deleteBy('session',id);
 if(action==='close-modal')return closeModal();if(action==='retry')return render();
 if(action==='export-backup'){try{await downloadBackup();toast('Backup exported');}catch(e){toast(e.message,'error');}}
 if(action==='import-backup'){const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.onchange=async()=>{const file=input.files?.[0];if(!file)return;if(file.size>10*1024*1024){toast('Backup file exceeds the 10 MB limit.','error');return;}try{const data=JSON.parse(await file.text());if(!confirmAction('Restore this backup? Existing StudentMithra records will be replaced. Export a backup first if you want to keep them.'))return;await restoreBackup(data);toast('Backup restored successfully');await render();}catch(e){toast(e.message||'Could not restore this backup.','error');}};input.click();}
 if(action==='clear-data'){if(!confirmAction('Permanently delete ALL StudentMithra data from this browser? Export a backup first if needed.'))return;const {clearStores}=await import('./data/db.js');await clearStores(STORES);toast('All application data cleared');await render();}
}
document.addEventListener('click',async event=>{const route=event.target.closest('[data-route]');if(route){event.preventDefault();state.query='';navigate(route.dataset.route);return;}const button=event.target.closest('[data-action]');if(button){if(button.matches('input[type=checkbox]'))return;event.preventDefault();try{await handleAction(button.dataset.action,button);}catch(e){console.error(e);toast(e.message||'Something went wrong.','error');}}});
document.addEventListener('submit',async event=>{if(event.target.matches('[data-form="record"]')){event.preventDefault();const submit=event.target.querySelector('[type="submit"]');if(submit.disabled)return;submit.disabled=true;try{await saveForm(event.target);}catch(e){toast(e.message,'error');submit.disabled=false;}}});
document.addEventListener('change',async event=>{const el=event.target;try{
 if(el.dataset.action==='complete-task'){const task=await taskRepository.get(el.dataset.id);if(task){task.status=el.checked?'Completed':'Pending';task.updatedAt=new Date().toISOString();await taskRepository.save(task);toast(el.checked?'Task completed':'Task reopened');await render();}}
 if(el.dataset.action==='toggle-topic'){const topic=await topicRepository.byModule((await topicRepository.all()).find(t=>t.id===el.dataset.id)?.moduleId);const item=topic.find(t=>t.id===el.dataset.id);if(item){item.completed=el.checked;item.completedAt=el.checked?new Date().toISOString():null;await topicRepository.save(item);await render();}}
 if(el.id==='task-filter'){state.filter=el.value;await render();}
 if(el.id==='planner-start'){state.plannerStart=el.value;await render();}if(el.id==='planner-end'){state.plannerEnd=el.value;await render();}
 if(el.id==='setting-theme'||el.id==='setting-week'||el.id==='setting-date'){const settings=await getSettings();if(el.id==='setting-theme')settings.theme=el.value;if(el.id==='setting-week')settings.weekStartsOn=Number(el.value);if(el.id==='setting-date')settings.dateFormat=el.value;await saveSettings(settings);document.body.classList.toggle('dark',settings.theme==='dark');toast('Preference saved');}
 }catch(e){toast(e.message,'error');}});
document.addEventListener('input',async event=>{if(event.target.id==='subject-search'||event.target.id==='task-search'){const el=event.target;state.query=el.value;const pos=el.selectionStart;await render();const next=document.getElementById(el.id);if(next){next.focus();next.setSelectionRange(pos,pos);}}});
window.addEventListener('online',()=>{renderHeader(currentRoute().route,true);toast('You are back online');});window.addEventListener('offline',()=>{renderHeader(currentRoute().route,false);toast('Offline mode is active');});
async function init(){try{await import('./data/db.js').then(m=>m.openDB());const settings=await getSettings();document.body.classList.toggle('dark',settings.theme==='dark');if(!location.hash)location.hash='/dashboard';initRouter(render);await render();if('serviceWorker'in navigator&&location.protocol!=='file:'){navigator.serviceWorker.register('./sw.js').catch(e=>console.warn('Service worker registration failed',e));}}catch(error){console.error(error);$('#main-content').innerHTML=`<div class="card"><h2>StudentMithra could not start</h2><p class="muted">${esc(error.message)}</p><p class="muted small">Use a local HTTP server or HTTPS. Opening index.html directly as a file is not supported because IndexedDB modules and service workers require a secure origin.</p></div>`;}}
init();
