import React, { useState, useCallback } from 'react';
import { SparklesIcon, ShieldAlertIcon, LightbulbIcon, CheckCircleIcon } from './icons';
import { apiService } from '../services/apiService';
import { Employee, LeaveRequest, Insight } from '../types';

const AIStrategicInsights: React.FC<{ employees: Employee[], leaveRequests: LeaveRequest[] }> = ({ employees, leaveRequests }) => {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasGenerated, setHasGenerated] = useState(false);

    const handleGenerateInsights = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setHasGenerated(true);
        try {
            const result = await apiService.generateWorkforceInsights(employees, leaveRequests);
            setInsights(result);
        } catch (e: any) {
            setError(e.message || "An error occurred while generating insights.");
            setInsights([]);
        } finally {
            setIsLoading(false);
        }
    }, [employees, leaveRequests]);
    
    const InsightCard: React.FC<{ insight: Insight }> = ({ insight }) => {
        const insightConfig = {
            Risk: {
                Icon: ShieldAlertIcon,
                color: "red-500",
                bgColor: "bg-red-50 dark:bg-red-900/20",
                borderColor: "border-red-500",
            },
            Opportunity: {
                Icon: LightbulbIcon,
                color: "green-500",
                bgColor: "bg-green-50 dark:bg-green-900/20",
                borderColor: "border-green-500",
            },
            Observation: {
                Icon: CheckCircleIcon,
                color: "blue-500",
                bgColor: "bg-blue-50 dark:bg-blue-900/20",
                borderColor: "border-blue-500",
            },
        };
        
        const config = insightConfig[insight.type] || insightConfig.Observation;

        return (
            <div className={`p-4 rounded-lg border-l-4 ${config.borderColor} ${config.bgColor}`}>
                <div className="flex items-start gap-3">
                    <config.Icon className={`w-6 h-6 flex-shrink-0 text-${config.color}`} />
                    <div className="flex-1">
                        <h4 className={`font-bold text-gray-800 dark:text-white`}>{insight.headline}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{insight.detail}</p>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-2">Recommendation: <span className="font-normal">{insight.recommendation}</span></p>
                    </div>
                </div>
            </div>
        )
    };

    return (
        <div className="bg-white dark:bg-primary-900/50 p-6 rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-200 dark:border-primary-800 pb-4 mb-4 gap-3">
                <div className="flex items-center gap-3">
                    <SparklesIcon className="w-8 h-8 text-primary-500" />
                    <div>
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Strategic AI Insights</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">High-level analysis for management.</p>
                    </div>
                </div>
                <button onClick={handleGenerateInsights} disabled={isLoading} className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 transition-colors disabled:bg-primary-400 disabled:cursor-not-allowed">
                    <SparklesIcon className="w-5 h-5"/>
                    {isLoading ? 'Analyzing Workforce...' : 'Generate Insights'}
                </button>
            </div>
            
            <div className="min-h-[150px]">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                        <p className="ml-4 text-gray-500">AI is analyzing data...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-10 text-red-500">
                        <p className="font-semibold">Error Generating Insights</p>
                        <p className="text-sm">{error}</p>
                    </div>
                ) : hasGenerated && insights.length === 0 ? (
                     <div className="text-center py-10 text-gray-500">
                        <p className="font-semibold">No specific insights found</p>
                        <p className="text-sm">The current data does not indicate any major risks or opportunities.</p>
                    </div>
                ) : insights.length > 0 ? (
                    <div className="space-y-4">
                        {insights.map((insight, index) => (
                           <InsightCard key={index} insight={insight} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        <p className="font-semibold">Unlock Strategic Insights</p>
                        <p className="text-sm">Click the "Generate Insights" button to get an AI-powered summary of your workforce.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIStrategicInsights;
