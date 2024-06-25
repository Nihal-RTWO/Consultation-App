import promptSync from 'prompt-sync';
import fs from 'fs';

const prompt = promptSync();
const credentialsFilePath = 'doctorsCredentials.json';

function loadCredentials() {
    if (fs.existsSync(credentialsFilePath)) {
        const data = fs.readFileSync(credentialsFilePath);
        return JSON.parse(data);
    }
    return [];
}

function saveCredentials(credentials) {
    fs.writeFileSync(credentialsFilePath, JSON.stringify(credentials, null, 2));
}

let doctorsCredentials = loadCredentials();

function displayRegisteredDoctors() {
    if (doctorsCredentials.length === 0) {
        console.log('No doctors registered yet.');
    } else {
        console.log('Registered doctors:');
        doctorsCredentials.forEach((doctor, index) => {
            console.log(`${index + 1}. Username: ${doctor.username}`);
        });
    }
}

function registerNewDoctor() {
    const newUsername = prompt('Enter new doctor username: ');
    const newPassword = prompt('Enter new doctor password: ');
    const firstName = prompt('Enter doctor first name: ');
    const lastName = prompt('Enter doctor last name: ');
    const email = prompt('Enter doctor email: ');
    const contactNumber = prompt('Enter doctor contact number: ');

    const doctorExists = doctorsCredentials.some(doctor => doctor.username === newUsername);
    if (doctorExists) {
        console.log('Doctor username already exists. Please choose a different username.');
    } else {
        doctorsCredentials.push({ 
            username: newUsername, 
            password: newPassword,
            firstName: firstName,
            lastName: lastName,
            email: email,
            contactNumber: contactNumber 
        });
        saveCredentials(doctorsCredentials);
        console.log('New doctor registered successfully!');
    }
}

function doctorLogin() {
    const username = prompt('Enter username: ');
    const password = prompt('Enter password: ');

    const doctor = doctorsCredentials.find(doc => doc.username === username && doc.password === password);

    if (doctor) {
        console.log(`Doctor Login successful! Welcome to the system.`);
    } else {
        console.log('Doctor Login failed! Invalid username or password.');
    }
}

function main() {
    while (true) {
        const id = prompt('Press 1 for Admin, 2 for Doctor, or 3 to Register a New Doctor (Press Q to quit): ');

        if (id === '1') {
            const username = prompt('Enter admin username: ');
            const password = prompt('Enter admin password: ');

            const correctAdminUsername = "admin";
            const correctAdminPassword = "admin@123";

            if (username === correctAdminUsername && password === correctAdminPassword) {
                console.log('Admin Login successful! Welcome to the system.');

                const option = prompt('Press 1 to view list of doctors : ');
                if (option === '1') {
                    displayRegisteredDoctors();
                } else {
                    console.log('Returning to main menu.');
                }
            } else {
                console.log('Admin Login failed! Invalid username or password.');
            }

        } else if (id === '2') {
            doctorLogin();
        } else if (id === '3') {
            registerNewDoctor();
        } else if (id.toLowerCase() === 'q') {
            console.log('Exiting system. Goodbye!');
            break;
        } else {
            console.log('Invalid selection! Please press 1 for Admin, 2 for Doctor, or 3 to Register a New Doctor.');
        }
    }
}

main();
