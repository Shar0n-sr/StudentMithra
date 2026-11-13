import {DB_NAME,DB_VERSION,STORES} from '../config/constants.js';
import {STORE_DEFINITIONS} from './schema.js';
let connection;
export function openDB(){
 if(connection) return Promise.resolve(connection);
 return new Promise((resolve,reject)=>{
  const request=indexedDB.open(DB_NAME,DB_VERSION);
  request.onupgradeneeded=()=>{const db=request.result;for(const [name,def] of Object.entries(STORE_DEFINITIONS)){const store=db.objectStoreNames.contains(name)?request.transaction.objectStore(name):db.createObjectStore(name,{keyPath:def.keyPath});for(const [index,key,options] of def.indexes)if(!store.indexNames.contains(index))store.createIndex(index,key,options);}};
  request.onsuccess=()=>{connection=request.result;connection.onversionchange=()=>{connection.close();connection=null;};resolve(connection);};
  request.onerror=()=>reject(new Error('Unable to open local database. Your browser may have blocked storage.'));
  request.onblocked=()=>reject(new Error('Database upgrade is blocked by another open StudentMithra tab. Close other tabs and retry.'));
 });
}
export async function transact(storeNames,mode,work){
 const db=await openDB();return new Promise((resolve,reject)=>{
  let result;const tx=db.transaction(storeNames,mode);tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(new Error('The database operation could not be completed.'));tx.onabort=()=>reject(tx.error||new Error('The database transaction was cancelled.'));
  try{result=work(tx);}catch(error){try{tx.abort();}catch{}reject(error);}
 });
}
export async function getAll(store){const db=await openDB();return new Promise((resolve,reject)=>{const r=db.transaction(store,'readonly').objectStore(store).getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
export async function getByIndex(store,index,value){const db=await openDB();return new Promise((resolve,reject)=>{const r=db.transaction(store,'readonly').objectStore(store).index(index).getAll(value);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
export async function getRecord(store,id){const db=await openDB();return new Promise((resolve,reject)=>{const r=db.transaction(store,'readonly').objectStore(store).get(id);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error);});}
export async function putRecord(store,record){await transact([store],'readwrite',tx=>tx.objectStore(store).put(record));return record;}
export async function deleteRecord(store,id){await transact([store],'readwrite',tx=>tx.objectStore(store).delete(id));}
export async function clearStores(names=STORES){await transact(names,'readwrite',tx=>names.forEach(name=>tx.objectStore(name).clear()));}
