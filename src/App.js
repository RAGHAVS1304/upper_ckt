import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Centres from './pages/Centres';
import Records from './pages/Records';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import { useTranslation } from 'react-i18next';

function Header(){ 
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  return (
    <header className="header">
      <div style={{display:'flex',alignItems:'center'}}>
        <div className="brand">{t('brand')}</div>
        <div className="header-center">
          <Link to="/" className="pill">{t('home')}</Link>
        </div>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:12}}>
      <select
        className="lang-select"
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
      >
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
        <option value="pa">ਪੰਜਾਬੀ</option>
      </select>
        <button onClick={()=>navigate('/signin')} className="pill">{t('signin')}</button>
      </div>
    </header>
  )
}

export default function App(){
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/centres' element={<Centres/>} />
        <Route path='/records' element={<Records/>} />
        <Route path='/signin' element={<SignIn/>} />
        <Route path='/signup' element={<SignUp/>} />
      </Routes>
    </BrowserRouter>
  )
}
