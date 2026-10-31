import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { tools } from '../src/tools/registry.ts';
import { TOOL_INPUTS, encodeToolInput, decodeToolInput, validateToolSettings } from '../src/lib/tool-input.ts';
import { parseAIResponse } from '../src/lib/ai-response.ts';

import { examples } from './tool-cases.mjs';


test('every ready tool has a contract and editable tools have a regression example', () => {
  assert.deepEqual(Object.keys(TOOL_INPUTS).sort(), tools.filter(t=>t.status==='ready').map(t=>t.slug).sort());
  for (const [slug, contract] of Object.entries(TOOL_INPUTS)) {
    if (!Object.keys(contract.fields).length) { assert.ok(contract.upload); continue; }
    assert.ok(examples[slug], slug);
    const source = readFileSync(new URL(`../src/tools/impl/${slug}.tsx`,import.meta.url),'utf8');
    assert.ok(source.includes(`useToolInput("${slug}"`), `${slug} must handle incoming settings`);
  }
});
for (const [slug, settings] of Object.entries(examples)) {
  test(`${slug}: AI response preserves settings through the handoff`, () => {
    const response=parseAIResponse(JSON.stringify({reply:'Open this tool.',tool:slug,settings}));
    assert.equal(response.tool,slug);
    assert.ok(response.input);
    const applied=decodeToolInput(slug,response.input);
    for (const [key,value] of Object.entries(settings)) assert.deepEqual(applied[key],value);
    assert.equal(decodeToolInput(slug==='hash'?'base64':'hash',response.input),null);
  });
}
test('raw JSON remains tool input rather than being mistaken for settings', () => {
  const raw='{"input":"hello","mode":"decode"}';
  assert.deepEqual(decodeToolInput('json-formatter',raw),{input:raw});
});
test('legacy fake-data actions still apply',()=>assert.deepEqual(decodeToolInput('fake-data',JSON.stringify(examples['fake-data'])),examples['fake-data']));
test('invalid settings cannot reach tools',()=>{
  for(const [slug,settings] of [
    ['uuid',{kind:'invalid'}],['uuid',{count:1e9}],['uuid',{count:2.5}],['regex',{flags:'gg'}],['regex',{flags:'uv'}],
    ['gradient',{stops:[]}],['box-shadow',{layers:[{}]}],['timezone',{from:'Mars/Olympus'}],
    ['unit-converter',{group:'Weight',from:'km'}],['fake-data',{fields:['__proto__']}],['gitignore',{picked:['Unknown']}],
    ['password',{opts:{evil:true}}],['qr-code',{pass:'secret'}],['hmac',{key:'secret'}],['bcrypt',{password:'secret'}],
    ['number-base',{radix:3}],['image-converter',{format:'image/tiff'}],['hash',JSON.parse('{"__proto__":{}}')],
  ]) assert.equal(validateToolSettings(slug,settings),null,JSON.stringify([slug,settings]));
});
test('invalid AI configuration explains that it was not applied',()=>{
  const result=parseAIResponse(JSON.stringify({reply:'Here you go',tool:'uuid',settings:{count:1e9}}));
  assert.equal(result.input,undefined);assert.match(result.reply,/couldn't apply/);
  assert.equal(parseAIResponse('{"tool":"not-real","settings":{}}').tool,undefined);
  assert.equal(parseAIResponse('not JSON').input,undefined);
});
test('coupled settings normalize consistently',()=>{
  assert.deepEqual(validateToolSettings('unit-converter',{group:'Weight'}),{group:'Weight',from:'kg'});
  assert.equal(validateToolSettings('number-base',{input:'0xff'}).radix,16);
  assert.equal(validateToolSettings('qr-code',{email:'test@example.com'}).mode,'email');
});
