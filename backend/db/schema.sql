-- SSIS schema (3NF) - adjusted to match what the frontend needs
DROP DATABASE IF EXISTS ssis;
CREATE DATABASE ssis;
USE ssis;

CREATE TABLE Department (
  deptId INT AUTO_INCREMENT PRIMARY KEY,
  deptCode VARCHAR(10) NOT NULL UNIQUE,
  deptName VARCHAR(100) NOT NULL
);

CREATE TABLE Users (
  userId INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  fullName VARCHAR(100) NOT NULL,                 -- added (topbar/profile need it)
  password VARCHAR(255) NOT NULL,                 -- bcrypt hash
  email VARCHAR(100) NOT NULL UNIQUE,
  contactNumber VARCHAR(20) NULL,                 -- added (profile page)
  address VARCHAR(150) NULL,                      -- added (profile page)
  role VARCHAR(20) NOT NULL,                      -- Student | Admin | Cashier
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Student (
  studentId INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL UNIQUE,
  studentNum VARCHAR(10) NOT NULL UNIQUE,
  program VARCHAR(50) NOT NULL,                   -- widened
  yearLevel INT NOT NULL,
  enroll_status VARCHAR(20) NOT NULL DEFAULT 'Enrolled',
  CONSTRAINT fk_student_user FOREIGN KEY (userId)
    REFERENCES Users(userId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Course (
  courseId INT AUTO_INCREMENT PRIMARY KEY,
  deptId INT NOT NULL,
  courseCode VARCHAR(10) NOT NULL UNIQUE,
  courseTitle VARCHAR(100) NOT NULL,              -- widened
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
  midterm DECIMAL(5,2) NULL,                      -- added
  finals DECIMAL(5,2) NULL,                       -- added
  grade DECIMAL(3,2) NULL,                        -- final grade e.g. 1.50
  status VARCHAR(10) NOT NULL DEFAULT 'Enrolled',
  CONSTRAINT fk_enrollment_student FOREIGN KEY (studentId)
    REFERENCES Student(studentId) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_enrollment_course FOREIGN KEY (courseId)
    REFERENCES Course(courseId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Document_Type (                      -- added (price list)
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
  paymentMethod VARCHAR(30) NOT NULL DEFAULT 'Cash',   -- added
  purpose VARCHAR(100) NULL,                           -- added
  status VARCHAR(20) NOT NULL DEFAULT 'Pending',
  requestDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  releaseDate DATE NULL,                               -- added
  CONSTRAINT fk_docreq_student FOREIGN KEY (studentId)
    REFERENCES Student(studentId) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_docreq_type FOREIGN KEY (documentType)
    REFERENCES Document_Type(code) ON UPDATE CASCADE
);

CREATE TABLE Payment (
  paymentId INT AUTO_INCREMENT PRIMARY KEY,
  requestId INT NULL,
  studentId INT NOT NULL,
  cashierUserId INT NULL,                         -- nullable: online payments have no cashier
  receiptNumber VARCHAR(50) NOT NULL UNIQUE,
  amountPaid DECIMAL(10,2) NOT NULL,
  paymentMethod VARCHAR(30) NOT NULL,
  paymentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'Completed',
  CONSTRAINT fk_payment_request FOREIGN KEY (requestId)
    REFERENCES Document_Request(requestId) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_payment_student FOREIGN KEY (studentId)
    REFERENCES Student(studentId) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_payment_cashier FOREIGN KEY (cashierUserId)
    REFERENCES Users(userId) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE Fee (                                -- added (Pay Fees page)
  feeId INT AUTO_INCREMENT PRIMARY KEY,
  studentId INT NOT NULL,
  description VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  dueDate DATE NOT NULL,
  academicTerm VARCHAR(30) NOT NULL,
  paymentId INT NULL,                             -- NULL = unpaid
  CONSTRAINT fk_fee_student FOREIGN KEY (studentId)
    REFERENCES Student(studentId) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_fee_payment FOREIGN KEY (paymentId)
    REFERENCES Payment(paymentId) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE Clearance (
  clearanceId INT AUTO_INCREMENT PRIMARY KEY,
  studentId INT NOT NULL,
  deptId INT NOT NULL,
  adminUserId INT NULL,                           -- nullable: pending = nobody signed yet
  academicTerm VARCHAR(30) NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'Pending',
  remarks VARCHAR(100) NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_clearance_student FOREIGN KEY (studentId)
    REFERENCES Student(studentId) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_clearance_dept FOREIGN KEY (deptId)
    REFERENCES Department(deptId) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_clearance_admin FOREIGN KEY (adminUserId)
    REFERENCES Users(userId) ON DELETE RESTRICT ON UPDATE CASCADE
);
