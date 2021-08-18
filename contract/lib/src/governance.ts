import Arweave from "arweave";
import { JWKInterface } from "arweave/node/lib/wallet";
import { SwcClient, SwClientFactory } from "smartweave/lib/v2";
import { fetch } from "cross-fetch";
import { GOVERNANCE_CONTRACT_ID } from "./constants";

type Keyfile = JWKInterface | "use_wallet";

interface GovernanceState {
  balances: Record<string, number>;
}

export class Governance {
  public inst: Arweave;
  public client: SwcClient;
  public wallet: Keyfile;
  public state?: GovernanceState;
  public readonly id = GOVERNANCE_CONTRACT_ID;

  constructor(arweave: Arweave, wallet: Keyfile) {
    this.inst = arweave;
    this.client = SwClientFactory.memCacheClient(arweave);
    this.wallet = wallet;
  }

  async getState(useCache: boolean = true): Promise<GovernanceState> {
    let res: GovernanceState;

    if (useCache) {
      const response = await fetch(
        `https://api.kyve.network/pool?id=${this.id}&type=meta`
      );
      if (response.ok) {
        res = await response.json();
      } else {
        throw new Error(
          `Couldn't read state for governance (${this.id}) from cache.`
        );
      }
    } else {
      res = (
        await this.client.readState(this.id, undefined, undefined, {
          ignoreExceptions: true,
        })
      ).state;
    }

    this.state = res;

    return res;
  }
}
