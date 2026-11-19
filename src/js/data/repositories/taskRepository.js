import {getAll,getByIndex,getRecord,putRecord,deleteRecord} from '../db.js';
export const taskRepository={all:()=>getAll('tasks'),get:id=>getRecord('tasks',id),save:record=>putRecord('tasks',record),remove:id=>deleteRecord('tasks',id),by:(index,value)=>getByIndex('tasks',index,value)};
