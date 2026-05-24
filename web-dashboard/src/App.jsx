import { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API = import.meta.env.VITE_API_URL || '/api';

// Landing Page Component
function LandingPage({ onLoginClick }) {
  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="nav-content">
          <div className="logo">📚 StudNet</div>
          <button className="btn-primary" onClick={onLoginClick}>Login</button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <h1>Student Notification & Academic Announcement System</h1>
          <p>Real-time notifications, better communication, enhanced learning experience</p>
          <button className="btn-primary btn-lg" onClick={onLoginClick}>Get Started</button>
        </div>
        <div className="hero-illustration">
          <div className="illustration-box">
            <span className="icon">📢</span>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Why Choose StudNet?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>Real-Time Notifications</h3>
              <p>Instant alerts for important announcements, assignments, and events</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Easy Management</h3>
              <p>Manage teachers, sections, and subjects with an intuitive dashboard</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Multi-Platform</h3>
              <p>Access on web, mobile, and desktop with seamless synchronization</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Smart Analytics</h3>
              <p>Track notification history and student engagement metrics</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔐</div>
              <h3>Secure</h3>
              <p>Role-based access control and encrypted communications</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Lightning Fast</h3>
              <p>MQTT-based architecture for optimal performance and reliability</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2024 StudNet. All rights reserved.</p>
      </footer>
    </div>
  );
}

// Login Page Component
function LoginPage({ onLoginSuccess, onBackClick }) {
  const [email, setEmail] = useState('admin@school.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>📚 StudNet</h1>
          <p>Student Notification System</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn-primary btn-block" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="demo-accounts">
          <p className="demo-title">Demo Accounts:</p>
          <div className="demo-account">
            <strong>Admin:</strong> admin@school.com / admin123
          </div>
          <div className="demo-account">
            <strong>Teacher:</strong> teacher1@school.com / teacher123
          </div>
          <div className="demo-account">
            <strong>Student:</strong> student1@school.com / student123
          </div>
        </div>

        <button className="btn-secondary btn-block" onClick={onBackClick}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

// Dashboard Component
function Dashboard({ token, user, onLogout }) {
  const [teachers, setTeachers] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  const [teacherForm, setTeacherForm] = useState({ name: '', email: '', password: '' });
  const [sectionName, setSectionName] = useState('BSIT2A');
  const [subjectForm, setSubjectForm] = useState({ subject_name: 'WebDev', teacher_id: '' });
  const [notifForm, setNotifForm] = useState({
    title: '',
    message: '',
    subject_id: '',
    section_id: '',
    priority: 'Normal',
    scheduled_at: '',
  });

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const notify = (msg, isError = false) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 5000);
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminData();
    } else if (user?.role === 'teacher') {
      loadTeacherData();
    }
  }, [user]);

  const loadAdminData = async () => {
    try {
      const [t, s, sub] = await Promise.all([
        axios.get(`${API}/admin/teachers`, { headers }),
        axios.get(`${API}/admin/sections`, { headers }),
        axios.get(`${API}/admin/subjects`, { headers }),
      ]);
      setTeachers(t.data);
      setSections(s.data);
      setSubjects(sub.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
      notify('Failed to load data', true);
    }
  };

  const loadTeacherData = async () => {
    try {
      const [sec, mySub, his] = await Promise.all([
        axios.get(`${API}/teacher/sections`, { headers }),
        axios.get(`${API}/teacher/my-subjects`, { headers }),
        axios.get(`${API}/teacher/notifications/history`, { headers }),
      ]);
      setSections(sec.data);
      setSubjects(mySub.data);
      setHistory(his.data);
    } catch (error) {
      console.error('Error loading teacher data:', error);
      notify('Failed to load data', true);
    }
  };

  const createTeacher = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/teachers`, teacherForm, { headers });
      notify('✓ Teacher created successfully');
      setTeacherForm({ name: '', email: '', password: '' });
      loadAdminData();
    } catch (error) {
      notify('Failed to create teacher', true);
    }
  };

  const createSection = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/sections`, { section_name: sectionName }, { headers });
      notify('✓ Section created successfully');
      setSectionName('');
      loadAdminData();
    } catch (error) {
      notify('Failed to create section', true);
    }
  };

  const createSubject = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/subjects`, subjectForm, { headers });
      notify('✓ Subject created successfully');
      setSubjectForm({ subject_name: '', teacher_id: '' });
      loadAdminData();
    } catch (error) {
      notify('Failed to create subject', true);
    }
  };

  const sendNotif = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API}/teacher/notifications`,
        {
          ...notifForm,
          scheduled_at: notifForm.scheduled_at || null,
        },
        { headers }
      );
      notify('✓ Notification submitted successfully');
      setNotifForm({
        title: '',
        message: '',
        subject_id: '',
        section_id: '',
        priority: 'Normal',
        scheduled_at: '',
      });
      loadTeacherData();
    } catch (error) {
      notify('Failed to send notification', true);
    }
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="nav-content">
          <div className="logo">📚 StudNet</div>
          <div className="nav-user">
            <span className="user-info">Welcome, <strong>{user?.name}</strong> ({user?.role})</span>
            <button className="btn-secondary" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </nav>

      <div className="dashboard-container">
        <div className="dashboard-tabs">
          <button
            className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          {user?.role === 'admin' && (
            <>
              <button
                className={`tab ${activeTab === 'teachers' ? 'active' : ''}`}
                onClick={() => setActiveTab('teachers')}
              >
                👨‍🏫 Manage Teachers
              </button>
              <button
                className={`tab ${activeTab === 'sections' ? 'active' : ''}`}
                onClick={() => setActiveTab('sections')}
              >
                📚 Manage Sections
              </button>
              <button
                className={`tab ${activeTab === 'subjects' ? 'active' : ''}`}
                onClick={() => setActiveTab('subjects')}
              >
                🎓 Manage Subjects
              </button>
            </>
          )}
          {user?.role === 'teacher' && (
            <button
              className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              📢 Send Notification
            </button>
          )}
        </div>

        <div className="dashboard-content">
          {message && (
            <div className={`alert ${message.includes('✓') ? 'alert-success' : 'alert-error'}`}>
              {message}
            </div>
          )}

          {/* Dashboard Overview Tab */}
          {activeTab === 'dashboard' && (
            <section className="dashboard-overview">
              <h2>Welcome to StudNet Dashboard</h2>
              <div className="stats-grid">
                {user?.role === 'admin' && (
                  <>
                    <div className="stat-card">
                      <div className="stat-icon">👨‍🏫</div>
                      <div className="stat-content">
                        <p className="stat-label">Total Teachers</p>
                        <p className="stat-value">{teachers.length}</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">📚</div>
                      <div className="stat-content">
                        <p className="stat-label">Total Sections</p>
                        <p className="stat-value">{sections.length}</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">🎓</div>
                      <div className="stat-content">
                        <p className="stat-label">Total Subjects</p>
                        <p className="stat-value">{subjects.length}</p>
                      </div>
                    </div>
                  </>
                )}
                {user?.role === 'teacher' && (
                  <>
                    <div className="stat-card">
                      <div className="stat-icon">📚</div>
                      <div className="stat-content">
                        <p className="stat-label">My Sections</p>
                        <p className="stat-value">{sections.length}</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">🎓</div>
                      <div className="stat-content">
                        <p className="stat-label">My Subjects</p>
                        <p className="stat-value">{subjects.length}</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">📢</div>
                      <div className="stat-content">
                        <p className="stat-label">Sent Notifications</p>
                        <p className="stat-value">{history.length}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>
          )}

          {/* Admin: Manage Teachers */}
          {user?.role === 'admin' && activeTab === 'teachers' && (
            <section className="form-section">
              <h2>👨‍🏫 Manage Teachers</h2>
              <div className="card">
                <h3>Add New Teacher</h3>
                <form onSubmit={createTeacher}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Teacher Name</label>
                      <input
                        type="text"
                        placeholder="Enter teacher name"
                        value={teacherForm.name}
                        onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        placeholder="Enter email"
                        value={teacherForm.email}
                        onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      placeholder="Enter password"
                      value={teacherForm.password}
                      onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary">Save Teacher</button>
                </form>
              </div>

              <div className="card mt-4">
                <h3>Teachers List</h3>
                {teachers.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map((t) => (
                        <tr key={t.id}>
                          <td>{t.id}</td>
                          <td>{t.name}</td>
                          <td>{t.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-data">No teachers found</p>
                )}
              </div>
            </section>
          )}

          {/* Admin: Manage Sections */}
          {user?.role === 'admin' && activeTab === 'sections' && (
            <section className="form-section">
              <h2>📚 Manage Sections</h2>
              <div className="card">
                <h3>Add New Section</h3>
                <form onSubmit={createSection}>
                  <div className="form-group">
                    <label>Section Name</label>
                    <input
                      type="text"
                      placeholder="e.g., BSIT 2A"
                      value={sectionName}
                      onChange={(e) => setSectionName(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary">Save Section</button>
                </form>
              </div>

              <div className="card mt-4">
                <h3>Sections List</h3>
                {sections.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Section Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sections.map((s) => (
                        <tr key={s.id}>
                          <td>{s.id}</td>
                          <td>{s.section_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-data">No sections found</p>
                )}
              </div>
            </section>
          )}

          {/* Admin: Manage Subjects */}
          {user?.role === 'admin' && activeTab === 'subjects' && (
            <section className="form-section">
              <h2>🎓 Manage Subjects</h2>
              <div className="card">
                <h3>Add New Subject</h3>
                <form onSubmit={createSubject}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Subject Name</label>
                      <input
                        type="text"
                        placeholder="Enter subject name"
                        value={subjectForm.subject_name}
                        onChange={(e) => setSubjectForm({ ...subjectForm, subject_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Assign Teacher</label>
                      <select
                        value={subjectForm.teacher_id}
                        onChange={(e) => setSubjectForm({ ...subjectForm, teacher_id: e.target.value })}
                        required
                      >
                        <option value="">Select a teacher</option>
                        {teachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn-primary">Save Subject</button>
                </form>
              </div>

              <div className="card mt-4">
                <h3>Subjects List</h3>
                {subjects.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Subject</th>
                        <th>Teacher</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((s) => (
                        <tr key={s.id}>
                          <td>{s.id}</td>
                          <td>{s.subject_name}</td>
                          <td>{s.teacher_name || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-data">No subjects found</p>
                )}
              </div>
            </section>
          )}

          {/* Teacher: Send Notifications */}
          {user?.role === 'teacher' && activeTab === 'notifications' && (
            <section className="form-section">
              <h2>📢 Send Notification</h2>
              <div className="card">
                <form onSubmit={sendNotif}>
                  <div className="form-group">
                    <label>Notification Title</label>
                    <input
                      type="text"
                      placeholder="Enter notification title"
                      value={notifForm.title}
                      onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Message</label>
                    <textarea
                      placeholder="Enter notification message"
                      value={notifForm.message}
                      onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Select Subject</label>
                      <select
                        value={notifForm.subject_id}
                        onChange={(e) => setNotifForm({ ...notifForm, subject_id: Number(e.target.value) })}
                        required
                      >
                        <option value="">Select a subject</option>
                        {subjects.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.subject_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Select Section</label>
                      <select
                        value={notifForm.section_id}
                        onChange={(e) => setNotifForm({ ...notifForm, section_id: Number(e.target.value) })}
                        required
                      >
                        <option value="">Select a section</option>
                        {sections.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.section_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Priority</label>
                      <select
                        value={notifForm.priority}
                        onChange={(e) => setNotifForm({ ...notifForm, priority: e.target.value })}
                      >
                        <option>Normal</option>
                        <option>Urgent</option>
                        <option>Exam</option>
                        <option>Event</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Schedule For (Optional)</label>
                      <input
                        type="datetime-local"
                        value={notifForm.scheduled_at}
                        onChange={(e) => setNotifForm({ ...notifForm, scheduled_at: e.target.value })}
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary btn-block">Submit Notification</button>
                </form>
              </div>

              <div className="card mt-4">
                <h3>📜 Notification History</h3>
                {history.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Section / Subject</th>
                        <th>Priority</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h) => (
                        <tr key={h.id}>
                          <td>{h.title}</td>
                          <td>
                            {h.section_name} / {h.subject_name}
                          </td>
                          <td>
                            <span className={`priority-badge priority-${h.priority.toLowerCase()}`}>
                              {h.priority}
                            </span>
                          </td>
                          <td>{new Date(h.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-data">No notifications sent yet</p>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [currentPage, setCurrentPage] = useState('landing');

  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken('');
    setUser(null);
    setCurrentPage('landing');
  };

  // If already logged in, show dashboard
  if (token && user) {
    return <Dashboard token={token} user={user} onLogout={handleLogout} />;
  }

  // Show login or landing page
  if (currentPage === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onBackClick={() => setCurrentPage('landing')}
      />
    );
  }

  return <LandingPage onLoginClick={() => setCurrentPage('login')} />;
}

export default App;
