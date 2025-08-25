
import React, { useState } from 'react';
import { User, Role, Employee, BenefitPlan, EmployeeBenefit } from '../types';
import { HeartHandshakeIcon, PlusIcon, PencilIcon, Trash2Icon } from './icons';

// Mock data, in a real app this would come from a database
const initialBenefitPlans: BenefitPlan[] = [
    { id: 'B1', name: 'Radiant Gold Health Plan', provider: 'Radiant Health', type: 'Health', description: 'Comprehensive health coverage for you and your family.', monthlyCost: 15000 },
    { id: 'B2', name: 'RSSB Pension Scheme', provider: 'Govt. of Rwanda', type: 'Pension', description: 'Standard government pension scheme.', monthlyCost: 0 },
    { id: 'B3', name: 'Britam Vision & Dental', provider: 'Britam', type: 'Health', description: 'Additional coverage for vision and dental care.', monthlyCost: 5000 },
    { id: 'B4', name: 'PTS Umusanzu SACCO', provider: 'PTS Rwanda', type: 'Other', description: 'Company-sponsored savings and credit co-operative for employees.', monthlyCost: 10000 },
];

const Benefits: React.FC<{user: User, employees: Employee[], setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>}> = ({ user, employees, setEmployees }) => {
    const [benefitPlans, setBenefitPlans] = useState<BenefitPlan[]>(initialBenefitPlans);

    const isHRAdmin = user.role === Role.HRAdmin;

    const handleEnroll = (employeeId: string, planId: string) => {
        const newBenefit: EmployeeBenefit = {
            planId,
            enrollmentDate: new Date().toISOString().split('T')[0],
            status: 'Active',
        };
        setEmployees(prev => prev.map(emp => {
            if (emp.id === employeeId && !emp.benefits.some(b => b.planId === planId)) {
                return { ...emp, benefits: [...emp.benefits, newBenefit] };
            }
            return emp;
        }));
    };

    const handleUnenroll = (employeeId: string, planId: string) => {
        setEmployees(prev => prev.map(emp => {
            if (emp.id === employeeId) {
                return { ...emp, benefits: emp.benefits.filter(b => b.planId !== planId) };
            }
            return emp;
        }));
    };

    const EmployeeBenefitView = () => {
        const currentUserEmployee = employees.find(e => e.id === user.id);
        if (!currentUserEmployee) return <p>Could not find your employee profile.</p>;
        
        const enrolledPlanIds = new Set(currentUserEmployee.benefits.map(b => b.planId));
        const enrolledPlans = benefitPlans.filter(p => enrolledPlanIds.has(p.id));
        const totalMonthlyCost = enrolledPlans.reduce((sum, plan) => sum + plan.monthlyCost, 0);

        return (
            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Your Enrolled Benefits</h3>
                    {enrolledPlans.length > 0 ? (
                        <div className="space-y-4">
                            {enrolledPlans.map(plan => (
                                <div key={plan.id} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-lg text-primary-600 dark:text-primary-400">{plan.name}</h4>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{plan.provider} - {plan.type}</p>
                                        </div>
                                        <p className="font-semibold text-gray-700 dark:text-gray-200">{plan.monthlyCost.toLocaleString()} RWF/mo</p>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{plan.description}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">You are not enrolled in any benefit plans.</p>
                    )}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end font-bold text-lg">
                        <span className="text-gray-600 dark:text-gray-300 mr-4">Total Monthly Cost:</span>
                        <span className="text-primary-500">{totalMonthlyCost.toLocaleString()} RWF</span>
                    </div>
                </div>
            </div>
        )
    };
    
    const HRAdminBenefitView = () => {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Manage Plans */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Manage Benefit Plans</h3>
                        <button className="flex items-center gap-1 px-2.5 py-1.5 bg-primary-500 text-white text-xs font-semibold rounded-lg shadow-md hover:bg-primary-600">
                            <PlusIcon className="w-4 h-4"/> New Plan
                        </button>
                    </div>
                    <div className="space-y-3">
                        {benefitPlans.map(plan => (
                             <div key={plan.id} className="p-3 rounded-md bg-gray-50 dark:bg-gray-800">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-semibold text-gray-800 dark:text-white">{plan.name}</h4>
                                    <div className="flex gap-2">
                                        <button className="text-gray-500 hover:text-blue-500"><PencilIcon className="w-4 h-4"/></button>
                                        <button className="text-gray-500 hover:text-red-500"><Trash2Icon className="w-4 h-4"/></button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{plan.provider} ({plan.type}) - {plan.monthlyCost.toLocaleString()} RWF/mo</p>
                             </div>
                        ))}
                    </div>
                </div>
                {/* Employee Enrollments */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                     <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">Employee Enrollments</h3>
                     <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                        {employees.map(emp => (
                            <div key={emp.id}>
                                <h4 className="font-semibold text-gray-800 dark:text-white">{emp.name}</h4>
                                <div className="pl-4 mt-2 space-y-2">
                                    {benefitPlans.map(plan => {
                                        const isEnrolled = emp.benefits.some(b => b.planId === plan.id);
                                        return (
                                            <div key={plan.id} className="flex items-center justify-between">
                                                <label htmlFor={`${emp.id}-${plan.id}`} className="text-sm text-gray-600 dark:text-gray-300">{plan.name}</label>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        id={`${emp.id}-${plan.id}`}
                                                        checked={isEnrolled}
                                                        onChange={() => isEnrolled ? handleUnenroll(emp.id, plan.id) : handleEnroll(emp.id, plan.id)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                                </label>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            </div>
        )
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Benefits Administration</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage company benefit plans and employee enrollments.</p>
            
            <div className="mt-6">
                {isHRAdmin ? <HRAdminBenefitView /> : <EmployeeBenefitView />}
            </div>
        </div>
    );
};

export default Benefits;
