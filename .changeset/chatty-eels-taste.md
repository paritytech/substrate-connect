---
"@substrate/wallet-template": patch
"@substrate/extension": patch
---

Fix `inpage.js` script variables leaking into the global scope, breaking any webpage with clashing variable names.
