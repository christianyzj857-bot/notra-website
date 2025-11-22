// Type definitions for react-katex
declare module 'react-katex' {
  import { ComponentType, ReactNode } from 'react';

  export interface InlineMathProps {
    children: string;
    math?: string;
    [key: string]: any;
  }

  export interface BlockMathProps {
    children: string;
    math?: string;
    [key: string]: any;
  }

  export const InlineMath: ComponentType<InlineMathProps>;
  export const BlockMath: ComponentType<BlockMathProps>;
}

