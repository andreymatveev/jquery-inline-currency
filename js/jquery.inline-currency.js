(function ($) {

  var LS_NAME = "$$jqueryInlineCurrency$$",
    LS_EXCHANGE = null;

  var defaults = {
    "currency": "RUB",
    "convertTo": "USD, EUR",
    "thousandsSplit": "",
    "decimalsSplit": ".",
    "containerElement": "p",
    "containerClass": "jic-container",
    "rateElement": "span",
    "rateClass": "jic-rate",
    "currencyElement": "span",
    "currencyClass": "jic-currency",
    "debug": true
  };

  $.fn.inlineCurrency = function (options) {
    options = $.extend(defaults, options);
    options.convertTo = getListIfCommaString(options.convertTo);
    if (options.convertTo) {
      options.convertTo = options.convertTo.sort();
    } else {
      debugMsg('EXIT: options.convertTo must be specified');
      return false;
    }
    if (!options.currency) {
      debugMsg('EXIT: options.currency must be specified');
      return false;
    }

    function updateRates(callback) {
      var ex = JSON.parse(window.localStorage.getItem(LS_NAME));

      if (!ex || ex && (!ex.rates || !ex.created ||
          ex.created < new Date().getTime() - 86400000)) {

        // @TODO: remove

        debugMsg('remove local exchange rates');
        window.localStorage.removeItem(LS_NAME);
        ex = {};
      } else {
        LS_EXCHANGE = ex;
        if(typeof(callback) == 'function') {
          return callback();
        }
        else {
          return false;
        }
      }

      $.getJSON('//api.fixer.io/latest', {
          base: options.currency,
          symbols: options.convertTo.join(',')
        },
        function (data) {
          if (data.rates) {
            ex.created = new Date().getTime();
            data.rates[options.currency] = 1;
            ex.rates = data.rates;
            window.localStorage.setItem(LS_NAME, JSON.stringify(ex));
            debugMsg('OK: rates updated')
            LS_EXCHANGE = ex;

            if(typeof(callback) == 'function') {
              return callback();
            }
            else {
              return false;
            }
          }
        },
        function () {
          debugMsg('EXIT: service temporary unaviable')
          return false;
        });
    };

    function debugMsg() {
      if (options.debug) {
        if (!console) {
          window.console = {};
        }
        console.log('[jQueryInlineCurrency: ', $.makeArray(arguments).join(', '), ']');
      }
    }

    function getListIfCommaString(value) {
      if (value) {
        if (typeof (value) != 'object') {
          return value.split(/,\s/);
        } else {
          return value;
        }
      } else {
        return false;
      }
    }

    function convertCurrency(value, from, to) {
      value = value || 0;
      if (LS_EXCHANGE &&
          LS_EXCHANGE.rates &&
          to &&
          LS_EXCHANGE.rates[to.toUpperCase()] &&
          from &&
          LS_EXCHANGE.rates[from.toUpperCase()]) {
        return Math.round(value / LS_EXCHANGE.rates[from.toUpperCase()] * LS_EXCHANGE.rates[to.toUpperCase()] * 100) / 100;
      } else {
        return false;
      }
    }

    function getNumberFromText($object) {
      var text = $object.text();
      var matches = new RegExp('(\\d+' + (options.thousandsSplit ? '(?:\\' + options.thousandsSplit + '\\d+)*' : '') + '(?:\\' + options.decimalsSplit + '\\d+)?)+').exec(text);
      return matches && matches.length ? matches[0] : 0;
    }

    function printObjectCurrencies($object) {
      var str = "",
        originalStr = $object.html(),
        value = $object.data("jic-value") || getNumberFromText($object),
        currency = $object.data("jic-currency") || options.currency,
        convertTo = getListIfCommaString($object.data("jic-convert-to") || options.convertTo);

      for (var i = 0; i < convertTo.length; i++) {
        convertTo[i] = $.trim(convertTo[i]);
        currency = $.trim(currency);

        var val = convertCurrency(value, currency, convertTo[i]);
        if(val) {
          if(options.rateElement) {
            str += '<' + options.rateElement +
              (options.rateClass ? ' class="' + options.rateClass + '"' : '') + '>' +
              val + ' ' +
              (options.currencyElement ? '<' + options.currencyElement +
              (options.currencyClass ? ' class="' + options.currencyClass + '"' : '') +
              '>' : '') +
              convertTo[i].toUpperCase() +
              (options.currencyElement ? '</' + options.currencyElement + '>' :'') +
              '</' + options.rateElement + '>';
          }
          else if(options.currencySplit) {
            str += (!str ? "" : ", ") + val + ' ' + convertTo[i].toUpperCase();
          }
        }
      }

      if(str) {
        if(options.containerElement) {
          str = '<' + options.containerElement +
            (options.containerClass ? ' class="' + options.containerClass + '"' : '') + '>' +
            str +
            '</' + options.containerElement + '>';
        }
        $object.append($(str));
      }
    }

    return this.each(function () {
      var $this = $(this);
      updateRates(function () {
        printObjectCurrencies($this);
      })
    });
  };
})(jQuery);
