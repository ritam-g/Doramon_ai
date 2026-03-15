import { tavily } from '@tavily/core'

const tvl=tavily({apiKey:process.env.TAVILY_API_KEY})

async function webSerch({searchQuery}) {
    try {
       const response = await tvl.search(searchQuery)
       
       return response.results[0]
       
        
    } catch (err) {
        console.log(err);
        
    }
}

export default webSerch