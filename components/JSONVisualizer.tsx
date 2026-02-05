
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface JSONVisualizerProps {
  data: any;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const JSONVisualizer: React.FC<JSONVisualizerProps> = ({ data }) => {
  // Simple heuristic to find array data for charts
  const findArray = (obj: any): any[] | null => {
    if (Array.isArray(obj)) return obj;
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (Array.isArray(obj[key])) return obj[key];
      }
    }
    return null;
  };

  const chartData = findArray(data);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-gray-800 rounded-lg border border-dashed border-gray-700">
        <p>Nenhum dado numérico ou lista encontrada para visualização gráfica.</p>
        <p className="text-sm">Tente fornecer um array de objetos.</p>
      </div>
    );
  }

  // Heuristic to pick keys for X and Y axes
  const sample = chartData[0];
  const keys = Object.keys(sample || {});
  const numericKeys = keys.filter(k => typeof sample[k] === 'number');
  const stringKeys = keys.filter(k => typeof sample[k] === 'string');

  const xKey = stringKeys[0] || keys[0];
  const yKey = numericKeys[0] || numericKeys[1];

  return (
    <div className="space-y-8">
      {yKey ? (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-blue-400 capitalize">
            Distribuição de {yKey} por {xKey}
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey={xKey} stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Bar dataKey={yKey} fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
           <p className="text-gray-400">Encontramos uma lista, mas faltam valores numéricos para gerar gráficos.</p>
        </div>
      )}

      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 overflow-auto">
        <h3 className="text-lg font-semibold mb-4 text-green-400">Visualização de Árvore</h3>
        <pre className="text-sm font-mono text-gray-300">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default JSONVisualizer;
