
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Employee, LeaveRequest, Department } from '../types';
import { BarChartIcon, FileDownIcon, UsersIcon, CalendarIcon, BriefcaseIcon } from './icons';
import { apiService } from '../services/apiService';

interface ReportDefinition {
    key: string;
    name: string;
    description: string;
    icon: React.ElementType;
    generateData: (employees: Employee[], leaveRequests: LeaveRequest[]) => Record<string, any>[];
    columns: { key: keyof Employee | string, name: string }[];
    hasDeptFilter?: boolean;
}

const reportsList: { category: string; reports: ReportDefinition[] }[] = [
    {
        category: 'Workforce Overview',
        reports: [
            {
                key: 'all_employees',
                name: 'Complete Employee Directory',
                description: 'A full list of all active employees with key information.',
                icon: UsersIcon,
                hasDeptFilter: true,
                columns: [
                    { key: 'name', name: 'Name' },
                    { key: 'jobTitle', name: 'Job Title' },
                    { key: 'department', name: 'Department' },
                    { key: 'email', name: 'Email' },
                    { key: 'phone', name: 'Phone' },
                ],
                generateData: (employees) => employees.filter(e => e.employmentStatus === 'Active'),
            },
            {
                key: 'headcount_by_department',
                name: 'Headcount by Department',
                description: 'A summary of employee counts for each department.',
                icon: UsersIcon,
                columns: [
                    { key: 'department', name: 'Department' },
                    { key: 'headcount', name: 'Headcount' },
                ],
                generateData: (employees) => {
                    const counts = employees.reduce((acc, emp) => {
                        acc[emp.department] = (acc[emp.department] || 0) + 1;
                        return acc;
                    }, {} as Record<string, number>);
                    return Object.entries(counts).map(([department, headcount]) => ({ department, headcount }));
                },
            },
            {
                key: 'contract_ending',
                name: 'Contracts Ending Soon',
                description: 'Employees whose contracts expire in the next 90 days.',
                icon: BriefcaseIcon,
                hasDeptFilter: true,
                columns: [
                    { key: 'name', name: 'Name' },
                    { key: 'jobTitle', name: 'Job Title' },
                    { key: 'contractEndDate', name: 'Contract End Date' },
                ],
                generateData: (employees) => {
                    const ninetyDaysFromNow = new Date();
                    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
                    return employees.filter(e => e.contractEndDate && new Date(e.contractEndDate) <= ninetyDaysFromNow && new Date(e.contractEndDate) >= new Date());
                },
            },
        ],
    },
    {
        category: 'Leave & Attendance',
        reports: [
            {
                key: 'high_leave_balance',
                name: 'High Leave Balances',
                description: 'Employees with more than 15 days of annual leave remaining.',
                icon: CalendarIcon,
                hasDeptFilter: true,
                columns: [
                    { key: 'name', name: 'Name' },
                    { key: 'department', name: 'Department' },
                    { key: 'annualLeaveBalance', name: 'Leave Balance (Days)' },
                ],
                generateData: (employees) => employees.filter(e => e.annualLeaveBalance >= 15).sort((a,b) => b.annualLeaveBalance - a.annualLeaveBalance),
            },
        ],
    },
];

const ReportDataTable: React.FC<{ columns: {key: string, name: string}[], data: any[] }> = ({ columns, data }) => {
    const formatValue = (value: any) => {
        if (value instanceof Date) {
            return value.toLocaleDateString('en-CA');
        }
        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }
        if (value === null || value === undefined) {
            return 'N/A';
        }
        return String(value);
    };

    if (data.length === 0) {
        return <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <BarChartIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 font-semibold">No data to display</p>
            <p className="text-sm">The report is empty or all data has been filtered out.</p>
        </div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 sticky top-0">
                    <tr>
                        {columns.map(col => <th key={col.key} className="px-4 py-3">{col.name}</th>)}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            {columns.map(col => (
                                <td key={`${rowIndex}-${col.key}`} className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-300">
                                    {formatValue(row[col.key])}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const ReportsAnalytics: React.FC = () => {
    const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [pageIsLoading, setPageIsLoading] = useState(true);

    const [reportTitle, setReportTitle] = useState('Select a report');
    const [reportData, setReportData] = useState<any[]>([]);
    const [reportColumns, setReportColumns] = useState<{key: string, name: string}[]>([]);
    const [selectedReport, setSelectedReport] = useState<ReportDefinition | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Filters
    const [departmentFilter, setDepartmentFilter] = useState<string>('all');
    
    useEffect(() => {
        const fetchData = async () => {
            setPageIsLoading(true);
            try {
                const [emps, leaves] = await Promise.all([
                    apiService.getEmployees(),
                    apiService.getLeaveRequests(),
                ]);
                setAllEmployees(emps);
                setLeaveRequests(leaves);
            } catch (error) {
                console.error("Failed to fetch report data", error);
            } finally {
                setPageIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const departments = useMemo(() => [...new Set(allEmployees.map(e => e.department))], [allEmployees]);
    
    const filteredData = useMemo(() => {
        if (!reportData) return [];
        let data = [...reportData];
        if (departmentFilter !== 'all') {
            data = data.filter(row => row.department === departmentFilter);
        }
        return data;
    }, [reportData, departmentFilter]);


    const handleSelectReport = useCallback((reportDef: ReportDefinition) => {
        setIsGenerating(true);
        setReportTitle(reportDef.name);
        setReportColumns(reportDef.columns as {key: string, name: string}[]);
        setSelectedReport(reportDef);
        setDepartmentFilter('all');
        
        setTimeout(() => { // Simulate generation time
            setReportData(reportDef.generateData(allEmployees, leaveRequests));
            setIsGenerating(false);
        }, 500);
    }, [allEmployees, leaveRequests]);

    const exportToCsv = () => {
        if(filteredData.length === 0) return;
        const headers = reportColumns.map(c => c.name).join(',');
        const rows = filteredData.map(row => {
            return reportColumns.map(col => {
                const value = row[col.key];
                const stringValue = String(value ?? '');
                return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
            }).join(',');
        });
        
        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${reportTitle.replace(/ /g, '_').toLowerCase()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (pageIsLoading) {
        return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div></div>;
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full">
            {/* Left Sidebar */}
            <aside className="w-full lg:w-1/4 xl:w-1/5 flex-shrink-0">
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md h-full">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Report Library</h2>
                    <nav className="space-y-4">
                        {reportsList.map(category => (
                            <div key={category.category}>
                                <h3 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-2">{category.category}</h3>
                                <div className="space-y-1">
                                    {category.reports.map(report => (
                                        <button key={report.key} onClick={() => handleSelectReport(report)}
                                            className={`w-full flex items-start text-left gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                                                selectedReport?.key === report.key
                                                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-800/50 dark:text-white'
                                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                                            }`}
                                        >
                                            <report.icon className="w-5 h-5 mt-0.5 text-primary-500 flex-shrink-0"/>
                                            <span>{report.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{reportTitle}</h2>
                            <button onClick={exportToCsv} disabled={filteredData.length === 0 || !selectedReport}
                                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                <FileDownIcon className="w-4 h-4"/> Export CSV
                            </button>
                        </div>
                        
                        {selectedReport && selectedReport.hasDeptFilter && (
                            <div className="mb-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md">
                                <label htmlFor="departmentFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter by Department</label>
                                <select id="departmentFilter" value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)}
                                    className="w-full sm:w-1/2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                                >
                                    <option value="all">All Departments</option>
                                    {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                    
                    <div className="h-[calc(100vh-20rem)] overflow-y-auto">
                        {isGenerating 
                            ? <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div></div>
                            : <ReportDataTable columns={reportColumns} data={filteredData} />
                        }
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ReportsAnalytics;
