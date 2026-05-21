export const MODES = {
  rookie: { label: 'Rookie Mode', scoring: 1.25, hintLevel: 'High' },
  consultant: { label: 'Consultant Mode', scoring: 1, hintLevel: 'Moderate' },
  leadAuditor: { label: 'Lead Auditor Mode', scoring: 0.85, hintLevel: 'Low' },
  workshop: { label: 'Workshop Mode', scoring: 1, hintLevel: 'Facilitator' },
};

const e = (id, text, quality, designOrOperating, points, clientResponse, followUpChallenge, followUpOptions, bestFollowUpAnswer, followUpFeedback, why, betterRequest, riskAddressed, nextEvidence) => ({
  id, text, quality, designOrOperating, points, clientResponse, followUpChallenge, followUpOptions, bestFollowUpAnswer, followUpFeedback, why, betterRequest, riskAddressed, nextEvidence,
});

const withVariants = (base, rookie, consultant, leadAuditor, workshop) => ({
  ...base,
  modeVariants: {
    ...base.modeVariants,
    rookie: { ...base.modeVariants.rookie, evidenceOptions: rookie },
    consultant: { ...base.modeVariants.consultant, evidenceOptions: consultant },
    leadAuditor: { ...base.modeVariants.leadAuditor, evidenceOptions: leadAuditor },
    workshop: { ...base.modeVariants.workshop, evidenceOptions: workshop },
  },
});

const baseMode = (objective) => ({
  rookie: { clientScenario: `Learning scenario: ${objective}`, auditObjective: objective, hint: 'Pick evidence with approvals and dates.' },
  consultant: { clientScenario: `Client statement: ${objective}`, auditObjective: objective, hint: 'Check period coverage and ownership.' },
  leadAuditor: { clientScenario: `Lead review: ${objective}`, auditObjective: `Test sufficiency, sampling, and classification: ${objective}`, hint: 'Challenge sampling, exceptions, and period alignment.' },
  workshop: { clientScenario: `Workshop case: ${objective}`, auditObjective: `Group objective: ${objective}`, discussionPrompt: 'What would stand up in external audit?', facilitatorNotes: 'Ask each group to defend one request and one rejection.', hint: 'Facilitator: force a risk-based rationale.' },
});

const debrief = (riskType, assetsInvolved, dataInvolved) => ({
  riskType, assetsInvolved, dataInvolved, ciaImpact: 'Confidentiality, Integrity, Availability', auditJudgment: 'Evidence sufficiency depends on period coverage, completeness, and independent approval.', potentialFinding: 'Gaps indicate control operation risk during the audit period.', recommendedFollowUp: 'Expand sample and trace exceptions to closure.', consultantLesson: 'Tie each request to risk and assertion.', commonMistake: 'Treating screenshots as final evidence.',
});

const fundamentals = (whatItMeans, riskReduced, goodEvidence, analogy) => ({
  whatItMeans,
  whyAuditorsCare: 'Auditors need repeatable, traceable proof that the control works in practice.',
  riskReduced,
  goodEvidence,
  commonMistake: 'Requesting policy docs without in-period operational proof.',
  analogy,
});

export const missions = [
  withVariants({
    id: 'IAM-001', domain: 'Identity & Access Management', missionName: 'The Identity Vault', riskLevel: 'High', difficulty: 'Intermediate', estimatedTime: '12 min', domainIcon: '🔐', frameworkTags: ['ISO27001 A.5', 'NIST PR.AC'], modeVariants: baseMode('Validate access provisioning, review, and deprovisioning controls.'),
    consultantDebrief: debrief('Unauthorized access', ['Finance App A', 'HR System B'], 'Entitlement and identity records'),
    fundamentalsLesson: fundamentals('IAM ensures users receive only required access and lose it promptly when no longer needed.', 'Unauthorized system use and orphaned accounts', 'Approved tickets, review sign-off, privileged access logs, deprovisioning timestamps', 'Like issuing and reclaiming office badges with logs.'),
    frameworkMappings: [{ framework: 'ISO/IEC 27001:2022', controlId: 'A.5.15', controlName: 'Access control', relevance: 'Requires controlled provisioning and review.' }],
    evidenceOptions: [],
  },
  [e('iam-r1','Show 5 approved joiner tickets with grant dates.','Strong','Operating',9,'Two were granted before approval due to emergency queue.','What do you ask next?',['Ask for emergency approval SLA evidence.','Ignore because approvals exist later.'],'Ask for emergency approval SLA evidence.','Good follow-up confirms exception governance.','Tests timing discipline.','Request emergency exception log and approvals.','Late approvals create unauthorized access window.','Emergency workflow monitoring report.')],
  [e('iam-c1','Provide in-period sample of JML tickets including manager approvals and deprovisioning timestamps.','Strong','Both',10,'Sample includes one 9-day late deprovisioning record.','Best consultant follow-up?',['Request root-cause and compensating monitoring for late removal.','Accept because only one exception exists.'],'Request root-cause and compensating monitoring for late removal.','Correct: classify exception and test whether isolated.','Covers design and operation.','Expand sample for leavers in same business unit.','Orphaned account risk.','Leaver aging report and corrective actions.')],
  [e('iam-l1','Submit statistically justified sample of privileged access changes across audit period with approval segregation evidence.','Partial','Operating',6,'Approvals exist, but sample excludes quarter-end change window.','How classify sufficiency?',['Request additional sample for excluded high-risk period before judgment.','Conclude operating effectiveness immediately.'],'Request additional sample for excluded high-risk period before judgment.','Right call: sample scope is insufficient for conclusion.','Tests period and sample sufficiency.','Add quarter-end privileged change sample with reviewer independence.','Privileged misuse during high-change windows.','PAM session logs mapped to sampled changes.')],
  [e('iam-w1','Team prompt: choose one IAM evidence request that is defensible and one that is weak, then explain why.','Strong','Design',8,'Facilitator note: team selected ticket sample and rejected password list request.','Group scoring prompt?',['Score rationale on risk linkage, period coverage, and traceability.','Score only by confidence level.'],'Score rationale on risk linkage, period coverage, and traceability.','Effective workshop discussion links request quality to audit assertions.','Workshop reasoning exercise.','Ask team to draft a stronger follow-up ask for one exception.','Decision quality drift in team assessments.','Consensus checklist with evidence sufficiency criteria.')]),

  ...['Asset Management','Incident Management','Cloud Security','Third-Party Security','BCP / DR / Backup'].map((d, i) => {
    const ids = ['AST','INC','CLD','TPR','BCP'];
    const id = `${ids[i]}-001`;
    return withVariants({
      id, domain: d, missionName: `${d} Control Checkpoint`, riskLevel: i < 2 ? 'High' : 'Medium', difficulty: i % 2 ? 'Intermediate' : 'Advanced', estimatedTime: '10 min', domainIcon: ['📦','🚨','☁️','🤝','🛟'][i], frameworkTags: ['ISO27001', 'NIST'],
      modeVariants: baseMode(`Assess ${d.toLowerCase()} control design and operation.`), consultantDebrief: debrief(`${d} control weakness`, [`${d} Platform`], `${d} records and logs`),
      fundamentalsLesson: fundamentals(`${d} controls ensure governance is planned and executed consistently.`, `Operational and compliance failures in ${d.toLowerCase()}.`, `${d} register, approvals, testing output, and exception closure evidence`, `Like checking both the blueprint and the maintenance log.`),
      frameworkMappings: [{ framework: 'ISO/IEC 27001:2022', controlId: 'A.5/A.8', controlName: d, relevance: `Maps to ${d} governance and operational control requirements.` }], evidenceOptions: [],
    },
    [e(`${id}-r`,`Learning pick: show beginner-friendly in-period ${d} checklist with owner sign-off.`,'Strong','Design',8,`Client shares ${d} checklist; one owner missing.`,'Easy follow-up?',['Ask who approved the missing owner item and get closure proof.','Skip because most lines are complete.'],'Ask who approved the missing owner item and get closure proof.','Good: keep follow-up specific and traceable.','Simple but valid beginner evidence request.','Request signed completion for the missing row.','Unowned control activity.','Owner assignment and closure evidence.')],
    [e(`${id}-c`,`Provide audit-period ${d} sample set with approvals, timestamps, and exception records.`,'Partial','Both',6,`Client provides records but one exception lacks closure evidence.`,'Consultant follow-up?',['Request exception closure owner/date and retest evidence.','Accept exception note without closure proof.'],'Request exception closure owner/date and retest evidence.','Right: unresolved exceptions can invalidate operating conclusion.','Moderate ambiguity in real audits.','Ask for closure ticket and retest output.','Residual risk from open exceptions.','Retest evidence and management sign-off.')],
    [e(`${id}-l`,`Provide sufficiency package for ${d} covering full audit period with risk-based sampling rationale.`,'Partial','Operating',5,`Package excludes highest-risk month due to tooling migration.`,'Lead action?',['Require supplemental sample and classify preliminary scope limitation.','Proceed with clean conclusion.'],'Require supplemental sample and classify preliminary scope limitation.','Correct: missing high-risk period undermines sufficiency.','Advanced sufficiency challenge.','Request migration-month logs and compensating control evidence.','Blind spot during transition period.','Supplemental period sample plus exception assessment.')],
    [e(`${id}-w`,`Workshop prompt: rank three ${d} evidence asks from strongest to weakest and justify as a team.`,'Strong','Design',7,`Facilitator note: teams disagree on sufficiency threshold.`,'Facilitator scoring?',['Score justification quality, not just final ranking.','Score only if team consensus is reached.'],'Score justification quality, not just final ranking.','Good workshop output emphasizes reasoning quality.','Discussion-based evidence quality training.','Have each team submit one improved ask.','Inconsistent audit reasoning across team members.','Improved ask with risk linkage and scope.')]);
  }),
];
