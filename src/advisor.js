var outputArea = $("#chat-output");

/* eslint-disable */
import barchart from "@nebula.js/sn-bar-chart";
import linechart from "@nebula.js/sn-line-chart";
import { embed } from "@nebula.js/stardust";

var env = require('./env');

const charts = { barchart, linechart };

$("#user-input-form").on("submit", function (e) {
  e.preventDefault();
  var message = $("#user-input").val();
  outputArea.append(`
    <div class='bot-message'>
      <div class='message'>
        ${message}
      </div>
    </div>
  `);
  sendQuestion(message); // to send NL API request and render response
  $("#user-input").val("");
});

async function sendQuestion(message) {
    const requestUrl = env.url + "/api";
    const data = JSON.stringify({
      text: message,
      app: { id: env.appId, name: env.appName },
      enableVisualizations: true,
      visualizationTypes: ["barchart","linechart"],
    });
    const response = await fetch(`${requestUrl}/v1/questions/actions/ask`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + env.token,
        "Content-Type": "application/json",
        "qlik-web-integration-id": env.webIntegrationId,
      },
      body: data,
    });
    const brokerResponse = await response.json();
    let properties;
    let lang = "en-US";
  
    if ("narrative" in brokerResponse.conversationalResponse.responses[0]) {
      const temp =
        brokerResponse.conversationalResponse.responses[0].narrative.text;
      outputArea.append(`
    <div class='user-message'>
      <div class='message'>
        ${temp}
      </div>
    </div>
  `);
    } else if (
      "imageUrl" in brokerResponse.conversationalResponse.responses[0] ||
      "renderVisualization" in brokerResponse.conversationalResponse.responses[0]
    ) {
      let chartElement, img;
      const nebulaChartId = `nebula-chart-${new Date().getTime()}`;
      const nebulaObject = brokerResponse.conversationalResponse.responses.filter(
        (x) => x.type === "nebula"
      );
      const imgUrlObject = brokerResponse.conversationalResponse.responses.filter(
        (x) => x.type === "chart"
      );
      if (nebulaObject.length) {
        properties = { ...nebulaObject[0].renderVisualization.data };
        lang = nebulaObject[0].renderVisualization.language;
        chartElement = `<div class='user-message'>
              <div class='message'>
                <div class='nebula-chart'  id="${nebulaChartId}"></div>
              </div>
            </div>`;
      } else if (imgUrlObject.length) {
        img = imgUrlObject[0].imageUrl;
        chartElement = `<a href="${env.url}/${img}"><Image src="https://<HOSTNAME> /${img}" width="300" height="300 "></a>`;
      }
      if ("narrative" in brokerResponse.conversationalResponse.responses[1]) {
        const text_r =
          brokerResponse.conversationalResponse.responses[1].narrative.text;
        outputArea.append(`
        <div class='user-message'>
        <div class ="message">
        ${text_r} </br>
        ${chartElement}
        </div>
        </div>
      `);
        if (nebulaObject.length) render(properties, nebulaChartId, lang);
      } else if ("nebula" in brokerResponse.conversationalResponse.responses[0]) {
        if (brokerResponse.conversationalResponse.responses) {
          outputArea.append(`
            <div class='user-message'>
                <div class='message'>
                  <div class='nebula-chart'  id="${nebulaChartId}"></div>
                </div>
            </div>
          `);
          render(properties, nebulaChartId, lang);
        }
      } else {
        outputArea.append(`
        <div class='user-message'>
          <div class='message'>
          <Image src="${env.url}/${img}" width="300" height="300">
          </div>
        </div>
      `);
      }
    }
  }
  
  async function render(properties, nebulaChartId, lang = "en-US") {
    properties = properties;
    if (properties) {
      properties.reducedHyperCube = properties.qHyperCube;
    }
    const ordered = Object.keys(properties)
      .sort()
      .reduce((obj, key) => {
        obj[key] = properties[key];
        return obj;
      }, {});
    const appLayout = {
      qLocaleInfo: properties.snapshotData.appLocaleInfo,
      qTitle: "",
    };
    const objectModel = {
      id: `${+new Date()}`,
      getLayout: async () => properties,
      on: () => {},
      once: () => {},
      removeListener: () => {},
      getProperties: async () => ({ qHyperCubeDef: {}, ...properties }),
      setProperties: async () => {},
      getEffectiveProperties: async () => properties,
      getHyperCubeReducedData: async () =>
        properties.reducedHyperCube.qDataPages || [],
      getHyperCubeContinuousData: async () => properties.qHyperCube,
    };
  
    const app = {
      id: `${+new Date()}`,
      createSessionObject: async () => ({
        ...objectModel,
      }),
      getObject: async () => objectModel,
      getAppLayout: async () => appLayout,
      destroySessionObject: () => {},
    };
    const type = properties.qInfo.qType;
  
    const n = embed(app, {
      // Load Sense themes
      context: {
        theme: "light",
        language: lang,
        constraints: {
          // Disable selections (constraint)
          select: true,
        },
      },
      types: [
        {
          name: type,
          load: async () => charts[type],
        },
      ],
    });
  
    await n.render({
      type,
      element: document.querySelector(`#${nebulaChartId}`),
      properties,
      options: {
        direction: "ltr",
        freeResize: true,
      },
    });
  }