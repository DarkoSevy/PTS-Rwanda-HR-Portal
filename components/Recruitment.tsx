import React, { useState, useCallback } from 'react';
import { UserPlusIcon, SparklesIcon, ClipboardCopyIcon, SquareIcon, CheckSquareIcon } from './icons';
import { apiService } from '../services/apiService';
import { JobDescription, ChecklistItem } from '../types';

const vacancies = [
    { title: 'Heavy-Duty Truck Driver', applicants: 12, status: 'Open' },
    { title: 'Logistics Coordinator', applicants: 25, status: 'Open' },
    { title: 'Fleet Mechanic', applicants: 8, status: 'Closed' },
];

const Recruitment: React.FC = () => {
    // State for Interview Question Generator
    const [iqJobTitle, setIqJobTitle] = useState('');
    const [questions, setQuestions] = useState<string[]>([]);
    const [isIqLoading, setIsIqLoading] = useState(false);
    const [iqError, setIqError] = useState<string | null>(null);
    
    // State for Job Description Generator
    const [jdJobTitle, setJdJobTitle] = useState('');
    const [jdKeywords, setJdKeywords] = useState('');
    const [jobDescription, setJobDescription] = useState<JobDescription | null>(null);
    const [isJdLoading, setIsJdLoading] = useState(false);
    const [jdError, setJdError] = useState<string | null>(null);

    // State for Checklist Generator
    const [checklistJobTitle, setChecklistJobTitle] = useState('');
    const [checklistType, setChecklistType] = useState<'Onboarding' | 'Offboarding'>('Onboarding');
    const [generatedChecklist, setGeneratedChecklist] = useState<ChecklistItem[]>([]);
    const [isChecklistLoading, setIsChecklistLoading] = useState(false);
    const [checklistError, setChecklistError] = useState<string | null>(null);


    const generateQuestions = useCallback(async () => {
        if (!iqJobTitle) {
            setIqError('Please enter a job title.');
            return;
        }
        setIsIqLoading(true);
        setIqError(null);
        setQuestions([]);
        try {
            const result = await apiService.generateInterviewQuestions(iqJobTitle);
            setQuestions(result);
        } catch (e: any) {
            setIqError('Failed to generate questions. ' + (e.message || 'Please try again.'));
        } finally {
            setIsIqLoading(false);
        }
    }, [iqJobTitle]);

    const generateJobDescription = useCallback(async () => {
        if (!jdJobTitle) {
            setJdError('Please enter a job title.');
            return;
        }
        setIsJdLoading(true);
        setJdError(null);
        setJobDescription(null);
        try {
            const result = await apiService.generateJobDescription(jdJobTitle, jdKeywords);
            setJobDescription(result);
        } catch (e: any) {
            setJdError('Failed to generate job description. ' + (e.message || 'Please try again.'));
        } finally {
            setIsJdLoading(false);
        }
    }, [jdJobTitle, jdKeywords]);

    const generateChecklist = useCallback(async () => {
        if (!checklistJobTitle) {
            setChecklistError('Please enter a job title.');
            return;
        }
        setIsChecklistLoading(true);
        setChecklistError(null);
        setGeneratedChecklist([]);
        try {
            const result = await apiService.generateChecklist(checklistJobTitle, checklistType);
            setGeneratedChecklist(result.map(text => ({ text, completed: false })));
        } catch (e: any) {
            setChecklistError('Failed to generate checklist. ' + (e.message || 'Please try again.'));
        } finally {
            setIsChecklistLoading(false);
        }
    }, [checklistJobTitle, checklistType]);

    const toggleChecklistItem = (index: number) => {
        setGeneratedChecklist(prev => 
            prev.map((item, i) => i === index ? { ...item, completed: !item.completed } : item)
        );
    };

    const copyChecklistToClipboard = () => {
        const textToCopy = generatedChecklist.map(item => `- [${item.completed ? 'x' : ' '}] ${item.text}`).join('\n');
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('Checklist copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };


    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Recruitment & Onboarding</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage vacancies, applicants, and streamline processes with AI tools.</p>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">Vacancy Announcements</h3>
                    <div className="space-y-3">
                        {vacancies.map((vacancy) => (
                            <div key={vacancy.title} className="flex justify-between items-center p-3 rounded-md bg-gray-50 dark:bg-gray-800">
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-white">{vacancy.title}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{vacancy.applicants} Applicants</p>
                                </div>
                                <span className={`text-sm font-semibold px-2 py-1 rounded-full ${vacancy.status === 'Open' ? 'text-blue-600 bg-blue-100 dark:bg-blue-800 dark:text-blue-200' : 'text-gray-600 bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}>{vacancy.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">AI Checklist Generator</h3>
                         <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                value={checklistJobTitle}
                                onChange={(e) => setChecklistJobTitle(e.target.value)}
                                placeholder="e.g., Fleet Mechanic"
                                className="flex-grow w-full px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-300"
                            />
                            <select value={checklistType} onChange={(e) => setChecklistType(e.target.value as 'Onboarding' | 'Offboarding')} className="px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-300">
                                <option>Onboarding</option>
                                <option>Offboarding</option>
                            </select>
                            <button onClick={generateChecklist} disabled={isChecklistLoading} className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg shadow-md hover:bg-primary-600 transition-colors disabled:bg-primary-300 disabled:cursor-not-allowed">
                                <SparklesIcon className="w-5 h-5"/>
                                <span>{isChecklistLoading ? 'Generating...' : 'Generate'}</span>
                            </button>
                        </div>
                        {checklistError && <p className="text-red-500 text-sm mt-2">{checklistError}</p>}
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg min-h-[200px]">
                            {generatedChecklist.length > 0 && (
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-semibold text-gray-800 dark:text-white">{checklistType} Checklist for {checklistJobTitle}</h4>
                                    <button onClick={copyChecklistToClipboard} className="p-1.5 text-gray-500 hover:text-primary-600 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" title="Copy to clipboard">
                                        <ClipboardCopyIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                            )}
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {isChecklistLoading ? (
                                    <div className="flex justify-center items-center h-full py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div></div>
                                ) : (
                                    generatedChecklist.map((item, index) => (
                                        <div key={index} onClick={() => toggleChecklistItem(index)} className="flex items-center gap-3 cursor-pointer group p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                                            {item.completed ? <CheckSquareIcon className="w-5 h-5 text-primary-500 flex-shrink-0"/> : <SquareIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 flex-shrink-0"/>}
                                            <span className={`text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>{item.text}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">AI Job Description Generator</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" value={jdJobTitle} onChange={(e) => setJdJobTitle(e.target.value)} placeholder="e.g., Presidential bus" className="w-full px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring focus:ring-primary-300"/>
                            <textarea value={jdKeywords} onChange={(e) => setJdKeywords(e.target.value)} placeholder="Optional: Key skills (e.g., cross-border)" rows={1} className="w-full px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring focus:ring-primary-300"/>
                        </div>
                        <button onClick={generateJobDescription} disabled={isJdLoading} className="mt-4 w-full px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg shadow-md hover:bg-primary-600 transition-colors disabled:bg-primary-300 disabled:cursor-not-allowed">
                            {isJdLoading ? 'Generating...' : 'Generate Description'}
                        </button>
                        {jdError && <p className="text-red-500 text-sm mt-2">{jdError}</p>}
                        {jobDescription && (
                            <div className="mt-4 space-y-4 h-48 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300">
                                <h4 className="text-lg font-bold text-gray-800 dark:text-white">{jobDescription.title}</h4>
                                <p className="mt-2 italic">{jobDescription.summary}</p>
                                <h5 className="font-semibold mt-4 mb-2 text-gray-800 dark:text-white">Responsibilities:</h5>
                                <ul className="list-disc list-inside space-y-1">{jobDescription.responsibilities.map((r, i) => <li key={i}>{r}</li>)}</ul>
                                <h5 className="font-semibold mt-4 mb-2 text-gray-800 dark:text-white">Qualifications:</h5>
                                <ul className="list-disc list-inside space-y-1">{jobDescription.qualifications.map((q, i) => <li key={i}>{q}</li>)}</ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-6 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">AI Interview Question Generator</h3>
                <div className="flex gap-2">
                    <input type="text" value={iqJobTitle} onChange={(e) => setIqJobTitle(e.target.value)} placeholder="e.g., Logistics Coordinator" className="flex-grow w-full px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring focus:ring-primary-300"/>
                    <button onClick={generateQuestions} disabled={isIqLoading} className="px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg shadow-md hover:bg-primary-600 transition-colors disabled:bg-primary-300 disabled:cursor-not-allowed">
                        {isIqLoading ? 'Generating...' : 'Generate'}
                    </button>
                </div>
                {iqError && <p className="text-red-500 text-sm mt-2">{iqError}</p>}
                <div className="mt-4 space-y-2 h-48 overflow-y-auto">
                    {questions.length > 0 && <ul className="list-decimal list-inside text-gray-600 dark:text-gray-300 space-y-2">{questions.map((q, index) => <li key={index}>{q}</li>)}</ul>}
                    {isIqLoading && <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div></div>}
                </div>
            </div>
        </div>
    );
};

export default Recruitment;