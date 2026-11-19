import {APP_VERSION,DB_VERSION,STORES} from '../config/constants.js';
import {getAll,transact} from '../data/db.js';
import {validateBackup} from '../utils/validators.js';
export async function exportBackup(){const stores={};for(const name of STORES)stores[name]=await getAll(name);return {format:'StudentMithraBackup',applicationVersion:APP_VERSION,databaseVersion:DB_VERSION,exportedAt:new Date().toISOString(),stores};}
export async function downloadBackup(){const data=await exportBackup();const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`studentmithra-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);}
export async function restoreBackup(data){validateBackup(data);const names=STORES;await transact(names,'readwrite',tx=>{for(const name of names){const store=tx.objectStore(name);store.clear();for(const row of data.stores[name])store.put(row);}});}
