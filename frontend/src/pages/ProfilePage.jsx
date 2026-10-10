import { useEffect, useState } from 'react';
import { getProfile } from '../api/api.js';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (error)   return <div className="card" style={{ color: '#dc2626' }}>{error}</div>;

  const initials = profile.full_name
    ? profile.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'S';

  const yearSuffix = ['st','nd','rd'][profile.year_level - 1] || 'th';

  return (
    <div>
      <h1 className="page-title">My Profile</h1>
      <p className="page-subtitle">Student Information</p>

      <div className="profile-grid">
        <div className="card profile-avatar-card">
          <div className="profile-avatar">{initials}</div>
          <p className="profile-name">{profile.full_name}</p>
          <p className="profile-num">{profile.student_number}</p>
          <p className="profile-num" style={{ marginTop: 4 }}>{profile.course_name}</p>
          <div style={{ marginTop: 16, width: '100%' }}>
            {[
              ['Year Level', `${profile.year_level}${yearSuffix} Year`],
              ['Status',     profile.status],
              ['Semester',   '2nd Sem 2024-25'],
            ].map(([label, value]) => (
              <div className="profile-detail-row" key={label}>
                <span className="profile-detail-label">{label}</span>
                <span className="profile-detail-value">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <p className="section-title">Student Information</p>
          {[
            ['Full Name',      profile.full_name],
            ['Student Number', profile.student_number],
            ['Program',        profile.course_name],
            ['Email Address',  profile.email],
            ['Contact Number', profile.contact_number || 'Not provided'],
            ['Address',        profile.address        || 'Not provided'],
          ].map(([label, value]) => (
            <div className="profile-detail-row" key={label}>
              <span className="profile-detail-label">{label}</span>
              <span className="profile-detail-value">{value}</span>
            </div>
          ))}
          <div className="notice-box" style={{ marginTop: 16 }}>
            <strong>Note:</strong> To update your personal information, please visit the Registrar's Office with a valid ID.
          </div>
        </div>
      </div>
    </div>
  );
}
