# jQuery.inline-currency
Simple jQuery plugin for showing prices in different currencies using actual exchange rates.

## How to use
0. Include plugin in the `head` or `body` section after jQuery:
```
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.0/jquery.min.js"></script>
    <script src="./js/jquery.inline-currency.min.js"></script>
```
1. Set styles for the currencies tooltip or include my version from `css/jquery.inline-currency.css`;
```
    <link rel="stylesheet" href="./css/jquery.inline-currency.css" />
```
2. Put each price into some element, that will be selector for jQuery:
```
   <span class="jic">$10</span>
```
3. Apply `inlineCurrency` plugin to your prices:
```
    $(document).ready(function () {
        $('.jic').inlineCurrency()
    })
```

## How it works
Plugin tries to detect price from text, so this setup will be best with integer or float prices.

If you use formatting for your numbers (thousands and decimal separators), you should set some options to plugin.

## Options
Default set:
```
{
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
}
```

All parameters are optional.

### Currency setup
- `currency` — basic currency for your prices
- `convertTo` — comma-separated list of currencies to convert to

### Price recognition
- `thousandsSplit` - thousands separator (can be empty, space, `.` or `,`)
- `decimalsSplit` - decimals separator  (can be empty, space, `.` or `,`)

Remember that this parameters can't be equal.

### Tooltip generation setup
- `containerElement` and `containerClass` - element that will be appended to each price
- `rateElement` and `rateClass` - element and class for each exchange rate
- `currencyElement` and `currencyClass` — element for each currency unit
- `currencySplit` (Boolean or String) — excludes `rateElement` and generates exchange rates separated by `currencySplit` value

## Inline parameters
Plugin also supports inline parameters (for exotic cases) which can help set price, base currency and convertTo for each price:
- `data-jic-value` - price value
- `data-jic-currency` — base currency
- `data-jic-convert-to` — comma-separated list of currencies to convert to

```
<span class="jic" data-jic-value="10" data-jic-currency="EUR" data-jic-convert-to="rub, usd">Ten Euros</span>
```

## Exchange rates source

In the begining it was Yahoo Currencies Service, but in the discussion at `https://developer.yahoo.com/forum/General-Discussion-at-YDN/Using-Yahoo-Finance-API-Not-RSS-/1250246255000-0b82f8f0-7f48-3af2-8fe2-e73a138cbfaa/` it was mentioned:

> The reason for the lack of documentation is that we don't have a Finance API. It appears some have reverse engineered an API that they use to pull Finance data, but they are breaking our Terms of Service (no redistribution of Finance data) in doing this so I would encourage you to avoid using these webservices.
>
>Cheers,
>Robyn Tippins
>Community Manager, YDN

So, I've decided not to break Yahoo's Terms of Service and have found http://fixer.io/ (https://github.com/hakanensari/fixer-io/). As it is free and has MIT License, it's the best choice for our purposes. Thanks, @hakanensari

## How often do rates update

Once a day (for now, October 2015). Check https://github.com/hakanensari/fixer-io/ for more info.

## Browser compatibility
You can check `window.localStorage` use at http://caniuse.com/#search=localstorage
