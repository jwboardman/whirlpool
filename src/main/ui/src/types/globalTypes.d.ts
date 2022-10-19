// Define types for detecting which browser we're running on
interface Document {
  documentMode?: any;
}

interface Window {
  format?: any;
  // eslint-disable-next-line camelcase
  print_frame?: any;
}

interface MSBlobBuilder {
  append(data: any, endings?: string): void;
  getBlob(contentType?: string): Blob;
}

/* eslint-disable */
declare var MSBlobBuilder: {
  prototype: MSBlobBuilder;
  new (): MSBlobBuilder;
};
/* eslint-enable */

interface Navigator {
  msSaveBlob: (blob: Blob, filename: string) => void;
  mozApps: any;
}

interface HTMLElement {
  ononline?: any;
  onoffline?: any;
  onafterprint?: any;
  value?: any;
}

interface EventTarget {
  getAttribute?: any;
  result?: any;
}
