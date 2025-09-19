import React from 'react';
import { Link } from 'react-router-dom';
import docImg from '../assets/doc.jpg';
import { useTranslation } from 'react-i18next';
import './Home.css';

export default function Home(){
  const { t } = useTranslation();
  return (
    <div className="container">
      <div className="hero-grid">
        <div className="hero-img"><img src={docImg} alt="doctor"/></div>
        <div className="hero-actions">
          <h1 style={{fontSize:20,marginBottom:18}}>{t('slogan')}</h1>
          <Link to="/centres" className="action-btn">{t('locate')}</Link>
          <Link to="/records" className="action-btn">{t('records')}</Link>
          <Link to="/videoconf" className="action-btn">{t('check')}</Link>
          {/* <a className="action-btn" href="">{t('check')}</a> */}
        </div>
      </div>
    </div>
  )
}