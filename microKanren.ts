import { Substitution, Variable, Term, Association, Maybe, Pair } from "./types";

function isVar(t: Term): t is number {
  return typeof t === "number";
}

function isPair(t: Term): t is Pair {
  return Array.isArray(t) && t.length == 2;
}

function assv(t: Term, subst: Substitution): Maybe<Association> {
  for (let association of subst) {
    if (t === association[0]) return association;
  }
  return false;
}

function walk(t: Term, subst: Substitution): Term {
  let pr: Maybe<Association> = isVar(t) && assv(t, subst);
  return pr ? walk(pr[1], subst) : t;
}

function occurs(vari: Variable, t: Term, subst: Substitution): boolean {
  if (isVar(t)) {
    return vari === t;
  } else if (isPair(t)) {
    return occurs(vari, walk(t[0], subst), subst) || occurs(vari, walk(t[1], subst), subst);
  } else {
    return false;
  }
}

function ext_s(vari: Variable, t: Term, subst: Substitution): Maybe<Substitution> {
  if (occurs(vari, t, subst)) {
    return false;
  } else {
    return [[vari, t], ...subst];
  }
}

function unify(t1: Term, t2: Term, subst: Substitution): Maybe<Substitution> {
  let u = walk(t1, subst);
  let v = walk(t2, subst);

  if (u === v) {
    return subst;
  } else if (isVar(u)) {
    return ext_s(u, v, subst);
  } else if (isVar(v)) {
    return ext_s(v, u, subst);
  } else {
    return false;
  }
}