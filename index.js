const axios = require('axios');
const CryptoJS = require('crypto-js')

Axios = axios.create({
    baseURL: 'https://stormy-everglades-34766.herokuapp.com/',
    responseType: 'json',
    headers: {
      Accept:'application/json',
      "Content-Type": 'application/json',
    }
  })

class Miner {
    constructor(miningUrl) {
        this.miningUrl = miningUrl
    }

    async getMiningJob() {
        return (await Axios.get(`/mining/get-mining-job/9a9f082f37270ff54c5ca4204a0e4da6951fe917`)).data
    }

    async submitMinedBlock(mineData) {
        try {
            console.log(mineData)
            const result = (await Axios.post('/mining/submit-mined-block', mineData))
            console.log(result)
            console.log('Mine successful')
            return result
        } catch(e) {
            console.log('Failed to submit mined block')
            return null
        }
    }

    mineBlock(blockDataHash, networkDifficulty) {
        console.log('Hang on...Doing the proof of work...')

        let timestamp = new Date().getTime() / 1000
        let nonce = 0
        let hash = this.calculateHash(blockDataHash, timestamp, nonce)
        let consensus = Array(networkDifficulty + 1).join("0")
        
        while (hash.substring(0, networkDifficulty) != consensus) {
            nonce++
            timestamp = new Date().getTime() / 1000
            hash = this.calculateHash(blockDataHash, timestamp, nonce)
        }

        console.log('Proof of work solved! ', hash)
        return { blockDataHash, dateCreated: timestamp, nonce, blockHash: hash }
    }

    calculateHash(blockDataHash, dateCreated, nonce) {
        let data = `${blockDataHash}|${dateCreated}|${nonce}`
        return CryptoJS.SHA256(data).toString()
    }
}

async function mine() {
    const miningUrl = 'https://stormy-everglades-34766.herokuapp.com'
    const miner = new Miner(miningUrl)
    const miningJob = await miner.getMiningJob()
    const mineResult = miner.mineBlock(miningJob.blockDataHash, miningJob.difficulty)
    const result = await miner.submitMinedBlock(mineResult)
    return result
}

async function runMiner() {
    let result = await mine()
    runMiner()
}

runMiner()