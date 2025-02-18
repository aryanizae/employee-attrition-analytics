import React from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query';
import { BarChart3, Users, UserMinus, TrendingUp, Building2, DollarSign } from 'lucide-react';
import { z } from 'zod';
import { employeeSchema, fetchDepartmentMetrics, predictAttrition } from './lib/api';
import { AttritionTrends } from './components/AttritionTrends';

const queryClient = new QueryClient();

function Dashboard() {
  const [selectedDepartment, setSelectedDepartment] = React.useState('All');
  const [formData, setFormData] = React.useState({
    yearsAtCompany: '',
    monthlyIncome: '',
    jobLevel: 'Entry Level',
  });
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['departmentMetrics'],
    queryFn: fetchDepartmentMetrics,
  });

  const predictMutation = useMutation({
    mutationFn: predictAttrition,
    onSuccess: (data) => {
      // Handle successful prediction
      console.log('Prediction:', data);
    },
  });

  const currentMetrics = metrics?.find(m => m.department === selectedDepartment) ?? metrics?.[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = employeeSchema.safeParse({
      yearsAtCompany: Number(formData.yearsAtCompany),
      monthlyIncome: Number(formData.monthlyIncome),
      jobLevel: formData.jobLevel,
    });

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        if (error.path[0]) {
          errors[error.path[0].toString()] = error.message;
        }
      });
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    predictMutation.mutate(result.data);
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-600" />
              Employee Attrition Analytics
            </h1>
            <select 
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {metrics?.map(({ department }) => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserMinus className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Attrition Rate
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {currentMetrics?.attritionRate.toFixed(1)}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Employees
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {currentMetrics?.employeeCount}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Predicted Attrition (Next 3 Months)
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {currentMetrics?.predictedAttrition}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <AttritionTrends />
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            Attrition Risk Calculator
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Years at Company
              </label>
              <input
                type="number"
                value={formData.yearsAtCompany}
                onChange={(e) => setFormData(prev => ({ ...prev, yearsAtCompany: e.target.value }))}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.yearsAtCompany ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {formErrors.yearsAtCompany && (
                <p className="mt-1 text-sm text-red-600">{formErrors.yearsAtCompany}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Monthly Income
              </label>
              <input
                type="number"
                value={formData.monthlyIncome}
                onChange={(e) => setFormData(prev => ({ ...prev, monthlyIncome: e.target.value }))}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.monthlyIncome ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {formErrors.monthlyIncome && (
                <p className="mt-1 text-sm text-red-600">{formErrors.monthlyIncome}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Job Level
              </label>
              <select
                value={formData.jobLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, jobLevel: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option>Entry Level</option>
                <option>Mid Level</option>
                <option>Senior</option>
                <option>Manager</option>
                <option>Director</option>
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <button
                type="submit"
                disabled={predictMutation.isPending}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {predictMutation.isPending ? 'Calculating...' : 'Calculate Risk'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}

export default App;