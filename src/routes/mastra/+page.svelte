<script lang="ts">
    let res = $state("");
    let content = $state("")
    let ai_message = $state("");
    async function getMessage() {
        const response = await fetch('/api/mastra', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        const data = await response.json()
        res = data.message;
    }
    async function getAgents(e: Event) {
        e.preventDefault();
        ai_message = "Loding..."
        const response = await fetch('/api/mastra', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "user",
                        content: content
                    }
                ]
            })
        })
        const data = await response.json()
        ai_message = data.result;
    }
</script>

<div>
    <h1>Mastra</h1>
    <button onclick={getMessage}>get</button>
    {#if res === ""}
        <p>Loading...</p>
    {:else}
        <p>{res}</p>
    {/if}
    <form onsubmit={getAgents}>
        <label for="content">Content:</label>
        <input type="text" id="content" bind:value={content} />
        <button type="submit">Submit</button>
    </form>
    <p>AI: {ai_message}</p>
</div>