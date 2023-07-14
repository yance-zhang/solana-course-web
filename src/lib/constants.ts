// @ts-nocheck
import intro from './docs/Solana-Basic/what_is_solana.md'
import spl from './docs/Solana-Basic/spl_token.md'
import core from './docs/Solana-Basic/core_concepts.md'
import tool from './docs/Solana-Basic/console.md'
import task from './docs/Solana-Basic/exercise.md'
import wallet from './docs/Solana-Basic/wallet.md'

export type TLessonDTO = {
  number: number;
  title: string;
  meta: string[];
  path: string;
  md?: any;
};

export type TCourseDTO = {
  number: number;
  title: string;
  lessons: TLessonDTO[];
};

export const CourseMap: TCourseDTO[] = [
  {
    number: 1,
    title: 'Solana 基础知识',
    lessons: [
      { number: 1, title: 'Solana介绍', meta: [], path: 'what_is_solana.md', md: intro },
      { number: 2, title: 'Solana核心概念', meta: [], path: '', md: core },
      { number: 3, title: 'SPL 代币', meta: [], path: '', md: spl },
      { number: 4, title: '命令行工具', meta: [], path: '', md: tool },
      { number: 5, title: '钱包使用', meta: [], path: '', md: wallet },
      { number: 6, title: '课后练习', meta: [], path: '', md: task },
    ],
  },
  {
    number: 2,
    title: '通过RPC与Solana交互',
    lessons: [
      { number: 1, title: 'Solana的RPC介绍', meta: [], path: '' },
      { number: 2, title: '接口RPC', meta: [], path: '' },
      { number: 3, title: '推送RPC', meta: [], path: '' },
      { number: 4, title: '课后练习', meta: [], path: '' },
    ],
  },
];
