

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { User, Role, ComplianceDocument, EmployeeAcknowledgement, AcknowledgementStatus, DocumentCategory, Employee } from '../types';
import { FileTextIcon, CheckCircleIcon, FileSignatureIcon, PlusIcon, Trash2Icon, PencilIcon } from './icons';
import { apiService } from '../services/apiService';

// --- Helper Components ---
const TabButton: React.FC<{ label: string, isActive: boolean, onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
        isActive
        ? 'border-primary-500 text-primary-600 dark:text-primary-500'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 dark:hover:border-gray-600'
    }`}>
        {label}
    </button>
);

const Card: React.FC<{ title: string; children: React.ReactNode, actions?: React.ReactNode }> = ({ title, children, actions }) => (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
            {actions}
        </div>
        {children}
    </div>
);

const StatusPill: React.FC<{ status: AcknowledgementStatus }> = ({ status }) => {
    const isSigned = status === AcknowledgementStatus.Acknowledged;
    const Icon = isSigned ? CheckCircleIcon : FileSignatureIcon;
    const colorClasses = isSigned 
        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
    
    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${colorClasses}`}>
            <Icon className="w-3.5 h-3.5" />
            {status}
        </span>
    );
};

// --- Employee View ---
const SignatureModal: React.FC<{ document: ComplianceDocument, onClose: () => void, onSign: (documentId: string) => void }> = ({ document, onClose, onSign }) => (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-2xl mx-4 transform transition-all" onClick={e => e.stopPropagation()}>
            <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{document.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Version {document.version} | Category: {document.category}</p>
                <div className="mt-6 p-4 h-64 overflow-y-auto bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold mb-2">Document Content (Placeholder)</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{document.description}</p>
                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. ... [Full document text would appear here] ...
                    </p>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                    By clicking "Acknowledge & Sign", you are electronically signing this document and confirming you have read and understood its contents.
                </div>
            </div>
            <div className="flex justify-end gap-3 p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Cancel</button>
                <button type="button" onClick={() => onSign(document.id)} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg shadow-md hover:bg-primary-600">
                    <FileSignatureIcon className="w-5 h-5" />
                    Acknowledge & Sign
                </button>
            </div>
        </div>
    </div>
);

const EmployeeView: React.FC<{
    user: User;
    documents: ComplianceDocument[];
    acknowledgements: EmployeeAcknowledgement[];
    onSign: (documentId: string) => void;
}> = ({ user, documents, acknowledgements, onSign }) => {
    const [signingDocument, setSigningDocument] = useState<ComplianceDocument | null>(null);

    const myDocs = useMemo(() => {
        // Simplified assignment logic for this example
        return documents.map(doc => {
            const ack = acknowledgements.find(a => a.employeeId === user.id && a.documentId === doc.id);
            return {
                ...doc,
                status: ack ? ack.status : AcknowledgementStatus.Pending,
                acknowledgedDate: ack?.acknowledgedDate,
            };
        });
    }, [documents, acknowledgements, user.id]);

    const actionRequiredDocs = myDocs.filter(d => d.status === AcknowledgementStatus.Pending);
    const completedDocs = myDocs.filter(d => d.status !== AcknowledgementStatus.Pending);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Action Required">
                <div className="space-y-3">
                    {actionRequiredDocs.length > 0 ? actionRequiredDocs.map(doc => (
                        <div key={doc.id} className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div className="flex-grow">
                                <h4 className="font-semibold text-gray-800 dark:text-white">{doc.name}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Needs your signature</p>
                            </div>
                            <button onClick={() => setSigningDocument(doc)} className="px-3 py-1.5 bg-primary-500 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-primary-600 w-full sm:w-auto flex-shrink-0">
                                View & Sign
                            </button>
                        </div>
                    )) : <p className="text-center text-gray-500 py-8">No documents require your attention.</p>}
                </div>
            </Card>
            <Card title="Completed Documents">
                 <div className="space-y-3">
                    {completedDocs.length > 0 ? completedDocs.map(doc => (
                        <div key={doc.id} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
                            <div>
                                <h4 className="font-semibold text-gray-800 dark:text-white">{doc.name}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Signed on {doc.acknowledgedDate}</p>
                            </div>
                            <StatusPill status={doc.status} />
                        </div>
                    )) : <p className="text-center text-gray-500 py-8">You haven't signed any documents yet.</p>}
                </div>
            </Card>
            {signingDocument && <SignatureModal document={signingDocument} onClose={() => setSigningDocument(null)} onSign={(docId) => { onSign(docId); setSigningDocument(null); }} />}
        </div>
    );
};

// --- HR Admin View ---
const HRAdminView: React.FC<{
    allEmployees: Employee[];
    documents: ComplianceDocument[];
    acknowledgements: EmployeeAcknowledgement[];
}> = ({ allEmployees, documents, acknowledgements }) => {
    const [activeTab, setActiveTab] = useState('status');

    const DocumentLibrary = () => (
        <div className="space-y-3">
            {documents.map(doc => (
                 <div key={doc.id} className="p-3 rounded-md bg-gray-50 dark:bg-gray-800">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-semibold text-gray-800 dark:text-white">{doc.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{doc.category} | Version {doc.version}</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="text-gray-500 hover:text-blue-500"><PencilIcon className="w-4 h-4"/></button>
                            <button className="text-gray-500 hover:text-red-500"><Trash2Icon className="w-4 h-4"/></button>
                        </div>
                    </div>
                 </div>
            ))}
        </div>
    );

    const ComplianceStatus = () => {
        const complianceData = useMemo(() => {
            return documents.map(doc => {
                // Simplified: assuming 'all' are assigned to everyone.
                const totalAssigned = allEmployees.length;
                const totalAcknowledged = acknowledgements.filter(a => a.documentId === doc.id && a.status === AcknowledgementStatus.Acknowledged).length;
                const completion = totalAssigned > 0 ? (totalAcknowledged / totalAssigned) * 100 : 0;
                return {
                    ...doc,
                    totalAssigned,
                    totalAcknowledged,
                    completion: Math.round(completion)
                };
            });
        }, [documents, acknowledgements, allEmployees]);

        return (
            <div className="space-y-4">
                {complianceData.map(data => (
                    <div key={data.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h4 className="font-bold text-gray-800 dark:text-white">{data.name}</h4>
                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 my-2">
                             <span>{data.totalAcknowledged} / {data.totalAssigned} Employees Signed</span>
                             <span className="font-semibold">{data.completion}% Complete</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${data.completion}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
         <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                 <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                        <TabButton label="Compliance Status" isActive={activeTab === 'status'} onClick={() => setActiveTab('status')} />
                        <TabButton label="Document Library" isActive={activeTab === 'library'} onClick={() => setActiveTab('library')} />
                    </nav>
                </div>
                <button className="flex items-center gap-1 px-2.5 py-1.5 bg-primary-500 text-white text-xs font-semibold rounded-lg shadow-md hover:bg-primary-600">
                    <PlusIcon className="w-4 h-4"/> Upload Document
                </button>
            </div>
            {activeTab === 'status' ? <ComplianceStatus /> : <DocumentLibrary />}
         </div>
    );
};


// --- Main Component ---
interface ComplianceProps {
    user: User;
}

const Compliance: React.FC<ComplianceProps> = ({ user }) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [complianceDocuments, setComplianceDocuments] = useState<ComplianceDocument[]>([]);
    const [employeeAcknowledgements, setEmployeeAcknowledgements] = useState<EmployeeAcknowledgement[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [emps, docs, acks] = await Promise.all([
                apiService.getEmployees(),
                apiService.getComplianceDocuments(),
                apiService.getEmployeeAcknowledgements(),
            ]);
            setEmployees(emps);
            setComplianceDocuments(docs);
            setEmployeeAcknowledgements(acks);
        } catch (error) {
            console.error("Failed to fetch compliance data", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSignDocument = async (documentId: string) => {
        const newAcknowledgement: EmployeeAcknowledgement = {
            employeeId: user.id,
            documentId: documentId,
            status: AcknowledgementStatus.Acknowledged,
            acknowledgedDate: new Date().toLocaleDateString('en-CA'),
        };

        await apiService.updateEmployeeAcknowledgements(prev => {
            const otherAcks = prev.filter(a => !(a.employeeId === user.id && a.documentId === documentId));
            return [...otherAcks, newAcknowledgement];
        });
        fetchData(); // Refresh state
    };
    
    const isHRAdmin = user.role === Role.HRAdmin;

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div></div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Compliance & Legal</h1>
            <p className="text-gray-600 dark:text-gray-400">
                {isHRAdmin ? 'Manage company-wide documents and track employee acknowledgement.' : 'Review and sign documents assigned to you by HR.'}
            </p>
            
            <div className="mt-6">
                {isHRAdmin
                    ? <HRAdminView allEmployees={employees} documents={complianceDocuments} acknowledgements={employeeAcknowledgements} />
                    : <EmployeeView user={user} documents={complianceDocuments} acknowledgements={employeeAcknowledgements} onSign={handleSignDocument} />
                }
            </div>
        </div>
    );
};

export default Compliance;