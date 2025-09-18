import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Records(){
  const { t } = useTranslation();
  const handleDownload = ()=>{
    const blob = new Blob(["Medical history content..."],{type:'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'medical_history.txt'; a.click(); URL.revokeObjectURL(url);
  }
  return (
    <div className="records-container">
      <div className="top-center-label">{t('medical_history')}</div>
      <div className="records-box">
        <p>......................</p>
        <div style={{position:'absolute',right:48,top:110}}>
          <button onClick={handleDownload} style={{background:'transparent',border:'none',fontSize:20}}>⬇️</button>
        </div>
      </div>
    </div>
  )
}
