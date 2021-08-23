const { Client, logger, Variables } = require('camunda-external-task-client-js');


// configuration for the Client:
//  - 'baseUrl': url to the Process Engine
//  - 'logger': utility to automatically log important events
//  - 'asyncResponseTimeout': long polling timeout (then a new request will be issued)
const config = { baseUrl: 'http://localhost:8080/engine-rest', use: logger, asyncResponseTimeout: 10000 };

// create a Client instance with custom configuration
const client = new Client(config);

// susbscribe to the topic: 'charge-card'
client.subscribe('sensor-data', async function({ task, taskService }) {
  // Put your business logic here

  // Get a process variable
  const temperature = task.variables.get('temperature');
  const moisture = task.variables.get('moisture');
  const light = task.variables.get('light');

  console.log(`[${new Date().toLocaleString()}] {sensor-data} Running with new sensor-data: `, { light, moisture, temperature });
  // Complete the task
  await taskService.complete(task);
});


client.subscribe('water-pump-ctrl-start', async function({ task, taskService }) {
  // Put your business logic here
  console.log(`[${new Date().toLocaleString()}] {water-pump-ctrl-start} pretending to turn on the water 🚰 pump now...`)
  // Get a process variable
  const pumpState = task.variables.get('pumpState');
  task.variables.set("pumpState", true)

  console.log(`water-pump-ctrl: pumpState = ${pumpState.toString()}`);
  // Complete the task
  await taskService.complete(task);
});

client.subscribe('water-pump-ctrl-stop', async function({ task, taskService }) {
  // Put your business logic here
  console.log(`[${new Date().toLocaleString()}] {water-pump-ctrl-stop} pretending to turn OFF the water 🚰 pump now...`)
  // Get a process variable
  const pumpState = task.variables.get('pumpState');
  task.variables.set("pumpState", true)

  console.log(`water-pump-ctrl: pumpState = ${pumpState.toString()}`);
  // Complete the task
  await taskService.complete(task);
});

client.subscribe('light-switch-ctrl-start', async function({ task, taskService }) {
  // Put your business logic here
  console.log(`[${new Date().toLocaleString()}] {light-switch-ctrl-start} pretending to turn ON the light 💡 switch now...`)
  // Get a process variable
  // const pumpState = task.variables.get('pumpState');
  // taskService.variables.set('lightState', true)
  // task.variables.set("lightState", true)

  // console.log(`[${new Date().toLocaleString()}] {light-switch-ctrl} status: ${pumpState.toString()}`);
  // Complete the task
  // await taskService.complete(task, );

    // set a process variable
    const processVariables = new Variables();
    processVariables.set("lightState", true);
  
    // complete the task
    await taskService.complete(task, processVariables, {});
  
});

client.subscribe('heat-ctrl-start', async function({ task, taskService }) {
  // Put your business logic here
  console.log(`[${new Date().toLocaleString()}] {heat-ctrl-start} pretending to turn ON the HEAT ♨️ now...`)
  // Get a process variable
  // const pumpState = task.variables.get('pumpState');
  task.variables.set("heaterState", true)

  // console.log(`[${new Date().toLocaleString()}] {light-switch-ctrl} status: ${pumpState.toString()}`);
  // Complete the task
  await taskService.complete(task);
});

client.subscribe('heat-ctrl-stop', async function({ task, taskService }) {
  // Put your business logic here
  console.log(`[${new Date().toLocaleString()}] {heat-ctrl-stop} pretending to turn OFF the HEAT now...`)
  // Get a process variable
  // const pumpState = task.variables.get('pumpState');
  // task.variables.set("heaterState", false)

  // set a process variable
  const processVariables = new Variables();
  processVariables.set("lightState", true);

  // complete the task
  await taskService.complete(task, processVariables, {});
});


