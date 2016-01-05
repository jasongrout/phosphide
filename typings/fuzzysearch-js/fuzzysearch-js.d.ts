
interface FuzzySearch {
  new (items: any[], config: any): any;
  search(query: string): any[];
  addModule(item: any): void;
}

declare var FuzzySearch: FuzzySearch;

declare module 'fuzzysearch-js' {
  export = FuzzySearch;
}


declare function IndexOfFS(item: any): void;

declare module 'fuzzysearch-js/js/modules/IndexOfFS' {
  // function IndexOfFS(item: any): void;
  export = IndexOfFS;
}


declare function WordCountFS(item: any): void;

declare module 'fuzzysearch-js/js/modules/WordCountFS' {
  export = WordCountFS;
}
