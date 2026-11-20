# Room for Aza

An interactive pixel-art portfolio. Learn a little about me by exploring my room.

**Live site:** <https://roomforaza.dev>

## Features

- A pixel-art room with animated sprites (idle character, sleeping cat, steaming mug, etc.)
- Clickable objects with typewriter-style dialog
- A Windows 98-inspired desktop with: demos of work, an About Me, a resume and contact links
- Lofi background music with a shuffled, crossfading playlist. Designed to not conflict with computer during log on/off.
- Pixel-art desktop icons and cursors

## Accessibility

- All interactive objects are real buttons with a label (reachable by keyboard, with a visible focus outline)
- Dialog text is announced to screen readers through a live region
- Respects `prefers-reduced-motion` (no typewriter effect, shorter boot)
- Music isn't set to autoplay, it can be turned on or off at any time
- Focus moves into windows when they open and returns to their icons when they close

## Built with

- HTML, CSS and JavaScript (no frameworks)
- [98.css](https://jdan.github.io/98.css/) by Jordan Scales, recolored
- Web Audio API for smooth music fades
- Aseprite for the pixel art
- Hosted on GitHub Pages

## Credits

- **Color palette:** [Anthill](https://lospec.com/palette-list/anthill) by Jude Buffum, via Lospec
- **Room layout:** customized and recolored from the [Cozy Interior pack](https://shubibubi.itch.io/cozy-interior) by Shubibubi on itch.io. The character, plants, icons and cursors are my own additions.
- **Font:** [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) by CodeMan38 (SIL Open Font License)
- **Music:**
  - "Lofi Loop" by zephiramusic, via [Pixabay](https://pixabay.com/music/beats-lofi-loop-589689/)
  - "Lofi Polaroids" by fassounds, via [Pixabay](https://pixabay.com/music/beats-lofi-polaroids-632981/)
  - "When I Was A Boy" by [Tokyo Music Walker](https://soundcloud.com/user-356546060), music promoted by [Chosic](https://www.chosic.com/free-music/all/), licensed under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)
- **Dial-up sound:** "Old Internet Modem Dialing" by Liecio, via [Pixabay](https://pixabay.com/sound-effects/film-special-effects-old-internet-modem-dialing-189735/)

## License

The code in this repository is free to learn from. The room art, character and icons are my own work or licensed from the creators above, so please don't reuse them without permission.
