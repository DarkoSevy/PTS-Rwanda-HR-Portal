
import { JobDescription, Employee, TalentAnalysis, Insight, LeaveRequest, Announcement, Department, JobPosition, TrainingProgram, EmployeeTraining, ComplianceDocument, EmployeeAcknowledgement, Shift, BenefitPlan, Role, User } from '../types';

/**
 * Mocks a network call to a backend API endpoint.
 * In a real application, this would be a `fetch` call.
 * @param endpoint The API endpoint to call (e.g., '/api/generate-insights').
 * @param body The request body.
 * @param mockResponse The simulated response data from the server.
 * @param delay The simulated network latency in milliseconds.
 * @returns A promise that resolves with the mock response data.
 */
const mockApiCall = <T,>(endpoint: string, body: any, mockResponse: T, delay: number = 1500): Promise<T> => {
  return new Promise((resolve) => {
    console.log(`[MOCK API] Calling ${endpoint} with body:`, body);
    setTimeout(() => {
        console.log(`[MOCK API] Successful response from ${endpoint}:`, mockResponse);
        resolve(mockResponse);
    }, delay);
  });
};

import { database } from '../server/db';

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

class ApiService {
  // --- Auth ---
  async login(role: Role): Promise<User> {
    await simulateDelay(300);
    const users = database.getUsers();
    return users[role];
  }

  // --- Read operations ---
  async getEmployees(): Promise<Employee[]> { await simulateDelay(500); return database.getEmployees(); }
  async getLeaveRequests(): Promise<LeaveRequest[]> { await simulateDelay(300); return database.getLeaveRequests(); }
  async getShifts(): Promise<Shift[]> { await simulateDelay(300); return database.getShifts(); }
  async getAnnouncements(): Promise<Announcement[]> { await simulateDelay(400); return database.getAnnouncements(); }
  async getDepartments(): Promise<Department[]> { await simulateDelay(100); return database.getDepartments(); }
  async getJobPositions(): Promise<JobPosition[]> { await simulateDelay(100); return database.getJobPositions(); }
  async getTrainingPrograms(): Promise<TrainingProgram[]> { await simulateDelay(200); return database.getTrainingPrograms(); }
  async getEmployeeTrainings(): Promise<EmployeeTraining[]> { await simulateDelay(200); return database.getEmployeeTrainings(); }
  async getComplianceDocuments(): Promise<ComplianceDocument[]> { await simulateDelay(200); return database.getComplianceDocuments(); }
  async getEmployeeAcknowledgements(): Promise<EmployeeAcknowledgement[]> { await simulateDelay(200); return database.getEmployeeAcknowledgements(); }
  async getBenefitPlans(): Promise<BenefitPlan[]> { await simulateDelay(200); return database.getBenefitPlans(); }

  // --- Write operations ---
  async addAnnouncement(data: Omit<Announcement, 'id' | 'date' | 'postedBy'>, user: User): Promise<Announcement> {
    await simulateDelay(400);
    const newAnnouncement: Announcement = {
        ...data,
        id: `A${Date.now()}`,
        date: new Date().toLocaleDateString('en-CA'),
        postedBy: user.name,
    };
    database.setAnnouncements(prev => [newAnnouncement, ...prev]);
    return newAnnouncement;
  }
  
  async updateEmployees(updater: (prev: Employee[]) => Employee[]): Promise<void> {
    await simulateDelay(300);
    database.setEmployees(updater);
  }

  async updateLeaveRequests(updater: (prev: LeaveRequest[]) => LeaveRequest[]): Promise<void> {
    await simulateDelay(200);
    database.setLeaveRequests(updater);
  }

  async updateShifts(updater: (prev: Shift[]) => Shift[]): Promise<void> {
    await simulateDelay(200);
    database.setShifts(updater);
  }
  
  async updateEmployeeTrainings(updater: (prev: EmployeeTraining[]) => EmployeeTraining[]): Promise<void> {
    await simulateDelay(200);
    database.setEmployeeTrainings(updater);
  }

  async updateEmployeeAcknowledgements(updater: (prev: EmployeeAcknowledgement[]) => EmployeeAcknowledgement[]): Promise<void> {
    await simulateDelay(200);
    database.setEmployeeAcknowledgements(updater);
  }


  // --- AI / Gemini Services (moved to backend) ---

  async generateInterviewQuestions(jobTitle: string): Promise<string[]> {
    const mockResponse = {
      questions: [
        `What is your experience with long-haul driving versus local delivery in the context of Rwanda's road network?`,
        `Describe a time you had to handle an unexpected maintenance issue on the road. How did you ensure safety and minimize delay?`,
        `How do you stay compliant with RURA's regulations for commercial drivers?`,
        `This role requires excellent time management to meet strict delivery schedules. Can you give an example of how you plan your routes and rests?`,
        `How would you handle a difficult customer interaction at a delivery point?`,
      ]
    };
    const body = { jobTitle };
    const data = await mockApiCall<{ questions: string[] }>('/api/interview-questions', body, mockResponse);
    return data.questions;
  }

  async generateJobDescription(jobTitle: string, keywords: string): Promise<JobDescription> {
     const mockResponse: JobDescription = {
        title: `Job Description: ${jobTitle}`,
        summary: `We are seeking a reliable and experienced ${jobTitle} to join our logistics team. The ideal candidate will be responsible for safely and efficiently transporting goods. Keywords mentioned: ${keywords}`,
        responsibilities: [
            "Operate company vehicles in a safe and efficient manner.",
            "Complete pre-trip and post-trip inspections of vehicles.",
            "Ensure all cargo is loaded and secured properly.",
            "Maintain accurate and timely delivery records.",
        ],
        qualifications: [
            "Valid commercial driver's license for Rwanda (Category C, D, or E).",
            "Proven experience as a heavy vehicle driver.",
            "Clean driving record with no major infractions.",
            "Strong knowledge of local and regional routes.",
        ]
     };
    const body = { jobTitle, keywords };
    return mockApiCall<JobDescription>('/api/job-description', body, mockResponse);
  }
  
  async findTalent(requiredSkills: string, employees: Employee[]): Promise<TalentAnalysis> {
    const mockResponse: TalentAnalysis = {
        topCandidates: [
            {
                employeeId: 'E1001',
                employeeName: 'Aline Uwase',
                matchPercentage: 95,
                matchingSkills: ['Heavy Vehicle Driving', 'Safety Compliance', 'Basic Vehicle Maintenance'],
                missingSkills: ['Cross-Border Transport'],
                justification: 'Aline is a highly-rated driver with a strong safety record and relevant technical skills. She would be an excellent fit, requiring only minor training for cross-border specifics.'
            }
        ]
    };
    const body = { requiredSkills, employees: employees.map(e => ({id: e.id, skills: e.skills})) };
    return mockApiCall<TalentAnalysis>('/api/find-talent', body, mockResponse);
  }

  async generateChecklist(jobTitle: string, type: 'Onboarding' | 'Offboarding'): Promise<string[]> {
    const mockResponse = {
        checklist: [
            `Prepare ${type} paperwork (contract/exit interview).`,
            `Schedule IT equipment setup/return for the ${jobTitle}.`,
            `Coordinate with manager for first day/last day tasks.`,
            `Announce new hire/departure to the team.`,
            `Review company handbook and policies.`,
        ]
    };
    const body = { jobTitle, type };
    const data = await mockApiCall<{ checklist: string[] }>('/api/checklist', body, mockResponse);
    return data.checklist;
  }
  
  async generateWorkforceInsights(employees: Employee[], leaveRequests: LeaveRequest[]): Promise<Insight[]> {
    const mockResponse = {
        insights: [
            {
                type: 'Risk' as 'Risk',
                headline: 'Key Contract Expirations Approaching',
                detail: 'Several employees in critical roles have contracts expiring within the next 90 days, posing a potential operational risk.',
                recommendation: 'Initiate contract renewal discussions with key personnel immediately to ensure continuity.'
            },
            {
                type: 'Opportunity' as 'Opportunity',
                headline: 'High Leave Balances in Operations',
                detail: 'A significant number of drivers in the Operations department have high leave balances, which could be used to manage workload during quieter periods.',
                recommendation: 'Encourage managers in Operations to schedule leave for their team members during off-peak seasons to prevent burnout and reduce liability.'
            }
        ]
    };
    const body = {
        employeeCount: employees.length,
        leaveRequestCount: leaveRequests.length
    };
    const data = await mockApiCall<{ insights: Insight[] }>('/api/workforce-insights', body, mockResponse);
    return data.insights;
  }
}

export const apiService = new ApiService();
