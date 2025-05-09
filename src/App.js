import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [parsedChats, setParsedChats] = useState([]);
  const [error, setError] = useState('');
  
  // Hardcoded chat data from _chat.txt
  const defaultChatData = `[10/04/2025, 17:57:16] Abiodun: ‎Messages and calls are end-to-end encrypted. Only people in this chat can read, listen to, or share them.
[10/04/2025, 17:57:16] Abiodun: ‎Abiodun is a contact.
[10/04/2025, 17:56:07] Abiodun: Good evening favour
[10/04/2025, 18:06:45] Favour: Evening
[10/04/2025, 18:29:05] Abiodun: How are you doing, guess you're home now.
[10/04/2025, 18:37:29] Favour: Fine
[10/04/2025, 18:37:33] Favour: You ?
[10/04/2025, 18:37:36] Favour: Yes
[10/04/2025, 18:38:07] Abiodun: Good, how come we haven't see each other all these while
[10/04/2025, 18:38:56] Favour: I don't go out
[10/04/2025, 18:41:49] Abiodun: Wow! God want us to see today that's why he allow you to go out`;
  
  // Load the default chat data when the component mounts
  useEffect(() => {
    try {
      console.log('Loading default chat data');
      parseWhatsAppChat(defaultChatData);
    } catch (err) {
      console.error('Error parsing default chat data:', err);
      setError('Error loading the default chat. You can upload a chat file manually.');
    }
  }, []);

  const parseWhatsAppChat = (text) => {
    try {
      console.log('Parsing chat text:', text.substring(0, 200) + '...'); // Log the first 200 chars of the text
      
      if (!text || text.trim() === '') {
        setError('The uploaded file is empty. Please upload a valid WhatsApp chat export.');
        return;
      }

      const lines = text.split('\n');
      console.log(`Found ${lines.length} lines in the chat`);
      
      const chats = [];
      let currentMessage = '';
      let currentSender = '';
      let currentTimestamp = '';

      // Try different regex patterns for WhatsApp chat formats
      const datePatterns = [
        /^(\d{1,2}\/\d{1,2}\/\d{2,4}(?:,\s|\s)\d{1,2}:\d{2}(?::\d{2})?(?:\s[AP]M)?)\s-\s([^:]+):/, // Standard format
        /^\[(\d{1,2}\/\d{1,2}\/\d{2,4},\s\d{1,2}:\d{2}(?::\d{2})?(?:\s[AP]M)?)\]\s([^:]+):/, // With brackets
        /^(\d{1,2}\.\d{1,2}\.\d{2,4}(?:,\s|\s)\d{1,2}:\d{2}(?::\d{2})?(?:\s[AP]M)?)\s-\s([^:]+):/, // European format with dots
        /^(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\s-\s([^:]+):/ // ISO format
      ];

      lines.forEach((line, index) => {
        let match = null;
        
        // Try each pattern until one matches
        for (const pattern of datePatterns) {
          match = line.match(pattern);
          if (match) break;
        }
        
        // For debugging the first few lines
        if (index < 5) {
          console.log(`Line ${index}: ${line.substring(0, 50)}... | Match: ${match ? 'YES' : 'NO'}`);
        }
        
        if (match) {
          if (currentMessage) {
            chats.push({
              timestamp: currentTimestamp,
              sender: currentSender,
              message: currentMessage.trim()
            });
          }
          
          currentTimestamp = match[1];
          currentSender = match[2];
          currentMessage = line.replace(match[0], '').trim();
        } else if (currentMessage) {
          currentMessage += '\n' + line.trim();
        }
      });

      if (currentMessage) {
        chats.push({
          timestamp: currentTimestamp,
          sender: currentSender,
          message: currentMessage.trim()
        });
      }

      console.log(`Parsed ${chats.length} messages`);
      
      if (chats.length === 0) {
        // If no messages were parsed, try a simpler approach
        console.log('No messages parsed with regex, trying simpler approach');
        const simpleChats = [];
        
        lines.forEach(line => {
          if (line.trim()) {
            simpleChats.push({
              timestamp: 'Unknown',
              sender: 'Unknown',
              message: line.trim()
            });
          }
        });
        
        if (simpleChats.length > 0) {
          setParsedChats(simpleChats);
          setError('Could not parse the chat format properly. Showing raw messages.');
        } else {
          setError('Could not parse any messages from the uploaded file. Please make sure it is a valid WhatsApp chat export.');
        }
      } else {
        setParsedChats(chats);
        setError('');
      }
    } catch (err) {
      console.error('Error parsing chat:', err);
      setError('Error parsing chat: ' + err.message + '. Please make sure you have uploaded a valid WhatsApp chat export.');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file.name, 'Size:', file.size, 'bytes');
      
      if (file.size === 0) {
        setError('The selected file is empty. Please select a valid WhatsApp chat export file.');
        return;
      }
      
      setError('Loading file...');
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        console.log('File loaded successfully');
        parseWhatsAppChat(e.target.result);
      };
      
      reader.onerror = (e) => {
        console.error('Error reading file:', e);
        setError('Error reading file: ' + (e.target.error?.message || 'Unknown error'));
      };
      
      reader.readAsText(file);
    } else {
      setError('No file selected. Please select a WhatsApp chat export file.');
    }
  };

  return (
    <div className="app-container">
      <div className="chat-viewer">
        <h1 className="app-title">WhatsApp Chat Viewer</h1>
        
        <div className="upload-container">
          <label className="upload-label">
            Upload WhatsApp chat file
          </label>
          <input
            type="file"
            className="file-input"
            onChange={handleFileUpload}
            accept="text/plain"
          />
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="chat-container">
          {parsedChats.map((chat, index) => {
            const isAbiodun = chat.sender.toLowerCase().includes('abiodun') || 
                          chat.sender.toLowerCase() === 'abiodun';
            const isFavour = chat.sender.toLowerCase().includes('favour') || 
                          chat.sender.toLowerCase() === 'favour';
            
            // If the sender is neither Abiodun nor Favour, determine based on pattern
            const displayOnRight = isAbiodun || 
                                (!isFavour && (index % 2 === 1 || chat.sender.toLowerCase().includes('you')));
            
            return (
              <div
                key={index}
                className={`chat-message ${displayOnRight ? 'sender-you' : 'sender-other'}`}
              >
                <span className="sender-name">
                  {displayOnRight ? 'Abiodun' : 'Favour'}
                </span>
                <p className="message-content">{chat.message}</p>
                <span className="timestamp">{chat.timestamp}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
