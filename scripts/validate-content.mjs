import fs from 'fs';
const missions=JSON.parse(fs.readFileSync('src/data/missions.json','utf8')).missions;
const rules=JSON.parse(fs.readFileSync('src/data/contentValidationRules.json','utf8'));
const errors=[];
const count=(arr,key)=>arr.reduce((m,x)=>(m[x[key]]=(m[x[key]]||0)+1,m),{});
for(const m of missions){
 if(!m.modeVariants||['rookie','consultant','leadAuditor','workshop'].some(k=>!m.modeVariants[k])) errors.push(`${m.id}: missing mode variants`);
 if(!m.fundamentalsLesson) errors.push(`${m.id}: missing fundamentals`);
 if(!m.frameworkMappings?.length) errors.push(`${m.id}: missing framework`);
 if((m.evidenceOptions||[]).length<5) errors.push(`${m.id}: fewer than 5 evidence options`);
 (m.evidenceOptions||[]).forEach((o,ix)=>{if(!o.clientResponse) errors.push(`${m.id}: missing client response ${ix}`); if(!o.followUpChallenge) errors.push(`${m.id}: missing follow-up ${ix}`);});
 if(/the client has controls/i.test(JSON.stringify(m))) errors.push(`${m.id}: generic wording`);
 if(/correct answer|best option/i.test(JSON.stringify(m))) errors.push(`${m.id}: reveals labels`);
 if(/\b(?:\d{1,3}\.){3}\d{1,3}\b/.test(JSON.stringify(m))) errors.push(`${m.id}: contains IP`);
 if(/\b(?:INC|SR)-\d+/i.test(JSON.stringify(m))) errors.push(`${m.id}: contains ticket id`);
 for(const t of rules.prohibitedTerms){if(JSON.stringify(m).toLowerCase().includes(t.toLowerCase())) errors.push(`${m.id}: prohibited term ${t}`)}
}
const dup=(arr,field,limit,label)=>{const c=count(arr,field);Object.entries(c).forEach(([k,v])=>{if(v>limit) errors.push(`${label} duplicated too often: ${k}`)});};
const opts=missions.flatMap(m=>m.evidenceOptions.map(o=>({text:o.text,resp:o.clientResponse,fu:o.followUpChallenge})));
dup(opts,'text',3,'evidence option');dup(opts,'resp',3,'client response');dup(opts,'fu',3,'follow-up');
if(errors.length){console.error('Validation failed:\n'+errors.join('\n'));process.exit(1);}else{console.log(`Validation passed: ${missions.length} missions checked.`)}
