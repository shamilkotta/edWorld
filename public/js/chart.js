/* eslint-disable no-undef */
/* eslint-disable no-new */

const ctx = document.getElementById("payment-pie").getContext("2d");
const success = parseInt(
  document.getElementById("payment-chart-data-success").value,
  10
);
const failed = parseInt(
  document.getElementById("payment-chart-data-failed").value,
  10
);
new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: ["Success", "Failed/Aborted"],
    datasets: [
      {
        data: [success, failed],
        backgroundColor: ["#3bb77e", "#D2FFEA"],
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  },
});

async function fetchData() {
  const data = await fetch("/office/dashboard-data");
  const chartData = await data.json();
  if (chartData || chartData.success) {
    const batchStats = document.getElementById("batch-stats").getContext("2d");
    const labelsTwo = [];
    const dataOneTwo = [];
    const dataTwoTwo = [];
    chartData.batchStats.forEach((ele) => {
      labelsTwo.push(ele.code);
      dataOneTwo.push(ele.seat_num);
      dataTwoTwo.push(ele.students_num);
    });
    new Chart(batchStats, {
      type: "bar",
      data: {
        labels: labelsTwo,
        datasets: [
          {
            label: "Seats",
            data: dataOneTwo,
            backgroundColor: "#3bb77e",
          },
          {
            label: "Students",
            data: dataTwoTwo,
            backgroundColor: "#D2FFEA",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    });

    const batchPerf = document
      .getElementById("batch-performance")
      .getContext("2d");
    const labelsThree = [];
    const dataOneThree = [];
    const dataTwoThree = [];
    chartData.studentStats.forEach((ele) => {
      labelsThree.push(ele.code);
      dataOneThree.push(ele.avg_performance);
      dataTwoThree.push(ele.avg_attendance);
    });
    new Chart(batchPerf, {
      type: "line",
      data: {
        labels: labelsThree,
        datasets: [
          {
            label: "Performance",
            data: dataOneThree,
            backgroundColor: "#dddddd00",
            borderColor: "#3bb77e",
          },
          {
            label: "Attendance",
            data: dataTwoThree,
            backgroundColor: "#dddddd00",
            borderColor: "#2943d5",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    });
  }
}

fetchData();
