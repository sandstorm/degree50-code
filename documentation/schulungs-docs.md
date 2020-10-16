> **NOTE**: Wir haben noch einige **TODO**'s im Script -> diese markieren Stellen, welche Robert und mir (Theo) unklar sind.
> Idealerweise ergänzt das Michi noch.

> **NOTE 2**: Einige bekannte Fehler finden sich unter [known issues](#known-issues) und können so währende der Schulung referenziert werden!
> Alle diese Issues sind außerdem auch im Gitlab hinterlegt!
> Es kann sein, dass ich einige Issues in der Liste unten vergessen habe.
> Die Liste hat keinen Anspruch auf Vollständigkeit, sollte aber wesentliche Punkte, die auffallen abdecken.

> **NOTE 3**: Bitte noch einmal prüfen, ob ich irgendeinen wesentlichen Schritt vergessen habe. Alle dokumentierten Schritte habe ich auch mit den Prod-Accounts: test-student1@sandstorm.de, test-student2@sandstorm.de, test-dozent@sandstorm.de und admin@sandstorm.de getestet. Alle Account-Credentials sind im Bitwarden!

<!-- vim-markdown-toc GitLab -->

-   [Schulungsinhalte](#schulungsinhalte)
    -   [Registrierung/Login der verschiedenen User und Vergabe der Rechte - wer muss da was machen?](#registrierunglogin-der-verschiedenen-user-und-vergabe-der-rechte-wer-muss-da-was-machen)
    -   [Mediathek](#mediathek)
        -   [Welche Funktionen bietet die Mediathek?](#welche-funktionen-bietet-die-mediathek)
        -   [Wie wird ein Video hochgeladen?](#wie-wird-ein-video-hochgeladen)
        -   [Untertitel für Video erstellen](#untertitel-für-video-erstellen)
    -   [Aufgaben](#aufgaben)
        -   [Welche Funktionen bietet die Aufgabenübersicht?](#welche-funktionen-bietet-die-aufgabenübersicht)
        -   [Wie wird eine Aufgabe erstellt?](#wie-wird-eine-aufgabe-erstellt)
        -   [Phasen + Phasenerstellung](#phasen-phasenerstellung)
            -   [Was sind Phasen?](#was-sind-phasen)
            - [Phasen verschieben](#phasen-verschieben)
            - [Einzelphase vs. Gruppenphase](#einzelphase-vs-gruppenphase)
            - [Aufeinander aufbauende Phasen](#aufeinander-aufbauende-phasen)
            - [Komponenten](#komponenten)
            - [Videocodes](#videocodes)
            - [Videos](#videos)
            - [Material](#material)
        -   [Wie teste ich als Dozent eine Aufgabe?](#wie-teste-ich-als-dozent-eine-aufgabe)
        -   [Wie sehe ich als Studierende eine Aufgabe?](#wie-sehe-ich-als-studierende-eine-aufgabe)
        -   [Wie löse ich eine Aufgabe als Studierende?](#wie-löse-ich-eine-aufgabe-als-studierende)
            -   [Einzelphase](#einzelphase)
            -   [Gruppenphase](#gruppenphase)
            -   [Ergebnis vorheriger Phase nutzen](#ergebnis-vorheriger-phase-nutzen)
        -   [Wie schließe ich als Studierende eine Aufgabe ab?](#wie-schließe-ich-als-studierende-eine-aufgabe-ab)
    -   [Wie sehe ich als Studierende die Ergebnisse der anderen Studierenden?](#wie-sehe-ich-als-studierende-die-ergebnisse-der-anderen-studierenden)
    -   [Wie sehe ich als Dozent die Ergebnisse der Studierenden für eine Aufgabe/Phase](#wie-sehe-ich-als-dozent-die-ergebnisse-der-studierenden-für-eine-aufgabephase)
    -   [Editoren](#editoren)
        -   [Allgemein](#allgemein)
        -   [Annotationen](#annotationen)
        -   [VideoCodes](#videocodes-1)
        -   [Videoschnitt](#videoschnitt)
            -   [Original-Modus](#original-modus)
            -   [Cut-Modus](#cut-modus)
            -   [Serverseitiges Video](#serverseitiges-video)
    -   [Aktiv supported Browser](#aktiv-supported-browser)
    -   [Supported Screensizes / Devices](#supported-screensizes-devices)
    -   [Known Issues](#known-issues)
        -   [Session](#session)
        -   [Admin-Oberfläche](#admin-oberfläche)
        -   [Mediathek](#mediathek-1)
        -   [Kursmitglieder-Verwaltung](#kursmitglieder-verwaltung)
        -   [Aufgabenerstellung](#aufgabenerstellung)
        -   [Ergebnisse Anzeigen](#ergebnisse-anzeigen)
        -   [Aufgaben-Phase](#aufgaben-phase)
        -   [Videoeditor](#videoeditor)
    -   [Next Steps](#next-steps)

<!-- vim-markdown-toc -->

# Schulungsinhalte

## Registrierung/Login der verschiedenen User und Vergabe der Rechte - wer muss da was machen?

-   **TODO** - unvollständig
-   Registrierung: Anmeldung via TUDortmund SAML
-   Rollenzuweisung **Dozent**/**Lehrender**/**Admin** durch Nutzer mit Admin-Rolle in Administrator-Oberfläche

## Mediathek

### Welche Funktionen bietet die Mediathek?

-   Videos hochladen
-   Videos ansehen
-   Videos Downloaden (UX noch nicht intuitiv)
-   Selbst erstellte Videos bearbeiten
-   Untertitel für selbst hochgeladene Videos erstellen

### Wie wird ein Video hochgeladen?

-   Neues Video-Button
-   Form ausfüllen und oben Video hochladen
-   Video-Speichern-Button -> Video wird gespeichert und serverseitig encodiert -> kann dauern (Toast wird angezeigt)

### Untertitel für Video erstellen

-   Untertitel hinzufuegen
-   Auf der Timeline platzieren
-   Text ändern
-   Speichert im Hintergrund automatisch zwischen -> (Untertitel sind aber noch nicht öffentlich)
-   "Speichern"-Button -> Untertitel werden öffentlich in den Videos angezeigt (Videoanalyse-Phase, Mediathek)
-   Anmerkung: Im Videoschnitt können keine Untertitel angezeigt werden!

## Aufgaben

### Welche Funktionen bietet die Aufgabenübersicht?

-   Unterscheidung in selbst erstellte Aufgaben + von anderen bereitgestellte Aufgaben
-   Filterung (Scheinbar nur im Admin-Bereich - **TODO**):
    -   Versteckt -> filtert nach selbst erstellten und gleichzeitig versteckten Aufgaben
    -   Öffentlich -> filtert nach öffentlichen Aufgaben
    -   Abgeschlossen -> **TODO**
-   Erstellung von Aufgaben
-   Zuweisung von Studierenden und Dozent:innen zu Kurs ("Kursmitglieder verwalten")

### Wie wird eine Aufgabe erstellt?

-   Auf Navpunkt "Uebersicht" gehen
-   Dozent muss einem Kurs hinzugefügt worden sein, um Aufgaben erstellen + Ansehen zu können (!siehe known issues!)
-   Einen Kurs auswählen
-   Jetzt erscheint oben rechts der Button zum Anlegen von Aufgaben
-   Formular ausfuellen
-   Phasen hinzufuegen (Speichert automatisch)
-   Formular muss nur separat gespeichert werden, wenn Titel oder Beschreibung angepasst werden

### Phasen + Phasenerstellung

#### Was sind Phasen?

-   Teilaufgabe innerhalb einer Aufgabe
-   Es gibt verschiedene Phasentypen (z.B. Videoanalyse, Videoschnitt)

#### Phasen verschieben

-   Innerhalb der Übersichtsseite einer Aufgabe kann die Reihenfolge von Phasen verändert werden, indem die Pfeile rechts der Phase betätigt werden.

#### Einzelphase vs. Gruppenphase

-   Einzelphase = eine studierende Person bearbeitet die Phase allein
-   Gruppenphase = mehrere Studierende bearbeiten eine Phase:
    -   Es gibt immer genau einen Editor, alle anderen Studierenden sehen dessen Bearbeitungen
    -   Editor ist initial die erste studierende Person, welche die Phase öffnet
    -   Editor kann seinen Status einer anderen Studierenden Person geben
    -   Jede Studierende kann eine Gruppe erstellen

#### Aufeinander aufbauende Phasen

-   Aktuell können nur Videoanalyse und Videoschnitt aufeinander aufbauen (und auch nur in dieser Reihenfolge!)
-   Unabhängig von Gruppenphase/Einzelphase
-   In Videoeditor sind dann in der Timeline die bisherigen Lösungen sichtbar (scrollen! UX verbesserungswürdig!)

#### Komponenten

-   In Videoanalyse kann gewählt werden, ob Annotationen und/oder Videocodes bearbeitet werden sollen
-   Wenn Videocodes angewählt wurden, muss gespeichert werden - dann aktualisiert sich das Formular (UX!) und dann koennen Videocodes hinzugefuegt werden
-   Analyse + Cutting: "zusaetzliche Komponenten" - aktuell nur Videoplayer:
    -   fügt Videoplayer in Editor zur vertikalen Toolbar rechts hinzu
    -   derzeit crasht die Anwendung aber beim Click darauf

#### Videocodes

-   werden nur sichtbar, wenn Videocode-Komponente angewählt (s.o.)
-   Koennen Farbe + Titel erhalten und stehen dann im Editor dieser Phase zur Verfuegung

#### Videos

-   Es können eins oder mehrere Videos für die Phase ausgewaehlt werden
-   ABER: aktuell wird immer nur das erste ausgewaehlte Video tatsaechlich verwendet:
    -   deswegen: immer nur ein Video auswählen!

#### Material

-   Es kann zusätzliches Material für Studierende zur Verfügung gestellt werden (z.B. PDFs)
-   Diese werden dann in der vertikalen Toolbar im jeweiligen Editor der Phase angezeigt

### Wie teste ich als Dozent eine Aufgabe?

-   Aufgabe in Übersicht anklicken
-   Im Menü auf "Aufgabe testen" gehen
-   In den einzelnen Phasen gemachte Änderungen + Ergebnisse sind nur für Dozent selbst sichtbar

### Wie sehe ich als Studierende eine Aufgabe?

-   Studierende muss von Admin zu Kurs hinzugefuegt worden sein
-   Dann sind alle Aufgaben aus diesem Kurs, welche nicht als "versteckt" markiert worden sind, sichtbar

### Wie löse ich eine Aufgabe als Studierende?

#### Einzelphase

-   Aufgabe starten "Phase starten"/"Mein Ergebnis"

#### Gruppenphase

-   Wenn noch kein Ergebnis/Gruppe existiert: Innerhalb der Phase:
    -   "Neue Gruppe anlegen"-Button
-   Wenn Ergebnis/Gruppe existiert:
    -   Nutzer kann entweder eine neue Gruppe erstellen, oder einer bestehenden beitreten
-   "Phase Starten" (jeder Nutzer der Gruppe)
-   Dann zeigt vertikale Toolbar rechts die Gruppe mit den Nutzern und dem aktuellen Editor an
-   Aktueller Editor kann anderen Nutzer "promoten" damit dieser Editor wird und so Änderungen vornehmen kann
-   Während einer Gruppenphase syncen alle Änderungen, welche der aktuelle Editor macht automatisch mit allen anderen Gruppenmitgliedern
-   Nur der aktuelle Editor ist in der Lage das Ergebnis zu teilen und damit öffentlich zu machen (Button unten rechts)

#### Ergebnis vorheriger Phase nutzen

-   Ergebnisse vorheriger Phasen sind durch vertikales Scrollen in der Editor-Timeline sichtbar (wenn Phasen aufeinander aufbauen)

### Wie schließe ich als Studierende eine Aufgabe ab?

-   Wurde für jede Phase ein Ergebnis hinterlegt und zur letzten Phase der jeweiligen Aufgabe navigiert, kann die Studierende unten rechts auf Aufgabe abschließen drücken

## Wie sehe ich als Studierende die Ergebnisse der anderen Studierenden?

-   Theoretisch auf Überblicksseite von Phase innerhalb einer Aufgabe (Tabelle mit Email-Adressen und "Ergebnis anzeigen"-Button)
-   Aber: scheint aus Berechtigungsgruenden derzeit nicht zu funktionieren
-   **TODO**

## Wie sehe ich als Dozent die Ergebnisse der Studierenden für eine Aufgabe/Phase

-   Theoretisch direkt an der Aufgabe in der Aufgabenübersicht (draufklicken)
-   Aber "permission denied"
-   **TODO**
-   Als Admin geht es

## Editoren

### Allgemein

-   Beim Hinzufügen von Annotation/VideoCodes/Schnitten über die Schaltfläche rechts oben in der Media-Item-Liste, wird ein neues Element in der Timeline an der aktuellen Cursor-Position hinzugefuegt
-   Annotation/Videocodes/Cuts können frei auf der Timeline bewegt werden (drag + drop), ausserdem kann ihre groesse ueber die handles am rechten bzw. linken Item-Rand veraendert werden.

### Annotationen

-   Können in der Timeline verschoben werden
-   Text kann über die Media-Item-Liste rechts angepasst werden
-   Können über die Mediaitemliste oder über das Kontext-Menü (Rechtsklick auf Item in Timeline) gelöscht werden
-   Mehrere Items können in der Timeline überlappen (die Timeline wird entsprechend zur Darstellung aufgeteilt)

### VideoCodes

-   Vom Dozenten/Admin vordefinierte Videocodes haben ein Schloss in der Media-Item-Liste und können nicht gelöscht werden
-   In der Media-Item-Liste können unten eigene Codes hinzugefügt werden (Farbe + Bezeichner), Button mit gruen hinterlegtem **+**
-   Eigene Codes können auch wieder gelöscht werden (delete-icon-button)
-   Codes (vorgefertige und selbsterstellte) können Sub-Codes enthalten (haben automatisch Farbe des Parent-Elements)
-   Dazu muss der Pfeil rechts neben dem grau-hinterlegten Plus gedrueckt werden (wenn er nach oben zeigt, ist die Kategorie ausgeklappt)
-   Um einen Videocode in der Timeline an der aktuellen Cursor-Position hinzuzufuegen, muss das grau hinterlegte **+** in der Media-Item-Liste geclickt werden
-   Jedem Code kann über das Context-Menu (rechtsklick auf Item in der Timeline) ein Memo-Text hinzugefügt werden
-   Ueber das Info-Icon am Item kann das Memo dann eingesehen werden

### Videoschnitt

-   Standardmäßig wird im Player erstmal das original Video abgespielt
-   Über den "Original/Cut"-Button kann der Playerabspielmodus gewechselt werden

#### Original-Modus

-   Das original Video wird abgespielt
-   Die Timeline repräsentiert ebenfalls das original Video
-   Hier können jetzt Ausschnitte ("Cuts") erstellt werden, welche dann im Cutlist-Modus abgespielt werden
-   Dazu auf "Schnitt hinzuzufuegen" in Media-Item-List klicken, um an Cursor-Position einen neuen Cut zu erstellen
-   Liegt der Cursor auf einem Item, kann diese mit der "Split at Cursor"-Funktion aus der Toolbar in zwei unabhaengige Items geteilt werden.
-   Ein item repräsentiert immer den jeweiligen Ausschnitt, welcher im Originalvideo liegt

#### Cut-Modus

-   Im Cut-Modus wird die Media-Item-List rechts als Abspielliste verwendet
-   D.h. dass alle im Original-Modus gesetzten Schnitte hintereinander im Player abgespielt werden (anstatt des Originalvideos)
-   Die Timeline ist hier readonly und kann nicht verändert werden.
-   Die Timeline stellt ebenfalls die Abspielreihenfolge der Schnitte dar
-   Schnitte werden immer direkt hintereinander abgespielt (es gibt kein "Schwarzbild")
-   Die Abspielreihenfolge der Schnitte kann über die Pfeile in der Media-Item-Liste vorgenommen werden (geht auch im "Original"-Modus)

#### Serverseitiges Video

-   Wird auf den button "Ergebnis teilen" geklickt, wird die Cutlist auch serverseitig in ein Video codiert

## Aktiv supported Browser

-   Google Chrome
-   Mozilla Firefox

## Supported Screensizes / Devices

-   Desktop
-   TODO

## Known Issues

### Session

-   Session-Dauer für Studierende (und andere Rollen?) ist sehr kurz (#128)

### Admin-Oberfläche

-   Nutzer können hier nicht direkt angelegt werden -> 500er wegen fehlendem PW (#122)
-   Kurse können hier nicht direkt zugewiesen werden -> 500er (#126)

### Mediathek

-   Subtitles werden im Player nicht mehr angezeigt? (#127)
-   Einige bereitgestellte Videos können nicht abgespielt werden zu können (#129)

### Kursmitglieder-Verwaltung

-   Aktuell können nur Admins Kurse verwalten (#84)
-   Bei Rolle wird derzeit immer **Student** angezeigt, auch wenn es sich um einen Nutzer mit der Rolle **Dozent** handelt! (#131)

### Aufgabenerstellung

-   Dozenten können noch keine Aufgaben erstellen (geht gerade nur bei Nutzern mit Admin-Rolle) (#130)
-   Bei voneinanderabhängigen Phasen gibt es bisher keinen Mechanismus, welcher sicherstellt, dass in beiden auch das selbe Video verwendet wird (#132)

### Ergebnisse Anzeigen

-   Dozenten bekommen ein "Permission denied" (#133)
-   Videocuts werden noch nicht mit angezeigt (#134)

### Aufgaben-Phase

-   Nur das erste von ausgewaehlten Videos wird tatsaechlich genutzt (#135)
-   Phasen können unter bestimmten Voraussetzungen nicht gelöscht werden (#123)
-   Beim Gruppe-Anlegen/Loeschen/Beitreten: passiert Redirect auf erste Phase (#136)
-   Eine Gruppe wird mehrfach angezeigt, sobald ein Nutzer einer bestehenden Gruppe beigetreten ist (wenn "Deine Gruppe" = eine beigetretene "Gruppe von XXX") ) (#137)
-   Gruppenphase: Nicht-Editoren können Änderungen machen --> (nicht persistierbar, aber strange UX) (#138)
-   "Ergebnis anzeigen" (anderer Studierender) - permission denied (#133)

### Videoeditor

-   Videoplayer-Komponente in vertikaler Toolbar rechts crasht (#91)
-   Videocodes: um eigene Codes erstellen zu können, muss es mind. einen vorgefertigten Code geben

## Next Steps

-   TODO
