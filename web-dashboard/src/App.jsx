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
  const [dashboardView, setDashboardView] = useState(null);
  const [detailSearch, setDetailSearch] = useState('');
  const [detailPage, setDetailPage] = useState(1);
  const pageSize = 10;
  const [notifyModal, setNotifyModal] = useState({ show: false, message: '' });

  const notify = (msg) => {
    setNotifyModal({ show: true, message: msg });
  };

  const closeNotify = () => {
    setNotifyModal({ show: false, message: '' });
  };

  const [teacherForm, setTeacherForm] = useState({ first_name: '', last_name: '', middle_initial: '', email: '', password: '' });
  const [teacherFormSubjects, setTeacherFormSubjects] = useState([]);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });

  const showConfirm = (title, message, onConfirm) => {
    setConfirmModal({ show: true, title, message, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmModal({ show: false, title: '', message: '', onConfirm: null });
  };
  const [archivedTeachers, setArchivedTeachers] = useState([]);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherArchivedSearch, setTeacherArchivedSearch] = useState('');
const [sectionForm, setSectionForm] = useState({ section_name: '', course_id: '' });
  const [editingSection, setEditingSection] = useState(null);
  const [archivedSections, setArchivedSections] = useState([]);
  const [sectionSearch, setSectionSearch] = useState('');
  const [sectionArchivedSearch, setSectionArchivedSearch] = useState('');
  const [subjectForm, setSubjectForm] = useState({ subject_name: '', teacher_id: '' });
  const [editingSubject, setEditingSubject] = useState(null);
  const [archivedSubjects, setArchivedSubjects] = useState([]);
  const [subjectSearch, setSubjectSearch] = useState('');
  const [subjectArchivedSearch, setSubjectArchivedSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [archivedStudents, setArchivedStudents] = useState([]);
  const [studentForm, setStudentForm] = useState({ first_name: '', last_name: '', middle_initial: '', email: '', password: '', usn: '', section_id: '', subject_ids: [] });
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentSubjects, setStudentSubjects] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [archivedSearch, setArchivedSearch] = useState('');
  const [teacherPage, setTeacherPage] = useState(1);
  const [teacherArchivedPage, setTeacherArchivedPage] = useState(1);
  const [coursePage, setCoursePage] = useState(1);
  const [sectionPage, setSectionPage] = useState(1);
  const [sectionArchivedPage, setSectionArchivedPage] = useState(1);
  const [subjectPage, setSubjectPage] = useState(1);
  const [subjectArchivedPage, setSubjectArchivedPage] = useState(1);
  const [studentPage, setStudentPage] = useState(1);
  const [studentArchivedPage, setStudentArchivedPage] = useState(1);
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

  const loadAdminData = async () => {
    try {
      const [t, s, sub, c, stud] = await Promise.all([
        axios.get(`${API}/admin/teachers`, { headers }),
        axios.get(`${API}/admin/sections`, { headers }),
        axios.get(`${API}/admin/subjects`, { headers }),
        axios.get(`${API}/admin/courses`, { headers }),
        axios.get(`${API}/admin/students`, { headers }),
      ]);
      setTeachers(t.data);
      setSections(s.data);
      setSubjects(sub.data);
      setAllSubjects(sub.data);
      setCourses(c.data);
      setStudents(stud.data);
    } catch (err) {
      console.error('loadAdminData error:', err.response?.data || err.message);
      notify('Failed to load data: ' + (err.response?.data?.message || err.message));
    }
  };

  const loadArchivedStudents = async () => {
    try {
      const { data } = await axios.get(`${API}/admin/students/archived`, { headers });
      setArchivedStudents(data);
    } catch (err) {
      console.error('loadArchivedStudents error:', err);
    }
  };

  const loadArchivedTeachers = async () => {
    try {
      const { data } = await axios.get(`${API}/admin/teachers/archived`, { headers });
      setArchivedTeachers(data);
    } catch (err) {
      console.error('loadArchivedTeachers error:', err);
    }
  };

  const loadArchivedSections = async () => {
    try {
      const { data } = await axios.get(`${API}/admin/sections/archived`, { headers });
      setArchivedSections(data);
    } catch (err) {
      console.error('loadArchivedSections error:', err);
    }
  };

  const loadArchivedSubjects = async () => {
    try {
      const { data } = await axios.get(`${API}/admin/subjects/archived`, { headers });
      setArchivedSubjects(data);
    } catch (err) {
      console.error('loadArchivedSubjects error:', err);
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
  }, [user?.role, user?.id]);

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
    showConfirm('Save Changes', 'Are you sure you want to save changes to this teacher?', async () => {
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
    });
  };

  const deleteTeacher = async (id, name) => {
    showConfirm('Archive Teacher', `Are you sure you want to archive "${name}"? They can be restored from the Archived section.`, async () => {
      try {
        await axios.delete(`${API}/admin/teachers/${id}`, { headers });
        notify('✓ Teacher archived');
        loadAdminData();
        loadArchivedTeachers();
      } catch (err) {
        console.error('Archive error:', err.response?.data || err.message);
        notify('Failed to archive teacher: ' + (err.response?.data?.message || err.message));
      }
    });
  };

  const restoreTeacher = async (id, name) => {
    showConfirm('Restore Teacher', `Restore "${name}"?`, async () => {
      try {
        await axios.post(`${API}/admin/teachers/${id}/restore`, {}, { headers });
        notify('✓ Teacher restored');
        loadArchivedTeachers();
        loadAdminData();
      } catch (err) {
        console.error('Restore error:', err.response?.data || err.message);
        notify('Failed to restore teacher: ' + (err.response?.data?.message || err.message));
      }
    });
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
    showConfirm('Save Changes', 'Are you sure you want to save changes to this course?', async () => {
      try {
        await axios.put(`${API}/admin/courses/${editingCourse.id}`, editingCourse, { headers });
        notify('✓ Course updated successfully');
        setEditingCourse(null);
        loadAdminData();
      } catch (err) {
        console.error('Update course error:', err.response?.data || err.message);
        notify('Failed to update course: ' + (err.response?.data?.message || err.message));
      }
    });
  };

  const deleteCourse = async (id) => {
    showConfirm('Delete Course', 'Are you sure you want to delete this course? All subjects in this course will be unassigned.', async () => {
      try {
        await axios.delete(`${API}/admin/courses/${id}`, { headers });
        notify('✓ Course deleted successfully');
        loadAdminData();
      } catch (err) {
        console.error('Delete course error:', err.response?.data || err.message);
        notify('Failed to delete course: ' + (err.response?.data?.message || err.message));
      }
    });
  };

  const openEditCourseModal = (course) => {
    setEditingCourse({ ...course });
  };

  const updateSection = async (e) => {
    e.preventDefault();
    showConfirm('Save Changes', 'Are you sure you want to save changes to this section?', async () => {
      try {
        await axios.put(`${API}/admin/sections/${editingSection.id}`, editingSection, { headers });
        notify('✓ Section updated successfully');
        setEditingSection(null);
        loadAdminData();
      } catch (err) {
        console.error('Update section error:', err.response?.data || err.message);
        notify('Failed to update section: ' + (err.response?.data?.message || err.message));
      }
    });
  };

  const deleteSection = async (id, name) => {
    showConfirm('Archive Section', `Are you sure you want to archive "${name}"?`, async () => {
      try {
        await axios.delete(`${API}/admin/sections/${id}`, { headers });
        notify('✓ Section archived');
        loadAdminData();
        loadArchivedSections();
      } catch (err) {
        console.error('Archive section error:', err.response?.data || err.message);
        notify('Failed to archive section: ' + (err.response?.data?.message || err.message));
      }
    });
  };

  const restoreSection = async (id, name) => {
    showConfirm('Restore Section', `Restore "${name}"?`, async () => {
      try {
        await axios.post(`${API}/admin/sections/${id}/restore`, {}, { headers });
        notify('✓ Section restored');
        loadArchivedSections();
        loadAdminData();
      } catch (err) {
        console.error('Restore section error:', err.response?.data || err.message);
        notify('Failed to restore section: ' + (err.response?.data?.message || err.message));
      }
    });
  };

  const openEditSectionModal = (section) => {
    setEditingSection({ ...section });
  };

  const openEditSubjectModal = (subject) => {
    setEditingSubject({ ...subject, teacher_id: subject.teacher_id || '' });
  };

  const updateSubject = async (e) => {
    e.preventDefault();
    showConfirm('Save Changes', 'Are you sure you want to save changes to this subject?', async () => {
      try {
        await axios.put(`${API}/admin/subjects/${editingSubject.id}`, editingSubject, { headers });
        notify('✓ Subject updated successfully');
        setEditingSubject(null);
        loadAdminData();
      } catch (err) {
        notify('Failed to update subject: ' + (err.response?.data?.message || err.message));
      }
    });
  };

  const deleteSubject = async (id, subjectName) => {
    showConfirm('Archive Subject', `Are you sure you want to archive "${subjectName}"?`, async () => {
      try {
        await axios.delete(`${API}/admin/subjects/${id}`, { headers });
        notify('✓ Subject archived');
        loadAdminData();
        loadArchivedSubjects();
      } catch (err) {
        notify('Failed to archive subject: ' + (err.response?.data?.message || err.message));
      }
    });
  };

  const restoreSubject = async (id, name) => {
    showConfirm('Restore Subject', `Restore "${name}"?`, async () => {
      try {
        await axios.post(`${API}/admin/subjects/${id}/restore`, {}, { headers });
        notify('✓ Subject restored');
        loadArchivedSubjects();
        loadAdminData();
      } catch (err) {
        notify('Failed to restore subject: ' + (err.response?.data?.message || err.message));
      }
    });
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

  const createStudent = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/students`, studentForm, { headers });
      notify('✓ Student created successfully');
      setStudentForm({ first_name: '', last_name: '', middle_initial: '', email: '', password: '', usn: '', section_id: '', subject_ids: [] });
      loadAdminData();
    } catch (err) {
      notify('Failed to create student: ' + (err.response?.data?.message || err.message));
    }
  };

  const updateStudent = async (e) => {
    e.preventDefault();
    showConfirm('Save Changes', 'Are you sure you want to save changes to this student?', async () => {
      try {
        await axios.put(`${API}/admin/students/${editingStudent.id}`, { ...editingStudent, subject_ids: studentSubjects }, { headers });
        notify('✓ Student updated successfully');
        setEditingStudent(null);
        loadAdminData();
      } catch (err) {
        notify('Failed to update student: ' + (err.response?.data?.message || err.message));
      }
    });
  };

  const deleteStudent = async (id, name) => {
    showConfirm('Archive Student', `Are you sure you want to archive "${name}"? They can be restored from the Archived section.`, async () => {
      try {
        await axios.delete(`${API}/admin/students/${id}`, { headers });
        notify('✓ Student archived');
        loadAdminData();
        loadArchivedStudents();
      } catch (err) {
        notify('Failed to archive student: ' + (err.response?.data?.message || err.message));
      }
    });
  };

  const restoreStudent = async (id, name) => {
    showConfirm('Restore Student', `Restore "${name}"?`, async () => {
      try {
        await axios.post(`${API}/admin/students/${id}/restore`, {}, { headers });
        notify('✓ Student restored');
        loadArchivedStudents();
        loadAdminData();
      } catch (err) {
        notify('Failed to restore student: ' + (err.response?.data?.message || err.message));
      }
    });
  };

  const openEditStudentModal = (student) => {
    const subIds = student.subjects
      ? student.subjects.split(', ').map(name => {
          const found = subjects.find(sub => sub.subject_name === name);
          return found ? found.id : null;
        }).filter(id => id !== null)
      : [];
    setStudentSubjects(subIds);
    setEditingStudent({ ...student, password: '', section_id: student.section_id || '' });
  };

  const toggleStudentSubject = (subjectId) => {
    setStudentSubjects(prev =>
      prev.includes(subjectId) ? prev.filter(id => id !== subjectId) : [...prev, subjectId]
    );
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
                  onClick={() => { setActiveTab('teachers'); loadArchivedTeachers(); }}
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
                  onClick={() => { setActiveTab('sections'); loadArchivedSections(); }}
                >
                  📚 Manage Sections
                </button>
                 <button
                   className={`tab ${activeTab === 'subjects' ? 'active' : ''}`}
                   onClick={() => { setActiveTab('subjects'); loadArchivedSubjects(); }}
                 >
                   🎓 Manage Subjects
                 </button>
                <button
                  className={`tab ${activeTab === 'students' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('students'); loadArchivedStudents(); }}
                >
                  👨‍🎓 Manage Students
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

          {/* Dashboard Overview Tab */}
          {activeTab === 'dashboard' && (
            <section className="dashboard-overview">
              <h2>Welcome to StudNet Dashboard</h2>
              <div className="stats-grid">
                {user?.role === 'admin' && (
                  <>
                    <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => { setDashboardView(dashboardView === 'teachers' ? null : 'teachers'); setDetailSearch(''); setDetailPage(1); }}>
                      <div className="stat-icon">👨‍🏫</div>
                      <div className="stat-content">
                        <p className="stat-label">Total Teachers</p>
                        <p className="stat-value">{teachers.length}</p>
                      </div>
                    </div>
                    <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => { setDashboardView(dashboardView === 'sections' ? null : 'sections'); setDetailSearch(''); setDetailPage(1); }}>
                      <div className="stat-icon">📚</div>
                      <div className="stat-content">
                        <p className="stat-label">Total Sections</p>
                        <p className="stat-value">{sections.length}</p>
                      </div>
                    </div>
                    <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => { setDashboardView(dashboardView === 'subjects' ? null : 'subjects'); setDetailSearch(''); setDetailPage(1); }}>
                      <div className="stat-icon">🎓</div>
                      <div className="stat-content">
                        <p className="stat-label">Total Subjects</p>
                        <p className="stat-value">{subjects.length}</p>
                      </div>
                    </div>
                    <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => { setDashboardView(dashboardView === 'courses' ? null : 'courses'); setDetailSearch(''); setDetailPage(1); }}>
                      <div className="stat-icon">📘</div>
                      <div className="stat-content">
                        <p className="stat-label">Total Courses</p>
                        <p className="stat-value">{courses.length}</p>
                      </div>
                    </div>
                    <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => { setDashboardView(dashboardView === 'students' ? null : 'students'); setDetailSearch(''); setDetailPage(1); }}>
                      <div className="stat-icon">👨‍🎓</div>
                      <div className="stat-content">
                        <p className="stat-label">Total Students</p>
                        <p className="stat-value">{students.length}</p>
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

              {dashboardView && (
                <div className="card">
                  <h3>
                    {dashboardView === 'teachers' && '👨‍🏫 Teachers'}
                    {dashboardView === 'sections' && '📚 Sections'}
                    {dashboardView === 'subjects' && '🎓 Subjects'}
                    {dashboardView === 'courses' && '📘 Courses'}
                    {dashboardView === 'students' && '👨‍🎓 Students'}
                  </h3>
                  <input
                    type="text"
                    className="form-control search-input"
                    placeholder={`Search ${dashboardView}...`}
                    value={detailSearch}
                    onChange={(e) => { setDetailSearch(e.target.value); setDetailPage(1); }}
                  />
                  {(() => {
                    let data = [];
                    if (dashboardView === 'teachers') data = teachers.filter(t => !detailSearch || getFullName(t).toLowerCase().includes(detailSearch.toLowerCase()) || (t.email||'').toLowerCase().includes(detailSearch.toLowerCase()));
                    else if (dashboardView === 'sections') data = sections.filter(s => !detailSearch || (s.section_name||'').toLowerCase().includes(detailSearch.toLowerCase()) || (s.course_code||'').toLowerCase().includes(detailSearch.toLowerCase()));
                    else if (dashboardView === 'subjects') data = subjects.filter(s => !detailSearch || (s.subject_name||'').toLowerCase().includes(detailSearch.toLowerCase()) || (s.teacher_name||'').toLowerCase().includes(detailSearch.toLowerCase()));
                    else if (dashboardView === 'courses') data = courses.filter(c => !detailSearch || (c.course_name||'').toLowerCase().includes(detailSearch.toLowerCase()) || (c.course_code||'').toLowerCase().includes(detailSearch.toLowerCase()));
                    else if (dashboardView === 'students') data = students.filter(s => !detailSearch || `${s.first_name} ${s.middle_initial? s.middle_initial+'. ' : ''}${s.last_name}`.toLowerCase().includes(detailSearch.toLowerCase()) || (s.email||'').toLowerCase().includes(detailSearch.toLowerCase()) || (s.usn||'').toLowerCase().includes(detailSearch.toLowerCase()) || (s.section_name||'').toLowerCase().includes(detailSearch.toLowerCase()));
                    const totalPages = Math.ceil(data.length / pageSize) || 1;
                    const page = Math.min(detailPage, totalPages);
                    const start = (page - 1) * pageSize;
                    const paged = data.slice(start, start + pageSize);
                    return (
                      <>
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>ID</th>
                              {dashboardView === 'teachers' && <><th>Name</th><th>Email</th><th>Subjects</th></>}
                              {dashboardView === 'sections' && <><th>Section</th><th>Course</th></>}
                              {dashboardView === 'subjects' && <><th>Subject</th><th>Teacher</th></>}
                              {dashboardView === 'courses' && <><th>Course Name</th><th>Code</th></>}
                              {dashboardView === 'students' && <><th>Name</th><th>Email</th><th>USN</th><th>Section</th><th>Subjects</th></>}
                            </tr>
                          </thead>
                          <tbody>
                            {paged.length > 0 ? (
                              dashboardView === 'teachers' ? paged.map(t => <tr key={t.id}><td>{t.id}</td><td>{getFullName(t)}</td><td>{t.email}</td><td>{t.subjects || '—'}</td></tr>) :
                              dashboardView === 'sections' ? paged.map(s => <tr key={s.id}><td>{s.id}</td><td>{s.section_name}</td><td>{s.course_code || '—'}</td></tr>) :
                              dashboardView === 'subjects' ? paged.map(s => <tr key={s.id}><td>{s.id}</td><td>{s.subject_name}</td><td>{s.teacher_name || 'N/A'}</td></tr>) :
                              dashboardView === 'courses' ? paged.map(c => <tr key={c.id}><td>{c.id}</td><td>{c.course_name}</td><td>{c.course_code}</td></tr>) :
                              dashboardView === 'students' ? paged.map(s => <tr key={s.id}><td>{s.id}</td><td>{[s.first_name, s.middle_initial? s.middle_initial+'.' : '', s.last_name].filter(Boolean).join(' ')}</td><td>{s.email}</td><td>{s.usn || '—'}</td><td>{s.section_name || '—'}</td><td>{s.subjects || '—'}</td></tr>) : null
                            ) : (
                              <tr><td colSpan={10}><p className="no-data">No results</p></td></tr>
                            )}
                          </tbody>
                        </table>
                        {totalPages > 1 && (
                          <div className="pagination">
                            <button className="btn-sm btn-secondary" disabled={page <= 1} onClick={() => setDetailPage(page - 1)}>← Prev</button>
                            <span style={{ margin: '0 1rem', color: 'var(--text-light)' }}>Page {page} of {totalPages}</span>
                            <button className="btn-sm btn-secondary" disabled={page >= totalPages} onClick={() => setDetailPage(page + 1)}>Next →</button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
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
                <input
                  type="text"
                  className="form-control search-input"
                  placeholder="Search by name or email..."
                  value={teacherSearch}
                  onChange={(e) => { setTeacherSearch(e.target.value); setTeacherPage(1); }}
                />
                {(() => {
                  const filtered = teachers.filter(t =>
                    !teacherSearch ||
                    getFullName(t).toLowerCase().includes(teacherSearch.toLowerCase()) ||
                    (t.email || '').toLowerCase().includes(teacherSearch.toLowerCase())
                  );
                  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
                  const page = Math.min(teacherPage, totalPages);
                  const start = (page - 1) * pageSize;
                  const paged = filtered.slice(start, start + pageSize);
                  return (
                    <>
                      {paged.length > 0 ? (
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
                            {paged.map((t) => (
                              <tr key={t.id}>
                                <td>{t.id}</td>
                                <td>{getFullName(t)}</td>
                                <td>{t.email}</td>
                                <td>{t.subjects || '—'}</td>
                                <td>
                                  <button className="btn-sm btn-secondary" onClick={() => openEditModal(t)}>Edit</button>
                                  <button className="btn-sm btn-danger" onClick={() => deleteTeacher(t.id, getFullName(t))}>Archive</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="no-data">No teachers found</p>
                      )}
                      {totalPages > 1 && (
                        <div className="pagination">
                          <button className="btn-sm btn-secondary" disabled={page <= 1} onClick={() => setTeacherPage(page - 1)}>← Prev</button>
                          <span style={{ margin: '0 1rem', color: 'var(--text-light)' }}>Page {page} of {totalPages}</span>
                          <button className="btn-sm btn-secondary" disabled={page >= totalPages} onClick={() => setTeacherPage(page + 1)}>Next →</button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              <div className="card mt-4">
                <h3>🗃️ Archived Teachers</h3>
                <input
                  type="text"
                  className="form-control search-input"
                  placeholder="Search archived by name or email..."
                  value={teacherArchivedSearch}
                  onChange={(e) => { setTeacherArchivedSearch(e.target.value); setTeacherArchivedPage(1); }}
                />
                {(() => {
                  const filtered = archivedTeachers.filter(t =>
                    !teacherArchivedSearch ||
                    getFullName(t).toLowerCase().includes(teacherArchivedSearch.toLowerCase()) ||
                    (t.email || '').toLowerCase().includes(teacherArchivedSearch.toLowerCase())
                  );
                  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
                  const page = Math.min(teacherArchivedPage, totalPages);
                  const start = (page - 1) * pageSize;
                  const paged = filtered.slice(start, start + pageSize);
                  return (
                    <>
                      {paged.length > 0 ? (
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paged.map((t) => (
                              <tr key={t.id}>
                                <td>{t.id}</td>
                                <td>{getFullName(t)}</td>
                                <td>{t.email}</td>
                                <td>
                                  <button className="btn-sm btn-secondary" onClick={() => restoreTeacher(t.id, getFullName(t))}>Restore</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="no-data">No archived teachers</p>
                      )}
                      {totalPages > 1 && (
                        <div className="pagination">
                          <button className="btn-sm btn-secondary" disabled={page <= 1} onClick={() => setTeacherArchivedPage(page - 1)}>← Prev</button>
                          <span style={{ margin: '0 1rem', color: 'var(--text-light)' }}>Page {page} of {totalPages}</span>
                          <button className="btn-sm btn-secondary" disabled={page >= totalPages} onClick={() => setTeacherArchivedPage(page + 1)}>Next →</button>
                        </div>
                      )}
                    </>
                  );
                })()}
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
                  {(() => {
                    const totalPages = Math.ceil(courses.length / pageSize) || 1;
                    const page = Math.min(coursePage, totalPages);
                    const start = (page - 1) * pageSize;
                    const paged = courses.slice(start, start + pageSize);
                    return (
                      <>
                        {paged.length > 0 ? (
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
                              {paged.map((c) => (
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
                        {totalPages > 1 && (
                          <div className="pagination">
                            <button className="btn-sm btn-secondary" disabled={page <= 1} onClick={() => setCoursePage(page - 1)}>← Prev</button>
                            <span style={{ margin: '0 1rem', color: 'var(--text-light)' }}>Page {page} of {totalPages}</span>
                            <button className="btn-sm btn-secondary" disabled={page >= totalPages} onClick={() => setCoursePage(page + 1)}>Next →</button>
                          </div>
                        )}
                      </>
                    );
                  })()}
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
                   <input
                     type="text"
                     className="form-control search-input"
                     placeholder="Search by section name or course..."
                     value={sectionSearch}
                     onChange={(e) => { setSectionSearch(e.target.value); setSectionPage(1); }}
                   />
                   {(() => {
                     const filtered = sections.filter(s =>
                       !sectionSearch ||
                       (s.section_name || '').toLowerCase().includes(sectionSearch.toLowerCase()) ||
                       (s.course_code || '').toLowerCase().includes(sectionSearch.toLowerCase())
                     );
                     const totalPages = Math.ceil(filtered.length / pageSize) || 1;
                     const page = Math.min(sectionPage, totalPages);
                     const start = (page - 1) * pageSize;
                     const paged = filtered.slice(start, start + pageSize);
                     return (
                       <>
                         {paged.length > 0 ? (
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
                               {paged.map((s) => (
                                 <tr key={s.id}>
                                   <td>{s.id}</td>
                                   <td>{s.section_name}</td>
                                   <td>{s.course_code || '—'}</td>
                                   <td>
                                     <button className="btn-sm btn-secondary" onClick={() => openEditSectionModal(s)}>Edit</button>
                                     <button className="btn-sm btn-danger" onClick={() => deleteSection(s.id, s.section_name)}>Archive</button>
                                   </td>
                                 </tr>
                               ))}
                             </tbody>
                           </table>
                         ) : (
                           <p className="no-data">No sections found</p>
                         )}
                         {totalPages > 1 && (
                           <div className="pagination">
                             <button className="btn-sm btn-secondary" disabled={page <= 1} onClick={() => setSectionPage(page - 1)}>← Prev</button>
                             <span style={{ margin: '0 1rem', color: 'var(--text-light)' }}>Page {page} of {totalPages}</span>
                             <button className="btn-sm btn-secondary" disabled={page >= totalPages} onClick={() => setSectionPage(page + 1)}>Next →</button>
                           </div>
                         )}
                       </>
                     );
                   })()}
                 </div>

                 <div className="card mt-4">
                   <h3>🗃️ Archived Sections</h3>
                   <input
                     type="text"
                     className="form-control search-input"
                     placeholder="Search archived by section name or course..."
                     value={sectionArchivedSearch}
                     onChange={(e) => { setSectionArchivedSearch(e.target.value); setSectionArchivedPage(1); }}
                   />
                   {(() => {
                     const filtered = archivedSections.filter(s =>
                       !sectionArchivedSearch ||
                       (s.section_name || '').toLowerCase().includes(sectionArchivedSearch.toLowerCase()) ||
                       (s.course_code || '').toLowerCase().includes(sectionArchivedSearch.toLowerCase())
                     );
                     const totalPages = Math.ceil(filtered.length / pageSize) || 1;
                     const page = Math.min(sectionArchivedPage, totalPages);
                     const start = (page - 1) * pageSize;
                     const paged = filtered.slice(start, start + pageSize);
                     return (
                       <>
                         {paged.length > 0 ? (
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
                               {paged.map((s) => (
                                 <tr key={s.id}>
                                   <td>{s.id}</td>
                                   <td>{s.section_name}</td>
                                   <td>{s.course_code || '—'}</td>
                                   <td>
                                     <button className="btn-sm btn-secondary" onClick={() => restoreSection(s.id, s.section_name)}>Restore</button>
                                   </td>
                                 </tr>
                               ))}
                             </tbody>
                           </table>
                         ) : (
                           <p className="no-data">No archived sections</p>
                         )}
                         {totalPages > 1 && (
                           <div className="pagination">
                             <button className="btn-sm btn-secondary" disabled={page <= 1} onClick={() => setSectionArchivedPage(page - 1)}>← Prev</button>
                             <span style={{ margin: '0 1rem', color: 'var(--text-light)' }}>Page {page} of {totalPages}</span>
                             <button className="btn-sm btn-secondary" disabled={page >= totalPages} onClick={() => setSectionArchivedPage(page + 1)}>Next →</button>
                           </div>
                         )}
                       </>
                     );
                   })()}
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
                 <input
                   type="text"
                   className="form-control search-input"
                   placeholder="Search by subject name or teacher..."
                   value={subjectSearch}
                   onChange={(e) => { setSubjectSearch(e.target.value); setSubjectPage(1); }}
                 />
                 {(() => {
                   const filtered = subjects.filter(s =>
                     !subjectSearch ||
                     (s.subject_name || '').toLowerCase().includes(subjectSearch.toLowerCase()) ||
                     (s.teacher_name || '').toLowerCase().includes(subjectSearch.toLowerCase())
                   );
                   const totalPages = Math.ceil(filtered.length / pageSize) || 1;
                   const page = Math.min(subjectPage, totalPages);
                   const start = (page - 1) * pageSize;
                   const paged = filtered.slice(start, start + pageSize);
                   return (
                     <>
                       {paged.length > 0 ? (
                         <table className="data-table">
                           <thead>
                             <tr>
                               <th>ID</th>
                               <th>Subject</th>
                               <th>Teacher</th>
                               <th>Actions</th>
                             </tr>
                           </thead>
                           <tbody>
                             {paged.map((s) => (
                               <tr key={s.id}>
                                 <td>{s.id}</td>
                                 <td>{s.subject_name}</td>
                                 <td>{s.teacher_name || 'N/A'}</td>
                                 <td>
                                   <button className="btn-sm btn-secondary" onClick={() => openEditSubjectModal(s)}>Edit</button>
                                   <button className="btn-sm btn-danger" onClick={() => deleteSubject(s.id, s.subject_name)}>Archive</button>
                                 </td>
                               </tr>
                             ))}
                           </tbody>
                         </table>
                       ) : (
                         <p className="no-data">No subjects found</p>
                       )}
                       {totalPages > 1 && (
                         <div className="pagination">
                           <button className="btn-sm btn-secondary" disabled={page <= 1} onClick={() => setSubjectPage(page - 1)}>← Prev</button>
                           <span style={{ margin: '0 1rem', color: 'var(--text-light)' }}>Page {page} of {totalPages}</span>
                           <button className="btn-sm btn-secondary" disabled={page >= totalPages} onClick={() => setSubjectPage(page + 1)}>Next →</button>
                         </div>
                       )}
                     </>
                   );
                 })()}
               </div>

               <div className="card mt-4">
                 <h3>🗃️ Archived Subjects</h3>
                 <input
                   type="text"
                   className="form-control search-input"
                   placeholder="Search archived by subject name or teacher..."
                   value={subjectArchivedSearch}
                   onChange={(e) => { setSubjectArchivedSearch(e.target.value); setSubjectArchivedPage(1); }}
                 />
                 {(() => {
                   const filtered = archivedSubjects.filter(s =>
                     !subjectArchivedSearch ||
                     (s.subject_name || '').toLowerCase().includes(subjectArchivedSearch.toLowerCase()) ||
                     (s.teacher_name || '').toLowerCase().includes(subjectArchivedSearch.toLowerCase())
                   );
                   const totalPages = Math.ceil(filtered.length / pageSize) || 1;
                   const page = Math.min(subjectArchivedPage, totalPages);
                   const start = (page - 1) * pageSize;
                   const paged = filtered.slice(start, start + pageSize);
                   return (
                     <>
                       {paged.length > 0 ? (
                         <table className="data-table">
                           <thead>
                             <tr>
                               <th>ID</th>
                               <th>Subject</th>
                               <th>Teacher</th>
                               <th>Actions</th>
                             </tr>
                           </thead>
                           <tbody>
                             {paged.map((s) => (
                               <tr key={s.id}>
                                 <td>{s.id}</td>
                                 <td>{s.subject_name}</td>
                                 <td>{s.teacher_name || 'N/A'}</td>
                                 <td>
                                   <button className="btn-sm btn-secondary" onClick={() => restoreSubject(s.id, s.subject_name)}>Restore</button>
                                 </td>
                               </tr>
                             ))}
                           </tbody>
                         </table>
                       ) : (
                         <p className="no-data">No archived subjects</p>
                       )}
                       {totalPages > 1 && (
                         <div className="pagination">
                           <button className="btn-sm btn-secondary" disabled={page <= 1} onClick={() => setSubjectArchivedPage(page - 1)}>← Prev</button>
                           <span style={{ margin: '0 1rem', color: 'var(--text-light)' }}>Page {page} of {totalPages}</span>
                           <button className="btn-sm btn-secondary" disabled={page >= totalPages} onClick={() => setSubjectArchivedPage(page + 1)}>Next →</button>
                         </div>
                       )}
                     </>
                   );
                 })()}
               </div>

              {/* Edit Subject Modal */}
              {editingSubject && (
                <div className="modal-overlay">
                  <div className="modal">
                    <div className="modal-header">
                      <h3>Edit Subject</h3>
                      <button className="modal-close" onClick={() => setEditingSubject(null)}>×</button>
                    </div>
                    <form onSubmit={updateSubject}>
                      <div className="form-group">
                        <label>Subject Name</label>
                        <input
                          type="text"
                          value={editingSubject.subject_name || ''}
                          onChange={(e) => setEditingSubject({ ...editingSubject, subject_name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Assign Teacher</label>
                        <select
                          value={editingSubject.teacher_id || ''}
                          onChange={(e) => setEditingSubject({ ...editingSubject, teacher_id: e.target.value })}
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
                      <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={() => setEditingSubject(null)}>Cancel</button>
                        <button type="submit" className="btn-primary">Save Changes</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Admin: Manage Students */}
          {user?.role === 'admin' && activeTab === 'students' && (
            <section className="form-section">
              <h2>👨‍🎓 Manage Students</h2>
              <div className="card">
                <h3>Add New Student</h3>
                <form onSubmit={createStudent}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        placeholder="First name"
                        value={studentForm.first_name}
                        onChange={(e) => setStudentForm({ ...studentForm, first_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        placeholder="Last name"
                        value={studentForm.last_name}
                        onChange={(e) => setStudentForm({ ...studentForm, last_name: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Middle Initial</label>
                      <input
                        type="text"
                        placeholder="M.I."
                        maxLength="10"
                        value={studentForm.middle_initial}
                        onChange={(e) => setStudentForm({ ...studentForm, middle_initial: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>USN</label>
                      <input
                        type="text"
                        placeholder="University Student No."
                        value={studentForm.usn}
                        onChange={(e) => setStudentForm({ ...studentForm, usn: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      placeholder="Email address"
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      placeholder="Password"
                      value={studentForm.password}
                      onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Section</label>
                      <select
                        value={studentForm.section_id}
                        onChange={(e) => setStudentForm({ ...studentForm, section_id: e.target.value })}
                      >
                        <option value="">Select section</option>
                        {sections.map((s) => (
                          <option key={s.id} value={s.id}>{s.section_name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Subjects</label>
                      <div className="subject-checklist">
                        {subjects.map((s) => (
                          <label key={s.id} className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={studentForm.subject_ids.includes(s.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setStudentForm({ ...studentForm, subject_ids: [...studentForm.subject_ids, s.id] });
                                } else {
                                  setStudentForm({ ...studentForm, subject_ids: studentForm.subject_ids.filter(id => id !== s.id) });
                                }
                              }}
                            />
                            {s.subject_name}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="btn-primary">Save Student</button>
                </form>
              </div>

               <div className="card mt-4">
                 <h3>Students List</h3>
                 <input
                   type="text"
                   className="form-control search-input"
                   placeholder="Search by name, email, USN, or section..."
                   value={studentSearch}
                   onChange={(e) => { setStudentSearch(e.target.value); setStudentPage(1); }}
                 />
                 {(() => {
                   const filtered = students.filter(s =>
                     !studentSearch ||
                     `${s.first_name} ${s.middle_initial ? s.middle_initial + '. ' : ''}${s.last_name}`.toLowerCase().includes(studentSearch.toLowerCase()) ||
                     (s.email || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
                     (s.usn || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
                     (s.section_name || '').toLowerCase().includes(studentSearch.toLowerCase())
                   );
                   const totalPages = Math.ceil(filtered.length / pageSize) || 1;
                   const page = Math.min(studentPage, totalPages);
                   const start = (page - 1) * pageSize;
                   const paged = filtered.slice(start, start + pageSize);
                   return (
                     <>
                       {paged.length > 0 ? (
                         <table className="data-table">
                           <thead>
                             <tr>
                               <th>ID</th>
                               <th>Name</th>
                               <th>Email</th>
                               <th>USN</th>
                               <th>Section</th>
                               <th>Subjects</th>
                               <th>Actions</th>
                             </tr>
                           </thead>
                           <tbody>
                             {paged.map((s) => (
                             <tr key={s.id}>
                               <td>{s.id}</td>
                               <td>{[s.first_name, s.middle_initial ? s.middle_initial + '.' : '', s.last_name].filter(Boolean).join(' ')}</td>
                               <td>{s.email}</td>
                               <td>{s.usn || '—'}</td>
                               <td>{s.section_name || '—'}</td>
                               <td>{s.subjects || '—'}</td>
                               <td>
                                 <button className="btn-sm btn-secondary" onClick={() => openEditStudentModal(s)}>Edit</button>
                                 <button className="btn-sm btn-danger" onClick={() => deleteStudent(s.id, [s.first_name, s.last_name].filter(Boolean).join(' '))}>Archive</button>
                               </td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     ) : (
                       <p className="no-data">No students found</p>
                     )}
                     {totalPages > 1 && (
                       <div className="pagination">
                         <button className="btn-sm btn-secondary" disabled={page <= 1} onClick={() => setStudentPage(page - 1)}>← Prev</button>
                         <span style={{ margin: '0 1rem', color: 'var(--text-light)' }}>Page {page} of {totalPages}</span>
                         <button className="btn-sm btn-secondary" disabled={page >= totalPages} onClick={() => setStudentPage(page + 1)}>Next →</button>
                       </div>
                     )}
                   </>
                 );
               })()}
               </div>

              {/* Edit Student Modal */}
              {editingStudent && (
                <div className="modal-overlay">
                  <div className="modal">
                    <div className="modal-header">
                      <h3>Edit Student</h3>
                      <button className="modal-close" onClick={() => setEditingStudent(null)}>×</button>
                    </div>
                    <form onSubmit={updateStudent}>
                      <div className="form-row">
                        <div className="form-group">
                          <label>First Name</label>
                          <input
                            type="text"
                            value={editingStudent.first_name || ''}
                            onChange={(e) => setEditingStudent({ ...editingStudent, first_name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Last Name</label>
                          <input
                            type="text"
                            value={editingStudent.last_name || ''}
                            onChange={(e) => setEditingStudent({ ...editingStudent, last_name: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Middle Initial</label>
                          <input
                            type="text"
                            maxLength="10"
                            value={editingStudent.middle_initial || ''}
                            onChange={(e) => setEditingStudent({ ...editingStudent, middle_initial: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>USN</label>
                          <input
                            type="text"
                            value={editingStudent.usn || ''}
                            onChange={(e) => setEditingStudent({ ...editingStudent, usn: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          value={editingStudent.email || ''}
                          onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Password (leave blank to keep unchanged)</label>
                        <input
                          type="password"
                          placeholder="New password"
                          value={editingStudent.password || ''}
                          onChange={(e) => setEditingStudent({ ...editingStudent, password: e.target.value })}
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Section</label>
                          <select
                            value={editingStudent.section_id || ''}
                            onChange={(e) => setEditingStudent({ ...editingStudent, section_id: e.target.value })}
                          >
                            <option value="">Select section</option>
                            {sections.map((sec) => (
                              <option key={sec.id} value={sec.id}>{sec.section_name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Subjects</label>
                          <div className="subject-checklist">
                            {subjects.map((sub) => (
                              <label key={sub.id} className="checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={studentSubjects.includes(sub.id)}
                                  onChange={() => toggleStudentSubject(sub.id)}
                                />
                                {sub.subject_name}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={() => setEditingStudent(null)}>Cancel</button>
                        <button type="submit" className="btn-primary">Save Changes</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

               <div className="card mt-4">
                 <h3>🗃️ Archived Students</h3>
                 <input
                   type="text"
                   className="form-control search-input"
                   placeholder="Search archived by name, email, USN, or section..."
                   value={archivedSearch}
                   onChange={(e) => { setArchivedSearch(e.target.value); setStudentArchivedPage(1); }}
                 />
                 {(() => {
                   const filtered = archivedStudents.filter(s =>
                     !archivedSearch ||
                     `${s.first_name} ${s.middle_initial ? s.middle_initial + '. ' : ''}${s.last_name}`.toLowerCase().includes(archivedSearch.toLowerCase()) ||
                     (s.email || '').toLowerCase().includes(archivedSearch.toLowerCase()) ||
                     (s.usn || '').toLowerCase().includes(archivedSearch.toLowerCase()) ||
                     (s.section_name || '').toLowerCase().includes(archivedSearch.toLowerCase())
                   );
                   const totalPages = Math.ceil(filtered.length / pageSize) || 1;
                   const page = Math.min(studentArchivedPage, totalPages);
                   const start = (page - 1) * pageSize;
                   const paged = filtered.slice(start, start + pageSize);
                   return (
                     <>
                       {paged.length > 0 ? (
                         <table className="data-table">
                           <thead>
                             <tr>
                               <th>ID</th>
                               <th>Name</th>
                               <th>Email</th>
                               <th>USN</th>
                               <th>Section</th>
                               <th>Actions</th>
                             </tr>
                           </thead>
                           <tbody>
                             {paged.map((s) => (
                               <tr key={s.id}>
                                 <td>{s.id}</td>
                                 <td>{[s.first_name, s.middle_initial ? s.middle_initial + '.' : '', s.last_name].filter(Boolean).join(' ')}</td>
                                 <td>{s.email}</td>
                                 <td>{s.usn || '—'}</td>
                                 <td>{s.section_name || '—'}</td>
                                 <td>
                                   <button className="btn-sm btn-secondary" onClick={() => restoreStudent(s.id, [s.first_name, s.last_name].filter(Boolean).join(' '))}>Restore</button>
                                 </td>
                               </tr>
                             ))}
                           </tbody>
                         </table>
                       ) : (
                         <p className="no-data">No archived students found</p>
                       )}
                       {totalPages > 1 && (
                         <div className="pagination">
                           <button className="btn-sm btn-secondary" disabled={page <= 1} onClick={() => setStudentArchivedPage(page - 1)}>← Prev</button>
                           <span style={{ margin: '0 1rem', color: 'var(--text-light)' }}>Page {page} of {totalPages}</span>
                           <button className="btn-sm btn-secondary" disabled={page >= totalPages} onClick={() => setStudentArchivedPage(page + 1)}>Next →</button>
                         </div>
                       )}
                     </>
                   );
                 })()}
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

      {confirmModal.show && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3>{confirmModal.title}</h3>
              <button className="modal-close" onClick={closeConfirm}>×</button>
            </div>
            <p style={{ margin: '1rem 0', color: 'var(--text-light)', lineHeight: 1.6 }}>{confirmModal.message}</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={closeConfirm}>Cancel</button>
              <button className="btn-primary" onClick={() => { const fn = confirmModal.onConfirm; closeConfirm(); fn(); }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {notifyModal.show && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3>{notifyModal.message.includes('✓') ? 'Success' : 'Error'}</h3>
              <button className="modal-close" onClick={closeNotify}>×</button>
            </div>
            <p style={{ margin: '1rem 0', color: 'var(--text-light)', lineHeight: 1.6 }}>{notifyModal.message}</p>
            <div className="modal-actions">
              <button className="btn-primary" onClick={closeNotify}>OK</button>
            </div>
          </div>
        </div>
      )}
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
