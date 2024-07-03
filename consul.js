import promptSync from 'prompt-sync';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import retry from 'async-retry';

const prompt = promptSync();

const mongoURI = 'mongodb://127.0.0.1:27017/ConsultationAppDB';

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
        factor: 2,
        minTimeout: 1000,
        maxTimeout: 10000
    });
}

connectWithRetry()
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB after retries:', err));

const doctorSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: String,
    lastName: String,
    email: String,
    contactNumber: String
});

const Doctor = mongoose.model('Doctor', doctorSchema);

const patientSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: { type: String, required: true },
    prescription: { type: String, required: true },
    sicknessDetails: { type: String, required: true }, 
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true }
});

const Patient = mongoose.model('Patient', patientSchema);

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
    } catch (error) {
        console.error('Error registering new doctor:', error.message);
    }
}

async function doctorLogin() {
    const username = prompt('Enter username: ');
    const password = prompt('Enter password: ');

    try {
        const doctor = await Doctor.findOne({ username: username });
        if (!doctor) {
            console.log('Doctor Login failed! Invalid username.');
            return;
        }

        const passwordMatch = await bcrypt.compare(password, doctor.password);
        if (passwordMatch) {
            console.log('Doctor Login successful!');
            await doctorMenu(doctor);
        } else {
            console.log('Doctor Login failed! Invalid password.');
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
}

async function addPatientDetails(doctor) {
    const firstName = prompt('Enter patient first name: ');
    const lastName = prompt('Enter patient last name: ');
    const gender = prompt('Enter patient gender: ');
    const sicknessDetails = prompt('Enter patient sickness details: '); 

    const prescription = prompt('Enter patient prescription: ');

    try {
        const newPatient = new Patient({
            firstName: firstName,
            lastName: lastName,
            gender: gender,
            sicknessDetails: sicknessDetails, 

            prescription: prescription,
            doctorId: doctor._id 
        });

        await newPatient.save();
        console.log('Patient details added successfully!');
    } catch (error) {
        if (error.code === 11000) {
            console.error('Duplicate key error:', error.message);
        } else {
            console.error('Error adding patient details:', error.message);
        }
    }
}

async function viewPatientDetails(doctor) {
    try {
        const patients = await Patient.find({ doctorId: doctor._id }).populate('doctorId', 'firstName lastName');
        
        if (patients.length === 0) {
            console.log('No patients found.');
        } else {
            console.log('Patient details:');
            patients.forEach((patient, index) => {
                const doctorName = `${patient.doctorId.firstName} ${patient.doctorId.lastName}`; 
                console.log(`${index + 1}. Name: ${patient.firstName} ${patient.lastName}, Gender: ${patient.gender}, Sickness Details: ${patient.sicknessDetails}, Prescription: ${patient.prescription}, Doctor: ${doctorName}`); 
            });
        }
    } catch (error) {
        console.error('Error retrieving patient details:', error);
    }
}

async function doctorMenu(doctor) {
    while (true) {
        console.log('\n1. Add Patient Details');
        console.log('2. View Patient Details');
        console.log('3. Logout');

        const option = prompt('Choose an option: ');

        switch (option) {
            case '1':
                await addPatientDetails(doctor);
                break;
            case '2':
                await viewPatientDetails(doctor);
                break;
            case '3':
                console.log('Logging out...');
                return;
            default:
                console.log('Invalid option. Please try again.');
        }
    }
}

async function adminLogin() {
    const username = prompt('Enter admin username: ');
    const password = prompt('Enter admin password: ');

    const correctAdminUsername = "admin";
    const correctAdminPassword = "admin@123";

    if (username === correctAdminUsername && password === correctAdminPassword) {
        console.log('Admin Login successful! Welcome to the system.');
        const option = prompt('Press 1 to view list of doctors: ');
        if (option === '1') {
            await displayRegisteredDoctors();
        } else {
            console.log('Invalid option.');
        }
    } else {
        console.log('Admin Login failed! Invalid username or password.');
    }
}

async function main() {
    while (true) {
        console.log('\nPress 1 for Admin, 2 for Doctor, or 3 to Register a New Doctor (Press Q to quit): ');
        const choice = prompt('Your choice: ');

        switch (choice) {
            case '1':
                await adminLogin();
                break;
            case '2':
                await doctorLogin();
                break;
            case '3':
                await registerNewDoctor();
                break;
            case 'q':
            case 'Q':
                console.log('Exiting system. Goodbye!');
                mongoose.connection.close();
                return;
            default:
                console.log('Invalid selection! Please press 1 for Admin, 2 for Doctor, or 3 to Register a New Doctor.');
                break;
        }
    }
}

main();
