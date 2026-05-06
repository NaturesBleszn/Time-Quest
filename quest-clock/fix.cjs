const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
  "               </div>\n            ))}\n          </div>\n\n          {/* Add Quest Form */}",
  "               </motion.div>\n            ))}\n            </AnimatePresence>\n          </div>\n\n          {/* Add Quest Form */}"
);
fs.writeFileSync('src/App.tsx', content);
