"use client";

import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function Settings() {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    metricSystem: 'metric', // metric or imperial
    language: 'english',
    privacySettings: {
      shareWorkoutData: false,
      allowAnalytics: true
    }
  });
  
  const [saved, setSaved] = useState(false);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    setSaved(false);
  };
  
  const handlePrivacyChange = (e) => {
    const { name, checked } = e.target;
    
    setSettings(prev => ({
      ...prev,
      privacySettings: {
        ...prev.privacySettings,
        [name]: checked
      }
    }));
    
    setSaved(false);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // In a real app, you would save the settings to a backend
    console.log('Saving settings:', settings);
    
    // Show saved confirmation
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Settings */}
        <div className="content-card">
          <h2 className="text-2xl font-semibold mb-6">General Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="darkMode" className="font-medium">Dark Mode</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  id="darkMode"
                  name="darkMode"
                  checked={settings.darkMode}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <label htmlFor="notifications" className="font-medium">Enable Notifications</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  id="notifications"
                  name="notifications"
                  checked={settings.notifications}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div>
              <label htmlFor="metricSystem" className="block font-medium mb-1">Measurement System</label>
              <select
                id="metricSystem"
                name="metricSystem"
                value={settings.metricSystem}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="metric">Metric (kg, cm)</option>
                <option value="imperial">Imperial (lb, in)</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="language" className="block font-medium mb-1">Language</label>
              <select
                id="language"
                name="language"
                value={settings.language}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Privacy Settings */}
        <div className="content-card">
          <h2 className="text-2xl font-semibold mb-6">Privacy Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="shareWorkoutData" className="font-medium">Share Workout Data</label>
                <p className="text-sm text-gray-500">Allow sharing of anonymized workout data to improve recommendations</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  id="shareWorkoutData"
                  name="shareWorkoutData"
                  checked={settings.privacySettings.shareWorkoutData}
                  onChange={handlePrivacyChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="allowAnalytics" className="font-medium">Allow Analytics</label>
                <p className="text-sm text-gray-500">Help us improve by allowing usage analytics</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  id="allowAnalytics"
                  name="allowAnalytics"
                  checked={settings.privacySettings.allowAnalytics}
                  onChange={handlePrivacyChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
        
        {/* Account Actions */}
        <div className="content-card">
          <h2 className="text-2xl font-semibold mb-6">Account Actions</h2>
          
          <div className="space-y-4">
            <Button type="button" variant="outline" className="w-full">Export Your Data</Button>
            <Button type="button" variant="danger" className="w-full">Delete Account</Button>
          </div>
        </div>
        
        {/* Save Button */}
        <div className="flex items-center justify-between">
          <Button type="submit">Save Settings</Button>
          {saved && <span className="text-green-600">Settings saved successfully!</span>}
        </div>
      </form>
    </div>
  );
}
