const fs = require("fs");
const _ = require("lodash");

const lineRegex = /void ([A-z]+)\(([^)]+)\)/;
const argRegex = /(const )?([A-z:. <>]+) (\*|&|)([A-z]+)/;
const lines = fs.readFileSync("./input.txt").toString().split("\n");

function parseArg(p) {
    const match = p.match(argRegex);
    return {
        isConst: match[1] !== undefined,
        type: match[2],
        modifier: match[3],
        name: match[4]
    }
}

function parseLine(p) {
    const match = p.match(lineRegex);
    const methodName = match[1];
    const params = match[2].split(",").map(p => parseArg(p.trim()));
    return [methodName, params];
}

module.exports = {
    parse() {
        return _.chain(lines)
            .map(parseLine)
            .groupBy(p => p[0])
            .mapValues(p => p[0][1])
            .value();
    }
};
