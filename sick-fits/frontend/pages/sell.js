import React from 'react';
import Link from 'next/link';

const Sell = () => {
  return (
    <div>
      <p>Hey from Sell!</p>
      <Link href="/">
        <a>Go to Home</a>
      </Link>
    </div>
  );
};

export default Sell;
