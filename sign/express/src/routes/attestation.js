const express = require('express');
const router = express.Router();
const {verifySignature} = require('../middleware/auth');
const signService = require('../../../lib/sign');

router.post('/create-attestation', verifySignature, async (req, res) => {
    try {
        const data = req.verifiedData;

        const attestation = await signService.createAttestation('participation', {
            discordId: data.discordId,
            communityId: data.communityId,
            address: data.address,
            timestamp: Math.floor(data.timestamp / 1000),
        }, data.indexingValue);

        res.json({
            success: true,
            attestationId: attestation.attestationId,
            data: attestation.data
        });
    } catch (error) {
        console.error('Attestation creation error:', error);
        res.status(500).json({error: error.message});
    }
});
router.get('/verify/:indexingValue', async (req, res) => {
    try {
        const {indexingValue} = req.params;
        const attestations = await signService.verifyAttestations(indexingValue);
        const formattedResponse = formatAttestationResponse(attestations);

        res.json({
            success: true,
            indexingValue,
            ...formattedResponse
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.get('/guild-members/:guildId', async (req, res) => {
    try {
        const {guildId} = req.params;
        const members = await fetchAllGuildMembers(guildId);

        res.json({
            success: true,
            guildId,
            members
        });
    } catch (error) {
        console.error('Guild members fetch error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;

function formatAttestationResponse(attestations) {
    // Participation attestation
    const participationAttest = attestations.find(att =>
        att.schemaId === signService.schemaIds.participationSchemaId
    );

    // Active user attestations
    const activeAttestations = attestations.filter(att =>
        att.schemaId === signService.schemaIds.activeUserSchemaId
    );

    return {
        community: {
            isMember: !!participationAttest,
            attestId: participationAttest ? participationAttest.attestationId : null
        },
        active: {
            isActive: activeAttestations.length > 0,
            attestIds: activeAttestations.map(att => att.attestationId)
        }
    };
}

async function fetchAllGuildMembers(guildId) {
    let allMembers = [];
    let lastMemberId = null;
    let hasMore = true;

    while (hasMore) {
        const url = `https://discord.com/api/v10/guilds/${guildId}/members?limit=1000${
            lastMemberId ? `&after=${lastMemberId}` : ""
        }`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching members: ${response.statusText}`);
        }

        const members = await response.json();
        if (members.length === 0) {
            hasMore = false;
        } else {
            allMembers = [...allMembers, ...members];
            lastMemberId = members[members.length - 1].user.id;
        }
    }

    return allMembers;
}
