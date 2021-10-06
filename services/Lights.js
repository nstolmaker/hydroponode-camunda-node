/* CONTROL THE LIGHTS! */

// import { DateTime, Interval } from "luxon";
const { DateTime, Interval } = require("luxon")
// import _ from 'lodash'
// const {throttle} = _
const execAsync = require('util').promisify(require('child_process').exec);

class Lights {
  constructor(Consts) {
    this.Consts = Consts
    // console.log("Did the constants make it in? ")
    // console.log(this.Consts)
    // if stopTime < startTime then they mean that time in the AM *tomorrow*. The luxon library will handle the date math for us, so just add 24 hours.
    if (this.Consts.LIGHTS_OFF_TIME < this.Consts.LIGHTS_ON_TIME) this.Consts.LIGHTS_OFF_TIME +=24;
  }
  switchOff = async function() {
    console.log("💡⬇️ Turning off switch")
    return execAsync("./tplink_smartplug.py -t "+this.Consts.LIGHTS_IP_ADDRESS+" -c off", (error, stdout, stderr) => {
      if (error) {
          console.log(`error: ${error.message}`);
          return;
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
      }
      // console.log(`stdout: ${stdout}`);
    });    
  };
  switchOn = async function() {
    console.log("💡⬆️ Turning on switch")
    return execAsync("./tplink_smartplug.py -t "+this.Consts.LIGHTS_IP_ADDRESS+" -c on", (error, stdout, stderr) => {
      if (error) {
          console.log(`error: ${error.message}`);
          return;
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
      }
      // console.log(`stdout: ${stdout}`);
    });
  };
  async manageLights(lux) {
    const startTimeDT = DateTime.local().startOf("day").plus({hours: this.Consts.LIGHTS_ON_TIME});
    const stopTimeDT = DateTime.local().startOf("day").plus({hours: this.Consts.LIGHTS_OFF_TIME});
    const onInterval = Interval.fromDateTimes(startTimeDT, stopTimeDT);
    const currentTimeDT = DateTime.local();
    const onOrOff = onInterval.contains(currentTimeDT);

    if (onOrOff) {
      console.log("Lights should be on");
      // if (lux < this.Consts.GREENHOUSE_LIGHT_MIN) {
          // console.log("Switching on lights");
          await this.switchOn();
          return { 'lightShouldBe': 'testing' };
      // }
    } else {
      console.log("lights should be off")
      await this.switchOff();
      return { 'lightShouldBe': 'false' };
    }
  };
}

module.exports = Lights