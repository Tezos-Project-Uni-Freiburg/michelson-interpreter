# michelson-interpreter

`michelson-interpreter` is a step-by-step interpreter for the stack based language [Michelson](https://tezos.gitlab.io/active/michelson.html). Michelson is used for smart contracts in [Tezos](https://tezos.com).

This tool was written for explaining Michelson scripts: it considers each instruction as a _step_ and documents the following:

* instruction (_obviously_) with its original line number in the file,
* elements added to and removed from the stack,
* full dump of the stack after the execution of the instruction is finished.

## Requirements

* Node.js (development was done with v18, however it might work with earlier versions too)

## Installation

### npm

```
npm i michelson-interpreter
```

Afterwards, you can use `michelson-interpreter` as a command from your terminal.

## Usage

`michelson-interpreter` takes some required and some optional parameters and prints out the result to stdout. Overview of the parameters where **bold** ones are **required**:

* **`-f`**, **`--file`**: Path of the file to interpret
* **`-p`**, **`--parameter`**: Parameter value for the script
* **`-s`**, **`--storage`**: Storage value for the script             
* `--account`: Account as a string
* `--address`: Address as a string
* `--amount`: Amount as an int
* `--entrypoint`: Entrypoint as a string
* `--gas_limit`: Gas limit as an int
* `--id`: id as an int
* `--timestamp`: Timestamp as a string in RFC3339 notation or an int as an Unix time
* `--version`: Show version
* `--help`: Show this information

Required parameters are needed to be able to do the basic simulated interpretation. Optional parameters however define the state of the execution, which is normally gotten from the blockchain. Some scripts may need these definitions in order to present correct execution traces, but simple ones tend to not.

After a successful execution, a JSON array with all the steps is printed out, which then can be inspected in a tool like [fx](https://github.com/antonmedv/fx).

After an unsuccessful execution (due to reasons like getting a FAILWITH, programming error, etc.) five pieces of information is printed out:

* error/exception message,
* content of the error/exception, which is usually the instruction that raised the error/exception,
* state at the time of exception,
* stack at the time of exception,
* recorded steps up to and including the error/exception raising instruction.

This information comes in a user-readable form; if it should be outputted as a JSON object for programmatic use, you will be able to use a flag to indicate it hopefully sooner than later.

## Limitations

* Instruction set implemented to work with this interpreter are the ones up to and including protocol [Babylon](https://tzkt.io/governance/PsBabyM1eUXZseaJdmXFApDSBqj8YBfwELoxZHHW77EMcAbbwAS/constants).
* Some instructions have not been implemented (mostly due to being a blockchain operation instruction):
    * `APPLY`
    * `CHAIN_ID`
    * `CHECK_SIGNATURE`
    * `CREATE_CONTRACT`
    * `EXEC`
    * `ITER`
    * `LAMBDA`
    * `SET_DELEGATE`
    * `TRANSFER_TOKENS`
* For parameter and storage inputs, only some types can be parsed (more details below).

## Inputs

Michelson scripts take parameters when their execution is submitted, and they also use a storage which stays on the blockchain. As this is a simulated environment, both parameter and storage values need to be provided. Both values' types are defined in the script, and the actual inputs need to adhere to them for successful execution.

List of input types which have been implemented to successfully parse:

* `address`: `"..."` (within double-quotes)
* `big_map`: `{ Elt a b ; Elt c d }`
* `bool`: `True` or `False`
* `bytes`: `0x123...def`
* `int`: `-1`, `0`, `1`, ..., `n`
* `key`: `"..."` (within double-quotes)
* `key_hash`: `"..."` (within double-quotes)
* `list`: `{ a ; b }`
* `map`: `{ Elt a b ; Elt c d }`
* `mutez`: `0`, `1`, ..., `n`
* `nat`: `0`, `1`, ..., `n`
* `option`: `(Some a)` or `(None)`
* `or`: `(Left a)` or `(Right b)`
* `pair`: `(Pair a b)`
* `set`: `{ a ; b }`
* `signature`: `...` (without double-quotes)
* `string`: `"..."` (within double-quotes)
* `timestamp`: `0`, `1`, ..., `n` or `1970-01-01T00:00:00Z`
* `unit`: `Unit`

These types are possible to nest within others where applicable (`map`, `list`, `set`, etc.).


















