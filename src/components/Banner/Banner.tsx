import React from 'react';
import './index.less';
import { history } from 'umi';

export default function Banner({
  lessonPage,
  title,
}: {
  lessonPage?: boolean;
  title?: string;
}) {
  return (
    <div className="banner">
      <h1>{lessonPage ? title : 'Intro to Solana'}</h1>

      {lessonPage ? (
        <div className="back">
          <button className="btn" onClick={() => history.push('/')}>
            Back to Course
          </button>
          <button className="btn share">Share on twitter</button>
        </div>
      ) : (
        <>
          <p className="text-base text-gray-500">by Gametaverse</p>

          <p className="desc max-w-2xl md:text-xl">
            Welcome to the best starting point for Web Developers looking to
            learn Web3 Development. Solana&apos;s high speed, low cost, and
            energy efficiency make it the ideal network to learn on.
          </p>
        </>
      )}
    </div>
  );
}
