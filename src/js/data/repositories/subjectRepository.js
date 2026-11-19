import {getAll,getByIndex,getRecord,putRecord,deleteRecord} from '../db.js';
export const subjectRepository={all:()=>getAll('subjects'),get:id=>getRecord('subjects',id),save:record=>putRecord('subjects',record),remove:id=>deleteRecord('subjects',id),by:(index,value)=>getByIndex('subjects',index,value)};
