import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import API from '../api';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [state, setState] = useState({ balance: 0, totalEarned: 0, surveys: {}, withdrawals: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      const data = await API.me();
      setUser(data.user);
      const s = await API.state();
      setState(s.state);
    } catch {
      setUser(null);
      setState({ balance: 0, totalEarned: 0, surveys: {}, withdrawals: [] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

   async function signup(name, email, phone, password) {
    setError('');
    const data = await API.signup(name, email, phone, password);
    setUser(data.user);
    const s = await API.state();
    setState(s.state);
  }

  async function login(email, password) {
    setError('');
    const data = await API.login(email, password);
    setUser(data.user);
    const s = await API.state();
    setState(s.state);
  }

   async function updateProfile(data) {
    setError('');
    const res = await API.profile(data);
    setUser(res.user);
    return res.user;
  }
  async function logout() {
    await API.logout();
    setUser(null);
    setState({ balance: 0, totalEarned: 0, surveys: {}, withdrawals: [] });
  }

  async function answer(surveyId, questionId, reward) {
    await API.answer(surveyId, questionId, 0);
    setState(s => ({ ...s, balance: +(s.balance + reward).toFixed(2), totalEarned: +(s.totalEarned + reward).toFixed(2), surveys: { ...s.surveys, [surveyId]: { ...s.surveys[surveyId], unlocked: true, completedQuestions: [...(s.surveys[surveyId]?.completedQuestions || []), questionId] } } }));
  }

  async function unlock(surveyId) {
    await API.unlock(surveyId);
    setState(s => ({ ...s, surveys: { ...s.surveys, [surveyId]: { ...s.surveys[surveyId], unlocked: true, completedQuestions: s.surveys[surveyId]?.completedQuestions || [] } } }));
  }

  async function withdraw(amount, name, phone) {
    await API.withdraw(name, phone, amount);
    setState(s => ({ ...s, balance: +(s.balance - amount).toFixed(2), withdrawals: [...s.withdrawals, { amount, at: new Date().toISOString() }] }));
  }

  const value = useMemo(() => ({ user, state, loading, error, signup, login, logout, updateProfile, answer, unlock, withdraw, setError }), [user, state, loading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}