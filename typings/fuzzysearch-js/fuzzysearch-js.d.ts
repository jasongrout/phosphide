// Type definitions for FuzzySearchJS
// Project: https://github.com/unlooped/FuzzySearchJS

declare module 'fuzzysearch-js' {

  import FSModule = require('fuzzysearch-js/js/modules/FSModule');

  interface SearchDetail {
    name: string;
    score: number;
    factor: number;
  }

  interface SearchResult<T> {
    value: T;
    score: number;
    details: SearchDetail[];
  }

  interface CombinedPoints {
    combined: number;
    details: SearchDetail[];
  }

  interface FuzzySearch<T> {
    addModule(mod: FSModule): void;
    search(needle: string): SearchResult<T>[];
    getCombinedModulePoints(): CombinedPoints;
    getMaximumScore(): number;
  }

  interface FuzzySearchConstructor {
    new <T>(searchSet: T[], options: any): FuzzySearch<T>;
    prototype: FuzzySearch<any>;
  }

  var FuzzySearch: FuzzySearchConstructor;

  export = FuzzySearch;
}


declare module 'fuzzysearch-js/js/modules/FSModule' {

  interface FSModule {
    search(term: string, haystack: string): FSModule;
    getPoints(): number;
    getMatches(): string[];
    getFactor(): number;
    getName(): string;
  }

  interface FSModuleConstructor {
    new (options: any): FSModule;
    prototype: FSModule;
  }

  var FSModule: FSModuleConstructor;

  export = FSModule;
}


declare module 'fuzzysearch-js/js/modules/IndexOfFS' {

  import FSModule = require('fuzzysearch-js/js/modules/FSModule');

  interface IndexOfFS extends FSModule {
    search(term: string, haystack: string): IndexOfFS;
    getClosestMatch(term: string, haystack: string): string;
  }

  function IndexOfFS(options: any): IndexOfFS;

  export = IndexOfFS;
}


declare module 'fuzzysearch-js/js/modules/WordCountFS' {

  import FSModule = require('fuzzysearch-js/js/modules/FSModule');

  interface WordCountFS extends FSModule  {
    search(term: string, haystack: string): WordCountFS;
  }

  function WordCountFS(options: any): WordCountFS;

  export = WordCountFS;
}
