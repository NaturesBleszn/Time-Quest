const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(/ {15}<\/div>\r?\n {12}\)\)}\r?\n {10}<\/div>\r?\n\r?\n {10}\{\/\* Add Quest Form \*\/\}/,
"               </motion.div>\n            ))}\n            </AnimatePresence>\n          </div>\n\n          {/* Add Quest Form */}");
fs.writeFileSync('src/App.tsx', content);
