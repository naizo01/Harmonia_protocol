const axios = require('axios');

async function testGuildMembers() {
    try {
        // テスト用のギルドID
        const testGuildId = "1293876618045030400";

        console.log(`\nTesting Guild Members fetch for guild ID: ${testGuildId}`);

        const response = await axios.get(`http://localhost:8080/api/guild-members/${testGuildId}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // 完全なレスポンスをログ出力
        console.log('\nFull Response:', JSON.stringify(response.data, null, 2));

        // メンバー情報の詳細を表示
        if (response.data.members && response.data.members.length > 0) {
            console.log('\nGuild Members Summary:');
            console.log('Total Members:', response.data.members.length);

            // 最初の数人のメンバー情報を表示
            console.log('\nSample Members (first 5):');
            response.data.members.slice(0, 5).forEach((member, index) => {
                console.log(`\nMember ${index + 1}:`);
                if (member.user) {
                    console.log('User ID:', member.user.id);
                    console.log('Username:', member.user.username);
                    console.log('Global Name:', member.user.global_name);
                }
                if (member.roles) {
                    console.log('Roles:', member.roles);
                }
                console.log('Joined At:', member.joined_at);
            });
        } else {
            console.log('\nNo members found or empty response');
        }

    } catch (error) {
        if (error.response) {
            console.error('\nAPI Error:', error.response.data);
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
        } else if (error.request) {
            console.error('\nRequest Error:', error.request);
        } else {
            console.error('\nError:', error.message);
        }
    }
}

// メイン実行部分
async function runTests() {
    console.log('Starting Guild Members API Test...');

    await testGuildMembers();

    console.log('\nAll tests completed');
}

// テストの実行
runTests()
    .then(() => console.log('\nTest suite finished successfully'))
    .catch(error => {
        console.error('\nTest suite failed:', error);
        process.exit(1);
    });
