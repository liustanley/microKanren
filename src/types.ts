export type Variable = number;

export type Symbol = string;
export type Boolean = boolean;
export type Empty = [];
export type Pair = [Term, Term];

export type AtomicTerm = Symbol | Variable | Boolean | Empty;
export type Term = AtomicTerm | Pair;

export type Association = [number, Term];
export type Substitution = Association[]; // cannot have cycles

export type Maybe<T> = T | false;

export type State = [Substitution, number];
export type Goal = (s: State) => State[];