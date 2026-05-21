import { useMemo, useState } from 'react';
import gameData from './data/activities.json';

const modes = ['Rookie Mode', 'Consultant Mode', 'Lead Auditor Mode', 'Workshop Mode'];
const ranks = ['Evidence Rookie', 'Audit Analyst', 'Senior Consultant', 'Lead Auditor', 'Partner Review Ready', 'Framework Master'];

const MissionCard = ({ activity }) => <section className='card mission'><h2>{activity.missionName}</h2><p>{activity.domain}</p><p>{activity.clientScenario}</p><p><strong>Objective:</strong> {activity.auditObjective}</p></section>;
const EvidenceOptionCard = ({ option, active, onClick }) => <button className={`option ${active ? 'selected' : ''}`} onClick={onClick}><strong>{option.evidenceType}</strong> • {option.text}<span className={`pill ${option.quality.toLowerCase()}`}>{option.quality}</span><span className='muted'>{option.designOrOperating}</span></button>;
const ClientResponsePanel = ({ responses }) => <section className='card terminal'><h3>Client Response</h3>{responses.map((r)=><p key={r.id}>• {r.clientResponse}</p>)}</section>;
const FollowUpChallenge = ({ branch, selected, setSelected, submit }) => <section className='card'><h3>{branch.followUpChallenge.question}</h3>{branch.followUpChallenge.options.map((o,idx)=><button key={o.id} className={`option ${selected===idx?'selected':''}`} onClick={()=>setSelected(idx)}>{o.text}</button>)}<button className='primary' onClick={submit} disabled={selected===null}>Submit Follow-Up</button></section>;
const ConsultantDebriefCard = ({ activity, score }) => <section className='card'><h3>Consultant Debrief</h3><p><b>Risk:</b> {activity.consultantDebrief.riskType}</p><p><b>Assets:</b> {activity.consultantDebrief.assetsInvolved.join(', ')}</p><p><b>Audit Judgment:</b> {activity.consultantDebrief.auditJudgment}</p><p><b>Potential Finding:</b> {activity.consultantDebrief.potentialFinding}</p><p><b>Consultant Tip:</b> {activity.consultantTip}</p><p><b>Common Mistake:</b> {activity.commonMistake}</p><p><b>Evidence Request Quality Score:</b> {score}</p></section>;
const FrameworkRelevanceCard = ({ mappings }) => <section className='card'><h3>Framework Relevance</h3>{mappings.map((m,i)=><p key={i}><b>{m.framework}</b> {m.controlId} — {m.controlName}: {m.relevance}</p>)}</section>;
const FundamentalsCard = ({ lesson }) => <section className='card'><h3>{lesson.title}</h3><p>{lesson.lesson}</p></section>;
const ScorePanel = ({score,total}) => <div className='badge'>Score {score}/{total}</div>;
const DomainMap = ({ domains, unlocked }) => <section className='card'><h3>Domain Map</h3><div className='grid'>{domains.map((d,idx)=><div key={d.id} className={`domain ${idx<=unlocked?'open':'locked'}`}>{d.name}</div>)}</div></section>;
const RankResult = ({ score, max }) => { const pct=(score/max)*100; const rank=ranks[Math.min(5,Math.floor(pct/20))]; return <section className='card center'><h2>{rank}</h2><p>{score}/{max}</p></section>; };

export default function App(){
  const [screen,setScreen]=useState('home'); const [mode,setMode]=useState(modes[0]);
  const activities=useMemo(()=>gameData.domains.flatMap(d=>d.activities),[]);
  const [idx,setIdx]=useState(0); const [sel,setSel]=useState([]); const [stage,setStage]=useState('evidence'); const [followSel,setFollowSel]=useState(null); const [score,setScore]=useState(0);
  const current=activities[idx]; const total=activities.length*25; const selectedBranches=current?.evidenceOptions.filter(o=>sel.includes(o.id))||[];
  if(screen==='home') return <main className='page'><h1>Mission Control</h1>{modes.map(m=><button key={m} className={`option ${mode===m?'selected':''}`} onClick={()=>setMode(m)}>{m}</button>)}<DomainMap domains={gameData.domains} unlocked={Math.floor(idx/5)} /><button className='primary' onClick={()=>setScreen('game')}>Start Simulation</button></main>;
  if(!current) return <main className='page'><RankResult score={score} max={total} /></main>;
  const submitEvidence=()=>{const delta=selectedBranches.reduce((s,b)=>s+Math.max(0,b.points),0); setScore(v=>v+delta); setStage('follow');};
  const submitFollow=()=>{const b=selectedBranches[0]; const opt=b.followUpChallenge.options[followSel]; setScore(v=>v+(opt?.points||0)); setStage('done');};
  const next=()=>{setIdx(i=>i+1);setSel([]);setStage('evidence');setFollowSel(null);};
  return <main className='page'>
    <ScorePanel score={score} total={total} />
    <MissionCard activity={current} />
    {stage==='evidence' && <section className='card'>{current.evidenceOptions.map(o=><EvidenceOptionCard key={o.id} option={o} active={sel.includes(o.id)} onClick={()=>setSel(p=>p.includes(o.id)?p.filter(x=>x!==o.id):[...p,o.id])} />)}<button className='primary' onClick={submitEvidence} disabled={!sel.length}>Submit Evidence</button></section>}
    {stage!=='evidence' && <ClientResponsePanel responses={selectedBranches} />}
    {stage==='follow' && selectedBranches[0] && <FollowUpChallenge branch={selectedBranches[0]} selected={followSel} setSelected={setFollowSel} submit={submitFollow} />}
    {stage==='done' && <><ConsultantDebriefCard activity={current} score={selectedBranches.reduce((s,b)=>s+Math.max(0,b.points),0)} /><FrameworkRelevanceCard mappings={current.frameworkMappings} /><FundamentalsCard lesson={current.fundamentalsLesson} /><button className='primary' onClick={next}>Next Mission</button></>}
  </main>;
}
