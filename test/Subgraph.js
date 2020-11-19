// const buidler = require('@nomiclabs/buidler');
// const { ethers, deployments } = buidler;

//   async function deployAndCreateERC721Controlled(){
//     console.log("Entered deployAndCreateERC721ControlledFactory")
//     //[wallet, wallet2] = await buidler.ethers.getSigners()
//     provider = buidler.ethers.provider
  
//     await deployments.all()

//      let factoryResult = await deployments.get('ERC721ControlledFactory')
//     // factory = await buidler.ethers.getContractAt('ERC721ControlledFactory', factoryResult.address, wallet)

//     // createERC721ControlledResult = ERC721ControlledFactoryContract.createERC721Controlled("top","TOP","www.topdog.com")

//     // now parse tx receipt for events and get address of newly created ERC721Controlled

//     // call computeAddress with params to get lootbox address


//   }
//   deployAndCreateERC721Controlled()


//   // const parseLogs = (contract, logs) => logs.reduce((events, log) => {
// //     try {
// //       events.push(contract.interface.parseLog(log))
// //     } catch (e) {}
// //     return events
// //   }, [])
  
// //   const parseTx = async (contract, tx) => {
// //     let receipt = await contract.provider.getTransactionReceipt((await tx).hash)
// //     return parseLogs(contract, receipt.logs)
// //   }