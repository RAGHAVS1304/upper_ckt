import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
export default function Navbar() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
const navigate = useNavigate();
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  return (
    <nav style={{display:"flex", justifyContent:"space-between", padding:"10px 20px"}}>
      {/* <h2>MediMitra</h2> */}

      {user ? (
        <div style={{ position: "relative" }}>
          {/* Profile Icon */}
          <div
            onClick={() => setShowProfile(!showProfile)}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#007bff",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {user.name ? user.name[0].toUpperCase() : "U"}
          </div>

          {/* Profile Modal */}
          {showProfile && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "50px",
                background: "white",
                padding: 20,
                borderRadius: 8,
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                minWidth: 250,
                zIndex: 1000,
              }}
            >
              <h4>{user.name}</h4>
              <p><b>Email:</b> {user.email}</p>
              {/* <p><b>Contact:</b> {user.contact || "N/A"}</p> */}
              
              <h5 style={{ marginTop: 10 }}>Upcoming Meetings</h5>
              <ul>
                <li>Meeting with Dr. Sharma - 20 Sep, 5 PM</li>
                <li>Meeting with Dr. Singh - 22 Sep, 3 PM</li>
              </ul>

              <button
                style={{
                  marginTop: 10,
                  background: "#dc3545",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
                onClick={() => {
                  localStorage.removeItem("user");
                  window.location.href = "/signin"; // logout
                  setUser(null);
                  navigate("/signin"); // go back to sign in page
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        // <a href="/signin">{t("signin")}</a>
        <button onClick={()=>navigate('/signin')} className="pill">{t('signin')}</button>
      )}
    </nav>
  );
}