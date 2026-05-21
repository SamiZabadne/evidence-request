import { useMemo, useState } from 'react';
import missionsData from './data/missions.json';
import modeConfig from './data/modeConfig.json';

const modes = ['rookie', 'consultant', 'leadAuditor', 'workshop'];

export default function App() {
  const missions = useMemo(() => missionsData.missions, []);
  const [mode, setMode] = useState('rookie');
  const [i, setI] = useState(0);
  const [showClient, setShowClient] = useState(false);
  const [selected, setSelected] = useState(null);
  const m = missions[i];
  if (!m) return <main className='page'><h1>All Missions Completed</h1></main>;

  return <main className='page'>
    <section className='card hud'>
      <h1>Mission Control Dashboard</h1>
      <div className='modeRow'>{modes.map((x)=><button key={x} className={`option ${mode===x?'selected':''}`} onClick={()=>setMode(x)}>{x}</button>)}</div>
      <div className='metrics-grid'>
        <div className='metric'><p>Mode</p><h3>{mode}</h3><small>{modeConfig[mode].complexity}</small></div>
        <div className='metric'><p>Mission</p><h3>{i+1}/{missions.length}</h3></div>
        <div className='metric'><p>Domain</p><h3>{m.domain}</h3></div>
        <div className='metric'><p>Risk Heat</p><h3>{m.riskImpact.level}</h3></div>
      </div>
    </section>

    <section className='card'>
      <h2>{m.missionName}</h2>
      <p><b>Scenario Type:</b> {m.scenarioType}</p>
      <p>{m.clientScenario}</p>
      <p><b>Audit Objective:</b> {m.auditObjective}</p>
      <p><b>Mode Variant:</b> {m.modeVariants[mode]}</p>
      <div className='chipRow'>{m.riskImpact.cia.map(c=><span key={c} className='chip'>{c}</span>)}</div>
      <div className='chipRow'>{m.assetsInvolved.slice(0,5).map(a=><span key={a} className='tag'>{a}</span>)}</div>
    </section>

    <section className='card terminal'>
      <h3>Evidence Selection</h3>
      {m.evidenceOptions.map((e,idx)=><button className={`option ${selected===idx?'selected':''}`} key={e.id} onClick={()=>{setSelected(idx);setShowClient(true);}}>{e.text}</button>)}
    </section>

    {showClient && selected !== null && <section className='card'>
      <h3>Client Response Console</h3>
      <p>{m.evidenceOptions[selected].clientResponse}</p>
      <p><b>Follow-Up Challenge:</b> {m.evidenceOptions[selected].followUpChallenge}</p>
      <p><b>Consultant Debrief:</b> {m.consultantDebrief}</p>
      <p><b>Fundamentals:</b> {m.fundamentalsLesson}</p>
      <p><b>Common Mistake:</b> {m.commonMistake}</p>
      <p><b>Junior Tip:</b> {m.juniorConsultantTip}</p>
      <h4>Framework Relevance</h4>
      {m.frameworkMappings.map((f)=><p key={f.framework+f.id}>{f.framework} · {f.id} — {f.relevance}</p>)}
      <button className='primary' onClick={()=>{setShowClient(false);setSelected(null);setI(v=>v+1);}}>Next Mission</button>
    </section>}
  </main>;
}
