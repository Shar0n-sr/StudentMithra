export const STORE_DEFINITIONS={
 subjects:{keyPath:'id',indexes:[['name','name',{unique:false}],['code','code',{unique:false}]]},
 modules:{keyPath:'id',indexes:[['subjectId','subjectId',{unique:false}],['position','position',{unique:false}]]},
 topics:{keyPath:'id',indexes:[['moduleId','moduleId',{unique:false}],['completed','completed',{unique:false}]]},
 tasks:{keyPath:'id',indexes:[['subjectId','subjectId',{unique:false}],['dueDate','dueDate',{unique:false}],['status','status',{unique:false}],['priority','priority',{unique:false}]]},
 exams:{keyPath:'id',indexes:[['subjectId','subjectId',{unique:false}],['examDate','examDate',{unique:false}]]},
 studySessions:{keyPath:'id',indexes:[['subjectId','subjectId',{unique:false}],['date','date',{unique:false}]]},
 settings:{keyPath:'id',indexes:[]}
};
