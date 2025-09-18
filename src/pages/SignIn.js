import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function SignIn(){
  const { t } = useTranslation();
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const navigate = useNavigate();
  const handle = (e)=>{e.preventDefault();
    // fake auth
    if(email && password) navigate('/');
    else alert('Fill both fields');
  }
  return (
    <div className="auth-card">
      <h3 style={{textAlign:'center',marginBottom:18}}>{t('signin')}</h3>
      <form onSubmit={handle}>
        <label>{t('email')}</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} className="mt-1" style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #eee'}} />
        <label style={{marginTop:12,display:'block'}}>{t('password')}</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-1" style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #eee'}} />
        <button type="submit" style={{marginTop:16,background:'#111',color:'#fff',padding:10,borderRadius:8,width:'100%'}}>{t('signin')}</button>
      </form>
      <p style={{marginTop:12,textAlign:'center'}}>Don't have account? <Link to='/signup'>Sign Up</Link></p>
    </div>
  )
}
