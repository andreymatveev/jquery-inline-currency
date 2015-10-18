# jQuery.inline-currency
Simple jQuery plugin for showing prices in different currencies using actual exchange rates.

# Exchange rates source

In the begining it was Yahoo Currencies Service, but in the discussion at `https://developer.yahoo.com/forum/General-Discussion-at-YDN/Using-Yahoo-Finance-API-Not-RSS-/1250246255000-0b82f8f0-7f48-3af2-8fe2-e73a138cbfaa/` it was mentioned:

> The reason for the lack of documentation is that we don't have a Finance API. It appears some have reverse engineered an API that they use to pull Finance data, but they are breaking our Terms of Service (no redistribution of Finance data) in doing this so I would encourage you to avoid using these webservices.
>
>Cheers,
>Robyn Tippins
>Community Manager, YDN

So, I've decided not to break Yahoo's Terms of Service and have found http://fixer.io/ (https://github.com/hakanensari/fixer-io/). As it is free and has MIT License, it's the best choice for our purposes. Thanks, @hakanensari

# How often do rates update

Once a day (for now, October 2015). Check https://github.com/hakanensari/fixer-io/ for more info.

# Browser compatibility
You can check `window.localStorage` use at http://caniuse.com/#search=localstorage
