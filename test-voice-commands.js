const http = require('http');

async function testVoiceCommands() {
    console.log('Testing Voice Commands...\n');
    
    const commands = [
        'calculator kholo',
        'notepad kholo',
        'edge kholo'
    ];
    
    for (const command of commands) {
        try {
            const data = await sendCommand(command);
            
            const data = data;
            const status = data.success ? '✅' : '❌';
            
            console.log(`${status} Command: "${command}"`);
            console.log(`   Response: ${data.message}`);
            console.log('');
            
        } catch (error) {
            console.log(`❌ Error: ${error.message}\n`);
        }
    }
    
    console.log('✨ Testing complete!');
}

testVoiceCommands();
