import { missions } from './src/data/missions.js';
const bad=[]; const generic=["tests operation","validates coverage","useful evidence","request proof","evidence is partial.","maps to risk","ask for more evidence"];
for (const m of missions){
 for (const [mode,v] of Object.entries(m.modeVariants)) for (const e of v.evidenceOptions){
  if ((e.why||'').split(/\s+/).length<40) bad.push(`${m.id}/${mode}/${e.id} why`);
  if ((e.betterRequest||'').split(/\s+/).length<30) bad.push(`${m.id}/${mode}/${e.id} betterRequest`);
  if ((e.clientResponse||'').split(/\s+/).length<25) bad.push(`${m.id}/${mode}/${e.id} clientResponse`);
  if (!Array.isArray(e.followUpOptions)||e.followUpOptions.length<7) bad.push(`${m.id}/${mode}/${e.id} followUpOptions`);
  const all=[e.why,e.betterRequest,e.clientResponse,e.followUpFeedback].join(' ').toLowerCase();
  for (const g of generic) if (all.includes(g)) bad.push(`${m.id}/${mode}/${e.id} generic phrase: ${g}`);
 }
 const d=m.consultantDebrief||{}; if ((d.consultantLesson||'').split(/\s+/).length<40) bad.push(`${m.id} consultantLesson`); if ((d.commonMistake||'').split(/\s+/).length<30) bad.push(`${m.id} debrief commonMistake`);
 const f=m.fundamentalsLesson||{}; for(const k of ['whatItMeans','whyAuditorsCare','riskReduced','goodEvidence','commonMistake','analogy']) if ((f[k]||'').split(/\s+/).length<6) bad.push(`${m.id} fundamentals ${k}`);
}
if (bad.length){console.error('Content validation failed:\n'+bad.join('\n')); process.exit(1);} else console.log('Content validation passed');
