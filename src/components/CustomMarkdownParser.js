// Custom Markdown Parser - Matches Portfolio Implementation
// Based on Portfolio/renderingEngine.js MarkdownParser class

class CustomMarkdownParser {
    constructor() {
        // The order of these rules is important.
        // Block elements are processed first.
        this.rules = [
            // Code blocks (```...```) - Must be first to preserve content
            {
                pattern: /```(\w+)?\n?([\s\S]*?)```/g,
                replacement: (_, language, code) => {
                    const cleanCode = code.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    const langClass = language ? ` class="language-${language}"` : '';
                    return `<pre><code${langClass}>${cleanCode}</code></pre>`;
                }
            },
            // Headings
            { pattern: /^### (.*$)/gim, replacement: '<h3>$1</h3>' },
            { pattern: /^## (.*$)/gim, replacement: '<h2>$1</h2>' },
            { pattern: /^# (.*$)/gim, replacement: '<h1>$1</h1>' },
            // Blockquotes
            { pattern: /^> (.*$)/gim, replacement: '<blockquote>$1</blockquote>' },
            // Images - handle relative paths and width attributes
            {
                pattern: /!\[([^\]]*)\]\(([^)]+?)(?:\s+"([^"]*)")?\)/g,
                replacement: (_, alt, src, title) => {
                    // Handle relative paths that start with ../
                    const imageSrc = src.startsWith('../') ? src.substring(3) : src;

                    // Check if title contains width specification (e.g., "width:300px" or "w:50%")
                    let widthStyle = '';
                    let actualTitle = title || '';

                    if (title) {
                        const widthMatch = title.match(/(?:width|w):([^;]+)/i);
                        if (widthMatch) {
                            const width = widthMatch[1].trim();
                            widthStyle = ` style="width: ${width}; max-width: ${width}; display: inline-block;"`;
                            // Remove width specification from title
                            actualTitle = title.replace(/(?:width|w):[^;]+;?/gi, '').trim();
                        }
                    }

                    const titleAttr = actualTitle ? ` title="${actualTitle}"` : '';
                    return `<img src="${imageSrc}" alt="${alt}" class="blog-image"${widthStyle}${titleAttr}/>`;
                }
            },
            // Images with width attribute syntax: ![alt](src){width:300px}
            {
                pattern: /!\[([^\]]*)\]\(([^)]+)\)\{([^}]+)\}/g,
                replacement: (_, alt, src, attributes) => {
                    // Handle relative paths that start with ../
                    const imageSrc = src.startsWith('../') ? src.substring(3) : src;

                    // Parse attributes
                    let widthStyle = '';
                    const widthMatch = attributes.match(/(?:width|w):([^;,]+)/i);
                    if (widthMatch) {
                        const width = widthMatch[1].trim();
                        widthStyle = ` style="width: ${width}; max-width: ${width}; display: inline-block;"`;
                    }

                    return `<img src="${imageSrc}" alt="${alt}" class="blog-image"${widthStyle}/>`;
                }
            },
            // Links -> converted to glass buttons
            { pattern: /\[([^\]]+)\]\(([^)]+)\)/g, replacement: '<a href="$2" target="_blank" class="glass-button blog-link">$1</a>' },
            // Horizontal rules
            { pattern: /^---$/gm, replacement: '<hr>' },
            { pattern: /^\*\*\*$/gm, replacement: '<hr>' },
            // Unordered lists (• and -)
            { pattern: /^[•\*-] (.*$)/gim, replacement: '<li>$1</li>' },
            // Ordered lists
            { pattern: /^\d+\. (.*$)/gim, replacement: '<li>$1</li>' },
            // Inline elements
            { pattern: /\*\*(.*?)\*\*/g, replacement: '<strong>$1</strong>' },
            { pattern: /__(.*?)__/g, replacement: '<strong>$1</strong>' },
            { pattern: /\*([^*]+)\*/g, replacement: '<em>$1</em>' },
            { pattern: /_([^_]+)_/g, replacement: '<em>$1</em>' },
            { pattern: /~~(.*?)~~/g, replacement: '<del>$1</del>' },
            { pattern: /==(.*?)==/g, replacement: '<mark>$1</mark>' },
            { pattern: /`([^`]+)`/g, replacement: '<code>$1</code>' },
        ];
    }

    parse(markdown) {
        if (!markdown) return '';

        // Remove metadata/frontmatter (content between --- at the beginning)
        let html = markdown.trim();
        const metadataRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
        html = html.replace(metadataRegex, '');
        
        html = '\n' + html.trim() + '\n';

        // Apply rules
        this.rules.forEach(rule => {
            if (typeof rule.replacement === 'function') {
                html = html.replace(rule.pattern, rule.replacement);
            } else {
                html = html.replace(rule.pattern, rule.replacement);
            }
        });

        // Consolidate multi-line blockquotes
        html = html.replace(/<\/blockquote>\s*<blockquote>/g, '<br>');

        // Wrap list items in proper list containers
        // First, handle ordered lists (they have numbers)
        html = html.replace(/((?:<li>\d+\..*?<\/li>\s*)+)/gs, (match) => {
            const cleanMatch = match.replace(/<li>\d+\.\s*/g, '<li>');
            return `<ol>\n${cleanMatch}</ol>\n`;
        });

        // Then handle unordered lists (remaining <li> elements)
        html = html.replace(/((?:<li>(?!\d+\.).*?<\/li>\s*)+)/gs, (match) => {
            return `<ul>\n${match}</ul>\n`;
        });

        // Clean up adjacent lists of the same type
        html = html.replace(/<\/ul>\s*<ul>/g, '');
        html = html.replace(/<\/ol>\s*<ol>/g, '');

        // Handle multiple images on the same line (wrap in image-row div)
        html = html.replace(/(<img[^>]*class="blog-image"[^>]*\/?>)(\s*)(<img[^>]*class="blog-image"[^>]*\/?>)/g,
            (match, img1, _, img2) => {
                // Check if there are more images following
                const remainingHtml = html.substring(html.indexOf(match) + match.length);
                const nextImgMatch = remainingHtml.match(/^\s*(<img[^>]*class="blog-image"[^>]*\/?>)/);

                if (nextImgMatch) {
                    return `<div class="image-row">${img1}${img2}`;
                } else {
                    return `<div class="image-row">${img1}${img2}</div>`;
                }
            });

        // Close any unclosed image-row divs
        html = html.replace(/<div class="image-row">([^<]*(?:<img[^>]*>[^<]*)*)<img[^>]*class="blog-image"[^>]*\/?>(?!\s*<img)/g,
            (match) => match + '</div>');

        // Paragraphs and cleanup
        // Split into paragraphs based on double line breaks
        let paragraphs = html.trim().split(/\n{2,}/);

        html = paragraphs.map(p => {
            p = p.trim();
            if (!p) return '';

            // If the chunk is already a block-level element, don't wrap it in <p>
            if (p.match(/^\s*<(h[1-6]|ul|ol|li|blockquote|pre|hr|img|div)/)) {
                return p;
            }
            // Skip if it's just a closing tag
            if (p.match(/^\s*<\/(h[1-6]|ul|ol|li|blockquote|pre|hr|img|div)/)) {
                return p;
            }
            // Otherwise, wrap it in a <p> tag and handle single line breaks inside it
            return `<p>${p.replace(/\n/g, '<br>')}</p>`;
        }).filter(p => p).join('\n\n');

        // Final cleanup of paragraphs around block elements which might have been missed
        html = html.replace(/<p>\s*<(h[1-6]|ul|ol|blockquote|pre|hr|img|div)/g, '<$1');
        html = html.replace(/<\/(h[1-6]|ul|ol|blockquote|pre|hr|img|div)>\s*<\/p>/g, '</$1>');
        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/\n{3,}/g, '\n\n');

        return html;
    }
}

export default CustomMarkdownParser;