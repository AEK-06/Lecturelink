/* ── LectureLink Production Portals & Real-Time Interlinked Records ─────────
   Author: Samuel Dumbuya (Student ID: 10533)
   Group: Group 13 — UNIMAK Web Programming Project
   ───────────────────────────────────────────────────────────────────────── */

'use strict';

let cameraStream = null;

// ── WebRTC Camera Scanner Engine ─────────────────────────────────────────────
async function startCameraScanner() {
  const video = document.getElementById('scanner-video');
  const fallbackNote = document.getElementById('camera-fallback-note');
  if (!video) return;

  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      video.srcObject = cameraStream;
      video.play();
      if (fallbackNote) fallbackNote.style.display = 'none';
    } else {
      if (fallbackNote) fallbackNote.style.display = 'block';
    }
  } catch (err) {
    console.warn('Camera access denied or unavailable:', err);
    if (fallbackNote) {
      fallbackNote.textContent = '⚠️ Camera unavailable. Enter the QR token manually below.';
      fallbackNote.style.display = 'block';
    }
  }
}

function stopCameraScanner() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
  const video = document.getElementById('scanner-video');
  if (video) video.srcObject = null;
}

function showScanner() {
  show('scanner-modal');
  clearAlert('scan-alert');
  document.getElementById('scan-token-input').value = '';

  // Pre-fill active session token for convenient demo scanning
  const active = DB.sessions.find(s => s.status === 'active');
  if (active) document.getElementById('scan-token-input').value = active.token;

  startCameraScanner();
}

function closeScanner() {
  stopCameraScanner();
  hide('scanner-modal');
}

function submitScan() {
  clearAlert('scan-alert');
  const token = document.getElementById('scan-token-input').value.trim();
  if (!token) return showAlert('scan-alert', 'Please enter or scan the QR token.');

  const session = DB.sessions.find(s => s.token === token && s.status === 'active');
  if (!session) return showAlert('scan-alert', 'Invalid or expired QR code token. Ensure session is live.');

  const cls = DB.classes.find(c => c.id === session.classId);

  // Check if attendance already marked
  if (DB.attendance.some(a => a.sessionId === session.id && a.studentId === currentUser.id)) {
    return showAlert('scan-alert', 'You have already marked attendance for this class session.', 'info');
  }

  // Enrol student in class if not enrolled
  if (cls && !cls.enrolled.includes(currentUser.id)) {
    cls.enrolled.push(currentUser.id);
  }

  // Log attendance record
  DB.attendance.push({
    id: genId('a'),
    sessionId: session.id,
    studentId: currentUser.id,
    timestamp: new Date().toISOString(),
    status: 'present'
  });
  
  // Persist and trigger interlinked UI sync across all panels & tabs
  saveDB();

  showAlert('scan-alert', `✓ Verified! Attendance recorded for ${cls ? cls.name : 'session'}!`, 'success');

  setTimeout(() => {
    closeScanner();
    loadDashboard(currentUser.role);
  }, 1000);
}

// ── Student Dashboard Portal ──────────────────────────────────────────────────
function loadStudentDash() {
  const u = currentUser;
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('student-greeting').textContent = `${greet}, ${u.name.split(' ')[0]}`;
  document.getElementById('student-nav-name').textContent = u.name;

  // Active Session Banner Check
  const active = DB.sessions.find(s => s.status === 'active');
  if (active) {
    const cls = DB.classes.find(c => c.id === active.classId);
    const alreadySigned = DB.attendance.some(a => a.sessionId === active.id && a.studentId === u.id);
    document.getElementById('active-session-name').textContent = cls ? cls.name : 'Active Lecture Session';
    
    if (alreadySigned) {
      document.getElementById('active-session-code').textContent = '✓ Your attendance is already verified for this live session';
      document.getElementById('active-scan-btn').style.display = 'none';
    } else {
      document.getElementById('active-session-code').textContent = `${cls ? cls.code + ' — ' : ''}Live session running now`;
      document.getElementById('active-scan-btn').style.display = '';
    }
    show('active-session-banner');
    hide('no-session-banner');
  } else {
    hide('active-session-banner');
    show('no-session-banner');
  }

  // Student Statistics
  const myClasses = DB.classes.filter(c => c.enrolled.includes(u.id));
  const totalSessions = DB.sessions.filter(s => s.status === 'closed' && myClasses.some(c => c.id === s.classId)).length;
  const presentCount = DB.attendance.filter(a => a.studentId === u.id).length;
  const rate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : (presentCount > 0 ? 100 : 0);

  document.getElementById('s-total').textContent   = totalSessions;
  document.getElementById('s-present').textContent = presentCount;
  document.getElementById('s-rate').textContent    = presentCount > 0 || totalSessions > 0 ? rate + '%' : '—';

  // Per Course Attendance Rates Breakdown
  const courseListEl = document.getElementById('student-course-breakdown');
  if (courseListEl) {
    if (myClasses.length === 0) {
      courseListEl.innerHTML = '<p style="color:var(--muted); font-size:.88rem;">No enrolled courses yet.</p>';
    } else {
      courseListEl.innerHTML = myClasses.map(cls => {
        const classSessions = DB.sessions.filter(s => s.classId === cls.id && s.status === 'closed');
        const attended = DB.attendance.filter(a => a.studentId === u.id && classSessions.some(s => s.id === a.sessionId)).length;
        const cRate = classSessions.length > 0 ? Math.round((attended / classSessions.length) * 100) : 100;
        const color = cRate >= 80 ? 'green' : cRate >= 50 ? 'amber' : 'red';
        return `
          <div style="margin-bottom:1rem;">
            <div style="display:flex; justify-content:space-between; font-size:.88rem; font-weight:600; margin-bottom:.3rem;">
              <span>${cls.name} (${cls.code})</span>
              <span>${attended}/${classSessions.length} (${cRate}%)</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill ${color}" style="width:${cRate}%"></div>
            </div>
          </div>`;
      }).join('');
    }
  }

  // Attendance History Table
  const myAttendance = DB.attendance.filter(a => a.studentId === u.id);
  const histEl = document.getElementById('attendance-history');
  if (histEl) {
    if (myAttendance.length === 0) {
      histEl.innerHTML = '<p style="color:var(--muted); font-size:.88rem; padding:.5rem 0;">No attendance records found yet.</p>';
      return;
    }
    histEl.innerHTML = myAttendance.slice().reverse().map(a => {
      const sess = DB.sessions.find(s => s.id === a.sessionId);
      const cls  = sess ? DB.classes.find(c => c.id === sess.classId) : null;
      return `
        <div class="history-item">
          <div>
            <div class="course">${cls ? cls.name : 'Lecture Session'}</div>
            <div class="date">${fmtDate(a.timestamp)} at ${fmtTime(a.timestamp)}</div>
          </div>
          <span class="badge badge-green">Verified Present</span>
        </div>`;
    }).join('');
  }
}

// ── Lecturer Dashboard & Live QR Roster ──────────────────────────────────────
function loadLecturerDash() {
  const u = currentUser;
  document.getElementById('lecturer-greeting').textContent = 'Welcome back, ' + u.name;
  document.getElementById('lecturer-nav-name').textContent = u.name;

  const myClasses = DB.classes.filter(c => c.lecturerId === u.id);
  const enrolled  = myClasses.reduce((sum, c) => sum + c.enrolled.length, 0);
  const mySessions = DB.sessions.filter(s => myClasses.some(c => c.id === s.classId) && s.status === 'closed');
  const totalAttended = DB.attendance.filter(a => mySessions.some(s => s.id === a.sessionId)).length;
  const possible = mySessions.reduce((sum, s) => {
    const cls = DB.classes.find(c => c.id === s.classId);
    return sum + (cls ? cls.enrolled.length : 0);
  }, 0);
  const avg = possible > 0 ? Math.round((totalAttended / possible) * 100) : 0;

  document.getElementById('l-enrolled').textContent = enrolled;
  document.getElementById('l-avg').textContent      = possible > 0 ? avg + '%' : '—';
  document.getElementById('l-sessions').textContent = mySessions.length;

  // Populate Lecturer Class Selector
  const sel = document.getElementById('lecturer-class-select');
  if (sel) {
    sel.innerHTML = '<option value="">Choose a class...</option>';
    myClasses.forEach(c => {
      sel.innerHTML += `<option value="${c.id}">${c.name} (${c.code}) — ${c.enrolled.length} enrolled</option>`;
    });
  }

  // Update Live Session Screen & Roster Feed if active
  if (activeSession) {
    renderLiveSessionRoster();
  }

  // Lecturer Completed Session History List
  const listEl = document.getElementById('lecturer-session-list');
  if (listEl) {
    const history = DB.sessions.filter(s => myClasses.some(c => c.id === s.classId) && s.status === 'closed').slice().reverse();
    if (history.length === 0) {
      listEl.innerHTML = '<p style="color:var(--muted); font-size:.88rem; padding:.5rem 0;">No completed sessions yet.</p>';
      return;
    }
    listEl.innerHTML = history.map(s => {
      const cls   = DB.classes.find(c => c.id === s.classId);
      const count = DB.attendance.filter(a => a.sessionId === s.id).length;
      const total = cls ? cls.enrolled.length : 0;
      const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
      const color = pct >= 80 ? 'green' : pct >= 50 ? 'amber' : 'red';
      return `
        <div class="session-item">
          <div>
            <div class="si-name">${cls ? cls.name : 'Unknown Class'}</div>
            <div class="si-meta">${fmtDate(s.startTime)} · ${count}/${total} students signed in (${pct}%)</div>
            <div class="progress-bar" style="width:220px; margin-top:.4rem;">
              <div class="progress-fill ${color}" style="width:${pct}%"></div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:.5rem;">
            <button class="btn btn-outline btn-sm" onclick="openManualAttendanceModal('${s.id}')">✏️ Override</button>
            <span class="badge badge-${color === 'green' ? 'green' : color === 'amber' ? 'amber' : 'red'}">${pct}%</span>
          </div>
        </div>`;
    }).join('');
  }
}

// Render Live Roster Feed on Lecturer Active Session Card
function renderLiveSessionRoster() {
  if (!activeSession) return;
  const sessionAtt = DB.attendance.filter(a => a.sessionId === activeSession.session.id);
  
  const countEl = document.getElementById('qr-signed-count');
  if (countEl) countEl.textContent = sessionAtt.length;

  const rosterEl = document.getElementById('qr-live-roster');
  if (!rosterEl) return;

  if (sessionAtt.length === 0) {
    rosterEl.innerHTML = '<div style="font-size:.82rem; color:var(--muted); padding:.5rem 0; font-style:italic;">⏳ Waiting for students to scan the QR code...</div>';
    return;
  }

  rosterEl.innerHTML = sessionAtt.slice().reverse().map(a => {
    const student = DB.users.find(u => u.id === a.studentId);
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; background:#F8FAFC; border:1px solid var(--border); border-radius:8px; padding:.45rem .75rem; margin-bottom:.4rem; font-size:.85rem; animation:fadeIn 0.3s ease-out;">
        <div>
          <strong style="color:var(--navy);">${student ? student.name : 'Student'}</strong>
          <span style="color:var(--muted); font-size:.78rem;">(${student ? student.matric || student.email : ''})</span>
        </div>
        <span style="font-size:.78rem; color:var(--green); font-weight:600;">✓ ${fmtTime(a.timestamp)}</span>
      </div>`;
  }).join('');
}

// ── QR Code Session Controls ─────────────────────────────────────────────────
function startSession() {
  clearAlert('session-start-alert');
  const classId  = document.getElementById('lecturer-class-select').value;
  const duration = parseInt(document.getElementById('session-duration').value);
  if (!classId) return showAlert('session-start-alert', 'Please select a class to generate QR.');

  // End any previously running session
  DB.sessions.filter(s => s.status === 'active').forEach(s => s.status = 'closed');
  if (activeSession) { clearInterval(activeSession.timer); activeSession = null; }

  const cls   = DB.classes.find(c => c.id === classId);
  const token = genToken();
  const sess  = {
    id: genId('s'), classId, token,
    startTime: new Date().toISOString(),
    endTime: null, status: 'active'
  };
  DB.sessions.push(sess);
  saveDB();

  const expiresAt = Date.now() + duration * 60 * 1000;
  activeSession = { session: sess, classObj: cls, expiresAt };

  // Render QR Code Box
  hide('qr-idle');
  show('qr-active');
  document.getElementById('qr-class-label').textContent = cls.name;
  document.getElementById('qr-display-course').textContent = `${cls.name} (${cls.code})`;
  document.getElementById('qr-token-display').textContent = 'Token: ' + token;
  document.getElementById('qr-signed-count').textContent = '0';

  const qrEl = document.getElementById('qrcode-render');
  qrEl.innerHTML = '';
  new QRCode(qrEl, { text: token, width: 170, height: 170, colorDark: '#0F172A', colorLight: '#ffffff' });

  renderLiveSessionRoster();

  // Real-time Countdown Timer
  const countdownEl = document.getElementById('qr-countdown');
  countdownEl.classList.remove('expired');
  
  activeSession.timer = setInterval(() => {
    const remaining = Math.max(0, activeSession.expiresAt - Date.now());
    const m = Math.floor(remaining / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    countdownEl.textContent = `${m}:${s.toString().padStart(2,'0')}`;

    renderLiveSessionRoster();

    if (remaining === 0) {
      countdownEl.classList.add('expired');
      countdownEl.textContent = 'EXPIRED';
      endSession();
    }
  }, 1000);

  loadLecturerDash();
}

function endSession() {
  if (!activeSession) return;
  clearInterval(activeSession.timer);
  activeSession.session.status = 'closed';
  activeSession.session.endTime = new Date().toISOString();
  activeSession = null;
  saveDB();

  hide('qr-active');
  show('qr-idle');
  document.getElementById('qr-class-label').textContent = 'No active session';
  loadLecturerDash();
  loadStudentDash();
}

// ── Lecturer Manual Attendance Modal ─────────────────────────────────────────
function openManualAttendanceModal(sessionId) {
  const sess = DB.sessions.find(s => s.id === sessionId);
  if (!sess) return;
  const cls = DB.classes.find(c => c.id === sess.classId);
  if (!cls) return;

  document.getElementById('manual-session-id').value = sessionId;
  document.getElementById('manual-class-title').textContent = `${cls.name} (${cls.code})`;

  const studentSel = document.getElementById('manual-student-select');
  const enrolledStudents = DB.users.filter(u => u.role === 'student' && cls.enrolled.includes(u.id));

  studentSel.innerHTML = '<option value="">Select student...</option>';
  enrolledStudents.forEach(st => {
    const alreadyPresent = DB.attendance.some(a => a.sessionId === sessionId && a.studentId === st.id);
    studentSel.innerHTML += `<option value="${st.id}">${st.name} (${st.matric || st.email}) ${alreadyPresent ? '— Already Signed' : ''}</option>`;
  });

  show('modal-manual-attendance');
  clearAlert('manual-att-alert');
}

function submitManualAttendance() {
  clearAlert('manual-att-alert');
  const sessionId = document.getElementById('manual-session-id').value;
  const studentId = document.getElementById('manual-student-select').value;
  if (!studentId) return showAlert('manual-att-alert', 'Please select a student.');

  if (DB.attendance.some(a => a.sessionId === sessionId && a.studentId === studentId)) {
    return showAlert('manual-att-alert', 'Student is already marked present for this session.', 'info');
  }

  DB.attendance.push({
    id: genId('a'),
    sessionId,
    studentId,
    timestamp: new Date().toISOString(),
    status: 'present'
  });
  saveDB();

  showAlert('manual-att-alert', '✓ Attendance override applied successfully!', 'success');
  setTimeout(() => {
    hide('modal-manual-attendance');
    loadDashboard(currentUser.role);
  }, 1000);
}

// ── Lecturer Class Creation ──────────────────────────────────────────────────
function openLecturerCreateClassModal() {
  show('modal-lecturer-class');
  clearAlert('lec-class-alert');
}

function submitLecturerCreateClass() {
  clearAlert('lec-class-alert');
  const name = document.getElementById('lec-cname').value.trim();
  const code = document.getElementById('lec-ccode').value.trim();
  const dept = document.getElementById('lec-cdept').value;

  if (!name || !code || !dept) return showAlert('lec-class-alert', 'Please fill in all fields.');

  apiAddClass({ name, code, department: dept, lecturerId: currentUser.id });
  showAlert('lec-class-alert', 'Class unit created successfully!', 'success');
  setTimeout(() => {
    hide('modal-lecturer-class');
    loadLecturerDash();
  }, 900);
}

// ── Admin Dashboard Portal & Interlinked Reports ──────────────────────────────
function loadAdminDash() {
  const students = DB.users.filter(u => u.role === 'student');
  const sessions = DB.sessions.filter(s => s.status === 'closed');
  const records  = DB.attendance;
  const possible = sessions.reduce((sum, s) => {
    const cls = DB.classes.find(c => c.id === s.classId);
    return sum + (cls ? cls.enrolled.length : 0);
  }, 0);
  const avg = possible > 0 ? Math.round((records.length / possible) * 100) : 0;

  document.getElementById('a-students').textContent = students.length;
  document.getElementById('a-sessions').textContent = sessions.length;
  document.getElementById('a-records').textContent  = records.length;
  document.getElementById('a-avg').textContent      = possible > 0 ? avg + '%' : '—';

  // Departmental Performance Breakdown
  const depts = ['Computer Science','Engineering','Business Administration','Social Sciences'];
  const deptEl = document.getElementById('dept-breakdown');
  if (deptEl) {
    deptEl.innerHTML = depts.map(dept => {
      const deptClasses  = DB.classes.filter(c => c.department === dept);
      const deptSessions = sessions.filter(s => deptClasses.some(c => c.id === s.classId));
      const deptPossible = deptSessions.reduce((sum, s) => {
        const cls = DB.classes.find(c => c.id === s.classId);
        return sum + (cls ? cls.enrolled.length : 0);
      }, 0);
      const deptActual   = records.filter(a => deptSessions.some(s => s.id === a.sessionId)).length;
      const pct          = deptPossible > 0 ? Math.round((deptActual / deptPossible) * 100) : 0;
      const color        = pct >= 80 ? 'green' : pct >= 50 ? 'amber' : 'red';
      return `
        <div class="dept-row">
          <div class="dept-row-top">
            <span class="dept-name">${dept}</span>
            <span class="dept-pct">${deptPossible > 0 ? pct + '%' : 'N/A'}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill ${color}" style="width:${pct}%"></div>
          </div>
        </div>`;
    }).join('');
  }

  // Admin User Directory Table
  const userBody = document.getElementById('user-table-body');
  if (userBody) {
    userBody.innerHTML = DB.users.filter(u => u.role !== 'admin').map(u => `
      <tr>
        <td><strong>${u.name}</strong><br/><span style="font-size:.78rem; color:var(--muted);">${u.email}</span></td>
        <td><span class="badge badge-${u.role === 'lecturer' ? 'blue' : 'green'}">${u.role}</span></td>
        <td>${u.course || u.department || '—'}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="openAdminEditUserModal('${u.id}')">✏️ Edit</button>
          <button class="btn btn-danger btn-sm" onclick="adminDeleteUser('${u.id}')">🗑️ Delete</button>
        </td>
      </tr>`).join('');
  }

  // Admin Attendance Master Report Table
  renderAdminAttendanceTable(records);
}

function renderAdminAttendanceTable(records) {
  const attBody = document.getElementById('admin-attendance-body');
  if (!attBody) return;
  attBody.innerHTML = records.slice().reverse().map(a => {
    const student = DB.users.find(u => u.id === a.studentId);
    const sess    = DB.sessions.find(s => s.id === a.sessionId);
    const cls     = sess ? DB.classes.find(c => c.id === sess.classId) : null;
    return `
      <tr>
        <td>${student ? student.name : 'Unknown'} (${student ? student.matric || 'N/A' : ''})</td>
        <td>${cls ? cls.code : '—'}</td>
        <td>${cls ? cls.name : '—'}</td>
        <td>${fmtDate(a.timestamp)}</td>
        <td>${fmtTime(a.timestamp)}</td>
        <td><span class="badge badge-green">Verified Present</span></td>
      </tr>`;
  }).join('');
}

// ── Admin User CRUD Modal Handlers ───────────────────────────────────────────
function openAdminAddUserModal() {
  document.getElementById('admin-user-id').value = '';
  document.getElementById('admin-u-name').value = '';
  document.getElementById('admin-u-email').value = '';
  document.getElementById('admin-u-role').value = 'student';
  document.getElementById('admin-u-pass').value = 'student123';
  show('modal-admin-user');
  clearAlert('admin-u-alert');
}

function openAdminEditUserModal(userId) {
  const u = DB.users.find(x => x.id === userId);
  if (!u) return;
  document.getElementById('admin-user-id').value = u.id;
  document.getElementById('admin-u-name').value = u.name;
  document.getElementById('admin-u-email').value = u.email;
  document.getElementById('admin-u-role').value = u.role;
  document.getElementById('admin-u-pass').value = u.password || 'student123';
  show('modal-admin-user');
  clearAlert('admin-u-alert');
}

function submitAdminUserForm() {
  clearAlert('admin-u-alert');
  const userId = document.getElementById('admin-user-id').value;
  const name   = document.getElementById('admin-u-name').value.trim();
  const email  = document.getElementById('admin-u-email').value.trim();
  const role   = document.getElementById('admin-u-role').value;
  const pass   = document.getElementById('admin-u-pass').value;

  if (!name || !email || !pass) return showAlert('admin-u-alert', 'Please fill in all fields.');
  if (!isValidEmail(email)) return showAlert('admin-u-alert', 'Invalid email structure.');

  try {
    if (userId) {
      apiUpdateUser(userId, { name, email, role, password: pass });
    } else {
      apiAddUser({ name, email, role, password: pass, department: 'Computer Science' });
    }
    showAlert('admin-u-alert', 'User saved successfully!', 'success');
    setTimeout(() => { hide('modal-admin-user'); loadAdminDash(); }, 800);
  } catch (err) {
    showAlert('admin-u-alert', err.message);
  }
}

function adminDeleteUser(userId) {
  if (confirm('Are you sure you want to delete this user?')) {
    apiDeleteUser(userId);
    loadAdminDash();
  }
}

// ── Admin CSV Report Export ──────────────────────────────────────────────────
function exportCSV() {
  const rows = [['Student Name','Matric','Course Code','Class Name','Date','Time','Status']];
  DB.attendance.forEach(a => {
    const student = DB.users.find(u => u.id === a.studentId);
    const sess    = DB.sessions.find(s => s.id === a.sessionId);
    const cls     = sess ? DB.classes.find(c => c.id === sess.classId) : null;
    rows.push([
      student ? student.name : '',
      student ? student.matric || '' : '',
      cls ? cls.code : '',
      cls ? cls.name : '',
      fmtDate(a.timestamp),
      fmtTime(a.timestamp),
      'Present'
    ]);
  });
  const csv  = rows.map(r => r.map(f => `"${f}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `lecturelink-attendance-report-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Auto Restore Session on Page Load ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (!restoreSession()) {
    switchRole('student');
  }
});
