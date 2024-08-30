import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registrar os componentes necessários do chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Feedback1 = () => {
  // Dados do gráfico
  const data = {
    labels: ['Comparativa 1', 'Comparativa 2'],
    datasets: [
        {
            label: 'Comparativa 1',
            data: [5, 25], // Valores da comparativa 1
            backgroundColor: ['rgba(255, 0, 0, 0.5)', 'rgba(76, 175, 80, 0.5)'], // Vermelho e verde com opacidade menor
            borderColor: ['#FF0000', '#4CAF50'], // Vermelho e verde vibrantes
            borderWidth: 1, // Aumenta a largura da borda para destacar mais
            barThickness: 30, // Ajusta a largura das barras
            borderRadius: 4, // Adiciona bordas arredondadas
        }
    ],
  };

  // Opções do gráfico
  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    maintainAspectRatio: false, // Permite ajustar o tamanho do gráfico
  };

  return (
    <div style={{ width: '24rem', height: '20rem' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default Feedback1;