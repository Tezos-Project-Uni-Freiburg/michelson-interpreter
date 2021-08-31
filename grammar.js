// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

/*jshint esversion: 6 */
const moo = require("moo");

const macroCADRconst = /C[AD]+R/;
const macroSETCADRconst = /SET_C[AD]+R/;
const macroDIPconst = /DII+P/;
const macroDUPconst = /DUU+P/;
const DIPmatcher = new RegExp(macroDIPconst);
const DUPmatcher = new RegExp(macroDUPconst);
const macroASSERTlistConst = ["ASSERT", "ASSERT_EQ", "ASSERT_NEQ", "ASSERT_GT",
                              "ASSERT_LT", "ASSERT_GE", "ASSERT_LE", "ASSERT_NONE",
                              "ASSERT_SOME", "ASSERT_LEFT", "ASSERT_RIGHT", "ASSERT_CMPEQ",
                              "ASSERT_CMPNEQ", "ASSERT_CMPGT", "ASSERT_CMPLT", "ASSERT_CMPGE",
                              "ASSERT_CMPLE"];
const macroIFCMPlist = ["IFCMPEQ", "IFCMPNEQ", "IFCMPLT", "IFCMPGT", "IFCMPLE", "IFCMPGE"];
const macroCMPlist = ["CMPEQ", "CMPNEQ", "CMPLT", "CMPGT", "CMPLE", "CMPGE"];
const macroIFlist = ["IFEQ", "IFNEQ", "IFLT", "IFGT", "IFLE", "IFGE"];
const lexer = moo.compile({
    annot: /[\@\%\:][a-z_A-Z0-9]+/,
    // comment: /\#.*/,
    comment: /(?:\#.*)|(?:\/\*[\s\S]*\*\/)/,
    lparen: "(",
    rparen: ")",
    lbrace: "{",
    rbrace: "}",
    ws: {match: /\s+/, lineBreaks: true},
    semicolon: ";",
    number: /-?[0-9]+/,
    parameter: ["parameter", "Parameter"],
    storage: ["Storage", "storage"],
    code: ["Code", "code"],
    comparableType: ["int", "nat", "string", "bytes", "mutez", "bool", "key_hash", "timestamp", "chain_id"],
    constantType: ["key", "unit", "signature", "operation", "address"],
    singleArgType: ["option", "list", "set", "contract"],
    doubleArgType: ["pair", "or", "lambda", "map", "big_map"],
    baseInstruction: ["ABS", "ADD", "ADDRESS", "AMOUNT", "AND", "BALANCE", "BLAKE2B", "CAR", "CAST", "CDR", "CHECK_SIGNATURE",
        "COMPARE", "CONCAT", "CONS", "CONTRACT", /*"CREATE_CONTRACT",*/ "DIP", /*"DROP",*/ "DUP", "EDIV",
        "EMPTY_SET", "EQ", "EXEC", "FAIL", "FAILWITH", "GE", "GET", "GT", "HASH_KEY", "IF", "IF_CONS", "IF_LEFT", "IF_NONE",
        "IF_RIGHT", "IMPLICIT_ACCOUNT", "INT", "ISNAT", "ITER", "LAMBDA", "LE", "LEFT", "LOOP", "LOOP_LEFT", "LSL", "LSR", "LT",
        "MAP", "MEM", "MUL", "NEG", "NEQ", "NIL", "NONE", "NOT", "NOW", "OR", "PACK", "PAIR", /*"PUSH",*/ "REDUCE", "RENAME", "RIGHT", "SELF",
        "SENDER", "SET_DELEGATE", "SHA256", "SHA512", "SIZE", "SLICE", "SOME", "SOURCE", "STEPS_TO_QUOTA", "SUB", "SWAP",
        "TRANSFER_TOKENS", "UNIT", "UNPACK", "UPDATE", "XOR",
        "UNPAIR", "UNPAPAIR",
        "IF_SOME",
        "IFCMPEQ", "IFCMPNEQ", "IFCMPLT", "IFCMPGT", "IFCMPLE", "IFCMPGE", "CMPEQ", "CMPNEQ", "CMPLT", "CMPGT", "CMPLE",
        "CMPGE", "IFEQ", "NEQ", "IFLT", "IFGT", "IFLE", "IFGE",
        /*"DIG",*/ /*"DUG",*/ "EMPTY_BIG_MAP", "APPLY", "CHAIN_ID"
    ],
    macroCADR: macroCADRconst,
    macroDIP: macroDIPconst,
    macroDUP: macroDUPconst,
    macroSETCADR: macroSETCADRconst,
    macroASSERTlist: macroASSERTlistConst,
    constantData: ["Unit", "True", "False", "None", "instruction"],
    singleArgData: ["Left", "Right", "Some"],
    doubleArgData: ["Pair"],
    elt: "Elt",
    word: /[a-zA-Z_0-9]+/,
    string: /"(?:\\["\\]|[^\n"\\])*"/
});
const checkC_R = c_r => {
    var pattern = new RegExp("^C(A|D)(A|D)+R$"); // TODO
    return pattern.test(c_r);
};
const expandC_R = (word, annot, d) => {
    var expandedC_R = word.slice(1, -1).split("").map(c => (c === "A" ? '{ "prim": "CAR" }' : '{ "prim": "CDR" }'));
    if (annot != null) {
        const lastChar = word.slice(-2, -1);
        if (lastChar === "A") {
            expandedC_R[expandedC_R.length - 1] = `{ "prim": "CAR", "annots": [ ${annot} ], "line": "${findLine(d)}" }`;
        }
        else if (lastChar === "D") {
            expandedC_R[expandedC_R.length - 1] = `{ "prim": "CDR", "annots": [ ${annot} ], "line": "${findLine(d)}" }`;
        }
    }
    return `[ ${expandedC_R.join(", ")}, { "line": "${findLine(d)}" } ]`;
};
const check_compare = cmp => macroCMPlist.includes(cmp);
const expand_cmp = (cmp, annot, d) => {
    var op = cmp.substring(3);
    var binary_op = keywordToJson([`${op}`]);
    var compare = keywordToJson(["COMPARE"]);
    if (annot != null) {
        binary_op = `{ "prim": "${op}", "annots": [${annot}], "line": "${findLine(d)}" }`;
    }
    return `[ ${compare}, ${binary_op}, { "line": "${findLine(d)}" } ]`;
};
const check_dup = dup => DUPmatcher.test(dup);
const expand_dup = (dup, annot, d) => {
    let t = "";
    if (DUPmatcher.test(dup)) {
        const c = dup.length - 3;
        for (let i = 0; i < c; i++) {
            t += '[ { "prim": "DIP", "args": [ ';
        }
        if (annot == null) {
            t += `[ { "prim": "DUP" }, { "line": "${findLine(d)}" } ]`;
        }
        else {
            t += `[ { "prim": "DUP", "annots": [${annot}] }, { "line": "${findLine(d)}" } ]`;
        }
        for (let i = 0; i < c; i++) {
            t += ` ] }, { "prim": "SWAP" }, { "line": "${findLine(d)}" } ]`;
        }
        return t;
    }
    throw new Error("");
};
const check_assert = assert => macroASSERTlistConst.includes(assert);
const expand_assert = (assert, annot, d) => {
    const annotation = !!annot ? `, "annots": [ ${annot} ]` : "";
    switch (assert) {
        case "ASSERT":
            return `[ { "prim": "IF", "args": [ [], [ [ { "prim": "UNIT" }, { "prim": "FAILWITH" ${annotation} } ] ] ] }, { "line": "${findLine(d)}" } ]`;
        case "ASSERT_CMPEQ":
            return `[ [ { "prim": "COMPARE"}, { "prim": "EQ" } ], {"prim": "IF", "args": [ [], [ [ { "prim": "UNIT" }, { "prim": "FAILWITH" ${annotation} } ] ] ] }, { "line": "${findLine(d)}" } ]`;
        case "ASSERT_CMPGE":
            return `[ [ { "prim":"COMPARE" }, { "prim": "GE" } ], { "prim": "IF", "args": [ [], [ [ { "prim": "UNIT" }, { "prim": "FAILWITH" ${annotation} } ] ] ] }, { "line": "${findLine(d)}" } ]`;
        case "ASSERT_CMPGT":
            return `[ [ { "prim": "COMPARE" }, { "prim": "GT" } ], { "prim": "IF", "args": [ [], [ [ { "prim": "UNIT" }, { "prim": "FAILWITH" ${annotation} } ] ] ] }, { "line": "${findLine(d)}" } ]`;
        case "ASSERT_CMPLE":
            return `[ [ { "prim": "COMPARE" }, { "prim": "LE" } ], { "prim": "IF", "args": [ [], [ [ { "prim": "UNIT" }, { "prim": "FAILWITH" ${annotation} } ] ] ] }, { "line": "${findLine(d)}" } ]`;
        case "ASSERT_CMPLT":
            return `[ [ { "prim": "COMPARE" }, { "prim": "LT" } ], { "prim": "IF", "args": [ [], [ [ { "prim": "UNIT" }, { "prim": "FAILWITH" ${annotation} } ] ] ] }, { "line": "${findLine(d)}" } ]`;
        case "ASSERT_CMPNEQ":
            return `[ [ { "prim": "COMPARE" }, { "prim": "NEQ" } ], { "prim": "IF", "args": [ [], [ [ { "prim": "UNIT" }, { "prim": "FAILWITH" ${annotation} } ] ] ] }, { "line": "${findLine(d)}" } ]`;
        case "ASSERT_EQ":
            return `[ { "prim": "EQ" }, { "prim": "IF", "args": [ [], [ [ { "prim": "UNIT" }, { "prim": "FAILWITH" ${annotation} } ] ] ], { "line": "${findLine(d)}" } ]`;
        case "ASSERT_GE":
            return `[ { "prim": "GE" }, { "prim": "IF", "args": [ [], [ [ { "prim": "UNIT" }, { "prim":"FAILWITH" ${annotation} } ] ] ] }, { "line": "${findLine(d)}" } ]`;
        case "ASSERT_GT":
            return `[ { "prim": "GT" }, { "prim": "IF", "args": [ [], [ [ { "prim": "UNIT" }, { "prim": "FAILWITH" ${annotation} } ] ] ] }, { "line": "${findLine(d)}" } ]`;
        case "ASSERT_LE":
            return `[ { "prim": "LE" }, { "prim": "IF", "args": [ [], [ [ { "prim": "UNIT" }, { "prim": "FAILWITH" ${annotation} } ] ] ] }, { "line": "${findLine(d)}" } ]`;
        case "ASSERT_LT":
            return `[ { "prim": "LT" }, { "prim": "IF", "args": [ [], [ [ { "prim": "UNIT" }, { "prim": "FAILWITH" ${annotation} } ] ] ] }, { "line": "${findLine(d)}" } ]`;
        case "ASSERT_NEQ":
            return `[ { "prim": "NEQ" }, { "prim": "IF", "args": [ [], [ [ { "prim": "UNIT" }, { "prim": "FAILWITH" ${annotation} } ] ] ] }, { "line": "${findLine(d)}" } ]`;
        default:
            return "";
    }
};
const check_fail = fail => fail === "FAIL";
const expand_fail = (fail, annot, d) => {
    if (annot == null) {
        return `[ { "prim": "UNIT" }, { "prim": "FAILWITH" }, { "line": "${findLine(d)}" } ]`;
    }
    else {
        return `[ { "prim": "UNIT" }, { "prim": "FAILWITH", "annots": [${annot}] }, { "line": "${findLine(d)}" } ]`;
    }
};
const check_if = ifStatement => (macroIFCMPlist.includes(ifStatement) || macroIFlist.includes(ifStatement) || ifStatement === "IF_SOME"); // TODO: IF_SOME
const expandIF = (ifInstr, ifTrue, ifFalse, annot, d) => {
    const annotation = !!annot ? `, "annots": [ ${annot} ] ` : " ";
    switch (ifInstr) {
        case "IFCMPEQ":
            return `[ { "prim": "COMPARE" }, { "prim": "EQ" }, { "prim": "IF", "args": [ [ ${ifTrue} ], [ ${ifFalse} ] ]${annotation}}, { "line": "${findLine(d)}" } ]`;
        case "IFCMPGE":
            return `[ { "prim": "COMPARE" }, { "prim": "GE" }, { "prim": "IF", "args": [ [ ${ifTrue} ], [ ${ifFalse} ] ]${annotation}}, { "line": "${findLine(d)}" } ]`;
        case "IFCMPGT":
            return `[ { "prim": "COMPARE" }, { "prim": "GT" }, { "prim": "IF", "args": [ [ ${ifTrue} ], [ ${ifFalse} ] ]${annotation}}, { "line": "${findLine(d)}" } ]`;
        case "IFCMPLE":
            return `[ { "prim": "COMPARE" }, { "prim": "LE" }, { "prim": "IF", "args": [ [ ${ifTrue} ], [ ${ifFalse} ] ]${annotation}}, { "line": "${findLine(d)}" } ]`;
        case "IFCMPLT":
            return `[ { "prim": "COMPARE" }, { "prim": "LT" }, { "prim": "IF", "args": [ [ ${ifTrue} ], [ ${ifFalse} ] ]${annotation}}, { "line": "${findLine(d)}" } ]`;
        case "IFCMPNEQ":
            return `[ { "prim": "COMPARE" }, { "prim": "NEQ" }, { "prim": "IF", "args": [ [ ${ifTrue} ], [ ${ifFalse} ] ]${annotation}}, { "line": "${findLine(d)}" } ]`;
        case "IFEQ":
            return `[ { "prim":"EQ" }, { "prim": "IF", "args": [ [ ${ifTrue} ], [ ${ifFalse} ] ]${annotation}}, { "line": "${findLine(d)}" } ]`;
        case "IFGE":
            return `[ { "prim": "GE" }, { "prim": "IF", "args": [ [ ${ifTrue} ], [ ${ifFalse} ] ]${annotation}}, { "line": "${findLine(d)}" } ]`;
        case "IFGT":
            return `[ { "prim": "GT" }, { "prim": "IF", "args": [ [ ${ifTrue} ], [ ${ifFalse} ] ]${annotation}}, { "line": "${findLine(d)}" } ]`;
        case "IFLE":
            return `[ { "prim": "LE" }, { "prim": "IF", "args": [ [ ${ifTrue} ], [ ${ifFalse} ] ]${annotation}}, { "line": "${findLine(d)}" } ]`;
        case "IFLT":
            return `[ { "prim": "LT" }, { "prim": "IF", "args": [ [ ${ifTrue} ], [ ${ifFalse} ] ]${annotation}}, { "line": "${findLine(d)}" } ]`;
        case "IFNEQ":
            return `[ { "prim": "NEQ" }, { "prim": "IF", "args": [ [ ${ifTrue} ], [ ${ifFalse} ] ]${annotation}}, { "line": "${findLine(d)}" } ]`;
        case "IF_SOME":
            return `[ { "prim": "IF_NONE", "args": [ [ ${ifFalse} ], [ ${ifTrue} ] ]${annotation}}, { "line": "${findLine(d)}" } ]`;
        default:
            return "";
    }
};
const check_dip = dip => DIPmatcher.test(dip);
const expandDIP = (dip, instruction, annot, d) => {
    let t = "";
    if (check_dip(dip)) {
        const c = dip.length - 2;
        for (let i = 0; i < c; i++) {
            t += '[ { "prim": "DIP", "args": [ ';
        }
        t = `${t} [ ${instruction} ] ]`;
        if (annot != null && !!annot) {
            t = `${t}, "annots": [ ${annot} ]`;
        }
        t += " }]";
        for (let i = 0; i < c - 1; i++) {
            t += ` ] }, { "line": "${findLine(d)}" } ]`;
        }
        return t;
    }
    throw new Error(`Unexpected parameter for DIP processing: ${dip}`);
};
const check_other = word => (word === "UNPAIR" || word === "UNPAPAIR"); // TODO: dynamic matching
//UNPAIR and annotations follows a nonstandard format described in docs, and is dependent on the number of
//annotations given to the command, right now we're hard coding to fix the multisig contract swiftly, but a
//more general solution is required in the longterm.
const expand_other = (word, annot, d) => {
    if (word === "UNPAIR") {
        if (annot == null) {
            // return '[ [ { "prim": "DUP" }, { "prim": "CAR" }, { "prim": "DIP", "args": [ [ { "prim": "CDR" } ] ] } ] ]';
            return `[ { "prim": "DUP" }, { "prim": "CAR" }, { "prim": "DIP", "args": [ {"prim": "CDR" } ] }, { "line": "${findLine(d)}" } ]`;
        }
        else if (annot.length === 1) {
            // return `[ [ { "prim": "DUP" }, { "prim": "CAR", "annots": [${annot}] }, { "prim": "DIP", "args": [ [ { "prim": "CDR" } ] ]  } ] ]`;
            return `[ { "prim": "DUP" }, { "prim": "CAR", "annots": [${annot}] }, { "prim": "DIP", "args": [ { "prim": "CDR" } ] }, { "line": "${findLine(d)}" } ]`;
        }
        else if (annot.length === 2) {
            // return `[ [ { "prim": "DUP" }, { "prim": "CAR", "annots": [${annot[0]}] }, { "prim": "DIP", "args": [ [ { "prim": "CDR", "annots": [${annot[1]}] } ] ]  } ] ]`;
            return `[ { "prim": "DUP" }, { "prim": "CAR", "annots": [${annot[0]}] }, { "prim": "DIP", "args": [ { "prim": "CDR", "annots": [${annot[1]}] } ] }, { "line": "${findLine(d)}" } ]`;
        }
        else {
            return "";
        }
    }
    if (word === "UNPAPAIR") {
        if (annot == null) {
            // return `[ [ { "prim": "DUP" },
            //                { "prim": "CAR" },
            //                { "prim": "DIP", "args": [ [ { "prim": "CDR" } ] ] } ],
            //                {"prim":"DIP","args":[[[{"prim":"DUP"},{"prim":"CAR"},{"prim":"DIP","args":[[{"prim":"CDR"}]]}]]]}]`;
            return `[ { "prim": "DUP" }, { "prim": "CAR" }, { "prim": "DIP", "args": [ { "prim": "CDR" } ] }, { "prim": "DIP", "args": [ { "prim": "DUP" }, { "prim": "CAR" }, { "prim": "DIP", "args": [ { "prim": "CDR" } ] } ] }, { "line": "${findLine(d)}" } ]`;
        }
        else {
            // return `[ [ { "prim": "DUP" },
            //                { "prim": "CAR" },
            //                { "prim": "DIP", "args": [ [ { "prim": "CDR" } ] ] } ],
            //                {"prim":"DIP","args":[[[{"prim":"DUP"},{"prim":"CAR"},{"prim":"DIP","args":[[{"prim":"CDR"}]],"annots": [${annot}]}]]]}]`;
            return `[ { "prim": "DUP" }, { "prim": "CAR" }, { "prim": "DIP", "args": [ { "prim": "CDR" } ] }, { "prim": "DIP", "args": [ { "prim": "DUP" }, { "prim": "CAR" }, { "prim": "DIP", "args": [ { "prim": "CDR" } ], "annots": [ ${annot} ] } ] }, { "line": "${findLine(d)}" } ]`;
        }
    }
};
const checkSetCadr = s => macroSETCADRconst.test(s);
const expandSetCadr = (word, annot, d) => nestSetCadr(word.slice(5, -1), d);
const nestSetCadr = (r, d) => {
    if (r.length === 0) {
        return "";
    }
    const c = r.charAt(0);
    if (r.length === 1) {
        if (c === "A") {
            return `[ { "prim": "CDR", "annots": [ "@%%" ] }, { "prim": "SWAP" }, { "prim": "PAIR", "annots": [ "%", "%@" ] }, { "line": "${findLine(d)}" } ]`;
        }
        else if (c === "D") {
            return `[ { "prim": "CAR", "annots": [ "@%%" ] }, { "prim": "PAIR", "annots": [ "%@", "%" ] }, { "line": "${findLine(d)}" } ]`;
        }
    }
    if (c === "A") {
        return `[ { "prim": "DUP" }, { "prim": "DIP", "args": [ [ { "prim": "CAR", "annots": [ "@%%" ] }, ${nestSetCadr(r.slice(1), d)} ] ] }, { "prim": "CDR", "annots": [ "@%%" ] }, { "prim": "SWAP" }, { "prim": "PAIR", "annots": [ "%@", "%@" ] }, { "line": "${findLine(d)}" } ]`;
    }
    else if (c === "D") {
        return `[ { "prim": "DUP" }, { "prim": "DIP", "args": [ [ { "prim": "CDR", "annots": [ "@%%" ] }, ${nestSetCadr(r.slice(1), d)} ] ] }, { "prim": "CAR", "annots": [ "@%%" ] }, { "prim": "PAIR", "annots": [ "%@", "%@" ] }, { "line": "${findLine(d)}" } ]`;
    }
};
const checkKeyword = word => {
    if (check_assert(word)) {
        return true;
    }
    if (check_compare(word)) {
        return true;
    }
    if (check_dip(word)) {
        return true;
    }
    if (check_dup(word)) {
        return true;
    }
    if (check_fail(word)) {
        return true;
    }
    if (check_if(word)) {
        return true;
    }
    if (checkC_R(word)) {
        return true;
    }
    if (check_other(word)) {
        return true;
    }
    if (checkSetCadr(word)) {
        return true;
    }
};
const expandKeyword = (word, annot, d) => {
    if (checkC_R(word)) {
        return expandC_R(word, annot, d);
    }
    if (check_assert(word)) {
        return expand_assert(word, annot, d);
    }
    if (check_compare(word)) {
        return expand_cmp(word, annot, d);
    }
    if (check_dip(word)) {
        return expandDIP(word, null, annot, d);
    }
    if (check_dup(word)) {
        return expand_dup(word, annot, d);
    }
    if (check_fail(word)) {
        return expand_fail(word, annot, d);
    }
    if (check_if(word)) {
        return expandIF(word, "", "", annot, d);
    }
    if (check_other(word)) {
        return expand_other(word, annot, d);
    }
    if (checkSetCadr(word)) {
        return expandSetCadr(word, annot, d);
    }
};
/**
 * Given a int, convert it to JSON.
 * Example: "3" -> { "int": "3" }
 */
const intToJson = d => `{ "int": "${parseInt(d[0])}", "line": "${findLine(d)}" }`;
/**
 * Given a string, convert it to JSON.
 * Example: "string" -> "{ "string": "blah" }"
 */
const stringToJson = d => `{ "string": ${d[0]}, "line": "${findLine(d)}" }`;
/**
 * Given a keyword, convert it to JSON.
 * Example: "int" -> "{ "prim" : "int" }"
 */
const keywordToJson = d => {
    const word = d[0].toString();
    if (d.length === 1) {
        if (checkKeyword(word)) {
            return [expandKeyword(word, null, d)];
        }
        else {
            return `{ "prim": "${d[0]}", "line": "${findLine(d)}" }`;
        }
    } else {
        if (d[1].length > 0) {
            const annot = d[1].map(x => `"${x[1]}"`);
            if (checkKeyword(word)) {
                return [expandKeyword(word, annot, d)];
            }
            else {
                return `{ "prim": "${d[0]}", "annots": [ ${annot} ], "line": "${findLine(d)}" }`;
            }
        } else {
            if (checkKeyword(word)) {
                return [expandKeyword(word, null, d)];
            }
            else {
                return `{ "prim": "${d[0]}", "line": "${findLine(d)}" }`;
            }
        }
    }
};
/**
 * Given a keyword with one argument, convert it to JSON.
 * Example: "option int" -> "{ prim: option, args: [int] }"
 */
const singleArgKeywordToJson = d => {
    if (d.length > 3) {
        if (d[1].length > 0) {
            const annot = d[1].map(x => `"${x[1]}"`);
            return `{ "prim": "${d[0]}", "args": [ ${d[3]} ], "annots": [ ${annot} ], "line": "${findLine(d)}" }`;
        } else {
            return `{ "prim": "${d[0]}", "args": [ ${d[3]} ], "line": "${findLine(d)}" }`;
        }
    } else {
        return `{ "prim": "${d[0]}", "args": [ ${d[2]} ], "line": "${findLine(d)}" }`;
    }
};
const comparableTypeToJson = d => {
    const annot = d[3].map(x => `"${x[1]}"`);
    return `{ "prim": "${d[2]}", "annots": [${annot}], "line": "${findLine(d)}" }`;
};
const singleArgTypeKeywordWithParenToJson = d => {
    const annot = d[3].map(x => `"${x[1]}"`);
    return `{ "prim": "${d[2]}", "args": [ ${d[5]} ], "annots": [${annot}], "line": "${findLine(d)}" }`;
};
const singleArgInstrKeywordToJson = d => {
    const word = `${d[0].toString()}`;
    if (d[1].length > 0) {
        const annot = d[1].map(x => `"${x[1]}"`);
        if (check_dip(word)) {
            return expandDIP(word, d[3], annot, d);
        } else {
            return `{ "prim": "${d[0]}", "args": [ ${d[3]} ], "annots": [ ${annot} ], "line": "${findLine(d)}" }`;
        }
    } else {
        if (check_dip(word)) {
            return expandDIP(word, d[3], null, d);
        } else {
            return `{ "prim": "${d[0]}", "args": [ ${d[3]} ], "line": "${findLine(d)}" }`;
        }
    }
};
const singleArgTypeKeywordToJson = d => {
    const word = `${d[0].toString()}`;
    const annot = d[1].map(x => `"${x[1]}"`);
    if (check_dip(word)) {
        return expandDIP(word, d[2], annot, d);
    }
    else {
        return `{ "prim": "${d[0]}", "args": [ ${d[3]} ], "annots": [ ${annot} ], "line": "${findLine(d)}" }`;
    }
};
/**
 * Given a keyword with one argument and parentheses, convert it to JSON.
 * Example: "(option int)" -> "{ prim: option, args: [{prim: int}] }"
 * Also: (option (mutez))
 */
const singleArgKeywordWithParenToJson = d => `{ "prim": "${d[2]}", "args": [ ${d[4][d[4].length === 1 ? 0 : 2]} ], "line": "${findLine(d)}" }`;

/**
 * Given a keyword with two arguments, convert it into JSON.
 * Example: "Pair unit instruction" -> "{ prim: Pair, args: [{prim: unit}, {prim: instruction}] }"
 */
const doubleArgKeywordToJson = d => {
    if (d.length > 5) {
        if (d[1].length > 0) {
            const annot = d[1].map(x => `"${x[1]}"`);
            return `{ "prim": "${d[0]}", "args": [ ${d[3]}, ${d[5]} ], "annots": [ ${annot} ], "line": "${findLine(d)}" }`;
        } else {
            return `{ "prim": "${d[0]}", "args": [ ${d[3]}, ${d[5]} ], "line": "${findLine(d)}" }`;
        }
    } else {
        return `{ "prim": "${d[0]}", "args": [ ${d[2]}, ${d[4]} ], "line": "${findLine(d)}" }`;
    }
};
const doubleArgTypeKeywordToJson = d => {
    const annot = d[1].map(x => `"${x[1]}"`);
    return `{ "prim": "${d[0]}", "args": [ ${d[4]}, ${d[6]} ], "annots": [ ${annot} ], "line": "${findLine(d)}" }`;
};
const doubleArgParenKeywordToJson = d => `{ "prim": "${d[0]}", "args": [ ${d[4]}, ${d[8]} ], "line": "${findLine(d)}" }`;
const doubleArgInstrKeywordToJson = d => {
    const word = `${d[0].toString()}`;
    if (d[1].length > 0) {
        const annot = d[1].map(x => `"${x[1]}"`);
        if (check_if(word)) {
            return expandIF(word, d[3], d[5], annot, d);
        }
        else {
            return `{ "prim": "${d[0]}", "args": [ [ ${d[3]} ], [ ${d[5]} ] ], "annots": [ ${annot} ], "line": "${findLine(d)}" }`;
        }
    } else {
        if (check_if(word)) {
            return expandIF(word, d[3], d[5], null, d);
        }
        else {
            return `{ "prim": "${d[0]}", "args": [ [ ${d[3]} ], [ ${d[5]} ] ], "line": "${findLine(d)}" }`;
        }
    }
};
/**
 * Given a keyword with two arguments and parentheses, convert it into JSON.
 * Example: "(Pair unit instruction)" -> "{ prim: Pair, args: [{prim: unit}, {prim: instruction}] }"
 */
const doubleArgKeywordWithParenToJson = d => `{ "prim": "${d[2]}", "args": [ ${d[4]}, ${d[6]} ], "line": "${findLine(d)}" }`;
/**
 * Given a keyword with three arguments, convert it into JSON.
 * Example: "LAMBDA key unit {DIP;}" -> "{ prim: LAMBDA, args: [{prim: key}, {prim: unit}, {prim: DIP}] }"
 */
const tripleArgKeyWordToJson = d => {
    if (d[1].length > 0) {
        const annot = d[1].map(x => `"${x[1]}"`);
        return `{ "prim": "${d[0]}", "args": [ ${d[3]}, ${d[5]}, [ ${d[7]} ] ], "annots": [ ${annot} ], "line": "${findLine(d)}" }`;
    } else {
        return `{ "prim": "${d[0]}", "args": [ ${d[3]}, ${d[5]}, [ ${d[7]} ] ], "line": "${findLine(d)}" }`;
    }
};
/**
 * Given a keyword with three arguments and parentheses, convert it into JSON.
 * Example: "(LAMBDA key unit {DIP;})" -> "{ prim: LAMBDA, args: [{prim: key}, {prim: unit}, {prim: DIP}] }"
 */
const tripleArgKeyWordWithParenToJson = d => `{ "prim": "${d[0]}", "args": [ ${d[2]}, ${d[4]}, ${d[6]} ], "line": "${findLine(d)}" }`;
const nestedArrayChecker = x => {
    if (Array.isArray(x) && Array.isArray(x[0])) { // handles double array nesting
        return x[0];
    }
    else {
        return x;
    }
};
/**
 * Given a list of michelson instructions, convert it into JSON.
 * Example: "{CAR; NIL operation; PAIR;}" ->
 * [ '{ prim: CAR }',
 * '{ prim: NIL, args: [{ prim: operation }] }',
 * '{ prim: PAIR }' ]
 */
const instructionSetToJsonNoSemi = d => { return d[2].map(x => x[0]).concat(d[3]).map(x => nestedArrayChecker(x)); };
const instructionSetToJsonSemi = d => { return d[2].map(x => x[0]).map(x => nestedArrayChecker(x)); };
/**
 * parameter, storage, code
 */
//const scriptToJson = d => `[ ${d[0]}, ${d[2]}, { "prim": "code", "args": [ [ ${d[4]} ] ] } ]`;
const scriptToJson = d => `[ ${d[1]}, ${d[3]}, { "prim": "code", "args": [ ${d[5]} ] } ]`;

const doubleArgTypeKeywordWithParenToJson = d => {
    const annot = d[3].map(x => `"${x[1]}"`);
    return `{ "prim": "${d[2]}", "args": [ ${d[5]}, ${d[7]} ], "annots": [ ${annot} ], "line": "${findLine(d)}" }`;
};
const pushToJson = d => {
    return `{ "prim": "${d[0]}", "args": [ ${d[2]}, [] ], "line": "${findLine(d)}" }`;
};

const dipnToJson = d => (d.length > 4) ? `{ "prim": "${d[0][0]}", "args": [ { "int": "${d[2]}" }, [ ${d[4]} ] ], "line": "${findLine(d)}" }` : `{ "prim": "${d[0][0]}", "args": [ ${d[2]} ], "line": "${findLine(d)}" }`;
const dignToJson = d => `{ "prim": "${d[0][0]}", "args": [ { "int": "${d[2]}" } ], "line": "${findLine(d)}" }`;
const dropnToJson = d => `{ "prim": "${d[0]}", "args": [ { "int": "${d[2]}" } ], "line": "${findLine(d)}" }`;
// const subContractToJson = d => `{ "prim":"CREATE_CONTRACT", "args": [ [ ${d[4]}, ${d[6]}, {"prim": "code" , "args":[ [ ${d[8]} ] ] } ] ] }`;
const subContractToJson = d => `{ "prim":"CREATE_CONTRACT", "args": [ [ ${d[4]}, ${d[6]}, {"prim": "code" , "args":[ ${d[8]} ] } ] ], "line": "${findLine(d)}" }`;
const instructionListToJson = d => {
    const instructionOne = [d[2]];
    const instructionList = d[3].map(x => x[3]);
    return instructionOne.concat(instructionList).map(x => nestedArrayChecker(x));
};

const isIterable = obj => {
    // checks for null and undefined
    if (obj == null) {
        return false;
    }
    return typeof obj[Symbol.iterator] === "function";
};

const findLine = d => {
    if (!isIterable(d)) {
        return "-1";
    }
    const lineNums = new Set();
    for (const i of d) {
        if (i != null && i.hasOwnProperty("line") && !isNaN(parseInt(i.line))) {
            lineNums.add(i.line);
        }
    }
    if (lineNums.size > 1) {
        var output = "[ ";
        for (const i of lineNums) {
            output = output.concat(i).concat(", ");
        }
        output = output.substring(0, output.length - 2).concat(" ]");
        return output;
    } else if (lineNums.size === 1) {
        return lineNums.values().next().value;
    } else {
        return "-1";
    }
};
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "main", "symbols": ["_", "parameter", "_", "storage", "_", "code", "_"], "postprocess": scriptToJson},
    {"name": "parameter$ebnf$1", "symbols": []},
    {"name": "parameter$ebnf$1$subexpression$1", "symbols": ["__", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "parameter$ebnf$1", "symbols": ["parameter$ebnf$1", "parameter$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "parameter", "symbols": [(lexer.has("parameter") ? {type: "parameter"} : parameter), "parameter$ebnf$1", "__", "type", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon)], "postprocess": singleArgKeywordToJson},
    {"name": "storage$ebnf$1", "symbols": []},
    {"name": "storage$ebnf$1$subexpression$1", "symbols": ["__", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "storage$ebnf$1", "symbols": ["storage$ebnf$1", "storage$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "storage", "symbols": [(lexer.has("storage") ? {type: "storage"} : storage), "storage$ebnf$1", "__", "type", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon)], "postprocess": singleArgKeywordToJson},
    {"name": "code", "symbols": [(lexer.has("code") ? {type: "code"} : code), "_", "subInstruction", "_", "semicolons"], "postprocess": function (d) { return d[2]; }},
    {"name": "code", "symbols": [(lexer.has("code") ? {type: "code"} : code), "_", (lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace), "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon)], "postprocess": function (d) { return "code {}"; }},
    {"name": "type$ebnf$1", "symbols": []},
    {"name": "type$ebnf$1$subexpression$1", "symbols": ["__", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$1", "symbols": ["type$ebnf$1", "type$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "type", "symbols": [(lexer.has("comparableType") ? {type: "comparableType"} : comparableType), "type$ebnf$1"], "postprocess": keywordToJson},
    {"name": "type$ebnf$2", "symbols": []},
    {"name": "type$ebnf$2$subexpression$1", "symbols": ["__", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$2", "symbols": ["type$ebnf$2", "type$ebnf$2$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "type", "symbols": [(lexer.has("constantType") ? {type: "constantType"} : constantType), "type$ebnf$2"], "postprocess": keywordToJson},
    {"name": "type", "symbols": [(lexer.has("singleArgType") ? {type: "singleArgType"} : singleArgType), "__", "type"], "postprocess": singleArgKeywordToJson},
    {"name": "type$subexpression$1", "symbols": ["type"]},
    {"name": "type$subexpression$1", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "type", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)]},
    {"name": "type", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("singleArgType") ? {type: "singleArgType"} : singleArgType), "__", "type$subexpression$1", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": singleArgKeywordWithParenToJson},
    {"name": "type", "symbols": [(lexer.has("doubleArgType") ? {type: "doubleArgType"} : doubleArgType), "__", "type", "__", "type"], "postprocess": doubleArgKeywordToJson},
    {"name": "type", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("doubleArgType") ? {type: "doubleArgType"} : doubleArgType), "__", "type", "__", "type", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": doubleArgKeywordWithParenToJson},
    {"name": "type$ebnf$3$subexpression$1", "symbols": ["__", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$3", "symbols": ["type$ebnf$3$subexpression$1"]},
    {"name": "type$ebnf$3$subexpression$2", "symbols": ["__", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$3", "symbols": ["type$ebnf$3", "type$ebnf$3$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "type", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("comparableType") ? {type: "comparableType"} : comparableType), "type$ebnf$3", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": comparableTypeToJson},
    {"name": "type$ebnf$4$subexpression$1", "symbols": ["__", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$4", "symbols": ["type$ebnf$4$subexpression$1"]},
    {"name": "type$ebnf$4$subexpression$2", "symbols": ["__", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$4", "symbols": ["type$ebnf$4", "type$ebnf$4$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "type", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("constantType") ? {type: "constantType"} : constantType), "type$ebnf$4", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": comparableTypeToJson},
    {"name": "type$ebnf$5$subexpression$1", "symbols": ["__", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$5", "symbols": ["type$ebnf$5$subexpression$1"]},
    {"name": "type$ebnf$5$subexpression$2", "symbols": ["__", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$5", "symbols": ["type$ebnf$5", "type$ebnf$5$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "type", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("singleArgType") ? {type: "singleArgType"} : singleArgType), "type$ebnf$5", "__", "type", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": singleArgTypeKeywordWithParenToJson},
    {"name": "type$ebnf$6$subexpression$1", "symbols": ["__", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$6", "symbols": ["type$ebnf$6$subexpression$1"]},
    {"name": "type$ebnf$6$subexpression$2", "symbols": ["__", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "type$ebnf$6", "symbols": ["type$ebnf$6", "type$ebnf$6$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "type", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("doubleArgType") ? {type: "doubleArgType"} : doubleArgType), "type$ebnf$6", "__", "type", "__", "type", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": doubleArgTypeKeywordWithParenToJson},
    {"name": "subInstruction", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": function(d) { return ""; }},
    {"name": "subInstruction", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", "instruction", "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": function(d) { return d[2]; }},
    {"name": "subInstruction$ebnf$1$subexpression$1", "symbols": ["instruction", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon), "_"]},
    {"name": "subInstruction$ebnf$1", "symbols": ["subInstruction$ebnf$1$subexpression$1"]},
    {"name": "subInstruction$ebnf$1$subexpression$2", "symbols": ["instruction", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon), "_"]},
    {"name": "subInstruction$ebnf$1", "symbols": ["subInstruction$ebnf$1", "subInstruction$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "subInstruction", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", "subInstruction$ebnf$1", "instruction", "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": instructionSetToJsonNoSemi},
    {"name": "subInstruction$ebnf$2$subexpression$1", "symbols": ["instruction", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon), "_"]},
    {"name": "subInstruction$ebnf$2", "symbols": ["subInstruction$ebnf$2$subexpression$1"]},
    {"name": "subInstruction$ebnf$2$subexpression$2", "symbols": ["instruction", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon), "_"]},
    {"name": "subInstruction$ebnf$2", "symbols": ["subInstruction$ebnf$2", "subInstruction$ebnf$2$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "subInstruction", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", "subInstruction$ebnf$2", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": instructionSetToJsonSemi},
    {"name": "instruction$ebnf$1", "symbols": []},
    {"name": "instruction$ebnf$1$subexpression$1", "symbols": ["__", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$1", "symbols": ["instruction$ebnf$1", "instruction$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "instruction", "symbols": ["instructions", "instruction$ebnf$1"], "postprocess": keywordToJson},
    {"name": "instruction$ebnf$2", "symbols": []},
    {"name": "instruction$ebnf$2$subexpression$1", "symbols": ["__", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$2", "symbols": ["instruction$ebnf$2", "instruction$ebnf$2$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "instruction", "symbols": ["instructions", "instruction$ebnf$2", "_", "subInstruction"], "postprocess": singleArgInstrKeywordToJson},
    {"name": "instruction$ebnf$3", "symbols": []},
    {"name": "instruction$ebnf$3$subexpression$1", "symbols": ["__", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$3", "symbols": ["instruction$ebnf$3", "instruction$ebnf$3$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "instruction", "symbols": ["instructions", "instruction$ebnf$3", "__", "type"], "postprocess": singleArgKeywordToJson},
    {"name": "instruction$ebnf$4", "symbols": []},
    {"name": "instruction$ebnf$4$subexpression$1", "symbols": ["__", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$4", "symbols": ["instruction$ebnf$4", "instruction$ebnf$4$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "instruction", "symbols": ["instructions", "instruction$ebnf$4", "__", "data"], "postprocess": singleArgKeywordToJson},
    {"name": "instruction$ebnf$5", "symbols": []},
    {"name": "instruction$ebnf$5$subexpression$1", "symbols": ["__", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$5", "symbols": ["instruction$ebnf$5", "instruction$ebnf$5$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "instruction", "symbols": ["instructions", "instruction$ebnf$5", "__", "type", "__", "type", "_", "subInstruction"], "postprocess": tripleArgKeyWordToJson},
    {"name": "instruction$ebnf$6", "symbols": []},
    {"name": "instruction$ebnf$6$subexpression$1", "symbols": ["__", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$6", "symbols": ["instruction$ebnf$6", "instruction$ebnf$6$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "instruction", "symbols": ["instructions", "instruction$ebnf$6", "_", "subInstruction", "_", "subInstruction"], "postprocess": doubleArgInstrKeywordToJson},
    {"name": "instruction$ebnf$7", "symbols": []},
    {"name": "instruction$ebnf$7$subexpression$1", "symbols": ["__", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$7", "symbols": ["instruction$ebnf$7", "instruction$ebnf$7$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "instruction", "symbols": ["instructions", "instruction$ebnf$7", "__", "type", "__", "type"], "postprocess": doubleArgKeywordToJson},
    {"name": "instruction$ebnf$8", "symbols": []},
    {"name": "instruction$ebnf$8$subexpression$1", "symbols": ["__", (lexer.has("annot") ? {type: "annot"} : annot)]},
    {"name": "instruction$ebnf$8", "symbols": ["instruction$ebnf$8", "instruction$ebnf$8$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "instruction", "symbols": [{"literal":"PUSH"}, "instruction$ebnf$8", "__", "type", "__", "data"], "postprocess": doubleArgKeywordToJson},
    {"name": "instruction", "symbols": [{"literal":"PUSH"}, "__", "type", "_", (lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": pushToJson},
    {"name": "instruction$subexpression$1", "symbols": [{"literal":"DIP"}]},
    {"name": "instruction$subexpression$1", "symbols": [{"literal":"DUP"}]},
    {"name": "instruction", "symbols": ["instruction$subexpression$1", "__", (lexer.has("number") ? {type: "number"} : number), "_", "subInstruction"], "postprocess": dipnToJson},
    {"name": "instruction$subexpression$2", "symbols": [{"literal":"DIG"}]},
    {"name": "instruction$subexpression$2", "symbols": [{"literal":"DUG"}]},
    {"name": "instruction", "symbols": ["instruction$subexpression$2", "__", (lexer.has("number") ? {type: "number"} : number)], "postprocess": dignToJson},
    {"name": "instruction", "symbols": [{"literal":"DROP"}, "__", (lexer.has("number") ? {type: "number"} : number)], "postprocess": dropnToJson},
    {"name": "instruction", "symbols": [{"literal":"DROP"}], "postprocess": keywordToJson},
    {"name": "instruction", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": function(d) { return ""; }},
    {"name": "instruction", "symbols": [{"literal":"CREATE_CONTRACT"}, "__", (lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", "parameter", "_", "storage", "_", "code", "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": subContractToJson},
    {"name": "instruction", "symbols": [{"literal":"EMPTY_MAP"}, "__", "type", "__", "type"], "postprocess": doubleArgKeywordToJson},
    {"name": "instruction", "symbols": [{"literal":"EMPTY_MAP"}, "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "type", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen), "_", "type"], "postprocess": doubleArgParenKeywordToJson},
    {"name": "instructions", "symbols": [(lexer.has("baseInstruction") ? {type: "baseInstruction"} : baseInstruction)], "postprocess": id},
    {"name": "instructions", "symbols": [(lexer.has("macroCADR") ? {type: "macroCADR"} : macroCADR)], "postprocess": id},
    {"name": "instructions", "symbols": [(lexer.has("macroDIP") ? {type: "macroDIP"} : macroDIP)], "postprocess": id},
    {"name": "instructions", "symbols": [(lexer.has("macroDUP") ? {type: "macroDUP"} : macroDUP)], "postprocess": id},
    {"name": "instructions", "symbols": [(lexer.has("macroSETCADR") ? {type: "macroSETCADR"} : macroSETCADR)], "postprocess": id},
    {"name": "instructions", "symbols": [(lexer.has("macroASSERTlist") ? {type: "macroASSERTlist"} : macroASSERTlist)], "postprocess": id},
    {"name": "data", "symbols": [(lexer.has("constantData") ? {type: "constantData"} : constantData)], "postprocess": keywordToJson},
    {"name": "data", "symbols": [(lexer.has("singleArgData") ? {type: "singleArgData"} : singleArgData), "__", "data"], "postprocess": singleArgKeywordToJson},
    {"name": "data$subexpression$1", "symbols": ["data"]},
    {"name": "data", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("singleArgData") ? {type: "singleArgData"} : singleArgData), "__", "data$subexpression$1", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": singleArgKeywordWithParenToJson},
    {"name": "data", "symbols": [(lexer.has("doubleArgData") ? {type: "doubleArgData"} : doubleArgData), "__", "data", "__", "data"], "postprocess": doubleArgKeywordToJson},
    {"name": "data", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("doubleArgData") ? {type: "doubleArgData"} : doubleArgData), "__", "data", "__", "data", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": doubleArgKeywordWithParenToJson},
    {"name": "data", "symbols": ["subData"], "postprocess": id},
    {"name": "data", "symbols": ["subElt"], "postprocess": id},
    {"name": "data", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": intToJson},
    {"name": "data", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": stringToJson},
    {"name": "subData", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": function(d) { return "[]"; }},
    {"name": "subData$ebnf$1$subexpression$1", "symbols": ["data", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon), "_"]},
    {"name": "subData$ebnf$1", "symbols": ["subData$ebnf$1$subexpression$1"]},
    {"name": "subData$ebnf$1$subexpression$2", "symbols": ["data", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon), "_"]},
    {"name": "subData$ebnf$1", "symbols": ["subData$ebnf$1", "subData$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "subData", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", "subData$ebnf$1", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": instructionSetToJsonSemi},
    {"name": "subData$ebnf$2$subexpression$1", "symbols": ["data", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon), "_"]},
    {"name": "subData$ebnf$2", "symbols": ["subData$ebnf$2$subexpression$1"]},
    {"name": "subData$ebnf$2$subexpression$2", "symbols": ["data", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon), "_"]},
    {"name": "subData$ebnf$2", "symbols": ["subData$ebnf$2", "subData$ebnf$2$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "subData", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "subData$ebnf$2", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": instructionSetToJsonSemi},
    {"name": "subElt", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": function(d) { return "[]"; }},
    {"name": "subElt$ebnf$1$subexpression$1", "symbols": ["elt", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon), "_"]},
    {"name": "subElt$ebnf$1", "symbols": ["subElt$ebnf$1$subexpression$1"]},
    {"name": "subElt$ebnf$1$subexpression$2", "symbols": ["elt", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon), "_"]},
    {"name": "subElt$ebnf$1", "symbols": ["subElt$ebnf$1", "subElt$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "subElt", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", "subElt$ebnf$1", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": instructionSetToJsonSemi},
    {"name": "subElt$ebnf$2$subexpression$1", "symbols": ["elt", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon), "_"]},
    {"name": "subElt$ebnf$2", "symbols": ["subElt$ebnf$2$subexpression$1"]},
    {"name": "subElt$ebnf$2$subexpression$2", "symbols": ["elt", "_", (lexer.has("semicolon") ? {type: "semicolon"} : semicolon), "_"]},
    {"name": "subElt$ebnf$2", "symbols": ["subElt$ebnf$2", "subElt$ebnf$2$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "subElt", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "subElt$ebnf$2", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": instructionSetToJsonSemi},
    {"name": "elt", "symbols": [(lexer.has("elt") ? {type: "elt"} : elt), "_", "data", "_", "data"], "postprocess": doubleArgKeywordToJson},
    {"name": "semicolons$ebnf$1", "symbols": [(lexer.has("semicolon") ? {type: "semicolon"} : semicolon)], "postprocess": id},
    {"name": "semicolons$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "semicolons", "symbols": ["semicolons$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "_$subexpression$1$ebnf$1", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": id},
    {"name": "_$subexpression$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "_$subexpression$1", "symbols": ["_$subexpression$1$ebnf$1"]},
    {"name": "_", "symbols": ["_$subexpression$1"], "postprocess": function(d) {return null;}},
    {"name": "_$subexpression$2$ebnf$1", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": id},
    {"name": "_$subexpression$2$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "_$subexpression$2", "symbols": ["_$subexpression$2$ebnf$1", (lexer.has("comment") ? {type: "comment"} : comment), "_"]},
    {"name": "_", "symbols": ["_$subexpression$2"], "postprocess": function(d) {return null;}},
    {"name": "__$subexpression$1", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)]},
    {"name": "__", "symbols": ["__$subexpression$1"], "postprocess": function(d) {return null;}},
    {"name": "__$subexpression$2", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws), (lexer.has("comment") ? {type: "comment"} : comment), "__"]},
    {"name": "__", "symbols": ["__$subexpression$2"], "postprocess": function(d) {return null;}}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
