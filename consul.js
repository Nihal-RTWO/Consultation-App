import promptSync from 'prompt-sync';

const prompt = promptSync();

let doctorCredentials = {
    username: 'doctor',
    password: 'password'
};

function registerNewDoctor() {
    const newUsername = prompt('Enter new doctor username: ');
    const newPassword = prompt('Enter new doctor password: ');

    doctorCredentials.username = newUsername;
    doctorCredentials.password = newPassword;

    console.log('New doctor registered successfully!');
}

function main() {
    while (true) {
        const id = prompt('Press 1 for Admin, 2 for Doctor, or 3 to Register a New Doctor (Press Q to quit): ');

        if (id === '1') {
            const username = prompt('Enter username: ');
            const password = prompt('Enter password: ');

            const correctAdminUsername = "admin";
            const correctAdminPassword = "admin@123";

            if (username === correctAdminUsername && password === correctAdminPassword) {
                console.log('Admin Login successful! Welcome to the system.');
            } else {
                console.log('Admin Login failed! Invalid username or password.');
            }

        } else if (id === '2') {
            const username = prompt('Enter username: ');
            const password = prompt('Enter password: ');

            if (username === doctorCredentials.username && password === doctorCredentials.password) {
                console.log('Doctor Login successful! Welcome to the system.');
            } else {
                console.log('Doctor Login failed! Invalid username or password.');
            }

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
