import { useMemo, useState } from 'react';
import gameData from './data/activities.json';

const modes = ['Rookie Mode', 'Consultant Mode', 'Lead Auditor Mode', 'Workshop Mode'];
const ranks = ['Evidence Rookie', 'Audit Analyst', 'Senior Consultant', 'Lead Auditor', 'Partner Review Ready', 'Framework Master'];

const MissionBrief = ({ activity }) => <section className='card mission'><h2>{activity.missionName}</h2><p className='tag'>{activity.domain}</p><p>{activity.clientScenario}</p><p><strong>Audit objective:</strong> {activity.auditObjective}</p><div className='framework-tags'>{activity.frameworkMappings.map((m)=><span key={`${m.framework}-${m.controlId}`} className='mini-badge'>{m.framework} {m.controlId}</span>)}</div></section>;
const EvidenceSelection = ({ options, selected, toggle, submit }) => <section className='card'><h3>Step 2: Evidence Request</h3>{options.map((o)=><button key={o.id} className={`option ${selected.includes(o.id) ? 'selected' : ''}`} onClick={() => toggle(o.id)}><span>{o.text}</span></button>)}<button className='primary' onClick={submit} disabled={!selected.length}>Submit Evidence</button></section>;
const EvidenceEvaluation = ({ responses }) => <section className='card'><h3>Step 3: Evidence Evaluation</h3>{responses.map((o)=><div className='debrief' key={o.id}><p><b>{o.text}</b></p><p><span className={`pill ${o.quality.toLowerCase()}`}>{o.quality}</span> <span className='muted'>{o.designOrOperating}</span> <span className='muted'>Points: {o.points}</span></p><p>{o.why}</p></div>)}</section>;
const ClientResponsePanel = ({ responses }) => <section className='card terminal'><h3>Step 4: Client Response</h3>{responses.map((r)=><p key={r.id}>[{r.evidenceType}] {r.clientResponse}</p>)}</section>;
const FollowUpChallenge = ({ branch, selected, setSelected, submit }) => <section className='card'><h3>Step 5: Follow-Up Challenge</h3><p>{branch.followUpChallenge.question}</p>{branch.followUpChallenge.options.map((o, idx) => <button key={o.id} className={`option ${selected === idx ? 'selected' : ''}`} onClick={() => setSelected(idx)}>{o.text}</button>)}<button className='primary' onClick={submit} disabled={selected === null}>Submit Follow-Up</button></section>;
const ConsultantDebriefCard = ({ activity, evidenceScore }) => <section className='card'><h3>Step 6: Consultant Debrief</h3><p><b>Risk type:</b> {activity.consultantDebrief.riskType}</p><p><b>Assets involved:</b> {activity.consultantDebrief.assetsInvolved.join(', ')}</p><p><b>Data involved:</b> {activity.consultantDebrief.dataInvolved}</p><p><b>Evidence quality:</b> {activity.consultantDebrief.evidenceQuality}</p><p><b>Audit judgment:</b> {activity.consultantDebrief.auditJudgment}</p><p><b>Potential finding:</b> {activity.consultantDebrief.potentialFinding}</p><p><b>Recommended follow-up:</b> {activity.consultantDebrief.recommendedFollowUp}</p><p><b>Consultant lesson:</b> {activity.consultantDebrief.consultantLesson}</p><p><b>Evidence points earned:</b> {evidenceScore}</p></section>;
const FundamentalsCard = ({ lesson }) => <section className='card'><h3>Step 7: Fundamentals / Basics</h3><p><b>What it means:</b> {lesson.whatItMeans}</p><p><b>Why it matters:</b> {lesson.whyItMatters}</p><p><b>Risk reduced:</b> {lesson.riskReduced}</p><p><b>Good evidence:</b> {lesson.goodEvidence}</p><p><b>Common mistake:</b> {lesson.commonMistake}</p><p><b>Analogy:</b> {lesson.analogy}</p><p className='tip'>Junior Consultant Tip: {lesson.tip}</p></section>;
const FrameworkRelevanceCard = ({ mappings }) => <section className='card'><h3>Step 8: Framework Relevance</h3>{mappings.map((m, i) => <p key={i}><b>{m.framework}</b> {m.controlId} — {m.controlName}: {m.relevance}</p>)}</section>;
const ScorePanel = ({ score, total }) => <div className='badge'>Score {score}/{total}</div>;
const DomainMap = ({ domains, unlocked }) => <section className='card'><h3>Domain Map</h3><div className='grid'>{domains.map((d, idx) => <div key={d.id} className={`domain ${idx <= unlocked ? 'open' : 'locked'}`}>{d.name}</div>)}</div></section>;
const RankResult = ({ score, max }) => { const pct = (score / max) * 100; const rank = ranks[Math.min(5, Math.floor(pct / 20))]; return <section className='card center'><h2>{rank}</h2><p>{score}/{max}</p></section>; };

export default function App() {
  const [screen, setScreen] = useState('home');
  const activities = useMemo(() => gameData.domains.flatMap((d) => d.activities), []);
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState([]);
  const [stage, setStage] = useState('evidence');
  const [followSel, setFollowSel] = useState(null);
  const [score, setScore] = useState(0);

  const current = activities[idx];
  const total = activities.length * 25;
  const selectedBranches = current?.evidenceOptions.filter((o) => sel.includes(o.id)) || [];
  if (screen === 'home') return <main className='page'><h1>Mission Control</h1>{modes.map((m) => <button key={m} className='option'>{m}</button>)}<DomainMap domains={gameData.domains} unlocked={Math.floor(idx / 5)} /><button className='primary' onClick={() => setScreen('game')}>Start Simulation</button></main>;
  if (!current) return <main className='page'><RankResult score={score} max={total} /></main>;

  const evidenceScore = selectedBranches.reduce((s, b) => s + b.points, 0);
  const submitEvidence = () => { setScore((v) => v + evidenceScore); setStage('review'); };
  const openFollowup = () => setStage('follow');
  const submitFollow = () => {
    const b = selectedBranches[0];
    const opt = b?.followUpChallenge.options[followSel];
    setScore((v) => v + (opt?.points || 0));
    setStage('done');
  };
  const next = () => { setIdx((i) => i + 1); setSel([]); setStage('evidence'); setFollowSel(null); };

  return <main className='page'>
    <ScorePanel score={score} total={total} />
    <MissionBrief activity={current} />
    {stage === 'evidence' && <EvidenceSelection options={current.evidenceOptions} selected={sel} toggle={(id) => setSel((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])} submit={submitEvidence} />}
    {stage === 'review' && <><EvidenceEvaluation responses={selectedBranches} /><ClientResponsePanel responses={selectedBranches} /><button className='primary' onClick={openFollowup}>Continue to Follow-Up</button></>}
    {stage === 'follow' && selectedBranches[0] && <FollowUpChallenge branch={selectedBranches[0]} selected={followSel} setSelected={setFollowSel} submit={submitFollow} />}
    {stage === 'done' && <><ConsultantDebriefCard activity={current} evidenceScore={evidenceScore} /><FundamentalsCard lesson={current.fundamentalsLesson} /><FrameworkRelevanceCard mappings={current.frameworkMappings} /><button className='primary' onClick={next}>Next Mission</button></>}
  </main>;
}
