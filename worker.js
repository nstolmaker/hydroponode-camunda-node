const { Client, logger, Variables } = require('camunda-external-task-client-js');


// configuration for the Client:
//  - 'baseUrl': url to the Process Engine
//  - 'logger': utility to automatically log important events
//  - 'asyncResponseTimeout': long polling timeout (then a new request will be issued)
const config = { baseUrl: 'http://localhost:8080/engine-rest', use: logger, asyncResponseTimeout: 10000 };

// create a Client instance with custom configuration
const client = new Client(config);

/**
 * sensor-data
 */
client.subscribe('sensor-data', async function({ task, taskService }) {
  const temperature = task.variables.get('temperature');
  const moisture = task.variables.get('moisture');
  const light = task.variables.get('light');

  console.log(`[${new Date().toLocaleString()}] {sensor-data} Running with new sensor-data: `, { light, moisture, temperature });
  await taskService.complete(task);
});

/** 
 * water-pump-ctrl-start
 */
client.subscribe('water-pump-ctrl-start', async function({ task, taskService }) {
  console.log(`[${new Date().toLocaleString()}] {water-pump-ctrl-start} pretending to turn on the water 🚰 pump now...`)

  const processVariables = new Variables();
  processVariables.set("pumpState", true)

  console.log(`water-pump-ctrl: pumpState = ${processVariables.get("pumpState")}`);
  await taskService.complete(task, processVariables);
});

/**
 * water-pump-ctrl-stop
 */
client.subscribe('water-pump-ctrl-stop', async function({ task, taskService }) {
  console.log(`[${new Date().toLocaleString()}] {water-pump-ctrl-stop} pretending to turn OFF the water 🚰 pump now...`)

  const processVariables = new Variables();
  processVariables.set("pumpState", false)
  console.log(`water-pump-ctrl: pumpState = ${processVariables.get("pumpState")}`);
  await taskService.complete(task, processVariables);
});

/** 
 * light-switch-ctrl-start
 */
client.subscribe('light-switch-ctrl-start', async function({ task, taskService }) {
  console.log(`[${new Date().toLocaleString()}] {light-switch-ctrl-start} pretending to turn ON the light 💡 switch now...`)

  const processVariables = new Variables();
  processVariables.set("lightState", true);
  await taskService.complete(task, processVariables);
});

/** 
 * heat-ctrl-start
 */
client.subscribe('heat-ctrl-start', async function({ task, taskService }) {
  console.log(`[${new Date().toLocaleString()}] {heat-ctrl-start} pretending to turn ON the HEAT ♨️ now...`)

  const processVariables = new Variables();
  processVariables.set("heaterState", true);
  await taskService.complete(task, processVariables);
});

/** 
 * heat-ctrl-stop
 */
client.subscribe('heat-ctrl-stop', async function({ task, taskService }) {
  console.log(`[${new Date().toLocaleString()}] {heat-ctrl-stop} pretending to turn OFF the HEAT ♨️ now...`)
  
  const processVariables = new Variables();
  processVariables.set("heaterState", false);
  await taskService.complete(task, processVariables);
});


