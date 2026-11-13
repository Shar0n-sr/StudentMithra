import test from 'node:test';
import assert from 'node:assert/strict';
import {required,validDate,positiveNumber,oneOf,validateBackup} from '../src/js/utils/validators.js';

test('required rejects blank values and trims valid values',()=>{assert.throws(()=>required('  ','Task title'));assert.equal(required('  Study  ','Title'),'Study');});
test('validDate accepts real ISO dates only',()=>{assert.equal(validDate('2026-11-13'),'2026-11-13');assert.throws(()=>validDate('2026-02-30'));assert.throws(()=>validDate('13-11-2026'));});
test('positiveNumber rejects zero, negative and non-numeric values',()=>{assert.equal(positiveNumber('45','Duration'),45);for(const v of ['0','-1','abc'])assert.throws(()=>positiveNumber(v,'Duration'));});
test('oneOf restricts enumerated values',()=>{assert.equal(oneOf('High',['Low','Medium','High'],'Priority'),'High');assert.throws(()=>oneOf('Urgent',['Low','Medium','High'],'Priority'));});
test('backup validation checks all seven stores and record IDs',()=>{const names=['subjects','modules','topics','tasks','exams','studySessions','settings'];const stores=Object.fromEntries(names.map(n=>[n,[]]));assert.equal(validateBackup({format:'StudentMithraBackup',databaseVersion:1,stores}).format,'StudentMithraBackup');stores.tasks=[{title:'Missing ID'}];assert.throws(()=>validateBackup({format:'StudentMithraBackup',databaseVersion:1,stores}));});

test('backup validation rejects broken relationships and invalid statuses',()=>{
 const stores={subjects:[{id:'s1',name:'Maths',code:'M1',color:'#4267D5'}],modules:[{id:'m1',subjectId:'s1',title:'Algebra',position:1}],topics:[{id:'t1',moduleId:'m1',title:'Linear equations',completed:false}],tasks:[{id:'task1',title:'Homework',description:'',subjectId:'s1',dueDate:'2026-11-15',priority:'High',status:'Pending'}],exams:[],studySessions:[],settings:[]};
 const valid={format:'StudentMithraBackup',databaseVersion:1,stores};
 assert.equal(validateBackup(valid),valid);
 const broken=structuredClone(valid);broken.stores.modules[0].subjectId='missing';
 assert.throws(()=>validateBackup(broken),/missing subject/);
 const invalidTask=structuredClone(valid);invalidTask.stores.tasks[0].status='Urgent';
 assert.throws(()=>validateBackup(invalidTask),/task record/);
});
