// //================================================
// /*

// Note Sidebar
// Simple note sidebar which can be used to write a note, record thoughts, to-do list, meeting notes, etc.
// Copyright (C) 2024 Stefan vd
// www.stefanvd.net

// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

// To view a copy of this license, visit http://creativecommons.org/licenses/GPL/2.0/

// */
// //================================================
// chrome.runtime.onMessage.addListener((message, sender) => {
//   // The callback for runtime.onMessage must return falsy if we're not sending a response
//   (async () => {
//     if (message.type === 'open_side_panel') {
//       // This will open a tab-specific side panel only on the current tab.
//       await chrome.sidePanel.open({ tabId: sender.tab.id });
//     }
//   })();
// });

// chrome.tabs.onActivated.addListener(function (activeInfo) {
//   chrome.runtime.openOptionsPage();
// });

// chrome.action.onClicked.addListener((tab) => {
//   chrome.scripting.executeScript({
//     target: { tabId: tab.id },
//     files: ['contentScript.js'],
//   });
// });

import { convertMarkdownToUnicode } from './unicodeUtils.js';
// Function to check if the current browser is Firefox
function isFirefox() {
  return (
    typeof browser !== 'undefined' &&
    typeof browser.sidebarAction !== 'undefined'
  );
}

// Function to check if the current browser is Chrome / Chromium
function isChrome() {
  return (
    typeof chrome !== 'undefined' && typeof chrome.sidePanel !== 'undefined'
  );
}

// Execute Firefox-specific code
if (isFirefox()) {
  browser.action.onClicked.addListener(function () {
    browser.sidebarAction.toggle();
  });
}

// Execute Chrome-specific code
if (isChrome()) {
  // Importing the constants
  // eslint-disable-next-line no-undef

  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

async function getPostData(postLink) {
  let data = await getImageSrcsFromUrl(postLink);

  if (!data || data.content == '') {
    console.warn(
      'No data found with template link. Trying with message.data.url...',
    );
    const templateLink = await createTemplateLink(postLink);
    data = await getImageSrcsFromUrl(templateLink);
  }

  if (!data || data.content == '') {
    throw new Error(
      'We were not able to extract any content from the post. Please try with a different post.',
    );
  }

  const unicodeTextOg = await convertMarkdownToUnicode(data.content);
  data.content = unicodeTextOg;

  return data;
}

// Listen for messages from content.js
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log('Received message:', message);

  if (message.action === 'open_side_panel' || message.action === 'createPost') {
    try {
      console.log('Executing open_side_panel in background.js');
      if (message.action === 'open_side_panel') {
        console.log('Side panel not opened', chrome.sidePanel);
        chrome.sidePanel.open({ tabId: sender.tab.id });
        console.log('Side panel opened', chrome.sidePanel);
        //send message to popup to show the loading spinner
        setTimeout(() => {
          chrome.runtime.sendMessage(
            { action: 'show_loading_spinner' },
            function (response) {
              console.log('Response from popup:', response.message);
            },
          );
        }, 100);
      }
      let data = await getPostData(message.data.url);
      chrome.runtime.sendMessage({ action: 'showPostData', data: data });
    } catch (error) {
      chrome.runtime.sendMessage({
        action: 'errorWhileExtractingPost',
        data: error.message,
      });
      console.log('Error in open_side_panel:', error);
    }
    return true;
  } else if (message.action === 'regenerateContent') {
    try {
      console.log('Regenerating content');
      const regeneratedContent = await getGroqChatCompletion(
        message.data.content,
      );
      console.log('Regenerated content:', regeneratedContent);
      const unicodeContent = await convertMarkdownToUnicode(regeneratedContent);
      chrome.runtime.sendMessage({
        action: 'regenerateContent',
        data: { content: unicodeContent, postId: message.data.postId }, // unicodeContent,
      });
    } catch (error) {
      console.error('Error regenerating content:', error);
      chrome.runtime.sendMessage({
        action: 'errorWhileExtractingPost',
        data: error.message,
        toastOnly: true,
      });
    }
    return true;
  } else if (message.action === 'errorWhileExtractingPost') {
    console.log('Error while extracting post. Please try again.');
    chrome.runtime.sendMessage({
      action: 'errorWhileExtractingPost',
      data: { error: message.data },
    });
  }
});

// Function to fetch data from URL and extract relevant information
async function getImageSrcsFromUrl(url) {
  let fetchURL =
    'https://script.google.com/macros/s/AKfycbxONjzB2Oft2qGIAwWaoctX0EbJMljvt5-FDKddQSImxujiPlWoEpwYVL7kghu7uw/exec?url=' +
    url;
  console.log('printing url -', fetchURL);

  try {
    const response = await fetch(fetchURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    // Check if the response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Response is not JSON');
    }

    const data = await response.json();
    console.log(data); // Handle the response data here
    return data; // Return the data if needed
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to fetch data'); // Rethrow the error if needed
  }
}

// Function to get details of document
function getDocumentDetails(url) {
  // Implement logic to get document details
  return url;
}

import axios from 'axios';
const GROQ_API_KEY = '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';

async function getGroqChatCompletion(contentString) {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        messages: [
          {
            role: 'system',
            content: `Revise the following LinkedIn post caption by adding a hook and sub-hooks according to the content. Remove the call-to-action and add suitable emojis. Ensure the modified caption maintains a casual, engaging, and comedic tone, and is grammatically correct. Adjust the structure to best suit the content while keeping the original message intact. Provide the revised caption and suitable hashtags, do not provide introductory phrase in the response.`,
          },
          {
            role: 'user',
            content: contentString,
          },
        ],
        model: 'gemma-7b-it',
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const resText = response.data.choices[0].message.content;
    return resText;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to regenerate content....');
  }
}

async function createTemplateLink(link) {
  try {
    console.log('post link -', link);
    // Define a regular expression to extract the ARN number
    const numberRegex = /\d+/g;

    // Find all sequences of digits in the string
    const matches = link.match(numberRegex);

    // Filter out the sequences with more than 10 digits
    const arn = matches.find((num) => num.length > 10);

    if (arn) {
      // Create the template link using the extracted ARN number
      const templateLink = `https://www.linkedin.com/feed/update/urn:li:activity:${arn}?utm_source=share&utm_medium=member_desktop`;
      console.log('Template Link:', templateLink);
      return templateLink;
    } else {
      // If the ARN number is not found, return an error message
      console.log('ARN number not found in link:', link);
      return '';
    }
  } catch (error) {
    throw new Error('Failed to create template link');
  }
}
