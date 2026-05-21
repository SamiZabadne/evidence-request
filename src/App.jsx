import { useEffect, useMemo, useState } from 'react';
import gameData from './data/activities.json';

const modes = ['Rookie Mode', 'Consultant Mode', 'Lead Auditor Mode', 'Workshop Mode'];
const ranks = ['Evidence Rookie', 'Audit Analyst', 'Senior Consultant', 'Lead Auditor', 'Partner Review Ready', 'Framework Master'];
const playbookSteps = ['Review client claim', 'Select evidence request', 'Read client response', 'Choose follow-up action', 'Review consultant debrief', 'Review fundamentals/basics lesson', 'Review framework relevance'];
const missionStatuses = ['New Mission', 'Evidence Requested', 'Client Responded', 'Follow-Up Required', 'Debrief Complete', 'Escalated'];

const MissionBrief = ({ activity }) => <section className='card mission'><h2>{activity.missionName}</h2><p className='tag'>{activity.domain}</p><p>{activity.clientScenario}</p><p><strong>Audit objective:</strong> {activity.auditObjective}</p><div className='framework-tags'>{activity.frameworkMappings.map((m) => <span key={`${m.framework}-${m.controlId}`} className='mini-badge'>{m.framework} {m.controlId}</span>)}</div></section>;
const EvidenceSelection = ({ options, selected, toggle, submit }) => <section className='card'><h3>Step 2: Evidence Request</h3>{options.map((o) => <button key={o.id} className={`option ${selected === o.id ? 'selected' : ''}`} onClick={() => toggle(o.id)}><span>{o.text}</span></button>)}<button className='primary' onClick={submit} disabled={!selected}>Submit Evidence</button></section>;
const EvidenceEvaluation = ({ response }) => <section className='card'><h3>Evidence Evaluation</h3><div className='debrief'><p><b>{response.text}</b></p><p><span className={`pill ${response.quality.toLowerCase()}`}>{response.quality}</span> <span className='muted'>{response.designOrOperating}</span> <span className='muted'>Points: {response.points}</span></p><p>{response.why}</p></div></section>;

const TerminalConsole = ({ missionStatus, branch, typedText, warning }) => (
  <section className='card terminal'>
    <h3>Client Response Console</h3>
    <p><span className='prompt'>&gt; mission-status:</span> {missionStatus}</p>
    <p><span className='prompt'>&gt; client-response:</span> {typedText || 'Awaiting client response...'}</p>
    <p><span className='prompt'>&gt; auditor-follow-up:</span> {branch?.followUpChallenge.question || 'Pending evidence submission.'}</p>
    <p><span className='prompt'>&gt; evidence-status:</span> {branch ? `Evidence type ${branch.evidenceType} logged for analysis.` : 'No evidence submitted yet.'}</p>
    {warning && <p className='console-warning'>{warning}</p>}
  </section>
);

const FollowUpChallenge = ({ branch, selected, setSelected, submit, attemptsLeft }) => <section className='card'><h3>Step 4: Follow-Up Action</h3><p>{branch.followUpChallenge.question}</p>{branch.followUpChallenge.options.map((o, idx) => <button key={o.id} className={`option ${selected === idx ? 'selected' : ''}`} onClick={() => setSelected(idx)}>{o.text}</button>)}<button className='primary' onClick={submit} disabled={selected === null}>Submit Follow-Up</button><AttemptCounter attemptsLeft={attemptsLeft} maxAttempts={3} /></section>;
const ConsultantDebriefCard = ({ activity, evidenceScore }) => <section className='card'><h3>Step 5: Consultant Debrief</h3><p><b>Risk type:</b> {activity.consultantDebrief.riskType}</p><p><b>Assets involved:</b> {activity.consultantDebrief.assetsInvolved.join(', ')}</p><p><b>Data involved:</b> {activity.consultantDebrief.dataInvolved}</p><p><b>Evidence quality:</b> {activity.consultantDebrief.evidenceQuality}</p><p><b>Audit judgment:</b> {activity.consultantDebrief.auditJudgment}</p><p><b>Potential finding:</b> {activity.consultantDebrief.potentialFinding}</p><p><b>Recommended follow-up:</b> {activity.consultantDebrief.recommendedFollowUp}</p><p><b>Consultant lesson:</b> {activity.consultantDebrief.consultantLesson}</p><p><b>Evidence points earned:</b> {evidenceScore}</p></section>;
const FundamentalsCard = ({ lesson }) => <section className='card'><h3>Step 6: Fundamentals / Basics</h3><p><b>What it means:</b> {lesson.whatItMeans}</p><p><b>Why it matters:</b> {lesson.whyItMatters}</p><p><b>Risk reduced:</b> {lesson.riskReduced}</p><p><b>Good evidence:</b> {lesson.goodEvidence}</p><p><b>Common mistake:</b> {lesson.commonMistake}</p><p><b>Analogy:</b> {lesson.analogy}</p><p className='tip'>Junior Consultant Tip: {lesson.tip}</p></section>;
const FrameworkRelevanceCard = ({ mappings }) => <section className='card'><h3>Step 7: Framework Relevance</h3>{mappings.map((m, i) => <p key={i}><b>{m.framework}</b> {m.controlId} — {m.controlName}: {m.relevance}</p>)}</section>;
const ScorePanel = ({ score, total }) => <div className='badge'>Score {score}/{total}</div>;
const DomainMap = ({ domains, unlocked }) => <section className='card'><h3>Domain Map</h3><div className='grid'>{domains.map((d, idx) => <div key={d.id} className={`domain ${idx <= unlocked ? 'open' : 'locked'}`}>{d.name}</div>)}</div></section>;
const RankResult = ({ score, max }) => { const pct = (score / max) * 100; const rank = ranks[Math.min(5, Math.floor(pct / 20))]; return <section className='card center'><h2>{rank}</h2><p>{score}/{max}</p></section>; };
const AttemptCounter = ({ attemptsLeft, maxAttempts }) => <div className='attempt-counter'>Follow-up attempts left: {attemptsLeft}/{maxAttempts}</div>;
const MissionStatusBadge = ({ status }) => <div className='mission-status'>{status}</div>;
const PlaybookStepTracker = ({ stage }) => <section className='card'><h3>Audit Playbook</h3><ol className='step-tracker'>{playbookSteps.map((step, index) => <li key={step} className={index <= stage ? 'done' : ''}>{step}</li>)}</ol></section>;
const HintCommandPanel = ({ hint, onHint }) => <section className='card'><h3>Hint Command</h3><button className='primary' onClick={onHint}>Need a Hint?</button>{hint && <p className='tip'>{hint}</p>}</section>;
const concernLabel = (score) => {
  if (score <= 2) return 'Low Concern';
  if (score <= 5) return 'Moderate Concern';
  if (score <= 8) return 'High Concern';
  return 'Critical Escalation';
};
const AuditEscalationMeter = ({ escalation }) => <section className='card'><h3>Audit Escalation Meter</h3><div className='meter'><div style={{ width: `${Math.min(100, (escalation / 10) * 100)}%` }} /></div><p>{concernLabel(escalation)}</p></section>;

export default function App() {
  const [screen, setScreen] = useState('home');
  const activities = useMemo(() => gameData.domains.flatMap((d) => d.activities), []);
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState(null);
  const [stage, setStage] = useState('evidence');
  const [followSel, setFollowSel] = useState(null);
  const [score, setScore] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [escalation, setEscalation] = useState(0);
  const [missionStatus, setMissionStatus] = useState(missionStatuses[0]);
  const [hint, setHint] = useState('');
  const [typedText, setTypedText] = useState('');
  const [warning, setWarning] = useState('');

  const current = activities[idx];
  const total = activities.length * 25;
  const selectedBranch = current?.evidenceOptions.find((o) => sel === o.id);

  useEffect(() => {
    if (!selectedBranch || stage === 'evidence') return;
    const full = selectedBranch.clientResponse;
    let i = 0;
    setTypedText('');
    const interval = setInterval(() => {
      i += 1;
      setTypedText(full.slice(0, i));
      if (i >= full.length) clearInterval(interval);
    }, 15);
    return () => clearInterval(interval);
  }, [selectedBranch, stage]);

  if (screen === 'home') return <main className='page'><h1>Mission Control</h1>{modes.map((m) => <button key={m} className='option'>{m}</button>)}<DomainMap domains={gameData.domains} unlocked={Math.floor(idx / 5)} /><button className='primary' onClick={() => setScreen('game')}>Start Simulation</button></main>;
  if (!current) return <main className='page'><RankResult score={score} max={total} /></main>;

  const evidenceScore = selectedBranch?.points || 0;

  const submitEvidence = () => {
    if (!selectedBranch) return;
    setScore((v) => v + evidenceScore);
    setMissionStatus(missionStatuses[2]);
    if (selectedBranch.quality === 'Unsafe') {
      setWarning('Security Handling Warning: Never request raw passwords, secrets, or private keys as audit evidence.');
      setEscalation((v) => Math.min(10, v + 4));
    } else {
      setWarning('');
      if (selectedBranch.quality === 'Strong') setEscalation((v) => Math.max(0, v - 1));
      if (selectedBranch.quality === 'Weak' || selectedBranch.quality === 'Irrelevant') setEscalation((v) => Math.min(10, v + 2));
    }
    setStage('review');
  };

  const submitFollow = () => {
    const opt = selectedBranch?.followUpChallenge.options[followSel];
    const points = opt?.points || 0;
    if (!opt?.isBest) {
      const nextAttempts = attemptsLeft - 1;
      setAttemptsLeft(nextAttempts);
      setEscalation((v) => Math.min(10, v + 2));
      if (nextAttempts <= 0) {
        setWarning('Audit Escalation: repeated weak follow-up handling requires lead auditor intervention.');
        setMissionStatus(missionStatuses[5]);
        setStage('done');
        return;
      }
      return;
    }
    setScore((v) => v + points);
    setEscalation((v) => Math.max(0, v - 1));
    setMissionStatus(missionStatuses[4]);
    setStage('done');
  };

  const next = () => {
    setIdx((i) => i + 1);
    setSel(null);
    setStage('evidence');
    setFollowSel(null);
    setAttemptsLeft(3);
    setHint('');
    setTypedText('');
    setWarning('');
    setMissionStatus(missionStatuses[0]);
  };

  const stageIndex = stage === 'evidence' ? 1 : stage === 'review' ? 2 : stage === 'follow' ? 3 : 6;
  const requestHint = () => setHint('Hint: A policy shows how the process is designed. A ticket, log, or sample record usually helps prove the process actually operated. Pick requests with approver, date, and remediation traceability.');

  return <main className='page'>
    <ScorePanel score={score} total={total} />
    <MissionStatusBadge status={missionStatus} />
    <AuditEscalationMeter escalation={escalation} />
    <PlaybookStepTracker stage={stageIndex} />
    <MissionBrief activity={current} />
    <HintCommandPanel hint={hint} onHint={requestHint} />
    {stage === 'evidence' && <EvidenceSelection options={current.evidenceOptions} selected={sel} toggle={(id) => { setSel(id); setMissionStatus(missionStatuses[1]); }} submit={submitEvidence} />}
    {stage === 'review' && selectedBranch && <><EvidenceEvaluation response={selectedBranch} /><TerminalConsole missionStatus={missionStatus} branch={selectedBranch} typedText={typedText} warning={warning} /><button className='primary' onClick={() => { setMissionStatus(missionStatuses[3]); setStage('follow'); }}>Continue to Follow-Up</button></>}
    {stage === 'follow' && selectedBranch && <FollowUpChallenge branch={selectedBranch} selected={followSel} setSelected={setFollowSel} submit={submitFollow} attemptsLeft={attemptsLeft} />}
    {stage === 'done' && <><ConsultantDebriefCard activity={current} evidenceScore={evidenceScore} /><FundamentalsCard lesson={current.fundamentalsLesson} /><FrameworkRelevanceCard mappings={current.frameworkMappings} /><button className='primary' onClick={next}>Next Mission</button></>}
  </main>;
}
