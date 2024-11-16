## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

## Chain Addresses

- **HarmoniaDynamicFee base sepolia**: `0x3e937625C7a4560442C4393af73dF92C98AC9080`
    - The transaction is not recorded due to an internal call.
- **HarmoniaDynamicFee scroll sepolia**: `0x3e937625C7a4560442C4393af73dF92C98AC9080`
    - The transaction is not recorded due to an internal call.
- **HarmoniaDynamicFee chiliz spicy**: `0x4888F2C0fEdAbdD7F1f10a58282C7CBD95AbF45B`
    - The transaction is not recorded due to an internal call.

- **WhitelistHook base sepolia**: `0xDA40BDFbb136e2bD5e236cCF44AcFA824a026783`
- **WhitelistHook scroll sepolia**: `0x45D79467679D7ff657ecdAF674662E754Ca2DE45`

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
