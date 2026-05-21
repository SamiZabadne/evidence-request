import { useEffect, useMemo, useState } from 'react';
import { missions, MODES } from './data/missions';
import { getModeAwareEvidenceOptions, selectFollowUpEvidence, sortEvidenceByPriority } from './engine';
import { AuditCommandLayout, ClientResponseConsole, ConsultantDebriefCard, EscalationMeter, EvidenceEvaluation, EvidenceSelection, FollowUpChallenge, FollowUpFeedbackPanel, FrameworkRelevanceCard, FundamentalsCard, MissionBrief, MissionQueuePanel, ProgressStepper, ScorePanel } from './components/GameComponents';

const MODE_KEY = 'evidence-quest-mode';
const statusFlow = ['New Mission', 'Evidence Requested', 'Client Responded', 'Follow-Up Required', 'Debrief Complete', 'Escalated'];
const stepIndex = { brief: 0, evidence: 1, evaluation: 2, client: 3, followUp: 4, followUpFeedback: 4, debrief: 5, fundamentals: 6, framework: 7 };

const enhancedModes = {
  ...MODES,
  rookie: { ...MODES.rookie, profile: 'Simpler wording + teaching hints', focus: 'Educational path with explicit why-it-matters explanations.' },
  consultant: { ...MODES.consultant, profile: 'Realistic audit wording', focus: 'Practical judgment with similar-looking evidence.' },
  leadAuditor: { ...MODES.leadAuditor, profile: 'Complex sufficiency + stronger penalties', focus: 'Nuanced classification, period, and sample sufficiency decisions.' },
  workshop: { ...MODES.workshop, profile: 'Facilitated prompts + team discussion', focus: 'Group conversation with talking points and optional team score.' },
};
const decorateMission = (m) => ({ ...m, riskLevel: m.id.includes('IAM') ? 'High' : m.id.includes('LOG') ? 'Medium' : 'Low', difficulty: m.id.includes('IAM') ? 'Advanced' : 'Intermediate' });

export default function App() {
  const allMissions = useMemo(() => missions.map(decorateMission), []);
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
  const mission = allMissions[missionIndex];
  const variant = mission?.modeVariants?.[mode];
  const modeEvidence = useMemo(() => getModeAwareEvidenceOptions(mission || {}, mode), [mission, mode]);
  const evaluated = useMemo(() => modeEvidence.filter((e) => selectedEvidence.includes(e.id)), [modeEvidence, selectedEvidence]);
  const orderedEvaluated = useMemo(() => sortEvidenceByPriority(evaluated), [evaluated]);
  const followUpSelection = useMemo(() => selectFollowUpEvidence(orderedEvaluated), [orderedEvaluated]);
  const challenge = followUpSelection?.evidence;

  const avgQuality = useMemo(() => !orderedEvaluated.length ? 'N/A' : `${(orderedEvaluated.reduce((a, e) => a + (e.points > 0 ? 4 : 1), 0) / orderedEvaluated.length).toFixed(1)}/5`, [orderedEvaluated]);
  const rank = score > 60 ? 'Principal Auditor' : score > 30 ? 'Senior Consultant' : 'Associate';
  const setMissionStatus = (status, prog) => { setStatusByMission((s) => ({ ...s, [missionIndex]: status })); setProgressByMission((p) => ({ ...p, [missionIndex]: prog })); };
  const submitEvidence = () => { setScore((s) => s + orderedEvaluated.reduce((a, e) => a + Math.round(e.points * enhancedModes[mode].scoring), 0)); setMissionStatus('Client Responded', 60); setPhase('evaluation'); };
  const submitFollowUp = () => {
    const correct = selectedOption === challenge.bestFollowUpAnswer;
    setScore((s) => s + (correct ? 5 : (mode === 'leadAuditor' ? -8 : -3)));
    setFollowUpFeedback({ correct, message: correct ? (challenge.followUpFeedback || 'Strong follow-up.') : 'This answer missed the highest-risk evidence concern.', strongerAsk: challenge.bestFollowUpAnswer });
    if (challenge.quality?.toLowerCase() === 'unsafe') setMissionStatus('Escalated', 95); else setMissionStatus('Debrief Complete', 95);
    setPhase('followUpFeedback');
  };

  if (!mission) return <main className='page'><h1>Simulation Complete</h1><p>Final Score: {score}</p></main>;

  return <main className='page'>
    <AuditCommandLayout
      header={<><h1>Evidence Quest Command Center</h1><div className='mode-row'>{Object.entries(enhancedModes).map(([k, cfg]) => <button key={k} className={`option ${k === mode ? 'selected' : ''}`} onClick={() => setMode(k)}>{cfg.label}</button>)}</div></>}
      left={<MissionQueuePanel missions={allMissions} current={missionIndex} statuses={allMissions.map((_, i) => statusByMission[i] || statusFlow[0])} progressByMission={progressByMission} onOpenMission={(idx) => { setMissionIndex(idx); setPhase('brief'); setSelectedEvidence([]); setSelectedOption(''); }} filters={filters} setFilters={setFilters} />}
      right={<><ScorePanel score={score} avgQuality={avgQuality} rank={rank} /><EscalationMeter value={Object.values(statusByMission).filter((s) => s === 'Escalated').length * 25} /></>}
      center={<><ProgressStepper currentStep={stepIndex[phase]} />
        {phase === 'brief' && <MissionBrief mission={mission} variant={variant} modeCfg={enhancedModes[mode]} onNext={() => { setMissionStatus('Evidence Requested', 40); setPhase('evidence'); }} />}
        {phase === 'evidence' && <EvidenceSelection evidenceOptions={modeEvidence} selectedEvidence={selectedEvidence} setSelectedEvidence={setSelectedEvidence} onSubmit={submitEvidence} />}
        {phase === 'evaluation' && <><EvidenceEvaluation evaluated={orderedEvaluated} pointsById={Object.fromEntries(orderedEvaluated.map((e) => [e.id, Math.round(e.points * enhancedModes[mode].scoring)]))} /><button className='primary' onClick={() => setPhase('client')}>Review Client Responses</button></>}
        {phase === 'client' && <><ClientResponseConsole evaluated={orderedEvaluated} /><button className='primary' onClick={() => { setMissionStatus('Follow-Up Required', 75); setPhase('followUp'); }}>Open Follow-Up Challenge</button></>}
        {phase === 'followUp' && <FollowUpChallenge challenge={challenge} selectedOption={selectedOption} setSelectedOption={setSelectedOption} onSubmit={submitFollowUp} />}
        {phase === 'followUpFeedback' && <FollowUpFeedbackPanel feedback={followUpFeedback} onContinue={() => setPhase('debrief')} />}
        {phase === 'debrief' && <><ConsultantDebriefCard debrief={mission.consultantDebrief} /><button className='primary' onClick={() => setPhase('fundamentals')}>Continue</button></>}
        {phase === 'fundamentals' && <><FundamentalsCard lesson={mission.fundamentalsLesson} /><button className='primary' onClick={() => setPhase('framework')}>Continue</button></>}
        {phase === 'framework' && <><FrameworkRelevanceCard mappings={mission.frameworkMappings} /><button className='primary' onClick={() => { setMissionIndex((i) => i + 1); setSelectedEvidence([]); setSelectedOption(''); setPhase('brief'); }}>Next Mission</button></>}
      </>}
    />
  </main>;
}
