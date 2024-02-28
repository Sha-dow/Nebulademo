/* eslint-disable */
import { AuthType } from '@qlik/sdk';

import embed from './configure';
import connect from './connect';

import picasso from 'picasso.js';
import picassoQ from 'picasso-plugin-q';

var env = require('./env');

picasso.use(picassoQ); // register

async function run() {
    const app = await connect({
      connectionType: AuthType.WebIntegration,
      url: env.url,
      webIntegrationId: env.webIntegrationId,
      appId: env.appId,
    });
  
    var objectId = env.objectId;
  
    const n = embed(app);
    (await n.selections()).mount(document.querySelector('.chart-toolbar'));
  
    n.render({
      element: document.querySelector(".preview-chart-prim"),
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

    n.render({
        element: document.querySelector(".preview-chart-sec"),
        type: "barchart",
        fields: ["Country", "=sum(Sales)"],
        properties: {
          "color": {
            "auto": true,
            "mode": "primary",

          }
        },
      }); 
  
    // app.getObject(objectId).then((api) => {
    //    api.getLayout().then((layout) => {
    //     layout.qHyperCube.qDataPages[0].qMatrix.forEach(element => {
    //       row = [element[0].qText, element[1].qNum];
    //       data.push(row);
    //     });
    //    });
    // });
  
  }
  
  run();