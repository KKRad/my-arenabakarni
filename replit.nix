{ pkgs }: {
  deps = [
    pkgs.nodejs-16_x       # Instalira Node.js verziju 16
    pkgs.sqlite            # Instalira SQLite bazu podataka
    pkgs.mysql57           # Instalira MySQL verziju 5.7
    
  ];
}
