/* eslint-disable */
import { AuthType } from '@qlik/sdk';

import embed from './configure';
import connect from './connect';

import picasso from 'picasso.js';
import picassoQ from 'picasso-plugin-q';

import Chart from 'chart.js/auto';
var env = require('./env');

picasso.use(picassoQ); // register

var data = [];
var moddata = [];

async function run() {
  const app = await connect({
    connectionType: AuthType.WebIntegration,
    url: env.url,
    webIntegrationId: env.webIntegrationId,
    appId: env.appId,
  });

  var objectId = env.objectId;

  const n = embed(app);
  (await n.selections()).mount(document.querySelector('.preview'));

  n.render({
    element: document.querySelector(".preview-content"),
    type: "barchart",
    fields: ["ProductName", "=sum(Sales)"],
    properties: {
      "color": {
        "auto": false,
        "mode": "primary",
        "useBaseColors": "off",
        "paletteColor": {
          "index": -1,
          "color": "orange"
        }
      }
    },
  }); 

  app.getObject(objectId).then((api) => {
     api.getLayout().then((layout) => {
      layout.qHyperCube.qDataPages[0].qMatrix.forEach(element => {
        row = [element[0].qText, element[1].qNum];
        data.push(row);
      });
      console.log("Data from Qlik fetched:")
      console.log(data);

      updateProductsTable();
     });
  });

}

run();

document.addEventListener("DOMContentLoaded", function() {
  // Example code to use the gathered data
  document.getElementById("preview-button").addEventListener("click", function() {
    var products = gatherProductData();
    formResultsTable(products);
    drawUpdatedChart();
  });

  document.getElementById("commit-button").addEventListener("click", function() {
    sendMessage();
  });

  document.getElementById("reset-button").addEventListener("click", function() {
    window.location.reload();
  });

});

function updateProductsTable () {
  for (let i = 0; i < 25; i++) {
    var table = document.getElementById("product-table");
    for (var i = 0, row; row = table.rows[i+1]; i++) {
      row.cells[0].innerHTML = data[i][0];
    }  
  }
}

function sendMessage() {
  var request = new XMLHttpRequest();
  request.open("POST", env.automationId);
  request.setRequestHeader('Content-type', 'application/json');

  var params = gatherProductData();

  request.send(JSON.stringify(params));
  console.log("triggered");
}

function gatherProductData() {
  var productTable = document.getElementById("product-table");
  var tableRows = productTable.getElementsByTagName("tr");

  var productData = [];

  for (var i = 1; i < tableRows.length; i++) {
    var productName = tableRows[i].getElementsByTagName("td")[0].innerText;
    var discountInput = tableRows[i].getElementsByTagName("input")[0];
    var discount = discountInput.value;

    productData.push({
      name: productName,
      discount: discount
    });
  }
  return productData;
}

function formResultsTable(products) {
  moddata = JSON.parse(JSON.stringify(data));

  products.forEach((element, i) => {
    if(moddata[i][0] == element.name) {
      console.log(element.name);
      var discounted = moddata[i][1]*(1 - (element.discount/100));
      moddata[i].push(discounted);
    }
  });

  for(var i = 0; i < moddata.length; i++) {
    if(moddata[i].length < 3) {
      moddata[i].push(moddata[i][1]);
    }
  }
}

function drawUpdatedChart() {

  var barChartData = {
    labels: returnElements(moddata, 0),
    datasets: [
      {
        label: "Sales",
        backgroundColor: "orange",
        borderColor: "orange",
        borderWidth: 1,
        data: returnElements(moddata, 1)
      },
      {
        label: "Predicted",
        backgroundColor: "red",
        borderColor: "red",
        borderWidth: 1,
        data: returnElements(moddata, 2)
      }
    ]
  };
  
  var chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        title: {
          display: false
        },
        display: false
      },
    },
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
  }

  if(window.myBar == null) {
    document.querySelector(".preview-content").innerHTML = "<canvas id='chart' height='300' width='0'></canvas>";
    document.querySelector(".preview-content").style.height="700px";
    document.querySelector(".preview-content").style.width="3200px";

    var ctx = document.getElementById("chart").getContext("2d");

    window.myBar = new Chart(ctx, {
      type: "bar",
      data: barChartData,
      options: chartOptions
    });
  } else {
    console.log("Chart exists");
    console.log()
    myBar.data = barChartData;
    myBar.update();
  }
}

function returnElements(name, index) {
  var mapped = name.map(function(x) {
    return x[index];
  });

  return mapped;
}
