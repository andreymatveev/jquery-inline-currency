(function ($) {
    // plugin current version, please don't change it
    const version = "0.3.2";

    var LS_NAME = "$$jqueryInlineCurrency$$",
        LS_EXCHANGE = null;

    var defaults = {
        "currency": "USD",
        "convertTo": "EUR",
        "thousandsSplit": "",
        "decimalsSplit": ".",
        "containerElement": "p",
        "containerClass": "jic-container",
        "rateElement": "span",
        "rateClass": "jic-rate",
        "currencyElement": "span",
        "currencyClass": "jic-currency",
        "currencySplit": false,
        "debug": false
    };

    var updateDeferred = $.Deferred(),
        thousandsSplitRegExp = null,
        decimalsSplitRegExp = null;

    $.fn.inlineCurrency = function (options) {
        var $root = this;

        options = $.extend(defaults, options);
        options.convertTo = getListIfCommaString(options.convertTo);

        if (options.thousandsSplit) {
            thousandsSplitRegExp = parseSeparator(options.thousandsSplit);
        }
        if (options.decimalsSplit) {
            decimalsSplitRegExp = parseSeparator(options.decimalsSplit);
        }

        if (options.convertTo) {
            options.convertTo = options.convertTo.sort().map(function (item) {
                return item.toUpperCase();
            });
        } else {
            debugMsg('EXIT: options.convertTo must be specified');
            return false;
        }

        if (!options.currency) {
            debugMsg('EXIT: options.currency must be specified');
            return false;
        }

        $.when(updateRates())
            .then(function () {
                $root.each(function () {
                    printObjectCurrencies($(this));
                })
            })
            .fail(function () {
                debugMsg('EXIT: couldn\'t update exchange rates');
                return false;
            })

        return $root;

        function parseSeparator(value) {
            if (value) {
                return value
                    .replace(/[^\s\.,]/gi, "")
                    .replace(/\s+/gi, "\\s")
                    .replace(/\./gi, "\\.");
            }
            else return "";
        }

        function updateRates() {
            var ex = JSON.parse(window.localStorage.getItem(LS_NAME)),
                updateNeeded = false;

            if (!ex) {
                updateNeeded = true;
            }
            else {
                if (!ex.rates || !ex.created || ex.created < new Date().getTime() - 86400000) {
                    updateNeeded = true;
                }
                if (!ex.version || ex.version != version) {
                    updateNeeded = true;
                }
            }

            if (updateNeeded) {
                debugMsg('remove and update local exchange rates');
                window.localStorage.removeItem(LS_NAME);

                var baseCurrency = options.currency.toUpperCase();

                ex = {};

                $.getJSON('http://api.fixer.io/latest', {
                        base: baseCurrency
                    },
                    function (data) {
                        if (data.rates) {
                            ex.created = new Date().getTime();
                            data.rates[baseCurrency] = 1;
                            ex.rates = data.rates;
                            ex.version = version;
                            window.localStorage.setItem(LS_NAME, JSON.stringify(ex));
                            debugMsg('OK: rates updated');
                            LS_EXCHANGE = ex;
                            updateDeferred.resolve(true);
                        }
                    },
                    function () {
                        debugMsg('WARNING: currency service temporary unavailable');
                        updateDeferred.reject(false);
                    }
                );
            }
            else {
                LS_EXCHANGE = ex;
                updateDeferred.resolve(true);
            }

            return updateDeferred.promise();
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
                if (typeof (value) !== 'object') {
                    return value.split(/,\s?/);
                } else {
                    return value;
                }
            } else {
                return false;
            }
        }

        function convertCurrency(value, from, to) {
            value = value || 0;
            from = from.toString().toUpperCase();
            to = to.toString().toUpperCase();

            if (LS_EXCHANGE
                && LS_EXCHANGE.rates
                && to
                && LS_EXCHANGE.rates[to]
                && from
                && LS_EXCHANGE.rates[from]) {
                return Math.round(value / LS_EXCHANGE.rates[from] * LS_EXCHANGE.rates[to] * 100) / 100;
            } else {
                return false;
            }
        }

        function parsePrice(text) {
            var matches = new RegExp('(\\d+' + (options.thousandsSplit ? '(?:' + options.thousandsSplit + '\\d+)*' : '') + '(?:' + options.decimalsSplit + '\\d+)?)+').exec(text);
            if (matches && matches.length) {
                if (thousandsSplitRegExp) {
                    matches[0] = matches[0].replace(new RegExp(thousandsSplitRegExp, "g"), "");
                }
                if (decimalsSplitRegExp) {
                    matches[0] = matches[0].replace(new RegExp(decimalsSplitRegExp, "g"), ".");
                }
                return parseFloat(matches[0]);
            }
            return 0;
        }

        function formatPrice(price) {
            if (options.thousandsSplit) {
                price = (price + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1" + options.thousandsSplit);
            }
            if (options.decimalsSplit) {
                price = (price + '').replace(/(\d+)\.(\d+)/, "$1" + options.decimalsSplit + "$2");
            }
            return price;
        }

        function printObjectCurrencies($object) {
            var str = "",
                originalStr = $object.html(),
                value = $object.data("jic-value") || parsePrice($object.text()),
                currency = $object.data("jic-currency") || options.currency,
                convertTo = getListIfCommaString($object.data("jic-convert-to") || options.convertTo);

            for (var i = 0; i < convertTo.length; i++) {
                convertTo[i] = $.trim(convertTo[i]);
                currency = $.trim(currency);

                var val = convertCurrency(value, currency, convertTo[i]);
                if (val) {
                    if (! options.currencySplit) {
                        str += '<' + options.rateElement || 'span' +
                            (options.rateClass ? ' class="' + options.rateClass + '"' : '') + '>' +
                            formatPrice(val) + ' ' +
                            (options.currencyElement ? '<' + options.currencyElement +
                                (options.currencyClass ? ' class="' + options.currencyClass + '"' : '') +
                                '>' : '') +
                            convertTo[i].toUpperCase() +
                            (options.currencyElement ? '</' + options.currencyElement + '>' : '') +
                            '</' + options.rateElement || 'span' + '>';
                    }
                    else {
                        str += (!str ? "" : ", ") + formatPrice(val) + ' ' + convertTo[i].toUpperCase();
                    }
                }
            }

            if (str) {
                if (options.containerElement) {
                    str = '<' + options.containerElement +
                        (options.containerClass ? ' class="' + options.containerClass + '"' : '') + '>' +
                        str +
                        '</' + options.containerElement + '>';
                }
                $object.append($(str));
            }
        }
    };
})(jQuery);
