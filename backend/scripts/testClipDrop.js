import dotenv from 'dotenv'
import FormData from 'form-data'
import fs from 'fs'

// Load environment variables
dotenv.config()

async function testClipDropAPI() {
    console.log('Testing ClipDrop Text-to-Image API...')
    
    // Check if API key is configured
    if (!process.env.CLIPDROP_API_KEY) {
        console.error('❌ CLIPDROP_API_KEY not found in environment variables')
        console.log('Please add CLIPDROP_API_KEY to your .env file')
        return
    }
    
    console.log('✅ API Key found')
    
    // Test with text-to-image endpoint
    try {
        console.log('Testing FormData approach...')
        
        const form = new FormData()
        form.append('prompt', 'a spiderman on bridge')
        form.append('output_format', 'PNG')
        
        let response = await fetch('https://clipdrop-api.co/text-to-image/v1', {
            method: 'POST',
            headers: {
                'x-api-key': process.env.CLIPDROP_API_KEY,
            },
            body: form
        })
        
        console.log('FormData Response status:', response.status)
        
        if (response.status === 400) {
            const errorText = await response.text()
            console.log('FormData error:', errorText)
            
            // Try JSON approach with minimal parameters
            console.log('\nTrying JSON approach with minimal parameters...')
            
            const requestBody = {
                prompt: 'a spiderman on bridge'
            };
            
            response = await fetch('https://clipdrop-api.co/text-to-image/v1', {
                method: 'POST',
                headers: {
                    'x-api-key': process.env.CLIPDROP_API_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            })
            
            console.log('JSON Response status:', response.status)
            
            if (response.status === 200) {
                console.log('✅ JSON approach works!')
                const imageBuffer = await response.arrayBuffer()
                console.log('Image buffer size:', imageBuffer.byteLength, 'bytes')
                
                const buffer = Buffer.from(imageBuffer)
                fs.writeFileSync('./test_output.png', buffer)
                console.log('✅ Test image saved as test_output.png')
            } else {
                const errorText = await response.text()
                console.log('JSON error:', errorText)
            }
        } else if (response.status === 200) {
            console.log('✅ FormData approach works!')
            const imageBuffer = await response.arrayBuffer()
            console.log('Image buffer size:', imageBuffer.byteLength, 'bytes')
        }
        
    } catch (error) {
        console.error('❌ Error testing API:', error.message)
    }
}

// Run the test
testClipDropAPI()
