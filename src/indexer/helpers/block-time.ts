import {Abieos} from "@eosrio/node-abieos";
import {MainSettings} from "../../interfaces/hyperionConfig.js";

// Stock Antelope block slots: 500 ms, slot 0 at 2000-01-01T00:00:00Z.
const STOCK_BLOCK_INTERVAL_MS = 500;
const STOCK_BLOCK_TIMESTAMP_EPOCH_MS = 946684800000;

/** The chain's block slot length: settings.block_interval_ms, stock 500 ms when not set. */
export function blockIntervalMs(settings: MainSettings): number {
    return settings.block_interval_ms ?? STOCK_BLOCK_INTERVAL_MS;
}

/**
 * abieos turns block_timestamp_type slots into times with constants fixed when node-abieos was built
 * (CMake options EOSIO_BLOCK_INTERVAL_MS / EOSIO_BLOCK_TIMESTAMP_EPOCH_MS). A build for another chain gives a
 * wrong time for every block, action and delta, so a mismatch with the chain config is an error.
 */
export function checkAbieosBlockTime(settings: MainSettings): void {
    const chain = {
        intervalMs: blockIntervalMs(settings),
        epochMs: settings.block_timestamp_epoch_ms ?? STOCK_BLOCK_TIMESTAMP_EPOCH_MS
    };
    const build = Abieos.getInstance().getBlockTimestampConfig();
    if (build.intervalMs !== chain.intervalMs || build.epochMs !== chain.epochMs) {
        const describe = (c: { intervalMs: number, epochMs: number }) =>
            `${c.intervalMs} ms slots from ${new Date(c.epochMs).toISOString()}`;
        throw new Error(`node-abieos decodes block times with ${describe(build)}, but the chain config ` +
            `(settings.block_interval_ms / block_timestamp_epoch_ms) says ${describe(chain)}. Rebuild node-abieos ` +
            `with --CDEOSIO_BLOCK_INTERVAL_MS=${chain.intervalMs} --CDEOSIO_BLOCK_TIMESTAMP_EPOCH_MS=${chain.epochMs}.`);
    }
}
