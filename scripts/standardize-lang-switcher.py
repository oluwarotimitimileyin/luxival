#!/usr/bin/env python3
"""Replace all <select id="lang-select"> language switchers with <button id="lang-toggle">."""

import os
import glob

REPLACEMENTS = {
    # (has_label_close, is_minified, is_amp) -> replacement_html
    (True, False, False): '''      <button class="lang-trigger neon-btn" aria-label="Change language" id="lang-toggle">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.4 3.8 5.4 3.8 9S14.5 18.6 12 21"/><path d="M12 3c-2.5 2.4-3.8 5.4-3.8 9s1.3 6.6 3.8 9"/></svg>
      </button>''',
    (True, True, False): '<button class="lang-trigger neon-btn" aria-label="Change language" id="lang-toggle"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.4 3.8 5.4 3.8 9S14.5 18.6 12 21"/><path d="M12 3c-2.5 2.4-3.8 5.4-3.8 9s1.3 6.6 3.8 9"/></svg></button>',
    (True, True, True): '<button class="lang-trigger neon-btn" aria-label="Change language" id="lang-toggle"><svg viewbox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18"></path><path d="M12 3c2.5 2.4 3.8 5.4 3.8 9S14.5 18.6 12 21"></path><path d="M12 3c-2.5 2.4-3.8 5.4-3.8 9s1.3 6.6 3.8 9"></path></svg></button>',
    # Without </label> — only minified
    (False, True, False): '<button class="lang-trigger neon-btn" aria-label="Change language" id="lang-toggle"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.4 3.8 5.4 3.8 9S14.5 18.6 12 21"/><path d="M12 3c-2.5 2.4-3.8 5.4-3.8 9s1.3 6.6 3.8 9"/></svg></button>',
}


def find_block(content, select_pos):
    """Find the <label...> block wrapping the select. Returns (start, end) or None."""
    # Search backward for <label 
    search_from = select_pos
    while search_from >= 0:
        label_start = content.rfind('<label ', 0, search_from)
        if label_start == -1:
            return None
        
        # Look for </label> after the select
        select_end = content.find('</select>', select_pos)
        if select_end == -1:
            return None
        select_end += len('</select>')
        
        # Check for </label> somewhere after the select
        after_select = content[select_end:]
        label_close = after_select.find('</label>')
        
        if label_close != -1:
            # Found </label> — the block is <label ...> ... </label>
            block_end = select_end + label_close + len('</label>')
        else:
            # No </label> — the block ends after </select> (next line whitespace + closing li/ul)
            block_end = select_end
        
        # Verify this label actually wraps our select
        if block_end > select_pos:
            return (label_start, block_end)
        
        search_from = label_start - 1
    return None


root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
count = 0

for ext in ('**/*.html', '**/*.njk'):
    for fpath in glob.glob(os.path.join(root, ext), recursive=True):
        rel = os.path.relpath(fpath, root)
        if rel.startswith('_site/') or rel.startswith('node_modules/'):
            continue
        with open(fpath, 'r') as f:
            content = f.read()
        if 'lang-select' not in content:
            continue
        
        new_content = content
        while True:
            select_pos = new_content.find('<select id="lang-select"')
            if select_pos == -1:
                select_pos = new_content.find('<select aria-label="Select language" id="lang-select"')
            if select_pos == -1:
                break
            
            result = find_block(new_content, select_pos)
            if result is None:
                print(f'  ERROR: Could not find label wrapper in {rel}')
                break
            block_start, block_end = result
            block = new_content[block_start:block_end]
            
            has_close = '</label>' in block
            is_minified = '\n' not in block.strip()[:100]
            is_amp = 'viewbox' in block
            
            replacement = REPLACEMENTS[(has_close, is_minified, is_amp)]
            new_content = new_content[:block_start] + replacement + new_content[block_end:]
        
        if new_content != content:
            with open(fpath, 'w') as f:
                f.write(new_content)
            print(f'  Updated: {rel}')
            count += 1

print(f'\nDone. {count} files updated.')
