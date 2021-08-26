#!/bin/zsh

# start
curl -H "Content-Type: application/json" -X POST -d '{"variables":{"temperature":{"value":"55","type":"long"},"light":{"value":"50","type":"long"},"moisture":{"value":"53"}}}' http://localhost:8080/engine-rest/process-definition/key/hydroponode/start
curl -H "Content-Type: application/json" -X POST -d '
{"variables":{"temperature":{"value":"55","type":"long"},"light":{"value":"50","type":"long"},"moisture":{"value":"53"}}}
' http://localhost:8080/engine-rest/process-definition/key/hydroponode/start

# send in new sensor data
curl -H "Content-Type: application/json" -X POST -d '{"workerId":"null","variables":{"temperature":{"value":"55","type":"long"},"light":{"value":"50","type":"long"},"moisture":{"value":"53"}}}' http://localhost:8080/engine-rest/external-task/26e89934-014d-11ec-9698-0242ac110002/complete


# pretend the water pump has turned on:
curl -H "Content-Type: application/json" -X POST -d '{"workerId":"null","variables":{"temperature":{"value":"55","type":"long"},"light":{"value":"50","type":"long"},"moisture":{"value":"53"}}}' http://localhost:8080/engine-rest/external-task//complete

GET/POST Executions?
{ "processInstanceId": "910819ca-06bf-11ec-a887-0242ac110002",
"signalEventSubscriptionName " : "sensor-data" }


POST /execution/anExecutionId/messageSubscriptions/someMessage/trigger

Request body:

{"variables" :
    {"aVariable" : {"value" : true, "type": "Boolean"},
     "anotherVariable" : {"value" : 42, "type": "Integer"}}
}



Request¶
POST /execution/{id}/signal

Request body:

{"variables":
    {"myVariable": {"value": "camunda", "type": "String"},
    "mySecondVariable": {"value": 124, "type": "Integer"}}
}



First, get the executionId
POST /execution 



---
or maybe this will jsut work:
---
POST http://localhost:8080/engine-rest/execution
body: 
{ "processInstanceId": "910819ca-06bf-11ec-a887-0242ac110002",
"signalEventSubscriptionName " : "sensor-data" }

RETURNS:
[
  {
"id": "910819ca-06bf-11ec-a887-0242ac110002",
"processInstanceId": "910819ca-06bf-11ec-a887-0242ac110002",
"ended": false,
"tenantId": null
},
  {
"id": "9111b6c2-06bf-11ec-a887-0242ac110002",
"processInstanceId": "910819ca-06bf-11ec-a887-0242ac110002",
"ended": false,
"tenantId": null
}
],

foreach (returns):

# NOW PASS IT ITS DATA:

id= 910819ca-06bf-11ec-a887-0242ac110002

POST /execution/910819ca-06bf-11ec-a887-0242ac110002/signal
http://localhost:8080/engine-rest/execution/910819ca-06bf-11ec-a887-0242ac110002/signal
or 
http://localhost:8080/engine-rest/execution/910819ca-06bf-11ec-a887-0242ac110002/sensor-data/trigger

Request body:

{"variables":
    {
      "moisture": {"value": 98, "type": "Integer"},
      "light": {"value": 97, "type": "Integer"},
      "temperature": {"value": 96, "type": "Integer"}
    }
}
