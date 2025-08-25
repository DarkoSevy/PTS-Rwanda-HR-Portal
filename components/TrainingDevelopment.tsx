

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Role, Employee, TrainingProgram, EmployeeTraining, TrainingStatus } from '../types';
import { getVisibleEmployees } from './utils';
import { GraduationCapIcon, BookOpenIcon, CheckCircleIcon, FileSignatureIcon } from './icons';
import { apiService } from '../services/apiService';

const TabButton: React.FC<{ icon: React.ElementType, label: string, isActive: boolean, onClick: () => void, count?: number }> = ({ icon: Icon, label, isActive, onClick, count }) => (
    <button onClick={onClick} className={`flex items-center gap-2 whitespace-nowrap py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
        isActive
        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 dark:hover:border-gray-600'
    }`}>
        <Icon className="w-5 h-5"/>
        {label}
        {count && count > 0 && <span className="ml-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">{count}</span>}
    </button>
);

const StatusBadge: React.FC<{ status: TrainingStatus }> = ({ status }) => {
    const styles = {
        [TrainingStatus.Completed]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        [TrainingStatus.InProgress]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        [TrainingStatus.NotStarted]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        [TrainingStatus.Requested]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>
};

const EmployeeTrainingPlan: React.FC<{ trainings: EmployeeTraining[], catalog: TrainingProgram[] }> = ({ trainings, catalog }) => (
    <div className="space-y-4">
        {trainings.length > 0 ? trainings.map(training => {
            const program = catalog.find(p => p.id === training.programId);
            if (!program) return null;
            return (
                <div key={training.programId} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-gray-800 dark:text-white">{program.name}</h4>
                        <StatusBadge status={training.status} />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{program.description}</p>
                    {training.status === TrainingStatus.InProgress && (
                        <div>
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                <span>Progress</span>
                                <span>{training.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${training.progress}%` }}></div>
                            </div>
                        </div>
                    )}
                </div>
            )
        }) : <p className="text-center py-10 text-gray-500">No training programs assigned yet.</p>}
    </div>
);

const TrainingCatalog: React.FC<{ catalog: TrainingProgram[], employeeTrainings: EmployeeTraining[], onEnrollRequest: (programId: string) => void, onEnroll: (programId: string) => void, onUnenroll: (programId: string) => void, user: User, isManagerOrAdmin: boolean }> = ({ catalog, employeeTrainings, onEnrollRequest, onEnroll, onUnenroll, user, isManagerOrAdmin }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {catalog.map(program => {
            const enrollment = employeeTrainings.find(et => et.programId === program.id);
            const status = enrollment?.status;

            const renderButton = () => {
                if (isManagerOrAdmin) {
                     return (
                        <button 
                            onClick={() => status ? onUnenroll(program.id) : onEnroll(program.id)}
                            className={`mt-4 w-full py-1.5 text-sm font-semibold rounded-md transition-colors ${
                                status 
                                ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800' 
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800'
                            }`}
                        >
                            {status ? 'Unenroll Employee' : 'Enroll Employee'}
                        </button>
                    )
                } else { // Employee view
                    if (!status) {
                        return <button onClick={() => onEnrollRequest(program.id)} className="mt-4 w-full py-1.5 text-sm font-semibold rounded-md transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800">Request to Enroll</button>;
                    }
                    if (status === TrainingStatus.Requested) {
                        return <button disabled className="mt-4 w-full py-1.5 text-sm font-semibold rounded-md bg-yellow-100 text-yellow-700 cursor-not-allowed">Pending Approval</button>;
                    }
                    return <button disabled className="mt-4 w-full py-1.5 text-sm font-semibold rounded-md bg-green-100 text-green-700 cursor-not-allowed">Enrolled</button>;
                }
            };
            
            return (
                <div key={program.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex flex-col">
                    <h4 className="font-bold text-gray-800 dark:text-white">{program.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{program.category} | {program.duration}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 flex-grow">{program.description}</p>
                    {renderButton()}
                </div>
            )
        })}
    </div>
);

const ApproveRequests: React.FC<{
    requests: (EmployeeTraining & { employeeName: string, programName: string })[];
    onApprove: (employeeId: string, programId: string) => void;
    onDeny: (employeeId: string, programId: string) => void;
}> = ({ requests, onApprove, onDeny }) => (
    <div className="space-y-4">
        {requests.length > 0 ? requests.map(req => (
            <div key={`${req.employeeId}-${req.programId}`} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <p className="font-bold text-gray-800 dark:text-white">{req.employeeName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Requested: <span className="font-semibold">{req.programName}</span></p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">On: {req.enrollmentDate}</p>
                </div>
                <div className="flex gap-2 self-end sm:self-auto flex-shrink-0">
                    <button onClick={() => onApprove(req.employeeId, req.programId)} className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200">Approve</button>
                    <button onClick={() => onDeny(req.employeeId, req.programId)} className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200">Deny</button>
                </div>
            </div>
        )) : <p className="text-center py-10 text-gray-500">No pending training requests.</p>}
    </div>
);


interface TrainingDevelopmentProps {
    user: User;
}

const TrainingDevelopment: React.FC<TrainingDevelopmentProps> = ({ user }) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [trainingPrograms, setTrainingPrograms] = useState<TrainingProgram[]>([]);
    const [employeeTrainings, setEmployeeTrainings] = useState<EmployeeTraining[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [activeTab, setActiveTab] = useState('plan');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [emps, progs, trainings] = await Promise.all([
                apiService.getEmployees(),
                apiService.getTrainingPrograms(),
                apiService.getEmployeeTrainings(),
            ]);
            setEmployees(emps);
            setTrainingPrograms(progs);
            setEmployeeTrainings(trainings);
        } catch (error) {
            console.error("Failed to fetch training data", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUpdateAndRefresh = async (updater: (prev: EmployeeTraining[]) => EmployeeTraining[]) => {
        await apiService.updateEmployeeTrainings(updater);
        fetchData();
    };

    const visibleEmployees = getVisibleEmployees(user, employees);
    const isManagerOrAdmin = user.role === Role.Manager || user.role === Role.HRAdmin;

    useEffect(() => {
        if (!isLoading && (!selectedEmployee || !visibleEmployees.some(e => e.id === selectedEmployee.id))) {
            setSelectedEmployee(visibleEmployees[0] || null);
        }
    }, [user, visibleEmployees, selectedEmployee, isLoading]);
    
    useEffect(() => {
        if(!isManagerOrAdmin) setActiveTab('plan');
    }, [isManagerOrAdmin])

    const selectedEmployeeTrainings = useMemo(() => {
        return employeeTrainings.filter(et => et.employeeId === selectedEmployee?.id);
    }, [selectedEmployee, employeeTrainings]);

    const teamMemberIds = useMemo(() => {
        if (!isManagerOrAdmin) return new Set();
        return new Set(employees.filter(e => e.managerId === user.id).map(e => e.id));
    }, [employees, user.id, isManagerOrAdmin]);

    const pendingRequests = useMemo(() => {
        return employeeTrainings
            .filter(et => et.status === TrainingStatus.Requested && (user.role === Role.HRAdmin || teamMemberIds.has(et.employeeId)))
            .map(et => {
                const employee = employees.find(e => e.id === et.employeeId);
                const program = trainingPrograms.find(p => p.id === et.programId);
                return {
                    ...et,
                    employeeName: employee?.name || 'Unknown Employee',
                    programName: program?.name || 'Unknown Program',
                }
            });
    }, [employeeTrainings, teamMemberIds, employees, trainingPrograms, user.role]);

    const handleEnrollRequest = (programId: string) => {
        if (!selectedEmployee) return;
        const newTraining: EmployeeTraining = {
            employeeId: selectedEmployee.id,
            programId,
            status: TrainingStatus.Requested,
            enrollmentDate: new Date().toISOString().split('T')[0],
            progress: 0,
        };
        handleUpdateAndRefresh(prev => [...prev, newTraining]);
    };
    
    const handleEnroll = (programId: string) => {
        if (!selectedEmployee) return;
        const newTraining: EmployeeTraining = {
            employeeId: selectedEmployee.id,
            programId,
            status: TrainingStatus.NotStarted,
            enrollmentDate: new Date().toISOString().split('T')[0],
            progress: 0,
        };
        handleUpdateAndRefresh(prev => [...prev, newTraining]);
    };

    const handleUnenroll = (programId: string) => {
        if (!selectedEmployee) return;
        handleUpdateAndRefresh(prev => prev.filter(et => !(et.employeeId === selectedEmployee.id && et.programId === programId)));
    };
    
    const handleApproveRequest = (employeeId: string, programId: string) => {
        handleUpdateAndRefresh(prev => prev.map(et =>
            et.employeeId === employeeId && et.programId === programId
                ? { ...et, status: TrainingStatus.NotStarted }
                : et
        ));
    };

    const handleDenyRequest = (employeeId: string, programId: string) => {
        handleUpdateAndRefresh(prev => prev.filter(et => !(et.employeeId === employeeId && et.programId === programId)));
    };

    const renderContent = () => {
        if (!selectedEmployee) {
            return <div className="text-center py-10 text-gray-500">Please select an employee to view their training details.</div>;
        }

        switch (activeTab) {
            case 'plan':
                return <EmployeeTrainingPlan trainings={selectedEmployeeTrainings} catalog={trainingPrograms} />;
            case 'catalog':
                return <TrainingCatalog catalog={trainingPrograms} employeeTrainings={selectedEmployeeTrainings} onEnrollRequest={handleEnrollRequest} onEnroll={handleEnroll} onUnenroll={handleUnenroll} user={user} isManagerOrAdmin={isManagerOrAdmin} />;
            case 'requests':
                return <ApproveRequests requests={pendingRequests} onApprove={handleApproveRequest} onDeny={handleDenyRequest} />;
            default:
                return null;
        }
    };
    
    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div></div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Training & Development</h1>
            <p className="text-gray-600 dark:text-gray-400">Log and track employee training and certifications.</p>
            
            <div className="mt-6 grid grid-cols-1 xl:grid-cols-4 gap-6">
                <div className="xl:col-span-1 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md self-start">
                     <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 px-2">
                        {isManagerOrAdmin ? "Select Employee" : "My Profile"}
                     </h3>
                    <div className="space-y-2 max-h-[75vh] overflow-y-auto pr-2">
                        {visibleEmployees.map(emp => (
                            <div 
                                key={emp.id} 
                                onClick={() => { if(isManagerOrAdmin) setSelectedEmployee(emp); }} 
                                className={`flex items-center p-3 rounded-lg transition-colors ${isManagerOrAdmin ? 'cursor-pointer' : ''} ${emp.id === selectedEmployee?.id ? 'bg-primary-100 dark:bg-primary-900 ring-2 ring-primary-500' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                            >
                                <img src={emp.photoUrl} alt={emp.name} className="w-10 h-10 rounded-full" />
                                <div className="ml-3 overflow-hidden">
                                    <p className="font-semibold text-gray-800 dark:text-white truncate">{emp.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{emp.jobTitle}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="xl:col-span-3 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
                            <TabButton label={isManagerOrAdmin ? "Employee's Plan" : "My Plan"} icon={GraduationCapIcon} isActive={activeTab === 'plan'} onClick={() => setActiveTab('plan')} />
                            <TabButton label="Training Catalog" icon={BookOpenIcon} isActive={activeTab === 'catalog'} onClick={() => setActiveTab('catalog')} />
                            {isManagerOrAdmin && <TabButton label="Approve Requests" icon={CheckCircleIcon} isActive={activeTab === 'requests'} onClick={() => setActiveTab('requests')} count={pendingRequests.length} />}
                        </nav>
                    </div>
                    <div className="mt-6">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainingDevelopment;