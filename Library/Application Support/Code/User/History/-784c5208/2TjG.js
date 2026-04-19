// @ts-check

/**
 * This file is required in order to allow localhost mode to work with the Split
 * SDK. You are free to make local changes here to configure different Split
 * Feature Flag behaviours when working locally, however please avoid committing
 * changes to this file.
 *
 * @example
 * To override the behaviour of a particular feature flag you can add an entry
 * of the mock map following the expected shape.
 * ```
 * const flags = {
 *   "MY-123-feature-flag": "on",
 * };
 * ```
 * @type {SplitIO.MockedFeaturesMap}
 */
const flags = {};

export default flags;
