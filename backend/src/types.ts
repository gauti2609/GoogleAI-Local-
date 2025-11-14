// Types used by the backend API

export interface MajorHead {
  code: string;
  name: string;
}

export interface MinorHead {
  code: string;
  name: string;
  majorHeadCode: string;
}

export interface Grouping {
  code: string;
  name: string;
  minorHeadCode: string;
}

export interface Masters {
  majorHeads: MajorHead[];
  minorHeads: MinorHead[];
  groupings: Grouping[];
}

export interface MappingSuggestion {
  majorHeadCode: string;
  minorHeadCode: string;
  groupingCode: string;
  confidence: number;
  reasoning: string;
}
