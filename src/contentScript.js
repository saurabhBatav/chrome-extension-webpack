console.log('Content script loaded and running');
// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message);
  if (message.action === 'startPost') {
    const { content, documentTitle, documentUrl, mediaType } = message.data;
    let fileName;
    if (mediaType === 'Doc') {
      fileName = `${documentTitle}.pdf`;
    } else if (mediaType === 'Video') {
      fileName = `${documentTitle}.mp4`;
    } else if (mediaType === 'image') {
      fileName = `${documentTitle}.jpg`;
    }
    console.log('Content script received message:', message);
    postOnLinkedIn(content, documentUrl, fileName, documentTitle);
  }
});

const maxRetryAttempts = 5;
let retryAttempts = 0;

document.addEventListener('click', function (event) {
  let element = event.target;
  const maxDepth = 5;

  for (let depth = 0; element && depth < maxDepth; depth++) {
    if (element.classList?.contains('artdeco-dropdown')) {
      retryAttempts = 0; // Reset retry attempts on new click
      handleDropdownClick();
      return;
    }
    element = element.parentElement;
  }
});

/**
 * Handles the click event on the dropdown menu.
 *
 * @return {void} This function does not return a value.
 */
function handleDropdownClick() {
  // Check if the dropdown menu is open
  console.log('Checking if dropdown menu is open...');
  const dropdownMenu = document.querySelector(
    '.artdeco-dropdown__content--is-open',
  );

  // If the dropdown menu is not open, retry the check
  if (!dropdownMenu) {
    retryDropdownCheck();
    return;
  }

  // Find the dropdown menu item that represents the option to copy a link to a post
  const copyLinkOption = findCopyLinkOption(dropdownMenu);

  // If the "Copy link to post" option is not found, retry the check
  if (!copyLinkOption) {
    retryDropdownCheck();
    return;
  }

  // If the "Recreate with Relink" option already exists, do nothing
  if (dropdownMenu.querySelector('.option-recreate-with-relink')) {
    console.log("Option 'Recreate with Relink' already exists.");
    return;
  }

  // Add the "Recreate with Relink" option to the dropdown menu
  addRecreateWithRelinkOption(dropdownMenu, copyLinkOption);
}

/**
 * Retries the dropdown check until the dropdown menu is open and the "Copy link to post"
 * option is found, or the maximum number of retry attempts is reached.
 *
 * This function is called when the dropdown menu is not open or the "Copy link to post"
 * option is not found. It retries the dropdown check after a short delay by calling
 * the handleDropdownClick function. The maximum number of retry attempts is defined by
 * the maxRetryAttempts variable.
 *
 * @return {void} This function does not return a value.
 */
function retryDropdownCheck() {
  // Check if the maximum number of retry attempts has been reached
  if (retryAttempts < maxRetryAttempts) {
    // Log a message indicating that the dropdown menu is not open or the "Copy link to post"
    // option is not found, and that the function is retrying the dropdown check
    console.log(
      'Dropdown menu is not open or "Copy link to post" option not found. Retrying...',
    );

    // Increment the retry attempts counter
    retryAttempts++;

    // Delay the execution of the handleDropdownClick function by 200 milliseconds
    setTimeout(handleDropdownClick, 200);
  } else {
    // Log a message indicating that the maximum number of retry attempts has been reached,
    // and that the function is stopping
    console.log('Max retry attempts reached. Stopping.');
  }
}

/**
 * Finds the dropdown menu item that represents the option to copy a link to a post.
 *
 * @param {HTMLElement} dropdownMenu - The dropdown menu element to search in.
 * @return {HTMLElement|undefined} The dropdown menu item that represents the
 * option to copy a link to a post, or undefined if not found.
 */
function findCopyLinkOption(dropdownMenu) {
  // Select all the dropdown items within the dropdown menu
  const dropdownItems = dropdownMenu.querySelectorAll(
    '.artdeco-dropdown__item',
  );

  // Find the dropdown item that represents the option to copy a link to a post
  return Array.from(dropdownItems).find(
    (item) =>
      // Check if the text content of the dropdown item is either
      // 'Copy link to post' or 'Copy link'
      item.textContent.trim() === 'Copy link to post' ||
      item.textContent.trim() === 'Copy link',
  );
}

/**
 * Adds a new option "Recreate with Relink" to the dropdown menu.
 *
 * @param {HTMLElement} dropdownMenu - The dropdown menu element.
 * @param {HTMLElement} copyLinkOption - The "Copy link to post" option element.
 * @return {void} This function does not return a value.
 */
function addRecreateWithRelinkOption(dropdownMenu, copyLinkOption) {
  console.log("Adding new option 'Recreate with Relink'.");

  let newOption;

  if (copyLinkOption.textContent.trim() === 'Copy link to post') {
    newOption = document.createElement('li');
    newOption.className =
      'feed-shared-control-menu__item option-recreate-with-relink';
    newOption.innerHTML = `
      <div role="button" class="feed-shared-control-menu__dropdown-item tap-target artdeco-dropdown__item artdeco-dropdown__item--is-dropdown ember-view" tabindex="0">
        <div class="ivm-image-view-model flex-shrink-zero mr2">
          <div class="ivm-view-attr__img-wrapper">
            <svg role="none" aria-hidden="true" class="ivm-view-attr__icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" data-supported-dps="24x24">
              <path fill="#D4D3D1" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm0 21.6c-5.29 0-9.6-4.31-9.6-9.6S6.71 2.4 12 2.4 21.6 6.71 21.6 12 17.29 21.6 12 21.6zm0-17.6C7.474 4 4 7.474 4 12s3.474 8 8 8 8-3.474 8-8-3.474-8-8-8z"></path>
            </svg>
          </div>
        </div>
        <div class="flex-grow-1 text-align-left">
          <h5 class="feed-shared-control-menu__headline t-14 t-black t-bold" role="none">
            Recreate with Relink
          </h5>
          <p class="feed-shared-control-menu__sub-headline t-12 t-black t-black--light"></p>
        </div>
      </div>
    `;
    // Append to the closest UL or default to the dropdownMenu
    const parentElement = dropdownMenu.querySelector('ul') || dropdownMenu;
    parentElement.appendChild(newOption);
  } else {
    newOption = document.createElement('div');
    newOption.className =
      'artdeco-dropdown__item artdeco-dropdown__item--is-dropdown ember-view entity-result__overflow-actions-menu-item';
    newOption.setAttribute('role', 'button');
    newOption.setAttribute('tabindex', '0');
    newOption.innerHTML = `
      <div class="display-flex align-items-center" role="presentation">
        <div class="ivm-image-view-model flex-shrink-zero align-self-center mr1">
          <div class="ivm-view-attr__img-wrapper">
            <li-icon aria-hidden="true" type="relink" class="ivm-view-attr__icon" size="large">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-supported-dps="24x24" fill="currentColor" class="mercado-match" width="24" height="24" focusable="false">
                <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm0 21.6c-5.29 0-9.6-4.31-9.6-9.6S6.71 2.4 12 2.4 21.6 6.71 21.6 12 17.29 21.6 12 21.6zm0-17.6C7.474 4 4 7.474 4 12s3.474 8 8 8 8-3.474 8-8-3.474-8-8-8z"></path>
              </svg>
            </li-icon>
          </div>
        </div>
        <span class="image-text-lockup__text">Recreate with Relink</span>
      </div>
    `;
    // Append to the .artdeco-dropdown__content-inner or default to the dropdownMenu
    const parentElement =
      dropdownMenu.querySelector('.artdeco-dropdown__content-inner') ||
      dropdownMenu;
    parentElement.appendChild(newOption);
  }

  console.log("New option 'Recreate with Relink' added.");

  newOption.addEventListener('click', () =>
    handleRecreateClick(copyLinkOption),
  );
}

/**
 * Handles the click event for the 'Recreate with Relink' option.
 *
 * @param {HTMLElement} copyLinkOption - The copy link option element.
 * @return {void} This function does not return a value.
 */
function handleRecreateClick(copyLinkOption) {
  // Log the click event
  console.log("Option 'Recreate with Relink' clicked.");

  try {
    // Check if the required APIs are available
    if (!chrome.runtime || !navigator.clipboard) {
      // Log an error if any of the required APIs are not available
      console.error('Required API not available');
      return;
    }

    // Trigger the click event on the copy link option
    copyLinkOption.click();

    // Wait for 500 milliseconds before reading the clipboard contents
    setTimeout(() => {
      navigator.clipboard
        .readText()
        .then((copiedText) => {
          // Log the copied URL
          console.log('Copied URL:', copiedText);

          // Send a message to the background script to open the side panel with the copied URL
          chrome.runtime.sendMessage({
            action: 'open_side_panel',
            data: { url: copiedText },
          });
        })
        .catch((error) => {
          // Log an error if reading the clipboard contents fails
          console.error('Failed to read clipboard contents:', error);
          //send a message to the background script to open the side panel with the error message
          chrome.runtime.sendMessage({
            action: 'errorWhileExtractingPost',
            data: { error: error.message },
          });
        });
    }, 500);
  } catch (error) {
    console.error('Error:', error);
    //send a message to the background script to open the side panel with the error message
    chrome.runtime.sendMessage({
      action: 'errorWhileExtractingPost',
      data: { error: error.message },
    });
  }
}
function simulateStartPostClick() {
  // Step 1: Check if the "Start a post" button exists on the page
  const startPostButtonSelector = 'button.share-box-feed-entry__trigger';
  const startPostButton = document.querySelector(startPostButtonSelector);

  if (startPostButton) {
    // Step 2: Create a click event
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    });

    // Step 3: Dispatch the click event on the "Start a post" button
    startPostButton.dispatchEvent(clickEvent);

    console.log('Start a post button clicked successfully.');
  } else {
    console.error('Start a post button not found.');
  }
}
async function downloadAndCreateBlob(url, fileName) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], fileName, { type: blob.type });
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
}

async function simulateSelection(file, fileName) {
  console.log(`Simulating selection for: ${fileName}`);
  let fileInput;

  if (fileName.endsWith('.pdf')) {
    const fileInputContainer = document.querySelector('.local-file-input');
    if (fileInputContainer) {
      console.log('File input container found:');
      fileInput = fileInputContainer.querySelector('input[type="file"]');
      if (!fileInput) {
        console.error('File input element not found inside .local-file-input!');
        return;
      }
    } else {
      console.error(
        'File input container element (.local-file-input) not found!',
      );
      return;
    }
  } else {
    fileInput = document.getElementById(
      'media-editor-file-selector__file-input',
    );
    if (!fileInput) {
      console.error('Media input element not found!');
      return;
    }
  }

  console.log('Input element found:');
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);

  console.log('dataTransfer:', dataTransfer);
  fileInput.files = dataTransfer.files;

  console.log('Input files:', fileInput.files);

  const event = new Event('change', {
    bubbles: true,
    cancelable: false,
    composed: false,
    timeStamp: Date.now(),
    target: fileInput,
    srcElement: fileInput,
    currentTarget: fileInput,
    isTrusted: true,
  });
  fileInput.dispatchEvent(event);
}

async function clickButton(selector, description) {
  const button = await waitForElement(selector);
  if (button) {
    button.click();
    console.log(`${description} button clicked`);
  } else {
    console.error(`${description} button not found`);
  }
}

async function waitForElement(selector, timeout = 10000, interval = 500) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const element = document.querySelector(selector);
    if (element) return element;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  return null;
}

async function postOnLinkedIn(content, fileUrl, fileName, documentTitle) {
  try {
    console.log('Step 1: Checking if the share box is open');
    const shareBox = document.querySelector('.share-box');
    if (!shareBox) {
      simulateStartPostClick();
      const shareBox = await waitForElement('.share-box');
      if (!shareBox) {
        console.error('Share box did not appear');
        return;
      }
    }

    if (fileName.endsWith('.pdf')) {
      await clickButton('button[aria-label="More"]', 'More');
      await clickButton(
        'button[aria-label="Add a document"]',
        'Attach document',
      );
    } else {
      await clickButton('button[aria-label="Add media"]', 'Add media');
    }

    const file = await downloadAndCreateBlob(fileUrl, fileName);
    console.log('File downloaded:', file);
    await simulateSelection(file, fileName);

    if (fileName.endsWith('.pdf')) {
      console.log('Step 6: Adding document title');
      const titleInput = await waitForElement(
        '.document-title-form__title-input',
      );
      if (!titleInput) {
        console.error('Title input not found');
        return;
      }
      titleInput.value = documentTitle;
      const event = new Event('input', { bubbles: true });
      titleInput.dispatchEvent(event);

      console.log('Step 7: Waiting for "Done" button to become enabled');
      const doneButton = await waitForElement(
        '.share-box-footer__primary-btn.artdeco-button--primary:not(.artdeco-button--disabled)',
        30000,
        500,
      );
      if (!doneButton) {
        console.error('"Done" button not found or not enabled');
        return;
      }
      doneButton.click();
    } else {
      console.log('Clicking "Next" button after media selection');
      const nextButton = await waitForElement(
        'button.share-box-footer__primary-btn.artdeco-button--primary:not(.artdeco-button--disabled)',
      );
      if (!nextButton) {
        console.error('"Next" button not found');
        return;
      }
      nextButton.click();
    }

    //wait for 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('Step 3: Adding content to the post');
    const editorDiv = await waitForElement('.ql-editor', 30000, 1500);
    if (!editorDiv) {
      console.error('Editor div not found');
      return;
    }

    console.log('adding content:', content);
    editorDiv.innerHTML = content;

    console.log('pasted content:', editorDiv.innerHTML);

    console.log('Post successful');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}
// async function postOnLinkedIn(content, fileUrl, fileName, documentTitle) {
//   try {
//     // Step 1: Check if the share box is already open
//     console.log('Step 1: Checking if the share box is open');
//     const shareBox = document.querySelector('.share-box');
//     if (!shareBox) {
//       simulateStartPostClick();
//       const shareBox = await waitForElement('.share-box');
//       if (!shareBox) {
//         console.error('Share box did not appear');
//         return;
//       }
//     }

//     // Step 2: Click on more file type button to add a document
//     let fileInput = null;
//     if (fileName.endsWith('.pdf')) {
//       console.log('Step 2: Clicking on more file type button');
//       const moreButton = document.querySelector('button[aria-label="More"]');
//       if (moreButton) {
//         moreButton.click();
//       } else {
//         console.error('More button not found');
//         return;
//       }

//       // Step 4: Click on the attach document button
//       console.log('Step 4: Clicking on the attach document button');
//       const addButton = await waitForElement(
//         'button[aria-label="Add a document"]',
//       );
//       if (!addButton) {
//         console.error('Attach document button not found');
//         return;
//       }
//       addButton.click();

//       // Step 5: Wait for the file input to appear and attach document
//       console.log('Step 5: Waiting for file input to appear');
//       fileInput = await waitForElement('.cloud-filepicker-visually-hidden');
//       if (!fileInput) {
//         console.error('File input not found');
//         return;
//       }
//     } else if (fileName.endsWith('.mp4')) {
//       fileInput = await waitForElement(
//         'media-editor-file-selector__file-input',
//       );
//     }
//     if (!fileInput) {
//       console.error('Media input element not found!');
//       return;
//     }
//     console.log('Step 5: Downloading and attaching document');
//     async function downloadFileAndCreateBlob(url, fileName) {
//       try {
//         const response = await fetch(url);
//         const blob = await response.blob();
//         return new File([blob], fileName, { type: blob.type });
//       } catch (error) {
//         console.error('Error downloading file:', error);
//         throw error;
//       }
//     }

//     async function simulateFileSelection(file) {
//       console.log(`Step 5: Simulating file selection: ${file}`);

//       if()
//       // Selecting the file input container based on its class
//       const fileInputContainer = document.querySelector('.local-file-input');
//       if (fileInputContainer) {
//         console.log('File input container found:');
//         // Finding the input element inside the container
//         const fileInput =
//           fileInputContainer.querySelector('input[type="file"]');
//         if (fileInput) {
//           console.log('File input element found inside .local-file-input:');
//           const dataTransfer = new DataTransfer();
//           dataTransfer.items.add(file);

//           console.log('dataTransfer:', dataTransfer);
//           fileInput.files = dataTransfer.files;

//           console.log('File input files:', fileInput.files);

//           const event = new Event('change', {
//             bubbles: true,
//             cancelable: false,
//             composed: false,
//             timeStamp: Date.now(), // You can adjust the timeStamp if necessary
//             target: fileInput,
//             srcElement: fileInput,
//             currentTarget: fileInput,
//             isTrusted: true,
//           });
//           fileInput.dispatchEvent(event);
//         } else {
//           console.error(
//             'File input element not found inside .local-file-input!',
//           );
//         }
//       } else {
//         console.error(
//           'File input container element (.local-file-input) not found!',
//         );
//       }
//     }

//     const file = await downloadFileAndCreateBlob(fileUrl, fileName);
//     console.log('File downloaded:', file);
//     await simulateFileSelection(file);

//     // Step 6: Add document title
//     console.log('Step 6: Adding document title');
//     const titleInput = await waitForElement(
//       '.document-title-form__title-input',
//     );
//     if (!titleInput) {
//       console.error('Title input not found');
//       return;
//     }
//     titleInput.value = documentTitle;
//     const event = new Event('input', { bubbles: true });
//     titleInput.dispatchEvent(event);

//     // Step 7: Wait for the "Done" button to become enabled and click it
//     console.log('Step 7: Waiting for "Done" button to become enabled');
//     const doneButton = await waitForElement(
//       '.share-box-footer__primary-btn.artdeco-button--primary:not(.artdeco-button--disabled)',
//       undefined,
//       1000,
//       30000,
//     );
//     if (!doneButton) {
//       console.error('"Done" button not found or not enabled');
//       return;
//     }

//     doneButton.click();

//     // Step 3: Add content to the post
//     console.log('Step 3: Adding content to the post');
//     const editorDiv = await waitForElement('.ql-editor');
//     if (!editorDiv) {
//       console.error('Editor div not found');
//       return;
//     }
//     editorDiv.innerHTML = content;

//     console.log('Post successful');
//   } catch (error) {
//     console.error('An error occurred:', error);
//   }
// }

// General function to wait for an element matching a selector to appear and meet certain conditions
// function waitForElement(
//   selector,
//   checkCondition = () => true,
//   intervalTime = 500,
//   maxInterval = 5000, // default max wait time of 5 seconds
// ) {
//   return new Promise((resolve) => {
//     const startTime = Date.now();
//     const interval = setInterval(() => {
//       const element = document.querySelector(selector);
//       const elapsedTime = Date.now() - startTime;

//       if (element && checkCondition(element)) {
//         clearInterval(interval);
//         resolve(element);
//       } else if (elapsedTime >= maxInterval) {
//         clearInterval(interval);
//         resolve(false);
//       }
//     }, intervalTime);
//   });
// }
// async function postOnLinkedIn(content, fileUrl, fileName, documentTitle) {
//   // Step 1: Check if the share box is already open
//   const shareBox = document.querySelector('.share-box');
//   if (!shareBox) {
//     simulateStartPostClick();
//     await waitForElement('.share-box'); // Wait for the share box to load
//   }

//   // Step 2: click on more file type button to add a document
//   const moreButton = document.querySelector('button[aria-label="More"]');
//   if (moreButton) {
//     moreButton.click();
//   }
//   // Step 2: Add content to the post
//   const editorDiv = await waitForElement('.ql-editor');
//   editorDiv.innerHTML = content;

//   // Step 4: Click on the attach document button
//   const addButton = await waitForElement('button[aria-label="Add a document"]');
//   addButton.click();

//   // Step 5: Wait for the file input to appear and attach document
//   await waitForElement('.cloud-filepicker-visually-hidden');

//   async function downloadFileAndCreateBlob(url, fileName) {
//     try {
//       const response = await fetch(url);
//       const blob = await response.blob();
//       return new File([blob], fileName, { type: blob.type });
//     } catch (error) {
//       console.error('Error downloading file:', error);
//       throw error;
//     }
//   }

//   function simulateFileSelection(file) {
//     const fileInput = document.querySelector(
//       '.cloud-filepicker-visually-hidden',
//     );
//     const dataTransfer = new DataTransfer();
//     dataTransfer.items.add(file);
//     fileInput.files = dataTransfer.files;
//     const event = new Event('change', { bubbles: true });
//     fileInput.dispatchEvent(event);
//   }

//   await downloadFileAndCreateBlob(fileUrl, fileName)
//     .then((file) => {
//       simulateFileSelection(file);
//     })
//     .catch((error) => {
//       console.error('Error during file selection simulation:', error);
//     });

//   // Step 6: Add document title
//   const titleInput = await waitForElement('.document-title-form__title-input');

//   await new Promise((resolve) => setTimeout(resolve, 2000));
//   titleInput.value = documentTitle;
//   // Wait for 2 seconds before clicking the "Done" button

//   const event = new Event('input', { bubbles: true });
//   titleInput.dispatchEvent(event);

//   const documentPreview = await waitForElement(
//     '.document-s-container',
//     undefined,
//     2000,
//   );

//   console.log('documentPreview:', documentPreview);

//   // Step 7: Wait for the "Done" button to become enabled and click it
//   const doneButton = await waitForElement(
//     '.share-box-footer__primary-btn.artdeco-button--primary:not(.artdeco-button--disabled)',
//   );
//   doneButton.click();
// }
// function simulateStartPostClick() {
//   // Step 1: Check if the "Start a post" button exists on the page
//   const startPostButtonSelector = 'button.share-box-feed-entry__trigger';
//   const startPostButton = document.querySelector(startPostButtonSelector);

//   if (startPostButton) {
//     // Step 2: Create a click event
//     const clickEvent = new MouseEvent('click', {
//       view: window,
//       bubbles: true,
//       cancelable: true,
//     });

//     // Step 3: Dispatch the click event on the "Start a post" button
//     startPostButton.dispatchEvent(clickEvent);

//     console.log('Start a post button clicked successfully.');
//   } else {
//     console.error('Start a post button not found.');
//   }
// }

// function handleRepostButton() {
//   // Step 1: Find the first visible "reposts" button
//   const elements = document.querySelectorAll('button[aria-label*="reposts"]');
//   let firstVisibleElement = null;

//   for (const element of elements) {
//     if (isElementInViewport(element)) {
//       firstVisibleElement = element;
//       break;
//     }
//   }

//   if (firstVisibleElement) {
//     // Step 2: Click on the first visible "reposts" button
//     firstVisibleElement.click();
//     console.log('Reposts button clicked');

//     // Step 3: Get the data-urn value
//     setTimeout(() => {
//       const elementWithDataUrn = document.querySelector('[data-urn]');
//       const dataUrnValue = elementWithDataUrn
//         ? elementWithDataUrn.getAttribute('data-urn')
//         : null;

//       if (dataUrnValue) {
//         console.log('data-urn value:', dataUrnValue);

//         // Step 4: Click on the close button
//         const closeButton = document.querySelector(
//           'button[data-test-modal-close-btn]',
//         );
//         if (closeButton) {
//           closeButton.click();
//           console.log('Close button clicked');
//         } else {
//           console.log('Close button not found');
//         }
//       } else {
//         console.log('data-urn attribute not found');
//       }
//     }, 3000);
//   } else {
//     console.log('No visible "reposts" button found');
//   }
// }

// // Function to check if element is in viewport
// function isElementInViewport(el) {
//   const rect = el.getBoundingClientRect();
//   return (
//     rect.top >= 0 &&
//     rect.left >= 0 &&
//     rect.bottom <=
//       (window.innerHeight || document.documentElement.clientHeight) &&
//     rect.right <= (window.innerWidth || document.documentElement.clientWidth)
//   );
// }
