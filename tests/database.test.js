// Run this file in a browser test harness with IndexedDB available.
import test from 'node:test';
import assert from 'node:assert/strict';
import {STORE_DEFINITIONS} from '../src/js/data/schema.js';

test('database schema declares all seven required object stores',()=>{
 assert.deepEqual(Object.keys(STORE_DEFINITIONS).sort(),['exams','modules','settings','studySessions','subjects','tasks','topics'].sort());
 for(const definition of Object.values(STORE_DEFINITIONS))assert.equal(definition.keyPath,'id');
});
