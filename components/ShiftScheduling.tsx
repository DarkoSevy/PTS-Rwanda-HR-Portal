
import React, { useState, useMemo, useEffect } from 'react';
import { User, Role, Employee, Shift, LeaveRequest } from '../types';
import { ClockIcon, PlusIcon, XIcon, ShieldAlertIcon, Trash2Icon, ChevronsLeftIcon } from './icons';
import { getVisibleEmployees } from './utils';

// --- DATE UTILS --- //
const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
};

const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const isSameDay = (d1: Date, d2: Date): boolean => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};


// --- CONFLICT DETECTION --- //
const hasShiftOverlap = (shiftA: Shift, shiftB: Shift): boolean => {
    const startA = new Date(shiftA.startTime).getTime();
    const endA = new Date(shiftA.endTime).getTime();
    const startB = new Date(shiftB.startTime).getTime();
    const endB = new Date(shiftB.endTime).getTime();
    return startA < endB && endA > startB;
}

const isDuringLeave = (shift: Shift, leaveRequests: LeaveRequest[]): boolean => {
    const shiftStart = new Date(shift.startTime);
    const shiftEnd = new Date(shift.endTime);
    return leaveRequests.some(req => {
        if (req.employeeId !== shift.employeeId || req.status !== 'Approved') return false;
        const leaveStart = new Date(req.startDate);
        leaveStart.setHours(0,0,0,0);
        const leaveEnd = new Date(req.endDate);
        leaveEnd.setHours(23,59,59,999);
        return shiftStart < leaveEnd && shiftEnd > leaveStart;
    });
};


// --- COMPONENTS --- //
const ShiftModal: React.FC<{
    onClose: () => void;
    onSave: (shift: Omit<Shift, 'id'>) => void;
    onDelete?: () => void;
    allEmployees: Employee[];
    allShifts: Shift[];
    leaveRequests: LeaveRequest[];
    initialShift: Shift | null;
}> = ({ onClose, onSave, onDelete, allEmployees, allShifts, leaveRequests, initialShift }) => {
    const [shift, setShift] = useState<Omit<Shift, 'id'>>({
        employeeId: initialShift?.employeeId || '',
        title: initialShift?.title || '',
        startTime: initialShift?.startTime || new Date().toISOString(),
        endTime: initialShift?.endTime || addDays(new Date(), 1).toISOString(),
        notes: initialShift?.notes || '',
    });

    const [conflict, setConflict] = useState<string | null>(null);

    useEffect(() => {
        if (!shift.employeeId || !shift.startTime || !shift.endTime) {
            setConflict(null);
            return;
        }

        const tempShift = { ...shift, id: initialShift?.id || '' };
        
        const overlappingShift = allShifts.find(s => 
            s.id !== tempShift.id &&
            s.employeeId === tempShift.employeeId &&
            hasShiftOverlap(s, tempShift as Shift)
        );

        if (overlappingShift) {
            setConflict(`Overlaps with "${overlappingShift.title}" (${new Date(overlappingShift.startTime).toLocaleTimeString()} - ${new Date(overlappingShift.endTime).toLocaleTimeString()}).`);
            return;
        }

        if (isDuringLeave(tempShift as Shift, leaveRequests)) {
            setConflict('Employee has an approved leave request during this time.');
            return;
        }

        setConflict(null);
    }, [shift, allShifts, leaveRequests, initialShift]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(shift);
    };
    
    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{initialShift ? 'Edit' : 'Create'} Shift</h2>
                        <div className="space-y-4">
                             <select value={shift.employeeId} onChange={e => setShift(s => ({...s, employeeId: e.target.value}))} required className="w-full mt-1 px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300">
                                <option value="">Select Employee...</option>
                                {allEmployees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                            </select>
                            <input type="text" placeholder="Shift Title (e.g., Kigali-Huye Route)" value={shift.title} onChange={e => setShift(s => ({...s, title: e.target.value}))} required className="w-full mt-1 px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300" />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="datetime-local" value={shift.startTime.substring(0, 16)} onChange={e => setShift(s => ({...s, startTime: new Date(e.target.value).toISOString()}))} required className="w-full mt-1 px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300" />
                                <input type="datetime-local" value={shift.endTime.substring(0, 16)} onChange={e => setShift(s => ({...s, endTime: new Date(e.target.value).toISOString()}))} required className="w-full mt-1 px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300" />
                            </div>
                            <textarea placeholder="Notes (optional)" value={shift.notes} onChange={e => setShift(s => ({...s, notes: e.target.value}))} rows={3} className="w-full mt-1 px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300" />

                            {conflict && (
                                <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-lg">
                                    <ShieldAlertIcon className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-yellow-700 dark:text-yellow-300">Scheduling Conflict</h4>
                                        <p className="text-sm text-yellow-600 dark:text-yellow-400">{conflict}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                     <div className="flex justify-between items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
                        <div>
                            {initialShift && onDelete && (
                                <button type="button" onClick={onDelete} className="px-4 py-2 text-red-600 font-semibold rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 flex items-center gap-2">
                                   <Trash2Icon className="w-4 h-4"/> Delete
                                </button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg shadow-md hover:bg-primary-600">Save Shift</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

const ShiftCard: React.FC<{ shift: Shift & { employeeName: string }, onClick: () => void, canEdit: boolean }> = ({ shift, onClick, canEdit }) => (
    <div onClick={canEdit ? onClick : undefined} className={`p-3 rounded-lg bg-primary-50 dark:bg-primary-900/50 border-l-4 border-primary-400 shadow-sm ${canEdit ? 'cursor-pointer hover:shadow-md hover:border-primary-600' : ''}`}>
        <p className="font-bold text-sm text-primary-800 dark:text-primary-200">{shift.title}</p>
        <p className="text-xs font-medium text-gray-600 dark:text-gray-300">{shift.employeeName}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(shift.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
    </div>
);


const ShiftScheduling: React.FC<{ user: User; allEmployees: Employee[], shifts: Shift[], setShifts: (updater: (prev: Shift[]) => Shift[]) => void; leaveRequests: LeaveRequest[] }> = ({ user, allEmployees, shifts, setShifts, leaveRequests }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingShift, setEditingShift] = useState<Shift | null>(null);

    const startOfWeek = getStartOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startOfWeek, i));
    
    const canManageShifts = user.role === Role.HRAdmin || user.role === Role.Manager;
    const visibleEmployees = getVisibleEmployees(user, allEmployees);

    const weekShifts = useMemo(() => {
        return shifts
        .map(shift => {
            const employee = allEmployees.find(e => e.id === shift.employeeId);
            return { ...shift, employeeName: employee?.name || 'Unknown' };
        })
        .filter(shift => visibleEmployees.some(e => e.id === shift.employeeId));
    }, [shifts, allEmployees, visibleEmployees]);

    const handleSaveShift = (shiftData: Omit<Shift, 'id'>) => {
        if (editingShift) {
            setShifts(prev => prev.map(s => s.id === editingShift.id ? { ...s, ...shiftData } : s));
        } else {
            const newShift: Shift = { ...shiftData, id: `S${Date.now()}` };
            setShifts(prev => [...prev, newShift]);
        }
        setIsModalOpen(false);
        setEditingShift(null);
    };

    const handleDeleteShift = () => {
        if (editingShift) {
            setShifts(prev => prev.filter(s => s.id !== editingShift.id));
            setIsModalOpen(false);
            setEditingShift(null);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Shift Scheduling</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage weekly shifts and assignments for your team.</p>
            
            <div className="mt-6 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">
                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentDate(addDays(currentDate, -7))} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronsLeftIcon className="w-5 h-5"/></button>
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 text-center w-48">{startOfWeek.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                        <button onClick={() => setCurrentDate(addDays(currentDate, 7))} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronsLeftIcon className="w-5 h-5 rotate-180"/></button>
                        <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-sm font-semibold border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">Today</button>
                    </div>
                    {canManageShifts && (
                        <button onClick={() => { setEditingShift(null); setIsModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg shadow-md hover:bg-primary-600 transition-colors">
                           <PlusIcon className="w-5 h-5"/> New Shift
                        </button>
                    )}
                </div>

                {/* Calendar Grid */}
                <div className="overflow-x-auto">
                    <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg">
                        {weekDays.map(day => {
                            const dayShifts = weekShifts.filter(shift => isSameDay(new Date(shift.startTime), day));
                            const isToday = isSameDay(day, new Date());
                            return (
                                <div key={day.toISOString()} className="bg-white dark:bg-gray-900 p-2 min-h-[50vh] min-w-[140px]">
                                    <div className="text-center mb-2">
                                        <p className="text-xs font-semibold text-gray-500">{day.toLocaleDateString('default', { weekday: 'short' }).toUpperCase()}</p>
                                        <p className={`text-lg font-bold ${isToday ? 'text-primary-500' : 'text-gray-700 dark:text-gray-200'}`}>{day.getDate()}</p>
                                    </div>
                                    <div className="space-y-2">
                                        {dayShifts.map(shift => (
                                            <ShiftCard key={shift.id} shift={shift} onClick={() => { setEditingShift(shift); setIsModalOpen(true); }} canEdit={canManageShifts} />
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <ShiftModal 
                    onClose={() => { setIsModalOpen(false); setEditingShift(null); }}
                    onSave={handleSaveShift}
                    onDelete={handleDeleteShift}
                    initialShift={editingShift}
                    allEmployees={visibleEmployees}
                    allShifts={shifts}
                    leaveRequests={leaveRequests}
                />
            )}
        </div>
    );
};

export default ShiftScheduling;
