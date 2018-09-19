# Blockchain Data

Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing your own simplified private blockchain.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Configuring your project

- Use NPM to initialize your project and create package.json to store project dependencies.
```
npm init
```
- Install crypto-js with --save flag to save dependency to our package.json file
```
npm install crypto-js --save
```
- Install level with --save flag
```
npm install level --save
```
- Install Node Js Framework Hapi with --save flag
```
npm install hapi --save
```

# REST End Points
## GET Block end point
Method Type : GET

Description : Gets block at a given height

Validation : Height is required to get the block.

URL - http://localhost:8000/block/{height}

Curl - To get block at height 1
```
curl -X GET --header 'Accept: application/json' 'http://localhost:8000/block/1'
```
Request URL - To get block at height 1
```
http://localhost:8000/block/1
```
Response Body - Block in JSON Format
```
{
  "hash": "ecb6600d95546adf1fd805b5fbf140f0e1b9ea1b74ba23ff625ba21d74d601cf",
  "height": 1,
  "body": "Test Block - 1",
  "time": "1536583513",
  "previousBlockHash": "5767439e14a8ce0c0c80de149817f4bba13162ccbd4659d1884ba29aeb867085"
}
```

## Post Block end point
Method Type : POST

Description : Adds block to current blockchain,passing a block data as payload => {"body":"Block data"}

Validation : Block can't be added if body is empty.

URL - http://localhost:8000/block

Curl - To add block
```
curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' -d '{
  "body": "deep chain"
}' 'http://localhost:8000/block'
```
Request URL - To add block
```
http://localhost:8000/block
```
Response Body - Added Block in JSON Format
```
{
  "hash": "6f470d29f1ee4e9a1f1bf48f0f9468085564c0046cc92976895c2993c2736a09",
  "height": 10,
  "body": "deep chain",
  "time": "1536599269",
  "previousBlockHash": "a2888555fdcf8ab889711916ff8cffe8786ab20159554a8617b0779d8a05d35f"
}
```
