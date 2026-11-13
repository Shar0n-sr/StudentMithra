export function toast(message,type='success'){const region=document.querySelector('#toast-region');const node=document.createElement('div');node.className=`toast ${type==='error'?'error':''}`;node.textContent=message;region.append(node);setTimeout(()=>node.remove(),3200);}
export function openModal(html){const dialog=document.querySelector('#app-dialog');document.querySelector('#dialog-content').innerHTML=html;dialog.showModal();}
export function closeModal(){document.querySelector('#app-dialog').close();document.querySelector('#dialog-content').replaceChildren();}
export function confirmAction(message){return window.confirm(message);}
