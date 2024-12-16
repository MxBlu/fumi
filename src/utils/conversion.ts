import { Dependency, Logger } from "bot-framework";

/** API response from https://api.frankfurter.app/latest */
interface FrankfurterConversionResponse {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

/** Milliseconds in 24 hours */
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
/** Array mapping the `Date.get[UTC]Day()` value to a day string */
const DAYS_OF_WEEK = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];

/**
 * Check whether the data should be updated
 * @param dateString Date string received from Frankfurter API
 */
function shouldUpdateData(dateString: string): boolean {
  // Parse the date as a CET date at 16:00 (when it should have been updated)
  const date = new Date(`${dateString}T16:00+01:00`);
  // Get the time passed since the last update
  const timeSince = Date.now() - date.getTime();

  // If the data was last updated on Friday (UTC, close enough to CET),
  //   the data will only be updated after the weekend (so 3 days)
  // Otherwise, it will be updated after 24 hours (ish)
  if (DAYS_OF_WEEK[date.getUTCDay()] == 'Friday') {
    return timeSince > TWENTY_FOUR_HOURS * 3;
  } else {
    return timeSince > TWENTY_FOUR_HOURS;
  }
}

class _CurrencyConversion {
  logger: Logger;
  /** Conversion rates, relative to EUR */
  rates: Record<string, number>;
  /** Date the conversion rates were last updated */
  dateUpdated: string;

  constructor() {
    this.logger = new Logger("CurrencyConversion");
  }

  public async init(): Promise<void> {
    try {
      // Fetch rates for the first time
      await this.ensureRates();
    } catch (e) {
      // If an error occurs, log it and move on
      this.logger.error('Unable to set up currency conversion');
      this.logger.error(e);
    }
    // Mark dependency as ready regardless of errors
    CurrencyConversionDependency.ready();
  }

  /**
   * Ensure up to date conversion rates
   */
  public async ensureRates(): Promise<void> {
    // If we don't have data or if the data is old, (re)fetch it
    if (this.dateUpdated == null || shouldUpdateData(this.dateUpdated)) {
      try {
        // Call the Frankfurter API and throw on error
        const resp = await fetch('https://api.frankfurter.app/latest');
        if (resp.status != 200) {
          throw new Error(`API returned ${resp.status}: ${await resp.text()}`);
        }
        // Get the JSON response
        const json = <FrankfurterConversionResponse> await resp.json();
        // Extract the rates out, converting all the keys to lowercase
        this.rates = {};
        Object.entries(json.rates).forEach(entry => {
          this.rates[entry[0].toLowerCase()] = entry[1];
        });
        // The base currency (EUR) will be on the top level, add that to the rates
        this.rates[json.base.toLocaleLowerCase()] = json.amount;
        // Set the date updated so that we know when to refetch
        this.dateUpdated = json.date;

        this.logger.info("Updated currency conversion data");
      } catch (e) {
        const error = <Error> e;
        this.logger.error(`Exception fetching updated rates: ${error.message}`);
        throw e;
      }
    }
  }

  /**
   * Convert from one currency to another
   * @param amount Amount to convert
   * @param from Currency to convert from
   * @param to Currency to convert to
   */
  public convert(amount: number, from: string, to: string): number {
    // Make sure we have rates to convert with
    if (this.rates == null) {
      throw new Error(`No conversion rates available`);
    }

    // Get the reference rates, throwing an exception if unknown
    const fromRefValue = this.rates[from.toLowerCase()];
    if (fromRefValue == null) {
      throw new Error(`Unknown currency: ${from}`);
    }
    const toRefValue = this.rates[to.toLowerCase()];
    if (toRefValue == null) {
      throw new Error(`Unknown currency: ${to}`);
    }

    return amount / fromRefValue * toRefValue;
  }

  /**
   * Get the supported currencies if rates have been fetched.
   * 
   * Returns an empty array otherwise.
   */
  public getCurrencies(): string[] {
    return this.rates ? Object.keys(this.rates).map(currency => currency.toUpperCase()) : [];
  }
}

export const CurrencyConversion = new _CurrencyConversion();
export const CurrencyConversionDependency = new Dependency("CurrencyConversion");