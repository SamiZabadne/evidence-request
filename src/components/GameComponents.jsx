import React from 'react';

export const FrameworkBadge = ({ tag }) => <span className='badge framework'>{tag}</span>;
export const RiskHeatBadge = ({ risk }) => <span className={`badge risk ${risk.toLowerCase()}`}>{risk}</span>;
export const CIAImpactChips = ({ value }) => <div className='chips'>{String(value).split(',').map((v) => <span key={v} className='chip'>{v.trim()}</span>)}</div>;

export function ProgressStepper({ phase }) {
  const steps = ['brief', 'evidence', 'evaluation', 'debrief'];
  return <div className='stepper'>{steps.map((s, i) => <div key={s} className={`step ${phase === s ? 'active' : steps.indexOf(phase) > i ? 'done' : ''}`}>{s}</div>)}</div>;
}

export function ScorePanel({ score, avgQuality, rank }) {
  return <section className='card score-panel'><h3>Score Panel</h3><p className='score'>{score}</p><p>Avg Evidence Quality: {avgQuality}</p><p>Rank: {rank}</p></section>;
}

export function ModeSelectionScreen({ modes, mode, setMode, onContinue }) {
  return <section className='card'><h1>Evidence Quest · Mode Selection</h1><div className='grid modes'>{Object.entries(modes).map(([key, cfg]) => <button key={key} className={`option ${mode===key?'selected':''}`} onClick={() => setMode(key)}><b>{cfg.label}</b><small>{cfg.profile}</small></button>)}</div><button className='primary' onClick={onContinue}>Enter Mission Control</button></section>;
}

export function AuditMissionQueue({ missions, current, statuses, progressByMission }) {
  return <section className='card'><h3>Audit Mission Queue</h3><div className='queue'>{missions.map((m, idx) => <article key={m.id} className={`mission-card ${current===idx?'active':''}`}><header><h4>{m.missionName}</h4><span>{m.domain}</span></header><div className='line'><RiskHeatBadge risk={m.riskLevel} /><span>Difficulty: {m.difficulty}</span><span>Status: {statuses[idx]}</span></div><div className='line'>{m.frameworkTags.map((tag) => <FrameworkBadge key={tag} tag={tag} />)}</div><div className='progress'><div style={{width:`${progressByMission[idx]||0}%`}} /></div></article>)}</div></section>;
}

export function MissionControlDashboard({stats, onStart, onMode, children}) {
  return <section className='card'><h2>Mission Control Dashboard</h2><div className='stats-grid'>{Object.entries(stats).map(([k,v]) => <div key={k} className='stat'><small>{k}</small><b>{v}</b></div>)}</div>{children}<div className='row'><button className='option' onClick={onMode}>Change Mode</button><button className='primary' onClick={onStart}>Launch Mission</button></div></section>;
}

export const MissionBrief = ({ mission, variant, modeCfg, onNext }) => <section className='card'><h2>{mission.missionName}</h2><p>{variant.clientScenario}</p><p><b>Objective:</b> {variant.auditObjective}</p><p><b>Mode Focus:</b> {modeCfg.focus}</p><p><b>Hint:</b> {variant.hint}</p>{variant.facilitatorNotes && <p><b>Facilitator notes:</b> {variant.facilitatorNotes}</p>}{variant.discussionPrompt && <p><b>Discussion:</b> {variant.discussionPrompt}</p>}<button className='primary' onClick={onNext}>Open Evidence Request</button></section>;

export const EvidenceSelection = ({ mission, selectedEvidence, setSelectedEvidence, onSubmit }) => <section className='card'><h3>Evidence Selection</h3>{mission.evidenceOptions.map((e) => <label key={e.id} className='evidence-row'><input type='checkbox' checked={selectedEvidence.includes(e.id)} onChange={() => setSelectedEvidence((prev)=>prev.includes(e.id)?prev.filter((id)=>id!==e.id):[...prev,e.id])} /> {e.text}</label>)}<button className='primary' disabled={!selectedEvidence.length} onClick={onSubmit}>Submit Evidence</button></section>;

export const EvidenceEvaluation = ({ evaluated, pointsById }) => <section className='card'><h3>Evidence Evaluation</h3>{evaluated.map((e)=><div key={e.id} className='alert'><p><b>Evidence:</b> {e.text}</p><p><b>Quality:</b> {e.quality}</p><p><b>Design/Operating:</b> {e.designOrOperating}</p><p><b>Points:</b> {pointsById[e.id]}</p><p><b>Why it matters:</b> {e.why}</p><p><b>Better request:</b> {e.betterRequest}</p></div>)}</section>;

export const ClientResponseConsole = ({ evaluated, followUpChallenge }) => <section className='card console'><h3>Client Response Console</h3>{evaluated.map((e)=><pre key={e.id}>{`> client-response: ${e.clientResponse}\n> evidence-status: ${e.quality} | ${e.designOrOperating}`}</pre>)}<pre>{`> auditor-follow-up: ${followUpChallenge?.followUpChallenge || 'N/A'}`}</pre></section>;

export const FollowUpChallenge = ({ challenge, selectedOption, setSelectedOption, onSubmit }) => <section className='card'><h3>Follow-up Challenge</h3><p>{challenge.followUpChallenge}</p><select value={selectedOption} onChange={(e)=>setSelectedOption(e.target.value)}><option value=''>Select follow-up answer</option>{challenge.followUpOptions.map((o)=><option key={o} value={o}>{o}</option>)}</select><button className='primary' disabled={!selectedOption} onClick={onSubmit}>Submit Follow-up</button></section>;

export const ConsultantDebriefCard = ({ debrief }) => <section className='card'><h3>Consultant Debrief</h3><p><b>Risk:</b> {debrief.riskType}</p><p><b>Assets:</b> {debrief.assetsInvolved.join(', ')}</p><p><b>Data:</b> {debrief.dataInvolved}</p><p><b>Audit judgment:</b> {debrief.auditJudgment}</p><p><b>Potential finding:</b> {debrief.potentialFinding}</p><p><b>Recommended follow-up:</b> {debrief.recommendedFollowUp}</p><p><b>Lesson:</b> {debrief.consultantLesson}</p><p><b>Common mistake:</b> {debrief.commonMistake}</p><CIAImpactChips value={debrief.ciaImpact} /></section>;

export const FundamentalsCard = ({ lesson }) => <section className='card'><h4>Fundamentals</h4><p>{lesson.whatItMeans}</p><p>{lesson.whyAuditorsCare}</p><p>{lesson.riskReduced}</p><p>{lesson.goodEvidence}</p><p>{lesson.commonMistake}</p><p>{lesson.analogy}</p></section>;

export const FrameworkRelevanceCard = ({ mappings }) => <section className='card'><h4>Framework Relevance</h4>{mappings.map((m)=><p key={m.controlId}><FrameworkBadge tag={m.framework} /> {m.controlId} — {m.controlName}: {m.relevance}</p>)}</section>;
