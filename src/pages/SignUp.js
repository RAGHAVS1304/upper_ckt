import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function SignUp() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      alert('Fill all fields');
      return;
    }

    try {
      const res = await fetch('http://localhost:5001/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (res.ok) {
        alert('Signup successful. Please sign in.');
        navigate('/signin');
      } else {
        alert(data.msg || 'Signup failed');
      }
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  };

  return (
    <div className="auth-card">
      <h3 style={{ textAlign: 'center', marginBottom: 18 }}>{t('signup')}</h3>
      <form onSubmit={handle}>
        <label>{t('name')}</label>
        <input value={name} onChange={e => setName(e.target.value)} className="mt-1" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #eee' }} />
        
        <label style={{ marginTop: 12, display: 'block' }}>{t('email')}</label>
        <input value={email} onChange={e => setEmail(e.target.value)} className="mt-1" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #eee' }} />
        
        <label style={{ marginTop: 12, display: 'block' }}>{t('password')}</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #eee' }} />
        
        <button type="submit" style={{ marginTop: 16, background: '#111', color: '#fff', padding: 10, borderRadius: 8, width: '100%' }}>{t('signup')}</button>
      </form>
      <p style={{ marginTop: 12, textAlign: 'center' }}>
        Already have account? <Link to='/signin'>Sign In</Link>
      </p>
    </div>
  );
}