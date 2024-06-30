// Import necessary modules
import promptSync from 'prompt-sync';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import retry from 'async-retry';

// Initialize prompt-sync for synchronous command-line input
const prompt = promptSync();

// MongoDB connection URI
const mongoURI = 'mongodb://127.0.0.1:27017/yourDatabase';

// Function to connect to MongoDB with retry mechanism
async function connectWithRetry() {
    await retry(async () => {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000, 
            socketTimeoutMS: 45000 
        });
    }, {
        retries: 5, 
        factor: 2, // Exponential backoff factor
        minTimeout: 1000, // Minimum wait time between retries
        maxTimeout: 10000 // Maximum wait time between retries
    });
}

// Connect to MongoDB
connectWithRetry()
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB after retries:', err));

// Define Doctor Schema
const doctorSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: String,
    lastName: String,
    email: String,
    contactNumber: String
});

// Create Doctor model
const Doctor = mongoose.model('Doctor', doctorSchema);

// Define Patient Schema
const patientSchema = new mongoose.Schema({
    patientId: { type: String, required: true, unique: true },
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    gender: String,
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true }
});

// Create Patient model
const Patient = mongoose.model('Patient', patientSchema);

// Function to display all registered doctors
async function displayRegisteredDoctors() {
    try {
        const doctors = await Doctor.find();
        if (doctors.length === 0) {
            console.log('No doctors registered yet.');
        } else {
            console.log('Registered doctors:');
            doctors.forEach((doctor, index) => {
                console.log(`${index + 1}. Username: ${doctor.username}, Full Name: ${doctor.firstName} ${doctor.lastName}, Email: ${doctor.email}, Contact Number: ${doctor.contactNumber}`);
            });
        }
    } catch (error) {
        console.error('Error retrieving doctors:', error);
    }
}

// Function to register a new doctor
async function registerNewDoctor() {
    const newUsername = prompt('Enter new doctor username: ');
    if (!newUsername) {
        console.log('Username cannot be empty.');
        return;
    }
    const newPassword = prompt('Enter new doctor password: ');
    if (!newPassword) {
        console.log('Password cannot be empty.');
        return;
    }
    const firstName = prompt('Enter doctor first name: ');
    const lastName = prompt('Enter doctor last name: ');
    const email = prompt('Enter doctor email: ');
    const contactNumber = prompt('Enter doctor contact number: ');

    try {
        const doctorExists = await Doctor.findOne({ username: newUsername }).exec();
        if (doctorExists) {
            console.log('Doctor username already exists. Please choose a different username.');
        } else {
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            const newDoctor = new Doctor({
                username: newUsername,
                password: hashedPassword,
                firstName: firstName,
                lastName: lastName,
                email: email,
                contactNumber: contactNumber
            });
            await newDoctor.save();
            console.log('New doctor registered successfully!');
        }
    } catch (error) {
        console.error('Error registering new doctor:', error);
    }
}

// Function for doctor login
async function doctorLogin() {
    const username = prompt('Enter username: ');
    const password = prompt('Enter password: ');

    try {
        const doctor = await Doctor.findOne({ username: username });
        if (doctor) {
            const passwordMatch = await bcrypt.compare(password, doctor.password);
            if (passwordMatch) {
                console.log('Doctor Login successful!');
                await doctorMenu(doctor);
            } else {
                console.log('Doctor Login failed! Invalid username or password.');
            }
        } else {
            console.log('Doctor Login failed! Invalid username or password.');
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
}

// Function to add new patient details
async function addPatientDetails(doctor) {
    const patientId = prompt('Enter patient ID: ');
    const firstName = prompt('Enter patient first name: ');
    const lastName = prompt('Enter patient last name: ');
    const dateOfBirth = prompt('Enter patient date of birth (YYYY-MM-DD): ');
    const gender = prompt('Enter patient gender: ');

    try {
        const newPatient = new Patient({
            patientId: patientId,
            firstName: firstName,
            lastName: lastName,
            dateOfBirth: new Date(dateOfBirth),
            gender: gender,
            doctorId: doctor._id
        });
        await newPatient.save();
        console.log('Patient details added successfully!');
    } catch (error) {
        console.error('Error adding patient details:', error);
    }
}

// Function to view patients' details for a logged-in doctor
async function viewPatientDetails(doctor) {
    try {
        const patients = await Patient.find({ doctorId: doctor._id });
        if (patients.length === 0) {
            console.log('No patients found.');
        } else {
            console.log('Patient details:');
            patients.forEach((patient, index) => {
                console.log(`${index + 1}. ID: ${patient.patientId}, Name: ${patient.firstName} ${patient.lastName}, Date of Birth: ${patient.dateOfBirth.toDateString()}, Gender: ${patient.gender}`);
            });
        }
    } catch (error) {
        console.error('Error retrieving patient details:', error);
    }
}

// Function to provide a menu for the doctor after login
async function doctorMenu(doctor) {
    while (true) {
        console.log('\n1. Add Patient Details');
        console.log('2. View Patient Details');
        console.log('3. Logout');

        const option = prompt('Choose an option: ');

        if (option === '1') {
            await addPatientDetails(doctor);
        } else if (option === '2') {
            await viewPatientDetails(doctor);
        } else if (option === '3') {
            console.log('Logging out...');
            break;
        } else {
            console.log('Invalid option. Please try again.');
        }
    }
}

// Function for admin login
async function adminLogin() {
    const username = prompt('Enter admin username: ');
    const password = prompt('Enter admin password: ');

    const correctAdminUsername = "admin";
    const correctAdminPassword = "admin@123";

    if (username === correctAdminUsername && password === correctAdminPassword) {
        console.log('Admin Login successful! Welcome to the system.');
        // Admin functionality could be expanded here
    } else {
        console.log('Admin Login failed! Invalid username or password.');
    }
}

// Main function to start the command-line application
async function main() {
    while (true) {
        console.log('\nPress 1 for Admin, 2 for Doctor, or 3 to Register a New Doctor (Press Q to quit): ');
        const id = prompt('Your choice: ');

        if (id === '1') {
            await adminLogin();
        } else if (id === '2') {
            await doctorLogin();
        } else if (id === '3') {
            await registerNewDoctor();
        } else if (id.toLowerCase() === 'q') {
            console.log('Exiting system. Goodbye!');
            mongoose.connection.close();
            break;
        } else {
            console.log('Invalid selection! Please press 1 for Admin, 2 for Doctor, or 3 to Register a New Doctor.');
        }
    }
}

// Start the application
main();
