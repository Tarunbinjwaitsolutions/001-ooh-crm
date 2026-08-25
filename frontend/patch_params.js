const fs = require('fs');

function replace(f, regex, replacement) {
  if (fs.existsSync(f)) {
    fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replace(regex, replacement));
  }
}

replace('src/modules/vendors/api.ts', /, \{ params \}/g, "");
replace('src/modules/vendors/api.ts', /return client\.get<VendorsResponse>\('\/vendors'\);/, "const qs = params ? '?' + new URLSearchParams(params).toString() : ''; return client.get<VendorsResponse>('/vendors' + qs);");

replace('src/modules/sites/api.ts', /, \{ params \}/g, "");
replace('src/modules/sites/api.ts', /return client\.get<SitesResponse>\('\/sites'\);/, "const qs = params ? '?' + new URLSearchParams(params).toString() : ''; return client.get<SitesResponse>('/sites' + qs);");

replace('src/modules/purchase-orders/api.ts', /, \{ params \}/g, "");
replace('src/modules/purchase-orders/api.ts', /return client\.get<PurchaseOrdersResponse>\('\/purchase-orders'\);/, "const qs = params ? '?' + new URLSearchParams(params).toString() : ''; return client.get<PurchaseOrdersResponse>('/purchase-orders' + qs);");

// And for the availability api
let siteApi = fs.readFileSync('src/modules/sites/api.ts', 'utf8');
siteApi = siteApi.replace(/return client\.get<Site\[\]>\('\/sites\/availability', \{\n      params: \{\n        fromDate,\n        toDate,\n        \.\.\.\(city && \{ city \}\)\n      \}\n    \}\);/, 
  "const qs = '?' + new URLSearchParams({ fromDate, toDate, ...(city && { city }) }).toString(); return client.get<Site[]>('/sites/availability' + qs);");
fs.writeFileSync('src/modules/sites/api.ts', siteApi);

// And for the page.tsx type
let page = fs.readFileSync('src/app/sites/import/page.tsx', 'utf8');
page = page.replace(/type: r\.type/, 'type: r.type as any');
fs.writeFileSync('src/app/sites/import/page.tsx', page);
