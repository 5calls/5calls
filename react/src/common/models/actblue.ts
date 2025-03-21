export interface ActBlue {
  __initialized: boolean; // indicates that the actblue script is loaded and ready to go
  requestContribution(config: RequestActBlueContributionConfig): Promise<ActBlueContribution>;
  addEventListener(eventName: string, completion: ActBlueCompletionCallback): void;
}

export type ActBlueCompletionCallback = (contribution: ActBlueContribution) => void;

export interface RequestActBlueContributionConfig {
  token: string; // the config token for this embed, the only required attribute
  amount?: string; // a pre-selected amount
  amounts?: string | number[]; // new option coming, could be string of comma seperated amounts in cents, or an array of cents in integers
  donor?: ActBlueDonor; // pre-set information about the donor
  embedId?: string; // specify your own id, which is echoed back in the `onContribute` events
  refcodes?: Record<string, string>; // an object of {refcodeBlah: 'blah'}
  styleSheetHref?: string; // url to a stylesheet which will be injected in the form
}

export interface ActBlueDonor {
  firstname?: string; // the first name of the donor
  lastname?: string; // the last name of the donor
  email: string; // an email address from the donor
  zip?: string; // a zip code from the donor
}

export interface ActBlueContribution {
  amount: number; // the amount in cents of the contribution
  embedId?: string; // if you pass an embedId in the contribution config it's reflected here
  email: string; // an email for the user who donated
  name: string; // name of the embed form created in actblue
  order_number: string; // order number, referencable in the actblue management interface
  recurring: boolean; // if the contribution was a recurring one
  refcodes?: Record<string, string>; // any refcodes added with the contribution
}
