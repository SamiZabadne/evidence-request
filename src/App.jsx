import { useMemo, useState } from 'react';
import gameData from './data/questions.json';

const rankByScore = (score, max) => {
  const pct = max === 0 ? 0 : (score / max) * 100;
  if (pct < 40) return 'Evidence Rookie';
  if (pct < 65) return 'Audit Analyst';
  if (pct < 85) return 'Senior Consultant';
  return 'Lead Auditor';
};

export default function App() {
  const missions = gameData.missions;
  const [missionIndex, setMissionIndex] = useState(0);
  const [selectedEvidence, setSelectedEvidence] = useState([]);
  const [selectedFollowUp, setSelectedFollowUp] = useState('');
  const [submittedEvidence, setSubmittedEvidence] = useState(false);
  const [submittedFollowUp, setSubmittedFollowUp] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const mission = missions[missionIndex];
  const maxScore = useMemo(
    () => missions.reduce((sum, m) => sum + m.evidenceOptions.filter((o) => o.type === 'strong').reduce((s, o) => s + o.points, 0) + 10, 0),
    [missions]
  );

  const toggleEvidence = (optionId) => {
    if (submittedEvidence) return;
    setSelectedEvidence((prev) => (prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]));
  };

  const submitEvidence = () => {
    const score = mission.evidenceOptions
      .filter((option) => selectedEvidence.includes(option.id))
      .reduce((sum, option) => sum + option.points, 0);
    setFinalScore((s) => s + score);
    setSubmittedEvidence(true);
  };

  const submitFollowUp = () => {
    const correct = mission.followUpOptions.find((o) => o.id === selectedFollowUp)?.isCorrect;
    if (correct) setFinalScore((s) => s + 10);
    setSubmittedFollowUp(true);
  };

  if (!mission) {
    return (
      <div className='page'>
        <section className='card center'>
          <h2>Final Audit Summary</h2>
          <p>Your score: <strong>{finalScore}</strong> / {maxScore}</p>
          <p>Your ranking: <span className='rank'>{rankByScore(finalScore, maxScore)}</span></p>
          <button className='primary' onClick={() => window.location.reload()}>Restart Challenge</button>
        </section>
      </div>
    );
  }

  return (
    <div className='page'>
      <header className='topbar'>
        <h1>Evidence Quest: ISO 27001 Audit Challenge</h1>
        <div className='badges'>
          <span className='badge'>{mission.level}</span>
          <span className='badge'>{mission.missionName}</span>
          <span className='badge'>Score: {finalScore}</span>
        </div>
      </header>

      <section className='card'>
        <p className='iso'>{mission.isoReference}</p>
        <h2>Client Scenario</h2>
        <p>{mission.clientScenario}</p>

        <h3>Evidence Request</h3>
        <div className='options'>
          {mission.evidenceOptions.map((option) => (
            <button
              key={option.id}
              className={`option ${selectedEvidence.includes(option.id) ? 'selected' : ''}`}
              onClick={() => toggleEvidence(option.id)}
            >
              {option.id}. {option.text}
            </button>
          ))}
        </div>

        {!submittedEvidence ? (
          <button className='primary' onClick={submitEvidence} disabled={selectedEvidence.length === 0}>Submit Evidence Selection</button>
        ) : (
          <>
            <h3>Client Curveball</h3>
            <p>{mission.clientCurveball}</p>
            <h3>{mission.followUpQuestion}</h3>
            <div className='options'>
              {mission.followUpOptions.map((option) => (
                <button
                  key={option.id}
                  className={`option ${selectedFollowUp === option.id ? 'selected' : ''}`}
                  onClick={() => !submittedFollowUp && setSelectedFollowUp(option.id)}
                >
                  {option.id}. {option.text}
                </button>
              ))}
            </div>
            {!submittedFollowUp ? (
              <button className='primary' onClick={submitFollowUp} disabled={!selectedFollowUp}>Submit Follow-up</button>
            ) : (
              <>
                <h3>Risk Summary</h3>
                <p><strong>Risk Type:</strong> {mission.riskSummary.riskType}</p>
                <p><strong>Assets Involved:</strong> {mission.riskSummary.assetsInvolved.join(', ')}</p>
                <p><strong>Data Involved:</strong> {mission.riskSummary.dataInvolved}</p>
                <p><strong>Evidence Quality:</strong> {mission.riskSummary.evidenceQuality}</p>
                <p><strong>Audit Judgment:</strong> {mission.riskSummary.auditJudgment}</p>
                <p><strong>Potential Finding:</strong> {mission.riskSummary.potentialFinding}</p>
                <p><strong>Consultant Lesson:</strong> {mission.riskSummary.consultantLesson}</p>
                <button className='primary' onClick={() => setMissionIndex((i) => i + 1)}>Continue</button>
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}
