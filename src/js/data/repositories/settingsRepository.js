import {getRecord,putRecord} from '../db.js';
const DEFAULT={id:'preferences',theme:'light',weekStartsOn:1,dateFormat:'medium',onboardingCompleted:true};
export async function getSettings(){return (await getRecord('settings','preferences'))||DEFAULT;}
export async function saveSettings(values){return putRecord('settings',{...DEFAULT,...values,id:'preferences'});}
