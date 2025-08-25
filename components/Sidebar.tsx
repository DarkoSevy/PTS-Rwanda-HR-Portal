import React from 'react';
import { NavLink } from 'react-router-dom';
import { Module, NavItem, User, Role } from '../types';
import { HomeIcon, UsersIcon, BriefcaseIcon, DollarSignIcon, CalendarIcon, TrendingUpIcon, UserPlusIcon, BookOpenIcon, FileTextIcon, UserCheckIcon, BarChartIcon, LogOutIcon, XIcon, SparklesIcon, HeartHandshakeIcon, NetworkIcon, ChevronsLeftIcon, CogIcon, ServerIcon, ClockIcon } from './icons';

const allNavItems: NavItem[] = [
  { name: Module.Dashboard, path: '/dashboard', icon: HomeIcon },
  { name: Module.EmployeeInfo, path: '/employee-information', icon: UsersIcon },
  { name: Module.SkillsTalent, path: '/skills-talent', icon: SparklesIcon },
  { name: Module.EmploymentDetails, path: '/employment-details', icon: BriefcaseIcon },
  { name: Module.Payroll, path: '/payroll', icon: DollarSignIcon },
  { name: Module.LeaveAttendance, path: '/leave-attendance', icon: CalendarIcon },
  { name: Module.ShiftScheduling, path: '/shift-scheduling', icon: ClockIcon },
  { name: Module.Performance, path: '/performance', icon: TrendingUpIcon },
  { name: Module.Benefits, path: '/benefits', icon: HeartHandshakeIcon },
  { name: Module.Recruitment, path: '/recruitment', icon: UserPlusIcon },
  { name: Module.Training, path: '/training', icon: BookOpenIcon },
  { name: Module.Compliance, path: '/compliance', icon: FileTextIcon },
  { name: Module.SelfService, path: '/self-service', icon: UserCheckIcon },
  { name: Module.Reports, path: '/reports', icon: BarChartIcon },
  { name: Module.Organization, path: '/organization-structure', icon: NetworkIcon },
  { name: Module.SystemAdministration, path: '/system-administration', icon: ServerIcon },
  { name: Module.Settings, path: '/settings', icon: CogIcon },
];

interface SidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (isCollapsed: boolean) => void;
  currentUser: User;
  rolePermissions: { [key in Role]: Module[] };
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileMenuOpen, setIsMobileMenuOpen, isSidebarCollapsed, setIsSidebarCollapsed, currentUser, rolePermissions }) => {

  const handleLinkClick = () => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };
  
  const allowedModules = rolePermissions[currentUser.role];
  const navItems = allNavItems.filter(item => allowedModules.includes(item.name));
  
  const logoDark = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAbFBMVEX////AAD/hIT/zMz9v7/g4OD/paX4+Pj/uLj8/Pz/goL/ycn/2dn09PT/8fH/dXX/X1//oaH/mJj/4uL/r6//6ur/jIz/aWn/fHz/rq7/cHD/tbX/zs7/n5//qan/xcX/lZX/urqMUE9TAAAEJElEQVR4nO3d63aqOBSFYRSRBEVRUcT//8dLciRBxQo5u+11P6tntcWzCTNJvm4DAAAAAAAAAAAAAAAAAMDfEnXpD/e87u97/s14/7rX/b3u9a+P6e8f1/cRfZ4/7vcj+nz68LdI/w5H+9L3wT2t/a5H/35C30f0HjP0fUgfR/T+S+k8xR+K9GFk/g4/bOjDT+87/NCiDzf5f+d3iT788F9A/3z8A0yfR/TRVbSO4w/o+4A+jOijq2kdR/ShQz/g4D/p+6DPo4O+dGlTj+iN17j2wR7R53kXp+iP3/h/8N9B9HlE7x+67u7yqD7O+g1g6MOo7gL9XkR/fH89f/j7gD6P6PPo4D+9/8P3qD5D9Hkc0fvxP4XoM3T8/4H+Y/z2b3D/Bv0+q+sD+jCjr4N6x6/DPo4o+hYdffg74V9599d14f/AP8m3n8z3A/0A0c2/Nqpv2s+7/8P3QvQhRt/hN2f6f3z3j1/f6I+H/8N0gOijG2H3b9L3EX1eR/TRf4m+3+u/A+2P0cdh/n1En6Pj/088+uCDP8f5+h+iP4vovQv5F/b1j6P3L8p7H8U7eL8X7f56fX1D1f0d3v2j437P8vM+ou0j+nz84w2+H9FnKPSNfR7Rh9f+C9yL6MMx/cK3v2X8f57+P6MPc/1z9B6GvUf0+R39n38H7kP0cUTfd6j7Mv0g+r/qOnoP1f2bvo/o4/i/85tG1v2dPgDo/QL9H8MfpP1B30f03o2o+7L9NfrAof1R6cM433co+jCiD3P84wN9ANHHCX2Pq/uz3H9Ff+a3T1c9+vB/gv8Z332S6MMo+r5vX9f4V/z3iP5H38+1v4Vj/d+P6PMr+n7c/jPq/rQf1vE030+8j/M+qvcP9Hkk30P1+xN9H9Hn+T7L9sN0fA+i9+u7bN9H9GH2f8b5W3v0Hk3fX6Xvf0b9e8f0XoLfX6GvW30XvT+i76/R9936Lvt+3v0fcf+n4Pff/hf4H+r0Pf36Lvt+z7D/0+W/9XfV5F31+m77v0ve36vs83a/T9t+5H9XkGff+WvW/R+3v2Hfr8Gn3fovf37HvV+jjn/03q34+o//q9/8C/V+i93v2/S16/6p+v0YfX6PvV+n7m/W/Qt+/Z9/fW/f37Put9Xk1ff9qfd9iP+N6ffS/TfsAoseo92v0fVv1e3T8r2p/l/Z3afue3f+W7L9N+/u0/U/Z92v3v0z7m/f3bfte7Qfo+2T7Ltl+gP5393+h/r/8H3m/1P/Z+n8FAAAAAAAAAAAAAAAAgH/kXwEGAHC1G7nI8iAAAAAASUVORK5CYII=";
  const logoLight = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NkY4Q0I3NkQxMzY5MTFFQUEyN0JGNjg0N0MzQTkxODkiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NkY4Q0I3NkUxMzY5MTFFQUEyN0JGNjg0N0MzQTkxODkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo2RjhDQjc2QjEzNjkxMUVBQTJCN0Y2ODQ3QzNBOTE4OSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo2RjhDQjc2QzEzNjkxMUVBQTJCN0Y2ODQ3QzNBOTE4OSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PsbDY9MAAAAzUExURff39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f392S255AAAAARdFJOU//////////////////39PD5+v2z4d24mAAAARdJREFUeNrs20sKgDAQRdHYQxZ72fr/H5sIQfAjaQeG/9iECdu2bdu2bdu2bdu2/bztbS+t9HKbvJ87ddTUkcQ+iNIx7YMoHdk+UCJ1xtJjyDQNyw8h0zIsPIRMy7DwEDLNwsLDyLQMCw8h0zIsPIRMy7DwEDLNwsLDyLQMCw8h0zIsPIRMy7DwEDLNwsLDyLQMCw8h0zIsPIRMy7DwEDLNwsLDyLQMCw8h0zIsPIRMy7DwEDLNwsLDyLQMCw8h0zIsPIRMy7DwEDLNwsLDyLQMCw8h0zIsPIRMy7DwEDLNwsLDyLQM4/NDstKttCn1z1hur9Ima/2+bdu2bdu2bdu2bf9t2z+j/wIMAF71BggbS25GAAAAAElFTkSuQmCC";


  return (
      <aside className={`fixed inset-y-0 left-0 z-30 bg-white dark:bg-primary-900 shadow-xl transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 w-64 ${isSidebarCollapsed ? 'lg:w-20' : ''} ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`} role="navigation" aria-label="Main Navigation">
        {/* Header */}
        <div className={`flex items-center justify-between py-4 flex-shrink-0 border-b border-gray-100 dark:border-primary-800 transition-all duration-300 ${isSidebarCollapsed ? 'lg:px-4' : 'px-6'}`}>
          <a href="#/dashboard" className={`flex items-center ${isSidebarCollapsed ? 'w-full lg:justify-center' : ''}`}>
            {/* Light mode logo */}
            <img src={logoDark} alt="PTS Rwanda Logo" className="h-8 w-auto block dark:hidden" />
            {/* Dark mode logo */}
            <img src={logoLight} alt="PTS Rwanda Logo" className="h-8 w-auto hidden dark:block" />
          </a>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Close menu">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={handleLinkClick}
              title={isSidebarCollapsed ? item.name : undefined}
              className={({ isActive }) =>
                `flex items-center mt-2 py-2.5 transition-colors duration-200 rounded-lg ${isSidebarCollapsed ? 'lg:justify-center mx-2 lg:px-3' : 'justify-start mx-4 px-4'} ${
                  isActive
                    ? 'bg-primary-800 text-white shadow-lg'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-primary-800/50 hover:text-gray-700 dark:hover:text-gray-200'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span className={`mx-4 text-sm font-medium ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>{item.name}</span>
            </NavLink>
          ))}
        </nav>
        
        {/* Footer */}
        <div className={`flex-shrink-0 p-2 lg:p-4 border-t border-gray-100 dark:border-primary-800`}>
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex items-center justify-center w-full p-2 mb-2 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-primary-800/50 dark:text-gray-400"
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronsLeftIcon className={`w-6 h-6 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>
           <NavLink
              to="#"
              onClick={handleLinkClick}
              title={isSidebarCollapsed ? 'Logout' : undefined}
              className={`flex items-center py-2 w-full rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-primary-800/50 ${isSidebarCollapsed ? 'lg:justify-center px-2' : 'px-4'}`}
            >
             <LogOutIcon className="h-6 w-6"/>
             <span className={`mx-4 text-sm font-medium ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>Logout</span>
           </NavLink>
        </div>
      </aside>
  );
};

export default Sidebar;