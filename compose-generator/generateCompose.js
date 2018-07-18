const yaml = require("node-yaml");
const _ = require("lodash");

const NUMBER_OF_SHARDS = 2;
const NUMBER_OF_NODES_PER_SHARD = 3;
const NUMBER_OF_CONFIGS = 3;
const NUMBER_OF_ROUTERS = 2;

function humanRange(count) {
    return _.range(1, count+1)
}
function forHumanRange(count, action) {
    humanRange(count)
        .forEach(d => {
            action(d)
        })
}

/*
IP Allocations
- 10.24
    - 0 = ADMIN
        - 1 = GATEWAY
    - 1 = Shards
        - XY = SHARD Y OF X
    - 2 = Configs
        - X = Config server X
    - 3 = Routers
        - X = Router X
    - 4 = Router Viewers
        - X = Router viewer X
    - 5 = Viewers
        - 1 = Shard Viewer
        - 2 = Config viewer
 */
const output = {
    version: "2",
    services: {},
    networks: {
        clusternet: {
            driver: "bridge",
            ipam: {
                config: [{
                    subnet: "10.24.0.0/16",
                    gateway: "10.24.0.1"
                }]
            }
        }
    }
};

// Shard Nodes
forHumanRange(NUMBER_OF_SHARDS, shardNumber => {
    forHumanRange(NUMBER_OF_NODES_PER_SHARD, nodeNumber => {

        const containerName = `mongo_shard${shardNumber}_node${nodeNumber}`;
        output.services[containerName] = {
            container_name: containerName,
            image: "mongo_patched",
            command: `mongod --shardsvr --replSet mongors${shardNumber} --dbpath /data/db --port 27017 --bind_ip 0.0.0.0`,
            volumes: [
                "/etc/localtime:/etc/localtime:ro",
                `$PWD/logs/mongo_shard${shardNumber}_node${nodeNumber}.prov:/provenance`,
                `$PWD/logs/mongo_shard${shardNumber}_node${nodeNumber}.stdout:/stdout`,
                `$PWD/logs/mongo_shard${shardNumber}_node${nodeNumber}.stderr:/stderr`
            ],
            ports: [
                `127.0.0.1:271${shardNumber}${nodeNumber}:27017`
            ],
            /*
            tmpfs: [
                "/data/db"
            ],
            */
            networks: {
                clusternet: {
                    ipv4_address: `10.24.1.${shardNumber}${nodeNumber}`
                }
            }
        }
    })
});

//Config Nodes
forHumanRange(NUMBER_OF_CONFIGS, (configNumber) => {
    const name = `mongo_config${configNumber}`;
    output.services[name] = {
        container_name: name,
        image: "mongo_patched",
        command: "mongod --configsvr --replSet mongors1conf --dbpath /data/db --port 27017 --bind_ip 0.0.0.0",
        volumes: [
            "/etc/localtime:/etc/localtime:ro",
            `$PWD/logs/mongo_config${configNumber}.prov:/provenance`,
            `$PWD/logs/mongo_config${configNumber}.stdout:/stdout`,
            `$PWD/logs/mongo_config${configNumber}.stderr:/stderr`,
        ],
        ports: [
            `127.0.0.1:2720${configNumber}:27017`
        ],
        /*
        tmpfs: [
            "/data/db"
        ],
        */
        networks: {
            clusternet: {
                ipv4_address: `10.24.2.${configNumber}`
            }
        }
    }
});
/*
mongo-express-data1:
        container_name: mongo-express-data1
        image: mongo-express
        depends_on:
            - mongos1
        ports:
            - '8081:8081'
        environment:
            - ME_CONFIG_MONGODB_ENABLE_ADMIN=true
            - ME_CONFIG_MONGODB_SERVER=mongos1
 */
forHumanRange(NUMBER_OF_ROUTERS, (routerNumber) => {
    const nodeName = `mongos${routerNumber}`;
    output.services[nodeName] = {
        container_name: nodeName,
        image: "mongo_patched",
        depends_on: humanRange(2).map(p => `mongo_config${p}`),
        command: "mongos --configdb mongors1conf/mongo_config1:27017,mongo_config2:27017,mongo_config3:27017 --port 27017 --bind_ip 0.0.0.0",
        ports: [
            `127.0.0.1:2730${routerNumber}:27017`,
            `0.0.0.0:${27016+routerNumber}:27017`
        ],
        volumes: [
            "/etc/localtime:/etc/localtime:ro",
            `$PWD/logs/mongos${routerNumber}.prov:/provenance`,
            `$PWD/logs/mongos${routerNumber}.stdout:/stdout`,
            `$PWD/logs/mongos${routerNumber}.stderr:/stderr`
        ],
        /*
        tmpfs: [
            "/data/db"
        ],
        */
        networks: {
            clusternet: {
                ipv4_address: `10.24.3.${routerNumber}`
            }
        }
    };
    const viewerName = `mongo-express-data${routerNumber}`;
    output.services[viewerName] = {
        "container_name": viewerName,
        image: "mongo-express",
        "depends_on": [
            nodeName
        ],
        ports: [
            `127.0.0.1:808${routerNumber}:8081`
        ],
        environment: [
            "ME_CONFIG_MONGODB_ENABLE_ADMIN=true",
            `ME_CONFIG_MONGODB_SERVER=${nodeName}`
        ],
        networks: {
            clusternet: {
                ipv4_address: `10.24.4.${routerNumber}`
            }
        }
    }
});

output.services["shard-viewer"] = {
    container_name: "shard-viewer",
    image: "shard-viewer",
    ports: [
        "127.0.0.1:8084:3000"
    ],
    depends_on: humanRange(NUMBER_OF_CONFIGS).map(p => `mongo_config${p}`),
    networks: {
        clusternet: {
            ipv4_address: `10.24.5.1`
        }
    }
};

output.services["mongo-express-config"] = {
    container_name: "mongo-express-config",
    image: "mongo-express",
    depends_on: humanRange(NUMBER_OF_CONFIGS).map(p => `mongo_config${p}`),
    ports: [
        "127.0.0.1:8083:8081"
    ],
    environment: [
        "ME_CONFIG_MONGODB_ENABLE_ADMIN=true",
        "ME_CONFIG_MONGODB_SERVER=mongo_config1,mongo_config2,mongo_config3"
    ],
    networks: {
        clusternet: {
            ipv4_address: `10.24.5.2`
        }
    }
};

console.log(JSON.stringify(output));
console.log(JSON.stringify(yaml.readSync("./target.yml")));

yaml.writeSync("../cluster/mongo-sharded/docker-compose.yml", output);
