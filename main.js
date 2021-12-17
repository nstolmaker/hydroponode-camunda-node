require('dotenv').config()
const { Client, logger } = require('camunda-external-task-client-js');
const { Consts, setSwitchStatus, getSwitchStatus, SwitchIpFromName } = require('./util.js')

const WorkflowSubscriptions = require('./services/WorkflowSubscriptions.js')

console.log("[${new Date().toLocaleString()}] WORKER STARTED. Using Camunda Engine @ "+Consts.engineConfig.baseUrl)
// create a Client instance with custom configuration

const client = new Client(Consts.engineConfig);
const workflow = new WorkflowSubscriptions(client)
workflow.subscribeAll()
