const ethers = require('ethers');
const axios = require('axios');

const PRIVATE_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const wallet = new ethers.Wallet(PRIVATE_KEY);

async function testCreateAttestation() {
    try {
        const testData = {
            discordId: "123456789",
            communityId: "987654321",
            address: wallet.address,
            timestamp: Math.floor(Date.now() / 1000)
        };

        const message = JSON.stringify(testData);


        const signature = await wallet.signMessage(message);
        const mockIdToken = "mock_id_token";

        const response = await axios.post('http://localhost:8080/api/create-attestation', {
            message,
            signature,
            idToken: mockIdToken
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Success:', response.data);
    } catch (error) {
        if (error.response) {
            console.error('API Error:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

// スクリプトの実行
testCreateAttestation()
    .then(() => console.log('Test completed'))
    .catch(error => console.error('Test failed:', error));
