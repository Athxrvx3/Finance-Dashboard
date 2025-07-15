// src/components/Charts/IncomeExpenseBarChart.js
import React from 'react';
import { useSelector } from 'react-redux';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const IncomeExpenseBarChart = ({ width = 300, height = 150 }) => {
  const transactions = useSelector((state) => state.transactions.transactions);

  const incomeTotal = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenseTotal = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const data = {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        label: 'Amount',
        data: [incomeTotal, expenseTotal],
        backgroundColor: ['#4CAF50', '#F44336'],
      },
    ],
  };

  const options = {
    responsive: false,
    maintainAspectRatio: false,
  };

  return (
    <div style={{ width, height }}>
      <Bar data={data} options={options} width={width} height={height} />
    </div>
  );
};

export default IncomeExpenseBarChart;
