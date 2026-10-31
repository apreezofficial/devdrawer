import test from 'node:test';
import assert from 'node:assert/strict';
import { randomInteger } from '../src/lib/random.ts';
import { toCsv,parseCsv } from '../src/lib/csv.ts';

test('CSV round-trips quoted cells for every supported delimiter',()=>{
 for(const delimiter of [',',';','\t','|']) {
   const rows=[{name:'Ada',city:`London${delimiter}UK`,note:'a "quote"\nand newline'}];
   assert.deepEqual(parseCsv(toCsv(rows,delimiter),delimiter),rows);
 }
});
test('random integers support wide, negative, and single-value ranges',()=>{
 for(const [lo,hi] of [[1,6],[-5000000000,5000000000],[Number.MIN_SAFE_INTEGER,Number.MAX_SAFE_INTEGER],[42,42]]) {
   for(let i=0;i<200;i++) {const n=randomInteger(lo,hi);assert.ok(Number.isSafeInteger(n)&&n>=lo&&n<=hi);}
 }
 for(const [lo,hi] of [[NaN,1],[0,Infinity],[0.5,10],[10,1]]) assert.throws(()=>randomInteger(lo,hi),RangeError);
});
