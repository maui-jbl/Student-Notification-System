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
  const [courses, setCourses] = useState([]);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

const [teacherForm, setTeacherForm] = useState({ first_name: '', last_name: '', middle_initial: '', email: '', password: '' });
  const [teacherFormSubjects, setTeacherFormSubjects] = useState([]);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
const [sectionForm, setSectionForm] = useState({ section_name: '', course_id: '' });
  const [editingSection, setEditingSection] = useState(null);
  const [subjectForm, setSubjectForm] = useState({ subject_name: 'WebDev', teacher_id: '' });
  const [courseForm, setCourseForm] = useState({ course_name: '', course_code: '' });
  const [editingCourse, setEditingCourse] = useState(null);
  const [notifForm, setNotifForm] = useState({
    title: '',
    message: '',
    subject_id: '',
    section_id: '',
    priority: 'Normal',
    scheduled_at: '',
  });

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const notify = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 5000);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadAdminData = async () => {
    try {
      const [t, s, sub, c] = await Promise.all([
        axios.get(`${API}/admin/teachers`, { headers }),
        axios.get(`${API}/admin/sections`, { headers }),
        axios.get(`${API}/admin/subjects`, { headers }),
        axios.get(`${API}/admin/courses`, { headers }),
      ]);
      setTeachers(t.data);
      setSections(s.data);
      setSubjects(sub.data);
      setAllSubjects(sub.data);
      setCourses(c.data);
    } catch (err) {
      console.error('loadAdminData error:', err.response?.data || err.message);
      notify('Failed to load data: ' + (err.response?.data?.message || err.message));
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    } catch (err) {
      console.error('Error loading teacher data:', err);
      notify('Failed to load data');
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminData();
    } else if (user?.role === 'teacher') {
      loadTeacherData();
    }
  }, [user, loadAdminData, loadTeacherData]);

  const createTeacher = async (e) => {
    e.preventDefault();
    try {
      const { data: created } = await axios.post(`${API}/admin/teachers`, teacherForm, { headers });
      if (teacherFormSubjects.length > 0) {
        await axios.put(`${API}/admin/teachers/${created.insertId}/subjects`, { subject_ids: teacherFormSubjects }, { headers });
      }
      notify('✓ Teacher created successfully');
      setTeacherForm({ first_name: '', last_name: '', middle_initial: '', email: '', password: '' });
      setTeacherFormSubjects([]);
      loadAdminData();
    } catch (err) {
      console.error('Create error:', err.response?.data || err.message);
      notify('Failed to create teacher: ' + (err.response?.data?.message || err.message));
    }
  };

  const updateTeacher = async (e) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to save changes to this teacher?')) return;
    try {
      const updateData = { ...editingTeacher };
      if (!updateData.password || updateData.password === '') {
        delete updateData.password;
      }
      await axios.put(`${API}/admin/teachers/${editingTeacher.id}`, updateData, { headers });
      await axios.put(`${API}/admin/teachers/${editingTeacher.id}/subjects`, { subject_ids: teacherSubjects }, { headers });
      notify('✓ Teacher updated successfully');
      setEditingTeacher(null);
      loadAdminData();
    } catch (err) {
      console.error('Update error:', err.response?.data || err.message);
      notify('Failed to update teacher: ' + (err.response?.data?.message || err.message));
    }
  };

  const deleteTeacher = async (id) => {
    if (!confirm('Are you sure you want to delete this teacher? All their assigned subjects will be unassigned.')) return;
    try {
      await axios.delete(`${API}/admin/teachers/${id}`, { headers });
      notify('✓ Teacher deleted successfully');
      loadAdminData();
    } catch (err) {
      console.error('Delete error:', err.response?.data || err.message);
      notify('Failed to delete teacher: ' + (err.response?.data?.message || err.message));
    }
  };

  const openEditModal = async (teacher) => {
    setEditingTeacher({ ...teacher, password: '' });
    const [subjRes, allSubjRes] = await Promise.all([
      axios.get(`${API}/admin/teachers/${teacher.id}/subjects`, { headers }),
      axios.get(`${API}/admin/subjects`, { headers }),
    ]);
    setTeacherSubjects(subjRes.data.map(s => s.id));
    setAllSubjects(allSubjRes.data);
  };

  const getFullName = (t) => {
    return [t.first_name, t.middle_initial ? t.middle_initial + '.' : '', t.last_name].filter(Boolean).join(' ');
  };

  const createSection = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/sections`, sectionForm, { headers });
      notify('✓ Section created successfully');
      setSectionForm({ section_name: '', course_id: '' });
      loadAdminData();
    } catch (err) {
      console.error('Create section error:', err.response?.data || err.message);
      notify('Failed to create section: ' + (err.response?.data?.message || err.message));
    }
  };

  const createSubject = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/subjects`, subjectForm, { headers });
      notify('✓ Subject created successfully');
      setSubjectForm({ subject_name: '', teacher_id: '' });
      loadAdminData();
    } catch (err) {
      console.error('Create subject error:', err.response?.data || err.message);
      notify('Failed to create subject: ' + (err.response?.data?.message || err.message));
    }
  };

  const createCourse = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/courses`, courseForm, { headers });
      notify('✓ Course created successfully');
      setCourseForm({ course_name: '', course_code: '' });
      loadAdminData();
    } catch (err) {
      console.error('Create course error:', err.response?.data || err.message);
      notify('Failed to create course: ' + (err.response?.data?.message || err.message));
    }
  };

  const updateCourse = async (e) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to save changes to this course?')) return;
    try {
      await axios.put(`${API}/admin/courses/${editingCourse.id}`, editingCourse, { headers });
      notify('✓ Course updated successfully');
      setEditingCourse(null);
      loadAdminData();
    } catch (err) {
      console.error('Update course error:', err.response?.data || err.message);
      notify('Failed to update course: ' + (err.response?.data?.message || err.message));
    }
  };

  const deleteCourse = async (id) => {
    if (!confirm('Are you sure you want to delete this course? All subjects in this course will be unassigned.')) return;
    try {
      await axios.delete(`${API}/admin/courses/${id}`, { headers });
      notify('✓ Course deleted successfully');
      loadAdminData();
    } catch (err) {
      console.error('Delete course error:', err.response?.data || err.message);
      notify('Failed to delete course: ' + (err.response?.data?.message || err.message));
    }
  };

  const openEditCourseModal = (course) => {
    setEditingCourse({ ...course });
  };

  const updateSection = async (e) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to save changes to this section?')) return;
    try {
      await axios.put(`${API}/admin/sections/${editingSection.id}`, editingSection, { headers });
      notify('✓ Section updated successfully');
      setEditingSection(null);
      loadAdminData();
    } catch (err) {
      console.error('Update section error:', err.response?.data || err.message);
      notify('Failed to update section: ' + (err.response?.data?.message || err.message));
    }
  };

  const deleteSection = async (id) => {
    if (!confirm('Are you sure you want to delete this section? All students in this section will be unassigned.')) return;
    try {
      await axios.delete(`${API}/admin/sections/${id}`, { headers });
      notify('✓ Section deleted successfully');
      loadAdminData();
    } catch (err) {
      console.error('Delete section error:', err.response?.data || err.message);
      notify('Failed to delete section: ' + (err.response?.data?.message || err.message));
    }
  };

  const openEditSectionModal = (section) => {
    setEditingSection({ ...section });
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
    } catch {
      notify('Failed to send notification');
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
                 className={`tab ${activeTab === 'courses' ? 'active' : ''}`}
                 onClick={() => setActiveTab('courses')}
               >
                 📘 Manage Courses
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
                      <label>First Name</label>
                      <input
                        type="text"
                        placeholder="Enter first name"
                        value={teacherForm.first_name}
                        onChange={(e) => setTeacherForm({ ...teacherForm, first_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        placeholder="Enter last name"
                        value={teacherForm.last_name}
                        onChange={(e) => setTeacherForm({ ...teacherForm, last_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Middle Initial</label>
                      <input
                        type="text"
                        placeholder="M.I."
                        maxLength="10"
                        value={teacherForm.middle_initial}
                        onChange={(e) => setTeacherForm({ ...teacherForm, middle_initial: e.target.value })}
                      />
                    </div>
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
<div className="form-group">
                      <label>Assign Subjects</label>
                      <div className="subject-checklist">
                        {subjects.map((s) => (
                          <label key={s.id} className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={teacherFormSubjects.includes(s.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setTeacherFormSubjects([...teacherFormSubjects, s.id]);
                                } else {
                                  setTeacherFormSubjects(teacherFormSubjects.filter(id => id !== s.id));
                                }
                              }}
                            />
                            {s.subject_name}
                          </label>
                        ))}
                      </div>
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
                         <th>Subjects</th>
                         <th>Actions</th>
                       </tr>
                     </thead>
                     <tbody>
                       {teachers.map((t) => (
                         <tr key={t.id}>
                           <td>{t.id}</td>
                           <td>{getFullName(t)}</td>
                           <td>{t.email}</td>
                           <td>{t.subjects || '—'}</td>
                           <td>
                             <button className="btn-sm btn-secondary" onClick={() => openEditModal(t)}>Edit</button>
                             <button className="btn-sm btn-danger" onClick={() => deleteTeacher(t.id)}>Delete</button>
                           </td>
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

          {/* Edit Teacher Modal */}
          {editingTeacher && (
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-header">
                  <h3>Edit Teacher</h3>
                  <button className="modal-close" onClick={() => setEditingTeacher(null)}>×</button>
                </div>
                <form onSubmit={updateTeacher}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        value={editingTeacher.first_name || ''}
                        onChange={(e) => setEditingTeacher({ ...editingTeacher, first_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        value={editingTeacher.last_name || ''}
                        onChange={(e) => setEditingTeacher({ ...editingTeacher, last_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Middle Initial</label>
                      <input
                        type="text"
                        maxLength="10"
                        value={editingTeacher.middle_initial || ''}
                        onChange={(e) => setEditingTeacher({ ...editingTeacher, middle_initial: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={editingTeacher.email || ''}
                      onChange={(e) => setEditingTeacher({ ...editingTeacher, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Password (leave blank to keep unchanged)</label>
                    <input
                      type="password"
                      placeholder="New password"
                      value={editingTeacher.password || ''}
                      onChange={(e) => setEditingTeacher({ ...editingTeacher, password: e.target.value })}
                    />
                  </div>
<div className="form-group">
                     <label>Assign Subjects</label>
                     <div className="subject-checklist">
                       {allSubjects.map((s) => (
                         <label key={s.id} className="checkbox-label">
                           <input
                             type="checkbox"
                             checked={teacherSubjects.includes(s.id)}
                             onChange={(e) => {
                               if (e.target.checked) {
                                 setTeacherSubjects([...teacherSubjects, s.id]);
                               } else {
                                 setTeacherSubjects(teacherSubjects.filter(id => id !== s.id));
                               }
                             }}
                           />
                           {s.subject_name}
                         </label>
                       ))}
                     </div>
                   </div>
                  <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={() => setEditingTeacher(null)}>Cancel</button>
                    <button type="submit" className="btn-primary">Save Changes</button>
                  </div>
                </form>
</div>
             </div>
           )}

           {/* Admin: Manage Courses */}
           {user?.role === 'admin' && activeTab === 'courses' && (
             <section className="form-section">
               <h2>📘 Manage Courses</h2>
               <div className="card">
                 <h3>Add New Course</h3>
                 <form onSubmit={createCourse}>
                   <div className="form-row">
                     <div className="form-group">
                       <label>Course Name</label>
                       <input
                         type="text"
                         placeholder="e.g., Bachelor of Science in IT"
                         value={courseForm.course_name}
                         onChange={(e) => setCourseForm({ ...courseForm, course_name: e.target.value })}
                         required
                       />
                     </div>
<div className="form-group">
                        <label>Course Code</label>
                        <input
                          type="text"
                          placeholder="e.g., BSIT"
                          value={courseForm.course_code}
                          onChange={(e) => setCourseForm({ ...courseForm, course_code: e.target.value })}
                          required
                        />
                      </div>
                   </div>
                   <button type="submit" className="btn-primary">Save Course</button>
                 </form>
               </div>

               <div className="card mt-4">
                 <h3>Courses List</h3>
                 {courses.length > 0 ? (
                   <table className="data-table">
                     <thead>
                       <tr>
                         <th>ID</th>
                         <th>Course Name</th>
                         <th>Course Code</th>
                         <th>Actions</th>
                       </tr>
                     </thead>
                     <tbody>
                       {courses.map((c) => (
                         <tr key={c.id}>
                           <td>{c.id}</td>
                           <td>{c.course_name}</td>
                           <td>{c.course_code}</td>
                           <td>
                             <button className="btn-sm btn-secondary" onClick={() => openEditCourseModal(c)}>Edit</button>
                             <button className="btn-sm btn-danger" onClick={() => deleteCourse(c.id)}>Delete</button>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 ) : (
                   <p className="no-data">No courses found</p>
                 )}
               </div>
             </section>
           )}

           {/* Edit Course Modal */}
           {editingCourse && (
             <div className="modal-overlay">
               <div className="modal">
                 <div className="modal-header">
                   <h3>Edit Course</h3>
                   <button className="modal-close" onClick={() => setEditingCourse(null)}>×</button>
                 </div>
                 <form onSubmit={updateCourse}>
                   <div className="form-group">
                     <label>Course Name</label>
                     <input
                       type="text"
                       value={editingCourse.course_name || ''}
                       onChange={(e) => setEditingCourse({ ...editingCourse, course_name: e.target.value })}
                       required
                     />
                   </div>
<div className="form-group">
                      <label>Course Code</label>
                      <input
                        type="text"
                        placeholder="e.g., BSIT"
                        value={editingCourse.course_code || ''}
                        onChange={(e) => setEditingCourse({ ...editingCourse, course_code: e.target.value })}
                        required
                      />
                    </div>
                   <div className="modal-actions">
                     <button type="button" className="btn-secondary" onClick={() => setEditingCourse(null)}>Cancel</button>
                     <button type="submit" className="btn-primary">Save Changes</button>
                   </div>
                 </form>
               </div>
             </div>
           )}

{/* Admin: Manage Sections */}
           {user?.role === 'admin' && activeTab === 'sections' && (
             <section className="form-section">
               <h2>📚 Manage Sections</h2>
               <div className="card">
                 <h3>Add New Section</h3>
                 <form onSubmit={createSection}>
                   <div className="form-row">
                     <div className="form-group">
                       <label>Section Name</label>
                       <input
                         type="text"
                         placeholder="e.g., BSIT 2A"
                         value={sectionForm.section_name}
                         onChange={(e) => setSectionForm({ ...sectionForm, section_name: e.target.value })}
                         required
                       />
                     </div>
                     <div className="form-group">
                       <label>Course</label>
                       <select
                         value={sectionForm.course_id}
                         onChange={(e) => setSectionForm({ ...sectionForm, course_id: e.target.value })}
                         required
                       >
                         <option value="">Select a course</option>
                         {courses.map((c) => (
                           <option key={c.id} value={c.id}>
                             {c.course_code}
                           </option>
                         ))}
                       </select>
                     </div>
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
                         <th>Course</th>
                         <th>Actions</th>
                       </tr>
                     </thead>
                     <tbody>
                       {sections.map((s) => (
                         <tr key={s.id}>
                           <td>{s.id}</td>
                           <td>{s.section_name}</td>
                           <td>{s.course_code || '—'}</td>
                           <td>
                             <button className="btn-sm btn-secondary" onClick={() => openEditSectionModal(s)}>Edit</button>
                             <button className="btn-sm btn-danger" onClick={() => deleteSection(s.id)}>Delete</button>
                           </td>
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

           {/* Edit Section Modal */}
           {editingSection && (
             <div className="modal-overlay">
               <div className="modal">
                 <div className="modal-header">
                   <h3>Edit Section</h3>
                   <button className="modal-close" onClick={() => setEditingSection(null)}>×</button>
                 </div>
                 <form onSubmit={updateSection}>
                   <div className="form-group">
                     <label>Section Name</label>
                     <input
                       type="text"
                       value={editingSection.section_name || ''}
                       onChange={(e) => setEditingSection({ ...editingSection, section_name: e.target.value })}
                       required
                     />
                   </div>
                   <div className="form-group">
                     <label>Course</label>
                     <select
                       value={editingSection.course_id || ''}
                       onChange={(e) => setEditingSection({ ...editingSection, course_id: e.target.value })}
                       required
                     >
                       <option value="">Select a course</option>
                       {courses.map((c) => (
                         <option key={c.id} value={c.id}>
                           {c.course_code}
                         </option>
                       ))}
                     </select>
                   </div>
                   <div className="modal-actions">
                     <button type="button" className="btn-secondary" onClick={() => setEditingSection(null)}>Cancel</button>
                     <button type="submit" className="btn-primary">Save Changes</button>
                   </div>
                 </form>
               </div>
             </div>
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
                            {getFullName(t)}
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
