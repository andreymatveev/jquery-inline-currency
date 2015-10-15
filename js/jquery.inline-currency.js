(function ($) {

  var LS_NAME = "$$jqueryInlineCurrency$$",
    LS_RATES = null,
    LS_SCRIPT_ELEMENT = null,
    LS_CURRENCIES = null;

  var defaults = {
    "currencies": "usd, rub, eur",
    "currency": "usd",
    "convertTo": "rub, eur",
    "thousandsSplit": ",",
    "decimalsSplit": ".",
    "updateInterval": 3600,
    "debug": true
  };

  /**
   * 1. Read data from Yahoo Currency API
   * 2. Save data in the local storage
   * 3. Update rates variable
   *
   * @param  {Object} data Data from API
   */
  $.inlineCurrencyUpdate = function (data) {
    var ratesData = {};
    if (data && data.query && data.query.results) {
      ratesData = {
        created: new Date(data.query.created).getTime(),
        currencies: LS_CURRENCIES,
        data: {}
      }
      if (data.query.count > 1) {
        for (var index in data.query.results.rate) {
          ratesData.data[data.query.results.rate[index].id] = parseFloat(data.query.results.rate[index].Rate, 10);
        }
      } else if (data.query.count == 1) {
        ratesData.data[data.query.results.rate.id] = parseFloat(data.query.results.rate.Rate, 10);
      }
    }
    window.localStorage.setItem(LS_NAME, JSON.stringify(ratesData));

    LS_RATES = ratesData;
  };

  $.fn.inlineCurrency = function (options) {
    options = $.extend(defaults, options);
    LS_RATES = getRates();

    /**
     * Get rates from the local storage or get them form Yahoo Service API
     * @return {Object} Rates Object
     */
    function getRates() {
      var rates = JSON.parse(window.localStorage.getItem(LS_NAME));

      if (rates && rates.created < new Date().getTime() - options.updateInterval) {
        debugMsg('remove local exchange rates')
        window.localStorage.removeItem(LS_NAME);
        rates = null;
      }

      options.currencies = getListIfCommaString(options.currencies);

      if(options.currencies) {
        options.currencies = options.currencies.sort();
      }

      if (!rates ||
        !rates.currencies ||
        rates.currencies != options.currencies) {

        debugMsg('get new exchange rates', 'asdfasdf')

        var currencyPairs = "";
        if (options.currencies.length > 2) {
          for (var i = 0; i < options.currencies.length - 1; i++) {
            for (var j = i + 1; j < options.currencies.length; j++) {
              currencyPairs += (i == 0 && j == i + 1 ? "" : "%2C") + "%22" + options.currencies[i] + options.currencies[j] + "%22%2C%22" + options.currencies[j] + options.currencies[i] + "%22";
            }
          }
        }
        if (currencyPairs) {
          LS_CURRENCIES = options.currencies.join(",");

          LS_SCRIPT_ELEMENT = document.createElement("script");
          LS_SCRIPT_ELEMENT.setAttribute("src", "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.xchange%20where%20pair%20in%20(" + currencyPairs + ")%20&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=$.inlineCurrencyUpdate");
          document.body.appendChild(LS_SCRIPT_ELEMENT);
        }
      };

      return rates;
    };

    function debugMsg() {
      if(options.debug) {
        if(! console) {
          window.console = {};
        }
        console.log('[jQueryInlineCurrency: ', $.makeArray(arguments).join(', '), ']');
      }
    }

    function getListIfCommaString(value) {
      if(value) {
        if(typeof(value) != 'object') {
          return value.split(",");
        }
        else {
          return value;
        }
      }
      else {
        return false;
      }
    }

    function convertCurrency(value, from, to) {
      if (from != to && LS_RATES.data[(from + "" + to).toUpperCase()]) {
        return Math.round(value * LS_RATES.data[(from + "" + to).toUpperCase()] * 100) / 100;
      } else {
        return false;
      }
    }

    function getValueFromString($object) {
      var text = $object.text();
      var matches = new RegExp('(\\d+' + (options.thousandsSplit ? '(?:\\' + options.thousandsSplit + '\\d+)*' : '') + '(?:\\' + options.decimalsSplit + '\\d+)?)+').exec(text);
      return matches && matches.length ? matches[0] : 0;
    }

    function getResult($object) {
      var str = "",
        originalStr = $object.html(),
        value = $object.data("jic-value") || getValueFromString($object),
        currency = $object.data("jic-currency") || options.currency,
        convertTo = getListIfCommaString($object.data("jic-convert-to") || options.convertTo);

      for (var i = 0; i < convertTo.length; i++) {
        convertTo[i] = $.trim(convertTo[i]);
        currency = $.trim(currency);

        var val = convertCurrency(value, currency, convertTo[i]);
        str += val !== false ? ((!str ? "" : ", ") + val + " " + convertTo[i].toUpperCase()) : "";
      }

      $object.html(originalStr + (str ? " (" + str + ")" : ""));
    }

    return this.each(function () {
      var $this = $(this);

      if (LS_SCRIPT_ELEMENT) {
        $(LS_SCRIPT_ELEMENT).load(function () {
          getResult($this);
        });
      } else {
        getResult($this);
      }
    });
  };
})(jQuery);
