import { useEffect, useMemo, useState } from 'react';
import { missions, MODES } from './data/missions';
import { QUALITY_SCORE, getModeAwareEvidenceOptions, selectFollowUpEvidence, sortEvidenceByPriority } from './engine';
import { AuditCommandLayout, ClientResponseConsole, ConsultantDebriefCard, EscalationMeter, EvidenceEvaluation, EvidenceSelection, FollowUpChallenge, FollowUpFeedbackPanel, FrameworkRelevanceCard, FundamentalsCard, MissionBrief, MissionQueuePanel, ProgressStepper, ScorePanel } from './components/GameComponents';

const MODE_KEY = 'evidence-quest-mode';
const statusFlow = ['New Mission', 'Evidence Requested', 'Client Responded', 'Follow-Up Required', 'Debrief Complete', 'Escalated'];
const stepIndex = { brief: 0, evidence: 1, evaluation: 2, client: 3, followUp: 4, followUpFeedback: 4, debrief: 5, fundamentals: 6, framework: 7 };

const enhancedModes = {
  ...MODES,
  rookie: { ...MODES.rookie, focus: 'Learning-first: simpler evidence and easier follow-ups.' },
  consultant: { ...MODES.consultant, focus: 'Realistic audit pressure with moderate ambiguity.' },
  leadAuditor: { ...MODES.leadAuditor, focus: 'Sufficiency, classification, and period coverage decisions.' },
  workshop: { ...MODES.workshop, focus: 'Discussion prompts, facilitator notes, and group scoring.' },
};

export default function App() {
  const [mode, setMode] = useState(() => localStorage.getItem(MODE_KEY) || 'consultant');
  const [missionIndex, setMissionIndex] = useState(0);
  const [phase, setPhase] = useState('brief');
  const [selectedEvidence, setSelectedEvidence] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [score, setScore] = useState(0);
  const [statusByMission, setStatusByMission] = useState({});
  const [progressByMission, setProgressByMission] = useState({});
  const [followUpFeedback, setFollowUpFeedback] = useState(null);
  const [filters, setFilters] = useState({ search: '', domain: 'all', risk: 'all', status: 'all' });
  useEffect(() => localStorage.setItem(MODE_KEY, mode), [mode]);

  const mission = missions[missionIndex];
  const variant = mission?.modeVariants?.[mode];
  const modeEvidence = useMemo(() => getModeAwareEvidenceOptions(mission || {}, mode), [mission, mode]);
  const evaluated = useMemo(() => modeEvidence.filter((e) => selectedEvidence.includes(e.id)), [modeEvidence, selectedEvidence]);
  const orderedEvaluated = useMemo(() => sortEvidenceByPriority(evaluated), [evaluated]);
  const challenge = useMemo(() => selectFollowUpEvidence(orderedEvaluated)?.evidence, [orderedEvaluated]);
  const avgQuality = useMemo(() => !orderedEvaluated.length ? 'N/A' : `${(orderedEvaluated.reduce((a, e) => a + (QUALITY_SCORE[e.quality] ?? 0), 0) / orderedEvaluated.length).toFixed(1)}/5`, [orderedEvaluated]);

  const rank = score > 60 ? 'Principal Auditor' : score > 30 ? 'Senior Consultant' : 'Associate';
  const setMissionStatus = (status, prog) => { setStatusByMission((s) => ({ ...s, [missionIndex]: status })); setProgressByMission((p) => ({ ...p, [missionIndex]: prog })); };

  const resetMissionState = () => { setSelectedEvidence([]); setSelectedOption(''); setFollowUpFeedback(null); setPhase('brief'); };
  const submitEvidence = () => { setScore((s) => s + orderedEvaluated.reduce((a, e) => a + Math.round(e.points * enhancedModes[mode].scoring), 0)); setMissionStatus('Client Responded', 60); setPhase('evaluation'); };
  const submitFollowUp = () => {
    const correct = selectedOption === challenge.bestFollowUpAnswer;
    setScore((s) => s + (correct ? 5 : (mode === 'leadAuditor' ? -8 : -3)));
    setFollowUpFeedback({ correct, message: correct ? challenge.followUpFeedback : 'The answer missed the highest-risk unresolved concern.', strongerAsk: challenge.bestFollowUpAnswer, riskAddressed: challenge.riskAddressed, nextEvidence: challenge.nextEvidence });
    setMissionStatus(challenge.quality?.toLowerCase() === 'unsafe' ? 'Escalated' : 'Follow-Up Required', 82);
    setPhase('followUpFeedback');
  };
  const finishMission = () => { setMissionStatus('Debrief Complete', 100); };

  if (!mission) return <main className='page'><h1>Simulation Complete</h1><p>Final Score: {score}</p></main>;

  return <main className='page'><AuditCommandLayout
    header={<><h1>Evidence Quest Command Center</h1><div className='mode-row'>{Object.entries(enhancedModes).map(([k, cfg]) => <button key={k} className={`option ${k === mode ? 'selected' : ''}`} onClick={() => setMode(k)}>{cfg.label}</button>)}</div></>}
    left={<MissionQueuePanel missions={missions} current={missionIndex} statuses={missions.map((_, i) => statusByMission[i] || statusFlow[0])} progressByMission={progressByMission} onOpenMission={(idx) => { setMissionIndex(idx); resetMissionState(); }} filters={filters} setFilters={setFilters} />}
    right={<><ScorePanel score={score} avgQuality={avgQuality} rank={rank} /><EscalationMeter value={Object.values(statusByMission).filter((s) => s === 'Escalated').length * 15} /></>}
    center={<><ProgressStepper currentStep={stepIndex[phase]} />
      {phase === 'brief' && <MissionBrief mission={mission} variant={variant} modeCfg={enhancedModes[mode]} onNext={() => { setMissionStatus('Evidence Requested', 35); setPhase('evidence'); }} />}
      {phase === 'evidence' && <EvidenceSelection evidenceOptions={modeEvidence} selectedEvidence={selectedEvidence} setSelectedEvidence={setSelectedEvidence} onSubmit={submitEvidence} />}
      {phase === 'evaluation' && <><EvidenceEvaluation evaluated={orderedEvaluated} pointsById={Object.fromEntries(orderedEvaluated.map((e) => [e.id, Math.round(e.points * enhancedModes[mode].scoring)]))} /><button className='primary' onClick={() => setPhase('client')}>Review Client Responses</button></>}
      {phase === 'client' && <><ClientResponseConsole evaluated={orderedEvaluated} /><button className='primary' onClick={() => setPhase('followUp')}>Open Follow-Up Challenge</button></>}
      {phase === 'followUp' && challenge && <FollowUpChallenge challenge={challenge} selectedOption={selectedOption} setSelectedOption={setSelectedOption} onSubmit={submitFollowUp} />}
      {phase === 'followUpFeedback' && <FollowUpFeedbackPanel feedback={followUpFeedback} onContinue={() => setPhase('debrief')} />}
      {phase === 'debrief' && <><ConsultantDebriefCard debrief={mission.consultantDebrief} /><button className='primary' onClick={() => setPhase('fundamentals')}>Continue</button></>}
      {phase === 'fundamentals' && <><FundamentalsCard lesson={mission.fundamentalsLesson} /><button className='primary' onClick={() => setPhase('framework')}>Continue</button></>}
      {phase === 'framework' && <><FrameworkRelevanceCard mappings={mission.frameworkMappings} /><div className='action-row'><button className='primary' onClick={finishMission}>Finish Mission</button><button onClick={() => { setMissionIndex(0); resetMissionState(); }}>Return to Dashboard</button><button onClick={() => { finishMission(); setMissionIndex((i) => i + 1); resetMissionState(); }}>Next Mission</button></div></>}
    </>}
  /></main>;
}
