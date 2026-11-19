import {getAll,getByIndex,getRecord,putRecord,deleteRecord} from '../db.js';
export const studyRepository={all:()=>getAll('studySessions'),get:id=>getRecord('studySessions',id),save:record=>putRecord('studySessions',record),remove:id=>deleteRecord('studySessions',id),by:(index,value)=>getByIndex('studySessions',index,value)};
