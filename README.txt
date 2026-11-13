MURUGAR TEMPLE MANAGER - hosting files
Arulmigu Sri Valli Devasena Sametha Prasanna Subramanya Swamy Thirukoil, Vetrivel Kottam, Thiruninravur

Put these files in the SAME folder as index.html on your https host (for example GitHub Pages):
  index.html           the app (your murugar_temple_manager.html, renamed)
  manifest.json        name, icon, shortcuts  (the app page already contains the <link rel="manifest"> tag)
  sw.js                offline start + photo sharing. In the app: More > Install & app status > "Copy" next to sw.js,
                       then in GitHub use Add file > Create new file, name it sw.js and paste.
  icon-192.png, icon-512.png, icon-maskable-512.png
  app-config.json      optional: Microsoft app ID + colours so new phones need no typing

After uploading, open More > Install & app status > "Check my hosting" to see what is missing.
Never upload your database (.json) or an API key to a public host.
