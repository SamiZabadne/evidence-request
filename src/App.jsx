import { useEffect, useMemo, useState } from 'react';
import { missions, MODES } from './data/missions';
import {
  AuditMissionQueue,
  ClientResponseConsole,
  ConsultantDebriefCard,
  EvidenceEvaluation,
  EvidenceSelection,
  FollowUpChallenge,
  FrameworkRelevanceCard,
  FundamentalsCard,
  MissionBrief,
  MissionControlDashboard,
  ModeSelectionScreen,
  ProgressStepper,
  ScorePanel,
} from './components/GameComponents';

const MODE_KEY = 'evidence-quest-mode';
const statusFlow = ['New Mission', 'Evidence Requested', 'Client Responded', 'Follow-Up Required', 'Debrief Complete', 'Escalated'];
const qualityRisk = { unsafe: 5, weak: 4, partial: 3, irrelevant: 2, strong: 1 };

const enhancedModes = {
  ...MODES,
  rookie: { ...MODES.rookie, profile: 'Plain English · extra hints · teaching feedback', focus: 'Learning control basics with simple response patterns.' },
  consultant: { ...MODES.consultant, profile: 'Realistic wording · moderate complexity', focus: 'Practical sufficiency judgment with similar-looking evidence choices.' },
  leadAuditor: { ...MODES.leadAuditor, profile: 'Ambiguous scenarios · stronger penalties', focus: 'Finding classification, period coverage, and sample sufficiency.' },
  workshop: { ...MODES.workshop, profile: 'Facilitator-led prompts and team discussion', focus: 'Ask-the-room conversations, talking points, and optional team scoring.' },
};

const decorateMission = (m) => ({ ...m, riskLevel: m.id.includes('IAM') ? 'High' : m.id.includes('LOG') ? 'Medium' : 'Low', difficulty: m.id.includes('IAM') ? 'Advanced' : 'Intermediate' });

export default function App() {
  const allMissions = useMemo(() => missions.map(decorateMission), []);
  const [mode, setMode] = useState(() => localStorage.getItem(MODE_KEY) || 'consultant');
  const [screen, setScreen] = useState('mode');
  const [missionIndex, setMissionIndex] = useState(0);
  const [phase, setPhase] = useState('brief');
  const [selectedEvidence, setSelectedEvidence] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [score, setScore] = useState(0);
  const [statusByMission, setStatusByMission] = useState({});
  const [progressByMission, setProgressByMission] = useState({});

  useEffect(() => localStorage.setItem(MODE_KEY, mode), [mode]);

  const mission = allMissions[missionIndex];
  const variant = mission?.modeVariants?.[mode];
  const evaluated = useMemo(() => mission?.evidenceOptions.filter((e) => selectedEvidence.includes(e.id)) || [], [mission, selectedEvidence]);
  const orderedEvaluated = useMemo(() => [...evaluated].sort((a, b) => (qualityRisk[a.quality.toLowerCase()] || 99) - (qualityRisk[b.quality.toLowerCase()] || 99)), [evaluated]);
  const primaryChallenge = orderedEvaluated[0];

  const avgQuality = useMemo(() => {
    const scores = orderedEvaluated.map((e) => 6 - (qualityRisk[e.quality.toLowerCase()] || 5));
    if (!scores.length) return 'N/A';
    return `${(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)}/5`;
  }, [orderedEvaluated]);

  const rank = score > 60 ? 'Principal Auditor' : score > 30 ? 'Senior Consultant' : 'Associate';

  const setMissionStatus = (status, prog) => {
    setStatusByMission((s) => ({ ...s, [missionIndex]: status }));
    setProgressByMission((p) => ({ ...p, [missionIndex]: prog }));
  };

  const submitEvidence = () => {
    const multiplier = enhancedModes[mode].scoring;
    const points = orderedEvaluated.reduce((a, e) => a + Math.round(e.points * multiplier), 0);
    setScore((s) => s + points);
    setMissionStatus('Client Responded', 60);
    setPhase('evaluation');
  };

  const submitFollowUp = () => {
    if (selectedOption === primaryChallenge.bestFollowUpAnswer) setScore((s) => s + 5);
    else setScore((s) => s - (mode === 'leadAuditor' ? 8 : 3));
    if (primaryChallenge.quality.toLowerCase() === 'unsafe') setMissionStatus('Escalated', 95);
    else setMissionStatus('Debrief Complete', 95);
    setPhase('debrief');
  };

  if (!mission) return <main className='page'><h1>Simulation Complete</h1><p>Mode: {enhancedModes[mode].label}</p><p>Final Score: {score}</p></main>;

  const dashboardStats = {
    'Active mode': enhancedModes[mode].label,
    'Total missions': allMissions.length,
    'Completed missions': missionIndex,
    'Current score': score,
    'Average evidence quality': avgQuality,
    'Open follow-ups': phase === 'evaluation' ? 1 : 0,
    'Escalated issues': Object.values(statusByMission).filter((s) => s === 'Escalated').length,
    'Framework coverage': [...new Set(allMissions.flatMap((m) => m.frameworkTags))].length,
    'Player rank': rank,
  };

  return <main className='page'>
    {screen === 'mode' && <ModeSelectionScreen modes={enhancedModes} mode={mode} setMode={setMode} onContinue={() => setScreen('dashboard')} />}
    {screen === 'dashboard' && <MissionControlDashboard stats={dashboardStats} onMode={() => setScreen('mode')} onStart={() => { setPhase('brief'); setScreen('game'); setMissionStatus('Evidence Requested', 20); }}>
      <AuditMissionQueue missions={allMissions} current={missionIndex} statuses={allMissions.map((_, i) => statusByMission[i] || statusFlow[0])} progressByMission={progressByMission} />
      <ScorePanel score={score} avgQuality={avgQuality} rank={rank} />
    </MissionControlDashboard>}
    {screen === 'game' && <>
      <ProgressStepper phase={phase} />
      {phase === 'brief' && <MissionBrief mission={mission} variant={variant} modeCfg={enhancedModes[mode]} onNext={() => { setMissionStatus('Evidence Requested', 40); setPhase('evidence'); }} />}
      {phase === 'evidence' && <EvidenceSelection mission={mission} selectedEvidence={selectedEvidence} setSelectedEvidence={setSelectedEvidence} onSubmit={submitEvidence} />}
      {phase === 'evaluation' && <>
        <EvidenceEvaluation evaluated={orderedEvaluated} pointsById={Object.fromEntries(orderedEvaluated.map((e) => [e.id, Math.round(e.points * enhancedModes[mode].scoring)]))} />
        <ClientResponseConsole evaluated={orderedEvaluated} followUpChallenge={primaryChallenge} />
        <FollowUpChallenge challenge={primaryChallenge} selectedOption={selectedOption} setSelectedOption={setSelectedOption} onSubmit={submitFollowUp} />
      </>}
      {phase === 'debrief' && <>
        <ConsultantDebriefCard debrief={mission.consultantDebrief} />
        <FundamentalsCard lesson={mission.fundamentalsLesson} />
        <FrameworkRelevanceCard mappings={mission.frameworkMappings} />
        <button className='primary' onClick={() => { setMissionIndex((i) => i + 1); setSelectedEvidence([]); setSelectedOption(''); setPhase('brief'); setScreen('dashboard'); }}>Next Mission</button>
      </>}
    </>}
  </main>;
}
