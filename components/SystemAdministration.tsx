

import React, { useState, useMemo, useEffect } from 'react';
import { Employee, Role, Module, Department, JobPosition } from '../types';
import { HistoryIcon, DatabaseIcon, ShieldCheckIcon, CheckCircleIcon } from './icons';

const Card: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">{title}</h3>
        {children}
    </div>
);

const Toast: React.FC<{ message: string; show: boolean; onClose: () => void }> = ({ message, show, onClose }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => onClose(), 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg animate-fade-in-up">
            <CheckCircleIcon className="w-5 h-5" />
            <span>{message}</span>
        </div>
    );
};


// Tab components
const AuditLogTab: React.FC<{ employees: Employee[] }> = ({ employees }) => {
    const allHistory = useMemo(() => {
        return employees
            .flatMap(emp => emp.editHistory ? emp.editHistory.map(log => ({ ...log, employeeName: emp.name })) : [])
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [employees]);

    return (
        <Card title="Global Audit Log">
            <div className="overflow-x-auto max-h-[60vh] pr-2">
                <table className="min-w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-3">Timestamp</th>
                            <th className="px-4 py-3">Editor</th>
                            <th className="px-4 py-3">Employee Affected</th>
                            <th className="px-4 py-3">Field Changed</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {allHistory.map((log, index) => (
                            <tr key={`${log.timestamp}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-4 py-3">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="px-4 py-3 font-medium">{log.editorName}</td>
                                <td className="px-4 py-3">{log.employeeName}</td>
                                <td className="px-4 py-3 text-primary-600 dark:text-primary-400 font-semibold">{log.field}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {allHistory.length === 0 && <p className="text-center py-8 text-gray-500">No edit history found across all employees.</p>}
            </div>
        </Card>
    );
};

const DataManagementTab: React.FC<{}> = () => {
    return (
        <Card title="Data Management">
            <div className="space-y-6">
                <div>
                    <h4 className="font-semibold text-lg mb-2">Bulk Status Update</h4>
                    <p className="text-sm text-gray-500 mb-4">Update the employment status for multiple users at once. (This is a conceptual feature).</p>
                    <div className="flex items-center gap-4 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                        <select className="flex-grow px-3 py-2 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300" disabled>
                            <option>Select employees to update...</option>
                        </select>
                        <select className="px-3 py-2 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300" disabled>
                            <option>Set Status To...</option>
                        </select>
                        <button className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg shadow-md disabled:opacity-50" disabled>Apply</button>
                    </div>
                </div>
            </div>
        </Card>
    );
};

const ConfigurationTab: React.FC<{
    rolePermissions: { [key in Role]: Module[] };
    setRolePermissions: (permissions: { [key in Role]: Module[] }) => void;
    onSave: () => void;
}> = ({ rolePermissions, setRolePermissions, onSave }) => {
    const [editablePermissions, setEditablePermissions] = useState(rolePermissions);

    const isDirty = JSON.stringify(rolePermissions) !== JSON.stringify(editablePermissions);

    useEffect(() => {
        setEditablePermissions(rolePermissions);
    }, [rolePermissions]);

    const handlePermissionChange = (role: Role, module: Module, isChecked: boolean) => {
        setEditablePermissions(prev => {
            const currentModules = new Set(prev[role]);
            if (isChecked) {
                currentModules.add(module);
            } else {
                currentModules.delete(module);
            }
            const sortedModules = Object.values(Module).filter(m => currentModules.has(m));
            return { ...prev, [role]: sortedModules };
        });
    };

    const handleSave = () => {
        setRolePermissions(editablePermissions);
        onSave();
    };

    const handleCancel = () => {
        setEditablePermissions(rolePermissions);
    };

    const nonEditableRoles = [Role.HRAdmin, Role.ITAdmin];

    return (
        <Card title="Roles & Permissions">
             <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th className="px-4 py-3 font-semibold text-left w-48">Role</th>
                            <th className="px-4 py-3 font-semibold text-left">Accessible Modules</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {Object.entries(editablePermissions).map(([role, modules]) => {
                            const isEditable = !nonEditableRoles.includes(role as Role);
                            return (
                                <tr key={role}>
                                    <td className="px-4 py-4 font-medium align-top">
                                        <p>{role}</p>
                                        {!isEditable && <p className="text-xs text-gray-400">(Read-only)</p>}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
                                            {Object.values(Module).map(module => (
                                                <label key={module} className={`flex items-center gap-2 ${isEditable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                                                        checked={modules.includes(module)}
                                                        disabled={!isEditable}
                                                        onChange={(e) => handlePermissionChange(role as Role, module, e.target.checked)}
                                                    />
                                                    <span className="text-gray-700 dark:text-gray-300">{module}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
             {isDirty && (
                <div className="mt-6 flex justify-end gap-3 p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 -mx-6 -mb-6 rounded-b-lg sticky bottom-0">
                    <button onClick={handleCancel} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg shadow-md hover:bg-primary-600">Save Changes</button>
                </div>
             )}
        </Card>
    );
};

interface SystemAdministrationProps {
    appState: { 
        employees: Employee[];
        departments: Department[];
        jobPositions: JobPosition[]; 
    };
    rolePermissions: { [key in Role]: Module[] };
    setRolePermissions: (permissions: { [key in Role]: Module[] }) => void;
}

const SystemAdministration: React.FC<SystemAdministrationProps> = ({ appState, rolePermissions, setRolePermissions }) => {
    const [activeTab, setActiveTab] = useState('config');
    const { employees } = appState;
    const [showToast, setShowToast] = useState(false);

    const tabs = [
        { id: 'config', name: 'Configuration', icon: ShieldCheckIcon },
        { id: 'audit', name: 'Audit Log', icon: HistoryIcon },
        { id: 'data', name: 'Data Management', icon: DatabaseIcon },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'audit': return <AuditLogTab employees={employees} />;
            case 'data': return <DataManagementTab />;
            case 'config': return <ConfigurationTab rolePermissions={rolePermissions} setRolePermissions={setRolePermissions} onSave={() => setShowToast(true)} />;
            default: return null;
        }
    };
    
    return (
        <div>
            <Toast message="Permissions updated successfully!" show={showToast} onClose={() => setShowToast(false)} />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">System Administration</h1>
            <p className="text-gray-600 dark:text-gray-400">High-level system management and monitoring tools for administrators.</p>

            <div className="mt-6">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                                    activeTab === tab.id
                                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 dark:hover:border-gray-600'
                                }`}>
                                <tab.icon className="w-5 h-5"/>
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="mt-6">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}

export default SystemAdministration;
