
import React, { useState, useCallback, useEffect } from 'react';
import { Role, Skill, Employee, TalentAnalysis, User, TargetRole } from '../types';
import { SparklesIcon, UsersIcon, XIcon, PlusIcon, ClipboardSearchIcon } from './icons';
import { geminiService } from '../services/geminiService';
import { getVisibleEmployees } from './utils';
import { mockSkills, allSkillsList } from '../data';

// --- MOCK DATA --- //
const mockTargetRoles: TargetRole[] = [
    { id: 'TR1', name: 'Senior Logistics Lead', requiredSkills: [mockSkills.logistics, mockSkills.leadership, mockSkills.communication, mockSkills.customer] },
    { id: 'TR2', name: 'Specialized Cross-Border Driver', requiredSkills: [mockSkills.driving, mockSkills.crossborder, mockSkills.safety, mockSkills.maintenance] },
    { id: 'TR3', name: 'Refrigerated Goods Specialist', requiredSkills: [mockSkills.driving, mockSkills.refrigerated, mockSkills.customer, mockSkills.safety] }
];

// --- HELPER COMPONENTS --- //
const Card: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode, className?: string }> = ({ title, icon: Icon, children, className }) => (
    <div className={`bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md ${className}`}>
        <div className="flex items-center text-xl font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
            <Icon className="w-6 h-6 mr-3 text-primary-500" />
            <h3>{title}</h3>
        </div>
        {children}
    </div>
);

const SkillTag: React.FC<{ skill: Skill; onRemove?: () => void }> = ({ skill, onRemove }) => {
    const categoryColor = {
        Technical: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        Soft: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        Language: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    };
    return (
        <div className={`flex items-center text-sm font-medium px-3 py-1 rounded-full ${categoryColor[skill.category]}`}>
            {skill.name}
            {onRemove && (
                <button onClick={onRemove} className="ml-2 -mr-1 p-0.5 rounded-full hover:bg-black/10">
                    <XIcon className="w-3 h-3"/>
                </button>
            )}
        </div>
    );
};

const TalentFinder: React.FC<{employees: Employee[]}> = ({ employees }) => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<TalentAnalysis | null>(null);

    const handleFindTalent = useCallback(async () => {
        if (!query) return;
        setIsLoading(true);
        setError(null);
        setResults(null);
        try {
            const res = await geminiService.findTalent(query, employees);
            setResults(res);
        } catch (e: any) {
            setError(e.message || "An error occurred while searching for talent.");
        } finally {
            setIsLoading(false);
        }
    }, [query, employees]);
    
    return (
        <Card title="AI Talent Finder" icon={SparklesIcon}>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Describe the skills you're looking for, and our AI will find the best-matched talent in the organization.</p>
            <textarea
                value={query}
                onChange={e => setQuery(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-gray-700 bg-gray-50 border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="e.g., A driver with experience in cross-border transport and handling refrigerated trucks..."
            />
            <button onClick={handleFindTalent} disabled={isLoading || !query} className="mt-3 w-full flex justify-center items-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 transition-colors disabled:bg-primary-400 disabled:cursor-not-allowed">
                <SparklesIcon className="w-5 h-5"/>
                {isLoading ? 'Analyzing...' : 'Find Talent with AI'}
            </button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <div className="mt-4 space-y-4">
                {isLoading && <div className="flex justify-center items-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div></div>}
                {results?.topCandidates && results.topCandidates.length > 0 && results.topCandidates.map(candidate => (
                     <div key={candidate.employeeId} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-primary-500">
                         <div className="flex justify-between items-start">
                             <h4 className="font-bold text-lg text-gray-800 dark:text-white">{candidate.employeeName}</h4>
                             <div className="text-right">
                                <p className="font-bold text-primary-500 text-xl">{candidate.matchPercentage}%</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Match</p>
                             </div>
                         </div>
                         <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">"{candidate.justification}"</p>
                         <div className="mt-3">
                            <h5 className="font-semibold text-sm text-green-600 dark:text-green-400">Matching Skills:</h5>
                            <p className="text-sm text-gray-500 dark:text-gray-300">{candidate.matchingSkills.join(', ') || 'None'}</p>
                         </div>
                          <div className="mt-2">
                            <h5 className="font-semibold text-sm text-yellow-600 dark:text-yellow-400">Skill Gaps:</h5>
                            <p className="text-sm text-gray-500 dark:text-gray-300">{candidate.missingSkills.join(', ') || 'None'}</p>
                         </div>
                     </div>
                ))}
                {results && results.topCandidates.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-6">No matching candidates found for this query.</p>}
            </div>
        </Card>
    );
};

const SkillGapAnalysis: React.FC<{ selectedEmployee: Employee }> = ({ selectedEmployee }) => {
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [analysisResult, setAnalysisResult] = useState<{ matching: Skill[], missing: Skill[] } | null>(null);

    const handleAnalyze = () => {
        if (!selectedRoleId) {
            setAnalysisResult(null);
            return;
        }
        const targetRole = mockTargetRoles.find(r => r.id === selectedRoleId);
        if (!targetRole) return;

        const employeeSkillIds = new Set(selectedEmployee.skills.map(s => s.id));
        
        const matching = targetRole.requiredSkills.filter(reqSkill => employeeSkillIds.has(reqSkill.id));
        const missing = targetRole.requiredSkills.filter(reqSkill => !employeeSkillIds.has(reqSkill.id));

        setAnalysisResult({ matching, missing });
    };
    
    // Reset analysis if selected employee changes
    React.useEffect(() => {
        setAnalysisResult(null);
        setSelectedRoleId('');
    }, [selectedEmployee]);

    return (
        <Card title="Skill Gap Analysis" icon={ClipboardSearchIcon}>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Select a role to see how this employee's skills align with its requirements.</p>
            <div className="flex flex-col sm:flex-row gap-2">
                <select 
                    value={selectedRoleId}
                    onChange={e => {
                        setSelectedRoleId(e.target.value);
                        setAnalysisResult(null); // Reset analysis on role change
                    }}
                    className="flex-grow w-full px-3 py-2 text-gray-700 bg-gray-50 border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-400"
                >
                    <option value="">Select a Target Role...</option>
                    {mockTargetRoles.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                </select>
                <button 
                    onClick={handleAnalyze} 
                    disabled={!selectedRoleId}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                    Analyze
                </button>
            </div>
            
            {analysisResult && (
                <div className="mt-6 space-y-4 animate-fade-in">
                    <div>
                        <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">Matching Skills ({analysisResult.matching.length})</h4>
                        <div className="flex flex-wrap gap-2">
                            {analysisResult.matching.length > 0 ? (
                                analysisResult.matching.map(skill => <SkillTag key={skill.id} skill={skill} />)
                            ) : (
                                <p className="text-sm text-gray-500">No matching skills for this role.</p>
                            )}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">Skill Gaps ({analysisResult.missing.length})</h4>
                         <div className="flex flex-wrap gap-2">
                            {analysisResult.missing.length > 0 ? (
                                analysisResult.missing.map(skill => <SkillTag key={skill.id} skill={skill} />)
                            ) : (
                                <p className="text-sm text-gray-500">No skill gaps found. Employee is fully qualified!</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};


// --- MAIN COMPONENT --- //
const SkillsTalent: React.FC<{ user: User; allEmployees: Employee[]; setEmployees: (employees: Employee[] | ((prev: Employee[]) => Employee[])) => void; }> = ({ user, allEmployees, setEmployees }) => {
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const visibleEmployees = getVisibleEmployees(user, allEmployees);
    
    // Set initial employee or update if list changes
    useEffect(() => {
        if (!selectedEmployee || !visibleEmployees.some(e => e.id === selectedEmployee.id)) {
            setSelectedEmployee(visibleEmployees.length > 0 ? visibleEmployees[0] : null);
        }
    }, [visibleEmployees, selectedEmployee]);
    
    // Keep selected employee view in sync with main state
    useEffect(() => {
        if (selectedEmployee) {
            const updatedSelected = allEmployees.find(e => e.id === selectedEmployee.id);
            if (updatedSelected) {
                setSelectedEmployee(updatedSelected);
            }
        }
    }, [allEmployees, selectedEmployee]);

    const isManagerOrAdmin = user.role === Role.Manager || user.role === Role.HRAdmin;

    const handleAddSkill = (employeeId: string, skillId: string) => {
        const skillToAdd = allSkillsList.find(s => s.id === skillId);
        if (!skillToAdd) return;

        setEmployees(prev => prev.map(emp => {
            if (emp.id === employeeId && !emp.skills.some(s => s.id === skillId)) {
                return { ...emp, skills: [...emp.skills, skillToAdd] };
            }
            return emp;
        }));
    };

    const handleRemoveSkill = (employeeId: string, skillId: string) => {
        setEmployees(prev => prev.map(emp => {
            if (emp.id === employeeId) {
                return { ...emp, skills: emp.skills.filter(s => s.id !== skillId) };
            }
            return emp;
        }));
    };
    
    if (!selectedEmployee) {
        return (
             <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Skills & Talent</h1>
                <p className="text-gray-600 dark:text-gray-400">No employees found or you do not have permission to view any.</p>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Skills & Talent</h1>
            <p className="text-gray-600 dark:text-gray-400">Map and manage employee skills, and find the right talent for any project.</p>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <Card title={isManagerOrAdmin ? "Select Employee" : "My Profile"} icon={UsersIcon}>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {visibleEmployees.map(emp => (
                                <div key={emp.id}
                                    onClick={() => isManagerOrAdmin && setSelectedEmployee(emp)}
                                    className={`flex items-center p-3 rounded-lg ${isManagerOrAdmin && 'cursor-pointer'} ${emp.id === selectedEmployee.id ? 'bg-primary-100 dark:bg-primary-900 ring-2 ring-primary-500' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                >
                                    <img src={emp.photoUrl} alt={emp.name} className="w-10 h-10 rounded-full" />
                                    <div className="ml-3">
                                        <p className="font-semibold text-gray-800 dark:text-white">{emp.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{emp.jobTitle}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                    {isManagerOrAdmin && <TalentFinder employees={allEmployees} />}
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card title="Skill Profile" icon={SparklesIcon}>
                        <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <img src={selectedEmployee.photoUrl} alt={selectedEmployee.name} className="w-16 h-16 rounded-full" />
                            <div>
                                <h3 className="text-2xl font-bold text-primary-500">{selectedEmployee.name}</h3>
                                <p className="text-gray-600 dark:text-gray-300">{selectedEmployee.jobTitle} - {selectedEmployee.department}</p>
                            </div>
                        </div>
                        <div className="mt-6">
                            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Current Skills</h4>
                             <div className="flex flex-wrap gap-2">
                                {selectedEmployee.skills.length > 0 ? selectedEmployee.skills.map(skill => (
                                    <SkillTag key={skill.id} skill={skill} onRemove={isManagerOrAdmin ? () => handleRemoveSkill(selectedEmployee.id, skill.id) : undefined} />
                                )) : <p className="text-sm text-gray-500 dark:text-gray-400">No skills assigned yet.</p>}
                            </div>
                        </div>

                        {isManagerOrAdmin && (
                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Add New Skill</h4>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const skillId = (e.target as any).elements.skill.value;
                                    if(skillId) {
                                       handleAddSkill(selectedEmployee.id, skillId);
                                       (e.target as any).reset();
                                    }
                                }} className="flex gap-2">
                                    <select name="skill" defaultValue="" required className="flex-grow w-full px-3 py-2 text-gray-700 bg-gray-50 border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-400">
                                        <option value="" disabled>Select a skill...</option>
                                        {allSkillsList
                                            .filter(s => !selectedEmployee.skills.some(es => es.id === s.id))
                                            .map(skill => <option key={skill.id} value={skill.id}>{skill.name}</option>
                                        )}
                                    </select>
                                    <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg shadow-md hover:bg-primary-600 transition-colors">
                                        <PlusIcon className="w-5 h-5"/>
                                        Add
                                    </button>
                                </form>
                            </div>
                        )}
                    </Card>
                    {isManagerOrAdmin && <SkillGapAnalysis selectedEmployee={selectedEmployee} />}
                </div>
            </div>
        </div>
    );
};

export default SkillsTalent;
