import React, {useState} from 'react';
import { useTranslation } from 'react-i18next';

export default function Centres(){
  const { t } = useTranslation();
  const [q, setQ] = useState('');

  // Nabha region (Punjab) + nearby hospitals/clinics/health centres
  const locations = [
    "Civil Hospital Nabha",
    "Guru Nanak Mission Hospital Nabha",
    "Dr. Karam Singh Memorial Hospital",
    "Rajindra Hospital Patiala",
    "Fortis Hospital Mohali",
    "Apollo Clinic Nabha",
    "Singh Medical Centre",
    "Grewal Hospital Nabha",
    "Khera Child Care Hospital",
    "City Care Clinic Nabha",
    "Nabha Heart & Multispeciality Hospital",
    "Khalsa Hospital Nabha",
    "Bansal Orthopaedic Hospital",
    "Verma Dental & Medical Centre",
    "Anand Maternity Home",
    "Surya Hospital Nabha",
    "Meharban Hospital Nabha",
    "Chahal Eye & Maternity Centre",
    "Jain Medical Centre Nabha",
    "Medicity Hospital Patiala",
    "Dayanand Medical College Hospital Ludhiana",
    "Shree Ram Hospital Nabha",
    "Gill Hospital Nabha",
    "Khanna Nursing Home",
    "Pooja Hospital Nabha",
    "Sunny Hospital Nabha",
    "Deep Hospital Nabha",
    "Sukhmani Hospital Patiala",
    "Global Health Care Nabha",
    "Amrit Hospital Nabha",
    "Kapur Multispeciality Hospital",
    "Modern Hospital Nabha",
    "Life Line Hospital Nabha",
    "Friends Hospital Nabha",
    "Nehru Hospital PGIMER Chandigarh",
    "Amritsar Civil Hospital",
    "Bhagat Hospital Nabha",
    "Punjab Institute of Medical Sciences Jalandhar",
    "Akal Charitable Hospital Nabha",
    "Chhabra Hospital Nabha",
    "Sanjivani Hospital Nabha",
    "Wellness Point Nabha",
    "Dr. Sharma Clinic Nabha",
    "Family Health Clinic Nabha",
    "Sunrise Health Clinic Nabha",
    "Downtown Medical Centre Nabha",
    "City Hospital Nabha",
    "Health Plus Centre Nabha",
    "Janta Hospital Nabha"
  ];

  const filtered = locations.filter(l => 
    l.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="search-wrap">
      <div className="search-inner">
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <input 
            value={q} 
            onChange={e=>setQ(e.target.value)} 
            placeholder={t('find hospital')} 
            style={{flex:1,padding:10,borderRadius:20,border:'1px solid #eee'}} 
          />
          <button style={{padding:10,borderRadius:10}}>🔍</button>
        </div>

        <div style={{marginTop:18, maxHeight: "400px", overflowY: "auto"}}>
          {filtered.length > 0 ? (
            filtered.map((l,i)=>(<div key={i} className="list-item">• {l}</div>))
          ) : (
            <div style={{color:"#777"}}>{t('No hospitals found')}</div>
          )}
        </div>
      </div>
    </div>
  )
}
