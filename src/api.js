const API = (base => {
  const url = (base || (typeof window !== 'undefined' ? '' : '')).replace(/\/$/, '');
  return {
    async request(path, opts = {}) {
      const res = await fetch(`${url}/api${path}`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        ...opts,
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      if (!res.ok) throw new Error((data && data.error) || `Request failed (${res.status})`);
      return data;
    },
    get(path) { return this.request(path); },
    post(path, body) { return this.request(path, { method: 'POST', body: JSON.stringify(body) }); },
    signup(name, email, password) { return this.post('/auth/signup', { name, email, password }); },
    login(email, password) { return this.post('/auth/login', { email, password }); },
    logout() { return this.post('/auth/logout'); },
    me() { return this.get('/auth/me'); },
    state() { return this.get('/state'); },
    answer(surveyId, questionId, answerIndex) { return this.post('/answers', { surveyId, questionId, answerIndex }); },
    unlock(surveyId) { return this.post(`/surveys/${surveyId}/unlock`); },
    withdraw(name, phone, amount) { return this.post('/withdrawals', { name, phone, amount }); },
  };
})(typeof import.meta !== 'undefined' ? import.meta.env.VITE_API_BASE_URL : '');

export default API;