# @hyperoracle/zkgraph-cli

## CLI

> Note: Only `full` image will be processed by zkOracle node. `local` (generated by commands ending with `--local` option) means the zkGraph is compiled locally and only contains partial computation (so that proving and executing will be faster).

The workflow of local zkGraph development must follow: `Develop` (code in /src) -> `Compile` (get compiled wasm image) -> `Execute` (get expected output) -> `Prove` (generate input and pre-test for actual proving in zkOracle) -> `Deploy` (deploy verification contract) -> `Verify` (verify proof on-chain).

To upload and publish your zkGraph, you should `Upload` (upload code to IPFS), and then `Publish` (register zkGraph on onchain zkGraph Registry).

### Compile

Compile for Full Image (Link Compiled with Compiler Server).

#### Usage

```bash
zkgraph compile [root]
```

#### Options

| Options   | Description             |
| --------- | ----------------------- |
| `--local` | Compile for Local Image |

### Execute

Execute Full Image.

Please save the `ZKGRAPH_STATE_OUTPUT` string for following prove steps.

#### Usage
```bash
zkgraph exec -- <block id> [root]
```


#### Arguments

| Options      | Description                                     |
| ------------ | ----------------------------------------------- |
| `<block id>` | Block number (or block hash) as runtime context |


#### Options

| Options   | Description         |
| --------- | ------------------- |
| `--local` | Execute Local Image |

### Set Up

Set Up Full Image

- `circuit-size`: Specify the circuit size of image instead of the default recommended. eg. `zkgraph setup -- --circuit-size <size> (eg. 22)`.

#### Usage
```bash
zkgraph setup
```

#### Options

| Options                     | Description                      |
| --------------------------- | -------------------------------- |
| `--local`                   | Set Up Local Image               |
| `-k, --circuit-size <size>` | Circuit size (k in 2^k) of image |

### Prove

Prove Full Image

#### Usage
```bash
zkgraph prove -- <block id> <expected state>
```

#### Arguments

| Options            | Description                                     |
| ------------------ | ----------------------------------------------- |
| `<block id>`       | Block number (or block hash) as runtime context |
| `<expected state>` | State output of the zkGraph execution           |


#### Options

| Options          | Description                  |
| ---------------- | ---------------------------- |
| `--local`        | Prove Local Image            |
| `-i, --inputgen` | Run in input generation Mode |
| `-t, --test`     | Run in test Mode             |
| `-p, --prove`    | Run in prove Mode            |

### Deploy

Deploy Verification Contract for Full Image.

Please save the `verifer_contract_address` from the output dialog for following publish steps.

- `network_name`: Specify the network name of deployed verification smart contract, instead of loading `dataDestinations.network` from `zkgraph.yaml`. eg. `zkgraph deploy -- --network-name <network (eg. goerli)>`.

#### Usage
```bash
zkgraph deploy -n [network_name (sepolia / goerli)]
```

#### Options

| Options                     | Description                                                                 |
| --------------------------- | --------------------------------------------------------------------------- |
| `--local`                   | Deploy Verification Contract for Local Image                                |
| `-n, --network-name <name>` | Name of deployed network for verification contract ( `sepolia` / `goerli` ) |

### Upload

Upload zkGraph (Code and Full Image).

Please save the `ipfs_hash` from the output dialog for following publish steps.

#### Usage
```bash
zkgraph upload
```

#### Options

| Options   | Description                                 |
| --------- | ------------------------------------------- |
| `--local` | Upload Local zkGraph (Code and Local Image) |


### Verify

Verify Proof Onchain.

#### Usage
```bash
zkgraph verify -- <prove_task_id>
```

#### Arguments

| Options           | Description           |
| ----------------- | --------------------- |
| `<prove_task_id>` | Task id of prove task |


### Publish

Publish and Register zkGraph Onchain.

See also: [Verifier Contract Interface](https://github.com/DelphinusLab/halo2aggregator-s/blob/main/sol/contracts/AggregatorVerifier.sol#L40).

#### Usage
```bash
zkgraph publish -- <deployed contract address> <ipfs_hash> <bounty_reward_per_trigger>
```

#### Arguments

| Options                       | Description                                                |
| ----------------------------- | ---------------------------------------------------------- |
| `<deployed contract address>` | Contract address of deployed verification contract address |
| `<ipfs hash>`                 | IPFS hash of uploaded zkGraph                              |
| `<bounty reward per trigger>` | Bounty reward per trigger in ETH                           |

## Config

### Configuring zkGraph

When running zkGraph from the command line, the tool will automatically attempt to locate a configuration file named zkgraph.config.js in the project’s root directory. It also supports other file extensions such as JS and TS.

The most basic config file looks like this:

```js
// zkgraph.config.js
export default {
  // config options
}
```

You can also explicitly specify a config file to use with the --config CLI option (resolved relative to cwd):

```bash
zkgraph --config my-config.js
```

### Config Intellisense

Since Vite ships with TypeScript typings, you can leverage your IDE's intellisense with jsdoc type hints:

```js
/** @type {import('@hyperoracle/zkgraph-cli').UserConfig} */
export default {
  // ...
}
```
Alternatively, you can use the defineConfig helper which should provide intellisense without the need for jsdoc annotations:

```js
import { defineConfig } from '@hyperoracle/zkgraph-cli'

export default defineConfig({
  // ...
})
```

ZkGraph also directly supports TS config files. You can use zkgraph.config.ts with the defineConfig helper as well.

### Config Options

#### JsonRpcProviderUrl

- **Type:** `object`
- **Default**: `{ mainet: "", sepolia: "", goerli: ""}`

Update your Etherum JSON RPC provider URL here.
It is recommended to use providers that support debug_getRawReceipts RPC method.  

#### UserPrivateKey

- **Type:** `string`

Update your private key here to sign zkwasm messages.
Please note that (during testnet phrase) your address balance (in zkwasm server) should > 0.


#### ZkwasmProviderUrl

- **Type:** `string`
- **Default**: `https://zkwasm-explorer.delphinuslab.com:8090`

#### CompilerServerEndpoint

- **Type:** `string`
- **Default**: `http://compiler.hyperoracle.io/compile`

#### PinataEndpoint

- **Type:** `string`
- **Default**: `https://api.pinata.cloud/pinning/pinFileToIPFS`

#### PinataJWT

- **Type:** `string`

#### WasmBinPath

- **Type:** `string`
- **Default**: `build/zkgraph_full.wasm`

#### LocalWasmBinPath

- **Type:** `string`
- **Default**: `build/zkgraph_local.wasm`