#!/usr/bin/env python3
"""Switch ritual headings (only) in the Cung Duong panel to a bolder serif."""
from pathlib import Path
import re
import sys

root = Path(__file__).resolve().parent
panel = root / 'src/components/ui/BuddhistGiftPanel.tsx'
css = root / 'src/index.css'
html = root / 'index.html'
for file in (panel, css, html):
    if not file.is_file():
        sys.exit(f'KHONG tim thay {file.name}. Giai nen ZIP vao thu muc Chua_Online_3D.')

source = panel.read_text(encoding='utf-8')
# Update the single text element rendering a ritual's ceremonyTitle. Keep other classes/geometry untouched.
pat = re.compile(r'(<(?:p|span)\b[^>]*\bclassName=")([^"\n]+)("[^>]*>\s*\{item\.ceremonyTitle\})', re.MULTILINE)
match = pat.search(source)
if not match:
    sys.exit('KHONG tim thay item.ceremonyTitle, chua sua file nao.')
classes = match.group(2)
classes = re.sub(r'(?<![\w-])font-display(?![\w-])', 'font-offering-title', classes)
if 'font-offering-title' not in classes:
    classes += ' font-offering-title'
classes = re.sub(r'(?<![\w-])font-(?:medium|semibold|bold)(?![\w-])', 'font-extrabold', classes)
if 'font-extrabold' not in classes:
    classes += ' font-extrabold'
changed = source[:match.start(2)] + classes + source[match.end(2):]

css_text = css.read_text(encoding='utf-8')
marker = '/* CHUA_ONLINE_OFFERING_SERIF_BOLD */'
css_block = '''
/* CHUA_ONLINE_OFFERING_SERIF_BOLD */
/* Bold Vietnamese-capable serif for ritual titles only.
   The existing right-aligned coin columns and all layout dimensions stay unchanged. */
.font-offering-title {
  font-family: "Noto Serif", Georgia, "Times New Roman", serif;
  font-weight: 800;
  letter-spacing: -0.018em;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: auto;
  text-shadow: 0 0 0.22px currentColor;
}
'''
if marker not in css_text:
    css_text += css_block

html_text = html.read_text(encoding='utf-8')
font_href = 'https://fonts.googleapis.com/css2?family=Noto+Serif:wght@700;800&display=swap'
if 'family=Noto+Serif' not in html_text:
    if '</head>' not in html_text:
        sys.exit('Khong tim thay </head> trong index.html, chua sua file nao.')
    link = '    <link href="' + font_href.replace('&', '&amp;') + '" rel="stylesheet" />\n  </head>'
    html_text = html_text.replace('</head>', link, 1)

for file, data in ((panel, changed), (css, css_text), (html, html_text)):
    old = file.read_text(encoding='utf-8')
    if old != data:
        backup = file.with_name(file.name + '.before_offering_font.bak')
        if not backup.exists():
            backup.write_text(old, encoding='utf-8')
        file.write_text(data, encoding='utf-8')

print('OK - Da thay font ten nghi le: Noto Serif ExtraBold (800).')
print('OK - Giu nguyen font chu gia xu, kich thuoc, do rong bang va can le.')
print('OK - Co ban sao luu *before_offering_font.bak.')
