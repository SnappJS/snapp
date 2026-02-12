/**
 * Type definitions for the Snapp Framework
 * Comprehensive type support for both TypeScript and JavaScript projects
 */

/**
 * Represents a child element that can be rendered
 * Can be a string, number, Element, DocumentFragment, function, or array
 */
export type SnappChild =
  | string
  | number
  | Element
  | DocumentFragment
  | SnappComponent
  | SnappChild[]
  | null
  | undefined
  | boolean;

/**
 * Props object for components
 * Any key-value pairs that can be passed to components
 */
export type SnappProps = Record<string, any>;

/**
 * A Snapp component function
 * Takes props and children, returns a DOM element or fragment
 */
export type SnappComponent<P extends SnappProps = SnappProps> = (
  props: P & { children?: SnappChild[] }
) => Element | DocumentFragment;

/**
 * Event handler function type
 */
export type EventHandler = (event: Event) => void;

/**
 * Render positioning type
 * Determines where the element should be rendered relative to the target
 */
export type RenderType = "before" | "prepend" | "replace" | "append" | "after";

/**
 * Dynamic value interface for reactive state
 * Allows updating values and automatically re-rendering related elements
 */
export interface DynamicValue<T = any> {
  readonly value: T;
  update: (newValue: T) => void;
}

/**
 * Internal subscription data structure
 * Tracks dependencies between dynamic values and DOM elements
 */
export interface SubscribeData {
  type: "node" | "attr" | "style";
  temp: Function;
  subscribe: string[];
  node?: Text;
  attr?: string;
  prop?: string;
}

/**
 * Style properties object
 * Can be static or functions that return dynamic values
 */
export type StyleProperties = Record<
  string,
  string | number | (() => string | number)
>;

/**
 * HTML attributes and event handlers
 */
export interface HTMLAttributes<T extends Element = Element> {
  // Global attributes
  id?: string;
  className?: string;
  class?: string;
  style?: StyleProperties | string;
  title?: string;
  hidden?: boolean;
  
  // Data attributes (allow any data-* attributes)
  [key: `data-${string}`]: any;
  
  // ARIA attributes
  [key: `aria-${string}`]: any;
  
  // Event handlers
  onAbort?: EventHandler;
  onAnimationCancel?: EventHandler;
  onAnimationEnd?: EventHandler;
  onAnimationIteration?: EventHandler;
  onAnimationStart?: EventHandler;
  onAuxClick?: EventHandler;
  onBlur?: EventHandler;
  onChange?: EventHandler;
  onClick?: EventHandler;
  onClose?: EventHandler;
  onContextMenu?: EventHandler;
  onCopy?: EventHandler;
  onCueChange?: EventHandler;
  onCut?: EventHandler;
  onDblClick?: EventHandler;
  onDoubleClick?: EventHandler;
  onDrag?: EventHandler;
  onDragEnd?: EventHandler;
  onDragEnter?: EventHandler;
  onDragLeave?: EventHandler;
  onDragOver?: EventHandler;
  onDragStart?: EventHandler;
  onDrop?: EventHandler;
  onDurationChange?: EventHandler;
  onEmptied?: EventHandler;
  onEnded?: EventHandler;
  onError?: EventHandler;
  onFocus?: EventHandler;
  onFocusIn?: EventHandler;
  onFocusOut?: EventHandler;
  onFormData?: EventHandler;
  onInput?: EventHandler;
  onInvalid?: EventHandler;
  onKeyDown?: EventHandler;
  onKeyPress?: EventHandler;
  onKeyUp?: EventHandler;
  onLoad?: EventHandler;
  onLoadStart?: EventHandler;
  onLoadedData?: EventHandler;
  onLoadedMetadata?: EventHandler;
  onMouseDown?: EventHandler;
  onMouseEnter?: EventHandler;
  onMouseLeave?: EventHandler;
  onMouseMove?: EventHandler;
  onMouseOut?: EventHandler;
  onMouseOver?: EventHandler;
  onMouseUp?: EventHandler;
  onPaste?: EventHandler;
  onPause?: EventHandler;
  onPlay?: EventHandler;
  onPlaybackRateChange?: EventHandler;
  onPlaying?: EventHandler;
  onPointerCancel?: EventHandler;
  onPointerDown?: EventHandler;
  onPointerEnter?: EventHandler;
  onPointerLeave?: EventHandler;
  onPointerMove?: EventHandler;
  onPointerOut?: EventHandler;
  onPointerOver?: EventHandler;
  onPointerUp?: EventHandler;
  onProgress?: EventHandler;
  onRateChange?: EventHandler;
  onReset?: EventHandler;
  onResize?: EventHandler;
  onScroll?: EventHandler;
  onScrollEnd?: EventHandler;
  onSecurityPolicyViolation?: EventHandler;
  onSeeked?: EventHandler;
  onSeeking?: EventHandler;
  onSelect?: EventHandler;
  onSelectionChange?: EventHandler;
  onSelectStart?: EventHandler;
  onSlotChange?: EventHandler;
  onStalled?: EventHandler;
  onSubmit?: EventHandler;
  onSuspend?: EventHandler;
  onTimeUpdate?: EventHandler;
  onToggle?: EventHandler;
  onTouchCancel?: EventHandler;
  onTouchEnd?: EventHandler;
  onTouchMove?: EventHandler;
  onTouchStart?: EventHandler;
  onTransitionCancel?: EventHandler;
  onTransitionEnd?: EventHandler;
  onTransitionRun?: EventHandler;
  onTransitionStart?: EventHandler;
  onVolumeChange?: EventHandler;
  onWaiting?: EventHandler;
  onWheel?: EventHandler;

  // Allow any other attributes
  [key: string]: any;
}

/**
 * Intrinsic elements mapping for JSX support
 * Maps tag names to their attribute types
 */
export interface IntrinsicElements {
  // HTML elements
  a: HTMLAttributes<HTMLAnchorElement>;
  abbr: HTMLAttributes<HTMLElement>;
  address: HTMLAttributes<HTMLElement>;
  area: HTMLAttributes<HTMLAreaElement>;
  article: HTMLAttributes<HTMLElement>;
  aside: HTMLAttributes<HTMLElement>;
  audio: HTMLAttributes<HTMLAudioElement>;
  b: HTMLAttributes<HTMLElement>;
  base: HTMLAttributes<HTMLBaseElement>;
  bdi: HTMLAttributes<HTMLElement>;
  bdo: HTMLAttributes<HTMLElement>;
  blockquote: HTMLAttributes<HTMLElement>;
  body: HTMLAttributes<HTMLBodyElement>;
  br: HTMLAttributes<HTMLBRElement>;
  button: HTMLAttributes<HTMLButtonElement>;
  canvas: HTMLAttributes<HTMLCanvasElement>;
  caption: HTMLAttributes<HTMLTableCaptionElement>;
  cite: HTMLAttributes<HTMLElement>;
  code: HTMLAttributes<HTMLElement>;
  col: HTMLAttributes<HTMLTableColElement>;
  colgroup: HTMLAttributes<HTMLTableColElement>;
  data: HTMLAttributes<HTMLElement>;
  datalist: HTMLAttributes<HTMLDataListElement>;
  dd: HTMLAttributes<HTMLElement>;
  del: HTMLAttributes<HTMLModElement>;
  details: HTMLAttributes<HTMLDetailsElement>;
  dfn: HTMLAttributes<HTMLElement>;
  dialog: HTMLAttributes<HTMLDialogElement>;
  div: HTMLAttributes<HTMLDivElement>;
  dl: HTMLAttributes<HTMLDListElement>;
  dt: HTMLAttributes<HTMLElement>;
  em: HTMLAttributes<HTMLElement>;
  embed: HTMLAttributes<HTMLEmbedElement>;
  fieldset: HTMLAttributes<HTMLFieldSetElement>;
  figcaption: HTMLAttributes<HTMLElement>;
  figure: HTMLAttributes<HTMLElement>;
  footer: HTMLAttributes<HTMLElement>;
  form: HTMLAttributes<HTMLFormElement>;
  h1: HTMLAttributes<HTMLHeadingElement>;
  h2: HTMLAttributes<HTMLHeadingElement>;
  h3: HTMLAttributes<HTMLHeadingElement>;
  h4: HTMLAttributes<HTMLHeadingElement>;
  h5: HTMLAttributes<HTMLHeadingElement>;
  h6: HTMLAttributes<HTMLHeadingElement>;
  head: HTMLAttributes<HTMLHeadElement>;
  header: HTMLAttributes<HTMLElement>;
  hgroup: HTMLAttributes<HTMLElement>;
  hr: HTMLAttributes<HTMLHRElement>;
  html: HTMLAttributes<HTMLHtmlElement>;
  i: HTMLAttributes<HTMLElement>;
  iframe: HTMLAttributes<HTMLIFrameElement>;
  img: HTMLAttributes<HTMLImageElement>;
  input: HTMLAttributes<HTMLInputElement>;
  ins: HTMLAttributes<HTMLModElement>;
  kbd: HTMLAttributes<HTMLElement>;
  label: HTMLAttributes<HTMLLabelElement>;
  legend: HTMLAttributes<HTMLLegendElement>;
  li: HTMLAttributes<HTMLLIElement>;
  link: HTMLAttributes<HTMLLinkElement>;
  main: HTMLAttributes<HTMLElement>;
  map: HTMLAttributes<HTMLMapElement>;
  mark: HTMLAttributes<HTMLElement>;
  meta: HTMLAttributes<HTMLMetaElement>;
  meter: HTMLAttributes<HTMLMeterElement>;
  nav: HTMLAttributes<HTMLElement>;
  noscript: HTMLAttributes<HTMLElement>;
  object: HTMLAttributes<HTMLObjectElement>;
  ol: HTMLAttributes<HTMLOListElement>;
  optgroup: HTMLAttributes<HTMLOptGroupElement>;
  option: HTMLAttributes<HTMLOptionElement>;
  output: HTMLAttributes<HTMLOutputElement>;
  p: HTMLAttributes<HTMLParagraphElement>;
  picture: HTMLAttributes<HTMLPictureElement>;
  pre: HTMLAttributes<HTMLPreElement>;
  progress: HTMLAttributes<HTMLProgressElement>;
  q: HTMLAttributes<HTMLQuoteElement>;
  rp: HTMLAttributes<HTMLElement>;
  rt: HTMLAttributes<HTMLElement>;
  ruby: HTMLAttributes<HTMLElement>;
  s: HTMLAttributes<HTMLElement>;
  samp: HTMLAttributes<HTMLElement>;
  script: HTMLAttributes<HTMLScriptElement>;
  section: HTMLAttributes<HTMLElement>;
  select: HTMLAttributes<HTMLSelectElement>;
  slot: HTMLAttributes<HTMLSlotElement>;
  small: HTMLAttributes<HTMLElement>;
  source: HTMLAttributes<HTMLSourceElement>;
  span: HTMLAttributes<HTMLSpanElement>;
  strong: HTMLAttributes<HTMLElement>;
  style: HTMLAttributes<HTMLStyleElement>;
  sub: HTMLAttributes<HTMLElement>;
  summary: HTMLAttributes<HTMLElement>;
  sup: HTMLAttributes<HTMLElement>;
  table: HTMLAttributes<HTMLTableElement>;
  tbody: HTMLAttributes<HTMLTableSectionElement>;
  td: HTMLAttributes<HTMLTableDataCellElement>;
  template: HTMLAttributes<HTMLTemplateElement>;
  textarea: HTMLAttributes<HTMLTextAreaElement>;
  tfoot: HTMLAttributes<HTMLTableSectionElement>;
  th: HTMLAttributes<HTMLTableHeaderCellElement>;
  thead: HTMLAttributes<HTMLTableSectionElement>;
  time: HTMLAttributes<HTMLTimeElement>;
  title: HTMLAttributes<HTMLTitleElement>;
  tr: HTMLAttributes<HTMLTableRowElement>;
  track: HTMLAttributes<HTMLTrackElement>;
  u: HTMLAttributes<HTMLElement>;
  ul: HTMLAttributes<HTMLUListElement>;
  var: HTMLAttributes<HTMLElement>;
  video: HTMLAttributes<HTMLVideoElement>;
  wbr: HTMLAttributes<HTMLElement>;

  // SVG elements
  svg: HTMLAttributes<SVGSVGElement>;
  animate: HTMLAttributes<SVGAnimateElement>;
  animateMotion: HTMLAttributes<SVGAnimateMotionElement>;
  animateTransform: HTMLAttributes<SVGAnimateTransformElement>;
  circle: HTMLAttributes<SVGCircleElement>;
  clipPath: HTMLAttributes<SVGClipPathElement>;
  defs: HTMLAttributes<SVGDefsElement>;
  desc: HTMLAttributes<SVGDescElement>;
  ellipse: HTMLAttributes<SVGEllipseElement>;
  feBlend: HTMLAttributes<SVGFEBlendElement>;
  feColorMatrix: HTMLAttributes<SVGFEColorMatrixElement>;
  feComponentTransfer: HTMLAttributes<SVGFEComponentTransferElement>;
  feComposite: HTMLAttributes<SVGFECompositeElement>;
  feConvolveMatrix: HTMLAttributes<SVGFEConvolveMatrixElement>;
  feDiffuseLighting: HTMLAttributes<SVGFEDiffuseLightingElement>;
  feDisplacementMap: HTMLAttributes<SVGFEDisplacementMapElement>;
  feDistantLight: HTMLAttributes<SVGFEDistantLightElement>;
  feDropShadow: HTMLAttributes<SVGFEDropShadowElement>;
  feFlood: HTMLAttributes<SVGFEFloodElement>;
  feFuncA: HTMLAttributes<SVGFEFuncAElement>;
  feFuncB: HTMLAttributes<SVGFEFuncBElement>;
  feFuncG: HTMLAttributes<SVGFEFuncGElement>;
  feFuncR: HTMLAttributes<SVGFEFuncRElement>;
  feGaussianBlur: HTMLAttributes<SVGFEGaussianBlurElement>;
  feImage: HTMLAttributes<SVGFEImageElement>;
  feMerge: HTMLAttributes<SVGFEMergeElement>;
  feMergeNode: HTMLAttributes<SVGFEMergeNodeElement>;
  feMorphology: HTMLAttributes<SVGFEMorphologyElement>;
  feOffset: HTMLAttributes<SVGFEOffsetElement>;
  fePointLight: HTMLAttributes<SVGFEPointLightElement>;
  feSpecularLighting: HTMLAttributes<SVGFESpecularLightingElement>;
  feSpotLight: HTMLAttributes<SVGFESpotLightElement>;
  feTile: HTMLAttributes<SVGFETileElement>;
  feTurbulence: HTMLAttributes<SVGFETurbulenceElement>;
  filter: HTMLAttributes<SVGFilterElement>;
  foreignObject: HTMLAttributes<SVGForeignObjectElement>;
  g: HTMLAttributes<SVGGElement>;
  image: HTMLAttributes<SVGImageElement>;
  line: HTMLAttributes<SVGLineElement>;
  linearGradient: HTMLAttributes<SVGLinearGradientElement>;
  marker: HTMLAttributes<SVGMarkerElement>;
  mask: HTMLAttributes<SVGMaskElement>;
  metadata: HTMLAttributes<SVGMetadataElement>;
  mpath: HTMLAttributes<SVGMPathElement>;
  path: HTMLAttributes<SVGPathElement>;
  pattern: HTMLAttributes<SVGPatternElement>;
  polygon: HTMLAttributes<SVGPolygonElement>;
  polyline: HTMLAttributes<SVGPolylineElement>;
  radialGradient: HTMLAttributes<SVGRadialGradientElement>;
  rect: HTMLAttributes<SVGRectElement>;
  stop: HTMLAttributes<SVGStopElement>;
  switch: HTMLAttributes<SVGSwitchElement>;
  symbol: HTMLAttributes<SVGSymbolElement>;
  text: HTMLAttributes<SVGTextElement>;
  textPath: HTMLAttributes<SVGTextPathElement>;
  tspan: HTMLAttributes<SVGTSpanElement>;
  use: HTMLAttributes<SVGUseElement>;
  view: HTMLAttributes<SVGViewElement>;
}

/**
 * Snapp Framework public API types
 */
export interface SnappFramework {
  create: typeof createElement;
  render: typeof render;
  on: typeof on;
  select: typeof select;
  selectAll: typeof selectAll;
  applystyle: typeof applystyle;
  removestyle: typeof removestyle;
  remove: typeof remove;
  dynamic: typeof dynamic;
}

declare function createElement(
  element: string | SnappComponent,
  props?: SnappProps | null,
  ...children: SnappChild[]
): Element | DocumentFragment;

declare function render(
  element: Element,
  component: string | number | Element | DocumentFragment,
  type?: RenderType,
  callback?: (success: boolean) => void
): void;

declare function on(event: string, callback: () => void): void;

declare function select(
  name: string | string[]
): Element | Element[] | null;

declare function selectAll(
  name: string | string[]
): NodeListOf<Element> | NodeListOf<Element>[] | null;

declare function applystyle(
  element: Element | Element[],
  styles: Record<string, string | number>
): void;

declare function removestyle(
  element: Element | Element[],
  styles?: Record<string, string | number> | boolean
): void;

declare function remove(items: Element | Element[]): void;

declare function dynamic<T = any>(initialValue?: T): DynamicValue<T>;