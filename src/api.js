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
      let data = null;
      if (text) {
        try { data = JSON.parse(text); } catch { data = null; }
      }
      if (!res.ok) {
        const msg = (data && data.error) || (res.status === 401 ? 'Please sign in.' : res.status === 403 ? 'You do not have permission to do that.' : `Request failed (${res.status})`);
        const err = new Error(msg);
        err.status = res.status;
        throw err;
      }
      return data;
    },
    get(path) { return this.request(path); },
    post(path, body) { return this.request(path, { method: 'POST', body: JSON.stringify(body) }); },
    signup(name, email, phone, password, confirmPassword) { return this.post('/auth/signup', { name, email, phone, password, confirmPassword }); },
    login(email, password) { return this.post('/auth/login', { email, password }); },
    logout() { return this.post('/auth/logout'); },
    profile(data) { return this.request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }); },
    state() { return this.get('/state'); },
    surveys() { return this.get('/surveys'); },
    siteSettings() { return this.get('/site-settings'); },
    adminOverview() { return this.get('/admin/overview'); },
    adminSurveys() { return this.get('/admin/surveys'); },
    createSurvey(data) { return this.post('/admin/surveys', data); },
    updateSurvey(id, data) { return this.request(`/admin/surveys/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) }); },
    archiveSurvey(id) { return this.request(`/admin/surveys/${encodeURIComponent(id)}`, { method: 'DELETE' }); },
    restoreSurvey(id) { return this.request(`/admin/surveys/${encodeURIComponent(id)}/restore`, { method: 'PATCH' }); },
    deleteSurvey(id) { return this.request(`/admin/surveys/${encodeURIComponent(id)}/permanent`, { method: 'DELETE' }); },
    adminUsers() { return this.get('/admin/users'); },
    setUserStatus(id, status) { return this.request(`/admin/users/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); },
    adminWithdrawals() { return this.get('/admin/withdrawals'); },
    setWithdrawalStatus(id, status) { return this.request(`/admin/withdrawals/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); },
    adminEvents() { return this.get('/admin/events'); },
    saveSiteSettings(settings) { return this.request('/admin/site-settings', { method: 'PUT', body: JSON.stringify(settings) }); },
    answer(surveyId, questionId, answerIndex) { return this.post('/answers', { surveyId, questionId, answerIndex }); },
    unlock(surveyId) { return this.post(`/surveys/${surveyId}/unlock`); },
    withdraw(name, phone, amount) { return this.post('/withdrawals', { name, phone, amount }); },
    me() { return this.get('/auth/me'); },
    requestPasswordReset(email) { return this.post('/auth/reset-request', { email }); },
    resetPassword(token, password) { return this.post('/auth/reset', { token, password }); },
  };
})(typeof import.meta !== 'undefined' ? import.meta.env.VITE_API_BASE_URL : '');

export default API;
