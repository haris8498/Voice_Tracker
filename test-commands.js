const http = require('http');

function sendCommand(command) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            command: command,
            vibe: 'productive'
        });

        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/execute',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            
            res.on('data', (chunk) => {
                body += chunk;
            });
            
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function testCommands() {
    console.log('Testing Voice Commands System...\n');
    
    const testCases = [
        { name: 'Calculator', command: 'calculator kholo' },
        { name: 'Notepad', command: 'notepad kholo' },
        { name: 'Edge Browser', command: 'edge kholo' }
    ];
    
    for (const test of testCases) {
        try {
            console.log(`Testing: ${test.name} ("${test.command}")`);
            const result = await sendCommand(test.command);
            
            if (result.success) {
                console.log(`SUCCESS: ${result.message}`);
                console.log(`${test.name} should have opened!\n`);
            } else {
                console.log(`FAILED: ${result.message}\n`);
            }
            
            // Wait a bit between commands
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            console.log(`ERROR: ${error.message}\n`);
        }
    }
    
    console.log('Testing Complete!\n');
    console.log('If apps opened, voice commands are working!');
    console.log('Now try using the mic button in the browser at http://localhost:3000');
}

testCommands();
