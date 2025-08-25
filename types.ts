import React from 'react';

export enum Role {
  Employee = 'Employee',
  Manager = 'Manager',
  HRAdmin = 'HR Admin',
  ITAdmin = 'IT Admin',
}

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar: string;
}

export enum Module {
  Dashboard = 'Dashboard',
  EmployeeInfo = 'Employee Information',
  SkillsTalent = 'Skills & Talent',
  EmploymentDetails = 'Employment Details',
  Payroll = 'Payroll & Compensation',
  LeaveAttendance = 'Leave & Attendance',
  ShiftScheduling = 'Shift Scheduling',
  Performance = 'Performance Management',
  Recruitment = 'Recruitment & Onboarding',
  Training = 'Training & Development',
  Compliance = 'Compliance & Legal',
  SelfService = 'Employee Self-Service',
  Reports = 'Reports & Analytics',
  Benefits = 'Benefits Administration',
  Organization = 'Organization Structure',
  Settings = 'Settings',
  SystemAdministration = 'System Administration',
}

export interface NavItem {
  name: Module;
  path: string;
  icon: React.ElementType;
}

export interface Skill {
  id: string;
  name: string;
  category: 'Technical' | 'Soft' | 'Language';
}

export enum EmployeeRecordType {
    Warning = 'Warning',
    Achievement = 'Achievement',
    Promotion = 'Promotion',
}

export interface EmployeeRecord {
    id: string;
    type: EmployeeRecordType;
    date: string;
    description: string;
    addedBy: string; // e.g., 'Jeanette Ingabire (Manager)'
}

export interface Department {
  id: string;
  name: string;
  description: string;
}

export interface JobPosition {
  id: string;
  title: string;
  departmentId: string;
}

export interface BenefitPlan {
  id: string;
  name: string;
  provider: string;
  type: 'Health' | 'Pension' | 'Other';
  description: string;
  monthlyCost: number; // Employee contribution
}

export interface EmployeeBenefit {
  planId: string;
  enrollmentDate: string;
  status: 'Active' | 'Inactive';
}

export interface AccessLog {
  id: string;
  timestamp: string;
  accessorName: string;
  accessorRole: Role;
  action: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  postedBy: string; // Name of the HR Admin
}

// --- New and Updated Types for Employment Details ---

export enum EmploymentStatus {
    Active = 'Active',
    Suspended = 'Suspended',
    Resigned = 'Resigned',
    Terminated = 'Terminated',
}

export enum ContractType {
    FullTime = 'Full-time',
    PartTime = 'Part-time',
    FixedTerm = 'Fixed-term',
}

export enum PayFrequency {
    Monthly = 'Monthly',
    BiWeekly = 'Bi-weekly',
    Weekly = 'Weekly',
}

export interface Probation {
    status: 'Pending' | 'Passed' | 'Failed' | 'Not Applicable';
    startDate?: string;
    endDate?: string;
    evaluationResult?: string;
}

export interface HistoryLog {
    date: string;
    from: string;
    to: string;
    description?: string;
}

export interface AssignedAsset {
    id: string;
    name: string;
    type: 'Laptop' | 'Vehicle' | 'Phone' | 'Other';
    assignedDate: string;
}

export interface EditHistoryLog {
    timestamp: string; // ISO string
    editorName: string;
    field: string;
    oldValue: any;
    newValue: any;
}


export interface Employee {
  id: string;
  name: string;
  photoUrl: string;
  gender: 'Male' | 'Female';
  
  // Core Job Info
  jobTitle: string;
  department: string;
  managerId?: string; // Link to supervisor's employee ID
  jobGrade?: string;
  workLocation?: string;
  workShift?: string;
  
  // Employment Status & Contract
  employmentType: 'Permanent' | 'Contract' | 'Casual' | 'Intern';
  employmentStatus: EmploymentStatus;
  dateOfHire: string;
  contractType: ContractType;
  contractStartDate?: string;
  contractEndDate?: string;
  probation: Probation;
  
  // Compensation & Leave
  basicSalary: number; // in RWF
  salaryGrade?: string;
  payFrequency: PayFrequency;
  annualLeaveBalance: number;

  // Documents & History
  documents: EmployeeDocument[];
  promotionHistory: HistoryLog[];
  transferHistory: HistoryLog[];
  editHistory: EditHistoryLog[];
  
  // Assets & Other
  assignedAssets: AssignedAsset[];
  unionMembership?: string;

  // Succession Planning
  isHighPotential?: boolean;
  successionStatus?: 'Ready Now' | 'Ready in 1-2 years' | 'Future Potential';

  // Original fields
  email: string;
  phone: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
  skills: Skill[];
  records: EmployeeRecord[];
  benefits: EmployeeBenefit[];
  accessLogs: AccessLog[];
}

export interface Payslip {
    id: string;
    employeeId: string;
    payPeriod: string;
    grossSalary: number;
    allowancesTotal: number;
    payeTax: number;
    rssbPension: number; // Employee contribution (3%)
    totalDeductions: number;
    netSalary: number;
    basicSalary: number; 
    allowanceDetails: { description: string, amount: number }[];
}

export interface EmployeeDocument {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number; // in bytes
    uploadDate: string;
    description: string;
}

export interface ChartData {
  name: string;
  value: number;
}

export enum LeaveStatus {
    Approved = 'Approved',
    Pending = 'Pending',
    Rejected = 'Rejected',
}

export interface LeaveRequest {
    id:string;
    employeeId: string;
    employeeName?: string; // Optional: for manager view
    employeePhoto?: string; // Optional: for manager view
    startDate: string;
    endDate: string;
    type: string;
    status: LeaveStatus;
    reason?: string;
}

export interface Goal {
  id: string;
  title: string;
  status: 'On Track' | 'At Risk' | 'Completed';
  progress: number;
  description: string;
}

export interface Feedback {
  id: string;
  type: 'Praise' | 'Constructive';
  from: string;
  comment: string;
  date: string;
}

export interface Review {
  id: string;
  cycle: string;
  status: 'Completed' | 'In Progress';
  score: number;
  date: string;
}

export interface Pip {
    id: string;
    title: string;
    status: 'Active' | 'Completed';
    startDate: string;
    endDate: string;
}

export interface DriverAllowance {
  id: string;
  employeeId: string;
  employeeName: string;
  employeePhoto: string;
  department: string;
  allowanceAmount: number; // In RWF
  effectiveDate: string;
  status: 'Active' | 'Inactive';
}

// For AI services
export interface JobDescription {
  title: string;
  summary: string;
  responsibilities: string[];
  qualifications:string[];
}

export enum Sentiment {
  Positive = "Positive",
  Neutral = "Neutral",
  Negative = "Negative",
  Urgent = "Urgent",
}

// For AI Talent Finder
export interface MatchedEmployee {
  employeeId: string;
  employeeName: string;
  matchPercentage: number;
  matchingSkills: string[];
  missingSkills: string[];
  justification: string;
}

export interface TalentAnalysis {
  topCandidates: MatchedEmployee[];
}

export interface TargetRole {
  id: string;
  name: string;
  requiredSkills: Skill[];
}

export interface ChecklistItem {
  text: string;
  completed: boolean;
}

// For Training & Development
export interface TrainingProgram {
  id: string;
  name: string;
  category: 'Technical' | 'Safety' | 'Soft Skills' | 'Leadership';
  description: string;
  duration: string; // e.g., "3 Days", "2 Weeks"
}

export enum TrainingStatus {
    Requested = 'Requested',
    NotStarted = 'Not Started',
    InProgress = 'In Progress',
    Completed = 'Completed',
}

export interface EmployeeTraining {
    employeeId: string;
    programId: string;
    status: TrainingStatus;
    enrollmentDate: string;
    completionDate?: string;
    progress: number; // Percentage
}

// For Compliance Module
export enum DocumentCategory {
    Policy = 'Policy',
    Handbook = 'Employee Handbook',
    Legal = 'Legal Notice',
    Contract = 'Contract Template',
}

export interface ComplianceDocument {
    id: string;
    name: string;
    category: DocumentCategory;
    description: string;
    version: number;
    uploadDate: string;
    assignedTo: 'all' | string; // 'all' or departmentId
}

export enum AcknowledgementStatus {
    Pending = 'Pending Signature',
    Acknowledged = 'Signed',
}

export interface EmployeeAcknowledgement {
    employeeId: string;
    documentId: string;
    status: AcknowledgementStatus;
    acknowledgedDate?: string;
}

export interface Notification {
  id: string;
  icon: React.ElementType;
  title: string;
  timestamp: string;
  read: boolean;
  linkTo: string;
}

// For AI Strategic Insights
export interface Insight {
  type: 'Risk' | 'Opportunity' | 'Observation';
  headline: string;
  detail: string;
  recommendation: string;
}

// For Shift Scheduling
export interface Shift {
  id: string;
  employeeId: string;
  startTime: string; // ISO String
  endTime: string; // ISO String
  title: string;
  notes?: string;
}
