Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "node """ & Replace(WScript.ScriptFullName, "Izumo.vbs", "dist\server.cjs") & """", 0, False