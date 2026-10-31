# devdrawer

**Every tool a developer ends up Googling, in one place.** Hashes, UUIDs, colors, fake data, regex, image tools and more. Free, open source, and 100% in your browser: nothing you paste ever leaves your device.

## Highlights
- **Smart paste**: paste anything (JWT, hex color, timestamp, JSON, base64, URL…) and it picks the right tool.
- **⌘K / Ctrl+K command palette**: jump to any tool from anywhere.
- **Offline & private**: static Next.js export, no backend, no tracking.
- **54 tools**, and adding a new one takes a single file.

## Tools
| Category | Tools |
|---|---|
| Text | Word Counter, Case Converter, Text Diff, Lorem Ipsum, Slugify, Line Sorter/Deduper, Find & Replace, Markdown Preview, Text to Speech |
| Generators | UUID (v4/v7/nanoid), Password, Fake Data (JSON/CSV/SQL), Random Number, QR Code, Barcode, .gitignore |
| Crypto & Security | Hash (SHA family, text or file), HMAC, JWT Decoder, Bcrypt hash & verify, RSA key pairs |
| Encoding | Base64, URL encode/parse, HTML entities, Number base, Image → Base64 |
| Data & Code | JSON Formatter, JSON ↔ CSV, JSON ↔ YAML, Regex Tester, SQL Formatter, cURL → fetch/axios/Python, JSON → TypeScript |
| Color & Design | Color Picker (+EyeDropper), Contrast Checker, Image Palette, CSS Gradient, Box Shadow |
| Image | Image Compressor, Image Cropper, Image Format Converter, Favicon Generator |
| Video & Audio | Video Trimmer, Video → GIF |
| Time & Date | Unix Timestamp, Cron Explainer, Time Zone Converter |
| Web & Network | HTTP Status, User-Agent Parser, Chmod, Meta Tag Generator |
| Math & Units | Unit Converter, Percentage, Aspect Ratio |

Have an idea? [Open an issue](https://github.com/apreezofficial/devdrawer/issues/new?title=Tool+request:+) or build it yourself.

## Run it
```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # static site in ./out
```

## Contributing
Adding a tool takes about 5 minutes. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License
MIT
