export const QUALITY_PRIORITY = { unsafe: 5, weak: 4, irrelevant: 3, partial: 2, strong: 1 };
export const QUALITY_SCORE = { Strong: 5, Partial: 3, Weak: 2, Irrelevant: 1, Unsafe: 0 };
const FOLLOW_UP_SEQUENCE = ['unsafe', 'weak', 'partial'];

export function sortEvidenceByPriority(evidence) {
  return [...evidence].sort((a, b) => (QUALITY_PRIORITY[b.quality.toLowerCase()] || 0) - (QUALITY_PRIORITY[a.quality.toLowerCase()] || 0));
}

export function getModeAwareEvidenceOptions(mission, mode) {
  return mission?.modeVariants?.[mode]?.evidenceOptions?.length
    ? mission.modeVariants[mode].evidenceOptions
    : (mission.evidenceOptions || []);
}

export function selectFollowUpEvidence(evidence) {
  if (!evidence.length) return null;
  for (const quality of FOLLOW_UP_SEQUENCE) {
    const match = evidence.find((x) => x.quality.toLowerCase() === quality);
    if (match) return { evidence: match, reason: quality };
  }
  return { evidence: sortEvidenceByPriority(evidence)[0], reason: 'highest-priority' };
}
