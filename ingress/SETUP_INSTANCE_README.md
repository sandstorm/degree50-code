# Leitfaden zum Aufsetzen einer neuen Degree Instanz

> TO-DO: Admin-User E-Mail-Adresse klären!

## 1. Vorbereitungen
* Zugriff auf https://gitlab.sandstorm.de/degree-4.0/code/-/pipelines/new muss vorhanden sein.
* Zugriff auf Admin-User E-Mail-Adresse muss vorhanden sein.
* Eine Domain muss für die neue Instanz beim ITMC beantragt werden und bereitgestellt worden sein.
  * Diese Domain muss auf den Degree Server zeigen.

## 2. Setup Starten
* Gehe auf https://gitlab.sandstorm.de/degree-4.0/code/-/pipelines/new
* Unter "Variables" setze die Variablen:
  * `TASK` auf den Wert `setup-instance`'
  * `TARGET` auf den Wert `production` oder `test` (je nachdem, ob es sich um eine Test- oder reale Instanz handelt)'
  * `INSTANCE_NAME` auf einen einmaligen Namen für die Instanz. Dieser muss
    * kleingeschrieben sein
    * mit einem alphanumerischen Zeichen beginnen und enden (a-z, 0-9)
    * dazwischen dürfen auf Bindestriche `-` enthalten sein und
    * eine Länge von 1 bis 63 Zeichen haben.
    * Beispiele: `test`, `zfsl`, `zfsl-test`, `zfsl-1`, `zfsl-dd`
  * `INSTANCE_DOMAIN` auf die Domain der neuen Instanz (z.B. `instanz-name.degree40.tu-dortmund.de`)
    * Wenn der Wert leer ist, wird die Domain aus dem `INSTANCE_NAME` und dem `TARGET` abgeleitet
    * Mit `INSTANCE_NAME`-Beispielen von oben, wen `TARGET` auf `production` gesetzt ist:
      * `test` -> `test.degree40.tu-dortmund.de`
      * `zfsl` -> `zfsl.degree40.tu-dortmund.de`
      * `zfsl-test` -> `zfsl-test.degree40.tu-dortmund.de`
      * `zfsl-1` -> `zfsl-1.degree40.tu-dortmund.de`
      * `zfsl-dd` -> `zfsl-dd.degree40.tu-dortmund.de`
    * (Fortgeschritten: Es kann jede beliebige Domain angegeben werden, solange diese auf den Degree Server zeigt.)
* Klicke auf "New pipeline", um den Setup Prozess zu starten.
* Nach wenigen Minuten sollte die Instanz bereit sein.
* Bei erfolgreicher Einrichtung der Degree-Instanz bekommt die gestartete Pipeline ein grünes Häkchen.
  * (Der Verlauf der Pipeline kann durch Klicken auf das Element im `deploy`-Kästchen eingesehen werden.)
* Mit Admin-User einloggen, um zu prüfen, ob alles funktioniert.
