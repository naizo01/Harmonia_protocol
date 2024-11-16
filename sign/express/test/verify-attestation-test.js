const axios = require('axios');

async function testVerifyAttestation() {
    try {

        const testDiscordId = "test-discordId";

        const response = await axios.get(`http://localhost:8080/api/verify/${testDiscordId}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Full Response:', JSON.stringify(response.data, null, 2));

        if (response.data.community) {
            console.log('\nCommunity Status:');
            console.log('Is Member:', response.data.community.isMember);
            console.log('Attest ID:', response.data.community.attestId);
        }

        if (response.data.active) {
            console.log('\nActive Status:');
            console.log('Is Active:', response.data.active.isActive);
            console.log('Attest IDs:', response.data.active.attestIds);
        }

    } catch (error) {
        if (error.response) {
            console.error('API Error:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

// スクリプトの実行
testVerifyAttestation()
    .then(() => console.log('\nTest completed'))
    .catch(error => console.error('\nTest failed:', error));
