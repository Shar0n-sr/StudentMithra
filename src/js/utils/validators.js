export function required(value,label){if(!String(value??'').trim())throw new Error(`${label} is required.`);return String(value).trim();}
export function validDate(value,label='Date'){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))throw new Error(`Enter a valid ${label.toLowerCase()}.`);const [y,m,d]=value.split('-').map(Number);const date=new Date(y,m-1,d);if(date.getFullYear()!==y||date.getMonth()!==m-1||date.getDate()!==d)throw new Error(`Enter a valid ${label.toLowerCase()}.`);return value;}
export function positiveNumber(value,label){const n=Number(value);if(!Number.isFinite(n)||n<=0)throw new Error(`${label} must be greater than zero.`);return n;}
export function oneOf(value,allowed,label){if(!allowed.includes(value))throw new Error(`Choose a valid ${label.toLowerCase()}.`);return value;}
export function validateBackup(data){
 const names=['subjects','modules','topics','tasks','exams','studySessions','settings'];
 if(!data||typeof data!=='object'||data.format!=='StudentMithraBackup'||!Number.isInteger(data.databaseVersion)||!data.stores||typeof data.stores!=='object')throw new Error('This is not a valid StudentMithra backup.');
 if(data.databaseVersion>1)throw new Error('This backup was created by a newer StudentMithra version. Update the application before restoring it.');
 for(const name of names){if(!Array.isArray(data.stores[name]))throw new Error(`Backup is missing the ${name} collection.`);if(data.stores[name].length>20000)throw new Error(`The ${name} collection is too large.`);const ids=new Set();for(const row of data.stores[name]){if(!row||typeof row!=='object'||typeof row.id!=='string'||!row.id)throw new Error(`Invalid record found in ${name}.`);if(ids.has(row.id))throw new Error(`Duplicate record ID found in ${name}.`);ids.add(row.id);}}
 const {subjects,modules,topics,tasks,exams,studySessions,settings}=data.stores;
 const subjectIds=new Set(subjects.map(x=>x.id)),moduleIds=new Set(modules.map(x=>x.id));
 for(const x of subjects)if(typeof x.name!=='string'||!x.name.trim()||typeof x.code!=='string'||typeof x.color!=='string'||!/^#[0-9a-f]{6}$/i.test(x.color))throw new Error('A subject record in this backup is invalid.');
 for(const x of modules)if(typeof x.subjectId!=='string'||!subjectIds.has(x.subjectId)||typeof x.title!=='string'||!x.title.trim()||!Number.isFinite(Number(x.position)))throw new Error('A module record in this backup is invalid or references a missing subject.');
 for(const x of topics)if(typeof x.moduleId!=='string'||!moduleIds.has(x.moduleId)||typeof x.title!=='string'||!x.title.trim()||typeof x.completed!=='boolean')throw new Error('A topic record in this backup is invalid or references a missing module.');
 for(const x of tasks)if(typeof x.title!=='string'||!x.title.trim()||typeof x.description!=='string'||(x.subjectId!==null&&x.subjectId!==undefined&&!subjectIds.has(x.subjectId))||!['Low','Medium','High'].includes(x.priority)||!['Pending','In Progress','Completed'].includes(x.status))throw new Error('A task record in this backup is invalid.');else validDate(x.dueDate,'Due date');
 for(const x of exams)if(typeof x.subjectId!=='string'||!subjectIds.has(x.subjectId)||typeof x.title!=='string'||!x.title.trim()||typeof x.notes!=='string')throw new Error('An examination record in this backup is invalid.');else validDate(x.examDate,'Exam date');
 for(const x of studySessions)if((x.subjectId!==null&&x.subjectId!==undefined&&!subjectIds.has(x.subjectId))||!Number.isFinite(Number(x.durationMinutes))||Number(x.durationMinutes)<=0)throw new Error('A study session record in this backup is invalid.');else validDate(x.date,'Study date');
 for(const x of settings)if(x.id!=='preferences'||!['light','dark'].includes(x.theme)||![0,1].includes(x.weekStartsOn)||!['short','medium','long'].includes(x.dateFormat))throw new Error('The settings record in this backup is invalid.');
 return data;
}
