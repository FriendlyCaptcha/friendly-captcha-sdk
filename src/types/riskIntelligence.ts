import { RiskIntelligenceErrorCode } from "./error";
import { APIEndpoint } from "./widget";

export interface RiskIntelligenceGenerateData {
  token: string;
  expiresAt: number;
}

/**
 * Options for configuring a Risk Intelligence request.
 * @public
 */
export interface RiskIntelligenceOptions {
  /**
   * Sitekey of your application, starts with `FC`.
   */
  sitekey: string;

  /**
   * A custom endpoint from which the agent is loaded and to which Risk Intelligence
   * requests are made.
   */
  apiEndpoint?: APIEndpoint;
}

/**
 * Error data returned by a failed Risk Intelligence request.
 * @public
 */
export interface RiskIntelligenceErrorData {
  /**
   * The error code.
   */
  code: RiskIntelligenceErrorCode;
  /**
   * More details about the error to help debugging.
   * This value is not localized and will change between versions.
   *
   * You can print this to the console, but make sure not to depend on it in your code.
   */
  detail: string;
}
