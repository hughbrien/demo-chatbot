// Configuration
const API_BASE_URL = 'https://localhost:8080/api/chat';

// DOM Elements
const newChatBtn = document.getElementById('new-chat-btn');
const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
const sidebar = document.getElementById('sidebar');
const conversationList = document.getElementById('conversation-list');
const messagesDiv = document.getElementById('messages');
const chatTitle = document.getElementById('chat-title');
const inputForm = document.getElementById('input-form');
const promptInput = document.getElementById('prompt');
const sendBtn = document.getElementById('send-btn');
const sendBtnText = document.getElementById('send-btn-text');

// State
let currentChatId = null;
let isLoading = false;
let conversations = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadAllConversations();
    setupEventListeners();
    configureMarked();
});

// Configure Marked.js options
function configureMarked() {
    marked.setOptions({
        breaks: true,
        gfm: true
    });
}

// Event Listeners
function setupEventListeners() {
    newChatBtn.addEventListener('click', createNewChat);
    toggleSidebarBtn.addEventListener('click', toggleSidebar);
    inputForm.addEventListener('submit', handleSendMessage);
    promptInput.addEventListener('input', autoResizeTextarea);
    promptInput.addEventListener('keydown', handleEnterKey);
}

// Toggle sidebar collapse/expand
function toggleSidebar() {
    sidebar.classList.toggle('collapsed');
}

// Auto-resize textarea
function autoResizeTextarea() {
    promptInput.style.height = 'auto';
    promptInput.style.height = promptInput.scrollHeight + 'px';
}

// Handle Enter key (send on Enter, new line on Shift+Enter)
function handleEnterKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        inputForm.dispatchEvent(new Event('submit'));
    }
}

// Load all conversations from database
async function loadAllConversations() {
    try {
        const response = await fetch(`${API_BASE_URL}/conversations`);

        if (!response.ok) {
            throw new Error('Failed to load conversations');
        }

        conversations = await response.json();
        renderConversationList();

        // If no conversations exist, create one automatically
        if (conversations.length === 0) {
            await createNewChat();
        }
    } catch (error) {
        console.error('Error loading conversations:', error);
        conversationList.innerHTML = '<div class="empty-conversations">Error loading conversations</div>';
    }
}

// Render conversation list in sidebar
function renderConversationList() {
    if (conversations.length === 0) {
        conversationList.innerHTML = '<div class="empty-conversations">No conversations yet</div>';
        return;
    }

    conversationList.innerHTML = '';

    conversations.forEach(conv => {
        const item = document.createElement('div');
        item.className = 'conversation-item';
        if (conv.conversationId === currentChatId) {
            item.classList.add('active');
        }

        // Content wrapper (title + delete button)
        const contentDiv = document.createElement('div');
        contentDiv.className = 'conversation-content';

        const titleSpan = document.createElement('span');
        titleSpan.className = 'conversation-title';
        titleSpan.textContent = conv.title;
        titleSpan.title = conv.title; // Tooltip with full title

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = 'Delete conversation';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteConversation(conv.conversationId);
        });

        contentDiv.appendChild(titleSpan);
        contentDiv.appendChild(deleteBtn);

        // Date display
        const dateSpan = document.createElement('div');
        dateSpan.className = 'conversation-date';
        dateSpan.textContent = formatDate(conv.lastMessageTime);

        item.appendChild(contentDiv);
        item.appendChild(dateSpan);

        item.addEventListener('click', () => loadConversation(conv.conversationId));

        conversationList.appendChild(item);
    });
}

// Format date for display
function formatDate(timestamp) {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
        return 'Now';
    } else if (diffMins < 60) {
        return `${diffMins} min ago`;
    } else if (diffHours < 24) {
        return `${diffHours}h ago`;
    } else if (diffDays < 7) {
        return `${diffDays}d ago`;
    } else {
        return date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' });
    }
}

// Create new conversation
async function createNewChat() {
    if (isLoading) return;

    try {
        setLoading(true);
        newChatBtn.disabled = true;

        const response = await fetch(`${API_BASE_URL}/generate-chat-id`);

        if (!response.ok) {
            throw new Error('Failed to create new conversation');
        }

        currentChatId = await response.text();

        // Clear messages
        messagesDiv.innerHTML = '<div class="empty-chat"><p>👋 Hello! How can I help you today?</p></div>';
        chatTitle.textContent = 'New Conversation';

        // Enable input
        sendBtn.disabled = false;
        promptInput.disabled = false;
        promptInput.focus();

        // Reload list (conversation will appear after first message)
        await loadAllConversations();

    } catch (error) {
        console.error('Error creating conversation:', error);
        alert('Error creating new conversation. Please try again.');
    } finally {
        setLoading(false);
        newChatBtn.disabled = false;
    }
}

// Load specific conversation messages
async function loadConversation(chatId) {
    if (isLoading || chatId === currentChatId) return;

    try {
        setLoading(true);
        currentChatId = chatId;

        const response = await fetch(`${API_BASE_URL}/${chatId}/messages`);

        if (!response.ok) {
            throw new Error('Failed to load messages');
        }

        const messages = await response.json();

        // Update UI
        const conv = conversations.find(c => c.conversationId === chatId);
        chatTitle.textContent = conv ? conv.title : 'Conversation';

        // Render messages
        messagesDiv.innerHTML = '';

        if (messages.length === 0) {
            messagesDiv.innerHTML = '<div class="empty-chat"><p>No messages yet. Start chatting!</p></div>';
        } else {
            messages.forEach(msg => {
                addMessageToUI(msg.role, msg.text, false);
            });
            scrollToBottom();
        }

        // Update sidebar
        renderConversationList();

        // Enable input
        sendBtn.disabled = false;
        promptInput.disabled = false;
        promptInput.focus();

    } catch (error) {
        console.error('Error loading conversation:', error);
        alert('Error loading conversation.');
    } finally {
        setLoading(false);
    }
}

// Delete conversation
async function deleteConversation(chatId) {
    if (!confirm('Are you sure you want to delete this conversation?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${chatId}/messages`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete conversation');
        }

        // If current conversation deleted, clear UI
        if (chatId === currentChatId) {
            currentChatId = null;
            messagesDiv.innerHTML = '<div class="empty-chat"><p>Conversation deleted. Create a new one!</p></div>';
            chatTitle.textContent = 'Select or create a conversation';
            sendBtn.disabled = true;
            promptInput.disabled = true;
        }

        // Reload list
        await loadAllConversations();

    } catch (error) {
        console.error('Error deleting conversation:', error);
        alert('Error deleting conversation.');
    }
}

// Handle send message
async function handleSendMessage(e) {
    e.preventDefault();

    const question = promptInput.value.trim();

    if (!question || !currentChatId || isLoading) {
        return;
    }

    try {
        setLoading(true);

        // Clear input
        promptInput.value = '';
        promptInput.style.height = 'auto';

        // Remove empty message if exists
        const emptyChat = messagesDiv.querySelector('.empty-chat');
        if (emptyChat) {
            emptyChat.remove();
        }

        // Add user message
        addMessageToUI('user', question, true);

        // Create AI response placeholder
        const aiMessageDiv = document.createElement('div');
        aiMessageDiv.className = 'message ai-message';
        aiMessageDiv.innerHTML = '<div class="loading-spinner"></div>';
        messagesDiv.appendChild(aiMessageDiv);
        scrollToBottom();

        // Stream AI response
        await streamAIResponse(question, aiMessageDiv);

        // Reload conversations to update title
        await loadAllConversations();

    } catch (error) {
        console.error('Error sending message:', error);
        alert('Error sending message. Please try again.');
    } finally {
        setLoading(false);
    }
}

// Stream AI response using Server-Sent Events
async function streamAIResponse(question, aiMessageDiv) {
    return new Promise((resolve, reject) => {
        const eventSource = new EventSource(
            `${API_BASE_URL}/stream?chatId=${encodeURIComponent(currentChatId)}&question=${encodeURIComponent(question)}`
        );

        let fullResponse = '';

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                fullResponse += data.value;

                // Render Markdown and sanitize
                const htmlContent = marked.parse(fullResponse);
                const sanitizedContent = DOMPurify.sanitize(htmlContent);

                aiMessageDiv.innerHTML = sanitizedContent;
                scrollToBottom();
            } catch (error) {
                console.error('Error processing chunk:', error);
            }
        };

        eventSource.onerror = (error) => {
            console.log('Stream ended or error:', error);
            eventSource.close();

            // If no response received
            if (!fullResponse) {
                aiMessageDiv.innerHTML = '<em>Error receiving response. Please try again.</em>';
                reject(error);
            } else {
                resolve();
            }
        };
    });
}

// Add message to UI
function addMessageToUI(role, content, shouldScroll = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;

    if (role === 'user' || role === 'USER') {
        messageDiv.textContent = content;
    } else {
        // For AI messages, render Markdown
        const htmlContent = marked.parse(content);
        const sanitizedContent = DOMPurify.sanitize(htmlContent);
        messageDiv.innerHTML = sanitizedContent;
    }

    messagesDiv.appendChild(messageDiv);

    if (shouldScroll) {
        scrollToBottom();
    }
}

// Scroll to bottom of messages
function scrollToBottom() {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Set loading state
function setLoading(loading) {
    isLoading = loading;
    promptInput.disabled = loading;
    sendBtn.disabled = loading || !currentChatId;

    if (loading) {
        sendBtnText.innerHTML = '<span class="loading-spinner"></span>';
    } else {
        sendBtnText.textContent = 'Send';
    }
}
