'use strict';
const $=id=>document.getElementById(id);
const {quadrants,localDate,quadrant,validate,dailyTasks}=MatrixModel;
// Keep the previous key so an early prototype's tasks migrate without being lost.
const KEY='a-little-order-v1',THEME_KEY='matrix-theme';
let state={version:1,tasks:[]},day=localDate(),view='matrix',editId=null;
let theme='dark',toastTimer,undoAction=null,unreadable=null,lastSaved=null;
let focusId=null,timer=null,endAt=0,remaining=0;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=name=>`<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
const qInfo=id=>quadrants.find(q=>q.id===id);
function notify(message,undo=null){
  clearTimeout(toastTimer);undoAction=undo;$('toast-text').textContent=message;
  $('toast-undo').hidden=!undo;$('toast').hidden=false;
  toastTimer=setTimeout(()=>{$('toast').hidden=true;undoAction=null;},undo?10000:6000);
}
$('toast-undo').onclick=()=>{const action=undoAction;$('toast').hidden=true;undoAction=null;clearTimeout(toastTimer);if(action)action();};
function storageWarning(message){$('storage-status').hidden=false;$('storage-status').textContent=message;}
try{
  lastSaved=localStorage.getItem(KEY);
  if(lastSaved)state=validate(JSON.parse(lastSaved));
  const savedTheme=localStorage.getItem(THEME_KEY);
  if(['light','dark','system'].includes(savedTheme))theme=savedTheme;
}catch(error){
  if(lastSaved){unreadable=lastSaved;$('recover-storage').hidden=false;storageWarning('Saved data could not be read. Your original data is protected. Download it in Settings, or restore a valid backup.');}
  else storageWarning('Device storage is unavailable. Tasks will last only for this session. Download a backup before closing.');
}
function applyTheme(){
  const chosen=theme==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):theme;
  document.documentElement.dataset.theme=chosen;
  $('theme-color').content=chosen==='dark'?'#212121':'#ffffff';
  document.querySelectorAll('[data-theme-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.themeChoice===theme)));
}
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(theme==='system')applyTheme();});
// Save the complete next state before updating the screen. Never overwrite unreadable data.
function commit(next,{allowRecovery=false}={}){
  if(unreadable&&!allowRecovery){notify('Restore a backup in Settings before changing saved tasks.');return false;}
  try{
    const current=localStorage.getItem(KEY);
    if(current!==lastSaved&&!allowRecovery){
      state=current?validate(JSON.parse(current)):{version:1,tasks:[]};lastSaved=current;
      render();notify('Tasks changed in another window. Review them and try again.');return false;
    }
    const raw=JSON.stringify(next);localStorage.setItem(KEY,raw);lastSaved=raw;
    state=next;unreadable=null;$('recover-storage').hidden=true;$('storage-status').hidden=true;
  }catch(error){
    if(unreadable&&!allowRecovery)return false;
    state=next;storageWarning('Changes are only in memory: saving failed. Download a backup before closing this app.');notify('Could not save on this device. Download a backup.');
  }
  render();return true;
}
function updateTask(id,values){return commit({...state,tasks:state.tasks.map(t=>t.id===id?{...t,...values}:t)});}
function complete(id){
  const task=state.tasks.find(t=>t.id===id);if(!task)return;
  const before={done:task.done,selected:task.selected};
  if(updateTask(id,{done:new Date().toISOString()})){notify('Task completed.',()=>updateTask(id,before));return true;}
  return false;
}
function taskHTML(t){
  const picked=t.selected===day;
  return `<article class="task"><div class="task-main"><button class="check" data-action="complete" data-id="${esc(t.id)}" aria-label="Complete ${esc(t.title)}"></button><button class="task-open" data-action="edit" data-id="${esc(t.id)}" aria-label="Edit ${esc(t.title)}">${esc(t.title)}</button></div>${t.step?`<p class="task-step">${esc(t.step)}</p>`:''}<div class="task-actions"><button data-action="pick" data-id="${esc(t.id)}" aria-pressed="${picked}">${picked?'Today ✓':'+ Today'}</button><button class="icon-button" data-action="focus" data-id="${esc(t.id)}" aria-label="Focus on ${esc(t.title)}">${icon('arrow')}</button></div></article>`;
}
function previewHTML(t){return `<div class="preview-task"><button class="check" data-action="complete" data-id="${esc(t.id)}" aria-label="Complete ${esc(t.title)}"></button><button class="preview-title" data-action="focus" data-id="${esc(t.id)}"><span>${esc(t.title)}</span>${icon('arrow')}</button></div>`;}
function todayHTML(t){return `<article class="today-card"><div class="card-top"><h2>${esc(t.title)}</h2><button class="icon-button" data-action="edit" data-id="${esc(t.id)}" aria-label="Edit ${esc(t.title)}">${icon('more')}</button></div><span class="category">${esc(qInfo(t.q).title)}</span>${t.step?`<p>${esc(t.step)}</p>`:''}<div class="card-actions"><button class="primary-button" data-action="focus" data-id="${esc(t.id)}">Begin${t.minutes?` · ${t.minutes} min`:''}</button><button class="text-button" data-action="pick" data-id="${esc(t.id)}" aria-label="Remove ${esc(t.title)} from today">Remove</button></div></article>`;}
function render(){
  day=localDate();const date=new Date().toLocaleDateString('en-ZA',{weekday:'long',day:'numeric',month:'long'});
  $('date').textContent=date;$('today-date').textContent=date;
  const active=state.tasks.filter(t=>!t.done),picked=dailyTasks(state.tasks,day);
  $('preview-count').textContent=picked.length||'';
  $('today-preview-list').innerHTML=picked.length?picked.slice(0,2).map(previewHTML).join(''):'<p class="preview-empty">Use “+ Today” on a task to bring it here.</p>';
  if(picked.length>2)$('today-preview-list').innerHTML+=`<button class="text-button" data-view="today">${picked.length-2} more for today →</button>`;
  $('matrix').innerHTML=quadrants.map(q=>{
    const tasks=active.filter(t=>t.q===q.id);
    return `<section class="quadrant" aria-labelledby="q-${q.id}"><div class="quadrant-header"><h2 id="q-${q.id}">${q.title}</h2><span class="q-count">${tasks.length||''}</span></div><p class="classification">${q.description}</p><div>${tasks.length?tasks.map(taskHTML).join(''):'<p class="qempty">No tasks here.</p>'}</div><button class="q-add" data-add="${q.id}" aria-label="Add to ${q.title}">${icon('plus')} Add task</button></section>`;
  }).join('');
  $('today-list').innerHTML=picked.length?picked.map(todayHTML).join(''):'<div class="empty-block"><h2>Nothing chosen yet.</h2><p>Your tasks are still in the matrix. Choose what you want to work on today.</p></div>';
  $('tab-count').hidden=!picked.length;$('tab-count').textContent=picked.length;
  renderHistory();
}
function renderHistory(){
  const completed=state.tasks.filter(t=>t.done).sort((a,b)=>new Date(b.done)-new Date(a.done));
  $('history-list').innerHTML=completed.length?completed.map(t=>`<article class="history-card"><h2>${esc(t.title)}</h2><p>${esc(new Date(t.done).toLocaleDateString('en-ZA',{day:'numeric',month:'long',year:'numeric'}))} · ${qInfo(t.q).title}</p><button class="text-button" data-action="restore" data-id="${esc(t.id)}">Return to matrix</button></article>`).join(''):'<div class="empty-block"><h2>No completed tasks yet.</h2><p>Completed tasks will stay here. You can return them to your matrix.</p></div>';
}
function switchView(next){
  view=next;
  for(const name of ['matrix','today','done'])$(`${name}-view`).hidden=name!==view;
  document.querySelectorAll('.tabs [data-view]').forEach(b=>{if(b.dataset.view===view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  window.scrollTo({top:0,behavior:'instant'});
}
function updateDestination(){
  const q=qInfo(quadrant($('important').checked,$('urgent').checked));
  $('destination').textContent=q.title;$('save-task').textContent=editId?'Save changes':`Add to ${q.title}`;
}
function edit(id=null,q='plan',prefill=''){
  const task=state.tasks.find(t=>t.id===id);editId=task?.id||null;
  const selectedQ=task?.q||q;
  $('editor-title').textContent=task?'Edit task':'Add a task';$('title').value=task?.title||prefill;$('title').setCustomValidity('');
  $('step').value=task?.step||'';$('minutes').value=String(task?.minutes??10);
  $('important').checked=['do','plan'].includes(selectedQ);$('urgent').checked=['do','delegate'].includes(selectedQ);
  $('pick-today').checked=task?task.selected===localDate():view==='today';$('delete').hidden=!task;
  updateDestination();$('editor').showModal();$('title').focus();
}
$('important').onchange=updateDestination;$('urgent').onchange=updateDestination;
$('quick-form').onsubmit=e=>{e.preventDefault();edit(null,'plan',$('quick-title').value.trim());};
$('title').oninput=()=>$('title').setCustomValidity('');
$('task-form').onsubmit=e=>{
  e.preventDefault();const title=$('title').value.trim();
  if(!title){$('title').setCustomValidity('Enter a task name.');$('title').reportValidity();return;}
  const task=state.tasks.find(t=>t.id===editId);
  if(editId&&!task){notify('This task changed in another window. Close and reopen it.');return;}
  const values={title,step:$('step').value.trim(),q:quadrant($('important').checked,$('urgent').checked),minutes:Number($('minutes').value),selected:$('pick-today').checked?localDate():null};
  const next=editId?{...state,tasks:state.tasks.map(t=>t.id===editId?{...t,...values}:t)}:{...state,tasks:[...state.tasks,{id:crypto.randomUUID(),...values,done:null}]};
  if(commit(next)){$('editor').close();$('quick-title').value='';notify(editId?'Task updated.':'Task added.');}
};
$('delete').onclick=()=>{
  const task=state.tasks.find(t=>t.id===editId);if(!task)return;
  if(!confirm(`Delete “${task.title}”?`))return;
  if(commit({...state,tasks:state.tasks.filter(t=>t.id!==task.id)})){
    $('editor').close();notify('Task deleted.',()=>{if(!state.tasks.some(t=>t.id===task.id))commit({...state,tasks:[...state.tasks,task]});});
  }
};
document.addEventListener('click',e=>{
  const close=e.target.closest('[data-close]');if(close)$(close.dataset.close).close();
  const tab=e.target.closest('[data-view]');if(tab)switchView(tab.dataset.view);
  const add=e.target.closest('[data-add]');if(add)edit(null,add.dataset.add);
  const themeButton=e.target.closest('[data-theme-choice]');
  if(themeButton){theme=themeButton.dataset.themeChoice;applyTheme();try{localStorage.setItem(THEME_KEY,theme);}catch{notify('Appearance will only last for this session.');}}
  const action=e.target.closest('[data-action]');if(!action)return;
  const task=state.tasks.find(t=>t.id===action.dataset.id);if(!task)return;
  switch(action.dataset.action){
    case 'edit':edit(task.id);break;
    case 'focus':startFocus(task);break;
    case 'complete':complete(task.id);break;
    case 'pick':updateTask(task.id,{selected:task.selected===localDate()?null:localDate()});break;
    case 'restore':if(updateTask(task.id,{done:null,selected:null}))notify('Returned to matrix.');break;
  }
});
$('open-settings').onclick=()=>$('settings').showModal();
$('open-history').onclick=()=>switchView('done');
$('view-completed').onclick=()=>{$('settings').close();switchView('done');};
function download(text,name,type='application/json'){
  const url=URL.createObjectURL(new Blob([text],{type})),link=document.createElement('a');
  link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
}
$('export').onclick=()=>download(JSON.stringify(state,null,2),`my-matrix-${localDate()}.json`);
$('recover-storage').onclick=()=>download(unreadable||'',`my-matrix-unreadable-${localDate()}.txt`,'text/plain');
$('import').onchange=async e=>{
  const file=e.target.files[0];if(!file)return;
  try{
    if(file.size>10000000)throw Error('Too large');
    const data=validate(JSON.parse(await file.text()));
    if(confirm(`Replace your task list with ${data.tasks.length} tasks from this backup? Download a backup first if you want to keep the current list.`)){
      if(commit(data,{allowRecovery:true})){notify('Backup restored.');}
    }
  }catch{notify('This backup could not be read. Your tasks were not changed.');}
  e.target.value='';
};
function displayTime(){
  if(timer)remaining=Math.max(0,Math.ceil((endAt-Date.now())/1000));
  $('clock').textContent=`${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`;
  if(timer&&remaining===0){clearInterval(timer);timer=null;$('toggle-timer').textContent='Start again';$('timer-status').textContent='Time is up. Continue if you want to.';}
}
function startFocus(task){
  clearInterval(timer);timer=null;focusId=task.id;remaining=task.minutes*60;
  $('focus-category').textContent=qInfo(task.q).title;$('focus-title').textContent=task.title;
  $('focus-step').textContent=task.step;$('focus-step').hidden=!task.step;$('focus-step-label').hidden=!task.step;
  $('timer-area').hidden=!task.minutes;$('timer-status').textContent='';$('toggle-timer').textContent='Start';displayTime();$('focus-dialog').showModal();
}
$('toggle-timer').onclick=()=>{
  if(timer){remaining=Math.max(0,Math.ceil((endAt-Date.now())/1000));clearInterval(timer);timer=null;$('toggle-timer').textContent='Continue';}
  else{if(!remaining)remaining=(state.tasks.find(t=>t.id===focusId)?.minutes||10)*60;endAt=Date.now()+remaining*1000;timer=setInterval(displayTime,250);$('toggle-timer').textContent='Pause';}
  displayTime();
};
$('focus-dialog').addEventListener('close',()=>{clearInterval(timer);timer=null;});
$('finish-focus').onclick=()=>{if(complete(focusId))$('focus-dialog').close();};
// Refresh the local date on resume, including when the app stays open overnight.
setInterval(()=>{if(localDate()!==day)render();},15000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){render();if(timer)displayTime();}});
window.addEventListener('storage',e=>{
  if(e.key===KEY){
    try{state=e.newValue?validate(JSON.parse(e.newValue)):{version:1,tasks:[]};lastSaved=e.newValue;unreadable=null;render();if($('editor').open){$('editor').close();notify('Tasks changed in another window. Open the task again to edit.');}}
    catch{unreadable=e.newValue;storageWarning('Saved data changed and could not be read. Download your current task list before closing.');}
  }
  if(e.key===THEME_KEY&&['light','dark','system'].includes(e.newValue)){theme=e.newValue;applyTheme();}
});
applyTheme();render();
if('serviceWorker' in navigator&&location.protocol!=='file:'){
  navigator.serviceWorker.register('./sw.js').then(async registration=>{
    await navigator.serviceWorker.ready;$('offline-status').textContent='Offline access is ready on this device.';
    registration.addEventListener('updatefound',()=>{const worker=registration.installing;if(worker)worker.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)notify('An update is ready. Reopen the app to load it.');});});
  }).catch(()=>{$('offline-status').textContent='Offline setup failed. Reopen the hosted app while online to try again.';});
}else $('offline-status').textContent='Use your HTTPS website address to enable offline access.';
