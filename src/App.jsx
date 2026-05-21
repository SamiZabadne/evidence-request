import { useMemo, useState } from 'react';
import questionBank from './data/questions.json';

const qualityBadge = (points, max) => {
  const pct = (points / max) * 100;
  if (pct >= 90) return 'Strong';
  if (pct >= 65) return 'Partial';
  if (pct >= 40) return 'Weak';
  return 'Unsafe';
};

const rankByScore = (score, max) => {
  const pct = (score / max) * 100;
  if (pct < 40) return 'Evidence Rookie';
  if (pct < 65) return 'Audit Analyst';
  if (pct < 85) return 'Senior Consultant';
  return 'Lead Auditor';
};

export default function App() {
  const levels = questionBank.levels;
  const [screen, setScreen] = useState('home');
  const [levelIndex, setLevelIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const totalQuestions = useMemo(() => levels.reduce((sum, level) => sum + level.questions.length, 0), [levels]);
  const maxScore = levels.flatMap((l) => l.questions).reduce((sum, q) => sum + q.points.evidence + q.points.followUp, 0);

  const currentLevel = levels[levelIndex];
  const currentQuestion = currentLevel?.questions[questionIndex];

  const answeredCount = Object.values(answers).filter((a) => a.stage === 'done').length;
  const score = Object.values(answers).reduce((a, b) => a + (b.pointsEarned || 0) + (b.followUpPoints || 0), 0);
  const progress = Math.round((answeredCount / totalQuestions) * 100);

  const answerState = answers[currentQuestion.id] || { selected: [], stage: 'evidence', followUpSelection: null, pointsEarned: 0, followUpPoints: 0 };

  const toggleOption = (optionIndex) => {
    const prev = answerState.selected;
    const selected = prev.includes(optionIndex) ? prev.filter((i) => i !== optionIndex) : [...prev, optionIndex];
    setAnswers((old) => ({ ...old, [currentQuestion.id]: { ...answerState, selected } }));
  };

  const submitEvidence = () => {
    const selected = answerState.selected;
    const correct = currentQuestion.correctEvidenceOptions;
    const isExact = selected.length === correct.length && selected.every((s) => correct.includes(s));
    setAnswers((old) => ({ ...old, [currentQuestion.id]: { ...answerState, stage: 'curveball', pointsEarned: isExact ? currentQuestion.points.evidence : 0 } }));
  };

  const submitFollowUp = () => {
    const isBest = answerState.followUpSelection === currentQuestion.bestFollowUpAnswer;
    setAnswers((old) => ({ ...old, [currentQuestion.id]: { ...answerState, stage: 'done', followUpPoints: isBest ? currentQuestion.points.followUp : 0 } }));
  };

  const goNext = () => {
    if (questionIndex < currentLevel.questions.length - 1) return setQuestionIndex((i) => i + 1);
    if (levelIndex < levels.length - 1) return setScreen('levelComplete');
    setScreen('final');
  };

  if (screen === 'home') return <div className='page'><Home onStart={() => setScreen('game')} /></div>;
  if (screen === 'levelComplete') return <div className='page'><LevelComplete level={currentLevel} onNext={() => { setLevelIndex((i) => i + 1); setQuestionIndex(0); setScreen('game'); }} /></div>;
  if (screen === 'final') return <div className='page'><Final score={score} max={maxScore} rank={rankByScore(score, maxScore)} quality={qualityBadge(score, maxScore)} onRestart={() => window.location.reload()} /></div>;

  return (
    <div className='page'>
      <header className='topbar'>
        <h1>Evidence Quest: Audit Dialogue Simulator</h1>
        <div className='badges'>
          <span className='badge'>{currentLevel.name}</span>
          <span className='badge'>Mission: {currentQuestion.missionName}</span>
          <span className='badge'>Score: {score}</span>
        </div>
      </header>
      <div className='progress'><div className='fill' style={{ width: `${progress}%` }} /></div>
      <section className='card'>
        <p className='iso'>{currentQuestion.isoReference}</p>
        <h2>Client Scenario</h2>
        <p>{currentQuestion.clientScenario}</p>

        <h3>Evidence Request Selection</h3>
        <div className='options'>
          {currentQuestion.evidenceOptions.map((option, idx) => (
            <button key={option} className={`option ${answerState.selected.includes(idx) ? 'selected' : ''}`} onClick={() => answerState.stage === 'evidence' && toggleOption(idx)}>
              {option}
            </button>
          ))}
        </div>

        {answerState.stage === 'evidence' && <button className='primary' onClick={submitEvidence} disabled={answerState.selected.length === 0}>Submit Evidence Request</button>}

        {answerState.stage !== 'evidence' && (
          <>
            <div className='dialogue'>
              <h3>Client Response</h3>
              <p>{currentQuestion.clientCurveballResponse}</p>
            </div>

            <div className='followup'>
              <h3>Follow-Up Challenge</h3>
              <p>{currentQuestion.followUpQuestion}</p>
              {currentQuestion.followUpAnswerOptions.map((opt, idx) => (
                <button key={opt} className={`option ${answerState.followUpSelection === idx ? 'selected' : ''}`} onClick={() => answerState.stage === 'curveball' && setAnswers((old) => ({ ...old, [currentQuestion.id]: { ...answerState, followUpSelection: idx } }))}>{opt}</button>
              ))}
              {answerState.stage === 'curveball' && <button className='primary' onClick={submitFollowUp} disabled={answerState.followUpSelection === null}>Submit Follow-Up Action</button>}
            </div>
          </>
        )}

        {answerState.stage === 'done' && (
          <>
            <div className='summary'>
              <h3>Risk Impact Summary</h3>
              <p><strong>Risk Type:</strong> {currentQuestion.riskType}</p>
              <p><strong>Assets Involved:</strong> {currentQuestion.assetsInvolved}</p>
              <p><strong>Data Involved:</strong> {currentQuestion.dataInvolved}</p>
              <p><strong>Evidence Quality:</strong> <span className={`quality ${qualityBadge(answerState.pointsEarned + answerState.followUpPoints, currentQuestion.points.evidence + currentQuestion.points.followUp).toLowerCase()}`}>{qualityBadge(answerState.pointsEarned + answerState.followUpPoints, currentQuestion.points.evidence + currentQuestion.points.followUp)}</span></p>
              <p><strong>Audit Judgment:</strong> {currentQuestion.auditJudgment}</p>
              <p><strong>Potential Finding:</strong> {currentQuestion.potentialFinding}</p>
              <p><strong>Consultant Lesson:</strong> {currentQuestion.consultantLesson}</p>
              <p className='points'>Score update: {answerState.pointsEarned}/{currentQuestion.points.evidence} + {answerState.followUpPoints}/{currentQuestion.points.followUp}</p>
            </div>
            <button className='primary' onClick={goNext}>Continue Mission</button>
          </>
        )}
      </section>
    </div>
  );
}

const Home = ({ onStart }) => <section className='card center'><h1>Evidence Quest: ISO 27001 Audit Dialogue</h1><p>Run simulated client conversations, test evidence quality, handle curveballs, and issue risk-based audit judgments.</p><button className='primary' onClick={onStart}>Start Mission</button></section>;
const LevelComplete = ({ level, onNext }) => <section className='card center'><h2>Level Complete: {level.name}</h2><button className='primary' onClick={onNext}>Proceed</button></section>;
const Final = ({ score, max, rank, quality, onRestart }) => <section className='card center'><h2>Final Audit Summary</h2><p>Your score: <strong>{score}</strong> / {max}</p><p>Rank: <span className='rank'>{rank}</span></p><p>Evidence quality badge: <span className={`quality ${quality.toLowerCase()}`}>{quality}</span></p><button className='primary' onClick={onRestart}>Restart Challenge</button></section>;
