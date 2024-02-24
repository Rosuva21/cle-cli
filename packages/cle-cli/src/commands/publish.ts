import fs from 'node:fs'
import { ethers } from 'ethers'
import to from 'await-to-js'
import * as cleApi from '@ora-io/cle-api'
import { logger } from '../logger'
import { loadYamlFromPath, logDivider, logLoadingAnimation } from '../utils'
import type { UserConfig } from '../config'

export interface PublishOptions {
  ipfsHash: string
  bountyRewardPerTrigger: number
  yamlPath: string
  wasmPath: string
  jsonRpcProviderUrl: UserConfig['JsonRpcProviderUrl']
  userPrivateKey: string
  zkWasmProviderUrl: string
}

export async function publish(options: PublishOptions) {
  const { ipfsHash, jsonRpcProviderUrl, userPrivateKey, bountyRewardPerTrigger = 0.05, yamlPath, wasmPath, zkWasmProviderUrl } = options
  logger.info('>> PUBLISH CLE')
  if (isNaN(bountyRewardPerTrigger)) {
    logger.warn('[-] BOUNTY REWARD IS NOT A VALID NUMBER.')
    logDivider()
  }
  const newBountyRewardPerTrigger = Number(bountyRewardPerTrigger) || 0.05

  const cleYaml = loadYamlFromPath(yamlPath)
  if (!cleYaml) {
    logger.error('[-] ERROR: Failed to get yaml')
    return
  }

  const networkName = cleYaml.decidePublishNetwork()
  if (!networkName) {
    logger.error('[-] ERROR: Failed to get network')
    return
  }
  const JsonRpcProviderUrl = (jsonRpcProviderUrl as any)?.[networkName as any]
  if (!JsonRpcProviderUrl) {
    logger.error('[-] ERROR: Failed to get JsonRpcProviderUrl')
    return
  }

  const provider = new ethers.providers.JsonRpcProvider(JsonRpcProviderUrl)
  const signer = new ethers.Wallet(userPrivateKey, provider)

  const wasm = fs.readFileSync(wasmPath)
  const wasmUint8Array = new Uint8Array(wasm)

  logger.info('[*] Please wait for publish tx... (estimated: 30 sec)')

  const loading = logLoadingAnimation()

  const [err, txReceipt] = await to(cleApi.publish(
    { wasmUint8Array, cleYaml },
    signer,
    {
      proverUrl: zkWasmProviderUrl,
      ipfsHash,
      bountyRewardPerTrigger: newBountyRewardPerTrigger,
    },
  ))
  if (err) {
    loading.stopAndClear()
    if (err instanceof cleApi.Error.GraphAlreadyExist) {
      logger.error(`[-] PUBLISH FAILED. ${err.message}`)
      return
    }
    else {
      throw err
    }
  }

  loading.stopAndClear()
  logger.info('[+] CLE PUBLISHED SUCCESSFULLY!')
  logger.info(
    `[*] Transaction confirmed in block ${txReceipt.blockNumber} on ${networkName}`,
  )
  logger.info(`[*] Transaction hash: ${txReceipt.transactionHash}`)
  logger.info(`[*] Graph address deployed at: ${txReceipt.graphAddress}`)

  if (txReceipt.transactionHash === '')
    logger.error('[-] PUBLISH FAILED.')

  else
    logger.info(`[*] PUBLISH TX HASH: ${txReceipt.transactionHash}`)

  return txReceipt.transactionHash
}
