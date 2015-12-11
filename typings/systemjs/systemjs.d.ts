// Type definitions for SystemJS 1.6
// Project: https://github.com/systemjs/systemjs
// Definitions by: Steven Silvester <https://github.com/blink1073/>

interface System {
  import(name: string): Promise<any>;
}

declare var System: System;

declare module 'systemjs' {
  export = System;
}
