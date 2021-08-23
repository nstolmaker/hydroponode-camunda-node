#!/bin/zsh

# start
curl -H "Content-Type: application/json" -X POST -d '{"variables":{"temperature":{"value":"55","type":"long"},"light":{"value":"50","type":"long"},"moisture":{"value":"53"}}}' http://localhost:8080/engine-rest/process-definition/key/hydroponode/start

# send in new sensor data
curl -H "Content-Type: application/json" -X POST -d '{"workerId":"null","variables":{"temperature":{"value":"55","type":"long"},"light":{"value":"50","type":"long"},"moisture":{"value":"53"}}}' http://localhost:8080/engine-rest/external-task/26e89934-014d-11ec-9698-0242ac110002/complete


# pretend the water pump has turned on:
curl -H "Content-Type: application/json" -X POST -d '{"workerId":"null","variables":{"temperature":{"value":"55","type":"long"},"light":{"value":"50","type":"long"},"moisture":{"value":"53"}}}' http://localhost:8080/engine-rest/external-task//complete