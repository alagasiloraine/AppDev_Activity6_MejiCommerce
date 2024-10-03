  // Sample chart data
  const ctx = document.getElementById('appointmentChart').getContext('2d');
  new Chart(ctx, {
      type: 'line',
      data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
              label: 'Appointments',
              data: [12, 19, 3, 5, 2, 3, 7],
              borderColor: '#4a90e2',
              tension: 0.1
          }]
      },
      options: {
          responsive: true,
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
  });