function renderMarkdown(markdownText) {
  // Bold
  markdownText = markdownText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Italic
  markdownText = markdownText.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Headers
  markdownText = markdownText.replace(/^# (.*$)/gm, '<h1>$1</h1>');
  markdownText = markdownText.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  markdownText = markdownText.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  markdownText = markdownText.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
  markdownText = markdownText.replace(/^##### (.*$)/gm, '<h5>$1</h5>');
  markdownText = markdownText.replace(/^###### (.*$)/gm, '<h6>$1</h6>');

  // Code blocks
  markdownText = markdownText.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

  // Inline code
  markdownText = markdownText.replace(/`(.*?)`/g, '<code>$1</code>');

  // Paragraphs
  markdownText = markdownText.replace(/^\s*\n\s*\n/gm, '</p><p>');
  markdownText = '<p>' + markdownText + '</p>';

  // Blockquote
  markdownText = markdownText.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');

  // Quotations
  markdownText = markdownText.replace(/"(.*?)"/g, '<span style="color: #6495ED;">"$1"</span>');

  // Unordered Lists
  markdownText = markdownText.replace(/^- (.*$)/gm, '<ul><li>$1</li></ul>');

  // Ordered Lists
  markdownText = markdownText.replace(/^\d+\. (.*$)/gm, '<ol><li>$1</li></ol>');

  // Underline
  markdownText = markdownText.replace(/__(.+?)__/g, '<u>$1</u>');

  // Strikethrough
  markdownText = markdownText.replace(/~~(.+?)~~/g, '<s>$1</s>');

  // Horizontal Rule
  markdownText = markdownText.replace(/^---$/gm, '<hr>');

  // Images
  markdownText = markdownText.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">');

  // Links
  markdownText = markdownText.replace(/\[(.*?)\]\((.*?)\)/g, function(match, text, url) {
    const encodedUrl = encodeURI(url);
    return `<a href="${encodedUrl}">${text}</a>`;
  });

  return markdownText;
}

export { renderMarkdown };