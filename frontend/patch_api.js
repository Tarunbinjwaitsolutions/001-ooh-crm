const fs = require('fs');

function replace(f, regex, replacement) {
  if (fs.existsSync(f)) {
    fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replace(regex, replacement));
  }
}

replace('src/modules/vendors/api.ts', /import \{ client \} from '\.\.\/\.\.\/shared\/api\/client';/g, "import { api as client } from '../../shared/api/client';");
replace('src/modules/sites/api.ts', /import \{ client \} from '\.\.\/\.\.\/shared\/api\/client';/g, "import { api as client } from '../../shared/api/client';");
replace('src/modules/purchase-orders/api.ts', /import \{ client \} from '\.\.\/\.\.\/shared\/api\/client';/g, "import { api as client } from '../../shared/api/client';");
replace('src/modules/purchase-orders/components/po-wizard.tsx', /import \{ client \} from '\.\.\/\.\.\/\.\.\/shared\/api\/client';/g, "import { api as client } from '../../../shared/api/client';");

replace('src/app/sites/import/page.tsx', /'\.\.\/\.\.\/modules\/sites\/api'/g, "'../../../modules/sites/api'");
