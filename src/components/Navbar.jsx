import { WalletCards, Landmark, User, LogOut } from 'lucide-react';

export default function Navbar({ balance, totalEarned, userName, onWithdraw, onAuth }) {
  return (
    <header className="topbar">
      <a className="brand" href="#top">
        <span className="brand-mark brand-logo"><img src="/logo-mark.svg" alt="" aria-hidden="true" /></span>
        <span className="brand-wordmark">NGO <b>SURVEYS</b></span>
      </a>
      <nav className="tier-links" aria-label="Survey tiers">
        <button onClick={() => document.getElementById('free')?.scrollIntoView({ behavior: 'smooth' })}>Free</button>
        <button onClick={() => document.getElementById('premium')?.scrollIntoView({ behavior: 'smooth' })}>Premium</button>
        <button onClick={() => document.getElementById('premium_plus')?.scrollIntoView({ behavior: 'smooth' })}>Plus</button>
      </nav>
      <div className="wallet-wrap">
        <div className="wallet">
          <WalletCards size={18} />
          <span>
            <small>Wallet balance</small>
            <strong>KSh {balance.toFixed(2)}</strong>
          </span>
          <i>Total earned: KSh {totalEarned.toFixed(2)}</i>
        </div>
        <button className="withdraw-nav" onClick={onWithdraw}><Landmark size={16} /> Withdraw</button>
        <button className="account-btn" onClick={onAuth} title={userName || 'Account'}>
          {userName ? <><User size={16} /> {userName.split(' ')[0]}</> : <><User size={16} /> Sign in</>}
        </button>
      </div>
    </header>
  );
}