import React, { useState, useEffect, useCallback } from 'react';
import { Goal, Feedback, Review, Pip, Role, User, Employee } from '../types';
import { TargetIcon, ThumbsUpIcon, MessageSquareIcon, FileTextIcon, TrendingUpIcon, StarIcon, UserCheckIcon, PrinterIcon } from './icons';
import { getVisibleEmployees } from './utils';
import { apiService } from '../services/apiService';

const mockGoals: Goal[] = [
    { id: 'G1', title: 'Achieve 98% On-Time Delivery Rate', status: 'On Track', progress: 95, description: 'Maintain high efficiency for all assigned delivery routes.' },
    { id: 'G2', title: 'Mentor Apprentice Driver', status: 'On Track', progress: 50, description: 'Provide guidance and support to a new driver on the team.' },
    { id: 'G3', title: 'Maintain Zero Safety Infractions', status: 'On Track', progress: 100, description: 'Adhere to all safety protocols during operations.' },
    { id: 'G4', title: 'Complete Defensive Driving Course', status: 'Completed', progress: 100, description: 'Finish the certified defensive driving and safety course.' },
];

const mockFeedback: Feedback[] = [
    { id: 'F1', type: 'Praise', from: 'Jeanette Ingabire (Manager)', comment: 'Exceptional handling of the Gisenyi route last week. Your proactive communication was key.', date: '2023-11-05' },
    { id: 'F2', type: 'Constructive', from: 'Bosco Ndayisenga', comment: 'Let\'s review the pre-trip inspection checklist to ensure all points are covered.', date: '2023-11-02' },
    { id: 'F3', type: 'Praise', from: 'Carine Umutesi (Mechanic)', comment: 'Thanks for the clear report on the vehicle issue. It helped us fix it quickly!', date: '2023-10-28' },
];

const mockPips: Pip[] = [
    { id: 'P1', title: 'Improve Pre-Trip Inspection Adherence', status: 'Active', startDate: '2023-11-01', endDate: '2023-12-31' }
];

const mockReviews: Review[] = [
    { id: 'R1', cycle: 'Q3 2023 Review', status: 'Completed', score: 4.5, date: '2023-10-15' },
    { id: 'R2', cycle: 'Q2 2023 Review', status: 'Completed', score: 4.2, date: '2023-07-15' },
    { id: 'R3', cycle: 'Q1 2023 Review', status: 'Completed', score: 4.0, date: '2023-04-15' },
];

const Card: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode, className?: string }> = ({ title, icon: Icon, children, className }) => (
    <div className={`bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md ${className}`}>
        <div className="flex items-center text-xl font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
            <Icon className="w-6 h-6 mr-3 text-primary-500" />
            <h3>{title}</h3>
        </div>
        {children}
    </div>
);

const GoalItem: React.FC<{ goal: Goal }> = ({ goal }) => {
    const progressColor = goal.status === 'Completed' ? 'bg-green-500' : goal.status === 'At Risk' ? 'bg-yellow-500' : 'bg-primary-500';
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <p className="font-semibold text-gray-800 dark:text-white">{goal.title}</p>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{goal.progress}%</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{goal.description}</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className={`${progressColor} h-2.5 rounded-full`} style={{ width: `${goal.progress}%` }}></div>
            </div>
        </div>
    );
};

const FeedbackItem: React.FC<{ item: Feedback }> = ({ item }) => {
    const isPraise = item.type === 'Praise';
    const Icon = isPraise ? ThumbsUpIcon : MessageSquareIcon;
    const color = isPraise ? 'text-green-500' : 'text-blue-500';

    return (
        <div className="flex gap-4">
            <div className="flex-shrink-0">
                <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{item.from}</span> on {item.date}
                </p>
                <p className="mt-1 text-gray-600 dark:text-gray-300">{item.comment}</p>
            </div>
        </div>
    );
};

const PrintableSummary: React.FC<{ employee: Employee, isAline: boolean }> = ({ employee, isAline }) => (
    <div className="p-8 font-sans text-black">
        <div className="text-center border-b pb-4">
            <h1 className="text-3xl font-bold">Performance Summary</h1>
            <h2 className="text-2xl mt-2">{employee.name}</h2>
            <p className="text-lg text-gray-600">{employee.jobTitle}</p>
        </div>

        <div className="mt-8">
            <h3 className="text-xl font-semibold border-b pb-2 mb-4">Q4 2023 Goals & KPIs</h3>
            <div className="space-y-6">
                {isAline ? mockGoals.map(goal => (
                    <div key={goal.id}>
                        <div className="flex justify-between font-semibold">
                            <span>{goal.title}</span>
                            <span>{goal.status} - {goal.progress}%</span>
                        </div>
                        <p className="text-sm text-gray-700">{goal.description}</p>
                    </div>
                )) : <p>No goals set for this employee.</p>}
            </div>
        </div>
        
        <div className="mt-8">
             <h3 className="text-xl font-semibold border-b pb-2 mb-4">Recent Feedback</h3>
             <div className="space-y-4">
                {isAline ? mockFeedback.map(item => (
                    <div key={item.id}>
                        <p className="font-semibold">{item.type} from {item.from} ({item.date})</p>
                        <p className="pl-4 italic">"{item.comment}"</p>
                    </div>
                )): <p>No feedback for this employee.</p>}
             </div>
        </div>
        
        <div className="mt-8">
            <h3 className="text-xl font-semibold border-b pb-2 mb-4">Review History</h3>
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b">
                        <th className="py-2">Review Cycle</th>
                        <th className="py-2">Status</th>
                        <th className="py-2">Score</th>
                        <th className="py-2">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {isAline ? mockReviews.map(review => (
                        <tr key={review.id} className="border-b">
                            <td className="py-2">{review.cycle}</td>
                            <td className="py-2">{review.status}</td>
                            <td className="py-2">{review.score}/5.0</td>
                            <td className="py-2">{review.date}</td>
                        </tr>
                    )) : (
                        <tr><td colSpan={4} className="text-center py-4">No review history.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

interface PerformanceManagementProps {
    user: User;
}

const PerformanceManagement: React.FC<PerformanceManagementProps> = ({ user }) => {
    const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const emps = await apiService.getEmployees();
                setAllEmployees(emps);
            } catch (error) {
                console.error("Failed to fetch employees", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const viewableEmployees = getVisibleEmployees(user, allEmployees);

    useEffect(() => {
        if (!isLoading && (!selectedEmployee || !viewableEmployees.some(e => e.id === selectedEmployee.id))) {
            setSelectedEmployee(viewableEmployees.length > 0 ? viewableEmployees[0] : null);
        }
    }, [user, viewableEmployees, selectedEmployee, isLoading]);

    const showManagerTools = user.role === Role.Manager || user.role === Role.HRAdmin;
    const isAlineSelected = selectedEmployee?.id === 'E1001';
    const activePip = isAlineSelected ? mockPips.find(p => p.status === 'Active') : undefined;

    const [ratings, setRatings] = useState<{ [key: string]: number }>({
        'On-Time Performance': 0, 'Safety & Compliance': 0, 'Vehicle Care': 0, 'Customer Service': 0,
    });
    const [comments, setComments] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    
    useEffect(() => {
        // Reset review form when employee changes
        setRatings({ 'On-Time Performance': 0, 'Safety & Compliance': 0, 'Vehicle Care': 0, 'Customer Service': 0 });
        setComments('');
        setSubmitted(false);
    }, [selectedEmployee]);

    const handleRating = (competency: string, value: number) => {
        setRatings(prev => ({ ...prev, [competency]: value }));
    };

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            console.log('Submitted Review For:', selectedEmployee?.name, { ratings, comments });
            setIsSubmitting(false);
            setSubmitted(true);
        }, 1500);
    };

    const handlePrint = () => {
        window.print();
    };

    const StarRating: React.FC<{ rating: number; onRate: (value: number) => void }> = ({ rating, onRate }) => (
        <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    type="button" key={star} onClick={() => onRate(star)}
                    className="p-1 focus:outline-none focus:ring-2 focus:ring-primary-300 rounded-full"
                    aria-label={`Rate ${star} out of 5 stars`}
                >
                    <StarIcon className={`w-5 h-5 transition-colors ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-400 hover:text-gray-500'}`} />
                </button>
            ))}
        </div>
    );

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div></div>;
    }
    
    if (showManagerTools && !selectedEmployee) {
        return (
             <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Performance Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Select an employee to view their performance details.</p>
             </div>
        )
    }

    return (
        <>
            <div className="print:hidden">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Performance Management</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {showManagerTools ? `Oversee performance reviews, feedback, and development plans for ${selectedEmployee?.name || '...'}.` : 'Track your goals, feedback, and review history.'}
                        </p>
                    </div>
                    {selectedEmployee && (
                        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700">
                            <PrinterIcon className="w-5 h-5" /> Print Summary
                        </button>
                    )}
                </div>
                
                <div className="mt-6 grid grid-cols-1 xl:grid-cols-4 gap-6">
                    
                    {showManagerTools && (
                        <div className="xl:col-span-1 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md">
                            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 px-2">Select Employee</h3>
                            <div className="space-y-2 h-[calc(100vh-12rem)] overflow-y-auto pr-2">
                                {viewableEmployees.map(emp => (
                                    <div key={emp.id} onClick={() => setSelectedEmployee(emp)} className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${emp.id === selectedEmployee?.id ? 'bg-primary-100 dark:bg-primary-900 ring-2 ring-primary-500' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                                        <img src={emp.photoUrl} alt={emp.name} className="w-10 h-10 rounded-full" />
                                        <div className="ml-3">
                                            <p className="font-semibold text-gray-800 dark:text-white">{emp.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{emp.jobTitle}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className={showManagerTools ? "xl:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6" : "grid grid-cols-1 lg:grid-cols-2 gap-6 xl:col-span-4"}>
                        {/* Main Column */}
                        <div className="flex flex-col gap-6">
                            <Card title="Q4 2023 Goals & KPIs" icon={TargetIcon}>
                                <div className="space-y-6">
                                    {isAlineSelected ? mockGoals.map(goal => <GoalItem key={goal.id} goal={goal} />) : <p className="text-gray-500 text-center py-8">No goals set for this employee.</p>}
                                </div>
                            </Card>

                            <Card title="Performance Review History" icon={TrendingUpIcon}>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                            <tr>
                                                <th scope="col" className="px-4 py-3">Review Cycle</th>
                                                <th scope="col" className="px-4 py-3">Status</th>
                                                <th scope="col" className="px-4 py-3">Score</th>
                                                <th scope="col" className="px-4 py-3">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isAlineSelected ? mockReviews.map(review => (
                                                <tr key={review.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                    <td className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{review.cycle}</td>
                                                    <td className="px-4 py-4">{review.status}</td>
                                                    <td className="px-4 py-4 font-semibold">{review.score}/5.0</td>
                                                    <td className="px-4 py-4">{review.date}</td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan={4} className="text-center py-8 text-gray-500">No review history.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>

                        {/* Side Column */}
                        <div className="flex flex-col gap-6">
                            <Card title="Recent Feedback" icon={MessageSquareIcon}>
                                <div className="space-y-6">
                                    {isAlineSelected ? mockFeedback.map(item => <FeedbackItem key={item.id} item={item} />) : <p className="text-gray-500 text-center py-8">No feedback for this employee.</p>}
                                </div>
                            </Card>
                            
                            {activePip && (
                                <Card title="Performance Improvement Plan" icon={UserCheckIcon}>
                                    <h4 className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{activePip.title}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Status: {activePip.status} | Due: {activePip.endDate}</p>
                                </Card>
                            )}
                            
                            {showManagerTools && isAlineSelected && (
                                <Card title="Submit Q4 Review" icon={FileTextIcon}>
                                    {submitted ? (
                                        <div className="text-center py-8">
                                            <h4 className="text-lg font-bold text-green-500">Thank you!</h4>
                                            <p className="text-gray-600 dark:text-gray-300">Your review has been submitted successfully.</p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmitReview} className="space-y-4">
                                            <div>
                                                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Competency Ratings</h4>
                                                <div className="space-y-2 mt-2">
                                                    {Object.keys(ratings).map(key => (
                                                        <div key={key} className="flex justify-between items-center">
                                                            <span className="text-sm">{key}</span>
                                                            <StarRating rating={ratings[key as keyof typeof ratings]} onRate={(value) => handleRating(key, value)} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Overall Comments</label>
                                                <textarea 
                                                    value={comments}
                                                    onChange={(e) => setComments(e.target.value)}
                                                    rows={4}
                                                    className="mt-1 w-full px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300"
                                                    placeholder="Provide a summary of performance, strengths, and areas for improvement..."
                                                />
                                            </div>
                                            <button type="submit" disabled={isSubmitting} className="w-full py-2 bg-primary-500 text-white font-semibold rounded-lg disabled:bg-primary-300">
                                                {isSubmitting ? 'Submitting...' : 'Submit Review'}
                                            </button>
                                        </form>
                                    )}
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="hidden print:block">
                {selectedEmployee && <PrintableSummary employee={selectedEmployee} isAline={isAlineSelected}/>}
            </div>
        </>
    );
};

export default PerformanceManagement;