// src/components/Charts/ExpenseLineChart.js
import React from 'react';
import { useSelector } from 'react-redux';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const ExpenseLineChart = ({ width = 300, height = 150 }) => {
  const transactions = useSelector((state) => state.transactions.transactions);

  const expenses = transactions.filter((t) => t.type === 'expense');

  const monthlyTotals = expenses.reduce((acc, curr) => {
    const date = new Date(curr.date);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    acc[month] = acc[month] ? acc[month] + Number(curr.amount) : Number(curr.amount);
    return acc;
  }, {});

  const sortedMonths = Object.keys(monthlyTotals).sort();

  const data = {
    labels: sortedMonths,
    datasets: [
      {
        label: 'Monthly Expenses',
        data: sortedMonths.map((month) => monthlyTotals[month]),
        borderColor: '#3f51b5',
        backgroundColor: '#7986cb',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#3f51b5',
      },
    ],
  };

  const options = {
    responsive: false,
    maintainAspectRatio: false,
  };

  return (
    <div style={{ width, height }}>
      <Line data={data} options={options} width={width} height={height} />
    </div>
  );
};

export default ExpenseLineChart;
