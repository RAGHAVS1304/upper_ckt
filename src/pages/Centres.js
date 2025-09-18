import React, {useState} from 'react';
import { useTranslation } from 'react-i18next';

export default function Centres(){
  const { t } = useTranslation();
  const [q, setQ] = useState('');
  const locations = ['Location 1','Location 2','Location 3','Location 4'];
  const filtered = locations.filter(l=>l.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="search-wrap">
      <div className="search-inner">
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder={t('find_medicine')} style={{flex:1,padding:10,borderRadius:20,border:'1px solid #eee'}} />
          <button style={{padding:10,borderRadius:10}}>🔍</button>
        </div>

        <div style={{marginTop:18}}>
          {filtered.map((l,i)=>(<div key={i} className="list-item">• {l}</div>))}
        </div>
      </div>
    </div>
  )
}
