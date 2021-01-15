import { Substitution, Variable, Term, Association, Maybe, Pair, State, Goal } from "./types";

export function isVar(t: Term): t is number {
  return typeof t === "number";
}

export function isPair(t: Term): t is Pair {
  return Array.isArray(t) && t.length == 2;
}

export function assv(t: Term, subst: Substitution): Maybe<Association> {
  for (let association of subst) {
    if (t === association[0]) return association;
  }
  return false;
}

export function walk(t: Term, subst: Substitution): Term {
  let pr: Maybe<Association> = isVar(t) && assv(t, subst);
  return pr ? walk(pr[1], subst) : t;
}

export function occurs(vari: Variable, t: Term, subst: Substitution): boolean {
  if (isVar(t)) {
    return vari === t;
  } else if (isPair(t)) {
    return occurs(vari, walk(t[0], subst), subst) || occurs(vari, walk(t[1], subst), subst);
  } else {
    return false;
  }
}

export function ext_s(vari: Variable, t: Term, subst: Substitution): Maybe<Substitution> {
  if (occurs(vari, t, subst)) {
    return false;
  } else {
    return [[vari, t], ...subst];
  }
}

export function unify(t1: Term, t2: Term, subst: Substitution): Maybe<Substitution> {
  let u = walk(t1, subst);
  let v = walk(t2, subst);

  if (u === v) {
    return subst;
  } else if (isVar(u)) {
    return ext_s(u, v, subst);
  } else if (isVar(v)) {
    return ext_s(v, u, subst);
  } else if (isPair(u) && isPair(v)) {
    let new_s = unify(u[0], v[0], subst)
    return new_s && unify(u[1], v[1], new_s);
  } else {
    return false;
  }
}

export function equals(u: Term, v: Term): Goal {
  return (st: State): State[] => {
    let s = st[0];
    let var_ct = st[1];
    let new_s = unify(u, v, s);

    if (new_s) return [[new_s, var_ct]];
    else return [];
  }
}

export function fake_run(g: Goal): State[] {
  return g([[], 0]);
}

export function call_fresh(f: (v: Variable) => Goal): Goal {
  return (state: State) => {
    let s = state[0]
    let c = state[1]
    return f(c)([s, c + 1]);
  }
}

export function disj(g1: Goal, g2: Goal): Goal {
  return (state: State): State[] => {
    return [...g1(state), ...g2(state)];
  }
}

export function conj(g1: Goal, g2: Goal): Goal {
  return (state: State) => {
    return g1(state).reduce((prev_stream: State[], next_state: State): State[] => {
      return prev_stream.concat(g2(next_state));
    }, []);
  }
}

// Unsure of the following three functions

export function pull($: any): any {
  if (typeof $ === 'function') {
    return pull($())
  } else {
    return $;
  }
}

export function take(n: Variable, $: State[]): State[] {
  if (n == 0) {
    return [];
  } else if ($.length == 0) {
    return [];
  } else if (n == 1) {
    return [pull($)[0]];
  } else {
    let p$ = pull($);
    return [p$[0], ...take(n-1, p$[1])];
  }
}

export function run(n: Variable, g: Goal): State[] {
  return take(n, fake_run(g));
}