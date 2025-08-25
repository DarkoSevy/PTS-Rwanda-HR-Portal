


import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Employee, Role, User, EmployeeRecord, EmployeeRecordType, AccessLog, Department, JobPosition, EmploymentStatus, ContractType, PayFrequency, EmployeeDocument, AssignedAsset } from '../types';
import { UsersIcon, PlusIcon, ShieldAlertIcon, AwardIcon, ChevronsUpIcon, FileClockIcon, FileDownIcon, FileUpIcon, Trash2Icon, FileTextIcon, ListIcon, GridIcon, CheckCircleIcon, XIcon, ContactIcon, BriefcaseIcon } from './icons';
import { getVisibleEmployees } from './utils';
import { apiService } from '../services/apiService';

// --- Reusable Components ---

const CardHeader: React.FC<{ title: string, children?: React.ReactNode }> = ({ title, children }) => (
    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
        {children}
    </div>
);

const ConfirmationModal: React.FC<{ onConfirm: () => void, onCancel: () => void, title: string, message: string, confirmText?: string }> = ({ onConfirm, onCancel, title, message, confirmText = "Confirm" }) => (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-60" onClick={onCancel}>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-6 w-full max-w-sm mx-4 transform transition-all" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{message}</p>
            <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Cancel</button>
                <button type="button" onClick={onConfirm} className={`px-4 py-2 text-white font-semibold rounded-lg shadow-md ${confirmText.toLowerCase().includes('delete') ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-600 hover:bg-primary-700'}`}>{confirmText}</button>
            </div>
        </div>
    </div>
);

const AddEmployeeModal: React.FC<{ onSave: (employee: Omit<Employee, 'id' | 'photoUrl' | 'skills' | 'records' | 'benefits' | 'accessLogs'>) => void, onClose: () => void, departments: Department[], jobPositions: JobPosition[] }> = ({ onSave, onClose, departments, jobPositions }) => {
    const [formData, setFormData] = useState({ name: '', gender: 'Female' as 'Male' | 'Female', email: '', jobTitle: '', department: 'Drivers', status: 'Permanent' as 'Permanent' | 'Contract' | 'Casual' | 'Intern', basicSalary: '', phone: '', address: '', emergencyContactName: '', emergencyContactPhone: '' });
    
    const [filteredPositions, setFilteredPositions] = useState<JobPosition[]>([]);

    useEffect(() => {
        const selectedDepartment = departments.find(d => d.name === formData.department);
        if (selectedDepartment) {
            setFilteredPositions(jobPositions.filter(p => p.departmentId === selectedDepartment.id));
        } else {
            setFilteredPositions([]);
        }
    }, [formData.department, departments, jobPositions]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { emergencyContactName, emergencyContactPhone, status, ...rest } = formData;
        
        const today = new Date().toISOString().split('T')[0];

        const newEmployeeData: Omit<Employee, 'id' | 'photoUrl' | 'skills' | 'records' | 'benefits' | 'accessLogs'> = {
            ...rest,
            employmentType: status,
            basicSalary: Number(formData.basicSalary),
            emergencyContact: { name: emergencyContactName, phone: emergencyContactPhone },
            employmentStatus: EmploymentStatus.Active,
            dateOfHire: today,
            contractType: status === 'Permanent' ? ContractType.FullTime : ContractType.FixedTerm,
            probation: { status: 'Pending', startDate: today, endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0] },
            payFrequency: PayFrequency.Monthly,
            annualLeaveBalance: 18,
            documents: [],
            promotionHistory: [],
            transferHistory: [],
            editHistory: [],
            assignedAssets: [],
        };
        
        onSave(newEmployeeData);
    };

    return (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md mx-4 transform transition-all">
                <form onSubmit={handleSubmit}>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Add New Employee</h2>
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required className="w-full px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        <select name="gender" onChange={handleChange} value={formData.gender} className="w-full px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500">
                           <option value="Female">Female</option>
                           <option value="Male">Male</option>
                        </select>
                        <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required className="w-full px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        <input type="tel" name="phone" placeholder="Phone Number" onChange={handleChange} required className="w-full px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        <input type="text" name="address" placeholder="Address" onChange={handleChange} required className="w-full px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        <select name="department" onChange={handleChange} value={formData.department} className="w-full px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500">
                           {departments.map(d => <option key={d.id}>{d.name}</option>)}
                        </select>
                        <select name="jobTitle" onChange={handleChange} value={formData.jobTitle} className="w-full px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" disabled={filteredPositions.length === 0}>
                            <option value="">Select a job title...</option>
                           {filteredPositions.map(p => <option key={p.id}>{p.title}</option>)}
                        </select>
                        <input type="number" name="basicSalary" placeholder="Basic Salary (RWF)" onChange={handleChange} required className="w-full px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        <select name="status" onChange={handleChange} value={formData.status} className="w-full px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500">
                           <option>Permanent</option><option>Contract</option><option>Casual</option><option>Intern</option>
                        </select>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">Emergency Contact</p>
                        <input type="text" name="emergencyContactName" placeholder="Emergency Contact Name" onChange={handleChange} required className="w-full px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        <input type="tel" name="emergencyContactPhone" placeholder="Emergency Contact Phone" onChange={handleChange} required className="w-full px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg shadow-md hover:bg-primary-600">Save Employee</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EmployeeGridCard: React.FC<{ employee: Employee; onSelect: () => void; isSelected: boolean }> = ({ employee, onSelect, isSelected }) => (
    <div
        onClick={onSelect}
        className={`bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm text-center cursor-pointer transition-all duration-200 ${
            isSelected ? 'ring-2 ring-primary-500 scale-105 shadow-lg' : 'hover:shadow-md hover:-translate-y-1'
        }`}
    >
        <img src={employee.photoUrl} alt={employee.name} className="w-20 h-20 rounded-full mx-auto shadow-md" />
        <p className="font-bold text-gray-800 dark:text-white mt-3 truncate">{employee.name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{employee.jobTitle}</p>
        <span className="mt-2 inline-block bg-primary-100 text-primary-800 text-xs font-semibold px-2 py-0.5 rounded-full dark:bg-primary-800 dark:text-primary-200">{employee.department}</span>
    </div>
);

const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const baseClasses = "fixed bottom-5 right-5 z-50 flex items-center p-4 rounded-lg shadow-lg max-w-sm animate-fade-in-up";
    const typeClasses = {
        success: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
        error: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    };
    const Icon = type === 'success' ? CheckCircleIcon : ShieldAlertIcon;

    return (
        <div className={`${baseClasses} ${typeClasses[type]}`}>
            <Icon className="w-6 h-6 mr-3" />
            <span className="flex-1 font-medium">{message}</span>
            <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-black/10">
                <XIcon className="w-4 h-4" />
            </button>
        </div>
    );
};


// --- Detail Panel Components ---

const TabButton: React.FC<{ icon: React.ElementType, label: string, isActive: boolean, onClick: () => void }> = ({ icon: Icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-2 whitespace-nowrap py-3 px-2 font-medium text-sm border-b-2 transition-colors ${
        isActive
        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 dark:hover:border-gray-600'
    }`}>
        <Icon className="w-5 h-5"/>
        {label}
    </button>
);

const OverviewTab: React.FC<{employee: Employee, allEmployees: Employee[]}> = ({employee, allEmployees}) => {
    const manager = employee.managerId ? allEmployees.find(e => e.id === employee.managerId) : null;
    return (
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div className="md:col-span-2">
                <dt className="font-semibold text-gray-500">Email Address</dt>
                <dd className="text-gray-700 dark:text-gray-200">{employee.email}</dd>
            </div>
             <div>
                <dt className="font-semibold text-gray-500">Phone Number</dt>
                <dd className="text-gray-700 dark:text-gray-200">{employee.phone}</dd>
            </div>
            <div>
                <dt className="font-semibold text-gray-500">Address</dt>
                <dd className="text-gray-700 dark:text-gray-200">{employee.address}</dd>
            </div>
             <div className="md:col-span-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <dt className="font-semibold text-gray-500">Emergency Contact</dt>
                <dd className="text-gray-700 dark:text-gray-200">{employee.emergencyContact.name} ({employee.emergencyContact.phone})</dd>
            </div>
            <div>
                <dt className="font-semibold text-gray-500">Manager</dt>
                <dd className="text-gray-700 dark:text-gray-200">{manager?.name || 'N/A'}</dd>
            </div>
            <div>
                <dt className="font-semibold text-gray-500">Date of Hire</dt>
                <dd className="text-gray-700 dark:text-gray-200">{employee.dateOfHire}</dd>
            </div>
             <div>
                <dt className="font-semibold text-gray-500">Employment Type</dt>
                <dd className="text-gray-700 dark:text-gray-200">{employee.employmentType}</dd>
            </div>
        </dl>
    );
};

const RecordsTab: React.FC<{
    selectedEmployee: Employee,
    user: User,
    canManage: boolean,
    onAdd: () => void,
    onDelete: (recordId: string) => void
}> = ({ selectedEmployee, user, canManage, onAdd, onDelete }) => {
     const recordIcons: { [key in EmployeeRecordType]: React.FC<any> } = {
        [EmployeeRecordType.Warning]: ShieldAlertIcon,
        [EmployeeRecordType.Achievement]: AwardIcon,
        [EmployeeRecordType.Promotion]: ChevronsUpIcon,
    };
    const recordColors: { [key in EmployeeRecordType]: string } = {
        [EmployeeRecordType.Warning]: 'border-yellow-500 text-yellow-600 dark:text-yellow-400',
        [EmployeeRecordType.Achievement]: 'border-green-500 text-green-600 dark:text-green-400',
        [EmployeeRecordType.Promotion]: 'border-blue-500 text-blue-600 dark:text-blue-400',
    };
    return (
        <div>
            {canManage && (
                <div className="flex justify-end mb-4">
                     <button onClick={onAdd} className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md hover:bg-blue-600">
                        <PlusIcon className="w-4 h-4"/> Add Record
                    </button>
                </div>
            )}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {selectedEmployee.records.length > 0 ? selectedEmployee.records.map(record => {
                    const Icon = recordIcons[record.type];
                    const colorClass = recordColors[record.type];
                    return (
                        <div key={record.id} className={`flex items-start gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border-l-4 ${colorClass}`}>
                            <Icon className={`w-6 h-6 flex-shrink-0 mt-1 ${colorClass}`} />
                            <div className="flex-1">
                                <p className="font-semibold text-gray-800 dark:text-white">{record.type}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{record.description}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{record.date} - by {record.addedBy}</p>
                            </div>
                            {canManage && (
                                <button onClick={() => onDelete(record.id)} className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900">
                                    <Trash2Icon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )
                }) : <p className="text-center text-gray-500 dark:text-gray-400 py-10">No records found for this employee.</p>}
            </div>
        </div>
    );
}

const DocumentsTab: React.FC<{
    selectedEmployee: Employee;
    canManage: boolean;
    onAdd: () => void;
    onDelete: (docId: string) => void;
}> = ({ selectedEmployee, canManage, onAdd, onDelete }) => (
     <div>
        {canManage && (
            <div className="flex justify-end mb-4">
                <button onClick={onAdd} className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md hover:bg-blue-600">
                    <FileUpIcon className="w-4 h-4"/> Upload Document
                </button>
            </div>
        )}
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {(selectedEmployee.documents || []).length > 0 ? selectedEmployee.documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <FileTextIcon className="w-6 h-6 text-gray-500 flex-shrink-0" />
                        <div className="overflow-hidden">
                            <p className="font-semibold text-sm text-gray-800 dark:text-white truncate" title={doc.fileName}>{doc.fileName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={doc.description}>{doc.description}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Uploaded: {doc.uploadDate}</p>
                        </div>
                    </div>
                    {canManage && (
                        <button onClick={() => onDelete(doc.id)} className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900 ml-2 flex-shrink-0">
                            <Trash2Icon className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )) : <p className="text-center text-gray-500 dark:text-gray-400 py-10">No documents uploaded for this employee.</p>}
        </div>
    </div>
);

const AssetsTab: React.FC<{
    selectedEmployee: Employee;
    canManage: boolean;
    onAdd: () => void;
    onDelete: (assetId: string) => void;
}> = ({ selectedEmployee, canManage, onAdd, onDelete }) => (
     <div>
        {canManage && (
            <div className="flex justify-end mb-4">
                 <button onClick={onAdd} className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md hover:bg-blue-600">
                    <PlusIcon className="w-4 h-4"/> Assign Asset
                </button>
            </div>
        )}
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {(selectedEmployee.assignedAssets || []).length > 0 ? selectedEmployee.assignedAssets.map(asset => (
                <div key={asset.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <BriefcaseIcon className="w-6 h-6 text-gray-500 flex-shrink-0" />
                        <div className="overflow-hidden">
                            <p className="font-semibold text-sm text-gray-800 dark:text-white truncate" title={asset.name}>{asset.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{asset.type} | Assigned: {asset.assignedDate}</p>
                        </div>
                    </div>
                    {canManage && (
                        <button onClick={() => onDelete(asset.id)} className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900 ml-2 flex-shrink-0">
                            <Trash2Icon className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )) : <p className="text-center text-gray-500 dark:text-gray-400 py-10">No assets assigned to this employee.</p>}
        </div>
    </div>
);

const AccessLogsTab: React.FC<{ selectedEmployee: Employee }> = ({ selectedEmployee }) => (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {selectedEmployee.accessLogs?.length > 0 ? selectedEmployee.accessLogs.map(log => (
            <div key={log.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                <FileClockIcon className="w-5 h-5 text-gray-500" />
                <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">{log.accessorName}</span> ({log.accessorRole}) performed action: <span className="font-semibold text-primary-500">{log.action}</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(log.timestamp).toLocaleString()}</p>
                </div>
            </div>
        )) : <p className="text-center text-gray-500 dark:text-gray-400 py-10">No access logs for this employee.</p>}
    </div>
);


// --- MODALS ---

const AddRecordModal: React.FC<{ onSave: (record: Omit<EmployeeRecord, 'id' | 'addedBy'>) => void, onClose: () => void }> = ({ onSave, onClose }) => {
    const [formData, setFormData] = useState({ type: EmployeeRecordType.Achievement, date: new Date().toISOString().split('T')[0], description: '' });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };
    return (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}><div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md mx-4" onClick={e=>e.stopPropagation()}><form onSubmit={handleSubmit}><h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Add Employee Record</h2><div className="space-y-4"><select name="type" onChange={handleChange} value={formData.type} className="w-full px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500">{Object.values(EmployeeRecordType).map(type => <option key={type} value={type}>{type}</option>)}</select><input type="date" name="date" onChange={handleChange} value={formData.date} required className="w-full px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" /><textarea name="description" rows={4} placeholder="Description..." onChange={handleChange} required className="w-full px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"></textarea></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Cancel</button><button type="submit" className="px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg shadow-md hover:bg-primary-600">Save Record</button></div></form></div></div>
    );
};

const DocumentUploadModal: React.FC<{ onSave: (doc: Omit<EmployeeDocument, 'id' | 'uploadDate'>) => void, onClose: () => void }> = ({ onSave, onClose }) => {
    const [file, setFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if(e.target.files) setFile(e.target.files[0]); };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if(!file) { alert('Please select a file.'); return; } onSave({ fileName: file.name, fileType: file.type, fileSize: file.size, description: description || 'No description', }); };
    return (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}><div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md mx-4" onClick={e=>e.stopPropagation()}><form onSubmit={handleSubmit}><h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Upload Document</h2><div className="space-y-4"><div><label className="text-sm font-medium">File</label><div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md"><div className="space-y-1 text-center"><FileUpIcon className="mx-auto h-12 w-12 text-gray-400"/><div className="flex text-sm text-gray-600 dark:text-gray-400"><label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-900 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"><span>Select a file</span><input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} /></label><p className="pl-1">or drag and drop</p></div><p className="text-xs text-gray-500">{file ? file.name : 'PNG, JPG, PDF up to 10MB'}</p></div></div></div><div><label className="text-sm font-medium">Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="e.g., Driving License" className="w-full mt-1 px-3 py-2 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300" /></div></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Cancel</button><button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-lg disabled:bg-primary-300" disabled={!file}>Upload</button></div></form></div></div>
    );
};

const AssignAssetModal: React.FC<{ onSave: (asset: Omit<AssignedAsset, 'id'>) => void, onClose: () => void }> = ({ onSave, onClose }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<'Laptop' | 'Vehicle' | 'Phone' | 'Other'>('Other');
    const [assignedDate, setAssignedDate] = useState(new Date().toISOString().split('T')[0]);
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave({ name, type, assignedDate }); };
    return (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}><div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md mx-4" onClick={e=>e.stopPropagation()}><form onSubmit={handleSubmit}><h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Assign New Asset</h2><div className="space-y-4"><input type="text" placeholder="Asset Name (e.g., Dell Latitude)" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300" /><select value={type} onChange={e => setType(e.target.value as any)} className="w-full px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300">{['Laptop', 'Vehicle', 'Phone', 'Other'].map(t=><option key={t}>{t}</option>)}</select><input type="date" value={assignedDate} onChange={e => setAssignedDate(e.target.value)} required className="w-full px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300" /></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Cancel</button><button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-lg">Assign</button></div></form></div></div>
    );
};


// --- Main Component ---

interface EmployeeInformationProps {
    user: User;
}

const EmployeeInformation: React.FC<EmployeeInformationProps> = ({ user }) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    
    // Modal states
    const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
    const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false);
    const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
    const [isAssignAssetModalOpen, setIsAssignAssetModalOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; onConfirm: () => void; title: string; message: string; confirmText?: string; }>({ isOpen: false, onConfirm: () => {}, title: '', message: '' });
    
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' } | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [emps, depts, jobs] = await Promise.all([
                apiService.getEmployees(),
                apiService.getDepartments(),
                apiService.getJobPositions(),
            ]);
            setEmployees(emps);
            setDepartments(depts);
            setJobPositions(jobs);
        } catch (error) {
            console.error("Failed to fetch employee information data", error);
            setToast({ show: true, message: "Failed to load data.", type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const employeesToShow = getVisibleEmployees(user, employees);
    
    const filteredEmployees = employeesToShow.filter(emp => 
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        if (!isLoading && (!selectedEmployee || !filteredEmployees.some(e => e.id === selectedEmployee.id))) {
            setSelectedEmployee(filteredEmployees.length > 0 ? filteredEmployees[0] : null);
        }
    }, [user, employeesToShow, searchQuery, isLoading, selectedEmployee, filteredEmployees]);
    
    useEffect(() => {
        if (selectedEmployee) {
            const updatedSelected = employees.find(e => e.id === selectedEmployee.id);
            setSelectedEmployee(updatedSelected || null);
        }
    }, [employees, selectedEmployee]);

    const handleSelectEmployee = (employee: Employee) => {
        setSelectedEmployee(employee);
        setActiveTab('overview');
    }

    const canManageSelected = selectedEmployee && (user.role === Role.HRAdmin || (user.role === Role.Manager && selectedEmployee.managerId === user.id));

    // --- Data Handlers ---
    const handleUpdateAndRefresh = async (updater: (prev: Employee[]) => Employee[]) => {
        await apiService.updateEmployees(updater);
        fetchData();
    };
    
    const handleSaveEmployee = (newEmployeeData: Omit<Employee, 'id' | 'photoUrl' | 'skills' | 'records' | 'benefits' | 'accessLogs'>) => {
        const newEmployee: Employee = { ...newEmployeeData, id: `E${Date.now()}`, photoUrl: `https://picsum.photos/seed/${newEmployeeData.name.split(' ')[0]}/100/100`, skills: [], records: [], benefits: [], accessLogs: [] };
        handleUpdateAndRefresh(prev => [...prev, newEmployee]);
        setIsAddEmployeeModalOpen(false);
    };

    const handleDeleteEmployee = (employeeId: string) => {
        const employeeToDelete = employees.find(e => e.id === employeeId);
        if (!employeeToDelete) return;
        setConfirmModal({ isOpen: true, title: 'Delete Employee', message: `Delete ${employeeToDelete.name}? This cannot be undone.`, confirmText: "Confirm Delete", onConfirm: () => { handleUpdateAndRefresh(prev => prev.filter(emp => emp.id !== employeeId)); setConfirmModal({ isOpen: false, onConfirm: () => {}, title: '', message: '' }); } });
    };

    const handleSaveRecord = (newRecordData: Omit<EmployeeRecord, 'id' | 'addedBy'>) => {
        if (!selectedEmployee) return;
        const newRecord: EmployeeRecord = { ...newRecordData, id: `R${Date.now()}`, addedBy: user.name,  };
        handleUpdateAndRefresh(prev => prev.map(emp => emp.id === selectedEmployee.id ? { ...emp, records: [newRecord, ...emp.records] } : emp ));
        setIsAddRecordModalOpen(false);
    };

    const handleDeleteRecord = (recordId: string) => {
        if (!selectedEmployee) return;
        setConfirmModal({ isOpen: true, title: 'Delete Record', message: 'Are you sure?', confirmText: "Delete", onConfirm: () => { handleUpdateAndRefresh(prev => prev.map(emp => emp.id === selectedEmployee.id ? { ...emp, records: emp.records.filter(rec => rec.id !== recordId) } : emp )); setConfirmModal({ isOpen: false, onConfirm: () => {}, title: '', message: '' }); } });
    };

    const handleSaveDocument = (docData: Omit<EmployeeDocument, 'id' | 'uploadDate'>) => {
        if (!selectedEmployee) return;
        const newDoc: EmployeeDocument = { ...docData, id: `doc-${Date.now()}`, uploadDate: new Date().toLocaleDateString('en-CA'), };
        handleUpdateAndRefresh(p => p.map(e => e.id === selectedEmployee.id ? {...e, documents: [...(e.documents || []), newDoc]} : e));
        setIsUploadDocModalOpen(false);
    };

    const handleDeleteDocument = (docId: string) => {
        if (!selectedEmployee) return;
        setConfirmModal({ isOpen: true, title: 'Delete Document', message: 'Are you sure?', confirmText: "Delete", onConfirm: () => { handleUpdateAndRefresh(p => p.map(e => e.id === selectedEmployee.id ? {...e, documents: e.documents.filter(d=>d.id !== docId)}:e)); setConfirmModal({ isOpen: false, onConfirm: () => {}, title: '', message: '' }); }});
    };

    const handleSaveAsset = (assetData: Omit<AssignedAsset, 'id'>) => {
        if (!selectedEmployee) return;
        const newAsset: AssignedAsset = { ...assetData, id: `ast-${Date.now()}` };
        handleUpdateAndRefresh(p => p.map(e => e.id === selectedEmployee.id ? {...e, assignedAssets: [...(e.assignedAssets || []), newAsset]} : e));
        setIsAssignAssetModalOpen(false);
    };

    const handleDeleteAsset = (assetId: string) => {
        if (!selectedEmployee) return;
        setConfirmModal({ isOpen: true, title: 'Unassign Asset', message: 'Are you sure?', confirmText: "Unassign", onConfirm: () => { handleUpdateAndRefresh(p => p.map(e => e.id === selectedEmployee.id ? {...e, assignedAssets: e.assignedAssets.filter(d=>d.id !== assetId)}:e)); setConfirmModal({ isOpen: false, onConfirm: () => {}, title: '', message: '' }); }});
    };
    
    // --- CSV Handlers ---
    const CSV_HEADERS = ['name','gender','email','phone','address','jobTitle','department','employmentType','basicSalary','emergencyContactName','emergencyContactPhone','dateOfHire','employmentStatus','contractType'];
    const downloadCSV = (content: string, filename: string) => { const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement("a"); const url = URL.createObjectURL(blob); link.setAttribute("href", url); link.setAttribute("download", filename); link.style.visibility = 'hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link); };
    const handleDownloadTemplate = () => { downloadCSV(CSV_HEADERS.join(','), 'employee_import_template.csv'); setToast({ show: true, message: "Template downloaded.", type: 'success' }); };
    const handleExport = () => { const escapeCsvCell = (cell: any) => { const str = String(cell ?? ''); if (str.includes(',') || str.includes('"') || str.includes('\n')) return `"${str.replace(/"/g, '""')}"`; return str; }; const csvRows = employeesToShow.map(emp => [emp.name, emp.gender, emp.email, emp.phone, emp.address, emp.jobTitle, emp.department, emp.employmentType, emp.basicSalary, emp.emergencyContact.name, emp.emergencyContact.phone, emp.dateOfHire, emp.employmentStatus, emp.contractType].map(escapeCsvCell).join(',')); const csvContent = [CSV_HEADERS.join(','), ...csvRows].join('\n'); downloadCSV(csvContent, 'employee_export.csv'); setToast({ show: true, message: "Employee data exported.", type: 'success' }); };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = (event) => { try { const text = event.target?.result as string; const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== ''); if (lines.length < 2) { setToast({ show: true, message: 'CSV must have a header and data.', type: 'error' }); return; } if (lines[0].split(',').map(h => h.trim()).join(',') !== CSV_HEADERS.join(',')) { setToast({ show: true, message: 'Invalid CSV template format.', type: 'error' }); return; } const newEmployees: Employee[] = lines.slice(1).map((line, index) => { const data = line.split(','); const empData = CSV_HEADERS.reduce((obj, nextKey, idx) => { obj[nextKey] = data[idx]?.trim().replace(/"/g, ''); return obj; }, {} as any); return { id: `E${Date.now()}${index}`, name: empData.name, photoUrl: `https://picsum.photos/seed/${empData.name.split(' ')[0]}/100/100`, gender: (empData.gender === 'Male' || empData.gender === 'Female') ? empData.gender : 'Female', jobTitle: empData.jobTitle, department: empData.department, email: empData.email, phone: empData.phone, address: empData.address, emergencyContact: { name: empData.emergencyContactName, phone: empData.emergencyContactPhone }, employmentType: (empData.employmentType as any) || 'Permanent', employmentStatus: (empData.employmentStatus as EmploymentStatus) || EmploymentStatus.Active, dateOfHire: empData.dateOfHire || new Date().toISOString().split('T')[0], contractType: (empData.contractType as ContractType) || ContractType.FullTime, probation: { status: 'Pending' }, basicSalary: Number(empData.basicSalary) || 0, payFrequency: PayFrequency.Monthly, annualLeaveBalance: 18, skills: [], records: [], benefits: [], accessLogs: [], documents: [], promotionHistory: [], transferHistory: [], editHistory: [], assignedAssets: [], }; }); handleUpdateAndRefresh(prev => [...prev, ...newEmployees]); setToast({ show: true, message: `${newEmployees.length} employees imported!`, type: 'success' }); } catch (error) { setToast({ show: true, message: 'Failed to import. Check file format.', type: 'error' }); } }; reader.readAsText(file); if (e.target) e.target.value = ''; };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div></div>;
    }

    return (
        <div>
            {toast?.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Company Directory</h1>
            <p className="text-gray-600 dark:text-gray-400">View and manage employee profiles and records.</p>
            
            <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-1 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                    <CardHeader title="Employee List">
                         {user.role === Role.HRAdmin && (
                             <div className="flex items-center gap-1">
                                <button onClick={handleDownloadTemplate} title="Download CSV Template" className="p-2 text-gray-500 hover:text-primary-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><FileDownIcon className="w-5 h-5"/></button>
                                <button onClick={() => fileInputRef.current?.click()} title="Import from CSV" className="p-2 text-gray-500 hover:text-primary-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><FileUpIcon className="w-5 h-5"/></button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv" />
                                <button onClick={() => setIsAddEmployeeModalOpen(true)} className="flex items-center gap-1 pl-2 pr-3 py-1.5 bg-primary-600 text-white text-xs font-semibold rounded-lg shadow-md hover:bg-primary-700"><PlusIcon className="w-4 h-4"/> Add New</button>
                            </div>
                         )}
                    </CardHeader>

                    <div className="flex items-center gap-2 mb-4">
                        <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                         <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-md p-1"><button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-primary-600' : 'text-gray-400'}`}><ListIcon className="w-5 h-5"/></button><button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-primary-600' : 'text-gray-400'}`}><GridIcon className="w-5 h-5"/></button></div>
                    </div>

                    <div className="h-[calc(100vh-25rem)] overflow-y-auto pr-2">
                        {viewMode === 'list' ? (
                            <div className="space-y-3">
                                {filteredEmployees.map(emp => (
                                    <div key={emp.id} onClick={() => handleSelectEmployee(emp)} className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${emp.id === selectedEmployee?.id ? 'bg-primary-100 dark:bg-primary-800/50' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                                        <div className="flex items-center overflow-hidden"><img src={emp.photoUrl} alt={emp.name} className="w-10 h-10 rounded-full flex-shrink-0" /><div className="ml-3 truncate"><p className="font-semibold text-gray-800 dark:text-white truncate">{emp.name}</p><p className="text-sm text-gray-500 dark:text-gray-400 truncate">{emp.jobTitle}</p></div></div>
                                        {user.role === Role.HRAdmin && (<button onClick={(e) => { e.stopPropagation(); handleDeleteEmployee(emp.id); }} className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 ml-2"><Trash2Icon className="w-4 h-4"/></button>)}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {filteredEmployees.map(emp => <EmployeeGridCard key={emp.id} employee={emp} onSelect={() => handleSelectEmployee(emp)} isSelected={emp.id === selectedEmployee?.id} /> )}
                            </div>
                        )}
                         {filteredEmployees.length === 0 && (<div className="text-center py-10 text-gray-500"><FileTextIcon className="w-12 h-12 mx-auto text-gray-400" /><p className="mt-2 font-semibold">No employees found</p><p className="text-sm">Try adjusting your search query.</p></div>)}
                    </div>
                </div>

                <div className="xl:col-span-2">
                    {selectedEmployee ? (
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md">
                        <div className="p-6 flex flex-col md:flex-row items-center md:items-start gap-6 border-b border-gray-200 dark:border-gray-700">
                            <img src={selectedEmployee.photoUrl} alt={selectedEmployee.name} className="w-24 h-24 rounded-full shadow-lg flex-shrink-0" />
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-300">{selectedEmployee.name}</h2>
                                <p className="text-gray-600 dark:text-gray-300">{selectedEmployee.jobTitle} - {selectedEmployee.department}</p>
                                <span className="mt-2 inline-block bg-green-200 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full dark:bg-green-700 dark:text-green-200">{selectedEmployee.employmentStatus}</span>
                            </div>
                            {user.role === Role.HRAdmin && <button onClick={handleExport} className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg shadow-md hover:bg-green-700"><FileDownIcon className="w-4 h-4"/> Export All</button>}
                        </div>

                        <div className="border-b border-gray-200 dark:border-gray-700 px-6"><nav className="-mb-px flex space-x-6 overflow-x-auto">
                            <TabButton label="Overview" icon={ContactIcon} isActive={activeTab==='overview'} onClick={()=>setActiveTab('overview')} />
                            <TabButton label="Records" icon={FileTextIcon} isActive={activeTab==='records'} onClick={()=>setActiveTab('records')} />
                            <TabButton label="Documents" icon={FileUpIcon} isActive={activeTab==='documents'} onClick={()=>setActiveTab('documents')} />
                            <TabButton label="Assets" icon={BriefcaseIcon} isActive={activeTab==='assets'} onClick={()=>setActiveTab('assets')} />
                            {user.role === Role.HRAdmin && <TabButton label="Access Logs" icon={FileClockIcon} isActive={activeTab==='logs'} onClick={()=>setActiveTab('logs')} />}
                        </nav></div>

                        <div className="p-6 min-h-[400px]">
                            {activeTab === 'overview' && <OverviewTab employee={selectedEmployee} allEmployees={employees} />}
                            {activeTab === 'records' && <RecordsTab selectedEmployee={selectedEmployee} user={user} canManage={!!canManageSelected} onAdd={()=>setIsAddRecordModalOpen(true)} onDelete={handleDeleteRecord} />}
                            {activeTab === 'documents' && <DocumentsTab selectedEmployee={selectedEmployee} canManage={!!canManageSelected} onAdd={()=>setIsUploadDocModalOpen(true)} onDelete={handleDeleteDocument} />}
                            {activeTab === 'assets' && <AssetsTab selectedEmployee={selectedEmployee} canManage={!!canManageSelected} onAdd={()=>setIsAssignAssetModalOpen(true)} onDelete={handleDeleteAsset} />}
                            {activeTab === 'logs' && user.role === Role.HRAdmin && <AccessLogsTab selectedEmployee={selectedEmployee} />}
                        </div>
                    </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md text-center h-full flex flex-col justify-center items-center">
                            <UsersIcon className="mx-auto h-12 w-12 text-gray-400"/><p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Select an employee to view their details.</p>{user.role === Role.Manager && <p className="text-sm text-gray-500">You can view employees in your department.</p>}
                        </div>
                    )}
                </div>
            </div>
            
            {confirmModal.isOpen && <ConfirmationModal onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(p=>({...p,isOpen:false}))} title={confirmModal.title} message={confirmModal.message} confirmText={confirmModal.confirmText} />}
            {isAddEmployeeModalOpen && <AddEmployeeModal onClose={() => setIsAddEmployeeModalOpen(false)} onSave={handleSaveEmployee} departments={departments} jobPositions={jobPositions} />}
            {isAddRecordModalOpen && selectedEmployee && <AddRecordModal onClose={() => setIsAddRecordModalOpen(false)} onSave={handleSaveRecord} />}
            {isUploadDocModalOpen && selectedEmployee && <DocumentUploadModal onClose={() => setIsUploadDocModalOpen(false)} onSave={handleSaveDocument} />}
            {isAssignAssetModalOpen && selectedEmployee && <AssignAssetModal onClose={() => setIsAssignAssetModalOpen(false)} onSave={handleSaveAsset} />}
        </div>
    );
};

export default EmployeeInformation;
