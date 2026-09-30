<div align="center">

# ✨ Bulk File Renamer

A fast, friendly tool for renaming many files at once using patterns.<br>
No installs. No uploads. No dependencies.

<br>

![HTML5](https://img.shields.io/badge/HTML5-2a55f5?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-2a55f5?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-2a55f5?style=for-the-badge&logo=javascript&logoColor=white)
![Dependencies](https://img.shields.io/badge/dependencies-0-0f7a55?style=for-the-badge)
![Privacy](https://img.shields.io/badge/files-stay%20in%20your%20browser-142033?style=for-the-badge)

</div>

<br>

## 🎯 What it does

Drop in a pile of files and rename them all in one go. Every change shows up in a live preview before anything is downloaded, and the exact part of each name that changed is highlighted.

## 🧩 Features

| | Feature | Details |
|---|---|---|
| 🏷️ | **Name patterns** | Build names with tokens like `{name}`, `{n}`, `{date}` and `{modified}` |
| 🔍 | **Find and replace** | Plain text or full regular expressions, with optional match-case |
| 🔡 | **Letter case** | Keep as is, lowercase, UPPERCASE, Title Case, kebab-case or snake_case |
| 🔢 | **Smart numbering** | Choose the start number, step and number of digits |
| 👀 | **Live preview** | Changes appear instantly, with the changed part highlighted |
| 🚨 | **Conflict warnings** | Duplicate or empty names turn red and block the download |
| 📦 | **One-click ZIP** | All renamed files download together in a single ZIP |
| 📋 | **Copy name list** | Copy every `old -> new` pair to your clipboard |
| 🌗 | **Dark mode** | Follows your system theme automatically |
| 📱 | **Responsive** | Works on desktop, tablet and phone |
| ♿ | **Accessible** | Keyboard friendly, visible focus states, respects reduced motion |

## 🚀 Quick start

1. Keep `index.html`, `style.css` and `script.js` together in one folder.
2. Open `index.html` in any modern browser.
3. Drop your files onto the page, adjust the rules, and click **Download renamed files**.

That's it. There is nothing to build or install.

## 🏷️ Pattern tokens

| Token | Becomes | Example |
|---|---|---|
| `{name}` | The original name, without the extension | `beach` |
| `{n}` | A running number, using your numbering settings | `01`, `02`, `03` |
| `{date}` | Today's date as `YYYY-MM-DD` | `2026-09-30` |
| `{modified}` | The file's last-modified date as `YYYY-MM-DD` | `2026-08-14` |

## 💡 Recipes

| Goal | Pattern | Find / Replace | Case | Result |
|---|---|---|---|---|
| Number a set of photos | `Holiday-{n}-{name}` | | Keep | `beach.jpg` becomes `Holiday-01-beach.jpg` |
| Swap a camera prefix | `{name}` | `IMG_` with `Paris-` | Keep | `IMG_4021.jpg` becomes `Paris-4021.jpg` |
| Tidy messy names | `{name}` | | kebab-case | `Summer Trip 01.jpg` becomes `summer-trip-01.jpg` |
| Date-stamp documents | `{date}_{name}` | | Keep | `report.pdf` becomes `2026-09-30_report.pdf` |
| Replace spaces (regex) | `{name}` | `\s+` with `-` | Keep | `my new file.txt` becomes `my-new-file.txt` |
| Rearrange with capture groups | `{name}` | `(\d+)` with `photo-$1` | Keep | `4021.jpg` becomes `photo-4021.jpg` |

> **Tip:** Numbers follow the order of the list. Use **Sort A to Z** first if you want `{n}` to run alphabetically.

## 🛡️ Safety checks

- Characters that aren't allowed in file names (`\ / : * ? " < > |`) are removed automatically.
- Names are compared without regard to upper or lower case, like most file systems, so `Photo.jpg` and `photo.jpg` count as a clash.
- The download button stays disabled until every name is valid and unique.

## 🗂️ Project structure

```
file-renamer/
├── index.html    # Page structure
├── style.css     # Design, layout, dark mode
├── script.js     # Renaming logic and ZIP builder
└── README.md     # You are here
```

## ⚠️ Good to know

- A web page can't rename files directly on your disk, so you get **renamed copies** in a ZIP. Your originals stay untouched.
- The ZIP is created in memory, so very large batches (several GB) may be slow or fail. Split huge jobs into smaller groups.

## 🎨 Customizing

The look is controlled by CSS variables at the top of `style.css`:

```css
:root {
  --accent: #2a55f5;   /* buttons, chips, focus rings */
  --bg:     #e9eef5;   /* page background */
  --surface:#ffffff;   /* cards and panels */
  --ink:    #142033;   /* main text */
}
```

Change these and the whole interface follows, including the dark-mode set inside the `prefers-color-scheme: dark` block.

<br>

<div align="center">

---

&copy; 2026 [**Ethereal Studios**](https://builtbyethereal.com/). All rights reserved.

</div>
