import { useMemo, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import { setupPWA } from './pwa';

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
              <div className="feature-icon">🌐</div>
              <h3>Web-Based</h3>
              <p>Fully responsive — works on desktop, tablet, and phone browsers</p>
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
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) {
          onLogout();
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  useEffect(() => {
    if (user?.role === 'student') {
      const timer = setTimeout(() => setupPWA(token), 1500);
      return () => clearTimeout(timer);
    }
  }, [token, user?.role]);

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
  const [teacherAllSubjects, setTeacherAllSubjects] = useState([]);
  const [studentNotifications, setStudentNotifications] = useState([]);
  const [studentEnrolledSubjects, setStudentEnrolledSubjects] = useState([]);
  const [studentSubjectFilter, setStudentSubjectFilter] = useState('all');
  const [assignedCombos, setAssignedCombos] = useState([]);

  const notify = (msg) => {
    setNotifyModal({ show: true, message: msg });
  };

  const closeNotify = () => {
    setNotifyModal({ show: false, message: '' });
  };

  const [teacherForm, setTeacherForm] = useState({ first_name: '', last_name: '', middle_initial: '', email: '', password: '' });

  const [editingTeacher, setEditingTeacher] = useState(null);
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
  const [subjectForm, setSubjectForm] = useState({ subject_name: '' });
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
  const [studentSubjectSearch, setStudentSubjectSearch] = useState('');
  const [editStudentSubjectSearch, setEditStudentSubjectSearch] = useState('');
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
  const [assignments, setAssignments] = useState([]);
  const [assignmentForm, setAssignmentForm] = useState({ teacher_id: '', subject_id: '', section_id: '' });
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [assignmentSearch, setAssignmentSearch] = useState('');
  const [assignmentPage, setAssignmentPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [historySearch, setHistorySearch] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('pending');
  const [courseForm, setCourseForm] = useState({ course_name: '', course_code: '' });
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingNotif, setEditingNotif] = useState(null);
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [adminNotifStats, setAdminNotifStats] = useState({ pending: 0, completed: 0, cancelled: 0 });
  const [adminNotifFilter, setAdminNotifFilter] = useState('all');
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
      const [t, s, sub, c, stud, notifStats, notifs] = await Promise.all([
        axios.get(`${API}/admin/teachers`, { headers }),
        axios.get(`${API}/admin/sections`, { headers }),
        axios.get(`${API}/admin/subjects`, { headers }),
        axios.get(`${API}/admin/courses`, { headers }),
        axios.get(`${API}/admin/students`, { headers }),
        axios.get(`${API}/admin/notifications/stats`, { headers }),
        axios.get(`${API}/admin/notifications`, { headers }),
      ]);
      setTeachers(t.data);
      setSections(s.data);
      setSubjects(sub.data);
      setCourses(c.data);
      setStudents(stud.data);
      setAdminNotifStats(notifStats.data);
      setAdminNotifications(notifs.data);
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

  const loadAssignments = async () => {
    try {
      const { data } = await axios.get(`${API}/admin/assignments`, { headers });
      setAssignments(data);
    } catch (err) {
      console.error('loadAssignments error:', err);
    }
  };

  const createAssignment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/assignments`, assignmentForm, { headers });
      notify('Assignment created');
      setAssignmentForm({ teacher_id: '', subject_id: '', section_id: '' });
      loadAssignments();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to create assignment');
    }
  };

  const updateAssignment = async () => {
    try {
      await axios.put(`${API}/admin/assignments/${editingAssignment.id}`, editingAssignment, { headers });
      notify('Assignment updated');
      setEditingAssignment(null);
      loadAssignments();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to update assignment');
    }
  };

  const deleteAssignment = async (id) => {
    try {
      await axios.delete(`${API}/admin/assignments/${id}`, { headers });
      notify('Assignment removed');
      loadAssignments();
    } catch (err) {
      notify('Failed to delete assignment');
    }
  };

  const loadTeacherData = async () => {
    try {
      const [sec, mySub, his, allSub, combos] = await Promise.all([
        axios.get(`${API}/teacher/sections`, { headers }),
        axios.get(`${API}/teacher/my-subjects`, { headers }),
        axios.get(`${API}/teacher/notifications/history`, { headers }),
        axios.get(`${API}/teacher/all-subjects`, { headers }),
        axios.get(`${API}/teacher/assigned-combos`, { headers }),
      ]);
      setSections(sec.data);
      setSubjects(mySub.data);
      setHistory(his.data);
      setTeacherAllSubjects(allSub.data);
      setAssignedCombos(combos.data);
    } catch (err) {
      console.error('Error loading teacher data:', err);
      notify('Failed to load data');
    }
  };

  const loadStudentData = async () => {
    try {
      const [notifRes, subjRes] = await Promise.all([
        axios.get(`${API}/student/notifications`, { headers }),
        axios.get(`${API}/student/subjects`, { headers }),
      ]);
      setStudentNotifications(notifRes.data);
      setStudentEnrolledSubjects(subjRes.data);
    } catch (err) {
      console.error('Error loading student data:', err);
      notify('Failed to load notifications');
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.post(`${API}/student/notifications/${id}/read`, {}, { headers });
      loadStudentData();
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  };

  const markAsUnread = async (id) => {
    try {
      await axios.post(`${API}/student/notifications/${id}/unread`, {}, { headers });
      loadStudentData();
    } catch (err) {
      console.error('Mark as unread error:', err);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminData();
    } else if (user?.role === 'teacher') {
      loadTeacherData();
    } else if (user?.role === 'student') {
      loadStudentData();
    }
  }, [user?.role, user?.id]);

  const createTeacher = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/teachers`, teacherForm, { headers });
      notify('✓ Teacher created successfully');
      setTeacherForm({ first_name: '', last_name: '', middle_initial: '', email: '', password: '' });
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

  const deleteTeacherPermanent = async (id, name) => {
    showConfirm('Permanently Delete Teacher', `Permanently delete "${name}" and all their data? This cannot be undone!`, async () => {
      try {
        await axios.delete(`${API}/admin/teachers/${id}/permanent`, { headers });
        notify('✓ Teacher permanently deleted');
        loadArchivedTeachers();
        loadAdminData();
      } catch (err) {
        notify('Failed to delete teacher: ' + (err.response?.data?.message || err.message));
      }
    });
  };

  const openEditModal = async (teacher) => {
    setEditingTeacher({ ...teacher, password: '' });
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
      setSubjectForm({ subject_name: '' });
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
                <button
                  className={`tab ${activeTab === 'assignments' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('assignments'); loadAssignments(); }}
                >
                  🔗 Manage Assignments
                </button>
               </>
             )}
            {user?.role === 'teacher' && (
             <button
               className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
               onClick={() => { setActiveTab('notifications'); setHistoryPage(1); setHistorySearch(''); setHistoryStatusFilter('pending'); }}
             >
               📢 Send Notification
             </button>
           )}
           {user?.role === 'student' && (
             <button
                className={`tab ${activeTab === 'student-notifications' ? 'active' : ''}`}
                onClick={() => { setActiveTab('student-notifications'); loadStudentData(); }}
             >
               📩 My Notifications
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
                    <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => { setDashboardView(dashboardView === 'notifications' ? null : 'notifications'); setDetailSearch(''); setDetailPage(1); setAdminNotifFilter('all'); }}>
                      <div className="stat-icon">📢</div>
                      <div className="stat-content">
                        <p className="stat-label">Notifications</p>
                        <p className="stat-value">{adminNotifStats.pending + adminNotifStats.completed + adminNotifStats.cancelled}</p>
                      </div>
                    </div>
                  </>
                )}
                {user?.role === 'teacher' && (
                  <>
                    <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => { setDashboardView(dashboardView === 'my-sections' ? null : 'my-sections'); setDetailSearch(''); setDetailPage(1); }}>
                      <div className="stat-icon">📚</div>
                      <div className="stat-content">
                        <p className="stat-label">My Sections</p>
                        <p className="stat-value">{sections.length}</p>
                      </div>
                    </div>
                    <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => { setDashboardView(dashboardView === 'my-subjects' ? null : 'my-subjects'); setDetailSearch(''); setDetailPage(1); }}>
                      <div className="stat-icon">🎓</div>
                      <div className="stat-content">
                        <p className="stat-label">My Subjects</p>
                        <p className="stat-value">{subjects.length}</p>
                      </div>
                    </div>
                    <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => { setDashboardView(dashboardView === 'sent-notifications' ? null : 'sent-notifications'); setDetailSearch(''); setDetailPage(1); }}>
                      <div className="stat-icon">📢</div>
                      <div className="stat-content">
                        <p className="stat-label">Sent Notifications</p>
                        <p className="stat-value">{history.length}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {user?.role === 'student' && (
                <div className="card" style={{ marginTop: '1.5rem' }}>
                  <h3>📋 My Profile</h3>
                  <p><strong>Section:</strong> {user?.section_name || '—'}</p>
                  <h3 style={{ marginTop: '1rem' }}>📚 My Subjects</h3>
                  {studentEnrolledSubjects.length === 0 ? (
                    <p className="no-data">No subjects enrolled yet</p>
                  ) : (
                    <div className="table-container" style={{ marginTop: '0.5rem' }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Subject</th>
                            <th>Teacher</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentEnrolledSubjects.map((sub) => (
                            <tr key={sub.id}>
                              <td>{sub.subject_name}</td>
                              <td>{sub.teacher_name || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {dashboardView && (
                <div className="card">
                  <h3>
                    {dashboardView === 'teachers' && '👨‍🏫 Teachers'}
                    {dashboardView === 'sections' && '📚 Sections'}
                    {dashboardView === 'subjects' && '🎓 Subjects'}
                    {dashboardView === 'courses' && '📘 Courses'}
                    {dashboardView === 'students' && '👨‍🎓 Students'}
                    {dashboardView === 'my-sections' && '📚 My Sections'}
                    {dashboardView === 'my-subjects' && '🎓 My Subjects'}
                    {dashboardView === 'sent-notifications' && '📢 Sent Notifications'}
                    {dashboardView === 'notifications' && '📢 Notifications'}
                  </h3>
                  <input
                    type="text"
                    className="form-control search-input"
                    placeholder={`Search ${dashboardView === 'sent-notifications' || dashboardView === 'notifications' ? 'notifications' : dashboardView === 'my-sections' ? 'sections' : dashboardView === 'my-subjects' ? 'subjects' : dashboardView}...`}
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
                    else if (dashboardView === 'my-sections') data = sections.filter(s => !detailSearch || (s.section_name||'').toLowerCase().includes(detailSearch.toLowerCase()));
                    else if (dashboardView === 'my-subjects') data = subjects.filter(s => !detailSearch || (s.subject_name||'').toLowerCase().includes(detailSearch.toLowerCase()));
                    else if (dashboardView === 'sent-notifications') data = history.filter(h => !detailSearch || (h.title||'').toLowerCase().includes(detailSearch.toLowerCase()) || (h.section_name||'').toLowerCase().includes(detailSearch.toLowerCase()) || (h.subject_name||'').toLowerCase().includes(detailSearch.toLowerCase()));
                    else if (dashboardView === 'notifications') data = adminNotifications.filter(n => {
                      if (adminNotifFilter !== 'all') {
                        if (adminNotifFilter === 'pending' && n.status !== 'pending' && n.status !== 'scheduled') return false;
                        if (adminNotifFilter === 'completed' && n.status !== 'sent' && n.status !== 'delivered') return false;
                        if (adminNotifFilter === 'cancelled' && n.status !== 'cancelled') return false;
                      }
                      return !detailSearch || (n.title||'').toLowerCase().includes(detailSearch.toLowerCase()) || (n.section_name||'').toLowerCase().includes(detailSearch.toLowerCase()) || (n.subject_name||'').toLowerCase().includes(detailSearch.toLowerCase()) || (n.teacher_name||'').toLowerCase().includes(detailSearch.toLowerCase());
                    });
                    const totalPages = Math.ceil(data.length / pageSize) || 1;
                    const page = Math.min(detailPage, totalPages);
                    const start = (page - 1) * pageSize;
                    const paged = data.slice(start, start + pageSize);
                    return (
                      <>
                        {dashboardView === 'notifications' && (
                          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            {['all', 'pending', 'completed', 'cancelled'].map(f => (
                              <button key={f} className="btn" style={{
                                padding: '0.3rem 0.75rem', fontSize: '0.85rem',
                                background: adminNotifFilter === f ? 'var(--primary)' : 'var(--bg-card)',
                                color: adminNotifFilter === f ? '#fff' : 'inherit',
                                border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer'
                              }} onClick={() => { setAdminNotifFilter(f); setDetailPage(1); }}>
                                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                              </button>
                            ))}
                          </div>
                        )}
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>ID</th>
                              {dashboardView === 'teachers' && <><th>Name</th><th>Email</th><th>Subjects</th></>}
                              {dashboardView === 'sections' && <><th>Section</th><th>Course</th></>}
                              {dashboardView === 'subjects' && <><th>Subject</th><th>Teacher</th></>}
                              {dashboardView === 'courses' && <><th>Course Name</th><th>Code</th></>}
                              {dashboardView === 'students' && <><th>Name</th><th>Email</th><th>USN</th><th>Section</th><th>Subjects</th></>}
                              {dashboardView === 'my-sections' && <><th>Section Name</th></>}
                              {dashboardView === 'my-subjects' && <><th>Subject Name</th></>}
                              {dashboardView === 'sent-notifications' && <><th>Title</th><th>Section / Subject</th><th>Priority</th><th>Date Sent</th><th>Scheduled</th><th>Status</th></>}
                              {dashboardView === 'notifications' && <><th>Title</th><th>Teacher</th><th>Section / Subject</th><th>Priority</th><th>Date Sent</th><th>Status</th></>}
                            </tr>
                          </thead>
                          <tbody>
                            {paged.length > 0 ? (
                              dashboardView === 'teachers' ? paged.map(t => <tr key={t.id}><td>{t.id}</td><td>{getFullName(t)}</td><td>{t.email}</td><td>{t.subjects || '—'}</td></tr>) :
                              dashboardView === 'sections' ? paged.map(s => <tr key={s.id}><td>{s.id}</td><td>{s.section_name}</td><td>{s.course_code || '—'}</td></tr>) :
                              dashboardView === 'subjects' ? paged.map(s => <tr key={s.id}><td>{s.id}</td><td>{s.subject_name}</td><td>{s.teacher_name || 'N/A'}</td></tr>) :
                              dashboardView === 'courses' ? paged.map(c => <tr key={c.id}><td>{c.id}</td><td>{c.course_name}</td><td>{c.course_code}</td></tr>) :
                              dashboardView === 'students' ? paged.map(s => <tr key={s.id}><td>{s.id}</td><td>{[s.first_name, s.middle_initial? s.middle_initial+'.' : '', s.last_name].filter(Boolean).join(' ')}</td><td>{s.email}</td><td>{s.usn || '—'}</td><td>{s.section_name || '—'}</td><td>{s.subjects || '—'}</td></tr>) :
                              dashboardView === 'my-sections' ? paged.map(s => <tr key={s.id}><td>{s.id}</td><td>{s.section_name}</td></tr>) :
                              dashboardView === 'my-subjects' ? paged.map(s => <tr key={s.id}><td>{s.id}</td><td>{s.subject_name}</td></tr>) :
                              dashboardView === 'sent-notifications' ? paged.map(h => <tr key={h.id}><td>{h.id}</td><td>{h.title}</td><td>{h.section_name} / {h.subject_name}</td><td><span className={`priority-badge priority-${h.priority.toLowerCase()}`}>{h.priority}</span></td><td>{new Date(h.created_at).toLocaleString()}</td><td>{h.scheduled_at ? new Date(h.scheduled_at).toLocaleString() : '—'}</td><td>{h.status === 'scheduled' && <span className="priority-badge priority-exam">Scheduled</span>}{h.status === 'pending' && <span className="priority-badge priority-exam">Pending</span>}{h.status === 'sent' && <span className="priority-badge priority-normal">Sent</span>}{h.status === 'delivered' && <span className="priority-badge priority-success">Delivered</span>}{h.status === 'cancelled' && <span className="priority-badge priority-urgent">Cancelled</span>}</td></tr>) :
                              dashboardView === 'notifications' ? paged.map(n => <tr key={n.id}><td>{n.id}</td><td>{n.title}</td><td>{n.teacher_name}</td><td>{n.section_name} / {n.subject_name}</td><td><span className={`priority-badge priority-${n.priority.toLowerCase()}`}>{n.priority}</span></td><td>{new Date(n.created_at).toLocaleString()}</td><td>{n.status === 'pending' || n.status === 'scheduled' ? <span className="priority-badge priority-exam">Pending</span> : n.status === 'sent' || n.status === 'delivered' ? <span className="priority-badge priority-normal">Sent</span> : <span className="priority-badge priority-urgent">Cancelled</span>}</td></tr>) : null
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
                                  <button className="btn-sm btn-danger" style={{ marginLeft: '0.5rem' }} onClick={() => deleteTeacherPermanent(t.id, getFullName(t))}>Delete</button>
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

          {/* Edit Assignment Modal */}
          {editingAssignment && (
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-header">
                  <h3>Edit Assignment</h3>
                  <button className="modal-close" onClick={() => setEditingAssignment(null)}>×</button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); showConfirm('Update Assignment', `Update this assignment?`, () => updateAssignment()); }}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Teacher</label>
                      <select
                        value={editingAssignment.teacher_id}
                        onChange={(e) => setEditingAssignment({ ...editingAssignment, teacher_id: Number(e.target.value) })}
                        required
                      >
                        <option value="">Select teacher</option>
                        {[...teachers].sort((a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)).map((t) => (
                          <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Subject</label>
                      <select
                        value={editingAssignment.subject_id}
                        onChange={(e) => setEditingAssignment({ ...editingAssignment, subject_id: Number(e.target.value) })}
                        required
                      >
                        <option value="">Select subject</option>
                        {[...subjects].sort((a, b) => a.subject_name.localeCompare(b.subject_name)).map((s) => (
                          <option key={s.id} value={s.id}>{s.subject_name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Section</label>
                      <select
                        value={editingAssignment.section_id}
                        onChange={(e) => setEditingAssignment({ ...editingAssignment, section_id: Number(e.target.value) })}
                        required
                      >
                        <option value="">Select section</option>
                        {[...sections].sort((a, b) => (a.course_code || '').localeCompare(b.course_code || '') || a.section_name.localeCompare(b.section_name)).map((sec) => (
                          <option key={sec.id} value={sec.id}>{sec.course_code ? `${sec.course_code} ${sec.section_name}` : sec.section_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={() => setEditingAssignment(null)}>Cancel</button>
                    <button type="submit" className="btn-primary">Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
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
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search subjects..."
                        value={studentSubjectSearch}
                        onChange={(e) => setStudentSubjectSearch(e.target.value)}
                        style={{ marginBottom: '0.5rem' }}
                      />
                      <div className="subject-checklist">
                        {subjects.filter(s => !studentSubjectSearch || s.subject_name.toLowerCase().includes(studentSubjectSearch.toLowerCase())).sort((a, b) => a.subject_name.localeCompare(b.subject_name)).map((s) => (
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
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search subjects..."
                            value={editStudentSubjectSearch}
                            onChange={(e) => setEditStudentSubjectSearch(e.target.value)}
                            style={{ marginBottom: '0.5rem' }}
                          />
                          <div className="subject-checklist">
                            {subjects.filter(sub => !editStudentSubjectSearch || sub.subject_name.toLowerCase().includes(editStudentSubjectSearch.toLowerCase())).sort((a, b) => a.subject_name.localeCompare(b.subject_name)).map((sub) => (
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

          {/* Admin: Manage Assignments */}
          {user?.role === 'admin' && activeTab === 'assignments' && (
            <section className="form-section">
              <h2>🔗 Manage Teacher-Subject-Section Assignments</h2>
              <div className="card">
                <h4>Create Assignment</h4>
                <form onSubmit={createAssignment}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Teacher</label>
                      <select
                        value={assignmentForm.teacher_id}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, teacher_id: e.target.value })}
                        required
                      >
                        <option value="">Select teacher</option>
                        {[...teachers].sort((a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)).map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.first_name} {t.last_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Subject</label>
                      <select
                        value={assignmentForm.subject_id}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, subject_id: e.target.value })}
                        required
                      >
                        <option value="">Select subject</option>
                        {[...subjects].sort((a, b) => a.subject_name.localeCompare(b.subject_name)).map((s) => (
                          <option key={s.id} value={s.id}>{s.subject_name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Section</label>
                      <select
                        value={assignmentForm.section_id}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, section_id: e.target.value })}
                        required
                      >
                        <option value="">Select section</option>
                        {[...sections].sort((a, b) => (a.course_code || '').localeCompare(b.course_code || '') || a.section_name.localeCompare(b.section_name)).map((sec) => (
                          <option key={sec.id} value={sec.id}>{sec.course_code ? `${sec.course_code} ${sec.section_name}` : sec.section_name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ alignSelf: 'flex-end' }}>
                      <button type="submit" className="btn-primary">Assign</button>
                    </div>
                  </div>
                </form>
              </div>
              <div className="card mt-4">
                <input
                  type="text"
                  className="form-control search-input"
                  placeholder="Search assignments..."
                  value={assignmentSearch}
                  onChange={(e) => { setAssignmentSearch(e.target.value); setAssignmentPage(1); }}
                />
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Teacher</th>
                        <th>Subject</th>
                        <th>Section</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        if (assignments.length === 0) {
                          return <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No assignments yet</td></tr>;
                        }
                        const filtered = assignments.filter(a =>
                          !assignmentSearch ||
                          a.teacher_name?.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
                          a.subject_name?.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
                          a.section_name?.toLowerCase().includes(assignmentSearch.toLowerCase())
                        );
                        if (filtered.length === 0) {
                          return <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No matches found</td></tr>;
                        }
                        const totalPages = Math.ceil(filtered.length / 10) || 1;
                        const page = Math.min(assignmentPage, totalPages);
                        const start = (page - 1) * 10;
                          return filtered.slice(start, start + 10).map((a) => {
                          const sectionLabel = a.course_code ? `${a.course_code} ${a.section_name}` : a.section_name;
                          return (
                          <tr key={a.id}>
                            <td>{a.teacher_name}</td>
                            <td>{a.subject_name}</td>
                            <td>{sectionLabel}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                  className="btn-sm btn-secondary"
                                  onClick={() => setEditingAssignment({ ...a })}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn-sm btn-danger"
                                  onClick={() => showConfirm('Remove Assignment', `Remove ${a.teacher_name} from ${a.subject_name} - ${a.section_name}?`, () => deleteAssignment(a.id))}
                                >
                                  Remove
                                </button>
                              </div>
                            </td>
                          </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
                {(() => {
                  if (assignments.length === 0) return null;
                  const filtered = assignments.filter(a =>
                    !assignmentSearch ||
                    a.teacher_name?.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
                    a.subject_name?.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
                    a.section_name?.toLowerCase().includes(assignmentSearch.toLowerCase())
                  );
                  if (filtered.length === 0) return null;
                  const totalPages = Math.ceil(filtered.length / 10) || 1;
                  return (
                    <div className="pagination">
                      <button className="btn-sm btn-secondary" disabled={assignmentPage <= 1} onClick={() => setAssignmentPage(assignmentPage - 1)}>← Prev</button>
                      <span>Page {assignmentPage} of {totalPages}</span>
                      <button className="btn-sm btn-secondary" disabled={assignmentPage >= totalPages} onClick={() => setAssignmentPage(assignmentPage + 1)}>Next →</button>
                    </div>
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
                      <label>Select Section</label>
                      <select
                        value={notifForm.section_id}
                        onChange={(e) => {
                          const secId = Number(e.target.value);
                          setNotifForm({ ...notifForm, section_id: secId, subject_id: '' });
                        }}
                        required
                      >
                        <option value="">Select a section</option>
                        {sections.map((sec) => (
                          <option key={sec.id} value={sec.id}>
                            {sec.section_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Select Subject</label>
                      <select
                        value={notifForm.subject_id}
                        onChange={(e) => setNotifForm({ ...notifForm, subject_id: Number(e.target.value) })}
                        required
                      >
                        <option value="">Select a subject</option>
                        {assignedCombos
                          .filter(c => !notifForm.section_id || c.section_id === notifForm.section_id)
                          .filter((c, i, arr) => arr.findIndex(x => x.subject_id === c.subject_id) === i)
                          .map((c) => (
                            <option key={c.subject_id} value={c.subject_id}>
                              {c.subject_name}
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
                <div className="history-tabs">
                  {(() => {
                    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
                    const pendingCount = history.filter(h => h.status === 'scheduled' || h.status === 'pending').length;
                    const completedCount = history.filter(h => (h.status === 'sent' || h.status === 'delivered') && new Date(h.created_at).getTime() >= cutoff).length;
                    const cancelledCount = history.filter(h => h.status === 'cancelled' && new Date(h.created_at).getTime() >= cutoff).length;
                    const archivedCount = history.filter(h => (h.status === 'sent' || h.status === 'delivered' || h.status === 'cancelled') && new Date(h.created_at).getTime() < cutoff).length;
                    return (
                      <>
                        <button
                          className={`tab ${historyStatusFilter === 'pending' ? 'active' : ''}`}
                          onClick={() => { setHistoryStatusFilter('pending'); setHistoryPage(1); setHistorySearch(''); }}
                        >
                          ⏳ Pending ({pendingCount})
                        </button>
                        <button
                          className={`tab ${historyStatusFilter === 'completed' ? 'active' : ''}`}
                          onClick={() => { setHistoryStatusFilter('completed'); setHistoryPage(1); setHistorySearch(''); }}
                        >
                          ✅ Completed ({completedCount})
                        </button>
                        <button
                          className={`tab ${historyStatusFilter === 'cancelled' ? 'active' : ''}`}
                          onClick={() => { setHistoryStatusFilter('cancelled'); setHistoryPage(1); setHistorySearch(''); }}
                        >
                          ❌ Cancelled ({cancelledCount})
                        </button>
                        <button
                          className={`tab ${historyStatusFilter === 'archived' ? 'active' : ''}`}
                          onClick={() => { setHistoryStatusFilter('archived'); setHistoryPage(1); setHistorySearch(''); }}
                        >
                          🗃️ Archived ({archivedCount})
                        </button>
                      </>
                    );
                  })()}
                </div>
                <input
                  type="text"
                  className="form-control search-input"
                  placeholder="Search by title, section, or subject..."
                  value={historySearch}
                  onChange={(e) => { setHistorySearch(e.target.value); setHistoryPage(1); }}
                />
                {(() => {
                  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
                  const filtered = history.filter(h => {
                    const createdTime = new Date(h.created_at).getTime();
                    const isRecent = createdTime >= cutoff;
                    const isOld = createdTime < cutoff;
                    const matchesStatus =
                      historyStatusFilter === 'pending' ? (h.status === 'scheduled' || h.status === 'pending') :
                      historyStatusFilter === 'completed' ? ((h.status === 'sent' || h.status === 'delivered') && isRecent) :
                      historyStatusFilter === 'cancelled' ? (h.status === 'cancelled' && isRecent) :
                      (h.status === 'sent' || h.status === 'delivered' || h.status === 'cancelled') && isOld;
                    const matchesSearch = !historySearch ||
                      (h.title || '').toLowerCase().includes(historySearch.toLowerCase()) ||
                      (h.section_name || '').toLowerCase().includes(historySearch.toLowerCase()) ||
                      (h.subject_name || '').toLowerCase().includes(historySearch.toLowerCase());
                    return matchesStatus && matchesSearch;
                  });
                  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
                  const page = Math.min(historyPage, totalPages);
                  const start = (page - 1) * pageSize;
                  const paged = filtered.slice(start, start + pageSize);
                  const isPending = historyStatusFilter === 'pending';
                  const showDelete = historyStatusFilter === 'cancelled' || historyStatusFilter === 'archived';
                  const label = historyStatusFilter === 'archived' ? 'archived' : historyStatusFilter;
                  return (
                    <>
                      {paged.length > 0 ? (
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Title</th>
                              <th>Section / Subject</th>
                              <th>Priority</th>
                              <th>Date Sent</th>
                              <th>Scheduled</th>
                              <th>Status</th>
                              {(isPending || showDelete) && <th>Actions</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {paged.map((h) => (
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
                                <td>{new Date(h.created_at).toLocaleString()}</td>
                                <td>{h.scheduled_at ? new Date(h.scheduled_at).toLocaleString() : '—'}</td>
                                <td>
                                  {h.status === 'scheduled' && <span className="priority-badge priority-exam">Scheduled</span>}
                                  {h.status === 'pending' && <span className="priority-badge priority-exam">Pending</span>}
                                  {h.status === 'sent' && <span className="priority-badge priority-normal">Sent</span>}
                                  {h.status === 'delivered' && <span className="priority-badge priority-success">Delivered</span>}
                                  {h.status === 'cancelled' && <span className="priority-badge priority-urgent">Cancelled</span>}
                                </td>
                                {isPending && (
                                  <td>
                                    <button
                                      className="btn-sm btn-success"
                                      title="Mark as completed"
                                      onClick={async () => {
                                        try {
                                          await axios.put(`${API}/teacher/notifications/${h.id}/complete`, {}, { headers });
                                          notify('✓ Notification marked as completed');
                                          loadTeacherData();
                                        } catch (err) {
                                          notify('Failed to complete: ' + (err.response?.data?.message || err.message));
                                        }
                                      }}
                                      style={{ marginRight: '0.5rem' }}
                                    >
                                      ✓
                                    </button>
                                    <button
                                      className="btn-sm"
                                      title="Edit notification"
                                      onClick={() => setEditingNotif({ ...h, scheduled_at: h.scheduled_at ? h.scheduled_at.slice(0, 16) : '' })}
                                      style={{ marginRight: '0.5rem', background: '#3b82f6', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                                    >
                                      ✎
                                    </button>
                                    <button
                                      className="btn-sm btn-danger"
                                      title="Cancel notification"
                                      onClick={async () => {
                                        try {
                                          await axios.put(`${API}/teacher/notifications/${h.id}/cancel`, {}, { headers });
                                          notify('✓ Notification cancelled');
                                          loadTeacherData();
                                        } catch (err) {
                                          notify('Failed to cancel: ' + (err.response?.data?.message || err.message));
                                        }
                                      }}
                                    >
                                      ✕
                                    </button>
                                  </td>
                                )}
                                {showDelete && h.status === 'cancelled' && (
                                  <td>
                                    <button
                                      className="btn-sm btn-danger"
                                      title="Delete notification"
                                      onClick={async () => {
                                        try {
                                          await axios.delete(`${API}/teacher/notifications/${h.id}`, { headers });
                                          notify('✓ Notification deleted');
                                          loadTeacherData();
                                        } catch (err) {
                                          notify('Failed to delete: ' + (err.response?.data?.message || err.message));
                                        }
                                      }}
                                    >
                                      🗑️
                                    </button>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="no-data">No {label} notifications found</p>
                      )}
                      {totalPages > 1 && (
                        <div className="pagination">
                          <button className="btn-sm btn-secondary" disabled={page <= 1} onClick={() => setHistoryPage(page - 1)}>← Prev</button>
                          <span style={{ margin: '0 1rem', color: 'var(--text-light)' }}>Page {page} of {totalPages}</span>
                          <button className="btn-sm btn-secondary" disabled={page >= totalPages} onClick={() => setHistoryPage(page + 1)}>Next →</button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
             </section>
          )}

          {/* Student: My Notifications */}
          {user?.role === 'student' && activeTab === 'student-notifications' && (
            <section className="form-section">
              <h2>📩 My Notifications
                <button className="btn-sm" onClick={() => { loadStudentData(); notify('✓ Refreshed'); }} style={{ marginLeft: '1rem', verticalAlign: 'middle', minHeight: 'auto', padding: '4px 12px', fontSize: '0.85rem' }}>⟳ Refresh</button>
              </h2>
              <div className="card">
                {studentEnrolledSubjects.length > 0 && (
                  <div className="filter-bar" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      className={`tab ${studentSubjectFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setStudentSubjectFilter('all')}
                    >
                      All
                    </button>
                    {studentEnrolledSubjects.map((sub) => (
                      <button
                        key={sub.id}
                        className={`tab ${studentSubjectFilter === sub.id ? 'active' : ''}`}
                        onClick={() => setStudentSubjectFilter(sub.id)}
                      >
                        {sub.subject_name}
                      </button>
                    ))}
                  </div>
                )}
                {(() => {
                  const filtered = studentSubjectFilter === 'all'
                    ? studentNotifications
                    : studentNotifications.filter(n => n.subject_id === studentSubjectFilter);
                  return filtered.length === 0 ? (
                    <p className="no-data">No notifications yet</p>
                  ) : (
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Message</th>
                            <th>Subject</th>
                            <th>Section</th>
                            <th>Priority</th>
                             <th>Scheduled</th>
                             <th>Sent</th>
                             <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((n) => (
                            <tr key={n.id} className={n.is_read ? '' : 'unread-row'} style={n.is_read ? {} : { fontWeight: 'bold', background: '#f0f7ff' }}>
                              <td>{n.title}</td>
                              <td>{n.message}</td>
                              <td>{n.subject_name}</td>
                              <td>{n.section_name}</td>
                              <td>
                                <span className={`priority-${n.priority?.toLowerCase()}`}>{n.priority}</span>
                              </td>
                              <td>{n.scheduled_at ? new Date(n.scheduled_at).toLocaleString() : '—'}</td>
                              <td>{new Date(n.created_at).toLocaleString()}</td>
                              <td>
                                <span className={n.is_read ? 'status-read' : 'status-unread'}>{n.is_read ? 'Read' : 'Unread'}</span>
                                <button className="btn-sm btn-secondary" style={{ marginLeft: '0.5rem' }} onClick={() => n.is_read ? markAsUnread(n.id) : markAsRead(n.id)}>
                                  {n.is_read ? 'Mark Unread' : 'Mark Read'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            </section>
          )}
        </div>
      </div>

      {editingNotif && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>✎ Edit Notification</h3>
              <button className="modal-close" onClick={() => setEditingNotif(null)}>×</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await axios.put(
                  `${API}/teacher/notifications/${editingNotif.id}/edit`,
                  {
                    title: editingNotif.title,
                    message: editingNotif.message,
                    priority: editingNotif.priority,
                    scheduled_at: editingNotif.scheduled_at || null,
                  },
                  { headers }
                );
                notify('✓ Notification updated');
                setEditingNotif(null);
                loadTeacherData();
              } catch (err) {
                notify('Failed to update: ' + (err.response?.data?.message || err.message));
              }
            }}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={editingNotif.title || ''}
                  onChange={(e) => setEditingNotif({ ...editingNotif, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea
                  value={editingNotif.message || ''}
                  onChange={(e) => setEditingNotif({ ...editingNotif, message: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={editingNotif.priority || 'Normal'}
                    onChange={(e) => setEditingNotif({ ...editingNotif, priority: e.target.value })}
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
                    value={editingNotif.scheduled_at || ''}
                    onChange={(e) => setEditingNotif({ ...editingNotif, scheduled_at: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditingNotif(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
    if (newUser.role === 'student') {
      setTimeout(() => setupPWA(newToken), 1000);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken('');
    setUser(null);
    setCurrentPage('landing');
  };

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        handleLogout();
      }
    };
    const handleVisibilityChange = () => {
      if (!document.hidden && !localStorage.getItem('token')) {
        handleLogout();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

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
