import fs from 'fs';
import path from 'path';

console.log('Building Izumo Launchers...');

const vbsPath = path.join(process.cwd(), 'Izumo.vbs');

// Create silent VBS launcher (runs server in background without black CMD box)
const vbsContent = `
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "node """ & Replace(WScript.ScriptFullName, "Izumo.vbs", "dist\\server.cjs") & """", 0, False
`;

fs.writeFileSync(vbsPath, vbsContent.trim());
console.log('✓ Created Izumo.vbs (Silent background launcher) successfully!');
