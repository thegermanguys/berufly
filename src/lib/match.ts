import type { CandidateProfile, Vacancy } from '@prisma/client';

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export type MatchCheck = { ok: boolean; label: string };
export type MatchResult = {
  tier: 'unknown' | 'strong' | 'partial' | 'limited';
  pct: number;
  checks: MatchCheck[];
};

// Deliberately rules-based and explainable rather than a black-box
// score, per the product spec: every check states plainly what
// matched and what didn't. Nothing here makes a hiring decision.
export function computeMatch(
  candidate: CandidateProfile | null,
  vacancy: Pick<Vacancy, 'germanLevel' | 'occupation' | 'location' | 'skills'>
): MatchResult {
  if (!candidate) return { tier: 'unknown', pct: 0, checks: [] };
  const checks: MatchCheck[] = [];

  if (vacancy.germanLevel) {
    const need = LEVELS.indexOf(vacancy.germanLevel);
    const have = LEVELS.indexOf(candidate.germanLevel ?? '');
    if (have >= 0 && need >= 0) {
      checks.push({
        ok: have >= need,
        label:
          have >= need
            ? `German level meets requirement (${candidate.germanLevel} ≥ ${vacancy.germanLevel})`
            : `German level below requirement (have ${candidate.germanLevel}, need ${vacancy.germanLevel})`
      });
    } else {
      checks.push({ ok: false, label: `German level not set on your profile (requires ${vacancy.germanLevel})` });
    }
  }

  if (vacancy.occupation) {
    const desired = (candidate.desiredOccupation || '').toLowerCase();
    const target = vacancy.occupation.toLowerCase();
    const ok = !!desired && (desired.includes(target) || target.includes(desired));
    checks.push({ ok, label: ok ? 'Occupation matches your desired role' : 'Occupation differs from your stated desired role' });
  }

  if (vacancy.location) {
    const pref = (candidate.preferredLocations || '').toLowerCase();
    const ok = pref.includes(vacancy.location.toLowerCase());
    checks.push({ ok, label: ok ? 'Location matches your preference' : `Location (${vacancy.location}) outside your stated preference` });
  }

  if (vacancy.skills) {
    const vs = vacancy.skills.toLowerCase().split(',').map((s) => s.trim()).filter(Boolean);
    const cs = (candidate.skills || '').toLowerCase();
    const matched = vs.filter((s) => s && cs.includes(s));
    if (vs.length) {
      checks.push({
        ok: matched.length > 0,
        label: matched.length ? `Skills overlap: ${matched.join(', ')}` : 'No overlapping skills listed'
      });
    }
  }

  const total = checks.length || 1;
  const passed = checks.filter((c) => c.ok).length;
  const pct = Math.round((passed / total) * 100);
  const tier: MatchResult['tier'] = pct >= 75 ? 'strong' : pct >= 40 ? 'partial' : 'limited';
  return { tier, pct, checks };
}
