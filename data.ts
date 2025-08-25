

import { Role, User, Skill, Employee, EmployeeRecordType, EmploymentStatus, ContractType, PayFrequency, LeaveRequest, LeaveStatus, Shift } from './types';

// --- MOCK DATA ---
export const mockSkills: { [key: string]: Skill } = {
  driving: { id: 's1', name: 'Heavy Vehicle Driving', category: 'Technical' },
  maintenance: { id: 's2', name: 'Basic Vehicle Maintenance', category: 'Technical' },
  logistics: { id: 's3', name: 'Logistics Planning', category: 'Technical' },
  customer: { id: 's4', name: 'Customer Service', category: 'Soft' },
  safety: { id: 's5', name: 'Safety Compliance', category: 'Technical' },
  kinyarwanda: { id: 's6', name: 'Kinyarwanda', category: 'Language' },
  communication: { id: 's7', name: 'Communication', category: 'Soft' },
  leadership: { id: 's8', name: 'Team Leadership', category: 'Soft' },
  accounting: { id: 's9', name: 'Accounting', category: 'Technical' },
  french: {id: 's10', name: 'French', category: 'Language' },
  refrigerated: {id: 's11', name: 'Refrigerated Transport', category: 'Technical' },
  crossborder: {id: 's12', name: 'Cross-Border Transport', category: 'Technical' },
  itSupport: {id: 's13', name: 'IT Support', category: 'Technical' },
  procurement: {id: 's14', name: 'Procurement', category: 'Technical' },
  sales: {id: 's15', name: 'Sales & Marketing', category: 'Soft' },
};

export const allSkillsList = Object.values(mockSkills);

export const mockUsers: { [key in Role]: User } = {
  [Role.Employee]: { id: 'E1001', name: 'Aline Uwase', role: Role.Employee, avatar: 'https://picsum.photos/seed/aline/100/100' },
  [Role.Manager]: { id: 'M2001', name: 'Jeanette Ingabire', role: Role.Manager, avatar: 'https://picsum.photos/seed/jeanette/100/100' },
  [Role.HRAdmin]: { id: 'H3001', name: 'Didier Mutangana', role: Role.HRAdmin, avatar: 'https://picsum.photos/seed/didier/100/100' },
  [Role.ITAdmin]: { id: 'IT4001', name: 'Chris Habimana', role: Role.ITAdmin, avatar: 'https://picsum.photos/seed/chris/100/100' },
};

const createEmptyEmployeeFields = () => ({
    records: [],
    benefits: [],
    accessLogs: [],
    documents: [],
    promotionHistory: [],
    transferHistory: [],
    assignedAssets: [],
    editHistory: [],
});

export const initialMockEmployees: Employee[] = [
    { 
        id: 'E1001', name: 'Aline Uwase', photoUrl: 'https://picsum.photos/seed/aline/100/100', gender: 'Female',
        jobTitle: 'Heavy Vehicle Driver', department: 'Operations', managerId: 'E1012',
        email: 'aline.u@pts.rw', phone: '0788111111', address: 'KG 1 Ave, Kigali',
        emergencyContact: { name: 'Gisele Uwera', phone: '0788999999'},
        employmentType: 'Permanent', employmentStatus: EmploymentStatus.Active, dateOfHire: '2021-03-01',
        contractType: ContractType.FullTime,
        probation: { status: 'Passed', startDate: '2021-03-01', endDate: '2021-06-01', evaluationResult: 'Exceeded expectations' },
        jobGrade: 'L3', workLocation: 'Kigali Head Office',
        basicSalary: 450000, payFrequency: PayFrequency.Monthly, annualLeaveBalance: 18,
        skills: [mockSkills.driving, mockSkills.maintenance, mockSkills.safety, mockSkills.kinyarwanda, mockSkills.french], 
        records: [
            { id: 'R1', type: EmployeeRecordType.Achievement, date: '2023-08-15', description: 'Employee of the Month for outstanding safety record.', addedBy: 'Didier Mutangana' },
            { id: 'R2', type: EmployeeRecordType.Warning, date: '2023-05-20', description: 'Verbal warning for late submission of trip logs.', addedBy: 'Jeanette Ingabire' },
        ], 
        benefits: [{planId: 'B1', enrollmentDate: '2023-01-01', status: 'Active'}], 
        accessLogs: [],
        documents: [],
        promotionHistory: [],
        transferHistory: [],
        assignedAssets: [{ id: 'A1', name: 'Truck SCANIA-R450', type: 'Vehicle', assignedDate: '2022-01-15' }],
        editHistory: [],
        isHighPotential: true,
        successionStatus: 'Ready in 1-2 years',
    },
    { 
        id: 'E1002', name: 'Bosco Ndayisenga', photoUrl: 'https://picsum.photos/seed/bosco/100/100', gender: 'Male',
        jobTitle: 'Tour Operations Officer', department: 'Commercial', managerId: 'E1027',
        email: 'bosco.n@pts.rw', phone: '0788222222', address: 'KN 2 St, Kigali',
        emergencyContact: { name: 'David Ingabire', phone: '0788888888' },
        employmentType: 'Permanent', employmentStatus: EmploymentStatus.Active, dateOfHire: '2020-07-20',
        contractType: ContractType.FullTime,
        probation: { status: 'Passed', startDate: '2020-07-20', endDate: '2020-10-20' },
        jobGrade: 'L5', workLocation: 'Kigali Head Office',
        basicSalary: 600000, payFrequency: PayFrequency.Monthly, annualLeaveBalance: 8,
        skills: [mockSkills.logistics, mockSkills.customer, mockSkills.communication, mockSkills.kinyarwanda], 
        records: [], 
        benefits: [{planId: 'B1', enrollmentDate: '2023-01-01', status: 'Active'}, {planId: 'B2', enrollmentDate: '2023-01-01', status: 'Active'}], 
        accessLogs: [],
        documents: [],
        promotionHistory: [{ date: '2022-01-01', from: 'Junior Logistics Officer', to: 'Logistics Coordinator' }],
        transferHistory: [],
        assignedAssets: [{ id: 'A2', name: 'Dell Latitude 7420', type: 'Laptop', assignedDate: '2020-07-20' }],
        editHistory: [],
    },
    { 
        id: 'E1003', name: 'Carine Umutesi', photoUrl: 'https://picsum.photos/seed/carine/100/100', gender: 'Female',
        jobTitle: 'Maintenance Officer', department: 'Operations', managerId: 'M2001',
        email: 'carine.u@pts.rw', phone: '0788333333', address: 'KG 9 Ave, Kigali',
        emergencyContact: { name: 'Chloe Mutangana', phone: '0788777777' },
        employmentType: 'Contract', employmentStatus: EmploymentStatus.Active, dateOfHire: '2022-02-10',
        contractType: ContractType.FixedTerm, contractStartDate: '2022-02-10', contractEndDate: '2024-02-09',
        probation: { status: 'Not Applicable' },
        jobGrade: 'L4', workLocation: 'Kigali Workshop',
        basicSalary: 550000, payFrequency: PayFrequency.Monthly, annualLeaveBalance: 12,
        skills: [mockSkills.maintenance, mockSkills.leadership, mockSkills.safety], 
        records: [], 
        benefits: [], 
        accessLogs: [],
        documents: [],
        promotionHistory: [],
        transferHistory: [],
        assignedAssets: [],
        editHistory: [],
    },
    { 
        id: 'H3001', name: 'Didier Mutangana', photoUrl: 'https://picsum.photos/seed/didier/100/100', gender: 'Male',
        jobTitle: 'HR Manager', department: 'Administration & Finance', managerId: 'E1005',
        email: 'didier.m@pts.rw', phone: '0788444444', address: 'KG 200 St, Gaculiro',
        emergencyContact: { name: 'Eva Mutangana', phone: '0788666666' },
        employmentType: 'Permanent', employmentStatus: EmploymentStatus.Active, dateOfHire: '2019-01-15',
        contractType: ContractType.FullTime,
        probation: { status: 'Passed', startDate: '2019-01-15', endDate: '2019-04-15' },
        jobGrade: 'L6', workLocation: 'Kigali Head Office',
        basicSalary: 700000, payFrequency: PayFrequency.Monthly, annualLeaveBalance: 20,
        skills: [mockSkills.communication, mockSkills.accounting],
        records: [],
        benefits: [{planId: 'B1', enrollmentDate: '2023-01-01', status: 'Active'}],
        accessLogs: [],
        documents: [],
        promotionHistory: [],
        transferHistory: [],
        assignedAssets: [{ id: 'A3', name: 'HP Elitebook', type: 'Laptop', assignedDate: '2019-01-15' }],
        editHistory: [],
    },
    { 
        id: 'M2001', name: 'Jeanette Ingabire', photoUrl: 'https://picsum.photos/seed/jeanette/100/100', gender: 'Female',
        jobTitle: 'Director Operations', department: 'Operations', managerId: 'E1004',
        email: 'jeanette.i@pts.rw', phone: '0788222222', address: 'KN 2 St, Kigali',
        emergencyContact: { name: 'David Ingabire', phone: '0788888888' },
        employmentType: 'Permanent', employmentStatus: EmploymentStatus.Active, dateOfHire: '2018-05-01',
        contractType: ContractType.FullTime,
        probation: { status: 'Passed', startDate: '2018-05-01', endDate: '2018-08-01' },
        jobGrade: 'L7', workLocation: 'Kigali Head Office',
        basicSalary: 800000, payFrequency: PayFrequency.Monthly, annualLeaveBalance: 15,
        skills: [mockSkills.leadership, mockSkills.communication],
        records: [],
        benefits: [],
        accessLogs: [],
        documents: [],
        promotionHistory: [],
        transferHistory: [],
        assignedAssets: [{ id: 'A4', name: 'Macbook Pro', type: 'Laptop', assignedDate: '2018-05-01' }],
        editHistory: [],
    },
    { 
        id: 'E1004', name: 'Emmanuel Gatera', photoUrl: 'https://picsum.photos/seed/emmanuel/100/100', gender: 'Male',
        jobTitle: 'Managing Director', department: 'Executive',
        email: 'emmanuel.g@pts.rw', phone: '0788555555', address: 'KG 5 Ave, Kigali',
        emergencyContact: { name: 'Sarah Gatera', phone: '0788444444'},
        employmentType: 'Permanent', employmentStatus: EmploymentStatus.Active, dateOfHire: '2017-01-01',
        contractType: ContractType.FullTime,
        probation: { status: 'Passed', startDate: '2017-01-01', endDate: '2017-04-01' },
        jobGrade: 'L8', workLocation: 'Kigali Head Office',
        basicSalary: 1200000, payFrequency: PayFrequency.Monthly, annualLeaveBalance: 22,
        skills: [mockSkills.leadership, mockSkills.communication], 
        records: [],
        benefits: [],
        accessLogs: [],
        documents: [],
        promotionHistory: [],
        transferHistory: [],
        assignedAssets: [{ id: 'A5', name: 'Toyota Land Cruiser', type: 'Vehicle', assignedDate: '2017-01-15' }],
        editHistory: [],
    },
    { 
        id: 'E1005', name: 'Grace Kabeja', photoUrl: 'https://picsum.photos/seed/grace/100/100', gender: 'Female',
        jobTitle: 'Director Administration & Finance', department: 'Administration & Finance', managerId: 'E1004',
        email: 'grace.k@pts.rw', phone: '0788666666', address: 'KG 6 Ave, Kigali',
        emergencyContact: { name: 'Peter Kabeja', phone: '0788333333'},
        employmentType: 'Permanent', employmentStatus: EmploymentStatus.Active, dateOfHire: '2018-01-01',
        contractType: ContractType.FullTime,
        probation: { status: 'Passed', startDate: '2018-01-01', endDate: '2018-04-01' },
        jobGrade: 'L7', workLocation: 'Kigali Head Office',
        basicSalary: 900000, payFrequency: PayFrequency.Monthly, annualLeaveBalance: 4,
        skills: [mockSkills.leadership, mockSkills.communication, mockSkills.accounting], 
        records: [],
        benefits: [],
        accessLogs: [],
        documents: [],
        promotionHistory: [],
        transferHistory: [],
        assignedAssets: [{ id: 'A6', name: 'HP Spectre', type: 'Laptop', assignedDate: '2018-01-15' }],
        editHistory: [],
    },
    // --- Newly Added Employees ---
    {
        id: 'E1006', name: 'Olivier Nshimiyimana', photoUrl: 'https://picsum.photos/seed/olivier/100/100', gender: 'Male',
        jobTitle: 'Deputy Managing Director', department: 'Executive', managerId: 'E1004',
        email: 'olivier.n@pts.rw', phone: '0788100100', address: 'KG 10 Ave, Kigali',
        emergencyContact: { name: 'Linda Nshimiye', phone: '0788100101' },
        employmentType: 'Permanent', employmentStatus: EmploymentStatus.Active, dateOfHire: '2022-01-10',
        contractType: ContractType.FullTime, probation: { status: 'Passed' },
        basicSalary: 1100000, payFrequency: PayFrequency.Monthly, annualLeaveBalance: 18,
        skills: [mockSkills.leadership, mockSkills.communication, mockSkills.logistics],
        ...createEmptyEmployeeFields()
    },
    {
        id: 'E1007', name: 'Chantal Hakizimana', photoUrl: 'https://picsum.photos/seed/chantal/100/100', gender: 'Female',
        jobTitle: 'Internal Auditor', department: 'Executive', managerId: 'E1004',
        email: 'chantal.h@pts.rw', phone: '0788100200', address: 'KG 11 Ave, Kigali',
        emergencyContact: { name: 'Eric Hakizimana', phone: '0788100201' },
        employmentType: 'Permanent', employmentStatus: EmploymentStatus.Active, dateOfHire: '2021-11-05',
        contractType: ContractType.FullTime, probation: { status: 'Passed' },
        basicSalary: 750000, payFrequency: PayFrequency.Monthly, annualLeaveBalance: 18,
        skills: [mockSkills.accounting, mockSkills.safety],
        ...createEmptyEmployeeFields()
    },
    {
        id: 'IT4001', name: 'Chris Habimana', photoUrl: 'https://picsum.photos/seed/chris/100/100', gender: 'Male',
        jobTitle: 'IT Officer', department: 'Executive', managerId: 'E1005',
        email: 'chris.h@pts.rw', phone: '0788100300', address: 'KG 12 Ave, Kigali',
        emergencyContact: { name: 'Diane Habimana', phone: '0788100301' },
        employmentType: 'Permanent', employmentStatus: EmploymentStatus.Active, dateOfHire: '2022-03-15',
        contractType: ContractType.FullTime, probation: { status: 'Passed' },
        basicSalary: 600000, payFrequency: PayFrequency.Monthly, annualLeaveBalance: 18,
        skills: [mockSkills.itSupport, mockSkills.communication],
        ...createEmptyEmployeeFields()
    },
    {
        id: 'E1010', name: 'Josiane Dusengimana', photoUrl: 'https://picsum.photos/seed/josiane/100/100', gender: 'Female',
        jobTitle: 'Procurement Officer', department: 'Executive', managerId: 'E1005',
        email: 'josiane.d@pts.rw', phone: '0788100400', address: 'KG 13 Ave, Kigali',
        emergencyContact: { name: 'Kevin Dusengimana', phone: '0788100401' },
        employmentType: 'Permanent', employmentStatus: EmploymentStatus.Active, dateOfHire: '2021-08-20',
        contractType: ContractType.FullTime, probation: { status: 'Passed' },
        basicSalary: 580000, payFrequency: PayFrequency.Monthly, annualLeaveBalance: 18,
        skills: [mockSkills.procurement, mockSkills.communication],
        ...createEmptyEmployeeFields()
    },
    {
        id: 'E1012', name: 'Patrick Irankunda', photoUrl: 'https://picsum.photos/seed/patrick/100/100', gender: 'Male',
        jobTitle: 'Fleet Manager', department: 'Operations', managerId: 'M2001',
        email: 'patrick.i@pts.rw', phone: '0788100500', address: 'KG 14 Ave, Kigali',
        emergencyContact: { name: 'Esther Irankunda', phone: '0788100501' },
        employmentType: 'Permanent', employmentStatus: EmploymentStatus.Active, dateOfHire: '2020-02-18',
        contractType: ContractType.FullTime, probation: { status: 'Passed' },
        basicSalary: 700000, payFrequency: PayFrequency.Monthly, annualLeaveBalance: 18,
        skills: [mockSkills.logistics, mockSkills.leadership, mockSkills.maintenance],
        ...createEmptyEmployeeFields()
    },
    {
        id: 'E1014', name: 'David Cyusa', photoUrl: 'https://picsum.photos/seed/david/100/100', gender: 'Male',
        jobTitle: 'Garage Technician', department: 'Operations', managerId: 'E1003',
        email: 'david.c@pts.rw', phone: '0788100600', address: 'KG 15 Ave, Kigali',
        emergencyContact: { name: 'Sandrine Cyusa', phone: '0788100601' },
        employmentType: 'Permanent', employmentStatus: EmploymentStatus.Active, dateOfHire: '2022-09-01',
        contractType: ContractType.FullTime, probation: { status: 'Passed' },
        basicSalary: 350000, payFrequency: PayFrequency.Monthly, annualLeaveBalance: 18,
        skills: [mockSkills.maintenance],
        ...createEmptyEmployeeFields()
    },
    {
        id: 'E1019', name: 'Daniel Hakizimana', photoUrl: 'https://picsum.photos/seed/daniel/100/100', gender: 'Male',
        jobTitle: 'Chief Accountant', department: 'Administration & Finance', managerId: 'E1005',
        email: 'daniel.h@pts.rw', phone: '0788100700', address: 'KG 16 Ave, Kigali',
        emergencyContact: { name: 'Solange Hakizimana', phone: '0788100701' },
        employmentType: 'Permanent', employmentStatus: EmploymentStatus.Active, dateOfHire: '2019-06-11',
        contractType: ContractType.FullTime, probation: { status: 'Passed' },
        basicSalary: 720000, payFrequency: PayFrequency.Monthly, annualLeaveBalance: 18,
        skills: [mockSkills.accounting, mockSkills.leadership],
        ...createEmptyEmployeeFields()
    },
    {
        id: 'E1024', name: 'Noella Manzi', photoUrl: 'https://picsum.photos/seed/noella/100/100', gender: 'Female',
        jobTitle: 'Receptionist', department: 'Administration & Finance', managerId: 'H3001',
        email: 'noella.m@pts.rw', phone: '0788100800', address: 'KG 17 Ave, Kigali',
        emergencyContact: { name: 'Fabrice Manzi', phone: '0788100801' },
        employmentType: 'Permanent', employmentStatus: EmploymentStatus.Active, dateOfHire: '2023-01-09',
        contractType: ContractType.FullTime, probation: { status: 'Passed' },
        basicSalary: 300000, payFrequency: PayFrequency.Monthly, annualLeaveBalance: 18,
        skills: [mockSkills.communication, mockSkills.customer],
        ...createEmptyEmployeeFields()
    },
    {
        id: 'E1026', name: 'Eliane Keza', photoUrl: 'https://picsum.photos/seed/eliane/100/100', gender: 'Female',
        jobTitle: 'Director Commercial', department: 'Commercial', managerId: 'E1004',
        email: 'eliane.k@pts.rw', phone: '0788100900', address: 'KG 18 Ave, Kigali',
        emergencyContact: { name: 'Claude Keza', phone: '0788100901' },
        employmentType: 'Permanent', employmentStatus: EmploymentStatus.Active, dateOfHire: '2021-04-12',
        contractType: ContractType.FullTime, probation: { status: 'Passed' },
        basicSalary: 900000, payFrequency: PayFrequency.Monthly, annualLeaveBalance: 18,
        skills: [mockSkills.leadership, mockSkills.sales, mockSkills.communication],
        ...createEmptyEmployeeFields()
    },
    {
        id: 'E1027', name: 'Claude Rugamba', photoUrl: 'https://picsum.photos/seed/claude/100/100', gender: 'Male',
        jobTitle: 'Tour Operations Manager', department: 'Commercial', managerId: 'E1026',
        email: 'claude.r@pts.rw', phone: '0788101000', address: 'KG 19 Ave, Kigali',
        emergencyContact: { name: 'Fiona Rugamba', phone: '0788101001' },
        employmentType: 'Permanent', employmentStatus: EmploymentStatus.Active, dateOfHire: '2021-07-22',
        contractType: ContractType.FullTime, probation: { status: 'Passed' },
        basicSalary: 700000, payFrequency: PayFrequency.Monthly, annualLeaveBalance: 18,
        skills: [mockSkills.logistics, mockSkills.customer, mockSkills.leadership],
        ...createEmptyEmployeeFields()
    },
     {
        id: 'E1028', name: 'Fiona Gakire', photoUrl: 'https://picsum.photos/seed/fiona/100/100', gender: 'Female',
        jobTitle: 'Sales & Marketing Manager', department: 'Commercial', managerId: 'E1026',
        email: 'fiona.g@pts.rw', phone: '0788101100', address: 'KG 20 Ave, Kigali',
        emergencyContact: { name: 'Jean Gakire', phone: '0788101101' },
        employmentType: 'Permanent', employmentStatus: EmploymentStatus.Active, dateOfHire: '2022-05-30',
        contractType: ContractType.FullTime, probation: { status: 'Passed' },
        basicSalary: 720000, payFrequency: PayFrequency.Monthly, annualLeaveBalance: 18,
        skills: [mockSkills.sales, mockSkills.communication, mockSkills.leadership],
        ...createEmptyEmployeeFields()
    },
    // Filling the rest of the roles
    { id: 'E1013', name: 'Esther Manzi', photoUrl: 'https://picsum.photos/seed/esther/100/100', gender: 'Female', jobTitle: 'Inspection & Compliance Officer', department: 'Operations', managerId: 'M2001', email: 'esther.m@pts.rw', phone: '0788101200', address: 'KG 21 Ave, Kigali', emergencyContact: { name: 'David Manzi', phone: '0788101201' }, employmentType: 'Permanent', employmentStatus: EmploymentStatus.Active, dateOfHire: '2021-09-01', contractType: ContractType.FullTime, probation: { status: 'Passed' }, basicSalary: 550000, payFrequency: PayFrequency.Monthly, annualLeaveBalance: 18, skills: [mockSkills.safety], ...createEmptyEmployeeFields() },
    { id: 'E1015', name: 'Sandrine Keza', photoUrl: 'https://picsum.photos/seed/sandrine/100/100', gender: 'Female', jobTitle: 'Fuel Management Officer', department: 'Operations', managerId: 'E1012', email: 'sandrine.k@pts.rw', phone: '0788101300', address: 'KG 22 Ave, Kigali', emergencyContact: { name: 'Kevin Keza', phone: '0788101301' }, employmentType: 'Permanent', employmentStatus: EmploymentStatus.Active, dateOfHire: '2022-04-11', contractType: ContractType.FullTime, probation: { status: 'Passed' }, basicSalary: 500000, payFrequency: PayFrequency.Monthly, annualLeaveBalance: 18, skills: [mockSkills.logistics], ...createEmptyEmployeeFields() },
    { id: 'E1017', name: 'Samuel Gakire', photoUrl: 'https://picsum.photos/seed/samuel/100/100', gender: 'Male', jobTitle: 'Heavy Vehicle Driver', department: 'Operations', managerId: 'E1012', email: 'samuel.g@pts.rw', phone: '0788101400', address: 'KG 23 Ave, Kigali', emergencyContact: { name: 'Marie Gakire', phone: '0788101401' }, employmentType: 'Permanent', employmentStatus: EmploymentStatus.Active, dateOfHire: '2023-02-20', contractType: ContractType.FullTime, probation: { status: 'Passed' }, basicSalary: 380000, payFrequency: PayFrequency.Monthly, annualLeaveBalance: 18, skills: [mockSkills.driving, mockSkills.safety], ...createEmptyEmployeeFields() },
    { id: 'E1020', name: 'Solange Mugisha', photoUrl: 'https://picsum.photos/seed/solange/100/100', gender: 'Female', jobTitle: 'Accountant', department: 'Administration & Finance', managerId: 'E1019', email: 'solange.m@pts.rw', phone: '0788101500', address: 'KG 24 Ave, Kigali', emergencyContact: { name: 'Yves Mugisha', phone: '0788101501' }, employmentType: 'Permanent', employmentStatus: EmploymentStatus.Active, dateOfHire: '2020-10-10', contractType: ContractType.FullTime, probation: { status: 'Passed' }, basicSalary: 550000, payFrequency: PayFrequency.Monthly, annualLeaveBalance: 18, skills: [mockSkills.accounting], ...createEmptyEmployeeFields() },
    { id: 'E1029', name: 'Jean Nshimiyimana', photoUrl: 'https://picsum.photos/seed/jean/100/100', gender: 'Male', jobTitle: 'Sales Officer', department: 'Commercial', managerId: 'E1028', email: 'jean.n@pts.rw', phone: '0788101600', address: 'KG 25 Ave, Kigali', emergencyContact: { name: 'Linda Nshimiye', phone: '0788101601' }, employmentType: 'Permanent', employmentStatus: EmploymentStatus.Active, dateOfHire: '2022-11-01', contractType: ContractType.FullTime, probation: { status: 'Passed' }, basicSalary: 500000, payFrequency: PayFrequency.Monthly, annualLeaveBalance: 18, skills: [mockSkills.sales, mockSkills.customer], ...createEmptyEmployeeFields() },

];

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const createDate = (daysOffset: number = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date;
};

export const initialMockLeaveRequests: LeaveRequest[] = [
    { id: 'LR1', employeeId: 'E1002', startDate: formatDate(createDate(-5)), endDate: formatDate(createDate(2)), type: 'Annual Leave', status: LeaveStatus.Approved, reason: 'Family vacation' },
    { id: 'LR2', employeeId: 'E1003', startDate: formatDate(createDate(-10)), endDate: formatDate(createDate(3)), type: 'Annual Leave', status: LeaveStatus.Approved, reason: 'Trip' },
    { id: 'LR3', employeeId: 'E1001', startDate: formatDate(createDate(7)), endDate: formatDate(createDate(14)), type: 'Annual Leave', status: LeaveStatus.Pending, reason: 'Extended vacation' },
    { id: 'LR4', employeeId: 'E1001', startDate: '2023-11-10', endDate: '2023-11-11', type: 'Sick Leave', status: LeaveStatus.Approved, reason: 'Flu' },
    { id: 'LR5', employeeId: 'E1005', startDate: '2023-10-01', endDate: '2023-10-05', type: 'Sick Leave', status: LeaveStatus.Approved, reason: 'Medical appointment' },
];

const getTodayAt = (hour: number, dayOffset = 0): string => {
    const today = new Date();
    today.setDate(today.getDate() + dayOffset);
    today.setHours(hour, 0, 0, 0);
    return today.toISOString();
}

export const initialMockShifts: Shift[] = [
    // Today
    { id: 'S1', employeeId: 'E1001', startTime: getTodayAt(6), endTime: getTodayAt(18), title: 'Kigali -> Gisenyi Route' },
    { id: 'S2', employeeId: 'E1002', startTime: getTodayAt(9), endTime: getTodayAt(17), title: 'Office Duty' },
    // Yesterday
    { id: 'S3', employeeId: 'E1003', startTime: getTodayAt(8, -1), endTime: getTodayAt(16, -1), title: 'Workshop Maintenance' },
    { id: 'S4', employeeId: 'E1001', startTime: getTodayAt(5, -1), endTime: getTodayAt(19, -1), title: 'Huye -> Kigali Return' },
    // Tomorrow
    { id: 'S5', employeeId: 'E1001', startTime: getTodayAt(7, 1), endTime: getTodayAt(15, 1), title: 'Kigali Local Deliveries' },
    { id: 'S6', employeeId: 'E1002', startTime: getTodayAt(10, 1), endTime: getTodayAt(18, 1), title: 'Client Meeting Prep' },
    // Next week for testing
    { id: 'S7', employeeId: 'E1001', startTime: getTodayAt(8, 7), endTime: getTodayAt(12, 7), title: 'Vehicle Inspection' },
];
