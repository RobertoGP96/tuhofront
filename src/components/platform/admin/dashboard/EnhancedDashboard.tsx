import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Activity,
    CheckCircle,
    Clock,
    FileText,
    Users
} from 'lucide-react';
import React from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

// Sample data - replace with your actual data
const monthlyData = [
  { name: 'Ene', usuarios: 40, tramites: 240, completados: 180 },
  { name: 'Feb', usuarios: 30, tramites: 139, completados: 120 },
  { name: 'Mar', usuarios: 20, tramites: 180, completados: 160 },
  { name: 'Abr', usuarios: 27, tramites: 180, completados: 150 },
  { name: 'May', usuarios: 18, tramites: 220, completados: 200 },
  { name: 'Jun', usuarios: 23, tramites: 250, completados: 210 },
];

const statusData = [
  { name: 'Completados', value: 500, color: '#10B981' },
  { name: 'En proceso', value: 300, color: '#F59E0B' },
  { name: 'Pendientes', value: 400, color: '#EF4444' },
];

const stats = [
  { 
    title: 'Usuarios Totales', 
    value: '1,234', 
    icon: Users,
    change: '+12%',
    trend: 'up'
  },
  { 
    title: 'Trámites Activos', 
    value: '568', 
    icon: FileText,
    change: '+5%',
    trend: 'up'
  },
  { 
    title: 'Completados', 
    value: '892', 
    icon: CheckCircle,
    change: '+8%',
    trend: 'up'
  },
  { 
    title: 'En Espera', 
    value: '124', 
    icon: Clock,
    change: '-3%',
    trend: 'down'
  }
];

export const EnhancedDashboard: React.FC = () => {
  return (
    <div className="space-y-6 p-4">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-white shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <p className="text-sm font-medium text-gray-500">
                {stat.title}
              </p>
              <stat.icon className={`h-5 w-5 ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change} desde el mes pasado
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Line Chart */}
        <Card className="bg-white shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Actividad Mensual</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="usuarios" 
                  name="Usuarios" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="tramites" 
                  name="Trámites" 
                  stroke="#10B981" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="completados" 
                  name="Completados" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="bg-white shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Estado de Trámites</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent as number * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} trámites`, 'Cantidad']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card className="bg-white shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Resumen Anual</CardTitle>
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">Actualizado hace 5 min</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="tramites" name="Trámites" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completados" name="Completados" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedDashboard;
