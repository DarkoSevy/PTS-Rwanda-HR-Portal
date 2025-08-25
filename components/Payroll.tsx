

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { DollarSignIcon, SteeringWheelIcon, PlusIcon, PencilIcon, XIcon, PrinterIcon, Trash2Icon } from './icons';
import { Role, User, Employee, Payslip, DriverAllowance } from '../types';
import { apiService } from '../services/apiService';

// --- MOCK DATA & CONFIG --- //
const initialAllowances: DriverAllowance[] = [
    { id: 'DA1', employeeId: 'E1001', employeeName: 'Aline Uwase', employeePhoto: 'https://picsum.photos/seed/aline/100/100', department: 'Drivers', allowanceAmount: 50000, effectiveDate: '2023-11-01', status: 'Active' },
];

// --- PAYROLL CALCULATION LOGIC (RWANDA) --- //
const calculatePaye = (taxableIncome: number): number => {
    if (taxableIncome <= 60000) return 0;
    if (taxableIncome <= 100000) return (taxableIncome - 60000) * 0.1;
    if (taxableIncome <= 200000) return 4000 + (taxableIncome - 100000) * 0.2;
    return 24000 + (taxableIncome - 200000) * 0.3;
};

const createPayslipForEmployee = (employee: Employee, allowances: DriverAllowance[], payPeriod: string): Payslip => {
    const activeAllowances = allowances.filter(a => a.employeeId === employee.id && a.status === 'Active');
    const allowancesTotal = activeAllowances.reduce((sum, a) => sum + a.allowanceAmount, 0);
    const allowanceDetails = activeAllowances.map(a => ({ description: "Driver's Mission Allowance", amount: a.allowanceAmount }));

    const grossSalary = employee.basicSalary + allowancesTotal;
    const rssbPension = grossSalary * 0.03;
    const payeTax = calculatePaye(grossSalary);
    const totalDeductions = rssbPension + payeTax;
    const netSalary = grossSalary - totalDeductions;

    return {
        id: `PS-${employee.id}-${payPeriod.replace(/ /g, '-')}`,
        employeeId: employee.id,
        payPeriod,
        basicSalary: employee.basicSalary,
        allowancesTotal,
        allowanceDetails,
        grossSalary,
        rssbPension,
        payeTax,
        totalDeductions,
        netSalary,
    };
};


// --- UI COMPONENTS --- //
const AllowanceModal: React.FC<{ onClose: () => void, onSave: (data: any) => void, allowance: DriverAllowance | null, allEmployees: Employee[] }> = ({ onClose, onSave, allowance, allEmployees }) => {
    const [formData, setFormData] = useState({
        employeeId: allowance?.employeeId || '',
        allowanceAmount: allowance?.allowanceAmount || '',
        effectiveDate: allowance?.effectiveDate || new Date().toISOString().split('T')[0],
        status: allowance?.status || 'Active',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{allowance ? 'Edit' : 'Add'} Driver Allowance</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Employee</label>
                                <select name="employeeId" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                                    <option value="">Select Employee...</option>
                                    {allEmployees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Allowance Amount (RWF)</label>
                                <input type="number" name="allowanceAmount" value={formData.allowanceAmount} onChange={e => setFormData({...formData, allowanceAmount: Number(e.target.value)})} required className="mt-1 w-full px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Effective Date</label>
                                <input type="date" name="effectiveDate" value={formData.effectiveDate} onChange={e => setFormData({...formData, effectiveDate: e.target.value})} required className="mt-1 w-full px-3 py-2 text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                                <select name="status" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as 'Active' | 'Inactive'})} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                                    <option>Active</option>
                                    <option>Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg shadow-md hover:bg-primary-600">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const PayslipDetailModal: React.FC<{ payslip: Payslip; employee: Employee; onClose: () => void }> = ({ payslip, employee, onClose }) => {
    const formatCurrency = (amount: number) => `${amount.toLocaleString('en-US')} RWF`;

    const handlePrint = () => {
        window.print();
    };
    
    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-2xl mx-4 transform transition-all" onClick={e => e.stopPropagation()}>
                <div id="payslip-to-print" className="p-8">
                     <style>{`
                        @media print {
                            body > *:not(#payslip-modal-container) { visibility: hidden; }
                            #payslip-modal-container, #payslip-modal-container * { visibility: visible; }
                            #payslip-modal-container { position: absolute; left: 0; top: 0; width: 100%; }
                            #payslip-to-print { color: black !important; background: white !important; }
                            #payslip-to-print h2, #payslip-to-print p, #payslip-to-print span, #payslip-to-print div, #payslip-to-print h3 { color: black !important; }
                            .no-print { display: none; }
                        }
                    `}</style>
                    <div className="text-center border-b-2 border-gray-200 dark:border-gray-700 pb-4">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">PTS Rwanda</h2>
                        <p className="text-gray-500 dark:text-gray-400">Payslip for {payslip.payPeriod}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                        <div><p className="font-semibold text-gray-700 dark:text-gray-300">Employee Name:</p><p>{employee.name}</p></div>
                        <div><p className="font-semibold text-gray-700 dark:text-gray-300">Employee ID:</p><p>{employee.id}</p></div>
                        <div><p className="font-semibold text-gray-700 dark:text-gray-300">Job Title:</p><p>{employee.jobTitle}</p></div>
                        <div><p className="font-semibold text-gray-700 dark:text-gray-300">Department:</p><p>{employee.department}</p></div>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold border-b pb-2">Earnings</h3>
                            <div className="mt-2 space-y-2 text-sm"><div className="flex justify-between"><span>Basic Salary</span> <span>{formatCurrency(payslip.basicSalary)}</span></div>
                                {payslip.allowanceDetails.map((ad, i) => (<div key={i} className="flex justify-between"><span>{ad.description}</span> <span>{formatCurrency(ad.amount)}</span></div>))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold border-b pb-2">Deductions</h3>
                            <div className="mt-2 space-y-2 text-sm">
                                <div className="flex justify-between"><span>PAYE Tax</span> <span>{formatCurrency(payslip.payeTax)}</span></div>
                                <div className="flex justify-between"><span>RSSB Pension (3%)</span> <span>{formatCurrency(payslip.rssbPension)}</span></div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 border-t-2 pt-4 space-y-3">
                         <div className="flex justify-between font-semibold"><span>Gross Salary</span> <span>{formatCurrency(payslip.grossSalary)}</span></div>
                         <div className="flex justify-between font-semibold text-red-600 dark:text-red-400"><span>Total Deductions</span> <span>{formatCurrency(payslip.totalDeductions)}</span></div>
                         <div className="flex justify-between font-bold text-xl text-primary-600 dark:text-primary-400 mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md"><span>Net Salary</span> <span>{formatCurrency(payslip.netSalary)}</span></div>
                    </div>
                </div>
                 <div className="no-print flex justify-end gap-3 p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Close</button>
                    <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg shadow-md hover:bg-primary-600">
                        <PrinterIcon className="w-5 h-5" /> Print
                    </button>
                </div>
            </div>
        </div>
    );
};


const Payroll: React.FC<{ user: User }> = ({ user }) => {
    const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
    const [pageIsLoading, setPageIsLoading] = useState(true);

    const [allowances, setAllowances] = useState<DriverAllowance[]>(initialAllowances);
    const [payslips, setPayslips] = useState<Payslip[]>([]);
    const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationSuccess, setGenerationSuccess] = useState(false);
    const [isAllowanceModalOpen, setIsAllowanceModalOpen] = useState(false);
    const [editingAllowance, setEditingAllowance] = useState<DriverAllowance | null>(null);

    const months = useMemo(() => [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ], []);
    const currentSystemYear = useMemo(() => new Date().getFullYear(), []);
    const years = useMemo(() => [currentSystemYear, currentSystemYear - 1, currentSystemYear - 2], [currentSystemYear]);

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(currentSystemYear);
    
    const payPeriod = useMemo(() => `${months[selectedMonth]} ${selectedYear}`, [selectedMonth, selectedYear, months]);
    
    useEffect(() => {
        const fetchData = async () => {
            setPageIsLoading(true);
            try {
                const emps = await apiService.getEmployees();
                setAllEmployees(emps);
            } catch (error) {
                console.error("Failed to fetch employees", error);
            } finally {
                setPageIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleGeneratePayslips = () => {
        setIsGenerating(true);
        setGenerationSuccess(false);
        setTimeout(() => {
            const generatedForPeriod = allEmployees.map(emp => createPayslipForEmployee(emp, allowances, payPeriod));
            setPayslips(prev => [...generatedForPeriod.filter(p => !prev.some(ep => ep.id === p.id)), ...prev]);
            setIsGenerating(false);
            setGenerationSuccess(true);
            setTimeout(() => setGenerationSuccess(false), 3000);
        }, 1500);
    };

    const handleViewPayslip = (payslip: Payslip) => setSelectedPayslip(payslip);
    
    const handleOpenAllowanceModal = (allowance: DriverAllowance | null = null) => {
        setEditingAllowance(allowance);
        setIsAllowanceModalOpen(true);
    };
    
    const handleSaveAllowance = (data: Omit<DriverAllowance, 'id' | 'employeeName' | 'employeePhoto' | 'department'>) => {
        const employee = allEmployees.find(e => e.id === data.employeeId);
        if (!employee) return;

        if (editingAllowance) { // Update
            setAllowances(prev => prev.map(a => a.id === editingAllowance.id ? { ...editingAllowance, ...data, employeeName: employee.name, employeePhoto: employee.photoUrl, department: employee.department } : a));
        } else { // Add new
            const newAllowance: DriverAllowance = {
                id: `DA${Date.now()}`,
                ...data,
                employeeName: employee.name,
                employeePhoto: employee.photoUrl,
                department: employee.department
            };
            setAllowances(prev => [newAllowance, ...prev]);
        }
        setIsAllowanceModalOpen(false);
    };

    const handleDeleteAllowance = (id: string) => {
        setAllowances(prev => prev.filter(a => a.id !== id));
    };

    const formatCurrency = (amount: number) => `${amount.toLocaleString('en-US')} RWF`;

    const renderContent = () => {
        if (pageIsLoading) {
            return <div className="flex justify-center items-center h-full py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div></div>;
        }

        if (user.role === Role.HRAdmin) {
            return (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Payslip Generation</h2>
                        <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
                            <div className="w-full sm:w-1/2">
                                <label htmlFor="pay-month" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Month</label>
                                <select id="pay-month" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                                    {months.map((month, index) => <option key={month} value={index}>{month}</option>)}
                                </select>
                            </div>
                            <div className="w-full sm:w-1/2">
                                <label htmlFor="pay-year" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Year</label>
                                <select id="pay-year" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                                    {years.map(year => <option key={year} value={year}>{year}</option>)}
                                </select>
                            </div>
                        </div>
                        <button onClick={handleGeneratePayslips} disabled={isGenerating || generationSuccess} className="mt-6 w-full px-6 py-2.5 bg-primary-500 text-white font-semibold rounded-lg shadow-md hover:bg-primary-600 transition-colors disabled:bg-primary-300 disabled:cursor-not-allowed">
                            {isGenerating ? 'Generating...' : generationSuccess ? 'Generated Successfully!' : `Generate Payslips for ${payPeriod}`}
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
                             <h3 className="text-xl font-semibold">Driver Allowance Management</h3>
                             <button onClick={() => handleOpenAllowanceModal()} className="flex items-center gap-1 px-2.5 py-1.5 bg-primary-500 text-white text-xs font-semibold rounded-lg shadow-md hover:bg-primary-600">
                                <PlusIcon className="w-4 h-4"/> Add Allowance
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th className="px-4 py-3">Employee</th><th className="px-4 py-3">Amount</th>
                                        <th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allowances.map(a => (
                                    <tr key={a.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{a.employeeName}</td>
                                        <td className="px-4 py-3">{formatCurrency(a.allowanceAmount)}</td>
                                        <td className="px-4 py-3">{a.status}</td>
                                        <td className="px-4 py-3 text-right space-x-2">
                                            <button onClick={() => handleOpenAllowanceModal(a)} className="p-1 text-blue-600 hover:text-blue-800"><PencilIcon className="w-4 h-4"/></button>
                                            <button onClick={() => handleDeleteAllowance(a.id)} className="p-1 text-red-600 hover:text-red-800"><Trash2Icon className="w-4 h-4"/></button>
                                        </td>
                                    </tr>
                                    ))}
                                    {allowances.length === 0 && <tr><td colSpan={4} className="text-center py-6 text-gray-500">No allowances configured.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Payroll History</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr><th className="px-4 py-3">Employee</th><th className="px-4 py-3">Pay Period</th><th className="px-4 py-3">Net Salary</th><th className="px-4 py-3 text-right">Actions</th></tr>
                                </thead>
                                <tbody className="text-gray-600 dark:text-gray-300">
                                    {payslips.map(ps => { const emp = allEmployees.find(e => e.id === ps.employeeId); return (
                                        <tr key={ps.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{emp?.name || 'N/A'}</td>
                                            <td className="px-4 py-3">{ps.payPeriod}</td>
                                            <td className="px-4 py-3 font-semibold">{formatCurrency(ps.netSalary)}</td>
                                            <td className="px-4 py-3 text-right"><button onClick={() => handleViewPayslip(ps)} className="font-medium text-primary-600 dark:text-primary-500 hover:underline">View Details</button></td>
                                        </tr>
                                    );})}
                                    {payslips.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-500">No payslips generated yet.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            );
        }

        if (user.role === Role.Employee) {
            const employeePayslips = payslips.filter(p => p.employeeId === user.id);
            return (
                 <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4">My Payslips</h3>
                     <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr><th className="px-4 py-3">Pay Period</th><th className="px-4 py-3">Net Salary</th><th className="px-4 py-3 text-right">Actions</th></tr>
                            </thead>
                             <tbody className="text-gray-600 dark:text-gray-300">
                                {employeePayslips.map(ps => (
                                    <tr key={ps.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-4 py-3 font-medium">{ps.payPeriod}</td><td className="px-4 py-3 font-semibold">{formatCurrency(ps.netSalary)}</td>
                                        <td className="px-4 py-3 text-right"><button onClick={() => handleViewPayslip(ps)} className="font-medium text-primary-600 dark:text-primary-500 hover:underline">View / Download</button></td>
                                    </tr>
                                ))}
                                 {employeePayslips.length === 0 && <tr><td colSpan={3} className="text-center py-8 text-gray-500">Your payslips will appear here once generated by HR.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        return (
             <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md text-center"><DollarSignIcon className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold">Payroll Information</h3><p className="text-gray-500 mt-2">Payroll is managed by the HR department.</p>
            </div>
        );
    };

    const employeeForModal = useMemo(() => {
        if (!selectedPayslip) return undefined;
        return allEmployees.find(e => e.id === selectedPayslip.employeeId);
    }, [selectedPayslip, allEmployees]);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Payroll & Compensation</h1>
            <p className="text-gray-600 dark:text-gray-400">Generate payslips and manage special compensations.</p>
            <div className="mt-6">{renderContent()}</div>
            {selectedPayslip && employeeForModal && (<div id="payslip-modal-container"><PayslipDetailModal payslip={selectedPayslip} employee={employeeForModal} onClose={() => setSelectedPayslip(null)} /></div>)}
            {isAllowanceModalOpen && <AllowanceModal onClose={() => setIsAllowanceModalOpen(false)} onSave={handleSaveAllowance} allowance={editingAllowance} allEmployees={allEmployees} />}
        </div>
    );
};

export default Payroll;