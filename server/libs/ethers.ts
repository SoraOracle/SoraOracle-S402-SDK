import { ethers } from "ethers";
import { getConfig, S402_FACILITATOR } from "../config/env";
import S402FacilitatorABI from "./abi/S402Facilitator.json";

let provider: ethers.JsonRpcProvider;
let facilitatorContract: ethers.Contract;

export function getProvider(): ethers.JsonRpcProvider {
  if (!provider) {
    const config = getConfig();
    provider = new ethers.JsonRpcProvider(config.BSC_RPC);
  }
  return provider;
}

export function getFacilitatorContract(): ethers.Contract {
  if (!facilitatorContract) {
    facilitatorContract = new ethers.Contract(
      S402_FACILITATOR,
      S402FacilitatorABI.abi,
      getProvider()
    );
  }
  return facilitatorContract;
}

export { ethers };
