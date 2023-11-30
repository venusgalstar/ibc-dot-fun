import { ChevronDownIcon, PencilSquareIcon } from "@heroicons/react/20/solid";
import * as Collapsible from "@radix-ui/react-collapsible";
import { RouteResponse } from "@skip-router/core";
import { clsx } from "clsx";
import { useMemo } from "react";

import { disclosure, useDisclosureKey } from "@/context/disclosures";
import { useSettingsStore } from "@/context/settings";

import { ConversionRate } from "../ConversionRate";
import { SimpleTooltip } from "../SimpleTooltip";
import { UsdValue } from "../UsdValue";
import { FormValues } from "./useSwapWidget";

type Props = FormValues & {
  amountOut: string;
  route: RouteResponse;
};

export const SwapDetails = ({
  amountIn,
  amountOut,
  sourceChain,
  sourceAsset,
  destinationChain,
  destinationAsset,
  route,
}: Props) => {
  const [open, control] = useDisclosureKey("swapDetailsCollapsible");

  const { slippage } = useSettingsStore();

  const axelarTransferOperation = useMemo(() => {
    for (const op of route.operations) {
      if ("axelarTransfer" in op) return op;
    }
    return null;
  }, [route]);

  const bridgingFee = useMemo(() => {
    if (!axelarTransferOperation) return 0;
    const { feeAmount } = axelarTransferOperation.axelarTransfer;
    return +feeAmount / Math.pow(10, 18);
  }, [axelarTransferOperation]);

  if (!(sourceChain && sourceAsset && destinationChain && destinationAsset)) {
    return null;
  }

  const isEvm =
    sourceChain?.chainType === "evm" || destinationChain?.chainType === "evm";

  return (
    <Collapsible.Root
      className="border border-neutral-200 px-4 py-2 rounded-lg text-sm group"
      open={open}
      onOpenChange={control.set}
    >
      <div className="flex items-center text-center gap-1 relative text-xs">
        <ConversionRate
          srcAsset={sourceAsset}
          destAsset={destinationAsset}
          amountIn={amountIn}
          amountOut={amountOut}
        >
          {({ left, right, conversion, toggle }) => (
            <div>
              <button className="mr-2" onClick={toggle}>
                1 {left.symbol} = {format(conversion)} {right.symbol}
              </button>
              <span className="text-neutral-400 tabular-nums">
                <UsdValue
                  error={null}
                  chainId={right.chainID}
                  denom={right.denom}
                  coingeckoId={right.coingeckoId}
                  value={conversion.toString()}
                />
              </span>
            </div>
          )}
        </ConversionRate>
        <div className="flex-grow" />
        <Collapsible.Trigger
          className={clsx(
            "flex items-center text-xs text-neutral-400 relative",
            "before:absolute before:-inset-2 before:content-['']",
          )}
        >
          <ChevronDownIcon
            className={clsx(
              "w-4 h-4 transition",
              open ? "rotate-180" : "rotate-0",
            )}
          />
        </Collapsible.Trigger>
      </div>

      <Collapsible.Content
        className={clsx(
          "overflow-hidden",
          "data-[state=open]:animate-collapsible-open",
          "data-[state=closed]:animate-collapsible-closed",
        )}
      >
        <dl
          className={clsx(
            "grid grid-cols-2 gap-2 mt-4 mb-2",
            "[&_dt]:text-neutral-400 [&_dt]:text-start",
            "[&_dd]:text-end [&_dd]:tabular-nums",
          )}
        >
          <dt>
            Max Slippage{" "}
            <SimpleTooltip label="Click to change max slippage">
              <button
                className="relative before:absolute before:-inset-2"
                onClick={() => disclosure.open("settingsDialog")}
              >
                <PencilSquareIcon className="w-3 h-3 -mb-px" />
              </button>
            </SimpleTooltip>
          </dt>
          <dd>{slippage}%</dd>
          <dt>Bridging Fee</dt>
          <dd>
            {format(bridgingFee)} {isEvm ? "ETH" : ""}
          </dd>
        </dl>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};

const { format } = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 8,
});
