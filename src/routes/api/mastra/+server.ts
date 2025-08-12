import { json } from '@sveltejs/kit'

export async function GET() {
    
    const getMastra = await fetch('https://mastramyagents-production.up.railway.app/api', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    console.log(getMastra)
    const res = { message: "hello" }
    return json(res)
}

export async function POST({ request }) {
    const body = await request.json()
    // const postMastra = await fetch("http://localhost:3000/api/agents/openAiAgent/generate", {
    const postMastra = await fetch('https://mastramyagents-production.up.railway.app/api/agents/openAiAgent/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    const res = await postMastra.json()
    const result = res.steps.at(-1).content.at(-1).text
    return json({ result })
}