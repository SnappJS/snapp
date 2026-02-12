/**
 * Snapp Framework - Main Entry Point
 * Exports all public APIs and types
 */

import snapp from "./core";

export { type DynamicValue, type SnappProps, type SnappComponent, type SnappChild } from "./core";

// Also export commonly used types
export type {
  RenderType,
  EventHandler,
  HTMLAttributes,
  IntrinsicElements,
  SnappFramework,
} from "./types";

export default snapp;
