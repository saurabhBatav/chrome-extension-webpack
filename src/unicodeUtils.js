async function convertMarkdownToUnicode(markdown) {
  try {
    const html = markdownToHtml(markdown);
    const unicodeText = htmlToUnicode(html);
    return unicodeText;
  } catch (error) {
    throw new Error('Error converting markdown to unicode: ' + error.message);
  }
}
function markdownToHtml(markdown) {
  try {
    // Replace Markdown elements with HTML equivalents
    const replacements = [
      { regex: /(\*\*(.*?)\*\*)/g, replacement: '<b>$2</b>' }, // Bold text
      { regex: /(\*(.*?)\*)/g, replacement: '<i>$2</i>' }, // Italic text
      { regex: /### (.*?)(\n\n|$)/g, replacement: '<h3>$1</h3>\n\n' }, // Header 3
      { regex: /## (.*?)(\n\n|$)/g, replacement: '<h2>$1</h2>\n\n' }, // Header 2
      { regex: /# (.*?)(\n\n|$)/g, replacement: '<h1>$1</h1>\n\n' }, // Header 1
      { regex: /- (.*?)(\n|$)/g, replacement: '• $1\n' }, // Bullet points
    ];

    let html = markdown;

    replacements.forEach(({ regex, replacement }) => {
      html = html.replace(regex, replacement);
    });

    return html;
  } catch (error) {
    throw new Error('Error converting markdown to html: ' + error.message);
  }
}
function htmlToUnicode(html) {
  try {
    let unicodeText = '';

    // Convert HTML to Unicode-styled text
    unicodeText = html.replace(/<b>(.*?)<\/b>/g, (match, p1) =>
      convertToUnicode(p1, 'bold'),
    );
    unicodeText = unicodeText.replace(/<i>(.*?)<\/i>/g, (match, p1) =>
      convertToUnicode(p1, 'italic'),
    );
    unicodeText = unicodeText.replace(
      /<h1>(.*?)<\/h1>/g,
      (match, p1) => `${convertToUnicode(p1.trim(), 'bold')}\n\n`,
    );
    unicodeText = unicodeText.replace(
      /<h2>(.*?)<\/h2>/g,
      (match, p1) => `${convertToUnicode(p1.trim(), 'bold')}\n\n`,
    );
    unicodeText = unicodeText.replace(
      /<h3>(.*?)<\/h3>/g,
      (match, p1) => `${convertToUnicode(p1.trim(), 'bold')}\n\n`,
    );
    unicodeText = unicodeText.replace(/• /g, '• '); // Ensure proper formatting for bullet points

    return unicodeText;
  } catch (error) {
    throw new Error('Error converting html to unicode: ' + error.message);
  }
}
function formatText(command) {
  try {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);

    if (command === 'bold') {
      applyStyle(range, 'strong');
    } else if (command === 'italic') {
      applyStyle(range, 'em');
    } else if (command === 'underline') {
      applyStyle(range, 'u');
    } else if (command === 'insertOrderedList') {
      toggleList(selection, 'ol');
    } else if (command === 'insertUnorderedList') {
      toggleList(selection, 'ul');
    }
  } catch (error) {
    throw new Error('Error formatting text: ' + error.message);
  }
}

function applyStyle(range, tag) {
  try {
    const selectedText = range.toString();
    const parentElement =
      range.commonAncestorContainer.nodeType === 1
        ? range.commonAncestorContainer
        : range.commonAncestorContainer.parentElement;

    const styledNode = document.createElement(tag);
    styledNode.textContent = selectedText;

    range.deleteContents();
    range.insertNode(styledNode);
  } catch (error) {
    throw new Error('Error applying style: ' + error.message);
  }
}
function toggleList(selection, listType) {
  try {
    const range = selection.getRangeAt(0);
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;

    const startList = findAncestorList(startContainer, listType);
    const endList = findAncestorList(endContainer, listType);

    if (startList || endList) {
      // Remove the list(s)
      const lists = new Set();
      for (let i = 0; i < selection.rangeCount; i++) {
        const range = selection.getRangeAt(i);
        const ancestor = findAncestorList(
          range.commonAncestorContainer,
          listType,
        );
        if (ancestor) {
          lists.add(ancestor);
        }
      }

      lists.forEach((list) => {
        const listItems = Array.from(list.querySelectorAll('li'));
        listItems.forEach((item, index) => {
          const textNode = document.createTextNode(item.textContent);
          list.parentNode.insertBefore(textNode, list);

          // Insert a newline character after each item except the last one
          if (index < listItems.length - 1) {
            list.parentNode.insertBefore(document.createTextNode('\n'), list);
          }
        });
        list.remove();
      });
    } else {
      // Add the list
      const list = document.createElement(listType);
      const lines = range.toString().split('\n');
      lines.forEach((line) => {
        const listItem = document.createElement('li');
        listItem.textContent = line;
        list.appendChild(listItem);
      });

      range.deleteContents();
      range.insertNode(list);

      // Move the cursor to the end of the list
      const lastListItem = list.lastElementChild;
      const lastTextNode = lastListItem.lastChild;
      const newRange = document.createRange();
      newRange.setStart(lastTextNode, lastTextNode.length);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
  } catch (error) {
    throw new Error('Error toggling list: ' + error.message);
  }
}
// function toggleList(selection, listType) {
//   const range = selection.getRangeAt(0);
//   const startContainer = range.startContainer;
//   const endContainer = range.endContainer;

//   const startList = findAncestorList(startContainer, listType);
//   const endList = findAncestorList(endContainer, listType);

//   if (startList || endList) {
//     // Remove the list(s)
//     const lists = new Set();
//     for (let i = 0; i < selection.rangeCount; i++) {
//       const range = selection.getRangeAt(i);
//       const ancestor = findAncestorList(
//         range.commonAncestorContainer,
//         listType,
//       );
//       if (ancestor) {
//         lists.add(ancestor);
//       }
//     }

//     lists.forEach((list) => {
//       const listItems = Array.from(list.querySelectorAll('li'));
//       listItems.forEach((item, index) => {
//         const textNode = document.createTextNode(item.textContent);
//         if (index > 0)
//           list.parentNode.insertBefore(document.createElement('br'), list);
//         list.parentNode.insertBefore(textNode, list);
//       });
//       list.remove();
//     });
//   } else {
//     // Add the list
//     const list = document.createElement(listType);
//     const lines = range.toString().split('\n');
//     lines.forEach((line) => {
//       const listItem = document.createElement('li');
//       listItem.textContent = line;
//       list.appendChild(listItem);
//     });

//     range.deleteContents();
//     range.insertNode(list);
//   }
// }

function findAncestorList(element, listType) {
  try {
    while (element) {
      if (element.tagName && element.tagName.toLowerCase() === listType) {
        return element;
      }
      element = element.parentElement;
    }
    return null;
  } catch (error) {
    console.log(error);
  }
}

// Function to insert a link
function insertLink(url) {
  try {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const linkElement = document.createElement('a');
      linkElement.href = url;
      linkElement.textContent = url; // or use selection.toString() to use the selected text
      range.deleteContents(); // Remove the selected text
      range.insertNode(linkElement); // Insert the new link element
    }
  } catch (error) {
    console.log(error);
  }
}

function convertToUnicode(text, style = 'regular') {
  const fancyStyles = {
    regular: {
      a: '𝚊',
      b: '𝚋',
      c: '𝚌',
      d: '𝚍',
      e: '𝚎',
      f: '𝚏',
      g: '𝚐',
      h: '𝚑',
      i: '𝚒',
      j: '𝚓',
      k: '𝚔',
      l: '𝚕',
      m: '𝚖',
      n: '𝚗',
      o: '𝚘',
      p: '𝚙',
      q: '𝚚',
      r: '𝚛',
      s: '𝚜',
      t: '𝚝',
      u: '𝚞',
      v: '𝚟',
      w: '𝚠',
      x: '𝚡',
      y: '𝚢',
      z: '𝚣',
      A: '𝙰',
      B: '𝙱',
      C: '𝙲',
      D: '𝙳',
      E: '𝙴',
      F: '𝙵',
      G: '𝙶',
      H: '𝙷',
      I: '𝙸',
      J: '𝙹',
      K: '𝙺',
      L: '𝙻',
      M: '𝙼',
      N: '𝙽',
      O: '𝙾',
      P: '𝙿',
      Q: '𝚀',
      R: '𝚁',
      S: '𝚂',
      T: '𝚃',
      U: '𝚄',
      V: '𝚅',
      W: '𝚆',
      X: '𝚇',
      Y: '𝚈',
      Z: '𝚉',
    },
    bold: {
      a: '𝗮',
      b: '𝗯',
      c: '𝗰',
      d: '𝗱',
      e: '𝗲',
      f: '𝗳',
      g: '𝗴',
      h: '𝗵',
      i: '𝗶',
      j: '𝗷',
      k: '𝗸',
      l: '𝗹',
      m: '𝗺',
      n: '𝗻',
      o: '𝗼',
      p: '𝗽',
      q: '𝗾',
      r: '𝗿',
      s: '𝘀',
      t: '𝘁',
      u: '𝘂',
      v: '𝘃',
      w: '𝘄',
      x: '𝘅',
      y: '𝘆',
      z: '𝘇',
      A: '𝗔',
      B: '𝗕',
      C: '𝗖',
      D: '𝗗',
      E: '𝗘',
      F: '𝗙',
      G: '𝗚',
      H: '𝗛',
      I: '𝗜',
      J: '𝗝',
      K: '𝗞',
      L: '𝗟',
      M: '𝗠',
      N: '𝗡',
      O: '𝗢',
      P: '𝗣',
      Q: '𝗤',
      R: '𝗥',
      S: '𝗦',
      T: '𝗧',
      U: '𝗨',
      V: '𝗩',
      W: '𝗪',
      X: '𝗫',
      Y: '𝗬',
      Z: '𝗭',
    },
    italic: {
      a: '𝘢',
      b: '𝘣',
      c: '𝘤',
      d: '𝘥',
      e: '𝘦',
      f: '𝘧',
      g: '𝘨',
      h: '𝘩',
      i: '𝘪',
      j: '𝘫',
      k: '𝘬',
      l: '𝘭',
      m: '𝘮',
      n: '𝘯',
      o: '𝘰',
      p: '𝘱',
      q: '𝘲',
      r: '𝘳',
      s: '𝘴',
      t: '𝘵',
      u: '𝘶',
      v: '𝘷',
      w: '𝘸',
      x: '𝘹',
      y: '𝘺',
      z: '𝘻',
      A: '𝘈',
      B: '𝘉',
      C: '𝘊',
      D: '𝘋',
      E: '𝘌',
      F: '𝘍',
      G: '𝘎',
      H: '𝘏',
      I: '𝘐',
      J: '𝘑',
      K: '𝘒',
      L: '𝘓',
      M: '𝘔',
      N: '𝘕',
      O: '𝘖',
      P: '𝘗',
      Q: '𝘘',
      R: '𝘙',
      S: '𝘚',
      T: '𝘛',
      U: '𝘜',
      V: '𝘝',
      W: '𝘞',
      X: '𝘟',
      Y: '𝘠',
      Z: '𝘡',
    },
  };

  const styleSet = fancyStyles[style] || fancyStyles['regular'];
  return text
    .split('')
    .map((char) => styleSet[char] || char)
    .join('');
}

export { convertMarkdownToUnicode, htmlToUnicode, insertLink, formatText };
