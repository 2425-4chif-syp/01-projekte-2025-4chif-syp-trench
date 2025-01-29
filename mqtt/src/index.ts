import mqtt from 'mqtt';

// MQTT connection settings
const host = 'vm90.htl-leonding.ac.at';  // Host address
const username = 'student';              // Username for the connection
const password = 'passme';               // Password for the connection
const topic = 'SmartHome/Sun_Power/Data_json';     // Updated topic name

// Create the MQTT client using the mqtt:// protocol to enforce TCP connection
const client = mqtt.connect(`ws://${host}:9001/ws`, {
    username: username,
    password: password
});

const dataDiv = document.getElementById('mqtt-data');

// On connection to the MQTT broker
client.on('connect', () => {
    console.log('Connected to MQTT broker');
    // Subscribe to the updated topic SmartHome/Sun_Power
    client.subscribe(topic, { qos: 1 }, (err, granted) => {
        if (err) {
            console.error('Subscription error:', err);
        } else {
            console.log(`Subscribed to topic: `, topic);
        }
    });
});

// Handle incoming messages
client.on('message', (topic, message) => {
    if (topic === 'SmartHome/Sun_Power/Data_json') {
        try {
            // The message should contain a JSON string directly
            const messageData = JSON.parse(message.toString());

            // Display the received JSON data in the div
            console.log('Received Data_json:', messageData);

            if(dataDiv !== null) {
                dataDiv.innerHTML = `<pre>${JSON.stringify(messageData, null, 2)}</pre>`;
            }
        } catch (error) {
            console.error('Failed to parse message:', error);
        }
    }
});


// Handle connection errors
client.on('error', (err) => {
    console.error('MQTT connection error:', err);
});

client.on('close', () => {
    console.log('MQTT connection closed');
});