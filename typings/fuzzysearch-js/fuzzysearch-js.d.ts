
interface FuzzySearch {
  new (items: any[], config: any): any;
  search(query: string): any[];
  addModule(item: any): void;
}

declare var FuzzySearch: FuzzySearch;

declare module 'fuzzysearch-js' {
  export = FuzzySearch;
}
