
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { CalendarIcon, UserCheckIcon } from './icons';
import { LeaveRequest, LeaveStatus, Role, User, Employee } from '../types';
import { apiService } from '../services/apiService';

const StatusBadge: React.FC<{ status: LeaveStatus }> = ({ status }) => {
    const baseClasses = "text-sm font-semibold px-2 py-1 rounded-full";
    const statusClasses = {
        [LeaveStatus.Approved]: "text-green-600 bg-green-100 dark:bg-green-800 dark:text-green-200",
        [LeaveStatus.Pending]: "text-yellow-600 bg-yellow-100 dark:bg-yellow-800 dark:text-yellow-200",
        [LeaveStatus.Rejected]: "text-red-600 bg-red-100 dark:bg-red-800 dark:text-red-200",
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

interface LeaveAttendanceProps {
    user: User;
}

const LeaveAttendance: React.FC<LeaveAttendanceProps> = ({ user }) => {
    const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [leaveType, setLeaveType] = useState('Annual Leave');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [emps, leaves] = await Promise.all([
                apiService.getEmployees(),
                apiService.getLeaveRequests(),
            ]);
            setAllEmployees(emps);
            setLeaveRequests(leaves);
        } catch (error) {
            console.error("Failed to fetch leave/attendance data", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const myLeaveHistory = useMemo(() => leaveRequests.filter(req => req.employeeId === user.id).sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()), [leaveRequests, user.id]);

    const myTeamMemberIds = useMemo(() => {
        if (user.role !== Role.Manager && user.role !== Role.HRAdmin) return new Set();
        return new Set(allEmployees.filter(emp => emp.managerId === user.id).map(e => e.id));
    }, [allEmployees, user.id, user.role]);
    
    const teamRequests = useMemo(() => {
        return leaveRequests
            .filter(req => myTeamMemberIds.has(req.employeeId))
            .map(req => {
                const employee = allEmployees.find(e => e.id === req.employeeId);
                return {
                    ...req,
                    employeeName: employee?.name || 'Unknown',
                    employeePhoto: employee?.photoUrl || '',
                }
            })
            .sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }, [leaveRequests, myTeamMemberIds, allEmployees]);


    const handleTeamRequestAction = async (id: string, newStatus: LeaveStatus) => {
        await apiService.updateLeaveRequests(prev => prev.map(req => req.id === id ? {...req, status: newStatus} : req));
        fetchData();
    };

    const resetForm = () => {
        setLeaveType('Annual Leave');
        setStartDate('');
        setEndDate('');
        setReason('');
    };
    
    const handleOpenModal = () => {
        resetForm();
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => setIsModalOpen(false);
    
    const handleSubmitRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!startDate || !endDate || !reason) {
            alert("Please fill all fields");
            return;
        }
        const newRequest: LeaveRequest = {
            id: `LR${Date.now()}`,
            employeeId: user.id,
            startDate,
            endDate,
            type: leaveType,
            status: LeaveStatus.Pending,
            reason: reason,
        };
        await apiService.updateLeaveRequests(prev => [newRequest, ...prev]);
        fetchData();
        handleCloseModal();
    };

    const currentUserEmployee = allEmployees.find(e => e.id === user.id);

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div></div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Leave & Attendance</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage leave requests and track employee attendance.</p>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                     <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">My Leave Balances</h3>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Annual Leave Balance</span>
                            <span className="font-bold text-primary-500">{currentUserEmployee?.annualLeaveBalance || 0} Days</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Sick Leave Taken (YTD)</span>
                            <span className="font-bold text-primary-500">{myLeaveHistory.filter(r => r.type === 'Sick Leave' && r.status === LeaveStatus.Approved).length} Days</span>
                        </div>
                     </div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">My Leave History</h3>
                        <button onClick={handleOpenModal} className="px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg shadow-md hover:bg-primary-600 transition-colors">
                            Request Leave
                        </button>
                    </div>
                     <div className="space-y-3 h-48 overflow-y-auto">
                        {myLeaveHistory.length > 0 ? myLeaveHistory.map(item => (
                            <div key={item.id} className="flex justify-between items-center p-2 rounded-md bg-gray-50 dark:bg-gray-800">
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-white">{item.type}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.startDate} to {item.endDate}</p>
                                </div>
                                <StatusBadge status={item.status} />
                            </div>
                        )) : <p className="text-center text-gray-500 py-10">You have no leave history.</p>}
                    </div>
                </div>
            </div>

            {(user.role === Role.Manager || user.role === Role.HRAdmin) && (
                 <div className="mt-6 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">Team Leave Requests</h3>
                    <div className="space-y-4">
                        {teamRequests.filter(r => r.status === LeaveStatus.Pending).length > 0 ? teamRequests.filter(r => r.status === LeaveStatus.Pending).map(req => (
                             <div key={req.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <img src={req.employeePhoto} alt={req.employeeName} className="w-10 h-10 rounded-full"/>
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-white">{req.employeeName}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{req.type} ({req.startDate} to {req.endDate})</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">"{req.reason}"</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 self-end sm:self-auto flex-shrink-0">
                                    <button onClick={() => handleTeamRequestAction(req.id, LeaveStatus.Approved)} className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200">Approve</button>
                                    <button onClick={() => handleTeamRequestAction(req.id, LeaveStatus.Rejected)} className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200">Reject</button>
                                </div>
                             </div>
                        )) : <p className="text-center text-gray-500 dark:text-gray-400 py-4">No pending team requests.</p>}
                    </div>
                </div>
            )}
            
            {isModalOpen && (
                 <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-lg mx-4">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">New Leave Request</h2>
                        <form onSubmit={handleSubmitRequest}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Leave Type</label>
                                    <select id="leaveType" value={leaveType} onChange={e => setLeaveType(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                                        <option>Annual Leave</option>
                                        <option>Sick Leave</option>
                                        <option>Unpaid Leave</option>
                                        <option>Maternity/Paternity</option>
                                    </select>
                                </div>
                                <div></div>
                                <div>
                                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                                    <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
                                </div>
                                <div>
                                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                                    <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason</label>
                                    <textarea id="reason" rows={3} value={reason} onChange={e => setReason(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" placeholder="Provide a brief reason for your leave..."></textarea>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg shadow-md hover:bg-primary-600">Submit Request</button>
                            </div>
                        </form>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default LeaveAttendance;