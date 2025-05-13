# MultiTenantPlugin
(!) still an early alpha version!

The plugin supports both rspack and webpack.

It allows to have multiple tenants in the same build instead of building each tenant individually.
All CSS / SVG files will get split into individual chunks / sprites for each tenant and are loaded dynamic at runtime.

A [guide](https://github.com/netconomy-stephan-dum/css-multi-theme) to a complete example is located in the repository root folder.