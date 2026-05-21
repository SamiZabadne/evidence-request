import { useMemo, useState } from 'react';
import gameData from './data/activities.json';

const modes = ['Rookie Mode', 'Consultant Mode', 'Lead Auditor Mode', 'Workshop Mode'];
const ranks = ['Evidence Rookie', 'Audit Analyst', 'Senior Consultant', 'Lead Auditor', 'Partner Review Ready', 'Framework Master'];
const missionStatuses = ['New Mission', 'Evidence Requested', 'Client Responded', 'Follow-Up Required', 'Debrief Complete', 'Escalated'];

const qualityScoreMap = { Strong: 100, Partial: 70, Weak: 40, Irrelevant: 25, Unsafe: 0 };

const getRank = (score, max) => ranks[Math.min(5, Math.floor(((score / Math.max(1, max)) * 100) / 20))];

const buildScenarioNodes = (activity) => {
  const nodes = [{ nodeId: 'brief', nodeType: 'missionBrief', title: activity.missionName, clientScenario: activity.clientScenario, auditObjective: activity.auditObjective, nextNode: 'evidence-selection' }];
  const choices = activity.evidenceOptions.map((o, idx) => ({ choiceId: o.id, text: o.text, nextNode: `client-${idx}`, scoreImpact: o.points }));
  nodes.push({ nodeId: 'evidence-selection', nodeType: 'evidenceSelection', prompt: 'What evidence would you request first?', choices });
  activity.evidenceOptions.forEach((o, idx) => {
    nodes.push({ nodeId: `client-${idx}`, nodeType: 'clientResponse', clientResponse: o.clientResponse, feedback: o.why, scoreImpact: o.points, riskImpact: o.quality === 'Strong' ? -1 : o.quality === 'Unsafe' ? 4 : 2, evidenceQualityImpact: o.quality, nextNode: `follow-${idx}` });
    nodes.push({ nodeId: `follow-${idx}`, nodeType: 'followUpChallenge', prompt: o.followUpChallenge.question, choices: o.followUpChallenge.options.map((f) => ({ choiceId: f.id, text: f.text, nextNode: f.isBest ? 'consultant-debrief' : `follow-${idx}`, scoreImpact: f.points, escalationImpact: f.isBest ? -1 : 2, feedback: f.feedback, isBest: f.isBest })), sourceChoice: o.id });
  });
  nodes.push({ nodeId: 'consultant-debrief', nodeType: 'consultantDebrief', nextNode: 'framework-relevance' });
  nodes.push({ nodeId: 'framework-relevance', nodeType: 'frameworkRelevance', nextNode: 'fundamentals' });
  nodes.push({ nodeId: 'fundamentals', nodeType: 'fundamentalsLesson', nextNode: 'mission-complete' });
  nodes.push({ nodeId: 'mission-complete', nodeType: 'missionComplete' });
  return nodes;
};

const MissionControlDashboard = ({ activities, score, completed, escalation, evidenceHistory, followUps }) => {
  const avgEvidence = evidenceHistory.length ? Math.round(evidenceHistory.reduce((a, b) => a + (qualityScoreMap[b] ?? 50), 0) / evidenceHistory.length) : 0;
  const frameworkCoverage = new Set(activities.flatMap((a) => a.frameworkMappings.map((m) => m.framework))).size;
  const rank = getRank(score, activities.length * 35);
  const cards = [
    ['Total Missions Available', activities.length], ['Missions Completed', completed], ['Current Score', score], ['Average Evidence Quality Score', `${avgEvidence}%`],
    ['Open Follow-Ups', followUps], ['Escalated Audit Issues', escalation], ['Framework Coverage Count', frameworkCoverage], ['Player Rank', rank],
  ];
  return <section className='card'><h2>Audit Command Center</h2><div className='metrics-grid'>{cards.map(([k, v]) => <div key={k} className='metric'><p>{k}</p><h3>{v}</h3></div>)}</div></section>;
};

export default function App() {
  const activities = useMemo(() => gameData.domains.flatMap((d) => d.activities.map((a) => ({ ...a, nodes: buildScenarioNodes(a) }))), []);
  const [screen, setScreen] = useState('home');
  const [idx, setIdx] = useState(0);
  const [nodeId, setNodeId] = useState('brief');
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [score, setScore] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [escalation, setEscalation] = useState(0);
  const [missionStatus, setMissionStatus] = useState(missionStatuses[0]);
  const [timeline, setTimeline] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [evidenceHistory, setEvidenceHistory] = useState([]);
  const [completed, setCompleted] = useState(0);

  const current = activities[idx];
  if (!current) return <main className='page'><h2>Simulation Complete</h2></main>;
  const node = current.nodes.find((n) => n.nodeId === nodeId);

  const handleChoice = (choice) => {
    setSelectedChoice(choice.choiceId);
    setScore((s) => s + (choice.scoreImpact || 0));
    setTimeline((t) => [`${new Date().toLocaleTimeString()} - Choice submitted: ${choice.text}`, ...t].slice(0, 12));
    if (node.nodeType === 'evidenceSelection') {
      setMissionStatus(missionStatuses[1]);
      setNodeId(choice.nextNode);
    } else if (node.nodeType === 'followUpChallenge') {
      if (!choice.isBest) {
        const left = attemptsLeft - 1;
        setAttemptsLeft(left);
        setEscalation((e) => Math.min(10, e + 2));
        setAlerts((a) => [{ title: 'Follow-Up Required', domain: current.domain, risk: 'Medium', why: 'The follow-up did not fully validate evidence sufficiency.', action: 'Request traceable approvals and remediation links.' }, ...a].slice(0, 8));
        if (left <= 0) {
          setMissionStatus(missionStatuses[5]);
          setNodeId('consultant-debrief');
          return;
        }
      } else {
        setMissionStatus(missionStatuses[4]);
        setNodeId(choice.nextNode);
      }
    }
  };

  const nextFromClient = () => {
    const quality = node.evidenceQualityImpact;
    setEvidenceHistory((h) => [...h, quality]);
    setMissionStatus(missionStatuses[2]);
    if (quality === 'Unsafe') {
      setEscalation((e) => Math.min(10, e + 4));
      setAlerts((a) => [{ title: 'Unsafe evidence request', domain: current.domain, risk: 'High', why: 'Requesting passwords/secrets is unsafe and unnecessary for audits.', action: 'Ask for access review approvals and control operation records instead.' }, ...a].slice(0, 8));
    }
    setNodeId(node.nextNode);
  };

  const nextMission = () => { setIdx((i) => i + 1); setNodeId('brief'); setSelectedChoice(null); setAttemptsLeft(3); setCompleted((v) => v + 1); setMissionStatus(missionStatuses[0]); };

  return <main className='page'>
    {screen === 'home' ? <><h1>Mission Control Dashboard</h1>{modes.map((m) => <button key={m} className='option'>{m}</button>)}<MissionControlDashboard activities={activities} score={score} completed={completed} escalation={escalation} evidenceHistory={evidenceHistory} followUps={timeline.filter((t) => t.includes('Follow-Up')).length} /><button className='primary' onClick={() => setScreen('game')}>Start Simulation</button></> : <>
      <section className='card'><h2>Audit Mission Queue</h2><div className='metrics-grid'>{activities.slice(0, 6).map((m, i) => <div key={m.id} className='metric'><h3>{m.missionName}</h3><p>{m.domain}</p><p>Status: {i < idx ? 'Debrief Complete' : i === idx ? missionStatus : 'New Mission'}</p><p>Risk: {m.riskImpact.level}</p><p>Difficulty: {m.difficulty}</p></div>)}</div></section>
      <section className='card timeline'><h3>SIEM-style Audit Activity Timeline</h3>{timeline.map((t) => <p key={t}>{t}</p>)}</section>
      <section className='card'><h3>Audit Alerts</h3>{alerts.length === 0 ? <p>No active alerts.</p> : alerts.map((a, i) => <div key={i} className='alert'><h4>{a.title}</h4><p>{a.domain} · {a.risk}</p><p>{a.why}</p><p><b>Action:</b> {a.action}</p></div>)}</section>
      {node.nodeType === 'missionBrief' && <section className='card'><h2>{node.title}</h2><p>{node.clientScenario}</p><p><b>Objective:</b> {node.auditObjective}</p><button className='primary' onClick={() => setNodeId(node.nextNode)}>Open Evidence Menu</button></section>}
      {node.nodeType === 'evidenceSelection' && <section className='card'><h3>{node.prompt}</h3>{node.choices.map((c) => <button key={c.choiceId} className={`option ${selectedChoice === c.choiceId ? 'selected' : ''}`} onClick={() => handleChoice(c)}>{c.text}</button>)}</section>}
      {node.nodeType === 'clientResponse' && <section className='card terminal'><h3>Client Response Console</h3><p>{node.clientResponse}</p><p>{node.feedback}</p><p className='tip'>Evidence quality appears after submission: {node.evidenceQualityImpact}</p><button className='primary' onClick={nextFromClient}>Continue to Follow-Up</button></section>}
      {node.nodeType === 'followUpChallenge' && <section className='card'><h3>{node.prompt}</h3>{node.choices.map((c) => <button key={c.choiceId} className='option' onClick={() => handleChoice(c)}>{c.text}</button>)}<p>Attempts Left: {attemptsLeft}/3</p></section>}
      {node.nodeType === 'consultantDebrief' && <section className='card'><h3>Consultant Debrief</h3><p><b>Risk type:</b> {current.consultantDebrief.riskType}</p><p><b>Assets involved:</b> {current.consultantDebrief.assetsInvolved.join(', ')}</p><p><b>Data involved:</b> {current.consultantDebrief.dataInvolved}</p><p><b>Evidence quality:</b> {evidenceHistory.at(-1) || 'Pending'}</p><p><b>Audit judgment:</b> {current.consultantDebrief.auditJudgment}</p><p><b>Potential finding:</b> {current.consultantDebrief.potentialFinding}</p><p><b>Recommended follow-up:</b> {current.consultantDebrief.recommendedFollowUp}</p><p><b>Framework relevance:</b> {current.frameworkMappings.map((m) => `${m.framework} ${m.controlId}`).join(', ')}</p><p><b>Junior Consultant Tip:</b> {current.fundamentalsLesson.tip}</p><p><b>Common Mistake:</b> {current.fundamentalsLesson.commonMistake}</p><button className='primary' onClick={nextMission}>Next Mission</button></section>}
    </>}
  </main>;
}
