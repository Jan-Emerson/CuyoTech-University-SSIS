// ============================================================
//  SSIS Mock Data — used in place of a real backend
//  Groupmates: replace these with real API calls when the
//  backend is ready. See README for the API contract.
// ============================================================

export const MOCK_STUDENTS = [
  {
    student_id:     1,
    student_number: '2024-00001',
    full_name:      'Juan Dela Cruz',
    email:          'juan.delacruz@cuyotech.edu.ph',
    contact_number: '09171234567',
    address:        'Cabuyao, Laguna',
    year_level:     3,
    course_name:    'BS Computer Science',
    course_code:    'BSCS',
    status:         'Active',
    password:       'password',   // plain — mock only
  },
  {
    student_id:     2,
    student_number: '2023-10042',
    full_name:      'Maria Santos',
    email:          'maria.santos@cuyotech.edu.ph',
    contact_number: '09189876543',
    address:        'Biñan, Laguna',
    year_level:     2,
    course_name:    'BS Information Technology',
    course_code:    'BSIT',
    status:         'Active',
    password:       'password',
  },
];

export const MOCK_GRADES = [
  { subject_code: 'CS301', subject_name: 'Data Structures and Algorithms', units: 3, midterm: 88, finals: 91, final_grade: '1.50', remarks: 'PASSED', semester: '1st Semester', school_year: '2024-2025' },
  { subject_code: 'CS302', subject_name: 'Object-Oriented Programming',   units: 3, midterm: 92, finals: 95, final_grade: '1.25', remarks: 'PASSED', semester: '1st Semester', school_year: '2024-2025' },
  { subject_code: 'CS303', subject_name: 'Database Management Systems',   units: 3, midterm: 85, finals: 87, final_grade: '1.75', remarks: 'PASSED', semester: '1st Semester', school_year: '2024-2025' },
  { subject_code: 'CS304', subject_name: 'Computer Networks',             units: 3, midterm: 78, finals: 82, final_grade: '2.00', remarks: 'PASSED', semester: '1st Semester', school_year: '2024-2025' },
  { subject_code: 'GE001', subject_name: 'Purposive Communication',       units: 3, midterm: 90, finals: 88, final_grade: '1.50', remarks: 'PASSED', semester: '1st Semester', school_year: '2024-2025' },
  { subject_code: 'GE002', subject_name: 'Mathematics in the Modern World', units: 3, midterm: 75, finals: 80, final_grade: '2.25', remarks: 'PASSED', semester: '1st Semester', school_year: '2024-2025' },
];

export const MOCK_DOCUMENTS = [
  { request_id: 1, document_type: 'TOR',  quantity: 1, amount: 150, status: 'Released',   request_date: '2024-01-15', release_date: '2024-01-22', payment_method: 'Cash',   purpose: 'Job Application' },
  { request_id: 2, document_type: 'COR',  quantity: 2, amount: 100, status: 'Processing', request_date: '2024-02-10', release_date: null,         payment_method: 'Cash',   purpose: 'Scholarship' },
  { request_id: 3, document_type: 'CERT', quantity: 1, amount: 150, status: 'Pending',    request_date: '2024-03-01', release_date: null,         payment_method: 'Online', purpose: 'Board Exam' },
];

export const MOCK_DOCUMENT_TYPES = [
  { value: 'TOR',        label: 'Transcript of Records',    price: 150 },
  { value: 'COR',        label: 'Certificate of Registration', price: 50 },
  { value: 'COE',        label: 'Certificate of Enrollment',   price: 50 },
  { value: 'COG',        label: 'Certificate of Graduation',   price: 200 },
  { value: 'DIPLOMA',    label: 'Diploma',                     price: 500 },
  { value: 'GOOD_MORAL', label: 'Good Moral Certificate',      price: 50 },
  { value: 'HONORABLE',  label: 'Honorable Dismissal',         price: 100 },
  { value: 'CERT',       label: 'Certification',               price: 150 },
];

export const MOCK_CLEARANCE = [
  { department_name: 'Library',         status: 'Cleared', cleared_by: 'Ms. Alvarez',    cleared_date: '2024-01-10', semester: '1st Semester', school_year: '2024-2025' },
  { department_name: 'Cashier',         status: 'Cleared', cleared_by: 'Mr. Bautista',   cleared_date: '2024-01-12', semester: '1st Semester', school_year: '2024-2025' },
  { department_name: 'Registrar',       status: 'Pending', cleared_by: null,             cleared_date: null,         semester: '1st Semester', school_year: '2024-2025' },
  { department_name: 'Laboratory',      status: 'Pending', cleared_by: null,             cleared_date: null,         semester: '1st Semester', school_year: '2024-2025' },
  { department_name: 'Guidance Office', status: 'Cleared', cleared_by: 'Ms. Villanueva', cleared_date: '2024-01-08', semester: '1st Semester', school_year: '2024-2025' },
  { department_name: "Dean's Office",   status: 'Pending', cleared_by: null,             cleared_date: null,         semester: '1st Semester', school_year: '2024-2025' },
];

export const MOCK_ENROLLMENT = [
  { subject_code: 'CS401', subject_name: 'Software Engineering',       units: 3, schedule: 'MWF 7:30-8:30 AM',   room: 'Room 301', instructor: 'Prof. Reyes',   semester: '2nd Semester', school_year: '2024-2025' },
  { subject_code: 'CS402', subject_name: 'Operating Systems',          units: 3, schedule: 'TTH 10:30-12:00 PM', room: 'Room 205', instructor: 'Prof. Garcia',  semester: '2nd Semester', school_year: '2024-2025' },
  { subject_code: 'CS403', subject_name: 'Human-Computer Interaction', units: 3, schedule: 'MWF 1:00-2:00 PM',   room: 'Room 102', instructor: 'Prof. Lim',     semester: '2nd Semester', school_year: '2024-2025' },
  { subject_code: 'CS404', subject_name: 'Capstone Project 1',         units: 3, schedule: 'TTH 1:00-4:00 PM',   room: 'Lab 401',  instructor: 'Prof. Cruz',    semester: '2nd Semester', school_year: '2024-2025' },
  { subject_code: 'GE003', subject_name: 'Ethics',                     units: 3, schedule: 'MWF 9:00-10:00 AM',  room: 'Room 110', instructor: 'Prof. Santos',  semester: '2nd Semester', school_year: '2024-2025' },
];
