import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { User, Employee, EmployeeDocument } from '../types';
import { ContactIcon, CalendarIcon, DollarSignIcon, FileUpIcon, XIcon, Edit3Icon, FileTextIcon, Trash2Icon } from './icons';
import { apiService } from '../services/apiService';

const PersonalInfoModal: React.FC<{ employee: Employee, onSave: (updatedData: Partial<Employee>) => void, onClose: () => void }> = ({ employee, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        phone: employee.phone,
        address: employee.address,
        emergencyContactName: employee.emergencyContact.name,
        emergencyContactPhone: employee.emergencyContact.phone,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            phone: formData.phone,
            address: formData.address,
            emergencyContact: { name: formData.emergencyContactName, phone: formData.emergencyContactPhone }
        });
    };
    
    return (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md mx-4 transform transition-all" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Update Personal Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full mt-1 px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full mt-1 px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                        <fieldset className="pt-2 border-t border-gray-200 dark:border-gray-700">
                             <legend className="text-sm font-semibold text-gray-700 dark:text-gray-300">Emergency Contact</legend>
                             <div className="space-y-2 mt-2">
                                <input type="text" name="emergencyContactName" placeholder="Name" value={formData.emergencyContactName} onChange={handleChange} className="w-full px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                <input type="tel" name="emergencyContactPhone" placeholder="Phone" value={formData.emergencyContactPhone} onChange={handleChange} className="w-full px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                             </div>
                        </fieldset>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg shadow-md hover:bg-primary-600">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DocumentUploadModal: React.FC<{ onSave: (doc: Omit<EmployeeDocument, 'id' | 'uploadDate'>) => void, onClose: () => void }> = ({ onSave, onClose }) => {
    const [file, setFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files) {
            setFile(e.target.files[0]);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!file) {
            alert('Please select a file to upload.');
            return;
        }
        onSave({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            description: description || 'No description',
        });
    };

    return (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md mx-4 transform transition-all" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Upload Document</h2>
                    <div className="space-y-4">
                        <div>
                             <label className="text-sm font-medium text-gray-700 dark:text-gray-300">File</label>
                             <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <FileUpIcon className="mx-auto h-12 w-12 text-gray-400"/>
                                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-900 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                                            <span>Select a file</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{file ? file.name : 'PNG, JPG, PDF up to 10MB'}</p>
                                </div>
                             </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="e.g., Medical slip for sick leave" className="w-full mt-1 px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                    </div>
                     <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg shadow-md hover:bg-primary-600 disabled:bg-primary-300" disabled={!file}>Upload File</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const ServiceCard: React.FC<{ icon: React.ElementType, title: string, children: React.ReactNode, actions?: React.ReactNode, footer?: React.ReactNode }> = ({ icon: Icon, title, children, actions, footer }) => (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md flex flex-col">
        <div className="flex items-start text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            <Icon className="w-8 h-8 mr-4 text-primary-500 flex-shrink-0" />
            <h3 className="flex-grow">{title}</h3>
            {actions && <div className="flex-shrink-0">{actions}</div>}
        </div>
        <div className="flex-grow text-gray-600 dark:text-gray-400 text-sm">
            {children}
        </div>
        {footer && <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">{footer}</div>}
    </div>
);


const EmployeeSelfService: React.FC<{ user: User }> = ({ user }) => {
    const [employeeProfile, setEmployeeProfile] = useState<Employee | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const employees = await apiService.getEmployees();
            const profile = employees.find(e => e.id === user.id);
            setEmployeeProfile(profile || null);
        } catch (error) {
            console.error("Failed to fetch employee profile", error);
        } finally {
            setIsLoading(false);
        }
    }, [user.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUpdateAndRefresh = async (updater: (prev: Employee[]) => Employee[]) => {
        await apiService.updateEmployees(updater);
        fetchData();
    };

    const handleSaveInfo = (updatedData: Partial<Employee>) => {
        handleUpdateAndRefresh(prevEmployees => prevEmployees.map(emp => 
            emp.id === user.id ? { ...emp, ...updatedData } : emp
        ));
        setIsInfoModalOpen(false);
    };

    const handleSaveDocument = (docData: Omit<EmployeeDocument, 'id' | 'uploadDate'>) => {
        if (!employeeProfile) return;

        const newDocument: EmployeeDocument = {
            ...docData,
            id: `doc-${Date.now()}`,
            uploadDate: new Date().toLocaleDateString('en-CA'),
        };

        handleUpdateAndRefresh(prevEmployees => prevEmployees.map(emp => {
            if (emp.id === user.id) {
                const updatedDocuments = [...(emp.documents || []), newDocument];
                return { ...emp, documents: updatedDocuments };
            }
            return emp;
        }));
        setIsUploadModalOpen(false);
    };

    const handleDeleteDocument = (id: string) => {
        if (!employeeProfile) return;

        handleUpdateAndRefresh(prevEmployees => prevEmployees.map(emp => {
            if (emp.id === user.id) {
                const updatedDocuments = (emp.documents || []).filter(doc => doc.id !== id);
                return { ...emp, documents: updatedDocuments };
            }
            return emp;
        }));
    };

    if(isLoading) {
        return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div></div>;
    }

    if(!employeeProfile) {
        return <div className="text-center p-8">Could not load your employee profile.</div>;
    }

    return (
        <div className="relative min-h-full">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Employee Self-Service</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your information, requests, and documents.</p>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <ServiceCard 
                    icon={ContactIcon} 
                    title="Personal Information"
                    actions={<button onClick={() => setIsInfoModalOpen(true)} className="p-1.5 text-gray-500 hover:text-primary-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><Edit3Icon className="w-5 h-5"/></button>}
                >
                    <div className="space-y-2">
                        <p><span className="font-semibold text-gray-600 dark:text-gray-300">Email:</span> {employeeProfile.email}</p>
                        <p><span className="font-semibold text-gray-600 dark:text-gray-300">Phone:</span> {employeeProfile.phone}</p>
                        <p><span className="font-semibold text-gray-600 dark:text-gray-300">Address:</span> {employeeProfile.address}</p>
                        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                            <p className="font-semibold text-gray-600 dark:text-gray-300">Emergency Contact:</p>
                            <p className="pl-2">{employeeProfile.emergencyContact.name} ({employeeProfile.emergencyContact.phone})</p>
                        </div>
                    </div>
                </ServiceCard>

                <ServiceCard 
                    icon={FileUpIcon} 
                    title="Document Hub"
                    footer={<button onClick={() => setIsUploadModalOpen(true)} className="w-full px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg shadow-md hover:bg-primary-600 transition-colors">Upload Document</button>}
                >
                    <p className="mb-3">Upload required documents like certifications or medical slips.</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {employeeProfile.documents && employeeProfile.documents.length > 0 ? employeeProfile.documents.map(doc => (
                            <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <FileTextIcon className="w-6 h-6 text-gray-500 flex-shrink-0" />
                                    <div className="overflow-hidden">
                                        <p className="font-semibold text-sm text-gray-800 dark:text-white truncate" title={doc.fileName}>{doc.fileName}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{doc.description}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteDocument(doc.id)} className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900 ml-2 flex-shrink-0">
                                    <Trash2Icon className="w-4 h-4" />
                                </button>
                            </div>
                        )) : <p className="text-center text-gray-500 py-8">No documents uploaded.</p>}
                    </div>
                </ServiceCard>

                <ServiceCard icon={CalendarIcon} title="Leave Requests">
                    <p className="mb-4">Apply for annual leave, sick leave, and other leave types. View your current balance and the status of your past requests.</p>
                    <Link to="/leave-attendance" className="block text-center mt-auto px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-colors">
                        Go to Leave & Attendance
                    </Link>
                </ServiceCard>

                <ServiceCard icon={DollarSignIcon} title="Payslip Downloads">
                     <p className="mb-4">Access and download your official monthly payslips. View detailed breakdowns of your earnings and deductions for any pay period.</p>
                     <Link to="/payroll" className="block text-center mt-auto px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-colors">
                        View My Payslips
                    </Link>
                </ServiceCard>

            </div>
            
            {isInfoModalOpen && <PersonalInfoModal employee={employeeProfile} onClose={() => setIsInfoModalOpen(false)} onSave={handleSaveInfo} />}
            {isUploadModalOpen && <DocumentUploadModal onClose={() => setIsUploadModalOpen(false)} onSave={handleSaveDocument} />}
        </div>
    );
};

export default EmployeeSelfService;