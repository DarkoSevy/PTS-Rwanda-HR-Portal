
import React, { useState } from 'react';
import { Department, JobPosition } from '../types';
import { NetworkIcon, PlusIcon, PencilIcon, Trash2Icon } from './icons';

interface OrganizationStructureProps {
    departments: Department[];
    setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
    jobPositions: JobPosition[];
    setJobPositions: React.Dispatch<React.SetStateAction<JobPosition[]>>;
}

const OrganizationStructure: React.FC<OrganizationStructureProps> = ({ departments, setDepartments, jobPositions, setJobPositions }) => {
    
    // In a real app, modals would be used for editing/adding.
    // For simplicity, we'll just show the management lists.

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Organization Structure</h1>
            <p className="text-gray-600 dark:text-gray-400">Define and manage company departments and job positions.</p>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Departments */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Departments</h3>
                        <button className="flex items-center gap-1 px-2.5 py-1.5 bg-primary-500 text-white text-xs font-semibold rounded-lg shadow-md hover:bg-primary-600">
                            <PlusIcon className="w-4 h-4"/> New
                        </button>
                    </div>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                        {departments.map(dept => (
                             <div key={dept.id} className="p-3 rounded-md bg-gray-50 dark:bg-gray-800">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-semibold text-gray-800 dark:text-white">{dept.name}</h4>
                                    <div className="flex gap-2">
                                        <button className="text-gray-500 hover:text-blue-500"><PencilIcon className="w-4 h-4"/></button>
                                        <button className="text-gray-500 hover:text-red-500"><Trash2Icon className="w-4 h-4"/></button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{dept.description}</p>
                             </div>
                        ))}
                    </div>
                </div>

                {/* Job Positions */}
                 <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Job Positions</h3>
                        <button className="flex items-center gap-1 px-2.5 py-1.5 bg-primary-500 text-white text-xs font-semibold rounded-lg shadow-md hover:bg-primary-600">
                            <PlusIcon className="w-4 h-4"/> New
                        </button>
                    </div>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                        {jobPositions.map(pos => {
                             const dept = departments.find(d => d.id === pos.departmentId);
                             return (
                                <div key={pos.id} className="p-3 rounded-md bg-gray-50 dark:bg-gray-800">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-semibold text-gray-800 dark:text-white">{pos.title}</h4>
                                        <div className="flex gap-2">
                                            <button className="text-gray-500 hover:text-blue-500"><PencilIcon className="w-4 h-4"/></button>
                                            <button className="text-gray-500 hover:text-red-500"><Trash2Icon className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Department: {dept?.name || 'N/A'}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizationStructure;
