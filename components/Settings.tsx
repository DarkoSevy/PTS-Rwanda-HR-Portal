import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { UserCheckIcon, BellIcon, PaletteIcon, SunIcon, MoonIcon } from './icons';

// Reusable component for toggle switches
const ToggleSwitch: React.FC<{ label: string; enabled: boolean; setEnabled: (enabled: boolean) => void }> = ({ label, enabled, setEnabled }) => (
    <div className="flex items-center justify-between">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={enabled} onChange={() => setEnabled(!enabled)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
        </label>
    </div>
);

const Toast: React.FC<{ message: string; show: boolean }> = ({ message, show }) => (
    <div className={`fixed bottom-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}>
        {message}
    </div>
);

interface SettingsProps {
    user: User;
    setCurrentUser: (user: User) => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, setCurrentUser, theme, toggleTheme }) => {
    const [activeSection, setActiveSection] = useState('profile');
    
    // Profile State
    const [name, setName] = useState(user.name);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Notification State
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(false);
    
    // Toast State
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const showAndHideToast = (message: string) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleProfileSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (password && password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }
        setCurrentUser({ ...user, name });
        showAndHideToast("Profile updated successfully!");
        setPassword('');
        setConfirmPassword('');
    };

    useEffect(() => {
        // This effect will run on the initial render and whenever the dependencies change.
        // We'll wrap the call in a condition to avoid showing the toast on first load.
        const handler = setTimeout(() => {
            if (emailNotifications !== true || pushNotifications !== false) {
                 // showAndHideToast("Notification settings saved!");
            }
        }, 100);
    
        return () => clearTimeout(handler);
    }, [emailNotifications, pushNotifications]);


    const settingsSections = [
        { id: 'profile', name: 'Profile', icon: UserCheckIcon },
        { id: 'notifications', name: 'Notifications', icon: BellIcon },
        { id: 'appearance', name: 'Appearance', icon: PaletteIcon },
    ];

    const renderSection = () => {
        switch (activeSection) {
            case 'profile':
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>
                        <form onSubmit={handleProfileSave} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full px-3 py-2 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                                <input type="email" value={user.id === 'E1001' ? 'aline.u@pts.rw' : user.id === 'M2001' ? 'jeanette.i@pts.rw' : 'didier.m@pts.rw' } readOnly className="mt-1 w-full px-3 py-2 bg-gray-200 border-0 rounded-md dark:bg-gray-700 cursor-not-allowed" />
                            </div>
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold">Change Password</h3>
                                <div className="mt-4 space-y-4">
                                     <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New Password" className="w-full px-3 py-2 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300" />
                                     <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm New Password" className="w-full px-3 py-2 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300" />
                                </div>
                            </div>
                            <div className="text-right">
                                <button type="submit" className="px-6 py-2 bg-primary-500 text-white font-semibold rounded-lg shadow-md hover:bg-primary-600">Save Changes</button>
                            </div>
                        </form>
                    </div>
                );
            case 'notifications':
                 return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4">Notification Preferences</h2>
                        <div className="space-y-4">
                            <ToggleSwitch label="Email Notifications" enabled={emailNotifications} setEnabled={setEmailNotifications} />
                            <ToggleSwitch label="Push Notifications" enabled={pushNotifications} setEnabled={setPushNotifications} />
                        </div>
                    </div>
                );
            case 'appearance':
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4">Appearance</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Theme</h3>
                                <div className="flex gap-4">
                                    <button onClick={() => theme !== 'light' && toggleTheme()} className={`flex items-center gap-2 p-4 rounded-lg border-2 ${theme === 'light' ? 'border-primary-500' : 'border-transparent'}`}>
                                        <SunIcon className="w-6 h-6"/> Light
                                    </button>
                                    <button onClick={() => theme !== 'dark' && toggleTheme()} className={`flex items-center gap-2 p-4 rounded-lg border-2 ${theme === 'dark' ? 'border-primary-500' : 'border-transparent'}`}>
                                        <MoonIcon className="w-6 h-6"/> Dark
                                    </button>
                                </div>
                            </div>
                             <div>
                                <h3 className="text-lg font-semibold mb-2">Language</h3>
                                <select className="w-full max-w-xs px-3 py-2 bg-gray-100 border-0 rounded-md dark:bg-gray-800 dark:text-gray-300">
                                    <option>English</option>
                                    <option>Kinyarwanda</option>
                                    <option>Français</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your account and application preferences.</p>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md">
                        <nav className="space-y-1">
                            {settingsSections.map(section => (
                                <button key={section.id} onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg text-left transition-colors ${
                                        activeSection === section.id
                                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-white'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                                    }`}
                                >
                                    <section.icon className="w-5 h-5"/>
                                    {section.name}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md">
                        {renderSection()}
                    </div>
                </div>
            </div>
            <Toast message={toastMessage} show={showToast} />
        </div>
    );
};

export default Settings;