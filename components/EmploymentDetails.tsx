

import React, { useState, useEffect, useCallback } from 'react';
import { User, Role, Employee, EmploymentStatus, ContractType, PayFrequency, EditHistoryLog, Department } from '../types';
import { BriefcaseIcon, PencilIcon, HistoryIcon, FileDownIcon, KeyIcon, FileTextIcon } from './icons';
import { getVisibleEmployees } from './utils';
import { apiService } from '../services/apiService';

interface EmploymentDetailsProps {
    user: User;
}

const InfoItem: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
    <div>
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{value || 'N/A'}</dd>
    </div>
);

const Card: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode; actions?: React.ReactNode }> = ({ title, icon: Icon, children, actions }) => (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
            <div className="flex items-center gap-3">
                <Icon className="w-6 h-6 text-primary-500" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
            </div>
            {actions}
        </div>
        {children}
    </div>
);

const EmploymentDetails: React.FC<EmploymentDetailsProps> = ({ user }) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Employee>>({});

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [emps, depts] = await Promise.all([
                apiService.getEmployees(),
                apiService.getDepartments(),
            ]);
            setEmployees(emps);
            setDepartments(depts);
        } catch (error) {
            console.error("Failed to fetch data for Employment Details", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const visibleEmployees = getVisibleEmployees(user, employees);
    
    useEffect(() => {
        if (!isLoading && (!selectedEmployee || !visibleEmployees.some(e => e.id === selectedEmployee.id))) {
            setSelectedEmployee(visibleEmployees.length > 0 ? visibleEmployees[0] : null);
        }
    }, [user, visibleEmployees, isLoading, selectedEmployee]);

    useEffect(() => {
        if (selectedEmployee) {
            const updatedEmployee = employees.find(e => e.id === selectedEmployee.id);
            if (updatedEmployee) {
                setSelectedEmployee(updatedEmployee);
                 if (isEditing) {
                    setFormData(updatedEmployee);
                }
            }
        }
    }, [employees, selectedEmployee, isEditing]);

    const canEdit = selectedEmployee && (user.role === Role.HRAdmin || (user.role === Role.Manager && selectedEmployee.managerId === user.id));
    const canView = selectedEmployee && (canEdit || user.id === selectedEmployee.id || user.role === Role.HRAdmin || (user.role === Role.Manager && visibleEmployees.some(e => e.id === selectedEmployee.id)));
    
    const handleEdit = () => {
        if (!selectedEmployee) return;
        setFormData(selectedEmployee);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({});
    };

    const handleSave = async () => {
        if (!selectedEmployee) return;

        const newEditHistory: EditHistoryLog[] = [...(selectedEmployee.editHistory || [])];
        const timestamp = new Date().toISOString();
        
        Object.keys(formData).forEach(key => {
            const originalValue = selectedEmployee[key as keyof Employee];
            const newValue = formData[key as keyof Employee];

            if (JSON.stringify(originalValue) !== JSON.stringify(newValue)) {
                newEditHistory.unshift({
                    timestamp,
                    editorName: user.name,
                    field: key,
                    oldValue: originalValue,
                    newValue: newValue,
                });
            }
        });
        
        await apiService.updateEmployees(prev => prev.map(emp => 
            emp.id === selectedEmployee.id 
                ? { ...emp, ...formData, editHistory: newEditHistory }
                : emp
        ));
        
        setIsEditing(false);
        fetchData(); // Refresh data from source
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [outerKey, innerKey] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [outerKey]: {
                    ...(prev[outerKey as keyof typeof prev] as object),
                    [innerKey]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const manager = selectedEmployee?.managerId ? employees.find(e => e.id === selectedEmployee.managerId) : null;
    
    const inputClass = "mt-1 w-full px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500";
    const selectClass = "mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white";


    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div></div>;
    }

    if (!selectedEmployee) {
        return (
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Employment Details</h1>
                <p className="text-gray-600 dark:text-gray-400">No employee selected or you may not have permission to view any employees.</p>
            </div>
        );
    }
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Employment Details</h1>
            <p className="text-gray-600 dark:text-gray-400">Track job-related information for all employees.</p>

            <div className="mt-6 grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Employee List */}
                 <div className="xl:col-span-1">
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 px-2">
                             {user.role === Role.Employee ? 'My Profile' : 'Employee List'}
                        </h3>
                        <div className="space-y-2 h-[80vh] overflow-y-auto pr-2">
                        {visibleEmployees.map(emp => (
                            <div key={emp.id} onClick={() => setSelectedEmployee(emp)} className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${emp.id === selectedEmployee.id ? 'bg-primary-100 dark:bg-primary-900 ring-2 ring-primary-500' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                                <img src={emp.photoUrl} alt={emp.name} className="w-10 h-10 rounded-full" />
                                <div className="ml-3">
                                    <p className="font-semibold text-gray-800 dark:text-white">{emp.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{emp.jobTitle}</p>
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>
                </div>

                {/* Details View */}
                <div className="xl:col-span-3 space-y-6">
                    {canView ? (
                        <>
                            {/* Header */}
                            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md flex flex-col sm:flex-row items-center sm:justify-between gap-4">
                                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                                    <img src={selectedEmployee.photoUrl} alt={selectedEmployee.name} className="w-20 h-20 rounded-full flex-shrink-0"/>
                                    <div>
                                        <h2 className="text-2xl font-bold text-primary-500">{selectedEmployee.name}</h2>
                                        <p className="text-gray-600 dark:text-gray-300">{selectedEmployee.jobTitle} / {selectedEmployee.department}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    {isEditing ? (
                                        <>
                                            <button onClick={handleCancel} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Cancel</button>
                                            <button onClick={handleSave} className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600">Save Changes</button>
                                        </>
                                    ) : canEdit && (
                                        <button onClick={handleEdit} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg shadow-md hover:bg-primary-600">
                                            <PencilIcon className="w-4 h-4"/> Edit Profile
                                        </button>
                                    )}
                                    <button onClick={() => alert('Exporting to PDF...')} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600">
                                       <FileDownIcon className="w-4 h-4"/> PDF
                                    </button>
                                </div>
                            </div>
                            
                             <Card title="Job Information" icon={BriefcaseIcon}>
                                <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
                                    <InfoItem label="Employee ID" value={selectedEmployee.id} />

                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Job Title</dt>
                                        {isEditing ? <input type="text" name="jobTitle" value={formData.jobTitle || ''} onChange={handleChange} className={inputClass} /> : <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedEmployee.jobTitle}</dd>}
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</dt>
                                        {isEditing ? <select name="department" value={formData.department || ''} onChange={handleChange} className={selectClass}>{departments.map(d=><option key={d.id} value={d.name}>{d.name}</option>)}</select> : <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedEmployee.department}</dd>}
                                    </div>

                                    <InfoItem label="Manager/Supervisor" value={manager?.name} />
                                    
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Employment Status</dt>
                                        {isEditing ? <select name="employmentStatus" value={formData.employmentStatus || ''} onChange={handleChange} className={selectClass}>{Object.values(EmploymentStatus).map(s=><option key={s} value={s}>{s}</option>)}</select> : <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedEmployee.employmentStatus}</dd>}
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Hire</dt>
                                        {isEditing ? <input type="date" name="dateOfHire" value={formData.dateOfHire || ''} onChange={handleChange} className={inputClass} /> : <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedEmployee.dateOfHire}</dd>}
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Job Grade / Level</dt>
                                        {isEditing ? <input type="text" name="jobGrade" value={formData.jobGrade || ''} onChange={handleChange} className={inputClass} /> : <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedEmployee.jobGrade || 'N/A'}</dd>}
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Work Location</dt>
                                        {isEditing ? <input type="text" name="workLocation" value={formData.workLocation || ''} onChange={handleChange} className={inputClass} /> : <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedEmployee.workLocation || 'N/A'}</dd>}
                                    </div>
                                    <InfoItem label="Work Shift" value={selectedEmployee.workShift} />
                                </dl>
                            </Card>

                             <Card title="Contract & Probation" icon={FileTextIcon}>
                                <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
                                     <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Employment Type</dt>
                                        {isEditing ? <select name="employmentType" value={formData.employmentType || ''} onChange={handleChange} className={selectClass}>{['Permanent', 'Contract', 'Casual', 'Intern'].map(s=><option key={s} value={s}>{s}</option>)}</select> : <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedEmployee.employmentType}</dd>}
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Contract Type</dt>
                                        {isEditing ? <select name="contractType" value={formData.contractType || ''} onChange={handleChange} className={selectClass}>{Object.values(ContractType).map(s=><option key={s} value={s}>{s}</option>)}</select> : <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedEmployee.contractType}</dd>}
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Contract Start Date</dt>
                                        {isEditing ? <input type="date" name="contractStartDate" value={formData.contractStartDate || ''} onChange={handleChange} className={inputClass} /> : <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedEmployee.contractStartDate || 'N/A'}</dd>}
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Contract End Date</dt>
                                        {isEditing ? <input type="date" name="contractEndDate" value={formData.contractEndDate || ''} onChange={handleChange} className={inputClass} /> : <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedEmployee.contractEndDate || 'N/A'}</dd>}
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Probation Status</dt>
                                        {isEditing ? <select name="probation.status" value={formData.probation?.status || ''} onChange={handleChange} className={selectClass}>{['Pending', 'Passed', 'Failed', 'Not Applicable'].map(s=><option key={s} value={s}>{s}</option>)}</select> : <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedEmployee.probation.status}</dd>}
                                    </div>
                                    <InfoItem label="Probation End Date" value={selectedEmployee.probation.endDate} />
                                </dl>
                            </Card>

                            {canEdit && (
                                <Card title="Succession Planning" icon={KeyIcon}>
                                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                                        <InfoItem label="High Potential" value={selectedEmployee.isHighPotential ? 'Yes' : 'No'} />
                                        <InfoItem label="Succession Status" value={selectedEmployee.successionStatus} />
                                    </dl>
                                </Card>
                            )}

                            {canEdit && (
                                <Card title="Change History" icon={HistoryIcon}>
                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                        {selectedEmployee.editHistory?.length > 0 ? selectedEmployee.editHistory.map((log, index) => (
                                            <div key={`${log.timestamp}-${index}`} className="text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                                                <p><span className="font-semibold">{log.editorName}</span> updated field <span className="font-semibold text-primary-500">{log.field}</span></p>
                                                <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                                            </div>
                                        )) : <p className="text-center text-gray-500 dark:text-gray-400 py-6">No changes recorded.</p>}
                                    </div>
                                </Card>
                            )}
                        </>
                    ) : (
                        <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md text-center">
                            <p className="text-lg text-gray-600 dark:text-gray-300">You do not have permission to view this employee's details.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmploymentDetails;