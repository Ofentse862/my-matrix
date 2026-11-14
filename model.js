/* Shared state rules. Also loaded by the dependency-free verification script. */
(function(root){
  'use strict';
  const quadrants = [
    {id:'do', title:'Do first', description:'Important · urgent'},
    {id:'plan', title:'Schedule', description:'Important · not urgent'},
    {id:'delegate', title:'Delegate', description:'Not important · urgent'},
    {id:'later', title:'Set aside', description:'Not important · not urgent'}
  ];
  function localDate(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function quadrant(important,urgent){return important?(urgent?'do':'plan'):(urgent?'delegate':'later');}
  function validate(value){
    if(!value||value.version!==1||!Array.isArray(value.tasks)||value.tasks.length>10000)throw Error('Invalid backup');
    const ids=new Set();
    const tasks=value.tasks.map(t=>{
      if(!t||typeof t.id!=='string'||!t.id||t.id.length>120||ids.has(t.id)||typeof t.title!=='string'||!t.title.trim()||t.title.length>200||typeof t.step!=='string'||t.step.length>300||!quadrants.some(q=>q.id===t.q)||![0,5,10,15,25,45,60].includes(t.minutes)||!(t.selected===null||typeof t.selected==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(t.selected))||!(t.done===null||typeof t.done==='string'&&!isNaN(Date.parse(t.done))))throw Error('Invalid task');
      ids.add(t.id);
      return {id:t.id,title:t.title.trim(),step:t.step,q:t.q,minutes:t.minutes,selected:t.selected,done:t.done};
    });
    return {version:1,tasks};
  }
  function dailyTasks(tasks,date=localDate()){return tasks.filter(t=>!t.done&&t.selected===date);}
  const model={quadrants,localDate,quadrant,validate,dailyTasks};
  if(typeof module!=='undefined'&&module.exports)module.exports=model;
  else root.MatrixModel=model;
})(typeof window!=='undefined'?window:globalThis);
