require('dotenv').config()
const Lights = require('../services/Lights.js')
const Notifier = require('../services/Notifier.js')
const Broadcast = require('../services/Broadcast.js')
const { setSwitchStatus, getSwitchStatus, SwitchIpFromName } = require('../util.js')

class WorkflowSubscriptions {
  /**
   * heater-switch-state
  */
  heaterSwitchState = async function({ task, taskService }) {
    const switchStatus = await getSwitchStatus(SwitchIpFromName['heater'])
    console.log(`[${new Date().toLocaleString()}] {heater-switch-state} called for HEATER., which runs on IP: ${SwitchIpFromName['heater']}. Queried value says: switchStatus=${switchStatus}`);
    const processVariables = new Variables();
    processVariables.set("heaterState", switchStatus)
    await taskService.complete(task, processVariables);
  }
  /**
   * heater-on
   */
  heaterOn = async function({ task, taskService }) {
    console.log(`[${new Date().toLocaleString()}] {heater-on} called, which runs on IP: ${SwitchIpFromName['heater']}. Setting status to true`);
    const broadcast = new Broadcast();
    const actionData = {
      system: 'heater',
      action: 'on',
      message: 'going to attempt to turn ON heater because temperature is '+task.variables.get('temperature')
    }
    await broadcast.recordActionHistoryInDb(actionData);
    await setSwitchStatus("heater", true)
    const processVariables = new Variables();
    processVariables.set("heaterStatusShouldBe", 'true');
    await taskService.complete(task, processVariables);
  }
  /**
  * heater-off
  */
  heaterOff = async function({ task, taskService }) {
    console.log(`[${new Date().toLocaleString()}] {heater-off} called, which runs on IP: ${SwitchIpFromName['heater']}. Setting status to false.`);
    const broadcast = new Broadcast();
    const actionData = {
      system: 'heater',
      action: 'off',
      message: 'going to attempt to turn OFF heater because temperature is '+task.variables.get('temperature')
    }
    await broadcast.recordActionHistoryInDb(actionData);
    setSwitchStatus("heater", false)
    const processVariables = new Variables();
    processVariables.set("heaterStatusShouldBe", 'false');
    await taskService.complete(task, processVariables);
  }
  /**
 * temp-warning
 */
  tempWarning = async function({ task, taskService }) {
    const tempVal = task.variables.get('temperature');
    console.log(`[${new Date().toLocaleString()}] {temp-warning} called, temperature is out of bounds, currently: ${tempVal}`);
    const notifierClient = new Notifier();
    const errorMessage = `[TEMP WARNING] temperature is out of bounds, currently: ${tempVal}`;
    await notifierClient.sendNotification(errorMessage)
    await taskService.handleFailure(task, {
      errorMessage,
      errorDetails: `Temp is currently: ${tempVal}`,
      retries: 0
    });
    //  await taskService.complete(task);
  }
  /**
  * water-plant
  */
  waterPlant = async function({ task, taskService }) {
    const moistureVal = task.variables.get('moisture')
    console.log(`[${new Date().toLocaleString()}] {water-plant} called, moisture should be too low. currently: ${moistureVal}`);
    const notifierClient = new Notifier();
    const msg = `[${new Date().toLocaleString()}] Watering plant. currently: ${moistureVal}`;
    await notifierClient.sendNotification(msg)
    await taskService.complete(task);
  }
  /**
  * water-pump-switch-state
  */
  waterPumpSwitchState = async function({ task, taskService }) {
    const switchStatus = await getSwitchStatus(SwitchIpFromName['pump'])
    console.log(`[${new Date().toLocaleString()}] {water-pump-switch-state} called for WATER_PUMP, which runs on IP: ${SwitchIpFromName['pump']}. Queried value says: switchStatus=${switchStatus}`);
    const processVariables = new Variables();
    processVariables.set("waterPumpState", switchStatus)
    await taskService.complete(task, processVariables);
  }
  /**
  * water-pump-ctrl-start
  */
  waterPumpCtrlStart = async function({ task, taskService }) {
    const moistureVal = task.variables.get('moisture')
    console.log(`[${new Date().toLocaleString()}] {water-pump-ctrl-start} called, moisture should be too low. currently: ${moistureVal}`);
    const notifierClient = new Notifier();
    const msg = `[${new Date().toLocaleString()}] Watering plant. currently: ${moistureVal}`;
    await notifierClient.sendNotification(msg)
    await taskService.complete(task);
  }
  /**
  * water-pump-ctrl-stop
  */
  waterPumpCtrlStop = async function({ task, taskService }) {
    const moistureVal = task.variables.get('moisture')
    console.log(`[${new Date().toLocaleString()}] {water-pump-ctrl-stop} called, moisture should be too low. currently: ${moistureVal}`);
    const notifierClient = new Notifier();
    const msg = `[${new Date().toLocaleString()}] Watering plant. currently: ${moistureVal}`;
    await notifierClient.sendNotification(msg)
    await taskService.complete(task);
  }
  /**
  * confirm-water-pump-state
  */
  confirmWaterPumpState = async function({ task, taskService }) {
    const moistureVal = task.variables.get('moisture')
    console.log(`[${new Date().toLocaleString()}] {confirm-water-pump-state} called, moisture should be too low. currently: ${moistureVal}`);
    const notifierClient = new Notifier();
    const msg = `[${new Date().toLocaleString()}] Watering plant. currently: ${moistureVal}`;
    await notifierClient.sendNotification(msg)
    await taskService.complete(task);
  }
  /**
  * confirm-heater-state
  */
  confirmHeaterState = async function({ task, taskService }) {
    const switchStatus = await getSwitchStatus(SwitchIpFromName['heater'])
    const statusShouldBe = task.variables.get('heaterStatusShouldBe')
    console.log(`[${new Date().toLocaleString()}] {confirm-heater-state} called for HEATER., which runs on IP: ${SwitchIpFromName['heater']}. Queried value says: switchStatus=${switchStatus}. statusShouldBe=${statusShouldBe}`);
    if (switchStatus.toString() === statusShouldBe.toString()) {
      await taskService.complete(task);
    } else {
      const notifierClient = new Notifier();
      const errorMessage = `[${new Date().toLocaleString()}] {confirm-heater-state} CHECK FAILED! Error changing state of heater while trying to change it to ${statusShouldBe}. Currently it's ${switchStatus}. Try agai...!`
      await notifierClient.sendNotification(errorMessage)
      await taskService.handleFailure(task, {
        errorMessage,
        errorDetails: `Temp is currently: ${tempVal}`,
        retries: 1,
        retryTimeout: 10 * 1000
      });
    }
  }
  /**
  * light-switch-state
  */
  lightSwitchState = async function({ task, taskService }) {
    const switchStatus = await getSwitchStatus(SwitchIpFromName['light'])
    console.log(`[${new Date().toLocaleString()}] {light-switch-state} called for LIGHT, which runs on IP: ${SwitchIpFromName['light']}. Queried value says: switchStatus=${switchStatus}`);


    const processVariables = new Variables();
    processVariables.set("lightState", switchStatus)
    await taskService.complete(task, processVariables);
  }
  /**
  * manage-light
  */
  manageLight = async function({ task, taskService }) {
    const switchStatus = await getSwitchStatus(SwitchIpFromName['light'])
    console.log(`[${new Date().toLocaleString()}] {manage-light} called for LIGHT, which runs on IP: ${SwitchIpFromName['light']}. Queried value says: switchStatus=${switchStatus}`);

    // use the Light service to figure out if lights should be on or off. It returns the object shaped: { lightShouldBe: calculated_value }
    const lightManager = new Lights(Consts)
    const lightResponse = lightManager.manageLights();
    console.log({lightResponse})
    const { lightShouldBe } = lightResponse
    const processVariables = new Variables();
    processVariables.set("lightStateShouldBe", lightShouldBe)
    await taskService.complete(task, processVariables);
  }
  /**
  * confirm-light-state
  */
  confirmLightState = async function({ task, taskService }) {
    const switchStatus = await getSwitchStatus(SwitchIpFromName['light'])
    const statusShouldBe = await task.variables.get('lightStateShouldBe') || null
    console.log(`[${new Date().toLocaleString()}] {confirm-light-state} called for LIGHT, which runs on IP: ${SwitchIpFromName['light']}. Queried value says: switchStatus=${switchStatus}. statusShouldBe=${statusShouldBe}`);
    // console.log(`testing if: ${switchStatus.toString()} === ${statusShouldBe?.toString()}`)
    if (statusShouldBe !== null && switchStatus.toString() === statusShouldBe.toString()) {
      console.log(`[${new Date().toLocaleString()}] {confirm-light-state} is correct.`)
      await taskService.complete(task);
    } else {
      const errorMessage = `[${new Date().toLocaleString()}] {confirm-light-state} CHECK FAILED! Error changing state of lights while trying to change it to ${statusShouldBe}. Currently it's ${switchStatus}. Try again...!`
      // console.log(errorMessage)
      const notifierClient = new Notifier();
      await notifierClient.sendNotification(errorMessage)
      await taskService.handleFailure(task, {
        errorMessage,
        errorDetails: `light-state is currently: ${switchStatus}, should be ${statusShouldBe}`,
        retries: 1,
        retryTimeout: 10 * 1000
      });
    }
  }
  /**
  * error-notifier
  */
  errorNotifier = async function({ task, taskService }) {
    const msg = `[${new Date().toLocaleString()}] {error-notifier} called, task.errorMessage: ${task.errorMessage}`;
    console.log(msg);
    const notifierClient = new Notifier();
    await notifierClient.sendNotification(msg)
    await taskService.complete(task);
  }
  constructor(client) {
    this.client = client
  }
  subscribeAll() {
    this.client.subscribe('heater-switch-state', this.heaterSwitchState);
    this.client.subscribe('heater-on', this.heaterOn);
    this.client.subscribe('heater-off', this.heaterOff);
    this.client.subscribe('temp-warning', this.tempWarning);
    this.client.subscribe('water-plant', this.waterPlant);
    this.client.subscribe('water-pump-switch-state', this.waterPumpSwitchState);
    this.client.subscribe('water-pump-ctrl-start', this.waterPumpCtrlStart);
    this.client.subscribe('water-pump-ctrl-stop', this.waterPumpCtrlStop);
    this.client.subscribe('confirm-water-pump-state', this.confirmWaterPumpState);
    this.client.subscribe('confirm-heater-state', this.confirmHeaterState);
    this.client.subscribe('light-switch-state', this.lightSwitchState);
    this.client.subscribe('manage-light', this.manageLight);
    this.client.subscribe('confirm-light-state', this.confirmLightState);
    this.client.subscribe('error-notifier', this.errorNotifier);
  }
  die() {
    this.client.stop()
  }
}

module.exports = WorkflowSubscriptions