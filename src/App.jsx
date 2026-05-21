import { useMemo, useState } from 'react';
import questionBank from './data/questions.json';

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

  const totalQuestions = useMemo(
    () => levels.reduce((sum, level) => sum + level.questions.length, 0),
    [levels]
  );
  const maxScore = totalQuestions * 10;

  const currentLevel = levels[levelIndex];
  const currentQuestion = currentLevel?.questions[questionIndex];

  const answeredCount = Object.keys(answers).length;
  const score = Object.values(answers).reduce((a, b) => a + b.pointsEarned, 0);
  const progress = Math.round((answeredCount / totalQuestions) * 100);

  const toggleOption = (qid, optionIndex) => {
    const prev = answers[qid]?.selected ?? [];
    const selected = prev.includes(optionIndex)
      ? prev.filter((i) => i !== optionIndex)
      : [...prev, optionIndex];
    setAnswers((old) => ({ ...old, [qid]: { ...old[qid], selected, locked: false, pointsEarned: 0 } }));
  };

  const lockAnswer = (question) => {
    const selected = answers[question.id]?.selected ?? [];
    const correct = question.correctAnswers;
    const isExact = selected.length === correct.length && selected.every((s) => correct.includes(s));
    setAnswers((old) => ({
      ...old,
      [question.id]: {
        ...old[question.id],
        selected,
        locked: true,
        pointsEarned: isExact ? question.points : 0,
      },
    }));
  };

  const goNext = () => {
    if (questionIndex < currentLevel.questions.length - 1) {
      setQuestionIndex((i) => i + 1);
      return;
    }
    if (levelIndex < levels.length - 1) {
      setScreen('levelComplete');
    } else {
      setScreen('final');
    }
  };

  const startNextLevel = () => {
    setLevelIndex((i) => i + 1);
    setQuestionIndex(0);
    setScreen('game');
  };

  if (screen === 'home') return <div className='page'><Home onStart={() => setScreen('game')} /></div>;
  if (screen === 'levelComplete') return <div className='page'><LevelComplete level={currentLevel} onNext={startNextLevel} /></div>;
  if (screen === 'final') return <div className='page'><Final score={score} max={maxScore} rank={rankByScore(score, maxScore)} onRestart={() => window.location.reload()} /></div>;

  const answerState = answers[currentQuestion.id] || { selected: [], locked: false, pointsEarned: 0 };
  return (
    <div className='page'>
      <header className='topbar'>
        <h1>Evidence Quest: ISO 27001 Audit Challenge</h1>
        <div className='badges'>
          <span className='badge'>{currentLevel.name}</span>
          <span className='badge'>Score: {score}</span>
          <span className='badge'>Progress: {progress}%</span>
        </div>
      </header>
      <div className='progress'><div className='fill' style={{ width: `${progress}%` }} /></div>
      <section className='card'>
        <p className='iso'>{currentQuestion.isoReference}</p>
        <h2>Scenario</h2>
        <p>{currentQuestion.scenario}</p>
        <h3>Choose the strongest evidence:</h3>
        <div className='options'>
          {currentQuestion.options.map((option, idx) => {
            const selected = answerState.selected.includes(idx);
            const isCorrect = currentQuestion.correctAnswers.includes(idx);
            return (
              <button key={option} className={`option ${selected ? 'selected' : ''} ${answerState.locked ? (isCorrect ? 'correct' : selected ? 'wrong' : '') : ''}`} onClick={() => !answerState.locked && toggleOption(currentQuestion.id, idx)}>
                {option}
              </button>
            );
          })}
        </div>
        {!answerState.locked ? (
          <button className='primary' onClick={() => lockAnswer(currentQuestion)} disabled={answerState.selected.length === 0}>Submit Evidence Selection</button>
        ) : (
          <>
            <div className='feedback'>
              {currentQuestion.options.map((_, idx) => (
                <p key={idx}><strong>Option {idx + 1}:</strong> {currentQuestion.feedback[idx]}</p>
              ))}
              <p className='points'>Points earned: {answerState.pointsEarned} / {currentQuestion.points}</p>
            </div>
            <button className='primary' onClick={goNext}>Continue</button>
          </>
        )}
      </section>
    </div>
  );
}

function Home({ onStart }) {
  return <section className='card center'><h1>Evidence Quest: ISO 27001 Audit Challenge</h1><p>Step into the role of an ISO/IEC 27001:2022 auditor. Review each client scenario and request the strongest audit evidence. Avoid trap responses, maximize your score, and prove your consulting judgment.</p><button className='primary' onClick={onStart}>Start Audit Mission</button></section>;
}

function LevelComplete({ level, onNext }) {
  return <section className='card center'><h2>Level Complete: {level.name}</h2><p>You have finished this control area. Prepare for the next audit domain.</p><button className='primary' onClick={onNext}>Proceed to Next Level</button></section>;
}

function Final({ score, max, rank, onRestart }) {
  return <section className='card center'><h2>Final Audit Summary</h2><p>Your score: <strong>{score}</strong> / {max}</p><p>Your ranking: <span className='rank'>{rank}</span></p><ul><li>Evidence Rookie</li><li>Audit Analyst</li><li>Senior Consultant</li><li>Lead Auditor</li></ul><button className='primary' onClick={onRestart}>Restart Challenge</button></section>;
}
