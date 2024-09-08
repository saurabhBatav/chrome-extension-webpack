import '../styles/popup.scss';
import { htmlToUnicode, formatText, insertLink } from './unicodeUtils.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import confetti from 'canvas-confetti';

document.addEventListener('DOMContentLoaded', function () {
  let originalPostData;
  const toggleCheckbox = document.getElementById('color_mode');
  const body = document.body;
  const linkInput = document.getElementById('linkInput');
  const postButton = document.getElementById('postButton');
  const postContainer = document.getElementById('postContainer');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const loadingBot = document.getElementById('bot');
  let logoImg = document.getElementById('logo');
  let currentFullContent = '';
  const pasteButton = document.getElementById('pasteButton');

  hideLoadingSpinner();

  pasteButton.addEventListener('click', async function () {
    try {
      // Ensure the document is focused
      if (!document.hasFocus()) {
        window.focus();
        linkInput.focus();
      }

      // Delay to ensure the focus is set properly
      setTimeout(async () => {
        try {
          const text = await navigator.clipboard.readText();
          linkInput.value = text;
        } catch (err) {
          console.error('Failed to read clipboard contents: ', err);
          showToast(
            'Failed to paste from clipboard, please try again',
            'error',
          );
        }
      }, 100); // Delay of 100ms to ensure focus
    } catch (err) {
      console.log('Failed to read clipboard contents: ', err);
      showToast('Failed to paste from clipboard, please try again', 'error');
    }
  });

  // Load the saved theme from local storage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    body.classList.add(
      savedTheme === 'dark' ? 'dark-preview' : 'white-preview',
    );
    logoImg.src =
      savedTheme === 'dark'
        ? '/images/dark-mode-logo.png'
        : '/images/light-mode-logo.png';
    toggleCheckbox.checked = savedTheme === 'dark';
  } else {
    body.classList.add('white-preview');
    logoImg.src = '/images/light-mode-logo.png';
  }

  // Toggle theme on checkbox change
  toggleCheckbox.addEventListener('change', function () {
    colorModePreview(this);
  });

  function colorModePreview(ele) {
    if (ele.checked) {
      body.classList.add('dark-preview');
      body.classList.remove('white-preview');
      localStorage.setItem('theme', 'dark');
      logoImg.src = '/images/dark-mode-logo.png';
    } else {
      body.classList.add('white-preview');
      body.classList.remove('dark-preview');
      localStorage.setItem('theme', 'light');
      logoImg.src = '/images/light-mode-logo.png';
    }
  }

  postButton.addEventListener('click', () => {
    const link = linkInput.value;
    if (link) {
      showLoadingSpinner();
      chrome.runtime.sendMessage({
        action: 'createPost',
        data: { url: link },
      });
    }
  });

  const copyButtonSVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14" id="Show-Layer--Streamline-Core"><desc>Show Layer Streamline Icon: https://streamlinehq.com</desc><g id="show-layer--show-layer-work"><path id="Vector" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M2.5 3H8c0.55228 0 1 0.44772 1 1v8.5c0 0.5523 -0.44772 1 -1 1H2.5c-0.55228 0 -1 -0.4477 -1 -1V4c0 -0.55228 0.44772 -1 1 -1Z" stroke-width="1.5"></path><path id="Vector_2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M9 11h2.5c0.2652 0 0.5196 -0.1054 0.7071 -0.2929S12.5 10.2652 12.5 10V1.5c0 -0.26522 -0.1054 -0.51957 -0.2929 -0.707107C12.0196 0.605357 11.7652 0.5 11.5 0.5H6c-0.26522 0 -0.51957 0.105357 -0.70711 0.292893C5.10536 0.98043 5 1.23478 5 1.5V3" stroke-width="1.5"></path></g></svg>`;
  const regenerateButtonSVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14" id="Line-Arrow-Synchronize-1--Streamline-Core"><desc>Line Arrow Synchronize 1 Streamline Icon: https://streamlinehq.com</desc><g id="line-arrow-synchronize-1--arrows-loading-load-sync-synchronize-arrow-reload"><path id="Vector" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M1.52173 3.5C2.6768 1.69584 4.6987 0.5 6.99991 0.5 10.5898 0.5 13.4999 3.41015 13.4999 7" stroke-width="1.5"></path><path id="Vector_2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M12.4782 10.5c-1.1551 1.8042 -3.17699 3 -5.4782 3C3.41015 13.5 0.5 10.5899 0.5 7" stroke-width="1.5"></path><path id="Vector 4482" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M1.5 1v2.5H4" stroke-width="1.5"></path><path id="Vector 4483" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M12.5 13v-2.5H10" stroke-width="1.5"></path></g></svg>`;
  const originalButtonSVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14" id="Ai-Sparkles--Streamline-Core"><desc>Ai Sparkles Streamline Icon: https://streamlinehq.com</desc><g id="ai-sparkles--artificial-intelligence-ai-sparks-sparkles"><path id="Vector 2140" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M1.20733 3.75067c-0.27644 -0.0489 -0.276441 -0.45244 0 -0.50134 1.0015 -0.17717 1.79806 -0.95285 2.01544 -1.96263l0.01666 -0.0774c0.05981 -0.27782 0.44883 -0.279549 0.51103 -0.00227l0.02023 0.0902c0.22543 1.00501 1.0222 1.77414 2.02092 1.95082 0.27785 0.04915 0.27785 0.45475 0 0.5039 -0.99872 0.17668 -1.79549 0.94581 -2.02092 1.95082l-0.02023 0.0902c-0.0622 0.27728 -0.45122 0.27555 -0.51103 -0.00227l-0.01666 -0.0774c-0.21738 -1.00977 -1.01394 -1.78546 -2.01544 -1.96263Z" stroke-width="1.5"></path><path id="Vector 2137" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M4.85246 9.17614c-0.46995 -0.08314 -0.46995 -0.76915 0 -0.85228 1.70256 -0.30119 3.0567 -1.61985 3.42625 -3.33646l0.02833 -0.13159c0.10167 -0.47229 0.76301 -0.47523 0.86874 -0.00386l0.03439 0.15335c0.38323 1.70851 1.73773 3.01603 3.43553 3.31638 0.4724 0.08357 0.4724 0.77307 0 0.85663 -1.6978 0.30036 -3.0523 1.60789 -3.43553 3.31639l-0.03439 0.1534c-0.10573 0.4713 -0.76707 0.4684 -0.86874 -0.0039l-0.02833 -0.1316c-0.36955 -1.7166 -1.72369 -3.03527 -3.42625 -3.33646Z" stroke-width="1.5"></path></g></svg>`;
  const editButtonSVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="-0.6 -0.6 14 14" id="Pencil-Line--Streamline-Core"><desc>Pencil Line Streamline Icon: https://streamlinehq.com</desc><g id="pencil-line--edit-edition-form-pen-text-write"><path id="Vector" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M0.9142857142857143 11.885714285714286h10.966125714285713" stroke-width="1.5"></path><path id="Vector_2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M5.483154285714286 9.565714285714286 2.741522285714286 10.057142857142857l0.4569325714285714 -2.766756571428571 6.150390857142857 -6.106889142857143c0.08493714285714285 -0.08530285714285714 0.18605714285714284 -0.15301485714285715 0.2974171428571428 -0.19921371428571427C9.757622857142856 0.9380754285714284 9.877028571428571 0.9142857142857143 9.997714285714286 0.9142857142857143c0.1205942857142857 0 0.24009142857142857 0.023789714285714286 0.3514514285714286 0.06999771428571429 0.11136 0.04619885714285714 0.21248 0.11391085714285715 0.2974171428571428 0.19921371428571427l0.9686857142857144 0.9647268571428571c0.08566857142857143 0.08460799999999999 0.15369142857142856 0.18526171428571428 0.20004571428571427 0.29617371428571426 0.046354285714285716 0.11090285714285715 0.07030857142857143 0.22986057142857144 0.07030857142857143 0.3500068571428571 0 0.1201462857142857 -0.023954285714285716 0.23910399999999998 -0.07030857142857143 0.3500068571428571 -0.046354285714285716 0.110912 -0.11437714285714284 0.21156571428571427 -0.20004571428571427 0.29617371428571426l-6.132114285714286 6.125129142857143Z" stroke-width="1.5"></path></g></svg>`;
  const startPostButtonSVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" id="Story-Post--Streamline-Sharp-Remix"><desc>Story Post Streamline Icon: https://streamlinehq.com</desc><g id="story-post"><path id="Union" fill="currentColor" fill-rule="evenodd" d="M21.5 12c0 -5.24671 -4.2533 -9.5 -9.5 -9.5V0c6.6274 0 12 5.37258 12 12 0 6.6274 -5.3726 12 -12 12 -6.62742 0 -12 -5.3726 -12 -12h2.5c0 5.2467 4.25329 9.5 9.5 9.5 5.2467 0 9.5 -4.2533 9.5 -9.5Zm-11.25 -1.75V6h3.5v4.25H18v3.5h-4.25V18h-3.5v-4.25H6v-3.5h4.25Zm-7.55977 -0.1513c0.1599 -0.78775 0.41733 -1.54 0.75929 -2.2439l-2.2487 -1.09242C0.768334 7.65264 0.442522 8.60462 0.240193 9.60136l2.450037 0.49734Zm3.61052 -5.70032c-0.71986 0.54071 -1.36057 1.18134 -1.90136 1.90113L2.40066 4.79782c0.6823 -0.90813 1.49042 -1.71616 2.39864 -2.39835l1.50145 1.99891Zm1.55395 -0.9489c0.70395 -0.342 1.45626 -0.59946 2.2441 -0.75938L9.60143 0.240071C8.6046 0.442416 7.65256 0.768264 6.76224 1.2008L7.8547 3.44948Z" clip-rule="evenodd" stroke-width="1"></path></g></svg>`;

  let undoStack = [];
  let redoStack = [];

  function saveState(postContent) {
    undoStack.push(postContent);
    redoStack = []; // Clear the redo stack
  }

  function undo(postContent) {
    if (undoStack.length > 0) {
      redoStack.push(postContent.innerHTML);
      const lastState = undoStack.pop();
      postContent.innerHTML = lastState;
    }
  }

  function redo(postContent) {
    if (redoStack.length > 0) {
      undoStack.push(postContent.innerHTML);
      const nextState = redoStack.pop();
      postContent.innerHTML = nextState;
    }
  }

  function createPostAction(iconSvg, tooltipText, buttonId) {
    const actionButton = document.createElement('a');
    actionButton.classList.add('post-action-tooltip');
    actionButton.classList.add('post-action-buttons');
    actionButton.id = buttonId;

    const actionSvg = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg',
    );
    actionSvg.setAttribute('width', '20px'); // Adjust width as needed
    actionSvg.setAttribute('height', '20px'); // Adjust height as needed
    actionSvg.innerHTML = iconSvg; // Set the SVG code
    actionButton.appendChild(actionSvg);

    // Create the tooltip text
    const tooltipSpan = document.createElement('span');
    tooltipSpan.classList.add('tooltip-text');
    tooltipSpan.textContent = tooltipText;
    actionButton.appendChild(tooltipSpan);

    return actionButton;
  }

  function copyContent(postId, elem) {
    const postElement = document.getElementById(postId);
    const contentDiv = postElement.querySelector('.post-content');
    const fullContent = contentDiv.dataset.currentFullContent;

    const tempTextArea = document.createElement('textarea');
    tempTextArea.innerHTML = fullContent;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextArea);
    console.log(elem);
    showToast('Content copied to clipboard!', 'success', elem);
  }

  function regenerateContent(postId) {
    debugger;
    const postElement = document.getElementById(postId);
    const contentDiv = postElement.querySelector('.post-content');

    //const fullContent = contentDiv.innerText;
    const fullContent = contentDiv.dataset.originalFullContent;

    console.log('Full Content: ' + fullContent);
    chrome.runtime.sendMessage({
      action: 'regenerateContent',
      data: { content: fullContent, postId: postId },
    });

    //alert('Content regenerated!');
  }

  async function startPost(postId) {
    const postElement = document.getElementById(postId);
    const contentDiv = postElement.querySelector('.post-content');
    const fullContent = await htmlToUnicode(contentDiv.innerHTML); //contentDiv.dataset.currentFullContent;
    // Create a temporary container to manipulate the content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = fullContent;

    // Remove specific span elements
    tempDiv.querySelectorAll('span').forEach((span) => {
      if (span.classList.contains('toggle-button')) {
        span.remove();
      }
    });

    // Get the cleaned HTML
    const cleanedContent = tempDiv.innerHTML;
    const documentTitle = contentDiv.dataset.docTitle;
    const documentUrl = contentDiv.dataset.docUrl;
    const mediaType = contentDiv.dataset.mediaType;

    console.log('sending data to content script', {
      content: cleanedContent,
      documentTitle: documentTitle,
      documentUrl: documentUrl,
      mediaType: mediaType,
    });

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'startPost',
        data: {
          content: fullContent,
          documentTitle: documentTitle,
          documentUrl: documentUrl,
          mediaType: mediaType,
        },
      });
    });
  }

  async function showOriginalContent(originalContent, postId) {
    const postElement = document.getElementById(postId);
    const contentDiv = postElement.querySelector('.post-content');
    const mediaDiv = postElement.querySelector('.media');
    const mediaHeight = mediaDiv.offsetHeight;
    originalContent = originalContent || contentDiv.dataset.originalFullContent;
    await modifyContentDiv(contentDiv, originalContent, mediaHeight); // Pass the originalContent;
    //   alert('Original Content: ' + originalContent);
  }

  async function modifyContentDiv(contentDiv, content, mediaHeight) {
    // Remove all existing child nodes from contentDiv
    while (contentDiv.firstChild) {
      contentDiv.removeChild(contentDiv.firstChild);
    }

    // Calculate the height of the collapsed content
    const mediaContainerHeight = 695; // Media container height
    const availableHeight = mediaContainerHeight - mediaHeight;

    // Process the content
    const firstQuoteIndex = content.indexOf('"');
    const lastQuoteIndex = content.lastIndexOf('"');
    const cleanContent = content
      .slice(firstQuoteIndex + 1, lastQuoteIndex)
      .trim();
    const formattedContent = cleanContent
      ? cleanContent.replace(/\n/g, '<br>')
      : '';

    // Store original full content in dataset attribute
    contentDiv.dataset.currentFullContent = content;

    // Set up the typewriter effect
    contentDiv.innerHTML = '';
    contentDiv.classList.add('expanded');
    contentDiv.style.overflow = 'hidden';
    contentDiv.style.height = `${availableHeight}px`;
    // contentDiv.style.maxHeight = `${availableHeight}px`;
    // contentDiv.style.height = 'auto';
    const contentSpan = document.createElement('span');
    contentSpan.id = 'content-span';
    contentDiv.appendChild(contentSpan);

    const toggleButton = document.createElement('span');
    toggleButton.classList.add('toggle-button');
    toggleButton.textContent = '  ...See more';
    contentDiv.appendChild(toggleButton);

    // Function to display content with typewriter effect
    async function typeWriter(html, element) {
      let i = 0;
      (function type() {
        if (i < html.length) {
          const char = html.charAt(i);
          if (char === '<') {
            const endTagIndex = html.indexOf('>', i);
            element.innerHTML += html.slice(i, endTagIndex + 1);
            i = endTagIndex + 1;
          } else {
            element.innerHTML += char;
            i++;
          }
          setTimeout(type, 3); // Adjust typing speed here
        }
      })();
    }

    // Start typewriter effect
    console.log('content to TYPE::::', content);
    typeWriter(content, contentSpan);

    // Event listener for toggleButton click
    toggleButton.addEventListener('click', toggleContentExpansion);

    // Event listener for contentDiv double-click
    contentDiv.addEventListener('dblclick', toggleContentExpansion);

    // Function to toggle the expansion of contentDiv
    function toggleContentExpansion() {
      const mediaContainer =
        document.getElementsByClassName('media-container')[0];
      if (contentDiv.classList.contains('expanded')) {
        contentDiv.classList.remove('expanded');
        toggleButton.textContent = '  ...See more';
        contentDiv.style.height = `${availableHeight}px`;
        contentDiv.style.overflow = 'hidden';
        mediaContainer.style.overflow = 'hidden';
      } else {
        contentDiv.classList.add('expanded');
        toggleButton.textContent = '  ...See less';
        contentDiv.style.height = 'auto';
        contentDiv.style.overflow = 'visible';
        mediaContainer.style.removeProperty('overflow');
        mediaContainer.style.overflowY = 'auto';
      }
    }
  }

  let postIdCounter = postContainer.childElementCount;
  /**
   * Function to display a new post in the popup
   * @param {Object} data - The post data to display
   * @param {string} data.content - The content of the post
   * @param {string} data.title - The title of the post
   * @param {string} data.url - The original URL of the post
   * @param {string} data.type - The type of media in the post (e.g. image, video, etc.)
   * @param {number} data.aspectRatio - The aspect ratio of the media in the post
   */
  async function displayPostData(data) {
    originalPostData = data;
    const postId = `post-${postIdCounter++}`;
    const postDiv = document.createElement('div');
    postDiv.classList.add('post');
    postDiv.id = postId;

    postDiv.draggable = true; // Make the post draggable

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('post-content');

    contentDiv.dataset.originalFullContent = data.content;

    const mediaContainer = document.createElement('div');
    mediaContainer.classList.add('media-container');

    const mediaDiv = document.createElement('div');
    mediaDiv.classList.add('media');
    const docAspectRatio = data.aspectRatio;

    let mediaHeight = 0;
    const mediaUrl = data.sharedUrl;
    const mediaTitle = data.headline;
    contentDiv.dataset.mediaType = data.type;
    contentDiv.dataset.docTitle = mediaTitle;
    contentDiv.dataset.docUrl = mediaUrl;

    if (mediaUrl) {
      if (mediaUrl.match(/\/dms\/image\//i)) {
        const mediaImage = document.createElement('img');
        mediaImage.src = mediaUrl;
        mediaImage.classList.add('responsive-media');
        mediaImage.onload = () => {
          const aspectRatio =
            mediaImage.naturalHeight / mediaImage.naturalWidth;
          mediaHeight = 271 * aspectRatio; // Calculate the height of the media
          mediaImage.parentElement.style.paddingTop = `${aspectRatio * 100}%`;
          modifyContentDiv(contentDiv, data.content, mediaImage.height);
        };
        const wrapperDiv = document.createElement('div');
        wrapperDiv.classList.add('media-wrapper');
        wrapperDiv.appendChild(mediaImage);
        mediaDiv.appendChild(wrapperDiv);
      } else if (mediaUrl.match(/(\.mp4|\.webm|\.ogg|playlist\/vid)/i)) {
        const mediaVideo = document.createElement('video');
        mediaVideo.src = mediaUrl;
        mediaVideo.controls = true;
        mediaVideo.classList.add('responsive-media');
        mediaVideo.onloadedmetadata = () => {
          const aspectRatio = mediaVideo.videoHeight / mediaVideo.videoWidth;
          mediaHeight = 271 * aspectRatio; // Calculate the height of the media
          mediaVideo.parentElement.style.paddingTop = `${aspectRatio * 100}%`;
          modifyContentDiv(contentDiv, data.content, mediaHeight);
        };
        const wrapperDiv = document.createElement('div');
        wrapperDiv.classList.add('media-wrapper');
        wrapperDiv.appendChild(mediaVideo);
        mediaDiv.appendChild(wrapperDiv);
      } else {
        const mediaIframe = document.createElement('iframe');
        mediaIframe.src = mediaUrl + '#view=fitH';
        mediaIframe.classList.add('responsive-media');
        const wrapperDiv = document.createElement('div');
        wrapperDiv.classList.add('media-wrapper');
        mediaHeight = docAspectRatio * 330;
        mediaIframe.onload = () => {
          const adjustedAspectRatio =
            docAspectRatio + 60 / mediaIframe.clientWidth;
          mediaHeight = adjustedAspectRatio * 271;
          wrapperDiv.style.paddingTop = `${adjustedAspectRatio * 100}%`;
        };
        wrapperDiv.appendChild(mediaIframe);
        mediaDiv.appendChild(wrapperDiv);
        modifyContentDiv(contentDiv, data.content, mediaHeight);
      }
    } else {
      modifyContentDiv(contentDiv, data.content, 0);
    }

    mediaContainer.appendChild(contentDiv);
    mediaContainer.appendChild(mediaDiv);

    const actionsDiv = document.createElement('div');
    actionsDiv.classList.add('post-actions');
    const copyAction = createPostAction(copyButtonSVG, 'Copy', 'copy-button');
    const regenerateAction = createPostAction(
      regenerateButtonSVG,
      'Regenerate',
      'regenerate-button',
    );
    const originalContentAction = createPostAction(
      originalButtonSVG,
      'Original Content',
      'original-button',
    );
    const editAction = createPostAction(editButtonSVG, 'Edit', 'edit-button');
    const startPostAction = createPostAction(
      startPostButtonSVG,
      'Start Post',
      'start-post-button',
    );

    actionsDiv.appendChild(copyAction);
    actionsDiv.appendChild(regenerateAction);
    actionsDiv.appendChild(originalContentAction);
    actionsDiv.appendChild(editAction);
    actionsDiv.appendChild(startPostAction);

    postDiv.appendChild(mediaContainer);
    postDiv.appendChild(actionsDiv);

    loadingBot.style.display = 'none';
    // Insert new post at the beginning of postContainer
    postDiv.classList.add('revealing');
    postContainer.insertBefore(postDiv, postContainer.firstChild);

    /// Insert new post at the beginning of postContainer
    if (postContainer.firstChild) {
      Array.from(postContainer.children).forEach((child) => {
        //only if the child doesn't have the 'revealing' class
        if (!child.classList.contains('revealing')) {
          child.classList.add('moving-down');
        }
      });
    }

    // Remove the 'moving-down' class after the animation ends
    setTimeout(() => {
      postDiv.classList.remove('revealing');
      Array.from(postContainer.children).forEach((child) => {
        child.classList.remove('moving-down');
      });
    }, 3500); // Match this duration with the animation duration

    // Add event listeners after appending post to DOM
    addEventListenersToButtons(postId);

    // Add drag event listeners
    addDragEventListeners(postDiv);

    // Add undo/redo listeners
    attachUndoRedoListeners(postId);
  }

  function attachUndoRedoListeners(postId) {
    const postElement = document.getElementById(postId);
    const postContent = postElement.querySelector('.post-content');

    if (!postContent) {
      console.error('No element with class "post-content" found.');
      return;
    }

    // Add input event listener to save state on changes
    postContent.addEventListener('input', () =>
      saveState(postContent.innerHTML),
    );

    // Add keyboard shortcuts for undo and redo
    document.addEventListener('keydown', (event) => {
      console.log('event:', event);
      if (event.ctrlKey && event.key === 'z') {
        event.preventDefault(); // Prevent default browser undo
        undo(postContent);
      } else if (event.ctrlKey && event.key === 'y') {
        event.preventDefault(); // Prevent default browser redo
        redo(postContent);
      }
    });
  }
  function addDragEventListeners(postDiv) {
    let startX;
    postDiv.addEventListener('dragstart', (e) => {
      startX = e.clientX;
      postDiv.classList.add('dragging');
    });

    postDiv.addEventListener('dragend', (e) => {
      postDiv.classList.remove('dragging');
      const endX = e.clientX;
      if (Math.abs(endX - startX) > 100) {
        // Adjust the value as needed for sensitivity
        postDiv.remove();
      }
    });
  }

  function addEventListenersToButtons(postId) {
    const postElement = document.getElementById(postId);
    console.log('postElement:', postElement);
    const copyButton = postElement.querySelector('#copy-button');
    const regenerateButton = postElement.querySelector('#regenerate-button');
    const originalButton = postElement.querySelector('#original-button');
    const editButton = postElement.querySelector('#edit-button');
    const startPostButton = postElement.querySelector('#start-post-button');

    copyButton.addEventListener('click', () => copyContent(postId, copyButton));
    regenerateButton.addEventListener('click', () => regenerateContent(postId));
    originalButton.addEventListener('click', () =>
      showOriginalContent('', postId),
    );
    editButton.addEventListener('click', () => showRichTextEditor(postId));

    startPostButton.addEventListener('click', () => startPost(postId));
  }
  //Listens messages from serviceWorker
  chrome.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      if (message.action === 'show_loading_spinner') {
        console.log('showing loading spinner');
        showLoadingSpinner();
        sendResponse({ message: 'Showing loading spinner' });
      } else if (message.action === 'setInputBoxValue') {
        const linkInput = document.getElementById('linkInput');
        linkInput.value = message.data;
        document.getElementById('postButton').click();
      } else if (message.action === 'showPostData') {
        hideLoadingSpinner();
        displayPostData(message.data);
      } else if (message.action === 'regenerateContent') {
        saveState(message.data.content);
        showOriginalContent(message.data.content, message.data.postId); // Display the regenerated content in the originalContentDiv
      } else if (message.action === 'errorWhileExtractingPost') {
        showToast('Error while extracting post. Please try again.', 'error');
        console.log(
          'Error while extracting post. Please try again message:',
          message,
        );
        showErrorPost(message.data);
      }
      return true; // This line is important to indicate that the response is asynchronous
    },
  );
  console.log('Listener set up.');

  function showLoadingSpinner() {
    //postContainer.innerHTML = '';
    loadingSpinner.style.display = 'flex';
  }

  function hideLoadingSpinner() {
    loadingSpinner.style.display = 'none';
  }

  // Listen for changes in the postContainer size
  const resizeObserver = new ResizeObserver((entries) => {
    for (let entry of entries) {
      const mediaElements = entry.target.querySelectorAll('.media iframe');
      mediaElements.forEach((mediaElement) => {
        mediaElement.style.height =
          entry.contentRect.width / mediaElement.style.aspectRatio + 'px';
      });
    }
  });

  resizeObserver.observe(postContainer);
  function isElementPresent(parentElement, childId) {
    return parentElement.querySelector(`#${childId}`) !== null;
  }
  async function showRichTextEditor(postId) {
    const postElement = document.getElementById(postId);

    const postContent = postElement.querySelector('.post-content');
    let editorContainer;
    if (!postContent) {
      console.error('No element with class "post-content" found.');
      return;
    }

    if (isElementPresent(postElement, 'editor-container')) {
      let editorContainer = postElement.querySelector('#editor-container');
      if (editorContainer.style.display === 'none') {
        showToast(
          'Editing mode enabled. You can now edit the content.',
          'info',
        );
        editorContainer.style.display = 'block';
        postContent.contentEditable = 'true';
        postContent.classList.add('editable');
        postElement.draggable = false;
      } else {
        showToast('Editing mode disabled.', 'info');
        editorContainer.style.display = 'none';
        postContent.contentEditable = 'false';
        postContent.classList.remove('editable');
        postElement.draggable = true;
      }
    } else {
      showToast('Editing mode enabled. You can now edit the content.', 'info');
      postElement.draggable = false;
      // Create editor elements
      editorContainer = document.createElement('div');
      editorContainer.id = 'editor-container';

      // Create the toolbar
      const toolbar = document.createElement('div');
      toolbar.classList.add('toolbar');
      const tools = [
        { command: 'bold', icon: 'fas fa-bold' },
        { command: 'italic', icon: 'fas fa-italic' },
        { command: 'underline', icon: 'fas fa-underline' },
        { command: 'insertOrderedList', icon: 'fas fa-list-ol' },
        { command: 'insertUnorderedList', icon: 'fas fa-list-ul' },
        { command: 'createlink', icon: 'fas fa-link' },
        { command: 'closeEditor', icon: 'fas fa-xmark' },
      ];
      tools.forEach((tool) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.command = tool.command;
        button.classList.add('tool--btn');
        if (tool.command === 'closeEditor') {
          button.classList.add('close-editor--btn');
        }
        button.innerHTML = `<i class="${tool.icon}"></i>`;
        toolbar.appendChild(button);
      });

      // Append toolbar to container
      editorContainer.appendChild(toolbar);
      const buttons = editorContainer.querySelectorAll('.tool--btn');
      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const cmd = btn.dataset.command;

          if (cmd === 'createlink') {
            const url = prompt('Enter the link here: ', 'http://');
            if (url) {
              insertLink(url);
            }
          } else if (cmd === 'closeEditor') {
            showToast('Editing mode disabled.', 'info');
            editorContainer.style.display = 'none';
            postContent.contentEditable = 'false';
            postContent.classList.remove('editable');
          } else {
            formatText(cmd);
          }
        });
      });

      postElement.insertBefore(editorContainer, postElement.firstChild);

      postContent.contentEditable = 'true';
      postContent.classList.add('editable');

      // Example of additional setup: Adding animations or styles
      editorContainer.classList.add('revealing');
      setTimeout(() => {
        editorContainer.classList.remove('revealing');
      }, 3500); // Adjust duration as needed
    }
  }

  /**
   * Displays a toast message with the given message, type, and optional button.
   * If the type is 'success', confetti is triggered.
   * The toast is automatically removed after 3 seconds.
   *
   * @param {string} message - The message to display in the toast.
   * @param {string} [type='info'] - The type of the toast. Defaults to 'info'.
   * @param {HTMLElement} [button=null] - The button element to get the position from.
   */
  function showToast(message, type = 'info', button = null) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;

    toastContainer.appendChild(toast);
    // get x y for confetti
    let position = { y: 0.6 };

    if (button) {
      const buttonRect = button.getBoundingClientRect();
      const x = (buttonRect.left + buttonRect.right) / 2 / window.innerWidth;
      const y = (buttonRect.top + buttonRect.bottom) / 2 / window.innerHeight;
      position = { x: x, y: y };
    }

    // Trigger confetti for success toast
    if (type === 'success') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: position,
      });
    }

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
  function showErrorPost(message) {
    console.log('showErrorPost', message);
    hideLoadingSpinner();
    const postContainer = document.getElementById('postContainer');

    // Create the error post div
    const errorPostDiv = document.createElement('div');
    errorPostDiv.classList.add('post', 'errorPost');

    // Create the icon element
    const iconElement = document.createElement('i');
    iconElement.classList.add('fa-solid', 'fa-triangle-exclamation');

    // Create the error text element
    const errorText = document.createElement('div');
    errorText.innerText = 'E R R O R !';
    errorText.style.fontWeight = 'bold'; // Make the text bold
    errorText.style.marginTop = '10px'; // Add some spacing

    // Create the custom error message element
    const errorMessage = document.createElement('div');
    errorMessage.innerText = message;
    errorMessage.style.marginTop = '5px'; // Add some spacing

    // Append the icon, error text, and message to the error post div
    errorPostDiv.appendChild(iconElement);
    errorPostDiv.appendChild(errorText);
    errorPostDiv.appendChild(errorMessage);

    errorPostDiv.classList.add('revealing');
    postContainer.insertBefore(errorPostDiv, postContainer.firstChild);
    // Append the error post div to the post container
    setTimeout(() => {
      errorPostDiv.remove();
    }, 10000);
  }
});
