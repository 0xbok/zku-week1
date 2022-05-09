const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16, plonk } = require("snarkjs");

function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o===null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

describe("HelloWorld", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing
        // generate a proof and the output result using from inputs and compiled circuit, and keys generated for groth16
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey");

        // print the first public output of the circuit evaluation, it should be equal to 1x2 = 3
        console.log('1x2 =',publicSignals[0]);

        // next we check if the verifier is able to verify the proof generated above
        // convert the data type of `publicSignals` to BigInt for Solidity compatiblity
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        // convert the data type of `proof` to BigInt for Solidity compatiblity
        const editedProof = unstringifyBigInts(proof);
        // create the calldata that are passed to the smart contract verifier function
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);

        // now deconstruct the calldata so that we can extract the arguments required for `verifyProof` function.
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());

        // extract arguments
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        // assert that the verifier is able to verify the proof
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2","c":"3"}, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3/circuit_final.zkey");

        // print the first public output of the circuit evaluation, it should be equal to 1x2 = 3
        console.log('1x2x3 =',publicSignals[0]);

        // next we check if the verifier is able to verify the proof generated above
        // convert the data type of `publicSignals` to BigInt for Solidity compatiblity
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        // convert the data type of `proof` json values to BigInt for Solidity compatiblity
        const editedProof = unstringifyBigInts(proof);
        // create the calldata that are passed to the smart contract verifier function
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);

        // now deconstruct the calldata so that we can extract the arguments required for `verifyProof` function.
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());

        // extract arguments
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        // assert that the verifier is able to verify the proof
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;

    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with PLONK", function () {

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3PlonkVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const { proof, publicSignals } = await plonk.fullProve({"a":"1","b":"2","c":"3"}, "contracts/circuits/Multiplier3_plonk/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3_plonk/circuit_final.zkey");

        // print the first public output of the circuit evaluation, it should be equal to 1x2 = 3
        console.log('1x2x3 =',publicSignals[0]);

        // next we check if the verifier is able to verify the proof generated above
        // convert the data type of `publicSignals` to BigInt for Solidity compatiblity
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        // convert the data type of `proof` to BigInt for Solidity compatiblity
        const editedProof = unstringifyBigInts(proof);
        // create the calldata that are passed to the smart contract verifier function
        const calldata = await plonk.exportSolidityCallData(editedProof, editedPublicSignals);

        // now deconstruct the calldata so that we can extract the arguments required for `verifyProof` function.
        const argv = calldata.replace(/["[\]\s]/g, "").split(',');
        // extract arguments
        const a = argv[0]
        const Input = argv.slice(1)

        // assert that the verifier is able to verify the proof
        expect(await verifier.verifyProof(a, Input)).to.be.true;

    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = 0x0;
        let b = [0];
        expect(await verifier.verifyProof(a, b)).to.be.false;
    });
});