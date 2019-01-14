import React from 'react';
import Link from 'next/link';

const Home = () => {
  return (
    <div>
      <p>Hey from Home!</p>
      <Link href="/sell">
        <a>Go to Sell</a>
      </Link>
    </div>
  );
};

export default Home;
