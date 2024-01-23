import { RouteResponse } from "@skip-router/core";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { randomId } from "@/utils/random";

export interface TxStatus {
  chainId: string;
  txHash: string;
  explorerLink: string;
  axelarscanLink?: string;
}

export interface TxHistoryItem {
  route: RouteResponse;
  txStatus: TxStatus[];
  timestamp: string;
  status: "pending" | "success" | "failed";
}

export type TxHistoryItemInput = Pick<TxHistoryItem, "route">;

export type TxHistoryState = Record<string, TxHistoryItem>;

const defaultValues: TxHistoryState = {};

export const useTxHistory = create(
  persist(() => defaultValues, {
    name: "TxHistoryState",
    version: 1,
  }),
);

export const txHistory = {
  add: (input: TxHistoryItemInput) => {
    const id = randomId();

    const newItem: TxHistoryItem = {
      txStatus: [],
      timestamp: new Date().toISOString(),
      status: "pending",
      ...input,
    };

    useTxHistory.setState({ [id]: newItem });

    return [id, newItem] as const;
  },
  success: (id: string) => {
    useTxHistory.setState((state) => {
      const current = state[id];
      if (!current) return state;

      const latest: TxHistoryItem = {
        ...current,
        status: "success",
      };

      return { [id]: latest };
    });
  },
  fail: (id: string) => {
    useTxHistory.setState((state) => {
      const current = state[id];
      if (!current) return state;

      const latest: TxHistoryItem = {
        ...current,
        status: "failed",
      };

      return { [id]: latest };
    });
  },
  remove: (id: string) => {
    useTxHistory.setState((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: _, ...newState } = state;
      return newState;
    }, true);
  },
  addStatus: (id: string, txStatus: TxStatus) => {
    useTxHistory.setState((state) => {
      const current = state[id];
      if (!current) return state;

      const newTxStatus = current.txStatus.concat(txStatus);

      const latest: TxHistoryItem = {
        ...current,
        txStatus: newTxStatus,
      };

      return { [id]: latest };
    });
  },
  updateStatus: (id: string, txStatus: TxStatus) => {
    useTxHistory.setState((state) => {
      const current = state[id];
      if (!current) return state;

      const newTxStatus = current.txStatus.map((item) => {
        if (item.txHash === txStatus.txHash) {
          return txStatus;
        }
        return item;
      });

      const latest: TxHistoryItem = {
        ...current,
        txStatus: newTxStatus,
      };

      return { [id]: latest };
    });
  },
  clear: () => {
    useTxHistory.setState({}, true);
  },
};
