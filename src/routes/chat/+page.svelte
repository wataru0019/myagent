<script lang="ts">
  import { Chat } from '@ai-sdk/svelte';
  import { marked } from 'marked';

  let input = $state('');
  const chat = new Chat({});
  let threadId: string = $state('')

  function createThreadId() {
    threadId = `conversation-${Math.random().toString(36).substring(2, 15)}`;
  }

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (threadId === '') {
      createThreadId();
    }
    if (input.trim()) {
      chat.sendMessage({ text: input, metadata: { threadId: threadId } });
      input = '';
    }
  }
  // MarkdownをHTMLに変換する関数
  function renderMarkdown(text: string): string {
    return marked.parse(text, {
      breaks: true,
      gfm: true
    }) as string;
  }

  // アバター画像のURL（実際のプロジェクトでは適切な画像を使用）
  const userAvatar = 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face';
  const aiAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face';
</script>

<svelte:head>
  <title>Dinner Ideas - Recipe AI</title>
</svelte:head>

<div class="chat-container">
  <!-- Header -->
  <header class="header">
    <button class="menu-button">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>
    <h1 class="title">Dinner Ideas</h1>
  </header>

  <!-- Chat Messages -->
  <main class="chat-messages">
    {#if chat.messages.length === 0}
      <div class="welcome-message">
        <div class="message ai-message">
          <div class="avatar">
            <img src={aiAvatar} alt="Recipe AI" />
          </div>
          <div class="message-bubble">
            <div class="markdown-content">
              Hi there! I'm here to help you find the perfect dinner recipe. What ingredients do you have on hand, or what kind of cuisine are you in the mood for?
            </div>
          </div>
        </div>
      </div>
    {:else}
      {#each chat.messages as message, messageIndex (messageIndex)}
        <div class="message {message.role === 'user' ? 'user-message' : 'ai-message'}">
          {#if message.role === 'user'}
            <div class="message-bubble">
              {#each message.parts as part, partIndex (partIndex)}
                {#if part.type === 'text'}
                  <div class="text-content">{part.text}</div>
                {/if}
              {/each}
            </div>
            <div class="avatar">
              <img src={userAvatar} alt="User" />
            </div>
          {:else}
            <div class="avatar">
              <img src={aiAvatar} alt="Recipe AI" />
            </div>
            <div class="message-bubble">
              {#each message.parts as part, partIndex (partIndex)}
                {#if typeof part.type === 'string' && part.type.includes('tool')}
                  <div class="text-content">ツールを使用しています。ツール名：{typeof part.type === 'string' ? part.type.replace(/^tool-/, '') : ''}</div>
                {/if}
                {#if part.type === 'text'}
                  <div class="markdown-content">{@html renderMarkdown(part.text)}</div>
                {/if}
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    {/if}
  </main>

  <!-- Input Form -->
  <form class="input-form" onsubmit={handleSubmit}>
    <div class="input-container">
      <div class="user-avatar">
        <img src={userAvatar} alt="User" />
      </div>
      <input
        bind:value={input}
        type="text"
        placeholder="Ask for a recipe..."
        class="message-input"
      />
      <button type="submit" class="send-button" disabled={!input.trim()}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22,2 15,22 11,13 2,9"></polygon>
        </svg>
      </button>
    </div>
  </form>
</div>

<style>
  .chat-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .header {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #e5e5e5;
    background-color: #ffffff;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .menu-button {
    background: none;
    border: none;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    color: #666;
    margin-right: 16px;
  }

  .menu-button:hover {
    background-color: #f5f5f5;
  }

  .title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .welcome-message {
    margin-top: auto;
  }

  .message {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    max-width: 80%;
  }

  .user-message {
    align-self: flex-end;
    flex-direction: row-reverse;
  }

  .ai-message {
    align-self: flex-start;
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
  }

  .avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .message-bubble {
    background-color: #f0f0f0;
    padding: 12px 16px;
    border-radius: 18px;
    border-bottom-left-radius: 4px;
    max-width: 100%;
  }

  .user-message .message-bubble {
    background-color: #007AFF;
    color: white;
    border-bottom-left-radius: 18px;
    border-bottom-right-radius: 4px;
  }

  .text-content {
    margin: 0;
    line-height: 1.4;
    word-wrap: break-word;
  }

  .markdown-content {
    line-height: 1.6;
    word-wrap: break-word;
  }

  /* Markdown スタイリング */
  .markdown-content h1,
  .markdown-content h2,
  .markdown-content h3,
  .markdown-content h4,
  .markdown-content h5,
  .markdown-content h6 {
    margin: 16px 0 8px 0;
    font-weight: 600;
    color: inherit;
  }

  .markdown-content h1 {
    font-size: 1.5em;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 4px;
  }

  .markdown-content h2 {
    font-size: 1.3em;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 2px;
  }

  .markdown-content h3 {
    font-size: 1.1em;
  }

  .markdown-content h4 {
    font-size: 1em;
  }

  .markdown-content p {
    margin: 8px 0;
  }

  .markdown-content ul,
  .markdown-content ol {
    margin: 8px 0;
    padding-left: 24px;
  }

  .markdown-content li {
    margin: 4px 0;
  }

  .markdown-content strong {
    font-weight: 600;
  }

  .markdown-content em {
    font-style: italic;
  }

  .markdown-content code {
    background-color: rgba(0, 0, 0, 0.1);
    padding: 2px 4px;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.9em;
  }

  .markdown-content pre {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 12px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 12px 0;
  }

  .markdown-content pre code {
    background: none;
    padding: 0;
  }

  .markdown-content blockquote {
    border-left: 4px solid #007AFF;
    margin: 12px 0;
    padding-left: 16px;
    color: #666;
    font-style: italic;
  }

  .markdown-content hr {
    border: none;
    border-top: 1px solid #e0e0e0;
    margin: 16px 0;
  }

  .markdown-content table {
    border-collapse: collapse;
    width: 100%;
    margin: 12px 0;
  }

  .markdown-content th,
  .markdown-content td {
    border: 1px solid #e0e0e0;
    padding: 8px 12px;
    text-align: left;
  }

  .markdown-content th {
    background-color: rgba(0, 0, 0, 0.05);
    font-weight: 600;
  }

  .input-form {
    padding: 20px;
    border-top: 1px solid #e5e5e5;
    background-color: #ffffff;
  }

  .input-container {
    display: flex;
    align-items: center;
    gap: 12px;
    background-color: #f8f8f8;
    border-radius: 24px;
    padding: 8px 16px;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
  }

  .user-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .message-input {
    flex: 1;
    border: none;
    background: none;
    outline: none;
    font-size: 16px;
    color: #333;
    padding: 8px 0;
  }

  .message-input::placeholder {
    color: #999;
  }

  .send-button {
    background: none;
    border: none;
    padding: 8px;
    border-radius: 50%;
    cursor: pointer;
    color: #007AFF;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  }

  .send-button:hover:not(:disabled) {
    background-color: #e3f2fd;
  }

  .send-button:disabled {
    color: #ccc;
    cursor: not-allowed;
  }

  /* Scrollbar styling */
  .chat-messages::-webkit-scrollbar {
    width: 6px;
  }

  .chat-messages::-webkit-scrollbar-track {
    background: transparent;
  }

  .chat-messages::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 3px;
  }

  .chat-messages::-webkit-scrollbar-thumb:hover {
    background: #ccc;
  }
</style>