export const QUALITY_PRIORITY = {
  unsafe: 5,
  weak: 4,
  irrelevant: 3,
  partial: 2,
  strong: 1,
};

export const FOLLOW_UP_SEQUENCE = ['unsafe', 'weak', 'partial'];

export function sortEvidenceByPriority(evidence) {
  return [...evidence].sort((a, b) => (QUALITY_PRIORITY[b.quality.toLowerCase()] || 0) - (QUALITY_PRIORITY[a.quality.toLowerCase()] || 0));
}

export function selectFollowUpEvidence(evidence) {
  if (!evidence.length) return null;
  for (const quality of FOLLOW_UP_SEQUENCE) {
    const match = evidence.find((e) => e.quality.toLowerCase() === quality);
    if (match) return { evidence: match, reason: quality };
  }
  const allStrong = evidence.every((e) => e.quality.toLowerCase() === 'strong');
  if (allStrong) {
    return {
      evidence: {
        id: 'advanced-strong-follow-up',
        quality: 'Strong',
        followUpChallenge: 'All selected evidence is strong. Which advanced challenge should you run next to confirm sufficiency?',
        followUpOptions: [
          'Expand sampling coverage across the full audit period and test operating effectiveness exceptions.',
          'Stop testing because strong evidence was already provided.',
        ],
        bestFollowUpAnswer: 'Expand sampling coverage across the full audit period and test operating effectiveness exceptions.',
        followUpFeedback: 'Strong evidence still requires sufficiency testing for period coverage, sample representativeness, and operating effectiveness.',
      },
      reason: 'strong-advanced',
    };
  }
  return { evidence: sortEvidenceByPriority(evidence)[0], reason: 'highest-priority' };
}

export function getModeAwareEvidenceOptions(mission, mode) {
  return (mission.evidenceOptions || []).map((option) => {
    if (mode === 'rookie') {
      return { ...option, text: `Learning check: ${option.text}`, clientResponse: `${option.clientResponse} Why this matters: ${option.why}` };
    }
    if (mode === 'leadAuditor') {
      return { ...option, text: `${option.text} Include period coverage + sample rationale.`, points: Math.round(option.points * 1.1) };
    }
    if (mode === 'workshop') {
      return { ...option, text: `${option.text} (Workshop prompt: discuss sufficiency as a team.)`, clientResponse: `${option.clientResponse} Talking point: what would you escalate?` };
    }
    return option;
  });
}
