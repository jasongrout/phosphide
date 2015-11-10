var cp = require('glob-copy');
cp.sync('src/menus/*.css', 'lib/menus');
cp.sync('src/ui/*.css', 'lib/ui');
