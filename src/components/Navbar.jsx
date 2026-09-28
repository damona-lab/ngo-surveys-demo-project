import { WalletCards, Landmark } from 'lucide-react';

export default function Navbar({ balance, totalEarned, onWithdraw, onTier }) {
  return <header className="topbar">
    <a className="brand" href="#top"><span className="brand-mark"><img src="/ngo-surveys-mark.jpg" alt="NGO Surveys logo" /></span><span>NGO <b>SURVEYS</b></span></a>
    <nav className="tier-links" aria-label="Survey tiers">
      <button onClick={() => onTier('free')}>Free</button><button onClick={() => onTier('premium')}>Premium</button><button onClick={() => onTier('premium_plus')}>Plus</button>
    </nav>
    <div className="wallet-wrap">
      <div className="wallet"><WalletCards size={18} /><span><small>Wallet balance</small><strong>KSh {balance.toFixed(2)}</strong></span><i>Total earned: KSh {totalEarned.toFixed(2)}</i></div>
      <button className="withdraw-nav" onClick={onWithdraw}><Landmark size={16} /> Withdraw</button>
    </div>
  </header>;
}
