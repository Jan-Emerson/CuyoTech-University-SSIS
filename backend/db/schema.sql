-- SSIS schema (3NF), all 5 roles. Running this WIPES and recreates the database.
DROP DATABASE IF EXISTS ssis;
CREATE DATABASE ssis;
USE ssis;

CREATE TABLE Department (
  deptId INT AUTO_INCREMENT PRIMARY KEY,
  deptCode VARCHAR(10) NOT NULL UNIQUE,
  deptName VARCHAR(100) NOT NULL
);

CREATE TABLE Program (
  programId INT AUTO_INCREMENT PRIMARY KEY,
  programCode VARCHAR(10) NOT NULL UNIQUE,
  programName VARCHAR(60) NOT NULL
);

CREATE TABLE Users (
  userId INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  fullName VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,                 -- bcrypt hash
  email VARCHAR(100) NOT NULL UNIQUE,
  contactNumber VARCHAR(20) NULL,
  address VARCHAR(150) NULL,
  role VARCHAR(20) NOT NULL,                      -- student | registrar | cashier | dept_staff | admin
  deptId INT NULL,                                -- staff office (NULL for students)
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_dept FOREIGN KEY (deptId)
    REFERENCES Department(deptId) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE Student (
  studentId INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL UNIQUE,
  studentNum VARCHAR(20) NOT NULL UNIQUE,
  programId INT NOT NULL,
  yearLevel INT NOT NULL,
  enroll_status VARCHAR(20) NOT NULL DEFAULT 'Enrolled',
  CONSTRAINT fk_student_user FOREIGN KEY (userId)
    REFERENCES Users(userId) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_student_program FOREIGN KEY (programId)
    REFERENCES Program(programId) ON UPDATE CASCADE
);

CREATE TABLE Course (
  courseId INT AUTO_INCREMENT PRIMARY KEY,
  deptId INT NOT NULL,
  courseCode VARCHAR(10) NOT NULL UNIQUE,
  courseTitle VARCHAR(100) NOT NULL,
  creditUnits INT NOT NULL,
  CONSTRAINT fk_course_dept FOREIGN KEY (deptId)
    REFERENCES Department(deptId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Enrollment (
  enrollmentId INT AUTO_INCREMENT PRIMARY KEY,
  studentId INT NOT NULL,
  courseId INT NOT NULL,
  academicYear VARCHAR(9) NOT NULL,               -- '2024-2025'
  semester VARCHAR(20) NOT NULL,                  -- '1st Semester'
  schedule VARCHAR(40) NULL,
  room VARCHAR(20) NULL,
  instructor VARCHAR(50) NULL,
  midterm DECIMAL(5,2) NULL,
  finals DECIMAL(5,2) NULL,
  grade DECIMAL(3,2) NULL,                        -- final grade e.g. 1.50
  remarks VARCHAR(10) NULL,                       -- PASSED | FAILED | INC | DRP
  status VARCHAR(10) NOT NULL DEFAULT 'Enrolled', -- Enrolled | Pending | Dropped | Completed
  CONSTRAINT fk_enrollment_student FOREIGN KEY (studentId)
    REFERENCES Student(studentId) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_enrollment_course FOREIGN KEY (courseId)
    REFERENCES Course(courseId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Document_Type (
  code VARCHAR(20) PRIMARY KEY,
  label VARCHAR(60) NOT NULL,
  price DECIMAL(10,2) NOT NULL
);

CREATE TABLE Document_Request (
  requestId INT AUTO_INCREMENT PRIMARY KEY,
  studentId INT NOT NULL,
  documentType VARCHAR(20) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  totalAmount DECIMAL(10,2) NOT NULL,
  paymentMethod VARCHAR(30) NOT NULL DEFAULT 'Cash',
  purpose VARCHAR(100) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Pending',  -- Pending | Processing | Released | Cancelled
  requestDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  releaseDate DATE NULL,
  CONSTRAINT fk_docreq_student FOREIGN KEY (studentId)
    REFERENCES Student(studentId) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_docreq_type FOREIGN KEY (documentType)
    REFERENCES Document_Type(code) ON UPDATE CASCADE
);

CREATE TABLE Payment (
  paymentId INT AUTO_INCREMENT PRIMARY KEY,
  requestId INT NULL,
  studentId INT NOT NULL,
  cashierUserId INT NULL,
  description VARCHAR(100) NOT NULL,
  receiptNumber VARCHAR(50) NULL UNIQUE,          -- OR number, set when cashier confirms
  amount DECIMAL(10,2) NOT NULL,
  paymentMethod VARCHAR(30) NOT NULL,
  paymentDate DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Pending',  -- Pending | Paid
  CONSTRAINT fk_payment_request FOREIGN KEY (requestId)
    REFERENCES Document_Request(requestId) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_payment_student FOREIGN KEY (studentId)
    REFERENCES Student(studentId) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_payment_cashier FOREIGN KEY (cashierUserId)
    REFERENCES Users(userId) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE Fee_Schedule (
  feeId INT AUTO_INCREMENT PRIMARY KEY,
  feeName VARCHAR(60) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  per VARCHAR(20) NOT NULL DEFAULT 'semester',
  applicableTo VARCHAR(30) NOT NULL DEFAULT 'All'
);

CREATE TABLE Clearance (
  clearanceId INT AUTO_INCREMENT PRIMARY KEY,
  studentId INT NOT NULL,
  deptId INT NOT NULL,
  adminUserId INT NULL,                           -- staff who cleared it (NULL = pending)
  semester VARCHAR(20) NOT NULL,
  schoolYear VARCHAR(9) NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'Pending',  -- Pending | Cleared
  remarks VARCHAR(100) NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_clearance_student FOREIGN KEY (studentId)
    REFERENCES Student(studentId) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_clearance_dept FOREIGN KEY (deptId)
    REFERENCES Department(deptId) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_clearance_admin FOREIGN KEY (adminUserId)
    REFERENCES Users(userId) ON DELETE SET NULL ON UPDATE CASCADE
);
