import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Role, User, Announcement, Employee, ChartData, LeaveRequest } from '../types';
import { TrendingUpIcon, CalendarIcon, UsersIcon, MegaphoneIcon, PlusIcon, BookOpenIcon, DollarSignIcon, BarChartIcon, HeartHandshakeIcon, SparklesIcon, TargetIcon, HistoryIcon, FileClockIcon, UserPlusIcon } from './icons';
import AIStrategicInsights from './AIStrategicInsights';
import { apiService } from '../services/apiService';

const KeyMetricCard: React.FC<{ title: string; value: string; icon: React.ElementType; change?: string; changeType?: 'increase' | 'decrease' }> = ({ title, value, icon: Icon, change, changeType }) => {
    const changeColor = changeType === 'increase' ? 'text-green-500' : 'text-red-500';
    return (
        <div className="bg-white dark:bg-primary-900/50 p-5 rounded-lg shadow-sm flex items-start gap-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-800 rounded-lg">
                <Icon className="w-6 h-6 text-primary-600 dark:text-primary-300" />
            </div>
            <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
                {change && (
                     <p className={`text-xs font-semibold mt-1 flex items-center ${changeColor}`}>
                        <TrendingUpIcon className={`w-4 h-4 mr-1 ${changeType === 'decrease' ? 'transform rotate-180' : ''}`} />
                        {change} vs last month
                    </p>
                )}
            </div>
        </div>
    );
};

const QuickAccessCard: React.FC<{ title: string; to: string; icon: React.ElementType }> = ({ title, to, icon: Icon }) => (
    <Link to={to} className="bg-white dark:bg-primary-900/50 p-5 rounded-lg shadow-sm flex flex-col items-center justify-center text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
        <div className="p-3 bg-primary-100 dark:bg-primary-800 rounded-full mb-3">
            <Icon className="w-6 h-6 text-primary-600 dark:text-primary-300"/>
        </div>
        <p className="font-semibold text-sm text-gray-700 dark:text-gray-200">{title}</p>
    </Link>
);


const AddAnnouncementModal: React.FC<{ onSave: (announcement: Omit<Announcement, 'id'|'date'|'postedBy'>) => void, onClose: () => void }> = ({ onSave, onClose }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ title, content });
    };

    return (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-primary-900 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                <form onSubmit={handleSubmit}>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">New Announcement</h2>
                    <div className="space-y-4">
                        <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        <textarea rows={5} placeholder="Content..." value={content} onChange={e => setContent(e.target.value)} required className="w-full px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 dark:bg-primary-700 dark:text-gray-200 dark:hover:bg-primary-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700">Post</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Announcements: React.FC<{ announcements: Announcement[], onAdd: (data: Omit<Announcement, 'id'|'date'|'postedBy'>) => void, user: User }> = ({ announcements, onAdd, user }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleSaveAnnouncement = (data: Omit<Announcement, 'id'|'date'|'postedBy'>) => {
        onAdd(data);
        setIsAddModalOpen(false);
    };

    return (
        <div className="bg-white dark:bg-primary-900/50 p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-primary-800 pb-3 mb-4">
                <div className="flex items-center gap-3">
                    <MegaphoneIcon className="w-6 h-6 text-primary-500" />
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Announcements</h3>
                </div>
                {user.role === Role.HRAdmin && (
                    <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-1 px-2.5 py-1.5 bg-primary-600 text-white text-xs font-semibold rounded-lg shadow-md hover:bg-primary-700">
                        <PlusIcon className="w-4 h-4"/> New
                    </button>
                )}
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {announcements.length > 0 ? announcements.map(item => (
                    <div key={item.id} className="p-3 rounded-md bg-gray-50 dark:bg-primary-900">
                        <p className="font-semibold text-gray-800 dark:text-white">{item.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.content}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{item.date} - by {item.postedBy}</p>
                    </div>
                )) : <p className="text-center text-gray-500 py-4">No announcements right now.</p>}
            </div>
            {isAddModalOpen && <AddAnnouncementModal onClose={() => setIsAddModalOpen(false)} onSave={handleSaveAnnouncement} />}
        </div>
    );
};

const Dashboard: React.FC<{ user: User }> = ({ user }) => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [anns, emps, leaves] = await Promise.all([
                apiService.getAnnouncements(),
                apiService.getEmployees(),
                apiService.getLeaveRequests(),
            ]);
            setAnnouncements(anns);
            setAllEmployees(emps);
            setLeaveRequests(leaves);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddAnnouncement = async (data: Omit<Announcement, 'id'|'date'|'postedBy'>) => {
        await apiService.addAnnouncement(data, user);
        fetchData(); // Refetch all data to keep it simple
    };

    const employeeProfile = useMemo(() => allEmployees.find(e => e.id === user.id), [allEmployees, user.id]);

    const metrics: { title: string; value: string; icon: React.ElementType; change?: string; changeType?: 'increase' | 'decrease'; }[] = useMemo(() => {
        const commonMetrics = {
            leaveDays: { title: "My Leave Balance", value: `${employeeProfile?.annualLeaveBalance || 0} days`, icon: CalendarIcon },
            nextReview: { title: "Next Review", value: 'Dec 15, 2023', icon: FileClockIcon }
        };

        if (user.role === Role.HRAdmin) {
            return [
                { title: "Total Headcount", value: `${allEmployees.length}`, icon: UsersIcon, change: "+2%", changeType: 'increase' },
                { title: "Avg. Tenure", value: "3.2 Years", icon: HistoryIcon, change: "+0.1", changeType: 'increase'  },
                { title: "Open Positions", value: "4", icon: UserPlusIcon },
                { title: "Attrition Rate", value: "5.1%", icon: TrendingUpIcon, change: "-0.5%", changeType: 'decrease' },
            ];
        }
        if (user.role === Role.Manager) {
            const teamSize = allEmployees.filter(e => e.managerId === user.id).length;
            return [
                { title: "Team Members", value: `${teamSize}`, icon: UsersIcon },
                { title: "Team On Leave", value: "2", icon: CalendarIcon },
                commonMetrics.nextReview
            ];
        }
        return [
            commonMetrics.leaveDays,
            commonMetrics.nextReview
        ];

    }, [user.role, allEmployees, employeeProfile]);

    const quickLinks = useMemo(() => {
        if(user.role === Role.HRAdmin) {
            return [
                { title: "Manage Employees", to: "/employee-information", icon: UsersIcon },
                { title: "Run Payroll", to: "/payroll", icon: DollarSignIcon },
                { title: "Recruitment", to: "/recruitment", icon: UserPlusIcon },
                { title: "View Reports", to: "/reports", icon: BarChartIcon },
            ];
        }
        if (user.role === Role.Manager) {
             return [
                { title: "Team Performance", to: "/performance", icon: TrendingUpIcon },
                { title: "Approve Leave", to: "/leave-attendance", icon: CalendarIcon },
                { title: "Find Talent", to: "/skills-talent", icon: SparklesIcon },
                { title: "View Reports", to: "/reports", icon: BarChartIcon },
            ];
        }
        return [
            { title: "Request Leave", to: "/leave-attendance", icon: CalendarIcon },
            { title: "My Payslips", to: "/payroll", icon: DollarSignIcon },
            { title: "My Goals", to: "/performance", icon: TargetIcon },
            { title: "My Benefits", to: "/benefits", icon: HeartHandshakeIcon },
        ]
    }, [user.role]);

    const attritionData: ChartData[] = [ { name: 'Q1', value: 5 }, { name: 'Q2', value: 8 }, { name: 'Q3', value: 4 }, { name: 'Q4', value: 6 }];
    const departmentData: ChartData[] = [ { name: 'Operations', value: 65 }, { name: 'Commercial', value: 15 }, { name: 'Admin & Finance', value: 12 }, { name: 'Executive', value: 5 }];
    const PIE_COLORS = ['#64748b', '#7dd3fc', '#a78bfa', '#facc15'];

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div></div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Mwaramutse, {user.name.split(' ')[0]}!</h1>
                <p className="text-gray-600 dark:text-gray-400">Here's your snapshot of the HR portal today.</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map(metric => <KeyMetricCard key={metric.title} {...metric} />)}
            </div>

            {/* Quick Access */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 {quickLinks.map(link => <QuickAccessCard key={link.title} {...link} />)}
            </div>
            
            {(user.role === Role.HRAdmin || user.role === Role.Manager) && (
                <AIStrategicInsights employees={allEmployees} leaveRequests={leaveRequests} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Announcements announcements={announcements} onAdd={handleAddAnnouncement} user={user} />
                </div>
                <div className="lg:col-span-1">
                   <div className="bg-white dark:bg-primary-900/50 p-6 rounded-lg shadow-sm h-full">
                       <div className="flex items-center gap-3 border-b border-gray-200 dark:border-primary-800 pb-3 mb-4">
                           <CalendarIcon className="w-6 h-6 text-primary-500" />
                           <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">On Leave Today</h3>
                       </div>
                       <div className="space-y-3">
                           {/* Replace with dynamic data */}
                           <div className="flex items-center gap-3">
                               <img src="https://picsum.photos/seed/bosco/100/100" className="w-10 h-10 rounded-full" />
                               <div>
                                   <p className="font-semibold text-sm text-gray-800 dark:text-white">Bosco Ndayisenga</p>
                                   <p className="text-xs text-gray-500 dark:text-gray-400">Annual Leave</p>
                               </div>
                           </div>
                           <div className="flex items-center gap-3">
                               <img src="https://picsum.photos/seed/carine/100/100" className="w-10 h-10 rounded-full" />
                               <div>
                                   <p className="font-semibold text-sm text-gray-800 dark:text-white">Carine Umutesi</p>
                                   <p className="text-xs text-gray-500 dark:text-gray-400">Annual Leave</p>
                               </div>
                           </div>
                       </div>
                   </div>
                </div>
            </div>

            {user.role === Role.HRAdmin && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-primary-900/50 p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Quarterly Attrition Rate (%)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={attritionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-primary-800"/>
                                <XAxis dataKey="name" className="text-xs fill-gray-600 dark:fill-gray-400"/>
                                <YAxis className="text-xs fill-gray-600 dark:fill-gray-400"/>
                                <Tooltip cursor={{fill: 'rgba(100, 116, 139, 0.1)'}} contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.8)', borderColor: 'rgba(55, 65, 81, 1)', color: '#ffffff' }} />
                                <Legend />
                                <Bar dataKey="value" fill="#64748b" name="Attrition %" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                     <div className="bg-white dark:bg-primary-900/50 p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Employees by Department</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={departmentData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                    {departmentData.map((entry, i) => <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.8)', borderColor: 'rgba(55, 65, 81, 1)', color: '#ffffff' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
