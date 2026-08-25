const fs = require('fs');
const files = [
  'src/app/purchase-orders/[id]/page.tsx',
  'src/app/purchase-orders/page.tsx',
  'src/app/sites/[id]/edit/page.tsx',
  'src/app/sites/[id]/page.tsx',
  'src/app/sites/page.tsx',
  'src/app/vendors/[id]/edit/page.tsx',
  'src/app/vendors/[id]/page.tsx',
  'src/app/vendors/page.tsx',
  'src/modules/sites/components/site-form.tsx'
];
for (const f of files) {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/<Spinner className=\"[^\"]+\" \/>/g, '<Spinner />');
    content = content.replace(/<Badge variant=\{[^\}]+\}>/g, '<Badge>');
    if (f.includes('sites/[id]/page.tsx')) {
      if (!content.includes("import { useState } from 'react';")) {
        content = content.replace(/import \{ useParams \} from 'next\/navigation';/, "import { useState } from 'react';\nimport { useParams } from 'next/navigation';");
      }
      content = content.replace(/\(prev: any\) => prev - 1/g, 'prev => prev - 1');
      content = content.replace(/\(prev: any\) => prev \+ 1/g, 'prev => prev + 1');
    }
    fs.writeFileSync(f, content);
  }
}
