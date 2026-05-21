import { useEffect, useMemo, useState } from 'react';
import { missions, MODES } from './data/missions';

const MODE_KEY = 'evidence-quest-mode';

export default function App() {
  const [mode, setMode] = useState(() => localStorage.getItem(MODE_KEY) || 'consultant');
  const [screen, setScreen] = useState('mode');
  const [missionIndex, setMissionIndex] = useState(0);
  const [phase, setPhase] = useState('brief');
  const [selectedEvidence, setSelectedEvidence] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [score, setScore] = useState(0);

  useEffect(() => localStorage.setItem(MODE_KEY, mode), [mode]);

  const mission = missions[missionIndex];
  const variant = mission?.modeVariants?.[mode];

  const evaluated = useMemo(() => mission?.evidenceOptions.filter((e) => selectedEvidence.includes(e.id)) || [], [mission, selectedEvidence]);

  const start = () => setScreen('dashboard');

  const submitEvidence = () => {
    const multiplier = MODES[mode].scoring;
    const points = evaluated.reduce((a, e) => a + Math.round(e.points * multiplier), 0);
    setScore((s) => s + points);
    setPhase('evaluation');
  };

  const selectFollowUp = (ev) => {
    const choice = ev.followUpOptions.find((o) => o === selectedOption);
    if (choice === ev.bestFollowUpAnswer) setScore((s) => s + 5);
    else setScore((s) => s - (mode === 'leadAuditor' ? 5 : 2));
    setPhase('debrief');
  };

  if (!mission) return <main className='page'><h1>Simulation Complete</h1><p>Mode: {MODES[mode].label}</p><p>Final Score: {score}</p></main>;

  return <main className='page'>
    {screen === 'mode' && <section className='card'><h1>Select Simulation Mode</h1>{Object.entries(MODES).map(([key, cfg]) => <button key={key} className={`option ${mode === key ? 'selected' : ''}`} onClick={() => setMode(key)}>{cfg.label}</button>)}<button className='primary' onClick={start}>Continue</button></section>}
    {screen === 'dashboard' && <section className='card'><h2>Audit Command Center</h2><p><b>Active Mode:</b> {MODES[mode].label}</p><p><b>Mission:</b> {mission.domain} · {mission.missionName}</p><p><b>Score:</b> {score}</p><button className='option' onClick={() => setScreen('mode')}>Change Mode</button><button className='primary' onClick={() => { setPhase('brief'); setScreen('game'); }}>Start Mission</button></section>}
    {screen === 'game' && <>
      <section className='card'><p><b>Selected Mode:</b> {MODES[mode].label}</p><p><b>Domain:</b> {mission.domain}</p></section>
      {phase === 'brief' && <section className='card'><h2>{mission.missionName}</h2><p>{variant.clientScenario}</p><p><b>Audit objective:</b> {variant.auditObjective}</p><p><b>Framework tags:</b> {mission.frameworkTags.join(', ')}</p><p><b>Hint:</b> {variant.hint}</p>{variant.discussionPrompt && <p><b>Discussion Prompt:</b> {variant.discussionPrompt}</p>}<button className='primary' onClick={() => setPhase('evidence')}>Open Evidence Request</button></section>}
      {phase === 'evidence' && <section className='card'><h3>Evidence Request</h3><p>Select one or more requests:</p>{mission.evidenceOptions.map((e) => <label key={e.id}><input type='checkbox' checked={selectedEvidence.includes(e.id)} onChange={() => setSelectedEvidence((prev) => prev.includes(e.id) ? prev.filter((id) => id !== e.id) : [...prev, e.id])} /> {e.text}</label>)}<button className='primary' disabled={!selectedEvidence.length} onClick={submitEvidence}>Submit Evidence Request</button></section>}
      {phase === 'evaluation' && <section className='card'><h3>Evidence Evaluation</h3>{evaluated.map((e) => <div key={e.id} className='alert'><p><b>Evidence:</b> {e.text}</p><p><b>Quality:</b> {e.quality}</p><p><b>Design/Operating:</b> {e.designOrOperating}</p><p><b>Why:</b> {e.why}</p><p><b>Points:</b> {Math.round(e.points * MODES[mode].scoring)}</p><p><b>Better request:</b> {e.betterRequest}</p><p><b>Client response:</b> {e.clientResponse}</p><p><b>Follow-up challenge:</b> {e.followUpChallenge}</p></div>)}<select value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}><option value=''>Select follow-up answer</option>{evaluated[0]?.followUpOptions.map((o) => <option key={o} value={o}>{o}</option>)}</select><button className='primary' disabled={!selectedOption} onClick={() => selectFollowUp(evaluated[0])}>Submit Follow-Up</button></section>}
      {phase === 'debrief' && <section className='card'><h3>Consultant Debrief</h3><p><b>Risk type:</b> {mission.consultantDebrief.riskType}</p><p><b>Assets involved:</b> {mission.consultantDebrief.assetsInvolved.join(', ')}</p><p><b>Data involved:</b> {mission.consultantDebrief.dataInvolved}</p><p><b>CIA impact:</b> {mission.consultantDebrief.ciaImpact}</p><p><b>Audit judgment:</b> {mission.consultantDebrief.auditJudgment}</p><p><b>Potential finding:</b> {mission.consultantDebrief.potentialFinding}</p><p><b>Recommended follow-up:</b> {mission.consultantDebrief.recommendedFollowUp}</p><p><b>Consultant lesson:</b> {mission.consultantDebrief.consultantLesson}</p><p><b>Common mistake:</b> {mission.consultantDebrief.commonMistake}</p><h4>Fundamentals</h4><p>{mission.fundamentalsLesson.whatItMeans}</p><p>{mission.fundamentalsLesson.whyAuditorsCare}</p><p>{mission.fundamentalsLesson.riskReduced}</p><p>{mission.fundamentalsLesson.goodEvidence}</p><p>{mission.fundamentalsLesson.commonMistake}</p><p>{mission.fundamentalsLesson.analogy}</p><h4>Framework Relevance</h4>{mission.frameworkMappings.map((m) => <p key={m.controlId}>{m.framework} | {m.controlId} | {m.controlName} — {m.relevance}</p>)}<button className='primary' onClick={() => { setMissionIndex((i) => i + 1); setSelectedEvidence([]); setSelectedOption(''); setPhase('brief'); }}>Next Mission</button></section>}
    </>}
  </main>;
}
