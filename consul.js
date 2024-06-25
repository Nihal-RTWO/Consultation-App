import promptSync from 'prompt-sync';
import fs from 'fs';

const prompt = promptSync();
const credentialsFilePath = 'doctorsCredentials.json';

function loadCredentials() {
    try {
        if (fs.existsSync(credentialsFilePath)) {
            const data = fs.readFileSync(credentialsFilePath, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading credentials file:', error);
    }
    return [];
}

function saveCredentials(credentials) {
    try {
        fs.writeFileSync(credentialsFilePath, JSON.stringify(credentials, null, 2));
    } catch (error) {
        console.error('Error saving credentials file:', error);
    }
}

let doctorsCredentials = loadCredentials();

function displayRegisteredDoctors() {
    if (!Array.isArray(doctorsCredentials) || doctorsCredentials.length === 0) {
        console.log('No doctors registered yet.');
    } else {
        console.log('Registered doctors:');
        doctorsCredentials.forEach((doctor, index) => {
            console.log(`${index + 1}. Username: ${doctor.username}, Full Name: ${doctor.firstName} ${doctor.lastName}, Email: ${doctor.email}, Contact Number: ${doctor.contactNumber}`);
        });
    }
}

function registerNewDoctor() {
    const newUsername = prompt('Enter new doctor username: ');
    if (!newUsername) {
        console.log('Username cannot be empty.');
        return;
    }
    const newPassword = prompt.hide('Enter new doctor password: ');
    if (!newPassword) {
        console.log('Password cannot be empty.');
        return;
    }
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
            contactNumber: contactNumber,
            patients: [] 
        });
        saveCredentials(doctorsCredentials);
        console.log('New doctor registered successfully!');
    }
}

function doctorLogin() {
    const username = prompt('Enter username: ');
    const password = prompt.hide('Enter password: ');

    const doctor = doctorsCredentials.find(doc => doc.username === username && doc.password === password);

    if (doctor) {
        console.log(`Doctor Login successful! Welcome ${doctor.firstName} ${doctor.lastName}.`);
        doctorMenu(doctor);
    } else {
        console.log('Doctor Login failed! Invalid username or password.');
    }
}

function doctorMenu(doctor) {
    const doctorIndex = doctorsCredentials.findIndex(doc => doc.username === doctor.username);
    if (doctorIndex === -1) {
        console.log('Error: Doctor not found in the system.');
        return;
    }

    while (true) {
        console.log('\n1. Add Patient Details');
        console.log('2. View Patient Details');
        console.log('3. Logout');
        
        const option = prompt('Choose an option: ');

        if (option === '1') {
            addPatientDetails(doctor);
            doctorsCredentials[doctorIndex] = doctor; 
            saveCredentials(doctorsCredentials); 
        } else if (option === '2') {
            viewPatientDetails(doctor);
        } else if (option === '3') {
            console.log('Logging out...');
            break;
        } else {
            console.log('Invalid option. Please try again.');
        }
    }
}

function addPatientDetails(doctor) {

    const patientName = prompt('Enter patient name: ');
    const disease = prompt('Enter name of the disease: ');
    const prescription = prompt('Enter the prescription: ');

    const now = new Date();
    const entryDate = now.toISOString().split('T')[0]; 
    const entryTime = now.toTimeString().split(' ')[0];

    const newPatient = {
        name: patientName,
        entryDate: entryDate,
        entryTime: entryTime,
        disease: disease,
        prescription: prescription
    };

    if (!doctor.patients) {
        doctor.patients = [];
    }
    doctor.patients.push(newPatient);

    console.log('Patient details added successfully!');
    console.log('Current list of patients:', doctor.patients);

    saveCredentials(doctor.patients); 
}

function adminLogin() {
    const username = prompt('Enter admin username: ');
    const password = prompt.hide('Enter admin password: ');

    const correctAdminUsername = "admin";
    const correctAdminPassword = "admin@123";

    if (username === correctAdminUsername && password === correctAdminPassword) {
        console.log('Admin Login successful! Welcome to the system.');

        const option = prompt('Press 1 to view list of doctors: ');
        if (option === '1') {
            displayRegisteredDoctors();
        } else {
            console.log('Returning to main menu.');
        }
    } else {
        console.log('Admin Login failed! Invalid username or password.');
    }
}

function main() {
    while (true) {
        console.log('\nPress 1 for Admin, 2 for Doctor, or 3 to Register a New Doctor (Press Q to quit): ');
        const id = prompt('Your choice: ');

        if (id === '1') {
            adminLogin();
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
