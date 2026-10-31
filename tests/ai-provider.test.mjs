import test from 'node:test';
import assert from 'node:assert/strict';
import { createAIClient } from '../src/lib/ai-provider.ts';

const messages=[{role:'user',content:'hello'},{role:'assistant',content:'Hi'},{role:'user',content:'help'}];
const content=JSON.stringify({reply:'Here you go',tool:'base64',settings:{input:'hello'}});
const geminiResponse=()=>Response.json({candidates:[{content:{parts:[{text:'private thinking',thought:true},{text:content}]}}]});
const groqResponse=()=>Response.json({choices:[{message:{content}}]});
const env={GEMINI_API_KEY:'test-gemini',GROQ_API_KEY:'test-groq'};

test('Gemini is preferred, preserves conversation roles, and keeps keys out of the URL',async()=>{
 const calls=[];
 const client=createAIClient(env,async(url,init)=>{calls.push({url,init});return geminiResponse();});
 const result=await client.complete('system instructions',messages);
 assert.equal(result.provider,'Gemini');assert.equal(result.content,content);assert.equal(calls.length,1);
 assert.match(calls[0].url,/generativelanguage.googleapis.com/);assert.ok(!calls[0].url.includes('test-gemini'));
 assert.equal(calls[0].init.headers['x-goog-api-key'],'test-gemini');
 const body=JSON.parse(calls[0].init.body);
 assert.deepEqual(body.contents.map(m=>m.role),['user','model','user']);
 assert.equal(body.systemInstruction.parts[0].text,'system instructions');
 assert.equal(body.generationConfig.responseMimeType,'application/json');
});
test('missing Gemini key uses Groq directly without a Google request',async()=>{
 const calls=[];
 const client=createAIClient({GEMINI_API_KEY:'  ',GROQ_API_KEY_1:'test-groq'},async(url)=>{calls.push(url);return groqResponse();});
 assert.equal((await client.complete('system',messages)).provider,'Groq');
 assert.deepEqual(calls,['https://api.groq.com/openai/v1/chat/completions']);
});
for(const status of [400,401,403,404,429,500,503]) {
 test(`Gemini HTTP ${status} falls back to Groq`,async()=>{
  const calls=[];
  const client=createAIClient(env,async(url)=>{calls.push(url);return calls.length===1?new Response('',{status}):groqResponse();});
  assert.equal((await client.complete('system',messages)).provider,'Groq');assert.equal(calls.length,2);
 });
}
test('Gemini timeout falls back to Groq',async()=>{
 let calls=0;
 const client=createAIClient(env,async()=>{if(++calls===1)throw new DOMException('timed out','TimeoutError');return groqResponse();});
 assert.equal((await client.complete('system',messages)).provider,'Groq');assert.equal(calls,2);
});
for(const data of [{candidates:[]},{candidates:[{content:{parts:[{text:'not JSON'}]}}]},{candidates:[{content:{parts:[{text:'{"reply":""}'}]}}]}]) {
 test('unusable Gemini response falls back to Groq',async()=>{
  let calls=0;const client=createAIClient(env,async()=>++calls===1?Response.json(data):groqResponse());
  assert.equal((await client.complete('system',messages)).provider,'Groq');assert.equal(calls,2);
 });
}
test('Gemini-only configuration works with alternative key and custom model',async()=>{
 const client=createAIClient({GOOGLE_API_KEY:'alternative',GEMINI_MODEL:'models/gemini-test'},async(url,init)=>{
  assert.match(url,/models\/gemini-test:generateContent$/);assert.equal(init.headers['x-goog-api-key'],'alternative');return geminiResponse();
 });
 assert.equal(client.configured,true);assert.equal((await client.complete('system',messages)).provider,'Gemini');
});
test('no credentials means no external requests',async()=>{
 const client=createAIClient({},async()=>{assert.fail('must not make an unauthenticated request');});
 assert.equal(client.configured,false);await assert.rejects(()=>client.complete('system',messages));
});
test('Groq retains key rotation and fallback model support',async()=>{
 const calls=[];
 const client=createAIClient({GROQ_API_KEY_1:'one',GROQ_API_KEY_2:'two'},async(url,init)=>{
  calls.push({key:init.headers.Authorization,model:JSON.parse(init.body).model});
  return calls.length===1?new Response('',{status:429}):groqResponse();
 });
 await client.complete('system',messages);await client.complete('system',messages);
 assert.deepEqual(calls.map(c=>c.key),['Bearer one','Bearer two','Bearer one']);
 let models=[];
 const fallback=createAIClient({GROQ_API_KEY:'one'},async(url,init)=>{
  models.push(JSON.parse(init.body).model);return models.length===1?new Response('',{status:404}):groqResponse();
 });
 assert.equal((await fallback.complete('system',messages)).model,'openai/gpt-oss-20b');
 assert.deepEqual(models,['openai/gpt-oss-120b','openai/gpt-oss-20b']);
});
test('all providers failing returns status without including credential details',async()=>{
 const client=createAIClient(env,async()=>new Response('secret provider error',{status:429}));
 await assert.rejects(()=>client.complete('system',messages),e=>e.status===429&&!e.message.includes('secret'));
});
