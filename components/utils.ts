import { User, Role, Employee } from '../types';

const privilegedJobTitles = ['Managing Director', 'Director Administration & Finance'];

export const getVisibleEmployees = (user: User, allEmployees: Employee[]): Employee[] => {
    // HR Admin has full access.
    if (user.role === Role.HRAdmin) {
        return allEmployees;
    }

    const currentUserEmployee = allEmployees.find(e => e.id === user.id);
    if (!currentUserEmployee) {
        return []; // If user is not an employee, they can't see anyone (unless HR)
    }

    // Users with privileged job titles have full access.
    if (privilegedJobTitles.includes(currentUserEmployee.jobTitle)) {
        return allEmployees;
    }

    // Managers see their team (direct reports) and their department staff, excluding privileged roles.
    if (user.role === Role.Manager) {
        return allEmployees.filter(emp =>
            (emp.department === currentUserEmployee.department || emp.managerId === currentUserEmployee.id) &&
            !privilegedJobTitles.includes(emp.jobTitle)
        );
    }

    // Employees see only themselves.
    if (user.role === Role.Employee) {
        return [currentUserEmployee];
    }

    return [];
};
