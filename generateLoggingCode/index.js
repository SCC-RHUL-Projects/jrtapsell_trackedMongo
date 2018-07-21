const {parse} = require("./parser");
const _ = require("lodash");
const fs = require("fs");

const data = parse();

function convertToString(data) {
    let human = data.modifier + data.type;
    switch (human) {
    case "StringData":
    case "&UserName":
    case "&RoleName":
        return {"null": `utils.quote(${data.name}.toString())`};
    case "bool":
        return {"null": `${data.name} ? "true" : "false"`};
    case "ErrorCodes::Error":
        return {"null": `utils.quote(ErrorCodes::errorString(${data.name}))`};
    case "&NamespaceString":
        return {"null": `utils.quote(${data.name}.toString())`};
    case "&OpMsgRequest":
        return {
            "name": `utils.quote(${data.name}.getCommandName().toString())`,
            "data": `${data.name}.body.jsonString()`
    };
    case "&BSONObj":
        return {
            "null": `${data.name}.jsonString()`
        };
    case "*BSONObj":
        return {
            "null": `(${data.name} == NULL) ? "null" : ${data.name}->jsonString()`
        };
    case "&audit::CommandInterface":
    case "*OperationContext":
    case "*BSONObjBuilder":
        return {};
    case "long long":
        return {
            "null": `to_string(${data.name})`
        };
case "&std::string":
    return {
        "null": `utils.quote(${data.name})`
    };
case "&std::vector <RoleName>":
    return {
        "null": `utils.translateRoles(${data.name})`
};
case "*std::vector <RoleName>":
    return {
        "null": `(${data.name} != NULL) ? utils.translateRoles(*${data.name}) : "null"`
    };
case "*PrivilegeVector":
    return {
        "null": `(${data.name} != NULL) ? utils.translatePrivs(*${data.name}) : "null"`
    };
    /**/
case "&PrivilegeVector":
    return {
        "null": `utils.translatePrivs(${data.name})`
};
    case "&boost::optional <BSONArray>":
        return {
            "null": `utils.translateOptArray(${data.name})`
        };
        default:
            console.log(human);
            return null;
    }
}let fileHeader = `using namespace std;
using namespace mongo;

#include "mongo/base/error_codes.h"

#include "mongo/db/auth/privilege.h"
#include "mongo/db/auth/user.h"
#include "mongo/rpc/op_msg.h"

#include "mongo/db/audit.h"

`;

const ret = _.chain(data)
    .map((arguments, methodName) => {
        let clientArgument;
        if (arguments[0].name === "client") {
            clientArgument = "client";
        } else {
            clientArgument = "NULL";
        }

        let headerLine = `void ProvCon::${methodName}(` +
            _.chain(arguments)
                .map(argument => {
                    const {type, modifier, name, isConst} = argument;
                    let constPrefix;
                    if (isConst) {
                        constPrefix = "const "
                    } else {
                        constPrefix = ""
                    }
                    return `${constPrefix}${type} ${modifier}${name}`
                })
                .join(", ")
                .value() + ")";
        const outputs = _.chain(arguments)
            .filter(p => p.name !== "client")
            .flatMap(p => {
                let collection = convertToString(p);
                return _.map(collection, (value, index) => {
                    let tail;
                    if (index !== "null") {
                        tail = "_" + index;
                    } else {
                        tail = "";
                    }
                    return [p.name + tail, value];
                });
            })
            .value();
        return headerLine + `{` +
            _.chain(outputs).map(p => `\n\tstring STR_${p[0]} = ${p[1]};`).join("") +
            `\n\twriteEvent(${clientArgument}, "${methodName}", {` +
            _.chain(outputs).map(p => `\n\t\t{"${p[0]}", STR_${p[0]}}`).join(",") +
            `\n\t});\n}`
    })
    .join("\n\n")
    .value();

fs.writeFileSync("../mongo/src/jrtapsell/autoGen.h", fileHeader + ret);
