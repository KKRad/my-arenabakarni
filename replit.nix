{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x       # Instalira Node.js verziju 18
    pkgs.sqlite            # Instalira SQLite bazu podataka
    pkgs.mysql57           # Instalira MySQL verziju 5.7
  ];
}
