import Link from 'next/link';

const Nav = () => (
  <div>
    <Link href="/">
      <a>Go to Home</a>
    </Link>
    <Link href="/sell">
      <a>Go to Sell</a>
    </Link>
  </div>
);

export default Nav;
