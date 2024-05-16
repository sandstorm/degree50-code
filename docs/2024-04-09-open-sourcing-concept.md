# Konzept für die Open Source Veröffentlichung der Degree Platform

## Problem
> The raw idea, a use case, or something we’ve seen that motivates us to work on this

Wir wollen die Degree Platform als Open-Source-Projekt veröffentlichen.

Dafür *müssen wir*:
- die festen Verdrahtungen mit der TU Dortmund lösen
- Sensible Daten entfernen
- die Dokumentation muss aufgeräumt werden

**Offene Fragen:**
- *Wer* veröffentlicht das Projekt auf Github? TU Dortmund oder Sandstorm?
- Unter *welcher Lizenz* wird das Projekt veröffentlicht?
- Wie und wo trennen wir Platform Development von Integration/Deployment/Betrieb?
  - Was passiert mit der Gitlab-CI/CD (muss sie zu Github migriert werden)?
- Aus Schätzung: Wie können wir die Konfiguration für Degree in eine Konfigurationsdatei auslagern?
  - env
    - SAML
    - Mail
    - TLS (https/Zertifikate)
  - file
    - Datenschutz
    - Nutzungsbedingungen
    - Logo
    - Farben
    - Übersetzungen

Dafür *möchte ich*:
- die in der Prototyp-Stage angelegten Abhängigkeiten auflösen
- das Datenschutz-Modul nochmal überdenken, da aktuell keine Historie der Datenschutz-Vereinbarungen gespeichert wird
  und der Text einfach komplett im Source-Code steht. (Vielleicht out-of-scope für die Open Source Veröffentlichung)
- den Source-Code aufräumen
    - Klassen und co sind völlig durcheinander
    - Viel ungenutzter Code aus Prototype-Stage
    - Code standards
- die Dokumentation muss aufgeräumt werden

## Appetite
> How much time we want to spend and how that constrains the solution

Für das Thema sind 80h geschätzt:

| Aufgabe                                       | Schätzung in Stunden | Details                                                                                                                                                                                                                                                                                                                    |
|-----------------------------------------------|----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Bereinigung des Codes und Löschen der History | 30                   | entfernen aller eventuell vorhandenen sensiblen Daten aus dem Code                                                                                                                                                                                                                                                         |
| Konfigurationsdatei und Dokumentation         | 50                   | in Dokumentation wird beschrieben, wie und wo z.B Logo, Datenschutzerklärung, Nutzungsbedingungen, Farbe angepasst werden können und wie die SAML-Schnittstelle genutzt werden kann Andere Account-Anbindungen werden nicht angeboten und können nach Veröffentlichung im Rahmen der Opensource-Weiterentwicklung erfolgen |

## Solution
> The core elements we came up with, presented in a form that’s easy for people to immediately understand

### Kern-Elemente
- Löschen von sensiblen Daten aus Git
  - Zertifikaten
  - TU Dortmund spezifische Texte/Daten

### Solution 1: Neues Projekt aufsetzen
- Das Projekt wird mit einer aktuellen LTS Version von Symfony neu aufgesetzt.
- Alle von uns entwickelten Module werden in das neue Projekt übernommen.
- Alle Tools, die wir *wirklich* benötigen, werden in der aktuellen Version installiert.

### Solution 2: Bestehendes Projekt aufräumen und updaten
- Das Projekt wird auf die aktuelle LTS Version von Symfony gebracht.
- Es wird versucht alle Module, welche nicht benötigt werden (z.B. aus Prototyp-Stage), zu entfernen.
- Git History wird bereinigt/gelöscht und ein neuer initial commit erstellt.

## Rabbit holes
> Details about the solution worth calling out to avoid problems

- Wie veröffentlicht man eine Plattform?
  - Dokumentation in DE oder EN?
  - Deployment?
  - Konfiguration?
- Neue Versionen von Symfony & anderen Tools brauchen oft Anpassungen in Code & Konfiguration 
- Ungenutzte Module sind oft nicht leicht zu identifizieren oder zu entfernen (z.B. API-Platform)
- Code Standards liegen im Auge des Betrachters (DTOs als read-only final classes, ect.)
  - Hier kann viel Zeit "versenkt" werden

## No-gos
> Anything specifically excluded from the concept: functionality or use cases we intentionally aren’t covering to fit
> the appetite or make the problem tractable

- Keine Adapter, Schnittstellen oder Tools für einfache integration von anderen Systemen (Auth, DB, etc.)
- Translations nur für DE
