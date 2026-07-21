/* ── LectureLink Production Engine, Rich Seed Data & Interlinked Sync ────────
   Author: Leema Kamara (Student ID: 8780)
   Group: Group 13 — UNIMAK Web Programming Project
   ───────────────────────────────────────────────────────────────────────── */

'use strict';

const STORAGE_KEY = 'LECTURELINK_DB_V3';
const SESSION_KEY = 'LECTURELINK_SESSION';

// ── Rich Seed Data Engine (UNIMAK Campus Database) ───────────────────────────
const DEFAULT_SEED = {
  users: [
    { id:'u1', role:'lecturer', name:'Dr. Ibrahim Koroma', email:'ikoroma@unimak.edu.sl', password:'lecturer123', department:'Computer Science', staffID:'STF001' },
    { id:'u2', role:'lecturer', name:'Prof. Mariatu Bangura', email:'mbangura@unimak.edu.sl', password:'lecturer123', department:'Engineering', staffID:'STF002' },
    { id:'u3', role:'admin',   name:'Administrator', email:'admin@unimak.edu.sl', password:'admin123', department:'Administration' },
    
    // Students
    { id:'u4', role:'student', name:'Alimamy Kamara',   email:'akamara@unimak.edu.sl',  password:'student123', matric:'11277', course:'Computer Science', level:3 },
    { id:'u5', role:'student', name:'Emmanuel Aruna',   email:'earuna@unimak.edu.sl',   password:'student123', matric:'10027', course:'Computer Science', level:3 },
    { id:'u6', role:'student', name:'Leema Kamara',     email:'lkamara@unimak.edu.sl',  password:'student123', matric:'8780',  course:'Engineering', level:2 },
    { id:'u7', role:'student', name:'Samuel Dumbuya',   email:'sdumbuya@unimak.edu.sl', password:'student123', matric:'10533', course:'Business Administration', level:2 },
    { id:'u8', role:'student', name:'Momoh Kargbo',     email:'mkargbo@unimak.edu.sl',  password:'student123', matric:'10838', course:'Computer Science', level:3 },
    { id:'u9', role:'student', name:'Fatima Sesay',     email:'fsesay@unimak.edu.sl',   password:'student123', matric:'11500', course:'Social Sciences', level:1 },
    { id:'u10', role:'student', name:'Mohamed Mansaray',email:'mmansaray@unimak.edu.sl',password:'student123', matric:'11820', course:'Computer Science', level:3 },
    { id:'u11', role:'student', name:'Aminata Conteh',  email:'aconteh@unimak.edu.sl',  password:'student123', matric:'12010', course:'Engineering', level:2 },
    { id:'u12', role:'student', name:'Joseph Turay',    email:'jturay@unimak.edu.sl',   password:'student123', matric:'12150', course:'Business Administration', level:1 },
    
    // Additional Lecturers
    { id:'u13', role:'lecturer', name:'Mr. Santigie Kabba', email:'skabba@unimak.edu.sl', password:'lecturer123', department:'Business Administration', staffID:'STF003' },
    { id:'u14', role:'lecturer', name:'Mrs. Isatu Fornah',   email:'ifornah@unimak.edu.sl', password:'lecturer123', department:'Social Sciences', staffID:'STF004' }
  ],
  classes: [
    { id:'c1', name:'Advanced Software Engineering', code:'CSC401', lecturerId:'u1', department:'Computer Science', enrolled:['u4','u5','u8','u10'] },
    { id:'c2', name:'Database Systems',              code:'CSC302', lecturerId:'u1', department:'Computer Science', enrolled:['u4','u5','u8','u10'] },
    { id:'c3', name:'Linear Algebra & Calculus',     code:'MTH201', lecturerId:'u2', department:'Engineering',       enrolled:['u6','u11'] },
    { id:'c4', name:'Communication Skills',          code:'GNS101', lecturerId:'u2', department:'General Studies',   enrolled:['u4','u5','u6','u7','u8','u9','u10','u11','u12'] },
    { id:'c5', name:'Principles of Accounting',      code:'BUS201', lecturerId:'u13',department:'Business Administration', enrolled:['u7','u12'] },
    { id:'c6', name:'Research Methods & Ethics',     code:'SOC301', lecturerId:'u14',department:'Social Sciences', enrolled:['u9'] }
  ],
  sessions: [
    { id:'s1', classId:'c1', token:'TOKEN-ADV-001', startTime: new Date(Date.now()-86400000*3).toISOString(), endTime: new Date(Date.now()-86400000*3+300000).toISOString(), status:'closed' },
    { id:'s2', classId:'c2', token:'TOKEN-DB-001',  startTime: new Date(Date.now()-86400000*2).toISOString(), endTime: new Date(Date.now()-86400000*2+300000).toISOString(), status:'closed' },
    { id:'s3', classId:'c3', token:'TOKEN-LA-001',  startTime: new Date(Date.now()-86400000*4).toISOString(), endTime: new Date(Date.now()-86400000*4+300000).toISOString(), status:'closed' },
    { id:'s4', classId:'c4', token:'TOKEN-GNS-001', startTime: new Date(Date.now()-86400000*1).toISOString(), endTime: new Date(Date.now()-86400000*1+300000).toISOString(), status:'closed' },
    { id:'s5', classId:'c5', token:'TOKEN-BUS-001', startTime: new Date(Date.now()-86400000*5).toISOString(), endTime: new Date(Date.now()-86400000*5+300000).toISOString(), status:'closed' }
  ],
  attendance: [
    // s1 (CSC401)
    { id:'a1', sessionId:'s1', studentId:'u4', timestamp: new Date(Date.now()-86400000*3+60000).toISOString(), status:'present' },
    { id:'a2', sessionId:'s1', studentId:'u5', timestamp: new Date(Date.now()-86400000*3+90000).toISOString(), status:'present' },
    { id:'a3', sessionId:'s1', studentId:'u8', timestamp: new Date(Date.now()-86400000*3+120000).toISOString(), status:'present' },
    { id:'a4', sessionId:'s1', studentId:'u10',timestamp: new Date(Date.now()-86400000*3+150000).toISOString(), status:'present' },
    
    // s2 (CSC302)
    { id:'a5', sessionId:'s2', studentId:'u4', timestamp: new Date(Date.now()-86400000*2+60000).toISOString(), status:'present' },
    { id:'a6', sessionId:'s2', studentId:'u8', timestamp: new Date(Date.now()-86400000*2+90000).toISOString(), status:'present' },
    { id:'a7', sessionId:'s2', studentId:'u10',timestamp: new Date(Date.now()-86400000*2+110000).toISOString(), status:'present' },
    
    // s3 (MTH201)
    { id:'a8', sessionId:'s3', studentId:'u6', timestamp: new Date(Date.now()-86400000*4+60000).toISOString(), status:'present' },
    { id:'a9', sessionId:'s3', studentId:'u11',timestamp: new Date(Date.now()-86400000*4+90000).toISOString(), status:'present' },
    
    // s4 (GNS101)
    { id:'a10', sessionId:'s4', studentId:'u4', timestamp: new Date(Date.now()-86400000*1+60000).toISOString(), status:'present' },
    { id:'a11', sessionId:'s4', studentId:'u5', timestamp: new Date(Date.now()-86400000*1+80000).toISOString(), status:'present' },
    { id:'a12', sessionId:'s4', studentId:'u6', timestamp: new Date(Date.now()-86400000*1+100000).toISOString(), status:'present' },
    { id:'a13', sessionId:'s4', studentId:'u7', timestamp: new Date(Date.now()-86400000*1+120000).toISOString(), status:'present' },
    { id:'a14', sessionId:'s4', studentId:'u8', timestamp: new Date(Date.now()-86400000*1+140000).toISOString(), status:'present' },
    
    // s5 (BUS201)
    { id:'a15', sessionId:'s5', studentId:'u7', timestamp: new Date(Date.now()-86400000*5+60000).toISOString(), status:'present' },
    { id:'a16', sessionId:'s5', studentId:'u12',timestamp: new Date(Date.now()-86400000*5+90000).toISOString(), status:'present' }
  ]
};

// ── Persistent Storage Management & Interlinked Sync Engine ──────────────────
let DB = loadDB();
let currentUser = null;
let currentRole = 'student';
let activeSession = null;      // { session, classObj, expiresAt, timer }

function loadDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SEED));
      return JSON.parse(JSON.stringify(DEFAULT_SEED));
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('LocalStorage load error, resetting to seed', e);
    return JSON.parse(JSON.stringify(DEFAULT_SEED));
  }
}

function saveDB() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DB));
    window.dispatchEvent(new Event('lecturelink_sync'));
  } catch (e) {
    console.error('Failed to save to LocalStorage', e);
  }
}

function resetDB() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SEED));
  DB = JSON.parse(JSON.stringify(DEFAULT_SEED));
  saveDB();
}

// Inter-Tab Storage Synchronizer
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) {
    DB = loadDB();
    if (currentUser) {
      loadDashboard(currentUser.role);
    }
  }
});

window.addEventListener('lecturelink_sync', () => {
  if (currentUser) {
    loadDashboard(currentUser.role);
  }
});

// ── Helper Utilities ──────────────────────────────────────────────────────────
function genId(prefix='id') { return prefix + '-' + Math.random().toString(36).substr(2, 9); }
function genToken()         { return 'QR-' + Math.random().toString(36).substr(2,6).toUpperCase() + '-' + Date.now().toString(36).toUpperCase(); }

function fmtTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
function isValidEmail(email) { return EMAIL_REGEX.test(email); }

function show(id)  { const el = document.getElementById(id); if (el) el.style.display = ''; }
function hide(id)  { const el = document.getElementById(id); if (el) el.style.display = 'none'; }

function showAlert(id, msg, type='error') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = `alert alert-${type} show`;
}

function clearAlert(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = 'alert alert-error';
  el.textContent = '';
}

function setScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('screen-' + name);
  if (target) target.classList.add('active');
}

// ── Authentication & Session Router ──────────────────────────────────────────
function switchRole(role) {
  currentRole = role;
  document.querySelectorAll('.role-tab').forEach((t,i) => {
    t.classList.toggle('active', ['student','lecturer','admin'][i] === role);
  });
  hide('register-form-wrap');
  show('login-form-wrap');
  document.getElementById('register-toggle').style.display = role === 'student' ? 'block' : 'none';
  clearAlert('login-alert');
}

function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-password').value;
  clearAlert('login-alert');

  if (!email) return showAlert('login-alert', 'Please enter an email address to sign in.');
  if (!isValidEmail(email)) return showAlert('login-alert', 'Invalid email format! Use a valid email structure (e.g. alimamy@gmail.com).');

  // Find existing user or auto-provision on the fly for smooth access
  let user = DB.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === currentRole);

  if (!user) {
    const rawName = email.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = rawName.replace(/\b\w/g, c => c.toUpperCase());

    user = {
      id: genId('u'),
      role: currentRole,
      name: formattedName || (currentRole === 'admin' ? 'Administrator' : 'User'),
      email: email,
      password: pass || (currentRole === 'student' ? 'student123' : currentRole === 'lecturer' ? 'lecturer123' : 'admin123'),
      department: 'Computer Science',
      matric: String(Math.floor(10000 + Math.random() * 90000)),
      course: 'Computer Science',
      level: 3,
      staffID: 'STF-' + Math.floor(100 + Math.random() * 900)
    };

    DB.users.push(user);

    // Auto-enrol new student in all default classes
    if (currentRole === 'student') {
      DB.classes.forEach(c => {
        if (!c.enrolled.includes(user.id)) c.enrolled.push(user.id);
      });
    }

    // Give new lecturer a demo class
    if (currentRole === 'lecturer') {
      DB.classes.push({
        id: genId('c'),
        name: 'Web Application Architecture',
        code: 'CSC309',
        lecturerId: user.id,
        department: 'Computer Science',
        enrolled: DB.users.filter(u => u.role === 'student').map(u => u.id)
      });
    }

    saveDB();
  } else if (pass && user.password && user.password !== pass) {
    user.password = pass;
    saveDB();
  }

  currentUser = user;
  saveSession(user);
  loadDashboard(user.role);
}

function doRegister() {
  clearAlert('register-alert');
  const first  = document.getElementById('reg-first').value.trim();
  const last   = document.getElementById('reg-last').value.trim();
  const email  = document.getElementById('reg-email').value.trim();
  const matric = document.getElementById('reg-matric').value.trim();
  const course = document.getElementById('reg-course').value;
  const pass   = document.getElementById('reg-password').value;

  if (!first || !last || !email || !matric || !course || !pass)
    return showAlert('register-alert', 'Please fill in all required fields.');
  if (!isValidEmail(email))
    return showAlert('register-alert', 'Invalid email format! Use a valid structure (e.g. name@unimak.edu.sl).');
  if (pass.length < 6)
    return showAlert('register-alert', 'Password must be at least 6 characters long.');

  let existing = DB.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    existing.name = first + ' ' + last;
    existing.matric = matric;
    existing.course = course;
    existing.password = pass;
    saveDB();
    currentUser = existing;
  } else {
    const newUser = {
      id: genId('u'), role: 'student',
      name: first + ' ' + last, email, password: pass,
      matric, course, level: 1, department: course
    };
    DB.users.push(newUser);
    DB.classes.forEach(c => {
      if (!c.enrolled.includes(newUser.id)) c.enrolled.push(newUser.id);
    });
    saveDB();
    currentUser = newUser;
  }

  saveSession(currentUser);
  showAlert('register-alert', 'Account registered successfully! Signing you in…', 'success');
  setTimeout(() => loadDashboard('student'), 800);
}

function saveSession(user) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, timestamp: Date.now() }));
  } catch (e) {}
}

function restoreSession() {
  try {
    const sessionRaw = localStorage.getItem(SESSION_KEY);
    if (sessionRaw) {
      const sess = JSON.parse(sessionRaw);
      const user = DB.users.find(u => u.id === sess.userId);
      if (user) {
        currentUser = user;
        currentRole = user.role;
        switchRole(user.role);
        loadDashboard(user.role);
        return true;
      }
    }
  } catch (e) {}
  return false;
}

function doLogout() {
  if (activeSession) endSession();
  currentUser = null;
  activeSession = null;
  try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
  setScreen('login');
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
}

function showRegister() {
  hide('login-form-wrap');
  show('register-form-wrap');
}

function showLogin() {
  hide('register-form-wrap');
  show('login-form-wrap');
}

// ── Admin CRUD Data Handlers ──────────────────────────────────────────────────
function apiAddUser(userData) {
  if (DB.users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
    throw new Error('A user with this email address already exists.');
  }
  const newUser = { id: genId('u'), ...userData };
  DB.users.push(newUser);
  saveDB();
  return newUser;
}

function apiUpdateUser(userId, updatedData) {
  const idx = DB.users.findIndex(u => u.id === userId);
  if (idx === -1) throw new Error('User not found.');
  DB.users[idx] = { ...DB.users[idx], ...updatedData };
  saveDB();
}

function apiDeleteUser(userId) {
  DB.users = DB.users.filter(u => u.id !== userId);
  DB.classes.forEach(c => {
    c.enrolled = c.enrolled.filter(id => id !== userId);
  });
  saveDB();
}

function apiAddClass(classData) {
  const newClass = { id: genId('c'), enrolled: DB.users.filter(u => u.role === 'student').map(u => u.id), ...classData };
  DB.classes.push(newClass);
  saveDB();
  return newClass;
}

function apiDeleteClass(classId) {
  DB.classes = DB.classes.filter(c => c.id !== classId);
  DB.sessions = DB.sessions.filter(s => s.classId !== classId);
  saveDB();
}

// ── Dashboard Navigation Router ───────────────────────────────────────────────
function loadDashboard(role) {
  setScreen(role);
  if (role === 'student')  loadStudentDash();
  if (role === 'lecturer') loadLecturerDash();
  if (role === 'admin')    loadAdminDash();
}
