import enigma from "enigma.js";
const schema = require("enigma.js/schemas/12.1306.0.json");

export default class EngineService {
  constructor(engineUri) {
    this.engineUri = engineUri;
  }

  /**
   * @param {*} headers contains csrf-token and web-integration-id
   */
  openEngineSession(headers) {
    const params = Object.keys(headers)
      .map((key) => `${key}=${headers[key]}`)
      .join("&");
    const session = enigma.create({
      schema,
      url: `${this.engineUri}?${params}`,
    });
    session.on("traffic:sent", (data) => console.log("sent:", data));
    session.on("traffic:received", (data) => console.log("received:", data));
    return session;
  }

  /**
   * @param {*} session session created in getHyperCubeData method
   * closes the session
   */
  async closeEngineSession(session) {
    if (session) {
      await session.close();
      console.log("session closed");
    }
  }

  async getOpenDoc(appId, headers) {
    let session = this.openEngineSession(headers);
    let global = await session.open();
    // get a doc for specific appId
    let doc = await global.openDoc(appId);
    return doc;
  }
}