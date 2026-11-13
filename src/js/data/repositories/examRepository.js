import {getAll,getByIndex,getRecord,putRecord,deleteRecord} from '../db.js';
export const examRepository={all:()=>getAll('exams'),get:id=>getRecord('exams',id),save:record=>putRecord('exams',record),remove:id=>deleteRecord('exams',id),by:(index,value)=>getByIndex('exams',index,value)};
