
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import EmployeeInformation from './components/EmployeeInformation';
import EmploymentDetails from './components/EmploymentDetails';
import Payroll from './components/Payroll';
import LeaveAttendance from './components/LeaveAttendance';
import PerformanceManagement from './components/PerformanceManagement';
import Recruitment from './components/Recruitment';
import TrainingDevelopment from './components/TrainingDevelopment';
import Compliance from './components/Compliance';
import EmployeeSelfService from './components/EmployeeSelfService';
import ReportsAnalytics from './components/ReportsAnalytics';
import SkillsTalent from './components/SkillsTalent';
import Benefits from './components/Benefits';
import OrganizationStructure from './components/OrganizationStructure';
import Settings from './components/Settings';
import SystemAdministration from './components/SystemAdministration';
import ShiftScheduling from './components/ShiftScheduling';
import { Role, User, Module, Employee, Shift, LeaveRequest, Department, JobPosition } from './types';
import { apiService } from './services/apiService';

const ALL_MODULES: { [key: string]: Module } = {
    '/dashboard': Module.Dashboard,
    '/employee-information': Module.EmployeeInfo,
    '/skills-talent': Module.SkillsTalent,
    '/employment-details': Module.EmploymentDetails,
    '/payroll': Module.Payroll,
    '/leave-attendance': Module.LeaveAttendance,
    '/shift-scheduling': Module.ShiftScheduling,
    '/performance': Module.Performance,
    '/recruitment': Module.Recruitment,
    '/training': Module.Training,
    '/compliance': Module.Compliance,
    '/self-service': Module.SelfService,
    '/reports': Module.Reports,
    '/benefits': Module.Benefits,
    '/organization-structure': Module.Organization,
    '/system-administration': Module.SystemAdministration,
    '/settings': Module.Settings,
};

const initialRolePermissions: { [key in Role]: Module[] } = {
  [Role.Employee]: [
    Module.Dashboard, Module.EmployeeInfo, Module.SkillsTalent, Module.EmploymentDetails, Module.Payroll, Module.LeaveAttendance,
    Module.ShiftScheduling, Module.Performance, Module.Training, Module.SelfService, Module.Benefits, Module.Settings, Module.Compliance,
  ],
  [Role.Manager]: [
    Module.Dashboard, Module.EmployeeInfo, Module.SkillsTalent, Module.EmploymentDetails, Module.Payroll, Module.LeaveAttendance,
    Module.ShiftScheduling, Module.Performance, Module.Recruitment, Module.Training, Module.SelfService, Module.Reports, Module.Benefits, Module.Settings, Module.Compliance,
  ],
  [Role.HRAdmin]: Object.values(Module),
  [Role.ITAdmin]: [
    Module.Dashboard,
    Module.EmployeeInfo,
    Module.Organization,
    Module.SystemAdministration,
    Module.Settings,
  ],
};

const ProtectedRoutes: React.FC<{
  user: User;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setCurrentUser: (user: User) => void;
  rolePermissions: { [key in Role]: Module[] };
  setRolePermissions: (permissions: { [key in Role]: Module[] }) => void;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  shifts: Shift[];
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
  leaveRequests: LeaveRequest[];
  departments: Department[];
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
  jobPositions: JobPosition[];
  setJobPositions: React.Dispatch<React.SetStateAction<JobPosition[]>>;
}> = ({ user, theme, toggleTheme, setCurrentUser, rolePermissions, setRolePermissions, employees, setEmployees, shifts, setShifts, leaveRequests, departments, setDepartments, jobPositions, setJobPositions }) => {
  const location = useLocation();

  // Check if current route is allowed for the user's role
  const currentModule = ALL_MODULES[location.pathname];
  const isAllowed = rolePermissions[user.role].includes(currentModule);

  if (!isAllowed && location.pathname !== '/') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={<Dashboard user={user} />} />
      <Route path="/employee-information" element={<EmployeeInformation user={user} />} />
      <Route path="/skills-talent" element={<SkillsTalent user={user} allEmployees={employees} setEmployees={setEmployees} />} />
      <Route path="/employment-details" element={<EmploymentDetails user={user} />} />
      <Route path="/payroll" element={<Payroll user={user} />} />
      <Route path="/leave-attendance" element={<LeaveAttendance user={user} />} />
      <Route path="/shift-scheduling" element={<ShiftScheduling user={user} allEmployees={employees} shifts={shifts} setShifts={setShifts} leaveRequests={leaveRequests} />} />
      <Route path="/performance" element={<PerformanceManagement user={user} />} />
      <Route path="/recruitment" element={<Recruitment />} />
      <Route path="/training" element={<TrainingDevelopment user={user} />} />
      <Route path="/compliance" element={<Compliance user={user} />} />
      <Route path="/self-service" element={<EmployeeSelfService user={user} />} />
      <Route path="/reports" element={<ReportsAnalytics />} />
      <Route path="/benefits" element={<Benefits user={user} employees={employees} setEmployees={setEmployees} />} />
      <Route path="/organization-structure" element={<OrganizationStructure departments={departments} setDepartments={setDepartments} jobPositions={jobPositions} setJobPositions={setJobPositions} />} />
      <Route path="/system-administration" element={<SystemAdministration appState={{ employees, departments, jobPositions }} rolePermissions={rolePermissions} setRolePermissions={setRolePermissions} />} />
      <Route path="/settings" element={<Settings user={user} setCurrentUser={setCurrentUser} theme={theme} toggleTheme={toggleTheme} />} />
      {/* Fallback route for any unhandled paths */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

const App: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [rolePermissions, setRolePermissions] = useState<{ [key in Role]: Module[] }>(initialRolePermissions);
  
  // Centralized state
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'dark' || storedTheme === 'light') {
        return storedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    // Fetch initial user
    apiService.login(Role.Employee).then(setCurrentUser);

    // Fetch shared data
    const fetchAllData = async () => {
        try {
            const [emps, sfts, leaves, depts, jobs] = await Promise.all([
                apiService.getEmployees(),
                apiService.getShifts(),
                apiService.getLeaveRequests(),
                apiService.getDepartments(),
                apiService.getJobPositions()
            ]);
            setEmployees(emps);
            setShifts(sfts);
            setLeaveRequests(leaves);
            setDepartments(depts);
            setJobPositions(jobs);
        } catch (error) {
            console.error("Failed to fetch initial app data", error);
        }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.error('Failed to save theme to localStorage', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  if (!currentUser) {
    return <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div></div>;
  }

  return (
    <HashRouter>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out lg:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          ></div>
        )}
        
        <Sidebar 
          isMobileMenuOpen={isMobileMenuOpen} 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          currentUser={currentUser}
          rolePermissions={rolePermissions}
        />
        
        <div className="flex flex-col flex-1 w-full overflow-hidden">
          <Header 
            setIsMobileMenuOpen={setIsMobileMenuOpen} 
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            theme={theme}
            toggleTheme={toggleTheme}
          />
          <main className="relative h-full overflow-y-auto bg-gray-100 dark:bg-gray-950 p-6 md:p-8">
            <div aria-hidden="true" className="absolute inset-0 bg-imigongo-light dark:hidden bg-repeat bg-center"></div>
            <div aria-hidden="true" className="absolute inset-0 hidden dark:block bg-imigongo-dark bg-repeat bg-center"></div>
            <div className="relative">
              <ProtectedRoutes 
                user={currentUser} 
                theme={theme} 
                toggleTheme={toggleTheme} 
                setCurrentUser={setCurrentUser} 
                rolePermissions={rolePermissions} 
                setRolePermissions={setRolePermissions}
                employees={employees}
                setEmployees={setEmployees}
                shifts={shifts}
                setShifts={setShifts}
                leaveRequests={leaveRequests}
                departments={departments}
                setDepartments={setDepartments}
                jobPositions={jobPositions}
                setJobPositions={setJobPositions}
              />
            </div>
          </main>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
