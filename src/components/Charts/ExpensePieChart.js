// src/components/Charts/ExpensePieChart.js
import React from 'react';
import { useSelector } from 'react-redux';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend);

const ExpensePieChart = ({ width = 200, height = 200 }) => {
  const transactions = useSelector((state) => state.transactions.transactions);
  const expenses = transactions.filter((t) => t.type === 'expense');

  const categoryTotals = expenses.reduce((acc, curr) => {
    acc[curr.category] = acc[curr.category]
      ? acc[curr.category] + Number(curr.amount)
      : Number(curr.amount);
    return acc;
  }, {});

  const data = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        label: 'Expenses by Category',
        data: Object.values(categoryTotals),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#BA68C8', '#4DB6AC'],
      },
    ],
  };

  const options = {
    responsive: false,
    maintainAspectRatio: false,
  };

  return (
    <div style={{ width, height }}>
      <Pie data={data} options={options} width={width} height={height} />
    </div>
  );
};

export default ExpensePieChart;
