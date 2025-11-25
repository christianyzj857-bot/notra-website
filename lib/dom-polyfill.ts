/**
 * DOMMatrix polyfill for Node.js server environment
 * Some libraries (like pdf-parse dependencies) may require DOMMatrix
 * This provides a minimal implementation to prevent "DOMMatrix is not defined" errors
 */

// Only define if we're in Node.js environment and DOMMatrix doesn't exist
if (typeof global !== 'undefined' && typeof global.DOMMatrix === 'undefined') {
  // Minimal DOMMatrix polyfill
  // This is a very basic implementation - most libraries won't actually use it
  // but it prevents the "is not defined" error
  (global as any).DOMMatrix = class DOMMatrix {
    a: number = 1;
    b: number = 0;
    c: number = 0;
    d: number = 1;
    e: number = 0;
    f: number = 0;
    m11: number = 1;
    m12: number = 0;
    m21: number = 0;
    m22: number = 1;
    m41: number = 0;
    m42: number = 0;

    constructor(init?: string | number[]) {
      if (init) {
        // Very basic parsing - most libraries won't use this
        if (typeof init === 'string') {
          // Parse matrix string (simplified)
          const values = init.match(/[\d.-]+/g)?.map(Number) || [];
          if (values.length >= 6) {
            this.a = values[0];
            this.b = values[1];
            this.c = values[2];
            this.d = values[3];
            this.e = values[4];
            this.f = values[5];
          }
        }
      }
    }

    multiply(other: any): DOMMatrix {
      return new DOMMatrix();
    }

    translate(x: number, y: number): DOMMatrix {
      return new DOMMatrix();
    }

    scale(x: number, y?: number): DOMMatrix {
      return new DOMMatrix();
    }

    rotate(angle: number): DOMMatrix {
      return new DOMMatrix();
    }
  };
}

