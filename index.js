/*
* How to send Tron Tokens with Multisig
* Bruno da Silva 
*/ 
const TronWeb = require("tronweb")
const TronGrid = require("trongrid")

const PRIVATEKEY1 = '725a8b0247274382472727268' // MULTISIG XPRIV1
const PRIVATEKEY2 = '725a8b0247274382472727268' // MULTISIG XPRIV2

const tronWeb = new TronWeb({
    fullHost: 'https://api.trongrid.io',
    privateKey: PRIVATEKEY1
})

const CONTRACT = "TLMEQZ3ZToeAMabGYvYn9b3c8nNrqS"; // TOKEN CONTRACT
const ACCOUNT = "TDg86FfSKb1EKaP3Md1sZufy4zf"; // MAIN MULTISIG ACCOUNT
const TOADDRESS = "TFo9zDh9X6ztrZhwxiEgBR9Dp"; // DESTINY ADDRESS
const VALUE = 600000; // VALUE TO TRANSFER

async function main() {
    const {
        abi
    } = await tronWeb.trx.getContract(TronWeb.address.toHex(CONTRACT));

    const contract = tronWeb.contract(abi.entrys, CONTRACT);

    const balance = await contract.methods.balanceOf(ACCOUNT).call();
    console.log("balance:", balance.toString());

    // Build Transaction TriggerSmartContract
    let {
        transaction,
        result
    } = await tronWeb.transactionBuilder.triggerSmartContract(
        CONTRACT, 'transfer(address,uint256)', {
            feeLimit: 1000000,
            callValue: 0
        },
        [{
            type: 'address',
            value: TronWeb.address.toHex(TOADDRESS)
        }, {
            type: 'uint256',
            value: VALUE
        }]
    );
    if (!result.result) {
        console.error("error tt:", result);
        return;
    }

    // Extend Expiration to Sign
    var signature = await tronWeb.transactionBuilder.extendExpiration(transaction, 84600);
    signature = await tronWeb.trx.multiSign(signature, PRIVATEKEY1, 2); //sign 1
    signature = await tronWeb.trx.multiSign(signature, PRIVATEKEY2, 2); // sign 2

    // Broadcast Transaction
    const broadcast = await tronWeb.trx.sendRawTransaction(signature);
    console.log("result:", broadcast);



}

main().then(() => {

})
.catch((err) => {
    console.log("Error: ", err);
});
